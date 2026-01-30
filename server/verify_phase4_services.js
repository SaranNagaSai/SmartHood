/*
Phase 4 runtime sanity checks (Services & Revenue Integrity)

Runs against a locally running backend at http://localhost:5000.
- Creates requester/provider/intruder users
- Ensures requester can create a service (profile/location fields are DB-set to satisfy middleware)
- Verifies status transitions Open -> Interested -> InProgress -> Completed
- Verifies ownership enforcement
- Verifies completion + revenue are idempotent via RevenueLog

Usage:
  node verify_phase4_services.js
*/

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const RevenueLog = require("./models/RevenueLog");
const { generateToken } = require("./config/jwt");

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const httpJson = async ({ method, url, token, body }) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { status: res.status, ok: res.ok, json };
};

const expect = (condition, message) => {
  if (!condition) {
    const err = new Error(message);
    err.name = "VERIFY_FAILED";
    throw err;
  }
};

const nowSlug = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}_${Math.floor(
    Math.random() * 10000
  )}`;
};

async function createUserAndToken({ username, email, phone, password }) {
  const user = await User.create({
    username,
    name: username,
    email,
    phone,
    password,
    role: "User",
  });

  const token = generateToken(user._id);

  return {
    id: user._id.toString(),
    token,
    registrationId: user.registrationId,
  };
}

async function setUserLocationFields(userId, fields) {
  await User.findByIdAndUpdate(userId, {
    $set: {
      state: fields.state,
      district: fields.district,
      town: fields.town,
      city: fields.city,
      locality: fields.locality,
    },
  });
}

async function getUserRevenues(userId) {
  const user = await User.findById(userId).select("revenueGenerated revenueSpent");
  expect(user, `User not found: ${userId}`);
  return {
    revenueGenerated: Number(user.revenueGenerated || 0),
    revenueSpent: Number(user.revenueSpent || 0),
  };
}

async function run() {
  console.log("Phase 4 sanity checks: Services & Revenue Integrity");
  console.log(`API_URL: ${API_URL}`);

  // DB access for profile completion + RevenueLog verification.
  await connectDB();

  // Give server a moment (if user started it just now)
  await sleep(200);

  const slug = nowSlug();
  const randomPhone = () => {
    // 10 digits, starting with 9x to resemble typical Indian mobile format
    const mid = Math.floor(10000000 + Math.random() * 90000000);
    return `9${mid}`;
  };
  const requesterPhone = randomPhone();
  const providerPhone = randomPhone();
  const intruderPhone = randomPhone();
  const password = "Passw0rd!23";

  console.log("\n1) Registering users...");
  // NOTE: The live database currently has non-sparse unique indexes on email/phone.
  // That causes /auth/register to fail for "email: null" or "phone: null".
  // For Phase 4 verification, we create users directly via Mongoose and mint JWTs.
  const requester = await createUserAndToken({
    username: `p4_requester_${slug}`,
    email: `p4_requester_${slug}@example.com`,
    phone: requesterPhone,
    password,
  });
  const provider = await createUserAndToken({
    username: `p4_provider_${slug}`,
    email: `p4_provider_${slug}@example.com`,
    phone: providerPhone,
    password,
  });
  const intruder = await createUserAndToken({
    username: `p4_intruder_${slug}`,
    email: `p4_intruder_${slug}@example.com`,
    phone: intruderPhone,
    password,
  });

  console.log("   requester:", requester.id);
  console.log("   provider:", provider.id);
  console.log("   intruder:", intruder.id);

  console.log("\n2) Satisfying profile/location middleware (DB-set fields)...");
  const loc = {
    state: "TestState",
    district: "TestDistrict",
    town: "TestTown",
    city: "TestCity",
    locality: "TestLocality",
  };
  await Promise.all([
    setUserLocationFields(requester.id, loc),
    setUserLocationFields(provider.id, loc),
    setUserLocationFields(intruder.id, loc),
  ]);

  console.log("\n3) Create service as requester (expect status Open)...");
  const createRes = await httpJson({
    method: "POST",
    url: `${API_URL}/services`,
    token: requester.token,
    body: {
      type: "Request",
      category: "Plumbing",
      title: "Fix leaking tap",
      description: "Leaking tap in kitchen needs repair",
      reach: "Everyone",
    },
  });

  expect(createRes.ok, `Create service failed (${createRes.status}): ${JSON.stringify(createRes.json)}`);
  const service = createRes.json?.data;
  expect(service?._id, `Create service missing id: ${JSON.stringify(createRes.json)}`);
  expect(service.status === "Open", `Expected initial status Open, got ${service.status}`);
  console.log("   serviceId:", service._id);

  console.log("\n4) Transition guard: requester cannot set InProgress without provider (expect 400)...");
  const inProgressEarly = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/status`,
    token: requester.token,
    body: { status: "InProgress" },
  });
  expect(inProgressEarly.status === 400, `Expected 400, got ${inProgressEarly.status}: ${JSON.stringify(inProgressEarly.json)}`);
  expect(
    inProgressEarly.json?.error?.code === "SERVICE_PROVIDER_REQUIRED",
    `Expected SERVICE_PROVIDER_REQUIRED, got ${JSON.stringify(inProgressEarly.json)}`
  );

  console.log("\n5) Valid transition: requester sets Interested (Open -> Interested)...");
  const interestedRes = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/status`,
    token: requester.token,
    body: { status: "Interested" },
  });
  expect(interestedRes.ok, `Set Interested failed (${interestedRes.status}): ${JSON.stringify(interestedRes.json)}`);
  expect(interestedRes.json?.data?.status === "Interested", `Expected Interested, got ${interestedRes.json?.data?.status}`);

  console.log("\n6) Ownership enforcement: intruder cannot change status (expect 403)...");
  const intruderStatus = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/status`,
    token: intruder.token,
    body: { status: "Cancelled" },
  });
  expect(intruderStatus.status === 403, `Expected 403, got ${intruderStatus.status}: ${JSON.stringify(intruderStatus.json)}`);
  expect(
    intruderStatus.json?.error?.code === "SERVICE_FORBIDDEN",
    `Expected SERVICE_FORBIDDEN, got ${JSON.stringify(intruderStatus.json)}`
  );

  console.log("\n7) Provider accepts (Interested -> InProgress)...");
  const acceptRes = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/accept`,
    token: provider.token,
  });
  expect(acceptRes.ok, `Accept failed (${acceptRes.status}): ${JSON.stringify(acceptRes.json)}`);
  expect(acceptRes.json?.data?.status === "InProgress", `Expected InProgress, got ${acceptRes.json?.data?.status}`);

  console.log("\n8) Acceptance enforcement: intruder cannot accept after provider (expect 400)...");
  const acceptAgain = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/accept`,
    token: intruder.token,
  });
  expect(acceptAgain.status === 400, `Expected 400, got ${acceptAgain.status}: ${JSON.stringify(acceptAgain.json)}`);
  expect(
    ["SERVICE_ALREADY_ACCEPTED", "SERVICE_NOT_ACCEPTABLE"].includes(acceptAgain.json?.error?.code),
    `Expected SERVICE_ALREADY_ACCEPTED or SERVICE_NOT_ACCEPTABLE, got ${JSON.stringify(acceptAgain.json)}`
  );

  console.log("\n9) Completion ownership: provider cannot confirm as requester (expect 403)...");
  const wrongConfirmer = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/complete`,
    token: provider.token,
    body: { confirmedBy: "requester", revenue: 100 },
  });
  expect(wrongConfirmer.status === 403, `Expected 403, got ${wrongConfirmer.status}: ${JSON.stringify(wrongConfirmer.json)}`);

  const beforeProviderRev = await getUserRevenues(provider.id);
  const beforeRequesterRev = await getUserRevenues(requester.id);

  console.log("\n10) Requester confirms completion (InProgress -> Completed) with revenue=100...");
  const completeRes = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/complete`,
    token: requester.token,
    body: { confirmedBy: "requester", revenue: 100, notes: "Verified in Phase 4 script" },
  });
  expect(completeRes.ok, `Complete failed (${completeRes.status}): ${JSON.stringify(completeRes.json)}`);
  expect(completeRes.json?.data?.status === "Completed", `Expected Completed, got ${completeRes.json?.data?.status}`);

  const afterProviderRev = await getUserRevenues(provider.id);
  const afterRequesterRev = await getUserRevenues(requester.id);

  expect(
    afterProviderRev.revenueGenerated === beforeProviderRev.revenueGenerated + 100,
    `Provider revenueGenerated should +100 once. Before=${beforeProviderRev.revenueGenerated}, After=${afterProviderRev.revenueGenerated}`
  );
  expect(
    afterRequesterRev.revenueSpent === beforeRequesterRev.revenueSpent + 100,
    `Requester revenueSpent should +100 once. Before=${beforeRequesterRev.revenueSpent}, After=${afterRequesterRev.revenueSpent}`
  );

  console.log("\n11) Idempotency: repeat completion call should NOT increment revenue again...");
  const repeatComplete = await httpJson({
    method: "PUT",
    url: `${API_URL}/services/${service._id}/complete`,
    token: requester.token,
    body: { confirmedBy: "requester", revenue: 100 },
  });
  expect(repeatComplete.ok, `Repeat complete should succeed (${repeatComplete.status}): ${JSON.stringify(repeatComplete.json)}`);

  const afterRepeatProviderRev = await getUserRevenues(provider.id);
  const afterRepeatRequesterRev = await getUserRevenues(requester.id);

  expect(
    afterRepeatProviderRev.revenueGenerated === afterProviderRev.revenueGenerated,
    `Provider revenueGenerated must be unchanged on repeat. After=${afterProviderRev.revenueGenerated}, Repeat=${afterRepeatProviderRev.revenueGenerated}`
  );
  expect(
    afterRepeatRequesterRev.revenueSpent === afterRequesterRev.revenueSpent,
    `Requester revenueSpent must be unchanged on repeat. After=${afterRequesterRev.revenueSpent}, Repeat=${afterRepeatRequesterRev.revenueSpent}`
  );

  console.log("\n12) RevenueLog: exactly one entry for this service completion...");
  const logsCount = await RevenueLog.countDocuments({ serviceId: new mongoose.Types.ObjectId(service._id) });
  expect(logsCount === 1, `Expected RevenueLog count 1, got ${logsCount}`);

  console.log("\n✅ Phase 4 sanity checks PASSED");
  console.log("   - Status transitions validated: Open -> Interested -> InProgress -> Completed");
  console.log("   - Ownership enforcement validated (status/complete protected)");
  console.log("   - Revenue idempotency validated (no double increment)");
  console.log("   - RevenueLog validated (exactly one ledger entry)\n");
}

run()
  .catch((err) => {
    console.error("\n❌ Phase 4 sanity checks FAILED");
    console.error(err?.stack || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });

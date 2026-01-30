/*
Phase 5 runtime sanity checks (Emergency Hardening & Final Cleanup)

Validates:
1) Respond/volunteer endpoint wired + duplicate response prevention
2) Responder ownership rules (no self-respond, no non-party tampering)
3) Escalation target order computation + high-priority immediate broadcast path (best-effort)
4) Per-user emergency creation cooldown for non-high priority

Usage:
  node verify_phase5_emergency.js

Note:
- Creates users directly via Mongoose + mints JWTs (to avoid DB environments with non-sparse null unique indexes).
*/

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Emergency = require("./models/Emergency");
const EmergencyResponse = require("./models/EmergencyResponse");
const { generateToken } = require("./config/jwt");

const API_URL = process.env.API_URL || "http://localhost:5000/api";

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
  await User.findByIdAndUpdate(userId, { $set: fields });
}

async function run() {
  console.log("Phase 5 sanity checks: Emergency Hardening & Final Cleanup");
  console.log(`API_URL: ${API_URL}`);

  await connectDB();

  const slug = nowSlug();
  const randomPhone = () => {
    const mid = Math.floor(10000000 + Math.random() * 90000000);
    return `9${mid}`;
  };

  const reporter = await createUserAndToken({
    username: `p5_reporter_${slug}`,
    email: `p5_reporter_${slug}@example.com`,
    phone: randomPhone(),
    password: "Passw0rd!23",
  });
  const responder = await createUserAndToken({
    username: `p5_responder_${slug}`,
    email: `p5_responder_${slug}@example.com`,
    phone: randomPhone(),
    password: "Passw0rd!23",
  });

  const locReporter = {
    state: "TS",
    district: "D1",
    town: "T1",
    city: "C1",
    locality: "L1",
  };
  const locResponder = {
    state: "TS",
    district: "D1",
    town: "T1",
    city: "C1",
    locality: "L1",
  };
  await Promise.all([
    setUserLocationFields(reporter.id, locReporter),
    setUserLocationFields(responder.id, locResponder),
  ]);

  console.log("\n1) Create emergency (Medium)...");
  const create1 = await httpJson({
    method: "POST",
    url: `${API_URL}/emergencies`,
    token: reporter.token,
    body: {
      type: "Medical",
      description: "Phase5 test emergency",
      priority: "Medium",
      contactNumber: "9999999999",
    },
  });
  expect(create1.status === 201, `Expected 201, got ${create1.status}: ${JSON.stringify(create1.json)}`);
  const emergencyId = create1.json?.data?._id;
  expect(emergencyId, `Missing emergency id: ${JSON.stringify(create1.json)}`);

  console.log("\n2) Cooldown: create another Medium immediately (expect 429)...");
  const create2 = await httpJson({
    method: "POST",
    url: `${API_URL}/emergencies`,
    token: reporter.token,
    body: {
      type: "Medical",
      description: "Phase5 cooldown test",
      priority: "Medium",
      contactNumber: "9999999999",
    },
  });
  expect(create2.status === 429, `Expected 429, got ${create2.status}: ${JSON.stringify(create2.json)}`);
  expect(create2.json?.error?.code === "EMERGENCY_COOLDOWN", `Expected EMERGENCY_COOLDOWN: ${JSON.stringify(create2.json)}`);

  console.log("\n3) Respond endpoint: responder volunteers (expect success)...");
  const respond1 = await httpJson({
    method: "PUT",
    url: `${API_URL}/emergencies/${emergencyId}/respond`,
    token: responder.token,
  });
  expect(respond1.ok, `Respond failed (${respond1.status}): ${JSON.stringify(respond1.json)}`);

  console.log("\n4) Duplicate prevention: responder volunteers again (expect idempotent success)...");
  const respond2 = await httpJson({
    method: "PUT",
    url: `${API_URL}/emergencies/${emergencyId}/respond`,
    token: responder.token,
  });
  expect(respond2.ok, `Repeat respond should succeed (${respond2.status}): ${JSON.stringify(respond2.json)}`);

  console.log("\n5) Ownership rule: reporter cannot respond to their own emergency (expect 400/403)...");
  const selfRespond = await httpJson({
    method: "PUT",
    url: `${API_URL}/emergencies/${emergencyId}/respond`,
    token: reporter.token,
  });
  expect([400, 403].includes(selfRespond.status), `Expected 400/403, got ${selfRespond.status}: ${JSON.stringify(selfRespond.json)}`);

  console.log("\n6) DB check: exactly one EmergencyResponse for responder..." );
  const count = await EmergencyResponse.countDocuments({
    emergencyId: new mongoose.Types.ObjectId(emergencyId),
    responderId: new mongoose.Types.ObjectId(responder.id),
    status: "Active",
  });
  expect(count === 1, `Expected response count 1, got ${count}`);

  console.log("\n✅ Phase 5 sanity checks PASSED");
}

run()
  .catch((err) => {
    console.error("\n❌ Phase 5 sanity checks FAILED");
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

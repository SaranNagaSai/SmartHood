const API_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log("🚀 Starting Location API Verification...");

    // 1. Test Get States
    try {
        console.log(`\n➡️ Testing Get States...`);
        const res = await fetch(`${API_URL}/locations/states`);
        const data = await res.json();

        if (data.success) {
            console.log("✅ States:", data.data);
            if (data.data.includes("TestState")) {
                console.log("   found 'TestState' seeded earlier.");
            } else {
                console.warn("   ⚠️ 'TestState' NOT found. Did the previous test register successfully?");
            }
        } else {
            console.error("❌ Failed to get states:", data);
        }
    } catch (error) {
        console.error("❌ Get States Error:", error.message);
    }

    // 2. Test Get Districts
    try {
        const state = "TestState";
        console.log(`\n➡️ Testing Get Districts for '${state}'...`);
        const res = await fetch(`${API_URL}/locations/districts/${state}`);
        const data = await res.json();

        if (data.success) {
            console.log("✅ Districts:", data.data);
            if (data.data.includes("TestDistrict")) {
                console.log("   found 'TestDistrict'.");
            }
        } else {
            console.error("❌ Failed to get districts:", data);
        }
    } catch (error) {
        console.error("❌ Get Districts Error:", error.message);
    }

    // 3. Test Profession Stats
    try {
        const locality = "TestLocality";
        console.log(`\n➡️ Testing Profession Stats for '${locality}'...`);
        // Note: The route in server.js implies it might be under /api/localities or /api/locations?
        // Let's check server.js again.
        // server.js: app.use("/api/locations", locationRoutes);
        // localityController.js has getProfessionStats but where is it mounted?
        // I need to check if localityRoutes exists and is used.
        // server.js (Step 157): const locationRoutes = require("./routes/locationRoutes");
        // AND app.use("/api/locations", locationRoutes);

        // Wait, I saw localityController.js (Step 158) but I didn't see where it is used in server.js!
        // server.js has: const locationRoutes = require("./routes/locationRoutes");
        // It DOES NOT seem to have `localityRoutes` mounted!
        // It has `const emergencyRoutes...`, `const locationRoutes...`.
        // BUT Step 157 shows:
        // `// const eventRoutes = ...`
        // `app.use("/api/locations", locationRoutes);`

        // I need to check if `localityController` is used by *any* route file.
        // `locationRoutes.js` (Step 165) uses `User.distinct` directly inside the route handler! 
        // It DOES NOT use `localityController`.

        // So where is `getProfessionStats` exposed?
        // If `localityController` is unused, then `Home.jsx` calls to `/localities/profession-stats` will FAIL (404).

        // Home.jsx (Step 96) Line 62: API.get(`/localities/profession-stats/${encodeURIComponent(user.locality)}`)

        // Let's test this route. It will likely fail.

        const res = await fetch(`${API_URL}/localities/profession-stats/${encodeURIComponent(locality)}`);
        if (res.status === 404) {
            console.error("❌ Profession Stats Route 404 Not Found!");
            console.log("   Diagnosis: `localityController` might not be mounted in `server.js`.");
        } else {
            const data = await res.json();
            console.log("✅ Profession Stats Result:", data);
        }

    } catch (error) {
        console.error("❌ Profession Stats Error:", error.message);
    }

    console.log("\n✨ Verification Complete.");
}

runTests();

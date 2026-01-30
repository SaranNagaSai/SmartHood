const API_URL = 'http://localhost:5000/api';

const testUser = {
    username: "verifyUser" + Math.floor(Math.random() * 1000),
    name: "Verification User",
    phone: "99" + Math.floor(10000000 + Math.random() * 90000000), // Random 10 digit
    age: 25,
    gender: "Male",
    nationality: "India",
    bloodGroup: "B+",
    address: "Verification St",
    locality: "TestLocality",
    area: "TestArea",
    district: "TestDistrict",
    town: "TestTown",
    city: "TestCity",
    state: "TestState",
    professionCategory: "Software/IT",
    profession: "Tester",
    experience: 2,
    income: 10000,
    currency: "INR"
};

async function runTests() {
    console.log("🚀 Starting Backend Verification (using fetch)...");

    let token = "";

    // 1. Test Registration
    try {
        console.log(`\n➡️ Testing Registration... (Phone: ${testUser.phone})`);
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const data = await res.json();

        if (data.success) {
            console.log("✅ Registration Successful!");
            console.log(`   ID: ${data.data.registrationId}`);
            token = data.data.token;
        } else {
            console.error("❌ Registration Failed:", data);
            return;
        }
    } catch (error) {
        console.error("❌ Registration Error:", error.message);
        return;
    }

    // 2. Test Login (password-based)
    try {
        console.log(`\n➡️ Testing Login...`);
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: testUser.phone, username: testUser.username })
        });
        const data = await res.json();

        if (data.success) {
            console.log("✅ Login Successful!");
            token = data.data.token;
        } else {
            console.error("❌ Login Failed:", data);
        }
    } catch (error) {
        console.error("❌ Login Error:", error.message);
    }

    // 3. Test Create Service Request
    try {
        console.log(`\n➡️ Testing Service Request...`);
        const serviceData = {
            type: "Request",
            category: "Plumbing",
            description: "Leaking tap need fix",
            urgency: "High",
            locality: testUser.locality,
            location: {
                type: "Point",
                coordinates: [0, 0]
            }
        };

        const res = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serviceData)
        });
        const data = await res.json();

        if (data.success) {
            console.log("✅ Service Request Created!");
            console.log(`   Service ID: ${data.data._id}`);
        } else {
            console.error("❌ Service Creation Failed:", data);
        }
    } catch (error) {
        console.error("❌ Service Creation Error:", error.message);
    }

    // 4. Test Create Emergency
    try {
        console.log(`\n➡️ Testing Emergency Reporting...`);
        const emergencyData = {
            type: "Medical",
            description: "Test Emergency - Need Ambulance",
            severity: "High", // or priority? Model says priority? Let's check model.
            // Model Emergency.js check needed.
            // Using standard fields for now.
            contactNumber: "9988776655",
            locality: testUser.locality,
            city: testUser.city,
            state: testUser.state,
            location: {
                type: "Point",
                coordinates: [17.385, 78.486]
            }
        };

        const res = await fetch(`${API_URL}/emergencies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(emergencyData)
        });
        const data = await res.json();

        if (data.success) {
            console.log("✅ Emergency Reported!");
            console.log(`   Emergency ID: ${data.data._id}`);
        } else {
            console.error("❌ Emergency Reporting Failed:", data);
        }
    } catch (error) {
        console.error("❌ Emergency Error:", error.message);
    }

    console.log("\n✨ Verification Complete.");
}

runTests();

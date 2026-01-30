const API_URL = 'http://localhost:5000/api';

const testStudent = {
    username: "student" + Math.floor(Math.random() * 1000),
    name: "Test Student",
    phone: "99" + Math.floor(10000000 + Math.random() * 90000000),
    age: 20,
    gender: "Female",
    nationality: "India",
    bloodGroup: "O+",
    address: "Student Hostel",
    locality: "UniCampus",
    area: "EduZone",
    district: "Hyderabad",
    town: "Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    professionCategory: "Student",
    profession: "Engineering",
    experience: 0,
    income: 0,
    isStudent: true,
    studentDetails: {
        educationLevel: "UG",
        classYear: "3rd Year"
    }
};

async function runTests() {
    console.log("🚀 Starting Student API Verification...");

    let token = "";

    // 1. Register Student
    try {
        console.log(`\n➡️ Registering Student...`);
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testStudent)
        });
        const data = await res.json();
        if (data.success) {
            token = data.data.token;
            console.log("✅ Student Registered!");
        } else {
            console.error("❌ Registration Failed:", data);
            return;
        }
    } catch (e) { return console.error(e); }

    // 2. Test Leaderboard
    try {
        console.log(`\n➡️ Fetching Leaderboard...`);
        const res = await fetch(`${API_URL}/students/leaderboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("✅ Leaderboard Data:", Array.isArray(data) ? `Count: ${data.length}` : data);
    } catch (e) { console.error(e); }

    // 3. Create Opportunity
    try {
        console.log(`\n➡️ Creating Opportunity...`);
        const opp = {
            title: "React Internship",
            organization: "Tech Corp",
            type: "Internship",
            description: "Build cool apps",
            skillsRequired: ["React", "Node"]
        };
        const res = await fetch(`${API_URL}/students/opportunities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(opp)
        });
        const data = await res.json();
        console.log("✅ Opportunity Created:", data._id ? "Success" : "Failed");
    } catch (e) { console.error(e); }

    // 4. Fetch Opportunities
    try {
        console.log(`\n➡️ Fetching Opportunities...`);
        const res = await fetch(`${API_URL}/students/opportunities`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("✅ Opportunities List:", Array.isArray(data) ? `Count: ${data.length}` : data);
    } catch (e) { console.error(e); }

    console.log("\n✨ Student Verification Complete.");
}

runTests();

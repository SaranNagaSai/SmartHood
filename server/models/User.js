const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // New Strict Field
    name: { type: String, required: true },
    email: { type: String, required: false, sparse: true },   // Optional for notifications only
    phone: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    nationality: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    address: { type: String, required: true },
    locality: { type: String, required: true, index: true },
    area: { type: String, required: true },
    district: { type: String, required: true },              // New Strict Field
    town: { type: String, required: true },                  // New Field
    city: { type: String, required: true },
    state: { type: String, required: true },
    professionCategory: { type: String, required: true },
    profession: { type: String, required: true, index: true },
    experience: { type: Number, required: true },            // Now required
    income: { type: Number, required: true },                // Monthly income
    currency: { type: String, default: 'INR' },
    preferredLanguage: { type: String, default: 'en', enum: ['en', 'te'] },
    role: { type: String, default: 'User', enum: ['User', 'Admin'] },
    isStudent: { type: Boolean, default: false },
    studentDetails: {
        educationLevel: { type: String, required: false },
        classYear: { type: String, required: false }
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    revenueGenerated: { type: Number, default: 0 },
    revenueSpent: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 },
    fcmToken: { type: String, default: "" }, // For Push Notifications
    registrationId: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Generate unique registration ID (3 uppercase letters + 2 digits)
userSchema.pre("save", async function () {
    if (this.isNew && !this.registrationId) {
        const letters = Array.from({ length: 3 }, () =>
            String.fromCharCode(65 + Math.floor(Math.random() * 26))
        ).join(''); // 3 alphabets
        const digits = Math.floor(10 + Math.random() * 90).toString(); // 2 digits
        this.registrationId = letters + digits;
    }
});



module.exports = mongoose.model("User", userSchema);

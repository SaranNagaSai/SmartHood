const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { normalizeEmail, normalizePhone } = require("../utils/adminAllowlist");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // New Password Field
    name: { type: String, required: false, trim: true },
    email: { type: String, required: false, unique: true, sparse: true, trim: true, lowercase: true },
    phone: { type: String, required: false, unique: true, sparse: true, trim: true },

    // Immutable auth identifiers (set on registration/first login).
    // Used for admin allowlist checks so users cannot gain admin by editing profile email/phone.
    authEmail: { type: String, required: false, trim: true, lowercase: true },
    authPhone: { type: String, required: false, trim: true },

    // Optional Profile Fields (Updated after login)
    age: { type: Number, required: false },
    gender: { type: String, required: false, enum: ['Male', 'Female', 'Other'] },
    nationality: { type: String, required: false },
    bloodGroup: { type: String, required: false },
    bloodGroupUpdatedAt: { type: Date, required: false },
    address: { type: String, required: false },
    pincode: { type: String, required: false, trim: true },
    locality: { type: String, required: false, index: true },
    area: { type: String, required: false },
    district: { type: String, required: false },
    town: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    professionCategory: { type: String, required: false },
    profession: { type: String, required: false, index: true },
    experience: { type: Number, required: false },
    income: { type: Number, required: false },
    currency: { type: String, default: 'INR' },
    preferredLanguage: { type: String, default: 'en', enum: ['en', 'te'] },

    notificationPrefs: {
        webPushEnabled: { type: Boolean, default: true },
        emailEnabled: { type: Boolean, default: true },
        smsEnabled: { type: Boolean, default: false },
        themePreference: { type: String, required: false },
    },

    role: { type: String, default: 'User', enum: ['User', 'Admin'], trim: true },
    isStudent: { type: Boolean, default: false },
    studentDetails: {
        educationLevel: { type: String, required: false },
        classYear: { type: String, required: false },
        institutionName: { type: String, required: false },
        stream: { type: String, required: false },
        branch: { type: String, required: false },
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    revenueGenerated: { type: Number, default: 0 },
    revenueSpent: { type: Number, default: 0 },
    impactScore: { type: Number, default: 0 },
    registrationId: { type: String, unique: true },
    tokenVersion: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
    // Push Notification Subscription
    pushSubscription: {
        endpoint: { type: String },
        keys: {
            p256dh: { type: String },
            auth: { type: String },
        },
    },

    // Firebase Cloud Messaging tokens (web)
    fcmTokens: [
        {
            token: { type: String, trim: true },
            lastSeenAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (this.isModified('email')) {
        const normalizedEmail = normalizeEmail(this.email);
        if (normalizedEmail) {
            this.email = normalizedEmail;
        } else {
            this.email = undefined;
        }
    }
    if (this.isModified('phone')) {
        const normalizedPhone = normalizePhone(this.phone);
        if (normalizedPhone) {
            this.phone = normalizedPhone;
        } else {
            this.phone = undefined;
        }
    }
    if (this.isModified('role') && this.role) {
        const normalized = String(this.role).trim().toLowerCase();
        this.role = normalized === 'admin' ? 'Admin' : 'User';
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate unique registration ID (3 uppercase letters + 2 digits)
userSchema.pre("save", async function () {
    if (this.isNew && !this.registrationId) {
        // Generate a stable public identifier (used for service completion verification).
        // Format: SHD + 5 digits (e.g., SHD48291)
        const digits = Math.floor(10000 + Math.random() * 90000).toString();
        this.registrationId = `SHD${digits}`;
    }
});



module.exports = mongoose.model("User", userSchema);

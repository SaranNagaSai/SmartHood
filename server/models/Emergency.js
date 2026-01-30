const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Blood Donation', 'Medical', 'Accident', 'Fire & Safety', 'Missing Person', 'Natural Disaster', 'Custom']
    },
    description: { type: String, required: true },
    priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    locality: { type: String, required: true, index: true },
    town: { type: String },
    city: { type: String, required: true, index: true },
    district: { type: String, index: true },
    state: { type: String, required: true, index: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contactNumber: { type: String, required: true },
    status: { type: String, default: 'Open', enum: ['Open', 'Resolved', 'Closed'] },
    responderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    responderCount: { type: Number, default: 0 },
    notifiedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    escalationLevel: {
        type: String,
        enum: ["locality", "town_or_city", "district", "state", "done"],
        default: "locality",
    },
    lastEscalatedAt: { type: Date },
    media: [String], // URLs to Cloudinary images/videos
    voiceNote: String, // URL to voice recording
    bloodGroupRequired: String,
    resolvedAt: Date
}, { timestamps: true });

emergencySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Emergency", emergencySchema);

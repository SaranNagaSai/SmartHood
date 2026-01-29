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
    city: { type: String, required: true },
    state: { type: String, required: true, index: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contactNumber: { type: String, required: true },
    status: { type: String, default: 'Open', enum: ['Open', 'Resolved', 'Closed'] },
    media: [String], // URLs to Cloudinary images/videos
    voiceNote: String, // URL to voice recording
    bloodGroupRequired: String,
    resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Emergency", emergencySchema);

const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
    locality: { type: String, required: true, index: true },
    userCount: { type: Number, default: 0 },
    emergencyCount: { type: Number, default: 0 },
    servicesCompleted: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Analytics", analyticsSchema);

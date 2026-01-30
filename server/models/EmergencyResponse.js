const mongoose = require("mongoose");

const emergencyResponseSchema = new mongoose.Schema(
    {
        emergencyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Emergency",
            required: true,
            index: true,
        },
        responderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["Active", "Cancelled"],
            default: "Active",
        },
        meta: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

// Prevent duplicate responses per user per emergency.
emergencyResponseSchema.index({ emergencyId: 1, responderId: 1 }, { unique: true });

module.exports = mongoose.model("EmergencyResponse", emergencyResponseSchema);

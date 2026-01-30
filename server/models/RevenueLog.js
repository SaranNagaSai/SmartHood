const mongoose = require("mongoose");

const revenueLogSchema = new mongoose.Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            required: true,
            index: true,
        },
        event: {
            type: String,
            required: true,
            enum: ["SERVICE_COMPLETED"],
            default: "SERVICE_COMPLETED",
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        meta: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

// Ensure revenue increments are idempotent per service completion.
revenueLogSchema.index({ serviceId: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("RevenueLog", revenueLogSchema);

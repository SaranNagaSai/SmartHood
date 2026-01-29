const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Professional", "Education", "Healthcare", "Emergency", "Community", "Other"]
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    voiceUrl: {
        type: String, // Cloudinary URL for voice recording
        default: null
    },
    locality: { type: String, required: true },
    town: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },

    status: {
        type: String,
        enum: ["open", "interested", "in-progress", "completed", "cancelled"],
        default: "open"
    },

    interestedUsers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now }
    }],

    assignedProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    completedByUniqueId: {
        type: String, // For requester to confirm by entering Unique ID
        default: null
    },

    amountPaid: {
        type: Number,
        default: 0
    },

    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: null
    },

    reviewText: {
        type: String,
        default: null
    },

    completionConfirmedAt: {
        type: Date,
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Indexes for faster queries
serviceSchema.index({ requester: 1, status: 1 });
serviceSchema.index({ locality: 1, status: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ district: 1, status: 1 });

module.exports = mongoose.model("Service", serviceSchema);

const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['Request', 'Offer'] },
    category: { type: String, required: true },
    description: { type: String, required: true },
    locality: { type: String, required: true, index: true },
    city: { type: String, required: true },
    state: { type: String, required: true, index: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reach: { type: String, default: 'Locality', enum: ['Locality', 'Targeted', 'Everyone'] },
    media: [String],
    voiceNote: String,
    status: { type: String, default: 'Open', enum: ['Open', 'Interested', 'In-Progress', 'Completed', 'Cancelled'] },

    // Interest tracking - users who clicked "I'm Interested"
    interestedUsers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now }
    }],

    // Provider assignment (once requester picks someone)
    assignedProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    // Completion tracking
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    completedByUniqueId: { type: String, default: null }, // For matching via Unique ID
    amountPaid: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: null },
    reviewText: { type: String, default: null },
    completionConfirmedAt: { type: Date, default: null },

    revenue: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);

const mongoose = require("mongoose");

const STATUS = ["Open", "Interested", "InProgress", "Completed", "Cancelled"];

const normalizeStatus = (value) => {
    if (!value) return value;
    const raw = String(value).trim();

    // Backward-compat mappings
    const map = {
        open: "Open",
        interested: "Interested",
        "in-progress": "InProgress",
        inprogress: "InProgress",
        completed: "Completed",
        cancelled: "Cancelled",
        canceled: "Cancelled",
        "In-Progress": "InProgress",
    };

    return map[raw] || map[raw.toLowerCase()] || raw;
};

const serviceRequestSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['Request', 'Offer'] },
    category: { type: String, required: true },
    title: { type: String, required: false, trim: true, default: null },
    description: { type: String, required: true },
    locality: { type: String, required: true, index: true },
    city: { type: String, required: true },
    state: { type: String, required: true, index: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reach: { type: String, default: 'Locality', enum: ['Locality', 'Targeted', 'Everyone'] },
    media: [String],
    voiceNote: String,
    status: { type: String, default: 'Open', enum: STATUS },

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

    // Authoritative provider field used by controllers/frontend
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
    },

    acceptedAt: { type: Date, default: null },

    // Completion tracking
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    completedByUniqueId: { type: String, default: null }, // For matching via Unique ID
    amountPaid: { type: Number, default: 0 },
    completionNotes: { type: String, default: null },
    completedAt: { type: Date, default: null },
    requesterConfirmed: { type: Boolean, default: false },
    providerConfirmed: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: null },
    reviewText: { type: String, default: null },
    completionConfirmedAt: { type: Date, default: null },

    // Legacy fields kept for backward-compat; controller normalizes to amountPaid
    revenue: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

serviceRequestSchema.pre("validate", function () {
    this.status = normalizeStatus(this.status);

    // Keep provider fields in sync for backward-compat
    if (this.providerId && !this.assignedProvider) {
        this.assignedProvider = this.providerId;
    }
    if (this.assignedProvider && !this.providerId) {
        this.providerId = this.assignedProvider;
    }

    // Fill title if missing
    if (!this.title) {
        this.title = this.category || null;
    }

    // Keep legacy revenue aligned
    if (typeof this.amountPaid === "number" && this.amountPaid > 0) {
        this.revenue = this.amountPaid;
    }
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);

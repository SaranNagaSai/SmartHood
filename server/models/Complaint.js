const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    voiceNote: String,
    status: { type: String, default: 'Pending', enum: ['Pending', 'Under Review', 'Resolved'] },
    adminNotes: String
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);

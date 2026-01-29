const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true, enum: ['Service', 'Emergency', 'System', 'Rating', 'Official', 'Community', 'Specific'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    urgency: { type: String, default: 'Low', enum: ['High', 'Medium', 'Low'] },
    isRead: { type: Boolean, default: false },
    data: Object // Metadata like serviceId or emergencyId
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);

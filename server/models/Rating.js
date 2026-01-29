const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rater: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: String
}, { timestamps: true });

module.exports = mongoose.model("Rating", ratingSchema);

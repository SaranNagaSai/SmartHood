const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    state: { type: String, required: true, index: true },
    image: String,
    rating: { type: Number, default: 0 },
    zones: [String]
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);

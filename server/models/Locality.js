const mongoose = require("mongoose");

const localitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, index: true },
    zone: { type: String, required: true },
    coordinates: {
        lat: Number,
        lng: Number
    }
}, { timestamps: true });

localitySchema.index({ name: 1, city: 1 }, { unique: true });

module.exports = mongoose.model("Locality", localitySchema);

const mongoose = require("mongoose");

const tourismSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ['Entertainment', 'Education', 'Shopping', 'Park', 'Religious', 'Other'] },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    locality: { type: String, index: true },
    image: { type: String },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
    },
    openingHours: { type: String },
    contactNumber: { type: String }
}, { timestamps: true });

tourismSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Tourism", tourismSchema);

const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },

    // Location hierarchy
    state: { type: String, required: true },
    district: { type: String, required: true },
    town: { type: String, required: true },
    locality: { type: String, required: true },
    address: { type: String },

    // Coordinates for map integration
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },

    // Category
    category: {
        type: String,
        enum: [
            "Temple",
            "Park",
            "Restaurant",
            "Historical Site",
            "Shopping",
            "Entertainment",
            "Nature/Scenic",
            "Museum",
            "Beach",
            "Other"
        ],
        required: true
    },

    // Images
    images: [{
        url: { type: String, required: true },
        publicId: { type: String }, // For Cloudinary
        caption: { type: String },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Ratings and Reviews
    ratings: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },

    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        images: [{ type: String }], // Review images
        createdAt: { type: Date, default: Date.now }
    }],

    // Additional Info
    openingHours: { type: String },
    entryFee: { type: String },
    bestTimeToVisit: { type: String },
    facilities: [{ type: String }], // Parking, Restrooms, Wheelchair access, etc.

    // Metadata
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    viewCount: { type: Number, default: 0 },

    // Moderation
    isActive: { type: Boolean, default: true },
    reportCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for location-based queries
placeSchema.index({ state: 1, district: 1, town: 1, locality: 1 });
placeSchema.index({ category: 1 });
placeSchema.index({ "ratings.average": -1 });

// Method to add review and update rating
placeSchema.methods.addReview = async function (userId, rating, comment, images = []) {
    this.reviews.push({
        user: userId,
        rating,
        comment,
        images
    });

    // Recalculate average rating
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = totalRating / this.reviews.length;
    this.ratings.count = this.reviews.length;

    return await this.save();
};

module.exports = mongoose.model("Place", placeSchema);

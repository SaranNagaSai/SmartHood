// Rating Routes
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    submitRating,
    getProviderRatings,
    getPendingRatings,
    getMyRatings
} = require("../controllers/ratingController");

// Submit a rating
router.post("/", protect, submitRating);

// Get ratings for a provider
router.get("/provider/:id", getProviderRatings);

// Get pending ratings (services to rate)
router.get("/pending", protect, getPendingRatings);

// Get my given ratings
router.get("/my-ratings", protect, getMyRatings);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getPlaces,
    getPlaceById,
    createPlace,
    addReview,
    getNearbyPlaces,
    getFeaturedPlaces,
    uploadPlaceImage
} = require("../controllers/tourismController");

// @route   GET /api/tourism/places
router.get("/places", getPlaces);

// @route   GET /api/tourism/featured
router.get("/featured", getFeaturedPlaces);

// @route   GET /api/tourism/places/:id
router.get("/places/:id", getPlaceById);

// @route   GET /api/tourism/places/:id/nearby
router.get("/places/:id/nearby", getNearbyPlaces);

// @route   POST /api/tourism/places
router.post("/places", protect, createPlace);

// @route   POST /api/tourism/places/:id/review
router.post("/places/:id/review", protect, addReview);

// @route   POST /api/tourism/places/:id/image
router.post("/places/:id/image", protect, uploadPlaceImage);

module.exports = router;

// Rating Controller - Handles rating submission and retrieval
const Rating = require("../models/Rating");
const User = require("../models/User");
const ServiceRequest = require("../models/ServiceRequest");

// @desc    Submit a rating for a completed service
// @route   POST /api/ratings
// @access  Private
const submitRating = async (req, res) => {
    try {
        const { serviceId, providerId, score, comment } = req.body;

        // Validate score
        if (score < 1 || score > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Check if rating already exists for this service by this user
        const existingRating = await Rating.findOne({
            serviceId,
            rater: req.user._id
        });

        if (existingRating) {
            return res.status(400).json({ message: "You have already rated this service" });
        }

        // Create rating
        const rating = await Rating.create({
            serviceId,
            provider: providerId,
            rater: req.user._id,
            score,
            comment
        });

        // Update provider's average rating and impact score
        const allRatings = await Rating.find({ provider: providerId });
        const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

        await User.findByIdAndUpdate(providerId, {
            averageRating: Math.round(avgRating * 10) / 10,
            $inc: { impactScore: score * 10 } // Add impact points based on rating
        });

        // Mark service as rated
        await ServiceRequest.findByIdAndUpdate(serviceId, {
            isRated: true
        });

        res.status(201).json({
            success: true,
            data: rating,
            message: "Rating submitted successfully"
        });
    } catch (error) {
        console.error("Error submitting rating:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get ratings for a provider
// @route   GET /api/ratings/provider/:id
// @access  Public
const getProviderRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ provider: req.params.id })
            .populate("rater", "name")
            .populate("serviceId", "category description")
            .sort({ createdAt: -1 });

        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        res.json({
            success: true,
            data: {
                ratings,
                count: ratings.length,
                averageRating: Math.round(avgRating * 10) / 10
            }
        });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get pending ratings for current user (services completed but not rated)
// @route   GET /api/ratings/pending
// @access  Private
const getPendingRatings = async (req, res) => {
    try {
        // Find services where user was the requester and are completed but not rated
        const pendingServices = await ServiceRequest.find({
            requesterId: req.user._id,
            status: "Completed",
            isRated: { $ne: true }
        }).populate("providerId", "name phone profession");

        res.json({
            success: true,
            data: pendingServices
        });
    } catch (error) {
        console.error("Error fetching pending ratings:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get my ratings (ratings I've given)
// @route   GET /api/ratings/my-ratings
// @access  Private
const getMyRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ rater: req.user._id })
            .populate("provider", "name")
            .populate("serviceId", "category")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: ratings
        });
    } catch (error) {
        console.error("Error fetching my ratings:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    submitRating,
    getProviderRatings,
    getPendingRatings,
    getMyRatings
};

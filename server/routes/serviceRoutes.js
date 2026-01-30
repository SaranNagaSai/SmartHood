const express = require("express");
const router = express.Router();
const {
    createService,
    getServices,
    updateServiceStatus,
    acceptService,
    confirmCompletion,
    getServiceById,
    showInterest,
    markComplete
} = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");
const { serviceCreateLimiter } = require("../middleware/rateLimiters");
const { requireProfileCompleteForLocation } = require("../middleware/profileMiddleware");

// Base routes
router.route("/")
    .post(protect, serviceCreateLimiter, requireProfileCompleteForLocation, createService)
    .get(protect, getServices);

// Single service routes
router.route("/:id")
    .get(protect, getServiceById);

// Status update
router.put("/:id/status", protect, updateServiceStatus);

// Accept service (become provider)
router.put("/:id/accept", protect, acceptService);

// Confirm completion
router.put("/:id/complete", protect, confirmCompletion);

// New: Show interest (reveals phone number)
router.put("/:id/interest", protect, showInterest);

// New: Mark complete with Unique ID verification
router.put("/:id/mark-complete", protect, markComplete);

module.exports = router;

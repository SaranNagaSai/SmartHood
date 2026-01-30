const express = require("express");
const router = express.Router();
const { createEmergency, getEmergencies, respondToEmergency } = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");
const { conditionalEmergencyCreateLimiter } = require("../middleware/rateLimiters");
const { requireProfileCompleteForLocation } = require("../middleware/profileMiddleware");

router.route("/")
    .post(protect, conditionalEmergencyCreateLimiter, requireProfileCompleteForLocation, createEmergency)
    .get(protect, getEmergencies);

router.route("/:id/respond")
    .put(protect, respondToEmergency);

module.exports = router;

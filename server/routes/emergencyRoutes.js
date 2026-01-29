const express = require("express");
const router = express.Router();
const { createEmergency, getEmergencies } = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, createEmergency)
    .get(protect, getEmergencies);

module.exports = router;

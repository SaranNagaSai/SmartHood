const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// @desc    Get all unique states
// @route   GET /api/locations/states
// @access  Public
router.get("/states", async (req, res) => {
    try {
        const states = await User.distinct("state");
        res.json({ success: true, data: states.filter(Boolean).sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get districts by state
// @route   GET /api/locations/districts/:state
// @access  Public
router.get("/districts/:state", async (req, res) => {
    try {
        const { state } = req.params;
        const districts = await User.distinct("district", { state });
        res.json({ success: true, data: districts.filter(Boolean).sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get towns by district
// @route   GET /api/locations/towns/:state/:district
// @access  Public
router.get("/towns/:state/:district", async (req, res) => {
    try {
        const { state, district } = req.params;
        const towns = await User.distinct("town", { state, district });
        res.json({ success: true, data: towns.filter(Boolean).sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get localities by town
// @route   GET /api/locations/localities/:state/:district/:town
// @access  Public
router.get("/localities/:state/:district/:town", async (req, res) => {
    try {
        const { state, district, town } = req.params;
        const localities = await User.distinct("locality", { state, district, town });
        res.json({ success: true, data: localities.filter(Boolean).sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get location stats (user count by location)
// @route   GET /api/locations/stats
// @access  Public
router.get("/stats", async (req, res) => {
    try {
        const { state, district, town, locality } = req.query;

        const query = {};
        if (state) query.state = state;
        if (district) query.district = district;
        if (town) query.town = town;
        if (locality) query.locality = locality;

        const userCount = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                location: query,
                userCount,
                totalUsers: await User.countDocuments()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

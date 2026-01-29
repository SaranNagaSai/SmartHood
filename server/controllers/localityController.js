const City = require("../models/City");
const Locality = require("../models/Locality");
const User = require("../models/User");
const logger = require("../utils/logger");

// @desc    Get all cities
// @route   GET /api/localities/cities
// @access  Public
const getCities = async (req, res) => {
    try {
        const cities = await City.find({}).sort({ name: 1 });
        res.json({
            success: true,
            count: cities.length,
            data: cities
        });
    } catch (error) {
        logger.error(`Error in getCities: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch cities" });
    }
};

// @desc    Get localities within a city
// @route   GET /api/localities/:cityId
// @access  Public
const getLocalities = async (req, res) => {
    try {
        const localities = await Locality.find({ cityId: req.params.cityId }).sort({ name: 1 });
        res.json({
            success: true,
            count: localities.length,
            data: localities
        });
    } catch (error) {
        logger.error(`Error in getLocalities: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch localities" });
    }
};

// @desc    Explore localities and zones
// @route   GET /api/localities/explore
// @access  Private
const exploreLocalities = async (req, res) => {
    try {
        const localities = await Locality.find({}).sort({ name: 1 });
        res.json({
            success: true,
            count: localities.length,
            data: localities
        });
    } catch (error) {
        logger.error(`Error in exploreLocalities: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get profession stats for a locality
// @route   GET /api/localities/profession-stats/:locality
// @access  Private
const getProfessionStats = async (req, res) => {
    try {
        const { locality } = req.params;

        const stats = await User.aggregate([
            { $match: { locality: locality } },
            {
                $group: {
                    _id: "$professionCategory",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            locality,
            data: stats.map(s => ({ profession: s._id, count: s.count }))
        });
    } catch (error) {
        logger.error(`Error in getProfessionStats: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch profession stats" });
    }
};

// @desc    Get user count by state
// @route   GET /api/localities/state-stats
// @access  Private
const getStateStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: "$state",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: stats.map(s => ({ state: s._id, count: s.count }))
        });
    } catch (error) {
        logger.error(`Error in getStateStats: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch state stats" });
    }
};

// @desc    Get people by profession in a locality
// @route   GET /api/localities/people/:locality/:profession
// @access  Private
const getPeopleByProfession = async (req, res) => {
    try {
        const { locality, profession } = req.params;

        const people = await User.find({
            locality: locality,
            professionCategory: profession
        }).select('name profession phone ratings impactScore');

        res.json({
            success: true,
            count: people.length,
            data: people
        });
    } catch (error) {
        logger.error(`Error in getPeopleByProfession: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch people" });
    }
};

module.exports = {
    getCities,
    getLocalities,
    exploreLocalities,
    getProfessionStats,
    getStateStats,
    getPeopleByProfession,
};


const User = require("../models/User");
const Emergency = require("../models/Emergency");
const EmergencyResponse = require("../models/EmergencyResponse");
const ServiceRequest = require("../models/ServiceRequest");
const logger = require("../utils/logger");

// @desc    Get overall platform analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getPlatformAnalytics = async (req, res) => {
    try {
        const [userCount, studentCount, emergencyCount, activeEmergencies, serviceCount] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isStudent: true }),
            Emergency.countDocuments(),
            Emergency.countDocuments({ status: 'Open' }),
            ServiceRequest.countDocuments()
        ]);

        // Get emergency trends (last 30 days) with day-wise group
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const emergencyTrends = await Emergency.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        type: "$type",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // City-wise distribution
        const cityDistribution = await User.aggregate([
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                counts: {
                    users: userCount,
                    students: studentCount,
                    emergencies: emergencyCount,
                    activeEmergencies,
                    services: serviceCount
                },
                emergencyTrends,
                cityDistribution
            }
        });
    } catch (error) {
        logger.error(`Error in getPlatformAnalytics: ${error.message}`);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Get user contribution analytics
// @route   GET /api/analytics/user/:id
// @access  Private
const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.params.id || req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const stats = await Promise.all([
            ServiceRequest.countDocuments({ providerId: userId, status: 'Completed' }),
            ServiceRequest.countDocuments({ requesterId: userId }),
            EmergencyResponse.countDocuments({ responderId: userId, status: 'Active' })
        ]);

        res.json({
            success: true,
            data: {
                name: user.name,
                impactScore: user.impactScore,
                ratings: user.ratings,
                completedServices: stats[0],
                requestedServices: stats[1],
                emergencyResponses: stats[2]
            }
        });
    } catch (error) {
        logger.error(`Error in getUserAnalytics: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPlatformAnalytics,
    getUserAnalytics,
};

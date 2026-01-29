const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Emergency = require("../models/Emergency");
const logger = require("../utils/logger");

// @desc    Get all users (for admin management)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select("-password")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments({});

        res.json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        logger.error(`Error in admin getUsers: ${error.message}`);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Approve/Verify user
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isVerified = true;
        await user.save();

        res.json({ success: true, message: "User verified successfully" });
    } catch (error) {
        logger.error(`Error in admin verifyUser: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resolve complaint
// @route   PUT /api/admin/complaints/:id/resolve
// @access  Private/Admin
const resolveComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        complaint.status = 'Resolved';
        await complaint.save();

        res.json({ success: true, message: "Complaint resolved" });
    } catch (error) {
        logger.error(`Error in admin resolveComplaint: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [userCount, serviceCount, emergencyCount, resolvedComplaints, recentUsers] = await Promise.all([
            User.countDocuments({}),
            require("../models/ServiceRequest").countDocuments({}),
            Emergency.countDocuments({}),
            Complaint.countDocuments({ status: 'Resolved' }),
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
        ]);

        res.json({
            success: true,
            data: {
                users: userCount,
                recentUsers,
                services: serviceCount,
                emergencies: emergencyCount,
                resolvedComplaints,
                engagement: Math.round((serviceCount / (userCount || 1)) * 100) / 100
            }
        });
    } catch (error) {
        logger.error(`Error in admin getAnalytics: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch analytics" });
    }
};

module.exports = { getUsers, verifyUser, resolveComplaint, getAnalytics };

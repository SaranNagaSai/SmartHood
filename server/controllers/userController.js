const User = require("../models/User");
const logger = require("../utils/logger");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.json({
                success: true,
                data: user
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        logger.error(`Error in getUserProfile: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const updatableFields = [
                'name', 'email', 'age', 'gender', 'nationality', 'bloodGroup',
                'address', 'locality', 'area', 'city', 'state', 'profession',
                'experience', 'income', 'preferredLanguage'
            ];

            updatableFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    user[field] = req.body[field];
                }
            });

            const updatedUser = await user.save();
            res.json({
                success: true,
                data: updatedUser
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        logger.error(`Error in updateUserProfile: ${error.message}`);
        res.status(500).json({ success: false, message: "Update failed. Please try again." });
    }
};

// @desc    Update user locality (address change triggers)
// @route   PUT /api/users/locality
// @access  Private
const updateUserLocality = async (req, res) => {
    try {
        const { locality, area, city, state, address } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.locality = locality || user.locality;
            user.area = area || user.area;
            user.city = city || user.city;
            user.state = state || user.state;
            user.address = address || user.address;

            const updatedUser = await user.save();
            res.json({
                success: true,
                message: "Locality updated successfully",
                data: updatedUser
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        logger.error(`Error in updateUserLocality: ${error.message}`);
        res.status(500).json({ success: false, message: "Locality update failed" });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserLocality,
};

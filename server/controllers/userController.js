const User = require("../models/User");
const ServiceRequest = require("../models/ServiceRequest");
const Emergency = require("../models/Emergency");
const RevenueLog = require("../models/RevenueLog");
const logger = require("../utils/logger");
const { isAllowlistedAdmin } = require("../utils/adminAllowlist");

const BLOOD_GROUP_UPDATE_COOLDOWN_MS = 180 * 24 * 60 * 60 * 1000; // 6 months (recommended)

const computeRoleBadge = (user) => {
    if (isAllowlistedAdmin({ email: user?.email, phone: user?.phone })) return "Admin";
    if (user?.isStudent || String(user?.professionCategory || "").toLowerCase() === "student") return "Student";
    return "User";
};

const sumRevenue = async (match) => {
    const rows = await RevenueLog.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return rows?.[0]?.total || 0;
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userId = user._id;

        const [
            servicesRequested,
            servicesProvided,
            emergencyAlertsRaised,
            emergenciesParticipated,
            revenueGenerated,
            revenueSpent,
            higherImpactCount,
        ] = await Promise.all([
            ServiceRequest.countDocuments({ requesterId: userId }),
            ServiceRequest.countDocuments({ providerId: userId }),
            Emergency.countDocuments({ reporterId: userId }),
            Emergency.countDocuments({ responderIds: userId }),
            sumRevenue({ providerId: userId }),
            sumRevenue({ requesterId: userId }),
            User.countDocuments({ impactScore: { $gt: user.impactScore || 0 } }),
        ]);

        const roleBadge = computeRoleBadge(user);
        const joinedOn = user.createdAt || user.createdAt;

        const webPushAvailable = Boolean(user?.pushSubscription?.endpoint) || (user?.fcmTokens?.length || 0) > 0;
        const emailAvailable = Boolean(user?.email);

        const webPushEnabled = Boolean(user?.notificationPrefs?.webPushEnabled !== false && webPushAvailable);
        const emailEnabled = Boolean(user?.notificationPrefs?.emailEnabled !== false && emailAvailable);

        return res.json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    roleBadge,
                    joinedOn,
                },
                stats: {
                    servicesRequested,
                    servicesProvided,
                    emergenciesParticipated,
                    emergencyAlertsRaised,
                    revenueGenerated: revenueGenerated || user.revenueGenerated || 0,
                    revenueSpent: revenueSpent || user.revenueSpent || 0,
                    currentRating: user?.ratings?.average || 0,
                    leaderboardRank: (higherImpactCount || 0) + 1,
                },
                notificationStatus: {
                    webPushAvailable,
                    webPushEnabled,
                    emailAvailable,
                    emailEnabled,
                    smsEnabled: false,
                },
            },
        });
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
            const readOnlyFields = [
                "username",
                "registrationId",
                "role",
                "createdAt",
                "updatedAt",
                "tokenVersion",
                "isDeleted",
                "deletedAt",
            ];

            for (const key of readOnlyFields) {
                if (req.body?.[key] !== undefined) {
                    return res.status(400).json({
                        success: false,
                        message: `${key} is not editable`,
                        error: { code: "READ_ONLY_FIELD", field: key },
                    });
                }
            }

            // Blood group change: allow only once every ~6 months.
            if (req.body?.bloodGroup !== undefined) {
                const incomingBlood = String(req.body.bloodGroup || "").trim();
                const currentBlood = String(user.bloodGroup || "").trim();

                if (incomingBlood && incomingBlood !== currentBlood) {
                    if (user.bloodGroupUpdatedAt) {
                        const nextAllowedAt = new Date(user.bloodGroupUpdatedAt.getTime() + BLOOD_GROUP_UPDATE_COOLDOWN_MS);
                        if (Date.now() < nextAllowedAt.getTime()) {
                            return res.status(400).json({
                                success: false,
                                message: "Blood group can be changed only once every 6 months",
                                error: {
                                    code: "BLOODGROUP_COOLDOWN",
                                    nextAllowedAt,
                                },
                            });
                        }
                    }

                    user.bloodGroup = incomingBlood;
                    user.bloodGroupUpdatedAt = new Date();
                }
            }

            const updatableFields = [
                "name",
                "email",
                "phone",
                "age",
                "gender",
                "nationality",
                "address",
                "pincode",
                "locality",
                "area",
                "town",
                "city",
                "district",
                "state",
                "professionCategory",
                "profession",
                "experience",
                "income",
                "currency",
                "preferredLanguage",
            ];

            updatableFields.forEach((field) => {
                if (req.body[field] !== undefined) {
                    user[field] = req.body[field];
                }
            });

            // Student logic
            const incomingProfessionCategory =
                req.body.professionCategory !== undefined
                    ? String(req.body.professionCategory || "").trim()
                    : undefined;

            if (incomingProfessionCategory) {
                if (incomingProfessionCategory.toLowerCase() === "student") {
                    user.professionCategory = "Student";
                    user.isStudent = true;
                } else {
                    user.isStudent = false;
                }
            }

            if (req.body?.isStudent !== undefined) {
                user.isStudent = Boolean(req.body.isStudent);
                if (user.isStudent) {
                    user.professionCategory = "Student";
                }
            }

            if (req.body?.studentDetails?.educationLevel !== undefined) {
                user.studentDetails = user.studentDetails || {};
                user.studentDetails.educationLevel = req.body.studentDetails.educationLevel;
            }
            if (req.body?.studentDetails?.classYear !== undefined) {
                user.studentDetails = user.studentDetails || {};
                user.studentDetails.classYear = req.body.studentDetails.classYear;
            }
            if (req.body?.studentDetails?.institutionName !== undefined) {
                user.studentDetails = user.studentDetails || {};
                user.studentDetails.institutionName = req.body.studentDetails.institutionName;
            }
            if (req.body?.studentDetails?.stream !== undefined) {
                user.studentDetails = user.studentDetails || {};
                user.studentDetails.stream = req.body.studentDetails.stream;
            }
            if (req.body?.studentDetails?.branch !== undefined) {
                user.studentDetails = user.studentDetails || {};
                user.studentDetails.branch = req.body.studentDetails.branch;
            }

            // Notification preferences (store toggles; availability is computed in GET)
            if (req.body?.notificationPrefs?.emailEnabled !== undefined) {
                user.notificationPrefs = user.notificationPrefs || {};
                user.notificationPrefs.emailEnabled = Boolean(req.body.notificationPrefs.emailEnabled);
            }
            if (req.body?.notificationPrefs?.webPushEnabled !== undefined) {
                user.notificationPrefs = user.notificationPrefs || {};
                user.notificationPrefs.webPushEnabled = Boolean(req.body.notificationPrefs.webPushEnabled);
            }

            const updatedUser = await user.save();

            const roleBadge = computeRoleBadge(updatedUser);
            return res.json({
                success: true,
                data: {
                    ...updatedUser.toObject(),
                    roleBadge,
                },
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        logger.error(`Error in updateUserProfile: ${error.message}`);
        const isDup = error?.code === 11000;
        if (isDup) {
            const dupKey = Object.keys(error?.keyPattern || {})[0];
            return res.status(400).json({
                success: false,
                message: dupKey === "phone" ? "Phone already in use" : "Email already in use",
                error: { code: "DUPLICATE", field: dupKey || "unknown" },
            });
        }

        res.status(500).json({ success: false, message: "Update failed. Please try again." });
    }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const ok = await user.matchPassword(currentPassword);
        if (!ok) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = newPassword;
        user.tokenVersion = (user.tokenVersion || 0) + 1; // revoke existing sessions
        await user.save();

        return res.json({ success: true, message: "Password updated" });
    } catch (error) {
        logger.error(`Error in changePassword: ${error.message}`);
        return res.status(500).json({ success: false, message: "Failed to change password" });
    }
};

// @desc    Logout all sessions (revoke all JWTs)
// @route   POST /api/users/logout-all
// @access  Private
const logoutAllSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        return res.json({ success: true, message: "Logged out all sessions" });
    } catch (error) {
        logger.error(`Error in logoutAllSessions: ${error.message}`);
        return res.status(500).json({ success: false, message: "Failed to logout all sessions" });
    }
};

// @desc    Soft delete account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isDeleted = true;
        user.deletedAt = new Date();
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        user.pushSubscription = undefined;
        user.fcmTokens = [];
        await user.save();

        return res.json({ success: true, message: "Account deleted" });
    } catch (error) {
        logger.error(`Error in deleteAccount: ${error.message}`);
        return res.status(500).json({ success: false, message: "Failed to delete account" });
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
    changePassword,
    logoutAllSessions,
    deleteAccount,
};

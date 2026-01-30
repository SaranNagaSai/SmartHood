const Notification = require("../models/Notification");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendMulticast } = require("../services/fcmService");

// Helper to send push notification
const sendPushNotification = async (userId, payload) => {
    try {
        const user = await User.findById(userId);

        const tokens = (user?.fcmTokens || []).map((t) => t.token).filter(Boolean);
        if (tokens.length === 0) return;

        const result = await sendMulticast({
            tokens,
            title: payload?.title,
            body: payload?.body,
            url: payload?.url,
            data: payload?.data,
            urgency: payload?.urgency === "high" ? "high" : "normal",
        });

        if (result.invalidTokens && result.invalidTokens.length > 0 && user) {
            user.fcmTokens = user.fcmTokens.filter((t) => !result.invalidTokens.includes(t.token));
            await user.save();
        }
    } catch (error) {
        logger.error(`Error sending push to user ${userId}: ${error.message}`);
    }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ recipient: req.user._id });

        res.json({
            success: true,
            count: notifications.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: notifications
        });
    } catch (error) {
        logger.error(`Error in getNotifications: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        logger.error(`Error in markAsRead: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });
        res.json({ success: true, count });
    } catch (error) {
        logger.error(`Error in getUnreadCount: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({
            success: true,
            message: "All notifications marked as read",
            modified: result.modifiedCount || 0,
        });
    } catch (error) {
        logger.error(`Error in markAllAsRead: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
const subscribe = async (req, res) => {
    try {
        const { fcmToken } = req.body || {};

        // Preferred: FCM token registration
        if (fcmToken) {
            const token = String(fcmToken).trim();
            if (!token) {
                return res.status(400).json({ success: false, message: "Invalid FCM token" });
            }

            const now = new Date();
            req.user.fcmTokens = req.user.fcmTokens || [];
            const existing = req.user.fcmTokens.find((t) => t.token === token);
            if (existing) {
                existing.lastSeenAt = now;
            } else {
                req.user.fcmTokens.push({ token, lastSeenAt: now });
            }

            await req.user.save();
            return res.status(201).json({ success: true, message: "FCM token registered" });
        }

        // Legacy: store Web Push subscription (kept for backward-compat)
        const subscription = req.body;
        if (subscription && subscription.endpoint) {
            req.user.pushSubscription = subscription;
            await req.user.save();
            return res.status(201).json({ success: true, message: "Subscribed to push notifications" });
        }

        return res.status(400).json({
            success: false,
            message: "Provide fcmToken (preferred) or a legacy push subscription",
        });
    } catch (error) {
        logger.error(`Error in subscribe: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Unregister an FCM token
// @route   DELETE /api/notifications/fcm-token
// @access  Private
const unregisterFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body || {};
        const token = String(fcmToken || "").trim();
        if (!token) {
            return res.status(400).json({ success: false, message: "Invalid FCM token" });
        }

        req.user.fcmTokens = (req.user.fcmTokens || []).filter((t) => t.token !== token);
        await req.user.save();

        return res.json({ success: true, message: "FCM token removed" });
    } catch (error) {
        logger.error(`Error in unregisterFcmToken: ${error.message}`);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    subscribe,
    unregisterFcmToken,
    sendPushNotification // Exporting helper for use in other controllers
};

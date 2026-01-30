const { sendPushNotification } = require("../controllers/notificationController");
const User = require("../models/User");
const Notification = require("../models/Notification");
const logger = require("../utils/logger");
const { sendMulticast } = require("./fcmService");

/**
 * Adapter to send notification (legacy helper)
 */
const sendNotification = async (userId, title, body, data) => {
    const payload = {
        title,
        body,
        data,
        url: '/emergency'
    };
    await sendPushNotification(userId, payload);
};

const normalizeIdSet = (ids) => new Set((ids || []).map((id) => id?.toString()).filter(Boolean));

const broadcastEmergencyToUsers = async ({ users, payload, excludeUserIds }) => {
    const exclude = normalizeIdSet(excludeUserIds);
    const filteredUsers = (users || []).filter((u) => !exclude.has(u._id?.toString()));

    if (!filteredUsers.length) return { notifiedUserIds: [] };

    const notificationsToInsert = filteredUsers.map((user) => ({
        recipient: user._id,
        type: 'Emergency',
        title: `🚨 ${payload.title}`,
        message: payload.body,
        urgency: 'High',
        isRead: false,
        data: payload.data,
    }));

    await Notification.insertMany(notificationsToInsert);

    const tokens = filteredUsers
        .flatMap((u) => (u.fcmTokens || []).map((t) => t.token))
        .filter(Boolean);

    const result = await sendMulticast({
        tokens,
        title: `🚨 ${payload.title}`,
        body: payload.body,
        url: "/emergency",
        data: payload.data,
        urgency: "high",
    });

    if (result.invalidTokens && result.invalidTokens.length > 0) {
        await User.updateMany(
            { "fcmTokens.token": { $in: result.invalidTokens } },
            { $pull: { fcmTokens: { token: { $in: result.invalidTokens } } } }
        );
    }

    return { notifiedUserIds: filteredUsers.map((u) => u._id) };
};

const getUsersForEscalationLevel = async ({ emergency, level }) => {
    if (!emergency) return [];

    if (level === "locality") {
        return User.find({ locality: emergency.locality });
    }

    if (level === "town_or_city") {
        if (emergency.town) {
            return User.find({ $or: [{ town: emergency.town }, { city: emergency.city }] });
        }
        return User.find({ city: emergency.city });
    }

    if (level === "district") {
        if (!emergency.district) return User.find({ city: emergency.city });
        return User.find({ district: emergency.district });
    }

    if (level === "state") {
        return User.find({ state: emergency.state });
    }

    return [];
};

const broadcastEmergencyEscalationStep = async ({ emergency, level }) => {
    if (!emergency || !level) return { notifiedUserIds: [] };

    const users = await getUsersForEscalationLevel({ emergency, level });
    const excludeUserIds = [
        ...(emergency.notifiedUserIds || []),
        emergency.reporterId,
    ];

    const payload = {
        title: `${emergency.priority} Emergency: ${emergency.type}`,
        body: emergency.description,
        data: { emergencyId: emergency._id.toString(), escalationLevel: level },
    };

    const result = await broadcastEmergencyToUsers({ users, payload, excludeUserIds });

    if (result.notifiedUserIds.length) {
        await emergency.updateOne({ $addToSet: { notifiedUserIds: { $each: result.notifiedUserIds } } });
    }

    logger.info(`Emergency escalation broadcast: level=${level} users=${result.notifiedUserIds.length}`);
    return result;
};

const broadcastEmergencyAllLevels = async ({ emergency }) => {
    // High-priority: broadcast immediately to all levels in required order.
    const levels = ["locality", "town_or_city", "district", "state"];
    for (const level of levels) {
        // eslint-disable-next-line no-await-in-loop
        await broadcastEmergencyEscalationStep({ emergency, level });
    }
};

/**
 * Broadcasts an emergency notification to a topic (locality)
 * Replaced Firebase Topic Messaging with Database Iteration (Web Push)
 */
const broadcastEmergency = async (topic, payload) => {
    if (!topic) {
        logger.warn("Attempted to broadcast emergency without a topic");
        return;
    }

    try {
        const users = await User.find({ locality: topic });
        const result = await broadcastEmergencyToUsers({ users, payload, excludeUserIds: [] });
        logger.info(`Persisted and broadcasted emergency notification for ${result.notifiedUserIds.length} users in ${topic}`);
    } catch (error) {
        logger.error(`Error broadcasting emergency to topic ${topic}: ${error.message}`);
    }
};

module.exports = {
    sendNotification,
    broadcastEmergency,
    broadcastEmergencyEscalationStep,
    broadcastEmergencyAllLevels,
};

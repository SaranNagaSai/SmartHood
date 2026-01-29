const admin = require("../config/firebase");
const logger = require("../utils/logger");

/**
 * Sends a push notification to a specific user device
 * @param {string} token - FCM Device Token
 * @param {object} payload - Notification data (title, body, etc.)
 */
const sendPushNotification = async (token, payload) => {
    if (!token) {
        logger.warn("Attempted to send notification without a device token");
        return;
    }

    const message = {
        notification: {
            title: payload.title,
            body: payload.body,
        },
        data: payload.data || {},
        token: token,
        android: {
            priority: payload.priority === 'High' ? 'high' : 'normal',
            notification: {
                sound: payload.sound || 'default',
            }
        }
    };

    try {
        const response = await admin.messaging().send(message);
        logger.info(`Successfully sent notification: ${response}`);
        return response;
    } catch (error) {
        logger.error(`Error sending notification to ${token}: ${error.message}`);
        // Optionally handle token expiration/invalidity here
    }
};

/**
 * Broadcasts an emergency notification to a topic (locality)
 * @param {string} topic - The locality or 'broadcast'
 * @param {object} payload - Notification data
 */
const broadcastEmergency = async (topic, payload) => {
    if (!topic) {
        logger.warn("Attempted to broadcast emergency without a topic");
        return;
    }

    const message = {
        notification: {
            title: `🚨 EMERGENCY: ${payload.title}`,
            body: payload.body,
        },
        topic: topic,
        android: {
            priority: 'high',
            notification: {
                sound: 'emergency_alert', // Custom sound for emergencies
                channelId: 'emergency_channel'
            }
        },
        data: payload.data || {}
    };

    try {
        // 1. Send Firebase Cloud Messaging (FCM) Broadcast
        const response = await admin.messaging().send(message);
        logger.info(`Successfully broadcasted emergency to topic ${topic}: ${response}`);

        // 2. Persist to Database for all users in that locality
        // Finding users in the topic (locality)
        const Notification = require("../models/Notification");
        const User = require("../models/User");

        // This can be heavy for large user bases, but fine for prototype/MVP
        const usersInLocality = await User.find({ locality: topic }).select('_id');

        if (usersInLocality.length > 0) {
            const notificationsToInsert = usersInLocality.map(user => ({
                recipient: user._id,
                type: 'Emergency',
                title: `🚨 ${payload.title}`,
                message: payload.body,
                urgency: 'High',
                isRead: false,
                data: payload.data
            }));

            await Notification.insertMany(notificationsToInsert);
            logger.info(`Persisted emergency notification for ${usersInLocality.length} users in ${topic}`);
        }

        return response;
    } catch (error) {
        logger.error(`Error broadcasting emergency to topic ${topic}: ${error.message}`);
    }
};

module.exports = { sendPushNotification, broadcastEmergency };

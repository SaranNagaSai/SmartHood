const admin = require('../config/firebase');

/**
 * Send push notification via Firebase Cloud Messaging
 * @param {String} fcmToken - User's FCM token
 * @param {Object} notification - Notification object with title and body
 * @param {Object} data - Additional data to send
 */
const sendPushNotification = async (fcmToken, notification, data = {}) => {
    try {
        if (!fcmToken) {
            console.log('No FCM token provided, skipping push notification');
            return { success: false, error: 'No FCM token' };
        }

        const message = {
            token: fcmToken,
            notification: {
                title: notification.title || 'Smart Hood',
                body: notification.body || 'You have a new notification'
            },
            data: {
                ...data,
                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                timestamp: new Date().toISOString()
            },
            webpush: {
                headers: {
                    Urgency: 'high'
                },
                notification: {
                    title: notification.title || 'Smart Hood',
                    body: notification.body || 'You have a new notification',
                    icon: '/logo.png',
                    badge: '/logo.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: false
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log('✅ Push notification sent successfully:', response);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('❌ Error sending push notification:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome notification to new user
 * @param {Object} user - User object with fcmToken, name, registrationId
 */
const sendWelcomeNotification = async (user) => {
    const notification = {
        title: '🎉 Welcome to Smart Hood!',
        body: `Hello ${user.name}! Your Unique ID is ${user.registrationId}. Start exploring your community!`
    };

    const data = {
        type: 'welcome',
        userId: user._id.toString(),
        registrationId: user.registrationId,
        route: '/home'
    };

    return await sendPushNotification(user.fcmToken, notification, data);
};

/**
 * Send notification about new service request
 * @param {Array} fcmTokens - Array of FCM tokens
 * @param {Object} service - Service request object
 */
const notifyNewService = async (fcmTokens, service) => {
    const notification = {
        title: '🆕 New Service Request',
        body: `${service.title} - ${service.category}`
    };

    const promises = fcmTokens.map(token =>
        sendPushNotification(token, notification, {
            type: 'service',
            serviceId: service._id.toString(),
            route: '/services'
        })
    );

    return await Promise.allSettled(promises);
};

/**
 * Send emergency alert notification
 * @param {Array} fcmTokens - Array of FCM tokens
 * @param {Object} emergency - Emergency object
 */
const notifyEmergency = async (fcmTokens, emergency) => {
    const notification = {
        title: '🚨 EMERGENCY ALERT',
        body: `${emergency.type}: ${emergency.description.substring(0, 100)}`
    };

    const promises = fcmTokens.map(token =>
        sendPushNotification(token, notification, {
            type: 'emergency',
            emergencyId: emergency._id.toString(),
            priority: emergency.priority,
            route: '/emergency'
        })
    );

    return await Promise.allSettled(promises);
};

module.exports = {
    sendPushNotification,
    sendWelcomeNotification,
    notifyNewService,
    notifyEmergency
};

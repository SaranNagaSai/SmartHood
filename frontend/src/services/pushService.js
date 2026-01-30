import API from './api';

import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { app } from '../firebaseConfig';

export const registerPush = async () => {
    if (!('serviceWorker' in navigator)) {
        console.error('Service workers are not supported in this browser');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        const permission = Notification?.permission;
        if (permission === 'denied') {
            // User explicitly blocked notifications.
            return;
        }

        if (permission === 'default') {
            const alreadyPrompted = localStorage.getItem('fcmPermissionRequested') === '1';
            if (!alreadyPrompted) {
                localStorage.setItem('fcmPermissionRequested', '1');
                const result = await Notification.requestPermission();
                if (result !== 'granted') return;
            } else {
                // Avoid repeated prompts.
                return;
            }
        }

        if (Notification?.permission !== 'granted') {
            return;
        }

        const supported = await isSupported();
        if (!supported) {
            console.warn('Firebase messaging is not supported in this browser');
            return;
        }

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.warn('Missing VITE_FIREBASE_VAPID_KEY; cannot register FCM token');
            return;
        }

        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });

        if (!token) {
            return;
        }

        const lastToken = localStorage.getItem('fcmToken');
        const userInfoRaw = localStorage.getItem('user') || localStorage.getItem('userInfo');
        const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
        const userId = userInfo?._id || userInfo?.data?._id || null;
        const lastUserId = localStorage.getItem('fcmTokenUserId');

        // Avoid duplicate backend registrations across reloads.
        if (token !== lastToken || (userId && userId !== lastUserId)) {
            await API.post('/notifications/subscribe', { fcmToken: token });
            localStorage.setItem('fcmToken', token);
            if (userId) localStorage.setItem('fcmTokenUserId', userId);
        }

        console.log('FCM token registered');
    } catch (error) {
        console.error('Error registering push:', error);
    }
};

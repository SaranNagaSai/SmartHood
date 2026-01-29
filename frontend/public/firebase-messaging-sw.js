// Firebase Cloud Messaging Service Worker
// This handles push notifications when the app is in the background

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase with your project configuration
firebase.initializeApp({
    apiKey: "AIzaSyDei3YFE5Dj-EbPhr94uGc2kSpkJ-YOet0",
    authDomain: "smart-hood-9da8f.firebaseapp.com",
    projectId: "smart-hood-9da8f",
    storageBucket: "smart-hood-9da8f.firebasestorage.app",
    messagingSenderId: "257024789633",
    appId: "1:257024789633:web:b2802755dc73e24d2dd180",
    measurementId: "G-JDC9X9WB9T"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Smart Hood';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: payload.data?.type || 'notification',
        data: payload.data,
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    // Open the app or focus if already open
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes('localhost') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not open, open new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

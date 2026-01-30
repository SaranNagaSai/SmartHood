self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Firebase Messaging (FCM) background handling
// Uses Firebase compat libs because service workers cannot import ESM modules from node_modules.
try {
    importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

    firebase.initializeApp({
        apiKey: 'AIzaSyDei3YFE5Dj-EbPhr94uGc2kSpkJ-YOet0',
        authDomain: 'smart-hood-9da8f.firebaseapp.com',
        projectId: 'smart-hood-9da8f',
        storageBucket: 'smart-hood-9da8f.firebasestorage.app',
        messagingSenderId: '257024789633',
        appId: '1:257024789633:web:b2802755dc73e24d2dd180',
        measurementId: 'G-JDC9X9WB9T'
    });

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        const data = payload?.data || {};
        const title = data.title || payload?.notification?.title || 'SmartHood';
        const body = data.body || payload?.notification?.body || '';
        const url = data.url || '/';

        const options = {
            body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: { url },
        };

        self.registration.showNotification(title, options);
    });
} catch (e) {
    // Ignore if importScripts fails (e.g., offline during SW install)
}

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

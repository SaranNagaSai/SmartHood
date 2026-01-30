const webpush = require("web-push");
const dotenv = require("dotenv");

dotenv.config();

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

if (!publicVapidKey || !privateVapidKey || !vapidSubject) {
    throw new Error(
        "Missing required Web Push env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT"
    );
}

webpush.setVapidDetails(
    vapidSubject,
    publicVapidKey,
    privateVapidKey
);

module.exports = webpush;

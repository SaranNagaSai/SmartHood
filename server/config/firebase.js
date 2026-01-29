const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// In a real-world scenario, you would provide the path to your service account key file
// For this project, we assume the environment variables are set correctly
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : null;

if (serviceAccount || process.env.FIREBASE_PROJECT_ID) {
    try {
        admin.initializeApp({
            credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
    } catch (error) {
        console.warn("WARNING: Firebase Admin SDK failed to initialize:", error.message);
    }
} else {
    console.warn("Firebase Admin SDK not initialized: Missing credentials");
}

module.exports = admin;

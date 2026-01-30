const admin = require("firebase-admin");

let firebaseApp;

const getServiceAccount = () => {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
        try {
            return JSON.parse(json);
        } catch (error) {
            throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON (must be valid JSON)");
        }
    }

    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (path) {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        return require(path);
    }

    return null;
};

const getFirebaseAdminApp = () => {
    if (firebaseApp) return firebaseApp;

    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
        throw new Error(
            "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
        );
    }

    if (admin.apps && admin.apps.length > 0) {
        firebaseApp = admin.app();
        return firebaseApp;
    }

    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    return firebaseApp;
};

module.exports = {
    admin,
    getFirebaseAdminApp,
};

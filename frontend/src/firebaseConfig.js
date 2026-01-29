import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDei3YFE5Dj-EbPhr94uGc2kSpkJ-YOet0",
    authDomain: "smart-hood-9da8f.firebaseapp.com",
    projectId: "smart-hood-9da8f",
    storageBucket: "smart-hood-9da8f.firebasestorage.app",
    messagingSenderId: "257024789633",
    appId: "1:257024789633:web:b2802755dc73e24d2dd180",
    measurementId: "G-JDC9X9WB9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
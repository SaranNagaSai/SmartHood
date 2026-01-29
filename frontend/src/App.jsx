// Root component// Acts as the entry container for all application pages
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { requestForToken, onMessageListener } from "./services/firebaseConfig";
import API from "./services/api";
import Home from "./pages/Home"; // Assuming Home component is in this path
import Login from "./pages/Login"; // Assuming Login component is in this path
import Register from "./pages/Register";
import Complaints from "./pages/Complaints";
import Tourism from "./pages/Tourism";
import TourismAdd from "./pages/TourismAdd";
import PlaceDetail from "./pages/PlaceDetail"; // New import
import Emergency from "./pages/Emergency";
import Activity from "./pages/Activity"; // I'll create this next
import Admin from "./pages/Admin";
import LanguageSelect from "./pages/LanguageSelect";
import Profile from "./pages/Profile";
import ExploreCity from "./pages/ExploreCity";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import Events from "./pages/Events";
import StudentDashboard from "./pages/StudentDashboard";
import Services from "./pages/Services"; // New import
import PrivateRoute from "./components/common/PrivateRoute"; // New import
import "./App.css"; // Keep existing App.css import

function App() {
  useEffect(() => {
    // Request Notification Permission & Save FCM Token
    const initNotifications = async () => {
      const token = await requestForToken();
      if (token) {
        // Save token to backend if user is logged in
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo && userInfo.token) {
          try {
            await API.put("/auth/fcm-token", { fcmToken: token });
            console.log("FCM Token synced to server.");
          } catch (e) {
            console.error("Failed to sync FCM token:", e);
          }
        }
      }
    };

    initNotifications();

    // Foreground Listener
    onMessageListener().then((payload) => {
      console.log("Foreground Notification:", payload);
      alert(`${payload.notification.title}: ${payload.notification.body}`);
    }).catch(err => console.error("Foreground listener error:", err));
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/emergency" element={<PrivateRoute><Emergency /></PrivateRoute>} />
          <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
          <Route path="/tourism" element={<PrivateRoute><Tourism /></PrivateRoute>} />
          <Route path="/tourism/add" element={<PrivateRoute><TourismAdd /></PrivateRoute>} />
          <Route path="/tourism/:id" element={<PrivateRoute><PlaceDetail /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          {/* Routes below were in original file, keeping them and wrapping with PrivateRoute where appropriate */}
          <Route path="/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
          <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/explore" element={<PrivateRoute><ExploreCity /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          {/* LanguageSelect is typically an initial public route */}
          <Route path="/language-select" element={<LanguageSelect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

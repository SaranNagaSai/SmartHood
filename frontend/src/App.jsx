// Root component - Acts as the entry container for all application pages
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import { registerPush } from "./services/pushService";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Complaints from "./pages/Complaints";
import Tourism from "./pages/Tourism";
import TourismAdd from "./pages/TourismAdd";
import PlaceDetail from "./pages/PlaceDetail";
import Emergency from "./pages/Emergency";
import Activity from "./pages/Activity";
import Admin from "./pages/Admin";
import LanguageSelect from "./pages/LanguageSelect";
import Profile from "./pages/Profile";
import ExploreCity from "./pages/ExploreCity";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import Events from "./pages/Events";
import StudentDashboard from "./pages/StudentDashboard";
import Services from "./pages/Services";
import PrivateRoute from "./components/common/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import AdminRoute from "./routes/AdminRoute";

function App() {
  useEffect(() => {
    // Initialize PWA Push (Web Standard)
    const initPush = async () => {
      const userInfo = JSON.parse(localStorage.getItem("user") || localStorage.getItem("userInfo") || "null");
      if (userInfo) {
        // Register Service Worker and Subscribe
        await registerPush();
      }
    };
    initPush();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes (no layout wrapper) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/language-select" element={<LanguageSelect />} />
          
          {/* Protected routes with AppLayout */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/services" element={<Services />} />
            <Route path="/tourism" element={<Tourism />} />
            <Route path="/tourism/add" element={<TourismAdd />} />
            <Route path="/tourism/:id" element={<PlaceDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/explore" element={<ExploreCity />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

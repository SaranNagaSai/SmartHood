// Restricts access to admin users only
// Used for admin dashboard and analytics

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role && String(user.role).toLowerCase() === "admin";
  return isAdmin ? children : <Navigate to="/home" replace />;
}

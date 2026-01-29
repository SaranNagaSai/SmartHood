// Helper hook for authentication context
// Simplifies access to auth data

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useAuth() {
  return useContext(AuthContext);
}

// Handles login and registration API calls
// Connects frontend authentication with backend

import api from "./api";

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

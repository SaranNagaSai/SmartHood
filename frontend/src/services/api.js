import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Add a request interceptor to include JWT token in headers
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error?.response?.data?.error?.code;
    if (code === "PROFILE_INCOMPLETE") {
      const currentPath = window.location?.pathname;
      if (currentPath && currentPath !== "/profile") {
        window.location.assign("/profile");
      }
    }
    return Promise.reject(error);
  }
);

export default API;

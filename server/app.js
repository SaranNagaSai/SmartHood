const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const parseCorsOrigins = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const configuredOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);
const isProd = process.env.NODE_ENV === "production";

const devDefaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : (isProd ? [] : devDefaultOrigins);

if (isProd && allowedOrigins.length === 0) {
  throw new Error("Missing required CORS env var: CORS_ORIGINS (comma-separated list of allowed origins)");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl/postman) that send no Origin.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Hood Backend is running...");
});

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const localityRoutes = require("./routes/localityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const tourismRoutes = require("./routes/tourismRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const locationRoutes = require("./routes/locationRoutes");

const { notFound } = require("./middleware/errorMiddleware");
const errorHandler = require("./middleware/errorHandler");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/localities", localityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/tourism", tourismRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/locations", locationRoutes); // Added locationRoutes (Fix)

app.use(notFound);
app.use(errorHandler);

module.exports = app;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
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

app.use(notFound);
app.use(errorHandler);

module.exports = app;

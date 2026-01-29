const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const socketHandler = require("./sockets/socketHandler");
const logger = require("./utils/logger");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const eventRoutes = require("./routes/eventRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const locationRoutes = require("./routes/locationRoutes");
const tourismRoutes = require("./routes/tourismRoutes");

const PORT = process.env.PORT || 5000;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/tourism", tourismRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});


const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const socketHandler = require("./sockets/socketHandler");
const logger = require("./utils/logger");
const { startEmergencyEscalationScheduler } = require("./services/emergencyEscalationScheduler");

const PORT = process.env.PORT || 5000;

// Note: All routes are now defined in app.js to ensure correct middleware order

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
  startEmergencyEscalationScheduler();
});

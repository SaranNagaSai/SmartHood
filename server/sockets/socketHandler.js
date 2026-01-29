const logger = require("../utils/logger");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        logger.info(`New client connected: ${socket.id}`);

        // Join a locality-specific room for targeted broadcasts
        socket.on("joinLocality", (locality) => {
            socket.join(locality);
            logger.info(`Socket ${socket.id} joined locality: ${locality}`);
        });

        // Handle real-time emergency alerts
        socket.on("sendEmergency", (data) => {
            // Broadcast to everyone in the same locality
            io.to(data.locality).emit("newEmergency", data);
            logger.info(`Emergency broadcasted to locality: ${data.locality}`);
        });

        // Handle generic notifications
        socket.on("sendNotification", (data) => {
            // Send to specific user room if exists
            io.to(data.recipientId).emit("notification", data);
        });

        socket.on("disconnect", () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });
};

module.exports = socketHandler;

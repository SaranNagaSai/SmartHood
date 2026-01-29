// Direct server startup script
const http = require("http");
const dotenv = require("dotenv");

// Load environment variables first
dotenv.config();

const app = require("./app");
const { Server } = require("socket.io");
const socketHandler = require("./sockets/socketHandler");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

socketHandler(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

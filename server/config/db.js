const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.warn("WARNING: Running server without MongoDB connection. Some features will fail.");
        // process.exit(1); // Do not crash, allow server to start for debug
    }
};

module.exports = connectDB;

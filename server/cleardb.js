const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const clearDB = async () => {
    try {
        console.log("⚠️  WARNING: This will delete ALL data in the database!");
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env");
        }

        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGODB_URI);

        console.log(`Connected to ${mongoose.connection.name}. Clearing now...`);

        // Drop the entire database
        await mongoose.connection.db.dropDatabase();

        console.log("✅ Database cleared successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing database:", error.message);
        process.exit(1);
    }
};

clearDB();

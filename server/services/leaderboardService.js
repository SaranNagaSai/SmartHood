const User = require("../models/User");
const ServiceRequest = require("../models/ServiceRequest");

/**
 * Calculates and updates user impact scores and updates leaderboards.
 */
const updateLeaderboards = async () => {
    try {
        // Fetch all users
        const users = await User.find({});

        for (const user of users) {
            // Logic: Impact score = (Completed Services * 10) + (Emergency Participations * 20) + (Avg Rating * 5)
            // This is a simplified version for implementation
            const completedServices = await ServiceRequest.countDocuments({
                providerId: user._id,
                status: 'Completed'
            });

            // Update impact score
            user.impactScore = (completedServices * 10) + (user.ratings.average * 5);
            await user.save();
        }

        console.log("Leaderboards updated successfully");
    } catch (error) {
        console.error("Error updating leaderboards:", error.message);
    }
};

module.exports = {
    updateLeaderboards,
};

const Emergency = require("../models/Emergency");
const User = require("../models/User");
const { sendNotification } = require("./notificationEngine");

/**
 * Handles emergency alerts and broadcasts to nearby users.
 */
const broadcastEmergency = async (emergencyId) => {
    try {
        const emergency = await Emergency.findById(emergencyId);
        if (!emergency) return;

        // Find users in the same locality or city based on severity
        const query = { locality: emergency.locality };

        // If high priority, maybe broadcast to the entire city
        if (emergency.priority === 'High') {
            query.city = emergency.city;
        }

        const nearbyUsers = await User.find(query);

        for (const user of nearbyUsers) {
            if (user._id.toString() !== emergency.reporterId.toString()) {
                await sendNotification(
                    user._id,
                    "EMERGENCY",
                    `High priority emergency: ${emergency.type} in ${emergency.locality}`,
                    { emergencyId: emergency._id }
                );
            }
        }
    } catch (error) {
        console.error("Error broadcasting emergency:", error.message);
    }
};

module.exports = {
    broadcastEmergency,
};

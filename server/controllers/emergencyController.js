const Emergency = require("../models/Emergency");
const logger = require("../utils/logger");
const { broadcastEmergency } = require("../services/notificationEngine");

// @desc    Create a new emergency alert
// @route   POST /api/emergencies
// @access  Private
const createEmergency = async (req, res) => {
    try {
        const { type, description, priority, contactNumber, media, voiceNote, bloodGroupRequired } = req.body;

        const emergency = await Emergency.create({
            type,
            description,
            priority: priority || 'Medium',
            locality: req.user.locality,
            city: req.user.city,
            state: req.user.state,
            reporterId: req.user._id, // Renamed poster to reporterId
            contactNumber: contactNumber || req.user.phone,
            media,
            voiceNote,
            bloodGroupRequired
        });

        // Professional broadcasting logic
        if (emergency) {
            // Trigger push notifications/broadcasts via the service
            await broadcastEmergency(emergency.locality, {
                title: `${priority} Emergency: ${type}`,
                body: description,
                data: { emergencyId: emergency._id.toString() }
            });

            res.status(201).json({
                success: true,
                data: emergency
            });
        }
    } catch (error) {
        logger.error(`Error in createEmergency: ${error.message}`);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get emergency alerts based on locality
// @route   GET /api/emergencies
// @access  Private
const getEmergencies = async (req, res) => {
    try {
        const { locality, city, state, status } = req.query;

        let query = { status: status || 'Open' };
        if (locality) {
            query.locality = locality;
        } else if (city) {
            query.city = city;
        } else if (state) {
            query.state = state;
        } else {
            query.locality = req.user.locality;
        }

        const emergencies = await Emergency.find(query)
            .populate("reporterId", "name phone")
            .sort({ priority: -1, createdAt: -1 });

        res.json({
            success: true,
            count: emergencies.length,
            data: emergencies
        });
    } catch (error) {
        logger.error(`Error in getEmergencies: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch emergencies" });
    }
};

// @desc    Respond/Volunteer for an emergency
// @route   PUT /api/emergencies/:id/respond
// @access  Private
const respondToEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) {
            return res.status(404).json({ success: false, message: "Emergency not found" });
        }

        // Add volunteer if not already added
        const isAlreadyVolunteer = emergency.volunteers.some(v => v.userId.toString() === req.user._id.toString());
        if (isAlreadyVolunteer) {
            return res.status(400).json({ success: false, message: "You are already a volunteer for this emergency" });
        }

        emergency.volunteers.push({ userId: req.user._id });
        await emergency.save();

        res.json({ success: true, message: "You have successfully volunteered for this emergency" });
    } catch (error) {
        logger.error(`Error in respondToEmergency: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createEmergency, getEmergencies, respondToEmergency };

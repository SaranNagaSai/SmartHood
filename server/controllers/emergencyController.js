const Emergency = require("../models/Emergency");
const EmergencyResponse = require("../models/EmergencyResponse");
const logger = require("../utils/logger");
const {
    broadcastEmergencyEscalationStep,
    broadcastEmergencyAllLevels,
} = require("../services/notificationEngine");

const errorResponse = (res, status, code, message, details) =>
    res.status(status).json({
        success: false,
        message,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    });

const normalizePriority = (priority) => {
    const p = (priority || "Medium").toString().toLowerCase();
    if (p === "high") return "High";
    if (p === "low") return "Low";
    return "Medium";
};

// @desc    Create a new emergency alert
// @route   POST /api/emergencies
// @access  Private
const createEmergency = async (req, res) => {
    try {
        const { type, description, priority, contactNumber, media, voiceNote, bloodGroupRequired } = req.body;

        if (!type || !description) {
            return errorResponse(res, 400, "EMERGENCY_VALIDATION_ERROR", "type and description are required");
        }

        const normalizedPriority = normalizePriority(priority);
        const cooldownSec = Number(process.env.EMERGENCY_CREATE_COOLDOWN_SEC || 60);
        const cooldownMs = Math.max(0, cooldownSec) * 1000;

        if (normalizedPriority !== "High" && cooldownMs > 0) {
            const last = await Emergency.findOne({ reporterId: req.user._id }).sort({ createdAt: -1 });
            if (last) {
                const elapsed = Date.now() - new Date(last.createdAt).getTime();
                if (elapsed < cooldownMs) {
                    const retryAfterSec = Math.ceil((cooldownMs - elapsed) / 1000);
                    res.set("Retry-After", String(retryAfterSec));
                    return errorResponse(
                        res,
                        429,
                        "EMERGENCY_COOLDOWN",
                        "Please wait before creating another emergency",
                        { retryAfterSec }
                    );
                }
            }
        }

        const { locality, city, state, district, town, phone } = req.user || {};
        if (!locality || !city || !state) {
            return errorResponse(
                res,
                400,
                "EMERGENCY_LOCATION_MISSING",
                "Profile location is required to create an emergency"
            );
        }

        const emergency = await Emergency.create({
            type,
            description,
            priority: normalizedPriority,
            locality,
            town,
            city,
            district,
            state,
            reporterId: req.user._id, // Renamed poster to reporterId
            contactNumber: contactNumber || phone,
            responderIds: [],
            responderCount: 0,
            notifiedUserIds: [],
            escalationLevel: "locality",
            lastEscalatedAt: new Date(),
            media,
            voiceNote,
            bloodGroupRequired
        });

        if (normalizedPriority === "High") {
            await broadcastEmergencyAllLevels({ emergency });
            await emergency.updateOne({ $set: { escalationLevel: "state", lastEscalatedAt: new Date() } });
        } else {
            await broadcastEmergencyEscalationStep({ emergency, level: "locality" });
        }

        return res.status(201).json({
            success: true,
            data: emergency,
        });
    } catch (error) {
        logger.error(`Error in createEmergency: ${error.message}`);
        return errorResponse(res, 400, "EMERGENCY_CREATE_FAILED", error.message);
    }
};

// @desc    Get emergency alerts based on locality
// @route   GET /api/emergencies
// @access  Private
const getEmergencies = async (req, res) => {
    try {
        const { locality, town, city, district, state, status } = req.query;

        let query = { status: status || 'Open' };
        if (locality) {
            query.locality = locality;
        } else if (town) {
            query.town = town;
        } else if (city) {
            query.city = city;
        } else if (district) {
            query.district = district;
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
        return errorResponse(res, 500, "EMERGENCY_LIST_FAILED", "Failed to fetch emergencies");
    }
};

// @desc    Respond/Volunteer for an emergency
// @route   PUT /api/emergencies/:id/respond
// @access  Private
const respondToEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) {
            return errorResponse(res, 404, "EMERGENCY_NOT_FOUND", "Emergency not found");
        }

        if (emergency.status !== "Open") {
            return errorResponse(res, 400, "EMERGENCY_NOT_OPEN", "Emergency is not open for responses");
        }

        if (emergency.reporterId.toString() === req.user._id.toString()) {
            return errorResponse(res, 403, "EMERGENCY_SELF_RESPOND", "You cannot respond to your own emergency");
        }

        try {
            await EmergencyResponse.create({
                emergencyId: emergency._id,
                responderId: req.user._id,
                status: "Active",
            });
        } catch (err) {
            // Idempotent duplicate response
            if (err && (err.code === 11000 || err.code === 11001)) {
                return res.json({
                    success: true,
                    message: "You have already volunteered for this emergency",
                });
            }
            throw err;
        }

        await Emergency.findByIdAndUpdate(emergency._id, {
            $addToSet: { responderIds: req.user._id },
            $inc: { responderCount: 1 },
        });

        return res.json({ success: true, message: "You have successfully volunteered for this emergency" });
    } catch (error) {
        logger.error(`Error in respondToEmergency: ${error.message}`);
        return errorResponse(res, 500, "EMERGENCY_RESPOND_FAILED", error.message);
    }
};

module.exports = { createEmergency, getEmergencies, respondToEmergency };

const ServiceRequest = require("../models/ServiceRequest");
const logger = require("../utils/logger");

// @desc    Create a new service request or offer
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
    try {
        const { type, category, description, reach, media, voiceNote } = req.body;

        const service = await ServiceRequest.create({
            type,
            category,
            description,
            locality: req.user.locality,
            city: req.user.city,
            state: req.user.state,
            requesterId: req.user._id, // Renamed poster to requesterId for clarity
            reach: reach || 'Everyone',
            media,
            voiceNote
        });

        res.status(201).json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error in createService: ${error.message}`);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get services based on locality and reach logic
// @route   GET /api/services
// @access  Private
const getServices = async (req, res) => {
    try {
        const { locality, city, state, type, category } = req.query;

        let query = {};
        if (locality) {
            query.locality = locality;
        } else if (city) {
            query.city = city;
        } else if (state) {
            query.state = state;
        } else {
            query.locality = req.user.locality;
        }

        if (type) query.type = type;
        if (category) query.category = category;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const services = await ServiceRequest.find(query)
            .populate("requesterId", "name profession ratings impactScore")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ServiceRequest.countDocuments(query);

        res.json({
            success: true,
            count: services.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: services
        });
    } catch (error) {
        logger.error(`Error in getServices: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch services" });
    }
};

// @desc    Update service status (e.g. Completed)
// @route   PUT /api/services/:id/status
// @access  Private
const updateServiceStatus = async (req, res) => {
    try {
        const { status, revenue } = req.body;
        const service = await ServiceRequest.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service request not found" });
        }

        // Only requester or provider can update status (simplification)
        service.status = status || service.status;
        if (revenue) service.revenue = revenue;

        const updatedService = await service.save();

        res.json({
            success: true,
            data: updatedService
        });
    } catch (error) {
        logger.error(`Error in updateServiceStatus: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to update service status" });
    }
};

// @desc    Accept a service request (become the provider)
// @route   PUT /api/services/:id/accept
// @access  Private
const acceptService = async (req, res) => {
    try {
        const service = await ServiceRequest.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service request not found" });
        }

        if (service.status !== "Open") {
            return res.status(400).json({ success: false, message: "Service is not available for acceptance" });
        }

        service.providerId = req.user._id;
        service.status = "InProgress";
        service.acceptedAt = new Date();

        const updatedService = await service.save();

        // Notify Requester
        await Notification.create({
            recipient: service.requesterId,
            type: 'Service',
            title: 'Service Accepted',
            message: `${req.user.name} has accepted your request: "${service.description}"`,
            urgency: 'Medium',
            data: { serviceId: service._id }
        });

        res.json({
            success: true,
            data: updatedService,
            message: "Service accepted successfully"
        });
    } catch (error) {
        logger.error(`Error in acceptService: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to accept service" });
    }
};

// @desc    Confirm service completion (by requester or provider)
// @route   PUT /api/services/:id/complete
// @access  Private
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Confirm service completion (by requester or provider)
// @route   PUT /api/services/:id/complete
// @access  Private
const confirmCompletion = async (req, res) => {
    try {
        const { confirmedBy, revenue, notes } = req.body;
        const service = await ServiceRequest.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service request not found" });
        }

        // Track who confirmed completion
        if (confirmedBy === "requester") {
            service.requesterConfirmed = true;
        } else if (confirmedBy === "provider") {
            service.providerConfirmed = true;
        }

        // If provider confirms or completion is forced, mark as completed
        if (service.requesterConfirmed || service.providerConfirmed) {
            service.status = "Completed";
            service.completedAt = new Date();
            if (revenue) service.revenue = revenue;
            if (notes) service.completionNotes = notes;

            // 💰 UPDATE REVENUE STATS
            if (revenue && revenue > 0) {
                // Update Provider: Revenue Generated
                if (service.providerId) {
                    await User.findByIdAndUpdate(service.providerId, {
                        $inc: { revenueGenerated: revenue }
                    });
                }
                // Update Requester: Revenue Spent
                if (service.requesterId) {
                    await User.findByIdAndUpdate(service.requesterId, {
                        $inc: { revenueSpent: revenue }
                    });
                }
            }
        }

        const updatedService = await service.save();

        // Notify the OTHER party (if provider confirmed, notify requester; if requester confirmed, notify provider)
        // If status became Completed just now
        if (service.status === 'Completed') {
            const recipientId = (req.user._id.toString() === service.requesterId.toString())
                ? service.providerId
                : service.requesterId;

            if (recipientId) {
                await Notification.create({
                    recipient: recipientId,
                    type: 'Service',
                    title: 'Service Completed',
                    message: `The service "${service.description}" has been marked as completed by ${req.user.name}.`,
                    urgency: 'Medium',
                    data: { serviceId: service._id }
                });
            }
        }

        res.json({
            success: true,
            data: updatedService,
            message: "Completion confirmed and revenue updated"
        });
    } catch (error) {
        logger.error(`Error in confirmCompletion: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to confirm completion" });
    }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Private
const getServiceById = async (req, res) => {
    try {
        const service = await ServiceRequest.findById(req.params.id)
            .populate("requesterId", "name phone profession")
            .populate("providerId", "name phone profession ratings");

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error in getServiceById: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch service" });
    }
};

// Placeholder for new methods mentioned in the export
const getServicesSearch = async (req, res) => {
    res.status(501).json({ success: false, message: "Not Implemented: getServicesSearch" });
};

const getServiceStats = async (req, res) => {
    res.status(501).json({ success: false, message: "Not Implemented: getServiceStats" });
};

// @desc    Show interest in a service (reveals phone number)
// @route   PUT /api/services/:id/interest
// @access  Private
const showInterest = async (req, res) => {
    try {
        const service = await ServiceRequest.findById(req.params.id)
            .populate('requesterId', 'name phone registrationId locality');

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        // Check if already showed interest
        const alreadyInterested = service.interestedUsers.some(
            item => item.user.toString() === req.user._id.toString()
        );

        if (!alreadyInterested) {
            service.interestedUsers.push({ user: req.user._id });
            service.status = "Interested";
            await service.save();

            // Notify requester
            const Notification = require("../models/Notification");
            await Notification.create({
                recipient: service.requesterId._id,
                type: "Service",
                title: "Someone is Interested!",
                message: `${req.user.name} (ID: ${req.user.registrationId}) is interested in your service request. Contact: ${req.user.phone}`,
                urgency: "High"
            });
        }

        // Return requester's phone number (this is the key "reveal" feature)
        res.json({
            success: true,
            message: "Interest registered. Contact details revealed.",
            data: {
                requesterName: service.requesterId.name,
                requesterPhone: service.requesterId.phone,
                requesterUniqueId: service.requesterId.registrationId,
                requesterLocality: service.requesterId.locality
            }
        });
    } catch (error) {
        logger.error(`Error in showInterest: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark service as complete (requester confirms via Unique ID)
// @route   PUT /api/services/:id/complete
// @access  Private
const markComplete = async (req, res) => {
    try {
        const { providerUniqueId, amountPaid, rating, reviewText } = req.body;

        const service = await ServiceRequest.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        // Only requester can mark as complete
        if (service.requesterId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only requester can mark as complete" });
        }

        // Find provider by Unique ID
        const User = require("../models/User");
        const provider = await User.findOne({ registrationId: providerUniqueId });

        if (!provider) {
            return res.status(404).json({ success: false, message: `No user found with Unique ID: ${providerUniqueId}` });
        }

        service.status = "Completed";
        service.completedBy = provider._id;
        service.completedByUniqueId = providerUniqueId;
        service.amountPaid = amountPaid || 0;
        service.rating = rating;
        service.reviewText = reviewText;
        service.completionConfirmedAt = new Date();
        service.isCompleted = true;
        await service.save();

        // Update revenue tracking
        if (amountPaid && amountPaid > 0) {
            await User.findByIdAndUpdate(provider._id, {
                $inc: { revenueGenerated: amountPaid }
            });
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { revenueSpent: amountPaid }
            });
        }

        // Update provider's rating
        if (rating) {
            const currentAverage = provider.ratings.average || 0;
            const currentCount = provider.ratings.count || 0;
            const newAverage = ((currentAverage * currentCount) + rating) / (currentCount + 1);

            await User.findByIdAndUpdate(provider._id, {
                $set: {
                    "ratings.average": newAverage,
                    "ratings.count": currentCount + 1
                }
            });
        }

        res.json({
            success: true,
            message: "Service marked as completed successfully",
            data: service
        });
    } catch (error) {
        logger.error(`Error in markComplete: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createService,
    getServices,
    updateServiceStatus,
    acceptService,
    confirmCompletion,
    getServiceById,
    showInterest,
    markComplete
};

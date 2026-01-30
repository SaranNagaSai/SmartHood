const ServiceRequest = require("../models/ServiceRequest");
const logger = require("../utils/logger");
const Notification = require("../models/Notification");
const { sendPushNotification } = require("./notificationController");
const User = require("../models/User");
const RevenueLog = require("../models/RevenueLog");

const SERVICE_STATUS = {
    OPEN: "Open",
    INTERESTED: "Interested",
    IN_PROGRESS: "InProgress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

const normalizeStatus = (value) => {
    if (!value) return value;
    const raw = String(value).trim();
    const map = {
        open: SERVICE_STATUS.OPEN,
        interested: SERVICE_STATUS.INTERESTED,
        inprogress: SERVICE_STATUS.IN_PROGRESS,
        "in-progress": SERVICE_STATUS.IN_PROGRESS,
        "In-Progress": SERVICE_STATUS.IN_PROGRESS,
        completed: SERVICE_STATUS.COMPLETED,
        cancelled: SERVICE_STATUS.CANCELLED,
        canceled: SERVICE_STATUS.CANCELLED,
    };
    return map[raw] || map[raw.toLowerCase()] || raw;
};

const errorResponse = (res, httpStatus, code, message, extra) =>
    res.status(httpStatus).json({
        success: false,
        message,
        error: {
            code,
            ...extra,
        },
    });

const isRequester = (service, userId) =>
    Boolean(service?.requesterId && userId && service.requesterId.toString() === userId.toString());

const isProvider = (service, userId) =>
    Boolean(service?.providerId && userId && service.providerId.toString() === userId.toString());

const ensureParty = (res, service, userId, actionLabel) => {
    if (isRequester(service, userId) || isProvider(service, userId)) {
        return true;
    }
    errorResponse(res, 403, "SERVICE_FORBIDDEN", `Only the requester/provider can ${actionLabel}.`);
    return false;
};

const recordServiceRevenueOnce = async ({ service, amount, createdBy, meta }) => {
    const numericAmount = Number(amount || 0);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return { recorded: false, reason: "NO_AMOUNT" };
    }
    if (!service?.providerId || !service?.requesterId) {
        return { recorded: false, reason: "MISSING_PARTIES" };
    }

    try {
        await RevenueLog.create({
            serviceId: service._id,
            event: "SERVICE_COMPLETED",
            providerId: service.providerId,
            requesterId: service.requesterId,
            amount: numericAmount,
            currency: "INR",
            createdBy,
            meta: meta || {},
        });

        await User.findByIdAndUpdate(service.providerId, {
            $inc: { revenueGenerated: numericAmount },
        });
        await User.findByIdAndUpdate(service.requesterId, {
            $inc: { revenueSpent: numericAmount },
        });

        return { recorded: true };
    } catch (err) {
        // Duplicate key => already recorded (idempotent)
        if (err && err.code === 11000) {
            return { recorded: false, reason: "ALREADY_RECORDED" };
        }
        throw err;
    }
};

// @desc    Create a new service request or offer
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
    try {
        const { type, category, title, description, reach, media, voiceNote } = req.body;

        if (!type || !category || !description) {
            return errorResponse(res, 400, "SERVICE_VALIDATION_ERROR", "type, category and description are required");
        }

        const service = await ServiceRequest.create({
            type,
            category,
            title: title || category,
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
            message: "Service created",
            data: service
        });
    } catch (error) {
        logger.error(`Error in createService: ${error.message}`);
        return errorResponse(res, 400, "SERVICE_CREATE_FAILED", error.message);
    }
};

// @desc    Get services based on locality and reach logic
// @route   GET /api/services
// @access  Private
const getServices = async (req, res) => {
    try {
        const { locality, city, state, type, category, status } = req.query;

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

        if (status) {
            const normalized = normalizeStatus(status);
            // Backward-compat: also match legacy hyphen variant if present
            const legacyVariants = {
                Open: ["Open", "open"],
                Interested: ["Interested", "interested"],
                InProgress: ["InProgress", "In-Progress", "inprogress", "in-progress"],
                Completed: ["Completed", "completed"],
                Cancelled: ["Cancelled", "cancelled", "canceled"],
            };
            query.status = { $in: legacyVariants[normalized] || [normalized] };
        }

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
        return errorResponse(res, 500, "SERVICE_LIST_FAILED", "Failed to fetch services");
    }
};

// @desc    Update service status (e.g. Completed)
// @route   PUT /api/services/:id/status
// @access  Private
const updateServiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const service = await ServiceRequest.findById(req.params.id);

        if (!service) {
            return errorResponse(res, 404, "SERVICE_NOT_FOUND", "Service request not found");
        }

        const current = normalizeStatus(service.status);
        const next = normalizeStatus(status);
        if (!next) {
            return errorResponse(res, 400, "SERVICE_STATUS_REQUIRED", "status is required");
        }

        if (!ensureParty(res, service, req.user._id, "change the service status")) {
            return;
        }

        // Controlled transitions only (prevents tampering)
        const allowedTransitions = {
            [SERVICE_STATUS.OPEN]: [SERVICE_STATUS.INTERESTED, SERVICE_STATUS.IN_PROGRESS, SERVICE_STATUS.CANCELLED],
            [SERVICE_STATUS.INTERESTED]: [SERVICE_STATUS.IN_PROGRESS, SERVICE_STATUS.CANCELLED],
            [SERVICE_STATUS.IN_PROGRESS]: [SERVICE_STATUS.COMPLETED, SERVICE_STATUS.CANCELLED],
            [SERVICE_STATUS.COMPLETED]: [],
            [SERVICE_STATUS.CANCELLED]: [],
        };

        const allowed = allowedTransitions[current] || [];
        if (!allowed.includes(next)) {
            return errorResponse(res, 400, "SERVICE_TRANSITION_INVALID", `Cannot transition from ${current} to ${next}`, {
                from: current,
                to: next,
            });
        }

        // Additional guards
        if (next === SERVICE_STATUS.IN_PROGRESS) {
            if (!service.providerId) {
                return errorResponse(res, 400, "SERVICE_PROVIDER_REQUIRED", "providerId must be set before moving to InProgress");
            }
        }

        service.status = next;

        const updatedService = await service.save();

        return res.json({
            success: true,
            message: "Service status updated",
            data: updatedService,
        });
    } catch (error) {
        logger.error(`Error in updateServiceStatus: ${error.message}`);
        return errorResponse(res, 500, "SERVICE_STATUS_UPDATE_FAILED", "Failed to update service status");
    }
};

// @desc    Accept a service request (become the provider)
// @route   PUT /api/services/:id/accept
// @access  Private
const acceptService = async (req, res) => {
    try {
        const service = await ServiceRequest.findById(req.params.id);

        if (!service) {
            return errorResponse(res, 404, "SERVICE_NOT_FOUND", "Service request not found");
        }

        const current = normalizeStatus(service.status);
        if (current !== SERVICE_STATUS.OPEN && current !== SERVICE_STATUS.INTERESTED) {
            return errorResponse(res, 400, "SERVICE_NOT_ACCEPTABLE", "Service is not available for acceptance", {
                status: current,
            });
        }

        if (isRequester(service, req.user._id)) {
            return errorResponse(res, 400, "SERVICE_SELF_ACCEPT", "Requester cannot accept their own service");
        }

        if (service.providerId && service.providerId.toString() !== req.user._id.toString()) {
            return errorResponse(res, 400, "SERVICE_ALREADY_ACCEPTED", "Service already has a provider");
        }

        service.providerId = req.user._id;
        service.assignedProvider = req.user._id;
        service.status = SERVICE_STATUS.IN_PROGRESS;
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

        // Push Notification
        await sendPushNotification(service.requesterId, {
            title: 'Service Accepted',
            body: `${req.user.name} accepted your request: "${service.description}"`,
            url: '/activity'
        });

        res.json({
            success: true,
            data: updatedService,
            message: "Service accepted successfully"
        });
    } catch (error) {
        logger.error(`Error in acceptService: ${error.message}`);
        return errorResponse(res, 500, "SERVICE_ACCEPT_FAILED", "Failed to accept service");
    }
};



// @desc    Confirm service completion (by requester or provider)
// @route   PUT /api/services/:id/complete
// @access  Private
const confirmCompletion = async (req, res) => {
    try {
        const { confirmedBy, revenue, notes } = req.body;
        const service = await ServiceRequest.findById(req.params.id);

        if (!service) {
            return errorResponse(res, 404, "SERVICE_NOT_FOUND", "Service request not found");
        }

        // Only requester/provider can confirm completion
        if (!ensureParty(res, service, req.user._id, "confirm completion")) {
            return;
        }

        const current = normalizeStatus(service.status);
        if (current === SERVICE_STATUS.CANCELLED) {
            return errorResponse(res, 400, "SERVICE_CANCELLED", "Cancelled services cannot be completed");
        }

        // Idempotent: if already completed, do not re-apply revenue increments
        if (current === SERVICE_STATUS.COMPLETED || service.isCompleted) {
            return res.json({
                success: true,
                message: "Service already completed",
                data: service,
            });
        }

        // Track who confirmed completion
        if (confirmedBy === "requester") {
            if (!isRequester(service, req.user._id)) {
                return errorResponse(res, 403, "SERVICE_FORBIDDEN", "Only requester can confirm as requester");
            }
            service.requesterConfirmed = true;
        } else if (confirmedBy === "provider") {
            if (!isProvider(service, req.user._id)) {
                return errorResponse(res, 403, "SERVICE_FORBIDDEN", "Only provider can confirm as provider");
            }
            service.providerConfirmed = true;
        } else {
            return errorResponse(res, 400, "SERVICE_CONFIRMER_INVALID", "confirmedBy must be 'requester' or 'provider'");
        }

        // If provider confirms or completion is forced, mark as completed
        if (service.requesterConfirmed || service.providerConfirmed) {
            service.status = SERVICE_STATUS.COMPLETED;
            service.completedAt = new Date();
            service.isCompleted = true;
            if (notes) service.completionNotes = notes;

            const amount = revenue !== undefined ? Number(revenue) : 0;
            if (Number.isFinite(amount) && amount > 0) {
                service.amountPaid = amount;
                service.revenue = amount;

                await recordServiceRevenueOnce({
                    service,
                    amount,
                    createdBy: req.user._id,
                    meta: { source: "confirmCompletion" },
                });
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

                // Push Notification
                await sendPushNotification(recipientId, {
                    title: 'Service Completed',
                    body: `Service "${service.description}" marked completed by ${req.user.name}`,
                    url: '/activity'
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
        return errorResponse(res, 500, "SERVICE_COMPLETE_FAILED", "Failed to confirm completion");
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
            return errorResponse(res, 404, "SERVICE_NOT_FOUND", "Service not found");
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        logger.error(`Error in getServiceById: ${error.message}`);
        return errorResponse(res, 500, "SERVICE_FETCH_FAILED", "Failed to fetch service");
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
            return errorResponse(res, 404, "SERVICE_NOT_FOUND", "Service not found");
        }

        if (isRequester(service, req.user._id)) {
            return errorResponse(res, 400, "SERVICE_INTEREST_SELF", "Requester cannot mark interest on their own service");
        }

        // Check if already showed interest
        const alreadyInterested = service.interestedUsers.some(
            item => item.user.toString() === req.user._id.toString()
        );

        if (!alreadyInterested) {
            service.interestedUsers.push({ user: req.user._id });
            service.status = SERVICE_STATUS.INTERESTED;
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

            // Push Notification
            await sendPushNotification(service.requesterId._id, {
                title: 'New Interest!',
                body: `${req.user.name} is interested in your service. Tap to view details.`,
                url: '/activity'
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
        return errorResponse(res, 500, "SERVICE_INTEREST_FAILED", error.message);
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
            return errorResponse(res, 404, "SERVICE_NOT_FOUND", "Service not found");
        }

        // Only requester can mark as complete
        if (service.requesterId.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, "SERVICE_FORBIDDEN", "Only requester can mark as complete");
        }

        // Idempotent: if already completed, do not re-apply rating/revenue increments
        const current = normalizeStatus(service.status);
        if (current === SERVICE_STATUS.COMPLETED || service.isCompleted) {
            return res.json({
                success: true,
                message: "Service already completed",
                data: service,
            });
        }

        // Find provider by Unique ID
        const User = require("../models/User");
        const provider = await User.findOne({ registrationId: providerUniqueId });

        if (!provider) {
            return errorResponse(res, 404, "USER_NOT_FOUND", `No user found with Unique ID: ${providerUniqueId}`);
        }

        service.status = SERVICE_STATUS.COMPLETED;
        service.completedBy = provider._id;
        service.completedByUniqueId = providerUniqueId;
        service.providerId = service.providerId || provider._id;
        service.assignedProvider = service.assignedProvider || provider._id;
        service.amountPaid = Number(amountPaid || 0);
        service.revenue = service.amountPaid;
        service.rating = rating;
        service.reviewText = reviewText;
        service.completionConfirmedAt = new Date();
        service.isCompleted = true;
        service.completedAt = new Date();
        await service.save();

        // Idempotent revenue tracking (append-only log)
        if (service.amountPaid > 0) {
            await recordServiceRevenueOnce({
                service,
                amount: service.amountPaid,
                createdBy: req.user._id,
                meta: { source: "markComplete", providerUniqueId },
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
        return errorResponse(res, 500, "SERVICE_MARK_COMPLETE_FAILED", error.message);
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

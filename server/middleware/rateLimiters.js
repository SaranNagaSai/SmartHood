const rateLimit = require("express-rate-limit");

const createLimiter = ({ windowMs, max, message }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message,
        },
    });

// Auth: protect against brute-force
const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts. Please try again later.",
});

// Service creation: protect against spam
const serviceCreateLimiter = createLimiter({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: "Too many service creations. Please try again later.",
});

// Emergency creation: stricter to reduce abuse
const emergencyCreateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many emergency reports. Please try again later.",
        error: {
            code: "EMERGENCY_RATE_LIMIT",
            message: "Too many emergency reports. Please try again later.",
        },
    },
});

// High-priority emergencies should bypass normal throttles.
const conditionalEmergencyCreateLimiter = (req, res, next) => {
    const priority = (req.body?.priority || "Medium").toString().toLowerCase();
    if (priority === "high") return next();
    return emergencyCreateLimiter(req, res, next);
};

// Push subscription: protect against repeated subscribe calls
const notificationSubscribeLimiter = createLimiter({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: "Too many subscription attempts. Please try again later.",
});

module.exports = {
    authLimiter,
    serviceCreateLimiter,
    emergencyCreateLimiter,
    conditionalEmergencyCreateLimiter,
    notificationSubscribeLimiter,
};

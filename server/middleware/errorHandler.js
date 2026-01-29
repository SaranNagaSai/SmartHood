const logger = require("../utils/logger");

/**
 * Centralized error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log the error for internal tracking
    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = errorHandler;

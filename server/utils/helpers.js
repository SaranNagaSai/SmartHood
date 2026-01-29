/**
 * Generic helper methods for the backend.
 */

/**
 * Formats a date to a readable string.
 */
const formatDate = (date) => {
    return new Date(date).toLocaleString();
};

/**
 * Generates a random OTP.
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sanitizes user input (basic example).
 */
const sanitize = (text) => {
    return text ? text.trim() : "";
};

module.exports = {
    formatDate,
    generateOTP,
    sanitize
};
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
 * Sanitizes user input (basic example).
 */
const sanitize = (text) => {
    return text ? text.trim() : "";
};

module.exports = {
    formatDate,
    sanitize
};
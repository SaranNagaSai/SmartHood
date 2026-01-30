/**
 * Middleware to restrict access to admin users only.
 * Assumes the user object is already attached to req (e.g., by authMiddleware).
 */
const { isAllowlistedAdmin } = require("../utils/adminAllowlist");

const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    if (!isAllowlistedAdmin({ email: req.user.email, phone: req.user.phone })) {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }

    return next();
};

module.exports = { adminOnly };

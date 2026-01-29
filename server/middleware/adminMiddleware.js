/**
 * Middleware to restrict access to admin users only.
 * Assumes the user object is already attached to req (e.g., by authMiddleware).
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied: Admins only" });
    }
};

module.exports = { adminOnly };

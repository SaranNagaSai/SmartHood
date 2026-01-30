const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isAllowlistedAdmin } = require("../utils/adminAllowlist");

const protect = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Not authorized",
            error: { code: "TOKEN_MISSING" },
        });
    }

    const token = header.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized",
            error: { code: "TOKEN_MISSING" },
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
                error: { code: "TOKEN_INVALID" },
            });
        }

        // Freeze immutable auth identifiers the first time we see this account.
        // This prevents privilege escalation via profile editing of email/phone.
        let shouldSaveAuthIds = false;
        if (!req.user.authEmail && req.user.email) {
            req.user.authEmail = String(req.user.email).trim().toLowerCase();
            shouldSaveAuthIds = true;
        }
        if (!req.user.authPhone && req.user.phone) {
            req.user.authPhone = String(req.user.phone).trim();
            shouldSaveAuthIds = true;
        }
        if (shouldSaveAuthIds) {
            await req.user.save();
        }

        if (req.user.isDeleted) {
            return res.status(401).json({
                success: false,
                message: "Account disabled",
                error: { code: "ACCOUNT_DISABLED" },
            });
        }

        const tokenVersion = Number.isFinite(decoded?.tv) ? decoded.tv : 0;
        if ((req.user.tokenVersion || 0) !== tokenVersion) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
                error: { code: "TOKEN_REVOKED" },
            });
        }
        return next();
    } catch (error) {
        const code = error?.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
        return res.status(401).json({
            success: false,
            message: "Not authorized",
            error: { code },
        });
    }
};

const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    if (!isAllowlistedAdmin({ email: req.user.authEmail, phone: req.user.authPhone })) {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }

    return next();
};

module.exports = { protect, admin };

const REQUIRED_LOCATION_FIELDS = ["state", "district", "town", "locality"];

const isNonEmpty = (value) => {
    if (value === undefined || value === null) return false;
    const trimmed = String(value).trim();
    if (!trimmed) return false;
    if (trimmed.toLowerCase() === "not set") return false;
    return true;
};

const requireProfileCompleteForLocation = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authorized",
        });
    }

    const missing = REQUIRED_LOCATION_FIELDS.filter((field) => !isNonEmpty(req.user[field]));

    // Internal compatibility: current service/emergency schemas still use `city`.
    // If town is present but city is missing, use town as city at runtime.
    if (!isNonEmpty(req.user.city) && isNonEmpty(req.user.town)) {
        req.user.city = req.user.town;
    }

    if (missing.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Profile incomplete. Please complete your location details in Profile before using this feature.",
            error: {
                code: "PROFILE_INCOMPLETE",
                missing,
            },
        });
    }

    return next();
};

module.exports = {
    requireProfileCompleteForLocation,
};

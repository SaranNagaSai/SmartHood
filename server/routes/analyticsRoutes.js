const express = require("express");
const router = express.Router();
const {
    getPlatformAnalytics,
    getUserAnalytics,
} = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, admin, getPlatformAnalytics);
router.get("/user", protect, getUserAnalytics);
router.get("/user/:id", protect, getUserAnalytics);

module.exports = router;

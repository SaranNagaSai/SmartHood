const express = require("express");
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    subscribe,
    unregisterFcmToken,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { notificationSubscribeLimiter } = require("../middleware/rateLimiters");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);
router.post("/subscribe", protect, notificationSubscribeLimiter, subscribe);
router.delete("/fcm-token", protect, unregisterFcmToken);

module.exports = router;

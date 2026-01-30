const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMyActivity } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/my-activity", protect, getMyActivity);

module.exports = router;

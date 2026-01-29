const express = require("express");
const router = express.Router();
const { registerUser, authUser, getMyActivity, updateFcmToken } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", authUser);
router.get("/my-activity", protect, getMyActivity);
router.put("/fcm-token", protect, updateFcmToken);

module.exports = router;

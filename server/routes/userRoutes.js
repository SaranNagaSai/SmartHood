const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    updateUserLocality,
    changePassword,
    logoutAllSessions,
    deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route("/locality")
    .put(protect, updateUserLocality);

router.put("/password", protect, changePassword);
router.post("/logout-all", protect, logoutAllSessions);
router.delete("/account", protect, deleteAccount);

module.exports = router;

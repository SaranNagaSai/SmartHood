const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    updateUserLocality,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route("/locality")
    .put(protect, updateUserLocality);

module.exports = router;

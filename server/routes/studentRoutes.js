const express = require("express");
const router = express.Router();
const {
    getStudentDashboard,
    updateStudentProfile,
    getStudentLeaderboard,
    getOpportunities,
    createOpportunity
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getStudentDashboard);
router.get("/leaderboard", protect, getStudentLeaderboard);
router.post("/opportunities", protect, createOpportunity);
router.get("/opportunities", protect, getOpportunities);
router.put("/profile", protect, updateStudentProfile);

module.exports = router;

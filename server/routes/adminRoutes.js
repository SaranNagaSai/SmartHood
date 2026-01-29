const express = require("express");
const router = express.Router();
const { getUsers, verifyUser, resolveComplaint, getAnalytics } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin middleware will be implemented in authMiddleware
router.use(protect);
router.use(admin);

router.get("/users", getUsers);
router.put("/users/:id/verify", verifyUser);
router.put("/complaints/:id/resolve", resolveComplaint);
router.get("/analytics", getAnalytics);

module.exports = router;

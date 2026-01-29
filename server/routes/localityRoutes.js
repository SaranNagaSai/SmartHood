const express = require("express");
const router = express.Router();
const {
    getCities,
    getLocalities,
    exploreLocalities,
    getProfessionStats,
    getStateStats,
    getPeopleByProfession,
} = require("../controllers/localityController");
const { protect } = require("../middleware/authMiddleware");

router.get("/cities", getCities);
router.get("/explore", protect, exploreLocalities);
router.get("/profession-stats/:locality", protect, getProfessionStats);
router.get("/state-stats", protect, getStateStats);
router.get("/people/:locality/:profession", protect, getPeopleByProfession);
router.get("/:cityId", getLocalities);

module.exports = router;


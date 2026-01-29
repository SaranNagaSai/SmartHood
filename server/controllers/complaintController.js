const Complaint = require("../models/Complaint");

// @desc    Submit a new complaint or feedback
// @route   POST /api/complaints
// @access  Private
const submitComplaint = async (req, res) => {
    const { title, description } = req.body;

    const complaint = await Complaint.create({
        title,
        description,
        user: req.user._id,
        locality: req.user.locality,
        city: req.user.city
    });

    if (complaint) {
        res.status(201).json(complaint);
    } else {
        res.status(400);
        throw new Error("Invalid complaint data");
    }
};

// @desc    Get user's complaints
// @route   GET /api/complaints
// @access  Private
const getMyComplaints = async (req, res) => {
    const complaints = await Complaint.find({ user: req.user._id }).sort("-createdAt");
    res.json(complaints);
};

module.exports = { submitComplaint, getMyComplaints };

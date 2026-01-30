const User = require("../models/User");
const Student = require("../models/Student");
const Opportunity = require("../models/Opportunity");

// @desc    Get student-specific dashboard data
// @route   GET /api/students/dashboard
// @access  Private
const getStudentDashboard = async (req, res) => {
    try {
        const studentInfo = await Student.findOne({ user: req.user._id }); // Fix: user vs userId

        // Fetch student-only leaderboards or academic help requests here
        res.json({
            studentInfo,
            leaderboard: [], // Future: Implement leaderboard logic
            helpRequests: [] // Future: Implement academic help requests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private
const updateStudentProfile = async (req, res) => {
    try {
        const { educationLevel, classYear, degreeType } = req.body;
        let student = await Student.findOne({ user: req.user._id }); // Fix: user vs userId

        if (student) {
            student.educationLevel = educationLevel || student.educationLevel;
            student.classYear = classYear || student.classYear;
            student.degreeType = degreeType || student.degreeType;
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            // Create new student record if it doesn't exist but user is marked as student
            const newStudent = new Student({
                user: req.user._id, // Fix: user vs userId
                educationLevel,
                classYear,
                degreeType
            });
            const savedStudent = await newStudent.save();
            res.status(201).json(savedStudent);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student-only leaderboard
// @route   GET /api/students/leaderboard
// @access  Private
const getStudentLeaderboard = async (req, res) => {
    try {
        // Logic for ranking students based on contribution/impact scores
        const topStudents = await User.find({ isStudent: true })
            .sort({ impactScore: -1 })
            .limit(10)
            .select('name impactScore educationLevel profession locality');
        res.json(topStudents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Opportunities (Internships/Volunteering)
// @route   GET /api/students/opportunities
// @access  Private
const getOpportunities = async (req, res) => {
    try {
        const { type } = req.query;
        let query = { status: 'Open' };
        if (type) query.type = type;

        const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });
        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Opportunity (For admin/users to post)
// @route   POST /api/students/opportunities
// @access  Private
const createOpportunity = async (req, res) => {
    try {
        const { title, organization, type, description, location, duration, skillsRequired } = req.body;
        const opportunity = await Opportunity.create({
            title,
            organization,
            type,
            description,
            location: location || req.user.locality,
            duration,
            skillsRequired,
            postedBy: req.user._id
        });
        res.status(201).json(opportunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudentDashboard,
    updateStudentProfile,
    getStudentLeaderboard,
    getOpportunities,
    createOpportunity
};

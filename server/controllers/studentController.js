const User = require("../models/User");
const Student = require("../models/Student");

// @desc    Get student-specific dashboard data
// @route   GET /api/students/dashboard
// @access  Private
const getStudentDashboard = async (req, res) => {
    try {
        const studentInfo = await Student.findOne({ userId: req.user._id });
        if (!studentInfo) {
            return res.status(404).json({ message: "Student information not found" });
        }

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
        let student = await Student.findOne({ userId: req.user._id });

        if (student) {
            student.educationLevel = educationLevel || student.educationLevel;
            student.classYear = classYear || student.classYear;
            student.degreeType = degreeType || student.degreeType;
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            // Create new student record if it doesn't exist but user is marked as student
            const newStudent = new Student({
                userId: req.user._id,
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
            .select('name impactScore educationLevel');
        res.json(topStudents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudentDashboard,
    updateStudentProfile,
    getStudentLeaderboard,
};

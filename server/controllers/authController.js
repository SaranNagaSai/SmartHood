const User = require("../models/User");
const Student = require("../models/Student");
const ServiceRequest = require("../models/ServiceRequest");
const Emergency = require("../models/Emergency");
const Notification = require("../models/Notification");
const { generateToken } = require("../config/jwt");
const logger = require("../utils/logger");
const { sendWelcomeEmail } = require('../services/emailService');
const { sendWelcomeNotification } = require('../services/notificationService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        console.log("Register Payload Received:", req.body);
        const {
            username, name, email, phone, age, gender, nationality, bloodGroup,
            address, locality, area, district, town, city, state, professionCategory, profession, experience,
            income, currency, preferredLanguage, isStudent, studentDetails
        } = req.body;

        const userExists = await User.findOne({ phone });

        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists with this phone number" });
        }

        const user = await User.create({
            username, name, email, phone, age, gender, nationality, bloodGroup,
            address, locality, area, district, town, city, state, professionCategory, profession, experience,
            income, currency, preferredLanguage, isStudent, studentDetails,
            role: isStudent ? "User" : "User" // Default role for new registrations
        });

        if (user) {
            const token = generateToken(user._id);

            // Create Welcome Notification in Database using the new Notification model
            await Notification.create({
                recipient: user._id,
                type: 'System',
                title: 'Welcome to Smart Hood!',
                message: `Hello ${user.name}, welcome to your Smart Hood community! Your Unique Registration ID is ${user.registrationId}. Use this for all community interactions.`,
                urgency: 'Low',
                isRead: false
            });

            // Mock Phone Notification / SMS
            console.log(`\n--- SMS NOTIFICATION SENT ---`);
            console.log(`To: ${user.phone}`);
            console.log(`Message: Welcome to SmartHood, ${user.name}! Your Unique ID is: ${user.registrationId}.`);
            console.log(`-----------------------------\n`);

            // Send actual welcome notifications
            // Email notification (if email provided)
            if (email) {
                sendWelcomeEmail(user)
                    .then(result => {
                        if (result.success) {
                            console.log(`✅ Welcome email sent to: ${email}`);
                        }
                    })
                    .catch(err => console.error('Email error:', err));
            }

            // Push notification (if FCM token exists)
            if (user.fcmToken) {
                sendWelcomeNotification(user)
                    .then(result => {
                        if (result.success) {
                            console.log(`✅ Push notification sent to: ${user.name}`);
                        }
                    })
                    .catch(err => console.error('Push notification error:', err));
            } else {
                console.log(`ℹ️ No FCM token for this user, will show notification after login`);
            }

            res.status(201).json({
                success: true,
                message: "User registered successfully!",
                data: {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    registrationId: user.registrationId,
                    role: user.role,
                    token,
                },
            });

        } else {
            res.status(400).json({ success: false, message: "Invalid user data" });
        }
    } catch (error) {
        logger.error(`Error in registerUser: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { phone, username } = req.body;

        const user = await User.findOne({ phone });

        // Strict Check: Phone must match AND Username must match
        if (user && (user.username === username)) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    locality: user.locality,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid phone or username" });
        }
    } catch (error) {
        logger.error(`Error in authUser: ${error.message}`);
        res.status(500).json({ success: false, message: "Login failed. Please try again." });
    }
};

// @desc    Get user's activity (services and emergencies)
// @route   GET /api/auth/my-activity
// @access  Private
const getMyActivity = async (req, res) => {
    try {
        const [services, emergencies] = await Promise.all([
            ServiceRequest.find({ requesterId: req.user._id }).sort({ createdAt: -1 }),
            Emergency.find({ reporterId: req.user._id }).sort({ createdAt: -1 })
        ]);

        res.json({ success: true, data: { services, emergencies } });
    } catch (error) {
        logger.error(`Error in getMyActivity: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch activity" });
    }
};

const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { fcmToken }, { new: true });
        res.json({ success: true, message: "FCM Token updated", data: user });
    } catch (error) {
        logger.error(`Error in updateFcmToken: ${error.message}`);
        res.status(500).json({ success: false, message: "Failed to update token" });
    }
};

module.exports = { registerUser, authUser, getMyActivity, updateFcmToken };

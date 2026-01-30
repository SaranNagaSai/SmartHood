const User = require("../models/User");
const Student = require("../models/Student");
const ServiceRequest = require("../models/ServiceRequest");
const Emergency = require("../models/Emergency");
const Notification = require("../models/Notification");
const { generateToken } = require("../config/jwt");
const logger = require("../utils/logger");
const { sendWelcomeEmail } = require('../services/emailService');
const { isAllowlistedAdmin } = require("../utils/adminAllowlist");
const { normalizeEmail, normalizePhone } = require("../utils/adminAllowlist");


// @desc    Register a new user (Simplified Flow)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        console.log("Register Payload Received:", req.body);
        const { username, email, phone, password } = req.body;

        const normalizedUsername = username ? String(username).trim().toLowerCase() : "";
        const normalizedEmail = normalizeEmail(email);
        const normalizedPhone = normalizePhone(phone);

        const hasEmail = Boolean(normalizedEmail);
        const hasPhone = Boolean(normalizedPhone);

        if (!normalizedUsername || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        if (!hasEmail && !hasPhone) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one identifier: email and/or phone",
            });
        }

        const orConditions = [{ username: normalizedUsername }];
        if (hasEmail) orConditions.push({ email: normalizedEmail });
        if (hasPhone) orConditions.push({ phone: normalizedPhone });

        const userExists = await User.findOne({ $or: orConditions });

        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists with this phone, email, or username" });
        }

        const user = await User.create({
            username: normalizedUsername,
            name: normalizedUsername,
            email: hasEmail ? normalizedEmail : undefined,
            phone: hasPhone ? normalizedPhone : undefined,
            authEmail: hasEmail ? normalizedEmail : undefined,
            authPhone: hasPhone ? normalizedPhone : undefined,
            password, // Password hashing is handled in User model pre-save hook
            role: "User",
        });

        if (user) {
            const token = generateToken(user._id, user.tokenVersion || 0);

            // Welcome Notification
            await Notification.create({
                recipient: user._id,
                type: 'System',
                title: 'Welcome to Smart Hood!',
                message: `Hello ${user.name}, welcome! Your ID is ${user.registrationId}. Please complete your profile to access all features.`,
                urgency: 'Low',
                isRead: false
            });

            if (hasEmail) {
                sendWelcomeEmail(user).catch(err => console.error('Email error:', err));
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

// @desc    Auth user & get token (Login with Identifier & Password)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be username, phone, or email

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Please provide credentials" });
        }

        const rawIdentifier = String(identifier).trim();
        const isEmail = rawIdentifier.includes("@");
        const normalizedIdentifier = isEmail
            ? normalizeEmail(rawIdentifier)
            : normalizePhone(rawIdentifier) || rawIdentifier.toLowerCase();

        // Check for user by email, phone, or username
        const user = await User.findOne({
            $or: [
                { email: normalizedIdentifier },
                { phone: normalizedIdentifier },
                { username: normalizedIdentifier }
            ]
        });

        if (user && (await user.matchPassword(password))) {
            // Backfill immutable auth identifiers (older accounts).
            let shouldSave = false;
            if (!user.authEmail && user.email) {
                user.authEmail = normalizeEmail(user.email);
                shouldSave = true;
            }
            if (!user.authPhone && user.phone) {
                user.authPhone = normalizePhone(user.phone) || user.phone;
                shouldSave = true;
            }
            if (shouldSave) {
                await user.save();
            }

            const token = generateToken(user._id, user.tokenVersion || 0);
            const sessionRole = isAllowlistedAdmin({ email: user.email, phone: user.phone })
                ? "Admin"
                : "User";

            res.json({
                success: true,
                message: "Login successful!",
                data: {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    registrationId: user.registrationId,
                    role: sessionRole,
                    token,
                    isStudent: user.isStudent // To help frontend redirect
                },
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        logger.error(`Error in loginUser: ${error.message}`);
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

module.exports = { registerUser, loginUser, getMyActivity };

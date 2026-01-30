const Place = require("../models/Place");
const User = require("../models/User");

// @desc    Get all places with filters
// @route   GET /api/tourism/places
// @access  Public
exports.getPlaces = async (req, res) => {
    try {
        const { state, district, town, locality, category, search, sort = "-ratings.average" } = req.query;

        const query = { isActive: true };

        if (state) query.state = state;
        if (district) query.district = district;
        if (town) query.town = town;
        if (locality) query.locality = locality;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const places = await Place.find(query)
            .populate("addedBy", "name registrationId")
            .sort(sort)
            .lean();

        res.json({ success: true, data: places });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single place by ID
// @route   GET /api/tourism/places/:id
// @access  Public
exports.getPlaceById = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id)
            .populate("addedBy", "name registrationId profession locality")
            .populate("reviews.user", "name registrationId")
            .lean();

        if (!place) {
            return res.status(404).json({ success: false, message: "Place not found" });
        }

        // Increment view count
        await Place.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

        res.json({ success: true, data: place });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new place
// @route   POST /api/tourism/places
// @access  Private
exports.createPlace = async (req, res) => {
    try {
        const {
            name,
            description,
            state,
            district,
            town,
            locality,
            address,
            coordinates,
            category,
            images,
            openingHours,
            entryFee,
            bestTimeToVisit,
            facilities
        } = req.body;

        const place = await Place.create({
            name,
            description,
            state,
            district,
            town,
            locality,
            address,
            coordinates,
            category,
            images: images || [],
            openingHours,
            entryFee,
            bestTimeToVisit,
            facilities,
            addedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Place added successfully",
            data: place
        });
    } catch (error) {
        if (error?.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message || "Invalid place data",
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add review to place
// @route   POST /api/tourism/places/:id/review
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { rating, comment, images } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({ success: false, message: "Place not found" });
        }

        // Check if user already reviewed
        const existingReview = place.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this place" });
        }

        await place.addReview(req.user._id, rating, comment, images || []);

        res.json({
            success: true,
            message: "Review added successfully",
            data: place
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get nearby places (same locality or town)
// @route   GET /api/tourism/places/:id/nearby
// @access  Public
exports.getNearbyPlaces = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({ success: false, message: "Place not found" });
        }

        const nearby = await Place.find({
            _id: { $ne: place._id },
            $or: [
                { locality: place.locality },
                { town: place.town }
            ],
            isActive: true
        })
            .limit(6)
            .sort("-ratings.average")
            .lean();

        res.json({ success: true, data: nearby });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get featured places (top rated)
// @route   GET /api/tourism/featured
// @access  Public
exports.getFeaturedPlaces = async (req, res) => {
    try {
        const { locality, limit = 10 } = req.query;

        const query = { isActive: true };
        if (locality) query.locality = locality;

        const featured = await Place.find(query)
            .sort("-ratings.average -viewCount")
            .limit(parseInt(limit))
            .populate("addedBy", "name")
            .lean();

        res.json({ success: true, data: featured });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload image to place
// @route   POST /api/tourism/places/:id/image
// @access   Private
exports.uploadPlaceImage = async (req, res) => {
    try {
        const { url, publicId, caption } = req.body;

        const place = await Place.findById(req.params.id);

        if (!place) {
            return res.status(404).json({ success: false, message: "Place not found" });
        }

        place.images.push({
            url,
            publicId,
            caption,
            uploadedBy: req.user._id
        });

        await place.save();

        res.json({
            success: true,
            message: "Image uploaded successfully",
            data: place
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPlaces: exports.getPlaces,
    getPlaceById: exports.getPlaceById,
    createPlace: exports.createPlace,
    addReview: exports.addReview,
    getNearbyPlaces: exports.getNearbyPlaces,
    getFeaturedPlaces: exports.getFeaturedPlaces,
    uploadPlaceImage: exports.uploadPlaceImage
};

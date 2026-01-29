import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaStar, FaUpload } from "react-icons/fa";
import API from "../../services/api";
import "./AddPlaceForm.css";

const AddPlaceForm = ({ onClose, onSuccess }) => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        state: user.state || "",
        district: user.district || "",
        town: user.town || "",
        locality: user.locality || "",
        address: "",
        category: "",
        openingHours: "",
        entryFee: "",
        bestTimeToVisit: "",
        facilities: [],
        images: []
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const categories = [
        "Temple", "Park", "Restaurant", "Historical Site",
        "Shopping", "Entertainment", "Nature/Scenic", "Museum", "Beach", "Other"
    ];

    const facilityOptions = [
        "Parking", "Restrooms", "Wheelchair Access", "Wi-Fi",
        "Food Available", "Guided Tours", "Photography Allowed"
    ];

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleFacilityToggle = (facility) => {
        const updated = formData.facilities.includes(facility)
            ? formData.facilities.filter(f => f !== facility)
            : [...formData.facilities, facility];
        setFormData({ ...formData, facilities: updated });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // TODO: Integrate with Cloudinary
        // For now, using placeholder
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({
                ...formData,
                images: [...formData.images, { url: reader.result, caption: "" }]
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await API.post("/tourism/places", formData);

            if (response.data.success) {
                setMessage("✅ Place added successfully!");
                if (onSuccess) onSuccess(response.data.data);
                setTimeout(() => onClose(), 2000);
            }
        } catch (error) {
            console.error("Error adding place:", error);
            setMessage("❌ " + (error.response?.data?.message || "Failed to add place"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="add-place-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="modal-header">
                    <h2>➕ Add New Place</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="add-place-form">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        <input
                            type="text"
                            placeholder="Place Name *"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Description *"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={4}
                            required
                        />
                        <select
                            value={formData.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            required
                        >
                            <option value="">Select Category *</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Location */}
                    <div className="form-section">
                        <h3>Location Details</h3>
                        <input
                            type="text"
                            placeholder="Address"
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                        <div className="location-info-display">
                            <p>📍 {formData.locality}, {formData.town}, {formData.district}, {formData.state}</p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="form-section">
                        <h3>Additional Information</h3>
                        <input
                            type="text"
                            placeholder="Opening Hours (e.g., 9 AM - 6 PM)"
                            value={formData.openingHours}
                            onChange={(e) => handleChange("openingHours", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Entry Fee (e.g., Free or ₹50)"
                            value={formData.entryFee}
                            onChange={(e) => handleChange("entryFee", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Best Time to Visit"
                            value={formData.bestTimeToVisit}
                            onChange={(e) => handleChange("bestTimeToVisit", e.target.value)}
                        />
                    </div>

                    {/* Facilities */}
                    <div className="form-section">
                        <h3>Facilities Available</h3>
                        <div className="facilities-grid">
                            {facilityOptions.map(facility => (
                                <label key={facility} className="facility-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.facilities.includes(facility)}
                                        onChange={() => handleFacilityToggle(facility)}
                                    />
                                    <span>{facility}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="form-section">
                        <h3>Images</h3>
                        <div className="image-upload-section">
                            <label className="upload-btn">
                                <FaUpload /> Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: "none" }}
                                />
                            </label>
                            <p className="upload-hint">Add photos to showcase the place</p>
                        </div>
                        {formData.images.length > 0 && (
                            <div className="image-preview-grid">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="image-preview">
                                        <img src={img.url} alt={`Preview ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Place"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddPlaceForm;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaStar, FaUpload, FaMapMarkerAlt } from "react-icons/fa";
import API from "../../services/api";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import TextAreaField from "../ui/TextAreaField";
import SelectField from "../ui/SelectField";
import useToast from "../../hooks/useToast";

const AddPlaceForm = ({ onClose, onSuccess }) => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const { addToast } = useToast();

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
            // IMPORTANT: Do not send base64 images in JSON (can exceed server body limits).
            // Images are preview-only until Cloudinary upload is integrated.
            const payload = {
                ...formData,
                images: [],
            };

            const response = await API.post("/tourism/places", payload);

            if (response.data.success) {
                setMessage("✅ Place added successfully!");
                addToast("Place added successfully!", { type: "success" });
                if (formData.images?.length) {
                    addToast("Images are preview-only right now (upload coming soon)", { type: "info" });
                }
                if (onSuccess) onSuccess(response.data.data);
                setTimeout(() => onClose(), 2000);
            }
        } catch (error) {
            console.error("Error adding place:", error);
            const msg = error.response?.data?.message || "Failed to add place";
            setMessage("❌ " + msg);
            addToast(msg, { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="modal modal-xl"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="modal-header">
                    <h2 className="modal-title">Add New Place</h2>
                    <Button type="button" variant="ghost" size="sm" className="modal-close" onClick={onClose} aria-label="Close">
                        <FaTimes />
                    </Button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <h3 style={{ marginBottom: 'var(--space-3)' }}>Basic Information</h3>

                        <TextField
                            label="Place Name"
                            placeholder="Place name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />

                        <TextAreaField
                            label="Description"
                            placeholder="Write a short description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={4}
                            required
                        />

                        <SelectField
                            label="Category"
                            value={formData.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </SelectField>

                        <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Location Details</h3>

                        <TextField
                            label="Address"
                            placeholder="Street / landmark (optional)"
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />

                        <div className="alert alert-info" style={{ marginBottom: 'var(--space-5)' }}>
                            <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                            {[formData.locality, formData.town, formData.district, formData.state]
                                .map((v) => String(v || '').trim())
                                .filter(Boolean)
                                .join(', ') || 'Location not set'}
                        </div>

                        <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Additional Information</h3>

                        <TextField
                            label="Opening Hours"
                            placeholder="e.g., 9 AM - 6 PM"
                            value={formData.openingHours}
                            onChange={(e) => handleChange("openingHours", e.target.value)}
                        />

                        <TextField
                            label="Entry Fee"
                            placeholder="e.g., Free or ₹50"
                            value={formData.entryFee}
                            onChange={(e) => handleChange("entryFee", e.target.value)}
                        />

                        <TextField
                            label="Best Time to Visit"
                            placeholder="e.g., Oct - Feb"
                            value={formData.bestTimeToVisit}
                            onChange={(e) => handleChange("bestTimeToVisit", e.target.value)}
                        />

                        <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Facilities</h3>
                        <div className="content-grid cols-2" style={{ marginBottom: 'var(--space-5)' }}>
                            {facilityOptions.map((facility) => (
                                <label key={facility} className="checkbox-wrapper">
                                    <input
                                        className="checkbox"
                                        type="checkbox"
                                        checked={formData.facilities.includes(facility)}
                                        onChange={() => handleFacilityToggle(facility)}
                                    />
                                    <span>{facility}</span>
                                </label>
                            ))}
                        </div>

                        <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Images</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <label className="btn btn-secondary">
                                <FaUpload /> Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: "none" }}
                                />
                            </label>
                            <div className="form-hint">Add photos to showcase the place</div>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="content-grid cols-3" style={{ marginBottom: 'var(--space-5)' }}>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="card">
                                        <img
                                            src={img.url}
                                            alt={`Preview ${idx + 1}`}
                                            style={{ width: '100%', height: 140, objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {message ? (
                            <div className={message.includes("✅") ? "alert alert-success" : "alert alert-error"} style={{ marginBottom: 'var(--space-4)' }}>
                                {message}
                            </div>
                        ) : null}

                        <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                {loading ? "Adding..." : "Add Place"}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AddPlaceForm;

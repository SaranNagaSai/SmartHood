import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaStar, FaCheckCircle } from "react-icons/fa";
import "./CompletionModal.css";

const CompletionModal = ({ service, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        providerUniqueId: "",
        amountPaid: 0,
        rating: 5,
        reviewText: ""
    });

    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!formData.providerUniqueId || formData.providerUniqueId.length < 5) {
            setError("Please enter a valid Unique ID (e.g., ABC12)");
            return;
        }

        onSubmit(formData);
    };

    const handleRatingClick = (rating) => {
        setFormData({ ...formData, rating });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="completion-modal"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Header */}
                <div className="modal-header">
                    <h3>✅ Mark Service as Complete</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Service Info */}
                <div className="service-info">
                    <p className="service-title">{service.title}</p>
                    <p className="service-category">{service.category}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="completion-form">
                    {/* Unique ID Input */}
                    <div className="form-group-modal">
                        <label>Provider's Unique ID *</label>
                        <input
                            type="text"
                            placeholder="e.g., ABC12"
                            value={formData.providerUniqueId}
                            onChange={(e) => setFormData({ ...formData, providerUniqueId: e.target.value.toUpperCase() })}
                            maxLength={5}
                            required
                        />
                        <small>Enter the Unique ID of the person who completed this service</small>
                    </div>

                    {/* Amount Paid */}
                    <div className="form-group-modal">
                        <label>Amount Paid (₹)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.amountPaid}
                            onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                            min="0"
                        />
                        <small>Optional - This will update revenue tracking</small>
                    </div>

                    {/* Rating */}
                    <div className="form-group-modal">
                        <label>Rate the Service</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`star ${star <= formData.rating ? "filled" : ""}`}
                                    onClick={() => handleRatingClick(star)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Review Text */}
                    <div className="form-group-modal">
                        <label>Review (Optional)</label>
                        <textarea
                            placeholder="Share your experience..."
                            value={formData.reviewText}
                            onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-confirm">
                            <FaCheckCircle /> Confirm Completion
                        </button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="info-box">
                    <p>💡 <strong>Why Unique ID?</strong></p>
                    <p>This ensures you're confirming the correct person completed the service and prevents fraud.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default CompletionModal;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaStar, FaCheckCircle } from "react-icons/fa";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import TextAreaField from "../ui/TextAreaField";

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
                className="modal modal-lg"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="modal-header">
                    <h3 className="modal-title">Mark Service as Complete</h3>
                    <Button type="button" variant="ghost" size="sm" className="modal-close" onClick={onClose} aria-label="Close">
                        <FaTimes />
                    </Button>
                </div>
                <div className="modal-body">
                    <div className="alert alert-info" style={{ marginBottom: 'var(--space-5)' }}>
                        <div>
                            <div className="alert-title">Service</div>
                            <div className="alert-description">
                                {service?.title} {service?.category ? `• ${service.category}` : ""}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Provider's Unique ID"
                            placeholder="e.g., ABC12"
                            value={formData.providerUniqueId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    providerUniqueId: e.target.value.toUpperCase(),
                                })
                            }
                            maxLength={5}
                            required
                            hint="Enter the Unique ID of the person who completed this service"
                        />

                        <TextField
                            type="number"
                            label="Amount Paid (₹)"
                            placeholder="0"
                            value={formData.amountPaid}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amountPaid: Number(e.target.value),
                                })
                            }
                            min={0}
                            hint="Optional — this will update revenue tracking"
                        />

                        <div className="form-group">
                            <label className="form-label">Rate the Service</label>
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

                        <TextAreaField
                            label="Review (optional)"
                            placeholder="Share your experience..."
                            value={formData.reviewText}
                            onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                            rows={3}
                        />

                        {error ? (
                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                                {error}
                            </div>
                        ) : null}

                        <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" rightIcon={<FaCheckCircle />}>
                                Confirm Completion
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CompletionModal;

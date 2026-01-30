// Rating Modal Component - Used for rating service providers after completion
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTimes, FaPaperPlane } from 'react-icons/fa';
import API from '../../services/api';
import Button from "../ui/Button";
import TextAreaField from "../ui/TextAreaField";
import useToast from "../../hooks/useToast";

const MotionButton = motion.create(Button);

export default function RatingModal({ isOpen, onClose, serviceId, providerId, providerName, onSuccess }) {
    const { addToast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            addToast("Please select a rating", { type: "error" });
            return;
        }

        try {
            setLoading(true);
            await API.post('/ratings', {
                serviceId,
                providerId,
                score: rating,
                comment
            });
            addToast("Thank you for your rating!", { type: "success" });
            onSuccess?.();
            onClose();
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to submit rating", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const starLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="rating-modal-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="modal modal-sm rating-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <Button type="button" variant="ghost" size="sm" className="modal-close" onClick={onClose} aria-label="Close">
                            <FaTimes />
                        </Button>

                        <div className="rating-header">
                            <h2>Rate Your Experience</h2>
                            <p>How was your service with <strong>{providerName || 'this provider'}</strong>?</p>
                        </div>

                        <form onSubmit={handleSubmit} className="rating-form">
                            {/* Star Rating */}
                            <div className="star-rating-container">
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <MotionButton
                                            key={star}
                                            type="button"
                                            unstyled
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            <FaStar />
                                        </MotionButton>
                                    ))}
                                </div>
                                <span className="rating-label">
                                    {rating > 0 ? starLabels[rating - 1] : 'Select rating'}
                                </span>
                            </div>

                            {/* Comment */}
                            <div className="comment-section">
                                <label className="form-label">Add a comment (optional)</label>
                                <TextAreaField
                                    className="textarea"
                                    placeholder="Share your experience..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading || rating === 0}
                                loading={loading}
                                block
                                rightIcon={<FaPaperPlane />}
                            >
                                {loading ? 'Submitting...' : 'Submit Rating'}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

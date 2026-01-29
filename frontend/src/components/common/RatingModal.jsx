// Rating Modal Component - Used for rating service providers after completion
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTimes, FaPaperPlane } from 'react-icons/fa';
import API from '../../services/api';
import './RatingModal.css';

export default function RatingModal({ isOpen, onClose, serviceId, providerId, providerName, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating");
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
            alert("Thank you for your rating!");
            onSuccess?.();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit rating");
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
                        className="rating-modal glass"
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>

                        <div className="rating-header">
                            <h2>Rate Your Experience</h2>
                            <p>How was your service with <strong>{providerName || 'this provider'}</strong>?</p>
                        </div>

                        <form onSubmit={handleSubmit} className="rating-form">
                            {/* Star Rating */}
                            <div className="star-rating-container">
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            <FaStar />
                                        </motion.button>
                                    ))}
                                </div>
                                <span className="rating-label">
                                    {rating > 0 ? starLabels[rating - 1] : 'Select rating'}
                                </span>
                            </div>

                            {/* Comment */}
                            <div className="comment-section">
                                <label>Add a comment (optional)</label>
                                <textarea
                                    placeholder="Share your experience..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-submit-rating"
                                disabled={loading || rating === 0}
                            >
                                {loading ? 'Submitting...' : (
                                    <>
                                        <FaPaperPlane /> Submit Rating
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

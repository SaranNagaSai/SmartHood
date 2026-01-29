import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar, FaMapMarkerAlt, FaClock, FaRupeeSign, FaArrowLeft, FaCalendar } from "react-icons/fa";
import Navbar from "../components/common/Navbar";
import API from "../services/api";
import "./PlaceDetail.css";

const PlaceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [nearby, setNearby] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

    useEffect(() => {
        fetchPlaceDetails();
        fetchNearby();
    }, [id]);

    const fetchPlaceDetails = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/tourism/places/${id}`);
            setPlace(response.data.data);
        } catch (error) {
            console.error("Error fetching place:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearby = async () => {
        try {
            const response = await API.get(`/tourism/places/${id}/nearby`);
            setNearby(response.data.data || []);
        } catch (error) {
            console.error("Error fetching nearby places:", error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/tourism/places/${id}/review`, reviewData);
            alert("✅ Review submitted successfully!");
            setShowReviewModal(false);
            fetchPlaceDetails(); // Refresh to show new review
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit review");
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="premium-spinner"></div>
            </div>
        );
    }

    if (!place) {
        return <div>Place not found</div>;
    }

    return (
        <div className="place-detail-layout">
            <Navbar />

            <div className="place-detail-container">
                <button className="back-btn" onClick={() => navigate("/tourism")}>
                    <FaArrowLeft /> Back to Tourism
                </button>

                {/* Image Gallery */}
                <div className="image-gallery">
                    <div className="main-image">
                        <img
                            src={place.images[selectedImage]?.url || "https://via.placeholder.com/800x500"}
                            alt={place.name}
                        />
                    </div>
                    {place.images.length > 1 && (
                        <div className="thumbnail-row">
                            {place.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumbnail ${selectedImage === idx ? "active" : ""}`}
                                    onClick={() => setSelectedImage(idx)}
                                >
                                    <img src={img.url} alt={`${place.name} ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Place Info */}
                <div className="place-content">
                    <div className="place-main">
                        <div className="place-header">
                            <div>
                                <h1>{place.name}</h1>
                                <p className="category-badge">{place.category}</p>
                            </div>
                            <div className="rating-display">
                                <div className="rating-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} color={i < Math.round(place.ratings.average) ? "#fbbf24" : "#e5e7eb"} />
                                    ))}
                                </div>
                                <span className="rating-text">{place.ratings.average.toFixed(1)} ({place.ratings.count} reviews)</span>
                            </div>
                        </div>

                        <div className="location-info">
                            <FaMapMarkerAlt /> {place.address || `${place.locality}, ${place.town}, ${place.district}, ${place.state}`}
                        </div>

                        <div className="description">
                            <h2>About This Place</h2>
                            <p>{place.description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="details-grid">
                            {place.openingHours && (
                                <div className="detail-item">
                                    <FaClock />
                                    <div>
                                        <strong>Opening Hours</strong>
                                        <p>{place.openingHours}</p>
                                    </div>
                                </div>
                            )}
                            {place.entryFee && (
                                <div className="detail-item">
                                    <FaRupeeSign />
                                    <div>
                                        <strong>Entry Fee</strong>
                                        <p>{place.entryFee}</p>
                                    </div>
                                </div>
                            )}
                            {place.bestTimeToVisit && (
                                <div className="detail-item">
                                    <FaCalendar />
                                    <div>
                                        <strong>Best Time to Visit</strong>
                                        <p>{place.bestTimeToVisit}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Facilities */}
                        {place.facilities?.length > 0 && (
                            <div className="facilities-section">
                                <h2>Facilities</h2>
                                <div className="facilities-list">
                                    {place.facilities.map((facility, idx) => (
                                        <span key={idx} className="facility-tag">✓ {facility}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="reviews-section">
                            <div className="reviews-header">
                                <h2>Reviews ({place.reviews?.length || 0})</h2>
                                <button className="btn-add-review" onClick={() => setShowReviewModal(true)}>
                                    ⭐ Write a Review
                                </button>
                            </div>

                            <div className="reviews-list">
                                {place.reviews?.map((review, idx) => (
                                    <div key={idx} className="review-card">
                                        <div className="review-header">
                                            <div>
                                                <strong>{review.user?.name}</strong>
                                                <div className="review-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} color={i < review.rating ? "#fbbf24" : "#e5e7eb"} size={14} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="review-comment">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Nearby Places Sidebar */}
                    {nearby.length > 0 && (
                        <div className="nearby-sidebar">
                            <h3>Nearby Places</h3>
                            {nearby.map((nearPlace) => (
                                <div
                                    key={nearPlace._id}
                                    className="nearby-card"
                                    onClick={() => navigate(`/tourism/${nearPlace._id}`)}
                                >
                                    <div
                                        className="nearby-image"
                                        style={{
                                            backgroundImage: nearPlace.images[0]
                                                ? `url(${nearPlace.images[0].url})`
                                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        }}
                                    />
                                    <div className="nearby-info">
                                        <h4>{nearPlace.name}</h4>
                                        <p className="nearby-location">{nearPlace.locality}</p>
                                        <div className="nearby-rating">
                                            <FaStar color="#fbbf24" size={12} />
                                            <span>{nearPlace.ratings.average.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Review Modal */}
                {showReviewModal && (
                    <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                        <motion.div
                            className="review-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <h2>Write a Review</h2>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="rating-input">
                                    <label>Your Rating</label>
                                    <div className="star-selector">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                size={32}
                                                color={star <= reviewData.rating ? "#fbbf24" : "#e5e7eb"}
                                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                style={{ cursor: "pointer" }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="comment-input">
                                    <label>Your Review</label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                        placeholder="Share your experience..."
                                        rows={5}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowReviewModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaceDetail;

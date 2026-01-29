import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone, FaMapMarkerAlt, FaClock, FaUser, FaHeart, FaCheckCircle } from "react-icons/fa";
import API from "../../services/api";
import CompletionModal from "../modals/CompletionModal";
import "./ServiceList.css";

const ServiceList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("open"); // open, interested, completed
    const [selectedService, setSelectedService] = useState(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [revealedPhones, setRevealedPhones] = useState({});

    useEffect(() => {
        fetchServices();
    }, [filter]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/services?status=${filter}`);
            setServices(response.data.data || []);
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowInterest = async (serviceId) => {
        try {
            const response = await API.put(`/services/${serviceId}/interest`);

            if (response.data.success) {
                // Update revealed phones state with requester's contact info
                setRevealedPhones(prev => ({
                    ...prev,
                    [serviceId]: response.data.data
                }));

                alert(`✅ Interest registered! You can now contact:\n📞 ${response.data.data.requesterPhone}\n🆔 ${response.data.data.requesterUniqueId}`);

                // Refresh list
                fetchServices();
            }
        } catch (error) {
            console.error("Error showing interest:", error);
            alert(error.response?.data?.message || "Failed to show interest");
        }
    };

    const handleMarkComplete = (service) => {
        setSelectedService(service);
        setShowCompletionModal(true);
    };

    const handleCompletionSubmit = async (completionData) => {
        try {
            const response = await API.put(
                `/services/${selectedService._id}/mark-complete`,
                completionData
            );

            if (response.data.success) {
                alert("✅ Service marked as completed! Revenue tracking updated.");
                setShowCompletionModal(false);
                fetchServices();
            }
        } catch (error) {
            console.error("Error marking complete:", error);
            alert(error.response?.data?.message || "Failed to mark complete");
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return <div className="loader-container"><div className="premium-spinner"></div></div>;
    }

    return (
        <div className="service-list-container">
            <div className="list-header">
                <h2>🛎️ Service Requests</h2>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === "open" ? "active" : ""}`}
                        onClick={() => setFilter("open")}
                    >
                        Open
                    </button>
                    <button
                        className={`filter-tab ${filter === "interested" ? "active" : ""}`}
                        onClick={() => setFilter("interested")}
                    >
                        Interested
                    </button>
                    <button
                        className={`filter-tab ${filter === "completed" ? "active" : ""}`}
                        onClick={() => setFilter("completed")}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {services.length === 0 ? (
                <div className="empty-state">
                    <p>No {filter} services found in your locality</p>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="services-grid">
                        {services.map((service) => {
                            const isMyRequest = service.requesterId?._id === JSON.parse(localStorage.getItem("userInfo"))?._id;
                            const phoneRevealed = revealedPhones[service._id];

                            return (
                                <motion.div
                                    key={service._id}
                                    className="service-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Service Type Badge */}
                                    <div className={`type-badge ${service.type.toLowerCase()}`}>
                                        {service.type}
                                    </div>

                                    {/* Category */}
                                    <div className="service-category">{service.category}</div>

                                    {/* Title */}
                                    <h3 className="service-title">{service.title}</h3>

                                    {/* Description */}
                                    <p className="service-description">{service.description}</p>

                                    {/* Requester Info */}
                                    <div className="service-meta">
                                        <div className="meta-item">
                                            <FaUser /> {service.requesterId?.name || "Unknown"}
                                        </div>
                                        <div className="meta-item">
                                            <FaMapMarkerAlt /> {service.locality}
                                        </div>
                                        <div className="meta-item">
                                            <FaClock /> {formatDate(service.createdAt)}
                                        </div>
                                    </div>

                                    {/* Phone Revealed State */}
                                    {phoneRevealed && (
                                        <div className="revealed-contact">
                                            <FaPhone /> <strong>{phoneRevealed.requesterPhone}</strong>
                                            <span>🆔 {phoneRevealed.requesterUniqueId}</span>
                                        </div>
                                    )}

                                    {/* Interest Count */}
                                    {service.interestedUsers && service.interestedUsers.length > 0 && (
                                        <div className="interest-count">
                                            <FaHeart color="#ef4444" /> {service.interestedUsers.length} interested
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="service-actions">
                                        {!isMyRequest && service.status === "Open" && (
                                            <motion.button
                                                className="btn-interest"
                                                onClick={() => handleShowInterest(service._id)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FaHeart /> I'm Interested
                                            </motion.button>
                                        )}

                                        {isMyRequest && service.status !== "Completed" && (
                                            <motion.button
                                                className="btn-complete"
                                                onClick={() => handleMarkComplete(service)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FaCheckCircle /> Mark Complete
                                            </motion.button>
                                        )}

                                        {service.status === "Completed" && (
                                            <div className="completed-badge">
                                                ✅ Completed
                                                {service.rating && <span> • ⭐ {service.rating}/5</span>}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}

            {/* Completion Modal */}
            {showCompletionModal && (
                <CompletionModal
                    service={selectedService}
                    onClose={() => setShowCompletionModal(false)}
                    onSubmit={handleCompletionSubmit}
                />
            )}
        </div>
    );
};

export default ServiceList;

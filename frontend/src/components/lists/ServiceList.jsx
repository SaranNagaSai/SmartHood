import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone, FaMapMarkerAlt, FaClock, FaUser, FaHeart, FaCheckCircle } from "react-icons/fa";
import API from "../../services/api";
import CompletionModal from "../modals/CompletionModal";
import Button from "../ui/Button";
import useToast from "../../hooks/useToast";

const MotionButton = motion.create(Button);

const ServiceList = () => {
    const { addToast } = useToast();
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

                addToast(
                    `Interest registered! Contact: ${response.data.data.requesterPhone} (ID: ${response.data.data.requesterUniqueId})`,
                    { type: "success" }
                );

                // Refresh list
                fetchServices();
            }
        } catch (error) {
            console.error("Error showing interest:", error);
            addToast(error.response?.data?.message || "Failed to show interest", { type: "error" });
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
                addToast("Service marked as completed! Revenue tracking updated.", { type: "success" });
                setShowCompletionModal(false);
                fetchServices();
            }
        } catch (error) {
            console.error("Error marking complete:", error);
            addToast(error.response?.data?.message || "Failed to mark complete", { type: "error" });
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
        <div className="card">
            <div className="card-header">
                <div className="card-header-title">🛎️ Service Requests</div>

                {/* Filter Tabs */}
                <div className="btn-group" role="tablist" aria-label="Service filters">
                    <Button
                        type="button"
                        size="sm"
                        variant={filter === "open" ? "primary" : "secondary"}
                        aria-pressed={filter === "open"}
                        onClick={() => setFilter("open")}
                    >
                        Open
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={filter === "interested" ? "primary" : "secondary"}
                        aria-pressed={filter === "interested"}
                        onClick={() => setFilter("interested")}
                    >
                        Interested
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={filter === "completed" ? "primary" : "secondary"}
                        aria-pressed={filter === "completed"}
                        onClick={() => setFilter("completed")}
                    >
                        Completed
                    </Button>
                </div>
            </div>

            <div className="card-body">
                {services.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon" aria-hidden="true">
                            <FaHeart />
                        </div>
                        <h3 className="empty-state-title">No services found</h3>
                        <p className="empty-state-description">No {filter} services found in your locality right now.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="services-grid">
                            {services.map((service) => {
                                const isMyRequest = service.requesterId?._id === JSON.parse(localStorage.getItem("userInfo"))?._id;
                                const phoneRevealed = revealedPhones[service._id];

                                const typeClass = service.type?.toLowerCase() === 'offer' ? 'offer' : 'request';

                                return (
                                    <motion.div
                                        key={service._id}
                                        className="service-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <div className="service-card-header">
                                            <div className="service-card-top">
                                                <span className="service-category">{service.category}</span>
                                                <span className={`service-type-badge ${typeClass}`}>{service.type}</span>
                                            </div>
                                            <h3 className="service-title">{service.title}</h3>
                                            <p className="service-description">{service.description}</p>
                                        </div>

                                        <div className="service-card-body">
                                            <div className="service-requester">
                                                <div className="avatar avatar-md">
                                                    {service.requesterId?.name?.[0] || 'U'}
                                                </div>
                                                <div className="service-requester-info">
                                                    <div className="service-requester-name">
                                                        {service.requesterId?.name || "Community Member"}
                                                    </div>
                                                    <div className="service-requester-meta">
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                            <FaMapMarkerAlt /> {service.locality}
                                                        </span>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                            <FaClock /> {formatDate(service.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {phoneRevealed && (
                                                <div style={{ marginTop: 'var(--space-4)' }}>
                                                    <span className="badge badge-info">
                                                        <FaPhone /> {phoneRevealed.requesterPhone} • 🆔 {phoneRevealed.requesterUniqueId}
                                                    </span>
                                                </div>
                                            )}

                                            {service.interestedUsers && service.interestedUsers.length > 0 && (
                                                <div style={{ marginTop: 'var(--space-3)' }}>
                                                    <span className="badge badge-error">
                                                        <FaHeart /> {service.interestedUsers.length} interested
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="service-card-footer">
                                            {!isMyRequest && service.status === "Open" && (
                                                <MotionButton
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleShowInterest(service._id)}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <FaHeart /> I'm Interested
                                                </MotionButton>
                                            )}

                                            {isMyRequest && service.status !== "Completed" && (
                                                <MotionButton
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleMarkComplete(service)}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <FaCheckCircle /> Mark Complete
                                                </MotionButton>
                                            )}

                                            {service.status === "Completed" && (
                                                <span className="badge badge-success">
                                                    ✅ Completed{service.rating ? ` • ⭐ ${service.rating}/5` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </div>

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

import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import { AuthContext } from "../context/AuthContext";
import RatingModal from "../components/common/RatingModal";
import ServiceCompletionModal from "../components/common/ServiceCompletionModal";
import API from "../services/api";
import {
    FaAward, FaHistory, FaHandHoldingHeart, FaExclamationCircle,
    FaStar, FaCheck, FaClock, FaSpinner
} from "react-icons/fa";
import "./Activity.css";

export default function Activity() {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [activities, setActivities] = useState({ services: [], emergencies: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('services');

    // Modals
    const [selectedService, setSelectedService] = useState(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        try {
            const { data } = await API.get("/auth/my-activity");
            // Mock data for demo
            setActivities(data?.data || { services: [], emergencies: [] });
        } catch (error) {
            console.error("Error fetching activity", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = (service) => {
        setSelectedService(service);
        setShowCompletionModal(true);
    };

    const handleRateService = (service) => {
        setSelectedService(service);
        setShowRatingModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Open': { color: '#3b82f6', icon: FaClock },
            'InProgress': { color: '#f59e0b', icon: FaSpinner },
            'Completed': { color: '#10b981', icon: FaCheck }
        };
        const config = statusConfig[status] || statusConfig['Open'];
        return (
            <span className="status-badge" style={{ background: `${config.color}15`, color: config.color }}>
                <config.icon /> {status}
            </span>
        );
    };

    const isProvider = (service) => service?.providerId?._id === user?._id;

    return (
        <div className="activity-layout">
            <Navbar />
            <div className="activity-container">
                {/* User Profile Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="user-profile-summary glass"
                >
                    <div className="user-avatar-big">{user?.name?.[0]}</div>
                    <div className="user-details">
                        <h2>{user?.name}</h2>
                        <p className="gradient-text">{user?.professionCategory} | {user?.locality}</p>
                    </div>
                    <div className="impact-badge glass">
                        <FaAward size={30} color="#f59e0b" />
                        <div>
                            <h3>Impact Score</h3>
                            <div className="impact-score-big">{user?.impactScore || 0}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="activity-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <FaHandHoldingHeart /> My Services
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'emergencies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emergencies')}
                    >
                        <FaExclamationCircle /> My Emergencies
                    </button>
                </div>

                {/* Content */}
                <div className="activity-content glass">
                    {loading ? (
                        <div className="loader-container">
                            <div className="premium-spinner"></div>
                        </div>
                    ) : activeTab === 'services' ? (
                        <div className="activity-list">
                            {activities.services.length > 0 ? (
                                activities.services.map(s => (
                                    <motion.div
                                        key={s._id}
                                        whileHover={{ x: 5 }}
                                        className="activity-item"
                                    >
                                        <div className="item-header">
                                            <strong>{s.category}</strong>
                                            <div className="badges">
                                                <span className={`type-badge badge-${s.type?.toLowerCase()}`}>
                                                    {s.type}
                                                </span>
                                                {getStatusBadge(s.status)}
                                            </div>
                                        </div>
                                        <p>{s.description}</p>
                                        <div className="item-meta">
                                            <small>{new Date(s.createdAt).toLocaleDateString()}</small>
                                            {s.providerId && !isProvider(s) && (
                                                <small>Provider: {s.providerId.name}</small>
                                            )}
                                            {s.requesterId && isProvider(s) && (
                                                <small>Requester: {s.requesterId.name}</small>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="item-actions">
                                            {s.status === 'InProgress' && (
                                                <button
                                                    className="btn-action complete"
                                                    onClick={() => handleMarkComplete(s)}
                                                >
                                                    <FaCheck /> Mark Complete
                                                </button>
                                            )}
                                            {s.status === 'Completed' && !s.isRated && !isProvider(s) && (
                                                <button
                                                    className="btn-action rate"
                                                    onClick={() => handleRateService(s)}
                                                >
                                                    <FaStar /> Rate Service
                                                </button>
                                            )}
                                            {s.isRated && (
                                                <span className="rated-badge">
                                                    <FaStar color="#f59e0b" /> Rated {s.rating}/5
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="empty-state">No services posted yet.</div>
                            )}
                        </div>
                    ) : (
                        <div className="activity-list">
                            {activities.emergencies.length > 0 ? (
                                activities.emergencies.map(e => (
                                    <motion.div
                                        key={e._id}
                                        whileHover={{ x: 5 }}
                                        className="activity-item emergency"
                                    >
                                        <div className="item-header">
                                            <strong>{e.type}</strong>
                                            <span className={`status-badge ${e.status?.toLowerCase()}`}>
                                                {e.status}
                                            </span>
                                        </div>
                                        <p>{e.description}</p>
                                        <small>{new Date(e.createdAt).toLocaleDateString()}</small>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="empty-state">No emergency reports.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ServiceCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                service={selectedService}
                isProvider={isProvider(selectedService)}
                onSuccess={fetchActivity}
                onRatingOpen={() => setShowRatingModal(true)}
            />

            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                serviceId={selectedService?._id}
                providerId={selectedService?.providerId?._id}
                providerName={selectedService?.providerId?.name}
                onSuccess={fetchActivity}
            />
        </div>
    );
}

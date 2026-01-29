import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import { getUserProfile, updateUserProfile } from '../services/userService';
import useSpeechInput from '../hooks/useSpeechToText';
import { FaMicrophone, FaSave, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaBriefcase, FaLanguage, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import API from "../services/api";
import './Profile.css';
import './RevenueStyles.css';

const Profile = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [originalLocality, setOriginalLocality] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showLocalityWarning, setShowLocalityWarning] = useState(false);

    // Hooks must be called at the top level
    const {
        isListening: isNameListening,
        startListening: startNameListening,
        stopListening: stopNameListening,
        transcript: nameTranscript
    } = useSpeechInput(val => setUser(prev => ({ ...prev, name: val })));

    const {
        isListening: isProfessionListening,
        startListening: startProfessionListening,
        stopListening: stopProfessionListening,
        transcript: professionTranscript
    } = useSpeechInput(val => setUser(prev => ({ ...prev, profession: val })));

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile();
                setUser(data);
                setOriginalLocality(data?.locality);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile", error);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (key, val) => {
        setUser(prev => ({ ...prev, [key]: val }));

        // Check if locality is being changed
        if (key === 'locality') {
            if (val !== originalLocality) {
                setShowLocalityWarning(true);
            } else {
                setShowLocalityWarning(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If locality changed, confirm with user
        if (showLocalityWarning) {
            const confirmed = window.confirm(
                "Changing your locality will:\n• Update your notification scope\n• Change your default feed\n• Reassign you to the new community\n\nProceed with the change?"
            );
            if (!confirmed) return;
        }

        try {
            await updateUserProfile(user);
            setOriginalLocality(user?.locality);
            setShowLocalityWarning(false);
            setMessage(t("profile_updated"));
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage(t("profile_update_error"));
        }
    };

    if (loading) return <div className="loader-container"><div className="premium-spinner"></div></div>;

    return (
        <div className="profile-layout">
            <Navbar />

            <div className="profile-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="profile-card"
                >
                    <div className="profile-header">
                        <div className="avatar-section">
                            <div className="profile-avatar">
                                {user?.name?.[0]?.toUpperCase() || <FaUser />}
                            </div>
                            <div className="unique-id-badge">ID: {user?._id?.slice(-6).toUpperCase() || 'SH-123'}</div>
                            <h2>{t("user_profile")}</h2>
                            <div className="profile-stats-row">
                                <div className="stat-badge"><FaStar /> {user?.impactScore || 0} Impact</div>
                                <div className="stat-badge"><FaBriefcase /> {user?.profession || 'Member'}</div>
                            </div>
                        </div>
                    </div>

                    {message && <div className="alert-message">{message}</div>}

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label><FaUser /> {t("name")}</label>
                            <div className="input-with-voice">
                                <input
                                    name="name"
                                    value={user?.name || ''}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Enter your name"
                                />
                                <button
                                    type="button"
                                    onClick={isNameListening ? stopNameListening : startNameListening}
                                    className={`mic-icon-btn ${isNameListening ? 'active' : ''}`}
                                >
                                    <FaMicrophone />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FaPhoneAlt /> {t("phone")}</label>
                            <input name="phone" value={user?.phone || ''} disabled className="disabled-input" />
                        </div>

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <div className="form-group">
                                <label><FaMapMarkerAlt /> {t("locality")}</label>
                                <input
                                    name="locality"
                                    value={user?.locality || ''}
                                    onChange={(e) => handleChange("locality", e.target.value)}
                                    className={showLocalityWarning ? 'warning-input' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label><FaMapMarkerAlt /> {t("city")}</label>
                                <input
                                    name="city"
                                    value={user?.city || ''}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                />
                            </div>
                        </div>

                        {showLocalityWarning && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="locality-warning"
                            >
                                <FaExclamationTriangle color="#f59e0b" />
                                <div>
                                    <strong>{t("address_change_title") || "Address Change Detected"}</strong>
                                    <p>{t("address_change_desc") || "Changing your locality will update your community scope."}</p>
                                </div>
                            </motion.div>
                        )}

                        <div className="form-group">
                            <label><FaBriefcase /> {t("profession")}</label>
                            <div className="input-with-voice">
                                <input
                                    name="profession"
                                    value={user?.profession || ''}
                                    onChange={(e) => handleChange("profession", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={isProfessionListening ? stopProfessionListening : startProfessionListening}
                                    className={`mic-icon-btn ${isProfessionListening ? 'active' : ''}`}
                                >
                                    <FaMicrophone />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FaLanguage /> {t("preferred_language")}</label>
                            <select
                                name="preferredLanguage"
                                value={user?.preferredLanguage || 'en'}
                                onChange={(e) => handleChange("preferredLanguage", e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="te">తెలుగు</option>
                            </select>
                        </div>

                        <div className="profile-actions">
                            <button type="submit" className="btn-premium">
                                <FaSave /> {t("save_changes")}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;

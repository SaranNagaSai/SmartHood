import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import useSpeechInput from "../hooks/useSpeechToText";
import API from "../services/api";
import { FaMicrophone, FaClipboardList, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import "./Complaints.css";

export default function Complaints() {
    const { t } = useTranslation();
    const [data, setData] = useState({ title: "", description: "" });
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const { data } = await API.get("/complaints");
            setComplaints(data.data || []);
        } catch (error) {
            console.error("Error fetching complaints", error);
        }
    };

    const speakDesc = useSpeechInput((val) => setData({ ...data, description: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await API.post("/complaints", data);
            alert(t("complaint_success"));
            setData({ title: "", description: "" });
            fetchComplaints();
        } catch (error) {
            alert(t("complaint_error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="complaints-layout">
            <Navbar />
            <div className="complaints-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="complaint-form-card"
                >
                    <h2 className="gradient-text"><FaClipboardList /> {t("nav_activity")}</h2>
                    <form onSubmit={handleSubmit} className="complaint-form">
                        <input
                            className="complaint-input"
                            placeholder={t("subject_placeholder")}
                            value={data.title}
                            onChange={e => setData({ ...data, title: e.target.value })}
                            required
                        />
                        <div className="voice-input-wrapper">
                            <textarea
                                className="complaint-textarea"
                                placeholder={t("detailed_description")}
                                value={data.description}
                                onChange={e => setData({ ...data, description: e.target.value })}
                                required
                            />
                            <button type="button" onClick={speakDesc} className="complaint-mic-btn"><FaMicrophone /></button>
                        </div>
                        <button type="submit" disabled={loading} className="btn-premium">
                            {loading ? t("submitting") : t("submit_complaint")}
                        </button>
                    </form>
                </motion.div>

                <div className="submissions-section">
                    <h3>{t("previous_submissions")}</h3>
                    <div className="complaint-list">
                        {complaints.length > 0 ? (
                            complaints.map(c => (
                                <motion.div
                                    key={c._id}
                                    whileHover={{ y: -5 }}
                                    className="complaint-card"
                                >
                                    <div className="complaint-card-header">
                                        <h4>{c.title}</h4>
                                        <span className={`status-pills ${c.status === 'Resolved' ? 'status-resolved' : 'status-pending'}`}>
                                            {c.status === 'Resolved' ? <FaCheckCircle /> : <FaHourglassHalf />} {c.status}
                                        </span>
                                    </div>
                                    <p>{c.description}</p>
                                    <small>{new Date(c.createdAt).toLocaleDateString()}</small>
                                </motion.div>
                            ))
                        ) : (
                            <div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}>
                                {t("no_complaints")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

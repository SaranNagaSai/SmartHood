import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import PageHeader from "../components/layout/PageHeader";
import useSpeechInput from "../hooks/useSpeechToText";
import API from "../services/api";
import { FaMicrophone, FaClipboardList, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import TextAreaField from "../components/ui/TextAreaField";
import useToast from "../hooks/useToast";

export default function Complaints() {
    const { t } = useTranslation();
    const { addToast } = useToast();
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
            addToast(t("complaint_success", { defaultValue: "Complaint submitted" }), { type: "success" });
            setData({ title: "", description: "" });
            fetchComplaints();
        } catch (error) {
            addToast(t("complaint_error", { defaultValue: "Failed to submit complaint" }), { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader title={t("nav_activity")} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="complaint-form-card"
                >
                    <h2 className="gradient-text"><FaClipboardList /> {t("nav_activity")}</h2>
                    <form onSubmit={handleSubmit} className="complaint-form">
                        <TextField
                            placeholder={t("subject_placeholder")}
                            value={data.title}
                            onChange={e => setData({ ...data, title: e.target.value })}
                            required
                        />
                        <div className="voice-input-wrapper">
                            <TextAreaField
                                placeholder={t("detailed_description")}
                                value={data.description}
                                onChange={e => setData({ ...data, description: e.target.value })}
                                required
                                rows={4}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="btn-icon"
                                onClick={speakDesc}
                                aria-label={t("voice_input") || "Voice input"}
                            >
                                <FaMicrophone />
                            </Button>
                        </div>
                        <Button type="submit" loading={loading} block>
                            {loading ? t("submitting") : t("submit_complaint")}
                        </Button>
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
        </>
    );
}

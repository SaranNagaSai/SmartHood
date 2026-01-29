import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import useSpeechInput from "../../hooks/useSpeechToText";
import API from "../../services/api";
import { FaMicrophone, FaHandHoldingHeart, FaSearch } from "react-icons/fa";

export default function ServiceForm({ onSuccess }) {
    const { t } = useTranslation();
    const [data, setData] = useState({
        type: "Request", // Request or Offer
        category: "",
        description: "",
        reach: "Locality"
    });
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const set = (key) => (val) => setData({ ...data, [key]: val });

    const speakDesc = useSpeechInput((val) => {
        set("description")(val);
        setShowPreview(true);
    });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            setLoading(true);
            await API.post("/services", data);
            alert("Service post created successfully!");
            if (onSuccess) onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to post service");
        } finally {
            setLoading(false);
            setShowPreview(false);
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.toggleRow}>
                <button
                    style={data.type === 'Request' ? styles.activeToggle : styles.toggle}
                    onClick={() => set("type")("Request")}
                >
                    <FaSearch /> {t("form_request_service")}
                </button>
                <button
                    style={data.type === 'Offer' ? styles.activeToggle : styles.toggle}
                    onClick={() => set("type")("Offer")}
                >
                    <FaHandHoldingHeart /> {t("form_offer_service")}
                </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    style={styles.input}
                    placeholder={t("form_category_placeholder")}
                    value={data.category}
                    onChange={(e) => set("category")(e.target.value)}
                    required
                />

                <div style={styles.voiceRow}>
                    <textarea
                        style={styles.textarea}
                        placeholder={data.type === 'Request' ? t("form_request_q") : t("form_offer_q")}
                        value={data.description}
                        onChange={(e) => set("description")(e.target.value)}
                        required
                    />
                    <button type="button" onClick={speakDesc} style={styles.micBtn}>
                        <FaMicrophone />
                    </button>
                </div>

                <div style={styles.reachRow}>
                    <span>{t("form_visibility")}</span>
                    <select
                        style={styles.smallInput}
                        value={data.reach}
                        onChange={(e) => set("reach")(e.target.value)}
                    >
                        <option>{t("locality")}</option>
                        <option>Everyone</option>
                        <option>Targeted</option>
                    </select>
                </div>

                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            style={styles.previewBox}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <p><strong>{t("form_voice_preview")}</strong> {data.description}</p>
                            <div style={styles.previewActions}>
                                <button type="button" onClick={() => setShowPreview(false)} style={styles.editBtn}>{t("form_keep_editing")}</button>
                                <button type="button" onClick={handleSubmit} style={styles.confirmBtn}>{t("form_post_now")}</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? t("form_posting") : t("form_post_service")}
                </button>
            </form>
        </div>
    );
}

const styles = {
    card: {
        background: "#fff",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        margin: "0 auto"
    },
    toggleRow: {
        display: "flex",
        background: "#f1f5f9",
        padding: "4px",
        borderRadius: "10px",
        marginBottom: "20px"
    },
    toggle: {
        flex: 1,
        padding: "10px",
        border: "none",
        background: "transparent",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
    },
    activeToggle: {
        flex: 1,
        padding: "10px",
        border: "none",
        background: "#fff",
        color: "#2563eb",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "1rem"
    },
    voiceRow: {
        display: "flex",
        gap: "10px",
        alignItems: "flex-start"
    },
    textarea: {
        flex: 1,
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        minHeight: "100px",
        fontSize: "1rem",
        resize: "none"
    },
    micBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    reachRow: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        fontSize: "0.95rem"
    },
    smallInput: {
        padding: "6px",
        borderRadius: "6px",
        border: "1px solid #d1d5db"
    },
    previewBox: {
        background: "#eff6ff",
        padding: "15px",
        borderRadius: "8px",
        border: "1px dashed #2563eb"
    },
    previewActions: {
        display: "flex",
        gap: "10px",
        marginTop: "10px"
    },
    editBtn: {
        padding: "6px 12px",
        background: "#e5e7eb",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    confirmBtn: {
        padding: "6px 12px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    submitBtn: {
        padding: "14px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "1rem",
        cursor: "pointer",
        marginTop: "10px"
    }
};

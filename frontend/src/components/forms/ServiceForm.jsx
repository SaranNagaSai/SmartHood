import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import useSpeechInput from "../../hooks/useSpeechToText";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaHandHoldingHeart, FaSearch } from "react-icons/fa";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import TextAreaField from "../ui/TextAreaField";
import SelectField from "../ui/SelectField";
import useToast from "../../hooks/useToast";

export default function ServiceForm({ onSuccess }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToast } = useToast();
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
            addToast("Service post created successfully!", { type: "success" });
            if (onSuccess) onSuccess();
        } catch (error) {
            const code = error.response?.data?.error?.code;
            if (code === "PROFILE_INCOMPLETE") {
                addToast("Profile incomplete. Please complete your location details in Profile.", { type: "error" });
                navigate("/profile");
                return;
            }

            addToast(error.response?.data?.message || "Failed to post service", { type: "error" });
        } finally {
            setLoading(false);
            setShowPreview(false);
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.toggleRow}>
                <Button
                    type="button"
                    variant="ghost"
                    style={data.type === 'Request' ? styles.activeToggle : styles.toggle}
                    onClick={() => set("type")("Request")}
                >
                    <FaSearch /> {t("form_request_service")}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    style={data.type === 'Offer' ? styles.activeToggle : styles.toggle}
                    onClick={() => set("type")("Offer")}
                >
                    <FaHandHoldingHeart /> {t("form_offer_service")}
                </Button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <TextField
                    inputClassName=""
                    style={styles.input}
                    placeholder={t("form_category_placeholder")}
                    value={data.category}
                    onChange={(e) => set("category")(e.target.value)}
                    required
                />

                <div style={styles.voiceRow}>
                    <TextAreaField
                        textareaClassName=""
                        style={styles.textarea}
                        placeholder={data.type === 'Request' ? t("form_request_q") : t("form_offer_q")}
                        value={data.description}
                        onChange={(e) => set("description")(e.target.value)}
                        required
                    />
                    <Button type="button" variant="ghost" onClick={speakDesc} style={styles.micBtn} aria-label="Voice input">
                        <FaMicrophone />
                    </Button>
                </div>

                <div style={styles.reachRow}>
                    <span>{t("form_visibility")}</span>
                    <SelectField
                        selectClassName=""
                        style={styles.smallInput}
                        value={data.reach}
                        onChange={(e) => set("reach")(e.target.value)}
                    >
                        <option>{t("locality")}</option>
                        <option>Everyone</option>
                        <option>Targeted</option>
                    </SelectField>
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
                                <Button type="button" variant="ghost" onClick={() => setShowPreview(false)} style={styles.editBtn}>
                                    {t("form_keep_editing")}
                                </Button>
                                <Button type="button" variant="ghost" onClick={handleSubmit} style={styles.confirmBtn}>
                                    {t("form_post_now")}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button type="submit" variant="ghost" disabled={loading} loading={loading} style={styles.submitBtn}>
                    {t("form_post_service")}
                </Button>
            </form>
        </div>
    );
}

const styles = {
    card: {
        background: "var(--surface-primary)",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        margin: "0 auto"
    },
    toggleRow: {
        display: "flex",
        background: "var(--bg-tertiary)",
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
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
    },
    activeToggle: {
        flex: 1,
        padding: "10px",
        border: "none",
        background: "var(--surface-primary)",
        color: "var(--text-link)",
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
        border: "1px solid var(--border-primary)",
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
        border: "1px solid var(--border-primary)",
        minHeight: "100px",
        fontSize: "1rem",
        resize: "none"
    },
    micBtn: {
        background: "var(--color-primary-600)",
        color: "var(--text-inverse)",
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
        border: "1px solid var(--border-primary)"
    },
    previewBox: {
        background: "var(--bg-brand-subtle)",
        padding: "15px",
        borderRadius: "8px",
        border: "1px dashed var(--color-primary-600)"
    },
    previewActions: {
        display: "flex",
        gap: "10px",
        marginTop: "10px"
    },
    editBtn: {
        padding: "6px 12px",
        background: "var(--color-neutral-200)",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    confirmBtn: {
        padding: "6px 12px",
        background: "var(--color-primary-600)",
        color: "var(--text-inverse)",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },
    submitBtn: {
        padding: "14px",
        background: "var(--color-primary-600)",
        color: "var(--text-inverse)",
        border: "none",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "1rem",
        cursor: "pointer",
        marginTop: "10px"
    }
};

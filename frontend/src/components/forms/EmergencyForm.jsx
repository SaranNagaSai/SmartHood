import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import useSpeechInput from "../../hooks/useSpeechToText";
import API from "../../services/api";
import { FaMicrophone, FaExclamationCircle } from "react-icons/fa";

export default function EmergencyForm({ onSuccess }) {
  const { t } = useTranslation();
  const [data, setData] = useState({
    type: "",
    description: "",
    priority: "Medium",
    contactNumber: ""
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
      await API.post("/emergencies", data);
      alert("Emergency alert sent successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send alert");
    } finally {
      setLoading(false);
      setShowPreview(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}><FaExclamationCircle /> {t("form_report_emergency")}</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <select
          style={styles.input}
          value={data.type}
          onChange={(e) => set("type")(e.target.value)}
          required
        >
          <option value="">{t("form_select_type")}</option>
          <option>Blood Donation</option>
          <option>Medical</option>
          <option>Accident</option>
          <option>Fire & Safety</option>
          <option>Missing Person</option>
          <option>Natural Disaster</option>
          <option>Custom</option>
        </select>

        <div style={styles.voiceRow}>
          <textarea
            style={styles.textarea}
            placeholder={t("form_desc_placeholder")}
            value={data.description}
            onChange={(e) => set("description")(e.target.value)}
            required
          />
          <button type="button" onClick={speakDesc} style={styles.micBtn}>
            <FaMicrophone />
          </button>
        </div>

        <div style={styles.priorityRow}>
          <span>{t("form_priority")}:</span>
          {['Low', 'Medium', 'High'].map(p => (
            <label key={p} style={styles.radioLabel}>
              <input
                type="radio"
                name="priority"
                value={p}
                checked={data.priority === p}
                onChange={() => set("priority")(p)}
              /> {p}
            </label>
          ))}
        </div>

        <input
          style={styles.input}
          placeholder={t("form_contact_placeholder")}
          value={data.contactNumber}
          onChange={(e) => set("contactNumber")(e.target.value)}
          required
        />

        <AnimatePresence>
          {showPreview && (
            <motion.div
              style={styles.previewBox}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p><strong>{t("form_voice_preview")}</strong> {data.description}</p>
              <small>You can edit the text above if it's incorrect.</small>
              <div style={styles.previewActions}>
                <button type="button" onClick={() => setShowPreview(false)} style={styles.editBtn}>{t("form_keep_editing")}</button>
                <button type="button" onClick={handleSubmit} style={styles.confirmBtn}>{t("form_confirm_send")}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? t("form_sending") : t("form_send_alert")}
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
  title: {
    margin: "0 0 20px 0",
    color: "#ef4444",
    display: "flex",
    alignItems: "center",
    gap: "10px"
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
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  priorityRow: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    fontSize: "0.95rem"
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer"
  },
  previewBox: {
    background: "#fdf2f2",
    padding: "15px",
    borderRadius: "8px",
    border: "1px dashed #ef4444"
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
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  submitBtn: {
    padding: "14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "10px"
  }
};

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import useSpeechInput from "../../hooks/useSpeechToText";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaExclamationCircle } from "react-icons/fa";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import useToast from "../../hooks/useToast";

export default function EmergencyForm({ onSuccess }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      addToast("Emergency alert sent successfully!", { type: "success" });
      if (onSuccess) onSuccess();
    } catch (error) {
      const code = error.response?.data?.error?.code;
      if (code === "PROFILE_INCOMPLETE") {
        addToast("Profile incomplete. Please complete your location details in Profile.", { type: "error" });
        navigate("/profile");
        return;
      }

      addToast(error.response?.data?.message || "Failed to send alert", { type: "error" });
    } finally {
      setLoading(false);
      setShowPreview(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}><FaExclamationCircle /> {t("form_report_emergency")}</h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <SelectField
          selectClassName=""
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
        </SelectField>

        <div style={styles.voiceRow}>
          <TextAreaField
            textareaClassName=""
            style={styles.textarea}
            placeholder={t("form_desc_placeholder")}
            value={data.description}
            onChange={(e) => set("description")(e.target.value)}
            required
          />
          <Button type="button" variant="ghost" onClick={speakDesc} style={styles.micBtn} aria-label="Voice input">
            <FaMicrophone />
          </Button>
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

        <TextField
          inputClassName=""
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
                <Button type="button" variant="ghost" onClick={() => setShowPreview(false)} style={styles.editBtn}>
                  {t("form_keep_editing")}
                </Button>
                <Button type="button" variant="ghost" onClick={handleSubmit} style={styles.confirmBtn}>
                  {t("form_confirm_send")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" variant="ghost" disabled={loading} loading={loading} style={styles.submitBtn}>
          {t("form_send_alert")}
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
  title: {
    margin: "0 0 20px 0",
    color: "var(--color-error-600)",
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
    background: "var(--color-error-500)",
    color: "var(--text-inverse)",
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
    background: "var(--color-error-50)",
    padding: "15px",
    borderRadius: "8px",
    border: "1px dashed var(--color-error-500)"
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
    background: "var(--color-error-500)",
    color: "var(--text-inverse)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  submitBtn: {
    padding: "14px",
    background: "var(--color-error-500)",
    color: "var(--text-inverse)",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "10px"
  }
};

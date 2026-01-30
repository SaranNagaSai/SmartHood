import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaPaperPlane, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import useSpeechInput from "../../hooks/useSpeechToText";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import TextAreaField from "../ui/TextAreaField";
import SelectField from "../ui/SelectField";

const ServiceRequestForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "Request", // Request or Offer
    category: "",
    title: "",
    description: "",
    voiceNote: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const categories = [
    "Professional",
    "Education",
    "Healthcare",
    "Emergency",
    "Community",
    "Other"
  ];

  const { isListening, startListening, stopListening } = useSpeechInput(
    (val) => setFormData(prev => ({ ...prev, description: val }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/services", formData);

      if (response.data.success) {
        setMessage("✅ Service request posted successfully!");
        setFormData({
          type: "Request",
          category: "",
          title: "",
          description: "",
          voiceNote: ""
        });

        if (onSuccess) onSuccess(response.data.data);

        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error creating service:", error);
      const code = error.response?.data?.error?.code;
      if (code === "PROFILE_INCOMPLETE") {
        setMessage("❌ Profile incomplete. Please complete your location details in Profile.");
        setTimeout(() => navigate("/profile"), 800);
        return;
      }

      setMessage("❌ " + (error.response?.data?.message || "Failed to post service"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-header">
        <div className="card-header-title">
          {formData.type === "Request" ? "🙋 Request a Service" : "🤝 Offer a Service"}
        </div>

        <div className="btn-group" role="tablist" aria-label="Service type">
          <Button
            type="button"
            size="sm"
            variant={formData.type === "Request" ? "primary" : "secondary"}
            aria-pressed={formData.type === "Request"}
            onClick={() => setFormData({ ...formData, type: "Request" })}
          >
            Request
          </Button>
          <Button
            type="button"
            size="sm"
            variant={formData.type === "Offer" ? "primary" : "secondary"}
            aria-pressed={formData.type === "Offer"}
            onClick={() => setFormData({ ...formData, type: "Offer" })}
          >
            Offer
          </Button>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit} className="service-form">

        {/* Category Selection */}
        <div className="form-group">
          <label>Category *</label>
          <SelectField
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </SelectField>
        </div>

        {/* Title */}
        <div className="form-group">
          <label>Title *</label>
          <TextField
            type="text"
            placeholder="e.g., Need a plumber for bathroom repair"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* Description with Voice Input */}
        <div className="form-group">
          <label>Description *</label>
          <div className="textarea-with-voice">
            <TextAreaField
              placeholder="Describe your requirement in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
            />
            <Button
              type="button"
              className={`voice-btn ${isListening ? "listening" : ""}`}
              variant="ghost"
              onClick={isListening ? stopListening : startListening}
              aria-pressed={isListening}
            >
              <FaMicrophone />
              {isListening && <span className="pulse-dot"></span>}
            </Button>
          </div>
          {isListening && <p className="listening-text">🎤 Listening...</p>}
        </div>

        {/* Location Info (Auto-filled) */}
        <div>
          <span className="badge badge-secondary">
            <FaMapMarkerAlt /> Visible to users in your locality
          </span>
        </div>

        {message && (
          <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-error"}`} role="status">
            <div className="alert-content">
              <div className="alert-description">{message}</div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          block
          disabled={loading}
          loading={loading}
          leftIcon={<FaPaperPlane />}
        >
          Post {formData.type}
        </Button>
      </form>
      </div>
    </motion.div>
  );
};

export default ServiceRequestForm;

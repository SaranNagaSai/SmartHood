import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaPaperPlane, FaMapMarkerAlt } from "react-icons/fa";
import API from "../../services/api";
import useSpeechInput from "../../hooks/useSpeechToText";
import "./ServiceRequestForm.css";

const ServiceRequestForm = ({ onSuccess }) => {
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
      setMessage("❌ " + (error.response?.data?.message || "Failed to post service"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="service-request-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="form-title">
        {formData.type === "Request" ? "🙋 Request a Service" : "🤝 Offer a Service"}
      </h3>

      <form onSubmit={handleSubmit} className="service-form">
        {/* Type Toggle */}
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn ${formData.type === "Request" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, type: "Request" })}
          >
            Request Service
          </button>
          <button
            type="button"
            className={`toggle-btn ${formData.type === "Offer" ? "active" : ""}`}
            onClick={() => setFormData({ ...formData, type: "Offer" })}
          >
            Offer Service
          </button>
        </div>

        {/* Category Selection */}
        <div className="form-group">
          <label>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="form-group">
          <label>Title *</label>
          <input
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
            <textarea
              placeholder="Describe your requirement in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
            />
            <button
              type="button"
              className={`voice-btn ${isListening ? "listening" : ""}`}
              onClick={isListening ? stopListening : startListening}
            >
              <FaMicrophone />
              {isListening && <span className="pulse-dot"></span>}
            </button>
          </div>
          {isListening && <p className="listening-text">🎤 Listening...</p>}
        </div>

        {/* Location Info (Auto-filled) */}
        <div className="location-info">
          <FaMapMarkerAlt /> Your request will be visible to users in your locality
        </div>

        {message && (
          <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <motion.button
          type="submit"
          className="submit-btn"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "Posting..." : (
            <>
              <FaPaperPlane /> Post {formData.type}
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ServiceRequestForm;

import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import useSpeechInput from "../hooks/useSpeechToText";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { FaPhoneAlt, FaUser, FaMicrophone, FaSignInAlt } from "react-icons/fa";
import "./Login.css";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const speakPhone = useSpeechInput(setPhone);
  const speakUsername = useSpeechInput(setUsername);

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (/^\d{0,10}$/.test(val)) setPhone(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return alert("Please enter a valid 10-digit phone number");

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { phone, username });
      login(data.data);
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <Navbar />
      <div className="login-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="login-card"
        >
          <h1>{t("login_welcome")}</h1>
          <p className="subtitle">{t("login_subtitle")}</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group glass">
              <FaPhoneAlt className="input-icon" />
              <input
                type="text"
                placeholder={t("login_phone_placeholder")}
                value={phone}
                onChange={handlePhoneChange}
                required
              />
              <button type="button" onClick={speakPhone} className="mic-btn"><FaMicrophone /></button>
            </div>

            <div className="input-group glass">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <button type="button" onClick={speakUsername} className="mic-btn"><FaMicrophone /></button>
            </div>

            <button type="submit" className="btn-premium wide" disabled={loading}>
              {loading ? t("form_sending") : t("login_button")} <FaSignInAlt />
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Create one here</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;

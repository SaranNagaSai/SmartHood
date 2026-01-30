import React, { useState, useContext } from "react";
import { motion } from "framer-motion";

import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { FaUser, FaPhoneAlt, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import useToast from "../hooks/useToast";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const username = String(formData.username || "").trim();
      const email = String(formData.email || "").trim();
      const phone = String(formData.phone || "").trim();
      const password = formData.password;

      const hasEmail = Boolean(email);
      const hasPhone = Boolean(phone);

      if (!username || !password) {
        addToast("Username and password are required.", { type: "error" });
        return;
      }

      if (!hasEmail && !hasPhone) {
        addToast("Please provide at least one identifier: Email and/or Phone.", { type: "error" });
        return;
      }

      const payload = {
        username,
        password,
        ...(hasEmail ? { email } : {}),
        ...(hasPhone ? { phone } : {}),
      };

      const { data } = await API.post("/auth/register", payload);

      if (data.success) {
        login(data.data);
        navigate("/home");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      addToast(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="auth-card"
        >
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-text">SmartHood</span>
            </div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join SmartHood community today</p>
          </div>

          <div className="auth-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <TextField
                  name="username"
                  label="Username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  leftIcon={<FaUser />}
                  required
                />
                <TextField
                  type="tel"
                  name="phone"
                  label="Phone (optional)"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  leftIcon={<FaPhoneAlt />}
                  maxLength={10}
                />
              </div>

              <TextField
                type="email"
                name="email"
                label="Email (optional)"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<FaEnvelope />}
              />

              <TextField
                type="password"
                name="password"
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<FaLock />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                block
                loading={loading}
                rightIcon={<FaUserPlus />}
                style={{ marginTop: "var(--space-2)" }}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;

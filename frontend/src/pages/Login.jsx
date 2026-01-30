import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { FiUser, FiLock, FiLogIn } from "react-icons/fi";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { identifier, password });

      if (data.success) {
        login(data.data);
        navigate("/home");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
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
            <h1 className="auth-title">{t("login_welcome") || "Welcome back"}</h1>
            <p className="auth-subtitle">Sign in with your username, phone, or email</p>
          </div>

          <div className="auth-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Username / Phone / Email"
                placeholder="Enter your identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<FiUser />}
                required
              />

              <TextField
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<FiLock />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                block
                loading={loading}
                rightIcon={<FiLogIn size={18} />}
                style={{ marginTop: "var(--space-4)" }}
              >
                {loading ? t("form_sending") || "Signing in..." : t("login_button") || "Sign In"}
              </Button>
            </form>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register">Create one here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;

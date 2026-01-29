import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { FaExclamationTriangle, FaPhoneAlt, FaMapMarkerAlt, FaUser, FaBullhorn } from "react-icons/fa";
import "./Emergency.css";

export default function EmergencyList() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const { data } = await API.get(`/emergencies?locality=${user.locality}`);
        setEmergencies(data.data || []);
      } catch (error) {
        console.error("Error fetching emergencies", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.locality) {
      fetchEmergencies();
    }
  }, [user]);

  return (
    <div className="emergency-layout">
      <Navbar />
      <div className="emergency-container">
        <header className="emergency-header">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <FaExclamationTriangle size={60} color="var(--error)" />
          </motion.div>
          <h1>{t("active_emergencies")}</h1>
          <p>{t("local_alerts_in")} <span className="gradient-text">{user?.locality}</span></p>
        </header>

        {loading ? (
          <div className="loader-container">
            <div className="premium-spinner"></div>
          </div>
        ) : emergencies.length > 0 ? (
          <div className="emergency-list">
            {emergencies.map(em => (
              <motion.div
                key={em._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="emergency-card"
              >
                <div className={`priority-line priority-${em.priority}`} />
                <div className="emergency-card-body">
                  <div className="emergency-card-top">
                    <span className={`priority-badge badge-${em.priority}`}>{em.priority} {t("form_priority")}</span>
                    <span className="emergency-type"><FaBullhorn /> {em.type}</span>
                  </div>
                  <h3>{em.description}</h3>
                  <div className="emergency-meta">
                    <div className="meta-item"><FaUser /> {em.poster?.name}</div>
                    <div className="meta-item"><FaPhoneAlt /> {em.contactNumber}</div>
                    <div className="meta-item"><FaMapMarkerAlt /> {em.locality}</div>
                  </div>
                  <div className="emergency-actions">
                    <a href={`tel:${em.contactNumber}`} className="btn-call">{t("call_now")}</a>
                    <button className="btn-volunteer">{t("i_can_help")}</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="empty-state"
            style={{ padding: '60px', textAlign: 'center' }}
          >
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              {t("no_emergencies")}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

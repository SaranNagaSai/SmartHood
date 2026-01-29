import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import { useTranslation } from "react-i18next";
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaStar, FaBullhorn, FaUsers, FaUser, FaTools, FaHandHoldingHeart } from "react-icons/fa";
import API from "../services/api";
import "./Notifications.css";

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ask"); // 'ask' (Requesting) or 'provide' (Offering)
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Emergency': return <FaExclamationTriangle className="icon-emergency" />;
      case 'Official': return <FaBullhorn className="icon-official" />;
      case 'Community': return <FaUsers className="icon-community" />;
      case 'Service': return <FaTools className="icon-service" />;
      case 'Specific': return <FaUser className="icon-specific" />;
      case 'System': return <FaInfoCircle className="icon-system" />;
      case 'Rating': return <FaStar className="icon-rating" />;
      default: return <FaBell className="icon-default" />;
    }
  };

  // Filter Logic
  // In a real app, 'Provide' vs 'Ask' might depend on the User's role or the context of the notification.
  // For now, let's categorize purely by 'Type' or mock context since backend doesn't fully distinguish 'Ask' vs 'Provide' notifications yet.
  // We will use the 'filter' state to handle the sub-categories.

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "All") return true;
    return notif.type === filter;
  });

  return (
    <div className="notifications-layout">
      <Navbar />
      <div className="notifications-container">
        <header className="notifications-header">
          <h1>{t("notifications_title")}</h1>

          {/* Main Tabs: Provide vs Ask */}
          <div className="main-tabs glass">
            <button
              className={`tab-btn ${activeTab === 'ask' ? 'active' : ''}`}
              onClick={() => setActiveTab('ask')}
            >
              <FaHandHoldingHeart /> Ask Service
            </button>
            <button
              className={`tab-btn ${activeTab === 'provide' ? 'active' : ''}`}
              onClick={() => setActiveTab('provide')}
            >
              <FaTools /> Provide Service
            </button>
          </div>

          {/* Sub Filters */}
          <div className="filter-chips">
            {['All', 'Official', 'Emergency', 'Community', 'Specific'].map(f => (
              <button
                key={f}
                className={`chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="notifications-list">
          {loading ? (
            <p>Loading...</p>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FaBell />
              <p>No notifications found for this category.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div key={notif._id} className={`notification-card ${notif.type.toLowerCase()} ${!notif.isRead ? 'unread' : ''}`}>
                <div className="notif-icon-wrapper">
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <h3>{notif.title}</h3>
                  <p>{notif.message}</p>
                  <span className="time">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
                {!notif.isRead && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

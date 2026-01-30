import React, { useContext, useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import { useTranslation } from "react-i18next";
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaStar, FaBullhorn, FaUsers, FaUser, FaTools, FaHandHoldingHeart } from "react-icons/fa";
import API from "../services/api";
import { NotificationContext } from "../context/NotificationContext";
import Button from "../components/ui/Button";
import useToast from "../hooks/useToast";

const Notifications = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const notificationCtx = useContext(NotificationContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ask"); // 'ask' (Requesting) or 'provide' (Offering)
  const [filter, setFilter] = useState("All");

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      const list = data.data || [];
      setNotifications(list);
      if (notificationCtx?.setNotifications) notificationCtx.setNotifications(list);
      const unread = list.filter((n) => !n.isRead).length;
      if (notificationCtx?.setUnreadCount) notificationCtx.setUnreadCount(unread);

      // Clear badge when user opens notifications page
      if (unread > 0) {
        await API.put("/notifications/read-all");
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        if (notificationCtx?.setNotifications) notificationCtx.setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        if (notificationCtx?.setUnreadCount) notificationCtx.setUnreadCount(0);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      addToast("Failed to load notifications", { type: "error" });
      setLoading(false);
    }
  };
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (filter === "All") return true;
      return notif.type === filter;
    });
  }, [notifications, filter]);

  const handleOpenNotification = async (notif) => {
    if (!notif?._id) return;
    if (notif.isRead) return;

    try {
      await API.put(`/notifications/${notif._id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)));
      if (notificationCtx?.setNotifications) {
        notificationCtx.setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)));
      }
      if (notificationCtx?.setUnreadCount) {
        notificationCtx.setUnreadCount((prev) => Math.max(0, Number(prev || 0) - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      addToast(error.response?.data?.message || "Failed to mark as read", { type: "error" });
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);

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

  return (
    <>
      <PageHeader>
        <header className="notifications-header">
          <h1 className="notifications-title">{t("notifications_title")}</h1>

          <div className="notifications-controls">
            {/* Main Tabs: Provide vs Ask */}
            <div className="main-tabs" role="tablist" aria-label="Notification scope">
              <Button
                unstyled
                type="button"
                className={`tab-btn ${activeTab === 'ask' ? 'active' : ''}`}
                onClick={() => setActiveTab('ask')}
              >
                <FaHandHoldingHeart />
                <span>Ask Service</span>
              </Button>
              <Button
                unstyled
                type="button"
                className={`tab-btn ${activeTab === 'provide' ? 'active' : ''}`}
                onClick={() => setActiveTab('provide')}
              >
                <FaTools />
                <span>Provide Service</span>
              </Button>
            </div>

            {/* Sub Filters */}
            <div className="filter-chips" role="toolbar" aria-label="Notification filters">
              {['All', 'Official', 'Emergency', 'Community', 'Specific'].map((f) => (
                <Button
                  key={f}
                  unstyled
                  type="button"
                  className={`chip ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </header>
      </PageHeader>

      <div className="notifications-page">
        <div className="notifications-list">
          {loading ? (
            <div className="empty-state">
              <div className="premium-spinner" />
              <p>Loading notifications…</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FaBell />
              <p>No notifications found for this category.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenNotification(notif)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenNotification(notif);
                }}
              >
                <div className={`notification-icon ${notif.type?.toLowerCase?.() || 'system'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">{new Date(notif.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;

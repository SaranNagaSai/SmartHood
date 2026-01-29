// Displays community events
// Supports regular and emergency events, educational programs, announcements

import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaFilter,
  FaGraduationCap, FaExclamationTriangle, FaTheaterMasks, FaTimes, FaPlus
} from "react-icons/fa";
import "./Events.css";

const eventCategories = [
  { key: "All", icon: FaCalendarAlt, color: "#6366f1" },
  { key: "Community", icon: FaUsers, color: "#10b981" },
  { key: "Educational", icon: FaGraduationCap, color: "#f59e0b" },
  { key: "Emergency", icon: FaExclamationTriangle, color: "#ef4444" },
  { key: "Cultural", icon: FaTheaterMasks, color: "#8b5cf6" }
];

export default function Events() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "Community",
    date: "",
    time: "",
    location: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Using mock data for now - replace with API call when backend endpoint exists
      setEvents([]);
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = activeCategory === "All"
    ? events
    : events.filter(e => e.category === activeCategory);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      // Mock creation - replace with API.post("/events", newEvent) when ready
      const created = {
        _id: Date.now().toString(),
        ...newEvent,
        organizer: user?.name || "Anonymous",
        attendees: 1
      };
      setEvents([created, ...events]);
      setShowCreateModal(false);
      setNewEvent({ title: "", description: "", category: "Community", date: "", time: "", location: "" });
      alert("Event created successfully!");
    } catch (error) {
      alert("Failed to create event");
    }
  };

  const getCategoryStyle = (cat) => {
    const found = eventCategories.find(c => c.key === cat);
    return { backgroundColor: found?.color || "#6366f1" };
  };

  return (
    <div className="events-layout">
      <Navbar />

      <div className="events-container">
        <header className="events-header">
          <div className="header-content">
            <h1 className="gradient-text">
              <FaCalendarAlt /> {t("events_title") || "Community Events"}
            </h1>
            <p>Discover what's happening in {user?.locality || "your locality"}</p>
          </div>
          <button className="btn-premium create-btn" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Create Event
          </button>
        </header>

        {/* Category Filter */}
        <div className="category-filter">
          {eventCategories.map(cat => (
            <button
              key={cat.key}
              className={`filter-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              style={activeCategory === cat.key ? { borderColor: cat.color, color: cat.color } : {}}
            >
              <cat.icon /> {cat.key}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="loader-container">
            <div className="premium-spinner"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="event-card glass"
              >
                <div className="event-category-badge" style={getCategoryStyle(event.category)}>
                  {event.category}
                </div>
                <h3>{event.title}</h3>
                <p className="event-desc">{event.description}</p>
                <div className="event-meta">
                  <div className="meta-item">
                    <FaCalendarAlt /> {event.date} at {event.time}
                  </div>
                  <div className="meta-item">
                    <FaMapMarkerAlt /> {event.location}
                  </div>
                  <div className="meta-item">
                    <FaUsers /> {event.attendees} attending
                  </div>
                </div>
                <div className="event-footer">
                  <span className="organizer">By {event.organizer}</span>
                  <button className="btn-secondary">Join Event</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaCalendarAlt size={50} color="#94a3b8" />
            <p>No events found in this category.</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-container glass"
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
              <h2>Create New Event</h2>
              <form onSubmit={handleCreateEvent} className="event-form">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Event Description"
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  required
                />
                <select
                  value={newEvent.category}
                  onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                >
                  <option value="Community">Community</option>
                  <option value="Educational">Educational</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Cultural">Cultural</option>
                </select>
                <div className="form-row">
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Time (e.g., 10:00 AM)"
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Location"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  required
                />
                <button type="submit" className="btn-premium">Create Event</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

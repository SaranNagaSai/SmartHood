// Displays community events
// Supports regular and emergency events, educational programs, announcements

import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/layout/PageHeader";
import { AuthContext } from "../context/AuthContext";
import useToast from "../hooks/useToast";
import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import TextAreaField from "../components/ui/TextAreaField";
import SelectField from "../components/ui/SelectField";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers,
  FaGraduationCap, FaExclamationTriangle, FaTheaterMasks, FaTimes, FaPlus
} from "react-icons/fa";

const eventCategories = [
  { key: "All", icon: FaCalendarAlt, color: "var(--color-primary-500)" },
  { key: "Community", icon: FaUsers, color: "var(--color-success-600)" },
  { key: "Educational", icon: FaGraduationCap, color: "var(--color-warning-600)" },
  { key: "Emergency", icon: FaExclamationTriangle, color: "var(--color-error-600)" },
  { key: "Cultural", icon: FaTheaterMasks, color: "var(--color-primary-700)" }
];

export default function Events() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
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
      addToast("Event created successfully!", { type: "success" });
    } catch (error) {
      addToast("Failed to create event", { type: "error" });
    }
  };

  const getCategoryColor = (cat) => {
    const found = eventCategories.find(c => c.key === cat);
    return found?.color || "var(--color-primary-500)";
  };

  return (
    <>
      <PageHeader>
        <div className="page-header-top">
          <div>
            <h1 className="page-title">
              <FaCalendarAlt /> {t("events_title") || "Community Events"}
            </h1>
            <p className="page-subtitle">Discover what's happening in {user?.locality || "your locality"}</p>
          </div>
          <div className="page-actions">
            <Button onClick={() => setShowCreateModal(true)} leftIcon={<FaPlus />}>
              Create Event
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Category Filter */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Browse by category</h2>
        </div>
        <div className="tabs">
          <div className="tabs-list tabs-list-pills" role="tablist" aria-label="Event categories">
            {eventCategories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  className={`tab ${isActive ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.key)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <cat.icon className="tab-icon" aria-hidden="true" />
                  {cat.key}
                </button>
              );
            })}
          </div>
        </div>
      </section>

        {/* Events Grid */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">Events</h2>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="premium-spinner"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="content-grid auto-fill">
            {filteredEvents.map((event) => {
              const categoryColor = getCategoryColor(event.category);

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="card card-hover"
                >
                  <div className="card-body">
                    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                      <span
                        className="badge"
                        style={{ backgroundColor: categoryColor, color: "var(--color-neutral-0)" }}
                      >
                        {event.category}
                      </span>
                      <span className="badge badge-secondary">
                        <FaUsers /> {event.attendees}
                      </span>
                    </div>

                    <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>
                      {event.title}
                    </h3>
                    <p style={{ marginTop: "var(--space-2)", marginBottom: 0, color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
                      {event.description}
                    </p>

                    <div style={{ display: "grid", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                        <FaCalendarAlt aria-hidden="true" /> {event.date} at {event.time}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                        <FaMapMarkerAlt aria-hidden="true" /> {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>By {event.organizer}</span>
                    <Button variant="secondary" size="sm">Join Event</Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              <FaCalendarAlt />
            </div>
            <h3 className="empty-state-title">No events yet</h3>
            <p className="empty-state-description">Create the first event for your community or switch categories to explore.</p>
            <div>
              <Button onClick={() => setShowCreateModal(true)} leftIcon={<FaPlus />}>
                Create Event
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal modal-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">Create New Event</h2>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateEvent}>
                <div className="modal-body" style={{ display: "grid", gap: "var(--space-4)" }}>
                  <TextField
                    type="text"
                    placeholder="Event Title"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                  <TextAreaField
                    placeholder="Event Description"
                    value={newEvent.description}
                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                    required
                  />
                  <SelectField
                    value={newEvent.category}
                    onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    <option value="Community">Community</option>
                    <option value="Educational">Educational</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Cultural">Cultural</option>
                  </SelectField>
                  <div className="form-row">
                    <TextField
                      type="date"
                      value={newEvent.date}
                      onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                      required
                    />
                    <TextField
                      type="text"
                      placeholder="Time (e.g., 10:00 AM)"
                      value={newEvent.time}
                      onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                      required
                    />
                  </div>
                  <TextField
                    type="text"
                    placeholder="Location"
                    value={newEvent.location}
                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" leftIcon={<FaPlus />}>
                    Create Event
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

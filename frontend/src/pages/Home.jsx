import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import {
  FiAlertCircle, FiHeart, FiCalendar, FiMapPin,
  FiUsers, FiPhone, FiUser, FiBriefcase, FiStar,
  FiChevronLeft, FiChevronRight, FiGlobe, FiX,
  FiArrowRight, FiShoppingBag, FiMap, FiZap
} from "react-icons/fi";
import EmergencyForm from "../components/forms/EmergencyForm";
import ServiceForm from "../components/forms/ServiceForm";
import GeographicNav from "../components/navigation/GeographicNav";
import Button from "../components/ui/Button";

// Profession icons mapping
const professionIcons = {
  "Software/IT": "💻",
  "Healthcare": "🏥",
  "Education/Teaching": "📚",
  "Business/Self-Employed": "💼",
  "Student": "🎓",
  "Manufacturing/Govt": "🏭",
  "Creative/Arts": "🎨",
  "Construction/Real Estate": "🏗️",
  "Service/Retail": "🛒",
  "Other": "👤"
};

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [emergencies, setEmergencies] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);

  // States for profession cards and state slideshow
  const [professionStats, setProfessionStats] = useState([]);
  const [stateStats, setStateStats] = useState([]);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [professionPeople, setProfessionPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const stateCarouselRef = useRef(null);
  const [isStateCarouselPaused, setIsStateCarouselPaused] = useState(false);

  // Geographic navigation state
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showGeographicNav, setShowGeographicNav] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [emRes, serRes, profRes, stateRes] = await Promise.all([
        API.get(`/emergencies?locality=${user.locality}`),
        API.get(`/services?locality=${user.locality}`),
        API.get(`/localities/profession-stats/${encodeURIComponent(user.locality)}`),
        API.get(`/localities/state-stats`)
      ]);
      setEmergencies(emRes.data.data || []);
      setServices(serRes.data.data || []);
      setProfessionStats(profRes.data.data || []);
      setStateStats(stateRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setProfessionStats([]);
      setStateStats([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getStateCarouselStep = useCallback(() => {
    const viewport = stateCarouselRef.current;
    if (!viewport) return 260;
    const firstCard = viewport.querySelector('.state-deal-card');
    if (!firstCard) return 260;
    const width = firstCard.getBoundingClientRect().width;

    const track = viewport.querySelector('.state-carousel-track');
    let gap = 0;
    if (track) {
      const computedGap = window.getComputedStyle(track).gap;
      const parsed = parseFloat(computedGap);
      gap = Number.isFinite(parsed) ? parsed : 0;
    }

    return Math.max(220, Math.round(width + gap));
  }, []);

  const scrollStateCarousel = useCallback(
    (direction) => {
      const viewport = stateCarouselRef.current;
      if (!viewport) return;
      const step = getStateCarouselStep();
      const delta = direction === 'left' ? -step : step;
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
      const nextLeft = Math.min(Math.max(viewport.scrollLeft + delta, 0), maxScrollLeft);
      viewport.scrollTo({ left: nextLeft, behavior: 'smooth' });
    },
    [getStateCarouselStep]
  );

  // Auto-slide like a deals carousel
  useEffect(() => {
    if (!stateStats.length) return;
    if (isStateCarouselPaused) return;
    const viewport = stateCarouselRef.current;
    if (!viewport) return;

    const interval = setInterval(() => {
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
      if (maxScrollLeft <= 0) return;

      // Wrap to start when reaching the end
      if (viewport.scrollLeft >= maxScrollLeft - 8) {
        viewport.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      viewport.scrollBy({ left: getStateCarouselStep(), behavior: 'smooth' });
    }, 3500);

    return () => clearInterval(interval);
  }, [stateStats.length, isStateCarouselPaused, getStateCarouselStep]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Fetch people when profession card is clicked
  const handleProfessionClick = async (profession) => {
    setSelectedProfession(profession);
    setLoadingPeople(true);
    try {
      const { data } = await API.get(
        `/localities/people/${encodeURIComponent(user.locality)}/${encodeURIComponent(profession)}`
      );
      setProfessionPeople(data.data || []);
    } catch (error) {
      console.error("Error fetching people", error);
      setProfessionPeople([]);
    } finally {
      setLoadingPeople(false);
    }
  };

  const closePeopleModal = () => {
    setSelectedProfession(null);
    setProfessionPeople([]);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting_morning", { defaultValue: "Good morning" });
    if (hour < 18) return t("greeting_afternoon", { defaultValue: "Good afternoon" });
    return t("greeting_evening", { defaultValue: "Good evening" });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="home-header">
        <span className="home-greeting">{getGreeting()}</span>
        <h1 className="home-title">{user?.name || "User"}</h1>
        <div className="home-location">
          <FiMapPin size={16} />
          {user?.locality}, {user?.city}
        </div>
      </div>

      {/* Users Across India (Top Carousel) */}
      {stateStats.length > 0 && (
        <div className="content-section state-carousel-section">
          <div className="section-header">
            <h2 className="section-title">
              <FiGlobe className="section-title-icon" />
              Users Across India
            </h2>
          </div>

          <div
            className="state-carousel"
            onMouseEnter={() => setIsStateCarouselPaused(true)}
            onMouseLeave={() => setIsStateCarouselPaused(false)}
          >
            <Button
              unstyled
              className="state-carousel-nav left"
              onClick={() => scrollStateCarousel('left')}
              aria-label="Scroll states left"
            >
              <FiChevronLeft size={20} />
            </Button>

            <div className="state-carousel-viewport" ref={stateCarouselRef}>
              <div className="state-carousel-track">
                {stateStats.map((item, idx) => (
                  <motion.div
                    key={`${item?.state || 'state'}-${idx}`}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="state-deal-card"
                  >
                    <div className="state-deal-pin"><FiMapPin /></div>
                    <div className="state-deal-name">{item?.state || 'State'}</div>
                    <div className="state-deal-count">
                      <FiUsers /> {item?.count || 0}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button
              unstyled
              className="state-carousel-nav right"
              onClick={() => scrollStateCarousel('right')}
              aria-label="Scroll states right"
            >
              <FiChevronRight size={20} />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="quick-actions">
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="quick-action-card emergency"
          onClick={() => setShowModal('emergency')}
        >
          <div className="quick-action-icon error">
            <FiAlertCircle size={24} />
          </div>
          <div className="quick-action-content">
            <h3>{t("home_report_emergency")}</h3>
            <p>{t("home_emergency_desc") || "Report urgent situations in your area"}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="quick-action-card"
          onClick={() => setShowModal('service')}
        >
          <div className="quick-action-icon primary">
            <FiHeart size={24} />
          </div>
          <div className="quick-action-content">
            <h3>{t("home_need_help")}</h3>
            <p>{t("home_help_desc") || "Request or offer community assistance"}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="quick-action-card"
          onClick={() => navigate('/events')}
        >
          <div className="quick-action-icon success">
            <FiCalendar size={24} />
          </div>
          <div className="quick-action-content">
            <h3>{t("events_title") || "Events"}</h3>
            <p>{t("home_events_desc") || "Discover local events and gatherings"}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="quick-action-card"
          onClick={() => navigate('/tourism')}
        >
          <div className="quick-action-icon warning">
            <FiMap size={24} />
          </div>
          <div className="quick-action-content">
            <h3>{t("home_local_markets")}</h3>
            <p>{t("home_rates_desc") || "Explore places and local markets"}</p>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="card card-stat">
          <div className="card-stat-icon" style={{ backgroundColor: 'var(--bg-brand-subtle)', color: 'var(--color-primary-600)' }}>
            <FiZap size={20} />
          </div>
          <div className="card-stat-content">
            <span className="card-stat-value">{user?.impactScore || 0}</span>
            <span className="card-stat-label">Impact Score</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="card-stat-icon" style={{ backgroundColor: 'var(--color-error-50)', color: 'var(--color-error-600)' }}>
            <FiAlertCircle size={20} />
          </div>
          <div className="card-stat-content">
            <span className="card-stat-value">{emergencies.length}</span>
            <span className="card-stat-label">Active Emergencies</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="card-stat-icon" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-600)' }}>
            <FiHeart size={20} />
          </div>
          <div className="card-stat-content">
            <span className="card-stat-value">{services.length}</span>
            <span className="card-stat-label">Active Requests</span>
          </div>
        </div>
      </div>

      {/* Emergency Alerts Section */}
      {emergencies.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">
              <FiAlertCircle className="section-title-icon" style={{ color: 'var(--color-error-500)' }} />
              {t("home_active_emergencies")}
            </h2>
            <Button unstyled className="section-action" onClick={() => navigate('/emergency')}>
              View All <FiArrowRight size={16} />
            </Button>
          </div>
          <div className="emergency-list">
            {emergencies.slice(0, 3).map(em => (
              <motion.div
                key={em._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`emergency-card ${em.priority?.toLowerCase() || 'medium'}`}
              >
                <div className="emergency-card-content">
                  <div className="emergency-card-header">
                    <span className="emergency-type">{em.type}</span>
                    <span className={`badge badge-${em.priority?.toLowerCase() === 'high' ? 'error' : em.priority?.toLowerCase() === 'low' ? 'success' : 'warning'}`}>
                      {em.priority}
                    </span>
                  </div>
                  <p className="emergency-description">{em.description}</p>
                  <div className="emergency-meta">
                    <span className="emergency-meta-item">
                      <FiPhone size={12} /> {em.contactNumber}
                    </span>
                    <span className="emergency-meta-item">
                      <FiMapPin size={12} /> {em.locality}
                    </span>
                  </div>
                </div>
                <div className="emergency-actions">
                  <Button variant="primary" size="sm" onClick={() => navigate('/emergency')}>
                    {t("i_can_help") || "Help"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Services Feed Section */}
      {services.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">
              <FiHeart className="section-title-icon" />
              {t("home_feed") || "Community Feed"}
            </h2>
            <Button unstyled className="section-action" onClick={() => navigate('/services')}>
              View All <FiArrowRight size={16} />
            </Button>
          </div>
          <div className="services-grid">
            {services.slice(0, 4).map(service => (
              <motion.div
                key={service._id}
                whileHover={{ y: -4 }}
                className="service-card"
              >
                <div className="service-card-header">
                  <div className="service-card-top">
                    <span className="service-category">{service.category}</span>
                    <span className={`service-type-badge ${service.type?.toLowerCase() || 'request'}`}>
                      {service.type}
                    </span>
                  </div>
                  <p className="service-description">{service.description}</p>
                </div>
                <div className="service-card-body">
                  <div className="service-requester">
                    <div className="avatar avatar-md">
                      {service.requesterId?.name?.[0] || 'U'}
                    </div>
                    <div className="service-requester-info">
                      <span className="service-requester-name">
                        {service.requesterId?.name || "Community Member"}
                      </span>
                      <span className="service-requester-meta">
                        <FiMapPin size={12} /> {service.locality}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="service-card-footer">
                  <Button variant="secondary" size="sm">View Details</Button>
                  <Button variant="primary" size="sm">Respond</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Profession Section */}
      {professionStats.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">
              <FiBriefcase className="section-title-icon" />
              People in {user?.locality}
            </h2>
          </div>
          <div className="profession-grid">
            {professionStats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="profession-card"
                onClick={() => handleProfessionClick(stat.profession)}
              >
                <span className="profession-icon">
                  {professionIcons[stat.profession] || "👤"}
                </span>
                <span className="profession-name">{stat.profession}</span>
                <span className="profession-count">
                  <FiUsers size={14} /> {stat.count}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal modal-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {showModal === 'service' ? t("home_need_help") : t("home_report_emergency")}
                </h2>
                <Button variant="ghost" className="btn-icon-only" onClick={() => setShowModal(null)} aria-label="Close">
                  <FiX size={20} />
                </Button>
              </div>
              <div className="modal-body">
                {showModal === 'service' ? (
                  <ServiceForm onSuccess={() => { setShowModal(null); fetchData(); }} />
                ) : (
                  <EmergencyForm onSuccess={() => { setShowModal(null); fetchData(); }} />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* People List Modal */}
      <AnimatePresence>
        {selectedProfession && (
          <div className="modal-backdrop" onClick={closePeopleModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal modal-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {professionIcons[selectedProfession]} {selectedProfession} in {user?.locality}
                </h2>
                <Button variant="ghost" className="btn-icon-only" onClick={closePeopleModal} aria-label="Close">
                  <FiX size={20} />
                </Button>
              </div>
              <div className="modal-body">
                {loadingPeople ? (
                  <div className="loading-container">
                    <div className="spinner spinner-md"></div>
                    <p>Loading...</p>
                  </div>
                ) : professionPeople.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {professionPeople.map(person => (
                      <div key={person._id} className="card" style={{ padding: 'var(--space-4)' }}>
                        <div className="flex gap-4 items-center">
                          <div className="avatar avatar-lg">
                            {person.name?.[0]}
                          </div>
                          <div className="flex-1">
                            <h4 style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>
                              {person.name}
                            </h4>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                              {person.profession}
                            </p>
                            <div className="flex gap-4" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                              <span className="flex items-center gap-1">
                                <FiPhone size={12} /> {person.phone}
                              </span>
                              {person.ratings?.average > 0 && (
                                <span className="flex items-center gap-1" style={{ color: 'var(--color-warning-500)' }}>
                                  <FiStar size={12} /> {person.ratings.average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>👥</span>
                    <h3 className="empty-state-title">No people found</h3>
                    <p className="empty-state-description">
                      No community members found in this category.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
  );
}

export default Home;

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import {
  FaExclamationCircle, FaBullhorn, FaHandHoldingHeart,
  FaCalendarAlt, FaShoppingBasket, FaTimes, FaUsers,
  FaMapMarkerAlt, FaMapMarkedAlt, FaPhoneAlt, FaUser,
  FaBriefcase, FaStar, FaChevronLeft, FaChevronRight, FaGlobe
} from "react-icons/fa";
import EmergencyForm from "../components/forms/EmergencyForm";
import ServiceForm from "../components/forms/ServiceForm";
import GeographicNav from "../components/navigation/GeographicNav";
import StateSlideshow from "../components/navigation/StateSlideshow";
import "./Home.css";
import "./HomeNavStyles.css";

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

  // New states for profession cards and state slideshow
  const [professionStats, setProfessionStats] = useState([]);
  const [stateStats, setStateStats] = useState([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [professionPeople, setProfessionPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

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
      // Ensure state is empty on error so UI handles it gracefully
      setProfessionStats([]);
      setStateStats([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-rotate state slideshow
  useEffect(() => {
    if (stateStats.length > 0) {
      const interval = setInterval(() => {
        setCurrentStateIndex(prev => (prev + 1) % stateStats.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [stateStats]);

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

  const nextState = () => setCurrentStateIndex(prev => (prev + 1) % stateStats.length);
  const prevState = () => setCurrentStateIndex(prev => (prev - 1 + stateStats.length) % stateStats.length);

  return (
    <div className="home-layout">
      <Navbar />

      {/* Hero Section */}
      <div className="home-container">
        <motion.h1
          className="home-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t("welcome")} {user?.name}!
        </motion.h1>

        {/* State Slideshow */}
        <StateSlideshow
          onStateSelect={(state) => {
            setShowGeographicNav(true);
            setSelectedLocation({ state, district: null, town: null, locality: null });
          }}
        />

        {/* Geographic Navigation - Toggleable */}
        {showGeographicNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="nav-header">
              <h2>🗺️ Explore by Location</h2>
              <button
                className="close-nav-btn"
                onClick={() => setShowGeographicNav(false)}
              >
                ✕ Close
              </button>
            </div>
            <GeographicNav
              onLocationChange={(location) => {
                setSelectedLocation(location);
                // TODO: Fetch location-specific content
              }}
            />
          </motion.div>
        )}

        {!showGeographicNav && (
          <button
            className="show-nav-btn"
            onClick={() => setShowGeographicNav(true)}
          >
            🗺️ Browse by Location
          </button>
        )}
        <button className="btn-secondary glass" onClick={() => navigate('/explore')}>
          <FaMapMarkedAlt /> {t("hero_explore") || "Explore"}
        </button>
      </div>
    </motion.div>
    </header >

    {/* State Slideshow Section */ }
  {
    stateStats.length > 0 && (
      <section className="state-slideshow-section">
        <h2 className="section-title"><FaGlobe /> Users Across India</h2>
        <div className="state-slideshow">
          <button className="slide-nav prev" onClick={prevState}><FaChevronLeft /></button>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStateIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="state-slide"
            >
              <div className="state-card glass">
                <div className="state-icon">📍</div>
                <h3>{stateStats[currentStateIndex]?.state || 'State'}</h3>
                <div className="state-count">
                  <FaUsers /> {stateStats[currentStateIndex]?.count || 0}
                </div>
                <p>Registered Users</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <button className="slide-nav next" onClick={nextState}><FaChevronRight /></button>

          {/* Dots indicator */}
          <div className="slide-dots">
            {stateStats.slice(0, 7).map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentStateIndex % 7 ? 'active' : ''}`}
                onClick={() => setCurrentStateIndex(idx)}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  {/* Profession Cards Section */ }
  <section className="profession-section">
    <h2 className="section-title"><FaBriefcase /> People in {user?.locality}</h2>
    <div className="profession-grid">
      {professionStats.map((stat, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="profession-card"
          onClick={() => handleProfessionClick(stat.profession)}
        >
          <div className="profession-icon">
            {professionIcons[stat.profession] || "👤"}
          </div>
          <h4>{stat.profession}</h4>
          <div className="profession-count">
            <FaUsers /> {stat.count}
          </div>
        </motion.div>
      ))}
    </div>
  </section>

  {/* Emergency Alerts Section */ }
  {
    emergencies.length > 0 && (
      <section className="emergency-alerts-section">
        <h2 className="section-title alert-title">
          <FaExclamationCircle className="pulse" /> {t("home_active_emergencies")}
        </h2>
        <div className="emergency-alerts-list">
          {emergencies.slice(0, 3).map(em => (
            <motion.div
              key={em._id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className={`emergency-alert-card priority-${em.priority}`}
            >
              <div className="alert-badge">{em.priority}</div>
              <h4>{em.type}</h4>
              <p>{em.description}</p>
              <div className="alert-meta">
                <span><FaPhoneAlt /> {em.contactNumber}</span>
                <span><FaMapMarkerAlt /> {em.locality}</span>
              </div>
              <button className="btn-help" onClick={() => navigate('/emergency')}>
                {t("i_can_help")}
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    )
  }

  {/* Main Features Grid */ }
  <main className="features-container">
    <h2 className="section-title">{t("home_community_hub") || "Community Hub"}</h2>
    <div className="features-grid">
      <motion.div
        whileHover={{ y: -10 }}
        className="feature-card glass high-priority"
        onClick={() => setShowModal('emergency')}
      >
        <div className="card-icon"><FaBullhorn /></div>
        <h3>{t("home_report_emergency")}</h3>
        <p>{t("home_emergency_desc")}</p>
      </motion.div>

      <motion.div
        whileHover={{ y: -10 }}
        className="feature-card glass"
        onClick={() => setShowModal('service')}
      >
        <div className="card-icon"><FaHandHoldingHeart /></div>
        <h3>{t("home_need_help")}</h3>
        <p>{t("home_help_desc")}</p>
      </motion.div>

      <motion.div
        whileHover={{ y: -10 }}
        className="feature-card glass"
        onClick={() => navigate('/events')}
      >
        <div className="card-icon"><FaCalendarAlt /></div>
        <h3>{t("events_title") || "Events"}</h3>
        <p>{t("home_events_desc")}</p>
      </motion.div>

      <motion.div
        whileHover={{ y: -10 }}
        className="feature-card glass"
        onClick={() => navigate('/tourism')}
      >
        <div className="card-icon"><FaShoppingBasket /></div>
        <h3>{t("home_local_markets")}</h3>
        <p>{t("home_rates_desc")}</p>
      </motion.div>
    </div>
  </main>

  {/* Services Feed */ }
  {
    services.length > 0 && (
      <section className="services-feed-section">
        <h2 className="section-title">{t("home_feed") || "Community Feed"}</h2>
        <div className="services-feed">
          {services.slice(0, 4).map(service => (
            <motion.div
              key={service._id}
              whileHover={{ y: -5 }}
              className="service-feed-card glass"
            >
              <div className={`service-type-badge ${service.type === 'Request' ? 'request' : 'offer'}`}>
                {service.type}
              </div>
              <h4>{service.category}</h4>
              <p>{service.description}</p>
              <div className="service-meta">
                <span><FaUser /> {service.requesterId?.name || "Community Member"}</span>
                <span><FaMapMarkerAlt /> {service.locality}</span>
              </div>
              <button className="btn-respond">{t("home_help_now") || "Respond"}</button>
            </motion.div>
          ))}
        </div>
      </section>
    )
  }

  {/* Community Stats */ }
  <section className="community-stats glass">
    <div className="stat-item">
      <span className="stat-val">{user?.impactScore || 0}</span>
      <span className="stat-label">Impact Score</span>
    </div>
    <div className="stat-item">
      <span className="stat-val">{emergencies.length}</span>
      <span className="stat-label">Active Emergencies</span>
    </div>
    <div className="stat-item">
      <span className="stat-val">{services.length}</span>
      <span className="stat-label">Active Requests</span>
    </div>
  </section>

  {/* Form Modals */ }
  <AnimatePresence>
    {showModal && (
      <div className="modal-overlay" onClick={() => setShowModal(null)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="modal-container glass"
          onClick={e => e.stopPropagation()}
        >
          <button className="modal-close" onClick={() => setShowModal(null)}><FaTimes /></button>
          {showModal === 'service' ? (
            <ServiceForm onSuccess={() => { setShowModal(null); fetchData(); }} />
          ) : (
            <EmergencyForm onSuccess={() => { setShowModal(null); fetchData(); }} />
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>

  {/* People List Modal */ }
  <AnimatePresence>
    {selectedProfession && (
      <div className="modal-overlay" onClick={closePeopleModal}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="modal-container people-modal glass"
          onClick={e => e.stopPropagation()}
        >
          <button className="modal-close" onClick={closePeopleModal}><FaTimes /></button>
          <h2 className="modal-title">
            {professionIcons[selectedProfession]} {selectedProfession} in {user?.locality}
          </h2>

          {loadingPeople ? (
            <div className="loader-center">
              <div className="premium-spinner"></div>
            </div>
          ) : professionPeople.length > 0 ? (
            <div className="people-list">
              {professionPeople.map(person => (
                <div key={person._id} className="person-card">
                  <div className="person-avatar">{person.name?.[0]}</div>
                  <div className="person-info">
                    <h4>{person.name}</h4>
                    <p>{person.profession}</p>
                    <div className="person-meta">
                      <span><FaPhoneAlt /> {person.phone}</span>
                      {person.ratings?.average > 0 && (
                        <span className="rating"><FaStar /> {person.ratings.average.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No people found in this category.</p>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
    </div >
  );
}

export default Home;

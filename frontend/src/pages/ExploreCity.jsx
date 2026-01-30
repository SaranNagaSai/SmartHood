import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import API from '../services/api';
import PageHeader from '../components/layout/PageHeader';
import { FaMapMarkerAlt, FaCheck, FaHome, FaUsers, FaArrowRight } from 'react-icons/fa';
import Button from "../components/ui/Button";

const ExploreCity = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { activeContext, switchContext, resetToHome } = useContext(LocationContext);

  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocality, setSelectedLocality] = useState(null);

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        // Mock data for demo - replace with API call
        // API is assumed to be implemented or will return empty
        // setLocalities(mockLocalities); -> Removed as per request
        setLocalities([]);
        setLoading(false);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching localities", error);
        setLoading(false);
      }
    };
    fetchLocalities();
  }, [user]);

  const handleSwitchContext = (loc) => {
    setSelectedLocality(loc._id);
    switchContext(loc.name, loc.city, loc.state);
  };

  const handleProceed = () => {
    if (selectedLocality) {
      navigate('/home');
    }
  };

  const handleGoHome = () => {
    resetToHome();
    setSelectedLocality(null);
  };

  const currentContext = activeContext?.locality || user?.locality;
  const isHomeContext = activeContext?.isHomeLocality !== false;

  if (loading) return <div className="loader-container"><div className="premium-spinner"></div></div>;

  return (
    <>
      <PageHeader>
        <header className="explore-header">
          <h1 className="gradient-text">
            <FaMapMarkerAlt /> {t("explore_localities") || "Explore Localities"}
          </h1>
          <p>Switch your posting context to help or request services in other localities</p>

          <div className="current-context-badge glass">
            <span>Current Context:</span>
            <strong>{currentContext || "Not Set"}</strong>
            {!isHomeContext && (
              <Button unstyled className="home-btn" onClick={handleGoHome}>
                <FaHome /> Return Home
              </Button>
            )}
          </div>
        </header>
      </PageHeader>

        <div className="localities-grid">
          {localities.map(loc => (
            <motion.div
              key={loc._id}
              whileHover={{ y: -5 }}
              className={`locality-card glass ${selectedLocality === loc._id ? 'selected' : ''} ${loc.name === user?.locality ? 'home-locality' : ''}`}
              onClick={() => handleSwitchContext(loc)}
            >
              {loc.name === user?.locality && (
                <div className="home-badge"><FaHome /> Your Home</div>
              )}
              {selectedLocality === loc._id && (
                <div className="selected-badge"><FaCheck /> Selected</div>
              )}

              <h3>{loc.name}</h3>
              <p className="location-info">{loc.city}, {loc.state}</p>

              <div className="locality-stats">
                <div className="stat">
                  <FaUsers />
                  <span>{loc.userCount} members</span>
                </div>
                <div className="stat distance">
                  <FaMapMarkerAlt />
                  <span>{loc.distance === 0 ? 'Your area' : `${loc.distance} km away`}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedLocality && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="action-bar glass"
          >
            <p>You've selected a new locality. Posts and services will be shown for this area.</p>
            <Button onClick={handleProceed} rightIcon={<FaArrowRight />}>
              Proceed to Dashboard
            </Button>
          </motion.div>
        )}
    </>
  );
};

export default ExploreCity;

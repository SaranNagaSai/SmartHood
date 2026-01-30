import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import API from "../../services/api";
import Button from "../ui/Button";

const GeographicNav = ({ onLocationChange }) => {
    const [hierarchy, setHierarchy] = useState({
        state: null,
        district: null,
        town: null,
        locality: null
    });

    const [options, setOptions] = useState({
        states: [],
        districts: [],
        towns: [],
        localities: []
    });

    const [currentView, setCurrentView] = useState("state"); // state, district, town, locality
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Get user's location from localStorage
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (userInfo.state) {
            setUserLocation({
                state: userInfo.state,
                district: userInfo.district,
                town: userInfo.town,
                locality: userInfo.locality
            });
        }

        // Load states
        loadStates();
    }, []);

    useEffect(() => {
        // Notify parent of location change
        if (onLocationChange) {
            onLocationChange(hierarchy);
        }
    }, [hierarchy]);

    const loadDistricts = async (state) => {
        try {
            const response = await API.get(`/locations/districts/${state}`);
            setOptions(prev => ({ ...prev, districts: response.data.data }));
        } catch (error) {
            console.error("Error loading districts:", error);
        }
    };

    const loadTowns = async (state, district) => {
        try {
            const response = await API.get(`/locations/towns/${state}/${district}`);
            setOptions(prev => ({ ...prev, towns: response.data.data }));
        } catch (error) {
            console.error("Error loading towns:", error);
        }
    };

    const loadLocalities = async (state, district, town) => {
        try {
            const response = await API.get(`/locations/localities/${state}/${district}/${town}`);
            setOptions(prev => ({ ...prev, localities: response.data.data }));
        } catch (error) {
            console.error("Error loading localities:", error);
        }
    };

    const handleStateSelect = (state) => {
        setHierarchy({ state, district: null, town: null, locality: null });
        setCurrentView("district");
        loadDistricts(state);
    };

    const handleDistrictSelect = (district) => {
        setHierarchy(prev => ({ ...prev, district, town: null, locality: null }));
        setCurrentView("town");
        loadTowns(hierarchy.state, district);
    };

    const handleTownSelect = (town) => {
        setHierarchy(prev => ({ ...prev, town, locality: null }));
        setCurrentView("locality");
        loadLocalities(hierarchy.state, hierarchy.district, town);
    };

    const handleLocalitySelect = (locality) => {
        setHierarchy(prev => ({ ...prev, locality }));
    };

    const goToMyLocality = () => {
        if (userLocation) {
            setHierarchy(userLocation);
            setCurrentView("locality");
        }
    };

    const resetToState = () => {
        setHierarchy({ state: null, district: null, town: null, locality: null });
        setCurrentView("state");
    };

    return (
        <div className="geographic-nav">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <Button unstyled type="button" onClick={resetToState} className="breadcrumb-item">
                    <FaHome /> Home
                </Button>
                {hierarchy.state && (
                    <>
                        <FaChevronRight className="breadcrumb-separator" />
                        <Button unstyled type="button" onClick={() => setCurrentView("district")} className="breadcrumb-item">
                            {hierarchy.state}
                        </Button>
                    </>
                )}
                {hierarchy.district && (
                    <>
                        <FaChevronRight className="breadcrumb-separator" />
                        <Button unstyled type="button" onClick={() => setCurrentView("town")} className="breadcrumb-item">
                            {hierarchy.district}
                        </Button>
                    </>
                )}
                {hierarchy.town && (
                    <>
                        <FaChevronRight className="breadcrumb-separator" />
                        <Button unstyled type="button" onClick={() => setCurrentView("locality")} className="breadcrumb-item">
                            {hierarchy.town}
                        </Button>
                    </>
                )}
                {hierarchy.locality && (
                    <>
                        <FaChevronRight className="breadcrumb-separator" />
                        <span className="breadcrumb-item active">{hierarchy.locality}</span>
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                {userLocation && (
                    <Button unstyled type="button" onClick={goToMyLocality} className="quick-btn">
                        <FaMapMarkerAlt /> My Locality
                    </Button>
                )}
            </div>

            {/* Location Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentView}
                    className="location-grid"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    {currentView === "state" && options.states.map((state) => (
                        <motion.div
                            key={state}
                            className="location-card"
                            onClick={() => handleStateSelect(state)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3>{state}</h3>
                            <span className="view-label">View Districts</span>
                        </motion.div>
                    ))}

                    {currentView === "district" && options.districts.map((district) => (
                        <motion.div
                            key={district}
                            className="location-card"
                            onClick={() => handleDistrictSelect(district)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3>{district}</h3>
                            <span className="view-label">View Towns</span>
                        </motion.div>
                    ))}

                    {currentView === "town" && options.towns.map((town) => (
                        <motion.div
                            key={town}
                            className="location-card"
                            onClick={() => handleTownSelect(town)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3>{town}</h3>
                            <span className="view-label">View Localities</span>
                        </motion.div>
                    ))}

                    {currentView === "locality" && options.localities.map((locality) => (
                        <motion.div
                            key={locality}
                            className={`location-card ${hierarchy.locality === locality ? "selected" : ""}`}
                            onClick={() => handleLocalitySelect(locality)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3>{locality}</h3>
                            {hierarchy.locality === locality && <span className="selected-badge">✓ Selected</span>}
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default GeographicNav;

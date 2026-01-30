import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaMapMarkedAlt } from "react-icons/fa";
import API from "../../services/api";
import Button from "../ui/Button";

const StateSlideshow = ({ onStateSelect }) => {
    const [states, setStates] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const loadStates = async () => {
        try {
            const response = await API.get("/locations/states");
            setStates(response.data.data || []);
        } catch (error) {
            console.error("Error loading states:", error);
        }
    };

    useEffect(() => {
        loadStates();
    }, []);

    const handlePrevious = () => {
        setIsPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + states.length) % states.length);
    };

    const handleNext = () => {
        setIsPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % states.length);
    };

    const handleStateClick = (state) => {
        if (onStateSelect) {
            onStateSelect(state);
        }
    };

    if (states.length === 0) return null;

    return (
        <div className="state-slideshow">
            <h3 className="slideshow-title">
                <FaMapMarkedAlt /> Explore by State
            </h3>

            <div className="slideshow-container">
                <Button unstyled type="button" className="slide-arrow left" onClick={handlePrevious}>
                    <FaChevronLeft />
                </Button>

                <div className="slides-wrapper">
                    {states.map((state, index) => (
                        <motion.div
                            key={state}
                            className={`slide-card ${index === currentIndex ? "active" : ""}`}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: index === currentIndex ? 1 : 0.3,
                                scale: index === currentIndex ? 1 : 0.85,
                                x: `${(index - currentIndex) * 110}%`
                            }}
                            transition={{ duration: 0.5 }}
                            onClick={() => handleStateClick(state)}
                        >
                            <div className="state-card-content">
                                <h4>{state}</h4>
                                <p className="explore-text">Click to explore</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Button unstyled type="button" className="slide-arrow right" onClick={handleNext}>
                    <FaChevronRight />
                </Button>
            </div>

            {/* Indicators */}
            <div className="slide-indicators">
                {states.map((state, index) => (
                    <Button
                        key={index}
                        unstyled
                        type="button"
                        className={`indicator ${index === currentIndex ? "active" : ""}`}
                        onClick={() => {
                            setCurrentIndex(index);
                            setIsPlaying(false);
                        }}
                    />
                ))}
            </div>

            {/* Play/Pause */}
            <Button
                className="play-pause-btn"
                unstyled
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
            >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
            </Button>
        </div>
    );
};

export default StateSlideshow;

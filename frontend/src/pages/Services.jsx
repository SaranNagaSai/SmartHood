import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import ServiceRequestForm from "../components/forms/ServiceRequestForm";
import ServiceList from "../components/lists/ServiceList";
import "./Services.css";

const Services = () => {
    const [activeTab, setActiveTab] = useState("browse"); // browse or post
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleServicePosted = () => {
        // Switch to browse tab and refresh list
        setActiveTab("browse");
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="services-layout">
            <Navbar />

            <div className="services-container">
                <motion.div
                    className="services-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>🛎️ Services</h1>
                    <p className="subtitle">Request help or offer your skills to the community</p>
                </motion.div>

                {/* Tab Navigation */}
                <div className="service-tabs">
                    <button
                        className={`service-tab ${activeTab === "browse" ? "active" : ""}`}
                        onClick={() => setActiveTab("browse")}
                    >
                        📋 Browse Services
                    </button>
                    <button
                        className={`service-tab ${activeTab === "post" ? "active" : ""}`}
                        onClick={() => setActiveTab("post")}
                    >
                        ✍️ Post a Service
                    </button>
                </div>

                {/* Content */}
                <div className="services-content">
                    {activeTab === "browse" ? (
                        <ServiceList key={refreshTrigger} />
                    ) : (
                        <ServiceRequestForm onSuccess={handleServicePosted} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Services;

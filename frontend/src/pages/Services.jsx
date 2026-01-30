import React, { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "../components/layout/PageHeader";
import ServiceRequestForm from "../components/forms/ServiceRequestForm";
import ServiceList from "../components/lists/ServiceList";
import Button from "../components/ui/Button";

const Services = () => {
    const [activeTab, setActiveTab] = useState("browse"); // browse or post
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleServicePosted = () => {
        // Switch to browse tab and refresh list
        setActiveTab("browse");
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            <PageHeader>
                <motion.div
                    className="page-header-top"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="page-title">🛎️ Services</h1>
                        <p className="page-subtitle">Request help or offer your skills to the community</p>
                    </div>
                </motion.div>
            </PageHeader>

            {/* Tab Navigation */}
            <div className="content-section">
                <div className="card">
                    <div className="card-body card-body-compact" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="btn-group" role="tablist" aria-label="Services views">
                            <Button
                                type="button"
                                size="sm"
                                variant={activeTab === "browse" ? "primary" : "secondary"}
                                aria-pressed={activeTab === "browse"}
                                onClick={() => setActiveTab("browse")}
                            >
                                📋 Browse Services
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={activeTab === "post" ? "primary" : "secondary"}
                                aria-pressed={activeTab === "post"}
                                onClick={() => setActiveTab("post")}
                            >
                                ✍️ Post a Service
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="content-section">
                {activeTab === "browse" ? (
                    <ServiceList key={refreshTrigger} />
                ) : (
                    <ServiceRequestForm onSuccess={handleServicePosted} />
                )}
            </div>
        </>
    );
};

export default Services;

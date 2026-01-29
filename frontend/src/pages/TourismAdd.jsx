import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AddPlaceForm from "../components/tourism/AddPlaceForm";
import "./TourismAdd.css";

const TourismAdd = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(true);

    const handleSuccess = () => {
        navigate("/tourism");
    };

    return (
        <div className="tourism-add-page">
            {showForm && (
                <AddPlaceForm
                    onClose={() => navigate("/tourism")}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default TourismAdd;

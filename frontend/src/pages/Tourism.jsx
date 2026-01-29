import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import Navbar from "../components/common/Navbar";
import API from "../services/api";
import "./Tourism.css";

const Tourism = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    locality: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "All",
    "Temple",
    "Park",
    "Restaurant",
    "Historical Site",
    "Shopping",
    "Entertainment",
    "Nature/Scenic",
    "Museum",
    "Beach",
    "Other"
  ];

  useEffect(() => {
    fetchPlaces();
    fetchFeatured();
  }, [filters]);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category && filters.category !== "All") params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.locality) params.append("locality", filters.locality);

      const response = await API.get(`/tourism/places?${params.toString()}`);
      setPlaces(response.data.data || []);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const response = await API.get(`/tourism/featured?locality=${user.locality || ""}&limit=5`);
      setFeatured(response.data.data || []);
    } catch (error) {
      console.error("Error fetching featured:", error);
    }
  };

  const handleCategoryClick = (category) => {
    setFilters({ ...filters, category: category === "All" ? "" : category });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  return (
    <div className="tourism-layout">
      <Navbar />

      <div className="tourism-container">
        {/* Header */}
        <motion.div
          className="tourism-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>🏞️ Discover Places</h1>
          <p className="subtitle">Explore beautiful destinations in your area</p>
        </motion.div>

        {/* Add Place Button */}
        <button className="add-place-btn" onClick={() => navigate("/tourism/add")}>
          <FaPlus /> Add a Place
        </button>

        {/* Featured Places */}
        {featured.length > 0 && (
          <section className="featured-section">
            <h2>⭐ Featured in Your Locality</h2>
            <div className="featured-grid">
              {featured.map((place) => (
                <motion.div
                  key={place._id}
                  className="featured-card"
                  onClick={() => navigate(`/tourism/${place._id}`)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className="place-image"
                    style={{
                      backgroundImage: place.images[0]
                        ? `url(${place.images[0].url})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    }}
                  >
                    <div className="rating-badge">
                      <FaStar /> {place.ratings.average.toFixed(1)}
                    </div>
                  </div>
                  <div className="place-info">
                    <h3>{place.name}</h3>
                    <p className="location-tag">
                      <FaMapMarkerAlt /> {place.locality}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <div className="search-filter-section">
          <form onSubmit={handleSearch} className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search places..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </form>

          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${filters.category === cat || (cat === "All" && !filters.category) ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Places Grid */}
        {loading ? (
          <div className="loader-container">
            <div className="premium-spinner"></div>
          </div>
        ) : (
          <div className="places-grid">
            {places.length === 0 ? (
              <div className="empty-state">
                <p>No places found. Be the first to add one!</p>
              </div>
            ) : (
              places.map((place) => (
                <motion.div
                  key={place._id}
                  className="place-card"
                  onClick={() => navigate(`/tourism/${place._id}`)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <div
                    className="card-image"
                    style={{
                      backgroundImage: place.images[0]
                        ? `url(${place.images[0].url})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    }}
                  >
                    <div className="category-tag">{place.category}</div>
                    {place.ratings.count > 0 && (
                      <div className="rating-badge">
                        <FaStar /> {place.ratings.average.toFixed(1)} ({place.ratings.count})
                      </div>
                    )}
                  </div>

                  <div className="card-content">
                    <h3>{place.name}</h3>
                    <p className="description">{place.description.slice(0, 100)}...</p>
                    <div className="card-meta">
                      <span className="location">
                        <FaMapMarkerAlt /> {place.locality}, {place.town}
                      </span>
                      {place.viewCount > 0 && (
                        <span className="views">👁️ {place.viewCount} views</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tourism;

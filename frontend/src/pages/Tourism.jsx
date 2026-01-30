import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import PageHeader from "../components/layout/PageHeader";
import API from "../services/api";
import TextField from "../components/ui/TextField";
import Button from "../components/ui/Button";

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
    <>
      <PageHeader>
        <motion.div
          className="page-header-top"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="page-title">🏞️ Discover Places</h1>
            <p className="page-subtitle">Explore beautiful destinations in your area</p>
          </div>
          <div className="page-actions">
            <Button onClick={() => navigate("/tourism/add")} leftIcon={<FaPlus />}>
              Add a Place
            </Button>
          </div>
        </motion.div>
      </PageHeader>

      {/* Featured Places */}
      {featured.length > 0 && (
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">⭐ Featured in Your Locality</h2>
          </div>
          <div className="content-grid auto-fill">
            {featured.map((place) => (
              <motion.div
                key={place._id}
                className="card card-hover card-clickable"
                onClick={() => navigate(`/tourism/${place._id}`)}
                whileHover={{ y: -2 }}
              >
                <div
                  className="place-card-image"
                  style={
                    place.images?.[0]
                      ? undefined
                      : {
                        background: "linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-800) 100%)"
                      }
                  }
                >
                  {place.images?.[0] ? (
                    <img src={place.images[0].url} alt={place.name} loading="lazy" />
                  ) : null}
                  {place.ratings?.count > 0 ? (
                    <div className="place-card-category" style={{ left: 'auto', right: 'var(--space-3)' }}>
                      <FaStar style={{ marginRight: '6px' }} /> {place.ratings.average.toFixed(1)}
                    </div>
                  ) : null}
                </div>
                <div className="place-card-body">
                  <div className="place-card-name">{place.name}</div>
                  <div className="place-card-location">
                    <FaMapMarkerAlt /> {place.locality}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <div className="content-section">
        <div className="card">
          <div className="card-body card-body-compact" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 240 }}>
              <TextField
                unstyled
                type="text"
                leftIcon={<FaSearch />}
                placeholder="Search places..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </form>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FaFilter />}
            >
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="content-section">
        <div className="card">
          <div className="card-body card-body-compact" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {categories.map((cat) => {
              const isActive = filters.category === cat || (cat === "All" && !filters.category);
              return (
                <Button
                  key={cat}
                  type="button"
                  size="sm"
                  variant={isActive ? 'primary' : 'secondary'}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </Button>
              );
            })}
          </div>
        </div>
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
              <div className="empty-state-icon" aria-hidden="true">
                <FaMapMarkerAlt />
              </div>
              <h3 className="empty-state-title">No places found</h3>
              <p className="empty-state-description">Try a different category or search term — or add the first place in your area.</p>
              <Button onClick={() => navigate("/tourism/add")} leftIcon={<FaPlus />}>
                Add a Place
              </Button>
            </div>
          ) : (
            places.map((place) => (
              <motion.div
                key={place._id}
                className="place-card"
                onClick={() => navigate(`/tourism/${place._id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="place-card-image"
                  style={
                    place.images?.[0]
                      ? undefined
                      : {
                        background: "linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-800) 100%)"
                      }
                  }
                >
                  {place.images?.[0] ? (
                    <img src={place.images[0].url} alt={place.name} loading="lazy" />
                  ) : null}
                  <div className="place-card-category">{place.category}</div>
                  {place.ratings.count > 0 ? (
                    <div className="place-card-category" style={{ left: 'auto', right: 'var(--space-3)' }}>
                      <FaStar style={{ marginRight: '6px' }} /> {place.ratings.average.toFixed(1)} ({place.ratings.count})
                    </div>
                  ) : null}
                </div>

                <div className="place-card-body">
                  <div className="place-card-name">{place.name}</div>
                  <div className="place-card-location">
                    <FaMapMarkerAlt /> {place.locality}, {place.town}
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                    {place.description.slice(0, 100)}...
                  </p>
                  {place.viewCount > 0 ? (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <span className="badge badge-secondary">👁️ {place.viewCount} views</span>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default Tourism;

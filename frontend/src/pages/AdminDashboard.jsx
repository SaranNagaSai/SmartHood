// Enhanced Admin Analytics Dashboard with visualizations
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import { getPlatformAnalytics } from '../services/analyticsService';
import {
  FaUsers, FaExclamationTriangle, FaHandshake, FaChartLine,
  FaMapMarkerAlt, FaBriefcase, FaDownload, FaFilter,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d');

  // Mock data for comprehensive analytics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlatformAnalytics();
        setStats(data || null);
      } catch (error) {
        console.error("Error fetching analytics", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeFilter]);

  if (loading) {
    return (
      <div className="admin-layout">
        <Navbar />
        <div className="loader-container">
          <div className="premium-spinner"></div>
        </div>
      </div>
    );
  }

  const data = stats;

  if (!data) {
    return (
      <div className="admin-layout">
        <Navbar />
        <div className="empty-state-container" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>No Data Available</h2>
          <p>Analytics will appear here once there is platform activity.</p>
        </div>
      </div>
    );
  }

  const maxTrend = data.emergencyStats?.trends ? Math.max(...data.emergencyStats.trends.map(t => t.count)) : 0;
  const maxProfession = data.professionBreakdown ? Math.max(...data.professionBreakdown.map(p => p.count)) : 0;

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1><FaChartLine /> Admin Analytics</h1>
            <p>Platform overview and community insights</p>
          </div>
          <div className="header-actions">
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className="time-filter"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className="btn-download">
              <FaDownload /> Export
            </button>
          </div>
        </header>

        {/* Main Stats Grid */}
        <div className="main-stats-grid">
          <motion.div whileHover={{ y: -5 }} className="stat-card users">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <div className="stat-value">{data.userStats.total.toLocaleString()}</div>
              <div className="stat-meta">
                <span className="growth positive">
                  <FaArrowUp /> {data.userStats.growth}%
                </span>
                <span>+{data.userStats.newThisWeek} this week</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="stat-card emergency">
            <div className="stat-icon"><FaExclamationTriangle /></div>
            <div className="stat-content">
              <h3>Active Emergencies</h3>
              <div className="stat-value">{data.emergencyStats.active}</div>
              <div className="stat-meta">
                <span>Avg Response: {data.emergencyStats.avgResponseTime}</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="stat-card services">
            <div className="stat-icon"><FaHandshake /></div>
            <div className="stat-content">
              <h3>Services Completed</h3>
              <div className="stat-value">{data.serviceStats.completed.toLocaleString()}</div>
              <div className="stat-meta">
                <span>₹{(data.serviceStats.totalRevenue / 1000).toFixed(1)}K revenue</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="stat-card rating">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Avg Rating</h3>
              <div className="stat-value">{data.serviceStats.avgRating}</div>
              <div className="stat-meta">
                <span>From {data.serviceStats.total} services</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Emergency Trends */}
          <div className="chart-card glass">
            <h3><FaChartLine /> Emergency Trends (7 Days)</h3>
            <div className="bar-chart">
              {data.emergencyStats.trends.map((trend, idx) => (
                <div key={idx} className="bar-wrapper">
                  <div
                    className="bar emergency-bar"
                    style={{ height: `${(trend.count / maxTrend) * 120}px` }}
                  >
                    <span className="bar-value">{trend.count}</span>
                  </div>
                  <span className="bar-label">{trend._id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency by Type */}
          <div className="chart-card glass">
            <h3><FaExclamationTriangle /> Emergencies by Type</h3>
            <div className="type-breakdown">
              {data.emergencyStats.byType.map((item, idx) => (
                <div key={idx} className="type-row">
                  <div className="type-label">
                    <span className="type-dot" style={{ background: item.color }}></span>
                    {item.type}
                  </div>
                  <div className="type-bar-wrapper">
                    <div
                      className="type-bar"
                      style={{
                        width: `${(item.count / data.emergencyStats.byType[0].count) * 100}%`,
                        background: item.color
                      }}
                    ></div>
                  </div>
                  <span className="type-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-row">
          {/* Locality Stats */}
          <div className="chart-card glass">
            <h3><FaMapMarkerAlt /> Top Localities</h3>
            <div className="locality-table">
              <div className="table-header">
                <span>Locality</span>
                <span>Users</span>
                <span>Services</span>
                <span>Emergencies</span>
              </div>
              {data.localityStats.map((loc, idx) => (
                <div key={idx} className="table-row">
                  <span className="locality-name">{loc.name}</span>
                  <span>{loc.users}</span>
                  <span>{loc.services}</span>
                  <span className="emergency-count">{loc.emergencies}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profession Breakdown */}
          <div className="chart-card glass">
            <h3><FaBriefcase /> Profession Distribution</h3>
            <div className="profession-chart">
              {data.professionBreakdown.map((prof, idx) => (
                <div key={idx} className="profession-row">
                  <span className="prof-name">{prof.profession}</span>
                  <div className="prof-bar-wrapper">
                    <div
                      className="prof-bar"
                      style={{ width: `${(prof.count / maxProfession) * 100}%` }}
                    ></div>
                  </div>
                  <span className="prof-count">{prof.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

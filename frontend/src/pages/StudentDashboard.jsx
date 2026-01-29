// Student Dashboard - Specific view for student users
// Shows student-only leaderboards, academic help, skill volunteering, internships

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import {
    FaGraduationCap, FaTrophy, FaHandsHelping, FaBriefcase,
    FaBookReader, FaMedal, FaStar, FaChevronRight
} from 'react-icons/fa';
import './StudentDashboard.css';

export default function StudentDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Mock student data for demo
                const mockLeaderboard = [
                    { _id: '1', name: 'Priya Sharma', impactScore: 450, rank: 1, avatar: 'P' },
                    { _id: '2', name: 'Rahul Kumar', impactScore: 380, rank: 2, avatar: 'R' },
                    { _id: '3', name: 'Sneha Reddy', impactScore: 320, rank: 3, avatar: 'S' },
                    { _id: '4', name: user?.name || 'You', impactScore: user?.impactScore || 280, rank: 4, avatar: user?.name?.[0] || 'Y', isYou: true },
                    { _id: '5', name: 'Karthik Nair', impactScore: 250, rank: 5, avatar: 'K' }
                ];
                setLeaderboard(mockLeaderboard);
            } catch (error) {
                console.error("Error fetching student data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [user]);

    const studentStats = [
        { label: 'Impact Score', value: user?.impactScore || 280, icon: FaStar, color: '#f59e0b' },
        { label: 'Help Sessions', value: 12, icon: FaHandsHelping, color: '#10b981' },
        { label: 'Skills Shared', value: 5, icon: FaBookReader, color: '#6366f1' },
        { label: 'Leaderboard Rank', value: '#4', icon: FaTrophy, color: '#8b5cf6' }
    ];

    const opportunities = [
        {
            _id: '1',
            title: 'Content Writing Internship',
            company: 'Local News Portal',
            type: 'Internship',
            location: user?.locality || 'Local',
            duration: '3 months'
        },
        {
            _id: '2',
            title: 'Tutoring Students (Math)',
            company: 'Community Center',
            type: 'Volunteering',
            location: 'Online / Offline',
            duration: 'Flexible'
        },
        {
            _id: '3',
            title: 'Tech Support Helper',
            company: 'Senior Citizen Club',
            type: 'Skill Sharing',
            location: user?.locality || 'Local',
            duration: 'Weekends'
        }
    ];

    if (loading) {
        return (
            <div className="student-layout">
                <Navbar />
                <div className="loader-container">
                    <div className="premium-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-layout">
            <Navbar />
            <div className="student-container">
                {/* Header */}
                <header className="student-header">
                    <div className="header-left">
                        <FaGraduationCap size={40} color="#6366f1" />
                        <div>
                            <h1>Student Dashboard</h1>
                            <p>{t("student_subtitle") || "Track your community impact and find opportunities"}</p>
                        </div>
                    </div>
                    {user?.studentDetails && (
                        <div className="student-badge glass">
                            <span>{user.studentDetails.educationLevel}</span>
                            <span className="divider">|</span>
                            <span>{user.studentDetails.classYear}</span>
                        </div>
                    )}
                </header>

                {/* Stats Grid */}
                <section className="stats-grid">
                    {studentStats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="stat-card glass"
                        >
                            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                                <stat.icon />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Tabs */}
                <div className="student-tabs">
                    {['overview', 'leaderboard', 'opportunities', 'skills'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-grid">
                            {/* Quick Actions */}
                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => setActiveTab('leaderboard')}>
                                <FaTrophy size={30} color="#f59e0b" />
                                <h3>Student Leaderboard</h3>
                                <p>See how you rank among other student helpers</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => navigate('/activity')}>
                                <FaHandsHelping size={30} color="#10b981" />
                                <h3>Request Academic Help</h3>
                                <p>Get help from fellow students in your area</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => setActiveTab('opportunities')}>
                                <FaBriefcase size={30} color="#6366f1" />
                                <h3>Find Opportunities</h3>
                                <p>Internships, volunteering, and skill sharing</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => setActiveTab('skills')}>
                                <FaBookReader size={30} color="#8b5cf6" />
                                <h3>Share Your Skills</h3>
                                <p>Teach what you know, help your community</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <div className="leaderboard-section">
                            <h2><FaTrophy color="#f59e0b" /> Student Champions</h2>
                            <div className="leaderboard-list">
                                {leaderboard.map((student, idx) => (
                                    <motion.div
                                        key={student._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`leaderboard-item glass ${student.isYou ? 'is-you' : ''}`}
                                    >
                                        <div className="rank-badge">
                                            {student.rank <= 3 ? <FaMedal color={student.rank === 1 ? '#f59e0b' : student.rank === 2 ? '#94a3b8' : '#cd7f32'} /> : `#${student.rank}`}
                                        </div>
                                        <div className="student-avatar">{student.avatar}</div>
                                        <div className="student-info">
                                            <span className="student-name">{student.name} {student.isYou && '(You)'}</span>
                                            <span className="student-score">{student.impactScore} Impact Points</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'opportunities' && (
                        <div className="opportunities-section">
                            <h2><FaBriefcase color="#6366f1" /> Available Opportunities</h2>
                            <div className="opportunities-list">
                                {opportunities.map(opp => (
                                    <motion.div
                                        key={opp._id}
                                        whileHover={{ y: -5 }}
                                        className="opportunity-card glass"
                                    >
                                        <div className={`opp-type-badge ${opp.type.toLowerCase().replace(' ', '-')}`}>
                                            {opp.type}
                                        </div>
                                        <h3>{opp.title}</h3>
                                        <p className="company">{opp.company}</p>
                                        <div className="opp-meta">
                                            <span>📍 {opp.location}</span>
                                            <span>⏱️ {opp.duration}</span>
                                        </div>
                                        <button className="btn-apply">Apply Now</button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="skills-section">
                            <h2><FaBookReader color="#8b5cf6" /> Share Your Skills</h2>
                            <p className="section-desc">Help community members with your expertise and earn impact points!</p>
                            <div className="skill-categories">
                                {['Mathematics', 'Computer Skills', 'Language Tutoring', 'Science', 'Arts & Crafts', 'Music', 'Sports', 'Others'].map(skill => (
                                    <motion.div
                                        key={skill}
                                        whileHover={{ scale: 1.05 }}
                                        className="skill-chip"
                                    >
                                        {skill}
                                    </motion.div>
                                ))}
                            </div>
                            <button className="btn-premium" style={{ marginTop: '30px' }}>
                                + Register as Skill Volunteer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

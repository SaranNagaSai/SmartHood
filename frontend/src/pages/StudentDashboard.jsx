// Student Dashboard - Specific view for student users
// Shows student-only leaderboards, academic help, skill volunteering, internships

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Button from "../components/ui/Button";
import {
    FaGraduationCap, FaTrophy, FaHandsHelping, FaBriefcase,
    FaBookReader, FaMedal, FaStar, FaChevronRight
} from 'react-icons/fa';

export default function StudentDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [leaderboard, setLeaderboard] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Fetch real data
                const [leaderboardRes, oppRes] = await Promise.all([
                    API.get('/students/leaderboard'),
                    API.get('/students/opportunities')
                ]);

                // Process Leaderboard: Mark "Me"
                const lbData = leaderboardRes.data.map((s, idx) => ({
                    ...s,
                    rank: idx + 1,
                    avatar: s.name.charAt(0),
                    isYou: s._id === user?._id
                }));
                setLeaderboard(lbData);

                // Process Opportunities
                setOpportunities(oppRes.data);

            } catch (error) {
                console.error("Error fetching student data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [user]);

    const studentStats = [
        { label: 'Impact Score', value: user?.impactScore || 0, icon: FaStar, color: 'var(--color-warning-500)' },
        { label: 'Help Sessions', value: 0, icon: FaHandsHelping, color: 'var(--color-success-600)' }, // Future: Real data
        { label: 'Skills Shared', value: 0, icon: FaBookReader, color: 'var(--color-primary-500)' },    // Future: Real data
        {
            label: 'Leaderboard Rank',
            value: leaderboard.find(s => s.isYou)?.rank ? `#${leaderboard.find(s => s.isYou).rank}` : 'N/A',
            icon: FaTrophy,
            color: 'var(--color-primary-700)'
        }
    ];

    if (loading) {
        return (
            <div className="loader-container">
                <div className="premium-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <PageHeader>
                <header className="student-header">
                    <div className="header-left">
                        <FaGraduationCap size={40} color="var(--color-primary-500)" />
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
            </PageHeader>

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
                        <Button
                            key={tab}
                            unstyled
                            type="button"
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-grid">
                            {/* Quick Actions */}
                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => setActiveTab('leaderboard')}>
                                <FaTrophy size={30} color="var(--color-warning-500)" />
                                <h3>Student Leaderboard</h3>
                                <p>See how you rank among other student helpers</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => navigate('/activity')}>
                                <FaHandsHelping size={30} color="var(--color-success-600)" />
                                <h3>Request Academic Help</h3>
                                <p>Get help from fellow students in your area</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => setActiveTab('opportunities')}>
                                <FaBriefcase size={30} color="var(--color-primary-500)" />
                                <h3>Find Opportunities</h3>
                                <p>Internships, volunteering, and skill sharing</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>

                            <motion.div whileHover={{ y: -5 }} className="action-card glass" onClick={() => setActiveTab('skills')}>
                                <FaBookReader size={30} color="var(--color-primary-700)" />
                                <h3>Share Your Skills</h3>
                                <p>Teach what you know, help your community</p>
                                <FaChevronRight className="arrow" />
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <div className="leaderboard-section">
                            <h2><FaTrophy color="var(--color-warning-500)" /> Student Champions</h2>
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
                                            {student.rank <= 3 ? (
                                                <FaMedal
                                                    color={student.rank === 1 ? 'var(--color-warning-500)' : student.rank === 2 ? 'var(--color-neutral-400)' : 'var(--color-warning-600)'}
                                                />
                                            ) : `#${student.rank}`}
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
                            <h2><FaBriefcase color="var(--color-primary-500)" /> Available Opportunities</h2>
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
                                        <p className="company">{opp.organization}</p>
                                        <div className="opp-meta">
                                            <span>📍 {opp.location}</span>
                                            <span>⏱️ {opp.duration}</span>
                                        </div>
                                        <Button unstyled type="button" className="btn-apply">Apply Now</Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="skills-section">
                            <h2><FaBookReader color="var(--color-primary-700)" /> Share Your Skills</h2>
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
                            <Button style={{ marginTop: '30px' }}>
                                + Register as Skill Volunteer
                            </Button>
                        </div>
                    )}
                </div>
        </>
    );
}

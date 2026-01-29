import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import {
  FaUserCircle, FaSignOutAlt, FaHome, FaBullhorn,
  FaHistory, FaUserShield, FaBell, FaBriefcase,
  FaMapMarkedAlt, FaCalendarAlt
} from "react-icons/fa";
import logo from "../../assets/images/Smart Hood Logo.png";
import "./Navbar.css";

function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <img src={logo} alt="SmartHood Logo" className="nav-logo" />
          <span className="brand-text">{t("app_title")}</span>
        </Link>
      </div>

      <div className="nav-center">
        <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
          <FaHome /> <span>{t("nav_home")}</span>
        </Link>
        {user && (
          <>
            <Link to="/services" className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}>
              <FaBriefcase /> {t("services")}
            </Link>
            <Link to="/tourism" className={`nav-link ${location.pathname.startsWith('/tourism') ? 'active' : ''}`}>
              <FaMapMarkedAlt /> Tourism
            </Link>
            <Link to="/events" className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}>
              <FaCalendarAlt /> {t("events")}
            </Link>
            <Link to="/notifications" className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}>
              <FaBell /> <span>{t("nav_notifications")}</span>
            </Link>
          </>
        )}
      </div>

      <div className="nav-right">
        <div className="lang-switcher">
          <button
            className={i18n.language === 'en' ? 'active' : ''}
            onClick={() => i18n.changeLanguage("en")}
          >EN</button>
          <button
            className={i18n.language === 'te' ? 'active' : ''}
            onClick={() => i18n.changeLanguage("te")}
          >TE</button>
        </div>

        {user ? (
          <div className="user-dropdown">
            <div className="user-trigger" onClick={() => navigate('/profile')}>
              <div className="user-avatar-small">
                {user.name[0]}
              </div>
              <span className="user-name-label">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="logout-icon-btn" title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <div className="auth-btns">
            <Link to="/login" className="btn-login">{t("nav_login")}</Link>
            <Link to="/register" className="btn-premium sm">{t("nav_join")}</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

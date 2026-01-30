import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMoon,
  FiSun,
  FiGlobe,
  FiChevronRight,
  FiHome
} from 'react-icons/fi';
import TextField from "../ui/TextField";
import Button from "../ui/Button";

/**
 * Navbar Component - Top navigation bar
 * 
 * Design Features:
 * - Sticky positioning
 * - Breadcrumb navigation
 * - Global search
 * - Theme toggle
 * - Language switcher
 * - User menu dropdown
 */
const Navbar = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute('data-theme') || 'light'
  );

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/home' }];
    
    const pathLabels = {
      'services': 'Services',
      'emergency': 'Emergency',
      'tourism': 'Tourism',
      'events': 'Events',
      'notifications': 'Notifications',
      'complaints': 'Complaints',
      'profile': 'Profile',
      'explore': 'Explore',
      'admin': 'Admin',
      'dashboard': 'Dashboard',
      'student-dashboard': 'Student Hub',
      'activity': 'Activity',
      'add': 'Add New'
    };

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      if (pathLabels[path]) {
        breadcrumbs.push({
          label: pathLabels[path],
          path: currentPath,
          isLast: index === paths.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="navbar">
      {/* Left Section */}
      <div className="navbar-left">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          className="btn-icon mobile-only"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <FiMenu size={20} />
        </Button>

        {/* Breadcrumbs - Desktop only */}
        <nav className="navbar-breadcrumb hidden-mobile" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && (
                <FiChevronRight className="breadcrumb-separator" size={14} />
              )}
              <span className={`breadcrumb-item ${crumb.isLast ? 'active' : ''}`}>
                {crumb.isLast ? (
                  crumb.label
                ) : (
                  <Link to={crumb.path}>{crumb.label}</Link>
                )}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="navbar-center hidden-mobile">
        <div className={`search-bar ${searchFocused ? 'focused' : ''}`}>
          <FiSearch className="search-bar-icon" size={18} />
          <TextField
            unstyled
            type="text"
            inputClassName="search-bar-input"
            placeholder={t('search_placeholder', { defaultValue: 'Search services, places, people...' })}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="search-bar-shortcut">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Language Switcher */}
        <div className="lang-switcher hidden-mobile">
          <Button
            unstyled
            type="button"
            className={i18n.language === 'en' ? 'active' : ''}
            onClick={() => changeLanguage('en')}
            aria-label="English"
          >
            EN
          </Button>
          <Button
            unstyled
            type="button"
            className={i18n.language === 'te' ? 'active' : ''}
            onClick={() => changeLanguage('te')}
            aria-label="Telugu"
          >
            TE
          </Button>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          className="btn-icon"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </Button>

        {/* Notifications */}
        <Link 
          to="/notifications" 
          className="btn btn-ghost btn-icon notification-btn"
          aria-label="Notifications"
        >
          <FiBell size={18} />
          {unreadCount > 0 && (
            <span className="notification-indicator" aria-label={`${unreadCount} unread notifications`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Menu */}
        {user ? (
          <div className={`dropdown user-menu ${userMenuOpen ? 'open' : ''}`}>
            <Button
              unstyled
              type="button"
              className="user-menu-trigger"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="avatar avatar-sm">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="user-menu-info hidden-mobile">
                <span className="user-menu-name">{user.name}</span>
                <span className="user-menu-role">{user.role || 'Member'}</span>
              </div>
              <FiChevronDown size={16} className="user-menu-chevron hidden-mobile" />
            </Button>

            <div className="dropdown-menu dropdown-menu-right">
              <div className="dropdown-header">
                <div className="dropdown-header-info">
                  <span className="dropdown-header-name">{user.name}</span>
                  <span className="dropdown-header-email">{user.email || user.phone}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              
              <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                <FiUser className="dropdown-item-icon" size={16} />
                <span>{t('profile') || 'Profile'}</span>
              </Link>
              
              <Link to="/activity" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                <FiSettings className="dropdown-item-icon" size={16} />
                <span>{t('activity') || 'Activity'}</span>
              </Link>
              
              <div className="dropdown-divider"></div>
              
              <Button unstyled type="button" className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                <FiLogOut className="dropdown-item-icon" size={16} />
                <span>{t('logout') || 'Log out'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-ghost btn-sm">
              {t('nav_login') || 'Log in'}
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              {t('nav_join') || 'Sign up'}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

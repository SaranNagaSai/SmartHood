import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import {
  FiHome,
  FiBriefcase,
  FiAlertCircle,
  FiMap,
  FiCalendar,
  FiBell,
  FiMessageSquare,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiBookOpen,
  FiBarChart2,
  FiShield
} from 'react-icons/fi';
import logo from '../../assets/images/Smart Hood Logo.png';
import Button from "../ui/Button";

/**
 * Sidebar Component - Primary navigation for SmartHood
 * 
 * Design Features:
 * - Collapsible with smooth transitions
 * - Grouped navigation sections
 * - Active state indicators
 * - Notification badges
 * - User role-based menu items
 */
const Sidebar = ({ collapsed, open, onClose, isMobile }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const isAdmin = user?.role && String(user.role).toLowerCase() === 'admin';

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation structure
  const mainNavItems = [
    { 
      path: '/home', 
      icon: FiHome, 
      label: t('nav_home') || 'Home',
      end: true 
    },
    { 
      path: '/services', 
      icon: FiBriefcase, 
      label: t('services') || 'Services',
    },
    { 
      path: '/emergency', 
      icon: FiAlertCircle, 
      label: t('nav_emergencies') || 'Emergency',
      badge: null // Could show count of active emergencies
    },
    { 
      path: '/tourism', 
      icon: FiMap, 
      label: 'Tourism',
    },
    { 
      path: '/events', 
      icon: FiCalendar, 
      label: t('events') || 'Events',
    },
  ];

  const communityNavItems = [
    { 
      path: '/notifications', 
      icon: FiBell, 
      label: t('nav_notifications') || 'Notifications',
      badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null
    },
    { 
      path: '/complaints', 
      icon: FiMessageSquare, 
      label: t('complaints') || 'Complaints',
    },
    { 
      path: '/explore', 
      icon: FiUsers, 
      label: t('explore') || 'Explore',
    },
  ];

  // Admin & Student specific items
  const roleBasedItems = [];
  
  if (user?.isStudent) {
    roleBasedItems.push({
      path: '/student-dashboard',
      icon: FiBookOpen,
      label: t('student_dashboard') || 'Student Hub',
    });
  }
  
  if (isAdmin) {
    roleBasedItems.push({
      path: '/admin/dashboard',
      icon: FiBarChart2,
      label: 'Admin Dashboard',
    });
    roleBasedItems.push({
      path: '/admin',
      icon: FiShield,
      label: 'Admin Panel',
    });
  }

  const bottomNavItems = [
    { 
      path: '/profile', 
      icon: FiSettings, 
      label: t('profile') || 'Settings',
    },
  ];

  const NavItem = ({ item }) => (
    <Link
      to={item.path}
      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
      onClick={isMobile ? onClose : undefined}
      title={collapsed ? item.label : undefined}
    >
      <span className="nav-item-icon">
        <item.icon size={20} />
      </span>
      {!collapsed && (
        <>
          <span className="nav-item-text">{item.label}</span>
          {item.badge && (
            <span className="nav-item-badge">{item.badge}</span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="nav-item-badge">{item.badge}</span>
      )}
    </Link>
  );

  const sidebarClasses = [
    'sidebar',
    collapsed && !isMobile ? 'collapsed' : '',
    isMobile && open ? 'open' : ''
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClasses}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <Link to="/home" className="sidebar-logo">
          <img src={logo} alt="SmartHood" />
          {!collapsed && <span className="sidebar-logo-text">SmartHood</span>}
        </Link>
        
        {isMobile ? (
          <Button
            unstyled
            className="sidebar-toggle"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </Button>
        ) : (
          <Button
            unstyled
            className="sidebar-toggle"
            onClick={() => {}}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ display: 'none' }} // Hidden, toggle is in navbar
          >
            {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </Button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {/* Main Section */}
        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-title">Main</div>}
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        {/* Community Section */}
        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-title">Community</div>}
          {communityNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        {/* Role-based Section */}
        {roleBasedItems.length > 0 && (
          <div className="sidebar-section">
            {!collapsed && (
              <div className="sidebar-section-title">
                {isAdmin ? 'Administration' : 'Student'}
              </div>
            )}
            {roleBasedItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * AppLayout - Main application shell with sidebar navigation
 * 
 * Design Philosophy:
 * - Fixed sidebar for consistent navigation
 * - Sticky top navbar for context and actions  
 * - Scrollable main content area
 * - Responsive: sidebar collapses on tablet, drawer on mobile
 */
const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        open={sidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />
      
      {/* Mobile Sidebar Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar 
          onMenuClick={toggleSidebar}
          isMobile={isMobile}
        />
        
        <main className="page-container">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

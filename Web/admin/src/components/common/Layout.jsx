import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from '../../styles/common/Layout.module.css';

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };
  
  return (
    <div className={styles.adminLayout}>
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isMobile={isMobile}
        onCollapse={handleSidebarCollapse}
      />
      
      {isMobile && sidebarOpen && (
        <div 
          className={`${styles.sidebarOverlay} ${styles.active}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`${styles.adminMain} ${sidebarCollapsed && !isMobile ? styles.sidebarCollapsed : ''}`}>
        <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <main className={styles.adminContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
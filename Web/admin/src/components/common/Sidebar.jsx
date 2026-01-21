import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiGrid, 
  FiUsers, 
  FiSettings,
  FiMenu,
  FiX
} from 'react-icons/fi';
import styles from '../../styles/common/Sidebar.module.css';

const menuItems = [
  {
    path: '/dashboard',
    icon: FiHome,
    label: 'Dashboard',
    badge: null
  },
  {
    path: '/bookings',
    icon: FiCalendar,
    label: 'Bookings',
    badge: null
  },
  // {
  //   path: '/services',
  //   icon: FiGrid,
  //   label: 'Services',
  //   badge: null
  // },
  // {
  //   path: '/users',
  //   icon: FiUsers,
  //   label: 'Users',
  //   badge: null
  // },
  // {
  //   path: '/analytics',
  //   icon: FiGrid,
  //   label: 'Analytics',
  //   badge: null
  // },
  // {
  //   path: '/settings',
  //   icon: FiSettings,
  //   label: 'Settings',
  //   badge: null
  // }
];

export default function Sidebar({ isOpen, setIsOpen, isMobile, onCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
  }, [isCollapsed, onCollapse]);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <aside className={`${styles.adminSidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobile && isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          {!isCollapsed && <span className={styles.logoBadge}>UM</span>}
          {!isCollapsed && <span className={styles.logoText}>Admin</span>}
        </div>
        <button
          className={styles.sidebarToggle}
          onClick={toggleSidebar}
        >
          {isCollapsed || (isMobile && !isOpen) ? <FiMenu /> : <FiX />}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} className={styles.navItem}>
                <NavLink
                  to={item.path}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  onClick={() => isMobile && setIsOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent className={styles.navIcon} />
                  {!isCollapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge && (
                        <span className={styles.navBadge}>{item.badge}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
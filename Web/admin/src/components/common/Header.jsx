import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import { 
  FiBell, 
  FiSearch, 
  FiUser, 
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiMenu
} from 'react-icons/fi';
import styles from '../../styles/common/Header.module.css';

export default function Header({ toggleSidebar, isMobile }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      title: 'New booking received',
      message: 'AC Installation service booked by Rajesh Kumar',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      title: 'Service completed',
      message: 'Plumbing service completed successfully',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'Payment received',
      message: 'Payment of ₹1,050 received for booking #1234',
      time: '3 hours ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className={styles.adminHeader}>
      <div className={styles.headerRight}>
        {/* Notifications */}
        <div className={styles.headerItem}>
          {showNotifications && (
            <div className={styles.notificationsDropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                <span className={styles.notificationCount}>{unreadCount} new</span>
              </div>
              <div className={styles.notificationsList}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${notification.unread ? styles.unread : ''}`}
                  >
                    <div className={styles.notificationContent}>
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className={styles.notificationTime}>{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.dropdownFooter}>
                <button className={styles.viewAllBtn}>View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.headerItem}>
          <button
            className={styles.profileBtn}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className={styles.profileAvatar}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.name || 'Admin'}</span>
              <span className={styles.profileRole}>Administrator</span>
            </div>
            <FiChevronDown className={styles.profileArrow} />
          </button>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.profileDetails}>
                  <div className={`${styles.profileAvatar} ${styles.large}`}>
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className={styles.profileText}>
                    <h3>{user?.name || 'Admin User'}</h3>
                    <p>{user?.email || 'admin@bagajatin.com'}</p>
                  </div>
                </div>
              </div>
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={() => navigate('/bookings')}>
                  <FiUser />
                  Bookings
                </button>
                <button className={styles.dropdownItem} onClick={() => navigate('/services')}>
                  <FiSettings />
                  Services
                </button>
                <hr className={styles.dropdownDivider} />
                <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={logout}>
                  <FiLogOut />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {(showProfileDropdown || showNotifications) && (
        <div
          className={styles.dropdownOverlay}
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}
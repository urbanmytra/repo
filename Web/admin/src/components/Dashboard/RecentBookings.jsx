import React from 'react';
import { FiEye, FiClock, FiMapPin, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import styles from '../../styles/Dashboard/RecentBookings.module.css';

const statusConfig = {
  pending: { color: 'orange', label: 'Pending' },
  confirmed: { color: 'blue', label: 'Confirmed' },
  'in-progress': { color: 'purple', label: 'In Progress' },
  completed: { color: 'green', label: 'Completed' },
  cancelled: { color: 'red', label: 'Cancelled' }
};

export default function RecentBookings({ data, loading, onRefresh, onViewAll }) {
  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`${styles.statusBadge} ${styles[config.color]}`}>
        {config.label}
      </span>
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  if (loading) {
    return (
      <div className={styles.recentBookingsCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Bookings</h3>
          <FiRefreshCw className={styles.spinning} />
        </div>
        <div className={styles.loadingContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.bookingItemSkeleton}>
              <div className={styles.skeletonAvatar}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine}></div>
                <div className={`${styles.skeletonLine} ${styles.short}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentBookings = data || [];

  return (
    <div className={styles.recentBookingsCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Recent Bookings</h3>
        <div className={styles.cardActions}>
          {onRefresh && (
            <button className={`${styles.refreshBtn} btn btn-outline`} onClick={onRefresh}>
              <FiRefreshCw />
            </button>
          )}
        </div>
      </div>

      <div className={styles.bookingsListCompact}>
        {recentBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No recent bookings</p>
          </div>
        ) : (
          recentBookings.map((booking) => (
            <div key={booking._id} className={styles.bookingItemCompact}>
              <div className={styles.bookingMain}>
                <div className={styles.customerSection}>
                  <div className={styles.customerAvatar}>
                    {booking.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className={styles.customerInfo}>
                    <h4 className={styles.customerName}>
                      {booking.user?.name || 'Unknown User'}
                    </h4>
                    <p className={styles.bookingService}>
                      {booking.service?.name || 'Service not found'}
                    </p>
                  </div>
                </div>

                <div className={styles.bookingDetails}>
                  <div className={styles.bookingAmount}>
                    ₹{(booking.pricing?.totalAmount || booking.amount || 0).toLocaleString()}
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              <div className={styles.bookingFooter}>
                <div className={styles.bookingMeta}>
                  <span className={styles.bookingTime}>
                    <FiClock size={12} />
                    {formatTime(booking.createdAt)}
                  </span>
                  <span className={styles.bookingLocation}>
                    <FiMapPin size={12} />
                    {booking.address ? 
                      `${booking.address.city}, ${booking.address.state}` :
                      booking.location || 'Location not specified'
                    }
                  </span>
                </div>
                
                <button 
                  className={styles.viewBookingBtn}
                  onClick={() => onViewAll && onViewAll(booking)}
                >
                  <FiEye size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
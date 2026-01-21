import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiEdit, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiClock,
  FiUser,
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';
import { usersAPI, bookingsAPI } from '../../utils/api';
import styles from '../../styles/Users/UserDetails.module.css';

export default function UserDetails({ user, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [userBookings, setUserBookings] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && activeTab === 'bookings') {
      loadUserBookings();
    }
    if (user && activeTab === 'activity') {
      loadUserActivity();
    }
  }, [user, activeTab]);

  const loadUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsAPI.getBookings({ 
        user: user._id,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
      });
      
      if (response.success) {
        setUserBookings(response.data);
      }
    } catch (error) {
      console.error('Failed to load user bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      // You'll need to implement this API endpoint
      // const response = await usersAPI.getUserActivity(user._id);
      
      // Mock data for now
      setUserActivity([
        {
          id: 1,
          type: 'booking_created',
          title: 'Booked AC Installation Service',
          description: 'Booking ID: BK001 • Amount: ₹1,050',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          icon: 'calendar'
        },
        {
          id: 2,
          type: 'review_created',
          title: 'Rated Electrical Repair Service',
          description: 'Given 4-star rating with positive feedback',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          icon: 'star'
        },
        {
          id: 3,
          type: 'profile_updated',
          title: 'Updated Profile Information',
          description: 'Changed phone number and address',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          icon: 'user'
        }
      ]);
    } catch (error) {
      console.error('Failed to load user activity:', error);
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking_created':
      case 'booking_updated':
        return <FiCalendar />;
      case 'review_created':
        return <FiStar />;
      case 'profile_updated':
        return <FiUser />;
      default:
        return <FiActivity />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  if (!user) return null;

  const userStats = {
    totalBookings: user.stats?.totalBookings || 0,
    completedBookings: user.stats?.completedBookings || 0,
    cancelledBookings: user.stats?.cancelledBookings || 0,
    totalSpent: user.stats?.totalSpent || 0,
    averageRating: user.stats?.averageRating || 0,
    memberSince: user.createdAt
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.userDetailsModal} ${styles.large}`}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.userHeaderInfo}>
              <img 
                src={user.avatar || user.profileImage || '/default-avatar.jpg'} 
                alt={user.name} 
                className={styles.userAvatarLarge}
                onError={(e) => {
                  e.target.src = '/default-avatar.jpg';
                }}
              />
              <div className={styles.userBasicInfo}>
                <h2 className={styles.userName}>{user.name}</h2>
                <p className={styles.userEmail}>{user.email}</p>
                <span className={`${styles.statusBadge} ${user.status || 'active'}`}>
                  {user.status || 'active'}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btn-outline" onClick={() => onEdit(user)}>
              <FiEdit />
              Edit User
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.modalTabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings ({userStats.totalBookings})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'activity' ? styles.active : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>

        <div className={styles.modalContent}>
          {activeTab === 'profile' && (
            <div className={styles.profileTab}>
              <div className={styles.profileGrid}>
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>
                    <FiUser />
                    Personal Information
                  </h3>
                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Full Name:</span>
                      <span className={styles.infoValue}>{user.name}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Email:</span>
                      <span className={styles.infoValue}>
                        <FiMail />
                        {user.email}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Phone:</span>
                      <span className={styles.infoValue}>
                        <FiPhone />
                        {user.phone || 'Not provided'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Role:</span>
                      <span className={styles.infoValue}>{user.role || 'user'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Member Since:</span>
                      <span className={styles.infoValue}>
                        <FiCalendar />
                        {formatDate(userStats.memberSince)}
                      </span>
                    </div>
                  </div>

                  {user.address && (
                    <div className={styles.addressSection}>
                      <h4>Address</h4>
                      <div className={styles.addressInfo}>
                        <FiMapPin />
                        <div>
                          {user.address.street && <p>{user.address.street}</p>}
                          <p>
                            {user.address.city}, {user.address.state} {user.address.zipCode}
                          </p>
                          <p>{user.address.country}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.statsSection}>
                  <h3 className={styles.sectionTitle}>User Statistics</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <FiCalendar />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statValue}>{userStats.totalBookings}</span>
                        <span className={styles.statLabel}>Total Bookings</span>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <FiDollarSign />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statValue}>₹{userStats.totalSpent.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Spent</span>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <FiStar />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statValue}>{userStats.averageRating || 'N/A'}</span>
                        <span className={styles.statLabel}>Average Rating</span>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <FiClock />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statValue}>{userStats.completedBookings}</span>
                        <span className={styles.statLabel}>Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className={styles.bookingsTab}>
              <div className={styles.tabHeader}>
                <h3>Booking History</h3>
                                <div className={styles.tabActions}>
                  <span className={styles.totalCount}>Total: {userBookings.length}</span>
                  <button className="btn btn-outline btn-sm" onClick={loadUserBookings}>
                    <FiRefreshCw />
                    Refresh
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className={styles.loadingContainer}>
                  <FiRefreshCw className={styles.spinning} />
                  <p>Loading bookings...</p>
                </div>
              ) : error ? (
                <div className={styles.errorContainer}>
                  <p>{error}</p>
                  <button className="btn btn-primary" onClick={loadUserBookings}>
                    Retry
                  </button>
                </div>
              ) : userBookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No bookings found for this user</p>
                </div>
              ) : (
                <div className={styles.bookingsList}>
                  {userBookings.map((booking) => (
                    <div key={booking._id} className={styles.bookingItem}>
                      <div className={styles.bookingMain}>
                        <div className={styles.bookingInfo}>
                          <h4 className={styles.serviceName}>
                            {booking.service?.name || 'Service not found'}
                          </h4>
                          <p className={styles.providerName}>
                            by {booking.provider?.name || 'Provider not assigned'}
                          </p>
                          <span className={styles.bookingDate}>
                            {formatDate(booking.scheduledDate || booking.createdAt)}
                          </span>
                        </div>
                        <div className={styles.bookingMeta}>
                          <span className={styles.bookingAmount}>
                            ₹{(booking.pricing?.totalAmount || 0).toLocaleString()}
                          </span>
                          <span className={`${styles.statusBadge} ${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      {booking.rating && (
                        <div className={styles.bookingRating}>
                          <span className={styles.ratingLabel}>Rating:</span>
                          <div className={styles.ratingStars}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FiStar 
                                key={i} 
                                className={`${styles.star} ${i < booking.rating ? styles.filled : ''}`} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className={styles.activityTab}>
              <div className={styles.tabHeader}>
                <h3>Recent Activity</h3>
                <button className="btn btn-outline btn-sm" onClick={loadUserActivity}>
                  <FiRefreshCw />
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <div className={styles.loadingContainer}>
                  <FiRefreshCw className={styles.spinning} />
                  <p>Loading activity...</p>
                </div>
              ) : error ? (
                <div className={styles.errorContainer}>
                  <p>{error}</p>
                  <button className="btn btn-primary" onClick={loadUserActivity}>
                    Retry
                  </button>
                </div>
              ) : userActivity.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent activity found</p>
                </div>
              ) : (
                <div className={styles.activityTimeline}>
                  {userActivity.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className={styles.activityContent}>
                        <h4>{activity.title}</h4>
                        <p>{activity.description}</p>
                        <span className={styles.activityTime}>
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
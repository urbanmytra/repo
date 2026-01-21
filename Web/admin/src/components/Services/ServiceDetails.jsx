import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiEdit, 
  FiTrash2, 
  FiStar, 
  FiUsers, 
  FiDollarSign,
  FiClock,
  FiShield,
  FiMapPin,
  FiTrendingUp,
  FiRefreshCw
} from 'react-icons/fi';
import { servicesAPI, bookingsAPI, reviewsAPI, analyticsAPI } from '../../utils/api';
import styles from '../../styles/Services/ServiceDetails.module.css';

export default function ServiceDetails({ service, onClose, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentBookings, setRecentBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (service) {
      loadTabData();
    }
  }, [service, activeTab]);

  const loadTabData = async () => {
    if (!service) return;

    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case 'bookings':
          await loadRecentBookings();
          break;
        case 'reviews':
          await loadReviews();
          break;
        case 'analytics':
          await loadAnalytics();
          break;
        default:
          // For overview tab, we don't need to load additional data
          break;
      }
    } catch (error) {
      console.error('Failed to load tab data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentBookings = async () => {
    try {
      const response = await bookingsAPI.getBookings({
        service: service._id,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
      });

      if (response.success) {
        setRecentBookings(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load recent bookings:', error);
      throw error;
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getReviews({
        service: service._id,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
      });

      if (response.success) {
        setReviews(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      throw error;
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await servicesAPI.getServiceAnalytics(service._id);

      if (response.success) {
        setAnalytics(response.data);
      } else {
                // Fallback to mock data if API not implemented
        setAnalytics({
          totalBookings: service.stats?.totalBookings || 0,
          totalRevenue: service.stats?.totalRevenue || 0,
          averageRating: service.ratings?.averageRating || 0,
          completionRate: service.stats?.completionRate || 0,
          monthlyTrend: [
            { month: 'Jan', bookings: 35, revenue: 36750 },
            { month: 'Feb', bookings: 42, revenue: 44100 },
            { month: 'Mar', bookings: 38, revenue: 39900 },
            { month: 'Apr', bookings: 27, revenue: 28350 }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Set fallback data
      setAnalytics({
        totalBookings: service.stats?.totalBookings || 0,
        totalRevenue: service.stats?.totalRevenue || 0,
        averageRating: service.ratings?.averageRating || 0,
        completionRate: service.stats?.completionRate || 0,
        monthlyTrend: []
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      try {
        await onDelete(service);
      } catch (error) {
        console.error('Failed to delete service:', error);
        setError('Failed to delete service: ' + error.message);
      }
    }
  };

  if (!service) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.serviceDetailsModal} ${styles.large}`}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>{service.name}</h2>
            <div className={styles.serviceMeta}>
              <span className={styles.categoryBadge}>{service.category}</span>
              <span className={`${styles.statusBadge} ${service.status}`}>
                {service.status}
              </span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btn-outline" onClick={() => onEdit(service)}>
              <FiEdit />
              Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <FiTrash2 />
              Delete
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.modalTabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings ({service.stats?.totalBookings || 0})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({service.ratings?.totalReviews || 0})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className={styles.modalContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              <div className={styles.serviceOverviewGrid}>
                <div className={styles.serviceImageSection}>
                  <img 
                    src={service.images?.[0] || '/default-service.jpg'} 
                    alt={service.name} 
                    className={styles.serviceImage}
                    onError={(e) => {
                      e.target.src = '/default-service.jpg';
                    }}
                  />
                  <div className={styles.quickStats}>
                    <div className={styles.statItem}>
                      <FiStar className={styles.statIcon} />
                      <div className={styles.statContent}>
                        <span className={styles.statValue}>
                          {service.ratings?.averageRating || 0}
                        </span>
                        <span className={styles.statLabel}>Rating</span>
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <FiUsers className={styles.statIcon} />
                      <div className={styles.statContent}>
                        <span className={styles.statValue}>
                          {service.stats?.totalBookings || 0}
                        </span>
                        <span className={styles.statLabel}>Bookings</span>
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <FiDollarSign className={styles.statIcon} />
                      <div className={styles.statContent}>
                        <span className={styles.statValue}>
                          ₹{service.pricing?.basePrice || 0}
                        </span>
                        <span className={styles.statLabel}>Base Price</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.serviceDetailsSection}>
                  <div className={styles.detailGroup}>
                    <h3>Service Information</h3>
                    <div className={styles.detailList}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Provider:</span>
                        <span className={styles.detailValue}>
                          {service.provider?.name || 'Not assigned'}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Category:</span>
                        <span className={styles.detailValue}>{service.category}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Duration:</span>
                        <span className={styles.detailValue}>
                          {service.duration || 'Not specified'}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Warranty:</span>
                        <span className={styles.detailValue}>
                          {service.warranty || 'Not specified'}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Created:</span>
                        <span className={styles.detailValue}>
                          {service.createdAt ? 
                            new Date(service.createdAt).toLocaleDateString('en-IN') : 
                            'Unknown'
                          }
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Last Updated:</span>
                        <span className={styles.detailValue}>
                          {service.updatedAt ? 
                            new Date(service.updatedAt).toLocaleDateString('en-IN') : 
                            'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailGroup}>
                    <h3>Description</h3>
                    <p className={styles.serviceDescription}>
                      {service.description || 'No description available'}
                    </p>
                  </div>

                  {service.features && service.features.length > 0 && (
                    <div className={styles.detailGroup}>
                      <h3>Features</h3>
                      <div className={styles.featuresGrid}>
                        {service.features.map((feature, index) => (
                          <div key={index} className={styles.featureItem}>
                            <FiShield className={styles.featureIcon} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.pricing && (
                    <div className={styles.detailGroup}>
                      <h3>Pricing Details</h3>
                      <div className={styles.pricingDetails}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Base Price:</span>
                          <span className={styles.detailValue}>
                            ₹{service.pricing.basePrice || 0}
                          </span>
                        </div>
                        {service.pricing.additionalCharges && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Additional Charges:</span>
                            <span className={styles.detailValue}>
                              ₹{service.pricing.additionalCharges}
                            </span>
                          </div>
                        )}
                        {service.pricing.discount && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Discount:</span>
                            <span className={styles.detailValue}>
                              {service.pricing.discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className={styles.bookingsTab}>
              <div className={styles.tabHeader}>
                <h3>Recent Bookings</h3>
                <div className={styles.tabActions}>
                  <span className={styles.totalCount}>
                    Total: {service.stats?.totalBookings || 0}
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={loadRecentBookings}>
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
                  <button className="btn btn-primary" onClick={loadRecentBookings}>
                    Retry
                  </button>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No bookings found for this service</p>
                </div>
              ) : (
                <div className={styles.bookingsList}>
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className={styles.bookingItem}>
                      <div className={styles.bookingInfo}>
                        <div className={styles.customerAvatar}>
                          {booking.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className={styles.bookingDetails}>
                          <h4>{booking.user?.name || 'Unknown User'}</h4>
                          <span className={styles.bookingDate}>
                            {booking.scheduledDate ? 
                              new Date(booking.scheduledDate).toLocaleDateString('en-IN') :
                              new Date(booking.createdAt).toLocaleDateString('en-IN')
                            }
                          </span>
                        </div>
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
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.reviewsTab}>
              <div className={styles.tabHeader}>
                <h3>Customer Reviews</h3>
                <div className={styles.ratingSummary}>
                  <FiStar className={styles.starIcon} />
                  <span className={styles.averageRating}>
                    {service.ratings?.averageRating || 0}
                  </span>
                  <span className={styles.ratingCount}>
                    ({service.ratings?.totalReviews || 0} reviews)
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={loadReviews}>
                    <FiRefreshCw />
                    Refresh
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className={styles.loadingContainer}>
                  <FiRefreshCw className={styles.spinning} />
                  <p>Loading reviews...</p>
                </div>
              ) : error ? (
                <div className={styles.errorContainer}>
                  <p>{error}</p>
                  <button className="btn btn-primary" onClick={loadReviews}>
                    Retry
                  </button>
                </div>
              ) : reviews.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No reviews found for this service</p>
                </div>
              ) : (
                <div className={styles.reviewsList}>
                  {reviews.map((review) => (
                    <div key={review._id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewerInfo}>
                          <div className={styles.reviewerAvatar}>
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className={styles.reviewerDetails}>
                            <h4>{review.user?.name || 'Anonymous'}</h4>
                            <span className={styles.reviewDate}>
                              {review.createdAt ? 
                                new Date(review.createdAt).toLocaleDateString('en-IN') : 
                                'Unknown date'
                              }
                            </span>
                          </div>
                        </div>
                        <div className={styles.reviewRating}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={`${styles.star} ${i < (review.rating || 0) ? styles.filled : ''}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className={styles.reviewComment}>
                        {review.comment || review.review || 'No comment provided'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className={styles.analyticsTab}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <FiRefreshCw className={styles.spinning} />
                  <p>Loading analytics...</p>
                </div>
              ) : error ? (
                <div className={styles.errorContainer}>
                  <p>{error}</p>
                  <button className="btn btn-primary" onClick={loadAnalytics}>
                    Retry
                  </button>
                </div>
              ) : analytics ? (
                <>
                  <div className={styles.analyticsStats}>
                    <div className={styles.statCard}>
                                            <div className={styles.statHeader}>
                        <FiUsers className={styles.statIcon} />
                        <span className={styles.statTitle}>Total Bookings</span>
                      </div>
                      <div className={styles.statValue}>{analytics.totalBookings || 0}</div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statHeader}>
                        <FiDollarSign className={styles.statIcon} />
                        <span className={styles.statTitle}>Total Revenue</span>
                      </div>
                      <div className={styles.statValue}>
                        ₹{(analytics.totalRevenue || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statHeader}>
                        <FiStar className={styles.statIcon} />
                        <span className={styles.statTitle}>Average Rating</span>
                      </div>
                      <div className={styles.statValue}>{analytics.averageRating || 0}</div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statHeader}>
                        <FiTrendingUp className={styles.statIcon} />
                        <span className={styles.statTitle}>Completion Rate</span>
                      </div>
                      <div className={styles.statValue}>{analytics.completionRate || 0}%</div>
                    </div>
                  </div>

                  {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 && (
                    <div className={styles.trendChart}>
                      <h4>Monthly Trends</h4>
                      <div className={styles.chartBars}>
                        {analytics.monthlyTrend.map((item, index) => {
                          const maxBookings = Math.max(...analytics.monthlyTrend.map(t => t.bookings));
                          return (
                            <div key={index} className={styles.chartItem}>
                              <div className={styles.chartBarContainer}>
                                <div 
                                  className={styles.chartBar}
                                  style={{ 
                                    height: maxBookings > 0 ? `${(item.bookings / maxBookings) * 100}%` : '0%'
                                  }}
                                />
                                <span className={styles.barValue}>{item.bookings}</span>
                              </div>
                              <span className={styles.chartLabel}>{item.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.emptyState}>
                  <p>No analytics data available</p>
                  <button className="btn btn-primary" onClick={loadAnalytics}>
                    <FiRefreshCw />
                    Load Analytics
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// src/components/ServiceDetails/Reviews.jsx
import React, { useState, useEffect, useRef } from 'react';
import s from '../../assets/css/components/ServiceDetails/Reviews.module.css';
import { FiStar, FiThumbsUp, FiFilter, FiUser } from 'react-icons/fi';
import { reviewsAPI, apiUtils } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReviewFormModal from './ReviewFormModal';

export default function Reviews({ serviceId, providerId }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [helpfulReviews, setHelpfulReviews] = useState(new Set());
  const [ratingBreakdown, setRatingBreakdown] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Prevent duplicate requests
  const fetchedRef = useRef(false);
  const abortControllerRef = useRef(null);
  const lastServiceIdRef = useRef(null);

  useEffect(() => {
    // Only fetch if serviceId exists and has changed
    if (!serviceId || lastServiceIdRef.current === serviceId) return;
    
    // Prevent duplicate fetch in React Strict Mode
    if (fetchedRef.current && lastServiceIdRef.current === serviceId) return;

    lastServiceIdRef.current = serviceId;
    fetchedRef.current = true;

    fetchReviews();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [serviceId]); // Only depend on serviceId

  // Separate effect for calculating stats (runs when reviews change)
  useEffect(() => {
    calculateRatingStats();
  }, [reviews]);

  const fetchReviews = async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      
      const params = {
        service: serviceId,
        status: 'approved',
        limit: 100,
        sort: '-createdAt'
      };

      const response = await reviewsAPI.getReviews(params, {
        signal: abortControllerRef.current.signal
      });
      
      const result = apiUtils.formatResponse(response);
      
      if (result.success) {
        setReviews(result.data);
        
        // Update helpful reviews
        if (isAuthenticated && user) {
          const userHelpfulReviews = new Set();
          result.data.forEach(review => {
            if (review.helpful?.users?.includes(user._id)) {
              userHelpfulReviews.add(review._id);
            }
          });
          setHelpfulReviews(userHelpfulReviews);
        }
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('Reviews request cancelled');
        return;
      }
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRatingStats = () => {
    if (!reviews || reviews.length === 0) {
      setRatingBreakdown({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      setAverageRating(0);
      setTotalReviews(0);
      return;
    }

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      breakdown[rating] = (breakdown[rating] || 0) + 1;
      totalRating += review.rating;
    });

    setRatingBreakdown(breakdown);
    setAverageRating(totalRating / reviews.length);
    setTotalReviews(reviews.length);
  };

  const toggleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?return=${returnUrl}`);
      return;
    }

    try {
      await reviewsAPI.markReviewHelpful(reviewId);
      
      const wasHelpful = helpfulReviews.has(reviewId);
      
      setHelpfulReviews(prev => {
        const newSet = new Set(prev);
        if (wasHelpful) {
          newSet.delete(reviewId);
        } else {
          newSet.add(reviewId);
        }
        return newSet;
      });

      setReviews(prev => prev.map(review => {
        if (review._id === reviewId) {
          return {
            ...review,
            helpful: {
              ...review.helpful,
              count: (review.helpful?.count || 0) + (wasHelpful ? -1 : 1)
            }
          };
        }
        return review;
      }));

    } catch (error) {
      console.error('Failed to toggle helpful:', error);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewModal(false);
    fetchReviews(); // Refresh reviews
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?return=${returnUrl}`);
      return;
    }
    setShowReviewModal(true);
  };

  const getReviewerAvatar = (reviewer) => {
    if (reviewer?.avatar?.url) {
      return reviewer.avatar.url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewer?.name || 'User')}&background=6366f1&color=ffffff&size=50`;
  };

  const formatReviewDate = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // CLIENT-SIDE filtering (no API call)
  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => Math.round(review.rating) === parseInt(filter));

  // Don't render if no serviceId
  if (!serviceId) {
    return null;
  }
  return (
    <section className={s.wrap}>
      <div className={s.header}>
        <h3 className={s.title}>Customer Reviews</h3>
        <div className={s.filterContainer}>
          <FiFilter className={s.filterIcon} />
          <select 
            className={s.filter}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter reviews by rating"
          >
            <option value="all">All Reviews ({totalReviews})</option>
            <option value="5">5 Stars ({ratingBreakdown[5] || 0})</option>
            <option value="4">4 Stars ({ratingBreakdown[4] || 0})</option>
            <option value="3">3 Stars ({ratingBreakdown[3] || 0})</option>
            <option value="2">2 Stars ({ratingBreakdown[2] || 0})</option>
            <option value="1">1 Star ({ratingBreakdown[1] || 0})</option>
          </select>
        </div>
      </div>

      <div className={s.overview}>
        <div className={s.ratingOverview}>
          <div className={s.averageRating}>
            <span className={s.ratingNumber}>{averageRating.toFixed(1)}</span>
            <div className={s.ratingStars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <FiStar 
                  key={i} 
                  className={i <= Math.round(averageRating) ? s.star : s.starEmpty} 
                  fill={i <= Math.round(averageRating) ? '#fbbf24' : 'none'}
                />
              ))}
            </div>
            <span className={s.totalReviews}>Based on {totalReviews} reviews</span>
          </div>
        </div>

        <div className={s.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className={s.ratingRow}>
              <span className={s.ratingLabel}>{stars} star</span>
              <div className={s.ratingBar}>
                <div 
                  className={s.ratingFill}
                  style={{ 
                    width: `${totalReviews > 0 ? (ratingBreakdown[stars] / totalReviews) * 100 : 0}%` 
                  }}
                />
              </div>
              <span className={s.ratingCount}>{ratingBreakdown[stars] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={s.loading}>Loading reviews...</div>
      ) : (
        <div className={s.reviewsList}>
          {filteredReviews.length === 0 ? (
            <div className={s.noReviews}>
              <p>No reviews found{filter !== 'all' ? ' for this filter' : ''}.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review._id} className={s.reviewItem}>
                <div className={s.reviewHeader}>
                  <div className={s.reviewerInfo}>
                    <img 
                      src={getReviewerAvatar(review.user)}
                      alt={review.user?.name || 'Reviewer'}
                      className={s.reviewerAvatar}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=User&background=6366f1&color=ffffff&size=50`;
                      }}
                    />
                    <div className={s.reviewerDetails}>
                      <div className={s.reviewerName}>
                        {review.user?.name || 'Anonymous User'}
                        {review.verified && (
                          <span className={s.verifiedBadge}>Verified</span>
                        )}
                      </div>
                      <div className={s.reviewDate}>{formatReviewDate(review.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className={s.reviewRating}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FiStar 
                        key={i} 
                        className={i <= Math.round(review.rating) ? s.starFilled : s.starEmpty}
                        fill={i <= Math.round(review.rating) ? '#fbbf24' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <h4 className={s.reviewTitle}>{review.title}</h4>
                )}

                <p className={s.reviewText}>{review.comment}</p>

                {/* Rating Breakdown */}
                {review.breakdown && Object.keys(review.breakdown).length > 0 && (
                  <div className={s.breakdown}>
                    {review.breakdown.quality && (
                      <div className={s.breakdownItem}>
                        <span>Quality:</span>
                        <div className={s.breakdownStars}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FiStar 
                              key={i} 
                              className={i <= review.breakdown.quality ? s.starMini : s.starMiniEmpty}
                              fill={i <= review.breakdown.quality ? '#fbbf24' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {review.breakdown.punctuality && (
                      <div className={s.breakdownItem}>
                        <span>Punctuality:</span>
                        <div className={s.breakdownStars}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FiStar 
                              key={i} 
                              className={i <= review.breakdown.punctuality ? s.starMini : s.starMiniEmpty}
                              fill={i <= review.breakdown.punctuality ? '#fbbf24' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {review.breakdown.behavior && (
                      <div className={s.breakdownItem}>
                        <span>Behavior:</span>
                        <div className={s.breakdownStars}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FiStar 
                              key={i} 
                              className={i <= review.breakdown.behavior ? s.starMini : s.starMiniEmpty}
                              fill={i <= review.breakdown.behavior ? '#fbbf24' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {review.breakdown.pricing && (
                      <div className={s.breakdownItem}>
                        <span>Pricing:</span>
                        <div className={s.breakdownStars}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FiStar 
                              key={i} 
                              className={i <= review.breakdown.pricing ? s.starMini : s.starMiniEmpty}
                              fill={i <= review.breakdown.pricing ? '#fbbf24' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pros and Cons - FIXED LOGIC */}
                {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
                  <div className={s.prosAndCons}>
                    {review.pros && review.pros.length > 0 && (
                      <div className={s.pros}>
                        <strong>Pros:</strong>
                        <ul>
                          {review.pros.map((pro, index) => (
                            <li key={index}>+ {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons && review.cons.length > 0 && (
                      <div className={s.cons}>
                        <strong>Cons:</strong>
                        <ul>
                          {review.cons.map((con, index) => (
                            <li key={index}>- {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className={s.reviewImages}>
                    {review.images.map((image, index) => (
                      <img 
                        key={index}
                        src={image.url}
                        alt={image.caption || 'Review image'}
                        className={s.reviewImage}
                      />
                    ))}
                  </div>
                )}

                {/* Provider Response */}
                {review.response && review.response.message && (
                  <div className={s.providerResponse}>
                    <div className={s.responseHeader}>
                      <FiUser className={s.responseIcon} />
                      <span>Response from provider</span>
                      <span className={s.responseDate}>
                        {formatReviewDate(review.response.respondedAt)}
                      </span>
                    </div>
                    <p className={s.responseText}>{review.response.message}</p>
                  </div>
                )}

                <div className={s.reviewActions}>
                  <button 
                    className={`${s.helpfulBtn} ${helpfulReviews.has(review._id) ? s.helpful : ''}`}
                    onClick={() => toggleHelpful(review._id)}
                    disabled={!isAuthenticated}
                    aria-label={`Mark review as helpful (${review.helpful?.count || 0} people found this helpful)`}
                    aria-pressed={helpfulReviews.has(review._id)}
                  >
                    <FiThumbsUp />
                    Helpful ({review.helpful?.count || 0})
                  </button>
                  
                  {review.wouldRecommend !== undefined && (
                    <div className={s.recommendation}>
                      {review.wouldRecommend ? '👍 Recommends' : '👎 Doesn\'t recommend'}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className={s.writeReview}>
        <h4 className={s.writeReviewTitle}>Write a Review</h4>
        <p className={s.writeReviewText}>
          Share your experience to help others make informed decisions
        </p>
        <button 
          className={s.writeReviewBtn}
          onClick={handleWriteReviewClick}
        >
          Write Review
        </button>
      </div>

      {/* Review Form Modal */}
      {showReviewModal && (
        <ReviewFormModal
          serviceId={serviceId}
          providerId={providerId}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSubmitted}
        />
      )}
    </section>
  );
}
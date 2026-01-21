// src/components/ServiceDetails/ReviewFormModal.jsx
import React, { useState } from 'react';
import s from '../../assets/css/components/ServiceDetails/ReviewFormModal.module.css';
import { FiX, FiStar } from 'react-icons/fi';
import { reviewsAPI, apiUtils } from '../../config/api';

export default function ReviewFormModal({ serviceId, providerId, bookingId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    rating: 0, // ✅ ADDED: Overall rating
    title: '',
    comment: '',
    breakdown: {
      quality: 0,
      punctuality: 0,
      behavior: 0,
      pricing: 0
    },
    pros: [''],
    cons: [''],
    wouldRecommend: true
  });
  const [hoveredRating, setHoveredRating] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (category, value) => {
    if (category === 'overall') {
      setFormData(prev => ({
        ...prev,
        rating: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        breakdown: {
          ...prev.breakdown,
          [category]: value
        }
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.rating) {
      setError('Please provide an overall rating');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Please provide a review comment');
      return;
    }

    if (!formData.breakdown.quality || !formData.breakdown.punctuality || 
        !formData.breakdown.behavior || !formData.breakdown.pricing) {
      setError('Please rate all detailed categories');
      return;
    }

    try {
      setLoading(true);

      // Prepare data
      const reviewData = {
        service: serviceId,
        provider: providerId,
        rating: formData.rating,
        title: formData.title.trim() || undefined,
        comment: formData.comment.trim(),
        breakdown: formData.breakdown,
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim()),
        wouldRecommend: formData.wouldRecommend
      };

      // Only add booking if provided
      if (bookingId) {
        reviewData.booking = bookingId;
      }

      console.log('Submitting review:', reviewData); // Debug

      const response = await reviewsAPI.createReview(reviewData);
      const result = apiUtils.formatResponse(response);

      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      
      // Extract detailed error message
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Failed to submit review. Please try again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const RatingStars = ({ category, label, value, required = false }) => (
    <div className={s.ratingField}>
      <label>
        {label} {required && <span className={s.required}>*</span>}
      </label>
      <div className={s.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={star <= (hoveredRating[category] || value) ? s.starActive : s.starInactive}
            onClick={() => handleRatingChange(category, star)}
            onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [category]: star }))}
            onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [category]: 0 }))}
            fill={star <= (hoveredRating[category] || value) ? '#fbbf24' : 'none'}
          />
        ))}
        <span className={s.ratingValue}>{value > 0 ? `${value}/5` : 'Not rated'}</span>
      </div>
    </div>
  );

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h3>Write a Review</h3>
          <button className={s.closeBtn} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          {error && (
            <div className={s.error}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* ✅ OVERALL RATING - REQUIRED */}
          <div className={s.overallRatingSection}>
            <h4>Overall Rating</h4>
            <RatingStars 
              category="overall" 
              label="How would you rate this service overall?" 
              value={formData.rating}
              required={true}
            />
          </div>

          {/* Detailed Rating Breakdown */}
          <div className={s.ratingsSection}>
            <h4>Detailed Ratings</h4>
            <RatingStars 
              category="quality" 
              label="Quality of Service" 
              value={formData.breakdown.quality}
              required={true}
            />
            <RatingStars 
              category="punctuality" 
              label="Punctuality" 
              value={formData.breakdown.punctuality}
              required={true}
            />
            <RatingStars 
              category="behavior" 
              label="Professional Behavior" 
              value={formData.breakdown.behavior}
              required={true}
            />
            <RatingStars 
              category="pricing" 
              label="Value for Money" 
              value={formData.breakdown.pricing}
              required={true}
            />
          </div>

          {/* Title */}
          {/* <div className={s.formGroup}>
            <label>Review Title (Optional)</label>
            <input
              type="text"
              placeholder="Summarize your experience"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              maxLength={100}
            />
          </div> */}

          {/* Comment */}
          <div className={s.formGroup}>
            <label>
              Your Review <span className={s.required}>*</span>
            </label>
            <textarea
              placeholder="Share details of your experience..."
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              required
              maxLength={1000}
              rows={5}
            />
            <span className={s.charCount}>{formData.comment.length}/1000</span>
          </div>

          {/* Pros */}
          <div className={s.formGroup}>
            <label>What did you like? (Pros)</label>
            {formData.pros.map((pro, index) => (
              <div key={index} className={s.arrayInput}>
                <input
                  type="text"
                  placeholder="e.g., Professional service"
                  value={pro}
                  onChange={(e) => handleArrayChange('pros', index, e.target.value)}
                />
                {formData.pros.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeArrayField('pros', index)}
                    className={s.removeBtn}
                    aria-label="Remove pro"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            {formData.pros.length < 5 && (
              <button 
                type="button" 
                onClick={() => addArrayField('pros')}
                className={s.addBtn}
              >
                + Add Pro
              </button>
            )}
          </div>

          {/* Cons */}
          <div className={s.formGroup}>
            <label>What could be improved? (Cons)</label>
            {formData.cons.map((con, index) => (
              <div key={index} className={s.arrayInput}>
                <input
                  type="text"
                  placeholder="e.g., Slight delay in arrival"
                  value={con}
                  onChange={(e) => handleArrayChange('cons', index, e.target.value)}
                />
                {formData.cons.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeArrayField('cons', index)}
                    className={s.removeBtn}
                    aria-label="Remove con"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            {formData.cons.length < 5 && (
              <button 
                type="button" 
                onClick={() => addArrayField('cons')}
                className={s.addBtn}
              >
                + Add Con
              </button>
            )}
          </div>

          {/* Would Recommend */}
          <div className={s.formGroup}>
            <label>
              Would you recommend this service? <span className={s.required}>*</span>
            </label>
            <div className={s.radioGroup}>
              <label className={s.radioLabel}>
                <input
                  type="radio"
                  name="recommend"
                  checked={formData.wouldRecommend === true}
                  onChange={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                />
                <span>👍 Yes, I recommend</span>
              </label>
              <label className={s.radioLabel}>
                <input
                  type="radio"
                  name="recommend"
                  checked={formData.wouldRecommend === false}
                  onChange={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                />
                <span>👎 No, I don't recommend</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className={s.formActions}>
            <button type="button" onClick={onClose} className={s.cancelBtn} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
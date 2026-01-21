// src/components/ServiceDetails/Description.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import s from '../../assets/css/components/ServiceDetails/Description.module.css';
import { FiStar, FiPhoneCall, FiMessageCircle, FiShare2, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Description({ service }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCurrentPrice = () => {
    return service?.pricing?.discountPrice || service?.pricing?.basePrice || 0;
  };

  const getOriginalPrice = () => {
    return service?.pricing?.basePrice || 0;
  };

  const getDiscountPercentage = () => {
    if (!service?.pricing?.discountPrice) return 0;
    const original = getOriginalPrice();
    const current = getCurrentPrice();
    return Math.round(((original - current) / original) * 100);
  };

  const handleBookService = () => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?return=${returnUrl}`);
      return;
    }
    navigate(`/book/${service._id}`, { state: { service } });
  };

  const handleCallProvider = () => {
    if (service?.provider?.phone) {
      window.location.href = `tel:${service.provider.phone}`;
    } else {
      alert('Provider contact information not available');
    }
  };

  const handleMessageProvider = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Navigate to messaging interface
    navigate(`/messages/${service.provider._id}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: service?.name,
      text: `Check out this service: ${service?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => alert('Failed to copy link'));
  };

  const truncateDescription = (text, maxLength = 300) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!service) {
    return (
      <section className={s.wrap}>
        <div className={s.loading}>Loading service details...</div>
      </section>
    );
  }

  return (
    <section className={s.wrap}>
      {/* Service Overview */}
      {/* <div className={s.overview}>
        <div className={s.rating}>
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar 
              key={i} 
              className={i < Math.round(service.ratings?.averageRating || 0) ? s.star : s.starEmpty} 
            />
          ))}
          <span className="muted">({service.ratings?.totalReviews || 0} Reviews)</span>
        </div>
        
        <h3 className="h3">{service.name}</h3>
        
        <div className={s.priceRow}>
          <span className={s.price}>{formatPrice(getCurrentPrice())}</span>
          {service.pricing?.discountPrice && (
            <span className={s.old}>{formatPrice(getOriginalPrice())}</span>
          )}
          {getDiscountPercentage() > 0 && (
            <span className={s.discount}>{getDiscountPercentage()}% OFF</span>
          )}
        </div>
        
        <button className="btn btn-primary" onClick={handleBookService}>
          Book Service
        </button>

        <div className={s.quick}>
          <button className="btn btn-outline" onClick={handleCallProvider}>
            <FiPhoneCall /> Call
          </button>
          <button className="btn btn-outline" onClick={handleMessageProvider}>
            <FiMessageCircle /> Message
          </button>
          <button className="btn btn-outline" onClick={handleShare}>
            <FiShare2 /> Share
          </button>
        </div>
      </div> */}

      {/* Service Description */}
      <div className={s.description}>
        <h4 className={s.sectionTitle}>Service Description</h4>
        <div className={s.content}>
          <p>
            {showFullDescription 
              ? service.description 
              : truncateDescription(service.description)
            }
          </p>
          {service.description && service.description.length > 300 && (
            <button 
              className={s.toggleBtn}
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>

      {/* Service Features */}
      {service.features && service.features.length > 0 && (
        <div className={s.features}>
          <h4 className={s.sectionTitle}>What's Included</h4>
          <ul className={s.featureList}>
            {service.features.map((feature, index) => (
              <li key={index} className={s.featureItem}>
                <FiInfo className={s.featureIcon} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Service Inclusions */}
      {service.inclusions && service.inclusions.length > 0 && (
        <div className={s.inclusions}>
          <h4 className={s.sectionTitle}>Service Includes</h4>
          <ul className={s.inclusionList}>
            {service.inclusions.map((inclusion, index) => (
              <li key={index} className={s.inclusionItem}>
                ✓ {inclusion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Service Exclusions */}
      {service.exclusions && service.exclusions.length > 0 && (
        <div className={s.exclusions}>
          <h4 className={s.sectionTitle}>Not Included</h4>
          <ul className={s.exclusionList}>
            {service.exclusions.map((exclusion, index) => (
              <li key={index} className={s.exclusionItem}>
                ✗ {exclusion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Service Requirements */}
      {service.requirements && service.requirements.length > 0 && (
        <div className={s.requirements}>
          <h4 className={s.sectionTitle}>Requirements</h4>
          <ul className={s.requirementList}>
            {service.requirements.map((requirement, index) => (
              <li key={index} className={s.requirementItem}>
                <FiInfo className={s.requirementIcon} />
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warranty Information */}
      {service.warranty && (
        <div className={s.warranty}>
          <h4 className={s.sectionTitle}>Warranty</h4>
          <div className={s.warrantyContent}>
            <p><strong>Duration:</strong> {service.warranty.duration}</p>
            {service.warranty.terms && (
              <p><strong>Terms:</strong> {service.warranty.terms}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
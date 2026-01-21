// src/components/ServiceDetails/ServiceInfo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import s from '../../assets/css/components/ServiceDetails/ServiceInfo.module.css';
import { FiStar, FiMapPin, FiClock, FiShield, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function ServiceInfo({ service, onBookService }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCurrentPrice = () => {
    return service.pricing?.discountPrice || service.pricing?.basePrice || 0;
  };

  const getOriginalPrice = () => {
    return service.pricing?.basePrice || 0;
  };

  const getDiscountPercentage = () => {
    if (!service.pricing?.discountPrice) return 0;
    const original = getOriginalPrice();
    const current = getCurrentPrice();
    return Math.round(((original - current) / original) * 100);
  };

  const getTotalPrice = () => {
    return getCurrentPrice() * quantity;
  };

  const handleBookService = () => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?return=${returnUrl}`);
      return;
    }
    navigate(`/book/${service._id}`, { state: { service } });
  };

  if (!service) {
    return (
      <section className={s.wrap}>
        <div className={s.loading}>Loading service information...</div>
      </section>
    );
  }

  return (
    <section className={s.wrap}>
      <div className={s.header}>
        <div className={s.titleSection}>
          <h1 className={s.title}>{service.name}</h1>
          <div className={s.meta}>
            <div className={s.rating}>
              <div className={s.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={i < Math.round(service.ratings?.averageRating || 0) ? s.star : s.starEmpty} 
                  />
                ))}
              </div>
              <span className={s.ratingText}>
                {service.ratings?.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className={s.reviewCount}>
                ({service.ratings?.totalReviews || 0} Reviews)
              </span>
            </div>
            
            <div className={s.location}>
              <FiMapPin />
              <span>
                Available in {service.serviceArea?.cities?.join(', ') || 'Multiple cities'}
              </span>
            </div>
          </div>
        </div>

        <div className={s.priceSection}>
          <div className={s.pricing}>
            <span className={s.price}>{formatPrice(getCurrentPrice())}</span>
            {service.pricing?.discountPrice && (
              <>
                <span className={s.oldPrice}>{formatPrice(getOriginalPrice())}</span>
                <span className={s.discount}>{getDiscountPercentage()}% OFF</span>
              </>
            )}
          </div>
          <p className={s.priceNote}>*Inclusive of all taxes</p>
        </div>
      </div>

      <div className={s.features}>
        {service.warranty?.duration && (
          <div className={s.feature}>
            <FiShield />
            <span>{service.warranty.duration} Warranty</span>
          </div>
        )}
        
        <div className={s.feature}>
          <FiClock />
          <span>
            {service.availability?.isAvailable ? 'Same Day Service' : 'Scheduled Service'}
          </span>
        </div>
        
        {service.provider?.verification?.status === 'verified' && (
          <div className={s.feature}>
            <FiUsers />
            <span>Verified Professional</span>
          </div>
        )}
        
        <div className={s.feature}>
          <FiClock />
          <span>Duration: {service.duration?.estimated || 'As per requirement'}</span>
        </div>
      </div>

      <div className={s.booking}>
        {/* <div className={s.quantitySelector}>
          <label className={s.quantityLabel}>Quantity:</label>
          <div className={s.quantityControls}>
            <button 
              className={s.quantityBtn}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className={s.quantity}>{quantity}</span>
            <button 
              className={s.quantityBtn}
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div> */}

        <button 
          className={s.bookBtn}
          onClick={handleBookService}
          disabled={!service.availability?.isAvailable}
        >
          {service.availability?.isAvailable 
            ? `Book Service - ${formatPrice(getTotalPrice())}` 
            : 'Currently Unavailable'
          }
        </button>
      </div>

      {service.shortDescription && (
        <div className={s.shortDescription}>
          <p>{service.shortDescription}</p>
        </div>
      )}
    </section>
  );
}
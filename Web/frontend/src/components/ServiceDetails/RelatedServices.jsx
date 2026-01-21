// src/components/ServiceDetails/RelatedServices.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import s from '../../assets/css/components/ServiceDetails/RelatedServices.module.css';
import { 
  FiStar, 
  FiHeart, 
  FiMapPin, 
  FiClock, 
  FiShield,
  FiArrowRight
} from 'react-icons/fi';
import { servicesAPI, usersAPI, apiUtils } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function RelatedServices({ services: initialServices = [], currentServiceId }) {
  const [services, setServices] = useState(initialServices);
  const [favorites, setFavorites] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingFavorites, setUpdatingFavorites] = useState(new Set());
  const sectionRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (initialServices.length === 0 && currentServiceId) {
      fetchRelatedServices();
    } else {
      setServices(initialServices);
    }
  }, [initialServices, currentServiceId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserFavorites();
    }
  }, [isAuthenticated, user]);

  const fetchRelatedServices = async () => {
    try {
      setLoading(true);
      // Get the current service first to find related services by category
      const currentServiceResponse = await servicesAPI.getService(currentServiceId);
      const currentService = apiUtils.formatResponse(currentServiceResponse);
      
      if (currentService.success) {
        const category = currentService.data.category;
        const relatedResponse = await servicesAPI.getServicesByCategory(category, {
          limit: 4
        });
        
        const result = apiUtils.formatResponse(relatedResponse);
        if (result.success) {
          // Filter out the current service
          const filtered = result.data.filter(service => service._id !== currentServiceId);
          setServices(filtered.slice(0, 4));
        }
      }
    } catch (error) {
      console.error('Failed to fetch related services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await usersAPI.getUserFavorites(user._id);
      const result = apiUtils.formatResponse(response);
      
      if (result.success) {
        const favoriteIds = new Set(result.data.map(service => service._id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Failed to fetch user favorites:', error);
    }
  };

  const toggleFavorite = async (serviceId) => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }

    if (updatingFavorites.has(serviceId)) {
      return; // Prevent multiple requests
    }

    try {
      setUpdatingFavorites(prev => new Set([...prev, serviceId]));
      
      if (favorites.has(serviceId)) {
        await usersAPI.removeFromFavorites(user._id, serviceId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(serviceId);
          return newFavorites;
        });
      } else {
        await usersAPI.addToFavorites(user._id, serviceId);
        setFavorites(prev => new Set([...prev, serviceId]));
      }
    } catch (error) {
      console.error('Failed to update favorites:', error);
    } finally {
      setUpdatingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(serviceId);
        return newSet;
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getServiceImage = (service) => {
    if (service.images && service.images.length > 0) {
      return service.images[0].url;
    }
    
    const fallbackImages = {
      'AC Services': 'https://images.unsplash.com/photo-1599158150601-174f0c8f4b9d?q=80&w=400&auto=format&fit=crop',
      'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop',
      'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=400&auto=format&fit=crop',
      'Cleaning': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop',
      'Security': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=400&auto=format&fit=crop',
      'Maintenance': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop'
    };
    
    return fallbackImages[service.category] || fallbackImages['AC Services'];
  };

  const getProviderAvatar = (provider) => {
    if (provider?.avatar?.url) {
      return provider.avatar.url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(provider?.name || 'Provider')}&background=3b82f6&color=ffffff&size=40`;
  };

  if (loading) {
    return (
      <section ref={sectionRef} className={s.wrap}>
        <div className={s.loading}>Loading related services...</div>
      </section>
    );
  }

  if (!services || services.length === 0) {
    return null; // Don't show the section if no related services
  }

  return (
    <section ref={sectionRef} className={s.wrap}>
      <div className={`${s.header} ${isVisible ? s.visible : ''}`}>
        <h3 className={s.title}>Related Services</h3>
        <p className={s.subtitle}>You might also be interested in</p>
      </div>

      <div className={`${s.servicesList} ${isVisible ? s.visible : ''}`}>
        {services.map((service, index) => (
          <div 
            key={service._id} 
            className={s.serviceCard}
            style={{ '--delay': `${index * 0.1}s` }}
          >
            <Link to={`/service/${service._id}`} className={s.cardLink}>
              <div className={s.imageContainer}>
                <div 
                  className={s.serviceImage} 
                  style={{ backgroundImage: `url(${getServiceImage(service)})` }} 
                />
                
                {service.provider?.verification?.status === 'verified' && (
                  <div className={s.verifiedBadge}>
                    <FiShield />
                  </div>
                )}
                
                <div className={`${s.availabilityBadge} ${service.availability?.isAvailable ? s.available : s.busy}`}>
                  <FiClock />
                  {service.availability?.isAvailable ? 'Available' : 'Busy'}
                </div>
              </div>

              <div className={s.serviceContent}>
                <div className={s.serviceHeader}>
                  <span className={s.category}>{service.category}</span>
                  <div className={s.rating}>
                    <FiStar className={s.star} />
                    <span className={s.ratingText}>
                      {service.ratings?.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>

                <h4 className={s.serviceTitle}>{service.name}</h4>
                
                <div className={s.pricing}>
                  <span className={s.price}>
                    {formatPrice(service.pricing?.discountPrice || service.pricing?.basePrice)}
                  </span>
                  {service.pricing?.discountPrice && (
                    <span className={s.oldPrice}>
                      {formatPrice(service.pricing.basePrice)}
                    </span>
                  )}
                </div>

                {/* <div className={s.providerInfo}>
                  <div className={s.provider}>
                    <div className={s.avatar}>
                      <img 
                        src={getProviderAvatar(service.provider)}
                        alt={service.provider?.name || 'Provider'}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=Provider&background=3b82f6&color=ffffff&size=40`;
                        }}
                      />
                    </div>
                    <div className={s.providerDetails}>
                      <div className={s.providerName}>
                        {service.provider?.name || 'Provider'}
                      </div>
                      <div className={s.location}>
                        <FiMapPin />
                        {service.serviceArea?.cities?.[0] || 'Multiple cities'}
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </Link>
            
            <button 
              className={`${s.favoriteBtn} ${favorites.has(service._id) ? s.favorited : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(service._id);
              }}
              disabled={updatingFavorites.has(service._id)}
              aria-label="Add to favorites"
            >
              <FiHeart />
            </button>
            
            <div className={s.cardFooter}>
              <Link to={`/service/${service._id}`} className={s.viewBtn}>
                View Details
                <FiArrowRight />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className={s.viewAllContainer}>
        <Link to="/services" className={s.viewAllBtn}>
          View All Services
          <FiArrowRight />
        </Link>
      </div>
    </section>
  );
}
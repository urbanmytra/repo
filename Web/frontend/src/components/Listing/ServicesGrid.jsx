// src/components/Listing/ServicesGrid.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import s from '../../assets/css/components/Listing/ServicesGrid.module.css';
import { 
  FiStar, 
  FiHeart, 
  FiMapPin, 
  FiClock, 
  FiShield,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, apiUtils } from '../../config/api';

export default function ServicesGrid({ 
  title = 'Services', 
  services = [], 
  loading = false,
  pagination = null,
  onPageChange = null,
  showPagination = false
}) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [updatingFavorites, setUpdatingFavorites] = useState(new Set());
  const sectionRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  // Debug log to check if services are received
  useEffect(() => {
    console.log('ServicesGrid received:', { 
      servicesCount: services?.length, 
      loading, 
      title,
      services: services?.slice(0, 2) // Log first 2 services
    });
  }, [services, loading]);

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
    if (isAuthenticated && user) {
      fetchUserFavorites();
    }
  }, [isAuthenticated, user]);

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

  const toggleFavorite = async (e, serviceId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add favorites');
      navigate('/login');
      return;
    }

    if (updatingFavorites.has(serviceId)) {
      return;
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
      const errorResult = apiUtils.handleError(error);
      alert(errorResult.message);
    } finally {
      setUpdatingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(serviceId);
        return newSet;
      });
    }
  };

  const handleServiceClick = (serviceId) => {
    console.log('Navigating to service:', serviceId);
    navigate(`/service/${serviceId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (basePrice, discountPrice) => {
    if (!discountPrice) return 0;
    return Math.round(((basePrice - discountPrice) / basePrice) * 100);
  };

  const getServiceImage = (service) => {
    if (service.images && Array.isArray(service.images) && service.images.length > 0) {
      if (service.images[0]?.url) {
        return service.images[0].url;
      }
      if (typeof service.images[0] === 'string') {
        return service.images[0];
      }
    }

    if (service.image) {
      return typeof service.image === 'string' ? service.image : service.image.url;
    }

    const fallbackImages = {
      'AC Services': 'https://images.unsplash.com/photo-1631545967298-c7368e12e0b4?q=80&w=1400&auto=format&fit=crop',
      'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1400&auto=format&fit=crop',
      'Appliances': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1400&auto=format&fit=crop',
      'Electronics': 'https://images.unsplash.com/photo-1598460599187-21a473f309a4?q=80&w=1400&auto=format&fit=crop',
      'Solar': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1400&auto=format&fit=crop',
    };

    return fallbackImages[service.category] || fallbackImages['AC Services'];
  };

  if (loading) {
    return (
      <section ref={sectionRef} className={s.section || 'section'}>
        <div className={s.container || 'container'}>
          <div className={s.loading}>
            <div className={s.spinner}></div>
            <p>Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) {
    return (
      <section ref={sectionRef} className={s.section || 'section'}>
        <div className={s.container || 'container'}>
          <div className={`${s.head} ${isVisible ? s.visible : ''}`}>
            <div className={s.titleSection}>
              <h3 className="h3">{title}</h3>
            </div>
          </div>
          <div className={s.noServices}>
            <div className={s.emptyState}>
              <FiMapPin size={48} />
              <h4>No services found</h4>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={s.section || 'section'}>
      <div className={s.container || 'container'}>
        <div className={`${s.head} ${isVisible ? s.visible : ''}`}>
          <div className={s.titleSection}>
            <h3 className="h3">{title}</h3>
            <p className={s.subtitle}>
              {services.length} service{services.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        
        <div className={`${s.grid} ${isVisible ? s.visible : ''}`}>
          {services.map((service, index) => {
            if (!service || !service._id) {
              console.warn('Invalid service object:', service);
              return null;
            }

            return (
              <div 
                key={service._id} 
                className={s.cardWrapper}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div 
                  className={s.card}
                  onClick={() => handleServiceClick(service._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={s.imageContainer}>
                    <div 
                      className={s.photo} 
                      style={{ backgroundImage: `url(${getServiceImage(service)})` }} 
                      role="img"
                      aria-label={service.name}
                    />
                    
                    {service.provider?.verification?.status === 'verified' && (
                      <div className={s.verifiedBadge}>
                        <FiShield />
                        Verified
                      </div>
                    )}
                    
                    {service.featured && (
                      <div className={s.featuredBadge}>
                        Featured
                      </div>
                    )}
                    
                    <div className={`${s.availabilityBadge} ${service.availability?.isAvailable ? s.available : s.busy}`}>
                      <FiClock />
                      {service.availability?.isAvailable ? 'Available' : 'Busy'}
                    </div>

                    <button 
                      className={`${s.favoriteBtn} ${favorites.has(service._id) ? s.favorited : ''}`}
                      onClick={(e) => toggleFavorite(e, service._id)}
                      disabled={updatingFavorites.has(service._id)}
                      aria-label={favorites.has(service._id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <FiHeart />
                    </button>
                  </div>

                  <div className={s.body}>
                    <div className={s.header}>
                      <div className={s.rating}>
                        <div className={s.stars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={i < Math.round(service.ratings?.averageRating || 0) ? s.starFill : s.starEmpty} 
                            />
                          ))}
                        </div>
                        <span className={s.ratingText}>
                          {service.ratings?.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <span className={s.reviewCount}>
                          ({service.ratings?.totalReviews || 0})
                        </span>
                      </div>
                      
                      <div className={s.location}>
                        <FiMapPin />
                        {service.serviceArea?.cities?.[0] || 'Multiple cities'}
                      </div>
                    </div>

                    <h4 className={s.title}>{service.name}</h4>
                    
                    {service.shortDescription && (
                      <p className={s.description}>{service.shortDescription}</p>
                    )}
                    
                    <div className={s.pricing}>
                      <span className={s.price}>
                        {formatPrice(service.pricing?.discountPrice || service.pricing?.basePrice || 0)}
                      </span>
                      {service.pricing?.discountPrice && (
                        <>
                          <span className={s.oldPrice}>
                            {formatPrice(service.pricing.basePrice)}
                          </span>
                          <span className={s.discount}>
                            {calculateDiscount(service.pricing.basePrice, service.pricing.discountPrice)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {service.provider && (
                      <div className={s.providerInfo}>
                        <div className={s.provider}>
                          <div className={s.avatar}>
                            {service.provider.avatar?.url ? (
                              <img src={service.provider.avatar.url} alt={service.provider.name} />
                            ) : (
                              <span>{service.provider.name?.charAt(0) || 'P'}</span>
                            )}
                          </div>
                          <div className={s.providerDetails}>
                            <div className={s.name}>{service.provider.name || 'Service Provider'}</div>
                            {service.provider.experience?.years && (
                              <div className={s.experience}>
                                {service.provider.experience.years}+ years exp.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showPagination && pagination && onPageChange && pagination.total > pagination.limit && (
          <div className={s.pagination}>
            <button 
              className={s.pageBtn}
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <FiChevronLeft />
              Previous
            </button>
            
            <div className={s.pageNumbers}>
              {(() => {
                const totalPages = Math.ceil(pagination.total / pagination.limit);
                const currentPage = pagination.page;
                const pages = [];
                
                if (currentPage > 3) {
                  pages.push(1);
                  if (currentPage > 4) {
                    pages.push('...');
                  }
                }
                
                for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                  pages.push(i);
                }
                
                if (currentPage < totalPages - 2) {
                  if (currentPage < totalPages - 3) {
                    pages.push('...');
                  }
                  pages.push(totalPages);
                }
                
                return pages.map((pageNum, idx) => {
                  if (pageNum === '...') {
                    return <span key={`ellipsis-${idx}`} className={s.ellipsis}>...</span>;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`${s.pageNumber} ${pageNum === currentPage ? s.active : ''}`}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
            </div>
            
            <button 
              className={s.pageBtn}
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
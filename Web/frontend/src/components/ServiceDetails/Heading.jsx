// src/components/ServiceDetails/Heading.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import s from '../../assets/css/components/ServiceDetails/Heading.module.css';
import { FiArrowLeft, FiShare2, FiHeart, FiPlay } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, apiUtils } from '../../config/api';

export default function Heading({ service }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user && service) {
      checkIfFavorited();
    }
  }, [isAuthenticated, user, service]);

  const checkIfFavorited = async () => {
    try {
      const response = await usersAPI.getUserFavorites(user._id);
      const result = apiUtils.formatResponse(response);
      
      if (result.success) {
        const isFav = result.data.some(fav => fav._id === service._id);
        setIsFavorited(isFav);
      }
    } catch (error) {
      console.error('Failed to check favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }

    if (updatingFavorite) return;

    try {
      setUpdatingFavorite(true);
      
      if (isFavorited) {
        await usersAPI.removeFromFavorites(user._id, service._id);
        setIsFavorited(false);
      } else {
        await usersAPI.addToFavorites(user._id, service._id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
      const errorResult = apiUtils.handleError(error);
      alert(errorResult.message);
    } finally {
      setUpdatingFavorite(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: service.name,
      text: `Check out this amazing service: ${service.name}`,
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
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link'));
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
      } catch (error) {
        alert('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  const getServiceImage = () => {
    if (service?.images && service.images.length > 0) {
      return service.images[0].url;
    }

    const fallbackImages = {
      'AC Services': 'https://images.unsplash.com/photo-1599158150601-174f0c8f4b9d?q=80&w=1400&auto=format&fit=crop',
      'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1400&auto=format&fit=crop',
      'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=1400&auto=format&fit=crop',
      'Cleaning': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1400&auto=format&fit=crop',
      'Security': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=1400&auto=format&fit=crop',
      'Maintenance': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1400&auto=format&fit=crop'
    };

    const cat = (service?.category || '').toString().trim();
    if (cat) {
      // exact key match (case-sensitive) or case-insensitive match
      if (fallbackImages[cat]) return fallbackImages[cat];
      const match = Object.keys(fallbackImages).find(k => k.toLowerCase() === cat.toLowerCase());
      if (match) return fallbackImages[match];
    }

    return 'https://images.unsplash.com/photo-1599158150601-174f0c8f4b9d?q=80&w=1400&auto=format&fit=crop';
  };

  if (!service) {
    return (
      <section className={s.wrap}>
        <div className={s.loading}>Loading...</div>
      </section>
    );
  }

  return (
    <section className={s.wrap}>
      <div className={s.navigation}>
        <button className={s.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back to Services
        </button>
        
        <div className={s.actions}>
          <button 
            className={`${s.actionBtn} ${isFavorited ? s.favorited : ''}`}
            onClick={toggleFavorite}
            disabled={updatingFavorite}
            aria-label="Add to favorites"
          >
            <FiHeart />
          </button>
          <button 
            className={s.actionBtn}
            onClick={handleShare}
            aria-label="Share service"
          >
            <FiShare2 />
          </button>
        </div>
      </div>

      <div className={s.bannerContainer}>
        <div 
          className={s.banner}
          style={{ backgroundImage: `url(${getServiceImage()})` }}
        >
          <div className={s.overlay}>
            {service.images && service.images.length > 1 && (
              <button className={s.playBtn} aria-label="View gallery">
                <FiPlay />
              </button>
            )}
          </div>
        </div>
        
        <div className={s.badges}>
          {service.provider?.verification?.status === 'verified' && (
            <span className={s.badge}>
              Verified Professional
            </span>
          )}
          {service.availability?.isAvailable && (
            <span className={s.badge}>
              Same Day Available
            </span>
          )}
          {service.featured && (
            <span className={s.badge}>
              Featured Service
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
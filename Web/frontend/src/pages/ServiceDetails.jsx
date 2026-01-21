// src/pages/ServiceDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { servicesAPI, reviewsAPI, apiUtils } from '../config/api';
import { useAuth } from '../context/AuthContext';
import Heading from '../components/ServiceDetails/Heading';
import ServiceInfo from '../components/ServiceDetails/ServiceInfo';
import Description from '../components/ServiceDetails/Description';
import AboutProvider from '../components/ServiceDetails/AboutProvider';
import Reviews from '../components/ServiceDetails/Reviews';
import RelatedServices from '../components/ServiceDetails/RelatedServices';

export default function ServiceDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch service details
      const serviceResponse = await servicesAPI.getService(id);
      const serviceResult = apiUtils.formatResponse(serviceResponse);
      
      if (serviceResult.success) {
        const serviceData = serviceResult.data;
        setService(serviceData);

        // Fetch related data in parallel
        const [reviewsResponse, relatedResponse] = await Promise.all([
          reviewsAPI.getReviews({ service: id, limit: 10 }),
          servicesAPI.getPopularServices()
        ]);

        // Set reviews
        const reviewsResult = apiUtils.formatResponse(reviewsResponse);
        if (reviewsResult.success) {
          setReviews(reviewsResult.data);
        }

        // Set related services
        const relatedResult = apiUtils.formatResponse(relatedResponse);
        if (relatedResult.success) {
          setRelatedServices(relatedResult.data.filter(s => s._id !== id));
        }
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.message);
      console.error('Failed to fetch service details:', errorResult.message);
    } finally {
      setLoading(false);
    }
  };

  // src/pages/ServiceDetails.jsx - Update the handleBookService function

const handleBookService = async (bookingData) => {
  if (!isAuthenticated) {
    // Redirect to login or show login modal
    window.location.href = `/login?return=${encodeURIComponent(`/book/${service._id}`)}`;
    return;
  }

  try {
    console.log('Booking service:', bookingData);
    // Navigate to booking page
    navigate(`/book/${service._id}`, { 
      state: { 
        service,
        quantity: bookingData.quantity || 1
      }
    });
  } catch (error) {
    console.error('Booking navigation failed:', error);
  }
};

  if (loading) {
    return (
      <main>
        <div className="loading-container">
          <div className="spinner">Loading service details...</div>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main>
        <div className="error-container">
          <h2>Service Not Found</h2>
          <p>{error || 'The requested service could not be found.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <Heading service={service} />
        <ServiceInfo 
          service={service} 
          onBookService={handleBookService}
        />
        <div className="service-details-layout">
          <div className="main-content">
            <Description service={service} />
            <Reviews 
              reviews={reviews} 
              serviceId={service._id}
              providerId={service.provider._id}
              onReviewsUpdate={fetchServiceDetails}
            />
          </div>
          <div className="sidebar-content">
            <AboutProvider provider={service.provider} />
            <RelatedServices services={relatedServices} />
          </div>
        </div>
      </div>
    </main>
  );
}
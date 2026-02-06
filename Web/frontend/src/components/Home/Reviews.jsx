import React, { useState, useEffect, useRef } from 'react';
import s from '../../assets/css/components/Home/Reviews.module.css';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';

const reviews = [
  { 
    name: 'Subhajit Dey', 
    rating: 5, 
    text: 'Excellent AC repair service! The technician was professional, arrived on time, and fixed the issue quickly. Highly recommend for anyone needing reliable home services.',
    service: 'AC Repair',
    location: 'Kolkata',
    avatar: 'S'
  },
  { 
    name: 'Riya Sharma', 
    rating: 5, 
    text: 'Perfect AC installation service. The team was courteous, efficient, and cleaned up after themselves. Great value for money and professional work.',
    service: 'AC Installation',
    location: 'Mumbai',
    avatar: 'R'
  },
  { 
    name: 'Aarav Singh', 
    rating: 4, 
    text: 'Good value for money and friendly staff. The maintenance service was thorough and they explained everything clearly. Will definitely use again.',
    service: 'Maintenance',
    location: 'Delhi',
    avatar: 'A'
  },
  { 
    name: 'Priya Patel', 
    rating: 5, 
    text: 'Outstanding home security installation! The technicians were knowledgeable and installed everything perfectly. Feel much safer now.',
    service: 'Security System',
    location: 'Ahmedabad',
    avatar: 'P'
  },
  { 
    name: 'Rahul Kumar', 
    rating: 5, 
    text: 'Emergency electrical repair was handled professionally. Quick response time and fair pricing. Saved my day when power went out.',
    service: 'Electrical Repair',
    location: 'Bangalore',
    avatar: 'R'
  }
];

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef(null);
  const autoPlayRef = useRef(null);

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
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section ref={sectionRef} className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.inner} ${isVisible ? s.visible : ''}`}>
          <div className={s.header}>
            <span className={`badge ${s.badge}`}>
              <FiStar />
              Customer Reviews
            </span>
            <h2 className="h2">
              What Our <span className={s.highlight}>Customers Say</span>
            </h2>
            <p className={s.description}>
              Real feedback from our happy customers across India. 
              Join thousands of satisfied homeowners who trust our services.
            </p>
          </div>

          <div className={s.reviewsContainer}>
            <div className={s.mainReview}>
              <div className={s.quoteIcon}>
                <svg width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.8533 9.11599C11.3227 13.9523 7.13913 19.5812 6.30256 26.0029C5.00021 36 13.9404 40.8933 18.4703 36.4967C23.0002 32.1002 20.2848 26.5196 17.0047 24.9942C13.7246 23.4687 11.7187 24 12.0686 21.9616C12.4185 19.9231 17.0851 14.2713 21.1849 11.6392C21.4569 11.4079 21.5604 10.9591 21.2985 10.6187C21.1262 10.3947 20.7883 9.95557 20.2848 9.30114C19.8445 8.72888 19.4227 8.75029 18.8533 9.11599Z" fill="#000000"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M38.6789 9.11599C31.1484 13.9523 26.9648 19.5812 26.1282 26.0029C24.8259 36 33.7661 40.8933 38.296 36.4967C42.8259 32.1002 40.1105 26.5196 36.8304 24.9942C33.5503 23.4687 31.5443 24 31.8943 21.9616C32.2442 19.9231 36.9108 14.2713 41.0106 11.6392C41.2826 11.4079 41.3861 10.9591 41.1241 10.6187C40.9519 10.3947 40.614 9.95557 40.1105 9.30114C39.6702 8.72888 39.2484 8.75029 38.6789 9.11599Z" fill="#000000"/>
</svg>
              </div>
              
              <div className={s.reviewContent}>
                <div className={s.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={i < currentReview.rating ? s.filled : s.empty} 
                    />
                  ))}
                  <span className={s.ratingText}>
                    {currentReview.rating}.0 out of 5
                  </span>
                </div>
                
                <blockquote className={s.reviewText}>
                  "{currentReview.text}"
                </blockquote>
                
                <div className={s.reviewerInfo}>
                  <div className={s.avatar}>
                    {currentReview.avatar}
                  </div>
                  <div className={s.reviewerDetails}>
                    <div className={s.reviewerName}>{currentReview.name}</div>
                    <div className={s.reviewerMeta}>
                      {currentReview.service} • {currentReview.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.controls}>
              <button 
                className={s.navButton} 
                onClick={goToPrev}
                aria-label="Previous review"
              >
                <FiChevronLeft />
              </button>
              
              <div className={s.dots}>
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    className={`${s.dot} ${index === currentIndex ? s.active : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                className={s.navButton} 
                onClick={goToNext}
                aria-label="Next review"
              >
                <FiChevronRight />
              </button>
            </div>

            <div className={s.thumbnails}>
              {reviews.map((review, index) => (
                <button
                  key={index}
                  className={`${s.thumbnail} ${index === currentIndex ? s.activeThumbnail : ''}`}
                  onClick={() => goToSlide(index)}
                >
                  <div className={s.thumbnailAvatar}>
                    {review.avatar}
                  </div>
                  <div className={s.thumbnailInfo}>
                    <div className={s.thumbnailName}>{review.name}</div>
                    <div className={s.thumbnailStars}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <FiStar key={i} className={s.thumbnailStar} />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <div className={s.statNumber}>4.9</div>
              <div className={s.statLabel}>Average Rating</div>
            </div>
            <div className={s.stat}>
              <div className={s.statNumber}>1000+</div>
              <div className={s.statLabel}>Happy Customers</div>
            </div>
            <div className={s.stat}>
              <div className={s.statNumber}>98%</div>
              <div className={s.statLabel}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
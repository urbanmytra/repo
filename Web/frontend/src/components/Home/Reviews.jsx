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
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className={s.quoteSvg}
                >
                  <path d="M7.17 6A5.002 5.002 0 0 0 2 11v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1a3.001 3.001 0 0 1 2.83-3H9a1 1 0 0 0-1-1H7.17zM22.17 6A5.002 5.002 0 0 0 17 11v1a1 1 0 0 0 1 1h4a1 1 0
                  0 0 0 1-1v-1a3.001 3.001 0 0 1 2.83-3H19a1 1 0 0 0-1-1h-.83z" />
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
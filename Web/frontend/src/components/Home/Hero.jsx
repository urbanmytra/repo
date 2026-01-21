import React, { useEffect, useState } from 'react';
import s from '../../assets/css/components/Home/Hero.module.css';
import { FiPhoneCall, FiCheckCircle, FiShield, FiClock, FiPlay, FiArrowRight } from 'react-icons/fi';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.heroCard} ${isVisible ? s.visible : ''}`}>
          <div className={s.backgroundElements}>
            <div className={s.sideImgLeft} />
            <div className={s.sideImgRight} />
            <div className={s.gradientOverlay} />
          </div>
          
          <div className={s.center}>
            <div className={s.badgeWrapper}>
              <span className={`badge ${s.heroBadge}`}>
                <span className={s.badgeDot} />
                Shiftings • Repairs • Installations
              </span>
            </div>
            
            <h1 className={`h1 ${s.title}`}>
              Need <span className={s.highlight}>shifting</span> or <span className={s.highlight}>repair</span> of your Home products? 
              <br />We can help!
            </h1>
            
            <p className={s.subtitle}>
              Professional home services with 24/7 availability. Get free quotes and guaranteed satisfaction.
            </p>
            
            <div className={s.trustIndicators}>
              <div className={s.trustItem}>
                <FiCheckCircle />
                <span>Free Quotes</span>
              </div>
              <div className={s.trustItem}>
                <FiShield />
                <span>100% Commitment‑Free</span>
              </div>
              <div className={s.trustItem}>
                <FiClock />
                <span>24/7 Service</span>
              </div>
            </div>
            
            <div className={s.ctaRow}>
              <a className={`btn btn-primary ${s.primaryCta}`} href="tel:+916289795827">
                <FiPhoneCall />
                Call Us Now
                <span className={s.ctaArrow}>
                  <FiArrowRight />
                </span>
              </a>
              
              <button className={`btn btn-secondary ${s.secondaryCta}`}>
                <FiPlay />
                Watch Demo
              </button>
            </div>
            
            <div className={s.socialProof}>
              <div className={s.rating}>
                <div className={s.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={s.star}>★</span>
                  ))}
                </div>
                <span className={s.ratingText}>4.9/5 from 500+ reviews</span>
              </div>
              <div className={s.customers}>
                <div className={s.avatars}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={s.avatar} style={{ '--delay': `${i * 0.1}s` }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className={s.customersText}>Join 1000+ happy customers</span>
              </div>
            </div>
          </div>
          
          <div className={s.features}>
            <div className={s.feature}>
              <FiShield />
              <span>Satisfaction Guarantee</span>
            </div>
            <div className={s.feature}>
              <FiClock />
              <span>24H Availability</span>
            </div>
            <div className={s.feature}>
              <FiShield />
              <span>Professional Guarantee</span>
            </div>
            <div className={s.feature}>
              <FiClock />
              <span>Flexible Appointments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
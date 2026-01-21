import React, { useEffect, useRef, useState } from 'react';
import s from '../../assets/css/components/Home/Professional.module.css';
import { FiCheck, FiPlay, FiAward, FiUsers, FiClock } from 'react-icons/fi';
import CertifiedProfessionals from '../../assets/images/Certified Professionals.png';

const bullets = [
  { text: 'Repair and Installation', icon: <FiCheck /> },
  { text: 'Maintenance', icon: <FiCheck /> },
  { text: 'Home Security Services', icon: <FiCheck /> },
  { text: 'Shifting', icon: <FiCheck /> },
  { text: 'Budget‑friendly', icon: <FiCheck /> },
  { text: 'Eco‑friendly solutions', icon: <FiCheck /> },
];

const stats = [
  { number: '1000+', label: 'Happy Customers', icon: <FiUsers /> },
  { number: '24/7', label: 'Service Hours', icon: <FiClock /> },
  { number: '5★', label: 'Average Rating', icon: <FiAward /> },
];

export default function Professional() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  return (
    <section ref={sectionRef} className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.row} ${isVisible ? s.visible : ''}`}>
          <div className={s.left}>
            <div className={s.content}>
              <div className={s.header}>
                <span className={`badge ${s.badge}`}>
                  <FiAward />
                  Professional Service
                </span>
                <h2 className="h2">
                  Professional for your <span className={s.highlight}>home services</span>
                </h2>
                <p className={s.description}>
                  We deliver fast, friendly, professional support for all home needs. 
                  On time, on budget, guaranteed with 100% satisfaction.
                </p>
              </div>

              <div className={s.list}>
                {bullets.map((bullet, i) => (
                  <div 
                    key={i} 
                    className={s.listItem}
                    style={{ '--delay': `${i * 0.1}s` }}
                  >
                    <div className={s.checkIcon}>
                      {bullet.icon}
                    </div>
                    <span>{bullet.text}</span>
                  </div>
                ))}
              </div>

              <div className={s.stats}>
                {stats.map((stat, i) => (
                  <div key={i} className={s.stat}>
                    <div className={s.statIcon}>
                      {stat.icon}
                    </div>
                    <div className={s.statContent}>
                      <div className={s.statNumber}>{stat.number}</div>
                      <div className={s.statLabel}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={s.note}>
                <div className={s.noteIcon}>
                  <FiClock />
                </div>
                <div>
                  <strong>24‑hour fast services available</strong>
                  <br />
                  Contact us at <a href="tel:+916289795827" className={s.phoneLink}>(+91) 62897 95827</a>
                </div>
              </div>
            </div>
          </div>

          <div className={s.right}>
            <div className={s.imageContainer}>
              <div className={s.image} > 
                <img 
                  src={CertifiedProfessionals}
                  alt="Certified Professionals"
                />
              </div>
              <div className={s.floatingCard}>
                <div className={s.cardIcon}>
                  <FiAward />
                </div>
                <div>
                  <div className={s.cardTitle}>Certified Professionals</div>
                  <div className={s.cardText}>Licensed & Insured</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
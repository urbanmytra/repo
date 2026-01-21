import React, { useEffect, useRef, useState } from 'react';
import s from '../../assets/css/components/About/Values.module.css';
import { 
  FiHeart, 
  FiShield, 
  FiUsers, 
  FiTrendingUp, 
  FiAward, 
  FiZap 
} from 'react-icons/fi';

const values = [
  {
    icon: <FiHeart />,
    title: 'Customer First',
    description: 'Every decision we make prioritizes customer satisfaction and experience',
    color: '#ef4444'
  },
  {
    icon: <FiShield />,
    title: 'Trust & Integrity',
    description: 'Building lasting relationships through honest, transparent practices',
    color: '#10b981'
  },
  {
    icon: <FiUsers />,
    title: 'Team Excellence',
    description: 'Empowering our professionals to deliver their absolute best',
    color: '#3b82f6'
  },
  {
    icon: <FiTrendingUp />,
    title: 'Continuous Growth',
    description: 'Always learning, improving, and evolving our services',
    color: '#8b5cf6'
  },
  {
    icon: <FiAward />,
    title: 'Quality Commitment',
    description: 'Maintaining the highest standards in every service we provide',
    color: '#f59e0b'
  },
  {
    icon: <FiZap />,
    title: 'Innovation Drive',
    description: 'Leveraging technology to create better solutions',
    color: '#06b6d4'
  }
];

export default function Values() {
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
        <div className={`${s.header} ${isVisible ? s.visible : ''}`}>
          <span className={`badge ${s.badge}`}>
            <FiAward />
            Our Values
          </span>
          <h2 className="h2">
            The <span className={s.highlight}>Principles</span> That Guide Us
          </h2>
          <p className={s.description}>
            Our core values shape every interaction, decision, and service we provide. 
            They're not just words on a wall—they're the foundation of who we are.
          </p>
        </div>

        <div className={`${s.grid} ${isVisible ? s.visible : ''}`}>
          {values.map((value, index) => (
            <div 
              key={index} 
              className={s.valueCard}
              style={{ 
                '--delay': `${index * 0.1}s`,
                '--value-color': value.color 
              }}
            >
              <div className={s.cardHeader}>
                                <div className={s.cardIcon}>
                  {value.icon}
                </div>
                <h3 className={s.cardTitle}>{value.title}</h3>
              </div>
              <p className={s.cardDescription}>{value.description}</p>
              <div className={s.cardFooter}>
                <div className={s.cardAccent} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
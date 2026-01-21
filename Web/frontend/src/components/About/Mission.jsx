import React, { useEffect, useRef, useState } from 'react';
import s from '../../assets/css/components/About/MissionVision.module.css';
import { FiTarget, FiHeart, FiShield, FiTrendingUp } from 'react-icons/fi';
import OurMission from '../../assets/images/Our Mission.png';

const missionPoints = [
  {
    icon: <FiTarget />,
    title: 'Precision & Excellence',
    description: 'Every service delivered with meticulous attention to detail'
  },
  {
    icon: <FiHeart />,
    title: 'Customer-Centric',
    description: 'Your satisfaction is our primary measure of success'
  },
  {
    icon: <FiShield />,
    title: 'Trust & Reliability',
    description: 'Building lasting relationships through consistent quality'
  },
  {
    icon: <FiTrendingUp />,
    title: 'Continuous Innovation',
    description: 'Evolving our services to meet changing needs'
  }
];

export default function Mission() {
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
        <div className={`${s.row} ${s.reverse} ${isVisible ? s.visible : ''}`}>
          <div className={s.visual}>
            <div className={s.imageContainer}>
              <div 
                className={s.image} 
                style={{ 
                  backgroundImage: `url(${OurMission})` 
                }} 
              />
              <div className={s.overlay}>
                <div className={s.overlayContent}>
                  <div className={s.overlayIcon}>
                    <FiTarget />
                  </div>
                  <div className={s.overlayText}>
                    <div className={s.overlayTitle}>Our Mission</div>
                    <div className={s.overlaySubtitle}>Excellence in Every Service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={s.content}>
            <div className={s.header}>
              <span className={`badge ${s.badge}`}>
                <FiTarget />
                Our Mission
              </span>
              <h2 className="h2">
                Delivering <span className={s.highlight}>Reliable</span> & 
                <span className={s.highlight}> Transparent</span> Home Services
              </h2>
              <p className={s.description}>
                We're committed to revolutionizing home services by providing reliable, 
                transparent, and affordable solutions with exceptional customer care. 
                Our mission is to make quality home services accessible to everyone.
              </p>
            </div>

            <div className={s.points}>
              {missionPoints.map((point, index) => (
                <div 
                  key={index} 
                  className={s.point}
                  style={{ '--delay': `${index * 0.1}s` }}
                >
                  <div className={s.pointIcon}>
                    {point.icon}
                  </div>
                  <div className={s.pointContent}>
                    <h4 className={s.pointTitle}>{point.title}</h4>
                    <p className={s.pointDescription}>{point.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={s.cta}>
              <div className={s.ctaContent}>
                <h4 className={s.ctaTitle}>Ready to Experience the Difference?</h4>
                <p className={s.ctaText}>Join thousands of satisfied customers</p>
              </div>
              <a href="tel:+916289795827" className={`btn btn-primary ${s.ctaButton}`}>
                Get Started Today
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
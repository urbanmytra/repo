import React, { useEffect, useRef, useState } from 'react';
import s from '../../assets/css/components/About/MissionVision.module.css';
import { FiEye, FiGlobe, FiStar, FiZap, FiUsers } from 'react-icons/fi';
import OurVision from '../../assets/images/Our Vision.png';

const visionPoints = [
  {
    icon: <FiGlobe />,
    title: 'Market Leadership',
    description: 'Becoming the most trusted platform nationwide'
  },
  {
    icon: <FiStar />,
    title: 'Service Excellence',
    description: 'Setting new standards for quality and reliability'
  },
  {
    icon: <FiZap />,
    title: 'Innovation Focus',
    description: 'Leveraging technology for better experiences'
  },
  {
    icon: <FiUsers />,
    title: 'Community Impact',
    description: 'Empowering professionals and serving communities'
  }
];

export default function Vision() {
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
          <div className={s.content}>
            <div className={s.header}>
              <span className={`badge ${s.badge}`}>
                <FiEye />
                Our Vision
              </span>
              <h2 className="h2">
                Building the <span className={s.highlight}>Future</span> of 
                <span className={s.highlight}> Home Services</span>
              </h2>
              <p className={s.description}>
                To be the most trusted platform for home services—easy to access, 
                fair in pricing, and consistently excellent in results. We envision 
                a world where quality home services are just a click away.
              </p>
            </div>

            <div className={s.points}>
              {visionPoints.map((point, index) => (
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

            <div className={s.quote}>
              <blockquote className={s.quoteText}>
                "We believe every home deserves expert care, and every customer 
                deserves transparency, reliability, and excellence."
              </blockquote>
              <cite className={s.quoteAuthor}>— Urban Mytra Team</cite>
            </div>
          </div>

          <div className={s.visual}>
            <div className={s.imageContainer}>
              <div 
                className={s.image} 
                style={{ 
                  backgroundImage: `url(${OurVision})` 
                }} 
              />
              <div className={s.overlay}>
                <div className={s.overlayContent}>
                  <div className={s.overlayIcon}>
                    <FiEye />
                  </div>
                  <div className={s.overlayText}>
                    <div className={s.overlayTitle}>Our Vision</div>
                    <div className={s.overlaySubtitle}>Future of Home Services</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
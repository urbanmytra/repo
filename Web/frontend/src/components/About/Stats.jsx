import React, { useEffect, useRef, useState } from 'react';
import s from '../../assets/css/components/About/Stats.module.css';
import { FiUsers, FiStar, FiCheckCircle, FiClock } from 'react-icons/fi';

const stats = [
  {
    icon: <FiUsers />,
    number: '1000+',
    label: 'Happy Customers',
    description: 'Satisfied homeowners across India'
  },
  {
    icon: <FiStar />,
    number: '4.9',
    label: 'Average Rating',
    description: 'Based on customer reviews'
  },
  {
    icon: <FiCheckCircle />,
    number: '98%',
    label: 'Success Rate',
    description: 'Jobs completed successfully'
  },
  {
    icon: <FiClock />,
    number: '24/7',
    label: 'Support Available',
    description: 'Round-the-clock assistance'
  }
];

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateNumbers();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateNumbers = () => {
    stats.forEach((stat, index) => {
      if (stat.number.includes('+')) {
        const targetNumber = parseInt(stat.number.replace('+', ''));
        animateCounter(index, targetNumber, '+');
      } else if (stat.number.includes('.')) {
        const targetNumber = parseFloat(stat.number);
        animateCounter(index, targetNumber, '', true);
      }
    });
  };

  const animateCounter = (index, target, suffix = '', isDecimal = false) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      const displayValue = isDecimal 
        ? current.toFixed(1) 
        : Math.floor(current).toString();
      
      setAnimatedNumbers(prev => ({
        ...prev,
        [index]: displayValue + suffix
      }));
    }, 40);
  };

  return (
    <section ref={sectionRef} className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.statsGrid} ${isVisible ? s.visible : ''}`}>
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={s.statCard}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className={s.statIcon}>
                {stat.icon}
              </div>
              <div className={s.statContent}>
                <div className={s.statNumber}>
                  {animatedNumbers[index] || stat.number}
                </div>
                <div className={s.statLabel}>{stat.label}</div>
                <div className={s.statDescription}>{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
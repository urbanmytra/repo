import React, { useEffect, useState } from 'react';
import s from '../../assets/css/components/About/AboutHero.module.css';
import { 
  FiShield, 
  FiClock, 
  FiCheckCircle, 
  FiCalendar, 
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiPlay
} from 'react-icons/fi';
import ChoiceOfKolkata from '../../assets/images/Choice of Kolkata.png';

const features = [
  {
    icon: <FiCheckCircle />,
    title: 'Satisfaction Guarantee',
    description: '100% satisfaction or money back'
  },
  {
    icon: <FiClock />,
    title: '24/7 Availability',
    description: 'Round-the-clock emergency services'
  },
  {
    icon: <FiShield />,
    title: 'Professional Guarantee',
    description: 'Certified and insured technicians'
  },
  {
    icon: <FiCalendar />,
    title: 'Flexible Appointments',
    description: 'Book at your convenience'
  }
];

const achievements = [
  { icon: <FiUsers />, number: '1000+', label: 'Happy Customers' },
  { icon: <FiAward />, number: '5★', label: 'Average Rating' },
  { icon: <FiTrendingUp />, number: '98%', label: 'Success Rate' },
  { icon: <FiShield />, number: '24/7', label: 'Support Available' }
];

export default function AboutHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="about" className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.hero} ${isVisible ? s.visible : ''}`}>
          <div className={s.content}>
            <div className={s.header}>
              <span className={`badge ${s.badge}`}>
                <FiShield />
                About LG Smart Services
              </span>
              <h1 className={`h1 ${s.title}`}>
                Transforming <span className={s.highlight}>Home Services</span> 
                <br />One Solution at a Time
              </h1>
              <p className={s.subtitle}>
                We're a team of verified professionals delivering reliable home services 
                with transparent pricing, cutting-edge technology, and an unwavering 
                commitment to customer satisfaction.
              </p>
            </div>

            <div className={s.story}>
              <h3 className={s.storyTitle}>Our Story</h3>
              <p className={s.storyText}>
                Founded with a vision to revolutionize home services, LG Smart Services 
                bridges the gap between homeowners and skilled professionals. We believe 
                every home deserves expert care, and every customer deserves transparency, 
                reliability, and excellence.
              </p>
            </div>

            <div className={s.achievements}>
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={s.achievement}
                  style={{ '--delay': `${index * 0.1}s` }}
                >
                  <div className={s.achievementIcon}>
                    {achievement.icon}
                  </div>
                  <div className={s.achievementContent}>
                    <div className={s.achievementNumber}>{achievement.number}</div>
                    <div className={s.achievementLabel}>{achievement.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={s.visual}>
            <div className={s.imageContainer}>
              <div className={s.mainImage}>
                <img 
                  src={ChoiceOfKolkata}
                  alt="Choice of Kolkata"
                />
              </div>
              <div className={s.floatingCard}>
                <div className={s.cardIcon}>
                  <FiAward />
                </div>
                <div className={s.cardContent}>
                  <div className={s.cardTitle}>Choice of Kolkata</div>
                  <div className={s.cardText}>Trusted by thousands</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.features}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={s.feature}
              style={{ '--delay': `${(index + 4) * 0.1}s` }}
            >
              <div className={s.featureIcon}>
                {feature.icon}
              </div>
              <div className={s.featureContent}>
                <h4 className={s.featureTitle}>{feature.title}</h4>
                <p className={s.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
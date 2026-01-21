import React, { useEffect, useRef, useState } from 'react';
import s from '../../assets/css/components/About/Team.module.css';
import { FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';

const teamMembers = [
  {
    name: 'Rajesh Kumar',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    bio: 'Visionary leader with 15+ years in home services industry',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'rajesh@lg.com'
    }
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
    bio: 'Operations expert ensuring seamless service delivery',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'priya@lg.com'
    }
  },
  {
    name: 'Amit Patel',
    role: 'Technical Director',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    bio: 'Technology innovator driving digital transformation',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'amit@lg.com'
    }
  },
  {
    name: 'Sneha Reddy',
    role: 'Customer Success Lead',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    bio: 'Customer advocate ensuring exceptional experiences',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'sneha@lg.com'
    }
  }
];

export default function Team() {
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
            Our Team
          </span>
          <h2 className="h2">
            Meet the <span className={s.highlight}>Experts</span> Behind Our Success
          </h2>
          <p className={s.description}>
            Our passionate team of professionals is dedicated to revolutionizing 
            home services and delivering exceptional customer experiences.
          </p>
        </div>

        <div className={`${s.teamGrid} ${isVisible ? s.visible : ''}`}>
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className={s.memberCard}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className={s.memberImage}>
                <img src={member.image} alt={member.name} />
                <div className={s.memberOverlay}>
                  <div className={s.socialLinks}>
                    <a href={member.social.linkedin} aria-label={`${member.name} LinkedIn`}>
                      <FiLinkedin />
                    </a>
                    <a href={member.social.twitter} aria-label={`${member.name} Twitter`}>
                      <FiTwitter />
                    </a>
                    <a href={`mailto:${member.social.email}`} aria-label={`Email ${member.name}`}>
                      <FiMail />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className={s.memberInfo}>
                <h3 className={s.memberName}>{member.name}</h3>
                <div className={s.memberRole}>{member.role}</div>
                <p className={s.memberBio}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
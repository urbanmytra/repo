// src/components/Listing/ServiceList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import s from '../../assets/css/components/Listing/ServiceList.module.css';
import { FiArrowLeft, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function ServiceList({
  category,
  subCategory,
  services = [],
  onBack,
  onServiceSelect
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section ref={sectionRef} className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.header} ${isVisible ? s.visible : ''}`}>
          <button type="button" className={s.backBtn} onClick={onBack}>
            <FiArrowLeft />
            Back to Types
          </button>
          <div className={s.titleGroup}>
            <div className={s.breadcrumb}>
              <span>{category}</span>
              <span className={s.separator}>/</span>
              <span>{subCategory}</span>
            </div>
            <h2 className={s.title}>Available Services</h2>
            <p className={s.subtitle}>Select a service to view providers</p>
          </div>
        </div>

        <div className={`${s.serviceGrid} ${isVisible ? s.visible : ''}`}>
          {services.map((service, index) => (
            <div
              key={service?.id ?? index}
              className={s.serviceCard}
              style={{ '--delay': `${index * 0.05}s` }}
              onClick={() => onServiceSelect && onServiceSelect(service)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onServiceSelect && onServiceSelect(service); }}
            >
              <div className={s.serviceIcon}>
                <FiCheckCircle />
              </div>
              <div className={s.serviceContent}>
                <h3 className={s.serviceName}>{typeof service === 'string' ? service : (service?.title || service?.name || 'Service')}</h3>
                <div className={s.serviceFooter}>
                  <span className={s.viewProviders}>View Providers</span>
                  <FiArrowRight className={s.arrow} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

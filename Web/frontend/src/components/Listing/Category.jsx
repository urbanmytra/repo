// src/components/Listing/Category.jsx
import React, { useState, useEffect, useRef } from 'react';
import s from '../../assets/css/components/Listing/Category.module.css';
import { 
  FiWind, 
  FiZap, 
  FiDroplet, 
  FiHome, 
  FiShield, 
  FiTruck,
  FiChevronLeft,
  FiChevronRight,
  FiTool,
  FiSettings,
  FiGrid
} from 'react-icons/fi';

// Icon mapping
const iconMap = {
  FiWind: FiWind,
  FiZap: FiZap,
  FiDroplet: FiDroplet,
  FiHome: FiHome,
  FiShield: FiShield,
  FiTruck: FiTruck,
  FiTool: FiTool,
  FiSettings: FiSettings,
  FiGrid: FiGrid
};

export default function Category({ 
  categories = [], 
  onCategorySelect, 
  selectedCategory = null 
}) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);
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

  useEffect(() => {
    // Find the index of selected category
    const selectedIndex = categories.findIndex(cat => cat.name === selectedCategory);
    setActiveCategory(selectedIndex >= 0 ? selectedIndex : null);
  }, [selectedCategory, categories]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category, index) => {
    const newActiveIndex = activeCategory === index ? null : index;
    setActiveCategory(newActiveIndex);
    
    if (onCategorySelect) {
      onCategorySelect(newActiveIndex !== null ? category.name : null);
    }
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || FiGrid;
    return <IconComponent />;
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className={`section ${s.wrap}`}>
      <div className="container">
        <div className={`${s.header} ${isVisible ? s.visible : ''}`}>
          <h2 className={s.title}>Browse by Category</h2>
          <p className={s.subtitle}>Find the perfect service for your home needs</p>
        </div>

        <div className={`${s.categoryContainer} ${isVisible ? s.visible : ''}`}>
          <button className={s.scrollBtn} onClick={scrollLeft} aria-label="Scroll left">
            <FiChevronLeft />
          </button>

          <div className={s.categoriesWrapper} ref={scrollContainerRef}>
            <div className={s.categories}>
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`${s.categoryCard} ${activeCategory === index ? s.active : ''}`}
                  onClick={() => handleCategoryClick(category, index)}
                  style={{ 
                    '--category-color': category.color, 
                    '--delay': `${index * 0.1}s` 
                  }}
                >
                  <div className={s.categoryIcon}>
                    {getIcon(category.icon)}
                  </div>
                  <div className={s.categoryContent}>
                    <h3 className={s.categoryName}>{category.name}</h3>
                    <span className={s.categoryCount}>
                      {category.count} service{category.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={s.categoryBadge}>
                    {category.count}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button className={s.scrollBtn} onClick={scrollRight} aria-label="Scroll right">
            <FiChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
// src/components/Listing/ListingHero.jsx
import React, { useState } from 'react';
import s from '../../assets/css/components/Listing/ListingHero.module.css';
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList } from 'react-icons/fi';

export default function ListingHero({ onSearch, stats = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ searchQuery, location });
    }
  };

  // Default stats if not provided
  const defaultStats = {
    totalServices: '500+',
    totalProviders: '1000+',
    averageRating: '4.9★',
    ...stats
  };

  return (
    <section className={s.wrap}>
      <div className="container">
        <div className={s.hero}>
          <div className={s.content}>
            <h1 className={s.title}>
              Find the Perfect <span className={s.highlight}>Home Service</span>
            </h1>
            <p className={s.subtitle}>
              Browse through our curated selection of professional services 
              and find the perfect match for your home needs.
            </p>

            {/* <form className={s.searchForm} onSubmit={handleSearch}>
              <div className={s.searchGroup}>
                <div className={s.searchField}>
                  <FiSearch className={s.searchIcon} />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={s.searchInput}
                  />
                </div>
                
                <div className={s.locationField}>
                  <FiMapPin className={s.locationIcon} />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={s.locationInput}
                  />
                </div>
                
                <button type="submit" className={s.searchButton}>
                  Search Services
                </button>
              </div>
            </form> */}

            <div className={s.quickStats}>
              <div className={s.stat}>
                <span className={s.statNumber}>{defaultStats.totalServices}</span>
                <span className={s.statLabel}>Services</span>
              </div>
              <div className={s.stat}>
                <span className={s.statNumber}>{defaultStats.totalProviders}</span>
                <span className={s.statLabel}>Professionals</span>
              </div>
              <div className={s.stat}>
                <span className={s.statNumber}>{defaultStats.averageRating}</span>
                <span className={s.statLabel}>Rating</span>
              </div>
            </div>
          </div>

          {/* <div className={s.controls}>
            <div className={s.viewControls}>
              <button 
                className={`${s.viewBtn} ${viewMode === 'grid' ? s.active : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button 
                className={`${s.viewBtn} ${viewMode === 'list' ? s.active : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>
            
            <button className={s.filterBtn}>
              <FiFilter />
              Filters
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
}
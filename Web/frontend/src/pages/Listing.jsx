// src/pages/Listing.jsx
import React, { useState, useEffect } from 'react';
import { servicesAPI, apiUtils } from '../config/api';
import ListingHero from '../components/Listing/ListingHero';
import Category from '../components/Listing/Category';
import SubCategory from '../components/Listing/SubCategory';
import ServicesGrid from '../components/Listing/ServicesGrid';
import { serviceHierarchy } from '../data/serviceHierarchy';

export default function Listing() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navigationState, setNavigationState] = useState({
    level: 1,
    selectedCategory: null,
    selectedSubCategory: null,
  });
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    priceRange: null,
    rating: null,
    availability: false,
    verified: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });

  // Fetch services when subcategory is selected (Level 3)
  useEffect(() => {
    if (navigationState.level === 3 && navigationState.selectedSubCategory) {
      fetchServices();
    }
  }, [navigationState.level, navigationState.selectedCategory, navigationState.selectedSubCategory, filters, pagination.page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        category: navigationState.selectedCategory,
        subcategory: navigationState.selectedSubCategory,
        status: 'active',
        ...filters
      };

      // Remove empty/null values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === false) {
          delete params[key];
        }
      });

      console.log('Fetching services with params:', params);

      const response = await servicesAPI.getServices(params);
      const result = apiUtils.formatResponse(response);
      
      if (result.success) {
        console.log('Services fetched:', result.data);
        setServices(result.data || []);
        setPagination(prev => ({
          ...prev,
          total: result.total || 0
        }));
      } else {
        setServices([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      console.error('Failed to fetch services:', errorResult.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchData) => {
    setFilters(prev => ({
      ...prev,
      search: searchData.searchQuery,
      location: searchData.location
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategorySelect = (categoryName) => {
    setNavigationState({
      level: 2,
      selectedCategory: categoryName,
      selectedSubCategory: null,
    });
    setServices([]);
  };

  const handleSubCategorySelect = (subCategoryName) => {
    setNavigationState(prev => ({
      ...prev,
      level: 3,
      selectedSubCategory: subCategoryName,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBackToCategories = () => {
    setNavigationState({
      level: 1,
      selectedCategory: null,
      selectedSubCategory: null,
    });
    setServices([]);
    setFilters({
      search: '',
      location: '',
      priceRange: null,
      rating: null,
      availability: false,
      verified: false
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBackToSubCategories = () => {
    setNavigationState(prev => ({
      ...prev,
      level: 2,
      selectedSubCategory: null,
    }));
    setServices([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Build categories from hierarchy
  const categories = Object.entries(serviceHierarchy).map(([name, data]) => ({
    name,
    icon: data.icon,
    color: data.color,
    image: data.image,
    count: Object.values(data.subCategories).reduce((acc, sub) => acc + (sub.services?.length || 0), 0)
  }));

  // Get trending services (from API)
  const getTrendingServices = async () => {
    try {
      const response = await servicesAPI.getServices({ 
        limit: 8, 
        status: 'active',
        sortBy: 'popular'
      });
      const result = apiUtils.formatResponse(response);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to fetch trending services:', error);
      return [];
    }
  };

  // Load trending services for display
  const [trendingServices, setTrendingServices] = useState([]);
  useEffect(() => {
    if (navigationState.level === 1 || navigationState.level === 2) {
      getTrendingServices().then(setTrendingServices);
    }
  }, [navigationState.level]);

  return (
    <main>
      <ListingHero onSearch={handleSearch} />

      {/* Level 1: Show Categories */}
      {navigationState.level === 1 && (
        <>
          <Category 
            categories={categories} 
            onCategorySelect={handleCategorySelect}
            selectedCategory={navigationState.selectedCategory}
          />

          {/* Trending services */}
          <section className="section">
            <div className="container">
              <ServicesGrid
                title="Trending Services"
                services={trendingServices}
                loading={false}
                pagination={null}
                showPagination={false}
              />
            </div>
          </section>
        </>
      )}

      {/* Level 2: Show SubCategories */}
      {navigationState.level === 2 && navigationState.selectedCategory && (
        <>
          <SubCategory
            category={navigationState.selectedCategory}
            subCategories={serviceHierarchy[navigationState.selectedCategory].subCategories}
            onSubCategorySelect={handleSubCategorySelect}
            onBack={handleBackToCategories}
            selectedSubCategory={navigationState.selectedSubCategory}
          />

          {/* Trending in category */}
          <section className="section">
            <div className="container">
              <ServicesGrid
                title={`Trending in ${navigationState.selectedCategory}`}
                services={trendingServices}
                loading={false}
                pagination={null}
                showPagination={false}
              />
            </div>
          </section>
        </>
      )}

      {/* Level 3: Show Services Grid (from API) */}
      {navigationState.level === 3 && navigationState.selectedSubCategory && (
        <div className="listing-content">
          <div className="container">
            {/* Back button */}
            <div style={{ margin: '1rem 0' }}>
              <button 
                type="button" 
                onClick={handleBackToSubCategories} 
                className="btn btn-ghost"
              >
                ← Back to Types
              </button>
            </div>

            <div className="services-content">
              <ServicesGrid
                title={`${navigationState.selectedSubCategory} Services`}
                services={services}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
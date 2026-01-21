import React, { useState } from 'react';
import { 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiPlus,
  FiStar,
  FiUsers,
  FiDollarSign,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import styles from '../../styles/Services/ServicesList.module.css';

export default function ServicesList({ 
  services = [], 
  loading, 
  error,
  pagination = {},
  filters,
  setFilters,
  onEdit, 
  onDelete, 
  onView, 
  onCreate,
  onRefresh
}) {
  const [selectedServices, setSelectedServices] = useState(new Set());

  const handleSelectService = (serviceId) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedServices.size === services.length) {
      setSelectedServices(new Set());
    } else {
      setSelectedServices(new Set(services.map(s => s._id)));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const toggleServiceStatus = async (service) => {
    try {
      const newStatus = service.status === 'active' ? 'inactive' : 'active';
      await onEdit({ ...service, status: newStatus });
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedServices.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedServices.size} services?`)) {
      try {
        // You would need to implement bulk delete in API
        for (const serviceId of selectedServices) {
          const service = services.find(s => s._id === serviceId);
          if (service) {
            await onDelete(service);
          }
        }
        setSelectedServices(new Set());
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.servicesList}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <FiRefreshCw className={styles.spinning} />
            <p>Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.servicesList}>
        <div className={styles.errorContainer}>
          <p>Error loading services: {error}</p>
          <button className="btn btn-primary" onClick={onRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.servicesList}>
      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchFilter}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search services..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterControls}>
          <select 
            value={filters.status || 'all'} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select 
            value={filters.category || 'all'} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="AC Services">AC Services</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Security">Security</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Repair">Repair</option>
          </select>
          
          <select 
            value={filters.sortBy || 'createdAt'} 
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={styles.sortSelect}
          >
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="pricing.basePrice">Sort by Price</option>
            <option value="ratings.averageRating">Sort by Rating</option>
          </select>
        </div>
      </div>

      <div className={styles.listHeader}>
        <div className={styles.headerLeft}>
          <h3>All Services ({pagination.total || services.length})</h3>
          {selectedServices.size > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>
                {selectedServices.size} selected
              </span>
              <button className={styles.bulkActionBtn} onClick={handleBulkDelete}>
                <FiTrash2 />
                Delete Selected
              </button>
            </div>
          )}
        </div>
        
        <div className={styles.headerControls}>
          <button className="btn btn-outline" onClick={onRefresh}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={onCreate}>
            <FiPlus />
            Add Service
          </button>
        </div>
      </div>

      <div className={styles.servicesTable}>
        <div className={styles.tableHeader}>
          <div className={`${styles.headerCell} ${styles.checkbox}`}>
            <input
              type="checkbox"
              checked={selectedServices.size === services.length && services.length > 0}
              onChange={handleSelectAll}
            />
          </div>
          <div className={styles.headerCell}>Service</div>
          <div className={styles.headerCell}>Category</div>
          <div className={styles.headerCell}>Provider</div>
          <div className={styles.headerCell}>Price</div>
          <div className={styles.headerCell}>Rating</div>
          <div className={styles.headerCell}>Bookings</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        <div className="table-body">
          {services.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No services found</p>
              <button className="btn btn-primary" onClick={onCreate}>
                <FiPlus />
                Add First Service
              </button>
            </div>
          ) : (
            services.map((service) => (
              <div key={service._id} className={styles.tableRow}>
                <div className={`${styles.tableCell} ${styles.checkbox}`}>
                  <input
                    type="checkbox"
                    checked={selectedServices.has(service._id)}
                    onChange={() => handleSelectService(service._id)}
                  />
                </div>
                
                <div className={styles.tableCell}>
                  <div className={styles.serviceInfo}>
                    <img 
                      src={service.images?.[0] || '/default-service.jpg'} 
                      alt={service.name}
                      className={styles.serviceImage}
                      onError={(e) => {
                        e.target.src = '/default-service.jpg';
                      }}
                    />
                    <div className={styles.serviceDetails}>
                      <h4 className={styles.serviceName}>{service.name}</h4>
                      <p className={styles.serviceDescription}>
                        {service.description?.substring(0, 100)}
                        {service.description?.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <span className={styles.categoryBadge}>{service.category}</span>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.providerInfo}>
                    <div className={styles.providerAvatar}>
                      {service.provider?.name?.charAt(0) || 'N'}
                    </div>
                    <span className={styles.providerName}>
                      {service.provider?.name || 'Not assigned'}
                    </span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.priceInfo}>
                    <FiDollarSign />
                    <span className={styles.price}>
                      ₹{service.pricing?.basePrice || 0}
                    </span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.ratingInfo}>
                    <FiStar className={styles.starIcon} />
                    <span className={styles.rating}>
                      {service.ratings?.averageRating || 0}
                    </span>
                    <span className={styles.ratingCount}>
                      ({service.ratings?.totalReviews || 0})
                    </span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.bookingsInfo}>
                    <FiUsers />
                    <span className={styles.bookings}>
                      {service.stats?.totalBookings || 0}
                    </span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <button
                    className={`${styles.statusToggle} ${service.status}`}
                    onClick={() => toggleServiceStatus(service)}
                  >
                    {service.status === 'active' ? (
                      <>
                        <FiToggleRight />
                        Active
                      </>
                    ) : (
                      <>
                        <FiToggleLeft />
                        Inactive
                      </>
                    )}
                  </button>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button 
                      className={`${styles.actionBtn} ${styles.view}`}
                      onClick={() => onView(service)}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.edit}`}
                      onClick={() => onEdit(service)}
                      title="Edit Service"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => onDelete(service)}
                      title="Delete Service"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.tablePagination}>
          <div className={styles.paginationInfo}>
            Showing {((pagination.page - 1) * filters.limit) + 1}-{Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total} services
          </div>
          <div className={styles.paginationControls}>
            <button 
              className={styles.paginationBtn} 
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
              if (pageNum <= pagination.pages) {
                return (
                  <button
                    key={pageNum}
                    className={`${styles.paginationBtn} ${pageNum === pagination.page ? styles.active : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            <button 
              className={styles.paginationBtn} 
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
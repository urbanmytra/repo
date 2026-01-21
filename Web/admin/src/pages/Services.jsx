import React, { useState, useEffect } from 'react';
import ServicesList from '../components/Services/ServicesList';
import ServiceForm from '../components/Services/ServiceForm';
import ServiceDetails from '../components/Services/ServiceDetails';
import { FiDownload, FiUpload, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { servicesAPI } from '../utils/api';
import styles from '../styles/pages/Services.module.css';

export default function Services() {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formMode, setFormMode] = useState('create');
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    category: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadServices();
  }, [filters]);

  // In Services.jsx, update the loadServices function
const loadServices = async () => {
  try {
    setLoading(true);
    setError(null);

    // Build query parameters - exclude "all" values
    const params = {
      page: filters.page,
      limit: filters.limit,
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.order && { order: filters.order }),
      // Only include these if they're not "all"
      ...(filters.status && filters.status !== 'all' && { status: filters.status }),
      ...(filters.category && filters.category !== 'all' && { category: filters.category }),
      ...(filters.search && filters.search.trim() && { search: filters.search.trim() })
    };

    console.log('Loading services with params:', params);
    const response = await servicesAPI.getServices(params);
    
    if (response.success) {
      setServices(response.data);
      setPagination({
        total: response.total,
        page: response.page || 1,
        pages: response.pages || 1,
        hasNext: response.pagination?.next,
        hasPrev: response.pagination?.prev
      });
    }
  } catch (error) {
    console.error('Failed to load services:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  const handleCreateService = () => {
    setSelectedService(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  const handleDeleteService = async (service) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        const response = await servicesAPI.deleteService(service._id);
        if (response.success) {
          await loadServices(); // Refresh the list
        }
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete service: ' + error.message);
      }
    }
  };

  const handleSaveService = async (serviceData) => {
    try {
      let response;
      
      if (formMode === 'create') {
        response = await servicesAPI.createService(serviceData);
      } else {
                response = await servicesAPI.updateService(selectedService._id, serviceData);
      }
      
      if (response.success) {
        await loadServices(); // Refresh the list
        setShowForm(false);
        setSelectedService(null);
      } else {
        throw new Error(response.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save service: ' + error.message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedService(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedService(null);
  };

  const handleExport = async () => {
    try {
      const response = await servicesAPI.getServices({ 
        ...filters, 
        limit: 1000,
        export: true 
      });
      
      if (response.success) {
        const csvContent = convertServicesToCSV(response.data);
        downloadCSV(csvContent, `services-${Date.now()}.csv`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const convertServicesToCSV = (data) => {
    const headers = ['Name', 'Category', 'Provider', 'Price', 'Rating', 'Status', 'Created'];
    const rows = data.map(service => [
      service.name,
      service.category,
      service.provider?.name || 'N/A',
      `₹${service.pricing?.basePrice || 0}`,
      service.ratings?.averageRating || 0,
      service.status,
      new Date(service.createdAt).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.servicesPage}>
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Services Management</h1>
          <p className="page-subtitle">Manage all your services and their availability</p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-outline" onClick={loadServices}>
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.servicesContent}>
        <ServicesList
          services={services}
          loading={loading}
          error={error}
          pagination={pagination}
          filters={filters}
          setFilters={setFilters}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          onView={handleViewService}
          onCreate={handleCreateService}
          onRefresh={loadServices}
        />
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={selectedService}
          mode={formMode}
          onClose={handleCloseForm}
          onSave={handleSaveService}
        />
      )}

      {/* Service Details Modal */}
      {showDetails && (
        <ServiceDetails
          service={selectedService}
          onClose={handleCloseDetails}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      )}
    </div>
  );
}
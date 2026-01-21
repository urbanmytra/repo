import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';
import BookingsList from '../components/Bookings/BookingsList';
import BookingFilters from '../components/Bookings/BookingFilters';
import BookingDetails from '../components/Bookings/BookingDetails';
import { FiDownload, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { bookingsAPI } from '../utils/api';
import styles from '../styles/pages/Bookings.module.css';

export default function Bookings() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    service: 'all',
    provider: 'all',
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 10
  });
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only load bookings if authenticated and not in auth loading state
    if (isAuthenticated && !authLoading) {
      loadBookings();
    }
  }, [filters, isAuthenticated, authLoading]);

  const loadBookings = async () => {
    // Double check authentication before making request
    if (!isAuthenticated || authLoading) {
      console.log('Skipping loadBookings - not authenticated or auth loading');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        order: filters.order,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.service !== 'all' && { service: filters.service }),
        ...(filters.provider !== 'all' && { provider: filters.provider }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
        // Handle predefined date ranges
        ...(filters.dateRange !== 'all' && filters.dateRange !== 'custom' && { 
          dateRange: filters.dateRange 
        })
      };

      console.log('Loading bookings with params:', params);
      const response = await bookingsAPI.getBookings(params);
      
      if (response.success) {
        setBookings(response.data || []);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1,
          hasNext: response.pagination?.next || false,
          hasPrev: response.pagination?.prev || false
        });
      } else {
        throw new Error(response.error || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      
      // Don't show error if it's just an auth issue
      if (!error.message.includes('Session expired')) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // This shouldn't happen with ProtectedRoute, but just in case
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to access the bookings page.</p>
        </div>
      </div>
    );
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleUpdateStatus = async (bookingId, statusData) => {
    try {
      const response = await bookingsAPI.updateBookingStatus(bookingId, statusData);
      if (response.success) {
        // Refresh bookings to get updated data
        await loadBookings();
        return response;
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
      setError('Failed to update booking status: ' + error.message);
      throw error;
    }
  };

  const handleExport = async (selectedBookings = null) => {
    try {
      setLoading(true);
      
      let exportData;
      if (selectedBookings) {
        exportData = selectedBookings;
      } else {
        // Export all bookings with current filters
        const response = await bookingsAPI.getBookings({ 
          ...filters, 
          limit: 10000, // Large limit to get all data
          page: 1
        });
        
        if (response.success) {
          exportData = response.data;
        } else {
          throw new Error('Failed to fetch data for export');
        }
      }
      
      const csvContent = convertToCSV(exportData);
      downloadCSV(csvContent, `bookings-${Date.now()}.csv`);
      
    } catch (error) {
      console.error('Export failed:', error);
      if (!error.message.includes('Session expired')) {
        setError('Export failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      'Booking ID', 
      'Customer Name', 
      'Customer Email', 
      'Customer Phone',
      'Service Name', 
      'Provider Name', 
      'Scheduled Date',
      'Scheduled Time',
      'Status', 
      'Amount',
      'Address',
      'Created Date'
    ];
    
    const rows = data.map(booking => [
      booking.bookingId || booking._id?.substring(0, 8) || 'N/A',
      booking.user?.name || 'N/A',
      booking.user?.email || 'N/A',
      booking.user?.phone || booking.contactInfo?.phone || 'N/A',
      booking.service?.name || 'N/A',
      booking.provider?.name || 'N/A',
      booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A',
      booking.scheduledTime || 'N/A',
      booking.status || 'N/A',
      `₹${booking.pricing?.totalAmount || booking.amount || 0}`,
      booking.address ? `${booking.address.city}, ${booking.address.state}` : booking.location || 'N/A',
      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`)
    ).map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
    <div className={styles.bookingsPage}>
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Bookings Management</h1>
          <p className="page-subtitle">Manage all service bookings and appointments</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-outline" 
            onClick={loadBookings} 
            disabled={loading || authLoading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {/* <button 
            className="btn btn-outline" 
            onClick={() => handleExport()}
            disabled={loading || authLoading}
          >
            <FiDownload />
            Export All
          </button> */}
        </div>
      </div>

      <div className={styles.bookingsContent}>
        <BookingFilters 
          filters={filters} 
          setFilters={setFilters}
          loading={loading}
        />
        <BookingsList 
          bookings={bookings}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRefresh={loadBookings}
          onViewDetails={handleViewDetails}
          onUpdateStatus={handleUpdateStatus}
          onExport={handleExport}
        />
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => {
            setShowDetails(false);
            setSelectedBooking(null);
          }}
          onUpdate={async (updatedBooking) => {
            try {
              await handleUpdateStatus(selectedBooking._id, {
                status: updatedBooking.status,
                notes: updatedBooking.notes
              });
              setShowDetails(false);
              setSelectedBooking(null);
            } catch (error) {
              console.error('Failed to update booking:', error);
            }
          }}
        />
      )}
    </div>
  );
}
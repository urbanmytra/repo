// API Configuration and HTTP client
// const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const API_BASE_URL = 'https://project-bagajation-backend.onrender.com/api/v1';


class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isHandlingAuth = false; // Prevent multiple auth handling
  }

  getAuthToken() {
    return localStorage.getItem('admin_token');
  }

  setAuthToken(token) {
    localStorage.setItem('admin_token', token);
  }

  removeAuthToken() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        data = { message: 'Invalid response format' };
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access
          if (!this.isHandlingAuth) {
            this.isHandlingAuth = true;
            console.log('401 error detected, clearing auth data');
            this.removeAuthToken();
            
            // Only trigger auth expired if not already on login page
            if (!window.location.pathname.includes('/login')) {
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('auth:expired'));
                this.isHandlingAuth = false;
              }, 100);
            } else {
              this.isHandlingAuth = false;
            }
          }
          
          throw new Error('Session expired. Please login again.');
        }
        
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', {
        url,
        method: config.method || 'GET',
        error: error.message
      });
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      cleanParams[key] = value;
    }
  });

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return this.request(url, {
    method: 'GET',
  });
}

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile(endpoint, formData) {
    const token = this.getAuthToken();
    const headers = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          if (!this.isHandlingAuth) {
            this.isHandlingAuth = true;
            this.removeAuthToken();
            if (!window.location.pathname.includes('/login')) {
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('auth:expired'));
                this.isHandlingAuth = false;
              }, 100);
            } else {
              this.isHandlingAuth = false;
            }
          }
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }
}

// Create API client instance
const apiClient = new ApiClient();

// API Endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/admin/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/updatedetails', data),
  changePassword: (data) => apiClient.put('/auth/updatepassword', data),
};

// Enhanced Dashboard API
export const dashboardAPI = {
  getStats: () => apiClient.get('/admin/dashboard/stats'),
  getRecentActivity: () => apiClient.get('/admin/dashboard/recent-activity'),
  getRecentBookings: (limit = 10) => apiClient.get(`/admin/dashboard/recent-bookings?limit=${limit}`),
  getAnalytics: (params) => apiClient.get('/admin/dashboard/analytics', params),
  getQuickStats: () => apiClient.get('/admin/dashboard/quick-stats'),
  getRevenueChart: (period = '7d') => apiClient.get(`/admin/dashboard/revenue-chart?period=${period}`),
  getServiceChart: () => apiClient.get('/admin/dashboard/service-chart'),
  getPerformanceIndicators: () => apiClient.get('/admin/dashboard/kpi'),
};

export const usersAPI = {
  getUsers: (params) => apiClient.get('/users', params),
  getUser: (id) => apiClient.get(`/users/${id}`),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  getUserDashboard: (id) => apiClient.get(`/users/${id}/dashboard`),
  updatePreferences: (id, data) => apiClient.put(`/users/${id}/preferences`, data),
  getFavorites: (id) => apiClient.get(`/users/${id}/favorites`),
  addToFavorites: (id, serviceId) => apiClient.post(`/users/${id}/favorites/${serviceId}`),
  removeFromFavorites: (id, serviceId) => apiClient.delete(`/users/${id}/favorites/${serviceId}`),
  getUserActivity: (id, params) => apiClient.get(`/users/${id}/activity`, params),
  getUserBookings: (id, params) => apiClient.get(`/users/${id}/bookings`, params),
  getUserReviews: (id, params) => apiClient.get(`/users/${id}/reviews`, params),
  getUserStats: (id) => apiClient.get(`/users/${id}/stats`),
  blockUser: (id, reason) => apiClient.put(`/users/${id}/block`, { reason }),
  unblockUser: (id) => apiClient.put(`/users/${id}/unblock`),
  sendNotification: (id, data) => apiClient.post(`/users/${id}/notifications`, data),
  getUserNotifications: (id) => apiClient.get(`/users/${id}/notifications`),
  bulkUpdateUsers: (data) => apiClient.put('/users/bulk-update', data),
  exportUsers: (params) => apiClient.get('/users/export', params),
  importUsers: (data) => apiClient.post('/users/import', data),
  getUsersByDateRange: (startDate, endDate) => apiClient.get(`/users/date-range?start=${startDate}&end=${endDate}`),
  getUserGrowthStats: () => apiClient.get('/users/growth-stats'),
};

export const servicesAPI = {
  getServices: (params) => apiClient.get('/services', params),
  getService: (id) => apiClient.get(`/services/${id}`),
  createService: (data) => apiClient.post('/services', data),
  updateService: (id, data) => apiClient.put(`/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/services/${id}`),
  getServiceAnalytics: (id) => apiClient.get(`/services/${id}/analytics`),
  getFeaturedServices: () => apiClient.get('/services/featured'),
  getPopularServices: () => apiClient.get('/services/popular'),
  searchServices: (params) => apiClient.get('/services/search', params),
  getServicesByCategory: (category) => apiClient.get(`/services/category/${category}`),
  getServiceAnalytics: (id) => apiClient.get(`/services/${id}/analytics`),
  getServiceBookings: (id, params) => apiClient.get(`/services/${id}/bookings`, params),
  getServiceReviews: (id, params) => apiClient.get(`/services/${id}/reviews`, params),
  getServiceRevenue: (id, params) => apiClient.get(`/services/${id}/revenue`, params),
  updateServiceStatus: (id, status) => apiClient.put(`/services/${id}/status`, { status }),
  bulkUpdateServices: (data) => apiClient.put('/services/bulk-update', data),
  duplicateService: (id) => apiClient.post(`/services/${id}/duplicate`),
  getServicePerformance: (id) => apiClient.get(`/services/${id}/performance`),
  getServiceAvailability: (id) => apiClient.get(`/services/${id}/availability`),
  updateServiceAvailability: (id, data) => apiClient.put(`/services/${id}/availability`, data),
};

export const bookingsAPI = {
  getBookings: (params) => apiClient.get('/bookings', params),
  getBooking: (id) => apiClient.get(`/bookings/${id}`),
  createBooking: (data) => apiClient.post('/bookings', data),
  updateBooking: (id, data) => apiClient.put(`/bookings/${id}`, data),
  updateBookingStatus: (id, data) => apiClient.put(`/bookings/${id}/status`, data),
  cancelBooking: (id, data) => apiClient.put(`/bookings/${id}/cancel`, data),
  getBookingAnalytics: (params) => apiClient.get('/bookings/analytics', params),
  addMessage: (id, data) => apiClient.post(`/bookings/${id}/messages`, data),
  getBookingMessages: (id) => apiClient.get(`/bookings/${id}/messages`),
  addBookingMessage: (id, data) => apiClient.post(`/bookings/${id}/messages`, data),
  getBookingTimeline: (id) => apiClient.get(`/bookings/${id}/timeline`),
  assignProvider: (id, providerId) => apiClient.put(`/bookings/${id}/assign`, { providerId }),
  rescheduleBooking: (id, data) => apiClient.put(`/bookings/${id}/reschedule`, data),
  addBookingNote: (id, note) => apiClient.post(`/bookings/${id}/notes`, { note }),
  getBookingNotes: (id) => apiClient.get(`/bookings/${id}/notes`),
  bulkUpdateBookings: (data) => apiClient.put('/bookings/bulk-update', data),
  getBookingsByDateRange: (startDate, endDate) => apiClient.get(`/bookings/date-range?start=${startDate}&end=${endDate}`),
  getBookingsByStatus: (status) => apiClient.get(`/bookings/status/${status}`),
  generateBookingReport: (params) => apiClient.get('/bookings/report', params),
};

// Enhanced Providers API
export const providersAPI = {
  getProviders: (params) => apiClient.get('/providers', params),
  getProvider: (id) => apiClient.get(`/providers/${id}`),
  createProvider: (data) => apiClient.post('/providers/register', data),
  updateProvider: (id, data) => apiClient.put(`/providers/${id}`, data),
  deleteProvider: (id) => apiClient.delete(`/providers/${id}`),
  verifyProvider: (id, data) => apiClient.put(`/providers/${id}/verify`, data),
  getProviderDashboard: (id) => apiClient.get(`/providers/${id}/dashboard`),
  getProviderAnalytics: (id) => apiClient.get(`/providers/${id}/analytics`),
  getProviderBookings: (id, params) => apiClient.get(`/providers/${id}/bookings`, params),
  getProviderReviews: (id, params) => apiClient.get(`/providers/${id}/reviews`, params),
  getProviderRevenue: (id, params) => apiClient.get(`/providers/${id}/revenue`, params),
  updateProviderStatus: (id, status) => apiClient.put(`/providers/${id}/status`, { status }),
  updateAvailability: (id, data) => apiClient.put(`/providers/${id}/availability`, data),
  getProviderAvailability: (id) => apiClient.get(`/providers/${id}/availability`),
  getTopProviders: (params) => apiClient.get('/providers/top', params),
  getProviderPerformance: (id) => apiClient.get(`/providers/${id}/performance`),
  sendProviderNotification: (id, data) => apiClient.post(`/providers/${id}/notifications`, data),
  bulkUpdateProviders: (data) => apiClient.put('/providers/bulk-update', data),
  exportProviders: (params) => apiClient.get('/providers/export', params),
};

export const reviewsAPI = {
  getReviews: (params) => apiClient.get('/reviews', params),
  getReview: (id) => apiClient.get(`/reviews/${id}`),
  createReview: (data) => apiClient.post('/reviews', data),
  updateReview: (id, data) => apiClient.put(`/reviews/${id}`, data),
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`),
  markHelpful: (id) => apiClient.put(`/reviews/${id}/helpful`),
  moderateReview: (id, data) => apiClient.put(`/reviews/${id}/moderate`, data),
  addResponse: (id, data) => apiClient.post(`/reviews/${id}/response`, data),
  reportReview: (id, data) => apiClient.post(`/reviews/${id}/report`, data),
  getReviewStats: () => apiClient.get('/reviews/stats'),
  getReviewStats: () => apiClient.get('/reviews/stats'),
  getReviewsByService: (serviceId, params) => apiClient.get(`/reviews/service/${serviceId}`, params),
  getReviewsByUser: (userId, params) => apiClient.get(`/reviews/user/${userId}`, params),
  getReviewsByProvider: (providerId, params) => apiClient.get(`/reviews/provider/${providerId}`, params),
  bulkModerateReviews: (data) => apiClient.put('/reviews/bulk-moderate', data),
  getReviewAnalytics: (params) => apiClient.get('/reviews/analytics', params),
  exportReviews: (params) => apiClient.get('/reviews/export', params),
  getFlaggedReviews: (params) => apiClient.get('/reviews/flagged', params),
  getReviewTrends: (params) => apiClient.get('/reviews/trends', params),
};

// Analytics API endpoints
export const analyticsAPI = {
  getDashboard: (params) => apiClient.get('/analytics/dashboard', params),
  getRevenue: (params) => apiClient.get('/analytics/revenue', params),
  getBookings: (params) => apiClient.get('/analytics/bookings', params),
  getUsers: (params) => apiClient.get('/analytics/users', params),
  getServices: (params) => apiClient.get('/analytics/services', params),
  getServiceCategoryStats: () => apiClient.get('/analytics/service-categories'),
  getRevenueByPeriod: (period) => apiClient.get(`/analytics/revenue/${period}`),
  getTopServices: (params) => apiClient.get('/analytics/top-services', params),
  getTopProviders: (params) => apiClient.get('/analytics/top-providers', params),
  getUserActivity: (params) => apiClient.get('/analytics/user-activity', params),
  getPerformanceMetrics: () => apiClient.get('/analytics/performance'),
};

export const adminAPI = {
  getAdmins: () => apiClient.get('/admin/admins'),
  createAdmin: (data) => apiClient.post('/admin/admins', data),
  updateAdmin: (id, data) => apiClient.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => apiClient.delete(`/admin/admins/${id}`),
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
  getActivity: (params) => apiClient.get('/admin/activity', params),
  bulkOperation: (action, data) => apiClient.post(`/admin/bulk/${action}`, data),
  sendNotification: (data) => apiClient.post('/admin/notifications', data),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => apiClient.get('/notifications', params),
  sendNotification: (data) => apiClient.post('/notifications', data),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/mark-all-read'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  getNotificationTemplates: () => apiClient.get('/notifications/templates'),
  createNotificationTemplate: (data) => apiClient.post('/notifications/templates', data),
  sendBulkNotification: (data) => apiClient.post('/notifications/bulk-send', data),
  getNotificationStats: () => apiClient.get('/notifications/stats'),
};

// Reports API
export const reportsAPI = {
  generateReport: (type, params) => apiClient.get(`/reports/${type}`, params),
  getBookingsReport: (params) => apiClient.get('/reports/bookings', params),
  getRevenueReport: (params) => apiClient.get('/reports/revenue', params),
  getUsersReport: (params) => apiClient.get('/reports/users', params),
  getServicesReport: (params) => apiClient.get('/reports/services', params),
  getProvidersReport: (params) => apiClient.get('/reports/providers', params),
  getPerformanceReport: (params) => apiClient.get('/reports/performance', params),
  scheduleReport: (data) => apiClient.post('/reports/schedule', data),
  getScheduledReports: () => apiClient.get('/reports/scheduled'),
  downloadReport: (id) => apiClient.get(`/reports/download/${id}`),
  getReportHistory: () => apiClient.get('/reports/history'),
};

// Settings API
export const settingsAPI = {
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
  getSystemSettings: () => apiClient.get('/admin/settings/system'),
  updateSystemSettings: (data) => apiClient.put('/admin/settings/system', data),
  getEmailSettings: () => apiClient.get('/admin/settings/email'),
  updateEmailSettings: (data) => apiClient.put('/admin/settings/email', data),
  getPaymentSettings: () => apiClient.get('/admin/settings/payment'),
  updatePaymentSettings: (data) => apiClient.put('/admin/settings/payment', data),
  getNotificationSettings: () => apiClient.get('/admin/settings/notifications'),
  updateNotificationSettings: (data) => apiClient.put('/admin/settings/notifications', data),
  testEmailSettings: (data) => apiClient.post('/admin/settings/email/test', data),
  backupSettings: () => apiClient.post('/admin/settings/backup'),
  restoreSettings: (data) => apiClient.post('/admin/settings/restore', data),
};

// File upload APIs
export const uploadAPI = {
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.uploadFile('/auth/updatedetails', formData);
  },
  uploadServiceImages: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('serviceImages', file));
    return apiClient.uploadFile('/services', formData);
  },
  uploadReviewImages: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('reviewImages', file));
    return apiClient.uploadFile('/reviews', formData);
  },
  uploadDocuments: (files) => {
    const formData = new FormData();
    Object.keys(files).forEach(key => {
      if (files[key]) formData.append(key, files[key]);
    });
    return apiClient.uploadFile('/providers', formData);
  },
};

export default apiClient;
import React, { useState, useEffect } from 'react';
import StatsCards from '../components/Dashboard/StatsCards';
import RecentBookings from '../components/Dashboard/RecentBookings';
import RevenueChart from '../components/Dashboard/RevenueChart';
import ServiceChart from '../components/Dashboard/ServiceChart';
import { dashboardAPI, analyticsAPI } from '../utils/api';
import { FiRefreshCw, FiDownload, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/pages/Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ✅ Helper function to normalize revenue data format
  const normalizeRevenueData = (apiResponse, range = '7d') => {
    const defaultData = {
      '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0, 0, 0, 0, 0, 0, 0]
      },
      '30d': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [0, 0, 0, 0]
      },
      '90d': {
        labels: ['Month 1', 'Month 2', 'Month 3'],
        data: [0, 0, 0]
      }
    };

    if (!apiResponse) {
      console.warn(`No data for ${range}, using defaults`);
      return defaultData;
    }

    // Log the actual structure
    console.log(`📊 Normalizing ${range} revenue data:`, JSON.stringify(apiResponse, null, 2));

    // If API already returns keyed format { '7d': {...}, '30d': {...}, '90d': {...} }
    if (apiResponse['7d'] || apiResponse['30d'] || apiResponse['90d']) {
      return {
        '7d': apiResponse['7d'] || defaultData['7d'],
        '30d': apiResponse['30d'] || defaultData['30d'],
        '90d': apiResponse['90d'] || defaultData['90d']
      };
    }

    // If API returns single range format { labels: [...], data: [...] }
    if (apiResponse.labels && apiResponse.data) {
      return {
        ...defaultData,
        [range]: {
          labels: apiResponse.labels,
          data: apiResponse.data.map(v => Number(v) || 0)
        }
      };
    }

    // If API returns nested { data: { labels: [...], data: [...] } }
    if (apiResponse.data && apiResponse.data.labels && apiResponse.data.data) {
      return {
        ...defaultData,
        [range]: {
          labels: apiResponse.data.labels,
          data: apiResponse.data.data.map(v => Number(v) || 0)
        }
      };
    }

    console.warn(`Unknown revenue data format for ${range}:`, apiResponse);
    return defaultData;
  };

  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Loading dashboard data...');

      // Load all dashboard data in parallel
      const [
        dashboardResponse,
        analyticsResponse,
        revenue7d,
        revenue30d,
        revenue90d,
        serviceResponse
      ] = await Promise.allSettled([
        dashboardAPI.getStats(),
        analyticsAPI.getDashboard().catch(err => {
          console.warn('⚠️ Analytics API not available:', err.message);
          return { success: false, error: 'Analytics not available' };
        }),
        dashboardAPI.getRevenueChart('7d'),
        dashboardAPI.getRevenueChart('30d'),
        dashboardAPI.getRevenueChart('90d'),
        dashboardAPI.getServiceChart()
      ]);

      // ✅ Handle dashboard stats
      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value?.success) {
        console.log('✅ Dashboard stats loaded:', dashboardResponse.value.data);
        setDashboardData(dashboardResponse.value.data);
      } else {
        console.error('❌ Dashboard stats failed:', dashboardResponse.reason);
      }

      // ✅ Handle analytics data (optional - don't fail if unavailable)
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value?.success) {
        console.log('✅ Analytics loaded:', analyticsResponse.value.data);
        setAnalyticsData(analyticsResponse.value.data);
      } else {
        console.warn('⚠️ Analytics not available (this is optional)');
        // Analytics is optional, don't set error
      }

      // ✅ Handle revenue data - fetch all ranges and combine
      const revenueDataCombined = {
        '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [0,0,0,0,0,0,0] },
        '30d': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [0,0,0,0] },
        '90d': { labels: ['Month 1', 'Month 2', 'Month 3'], data: [0,0,0] }
      };

      if (revenue7d.status === 'fulfilled' && revenue7d.value?.success) {
        console.log('✅ 7d Revenue loaded');
        const normalized = normalizeRevenueData(revenue7d.value.data, '7d');
        revenueDataCombined['7d'] = normalized['7d'];
      } else {
        console.error('❌ 7d Revenue failed:', revenue7d.reason);
      }

      if (revenue30d.status === 'fulfilled' && revenue30d.value?.success) {
        console.log('✅ 30d Revenue loaded');
        const normalized = normalizeRevenueData(revenue30d.value.data, '30d');
        revenueDataCombined['30d'] = normalized['30d'];
      } else {
        console.error('❌ 30d Revenue failed:', revenue30d.reason);
      }

      if (revenue90d.status === 'fulfilled' && revenue90d.value?.success) {
        console.log('✅ 90d Revenue loaded');
        const normalized = normalizeRevenueData(revenue90d.value.data, '90d');
        revenueDataCombined['90d'] = normalized['90d'];
      } else {
        console.error('❌ 90d Revenue failed:', revenue90d.reason);
      }

      console.log('📊 Final Combined Revenue Data:', JSON.stringify(revenueDataCombined, null, 2));
      setRevenueData(revenueDataCombined);

      // ✅ Handle service chart data
      if (serviceResponse.status === 'fulfilled' && serviceResponse.value?.success) {
        console.log('✅ Service chart loaded:', serviceResponse.value.data);
        setServiceData(serviceResponse.value.data);
      } else {
        console.error('❌ Service chart failed:', serviceResponse.reason);
        // Set default service data
        setServiceData([
          { name: 'AC Services', value: 0, color: '#3b82f6', count: 0 },
          { name: 'Electrical', value: 0, color: '#f59e0b', count: 0 },
          { name: 'Plumbing', value: 0, color: '#10b981', count: 0 },
          { name: 'Cleaning', value: 0, color: '#ef4444', count: 0 },
          { name: 'Other', value: 0, color: '#8b5cf6', count: 0 }
        ]);
      }

      console.log('✅ Dashboard data loading complete');

    } catch (error) {
      console.error('❌ Dashboard data loading failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadDashboardData(true);
  };

  const handleRefreshRevenue = async () => {
    console.log('🔄 Refreshing revenue data...');
    try {
      const [rev7, rev30, rev90] = await Promise.allSettled([
        dashboardAPI.getRevenueChart('7d'),
        dashboardAPI.getRevenueChart('30d'),
        dashboardAPI.getRevenueChart('90d')
      ]);

      const updated = { ...revenueData };

      if (rev7.status === 'fulfilled' && rev7.value?.success) {
        const normalized = normalizeRevenueData(rev7.value.data, '7d');
        updated['7d'] = normalized['7d'];
      }

      if (rev30.status === 'fulfilled' && rev30.value?.success) {
        const normalized = normalizeRevenueData(rev30.value.data, '30d');
        updated['30d'] = normalized['30d'];
      }

      if (rev90.status === 'fulfilled' && rev90.value?.success) {
        const normalized = normalizeRevenueData(rev90.value.data, '90d');
        updated['90d'] = normalized['90d'];
      }

      console.log('✅ Revenue data refreshed');
      setRevenueData(updated);
    } catch (error) {
      console.error('❌ Failed to refresh revenue data:', error);
    }
  };

  const handleRefreshServices = async () => {
    console.log('🔄 Refreshing service data...');
    try {
      const response = await dashboardAPI.getServiceChart();
      if (response.success) {
        console.log('✅ Service data refreshed');
        setServiceData(response.data);
      }
    } catch (error) {
      console.error('❌ Failed to refresh service data:', error);
    }
  };

  const handleRefreshBookings = async () => {
    console.log('🔄 Refreshing bookings...');
    try {
      const response = await dashboardAPI.getRecentBookings(10);
      if (response.success) {
        console.log('✅ Bookings refreshed');
        setDashboardData(prev => ({
          ...prev,
          recentBookings: response.data
        }));
      }
    } catch (error) {
      console.error('❌ Failed to refresh bookings:', error);
    }
  };

  const handleViewAllBookings = (booking) => {
    if (booking) {
      navigate('/bookings', { state: { selectedBooking: booking } });
    } else {
      navigate('/bookings');
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <FiRefreshCw className={styles.spinning} />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.errorContainer}>
          <h2>⚠️ Error Loading Dashboard</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? styles.spinning : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <StatsCards 
          data={dashboardData?.stats} 
          loading={loading}
        />
        
        <div className={styles.dashboardRow}>
          <div className={styles.dashboardCol2}>
            <RevenueChart 
              data={revenueData} 
              loading={loading}
              onRefresh={handleRefreshRevenue}
            />
          </div>
          <div className={styles.dashboardCol1}>
            <ServiceChart 
              data={serviceData} 
              loading={loading}
              onRefresh={handleRefreshServices}
            />
          </div>
        </div>

        <RecentBookings 
          data={dashboardData?.recentBookings} 
          loading={loading}
          onRefresh={handleRefreshBookings}
          onViewAll={handleViewAllBookings}
        />
      </div>
    </div>
  );
}
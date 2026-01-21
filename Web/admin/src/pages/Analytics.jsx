import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiBarChart,
  FiPieChart
} from 'react-icons/fi';
import { analyticsAPI } from '../utils/api';
import styles from '../styles/pages/Analytics.module.css';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6m');
  const [chartType, setChartType] = useState('revenue');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { timeRange };
      const [dashboardData, revenueData, bookingsData, usersData, servicesData] = await Promise.all([
        analyticsAPI.getDashboard(params),
        analyticsAPI.getRevenue(params),
        analyticsAPI.getBookings(params),
        analyticsAPI.getUsers(params),
        analyticsAPI.getServices(params)
      ]);

      setAnalyticsData({
        overview: dashboardData.success ? dashboardData.data.overview : {},
        revenue: revenueData.success ? revenueData.data : {},
        bookings: bookingsData.success ? bookingsData.data : {},
        users: usersData.success ? usersData.data : {},
        services: servicesData.success ? servicesData.data : {}
      });
    } catch (error) {
      console.error('Analytics data loading failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleExport = async () => {
    try {
      // Implementation for exporting analytics data
      const dataToExport = {
        timeRange,
        generatedAt: new Date().toISOString(),
        data: analyticsData
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${timeRange}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={styles.analyticsPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <FiRefreshCw className={styles.spinning} />
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.analyticsPage}>
        <div className={styles.errorContainer}>
          <p>Error loading analytics: {error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overview = analyticsData?.overview || {};
  const revenueChart = analyticsData?.revenue?.revenueByPeriod || [];
  const bookingsChart = analyticsData?.bookings?.bookingsByTimeOfDay || [];
  const serviceBreakdown = analyticsData?.services?.categoryPerformance || [];
  const topPerformers = analyticsData?.services?.topRatedServices || [];

  return (
    <div className={styles.analyticsPage}>
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Track your business performance and insights</p>
        </div>
        
        <div className="header-actions">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn btn-outline" onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <FiDownload />
            Export Report
          </button>
        </div>
      </div>

      <div className={styles.analyticsContent}>
        {/* Overview Stats */}
        <div className={styles.overviewStats}>
          <div className="stat-card revenue">
            <div className="stat-header">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className={`stat-trend ${(overview.revenueGrowth || 0) > 0 ? 'positive' : 'negative'}`}>
                {(overview.revenueGrowth || 0) > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {formatPercentage(overview.revenueGrowth)}
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{formatCurrency(overview.totalRevenue)}</h3>
              <p className="stat-title">Total Revenue</p>
              <span className="stat-subtitle">vs previous period</span>
            </div>
          </div>

          <div className="stat-card bookings">
            <div className="stat-header">
              <div className="stat-icon">
                <FiCalendar />
              </div>
              <div className={`stat-trend ${(overview.bookingsGrowth || 0) > 0 ? 'positive' : 'negative'}`}>
                {(overview.bookingsGrowth || 0) > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {formatPercentage(overview.bookingsGrowth)}
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{(overview.totalBookings || 0).toLocaleString()}</h3>
              <p className="stat-title">Total Bookings</p>
              <span className="stat-subtitle">vs previous period</span>
            </div>
          </div>

          <div className="stat-card users">
            <div className="stat-header">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className={`stat-trend ${(overview.usersGrowth || 0) > 0 ? 'positive' : 'negative'}`}>
                {(overview.usersGrowth || 0) > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {formatPercentage(overview.usersGrowth)}
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{(overview.totalUsers || 0).toLocaleString()}</h3>
              <p className="stat-title">Total Users</p>
              <span className="stat-subtitle">vs previous period</span>
            </div>
          </div>

          <div className="stat-card avg-order">
            <div className="stat-header">
              <div className="stat-icon">
                <FiBarChart />
              </div>
              <div className={`stat-trend ${(overview.avgOrderGrowth || 0) > 0 ? 'positive' : 'negative'}`}>
                {(overview.avgOrderGrowth || 0) > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {formatPercentage(overview.avgOrderGrowth)}
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{formatCurrency(overview.avgOrderValue)}</h3>
              <p className="stat-title">Avg Order Value</p>
              <span className="stat-subtitle">vs previous period</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          <div className="chart-container main-chart">
            <div className="chart-header">
              <div className="chart-title-section">
                <h3 className="chart-title">Performance Trends</h3>
                <div className="chart-controls">
                  <button 
                    className={`chart-type-btn ${chartType === 'revenue' ? 'active' : ''}`}
                    onClick={() => setChartType('revenue')}
                  >
                    Revenue
                  </button>
                  <button 
                                        className={`chart-type-btn ${chartType === 'bookings' ? 'active' : ''}`}
                    onClick={() => setChartType('bookings')}
                  >
                    Bookings
                  </button>
                </div>
              </div>
            </div>
            
            <div className="chart-content">
              <div className="chart-bars">
                {(chartType === 'revenue' ? revenueChart : bookingsChart).map((item, index) => {
                  const data = chartType === 'revenue' ? revenueChart : bookingsChart;
                  const maxValue = Math.max(...data.map(d => chartType === 'revenue' ? d.revenue : d.bookings));
                  const value = chartType === 'revenue' ? item.revenue : item.bookings;
                  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="chart-bar-wrapper">
                      <div className="chart-bar-container">
                        <div 
                          className="chart-bar"
                          style={{ height: `${percentage}%` }}
                        >
                          <div className="bar-tooltip">
                            {chartType === 'revenue' ? formatCurrency(value) : value?.toLocaleString()}
                          </div>
                        </div>
                        <span className="chart-value">
                          {chartType === 'revenue' ? `₹${((value || 0) / 1000).toFixed(0)}k` : (value || 0)}
                        </span>
                      </div>
                      <span className="chart-label">
                        {item._id?.month || item._id || `Period ${index + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="chart-container service-breakdown">
            <div className="chart-header">
              <h3 className="chart-title">Service Breakdown</h3>
              <div className="chart-legend">
                <FiPieChart />
                <span>by Revenue</span>
              </div>
            </div>
            
            <div className="breakdown-list">
              {serviceBreakdown.map((service, index) => (
                <div key={index} className="breakdown-item">
                  <div className="breakdown-info">
                    <div className="breakdown-color" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                    <div className="breakdown-details">
                      <span className="breakdown-name">{service._id || service.name}</span>
                      <span className="breakdown-stats">{service.bookings || service.count} bookings</span>
                    </div>
                  </div>
                  <div className="breakdown-values">
                    <span className="breakdown-percentage">
                      {((service.revenue / (serviceBreakdown.reduce((sum, s) => sum + s.revenue, 0))) * 100).toFixed(1)}%
                    </span>
                    <span className="breakdown-revenue">{formatCurrency(service.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className={styles.topPerformersSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Top Performing Services</h3>
            <a href="/services" className={styles.viewAllLink}>View All</a>
          </div>
          
          <div className={styles.performersGrid}>
            {topPerformers.map((performer, index) => (
              <div key={index} className="performer-card">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-avatar">
                    {(performer.name || performer.serviceName || 'S').charAt(0)}
                  </div>
                  <div className="performer-details">
                    <h4 className="performer-name">{performer.name || performer.serviceName}</h4>
                    <div className="performer-stats">
                      <span className="stat-item">
                        <FiCalendar size={12} />
                        {performer.bookings || performer.stats?.totalBookings || 0} bookings
                      </span>
                      <span className="stat-item">
                        <FiDollarSign size={12} />
                        {formatCurrency(performer.revenue || performer.stats?.totalRevenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="performer-rating">
                  <FiTrendingUp className="rating-icon" />
                  <span className="rating-value">
                    {(performer.rating || performer.ratings?.averageRating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { 
  FiCalendar, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiMinus
} from 'react-icons/fi';
import styles from '../../styles/Dashboard/StatsCards.module.css';

export default function StatsCards({ data, loading }) {
  const defaultStats = [
    {
      id: 'bookings',
      title: 'Total Bookings',
      value: '0',
      change: '0%',
      trend: 'neutral',
      icon: FiCalendar,
      color: 'blue',
      subtitle: 'This month'
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '₹0',
      change: '0%',
      trend: 'neutral',
      icon: FiDollarSign,
      color: 'green',
      subtitle: 'This month'
    },
    {
      id: 'users',
      title: 'Active Users',
      value: '0',
      change: '0%',
      trend: 'neutral',
      icon: FiUsers,
      color: 'purple',
      subtitle: 'Registered users'
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: '0%',
      change: '0%',
      trend: 'neutral',
      icon: FiTrendingUp,
      color: 'orange',
      subtitle: 'vs last month'
    }
  ];

  const formatValue = (value, type) => {
    if (loading || !value) return type === 'revenue' ? '₹0' : '0';
    
    switch (type) {
      case 'revenue':
        return `₹${value.toLocaleString()}`;
      case 'growth':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  const formatChange = (change) => {
    if (loading || !change) return '0%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return FiArrowUp;
      case 'down':
        return FiArrowDown;
      default:
        return FiMinus;
    }
  };

  const getTrend = (change) => {
    if (!change || change === 0) return 'neutral';
    return change > 0 ? 'up' : 'down';
  };

  const stats = data ? [
    {
      id: 'bookings',
      title: 'Total Bookings',
      value: formatValue(data.totalBookings, 'bookings'),
      change: formatChange(data.bookingsChange),
      trend: getTrend(data.bookingsChange),
      icon: FiCalendar,
      color: 'blue',
      subtitle: 'This month'
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: formatValue(data.totalRevenue, 'revenue'),
      change: formatChange(data.revenueChange),
      trend: getTrend(data.revenueChange),
      icon: FiDollarSign,
      color: 'green',
      subtitle: 'This month'
    },
    {
      id: 'users',
      title: 'Active Users',
      value: formatValue(data.activeUsers, 'users'),
      change: formatChange(data.usersChange),
      trend: getTrend(data.usersChange),
      icon: FiUsers,
      color: 'purple',
      subtitle: 'Registered users'
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: formatValue(data.growthRate, 'growth'),
      change: formatChange(data.growthChange),
      trend: getTrend(data.growthChange),
      icon: FiTrendingUp,
      color: 'orange',
      subtitle: 'vs last month'
    }
  ] : defaultStats;

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        const TrendIcon = getTrendIcon(stat.trend);
        
        return (
          <div key={stat.id} className={`${styles.statCard} ${styles[stat.color]} ${loading ? styles.loading : ''}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <IconComponent />
              </div>
              <div className={`${styles.statChange} ${styles[stat.trend]}`}>
                <TrendIcon />
                {stat.change}
              </div>
            </div>
            
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                {loading ? (
                  <div className={styles.statSkeleton}></div>
                ) : (
                  stat.value
                )}
              </h3>
              <p className={styles.statTitle}>{stat.title}</p>
              <span className={styles.statSubtitle}>{stat.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
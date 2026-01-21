const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const [
      currentPeriodStats,
      previousPeriodStats
    ] = await Promise.all([
      // Current period (last 30 days)
      Promise.all([
        Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Booking.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
        ]),
        User.countDocuments({ status: 'active' }),
        Booking.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
            }
          }
        ])
      ]),
      // Previous period (30-60 days ago)
      Promise.all([
        Booking.countDocuments({ 
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
        }),
        Booking.aggregate([
          { 
            $match: { 
              createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, 
              status: 'completed' 
            } 
          },
          { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
        ])
      ])
    ]);

    const [totalBookings, revenueResult, activeUsers, completionData] = currentPeriodStats;
    const [prevBookings, prevRevenueResult] = previousPeriodStats;
    
    const totalRevenue = revenueResult[0]?.total || 0;
    const prevRevenue = prevRevenueResult[0]?.total || 0;
    const completionRate = completionData[0] ? 
      (completionData[0].completed / completionData[0].total * 100) : 0;

    // Calculate percentage changes
    const bookingsChange = prevBookings > 0 
      ? ((totalBookings - prevBookings) / prevBookings * 100)
      : totalBookings > 0 ? 100 : 0;
    
    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue * 100)
      : totalRevenue > 0 ? 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBookings,
          totalRevenue,
          activeUsers,
          growthRate: completionRate,
          bookingsChange: parseFloat(bookingsChange.toFixed(1)),
          revenueChange: parseFloat(revenueChange.toFixed(1)),
          usersChange: 5.2, // This should be calculated based on user growth
          growthChange: -2.1 // This should be calculated based on growth rate changes
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent bookings for dashboard
// @route   GET /api/v1/admin/dashboard/recent-bookings
// @access  Private/Admin
const getRecentBookings = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const recentBookings = await Booking.find()
      .populate('user', 'name email phone avatar')
      .populate('service', 'name category')
      .populate('provider', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

      console.log('Recent Bookings:', recentBookings);

    res.status(200).json({
      success: true,
      data: recentBookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue chart data
// @route   GET /api/v1/admin/dashboard/revenue-chart
// @access  Private/Admin
const getRevenueChart = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const now = new Date();
    let days, labels, groupBy;

    switch (period) {
      case '7d':
        days = 7;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        groupBy = '%Y-%m-%d';
        break;
      case '30d':
        days = 30;
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        groupBy = '%Y-%U'; // Week of year
        break;
      case '90d':
        days = 90;
        labels = ['Month 1', 'Month 2', 'Month 3'];
        groupBy = '%Y-%m';
        break;
      default:
        days = 7;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        groupBy = '%Y-%m-%d';
    }

    const startDate = new Date(now - days * 24 * 60 * 60 * 1000);

    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupBy, date: '$createdAt' } },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format data for different periods
    let formattedData;
    if (period === '7d') {
      formattedData = labels.map((label, index) => {
        const date = new Date(now - (6 - index) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = revenueData.find(d => d._id === dateStr);
        return dayData?.revenue || 0;
      });
    } else if (period === '30d') {
      // Group by weeks
      const weeklyData = Array(4).fill(0);
      revenueData.forEach(item => {
        const weekIndex = Math.floor((new Date(item._id + '-01') - startDate) / (7 * 24 * 60 * 60 * 1000));
        if (weekIndex >= 0 && weekIndex < 4) {
          weeklyData[weekIndex] += item.revenue;
        }
      });
      formattedData = weeklyData;
    } else {
      // 90d - group by months
      const monthlyData = Array(3).fill(0);
      revenueData.forEach(item => {
        const monthIndex = Math.floor((new Date(item._id + '-01') - startDate) / (30 * 24 * 60 * 60 * 1000));
        if (monthIndex >= 0 && monthIndex < 3) {
          monthlyData[monthIndex] += item.revenue;
        }
      });
      formattedData = monthlyData;
    }

    res.status(200).json({
      success: true,
      data: {
        [period]: {
          labels,
          data: formattedData
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service chart data
// @route   GET /api/v1/admin/dashboard/service-chart
// @access  Private/Admin
const getServiceChart = async (req, res, next) => {
  try {
    const categoryStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      { $unwind: '$serviceInfo' },
      {
        $group: {
          _id: '$serviceInfo.category',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const totalBookings = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
    
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    
    const formattedData = categoryStats.map((cat, index) => ({
      name: cat._id || 'Other',
      value: totalBookings > 0 ? parseFloat(((cat.count / totalBookings) * 100).toFixed(1)) : 0,
      count: cat.count,
      color: colors[index % colors.length]
    }));

    // Fill remaining slots if less than 5 categories
    while (formattedData.length < 5) {
      formattedData.push({
        name: 'Other',
        value: 0,
        count: 0,
        color: colors[formattedData.length]
      });
    }

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentBookings,
  getRevenueChart,
  getServiceChart
};
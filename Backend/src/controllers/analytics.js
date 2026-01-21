const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// @desc    Get dashboard analytics
// @route   GET /api/v1/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [
      overviewStats,
      revenueStats,
      bookingTrends,
      serviceCategoryStats,
      userGrowth,
      providerStats,
      topServices,
      recentActivity
    ] = await Promise.all([
      // Overview statistics
      getOverviewStats(matchCondition),
      
      // Revenue statistics
      getRevenueStats(matchCondition),
      
      // Booking trends
      getBookingTrends(matchCondition),
      
      // Service category performance
      getServiceCategoryStats(matchCondition),
      
      // User growth
      getUserGrowthStats(matchCondition),
      
      // Provider statistics
      getProviderStats(matchCondition),
      
      // Top performing services
      getTopServices(matchCondition),
      
      // Recent activity
      getRecentActivity()
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: overviewStats,
        revenue: revenueStats,
        bookingTrends,
        serviceCategoryStats,
        userGrowth,
        providerStats,
        topServices,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue analytics
// @route   GET /api/v1/analytics/revenue
// @access  Private/Admin
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let matchCondition = { status: 'completed' };
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [
      totalRevenue,
      revenueByPeriod,
      revenueByService,
      revenueByProvider,
      paymentMethodStats
    ] = await Promise.all([
      // Total revenue
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.totalAmount' },
            totalBookings: { $sum: 1 },
            averageOrderValue: { $avg: '$pricing.totalAmount' }
          }
        }
      ]),

      // Revenue by period
      getRevenueByPeriod(matchCondition, period),

      // Revenue by service category
      Booking.aggregate([
        { $match: matchCondition },
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
            revenue: { $sum: '$pricing.totalAmount' },
            bookings: { $sum: 1 },
            averageValue: { $avg: '$pricing.totalAmount' }
          }
        },
        { $sort: { revenue: -1 } }
      ]),

      // Revenue by provider
      Booking.aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: 'providers',
            localField: 'provider',
            foreignField: '_id',
            as: 'providerInfo'
          }
        },
        { $unwind: '$providerInfo' },
        {
          $group: {
            _id: {
              providerId: '$provider',
              providerName: '$providerInfo.name'
            },
            revenue: { $sum: '$pricing.totalAmount' },
            bookings: { $sum: 1 },
            commission: { 
              $sum: { 
                $multiply: ['$pricing.totalAmount', 0.15] // 15% commission
              }
            }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),

      // Payment method statistics
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: '$payment.method',
            count: { $sum: 1 },
            totalAmount: { $sum: '$pricing.totalAmount' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0] || {},
        revenueByPeriod,
        revenueByService,
        revenueByProvider,
        paymentMethodStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking analytics
// @route   GET /api/v1/analytics/bookings
// @access  Private/Admin
const getBookingAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [
      bookingStatusStats,
      bookingsByTimeOfDay,
      bookingsByDayOfWeek,
      averageResponseTime,
      cancellationStats,
      completionRate
    ] = await Promise.all([
      // Booking status distribution
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            percentage: { 
              $multiply: [
                { $divide: ['$count', { $sum: 1 }] }, 
                100
              ]
            }
          }
        }
      ]),

      // Bookings by time of day
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Bookings by day of week
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Average response time
      Booking.aggregate([
        { 
          $match: { 
            ...matchCondition,
            status: { $in: ['confirmed', 'completed'] }
          }
        },
        {
          $addFields: {
            responseTime: {
              $subtract: ['$updatedAt', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            averageResponseTime: { $avg: '$responseTime' }
          }
        }
      ]),

      // Cancellation statistics
      Booking.aggregate([
        { 
          $match: { 
            ...matchCondition,
            status: 'cancelled'
          }
        },
        {
          $group: {
            _id: '$cancellation.cancelledBy',
            count: { $sum: 1 }
          }
        }
      ]),

      // Completion rate
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            completionRate: {
              $multiply: [{ $divide: ['$completed', '$total'] }, 100]
            }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookingStatusStats,
        bookingsByTimeOfDay,
        bookingsByDayOfWeek,
        averageResponseTime: averageResponseTime[0]?.averageResponseTime || 0,
        cancellationStats,
        completionRate: completionRate[0]?.completionRate || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/v1/analytics/users
// @access  Private/Admin
const getUserAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [
      userGrowthStats,
      userActivityStats,
      userLocationStats,
      userEngagementStats,
      topCustomers
    ] = await Promise.all([
      // User growth over time
      User.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // User activity statistics
      User.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // User location distribution
      User.aggregate([
        { $match: { 'address.city': { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$address.city',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // User engagement statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            verifiedUsers: {
              $sum: { $cond: ['$isVerified', 1, 0] }
            },
            averageBookings: { $avg: '$stats.totalBookings' },
            averageSpent: { $avg: '$stats.totalSpent' }
          }
        }
      ]),

      // Top customers by bookings/spending
      User.aggregate([
        { $match: { 'stats.totalBookings': { $gt: 0 } } },
        {
          $project: {
            name: 1,
            email: 1,
            totalBookings: '$stats.totalBookings',
            totalSpent: '$stats.totalSpent',
            averageRating: '$stats.averageRating'
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowthStats,
        userActivityStats,
        userLocationStats,
        userEngagementStats: userEngagementStats[0] || {},
        topCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service analytics
// @route   GET /api/v1/analytics/services
// @access  Private/Admin
const getServiceAnalytics = async (req, res, next) => {
  try {
    const [
      serviceStats,
      categoryPerformance,
      topRatedServices,
      serviceBookingTrends,
      priceAnalysis
    ] = await Promise.all([
      // Overall service statistics
      Service.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            averageRating: { $avg: '$ratings.averageRating' },
            averagePrice: { $avg: '$pricing.basePrice' }
          }
        }
      ]),

      // Category performance
      Service.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            totalServices: { $sum: 1 },
            averageRating: { $avg: '$ratings.averageRating' },
            totalBookings: { $sum: '$stats.totalBookings' },
            totalRevenue: { $sum: '$stats.totalRevenue' },
            averagePrice: { $avg: '$pricing.basePrice' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]),

      // Top rated services
      Service.find({ status: 'active' })
        .populate('provider', 'name')
        .sort('-ratings.averageRating')
        .limit(10)
        .select('name category ratings stats provider'),

      // Service booking trends
      Booking.aggregate([
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
            _id: {
              category: '$serviceInfo.category',
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            bookings: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ]),

      // Price analysis by category
      Service.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            minPrice: { $min: '$pricing.basePrice' },
            maxPrice: { $max: '$pricing.basePrice' },
            averagePrice: { $avg: '$pricing.basePrice' },
            medianPrice: { $median: '$pricing.basePrice' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        serviceStats,
        categoryPerformance,
        topRatedServices,
        serviceBookingTrends,
        priceAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const getOverviewStats = async (matchCondition) => {
  const [bookingStats, userStats, providerStats, revenueStats] = await Promise.all([
    Booking.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]),
    
    User.countDocuments(matchCondition),
    Provider.countDocuments({ ...matchCondition, 'verification.status': 'verified' }),
    
    Booking.aggregate([
      { $match: { ...matchCondition, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalAmount' },
          averageOrderValue: { $avg: '$pricing.totalAmount' }
        }
      }
    ])
  ]);

  return {
    bookings: bookingStats[0] || {},
    totalUsers: userStats,
    totalProviders: providerStats,
    revenue: revenueStats[0] || {}
  };
};

const getRevenueStats = async (matchCondition) => {
  return await Booking.aggregate([
    { $match: { ...matchCondition, status: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$pricing.totalAmount' },
        bookings: { $sum: 1 },
        averageValue: { $avg: '$pricing.totalAmount' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);
};

const getBookingTrends = async (matchCondition) => {
  return await Booking.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    { $limit: 30 }
  ]);
};

// @desc    Get service category statistics for dashboard
// @route   GET /api/v1/analytics/service-categories
// @access  Private/Admin
const getServiceCategoryStats = async (req, res, next) => {
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
      { $sort: { count: -1 } }
    ]);

    const totalBookings = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
    
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    
    const formattedData = categoryStats.map((cat, index) => ({
      name: cat._id,
      value: totalBookings > 0 ? parseFloat(((cat.count / totalBookings) * 100).toFixed(1)) : 0,
      count: cat.count,
      color: colors[index % colors.length]
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

const getUserGrowthStats = async (matchCondition) => {
  return await User.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        newUsers: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
};

const getProviderStats = async (matchCondition) => {
  return await Provider.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$verification.status',
        count: { $sum: 1 }
      }
    }
  ]);
};

const getTopServices = async (matchCondition) => {
  return await Booking.aggregate([
    { $match: matchCondition },
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
        _id: '$service',
        serviceName: { $first: '$serviceInfo.name' },
        category: { $first: '$serviceInfo.category' },
        bookings: { $sum: 1 },
        revenue: { $sum: '$pricing.totalAmount' },
        averageRating: { $first: '$serviceInfo.ratings.averageRating' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
};

const getRecentActivity = async () => {
  const [recentBookings, recentUsers, recentReviews] = await Promise.all([
    Booking.find()
      .populate('user', 'name')
      .populate('service', 'name')
      .sort('-createdAt')
      .limit(5)
      .select('bookingId user service status createdAt'),
    
    User.find()
      .sort('-createdAt')
      .limit(5)
      .select('name email createdAt'),
    
    Review.find({ status: 'approved' })
      .populate('user', 'name')
      .populate('service', 'name')
      .sort('-createdAt')
      .limit(5)
      .select('user service rating comment createdAt')
  ]);

  return {
    recentBookings,
    recentUsers,
    recentReviews
  };
};

const getRevenueByPeriod = async (matchCondition, period) => {
  let groupBy = {};
  
  switch (period) {
    case 'day':
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'week':
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    case 'month':
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    case 'year':
      groupBy = {
        year: { $year: '$createdAt' }
      };
      break;
  }

  return await Booking.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$pricing.totalAmount' },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

module.exports = {
  getDashboardAnalytics,
  getRevenueAnalytics,
  getBookingAnalytics,
  getUserAnalytics,
  getServiceAnalytics,
  getServiceCategoryStats
};
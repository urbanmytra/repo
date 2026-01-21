const express = require('express');
const {
  getDashboardAnalytics,
  getRevenueAnalytics,
  getBookingAnalytics,
  getUserAnalytics,
  getServiceAnalytics,
  getServiceCategoryStats,
} = require('../controllers/analytics');

const { protectAdmin } = require('../middleware/auth');
const { checkAdminPermission } = require('../middleware/roleCheck');
const { queryValidations } = require('../middleware/validation');

const router = express.Router();

// All analytics routes require admin authentication
router.use(protectAdmin);
router.use(checkAdminPermission('analytics', 'read'));

// Analytics routes
router.get('/dashboard', queryValidations.dateRange, getDashboardAnalytics);
router.get('/revenue', queryValidations.dateRange, getRevenueAnalytics);
router.get('/bookings', queryValidations.dateRange, getBookingAnalytics);
router.get('/users', queryValidations.dateRange, getUserAnalytics);
router.get('/services', getServiceAnalytics);
router.get('/service-categories', getServiceCategoryStats);

module.exports = router;
const express = require('express');
const {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminDashboard,
  getSystemSettings,
  updateSystemSettings,
  getAdminActivity,
  bulkOperations,
  sendNotification
} = require('../controllers/admin');

const { 
  getDashboardStats, 
  getRecentBookings, 
  getRevenueChart, 
  getServiceChart 
} = require('../controllers/dashboard');

const { protectAdmin } = require('../middleware/auth');
const { checkAdminPermission, checkAdminTarget } = require('../middleware/roleCheck');
const { adminValidations, queryValidations } = require('../middleware/validation');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All admin routes require admin authentication
router.use(protectAdmin);

// Dashboard
router.get('/dashboard', checkAdminPermission('analytics', 'read'), getAdminDashboard);
// Dashboard specific routes
router.get('/dashboard/stats', checkAdminPermission('analytics', 'read'), getDashboardStats);
router.get('/dashboard/recent-bookings', checkAdminPermission('analytics', 'read'), getRecentBookings);
router.get('/dashboard/revenue-chart', checkAdminPermission('analytics', 'read'), getRevenueChart);
router.get('/dashboard/service-chart', checkAdminPermission('analytics', 'read'), getServiceChart);

// Admin management (super admin only)
router.get('/admins', checkAdminPermission('admins', 'read'), getAdmins);
router.post('/admins', 
  checkAdminPermission('admins', 'write'),
  adminValidations.createAdmin,
  createAdmin
);

router.put('/admins/:id', 
  checkAdminPermission('admins', 'write'),
  checkAdminTarget(['super_admin']),
  uploadConfigs.avatar,
  handleUploadError,
  adminValidations.updateAdmin,
  updateAdmin
);

router.delete('/admins/:id', 
  checkAdminPermission('admins', 'delete'),
  checkAdminTarget(['super_admin']),
  deleteAdmin
);

// System settings
router.get('/settings', checkAdminPermission('settings', 'read'), getSystemSettings);
router.put('/settings', checkAdminPermission('settings', 'write'), updateSystemSettings);

// Activity logs
router.get('/activity', checkAdminPermission('analytics', 'read'), queryValidations.pagination, getAdminActivity);

// Bulk operations
router.post('/bulk/:action', checkAdminPermission('users', 'write'), bulkOperations);

// Notifications
router.post('/notifications', checkAdminPermission('users', 'write'), sendNotification);

module.exports = router;
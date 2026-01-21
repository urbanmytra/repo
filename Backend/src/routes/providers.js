const express = require('express');
const {
  registerProvider,
  getProviders,
  getProvider,
  updateProvider,
  deleteProvider,
  verifyProvider,
  getProviderDashboard,
  updateProviderAvailability,
  getTopProviders
} = require('../controllers/providers');

const { protect, protectAdmin, protectProvider } = require('../middleware/auth');
const { checkAdminPermission, checkAdminTarget } = require('../middleware/roleCheck');
const { providerValidations, queryValidations } = require('../middleware/validation');
const { uploadConfigs, handleUploadError, cleanupFiles } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/register', providerValidations.register, registerProvider);
router.get('/', queryValidations.pagination, queryValidations.search, getProviders);
router.get('/top', getTopProviders);
router.get('/:id', getProvider);

// Admin only routes
router.delete('/:id', protectAdmin, checkAdminPermission('providers', 'delete'), deleteProvider);
router.put('/:id/verify', protectAdmin, checkAdminPermission('providers', 'verify'), verifyProvider);

// Provider and admin routes
router.put('/:id', 
  protectProvider,
  uploadConfigs.avatar,
  handleUploadError,
  cleanupFiles,
  providerValidations.updateProfile,
  updateProvider
);

// Provider specific routes
router.get('/:id/dashboard', protectProvider, getProviderDashboard);
router.put('/:id/availability', protectProvider, updateProviderAvailability);

module.exports = router;
// src/routes/services.js
const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  getFeaturedServices,
  getPopularServices,
  getServiceAnalytics,
  searchServices
} = require('../controllers/services');

const { protect, protectAdmin, protectProvider, optionalAuth } = require('../middleware/auth');
const { checkAdminPermission, checkServiceOwnership } = require('../middleware/roleCheck');
const { serviceValidations, queryValidations } = require('../middleware/validation');
const { uploadConfigs, handleUploadError, cleanupFiles } = require('../middleware/upload');

const router = express.Router();

// Public routes - UPDATED with proper validation
router.get('/', 
  queryValidations.pagination, 
  queryValidations.search, 
  getServices
);

router.get('/search', 
  queryValidations.search, 
  queryValidations.pagination,
  searchServices
);

router.get('/featured', getFeaturedServices);
router.get('/popular', getPopularServices);

router.get('/category/:category', 
  queryValidations.pagination,
  getServicesByCategory
);

router.get('/:id', 
  optionalAuth, 
  getService
);

// Protected routes
router.post('/', 
  protectProvider, 
  uploadConfigs.serviceImagesMemory,
  handleUploadError,
  cleanupFiles,
  serviceValidations.create, 
  createService
);

router.put('/:id', 
  protectProvider,
  checkServiceOwnership,
  uploadConfigs.serviceImagesMemory,
  handleUploadError,
  cleanupFiles,
  serviceValidations.update,
  updateService
);

router.delete('/:id', 
  protectProvider,
  checkServiceOwnership,
  deleteService
);

// Analytics (Provider/Admin only)
router.get('/:id/analytics', 
  protectProvider,
  checkServiceOwnership,
  getServiceAnalytics
);

module.exports = router;
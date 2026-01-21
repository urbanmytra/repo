const express = require('express');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  moderateReview,
  addReviewResponse,
  reportReview,
  getReviewStats
} = require('../controllers/reviews');

const { protect, protectAdmin, protectProvider } = require('../middleware/auth');
const { checkAdminPermission, checkOwnership } = require('../middleware/roleCheck');
const { reviewValidations, queryValidations } = require('../middleware/validation');
const { uploadConfigs, handleUploadError, cleanupFiles } = require('../middleware/upload');
const Review = require('../models/Review');

const router = express.Router();

// Public routes
router.get('/', queryValidations.pagination, queryValidations.search, getReviews);
router.get('/:id', getReview);

// Protected routes
router.use(protect);

// Create review (users only)
router.post('/', 
  uploadConfigs.reviewImagesMemory,
  handleUploadError,
  cleanupFiles,
  reviewValidations.create,
  createReview
);

router.get('/stats', protectAdmin, checkAdminPermission('reviews', 'read'), getReviewStats);

// Update/delete review (owner or admin)
router.put('/:id', 
  uploadConfigs.reviewImagesMemory,
  handleUploadError,
  cleanupFiles,
  checkOwnership(Review),
  updateReview
);

router.delete('/:id', checkOwnership(Review), deleteReview);

// Review interactions
router.put('/:id/helpful', markReviewHelpful);
router.post('/:id/report', reportReview);

// Provider/admin routes
router.post('/:id/response', addReviewResponse);

// Admin/moderator only routes
router.put('/:id/moderate', protectAdmin, checkAdminPermission('reviews', 'moderate'), moderateReview);

module.exports = router;
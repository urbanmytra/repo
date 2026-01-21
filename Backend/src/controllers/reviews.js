// backend/controllers/reviewController.js
const Review = require('../models/Review');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const { uploadMultipleImages, deleteImage } = require('../config/cloudinary');
const mongoose = require('mongoose');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  console.log('Get Reviews - Query Params:', req.query);
  try {
    let query = {};

    // Filter by service
    if (req.query.service) {
      query.service = req.query.service;
    }

    // Filter by provider
    if (req.query.provider) {
      query.provider = req.query.provider;
    }

    // Filter by user (admin only)
    if (req.query.user && req.admin) {
      query.user = req.query.user;
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    // Filter by status (admin/moderator only)
    if (req.query.status && (req.admin || req.moderator)) {
      query.status = req.query.status;
    } else {
      // Public can only see approved reviews
      query.status = 'approved';
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { comment: searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sort
    const sortBy = req.query.sort || '-createdAt';

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'service',
        select: 'name category'
      })
      .populate({
        path: 'provider',
        select: 'name businessInfo'
      })
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Pagination result
    const pagination = {};
    const endIndex = page * limit;

    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }

    if (skip > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination,
      data: reviews
    });
  } catch (error) {
    console.log('Get reviews error:', error);
    next(error);
  }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'service',
        select: 'name description category images'
      })
      .populate({
        path: 'provider',
        select: 'name businessInfo ratings'
      })
      .populate({
        path: 'booking',
        select: 'bookingId scheduledDate status'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review is public
    if (!req.admin && review.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Private/User
const createReview = async (req, res, next) => {
  try {
    const { 
      service: serviceId, 
      provider: providerId, 
      rating, 
      title,
      comment, 
      breakdown, 
      wouldRecommend, 
      pros, 
      cons 
    } = req.body;

    // Validate required fields
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID is required'
      });
    }

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment is required'
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider ID'
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check if user already reviewed this service
    const existingReview = await Review.findOne({
      service: serviceId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this service'
      });
    }

    // Handle image uploads (if any)
    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleImages(
          req.files.map(file => file.path),
          'reviews'
        );
        
        images = uploadResults.map((result, index) => ({
          public_id: result.public_id,
          url: result.url,
          caption: req.files[index].originalname
        }));
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Image upload failed'
        });
      }
    }

    // Create review WITHOUT booking requirement
    const reviewData = {
      user: req.user.id,
      service: serviceId,
      provider: providerId,
      rating,
      comment: comment.trim(),
      breakdown,
      wouldRecommend,
      status: 'approved'
    };

    // Add optional fields
    if (title && title.trim()) {
      reviewData.title = title.trim();
    }

    if (pros && Array.isArray(pros) && pros.length > 0) {
      reviewData.pros = pros.filter(p => p && p.trim());
    }

    if (cons && Array.isArray(cons) && cons.length > 0) {
      reviewData.cons = cons.filter(c => c && c.trim());
    }

    if (images.length > 0) {
      reviewData.images = images;
    }

    const review = await Review.create(reviewData);

    // Populate review details
    await review.populate([
      { path: 'user', select: 'name avatar' },
      { path: 'service', select: 'name category' },
      { path: 'provider', select: 'name businessInfo' }
    ]);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this service'
      });
    }

    next(error);
  }
};

// @desc    Update review
// @route   PATCH /api/v1/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin access
    if (!req.admin && review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      try {
        // Delete old images if replacing
        if (req.body.replaceImages === 'true' && review.images.length > 0) {
          for (const image of review.images) {
            if (image.public_id) {
              await deleteImage(image.public_id);
            }
          }
        }

        const uploadResults = await uploadMultipleImages(
          req.files.map(file => file.path),
          'reviews'
        );
        
        const newImages = uploadResults.map((result, index) => ({
          public_id: result.public_id,
          url: result.url,
          caption: req.files[index].originalname
        }));

        if (req.body.replaceImages === 'true') {
          req.body.images = newImages;
        } else {
          req.body.images = [...review.images, ...newImages];
        }
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: 'Image upload failed'
        });
      }
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'user', select: 'name avatar' },
      { path: 'service', select: 'name category' },
      { path: 'provider', select: 'name businessInfo' }
    ]);

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin access
    if (!req.admin && review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete images from cloudinary
    if (review.images && review.images.length > 0) {
      for (const image of review.images) {
        if (image.public_id) {
          try {
            await deleteImage(image.public_id);
          } catch (deleteError) {
            console.error('Error deleting review image:', deleteError);
          }
        }
      }
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
const markReviewHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    if (review.helpful.users.includes(req.user.id)) {
      // Remove from helpful
      await review.unmarkHelpful(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Review unmarked as helpful',
        data: review
      });
    } else {
      // Mark as helpful
      await review.markHelpful(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Review marked as helpful',
        data: review
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate review
// @route   PATCH /api/v1/reviews/:id/moderate
// @access  Private/Admin/Moderator
const moderateReview = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review status
    review.status = status;
    review.moderation = {
      moderatedBy: req.admin._id,
      moderatedAt: new Date(),
      reason,
      autoModerated: false
    };

    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: `Review ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add response to review
// @route   POST /api/v1/reviews/:id/response
// @access  Private/Provider/Admin
const addReviewResponse = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('provider', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if provider owns this review or admin
    if (!req.admin && (!req.provider || review.provider._id.toString() !== req.provider.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add response
    review.response = {
      from: req.admin ? 'admin' : 'provider',
      message: req.body.message,
      respondedAt: new Date(),
      respondedBy: req.admin ? req.admin._id : req.provider._id
    };

    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: 'Response added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report review
// @route   POST /api/v1/reviews/:id/report
// @access  Private
const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already reported this review
    const existingReport = review.reportedBy.find(
      report => report.user.toString() === req.user.id
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review'
      });
    }

    // Add report
    review.reportedBy.push({
      user: req.user.id,
      reason: req.body.reason,
      reportedAt: new Date()
    });

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get review statistics
// @route   GET /api/v1/reviews/stats
// @access  Private/Admin
const getReviewStats = async (req, res, next) => {
  try {
    const [
      overallStats,
      ratingDistribution,
      statusDistribution,
      monthlyReviews
    ] = await Promise.all([
      // Overall statistics
      Review.aggregate([
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            totalHelpful: { $sum: '$helpful.count' }
          }
        }
      ]),

      // Rating distribution
      Review.aggregate([
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]),

      // Status distribution
      Review.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Monthly reviews
      Review.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        overallStats: overallStats[0] || {},
        ratingDistribution,
        statusDistribution,
        monthlyReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
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
};
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    let query = User.find();

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      });
    }

    // Status filter
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query = query.find({
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        }
      });
    }

    // Sort
    const sortBy = req.query.sort || '-createdAt';
    query = query.sort(sortBy);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const users = await query.populate('bookings', 'status totalAmount createdAt');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin or own profile
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'bookings',
        select: 'service provider status totalAmount scheduledDate',
        populate: {
          path: 'service provider',
          select: 'name'
        }
      })
      .populate({
        path: 'reviews',
        select: 'service provider rating comment createdAt',
        populate: {
          path: 'service provider',
          select: 'name'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (!req.admin && req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin or own profile
const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can update this profile
    if (!req.admin && req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Handle avatar upload
    if (req.file) {
      try {
        // Delete old avatar if exists
        if (user.avatar && user.avatar.public_id) {
          await deleteImage(user.avatar.public_id);
        }

        // Upload new avatar
        const result = await uploadImage(req.file.path, 'users/avatars');
        req.body.avatar = {
          public_id: result.public_id,
          url: result.url
        };
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: 'Avatar upload failed'
        });
      }
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's avatar from cloudinary
    if (user.avatar && user.avatar.public_id) {
      try {
        await deleteImage(user.avatar.public_id);
      } catch (deleteError) {
        console.error('Error deleting avatar:', deleteError);
      }
    }

    // Soft delete - change status to inactive
    user.status = 'inactive';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/v1/users/:id/dashboard
// @access  Private
const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if user can access this dashboard
    if (!req.admin && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user stats
    const [bookingStats, recentBookings, recentReviews] = await Promise.all([
      // Booking statistics
      Booking.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),

      // Recent bookings
      Booking.find({ user: userId })
        .populate('service', 'name category')
        .populate('provider', 'name')
        .sort('-createdAt')
        .limit(5),

      // Recent reviews
      Review.find({ user: userId })
        .populate('service', 'name')
        .populate('provider', 'name')
        .sort('-createdAt')
        .limit(5)
    ]);

    // Process booking stats
    const stats = {
      totalBookings: 0,
      totalSpent: 0,
      pendingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };

    bookingStats.forEach(stat => {
      stats.totalBookings += stat.count;
      stats.totalSpent += stat.totalAmount;
      
      switch (stat._id) {
        case 'pending':
        case 'confirmed':
          stats.pendingBookings += stat.count;
          break;
        case 'completed':
          stats.completedBookings += stat.count;
          break;
        case 'cancelled':
          stats.cancelledBookings += stat.count;
          break;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentBookings,
        recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/v1/users/:id/preferences
// @access  Private
const updateUserPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can update preferences
    if (!req.admin && req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update preferences
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.status(200).json({
      success: true,
      data: user.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite services
// @route   GET /api/v1/users/:id/favorites
// @access  Private
const getUserFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'stats.favoriteServices',
        model: 'Service',
        select: 'name description pricing images ratings provider',
        populate: {
          path: 'provider',
          select: 'name ratings'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.stats.favoriteServices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add service to favorites
// @route   POST /api/v1/users/:id/favorites/:serviceId
// @access  Private
const addToFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const serviceId = req.params.serviceId;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can update favorites
    if (!req.admin && req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add to favorites if not already added
    if (!user.stats.favoriteServices.includes(serviceId)) {
      user.stats.favoriteServices.push(serviceId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Service added to favorites'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove service from favorites
// @route   DELETE /api/v1/users/:id/favorites/:serviceId
// @access  Private
const removeFromFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const serviceId = req.params.serviceId;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can update favorites
    if (!req.admin && req.user.id !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove from favorites
    user.stats.favoriteServices = user.stats.favoriteServices.filter(
      id => id.toString() !== serviceId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Service removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserDashboard,
  updateUserPreferences,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites
};
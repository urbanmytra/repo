const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { sendEmail } = require('../config/email');
const { generateToken } = require('../utils/generateToken');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register provider
// @route   POST /api/v1/providers/register
// @access  Public
const registerProvider = async (req, res, next) => {
  try {
    const { name, email, phone, password, businessInfo, specializations, experience } = req.body;

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: existingProvider.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    // Create provider
    const provider = await Provider.create({
      name,
      email,
      phone,
      password,
      businessInfo,
      specializations,
      experience,
      status: 'pending',
      verification: {
        status: 'pending'
      }
    });

    // Send welcome email
    try {
      await sendEmail({
        to: provider.email,
        subject: 'Welcome to Bagajatin - Provider Registration',
        html: `
          <h2>Welcome to Bagajatin, ${provider.name}!</h2>
          <p>Thank you for registering as a service provider. Your application is under review.</p>
          <p>Our team will verify your documents and approve your account within 2-3 business days.</p>
          <p>You will receive an email notification once your account is approved.</p>
          <p>Best regards,<br>The Bagajatin Team</p>
        `
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Provider registration successful. Your application is under review.',
      data: {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        status: provider.status,
        verification: provider.verification
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all providers
// @route   GET /api/v1/providers
// @access  Public/Admin
const getProviders = async (req, res, next) => {
  try {
    let query = {};

    // Only show verified providers to public
    if (!req.admin) {
      query = { 
        'verification.status': 'verified',
        status: 'active'
      };
    }

    // Apply filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.verification) {
      query['verification.status'] = req.query.verification;
    }

    if (req.query.specialization) {
      query.specializations = { $in: [req.query.specialization] };
    }

    if (req.query.city) {
      query['serviceArea.cities'] = { $in: [req.query.city] };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { 'businessInfo.businessName': searchRegex }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sort
    const sortBy = req.query.sort || '-createdAt';

    const total = await Provider.countDocuments(query);

    const providers = await Provider.find(query)
      .populate('services', 'name category ratings')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select('-password');

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
      count: providers.length,
      total,
      pagination,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single provider
// @route   GET /api/v1/providers/:id
// @access  Public
const getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate({
        path: 'services',
        select: 'name description category pricing images ratings availability',
        match: { status: 'active' }
      })
      .populate({
        path: 'reviews',
        select: 'user rating comment breakdown createdAt',
        populate: {
          path: 'user',
          select: 'name avatar'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      })
      .select('-password');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Only show verified providers to public
    if (!req.admin && provider.verification.status !== 'verified') {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider profile
// @route   PUT /api/v1/providers/:id
// @access  Private/Provider/Admin
const updateProvider = async (req, res, next) => {
  try {
    let provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check ownership
    if (!req.admin && req.provider && provider._id.toString() !== req.provider.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Handle avatar upload
    if (req.file) {
      try {
        // Delete old avatar
        if (provider.avatar && provider.avatar.public_id) {
          await deleteImage(provider.avatar.public_id);
        }

        // Upload new avatar
        const result = await uploadImage(req.file.path, 'providers/avatars');
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

    // Prevent updating verification status unless admin
    if (!req.admin && req.body.verification) {
      delete req.body.verification;
    }

    provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: provider,
      message: 'Provider updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete provider
// @route   DELETE /api/v1/providers/:id
// @access  Private/Admin
const deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      provider: provider._id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete provider with active bookings'
      });
    }

    // Soft delete - change status
    provider.status = 'inactive';
    await provider.save();

    res.status(200).json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify provider
// @route   PUT /api/v1/providers/:id/verify
// @access  Private/Admin
const verifyProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const { status, rejectionReason } = req.body;

    // Update verification status
    provider.verification = {
      ...provider.verification,
      status,
      verifiedAt: status === 'verified' ? new Date() : null,
      verifiedBy: req.admin._id,
      rejectionReason: status === 'rejected' ? rejectionReason : null
    };

    // Update provider status
    if (status === 'verified') {
      provider.status = 'active';
    } else if (status === 'rejected') {
      provider.status = 'pending';
    }

    await provider.save();

    // Send notification email
    try {
      let emailContent = '';
      if (status === 'verified') {
        emailContent = `
          <h2>Congratulations! Your provider account has been verified</h2>
          <p>You can now start offering your services on our platform.</p>
          <p>Login to your account to create and manage your services.</p>
        `;
      } else if (status === 'rejected') {
        emailContent = `
          <h2>Provider Verification Update</h2>
          <p>Your provider application has been reviewed and requires additional information.</p>
          <p><strong>Reason:</strong> ${rejectionReason}</p>
          <p>Please update your information and resubmit your application.</p>
        `;
      }

      await sendEmail({
        to: provider.email,
        subject: `Provider Verification ${status === 'verified' ? 'Approved' : 'Update Required'}`,
        html: emailContent
      });
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
    }

    res.status(200).json({
      success: true,
      data: provider,
      message: `Provider ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider dashboard
// @route   GET /api/v1/providers/:id/dashboard
// @access  Private/Provider
const getProviderDashboard = async (req, res, next) => {
  try {
    const providerId = req.params.id;

    // Check access
    if (!req.admin && req.provider && req.provider.id !== providerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get dashboard stats
    const [
      bookingStats,
      recentBookings,
      revenueStats,
      serviceStats,
      reviewStats
    ] = await Promise.all([
      // Booking statistics
      Booking.aggregate([
        { $match: { provider: mongoose.Types.ObjectId(providerId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),

      // Recent bookings
      Booking.find({ provider: providerId })
        .populate('user', 'name avatar')
        .populate('service', 'name category')
        .sort('-createdAt')
        .limit(5),

      // Revenue statistics
      Booking.aggregate([
        { 
          $match: { 
            provider: mongoose.Types.ObjectId(providerId),
            status: 'completed'
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$pricing.totalAmount' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ]),

      // Service statistics
      Service.aggregate([
        { $match: { provider: mongoose.Types.ObjectId(providerId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgRating: { $avg: '$ratings.averageRating' }
          }
        }
      ]),

      // Review statistics
      Review.aggregate([
        { $match: { provider: mongoose.Types.ObjectId(providerId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ])
    ]);

    // Process stats
    const stats = {
      totalBookings: 0,
      pendingBookings: 0,
      completedBookings: 0,
      totalEarnings: 0,
      totalServices: 0,
      activeServices: 0,
      averageRating: reviewStats[0]?.averageRating || 0,
      totalReviews: reviewStats[0]?.totalReviews || 0
    };

    bookingStats.forEach(stat => {
      stats.totalBookings += stat.count;
      if (stat._id === 'pending' || stat._id === 'confirmed') {
        stats.pendingBookings += stat.count;
      }
      if (stat._id === 'completed') {
        stats.completedBookings += stat.count;
        stats.totalEarnings += stat.totalAmount;
      }
    });

    serviceStats.forEach(stat => {
      stats.totalServices += stat.count;
      if (stat._id === 'active') {
        stats.activeServices += stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentBookings,
        revenueStats,
        bookingStats,
        serviceStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider availability
// @route   PUT /api/v1/providers/:id/availability
// @access  Private/Provider
const updateProviderAvailability = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check access
    if (!req.admin && req.provider && provider._id.toString() !== req.provider.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update availability
    provider.availability = { ...provider.availability, ...req.body };
    await provider.save();

    res.status(200).json({
      success: true,
      data: provider.availability,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top providers
// @route   GET /api/v1/providers/top
// @access  Public
const getTopProviders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const providers = await Provider.find({
      'verification.status': 'verified',
      status: 'active'
    })
      .populate('services', 'name category ratings')
      .sort('-ratings.averageRating')
      .limit(limit)
      .select('-password');

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerProvider,
  getProviders,
  getProvider,
  updateProvider,
  deleteProvider,
  verifyProvider,
  getProviderDashboard,
  updateProviderAvailability,
  getTopProviders
};
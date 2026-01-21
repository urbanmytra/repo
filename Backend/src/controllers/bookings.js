const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Provider = require('../models/Provider');
const { sendEmail, emailTemplates } = require('../config/email');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user && !req.admin && !req.provider) {
      // Regular user - only their bookings
      query.user = req.user.id;
    } else if (req.provider && !req.admin) {
      // Provider - only their bookings
      query.provider = req.provider.id;
    }
    // Admin can see all bookings

    // Apply filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.service) {
      query.service = req.query.service;
    }

    if (req.query.user && req.admin) {
      query.user = req.query.user;
    }

    if (req.query.provider && (req.admin || req.user)) {
      query.provider = req.query.provider;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Search by booking ID
    if (req.query.bookingId) {
      query.bookingId = { $regex: req.query.bookingId, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sort
    const sortBy = req.query.sort || '-createdAt';

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate({
        path: 'user',
        select: 'name email phone avatar'
      })
      .populate({
        path: 'service',
        select: 'name category pricing images'
      })
      .populate({
        path: 'provider',
        select: 'name businessInfo ratings'
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
      count: bookings.length,
      total,
      pagination,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email phone avatar address'
      })
      .populate({
        path: 'service',
        select: 'name description category pricing images duration warranty'
      })
      .populate({
        path: 'provider',
        select: 'name businessInfo ratings experience certifications'
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access permissions
    const hasAccess = req.admin || 
                     (req.user && booking.user._id.toString() === req.user.id) ||
                     (req.provider && booking.provider._id.toString() === req.provider.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private/User
const createBooking = async (req, res, next) => {
  try {
    // Get service details
    const service = await Service.findById(req.body.service)
      .populate('provider', 'name email verification status');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if service is available
    if (!service.availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Service is currently not available'
      });
    }

    // Check if provider is active and verified
    if (service.provider.verification.status !== 'verified' || service.provider.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Service provider is not available'
      });
    }

    // Set user and service details
    req.body.user = req.user.id;
    req.body.provider = service.provider._id;
    req.body.serviceDetails = {
      name: service.name,
      description: service.description,
      category: service.category,
      basePrice: service.pricing.basePrice,
      duration: service.duration.estimated
    };

    // Set customer info from user if not provided
    if (!req.body.customerInfo) {
      req.body.customerInfo = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      };
    }

    // Use the pricing from frontend if provided, otherwise calculate
    if (!req.body.pricing || !req.body.pricing.totalAmount) {
      req.body.pricing = {
        baseAmount: service.pricing.basePrice,
        discount: 0,
        taxes: {
          total: 0
        },
        totalAmount: service.pricing.basePrice
      };
    }

    // Generate a unique booking ID
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    req.body.bookingId = `BK${timestamp}${random}`;

    // Create booking
    const booking = await Booking.create(req.body);

    // Populate booking details
    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'service', select: 'name category' },
      { path: 'provider', select: 'name email businessInfo' }
    ]);

    // Send response immediately
    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });

    // Perform background tasks asynchronously (don't await)
    // This prevents timeout issues
    setImmediate(async () => {
      try {
        // Send confirmation emails (non-blocking)
        Promise.allSettled([
          // Email to customer
          sendEmail({
            to: booking.customerInfo.email,
            ...emailTemplates.bookingConfirmation(booking)
          }).catch(err => console.error('Customer email failed:', err)),

          // Email to provider
          sendEmail({
            to: booking.provider.email,
            subject: `New Booking Received - ${booking.service.name}`,
            html: `
              <h2>New Booking Alert</h2>
              <p>You have received a new booking:</p>
              <p><strong>Customer:</strong> ${booking.customerInfo.name}</p>
              <p><strong>Service:</strong> ${booking.service.name}</p>
              <p><strong>Date:</strong> ${booking.scheduling.preferredDate}</p>
              <p><strong>Amount:</strong> ₹${booking.pricing.totalAmount}</p>
              <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            `
          }).catch(err => console.error('Provider email failed:', err)),

          // Email to admin
          process.env.ADMIN_EMAIL && sendEmail({
            to: process.env.ADMIN_EMAIL,
            ...emailTemplates.adminBookingNotification(booking)
          }).catch(err => console.error('Admin email failed:', err))
        ]);

        // Update user and service stats (non-blocking)
        await Promise.allSettled([
          User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.totalBookings': 1 }
          }),
          Service.findByIdAndUpdate(service._id, {
            $inc: { 'stats.totalBookings': 1 }
          }),
          Provider.findByIdAndUpdate(service.provider._id, {
            $inc: { 'stats.totalBookings': 1 }
          })
        ]);
      } catch (backgroundError) {
        console.error('Background tasks failed:', backgroundError);
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    next(error);
  }
};


// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
const updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access permissions
    const hasAccess = req.admin || 
                     (req.user && booking.user.toString() === req.user.id) ||
                     (req.provider && booking.provider.toString() === req.provider.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['rescheduled', 'in-progress', 'cancelled'],
      'rescheduled': ['confirmed', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': ['disputed'],
      'cancelled': [],
      'no-show': [],
      'disputed': ['completed', 'cancelled']
    };

    if (req.body.status && !validTransitions[booking.status].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${req.body.status}`
      });
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'user', select: 'name email phone' },
      { path: 'service', select: 'name category' },
      { path: 'provider', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, reason, notes } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const hasAccess = req.admin || 
                     (req.provider && booking.provider._id.toString() === req.provider.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update status and add to history
    booking.status = status;
    booking.statusHistory.push({
      status,
      updatedBy: req.admin ? 'admin' : 'provider',
      reason,
      notes,
      timestamp: new Date()
    });

    // Handle specific status updates
    if (status === 'in-progress') {
      booking.scheduling.actualStartTime = new Date();
    }

    if (status === 'completed') {
      booking.scheduling.actualEndTime = new Date();
      booking.completion.workDescription = req.body.workDescription;
      booking.completion.providerNotes = req.body.providerNotes;
      
      // Update stats
      await Promise.all([
        User.findByIdAndUpdate(booking.user._id, {
          $inc: { 
            'stats.completedBookings': 1,
            'stats.totalSpent': booking.pricing.totalAmount
          }
        }),
        Service.findByIdAndUpdate(booking.service, {
          $inc: { 
            'stats.completedBookings': 1,
            'stats.totalRevenue': booking.pricing.totalAmount
          }
        }),
        Provider.findByIdAndUpdate(booking.provider._id, {
          $inc: { 
            'stats.completedBookings': 1,
            'stats.totalEarnings': booking.pricing.totalAmount
          }
        })
      ]);
    }

    if (status === 'cancelled') {
      booking.cancellation = {
        cancelledBy: req.admin ? 'admin' : 'provider',
        cancelledAt: new Date(),
        reason,
        cancellationCharges: booking.calculateCancellationCharges()
      };

      // Update cancelled stats
      await Promise.all([
        User.findByIdAndUpdate(booking.user._id, {
          $inc: { 'stats.cancelledBookings': 1 }
        }),
        Service.findByIdAndUpdate(booking.service, {
          $inc: { 'stats.cancelledBookings': 1 }
        }),
        Provider.findByIdAndUpdate(booking.provider._id, {
          $inc: { 'stats.cancelledBookings': 1 }
        })
      ]);
    }

    await booking.save();

    // Send notification emails
    try {
      const statusMessages = {
        confirmed: 'Your booking has been confirmed',
        'in-progress': 'Your service is now in progress',
        completed: 'Your service has been completed',
        cancelled: 'Your booking has been cancelled'
      };

      if (statusMessages[status]) {
        await sendEmail({
          to: booking.user.email,
          subject: `Booking Update - ${booking.service.name}`,
          html: `
            <h2>${statusMessages[status]}</h2>
            <p>Booking ID: ${booking.bookingId}</p>
            <p>Service: ${booking.service.name}</p>
            ${reason ? `<p>Reason: ${reason}</p>` : ''}
            ${notes ? `<p>Notes: ${notes}</p>` : ''}
          `
        });
      }
    } catch (emailError) {
      console.error('Notification email failed:', emailError);
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (!req.admin && req.user && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this time'
      });
    }

    // Calculate cancellation charges
    const cancellationCharges = booking.calculateCancellationCharges();

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.admin ? 'admin' : 'user',
      cancelledAt: new Date(),
      reason: req.body.reason || 'Cancelled by user',
      refundEligible: cancellationCharges < booking.pricing.totalAmount,
      cancellationCharges
    };

    booking.statusHistory.push({
      status: 'cancelled',
      updatedBy: req.admin ? 'admin' : 'user',
      reason: req.body.reason,
      timestamp: new Date()
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking analytics
// @route   GET /api/v1/bookings/analytics
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

    // Filter by provider if not admin
    if (req.provider && !req.admin) {
      matchCondition.provider = mongoose.Types.ObjectId(req.provider.id);
    }

    const [
      statusStats,
      dailyBookings,
      revenueStats,
      serviceStats
    ] = await Promise.all([
      // Status distribution
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),

      // Daily bookings trend
      Booking.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            bookings: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Revenue statistics
      Booking.aggregate([
        { 
          $match: { 
            ...matchCondition,
            status: 'completed'
          } 
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.totalAmount' },
            avgBookingValue: { $avg: '$pricing.totalAmount' },
            totalBookings: { $sum: 1 }
          }
        }
      ]),

      // Service-wise bookings
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
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        dailyBookings,
        revenueStats: revenueStats[0] || {},
        serviceStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add message to booking
// @route   POST /api/v1/bookings/:id/messages
// @access  Private
const addBookingMessage = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access
    const hasAccess = req.admin || 
                     (req.user && booking.user.toString() === req.user.id) ||
                     (req.provider && booking.provider.toString() === req.provider.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add message
    const message = {
      from: req.admin ? 'admin' : (req.provider ? 'provider' : 'user'),
      message: req.body.message,
      type: req.body.type || 'text',
      attachments: req.body.attachments || []
    };

    booking.communication.messages.push(message);
    booking.communication.lastMessageAt = new Date();

    // Update unread count
    if (req.user) {
      booking.communication.unreadCount.provider += 1;
    } else if (req.provider) {
      booking.communication.unreadCount.user += 1;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: message,
      message: 'Message added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking messages
// @route   GET /api/v1/bookings/:id/messages
// @access  Private
const getBookingMessages = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select('communication.messages user provider');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access
    const hasAccess = req.admin || 
                     (req.user && booking.user.toString() === req.user.id) ||
                     (req.provider && booking.provider.toString() === req.provider.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: booking.communication.messages || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking timeline
// @route   GET /api/v1/bookings/:id/timeline
// @access  Private
const getBookingTimeline = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select('statusHistory createdAt user provider');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access
    const hasAccess = req.admin || 
                     (req.user && booking.user.toString() === req.user.id) ||
                     (req.provider && booking.provider.toString() === req.provider.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create timeline from status history
    const timeline = [
      {
        status: 'created',
        timestamp: booking.createdAt,
        title: 'Booking Created',
        description: 'Booking request submitted'
      },
      ...booking.statusHistory.map(entry => ({
        status: entry.status,
        timestamp: entry.timestamp,
        title: `Booking ${entry.status.replace('-', ' ')}`,
        description: entry.reason || entry.notes || `Booking status changed to ${entry.status}`,
        updatedBy: entry.updatedBy
      }))
    ];

    res.status(200).json({
      success: true,
      data: timeline
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingAnalytics,
  addBookingMessage,
  getBookingMessages,
  getBookingTimeline
};
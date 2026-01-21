// routes/bookings.js
const express = require('express');
const {
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
} = require('../controllers/bookings');

const { protect, protectAdmin, protectProvider } = require('../middleware/auth');
const { checkAdminPermission, checkBookingAccess } = require('../middleware/roleCheck');
const { bookingValidations, queryValidations } = require('../middleware/validation');

const router = express.Router();

// Create a combined auth middleware that accepts admin, provider, or user tokens
const protectAny = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const Admin = require('../models/Admin');
    const Provider = require('../models/Provider');

    // Try to decode with regular JWT secret first
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // If that fails, try admin secret
      try {
        decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
      } catch (adminErr) {
        throw adminErr;
      }
    }

    // Try to find user in different models
    let user = await User.findById(decoded.id).select('-password');
    if (user && user.status === 'active') {
      req.user = user;
      return next();
    }

    let admin = await Admin.findById(decoded.id).select('-password');
    if (admin && admin.status === 'active') {
      req.admin = admin;
      return next();
    }

    let provider = await Provider.findById(decoded.id).select('-password');
    if (provider && provider.status === 'active') {
      req.provider = provider;
      return next();
    }

    // If no valid user found
    return res.status(401).json({
      success: false,
      message: 'User not found or inactive'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Use the combined auth middleware
router.use(protectAny);

// Get all bookings (filtered by user role)
router.get('/', queryValidations.pagination, queryValidations.dateRange, getBookings);

// Create new booking (users only)
router.post('/', bookingValidations.create, createBooking);

// Analytics (admin/provider only)
router.get('/analytics', getBookingAnalytics);

// Single booking routes
router.get('/:id', checkBookingAccess, getBooking);
router.put('/:id', checkBookingAccess, bookingValidations.update, updateBooking);

// Status management (provider/admin only)
router.put('/:id/status', checkBookingAccess, bookingValidations.updateStatus, updateBookingStatus);

// Cancel booking (user/admin only)
router.put('/:id/cancel', checkBookingAccess, cancelBooking);

// Communication
router.post('/:id/messages', checkBookingAccess, addBookingMessage);

router.get('/:id/messages', checkBookingAccess, getBookingMessages);
router.get('/:id/timeline', checkBookingAccess, getBookingTimeline);

module.exports = router;
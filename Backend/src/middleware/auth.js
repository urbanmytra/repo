// middleware/auth.js - Updated version
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Admin = require('../models/Admin');

// Universal authentication middleware that can handle any user type
const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Try to verify with different secrets
    let decoded;
    let isAdmin = false;
    
    try {
      // First try regular JWT secret
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      try {
        // Then try admin secret if it exists
        decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
        isAdmin = true;
      } catch (adminErr) {
        throw new Error('Invalid token');
      }
    }

    // Find the user in appropriate model
    let authenticatedUser = null;

    if (isAdmin) {
      // Check admin first if admin secret was used
      authenticatedUser = await Admin.findById(decoded.id).select('-password');
      if (authenticatedUser && authenticatedUser.status === 'active') {
        req.admin = authenticatedUser;
      }
    }

    if (!authenticatedUser) {
      // Check regular user
      authenticatedUser = await User.findById(decoded.id).select('-password');
      if (authenticatedUser && authenticatedUser.status === 'active') {
        req.user = authenticatedUser;
      }
    }

    if (!authenticatedUser) {
      // Check provider
      authenticatedUser = await Provider.findById(decoded.id).select('-password');
      if (authenticatedUser && authenticatedUser.status === 'active' && authenticatedUser.verification.status === 'verified') {
        req.provider = authenticatedUser;
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account not active'
      });
    }

    // Update last active time
    if (req.user) {
      req.user.lastLogin = new Date();
      await req.user.save({ validateBeforeSave: false });
    } else if (req.admin) {
      req.admin.lastActiveAt = new Date();
      await req.admin.save({ validateBeforeSave: false });
    } else if (req.provider) {
      req.provider.lastActive = new Date();
      await req.provider.save({ validateBeforeSave: false });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Admin-only authentication
const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Admin authentication required.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Admin account is not active'
      });
    }

    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Admin account is temporarily locked'
      });
    }

    admin.lastActiveAt = new Date();
    admin.activity.lastLogin = new Date();
    admin.activity.lastLoginIP = req.ip;
    await admin.save({ validateBeforeSave: false });

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid admin token.'
    });
  }
};

// Provider-only authentication
const protectProvider = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Provider authentication required.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const provider = await Provider.findById(decoded.id).select('-password');
    
    if (!provider) {
      return res.status(401).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.verification.status !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Provider account is not verified'
      });
    }

    if (provider.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Provider account is not active'
      });
    }

    provider.lastActive = new Date();
    await provider.save({ validateBeforeSave: false });

    req.provider = provider;
    next();
  } catch (error) {
    console.error('Provider auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid provider token.'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch (error) {
      // Continue without authentication if token is invalid
    }
  }

  next();
};

module.exports = {
  protect,
  protectAdmin,
  protectProvider,
  optionalAuth
};
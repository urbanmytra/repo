// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check admin permissions
const checkAdminPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check specific permission
    if (!req.admin.hasPermission(module, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permission: ${module}.${action}`
      });
    }

    next();
  };
};

// Check if admin can perform action on target
const checkAdminTarget = (allowedRoles = []) => {
  return async (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Super admin can target anyone
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check if current admin role is in allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges for this action'
      });
    }

    // If targeting another admin, check hierarchy
    if (req.params.adminId) {
      try {
        const Admin = require('../models/Admin');
        const targetAdmin = await Admin.findById(req.params.adminId);
        
        if (targetAdmin) {
          // Define role hierarchy
          const roleHierarchy = {
            'super_admin': 4,
            'admin': 3,
            'moderator': 2,
            'support': 1
          };

          const currentLevel = roleHierarchy[req.admin.role] || 0;
          const targetLevel = roleHierarchy[targetAdmin.role] || 0;

          // Can only manage admins with lower hierarchy level
          if (currentLevel <= targetLevel) {
            return res.status(403).json({
              success: false,
              message: 'Cannot perform action on admin with equal or higher privileges'
            });
          }
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error checking admin permissions'
        });
      }
    }

    next();
  };
};

// Check ownership or admin access
const checkOwnership = (Model, field = 'user') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Admin has access to everything
      if (req.admin) {
        req.resource = resource;
        return next();
      }

      // Check ownership
      const ownerId = resource[field]?.toString() || resource[field];
      const userId = req.user?._id?.toString();
      const providerId = req.provider?._id?.toString();

      if (userId && ownerId === userId) {
        req.resource = resource;
        return next();
      }

      if (providerId && ownerId === providerId) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      });
    }
  };
};

// Check if provider owns the service
const checkServiceOwnership = async (req, res, next) => {
  try {
    const Service = require('../models/Service');
    const service = await Service.findById(req.params.id || req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Admin has access
    if (req.admin) {
      req.service = service;
      return next();
    }

    // Provider must own the service
    if (req.provider && service.provider.toString() === req.provider._id.toString()) {
      req.service = service;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only manage your own services.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking service ownership'
    });
  }
};

// Check booking access (user, provider, or admin)
const checkBookingAccess = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.id || req.params.bookingId)
      .populate('user', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'name');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Admin has access
    if (req.admin) {
      req.booking = booking;
      return next();
    }

    // User who made the booking
    if (req.user && booking.user._id.toString() === req.user._id.toString()) {
      req.booking = booking;
      return next();
    }

    // Provider who provides the service
    if (req.provider && booking.provider._id.toString() === req.provider._id.toString()) {
      req.booking = booking;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own bookings.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking booking access'
    });
  }
};

module.exports = {
  authorize,
  checkAdminPermission,
  checkAdminTarget,
  checkOwnership,
  checkServiceOwnership,
  checkBookingAccess
};
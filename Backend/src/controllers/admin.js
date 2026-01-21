const Admin = require('../models/Admin');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { sendEmail } = require('../config/email');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// @desc    Get all admins
// @route   GET /api/v1/admin/admins
// @access  Private/SuperAdmin
const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .select('-password');

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create admin
// @route   POST /api/v1/admin/admins
// @access  Private/SuperAdmin
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role, personalInfo } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role,
      personalInfo,
      createdBy: req.admin._id
    });

    // Send welcome email
    try {
      await sendEmail({
        to: admin.email,
        subject: 'Welcome to Bagajatin Admin Panel',
        html: `
          <h2>Welcome to Bagajatin Admin Panel</h2>
          <p>Hello ${admin.name},</p>
          <p>Your admin account has been created with the role: <strong>${admin.role}</strong></p>
          <p>You can now access the admin panel using your credentials.</p>
          <p>Please change your password after first login.</p>
          <p>Best regards,<br>Bagajatin Team</p>
        `
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    // Log activity
    req.admin.logActivity('create', 'admin', admin._id, {
      adminName: admin.name,
      adminRole: admin.role
    });

    res.status(201).json({
      success: true,
      data: admin,
      message: 'Admin created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin
// @route   PUT /api/v1/admin/admins/:id
// @access  Private/SuperAdmin
const updateAdmin = async (req, res, next) => {
  try {
    let admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Handle avatar upload
    if (req.file) {
      try {
        // Delete old avatar
        if (admin.avatar && admin.avatar.public_id) {
          await deleteImage(admin.avatar.public_id);
        }

        // Upload new avatar
        const result = await uploadImage(req.file.path, 'admins/avatars');
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

    admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    // Log activity
    req.admin.logActivity('update', 'admin', admin._id, {
      adminName: admin.name,
      changes: Object.keys(req.body)
    });

    res.status(200).json({
      success: true,
      data: admin,
      message: 'Admin updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete admin
// @route   DELETE /api/v1/admin/admins/:id
// @access  Private/SuperAdmin
const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Cannot delete super admin
    if (admin.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete super admin'
      });
    }

    // Soft delete - change status
    admin.status = 'inactive';
    await admin.save();

    // Log activity
    req.admin.logActivity('delete', 'admin', admin._id, {
      adminName: admin.name
    });

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      userStats,
      providerStats,
      bookingStats,
      serviceStats,
      revenueStats,
      recentActivity
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Provider statistics
      Provider.aggregate([
        {
          $group: {
            _id: '$verification.status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Booking statistics
      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),

      // Service statistics
      Service.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Revenue statistics for last 30 days
      Booking.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.totalAmount' },
            totalBookings: { $sum: 1 },
            averageOrderValue: { $avg: '$pricing.totalAmount' }
          }
        }
      ]),

      // Recent activity
      getRecentAdminActivity()
    ]);

    // Process statistics
    const processedStats = {
      users: processStatsByStatus(userStats),
      providers: processStatsByStatus(providerStats),
      bookings: processStatsByStatus(bookingStats),
      services: processStatsByStatus(serviceStats),
      revenue: revenueStats[0] || { totalRevenue: 0, totalBookings: 0, averageOrderValue: 0 }
    };

    res.status(200).json({
      success: true,
      data: {
        stats: processedStats,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system settings
// @route   GET /api/v1/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res, next) => {
  try {
    // This would typically come from a settings collection
    // For now, return mock settings
    const settings = {
      general: {
        siteName: 'Bagajatin Services',
        siteDescription: 'Professional home services platform',
        contactEmail: process.env.ADMIN_EMAIL,
        maintenanceMode: false
      },
      booking: {
        defaultCancellationWindow: 24, // hours
        maxRescheduleCount: 2,
        autoConfirmBookings: false
      },
      payment: {
        defaultCommissionRate: 15, // percentage
        paymentMethods: ['cash', 'card', 'upi', 'wallet'],
        autoRefundCancellations: true
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/v1/admin/settings
// @access  Private/SuperAdmin
const updateSystemSettings = async (req, res, next) => {
  try {
    // This would typically update a settings collection
    // For now, just return success
    
    // Log activity
    req.admin.logActivity('update', 'settings', 'system', {
      settingsUpdated: Object.keys(req.body)
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin activity logs
// @route   GET /api/v1/admin/activity
// @access  Private/Admin
const getAdminActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, admin: adminId, action, startDate, endDate } = req.query;
    
    let matchCondition = {};
    
    if (adminId) {
      matchCondition._id = adminId;
    }

    if (startDate && endDate) {
      matchCondition['activity.actionsPerformed.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const activities = await Admin.aggregate([
      { $match: matchCondition },
      { $unwind: '$activity.actionsPerformed' },
      {
        $match: action ? 
          { 'activity.actionsPerformed.action': action } : 
          {}
      },
      {
        $project: {
          adminName: '$name',
          adminEmail: '$email',
          action: '$activity.actionsPerformed.action',
          target: '$activity.actionsPerformed.target',
          targetId: '$activity.actionsPerformed.targetId',
          details: '$activity.actionsPerformed.details',
          timestamp: '$activity.actionsPerformed.timestamp'
        }
      },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk operations
// @route   POST /api/v1/admin/bulk/:action
// @access  Private/Admin
const bulkOperations = async (req, res, next) => {
  try {
    const { action } = req.params;
    const { ids, data } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid IDs array'
      });
    }

    let result = {};
    let Model;

    switch (action) {
      case 'delete-users':
        Model = User;
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { status: 'inactive' }
        );
        break;

      case 'verify-providers':
        Model = Provider;
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { 
            'verification.status': 'verified',
            'verification.verifiedAt': new Date(),
            'verification.verifiedBy': req.admin._id,
            status: 'active'
          }
        );
        break;

      case 'approve-reviews':
        Model = Review;
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { 
            status: 'approved',
            'moderation.moderatedBy': req.admin._id,
            'moderation.moderatedAt': new Date()
          }
        );
        break;

      case 'update-booking-status':
        Model = Booking;
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { status: data.status }
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk action'
        });
    }

    // Log activity
    req.admin.logActivity('bulk_operation', action, ids.join(','), {
      action,
      count: ids.length,
      data
    });

    res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send notification to users
// @route   POST /api/v1/admin/notifications
// @access  Private/Admin
const sendNotification = async (req, res, next) => {
  try {
    const { recipients, subject, message, type = 'email' } = req.body;

    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipients array'
      });
    }

    let sent = 0;
    let failed = 0;

    for (const recipientId of recipients) {
      try {
        const user = await User.findById(recipientId);
        if (user && type === 'email') {
          await sendEmail({
            to: user.email,
            subject,
            html: `
              <h2>${subject}</h2>
              <p>${message}</p>
              <p>Best regards,<br>Bagajatin Team</p>
            `
          });
          sent++;
        }
      } catch (error) {
        failed++;
        console.error(`Failed to send notification to ${recipientId}:`, error);
      }
    }

    // Log activity
    req.admin.logActivity('send_notification', 'users', recipients.join(','), {
      subject,
      type,
      sent,
      failed
    });

    res.status(200).json({
      success: true,
      message: 'Notifications sent',
      data: { sent, failed }
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const processStatsByStatus = (stats) => {
  const result = {};
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });
  return result;
};

const getRecentAdminActivity = async () => {
  return await Admin.aggregate([
    { $unwind: '$activity.actionsPerformed' },
    {
      $project: {
        adminName: '$name',
        action: '$activity.actionsPerformed.action',
        target: '$activity.actionsPerformed.target',
        timestamp: '$activity.actionsPerformed.timestamp'
      }
    },
    { $sort: { timestamp: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminDashboard,
  getSystemSettings,
  updateSystemSettings,
  getAdminActivity,
  bulkOperations,
  sendNotification
};
const Notification = require('../models/Notification'); // You'll need to create this model
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// @desc    Get notifications
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by read status if specified
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Filter by user if not admin
    if (!req.admin) {
      query.recipient = req.user.id;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name avatar');

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send notification
// @route   POST /api/v1/notifications
// @access  Private/Admin
const sendNotification = async (req, res, next) => {
  try {
    const { recipient, title, message, type = 'info' } = req.body;

    const notification = await Notification.create({
      recipient,
      sender: req.admin._id,
      title,
      message,
      type
    });

    // Send email if specified
    if (req.body.sendEmail) {
      const user = await User.findById(recipient);
      if (user) {
        try {
          await sendEmail({
            to: user.email,
            subject: title,
            html: `
              <h2>${title}</h2>
              <p>${message}</p>
              <p>Best regards,<br>Bagajatin Team</p>
            `
          });
        } catch (emailError) {
          console.error('Email send failed:', emailError);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user can mark this notification
    if (!req.admin && notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  sendNotification,
  markAsRead
};
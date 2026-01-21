const express = require('express');
const {
  getNotifications,
  sendNotification,
  markAsRead
} = require('../controllers/notifications');

const { protect, protectAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.post('/', protectAdmin, sendNotification);
router.put('/:id/read', markAsRead);

module.exports = router;
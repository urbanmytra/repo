const express = require('express');
const {
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
} = require('../controllers/users');

const { protect, protectAdmin } = require('../middleware/auth');
const { checkAdminPermission, checkOwnership } = require('../middleware/roleCheck');
const { userValidations, queryValidations } = require('../middleware/validation');
const { uploadConfigs } = require('../middleware/upload');
const User = require('../models/User');

const router = express.Router();

// Admin only routes
router.get('/', protectAdmin, checkAdminPermission('users', 'read'), queryValidations.pagination, getUsers);
router.post('/', protectAdmin, checkAdminPermission('users', 'write'), userValidations.register, createUser);

// User and admin routes
router.get('/:id', protect, getUser);
router.put('/:id', protect, uploadConfigs.avatar, checkOwnership(User), updateUser);
router.delete('/:id', protectAdmin, checkAdminPermission('users', 'delete'), deleteUser);

// User specific routes
router.get('/:id/dashboard', protect, getUserDashboard);
router.put('/:id/preferences', protect, updateUserPreferences);
router.get('/:id/favorites', protect, getUserFavorites);
router.post('/:id/favorites/:serviceId', protect, addToFavorites);
router.delete('/:id/favorites/:serviceId', protect, removeFromFavorites);

module.exports = router;
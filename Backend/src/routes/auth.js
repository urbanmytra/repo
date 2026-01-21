const express = require('express');
const {
  register,
  login,
  adminLogin,
  providerLogin,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout
} = require('../controllers/auth');

const { protect, protectAdmin, protectProvider } = require('../middleware/auth');
const { userValidations } = require('../middleware/validation');
const { uploadConfigs } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/register', userValidations.register, register);
router.post('/login', userValidations.login, login);
router.post('/admin/login', adminLogin);
router.post('/provider/login', providerLogin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, uploadConfigs.avatar, userValidations.updateProfile, updateDetails);
router.put('/updatepassword', protect, userValidations.changePassword, updatePassword);
router.post('/logout', logout);

module.exports = router;
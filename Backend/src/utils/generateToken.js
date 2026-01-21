const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @param {string} userType - Type of user (user, provider, admin)
 * @returns {string} JWT token
 */
const generateToken = (userId, userType = 'user') => {
  const secret = userType === 'admin' 
    ? process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
    : process.env.JWT_SECRET;

  return jwt.sign({ id: userId, type: userType }, secret, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Generate verification token
 * @param {string} userId - User ID
 * @returns {string} Verification token
 */
const generateVerificationToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @returns {string} Reset token
 */
const generateResetToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '10m'
  });
};

/**
 * Verify token
 * @param {string} token - JWT token
 * @param {string} userType - Type of user
 * @returns {Object} Decoded token
 */
const verifyToken = (token, userType = 'user') => {
  const secret = userType === 'admin' 
    ? process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
    : process.env.JWT_SECRET;

  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken,
  verifyToken
};
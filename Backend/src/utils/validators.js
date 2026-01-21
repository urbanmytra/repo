const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} - True if valid range
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end && start <= new Date();
};

/**
 * Validate file type
 * @param {string} filename - File name
 * @param {Array} allowedTypes - Array of allowed extensions
 * @returns {boolean} - True if valid file type
 */
const isValidFileType = (filename, allowedTypes) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - True if valid coordinates
 */
const isValidCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate Indian PIN code
 * @param {string} pincode - PIN code to validate
 * @returns {boolean} - True if valid PIN code
 */
const isValidPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate rating value
 * @param {number} rating - Rating value
 * @returns {boolean} - True if valid rating
 */
const isValidRating = (rating) => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating * 2); // Allow half ratings
};

/**
 * Validate price value
 * @param {number} price - Price value
 * @returns {boolean} - True if valid price
 */
const isValidPrice = (price) => {
  return price >= 0 && Number.isFinite(price);
};

/**
 * Validate booking time slot
 * @param {string} timeSlot - Time slot string
 * @returns {boolean} - True if valid time slot
 */
const isValidTimeSlot = (timeSlot) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s?(AM|PM)?$/i;
  return timeRegex.test(timeSlot);
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidUrl,
  isValidDateRange,
  isValidFileType,
  isValidCoordinates,
  sanitizeString,
  isValidPincode,
  isValidRating,
  isValidPrice,
  isValidTimeSlot
};
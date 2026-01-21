const crypto = require('crypto');
const moment = require('moment');

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Generate unique booking ID
 * @returns {string} - Unique booking ID
 */
const generateBookingId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BK${timestamp}${random}`.toUpperCase();
};

/**
 * Calculate distance between two coordinates
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency
 */
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date
 * @param {Date} date - Date to format
 * @param {string} format - Format string
 * @returns {string} - Formatted date
 */
const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

/**
 * Get time ago string
 * @param {Date} date - Date to compare
 * @returns {string} - Time ago string
 */
const getTimeAgo = (date) => {
  return moment(date).fromNow();
};

/**
 * Paginate results
 * @param {Object} query - Mongoose query
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination info
 */
const paginate = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await query.model.countDocuments(query.getQuery());
  
  const results = await query.skip(skip).limit(limit);
  
  const pagination = {};
  const endIndex = page * limit;
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (skip > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  return {
    results,
    pagination,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

/**
 * Generate slug from string
 * @param {string} text - Text to slugify
 * @returns {string} - Slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Capitalize first letter
 * @param {string} string - String to capitalize
 * @returns {string} - Capitalized string
 */
const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
const deepMerge = (target, source) => {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

/**
 * Check if value is object
 * @param {*} item - Item to check
 * @returns {boolean} - True if object
 */
const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Remove undefined values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} - Cleaned object
 */
const removeUndefined = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

/**
 * Generate OTP
 * @param {number} length - OTP length
 * @returns {string} - OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Mask sensitive data
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of visible characters
 * @returns {string} - Masked data
 */
const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || data.length <= visibleChars) return data;
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + visible;
};

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} - Percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get business hours status
 * @param {Object} workingHours - Working hours object
 * @returns {Object} - Status object
 */
const getBusinessHoursStatus = (workingHours) => {
  const now = moment();
  const currentDay = now.format('dddd').toLowerCase();
  const currentTime = now.format('HH:mm');
  
  const todayHours = workingHours[currentDay];
  
  if (!todayHours || !todayHours.available) {
    return {
      isOpen: false,
      status: 'Closed today',
      nextOpen: getNextOpenTime(workingHours, now)
    };
  }
  
  const openTime = moment(todayHours.hours.start, 'HH:mm');
  const closeTime = moment(todayHours.hours.end, 'HH:mm');
  
  if (now.isBetween(openTime, closeTime)) {
    return {
      isOpen: true,
      status: `Open until ${closeTime.format('h:mm A')}`,
      closesAt: closeTime.format('HH:mm')
    };
  } else if (now.isBefore(openTime)) {
    return {
      isOpen: false,
      status: `Opens at ${openTime.format('h:mm A')}`,
      opensAt: openTime.format('HH:mm')
    };
  } else {
    return {
      isOpen: false,
      status: 'Closed',
      nextOpen: getNextOpenTime(workingHours, now)
    };
  }
};

/**
 * Get next open time
 * @param {Object} workingHours - Working hours object
 * @param {Object} currentTime - Current moment object
 * @returns {string} - Next open time
 */
const getNextOpenTime = (workingHours, currentTime) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let checkDate = currentTime.clone().add(1, 'day');
  
  for (let i = 0; i < 7; i++) {
    const dayName = checkDate.format('dddd').toLowerCase();
    const dayHours = workingHours[dayName];
    
    if (dayHours && dayHours.available) {
      return `${checkDate.format('dddd')} at ${moment(dayHours.hours.start, 'HH:mm').format('h:mm A')}`;
    }
    
    checkDate.add(1, 'day');
  }
  
  return 'Schedule not available';
};

/**
 * Generate file name
 * @param {string} originalName - Original file name
 * @param {string} prefix - Prefix for file name
 * @returns {string} - Generated file name
 */
const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const extension = originalName.split('.').pop();
  
  return `${prefix}${timestamp}_${random}.${extension}`;
};

/**
 * Validate business hours
 * @param {Object} hours - Hours object
 * @returns {boolean} - True if valid
 */
const validateBusinessHours = (hours) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (const day of days) {
    if (hours[day] && hours[day].available) {
      const { start, end } = hours[day].hours;
      
      if (!start || !end) return false;
      
      const startTime = moment(start, 'HH:mm');
      const endTime = moment(end, 'HH:mm');
      
      if (!startTime.isValid() || !endTime.isValid()) return false;
      if (startTime.isAfter(endTime)) return false;
    }
  }
  
  return true;
};

/**
 * Calculate service area coverage
 * @param {Object} coordinates - Center coordinates
 * @param {number} radius - Radius in km
 * @param {Array} cities - Array of cities
 * @returns {Object} - Coverage info
 */
const calculateServiceCoverage = (coordinates, radius, cities = []) => {
  return {
    center: coordinates,
    radius: radius,
    cities: cities,
    estimatedArea: Math.PI * Math.pow(radius, 2), // Area in sq km
    coverageType: cities.length > 0 ? 'city-based' : 'radius-based'
  };
};

module.exports = {
  generateRandomString,
  generateBookingId,
  calculateDistance,
  formatCurrency,
  formatDate,
  getTimeAgo,
  paginate,
  slugify,
  capitalize,
  deepMerge,
  isObject,
  removeUndefined,
  generateOTP,
  maskSensitiveData,
  calculatePercentage,
  getBusinessHoursStatus,
  getNextOpenTime,
  generateFileName,
  validateBusinessHours,
  calculateServiceCoverage
};
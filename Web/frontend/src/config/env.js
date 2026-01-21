// src/config/env.js
export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Bagajatin',
  ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Feature flags
  FEATURES: {
    REVIEWS: import.meta.env.VITE_ENABLE_REVIEWS !== 'false',
    CHAT: import.meta.env.VITE_ENABLE_CHAT === 'true',
    NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50,
  },
  
  // Map configuration
  MAP: {
    DEFAULT_LAT: 22.5726,
    DEFAULT_LNG: 88.3639, // Kolkata coordinates
    DEFAULT_ZOOM: 12,
  },
};

export default config;
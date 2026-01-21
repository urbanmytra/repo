const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/v1/health
// @access  Public
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    // Check uptime
    const uptime = process.uptime();
    
    // System info
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        name: mongoose.connection.name
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      },
      services: {
        api: 'operational',
        database: dbStatus === 'connected' ? 'operational' : 'down',
        fileUpload: 'operational',
        email: 'operational'
      }
    };

    // If database is down, return 503
    if (dbStatus !== 'connected') {
      return res.status(503).json({
        ...healthInfo,
        status: 'unhealthy',
        message: 'Database connection failed'
      });
    }

    res.status(200).json(healthInfo);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

router.get('/', healthCheck);

module.exports = router;
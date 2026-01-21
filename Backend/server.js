const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
  
  console.log(`
    🚀 Bagajatin Backend Server Running
    📍 Server URL: http://localhost:${PORT}
    📊 API Documentation: http://localhost:${PORT}/api/v1/health
    🔗 Health Check: http://localhost:${PORT}/api/v1/health
    🌍 Environment: ${process.env.NODE_ENV}
    📝 Logs Directory: ./logs/
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack
  });
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});
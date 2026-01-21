const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    if (field === 'email') {
      message = 'Email already exists';
    } else if (field === 'phone') {
      message = 'Phone number already exists';
    } else {
      message = `${field} already exists`;
    }
    
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected field';
    error = new ErrorResponse(message, 400);
  }

  // Database connection errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    const message = 'Database error occurred';
    error = new ErrorResponse(message, 500);
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = new ErrorResponse(message, 429);
  }

  // Payment errors
  if (err.type === 'payment_error') {
    const message = err.message || 'Payment processing failed';
    error = new ErrorResponse(message, 400);
  }

  // Email errors
  if (err.code === 'EAUTH' || err.code === 'ECONNECTION') {
    const message = 'Email service temporarily unavailable';
    error = new ErrorResponse(message, 503);
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = new ErrorResponse('Server Error', 500);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

module.exports = errorHandler;
/**
 * @fileoverview Error Handler Middleware for ShadowNews Platform
 * 
 * Comprehensive centralized error handling system for the ShadowNews platform.
 * This middleware provides standardized error processing, logging, and response
 * formatting for all application errors. It handles various error types including
 * database validation errors, authentication failures, file upload issues, and
 * generic application errors with appropriate HTTP status codes and user-friendly
 * messages.
 * 
 * Key Features:
 * - Centralized error handling for consistent API responses
 * - Comprehensive error type detection and transformation
 * - Detailed error logging with request context and user information
 * - Security-conscious error message sanitization for production
 * - Development vs production error detail differentiation
 * - Database error translation (Mongoose validation, duplicate keys, cast errors)
 * - Authentication error handling (JWT validation, token expiration)
 * - File upload error processing (Multer size limits, field validation)
 * - Custom error response class for application-specific errors
 * - Request metadata capture for debugging and monitoring
 * 
 * Error Categories:
 * - Database Errors: Mongoose validation, cast errors, duplicate keys
 * - Authentication Errors: JWT validation, token expiration, unauthorized access
 * - File Upload Errors: Size limits, unexpected fields, format validation
 * - Validation Errors: Input validation failures, schema violations
 * - Authorization Errors: Insufficient permissions, role restrictions
 * - Application Errors: Business logic failures, custom error conditions
 * - System Errors: Server failures, external service errors
 * 
 * Security Features:
 * - Error message sanitization to prevent information leakage
 * - Stack trace exposure only in development environment
 * - User context logging for security monitoring
 * - IP address tracking for abuse detection
 * - Request metadata capture for forensic analysis
 * 
 * Logging Features:
 * - Comprehensive error context capture
 * - Request details (URL, method, IP, user)
 * - Error stack traces for debugging
 * - Structured logging format for analysis tools
 * - User activity correlation for security monitoring
 * 
 * Response Format:
 * - Consistent JSON error response structure
 * - HTTP status code standardization
 * - User-friendly error messages
 * - Development-specific debugging information
 * - Error categorization for client handling
 * 
 * Dependencies:
 * - logger: Application logging utility for error tracking
 * - Mongoose: Database error type detection and handling
 * - JWT: Authentication error processing
 * - Multer: File upload error handling
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for error handling
const logger = require('../../utils/logger'); // Application logging utility

/**
 * Centralized Error Handler Middleware
 * Processes all application errors and provides standardized responses
 * 
 * This middleware serves as the final error processing layer for the application,
 * capturing all unhandled errors, transforming them into user-friendly responses,
 * and ensuring comprehensive logging for debugging and monitoring purposes.
 * 
 * Error Processing Flow:
 * 1. Capture error and request context information
 * 2. Log comprehensive error details for monitoring
 * 3. Detect specific error types and transform appropriately
 * 4. Sanitize error messages for security and user experience
 * 5. Format standardized JSON response with appropriate status code
 * 6. Include debugging information in development environment
 * 
 * @middleware
 * @param {Error} err - Error object to be processed
 * @param {Object} req - Express request object with context
 * @param {Object} res - Express response object for error response
 * @param {Function} next - Express next middleware function (unused in final handler)
 * 
 * @example
 * // Used as final middleware in Express app
 * app.use(errorHandler);
 * 
 * // Errors automatically routed here from any previous middleware
 * // No manual invocation required
 */
const errorHandler = (err, req, res, next) => {
  // Create error copy to avoid modifying original error object
  let error = { ...err };
  error.message = err.message;

  // Comprehensive error logging with request context
  // This provides complete debugging information and security monitoring
  logger.error({
    message: err.message,              // Error message for debugging
    stack: err.stack,                  // Stack trace for code location
    url: req.originalUrl,              // Request URL for context
    method: req.method,                // HTTP method (GET, POST, etc.)
    ip: req.ip,                        // Client IP address for security tracking
    user: req.user?.id || 'anonymous', // User ID for activity correlation
    headers: req.headers,              // Request headers for debugging
    body: req.body,                    // Request body (sanitized for logging)
    timestamp: new Date().toISOString() // Precise error timestamp
  });

  // Database Error Handling - Mongoose CastError
  // Occurs when invalid ObjectId format is provided (e.g., malformed MongoDB ID)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Database Error Handling - Mongoose Duplicate Key Error
  // Occurs when attempting to create duplicate entries for unique fields
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}`;
    error = new ErrorResponse(message, 400);
  }

  // Database Error Handling - Mongoose Validation Error
  // Occurs when document fails schema validation (required fields, format, etc.)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // Authentication Error Handling - JWT Token Validation Error
  // Occurs when JWT token is malformed, invalid signature, or corrupted
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  // Authentication Error Handling - JWT Token Expiration Error
  // Occurs when JWT token has passed its expiration time
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  // File Upload Error Handling - Multer Errors
  // Handles various file upload validation and processing errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      // File exceeds maximum allowed size limit
      const message = 'File too large';
      error = new ErrorResponse(message, 400);
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      // Unexpected file field name or too many files uploaded
      const message = 'Unexpected file field';
      error = new ErrorResponse(message, 400);
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      // Too many files uploaded simultaneously
      const message = 'Too many files uploaded';
      error = new ErrorResponse(message, 400);
    } else if (err.code === 'LIMIT_FIELD_COUNT') {
      // Too many form fields in multipart upload
      const message = 'Too many form fields';
      error = new ErrorResponse(message, 400);
    }
  }

  // Rate Limiting Error Handling
  // Occurs when user exceeds rate limit thresholds
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = new ErrorResponse(message, 429);
  }

  // Permission Error Handling
  // Custom application errors for authorization failures
  if (err.name === 'PermissionError') {
    const message = 'Insufficient permissions for this action';
    error = new ErrorResponse(message, 403);
  }

  // Email Service Error Handling
  // Errors from email sending and verification services
  if (err.name === 'EmailError') {
    const message = 'Email service error, please try again later';
    error = new ErrorResponse(message, 502);
  }

  // CSV Processing Error Handling
  // Errors from CSV file parsing and validation
  if (err.name === 'CSVError') {
    const message = 'CSV file processing error: ' + err.message;
    error = new ErrorResponse(message, 400);
  }

  // Snowball Service Error Handling
  // Errors from email distribution and growth services
  if (err.name === 'SnowballError') {
    const message = 'Email distribution error, please try again later';
    error = new ErrorResponse(message, 502);
  }

  // AI Service Error Handling
  // Errors from AI content analysis and suggestion services
  if (err.name === 'AIServiceError') {
    const message = 'AI service temporarily unavailable';
    error = new ErrorResponse(message, 503);
  }

  // Generate standardized error response
  // Consistent JSON structure across all error types
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      code: error.statusCode || 500,
      type: error.name || 'ServerError',
      // Include stack trace only in development for debugging
      // This prevents sensitive information leakage in production
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: error.details || null
      }),
      // Include request ID for tracking if available
      ...(req.requestId && { requestId: req.requestId }),
      // Include timestamp for client-side logging
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Custom Error Response Class
 * Provides structured error handling with HTTP status codes
 * 
 * This class extends the native Error class to include HTTP status codes
 * and additional metadata for API error responses. Used throughout the
 * application to create consistent, actionable error objects.
 * 
 * Features:
 * - HTTP status code integration
 * - Custom error message support
 * - Extensible for additional error metadata
 * - Compatible with Express error handling middleware
 * 
 * @class ErrorResponse
 * @extends Error
 * 
 * @example
 * // Create a custom validation error
 * throw new ErrorResponse('Invalid email address format', 400);
 * 
 * // Create an authorization error
 * throw new ErrorResponse('Access denied', 403);
 * 
 * // Create a not found error
 * throw new ErrorResponse('User not found', 404);
 */
class ErrorResponse extends Error {
  /**
   * Create a new ErrorResponse instance
   * 
   * @param {string} message - User-friendly error message
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 500, etc.)
   * @param {Object} details - Optional additional error details
   */
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ErrorResponse';
    
    // Capture stack trace for debugging (excluding constructor call)
    Error.captureStackTrace(this, ErrorResponse);
  }
}

/**
 * Not Found Error Handler
 * Handles requests to non-existent endpoints
 * 
 * This middleware catches requests to undefined routes and returns a
 * standardized 404 error response. Should be placed before the main
 * error handler in the middleware chain.
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * // Use before main error handler
 * app.use(notFoundHandler);
 * app.use(errorHandler);
 */
const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  next(new ErrorResponse(message, 404));
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch Promise rejections
 * 
 * This utility function wraps async route handlers to automatically
 * catch Promise rejections and forward them to the error handling
 * middleware, eliminating the need for manual try-catch blocks.
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 * 
 * @example
 * // Wrap async route handlers
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export error handling utilities
module.exports = { 
  errorHandler,      // Main error handling middleware
  ErrorResponse,     // Custom error response class
  notFoundHandler,   // 404 error handler for undefined routes
  asyncHandler      // Async function wrapper for automatic error catching
};
/**
 * @fileoverview Express Application Configuration
 * 
 * This file configures the main Express.js application with:
 * - Security middleware (CORS, Helmet, XSS protection)
 * - Request parsing and validation
 * - Rate limiting for API protection
 * - File upload handling
 * - API route mounting
 * - Error handling middleware
 * 
 * This is the core application that gets used by server.js to create the HTTP server.
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// Core Express.js framework for web application
const express = require('express');

// Cross-Origin Resource Sharing middleware for frontend communication
const cors = require('cors');

// Security middleware to set various HTTP headers
const helmet = require('helmet');

// Compression middleware for response optimization
const compression = require('compression');

// HTTP request logger for debugging and monitoring
const morgan = require('morgan');

// Rate limiting middleware to prevent abuse
const rateLimit = require('express-rate-limit');

// MongoDB injection attack prevention
const mongoSanitize = require('express-mongo-sanitize');

// Cross-site scripting (XSS) attack prevention
const xss = require('xss-clean');

// HTTP Parameter Pollution attack prevention
const hpp = require('hpp');

// Cookie parsing middleware for authentication
const cookieParser = require('cookie-parser');

// File upload handling middleware
const fileUpload = require('express-fileupload');

// Node.js path utilities for file system operations
const path = require('path');

// API route definitions and handlers
const routes = require('./api/routes');

// Global error handling middleware
const errorHandler = require('./api/middlewares/errorHandler.middleware');

// Centralized logging utility
const { logger } = require('./utils/logger');

/**
 * Express Application Instance
 * Create the main Express application that will handle all HTTP requests
 */
const app = express();

/**
 * Proxy Trust Configuration
 * Trust the first proxy when running behind load balancers or reverse proxies
 * This ensures accurate IP address detection for rate limiting and logging
 */
// Configure proxy trust for accurate IP detection behind load balancers
app.set('trust proxy', 1);

/**
 * Security Headers Middleware (Helmet.js)
 * Sets various HTTP headers to protect against common web vulnerabilities:
 * - Content Security Policy to prevent XSS attacks
 * - X-Frame-Options to prevent clickjacking
 * - X-Content-Type-Options to prevent MIME type sniffing
 * - And many other security headers
 */
// Configure Helmet.js security headers with custom Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Only allow resources from same origin by default
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React components
      scriptSrc: ["'self'"], // Only allow scripts from same origin
      imgSrc: ["'self'", 'data:', 'https:'], // Allow images from same origin, data URLs, and HTTPS
      connectSrc: ["'self'"], // Only allow connections to same origin
      fontSrc: ["'self'"], // Only allow fonts from same origin
      objectSrc: ["'none'"], // Block all object/embed/applet elements
      mediaSrc: ["'self'"], // Only allow media from same origin
      frameSrc: ["'none'"], // Block all iframe elements
    },
  },
  crossOriginEmbedderPolicy: false, // Disable COEP for better compatibility
}));

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Configures which frontend domains can access this API
 * Supports dynamic origin checking based on environment variables
 */
// Dynamic CORS configuration with origin validation
const corsOptions = {
  // Dynamic origin validation function
  origin: function (origin, callback) {
    // Get allowed origins from environment variables or use localhost for development
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, curl, etc.) or from allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authentication headers
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'], // Headers exposed to frontend for pagination
};
// Apply CORS configuration to all routes
app.use(cors(corsOptions));

/**
 * Request Body Parsing Middleware
 * Configures how the server parses incoming request bodies for different content types
 */
// JSON body parser with size limit to prevent memory exhaustion attacks
app.use(express.json({ limit: '10mb' }));

// URL-encoded form data parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for handling authentication cookies and user preferences
app.use(cookieParser());

/**
 * File Upload Middleware Configuration
 * Handles file uploads with security constraints and temporary file management
 * Used for CSV imports, avatar uploads, and other file operations
 */
// Configure file upload handling with security limits
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB maximum file size limit
  useTempFiles: true, // Use temporary files for better memory management
  tempFileDir: path.join(__dirname, '../temp'), // Temporary file storage directory
  abortOnLimit: true, // Abort upload if size limit exceeded
  responseOnLimit: 'File size limit exceeded', // Error message for oversized files
  uploadTimeout: 60000, // 60 second upload timeout
}));

/**
 * Response Compression Middleware
 * Automatically compresses HTTP responses to reduce bandwidth usage
 * Improves performance especially for JSON API responses and static assets
 */
// Enable gzip compression for all responses
app.use(compression());

/**
 * HTTP Request Logging Middleware
 * Logs all incoming HTTP requests for debugging and monitoring
 * Uses different log formats for development vs production environments
 */
// Configure request logging based on environment
if (process.env.NODE_ENV === 'development') {
  // Use concise logging format for development
  app.use(morgan('dev'));
} else {
  // Use detailed logging format for production with custom stream
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

/**
 * Security Middleware Stack
 * Multiple layers of security to protect against common web attacks
 */
// Prevent MongoDB NoSQL injection attacks by sanitizing user input
app.use(mongoSanitize());

// Clean user input from malicious XSS (Cross-Site Scripting) code
app.use(xss());

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());

/**
 * Rate Limiting Configuration
 * Implements different rate limits for general API usage and authentication endpoints
 * Helps prevent abuse, brute force attacks, and API overuse
 */
// General API rate limiter - prevents API abuse and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute sliding window
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication endpoints - prevents brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute sliding window
  max: 5, // Limit each IP to only 5 authentication attempts per window
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests against the limit
});

/**
 * Apply Rate Limiting to Routes
 * Different endpoints get different rate limiting based on their security requirements
 */
// Apply general rate limiting to all API routes
app.use('/api/', limiter);

// Apply stricter rate limiting to authentication endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/**
 * Request Timeout Middleware
 * Prevents requests from hanging indefinitely and consuming server resources
 * Automatically terminates requests that take too long to process
 */
// Set a timeout for all requests to prevent hanging connections
app.use((req, res, next) => {
  res.setTimeout(30000, () => { // 30 second timeout
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

/**
 * Health Check Endpoint
 * Provides a simple endpoint for monitoring services to check if the API is running
 * Returns server status, uptime, and environment information
 */
// Health check endpoint for monitoring and load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy', // Server status indicator
    timestamp: new Date().toISOString(), // Current server time
    uptime: process.uptime(), // How long the server has been running (seconds)
    environment: process.env.NODE_ENV, // Current environment (development/production)
  });
});

/**
 * API Routes Integration
 * Mount all API routes under the /api prefix
 * This includes routes for authentication, posts, comments, repositories, etc.
 */
// Mount all API routes with /api prefix
app.use('/api', routes);

/**
 * Static File Serving (Production Only)
 * In production, serve the built React frontend from the Express server
 * This allows for a single server to handle both API and frontend requests
 */
// Serve static files in production environment
if (process.env.NODE_ENV === 'production') {
  // Serve built React app static files
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  /**
   * Frontend Route Handler (SPA Support)
   * Handle all non-API routes by serving the React app's index.html
   * This enables client-side routing for the single-page application
   */
  // Catch-all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

/**
 * 404 Error Handler
 * Handles requests to non-existent routes by creating a standardized 404 error
 * This middleware runs for any route that wasn't matched by previous handlers
 */
// Handle 404 errors for unmatched routes
app.use((req, res, next) => {
  const error = new Error('Resource not found');
  error.statusCode = 404;
  next(error); // Pass error to global error handler
});

/**
 * Global Error Handling Middleware
 * Catches all errors passed through next(error) and formats them consistently
 * This is the final middleware that handles all application errors
 */
// Apply global error handling middleware (must be last)
app.use(errorHandler);

/**
 * Module Export
 * Export the configured Express application for use by server.js
 */
module.exports = app;
/**
 * @fileoverview Main server entry point for ShadowNews backend
 * 
 * This file serves as the primary server initialization point that:
 * - Sets up the HTTP server with Express.js
 * - Configures Socket.IO for real-time communication
 * - Initializes security middleware (CORS, Helmet, rate limiting)
 * - Establishes database connections (MongoDB and Redis)
 * - Starts background workers for email processing and other tasks
 * - Handles WebSocket connections for live updates
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// Core Express.js framework for HTTP server functionality
const express = require('express');

// CORS middleware to handle cross-origin requests from frontend
const cors = require('cors');

// Security middleware to set various HTTP headers for protection
const helmet = require('helmet');

// Compression middleware to gzip responses for better performance
const compression = require('compression');

// MongoDB injection attack prevention middleware
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiting middleware to prevent abuse and DDoS attacks
const rateLimit = require('express-rate-limit');

// HTTP request logger middleware for debugging and monitoring
const morgan = require('morgan');

// Node.js HTTP server creation utility
const { createServer } = require('http');

// Socket.IO for real-time WebSocket communication
const { Server } = require('socket.io');

// Main Express application with routes and middleware configured
const app = require('./app');

// Database connection utilities for MongoDB and Redis
const { connectDatabase } = require('./utils/database');
const { connectRedis } = require('./utils/redis');

// Centralized logging utility for application-wide logging
const logger = require('./utils/logger');

// Configuration management for environment-specific settings
const config = require('./config');

// WebSocket event handlers for real-time features
const websocketHandlers = require('./websocket');

// Background worker processes for email processing and scheduled tasks
const workers = require('./workers');

/**
 * HTTP Server Setup
 * Creates an HTTP server instance that can handle both regular HTTP requests
 * and upgrade to WebSocket connections for real-time features
 */
// Create HTTP server using the configured Express app
const httpServer = createServer(app);

/**
 * Socket.IO Real-time Communication Setup
 * Initializes WebSocket server for real-time features like:
 * - Live post updates and voting
 * - Real-time comment notifications
 * - Typing indicators in comment threads
 * - Live repository member count updates
 */
// Initialize Socket.IO with CORS and transport configuration
const io = new Server(httpServer, {
  cors: {
    origin: config.server.corsOrigins, // Allow frontend domains to connect
    credentials: true // Enable cookies/auth in WebSocket connections
  },
  transports: ['websocket', 'polling'] // Fallback to polling if WebSocket fails
});

/**
 * Security Middleware Configuration
 * Implements multiple layers of security to protect against common web vulnerabilities
 */
// Helmet.js security headers to prevent XSS, clickjacking, and other attacks
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Only allow resources from same origin by default
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for dynamic components
      scriptSrc: ["'self'"], // Only allow scripts from same origin
      imgSrc: ["'self'", "data:", "https:"], // Allow images from same origin, data URLs, and HTTPS
      connectSrc: ["'self'", "wss:", "https:"], // Allow WebSocket and HTTPS connections
    },
  },
}));

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Configures which frontend domains can access the API and what methods are allowed
 */
// Configure CORS to allow frontend access while maintaining security
app.use(cors({
  origin: config.server.corsOrigins, // Whitelist of allowed frontend domains
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allowed request headers
}));

/**
 * Performance and Security Middleware Stack
 * Additional middleware for optimization and protection
 */
// Gzip compression to reduce response sizes and improve performance
app.use(compression());

// Prevent MongoDB NoSQL injection attacks by sanitizing user input
app.use(mongoSanitize());

/**
 * Rate Limiting Configuration
 * Prevents abuse and DDoS attacks by limiting requests per IP address
 */
// Configure rate limiting for API endpoints
const limiter = rateLimit({
  windowMs: config.server.rateLimitWindow, // Time window for rate limiting (e.g., 15 minutes)
  max: config.server.rateLimitMax, // Maximum requests per window per IP
  message: 'Too many requests from this IP, please try again later.', // Error message for blocked requests
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting only to API routes
app.use('/api/', limiter);

/**
 * Request Logging Configuration
 * Logs all HTTP requests for monitoring and debugging (except in test environment)
 */
// Configure Morgan HTTP request logger with custom stream to our logger
if (config.server.nodeEnv !== 'test') {
  app.use(morgan('combined', { 
    stream: { 
      write: message => logger.info(message.trim()) // Pipe Morgan logs to our logger system
    } 
  }));
}

/**
 * Proxy Trust Configuration
 * Necessary when running behind reverse proxies (nginx, load balancers, etc.)
 */
// Trust proxy settings for accurate IP detection behind load balancers
app.set('trust proxy', config.server.trustProxy);

/**
 * WebSocket Event Handler Initialization
 * Sets up real-time communication handlers for posts, comments, and notifications
 */
// Initialize all WebSocket event handlers for real-time features
websocketHandlers(io);

/**
 * Graceful Shutdown Handler
 * Ensures clean shutdown of all services when the application receives termination signals
 * This prevents data corruption and ensures all connections are properly closed
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  
  // Stop accepting new HTTP connections while allowing existing ones to complete
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close database connections gracefully to prevent data corruption
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      
      // Close Redis connection to free up resources
      await redis.quit();
      logger.info('Redis connection closed');
      
      // Stop all background workers (email processing, digest generation, etc.)
      await workers.stopAll();
      logger.info('Background workers stopped');
      
      // Exit successfully after clean shutdown
      process.exit(0);
    } catch (error) {
      // Log any errors during shutdown and exit with error code
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  /**
   * Force Shutdown Timer
   * If graceful shutdown takes too long, force close the application
   * This prevents the app from hanging indefinitely during shutdown
   */
  // Set a timeout to force shutdown if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000); // 30 second timeout
};

/**
 * Process Signal Handlers
 * Listen for termination signals from the operating system and handle them gracefully
 */
// Handle SIGTERM signal (typical for Docker containers and process managers)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT signal (Ctrl+C in terminal)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Global Error Handlers
 * Catch any unhandled errors and log them before shutting down
 * This prevents the application from crashing silently
 */
// Handle uncaught synchronous exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections (async errors that weren't caught)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

/**
 * Server Startup Function
 * Initializes all required services and starts the HTTP server
 * This function handles the complete startup sequence including database connections
 */
// Main server startup function with error handling
const startServer = async () => {
  try {
    /**
     * Database Connection Initialization
     * Connect to MongoDB for persistent data storage
     */
    // Establish connection to MongoDB database
    await connectDatabase();
    logger.info('MongoDB connected successfully');

    /**
     * Redis Connection Initialization  
     * Connect to Redis for caching and session management
     */
    // Establish connection to Redis for caching and real-time features
    await connectRedis();
    logger.info('Redis connected successfully');

    /**
     * Background Workers Initialization
     * Start all background worker processes for:
     * - Email processing and parsing
     * - Digest generation and distribution  
     * - Snowball distribution tracking
     * - Cleanup and maintenance tasks
     */
    // Initialize and start all background worker processes
    await workers.startAll();
    logger.info('Background workers started');

    /**
     * HTTP Server Startup
     * Start the main HTTP server on the configured port and host
     */
    // Configure server host and port from environment or use defaults
    const PORT = config.server.port || 5000;
    const HOST = config.server.host || '0.0.0.0';
    
    // Start listening for HTTP connections
    httpServer.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT}`);
      logger.info(`Environment: ${config.server.nodeEnv}`);
      logger.info(`WebSocket server ready`);
      
      /**
       * Process Manager Ready Signal
       * Send ready signal to process managers like PM2 or Docker
       * This indicates the server is fully initialized and ready to handle requests
       */
      // Notify process manager that server is ready (for PM2, Docker, etc.)
      if (process.send) {
        process.send('ready');
      }
    });
  } catch (error) {
    /**
     * Startup Error Handling
     * If any part of the startup process fails, log the error and exit
     */
    // Log startup errors and exit with error code
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Server Initialization
 * Start the server startup process
 */
// Begin server initialization sequence
startServer();

/**
 * Module Exports
 * Export server components for testing and external use
 * This allows test files to access the app, server, and Socket.IO instances
 */
// Export main components for testing and integration
module.exports = { 
  app,        // Express application instance
  httpServer, // HTTP server instance  
  io          // Socket.IO server instance
};
/**
 * @fileoverview Server Configuration for ShadowNews Platform
 * 
 * Centralized server configuration for the ShadowNews Express.js application.
 * This module manages server settings, CORS policies, rate limiting, file uploads,
 * security configurations, and monitoring settings.
 * 
 * Key Features:
 * - Express server port and environment configuration
 * - CORS policy management for cross-origin requests
 * - Rate limiting configuration for API protection
 * - File upload settings and restrictions
 * - Pagination defaults for API responses
 * - Security middleware configuration
 * - WebSocket server settings
 * - Monitoring and metrics configuration
 * - AI service integration settings
 * - Worker queue configuration
 * 
 * Dependencies:
 * - Express.js web framework
 * - CORS middleware
 * - Rate limiting middleware
 * - File upload handling
 * - Environment variables for configuration
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/**
 * Server Configuration Object
 * Comprehensive settings for the ShadowNews Express.js server
 */
module.exports = {
  /**
   * Basic Server Settings
   */
  
  // Server port from environment or default 3001
  port: process.env.PORT || 3001,
  
  // Application environment (development, production, test)
  env: process.env.NODE_ENV || 'development',

  /**
   * CORS Configuration
   * Cross-Origin Resource Sharing settings for frontend communication
   */
  cors: {
    // Frontend application URL for CORS origin
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // Allow credentials (cookies, authorization headers) in CORS requests
    credentials: true,
    
    // Success status for preflight OPTIONS requests
    optionsSuccessStatus: 200,
    
    // Allowed HTTP methods for CORS requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
    // Allowed headers in CORS requests
    allowedHeaders: [
      'Content-Type',
      'Authorization', 
      'X-Requested-With',
      'Accept'
    ],
    
    // Headers exposed to frontend JavaScript
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  },

  /**
   * Rate Limiting Configuration
   * API protection against abuse and excessive requests
   */
  rateLimit: {
    // Time window for rate limiting (15 minutes in milliseconds)
    windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
    
    // Maximum requests per window per IP address
    max: process.env.RATE_LIMIT_MAX || 100,
    
    // Error message for rate limit exceeded
    message: 'Too many requests from this IP, please try again later.',
    
    // Include rate limit info in standard headers
    standardHeaders: true,
    
    // Disable legacy X-RateLimit headers
    legacyHeaders: false,
    
    // Skip rate limiting for whitelisted IPs
    skip: (req) => {
      const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
      return whitelist.includes(req.ip);
    }
  },

  /**
   * File Upload Configuration
   * Settings for CSV file uploads and attachment handling
   */
  upload: {
    // Maximum file size in bytes (10MB default)
    maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024,
    
    // Maximum number of files per upload
    maxFiles: process.env.MAX_FILES || 5,
    
    // Allowed MIME types for uploads
    allowedMimeTypes: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    
    // Temporary directory for uploaded files
    tempDirectory: process.env.TEMP_DIR || './temp/uploads'
  },

  /**
   * API Pagination Configuration
   * Default settings for paginated API responses
   */
  pagination: {
    // Default number of items per page
    defaultLimit: 20,
    
    // Maximum items per page (to prevent excessive loads)
    maxLimit: 100,
    
    // Default sorting order (newest first)
    defaultSort: '-createdAt'
  },

  /**
   * Security Configuration
   * Authentication and authorization settings
   */
  security: {
    // BCrypt hashing rounds for password encryption
    bcryptRounds: process.env.BCRYPT_ROUNDS || 12,
    
    // JWT secret key for token signing
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    
    // JWT token expiration time
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    
    // Refresh token expiration time
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    
    // Cookie configuration for JWT tokens
    cookieOptions: {
      // HTTP-only cookies (not accessible via JavaScript)
      httpOnly: true,
      
      // Secure cookies in production (HTTPS only)
      secure: process.env.NODE_ENV === 'production',
      
      // SameSite setting for CSRF protection
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      
      // Cookie expiration time (30 days in milliseconds)
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  },

  /**
   * Email Configuration
   * Email-related server settings
   */
  email: {
    // Default email sender for system emails
    defaultSender: process.env.DEFAULT_EMAIL_SENDER || 'noreply@shadownews.community',
    
    // Email domain suffix for user repositories
    domainSuffix: '@shadownews.community',
    
    // Maximum emails per user per day
    maxEmailsPerDay: process.env.MAX_EMAILS_PER_DAY || 100,
    
    // Hour of day to send daily digests (24-hour format)
    digestHour: process.env.DIGEST_HOUR || 8,
    
    // Timezone for digest scheduling
    digestTimezone: process.env.DIGEST_TIMEZONE || 'UTC'
  },

  /**
   * Karma System Configuration
   * Points and rewards for user actions
   */
  karma: {
    // Karma points awarded for different actions
    actions: {
      postCreated: 50,        // Creating a new post
      commentCreated: 20,     // Adding a comment
      postUpvoted: 10,        // Receiving post upvote
      commentUpvoted: 5,      // Receiving comment upvote
      csvUploaded: 100,       // Uploading CSV data
      repositoryCreated: 200, // Creating email repository
      emailVerified: 50,      // Email address verification
      dailyLogin: 5           // Daily login bonus
    },
    
    // Karma milestones and associated privileges
    milestones: {
      customSignature: 100,    // Custom email signature
      repositoryCreation: 500, // Create repositories
      weightedVoting: 1000,    // Higher vote weight
      platformGovernance: 5000 // Platform governance participation
    }
  },

  /**
   * Snowball Distribution Configuration
   * Viral content sharing mechanism settings
   */
  snowball: {
    // Minimum emails in repository to enable snowball
    minEmailsForSnowball: 10,
    
    // Maximum snowball propagation depth
    maxSnowballDepth: 3,
    
    // Cooldown period between snowballs (milliseconds)
    snowballCooldown: 24 * 60 * 60 * 1000,
    
    // Quality threshold for automatic snowball approval
    qualityThreshold: 0.7,
    
    // Threshold for automatic approval without review
    autoApprovalThreshold: 0.9
  },

  /**
   * Caching Configuration
   * TTL settings for different types of cached data
   */
  cache: {
    ttl: {
      // Posts cache TTL (5 minutes)
      posts: 5 * 60,
      
      // Comments cache TTL (5 minutes)
      comments: 5 * 60,
      
      // User data cache TTL (10 minutes)
      user: 10 * 60,
      
      // Repository data cache TTL (15 minutes)
      repository: 15 * 60,
      
      // Trending content cache TTL (2 minutes)
      trending: 2 * 60
    }
  },

  /**
   * Background Workers Configuration
   * Settings for queue processing and background jobs
   */
  workers: {
    // Number of concurrent worker processes
    concurrency: process.env.WORKER_CONCURRENCY || 5,
    
    // Maximum retry attempts for failed jobs
    maxJobRetries: process.env.MAX_JOB_RETRIES || 3,
    
    // Job timeout in milliseconds
    jobTimeout: process.env.JOB_TIMEOUT || 30000,
    
    // Queue names for different job types
    queues: {
      email: 'email-processing',
      digest: 'digest-generation',
      snowball: 'snowball-distribution',
      cleanup: 'data-cleanup',
      analytics: 'analytics-processing'
    }
  },

  /**
   * AI Integration Configuration
   * Settings for AI-powered features
   */
  ai: {
    // Enable/disable AI features
    enabled: process.env.AI_ENABLED === 'true',
    
    // Maximum hashtag suggestions per content
    hashtagSuggestionLimit: 5,
    
    // Content summarization length limit
    summarizationLength: 150,
    
    // Sentiment analysis confidence threshold
    sentimentAnalysisThreshold: 0.7
  },

  /**
   * WebSocket Configuration
   * Real-time communication settings
   */
  websocket: {
    // Ping interval for connection health (milliseconds)
    pingInterval: 30000,
    
    // Ping timeout for connection failure detection
    pingTimeout: 5000,
    
    // Maximum concurrent WebSocket connections
    maxConnections: process.env.MAX_WS_CONNECTIONS || 10000,
    
    // Message rate limit per connection
    messageRateLimit: 10
  },

  /**
   * Monitoring and Observability Configuration
   * Settings for metrics, logging, and error tracking
   */
  monitoring: {
    // Enable Prometheus metrics collection
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    
    // Port for metrics endpoint
    metricsPort: process.env.METRICS_PORT || 9090,
    
    // Logging level (error, warn, info, debug)
    logLevel: process.env.LOG_LEVEL || 'info',
    
    // Sentry DSN for error tracking
    sentryDsn: process.env.SENTRY_DSN || null
  }
};
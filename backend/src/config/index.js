/**
 * @fileoverview Central Configuration Management
 * 
 * This file serves as the main configuration hub for the ShadowNews backend application.
 * It consolidates all environment-specific settings and provides default values for:
 * 
 * - Server configuration (port, host, environment)
 * - Database connections (MongoDB, Redis)
 * - Authentication settings (JWT tokens, sessions)
 * - Email service configuration (SMTP, templates)
 * - External API integrations (SendGrid, AI services)
 * - Security settings (CORS origins, rate limits)
 * - File upload constraints
 * - Logging and monitoring settings
 * 
 * Environment variables are loaded from .env file and validated with fallback defaults.
 * This centralized approach ensures consistent configuration across all modules.
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// Environment variable loader for managing configuration secrets
const dotenv = require('dotenv');

// Node.js path utilities for file system operations
const path = require('path');

/**
 * Environment Variables Loading
 * Load environment variables from .env file in the backend root directory
 * This must happen before any configuration values are accessed
 */
// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Main Configuration Object
 * Centralized configuration object that contains all application settings
 * Organized by functionality with environment variable support and sensible defaults
 */
const config = {
  /**
   * Application Environment Configuration
   * Basic server settings that affect application behavior
   */
  env: process.env.NODE_ENV || 'development', // Current environment (development/production/test)
  port: parseInt(process.env.PORT, 10) || 3001, // Server port number
  
  /**
   * MongoDB Database Configuration
   * Settings for the primary document database storing all application data
   */
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews', // Database connection string
    options: {
      useNewUrlParser: true, // Use new URL string parser for MongoDB
      useUnifiedTopology: true, // Use new server discover and monitoring engine
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
    }
  },
  
  /**
   * Redis Cache Configuration
   * Settings for the in-memory cache used for sessions, rate limiting, and performance
   */
  redis: {
    host: process.env.REDIS_HOST || 'localhost', // Redis server hostname
    port: parseInt(process.env.REDIS_PORT, 10) || 6379, // Redis server port
    password: process.env.REDIS_PASSWORD || undefined, // Redis authentication password
    db: parseInt(process.env.REDIS_DB, 10) || 0, // Redis database number
    ttl: 3600, // Default time-to-live for cached items (1 hour in seconds)
  },
  
  /**
   * JWT Authentication Configuration
   * Settings for JSON Web Token generation and validation
   */
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this', // Secret key for signing JWTs
    accessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 30, // Access token lifetime
    refreshExpirationDays: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 30, // Refresh token lifetime
    resetPasswordExpirationMinutes: 10, // Password reset token lifetime
    verifyEmailExpirationMinutes: 60, // Email verification token lifetime
  },
  
  /**
   * Email Service Configuration
   * SMTP settings for sending authentication emails, notifications, and digests
   */
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com', // SMTP server hostname
      port: parseInt(process.env.SMTP_PORT, 10) || 587, // SMTP server port
      secure: process.env.SMTP_SECURE === 'true', // Use TLS/SSL for connection
      auth: {
        user: process.env.SMTP_USERNAME, // SMTP authentication username
        pass: process.env.SMTP_PASSWORD, // SMTP authentication password
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@shadownews.community', // Default sender email address
  /**
   * Inbound Email Processing Configuration
   * Settings for receiving and processing emails sent to repository addresses
   */
  inbound: {
    // Domain name for receiving emails (e.g., user@shadownews.community)
    domain: process.env.INBOUND_EMAIL_DOMAIN || 'shadownews.community',
    
    // Webhook endpoint URL for email provider callbacks
    webhook: process.env.INBOUND_EMAIL_WEBHOOK || '/api/email/inbound',
    
    // API key for authenticating inbound email webhooks
    apiKey: process.env.INBOUND_EMAIL_API_KEY,
  },
 },
 
 /**
  * SendGrid Email Service Configuration
  * Production email service provider for reliable email delivery
  */
 sendgrid: {
   // SendGrid API key for service authentication
   apiKey: process.env.SENDGRID_API_KEY,
   
   // Webhook verification key for security
   webhookVerificationKey: process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY,
   
   // Email template IDs for different message types
   templates: {
     // Welcome email template for new user registration
     welcome: process.env.SENDGRID_WELCOME_TEMPLATE_ID,
     
     // Daily/weekly digest email template
     digest: process.env.SENDGRID_DIGEST_TEMPLATE_ID,
     
     // Password reset email template
     passwordReset: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID,
     
     // Repository invitation email template
     repositoryInvite: process.env.SENDGRID_REPOSITORY_INVITE_TEMPLATE_ID,
   },
 },
 
 /**
  * AI Services Configuration
  * Settings for artificial intelligence and machine learning integrations
  */
 ai: {
   /**
    * OpenAI Configuration
    * GPT models for content analysis and generation
    */
   openai: {
     // OpenAI API key for service access
     apiKey: process.env.OPENAI_API_KEY,
     
     // Default GPT model for text processing
     model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
     
     // Maximum tokens per API request to control costs
     maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 150,
   },
   
   /**
    * HuggingFace Configuration
    * Open-source models for specialized ML tasks
    */
   huggingface: {
     // HuggingFace API key for model access
     apiKey: process.env.HUGGINGFACE_API_KEY,
     
     // Model for sentiment analysis of content
     sentimentModel: 'distilbert-base-uncased-finetuned-sst-2-english',
     
     // Model for text summarization
     summaryModel: 'facebook/bart-large-cnn',
   },
 },
 
 /**
  * AWS S3 Storage Configuration
  * Cloud storage for CSV files, avatars, and static assets
  */
 aws: {
   // AWS access credentials
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   
   // AWS region for S3 bucket
   region: process.env.AWS_REGION || 'us-east-1',
   
   // S3 bucket configuration
   s3: {
     // Primary S3 bucket name for file storage
     bucket: process.env.AWS_S3_BUCKET || 'shadownews-uploads',
     
     // Prefix for CSV file uploads
     csvPrefix: 'csv/',
     
     // Prefix for user avatar images
     avatarPrefix: 'avatars/',
     
     // Maximum file size allowed (10MB)
     maxFileSize: 10 * 1024 * 1024,
   },
 },
 
 /**
  * Rate Limiting Configuration
  * API protection against abuse and excessive requests
  */
 rateLimit: {
   // Time window for rate limiting (15 minutes)
   windowMs: 15 * 60 * 1000,
   
   // Maximum requests per window (stricter in production)
   max: process.env.NODE_ENV === 'production' ? 100 : 1000,
   
   // Error message for rate limit exceeded
   message: 'Too many requests from this IP, please try again later.',
   
   // Count successful requests towards the limit
   skipSuccessfulRequests: false,
   
   // Function to generate rate limit keys (by IP address)
   keyGenerator: (req) => req.ip,
 },
 
 /**
  * CORS (Cross-Origin Resource Sharing) Configuration
  * Controls which frontend domains can access the API
  */
 cors: {
   // Allowed origins for CORS requests (supports multiple domains)
   origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
   
   // Allow credentials (cookies, auth headers) in CORS requests
   credentials: true,
   
   // Success status for preflight OPTIONS requests
   optionsSuccessStatus: 200,
 },
 
 /**
  * Security Configuration
  * Encryption and authentication security settings
  */
 security: {
   // BCrypt salt rounds for password hashing
   bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
   
   // Secret key for cookie encryption
   cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret-change-this',
   
   // Secret key for session encryption
   sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
 },
 
 /**
  * Karma System Configuration
  * Point-based reward system for user engagement
  */
 karma: {
   /**
    * Points awarded for different user actions
    */
   actions: {
     postCreated: 50,        // Creating a new post
     commentCreated: 20,     // Adding a comment
     postUpvoted: 10,        // Receiving an upvote on post
     commentUpvoted: 5,      // Receiving an upvote on comment
     repositoryCreated: 100, // Creating a new repository
     csvUploaded: 100,       // Uploading CSV data
     emailVerified: 25,      // Verifying email address
     dailyLogin: 5,          // Daily login bonus
   },
   
   /**
    * Karma milestones that unlock new features
    */
   milestones: {
     customSignature: 100,    // Custom email signature
     repositoryCreation: 500, // Create public repositories
     weightedVoting: 1000,    // Higher weight votes
     platformGovernance: 5000,// Participate in governance
   },
   
   /**
    * Multipliers for special circumstances
    */
   multipliers: {
     curatorUpvote: 5,  // Upvote from verified curator
     qualityPost: 2,    // High-quality content bonus
     viralPost: 3,      // Viral content sharing bonus
   },
 },
 
 /**
  * Repository Settings Configuration
  * Email repository management and snowball distribution
  */
 repository: {
   // Minimum emails required to create a repository
   minEmails: 10,
   
   // Maximum emails allowed in a single repository
   maxEmails: 10000,
   
   // Multiplier for snowball distribution growth
   snowballMultiplier: 1.5,
   
   // Require email verification for repository participation
   verificationRequired: true,
   
   // Quality score threshold for automatic content inclusion
   autoAddThreshold: 0.7,
   
   // Default digest frequency for new repositories
   digestFrequency: 'weekly',
 },
 
 /**
  * WebSocket Configuration
  * Real-time communication settings for live features
  */
 websocket: {
   // Maximum time to wait for ping response (milliseconds)
   pingTimeout: 60000,
   
   // Interval between ping messages (milliseconds)
   pingInterval: 25000,
   
   // Timeout for connection upgrade process
   upgradeTimeout: 10000,
   
   // Maximum size of HTTP buffer for WebSocket upgrade
   maxHttpBufferSize: 1e6,
 },
 
 /**
  * Pagination Configuration
  * Default settings for API response pagination
  */
 pagination: {
   // Default number of items per page
   defaultLimit: 20,
   
   // Maximum items per page to prevent performance issues
   maxLimit: 100,
 },
 
 /**
  * Logging Configuration
  * Application logging settings for monitoring and debugging
  */
 logging: {
   // Log level (error, warn, info, debug)
   level: process.env.LOG_LEVEL || 'info',
   
   // Log format (json, simple, combined)
   format: process.env.LOG_FORMAT || 'json',
   
   // Directory for log file storage
   dir: process.env.LOG_DIR || 'logs',
 },
 
 /**
  * Queue Settings Configuration
  * Background job processing with Redis-based queues
  */
 queue: {
   // Redis connection for queue storage
   redis: {
     host: process.env.REDIS_HOST || 'localhost',
     port: parseInt(process.env.REDIS_PORT, 10) || 6379,
   },
   
   // Default options for all queue jobs
   defaultJobOptions: {
     // Remove completed jobs to save memory
     removeOnComplete: true,
     
     // Keep failed jobs for debugging
     removeOnFail: false,
     
     // Maximum retry attempts for failed jobs
     attempts: 3,
     
     // Exponential backoff strategy for retries
     backoff: {
       type: 'exponential',
       delay: 2000,
     },
   },
 },
 
 /**
  * Feature Flags Configuration
  * Toggle switches for enabling/disabling platform features
  */
 features: {
   // Enable email-to-post functionality
   emailPosting: process.env.FEATURE_EMAIL_POSTING !== 'false',
   
   // Enable AI-powered hashtag suggestions
   aiHashtags: process.env.FEATURE_AI_HASHTAGS !== 'false',
   
   // Enable snowball content distribution
   snowballDistribution: process.env.FEATURE_SNOWBALL !== 'false',
   
   // Enable automated digest emails
   digestEmails: process.env.FEATURE_DIGEST_EMAILS !== 'false',
   
   // Enable mobile app API endpoints
   mobileApp: process.env.FEATURE_MOBILE_APP !== 'false',
 },
 
 /**
  * Analytics Configuration
  * Third-party analytics and tracking services
  */
 analytics: {
   // Google Analytics tracking ID
   googleAnalytics: process.env.GA_TRACKING_ID,
   
   // Mixpanel analytics token
   mixpanel: process.env.MIXPANEL_TOKEN,
   
   // Segment analytics write key
   segment: process.env.SEGMENT_WRITE_KEY,
 },
 
 /**
  * External APIs Configuration
  * Third-party service integrations for enhanced functionality
  */
 external: {
   /**
    * Clearbit API for email enrichment and company data
    */
   clearbit: {
     apiKey: process.env.CLEARBIT_API_KEY,
   },
   
   /**
    * Hunter API for email verification and domain information
    */
   hunter: {
     apiKey: process.env.HUNTER_API_KEY,
   },
 },
};

/**
 * Environment Variable Validation
 * Ensures required configuration values are present before application startup
 */

// Base required environment variables for all environments
const requiredEnvVars = [
  'JWT_SECRET',      // Critical for authentication security
  'MONGODB_URI',     // Required for database connection
  'SMTP_USERNAME',   // Required for email functionality
  'SMTP_PASSWORD',   // Required for email authentication
];

// Additional required variables for production environment
if (config.env === 'production') {
  requiredEnvVars.push(
    'SENDGRID_API_KEY',      // Production email service
    'AWS_ACCESS_KEY_ID',     // Cloud storage access
    'AWS_SECRET_ACCESS_KEY', // Cloud storage authentication
    'REDIS_PASSWORD'         // Secure Redis connection
  );
}

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// Throw error if any required variables are missing
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

/**
 * Export Configuration
 * Makes the complete configuration object available to other modules
 */
module.exports = config;
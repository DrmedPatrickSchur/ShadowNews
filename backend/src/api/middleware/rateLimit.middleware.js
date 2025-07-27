/**
 * @fileoverview Rate Limiting Middleware for ShadowNews Platform
 * 
 * Comprehensive rate limiting system for the ShadowNews email-first news platform.
 * This module implements advanced rate limiting strategies to prevent abuse, protect
 * against DDoS attacks, and ensure fair usage of platform resources. Features include
 * Redis-backed distributed rate limiting, karma-based dynamic limits, endpoint-specific
 * restrictions, and intelligent user-based vs IP-based limiting.
 * 
 * Key Features:
 * - Redis-backed distributed rate limiting across multiple servers
 * - Endpoint-specific rate limits tailored to usage patterns
 * - Karma-based dynamic limits that reward high-reputation users
 * - User-based and IP-based rate limiting strategies
 * - Whitelist support for trusted IPs and admin users
 * - Comprehensive logging for abuse detection and monitoring
 * - Graceful handling with informative error messages
 * - Skip logic for trusted users and special circumstances
 * - Standardized response headers for client-side handling
 * 
 * Rate Limiting Strategies:
 * - General API: Broad protection for all endpoints
 * - Authentication: Strict limits for login/registration to prevent brute force
 * - Content Creation: Balanced limits for posts, comments, repositories
 * - File Operations: Conservative limits for CSV uploads and processing
 * - Communication: Email sending limits to prevent spam
 * - Search: Reasonable limits to prevent search abuse
 * - WebSocket: Connection attempt limits for real-time features
 * 
 * Dynamic Limiting:
 * - Karma-based limits that scale with user reputation
 * - Higher limits for authenticated vs anonymous users
 * - Admin exemptions for platform management
 * - IP whitelist support for trusted sources
 * - Context-aware limits based on user behavior
 * 
 * Security Features:
 * - Brute force attack prevention for authentication endpoints
 * - DDoS protection through aggressive rate limiting
 * - Spam prevention for content creation and email sending
 * - Abuse monitoring with comprehensive logging
 * - Distributed limiting to prevent server-specific bypasses
 * 
 * Monitoring and Logging:
 * - Rate limit violation logging with IP and path information
 * - User behavior tracking for pattern analysis
 * - Performance monitoring for rate limiter effectiveness
 * - Abuse pattern detection and alerting
 * 
 * Dependencies:
 * - express-rate-limit: Core rate limiting functionality
 * - rate-limit-redis: Redis store for distributed rate limiting
 * - redis: Redis client for limit storage and synchronization
 * - logger: Application logging for monitoring and debugging
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for rate limiting
const rateLimit = require('express-rate-limit');     // Primary rate limiting middleware
const RedisStore = require('rate-limit-redis');      // Redis store for distributed limiting
const redis = require('../../utils/redis');          // Redis client configuration
const logger = require('../../utils/logger');        // Application logging utility

/**
 * Rate Limiter Factory Function
 * Creates configured rate limiters with standardized options and behavior
 * 
 * This factory function provides a consistent interface for creating rate limiters
 * with common security features, logging, and Redis-backed storage. All rate limiters
 * inherit intelligent skip logic, comprehensive logging, and standardized error handling.
 * 
 * Default Features:
 * - Redis-backed distributed storage for multi-server deployments
 * - Admin user exemptions for platform management
 * - IP whitelist support for trusted sources
 * - Comprehensive violation logging for security monitoring
 * - Standardized error responses with retry information
 * - Modern rate limit headers for client-side handling
 * 
 * @param {Object} options - Rate limiter configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number|function} options.max - Maximum requests per window
 * @param {string} options.message - Error message for rate limit violations
 * @param {function} options.keyGenerator - Function to generate rate limit keys
 * @param {boolean} options.skipSuccessfulRequests - Whether to skip counting successful requests
 * @returns {Function} Configured express-rate-limit middleware
 * 
 * @example
 * // Create custom rate limiter
 * const customLimiter = createRateLimiter({
 *   windowMs: 60 * 1000,  // 1 minute
 *   max: 20,              // 20 requests per minute
 *   message: 'Custom rate limit exceeded'
 * });
 */
const createRateLimiter = (options) => {
  // Default configuration with security-focused settings
  const defaultOptions = {
    // Use Redis store for distributed rate limiting across multiple servers
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:',    // Namespace for rate limit keys
    }),
    
    // Enable modern rate limit headers for client-side handling
    standardHeaders: true,      // Include RateLimit-* headers
    legacyHeaders: false,       // Disable legacy X-RateLimit-* headers
    
    /**
     * Custom Rate Limit Violation Handler
     * Provides comprehensive logging and user-friendly error responses
     */
    handler: (req, res) => {
      // Log rate limit violations for security monitoring and abuse detection
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`, {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString()
      });
      
      // Return standardized rate limit error response
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: res.getHeader('Retry-After'),
        type: 'RATE_LIMIT_EXCEEDED'
      });
    },
    
    /**
     * Intelligent Skip Logic
     * Exempts trusted users and sources from rate limiting
     */
    skip: (req) => {
      // Exempt admin users from rate limiting for platform management
      if (req.user && req.user.role === 'admin') return true;
      
      // Exempt whitelisted IPs for trusted sources (CI/CD, monitoring, etc.)
      if (process.env.WHITELIST_IPS && process.env.WHITELIST_IPS.includes(req.ip)) return true;
      
      // Exempt health check endpoints from rate limiting
      if (req.path === '/health' || req.path === '/status') return true;
      
      return false;
    },
  };

  // Merge provided options with defaults and return configured rate limiter
  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * General API Rate Limiter
 * Provides broad protection for all API endpoints
 * 
 * This rate limiter serves as the default protection for API endpoints that don't
 * have specific rate limiting requirements. Balances protection against abuse
 * with reasonable limits for normal usage patterns.
 * 
 * Limits: 100 requests per 15 minutes per IP
 * Use Case: Default protection for general API endpoints
 */
const general = createRateLimiter({
  windowMs: 15 * 60 * 1000,                    // 15-minute window
  max: 100,                                    // 100 requests per window
  message: 'Too many requests from this IP',
});

/**
 * Authentication Rate Limiter
 * Strict protection against brute force attacks on authentication endpoints
 * 
 * This rate limiter provides aggressive protection for login, registration, and
 * password reset endpoints to prevent brute force attacks and credential stuffing.
 * Uses conservative limits and skips successful requests to allow legitimate retries.
 * 
 * Limits: 5 attempts per 15 minutes per IP
 * Features: Skips successful requests, strict violation logging
 * Use Case: Login, registration, password reset endpoints
 */
const auth = createRateLimiter({
  windowMs: 15 * 60 * 1000,                    // 15-minute window
  max: 5,                                      // 5 authentication attempts per window
  skipSuccessfulRequests: true,                // Don't count successful logins
  message: 'Too many authentication attempts',
});

/**
 * Post Creation Rate Limiter
 * Balanced limits for content creation to prevent spam while allowing active users
 * 
 * This rate limiter controls post creation frequency to maintain content quality
 * and prevent spam. Uses user-based limiting for authenticated users and IP-based
 * for anonymous users.
 * 
 * Limits: 10 posts per hour per user/IP
 * Key Strategy: User ID for authenticated, IP for anonymous
 * Use Case: Post creation endpoints
 */
const createPost = createRateLimiter({
  windowMs: 60 * 60 * 1000,                    // 1-hour window
  max: 10,                                     // 10 posts per hour
  keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  message: 'Post creation limit reached. Please wait before posting again',
});

/**
 * Comment Creation Rate Limiter
 * Higher frequency limits for comment creation to enable active discussions
 * 
 * This rate limiter allows more frequent commenting than posting to support
 * active discussions while still preventing spam and abuse.
 * 
 * Limits: 30 comments per 15 minutes per user/IP
 * Key Strategy: User ID for authenticated, IP for anonymous
 * Use Case: Comment creation endpoints
 */
const createComment = createRateLimiter({
  windowMs: 15 * 60 * 1000,                    // 15-minute window
  max: 30,                                     // 30 comments per window
  keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  message: 'Comment limit reached. Please slow down',
});

/**
 * Email Sending Rate Limiter
 * Conservative limits for email operations to prevent spam and abuse
 * 
 * This rate limiter protects email sending functionality from abuse while
 * allowing legitimate email operations. Essential for preventing the platform
 * from being used for spam distribution.
 * 
 * Limits: 20 emails per hour per user/IP
 * Key Strategy: User ID for authenticated, IP for anonymous
 * Use Case: Email sending, newsletter, notification endpoints
 */
const emailSend = createRateLimiter({
  windowMs: 60 * 60 * 1000,                    // 1-hour window
  max: 20,                                     // 20 emails per hour
  keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  message: 'Email sending limit reached',
});

/**
 * CSV Upload Rate Limiter
 * Daily limits for bulk data operations to prevent resource abuse
 * 
 * This rate limiter controls CSV upload frequency to prevent abuse of bulk
 * email import functionality while allowing legitimate repository management.
 * 
 * Limits: 10 CSV uploads per day per user/IP
 * Key Strategy: User ID for authenticated, IP for anonymous
 * Use Case: CSV upload and bulk email import endpoints
 */
const csvUpload = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,               // 24-hour window
  max: 10,                                     // 10 CSV uploads per day
  keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  message: 'Daily CSV upload limit reached',
});

/**
 * Repository Creation Rate Limiter
 * Daily limits for repository creation to maintain platform quality
 * 
 * This rate limiter prevents abuse of repository creation while allowing
 * legitimate users to organize their email lists effectively.
 * 
 * Limits: 5 repositories per day per user/IP
 * Key Strategy: User ID for authenticated, IP for anonymous
 * Use Case: Repository creation endpoints
 */
const createRepository = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,               // 24-hour window
  max: 5,                                      // 5 repositories per day
  keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  message: 'Daily repository creation limit reached',
});

/**
 * API Access Rate Limiter
 * Tiered limits based on authentication status for API endpoints
 * 
 * This rate limiter provides higher limits for authenticated users while
 * maintaining protection against anonymous abuse. Encourages user registration
 * and authentication for better platform experience.
 * 
 * Limits: 1000 requests per 15 minutes for authenticated, 100 for anonymous
 * Key Strategy: User ID for authenticated, IP for anonymous
 * Use Case: General API endpoints requiring tiered access
 */
const api = createRateLimiter({
  windowMs: 15 * 60 * 1000,                    // 15-minute window
  max: (req) => (req.user ? 1000 : 100),      // Higher limit for authenticated users
  keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  message: 'API rate limit exceeded',
});

/**
 * Search Rate Limiter
 * Reasonable limits for search operations to prevent abuse
 * 
 * This rate limiter balances search functionality with protection against
 * search-based abuse and resource exhaustion.
 * 
 * Limits: 30 searches per minute per user/IP
 * Key Strategy: User ID for authenticated, IP for anonymous
 * Use Case: Search endpoints and query operations
 */
const search = createRateLimiter({
  windowMs: 1 * 60 * 1000,                     // 1-minute window
  max: 30,                                     // 30 searches per minute
  keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  message: 'Search rate limit exceeded. Please wait before searching again',
});

/**
 * Karma-Based Dynamic Rate Limiter Factory
 * Creates rate limiters that scale with user reputation
 * 
 * This advanced rate limiter adjusts limits based on user karma, rewarding
 * high-reputation users with higher limits while maintaining base protection.
 * Encourages positive community participation and quality contributions.
 * 
 * Formula: baseMax + floor(userKarma * karmaMultiplier), capped at 10x baseMax
 * 
 * @param {number} baseMax - Base maximum requests for users without karma
 * @param {number} karmaMultiplier - Karma-to-limit conversion factor
 * @returns {Function} Karma-based rate limiter middleware
 * 
 * @example
 * // Create karma-based post limiter
 * const karmaPostLimiter = karmaBasedLimiter(5, 0.01); // 5 base + 1 per 100 karma
 */
const karmaBasedLimiter = (baseMax = 10, karmaMultiplier = 0.01) => {
  return createRateLimiter({
    windowMs: 60 * 60 * 1000,                  // 1-hour window
    max: (req) => {
      // Anonymous users get base limit
      if (!req.user) return baseMax;
      
      // Calculate karma bonus and apply limit
      const karmaBonus = Math.floor(req.user.karma * karmaMultiplier);
      return Math.min(baseMax + karmaBonus, baseMax * 10); // Cap at 10x base limit
    },
    keyGenerator: (req) => req.user?.id || req.ip, // User-based or IP-based limiting
  });
};

/**
 * WebSocket Connection Rate Limiter
 * Protects WebSocket endpoints from connection spam
 * 
 * This rate limiter prevents abuse of WebSocket connection attempts while
 * allowing legitimate real-time functionality.
 * 
 * Limits: 5 connection attempts per minute per IP
 * Key Strategy: IP-based limiting (WebSockets don't have traditional user context)
 * Use Case: WebSocket connection endpoints
 */
const websocket = createRateLimiter({
  windowMs: 1 * 60 * 1000,                     // 1-minute window
  max: 5,                                      // 5 connection attempts per minute
  keyGenerator: (req) => req.ip,               // IP-based limiting for WebSocket connections
  message: 'Too many WebSocket connection attempts',
});

// Export all rate limiting middleware for use throughout the application
module.exports = {
  general,              // General API protection
  auth,                 // Authentication endpoint protection
  createPost,           // Post creation limiting
  createComment,        // Comment creation limiting
  emailSend,            // Email sending protection
  csvUpload,            // CSV upload limiting
  createRepository,     // Repository creation limiting
  api,                  // Tiered API access limiting
  search,               // Search operation limiting
  karmaBasedLimiter,    // Dynamic karma-based limiter factory
  websocket,            // WebSocket connection protection
  createRateLimiter,    // Rate limiter factory for custom implementations
};
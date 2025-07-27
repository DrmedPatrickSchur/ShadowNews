/**
 * @fileoverview Authentication Middleware for ShadowNews Platform
 * 
 * Comprehensive authentication and authorization middleware system for the
 * ShadowNews email-first news platform. This module provides multi-layered
 * security controls including JWT token validation, role-based access control,
 * karma-based permissions, email verification requirements, and repository
 * access management.
 * 
 * Key Features:
 * - JWT token authentication with comprehensive validation
 * - Role-based access control (admin, moderator, user)
 * - Karma-level requirements for quality control actions
 * - Email verification enforcement for sensitive operations
 * - Repository access control with ownership validation
 * - Token blacklisting with Redis for secure logout
 * - Optional authentication for public endpoints
 * - Rate limiting for account creation and email posting
 * - Password change detection and token invalidation
 * - Account status validation (active/deactivated)
 * 
 * Authentication Flow:
 * 1. Token extraction from Authorization header or cookies
 * 2. Token blacklist verification via Redis
 * 3. JWT signature and expiration validation
 * 4. User existence and status verification
 * 5. Password change detection for token invalidation
 * 6. Account activation status validation
 * 7. User attachment to request object for downstream use
 * 
 * Authorization Levels:
 * - Public: No authentication required
 * - Optional: Authentication enhances but not required
 * - Protected: Valid authentication required
 * - Role-based: Specific roles required (admin, moderator)
 * - Karma-based: Minimum karma requirements
 * - Email-verified: Verified email address required
 * - Repository-specific: Owner or collaborator access required
 * 
 * Security Features:
 * - JWT secret-based token signing and verification
 * - Redis-based token blacklisting for secure logout
 * - Password change detection with automatic token invalidation
 * - Account deactivation enforcement
 * - Rate limiting for abuse prevention
 * - Comprehensive error handling with security-focused messages
 * - Token extraction from multiple sources (headers, cookies)
 * 
 * Rate Limiting:
 * - Account Creation: 5 accounts per IP per hour
 * - Email Posting: 20 posts per user per hour
 * - Redis-backed distributed rate limiting
 * - Customizable limits per endpoint type
 * 
 * Dependencies:
 * - jsonwebtoken: JWT token handling and validation
 * - User.model: User data and authentication methods
 * - redis: Token blacklisting and rate limit storage
 * - express-rate-limit: Rate limiting middleware
 * - rate-limit-redis: Redis store for distributed rate limiting
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for JWT authentication
const jwt = require('jsonwebtoken');              // JWT token handling
const User = require('../../models/User.model'); // User model for authentication
const { promisify } = require('util');            // Promise-based JWT verification
const redis = require('../../utils/redis');      // Redis for token blacklisting

/**
 * Primary Authentication Middleware
 * Validates JWT tokens and authenticates users for protected routes
 * 
 * This middleware provides comprehensive authentication by validating JWT tokens,
 * checking user existence and status, verifying token integrity, and ensuring
 * account security through password change detection and blacklist checking.
 * 
 * Authentication Process:
 * 1. Extract token from Authorization header or cookies
 * 2. Check token against Redis blacklist for logout security
 * 3. Verify JWT signature and decode payload
 * 4. Validate user existence and account status
 * 5. Check for password changes that invalidate tokens
 * 6. Attach authenticated user to request object
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {401} Invalid or missing token
 * @throws {401} User not found or account deactivated
 * @throws {401} Token expired or invalidated
 * @throws {500} Authentication processing error
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract JWT token from Authorization header or cookies
    // Support both Bearer tokens and cookie-based authentication
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // Require token for protected routes
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Check token against Redis blacklist for secure logout functionality
    // This prevents use of tokens after logout or account compromise
    const blacklisted = await redis.get(`blacklist_${token}`);
    if (blacklisted) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token has been invalidated. Please log in again.'
      });
    }

    // Verify JWT token signature and extract payload
    // Use promisified version for async/await compatibility
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Fetch user and validate existence
    // Include 'active' field for account status validation
    const currentUser = await User.findById(decoded.id).select('+active');
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does not exist.'
      });
    }

    // Check if user changed password after token was issued
    // This invalidates tokens when passwords are changed for security
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password. Please log in again.'
      });
    }

    // Enforce account activation status
    // Deactivated accounts cannot access protected resources
    if (!currentUser.active) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Attach authenticated user to request for downstream middleware and controllers
    req.user = currentUser;
    res.locals.user = currentUser;  // Available in templates/views
    next();
  } catch (error) {
    // Handle specific JWT errors with appropriate responses
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your token has expired. Please log in again.'
      });
    }
    
    // Generic error for unexpected authentication issues
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during authentication'
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Restricts access to endpoints based on user roles
 * 
 * This middleware enforces role-based access control by checking if the
 * authenticated user has one of the required roles. Commonly used for
 * admin and moderator-only functionality.
 * 
 * @param {...string} roles - Required roles (e.g., 'admin', 'moderator')
 * @returns {Function} Express middleware function
 * @throws {403} Insufficient role privileges
 * 
 * @example
 * // Require admin role
 * router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);
 * 
 * // Require admin or moderator role
 * router.post('/moderate', protect, restrictTo('admin', 'moderator'), moderateContent);
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is included in required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

/**
 * Karma-Level Authorization Middleware
 * Restricts access based on user karma points for quality control
 * 
 * This middleware implements karma-based access control to ensure only
 * users with sufficient reputation can perform sensitive actions like
 * creating repositories, moderating content, or accessing premium features.
 * 
 * @param {number} minKarma - Minimum karma points required
 * @returns {Function} Express middleware function
 * @throws {403} Insufficient karma points
 * 
 * @example
 * // Require 500 karma to create repository
 * router.post('/repositories', protect, checkKarmaLevel(500), createRepository);
 * 
 * // Require 1000 karma for moderation actions
 * router.post('/moderate', protect, checkKarmaLevel(1000), moderatePost);
 */
const checkKarmaLevel = (minKarma) => {
  return async (req, res, next) => {
    // Validate user has sufficient karma for the action
    if (req.user.karma < minKarma) {
      return res.status(403).json({
        status: 'fail',
        message: `This action requires at least ${minKarma} karma points. You currently have ${req.user.karma} karma.`
      });
    }
    next();
  };
};

/**
 * Email Verification Requirement Middleware
 * Ensures user has verified their email address for sensitive operations
 * 
 * This middleware enforces email verification for actions that require
 * confirmed user identity, such as posting content, creating repositories,
 * or accessing financial features.
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {403} Email address not verified
 * 
 * @example
 * // Require verified email for posting
 * router.post('/posts', protect, checkEmailVerified, createPost);
 */
const checkEmailVerified = async (req, res, next) => {
  // Enforce email verification requirement
  if (!req.user.emailVerified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Please verify your email address to perform this action.'
    });
  }
  next();
};

/**
 * Optional Authentication Middleware
 * Authenticates users when possible but allows anonymous access
 * 
 * This middleware provides authentication for endpoints that can benefit
 * from user context but don't require it. If authentication fails or no
 * token is provided, the request continues without user context.
 * 
 * Use Cases:
 * - Public feeds with personalized content for authenticated users
 * - Comment sections with optional user attribution
 * - API endpoints with different behavior for authenticated users
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @example
 * // Public endpoint with optional user context
 * router.get('/posts', optionalAuth, getPosts);
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Extract token if available
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // Continue without authentication if no token provided
    if (!token) {
      return next();
    }

    // Check blacklist - continue without auth if blacklisted
    const blacklisted = await redis.get(`blacklist_${token}`);
    if (blacklisted) {
      return next();
    }

    // Attempt to verify token and authenticate user
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('+active');

    // Only attach user if authentication is successful and account is valid
    if (currentUser && currentUser.active && !currentUser.changedPasswordAfter(decoded.iat)) {
      req.user = currentUser;
      res.locals.user = currentUser;
    }
  } catch (error) {
    // Silently continue without authentication for any errors
    // This ensures optional auth doesn't break the request flow
  }
  
  next();
};

/**
 * Repository Access Control Middleware
 * Validates user access to specific repositories
 * 
 * This middleware checks if the authenticated user has permission to access
 * a repository through ownership or collaboration rights. Used for repository
 * management, email list access, and content moderation.
 * 
 * Access Levels:
 * - Owner: Full repository control and management
 * - Collaborator: Read/write access to repository content
 * - Public: Read access for public repositories (handled elsewhere)
 * 
 * @middleware
 * @param {Object} req - Express request object (requires repositoryId param)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {403} Insufficient repository access permissions
 * @throws {500} Repository access validation error
 * 
 * @example
 * // Protect repository management endpoints
 * router.put('/repositories/:repositoryId', protect, checkRepositoryAccess, updateRepository);
 */
const checkRepositoryAccess = async (req, res, next) => {
  try {
    const { repositoryId } = req.params;
    const userId = req.user._id;

    // Use user model method to check repository access permissions
    // This method handles ownership and collaboration validation
    const hasAccess = await req.user.hasRepositoryAccess(repositoryId);
    
    if (!hasAccess) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have access to this repository'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error checking repository access'
    });
  }
};

// Rate limiting middleware imports
const rateLimit = require('express-rate-limit');     // Core rate limiting
const RedisStore = require('rate-limit-redis');      // Redis-backed rate limiting

/**
 * Account Creation Rate Limiter
 * Prevents abuse of account creation endpoints
 * 
 * This rate limiter restricts account creation to prevent spam, bot attacks,
 * and abuse. Uses Redis for distributed rate limiting across multiple servers.
 * 
 * Limits: 5 account creations per IP address per hour
 * Storage: Redis with 'create_account:' prefix
 * Headers: Includes rate limit information in response headers
 */
const createAccountLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'create_account:'               // Redis key prefix for organization
  }),
  windowMs: 60 * 60 * 1000,                // 1 hour window
  max: 5,                                  // 5 requests per window per IP
  message: 'Too many accounts created from this IP, please try again after an hour',
  standardHeaders: true,                   // Include rate limit info in headers
  legacyHeaders: false,                    // Disable legacy rate limit headers
});

/**
 * Email Post Rate Limiter
 * Prevents spam and abuse of email-based posting
 * 
 * This rate limiter restricts email-based post creation to prevent spam
 * and maintain content quality. Uses user ID for authenticated users
 * and IP address for anonymous users.
 * 
 * Limits: 20 email posts per user per hour
 * Storage: Redis with 'email_post:' prefix
 * Key Strategy: User ID for authenticated, IP for anonymous
 */
const emailPostLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'email_post:'                  // Redis key prefix for email posts
  }),
  windowMs: 60 * 60 * 1000,                // 1 hour window
  max: 20,                                 // 20 requests per window per user
  message: 'Too many posts created via email, please try again after an hour',
  keyGenerator: (req) => req.user ? req.user._id.toString() : req.ip, // User-based or IP-based
  standardHeaders: true,                   // Include rate limit info in headers
  legacyHeaders: false,                    // Disable legacy rate limit headers
});

// Export all authentication and authorization middleware functions
module.exports = {
  protect,                    // Primary authentication middleware
  restrictTo,                 // Role-based authorization
  checkKarmaLevel,           // Karma-based authorization
  checkEmailVerified,        // Email verification requirement
  optionalAuth,              // Optional authentication for public endpoints
  checkRepositoryAccess,     // Repository-specific access control
  createAccountLimiter,      // Account creation rate limiting
  emailPostLimiter          // Email post rate limiting
};
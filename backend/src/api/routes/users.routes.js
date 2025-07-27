/**
 * @fileoverview Users Routes for ShadowNews Platform
 * 
 * Comprehensive user management routing system for the ShadowNews email-first news platform.
 * This module handles all user-related operations including profile management, authentication,
 * social features, notification systems, API key management, and administrative controls.
 * Users are the central entities in the platform, managing content creation, repository participation,
 * and community engagement.
 * 
 * Key Features:
 * - User profile management and customization
 * - Avatar upload and profile photo management
 * - Email address verification and management
 * - Social following and follower systems
 * - Notification management and preferences
 * - User blocking and privacy controls
 * - API key generation and management
 * - Data export and privacy compliance
 * - Account deletion and data retention
 * - Administrative user management
 * 
 * Profile Management Features:
 * - Comprehensive user profile customization
 * - Avatar upload with image processing
 * - Personal information and bio management
 * - Website and social media integration
 * - Interest tagging and content preferences
 * - Public profile visibility controls
 * 
 * Email Management Features:
 * - Multiple email address association
 * - Email verification workflow
 * - Email-based notification preferences
 * - Email digest frequency controls
 * - Email alias management for repositories
 * - Email privacy and visibility settings
 * 
 * Social Features:
 * - User following and follower relationships
 * - Social activity feeds and interactions
 * - User blocking and privacy protection
 * - Social discovery and recommendations
 * - Community engagement tracking
 * 
 * Notification System:
 * - Real-time notification delivery
 * - Notification categorization and filtering
 * - Email notification preferences
 * - Push notification support
 * - Notification history and management
 * - Bulk notification operations
 * 
 * API and Integration:
 * - Personal API key generation and management
 * - Scoped access controls for integrations
 * - Rate limiting and abuse prevention
 * - API usage analytics and monitoring
 * - Third-party integration support
 * 
 * Privacy and Security:
 * - Data export for privacy compliance
 * - Account deletion with data retention options
 * - Privacy setting management
 * - Security audit logging
 * - Two-factor authentication integration
 * 
 * Administrative Features:
 * - User role management (user, moderator, admin)
 * - Account status controls (active, suspended)
 * - Bulk user operations and management
 * - User analytics and behavior tracking
 * - Moderation tools and controls
 * 
 * Dependencies:
 * - express: Web framework for route definition and handling
 * - express-validator: Input validation and sanitization
 * - usersController: Business logic for user operations
 * - authMiddleware: Authentication and authorization middleware
 * - validationMiddleware: Input validation processing
 * - rateLimitMiddleware: Rate limiting for abuse prevention
 * - uploadMiddleware: File upload handling for avatars
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for user routing
const express = require('express');                          // Express web framework
const router = express.Router();                             // Express router instance

// Middleware and controller imports
const { authenticate, authorize } = require('../middlewares/auth.middleware');    // Authentication and authorization
const { validate } = require('../middlewares/validation.middleware');            // Validation processing
const { rateLimit } = require('../middlewares/rateLimit.middleware');            // Rate limiting
const upload = require('../middlewares/upload.middleware');                      // File upload handling
const usersController = require('../controllers/users.controller');             // User business logic

// Express validator utilities for route-specific validation
const { body, param, query } = require('express-validator');

// ========== PUBLIC USER ROUTES ==========
// These routes provide public access to user information and community features

/**
 * Get Public User Profile Endpoint
 * GET /api/users/profile/:username
 * 
 * Retrieves public profile information for a specific user.
 * Provides community visibility while respecting privacy settings.
 * 
 * Features:
 * - Public profile information display
 * - Privacy-controlled information access
 * - User activity and contribution highlights
 * - Repository and content associations
 * - Social engagement metrics
 * - Professional information and links
 * 
 * URL Parameters:
 * - username: Alphanumeric username (3-30 characters)
 * 
 * Response:
 * - Public user profile with privacy-filtered information
 * - User activity highlights and contribution summary
 * - Repository associations and content overview
 * - Social engagement metrics and community standing
 * - Professional links and contact information
 */
router.get('/profile/:username', 
 validate([
   param('username').isAlphanumeric().isLength({ min: 3, max: 30 })  // Username validation
 ]),
 usersController.getPublicProfile                           // Handle public profile retrieval
);

/**
 * Get User Leaderboard Endpoint
 * GET /api/users/leaderboard
 * 
 * Retrieves community leaderboard with top contributors and active users.
 * Provides gamification and community recognition features.
 * 
 * Features:
 * - Community leaderboard with karma and contribution rankings
 * - Time-based leaderboard filtering (day, week, month, year, all)
 * - Multiple ranking categories and metrics
 * - Achievement and milestone recognition
 * - Community engagement analytics
 * - Fair ranking algorithms with quality weighting
 * 
 * Query Parameters:
 * - limit: Maximum users to return (1-100, default varies)
 * - offset: Pagination offset (minimum 0)
 * - period: Time period for rankings (day, week, month, year, all)
 * 
 * Response:
 * - Ranked user list with karma and contribution scores
 * - Leaderboard metadata and ranking algorithms
 * - Achievement highlights and milestone recognition
 * - Community engagement statistics and trends
 * - Ranking period analysis and comparisons
 */
router.get('/leaderboard',
 validate([
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),      // Limit validation
   query('offset').optional().isInt({ min: 0 }).toInt(),               // Offset validation
   query('period').optional().isIn(['day', 'week', 'month', 'year', 'all'])  // Period validation
 ]),
 usersController.getLeaderboard                             // Handle leaderboard retrieval
);

// ========== AUTHENTICATED USER ROUTES ==========
// All subsequent routes require user authentication

/**
 * Authentication Middleware
 * 
 * Applies authentication requirement to all subsequent routes.
 * Ensures user identity verification for protected operations.
 */
router.use(authenticate);

// ========== PERSONAL PROFILE MANAGEMENT ROUTES ==========
// These routes handle personal profile information and customization

/**
 * Get Current User Profile Endpoint
 * GET /api/users/me
 * 
 * Retrieves complete profile information for the authenticated user.
 * Provides comprehensive user data including private information.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Controller logic for user profile retrieval
 * 
 * Features:
 * - Complete user profile with private information access
 * - Account settings and preferences display
 * - Security information and authentication status
 * - Email addresses and verification status
 * - API keys and integration information
 * - Activity summary and engagement metrics
 * 
 * Response:
 * - Complete user profile with private information
 * - Account security and authentication status
 * - Email management and verification details
 * - API integration and key management information
 * - Personal activity summary and statistics
 */
router.get('/me', usersController.getCurrentUser);

/**
 * Update User Profile Endpoint
 * PATCH /api/users/me
 * 
 * Updates user profile information with validation and privacy controls.
 * Supports comprehensive profile customization and personalization.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Profile data validation and sanitization
 * 3. Controller logic for profile update processing
 * 
 * Features:
 * - Comprehensive profile information updates
 * - Display name and bio customization
 * - Website and social media link management
 * - Interest tagging and content preferences
 * - Profile validation and consistency checking
 * - Change audit logging and history tracking
 * 
 * Request Body:
 * - displayName: Updated display name (1-50 characters, optional)
 * - bio: User biography (maximum 500 characters, optional)
 * - website: Personal or professional website URL (optional)
 * - interests: Array of user interests for personalization (optional)
 * 
 * Response:
 * - Updated user profile with change summary
 * - Profile validation and consistency results
 * - Change audit log and modification tracking
 * - Personalization and content recommendation updates
 */
router.patch('/me',
 validate([
   body('displayName').optional().isString().isLength({ min: 1, max: 50 }),  // Display name validation
   body('bio').optional().isString().isLength({ max: 500 }),                 // Bio validation
   body('website').optional().isURL(),                                       // Website URL validation
   body('interests').optional().isArray(),                                   // Interests array validation
   body('interests.*').optional().isString()                                 // Individual interest validation
 ]),
 usersController.updateProfile                              // Handle profile update
);

// ========== AVATAR MANAGEMENT ROUTES ==========
// These routes handle profile photo upload and management

/**
 * Upload User Avatar Endpoint
 * POST /api/users/me/avatar
 * 
 * Uploads and processes a new avatar image for the user profile.
 * Supports image validation, resizing, and optimization.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. File upload handling with image validation
 * 3. Controller logic for avatar processing and storage
 * 
 * Features:
 * - Image upload with format and size validation
 * - Automatic image resizing and optimization
 * - Multiple image format support (JPEG, PNG, WebP)
 * - Image quality optimization for performance
 * - Previous avatar cleanup and storage management
 * - CDN integration for global image delivery
 * 
 * Request:
 * - avatar: Image file upload (multipart form data)
 * 
 * Response:
 * - Avatar upload confirmation with image URLs
 * - Image processing and optimization summary
 * - CDN distribution and availability status
 * - Storage management and cleanup results
 */
router.post('/me/avatar',
 upload.single('avatar'),                                   // Handle avatar file upload
 usersController.uploadAvatar                               // Handle avatar processing
);

/**
 * Delete User Avatar Endpoint
 * DELETE /api/users/me/avatar
 * 
 * Removes the user's current avatar and reverts to default.
 * Handles cleanup of stored images and CDN cache invalidation.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Controller logic for avatar deletion and cleanup
 * 
 * Features:
 * - Avatar deletion with storage cleanup
 * - CDN cache invalidation and cleanup
 * - Default avatar restoration
 * - Storage optimization and space reclamation
 * - Audit logging for avatar changes
 * 
 * Response:
 * - Avatar deletion confirmation
 * - Storage cleanup and optimization results
 * - Default avatar restoration status
 * - Cache invalidation and CDN update confirmation
 */
router.delete('/me/avatar', usersController.deleteAvatar);

// ========== KARMA AND REPUTATION ROUTES ==========
// These routes handle user reputation and community standing

/**
 * Get User Karma History Endpoint
 * GET /api/users/me/karma
 * 
 * Retrieves detailed karma history and reputation tracking.
 * Provides transparency and insights into community contribution scoring.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Controller logic for karma history compilation
 * 
 * Features:
 * - Comprehensive karma history with transaction details
 * - Karma source breakdown and categorization
 * - Reputation trend analysis and growth tracking
 * - Quality score evolution and improvement insights
 * - Community contribution impact assessment
 * - Achievement and milestone tracking
 * 
 * Response:
 * - Detailed karma transaction history
 * - Karma source analysis and contribution breakdown
 * - Reputation trend charts and growth analytics
 * - Quality score evolution and improvement insights
 * - Achievement progress and milestone tracking
 */
router.get('/me/karma', usersController.getKarmaHistory);

// ========== USER CONTENT AND REPOSITORY ROUTES ==========
// These routes provide access to user-generated content and repository associations

/**
 * Get User Repositories Endpoint
 * GET /api/users/me/repositories
 * 
 * Retrieves repositories owned or collaborated on by the user.
 * Provides comprehensive repository management and access control.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Query parameter validation for pagination and sorting
 * 3. Controller logic for repository retrieval and filtering
 * 
 * Features:
 * - User repository list with ownership and collaboration details
 * - Repository sorting by creation, update, size, and activity
 * - Repository statistics and performance metrics
 * - Collaboration role and permission information
 * - Repository activity and engagement analytics
 * - Access control and privacy status indicators
 * 
 * Query Parameters:
 * - limit: Repositories per page (1-50)
 * - offset: Pagination offset (minimum 0)
 * - sort: Sort order (created, updated, size, activity)
 * 
 * Response:
 * - Paginated user repository list with metadata
 * - Repository performance and engagement statistics
 * - Collaboration details and permission information
 * - Repository activity timeline and recent updates
 * - Access control status and privacy indicators
 */
router.get('/me/repositories', 
 validate([
   query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),       // Limit validation
   query('offset').optional().isInt({ min: 0 }).toInt(),               // Offset validation
   query('sort').optional().isIn(['created', 'updated', 'size', 'activity'])  // Sort validation
 ]),
 usersController.getUserRepositories                        // Handle repository retrieval
);

/**
 * Get User Posts Endpoint
 * GET /api/users/me/posts
 * 
 * Retrieves posts created, upvoted, or commented on by the user.
 * Provides comprehensive content history and engagement tracking.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Query parameter validation for pagination and filtering
 * 3. Controller logic for post retrieval and categorization
 * 
 * Features:
 * - User content history with interaction categorization
 * - Post filtering by submission, voting, and commenting activity
 * - Content performance and engagement analytics
 * - Post quality assessment and community impact
 * - Content timeline and activity chronology
 * - Engagement pattern analysis and insights
 * 
 * Query Parameters:
 * - limit: Posts per page (1-50)
 * - offset: Pagination offset (minimum 0)
 * - type: Content type filter (submitted, upvoted, commented)
 * 
 * Response:
 * - Paginated user post history with interaction details
 * - Content performance and engagement analytics
 * - Post quality assessment and community impact metrics
 * - Activity timeline and chronological organization
 * - Engagement pattern insights and behavior analysis
 */
router.get('/me/posts',
 validate([
   query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),       // Limit validation
   query('offset').optional().isInt({ min: 0 }).toInt(),               // Offset validation
   query('type').optional().isIn(['submitted', 'upvoted', 'commented']) // Type validation
 ]),
 usersController.getUserPosts                               // Handle post retrieval
);

// ========== EMAIL MANAGEMENT ROUTES ==========
// These routes handle user email addresses, verification, and notification preferences

/**
 * Get User Emails Endpoint
 * GET /api/users/me/emails
 * 
 * Retrieves email addresses associated with the user account.
 * Provides email management with verification status and controls.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Query parameter validation for filtering
 * 3. Controller logic for email retrieval and status reporting
 * 
 * Features:
 * - User email list with verification and status information
 * - Email verification status and workflow management
 * - Email usage analytics and delivery statistics
 * - Email alias and repository association tracking
 * - Privacy controls and visibility settings
 * - Email security and authentication status
 * 
 * Query Parameters:
 * - verified: Filter by verification status (boolean)
 * 
 * Response:
 * - User email list with verification and status details
 * - Email delivery and engagement statistics
 * - Verification workflow status and management options
 * - Email alias and repository association information
 * - Privacy and security settings for each email
 */
router.get('/me/emails',
 validate([
   query('verified').optional().isBoolean().toBoolean()     // Verification filter validation
 ]),
 usersController.getUserEmails                              // Handle email retrieval
);

/**
 * Add Email Address Endpoint
 * POST /api/users/me/emails
 * 
 * Adds a new email address to the user account with verification workflow.
 * Supports email labeling and organizational features.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Email validation and normalization
 * 3. Rate limiting for email addition abuse prevention (5 per hour)
 * 4. Controller logic for email addition and verification initiation
 * 
 * Features:
 * - Email address validation and normalization
 * - Duplicate email detection and prevention
 * - Automatic verification workflow initiation
 * - Email labeling and organizational categorization
 * - Rate limiting for abuse prevention
 * - Email deliverability pre-validation
 * 
 * Request Body:
 * - email: Email address to add (required, valid email format)
 * - label: Optional label for email organization (maximum 50 characters)
 * 
 * Response:
 * - Email addition confirmation with verification details
 * - Verification workflow initiation status
 * - Email validation and deliverability assessment
 * - Rate limiting status and usage information
 */
router.post('/me/emails',
 validate([
   body('email').isEmail().normalizeEmail(),                // Email validation and normalization
   body('label').optional().isString().isLength({ max: 50 }) // Label validation
 ]),
 rateLimit({ max: 5, windowMs: 60 * 60 * 1000 }),          // Rate limiting: 5 per hour
 usersController.addEmail                                   // Handle email addition
);

/**
 * Remove Email Address Endpoint
 * DELETE /api/users/me/emails/:emailId
 * 
 * Removes an email address from the user account with cleanup.
 * Handles cascading cleanup of associated subscriptions and aliases.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Email ID validation
 * 3. Controller logic for email removal and cleanup
 * 
 * Features:
 * - Email existence verification before removal
 * - Cascading cleanup of repository associations and subscriptions
 * - Email alias and notification cleanup
 * - Data retention compliance and audit logging
 * - Primary email protection and validation
 * - Graceful unsubscription from services
 * 
 * URL Parameters:
 * - emailId: MongoDB ObjectId of the email to remove
 * 
 * Response:
 * - Email removal confirmation with cleanup summary
 * - Subscription and alias cleanup status
 * - Data retention and audit logging information
 * - Primary email protection status verification
 */
router.delete('/me/emails/:emailId',
 validate([
   param('emailId').isMongoId()                             // Email ID validation
 ]),
 usersController.removeEmail                                // Handle email removal
);

/**
 * Verify Email Address Endpoint
 * POST /api/users/me/emails/:emailId/verify
 * 
 * Verifies an email address using a verification code.
 * Completes the email verification workflow with security validation.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Email ID and verification code validation
 * 3. Rate limiting for verification attempts (5 per 15 minutes)
 * 4. Controller logic for verification code processing
 * 
 * Features:
 * - Verification code validation and processing
 * - Email verification workflow completion
 * - Security validation and fraud prevention
 * - Rate limiting for brute force protection
 * - Automatic email activation and feature enablement
 * - Verification audit logging and tracking
 * 
 * URL Parameters:
 * - emailId: MongoDB ObjectId of the email to verify
 * 
 * Request Body:
 * - code: Verification code (6 characters)
 * 
 * Response:
 * - Email verification confirmation with activation status
 * - Feature enablement and access control updates
 * - Security validation and fraud detection results
 * - Verification audit log and tracking information
 */
router.post('/me/emails/:emailId/verify',
 validate([
   param('emailId').isMongoId(),                            // Email ID validation
   body('code').isString().isLength({ min: 6, max: 6 })    // Verification code validation
 ]),
 rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),          // Rate limiting: 5 per 15 minutes
 usersController.verifyEmail                                // Handle email verification
);

/**
 * Resend Email Verification Endpoint
 * POST /api/users/me/emails/:emailId/resend-verification
 * 
 * Resends verification email for unverified email addresses.
 * Provides verification recovery with abuse prevention.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Email ID validation
 * 3. Rate limiting for resend requests (3 per hour)
 * 4. Controller logic for verification email resending
 * 
 * Features:
 * - Verification email regeneration and delivery
 * - Email deliverability optimization and retry logic
 * - Rate limiting for abuse prevention
 * - Verification code rotation for security
 * - Email template personalization and branding
 * - Delivery tracking and success monitoring
 * 
 * URL Parameters:
 * - emailId: MongoDB ObjectId of the email requiring verification
 * 
 * Response:
 * - Verification email resend confirmation
 * - Email delivery status and tracking information
 * - Rate limiting status and usage details
 * - Verification workflow renewal and timeline
 */
router.post('/me/emails/:emailId/resend-verification',
 validate([
   param('emailId').isMongoId()                             // Email ID validation
 ]),
 rateLimit({ max: 3, windowMs: 60 * 60 * 1000 }),          // Rate limiting: 3 per hour
 usersController.resendEmailVerification                    // Handle verification resend
);

// ========== USER SETTINGS AND PREFERENCES ROUTES ==========
// These routes handle user preferences, customization, and application settings

/**
 * Update User Settings Endpoint
 * PATCH /api/users/me/settings
 * 
 * Updates user application settings and preferences.
 * Supports comprehensive customization and personalization options.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Settings validation and consistency checking
 * 3. Controller logic for settings update and application
 * 
 * Features:
 * - Comprehensive user preference management
 * - Email digest frequency and notification controls
 * - Privacy settings and profile visibility options
 * - Theme and interface customization
 * - Timezone and localization preferences
 * - Language selection and internationalization
 * 
 * Request Body:
 * - emailDigest: Email digest frequency (daily, weekly, never)
 * - emailNotifications: Email notification preference (boolean)
 * - publicProfile: Public profile visibility (boolean)
 * - showEmail: Email visibility in public profile (boolean)
 * - theme: Interface theme preference (light, dark, auto)
 * - timezone: User timezone for date/time display
 * - language: Interface language (en, es, fr, de, ja, zh)
 * 
 * Response:
 * - Settings update confirmation with applied changes
 * - Preference validation and consistency results
 * - Feature availability and access control updates
 * - Personalization and content recommendation adjustments
 */
router.patch('/me/settings',
 validate([
   body('emailDigest').optional().isIn(['daily', 'weekly', 'never']),   // Email digest validation
   body('emailNotifications').optional().isBoolean(),                   // Email notifications validation
   body('publicProfile').optional().isBoolean(),                        // Public profile validation
   body('showEmail').optional().isBoolean(),                            // Email visibility validation
   body('theme').optional().isIn(['light', 'dark', 'auto']),            // Theme validation
   body('timezone').optional().isString(),                              // Timezone validation
   body('language').optional().isIn(['en', 'es', 'fr', 'de', 'ja', 'zh']) // Language validation
 ]),
 usersController.updateSettings                             // Handle settings update
);

/**
 * Get User Settings Endpoint
 * GET /api/users/me/settings
 * 
 * Retrieves current user settings and preferences.
 * Provides comprehensive settings overview for management interface.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Controller logic for settings retrieval and compilation
 * 
 * Features:
 * - Complete user settings and preference display
 * - Default value indication and customization options
 * - Setting validation status and consistency checks
 * - Feature availability and access control information
 * - Personalization status and recommendation settings
 * - Privacy and security setting overview
 * 
 * Response:
 * - Complete user settings with current values
 * - Default and available option information
 * - Setting validation and consistency status
 * - Feature availability and access control details
 * - Personalization and recommendation configuration
 */
router.get('/me/settings', usersController.getSettings);

// ========== USER BLOCKING AND PRIVACY ROUTES ==========
// These routes handle user blocking, privacy controls, and social filtering

/**
 * Block User Endpoint
 * POST /api/users/me/block
 * 
 * Blocks another user to prevent interactions and content visibility.
 * Provides privacy protection and harassment prevention features.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. User ID validation for blocking target
 * 3. Controller logic for user blocking and content filtering
 * 
 * Features:
 * - User blocking with comprehensive interaction prevention
 * - Content filtering and visibility controls
 * - Harassment prevention and reporting integration
 * - Block list management and organization
 * - Privacy protection and security enhancement
 * - Block audit logging and tracking
 * 
 * Request Body:
 * - userId: MongoDB ObjectId of user to block
 * 
 * Response:
 * - User blocking confirmation with effect summary
 * - Content filtering and visibility adjustment status
 * - Privacy protection enhancement confirmation
 * - Block list update and management information
 */
router.post('/me/block',
 validate([
   body('userId').isMongoId()                               // User ID validation
 ]),
 usersController.blockUser                                  // Handle user blocking
);

/**
 * Unblock User Endpoint
 * DELETE /api/users/me/block/:userId
 * 
 * Unblocks a previously blocked user and restores normal interactions.
 * Handles graceful restoration of content visibility and interactions.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. User ID validation for unblocking target
 * 3. Controller logic for user unblocking and content restoration
 * 
 * Features:
 * - User unblocking with interaction restoration
 * - Content visibility restoration and filtering adjustment
 * - Block list management and organization
 * - Privacy setting consistency and validation
 * - Unblock audit logging and tracking
 * - Gradual content restoration for performance
 * 
 * URL Parameters:
 * - userId: MongoDB ObjectId of user to unblock
 * 
 * Response:
 * - User unblocking confirmation with restoration summary
 * - Content visibility restoration status
 * - Block list update and management information
 * - Privacy setting validation and consistency results
 */
router.delete('/me/block/:userId',
 validate([
   param('userId').isMongoId()                              // User ID validation
 ]),
 usersController.unblockUser                                // Handle user unblocking
);

/**
 * Get Blocked Users Endpoint
 * GET /api/users/me/blocked
 * 
 * Retrieves list of blocked users for management and review.
 * Provides blocked user management interface and controls.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Controller logic for blocked user list retrieval
 * 
 * Features:
 * - Blocked user list with management controls
 * - Block date and reason tracking
 * - Bulk unblocking and management operations
 * - Block effectiveness and interaction prevention status
 * - Privacy impact assessment and reporting
 * - Block analytics and pattern recognition
 * 
 * Response:
 * - Paginated blocked user list with metadata
 * - Block management controls and bulk operations
 * - Block effectiveness and interaction prevention status
 * - Privacy impact assessment and analytics
 * - Block pattern analysis and recommendations
 */
router.get('/me/blocked', usersController.getBlockedUsers);

// ========== SOCIAL FOLLOWING ROUTES ==========
// These routes handle user following relationships and social networking

/**
 * Get User Followers Endpoint
 * GET /api/users/me/followers
 * 
 * Retrieves users who are following the current user.
 * Provides follower management and social networking insights.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Query parameter validation for pagination
 * 3. Controller logic for follower retrieval and analytics
 * 
 * Features:
 * - Follower list with engagement and interaction metrics
 * - Follower growth tracking and analytics
 * - Mutual following detection and relationship analysis
 * - Follower quality assessment and community standing
 * - Social influence metrics and reach analysis
 * - Follower management and interaction tools
 * 
 * Query Parameters:
 * - limit: Followers per page (1-100)
 * - offset: Pagination offset (minimum 0)
 * 
 * Response:
 * - Paginated follower list with engagement metrics
 * - Follower growth analytics and trend analysis
 * - Mutual following and relationship information
 * - Social influence and reach measurement
 * - Follower quality and community assessment
 */
router.get('/me/followers',
 validate([
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),      // Limit validation
   query('offset').optional().isInt({ min: 0 }).toInt()                // Offset validation
 ]),
 usersController.getFollowers                               // Handle follower retrieval
);

/**
 * Get Users Following Endpoint
 * GET /api/users/me/following
 * 
 * Retrieves users that the current user is following.
 * Provides following management and content discovery features.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Query parameter validation for pagination
 * 3. Controller logic for following list retrieval and management
 * 
 * Features:
 * - Following list with activity and content highlights
 * - Following organization and categorization tools
 * - Mutual following detection and relationship analysis
 * - Content feed curation and personalization
 * - Following quality assessment and recommendation
 * - Bulk following management and organization
 * 
 * Query Parameters:
 * - limit: Following users per page (1-100)
 * - offset: Pagination offset (minimum 0)
 * 
 * Response:
 * - Paginated following list with activity highlights
 * - Following organization and categorization options
 * - Content feed curation and personalization status
 * - Following quality assessment and recommendations
 * - Bulk management and organization tools
 */
router.get('/me/following',
 validate([
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),      // Limit validation
   query('offset').optional().isInt({ min: 0 }).toInt()                // Offset validation
 ]),
 usersController.getFollowing                               // Handle following retrieval
);

/**
 * Follow User Endpoint
 * POST /api/users/follow/:userId
 * 
 * Follows another user to receive their content in feeds.
 * Establishes social connections with notification and content integration.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. User ID validation for following target
 * 3. Rate limiting for following actions (100 per hour)
 * 4. Controller logic for following relationship creation
 * 
 * Features:
 * - User following with content feed integration
 * - Notification to followed user about new follower
 * - Mutual following detection and relationship enhancement
 * - Content personalization and recommendation improvement
 * - Social graph expansion and community building
 * - Following analytics and engagement tracking
 * 
 * URL Parameters:
 * - userId: MongoDB ObjectId of user to follow
 * 
 * Response:
 * - Following confirmation with relationship status
 * - Content feed integration and personalization updates
 * - Notification delivery status to followed user
 * - Social graph and community impact analysis
 * - Following analytics and engagement predictions
 */
router.post('/follow/:userId',
 validate([
   param('userId').isMongoId()                              // User ID validation
 ]),
 rateLimit({ max: 100, windowMs: 60 * 60 * 1000 }),        // Rate limiting: 100 per hour
 usersController.followUser                                 // Handle user following
);

/**
 * Unfollow User Endpoint
 * DELETE /api/users/follow/:userId
 * 
 * Unfollows a previously followed user and adjusts content feeds.
 * Handles graceful relationship termination with content adjustment.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. User ID validation for unfollowing target
 * 3. Controller logic for following relationship removal
 * 
 * Features:
 * - User unfollowing with content feed adjustment
 * - Content personalization and recommendation recalibration
 * - Social graph update and relationship management
 * - Following analytics and engagement impact assessment
 * - Graceful content transition and feed optimization
 * - Unfollow audit logging and tracking
 * 
 * URL Parameters:
 * - userId: MongoDB ObjectId of user to unfollow
 * 
 * Response:
 * - Unfollowing confirmation with relationship update
 * - Content feed adjustment and personalization changes
 * - Social graph impact and community analysis
 * - Following analytics and engagement recalibration
 * - Content transition and optimization status
 */
router.delete('/follow/:userId',
 validate([
   param('userId').isMongoId()                              // User ID validation
 ]),
 usersController.unfollowUser                               // Handle user unfollowing
);

// ========== NOTIFICATION MANAGEMENT ROUTES ==========
// These routes handle user notifications, alerts, and communication preferences

/**
 * Get User Notifications Endpoint
 * GET /api/users/me/notifications
 * 
 * Retrieves user notifications with filtering and categorization.
 * Provides comprehensive notification management and organization.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Query parameter validation for filtering and pagination
 * 3. Controller logic for notification retrieval and categorization
 * 
 * Features:
 * - Notification list with categorization and filtering
 * - Unread notification highlighting and management
 * - Notification type filtering (comment, upvote, follow, repository, mention)
 * - Real-time notification updates and synchronization
 * - Notification priority and importance ranking
 * - Bulk notification management and operations
 * 
 * Query Parameters:
 * - unread: Filter by read status (boolean)
 * - type: Notification type filter (comment, upvote, follow, repository, mention)
 * - limit: Notifications per page (1-100)
 * - offset: Pagination offset (minimum 0)
 * 
 * Response:
 * - Paginated notification list with metadata
 * - Unread notification count and highlighting
 * - Notification categorization and type breakdown
 * - Real-time update synchronization status
 * - Bulk management and operation tools
 */
router.get('/me/notifications',
 validate([
   query('unread').optional().isBoolean().toBoolean(),                        // Unread filter validation
   query('type').optional().isIn(['comment', 'upvote', 'follow', 'repository', 'mention']), // Type validation
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),             // Limit validation
   query('offset').optional().isInt({ min: 0 }).toInt()                       // Offset validation
 ]),
 usersController.getNotifications                           // Handle notification retrieval
);

/**
 * Mark Notification as Read Endpoint
 * PATCH /api/users/me/notifications/:notificationId/read
 * 
 * Marks a specific notification as read with status tracking.
 * Updates notification status and engagement analytics.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Notification ID validation
 * 3. Controller logic for notification status update
 * 
 * Features:
 * - Individual notification read status management
 * - Notification engagement and interaction tracking
 * - Real-time notification count updates
 * - Notification analytics and behavior insights
 * - Status synchronization across devices and platforms
 * - Notification audit logging and tracking
 * 
 * URL Parameters:
 * - notificationId: MongoDB ObjectId of notification to mark as read
 * 
 * Response:
 * - Notification read status confirmation
 * - Real-time count updates and synchronization
 * - Notification engagement and analytics updates
 * - Status synchronization across platforms
 * - Notification audit log and tracking information
 */
router.patch('/me/notifications/:notificationId/read',
 validate([
   param('notificationId').isMongoId()                      // Notification ID validation
 ]),
 usersController.markNotificationRead                       // Handle notification read status
);

/**
 * Mark All Notifications as Read Endpoint
 * POST /api/users/me/notifications/read-all
 * 
 * Marks all user notifications as read with bulk status update.
 * Provides efficient notification management for active users.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Controller logic for bulk notification status update
 * 
 * Features:
 * - Bulk notification read status management
 * - Efficient database operations for large notification sets
 * - Real-time notification count reset and synchronization
 * - Notification engagement analytics and behavior tracking
 * - Performance optimization for high-volume users
 * - Bulk operation audit logging and tracking
 * 
 * Response:
 * - Bulk read status confirmation with operation summary
 * - Real-time count reset and synchronization status
 * - Notification engagement analytics update
 * - Performance optimization and operation efficiency metrics
 * - Bulk operation audit log and tracking information
 */
router.post('/me/notifications/read-all', usersController.markAllNotificationsRead);

// ========== API KEY MANAGEMENT ROUTES ==========
// These routes handle personal API key generation and management for integrations

/**
 * Get User API Keys Endpoint
 * GET /api/users/me/api-keys
 * 
 * Retrieves user's API keys for integration and automation management.
 * Provides API key overview with usage analytics and security information.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Controller logic for API key retrieval and analytics
 * 
 * Features:
 * - API key list with usage statistics and analytics
 * - Key scope and permission information
 * - API usage tracking and rate limiting status
 * - Key security status and rotation recommendations
 * - Integration health monitoring and diagnostics
 * - Key management and organization tools
 * 
 * Response:
 * - API key list with metadata and usage statistics
 * - Key scope and permission details
 * - Usage analytics and rate limiting information
 * - Security status and rotation recommendations
 * - Integration health and diagnostic information
 */
router.get('/me/api-keys', usersController.getApiKeys);

/**
 * Create API Key Endpoint
 * POST /api/users/me/api-keys
 * 
 * Creates a new API key with specified scopes and permissions.
 * Supports scoped access control for secure integrations.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. API key configuration validation
 * 3. Rate limiting for key creation (5 per day)
 * 4. Controller logic for key generation and storage
 * 
 * Features:
 * - API key generation with cryptographic security
 * - Scoped permission system (read, write, delete)
 * - Key naming and organization for management
 * - Rate limiting for security and abuse prevention
 * - Key rotation and expiration management
 * - Integration documentation and usage guidance
 * 
 * Request Body:
 * - name: API key name for identification (1-100 characters)
 * - scopes: Permission scopes array (read, write, delete)
 * 
 * Response:
 * - API key creation confirmation with key details
 * - Generated key value and security information
 * - Permission scope and access control summary
 * - Integration documentation and usage guidance
 * - Key management and rotation recommendations
 */
router.post('/me/api-keys',
 validate([
   body('name').isString().isLength({ min: 1, max: 100 }),  // Key name validation
   body('scopes').isArray(),                                // Scopes array validation
   body('scopes.*').isIn(['read', 'write', 'delete'])       // Individual scope validation
 ]),
 rateLimit({ max: 5, windowMs: 24 * 60 * 60 * 1000 }),     // Rate limiting: 5 per day
 usersController.createApiKey                               // Handle API key creation
);

/**
 * Revoke API Key Endpoint
 * DELETE /api/users/me/api-keys/:keyId
 * 
 * Revokes an API key and invalidates all associated access.
 * Handles secure key revocation with immediate effect.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Key ID validation
 * 3. Controller logic for key revocation and cleanup
 * 
 * Features:
 * - Immediate API key revocation and access termination
 * - Key usage audit and final analytics compilation
 * - Integration notification and disconnection handling
 * - Security cleanup and token invalidation
 * - Revocation audit logging and tracking
 * - Impact assessment and integration health monitoring
 * 
 * URL Parameters:
 * - keyId: MongoDB ObjectId of API key to revoke
 * 
 * Response:
 * - API key revocation confirmation with termination summary
 * - Usage audit and final analytics compilation
 * - Integration notification and disconnection status
 * - Security cleanup and invalidation confirmation
 * - Revocation audit log and tracking information
 */
router.delete('/me/api-keys/:keyId',
 validate([
   param('keyId').isMongoId()                               // Key ID validation
 ]),
 usersController.revokeApiKey                               // Handle API key revocation
);

// ========== DATA PRIVACY AND EXPORT ROUTES ==========
// These routes handle data privacy compliance and user data management

/**
 * Request Data Export Endpoint
 * POST /api/users/me/export-data
 * 
 * Initiates comprehensive user data export for privacy compliance.
 * Supports GDPR and privacy regulation compliance with complete data export.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Rate limiting for export requests (1 per day)
 * 3. Controller logic for data export initiation and processing
 * 
 * Features:
 * - Comprehensive user data compilation and export
 * - Privacy regulation compliance (GDPR, CCPA)
 * - Multiple export formats (JSON, CSV, XML)
 * - Data integrity verification and validation
 * - Secure download and access control
 * - Export audit logging and compliance tracking
 * 
 * Response:
 * - Data export initiation confirmation with timeline
 * - Export process status and progress tracking
 * - Privacy compliance and regulation adherence confirmation
 * - Data integrity and validation status
 * - Secure download and access information
 */
router.post('/me/export-data',
 rateLimit({ max: 1, windowMs: 24 * 60 * 60 * 1000 }),     // Rate limiting: 1 per day
 usersController.requestDataExport                          // Handle data export request
);

/**
 * Delete User Account Endpoint
 * DELETE /api/users/me
 * 
 * Permanently deletes user account with comprehensive data cleanup.
 * Handles account deletion with privacy compliance and data retention options.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Account deletion validation with password and confirmation
 * 3. Controller logic for account deletion and data cleanup
 * 
 * Features:
 * - Secure account deletion with password verification
 * - Comprehensive data cleanup and anonymization
 * - Privacy compliance and data retention handling
 * - Cascading deletion of associated content and relationships
 * - Account deletion audit logging and compliance tracking
 * - Recovery period and account restoration options
 * 
 * Request Body:
 * - password: User password for deletion confirmation
 * - confirmation: Literal string "DELETE" for additional confirmation
 * 
 * Response:
 * - Account deletion confirmation with cleanup summary
 * - Data anonymization and privacy compliance status
 * - Content and relationship cleanup information
 * - Recovery period and restoration option details
 * - Deletion audit log and compliance documentation
 */
router.delete('/me',
 validate([
   body('password').isString(),                             // Password validation
   body('confirmation').equals('DELETE')                    // Confirmation validation
 ]),
 usersController.deleteAccount                              // Handle account deletion
);

// ========== ADMINISTRATIVE USER MANAGEMENT ROUTES ==========
// These routes provide administrative controls for user management and moderation

/**
 * Get All Users Endpoint (Admin Only)
 * GET /api/users/
 * 
 * Retrieves all users with administrative filtering and management capabilities.
 * Provides comprehensive user administration and moderation tools.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Admin role authorization
 * 3. Query parameter validation for filtering and pagination
 * 4. Controller logic for user retrieval and administration
 * 
 * Features:
 * - Administrative user list with comprehensive filtering
 * - User search by name, email, and metadata
 * - Role and status filtering for targeted management
 * - User activity analytics and behavior insights
 * - Bulk user operations and management tools
 * - Moderation queue and flagged user identification
 * 
 * Query Parameters:
 * - search: User search query string
 * - role: User role filter (user, moderator, admin)
 * - status: User status filter (active, suspended, deleted)
 * - limit: Users per page (1-100)
 * - offset: Pagination offset (minimum 0)
 * 
 * Response:
 * - Paginated user list with administrative metadata
 * - User activity analytics and behavior insights
 * - Moderation status and flagged user information
 * - Bulk operation tools and management capabilities
 * - Administrative action history and audit logs
 */
router.get('/',
 authorize(['admin']),                                      // Admin role authorization
 validate([
   query('search').optional().isString(),                   // Search query validation
   query('role').optional().isIn(['user', 'moderator', 'admin']),     // Role filter validation
   query('status').optional().isIn(['active', 'suspended', 'deleted']), // Status filter validation
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),      // Limit validation
   query('offset').optional().isInt({ min: 0 }).toInt()                // Offset validation
 ]),
 usersController.getAllUsers                                // Handle administrative user retrieval
);

/**
 * Update User Role Endpoint (Admin Only)
 * PATCH /api/users/:userId/role
 * 
 * Updates user role with administrative privileges and validation.
 * Provides role management with comprehensive access control updates.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Admin role authorization
 * 3. User ID and role validation
 * 4. Controller logic for role update and access control adjustment
 * 
 * Features:
 * - Administrative role management and assignment
 * - Access control update and permission adjustment
 * - Role transition validation and security verification
 * - Administrative action audit logging
 * - User notification about role changes
 * - Feature access adjustment and capability update
 * 
 * URL Parameters:
 * - userId: MongoDB ObjectId of user to update
 * 
 * Request Body:
 * - role: New user role (user, moderator, admin)
 * 
 * Response:
 * - Role update confirmation with access control changes
 * - Permission adjustment and feature availability updates
 * - Administrative action audit log and tracking
 * - User notification delivery status
 * - Role transition validation and security verification
 */
router.patch('/:userId/role',
 authorize(['admin']),                                      // Admin role authorization
 validate([
   param('userId').isMongoId(),                             // User ID validation
   body('role').isIn(['user', 'moderator', 'admin'])       // Role validation
 ]),
 usersController.updateUserRole                             // Handle user role update
);

/**
 * Update User Status Endpoint (Admin/Moderator)
 * PATCH /api/users/:userId/status
 * 
 * Updates user account status with moderation and administrative controls.
 * Provides account suspension and activation with comprehensive tracking.
 * 
 * Middleware Stack:
 * 1. Authentication verification (applied above)
 * 2. Admin or moderator role authorization
 * 3. User ID and status validation
 * 4. Controller logic for status update and account management
 * 
 * Features:
 * - Account status management (active, suspended)
 * - Suspension reason tracking and documentation
 * - User notification about status changes
 * - Content access control and visibility adjustment
 * - Moderation action audit logging and tracking
 * - Appeal process integration and management
 * 
 * URL Parameters:
 * - userId: MongoDB ObjectId of user to update
 * 
 * Request Body:
 * - status: New user status (active, suspended)
 * - reason: Optional reason for status change (maximum 500 characters)
 * 
 * Response:
 * - Status update confirmation with account changes
 * - Content access control and visibility adjustments
 * - User notification delivery status
 * - Moderation action audit log and documentation
 * - Appeal process information and next steps
 */
router.patch('/:userId/status',
 authorize(['admin', 'moderator']),                         // Admin/moderator authorization
 validate([
   param('userId').isMongoId(),                             // User ID validation
   body('status').isIn(['active', 'suspended']),           // Status validation
   body('reason').optional().isString().isLength({ max: 500 }) // Reason validation
 ]),
 usersController.updateUserStatus                           // Handle user status update
);

// Export configured users router for application use
module.exports = router;
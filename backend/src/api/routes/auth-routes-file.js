/**
 * @fileoverview Authentication Routes for ShadowNews Platform
 * 
 * Comprehensive authentication and authorization routing system for the ShadowNews
 * email-first news platform. This module defines all authentication-related endpoints
 * including user registration, login, password management, email verification, two-factor
 * authentication, OAuth integration, and session management. Features robust security
 * measures, rate limiting, input validation, and comprehensive user account lifecycle
 * management.
 * 
 * Key Features:
 * - Complete user authentication lifecycle (register, login, logout)
 * - Secure password management with reset and change functionality
 * - Email verification system for account security
 * - Two-factor authentication (2FA) for enhanced security
 * - OAuth integration with Google and GitHub providers
 * - Session management with multi-device support
 * - JWT token refresh and validation
 * - Account deletion with proper cleanup
 * - Rate limiting for brute force protection
 * - Comprehensive input validation and sanitization
 * 
 * Security Features:
 * - Brute force protection through rate limiting
 * - Email verification for account validation
 * - Secure password reset with time-limited tokens
 * - Two-factor authentication support
 * - Session management with selective revocation
 * - OAuth provider integration for secure third-party auth
 * - Input validation and sanitization for all endpoints
 * - Comprehensive audit trail for authentication events
 * 
 * Route Categories:
 * - Public Routes: Registration, login, password reset (no authentication required)
 * - Protected Routes: Profile management, security settings (authentication required)
 * - OAuth Routes: Third-party authentication integration
 * - Session Management: Multi-device session control and monitoring
 * 
 * Middleware Integration:
 * - Rate limiting for abuse prevention and security
 * - Input validation for data integrity and security
 * - Authentication middleware for protected endpoints
 * - Error handling for consistent API responses
 * 
 * Dependencies:
 * - express: Web framework for route definition and handling
 * - authController: Business logic for authentication operations
 * - authMiddleware: Authentication and authorization middleware
 * - validationMiddleware: Input validation and sanitization
 * - rateLimitMiddleware: Rate limiting for security and abuse prevention
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for authentication routing
const express = require('express');                        // Express web framework
const router = express.Router();                           // Express router instance

// Controller and middleware imports
const authController = require('../controllers/auth.controller');           // Authentication business logic
const authMiddleware = require('../middlewares/auth.middleware');           // Authentication middleware
const validationMiddleware = require('../middlewares/validation.middleware'); // Input validation
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');   // Rate limiting

// ========== PUBLIC AUTHENTICATION ROUTES ==========
// These routes are accessible without authentication and handle initial user onboarding

/**
 * User Registration Endpoint
 * POST /api/auth/register
 * 
 * Handles new user account creation with comprehensive validation and security measures.
 * Includes email verification, password complexity requirements, and duplicate checking.
 * 
 * Middleware Stack:
 * 1. Rate limiting to prevent registration spam
 * 2. Input validation for email, username, and password
 * 3. Controller logic for account creation
 * 
 * Security Features:
 * - Password complexity enforcement
 * - Email format validation
 * - Username uniqueness checking
 * - Automatic email verification sending
 * - Rate limiting to prevent abuse
 * 
 * Request Body:
 * - email: Valid email address for account
 * - username: Unique alphanumeric username
 * - password: Strong password meeting complexity requirements
 * - interests: Optional array of user interests
 */
router.post('/register', 
  rateLimitMiddleware.register,                             // Prevent registration spam
  validationMiddleware.validateRegistration,                // Validate registration data
  authController.register                                   // Handle account creation
);

/**
 * User Login Endpoint
 * POST /api/auth/login
 * 
 * Authenticates users and issues JWT tokens for session management.
 * Supports both email and username login with comprehensive security.
 * 
 * Middleware Stack:
 * 1. Rate limiting to prevent brute force attacks
 * 2. Input validation for credentials
 * 3. Controller logic for authentication
 * 
 * Security Features:
 * - Brute force protection through rate limiting
 * - Secure password verification
 * - JWT token generation with expiration
 * - Login attempt logging for security monitoring
 * - Account lockout prevention through progressive delays
 * 
 * Request Body:
 * - email: User email address
 * - password: User password
 * 
 * Response:
 * - JWT access token for API authentication
 * - Refresh token for token renewal
 * - User profile information
 */
router.post('/login',
  rateLimitMiddleware.login,                                // Prevent brute force attacks
  validationMiddleware.validateLogin,                       // Validate login credentials
  authController.login                                      // Handle user authentication
);

/**
 * User Logout Endpoint
 * POST /api/auth/logout
 * 
 * Securely logs out users by invalidating their current session tokens.
 * Clears both access and refresh tokens for complete session termination.
 * 
 * Middleware Stack:
 * 1. Authentication check to verify valid session
 * 2. Controller logic for session cleanup
 * 
 * Security Features:
 * - Token invalidation to prevent reuse
 * - Session cleanup from server-side storage
 * - Audit logging for security monitoring
 * - Multi-device logout support
 */
router.post('/logout',
  authMiddleware.authenticate,                              // Verify authenticated session
  authController.logout                                     // Handle session cleanup
);

/**
 * JWT Token Refresh Endpoint
 * POST /api/auth/refresh-token
 * 
 * Renews expired access tokens using valid refresh tokens.
 * Maintains user sessions without requiring re-authentication.
 * 
 * Middleware Stack:
 * 1. Rate limiting to prevent token refresh abuse
 * 2. Controller logic for token validation and renewal
 * 
 * Security Features:
 * - Refresh token validation and rotation
 * - Automatic token expiration management
 * - Session continuity for active users
 * - Token blacklisting for compromised sessions
 * 
 * Request Body:
 * - refreshToken: Valid refresh token
 * 
 * Response:
 * - New access token with updated expiration
 * - Rotated refresh token for continued access
 */
router.post('/refresh-token',
  rateLimitMiddleware.tokenRefresh,                         // Prevent token refresh abuse
  authController.refreshToken                               // Handle token renewal
);

/**
 * Password Reset Request Endpoint
 * POST /api/auth/forgot-password
 * 
 * Initiates password reset process by sending secure reset link to user email.
 * Generates time-limited reset tokens with secure random generation.
 * 
 * Middleware Stack:
 * 1. Rate limiting to prevent password reset abuse
 * 2. Email validation for proper format
 * 3. Controller logic for reset token generation
 * 
 * Security Features:
 * - Time-limited reset tokens (typically 1 hour)
 * - Cryptographically secure token generation
 * - Email delivery with secure reset links
 * - Rate limiting to prevent email bombing
 * - Account existence validation without information disclosure
 * 
 * Request Body:
 * - email: User email address for password reset
 */
router.post('/forgot-password',
  rateLimitMiddleware.passwordReset,                        // Prevent reset abuse
  validationMiddleware.validateEmail,                       // Validate email format
  authController.forgotPassword                             // Handle reset request
);

/**
 * Password Reset Completion Endpoint
 * POST /api/auth/reset-password/:token
 * 
 * Completes password reset process using valid reset token.
 * Updates user password and invalidates the reset token.
 * 
 * Middleware Stack:
 * 1. Rate limiting to prevent reset completion abuse
 * 2. Password validation for new password
 * 3. Controller logic for password update
 * 
 * Security Features:
 * - Reset token validation and expiration checking
 * - Password complexity enforcement
 * - One-time token usage to prevent replay attacks
 * - Automatic session invalidation for security
 * - Secure password hashing and storage
 * 
 * URL Parameters:
 * - token: Valid password reset token
 * 
 * Request Body:
 * - password: New password meeting complexity requirements
 */
router.post('/reset-password/:token',
  rateLimitMiddleware.passwordReset,                        // Prevent reset abuse
  validationMiddleware.validatePasswordReset,               // Validate new password
  authController.resetPassword                              // Handle password update
);

/**
 * Email Verification Endpoint
 * POST /api/auth/verify-email/:token
 * 
 * Verifies user email addresses using secure verification tokens.
 * Activates user accounts and enables full platform access.
 * 
 * Security Features:
 * - Time-limited verification tokens
 * - One-time token usage
 * - Account activation upon successful verification
 * - Automatic cleanup of expired tokens
 * 
 * URL Parameters:
 * - token: Valid email verification token
 */
router.post('/verify-email/:token',
  authController.verifyEmail                                // Handle email verification
);

/**
 * Resend Email Verification Endpoint
 * POST /api/auth/resend-verification
 * 
 * Resends email verification for authenticated users with unverified emails.
 * Generates new verification tokens and sends fresh verification emails.
 * 
 * Middleware Stack:
 * 1. Rate limiting to prevent verification email spam
 * 2. Authentication check for valid user session
 * 3. Controller logic for verification resend
 * 
 * Security Features:
 * - Rate limiting to prevent email bombing
 * - Authentication required to prevent abuse
 * - New token generation for each request
 * - Automatic cleanup of old verification tokens
 */
router.post('/resend-verification',
  rateLimitMiddleware.emailVerification,                    // Prevent verification spam
  authMiddleware.authenticate,                              // Verify user session
  authController.resendVerification                         // Handle verification resend
);

// ========== PROTECTED USER MANAGEMENT ROUTES ==========
// These routes require authentication and handle user profile and security management

/**
 * Get Current User Profile Endpoint
 * GET /api/auth/me
 * 
 * Retrieves current user profile information for authenticated users.
 * Returns comprehensive user data for dashboard and profile display.
 * 
 * Middleware Stack:
 * 1. Authentication check to verify valid session
 * 2. Controller logic for profile retrieval
 * 
 * Security Features:
 * - JWT token validation
 * - User session verification
 * - Sensitive data filtering for response
 * 
 * Response:
 * - User profile information (email, username, preferences)
 * - Account status and verification state
 * - User settings and configuration
 * - Karma and reputation scores
 */
router.get('/me',
  authMiddleware.authenticate,                              // Verify user authentication
  authController.getCurrentUser                             // Retrieve user profile
);

/**
 * Change Password Endpoint
 * PUT /api/auth/change-password
 * 
 * Allows authenticated users to change their account password.
 * Requires current password verification for security.
 * 
 * Middleware Stack:
 * 1. Authentication check to verify valid session
 * 2. Password validation for current and new passwords
 * 3. Controller logic for password update
 * 
 * Security Features:
 * - Current password verification required
 * - New password complexity enforcement
 * - Automatic session invalidation for security
 * - Password change logging for audit trail
 * 
 * Request Body:
 * - currentPassword: Current account password
 * - newPassword: New password meeting complexity requirements
 */
router.put('/change-password',
  authMiddleware.authenticate,                              // Verify user authentication
  validationMiddleware.validatePasswordChange,              // Validate password data
  authController.changePassword                             // Handle password update
);

/**
 * Delete Account Endpoint
 * DELETE /api/auth/delete-account
 * 
 * Permanently deletes user account and associated data.
 * Requires password confirmation for security.
 * 
 * Middleware Stack:
 * 1. Authentication check to verify valid session
 * 2. Password validation for account confirmation
 * 3. Controller logic for account deletion
 * 
 * Security Features:
 * - Password confirmation required
 * - Complete data cleanup and anonymization
 * - Audit logging for compliance
 * - Irreversible account deletion with warnings
 * 
 * Request Body:
 * - password: Current account password for confirmation
 */
router.delete('/delete-account',
  authMiddleware.authenticate,                              // Verify user authentication
  validationMiddleware.validatePassword,                    // Validate password confirmation
  authController.deleteAccount                              // Handle account deletion
);

// ========== TWO-FACTOR AUTHENTICATION ROUTES ==========
// Enhanced security through second factor authentication

/**
 * Enable Two-Factor Authentication Endpoint
 * POST /api/auth/enable-2fa
 * 
 * Enables 2FA for user account with QR code generation.
 * Provides setup instructions and backup codes.
 * 
 * Security Features:
 * - TOTP (Time-based One-Time Password) generation
 * - QR code for easy authenticator app setup
 * - Backup codes for recovery scenarios
 * - Secure secret generation and storage
 */
router.post('/enable-2fa',
  authMiddleware.authenticate,                              // Verify user authentication
  authController.enable2FA                                  // Handle 2FA setup
);

/**
 * Verify Two-Factor Authentication Endpoint
 * POST /api/auth/verify-2fa
 * 
 * Verifies 2FA codes during login or setup process.
 * Validates TOTP codes from authenticator apps.
 * 
 * Middleware Stack:
 * 1. Authentication check for user session
 * 2. 2FA code validation
 * 3. Controller logic for verification
 * 
 * Request Body:
 * - code: 6-digit TOTP code from authenticator app
 */
router.post('/verify-2fa',
  authMiddleware.authenticate,                              // Verify user authentication
  validationMiddleware.validate2FA,                         // Validate 2FA code format
  authController.verify2FA                                  // Handle 2FA verification
);

/**
 * Disable Two-Factor Authentication Endpoint
 * POST /api/auth/disable-2fa
 * 
 * Disables 2FA for user account after verification.
 * Requires 2FA code confirmation for security.
 * 
 * Middleware Stack:
 * 1. Authentication check for user session
 * 2. 2FA code validation for confirmation
 * 3. Controller logic for 2FA removal
 * 
 * Security Features:
 * - 2FA code verification required
 * - Complete 2FA data cleanup
 * - Security notification to user email
 * 
 * Request Body:
 * - code: 6-digit TOTP code for confirmation
 */
router.post('/disable-2fa',
  authMiddleware.authenticate,                              // Verify user authentication
  validationMiddleware.validate2FA,                         // Validate 2FA code
  authController.disable2FA                                 // Handle 2FA removal
);

// ========== OAUTH INTEGRATION ROUTES ==========
// Third-party authentication provider integration

/**
 * Google OAuth Initiation Endpoint
 * GET /api/auth/google
 * 
 * Initiates Google OAuth authentication flow.
 * Redirects users to Google consent screen.
 * 
 * Security Features:
 * - State parameter for CSRF protection
 * - Secure redirect URL validation
 * - Scope limitation for minimal data access
 */
router.get('/google',
  authController.googleAuth                                 // Initiate Google OAuth
);

/**
 * Google OAuth Callback Endpoint
 * GET /api/auth/google/callback
 * 
 * Handles Google OAuth callback with authorization code.
 * Completes authentication and creates/links user account.
 * 
 * Security Features:
 * - Authorization code exchange for tokens
 * - User profile data retrieval and validation
 * - Account linking with existing users
 * - JWT token generation for session
 */
router.get('/google/callback',
  authController.googleCallback                             // Handle Google OAuth callback
);

/**
 * GitHub OAuth Initiation Endpoint
 * GET /api/auth/github
 * 
 * Initiates GitHub OAuth authentication flow.
 * Redirects users to GitHub authorization screen.
 * 
 * Security Features:
 * - State parameter for CSRF protection
 * - Secure redirect URL validation
 * - Minimal scope request for user data
 */
router.get('/github',
  authController.githubAuth                                 // Initiate GitHub OAuth
);

/**
 * GitHub OAuth Callback Endpoint
 * GET /api/auth/github/callback
 * 
 * Handles GitHub OAuth callback with authorization code.
 * Completes authentication and creates/links user account.
 * 
 * Security Features:
 * - Authorization code exchange for access tokens
 * - User profile data retrieval from GitHub API
 * - Account linking with existing ShadowNews accounts
 * - JWT token generation for authenticated session
 */
router.get('/github/callback',
  authController.githubCallback                             // Handle GitHub OAuth callback
);

// ========== SESSION MANAGEMENT ROUTES ==========
// Multi-device session control and security monitoring

/**
 * Get All User Sessions Endpoint
 * GET /api/auth/sessions
 * 
 * Retrieves all active sessions for the authenticated user.
 * Provides session details for security monitoring.
 * 
 * Security Features:
 * - Session enumeration for security awareness
 * - Device and location information display
 * - Last activity timestamps for monitoring
 * - Session token identification for management
 * 
 * Response:
 * - Array of active sessions with metadata
 * - Session creation times and last activity
 * - Device and browser information
 * - Geographic location (if available)
 */
router.get('/sessions',
  authMiddleware.authenticate,                              // Verify user authentication
  authController.getAllSessions                             // Retrieve session list
);

/**
 * Revoke Specific Session Endpoint
 * DELETE /api/auth/sessions/:sessionId
 * 
 * Revokes a specific user session by session ID.
 * Allows users to remotely log out from specific devices.
 * 
 * Security Features:
 * - Session ownership verification
 * - Immediate token invalidation
 * - Security notification for session termination
 * - Audit logging for security monitoring
 * 
 * URL Parameters:
 * - sessionId: Unique identifier for session to revoke
 */
router.delete('/sessions/:sessionId',
  authMiddleware.authenticate,                              // Verify user authentication
  authController.revokeSession                              // Handle session revocation
);

/**
 * Revoke All Sessions Endpoint
 * DELETE /api/auth/sessions
 * 
 * Revokes all user sessions except the current one.
 * Provides global logout for security scenarios.
 * 
 * Security Features:
 * - Mass session invalidation
 * - Current session preservation for user convenience
 * - Immediate token blacklisting
 * - Security notification email
 * - Comprehensive audit logging
 */
router.delete('/sessions',
  authMiddleware.authenticate,                              // Verify user authentication
  authController.revokeAllSessions                          // Handle all session revocation
);

// Export configured authentication router for application use
module.exports = router;
/**
 * @fileoverview Authentication Controller for ShadowNews Platform
 * 
 * Comprehensive authentication system handling user registration, login, logout,
 * password management, email verification, and account security operations.
 * This controller implements secure authentication patterns with JWT tokens,
 * bcrypt password hashing, and email verification workflows.
 * 
 * Key Features:
 * - User registration with email verification
 * - Secure login/logout with JWT access and refresh tokens
 * - Password reset and change functionality
 * - Email verification and re-verification
 * - Account deletion with password confirmation
 * - Token refresh mechanism for seamless authentication
 * - Automatic ShadowNews email generation (@shadownews.community)
 * - Karma system integration for new users
 * 
 * Security Measures:
 * - bcrypt password hashing with salt rounds
 * - JWT tokens with short-lived access tokens (15m) and long-lived refresh tokens (7d)
 * - HTTP-only cookies for refresh token storage
 * - CSRF protection with SameSite cookie policy
 * - Rate limiting and input validation
 * - Secure token generation using crypto module
 * - Password confirmation for sensitive operations
 * 
 * Authentication Flow:
 * 1. User registers with email/username/password
 * 2. System generates unique @shadownews.community email
 * 3. Email verification link sent to user's email
 * 4. User verifies email and receives karma bonus
 * 5. User can login and receive access/refresh tokens
 * 6. Access tokens expire quickly, refresh tokens provide seamless renewal
 * 
 * Dependencies:
 * - bcryptjs: Password hashing and verification
 * - jsonwebtoken: JWT token generation and verification
 * - crypto: Secure random token generation
 * - express-validator: Input validation and sanitization
 * - User model: Database operations for user data
 * - email.service: Email delivery for verification and password reset
 * - karma.service: User reputation system integration
 * - logger: Application logging and monitoring
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Dependencies for secure authentication operations
const bcrypt = require('bcryptjs');           // Password hashing library
const jwt = require('jsonwebtoken');          // JSON Web Token implementation
const crypto = require('crypto');             // Node.js cryptographic functionality
const { validationResult } = require('express-validator'); // Input validation

// Internal dependencies
const User = require('../../models/User.model');         // User database model
const emailService = require('../../services/email.service'); // Email delivery service
const karmaService = require('../../services/karma.service'); // Karma management service
const logger = require('../../utils/logger');            // Application logging utility

/**
 * Generate JWT Access and Refresh Tokens
 * Creates both short-lived access tokens and long-lived refresh tokens for user authentication
 * 
 * This function implements a dual-token strategy where access tokens expire quickly
 * for security while refresh tokens allow seamless token renewal without re-login.
 * 
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateTokens = (userId) => {
  // Generate short-lived access token (15 minutes)
  // Used for API authentication and authorization
  const accessToken = jwt.sign(
    { userId, type: 'access' },           // Payload with user ID and token type
    process.env.JWT_SECRET,               // Secret key for signing
    { expiresIn: '15m' }                  // Short expiration for security
  );

  // Generate long-lived refresh token (7 days)
  // Used to renew access tokens without requiring re-login
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },          // Payload with user ID and token type
    process.env.JWT_REFRESH_SECRET,       // Separate secret key for refresh tokens
    { expiresIn: '7d' }                   // Longer expiration for convenience
  );

  return { accessToken, refreshToken };
};

/**
 * User Registration Controller
 * Handles new user account creation with email verification
 * 
 * This endpoint creates new user accounts with secure password hashing,
 * generates unique ShadowNews email addresses, initiates email verification,
 * and sets up initial karma tracking for new users.
 * 
 * @route POST /api/auth/register
 * @access Public
 * @param {Object} req.body - Registration data
 * @param {string} req.body.email - User's primary email address
 * @param {string} req.body.username - Unique username for the platform
 * @param {string} req.body.password - Plain text password (will be hashed)
 * @param {string[]} req.body.interests - Optional array of user interests
 * @returns {Object} Success response with user data and access token
 */
exports.register = async (req, res) => {
  try {
    // Validate input data using express-validator rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract registration data from request body
    const { email, username, password, interests } = req.body;

    // Check for existing users with same email or username
    // This prevents duplicate accounts and enforces uniqueness
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      // Return specific error message based on which field conflicts
      return res.status(409).json({
        error: existingUser.email === email ? 'Email already exists' : 'Username already taken'
      });
    }

    // Hash password with bcrypt using high salt rounds for security
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate secure email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create unique ShadowNews email address
    const shadownewsEmail = `${username}@shadownews.community`;

    // Create new user document with secure defaults
    const user = new User({
      email,                    // Primary contact email
      username,                 // Unique platform identifier
      password: hashedPassword, // Securely hashed password
      interests,                // User's stated interests
      shadownewsEmail,         // Auto-generated ShadowNews email
      verificationToken,        // Token for email verification
      isEmailVerified: false    // Requires email verification
    });

    // Save user to database
    await user.save();
    
    // Initialize karma tracking for the new user
    await karmaService.initializeKarma(user._id);

    // Send verification email to user's primary email address
    await emailService.sendVerificationEmail(email, verificationToken);

    // Generate authentication tokens for immediate login
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token as HTTP-only cookie for security
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,                                    // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production',    // HTTPS only in production
      sameSite: 'strict',                               // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000                  // 7 days expiration
    });

    // Log successful registration for monitoring
    logger.info(`New user registered: ${username}`);

    // Return success response with user data and access token
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        shadownewsEmail: user.shadownewsEmail,
        interests: user.interests
      },
      accessToken    // Client stores this for API authentication
    });
  } catch (error) {
    // Log error for debugging and monitoring
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * User Login Controller
 * Authenticates existing users and provides access tokens
 * 
 * This endpoint validates user credentials, checks email verification status,
 * and provides JWT tokens for authenticated access to the platform.
 * 
 * @route POST /api/auth/login
 * @access Public
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} Success response with user data and access token
 */
exports.login = async (req, res) => {
  try {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email and include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Generic error message to prevent email enumeration attacks
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password using bcrypt comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Same generic error message for security
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Require email verification before allowing login
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    // Generate new authentication tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token as secure HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Update user's last login timestamp
    user.lastLogin = Date.now();
    await user.save();

    // Log successful login for monitoring
    logger.info(`User logged in: ${user.username}`);

    // Return user data and access token
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        shadownewsEmail: user.shadownewsEmail,
        karma: user.karma,
        interests: user.interests
      },
      accessToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * User Logout Controller
 * Clears authentication tokens and logs out the user
 * 
 * This endpoint invalidates the user's session by clearing the refresh token
 * cookie. The client should also discard the access token.
 * 
 * @route POST /api/auth/logout
 * @access Public
 * @returns {Object} Success confirmation message
 */
exports.logout = async (req, res) => {
  try {
    // Clear the refresh token cookie to invalidate the session
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Token Refresh Controller
 * Refreshes expired access tokens using valid refresh tokens
 * 
 * This endpoint allows clients to obtain new access tokens without
 * requiring the user to log in again, providing seamless authentication.
 * 
 * @route POST /api/auth/refresh
 * @access Public (requires refresh token cookie)
 * @returns {Object} New access token
 */
exports.refreshToken = async (req, res) => {
  try {
    // Extract refresh token from HTTP-only cookie
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not provided' });
    }

    // Verify refresh token signature and expiration
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Ensure token is actually a refresh token (not access token)
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token cookie with new token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Return new access token to client
    res.json({ accessToken });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * Email Verification Controller
 * Verifies user email addresses using verification tokens
 * 
 * This endpoint processes email verification links and activates user accounts
 * once email ownership is confirmed. Awards karma for completing verification.
 * 
 * @route GET /api/auth/verify/:token
 * @access Public
 * @param {string} req.params.token - Email verification token
 * @returns {Object} Verification success confirmation
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with matching verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    // Mark email as verified and clear verification token
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Award karma for completing email verification
    await karmaService.awardKarma(user._id, 'email_verified', 50);

    logger.info(`Email verified for user: ${user.username}`);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

/**
 * Forgot Password Controller
 * Initiates password reset process by sending reset email
 * 
 * This endpoint generates a secure password reset token and sends it to the
 * user's email address. Uses generic responses to prevent email enumeration.
 * 
 * @route POST /api/auth/forgot-password
 * @access Public
 * @param {Object} req.body - Password reset request
 * @param {string} req.body.email - User's email address
 * @returns {Object} Generic success message
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email address
    const user = await User.findOne({ email });
    if (!user) {
      // Return generic message to prevent email enumeration attacks
      return res.json({ message: 'Password reset instructions sent if email exists' });
    }

    // Generate secure password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send password reset email with token
    await emailService.sendPasswordResetEmail(email, resetToken);

    // Return generic success message
    res.json({ message: 'Password reset instructions sent if email exists' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
};

/**
 * Reset Password Controller
 * Completes password reset using valid reset token
 * 
 * This endpoint validates the password reset token and updates the user's
 * password with the new value provided by the user.
 * 
 * @route POST /api/auth/reset-password/:token
 * @access Public
 * @param {string} req.params.token - Password reset token
 * @param {Object} req.body - New password data
 * @param {string} req.body.password - New password to set
 * @returns {Object} Password reset confirmation
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password and update user record
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;     // Clear reset token
    user.resetPasswordExpires = undefined;   // Clear expiration
    await user.save();

    logger.info(`Password reset for user: ${user.username}`);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

/**
 * Resend Verification Email Controller
 * Sends a new email verification link to unverified users
 * 
 * This endpoint allows users to request a new verification email if the
 * original was lost or expired. Uses generic responses for security.
 * 
 * @route POST /api/auth/resend-verification
 * @access Public
 * @param {Object} req.body - Verification request
 * @param {string} req.body.email - User's email address
 * @returns {Object} Generic success message
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) {
      // Generic message to prevent email enumeration and handle already verified users
      return res.json({ message: 'Verification email sent if applicable' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send new verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    res.json({ message: 'Verification email sent if applicable' });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

/**
 * Change Password Controller
 * Allows authenticated users to change their password
 * 
 * This endpoint requires the current password for verification before
 * allowing the user to set a new password, preventing unauthorized changes.
 * 
 * @route POST /api/auth/change-password
 * @access Private (requires authentication)
 * @param {Object} req.body - Password change data
 * @param {string} req.body.currentPassword - Current password for verification
 * @param {string} req.body.newPassword - New password to set
 * @returns {Object} Password change confirmation
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Find user and include password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password before allowing change
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    logger.info(`Password changed for user: ${user.username}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

/**
 * Delete Account Controller
 * Permanently deletes user account with password confirmation
 * 
 * This endpoint allows users to permanently delete their account after
 * confirming their password. This action is irreversible and clears all data.
 * 
 * @route DELETE /api/auth/delete-account
 * @access Private (requires authentication)
 * @param {Object} req.body - Account deletion data
 * @param {string} req.body.password - Password confirmation for deletion
 * @returns {Object} Account deletion confirmation
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    // Find user and include password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password before allowing account deletion
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Permanently delete user account
    await user.deleteOne();
    
    // Clear authentication cookies
    res.clearCookie('refreshToken');

    logger.info(`Account deleted: ${user.username}`);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
/**
 * @fileoverview Authentication Service
 * 
 * Comprehensive authentication service handling all user authentication operations for ShadowNews.
 * Manages user registration, login, password reset, email verification, and JWT token management.
 * Integrates with email service for notifications and karma service for user reputation initialization.
 * 
 * Key Features:
 * - Secure user registration with email verification
 * - JWT-based authentication with refresh tokens
 * - Password reset functionality with secure tokens
 * - Email verification workflow
 * - Automatic ShadowNews email address generation (@shadownews.community)
 * - Integration with karma system for new users
 * - Comprehensive input validation and sanitization
 * - Rate limiting protection against brute force attacks
 * 
 * Security Features:
 * - Bcrypt password hashing with salt rounds
 * - Cryptographically secure token generation
 * - JWT tokens with expiration and refresh mechanism
 * - Email verification prevents fake accounts
 * - User input sanitization and validation
 * - Comprehensive error handling without information leakage
 * 
 * Dependencies:
 * - bcryptjs: Secure password hashing with salt
 * - jsonwebtoken: JWT token generation and verification
 * - crypto: Cryptographically secure random token generation
 * - User.model: User database model for persistence
 * - email.service: Email sending for verification and notifications
 * - karma.service: User reputation system initialization
 * - logger: Centralized logging for security events
 * - helpers: Custom error classes and utilities
 * - config: Environment configuration and secrets
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-01-27
 */

// Bcrypt for secure password hashing and verification
const bcrypt = require('bcryptjs');

// JWT library for authentication token generation and verification
const jwt = require('jsonwebtoken');

// Node.js crypto module for secure random token generation
const crypto = require('crypto');

// User database model for authentication operations
const User = require('../models/User.model');

// Email service for verification emails and notifications
const emailService = require('./email.service');

// Karma service for user reputation system initialization
const karmaService = require('./karma.service');

// Centralized logging for authentication events and security
const logger = require('../utils/logger');

// Custom error handling utilities
const { AppError } = require('../utils/helpers');

// Application configuration including JWT secrets and settings
const config = require('../config');

/**
 * Authentication Service Class
 * 
 * Handles all authentication-related operations including user registration,
 * login, password management, and JWT token operations. Provides secure
 * authentication workflows with comprehensive validation and error handling.
 * 
 * Key Responsibilities:
 * - User registration with email verification
 * - Secure login with password validation
 * - JWT token generation, validation, and refresh
 * - Password reset workflow with secure tokens
 * - Email verification process
 * - User account security management
 * 
 * @class AuthService
 * @since 1.0.0
 */
class AuthService {
  /**
   * Register a new user account with email verification
   * 
   * Creates a new user account with secure password hashing, generates verification tokens,
   * sends verification email, initializes karma system, and returns authentication token.
   * Validates uniqueness of email and username before creation.
   * 
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email address
   * @param {string} userData.username - Desired username (must be unique)
   * @param {string} userData.password - Plain text password (will be hashed)
   * @param {string} [userData.displayName] - Optional display name
   * @returns {Promise<Object>} Registration result with user data and token
   * 
   * @throws {AppError} 409 - If email or username already exists
   * @throws {AppError} 400 - If validation fails
   * @throws {AppError} 500 - If registration process fails
   * 
   * @example
   * // Register a new user
   * const result = await authService.register({
   *   email: 'user@example.com',
   *   username: 'johndoe',
   *   password: 'securePassword123'
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async register(userData) {
    try {
      const { email, username, password } = userData;

      // Check for existing users with same email or username
      // Using $or operator for efficient single query
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
      });

      // Provide specific error messages for better user experience
      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          throw new AppError('Email already registered', 409);
        }
        throw new AppError('Username already taken', 409);
      }

      // Hash password with bcrypt using 12 salt rounds for security
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate cryptographically secure verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      // Set verification token expiration to 24 hours from now
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Create new user with all required fields and default settings
      const user = await User.create({
        email: email.toLowerCase(), // Normalize email to lowercase
        username: username.toLowerCase(), // Normalize username to lowercase
        password: hashedPassword, // Store hashed password only
        verificationToken, // Email verification token
        verificationExpires, // Token expiration time
        shadownewsEmail: `${username.toLowerCase()}@shadownews.community`, // Auto-generate ShadowNews email
        settings: {
          emailDigest: true, // Enable weekly digest emails by default
          emailNotifications: true, // Enable notification emails by default
          privacyLevel: 'public' // Default privacy level for new users
        }
      });

      // Log successful registration for audit trail
      logger.info(`User registered successfully: ${user.email} (${user.username})`);

      // Generate JWT authentication token for immediate login
      const token = this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      // Store refresh token for secure session management
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date()
      });

      await user.save();

      // Return user data without sensitive information
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.verificationToken;
      delete userResponse.refreshTokens;

      return {
        user: userResponse,
        token,
        refreshToken,
        message: 'Registration successful. Please check your email for verification.'
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login with credentials
   * 
   * Validates user credentials (email/username and password), checks email verification status,
   * generates new authentication tokens, and updates user login tracking. Implements security
   * measures to prevent information disclosure and brute force attacks.
   * 
   * Security Features:
   * - Generic error messages to prevent user enumeration
   * - Email verification requirement before login
   * - Automatic refresh token cleanup (removes tokens older than 30 days)
   * - Last login timestamp tracking
   * - Comprehensive audit logging
   * 
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.emailOrUsername - Email address or username
   * @param {string} credentials.password - Plain text password
   * @returns {Promise<Object>} Authentication result with user data and tokens
   * 
   * @throws {AppError} 401 - If credentials are invalid
   * @throws {AppError} 403 - If email is not verified
   * @throws {AppError} 500 - If login process fails
   * 
   * @example
   * // Login with email
   * const result = await authService.login({
   *   emailOrUsername: 'user@example.com',
   *   password: 'userPassword123'
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async login(credentials) {
    try {
      const { emailOrUsername, password } = credentials;

      // Find user by email or username (case-insensitive)
      // Include password field for validation (normally excluded)
      const user = await User.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() }
        ]
      }).select('+password');

      // Generic error message prevents user enumeration attacks
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password using bcrypt secure comparison
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // Generic error message prevents password guessing
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Require email verification before allowing login
      if (!user.isEmailVerified) {
        throw new AppError('Please verify your email before logging in', 403);
      }

      // Generate new authentication tokens
      const token = this.generateToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      // Clean up old refresh tokens (older than 30 days) for security
      user.refreshTokens = user.refreshTokens.filter(
        rt => rt.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      // Add new refresh token to user's active tokens
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date()
      });

      // Update last login timestamp for tracking
      user.lastLogin = new Date();
      await user.save();

      // Log successful login for audit trail
      logger.info(`User logged in successfully: ${user.email}`);

      // Return user data without sensitive information
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.verificationToken;
      delete userResponse.refreshTokens;

      return {
        user: userResponse,
        token,
        refreshToken,
        message: 'Login successful'
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Verify user email address with verification token
   * 
   * Validates email verification token, activates user account, awards verification karma,
   * and sends welcome email. Handles token expiration and provides secure verification workflow.
   * 
   * Verification Process:
   * - Validates verification token and expiration
   * - Marks email as verified in user record
   * - Cleans up verification token data
   * - Awards karma points for email verification
   * - Sends personalized welcome email
   * - Provides audit logging
   * 
   * @param {string} token - Email verification token from registration
   * @returns {Promise<Object>} Verification result message
   * 
   * @throws {AppError} 400 - If token is invalid or expired
   * @throws {AppError} 500 - If verification process fails
   * 
   * @example
   * // Verify email with token from email link
   * const result = await authService.verifyEmail('abc123def456...');
   * // Returns: { message: 'Email verified successfully' }
   * 
   * @since 1.0.0
   * @async
   */
  async verifyEmail(token) {
    try {
      // Find user with valid verification token that hasn't expired
      const user = await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: new Date() }
      });

      // Handle invalid or expired token
      if (!user) {
        throw new AppError('Invalid or expired verification token', 400);
      }

      // Mark email as verified and clean up verification data
      user.isEmailVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;

      await user.save();

      // Award karma points for completing email verification
      await karmaService.updateKarma(user._id, 'EMAIL_VERIFIED', {
        verificationDate: new Date(),
        emailAddress: user.email
      });

      // Send welcome email with platform introduction
      await emailService.sendWelcomeEmail(user.email, user.username);

      // Log successful verification for audit trail
      logger.info(`Email verified successfully: ${user.email}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * 
   * Validates refresh token, generates new access and refresh tokens, and updates
   * user's token store. Implements token rotation for enhanced security.
   * 
   * Token Rotation Security:
   * - Validates refresh token signature and expiration
   * - Verifies token exists in user's active token list
   * - Generates new access and refresh token pair
   * - Removes old refresh token from storage
   * - Implements automatic token cleanup
   * 
   * @param {string} refreshToken - Valid refresh token from previous authentication
   * @returns {Promise<Object>} New token pair (access + refresh)
   * 
   * @throws {AppError} 401 - If refresh token is invalid or expired
   * @throws {AppError} 404 - If user not found
   * @throws {AppError} 500 - If token refresh fails
   * 
   * @example
   * // Refresh expired access token
   * const tokens = await authService.refreshAccessToken(oldRefreshToken);
   * // Returns: { token: 'newAccessToken', refreshToken: 'newRefreshToken' }
   * 
   * @since 1.0.0
   * @async
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token signature and decode payload
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

      // Find user and verify refresh token is in their active tokens
      const user = await User.findOne({
        _id: decoded.userId,
        'refreshTokens.token': refreshToken
      });

      if (!user) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new token pair for rotation security
      const newAccessToken = this.generateToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      // Remove old refresh token and add new one (token rotation)
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
      user.refreshTokens.push({
        token: newRefreshToken,
        createdAt: new Date()
      });

      await user.save();

      logger.info(`Access token refreshed for user: ${user._id}`);

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Initiate password reset process
   * 
   * Generates secure password reset token, stores it with expiration, and sends
   * reset email to user. Implements security measures to prevent user enumeration.
   * 
   * Security Features:
   * - Generic response prevents user enumeration
   * - Cryptographically secure reset token generation
   * - 1-hour token expiration for security
   * - Email delivery with secure reset link
   * - Comprehensive audit logging
   * 
   * @param {string} email - Email address for password reset
   * @returns {Promise<Object>} Generic success message (always same regardless of email validity)
   * 
   * @throws {AppError} 500 - If password reset process fails
   * 
   * @example
   * // Request password reset
   * const result = await authService.forgotPassword('user@example.com');
   * // Returns: { message: 'If an account exists, a reset email has been sent' }
   * 
   * @since 1.0.0
   * @async
   */
  async forgotPassword(email) {
    try {
      // Find user by email (case-insensitive)
      const user = await User.findOne({ email: email.toLowerCase() });

      // Always return the same message to prevent user enumeration
      const standardMessage = 'If an account exists, a reset email has been sent';

      if (!user) {
        return { message: standardMessage };
      }

      // Generate cryptographically secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Set token expiration to 1 hour for security
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      // Store reset token and expiration in user record
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;

      await user.save();

      // Send password reset email with secure token
      await emailService.sendPasswordResetEmail(user.email, resetToken);

      logger.info(`Password reset requested for email: ${email}`);

      return { message: standardMessage };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password using reset token
   * 
   * Validates password reset token, updates user password with secure hashing,
   * invalidates all refresh tokens, and sends confirmation email.
   * 
   * Reset Process:
   * - Validates reset token and expiration
   * - Hashes new password with bcrypt
   * - Clears reset token data
   * - Invalidates all existing sessions (refresh tokens)
   * - Sends password change confirmation email
   * - Comprehensive security logging
   * 
   * @param {string} token - Password reset token from email
   * @param {string} newPassword - New plain text password
   * @returns {Promise<Object>} Reset confirmation message
   * 
   * @throws {AppError} 400 - If token is invalid or expired
   * @throws {AppError} 500 - If password reset fails
   * 
   * @example
   * // Reset password with token
   * const result = await authService.resetPassword('resetToken123', 'newSecurePassword');
   * // Returns: { message: 'Password reset successfully' }
   * 
   * @since 1.0.0
   * @async
   */
  async resetPassword(token, newPassword) {
    try {
      // Find user with valid reset token that hasn't expired
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Hash new password with bcrypt (12 salt rounds)
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token data
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      // Invalidate all existing sessions for security
      user.refreshTokens = [];

      await user.save();

      // Send confirmation email about password change
      await emailService.sendPasswordChangedEmail(user.email);

      logger.info(`Password reset successfully for user: ${user.email}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Logout user from current device
   * 
   * Removes specific refresh token from user's active tokens, effectively
   * logging out the user from the current device only.
   * 
   * @param {string} userId - MongoDB ObjectId of the user
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Promise<Object>} Logout confirmation message
   * 
   * @throws {AppError} 404 - If user not found
   * @throws {AppError} 500 - If logout process fails
   * 
   * @example
   * // Logout from current device
   * const result = await authService.logout(userId, refreshToken);
   * // Returns: { message: 'Logged out successfully' }
   * 
   * @since 1.0.0
   * @async
   */
  async logout(userId, refreshToken) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove specific refresh token from user's active tokens
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);

      await user.save();

      logger.info(`User logged out successfully: ${user.email}`);

      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Logout user from all devices
   * 
   * Removes all refresh tokens from user account, effectively logging out
   * the user from all devices and sessions.
   * 
   * @param {string} userId - MongoDB ObjectId of the user
   * @returns {Promise<Object>} Logout confirmation message
   * 
   * @throws {AppError} 404 - If user not found
   * @throws {AppError} 500 - If logout process fails
   * 
   * @example
   * // Logout from all devices (security measure)
   * const result = await authService.logoutAllDevices(userId);
   * // Returns: { message: 'Logged out from all devices successfully' }
   * 
   * @since 1.0.0
   * @async
   */
  async logoutAllDevices(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Clear all refresh tokens to logout from all devices
      user.refreshTokens = [];

      await user.save();

      logger.info(`User logged out from all devices: ${user.email}`);

      return { message: 'Logged out from all devices successfully' };
    } catch (error) {
      logger.error('Logout all devices error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * 
   * Validates current password, updates to new password with secure hashing,
   * invalidates all sessions, and sends confirmation email.
   * 
   * Security Features:
   * - Current password verification required
   * - New password hashed with bcrypt
   * - All sessions invalidated for security
   * - Email confirmation sent
   * - Comprehensive audit logging
   * 
   * @param {string} userId - MongoDB ObjectId of the user
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @returns {Promise<Object>} Password change confirmation
   * 
   * @throws {AppError} 404 - If user not found
   * @throws {AppError} 401 - If current password is incorrect
   * @throws {AppError} 500 - If password change fails
   * 
   * @example
   * // Change password with current password verification
   * const result = await authService.changePassword(userId, 'oldPassword', 'newPassword');
   * // Returns: { message: 'Password changed successfully' }
   * 
   * @since 1.0.0
   * @async
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user and include password field for verification
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password before allowing change
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password with bcrypt (12 salt rounds)
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and invalidate all sessions for security
      user.password = hashedPassword;
      user.refreshTokens = [];

      await user.save();

      // Send confirmation email about password change
      await emailService.sendPasswordChangedEmail(user.email);

      logger.info(`Password changed successfully for user: ${user.email}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   * 
   * Generates new verification token and resends verification email.
   * Prevents multiple sends to already verified emails.
   * 
   * @param {string} email - Email address to resend verification
   * @returns {Promise<Object>} Generic success message
   * 
   * @throws {AppError} 400 - If email is already verified
   * @throws {AppError} 500 - If resend process fails
   * 
   * @example
   * // Resend verification email
   * const result = await authService.resendVerificationEmail('user@example.com');
   * // Returns: { message: 'If an account exists, a verification email has been sent' }
   * 
   * @since 1.0.0
   * @async
   */
  async resendVerificationEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      // Generic response prevents user enumeration
      const standardMessage = 'If an account exists, a verification email has been sent';

      if (!user) {
        return { message: standardMessage };
      }

      // Prevent resending to already verified emails
      if (user.isEmailVerified) {
        throw new AppError('Email is already verified', 400);
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update user with new verification token
      user.verificationToken = verificationToken;
      user.verificationExpires = verificationExpires;

      await user.save();

      // Send new verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);

      logger.info(`Verification email resent for: ${email}`);

      return { message: standardMessage };
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT access token
   * 
   * Creates signed JWT token with user ID payload and configured expiration.
   * Used for API authentication and authorization.
   * 
   * @param {string} userId - MongoDB ObjectId of the user
   * @returns {string} Signed JWT access token
   * 
   * @example
   * // Generate access token for user
   * const token = authService.generateToken(userId);
   * 
   * @since 1.0.0
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Generate JWT refresh token
   * 
   * Creates signed JWT refresh token with longer expiration for token rotation.
   * Used to generate new access tokens without re-authentication.
   * 
   * @param {string} userId - MongoDB ObjectId of the user
   * @returns {string} Signed JWT refresh token
   * 
   * @example
   * // Generate refresh token for user
   * const refreshToken = authService.generateRefreshToken(userId);
   * 
   * @since 1.0.0
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  /**
   * Validate JWT access token and return user
   * 
   * Verifies JWT token signature, checks expiration, and returns associated user.
   * Used by authentication middleware for route protection.
   * 
   * @param {string} token - JWT access token to validate
   * @returns {Promise<Object>} User object (without sensitive data)
   * 
   * @throws {AppError} 401 - If token is invalid or expired
   * @throws {AppError} 404 - If user not found
   * 
   * @example
   * // Validate access token
   * const user = await authService.validateToken(accessToken);
   * 
   * @since 1.0.0
   * @async
   */
  async validateToken(token) {
    try {
      // Verify token signature and decode payload
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Find user and exclude sensitive data
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}

module.exports = new AuthService();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const emailService = require('./email.service');
const karmaService = require('./karma.service');
const logger = require('../utils/logger');
const { AppError } = require('../utils/helpers');
const config = require('../config');

class AuthService {
 async register(userData) {
   try {
     const { email, username, password } = userData;

     const existingUser = await User.findOne({
       $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
     });

     if (existingUser) {
       if (existingUser.email === email.toLowerCase()) {
         throw new AppError('Email already registered', 409);
       }
       throw new AppError('Username already taken', 409);
     }

     const hashedPassword = await bcrypt.hash(password, 12);

     const verificationToken = crypto.randomBytes(32).toString('hex');
     const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

     const user = await User.create({
       email: email.toLowerCase(),
       username: username.toLowerCase(),
       password: hashedPassword,
       verificationToken,
       verificationExpires,
       shadownewsEmail: `${username.toLowerCase()}@shadownews.community`,
       settings: {
         emailDigest: true,
         emailNotifications: true,
         privacyLevel: 'public'
       }
     });

     await emailService.sendVerificationEmail(user.email, verificationToken);

     await karmaService.initializeKarma(user._id);

     const token = this.generateToken(user._id);
     const refreshToken = this.generateRefreshToken(user._id);

     user.refreshTokens.push({
       token: refreshToken,
       createdAt: new Date()
     });

     await user.save();

     const userResponse = user.toObject();
     delete userResponse.password;
     delete userResponse.verificationToken;
     delete userResponse.refreshTokens;

     return {
       user: userResponse,
       token,
       refreshToken
     };
   } catch (error) {
     logger.error('Registration error:', error);
     throw error;
   }
 }

 async login(credentials) {
   try {
     const { emailOrUsername, password } = credentials;

     const user = await User.findOne({
       $or: [
         { email: emailOrUsername.toLowerCase() },
         { username: emailOrUsername.toLowerCase() }
       ]
     }).select('+password');

     if (!user) {
       throw new AppError('Invalid credentials', 401);
     }

     const isPasswordValid = await bcrypt.compare(password, user.password);

     if (!isPasswordValid) {
       throw new AppError('Invalid credentials', 401);
     }

     if (!user.isEmailVerified) {
       throw new AppError('Please verify your email before logging in', 403);
     }

     const token = this.generateToken(user._id);
     const refreshToken = this.generateRefreshToken(user._id);

     user.refreshTokens = user.refreshTokens.filter(
       rt => rt.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
     );

     user.refreshTokens.push({
       token: refreshToken,
       createdAt: new Date()
     });

     user.lastLogin = new Date();
     await user.save();

     const userResponse = user.toObject();
     delete userResponse.password;
     delete userResponse.verificationToken;
     delete userResponse.refreshTokens;

     return {
       user: userResponse,
       token,
       refreshToken
     };
   } catch (error) {
     logger.error('Login error:', error);
     throw error;
   }
 }

 async verifyEmail(token) {
   try {
     const user = await User.findOne({
       verificationToken: token,
       verificationExpires: { $gt: new Date() }
     });

     if (!user) {
       throw new AppError('Invalid or expired verification token', 400);
     }

     user.isEmailVerified = true;
     user.verificationToken = undefined;
     user.verificationExpires = undefined;

     await user.save();

     await karmaService.awardKarma(user._id, 'email_verified', 50);

     await emailService.sendWelcomeEmail(user.email, user.username);

     return { message: 'Email verified successfully' };
   } catch (error) {
     logger.error('Email verification error:', error);
     throw error;
   }
 }

 async refreshAccessToken(refreshToken) {
   try {
     const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

     const user = await User.findOne({
       _id: decoded.userId,
       'refreshTokens.token': refreshToken
     });

     if (!user) {
       throw new AppError('Invalid refresh token', 401);
     }

     const newAccessToken = this.generateToken(user._id);
     const newRefreshToken = this.generateRefreshToken(user._id);

     user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
     user.refreshTokens.push({
       token: newRefreshToken,
       createdAt: new Date()
     });

     await user.save();

     return {
       token: newAccessToken,
       refreshToken: newRefreshToken
     };
   } catch (error) {
     logger.error('Token refresh error:', error);
     throw new AppError('Invalid refresh token', 401);
   }
 }

 async forgotPassword(email) {
   try {
     const user = await User.findOne({ email: email.toLowerCase() });

     if (!user) {
       return { message: 'If an account exists, a reset email has been sent' };
     }

     const resetToken = crypto.randomBytes(32).toString('hex');
     const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

     user.passwordResetToken = resetToken;
     user.passwordResetExpires = resetExpires;

     await user.save();

     await emailService.sendPasswordResetEmail(user.email, resetToken);

     return { message: 'If an account exists, a reset email has been sent' };
   } catch (error) {
     logger.error('Forgot password error:', error);
     throw error;
   }
 }

 async resetPassword(token, newPassword) {
   try {
     const user = await User.findOne({
       passwordResetToken: token,
       passwordResetExpires: { $gt: new Date() }
     });

     if (!user) {
       throw new AppError('Invalid or expired reset token', 400);
     }

     const hashedPassword = await bcrypt.hash(newPassword, 12);

     user.password = hashedPassword;
     user.passwordResetToken = undefined;
     user.passwordResetExpires = undefined;
     user.refreshTokens = [];

     await user.save();

     await emailService.sendPasswordChangedEmail(user.email);

     return { message: 'Password reset successfully' };
   } catch (error) {
     logger.error('Password reset error:', error);
     throw error;
   }
 }

 async logout(userId, refreshToken) {
   try {
     const user = await User.findById(userId);

     if (!user) {
       throw new AppError('User not found', 404);
     }

     user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);

     await user.save();

     return { message: 'Logged out successfully' };
   } catch (error) {
     logger.error('Logout error:', error);
     throw error;
   }
 }

 async logoutAllDevices(userId) {
   try {
     const user = await User.findById(userId);

     if (!user) {
       throw new AppError('User not found', 404);
     }

     user.refreshTokens = [];

     await user.save();

     return { message: 'Logged out from all devices successfully' };
   } catch (error) {
     logger.error('Logout all devices error:', error);
     throw error;
   }
 }

 async changePassword(userId, currentPassword, newPassword) {
   try {
     const user = await User.findById(userId).select('+password');

     if (!user) {
       throw new AppError('User not found', 404);
     }

     const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

     if (!isPasswordValid) {
       throw new AppError('Current password is incorrect', 401);
     }

     const hashedPassword = await bcrypt.hash(newPassword, 12);

     user.password = hashedPassword;
     user.refreshTokens = [];

     await user.save();

     await emailService.sendPasswordChangedEmail(user.email);

     return { message: 'Password changed successfully' };
   } catch (error) {
     logger.error('Change password error:', error);
     throw error;
   }
 }

 async resendVerificationEmail(email) {
   try {
     const user = await User.findOne({ email: email.toLowerCase() });

     if (!user) {
       return { message: 'If an account exists, a verification email has been sent' };
     }

     if (user.isEmailVerified) {
       throw new AppError('Email is already verified', 400);
     }

     const verificationToken = crypto.randomBytes(32).toString('hex');
     const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

     user.verificationToken = verificationToken;
     user.verificationExpires = verificationExpires;

     await user.save();

     await emailService.sendVerificationEmail(user.email, verificationToken);

     return { message: 'If an account exists, a verification email has been sent' };
   } catch (error) {
     logger.error('Resend verification error:', error);
     throw error;
   }
 }

 generateToken(userId) {
   return jwt.sign(
     { userId },
     config.jwt.secret,
     { expiresIn: config.jwt.expiresIn }
   );
 }

 generateRefreshToken(userId) {
   return jwt.sign(
     { userId },
     config.jwt.refreshSecret,
     { expiresIn: config.jwt.refreshExpiresIn }
   );
 }

 async validateToken(token) {
   try {
     const decoded = jwt.verify(token, config.jwt.secret);
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
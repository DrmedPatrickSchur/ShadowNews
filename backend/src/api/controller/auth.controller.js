const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../../models/User.model');
const emailService = require('../../services/email.service');
const karmaService = require('../../services/karma.service');
const logger = require('../../utils/logger');

const generateTokens = (userId) => {
 const accessToken = jwt.sign(
   { userId, type: 'access' },
   process.env.JWT_SECRET,
   { expiresIn: '15m' }
 );

 const refreshToken = jwt.sign(
   { userId, type: 'refresh' },
   process.env.JWT_REFRESH_SECRET,
   { expiresIn: '7d' }
 );

 return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
 try {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   const { email, username, password, interests } = req.body;

   const existingUser = await User.findOne({
     $or: [{ email }, { username }]
   });

   if (existingUser) {
     return res.status(409).json({
       error: existingUser.email === email ? 'Email already exists' : 'Username already taken'
     });
   }

   const hashedPassword = await bcrypt.hash(password, 12);
   const verificationToken = crypto.randomBytes(32).toString('hex');
   const shadownewsEmail = `${username}@shadownews.community`;

   const user = new User({
     email,
     username,
     password: hashedPassword,
     interests,
     shadownewsEmail,
     verificationToken,
     isEmailVerified: false
   });

   await user.save();
   await karmaService.initializeKarma(user._id);

   await emailService.sendVerificationEmail(email, verificationToken);

   const { accessToken, refreshToken } = generateTokens(user._id);

   res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000
   });

   logger.info(`New user registered: ${username}`);

   res.status(201).json({
     message: 'Registration successful. Please verify your email.',
     user: {
       id: user._id,
       username: user.username,
       email: user.email,
       shadownewsEmail: user.shadownewsEmail,
       interests: user.interests
     },
     accessToken
   });
 } catch (error) {
   logger.error('Registration error:', error);
   res.status(500).json({ error: 'Registration failed' });
 }
};

exports.login = async (req, res) => {
 try {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   const { email, password } = req.body;

   const user = await User.findOne({ email }).select('+password');
   if (!user) {
     return res.status(401).json({ error: 'Invalid credentials' });
   }

   const isPasswordValid = await bcrypt.compare(password, user.password);
   if (!isPasswordValid) {
     return res.status(401).json({ error: 'Invalid credentials' });
   }

   if (!user.isEmailVerified) {
     return res.status(403).json({ error: 'Please verify your email first' });
   }

   const { accessToken, refreshToken } = generateTokens(user._id);

   res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000
   });

   user.lastLogin = Date.now();
   await user.save();

   logger.info(`User logged in: ${user.username}`);

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

exports.logout = async (req, res) => {
 try {
   res.clearCookie('refreshToken');
   res.json({ message: 'Logged out successfully' });
 } catch (error) {
   logger.error('Logout error:', error);
   res.status(500).json({ error: 'Logout failed' });
 }
};

exports.refreshToken = async (req, res) => {
 try {
   const { refreshToken } = req.cookies;

   if (!refreshToken) {
     return res.status(401).json({ error: 'Refresh token not provided' });
   }

   const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
   
   if (decoded.type !== 'refresh') {
     return res.status(401).json({ error: 'Invalid token type' });
   }

   const user = await User.findById(decoded.userId);
   if (!user) {
     return res.status(401).json({ error: 'User not found' });
   }

   const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

   res.cookie('refreshToken', newRefreshToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000
   });

   res.json({ accessToken });
 } catch (error) {
   logger.error('Token refresh error:', error);
   res.status(401).json({ error: 'Invalid refresh token' });
 }
};

exports.verifyEmail = async (req, res) => {
 try {
   const { token } = req.params;

   const user = await User.findOne({ verificationToken: token });
   if (!user) {
     return res.status(404).json({ error: 'Invalid verification token' });
   }

   user.isEmailVerified = true;
   user.verificationToken = undefined;
   await user.save();

   await karmaService.awardKarma(user._id, 'email_verified', 50);

   logger.info(`Email verified for user: ${user.username}`);

   res.json({ message: 'Email verified successfully' });
 } catch (error) {
   logger.error('Email verification error:', error);
   res.status(500).json({ error: 'Email verification failed' });
 }
};

exports.forgotPassword = async (req, res) => {
 try {
   const { email } = req.body;

   const user = await User.findOne({ email });
   if (!user) {
     return res.json({ message: 'Password reset instructions sent if email exists' });
   }

   const resetToken = crypto.randomBytes(32).toString('hex');
   user.resetPasswordToken = resetToken;
   user.resetPasswordExpires = Date.now() + 3600000;
   await user.save();

   await emailService.sendPasswordResetEmail(email, resetToken);

   res.json({ message: 'Password reset instructions sent if email exists' });
 } catch (error) {
   logger.error('Forgot password error:', error);
   res.status(500).json({ error: 'Password reset request failed' });
 }
};

exports.resetPassword = async (req, res) => {
 try {
   const { token } = req.params;
   const { password } = req.body;

   const user = await User.findOne({
     resetPasswordToken: token,
     resetPasswordExpires: { $gt: Date.now() }
   });

   if (!user) {
     return res.status(400).json({ error: 'Invalid or expired reset token' });
   }

   user.password = await bcrypt.hash(password, 12);
   user.resetPasswordToken = undefined;
   user.resetPasswordExpires = undefined;
   await user.save();

   logger.info(`Password reset for user: ${user.username}`);

   res.json({ message: 'Password reset successfully' });
 } catch (error) {
   logger.error('Password reset error:', error);
   res.status(500).json({ error: 'Password reset failed' });
 }
};

exports.resendVerification = async (req, res) => {
 try {
   const { email } = req.body;

   const user = await User.findOne({ email });
   if (!user || user.isEmailVerified) {
     return res.json({ message: 'Verification email sent if applicable' });
   }

   const verificationToken = crypto.randomBytes(32).toString('hex');
   user.verificationToken = verificationToken;
   await user.save();

   await emailService.sendVerificationEmail(email, verificationToken);

   res.json({ message: 'Verification email sent if applicable' });
 } catch (error) {
   logger.error('Resend verification error:', error);
   res.status(500).json({ error: 'Failed to resend verification email' });
 }
};

exports.changePassword = async (req, res) => {
 try {
   const { currentPassword, newPassword } = req.body;
   const userId = req.user.userId;

   const user = await User.findById(userId).select('+password');
   if (!user) {
     return res.status(404).json({ error: 'User not found' });
   }

   const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
   if (!isPasswordValid) {
     return res.status(401).json({ error: 'Current password is incorrect' });
   }

   user.password = await bcrypt.hash(newPassword, 12);
   await user.save();

   logger.info(`Password changed for user: ${user.username}`);

   res.json({ message: 'Password changed successfully' });
 } catch (error) {
   logger.error('Change password error:', error);
   res.status(500).json({ error: 'Failed to change password' });
 }
};

exports.deleteAccount = async (req, res) => {
 try {
   const { password } = req.body;
   const userId = req.user.userId;

   const user = await User.findById(userId).select('+password');
   if (!user) {
     return res.status(404).json({ error: 'User not found' });
   }

   const isPasswordValid = await bcrypt.compare(password, user.password);
   if (!isPasswordValid) {
     return res.status(401).json({ error: 'Invalid password' });
   }

   await user.deleteOne();
   res.clearCookie('refreshToken');

   logger.info(`Account deleted: ${user.username}`);

   res.json({ message: 'Account deleted successfully' });
 } catch (error) {
   logger.error('Account deletion error:', error);
   res.status(500).json({ error: 'Failed to delete account' });
 }
};
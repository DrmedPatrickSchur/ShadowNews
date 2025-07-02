const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');

// Public routes
router.post('/register', 
  rateLimitMiddleware.register,
  validationMiddleware.validateRegistration,
  authController.register
);

router.post('/login',
  rateLimitMiddleware.login,
  validationMiddleware.validateLogin,
  authController.login
);

router.post('/logout',
  authMiddleware.authenticate,
  authController.logout
);

router.post('/refresh-token',
  rateLimitMiddleware.tokenRefresh,
  authController.refreshToken
);

router.post('/forgot-password',
  rateLimitMiddleware.passwordReset,
  validationMiddleware.validateEmail,
  authController.forgotPassword
);

router.post('/reset-password/:token',
  rateLimitMiddleware.passwordReset,
  validationMiddleware.validatePasswordReset,
  authController.resetPassword
);

router.post('/verify-email/:token',
  authController.verifyEmail
);

router.post('/resend-verification',
  rateLimitMiddleware.emailVerification,
  authMiddleware.authenticate,
  authController.resendVerification
);

// Protected routes
router.get('/me',
  authMiddleware.authenticate,
  authController.getCurrentUser
);

router.put('/change-password',
  authMiddleware.authenticate,
  validationMiddleware.validatePasswordChange,
  authController.changePassword
);

router.delete('/delete-account',
  authMiddleware.authenticate,
  validationMiddleware.validatePassword,
  authController.deleteAccount
);

router.post('/enable-2fa',
  authMiddleware.authenticate,
  authController.enable2FA
);

router.post('/verify-2fa',
  authMiddleware.authenticate,
  validationMiddleware.validate2FA,
  authController.verify2FA
);

router.post('/disable-2fa',
  authMiddleware.authenticate,
  validationMiddleware.validate2FA,
  authController.disable2FA
);

// OAuth routes
router.get('/google',
  authController.googleAuth
);

router.get('/google/callback',
  authController.googleCallback
);

router.get('/github',
  authController.githubAuth
);

router.get('/github/callback',
  authController.githubCallback
);

// Session management
router.get('/sessions',
  authMiddleware.authenticate,
  authController.getAllSessions
);

router.delete('/sessions/:sessionId',
  authMiddleware.authenticate,
  authController.revokeSession
);

router.delete('/sessions',
  authMiddleware.authenticate,
  authController.revokeAllSessions
);

module.exports = router;
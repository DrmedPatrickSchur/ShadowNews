const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { rateLimit } = require('../middlewares/rateLimit.middleware');
const upload = require('../middlewares/upload.middleware');
const usersController = require('../controllers/users.controller');
const { body, param, query } = require('express-validator');

// Public routes
router.get('/profile/:username', 
 validate([
   param('username').isAlphanumeric().isLength({ min: 3, max: 30 })
 ]),
 usersController.getPublicProfile
);

router.get('/leaderboard',
 validate([
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
   query('offset').optional().isInt({ min: 0 }).toInt(),
   query('period').optional().isIn(['day', 'week', 'month', 'year', 'all'])
 ]),
 usersController.getLeaderboard
);

// Protected routes - require authentication
router.use(authenticate);

router.get('/me', usersController.getCurrentUser);

router.patch('/me',
 validate([
   body('displayName').optional().isString().isLength({ min: 1, max: 50 }),
   body('bio').optional().isString().isLength({ max: 500 }),
   body('website').optional().isURL(),
   body('interests').optional().isArray(),
   body('interests.*').optional().isString()
 ]),
 usersController.updateProfile
);

router.post('/me/avatar',
 upload.single('avatar'),
 usersController.uploadAvatar
);

router.delete('/me/avatar', usersController.deleteAvatar);

router.get('/me/karma', usersController.getKarmaHistory);

router.get('/me/repositories', 
 validate([
   query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
   query('offset').optional().isInt({ min: 0 }).toInt(),
   query('sort').optional().isIn(['created', 'updated', 'size', 'activity'])
 ]),
 usersController.getUserRepositories
);

router.get('/me/posts',
 validate([
   query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
   query('offset').optional().isInt({ min: 0 }).toInt(),
   query('type').optional().isIn(['submitted', 'upvoted', 'commented'])
 ]),
 usersController.getUserPosts
);

router.get('/me/emails',
 validate([
   query('verified').optional().isBoolean().toBoolean()
 ]),
 usersController.getUserEmails
);

router.post('/me/emails',
 validate([
   body('email').isEmail().normalizeEmail(),
   body('label').optional().isString().isLength({ max: 50 })
 ]),
 rateLimit({ max: 5, windowMs: 60 * 60 * 1000 }),
 usersController.addEmail
);

router.delete('/me/emails/:emailId',
 validate([
   param('emailId').isMongoId()
 ]),
 usersController.removeEmail
);

router.post('/me/emails/:emailId/verify',
 validate([
   param('emailId').isMongoId(),
   body('code').isString().isLength({ min: 6, max: 6 })
 ]),
 rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),
 usersController.verifyEmail
);

router.post('/me/emails/:emailId/resend-verification',
 validate([
   param('emailId').isMongoId()
 ]),
 rateLimit({ max: 3, windowMs: 60 * 60 * 1000 }),
 usersController.resendEmailVerification
);

router.patch('/me/settings',
 validate([
   body('emailDigest').optional().isIn(['daily', 'weekly', 'never']),
   body('emailNotifications').optional().isBoolean(),
   body('publicProfile').optional().isBoolean(),
   body('showEmail').optional().isBoolean(),
   body('theme').optional().isIn(['light', 'dark', 'auto']),
   body('timezone').optional().isString(),
   body('language').optional().isIn(['en', 'es', 'fr', 'de', 'ja', 'zh'])
 ]),
 usersController.updateSettings
);

router.get('/me/settings', usersController.getSettings);

router.post('/me/block',
 validate([
   body('userId').isMongoId()
 ]),
 usersController.blockUser
);

router.delete('/me/block/:userId',
 validate([
   param('userId').isMongoId()
 ]),
 usersController.unblockUser
);

router.get('/me/blocked', usersController.getBlockedUsers);

router.get('/me/followers',
 validate([
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
   query('offset').optional().isInt({ min: 0 }).toInt()
 ]),
 usersController.getFollowers
);

router.get('/me/following',
 validate([
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
   query('offset').optional().isInt({ min: 0 }).toInt()
 ]),
 usersController.getFollowing
);

router.post('/follow/:userId',
 validate([
   param('userId').isMongoId()
 ]),
 rateLimit({ max: 100, windowMs: 60 * 60 * 1000 }),
 usersController.followUser
);

router.delete('/follow/:userId',
 validate([
   param('userId').isMongoId()
 ]),
 usersController.unfollowUser
);

router.get('/me/notifications',
 validate([
   query('unread').optional().isBoolean().toBoolean(),
   query('type').optional().isIn(['comment', 'upvote', 'follow', 'repository', 'mention']),
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
   query('offset').optional().isInt({ min: 0 }).toInt()
 ]),
 usersController.getNotifications
);

router.patch('/me/notifications/:notificationId/read',
 validate([
   param('notificationId').isMongoId()
 ]),
 usersController.markNotificationRead
);

router.post('/me/notifications/read-all', usersController.markAllNotificationsRead);

router.get('/me/api-keys', usersController.getApiKeys);

router.post('/me/api-keys',
 validate([
   body('name').isString().isLength({ min: 1, max: 100 }),
   body('scopes').isArray(),
   body('scopes.*').isIn(['read', 'write', 'delete'])
 ]),
 rateLimit({ max: 5, windowMs: 24 * 60 * 60 * 1000 }),
 usersController.createApiKey
);

router.delete('/me/api-keys/:keyId',
 validate([
   param('keyId').isMongoId()
 ]),
 usersController.revokeApiKey
);

router.post('/me/export-data',
 rateLimit({ max: 1, windowMs: 24 * 60 * 60 * 1000 }),
 usersController.requestDataExport
);

router.delete('/me',
 validate([
   body('password').isString(),
   body('confirmation').equals('DELETE')
 ]),
 usersController.deleteAccount
);

// Admin routes
router.get('/',
 authorize(['admin']),
 validate([
   query('search').optional().isString(),
   query('role').optional().isIn(['user', 'moderator', 'admin']),
   query('status').optional().isIn(['active', 'suspended', 'deleted']),
   query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
   query('offset').optional().isInt({ min: 0 }).toInt()
 ]),
 usersController.getAllUsers
);

router.patch('/:userId/role',
 authorize(['admin']),
 validate([
   param('userId').isMongoId(),
   body('role').isIn(['user', 'moderator', 'admin'])
 ]),
 usersController.updateUserRole
);

router.patch('/:userId/status',
 authorize(['admin', 'moderator']),
 validate([
   param('userId').isMongoId(),
   body('status').isIn(['active', 'suspended']),
   body('reason').optional().isString().isLength({ max: 500 })
 ]),
 usersController.updateUserStatus
);

module.exports = router;
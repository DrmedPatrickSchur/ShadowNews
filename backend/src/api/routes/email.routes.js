const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');
const { body, param, query } = require('express-validator');

// Email validation rules
const emailValidation = {
 sendEmail: [
   body('to').isEmail().normalizeEmail(),
   body('subject').isString().trim().isLength({ min: 1, max: 200 }),
   body('body').isString().trim().isLength({ min: 1, max: 50000 }),
   body('repositoryId').optional().isMongoId(),
   body('attachments').optional().isArray(),
   body('attachments.*.filename').optional().isString(),
   body('attachments.*.content').optional().isString(),
   body('attachments.*.contentType').optional().isString(),
   body('hashtags').optional().isArray(),
   body('hashtags.*').optional().isString().trim(),
   body('scheduleTime').optional().isISO8601(),
   body('isDigest').optional().isBoolean()
 ],
 
 updateEmailPreferences: [
   body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'never']),
   body('notificationTypes').optional().isArray(),
   body('notificationTypes.*').optional().isIn(['posts', 'comments', 'mentions', 'repository_updates']),
   body('emailFormat').optional().isIn(['html', 'text', 'both']),
   body('timezone').optional().isString(),
   body('unsubscribeFromAll').optional().isBoolean()
 ],
 
 parseInboundEmail: [
   body('from').isEmail().normalizeEmail(),
   body('to').isEmail().normalizeEmail(),
   body('subject').isString().trim(),
   body('text').optional().isString(),
   body('html').optional().isString(),
   body('attachments').optional().isArray(),
   body('headers').optional().isObject(),
   body('envelope').optional().isObject()
 ],
 
 createEmailAlias: [
   body('aliasName').isString().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9-_]+$/),
   body('description').optional().isString().trim().isLength({ max: 200 }),
   body('autoTag').optional().isArray(),
   body('autoTag.*').optional().isString().trim(),
   body('forwardTo').optional().isEmail().normalizeEmail()
 ],
 
 queryValidation: [
   query('page').optional().isInt({ min: 1 }),
   query('limit').optional().isInt({ min: 1, max: 100 }),
   query('status').optional().isIn(['sent', 'pending', 'failed', 'scheduled']),
   query('repositoryId').optional().isMongoId(),
   query('startDate').optional().isISO8601(),
   query('endDate').optional().isISO8601()
 ]
};

// Public webhook endpoint for email service providers (SendGrid, AWS SES, etc.)
router.post('/inbound',
 rateLimitMiddleware.emailInbound,
 emailValidation.parseInboundEmail,
 validationMiddleware,
 emailController.handleInboundEmail
);

// Webhook for email event tracking (opens, clicks, bounces)
router.post('/webhook/events',
 rateLimitMiddleware.webhook,
 emailController.handleEmailEvents
);

// Protected routes - require authentication
router.use(authMiddleware.requireAuth);

// Send email
router.post('/send',
 rateLimitMiddleware.emailSend,
 emailValidation.sendEmail,
 validationMiddleware,
 emailController.sendEmail
);

// Schedule email for later
router.post('/schedule',
 emailValidation.sendEmail,
 validationMiddleware,
 emailController.scheduleEmail
);

// Get email history
router.get('/history',
 emailValidation.queryValidation,
 validationMiddleware,
 emailController.getEmailHistory
);

// Get email statistics
router.get('/stats',
 query('period').optional().isIn(['day', 'week', 'month', 'year', 'all']),
 validationMiddleware,
 emailController.getEmailStats
);

// Get email templates
router.get('/templates',
 emailController.getEmailTemplates
);

// Create custom email template
router.post('/templates',
 body('name').isString().trim().isLength({ min: 1, max: 100 }),
 body('subject').isString().trim().isLength({ min: 1, max: 200 }),
 body('content').isString().trim().isLength({ min: 1, max: 100000 }),
 body('variables').optional().isArray(),
 body('category').optional().isString().trim(),
 validationMiddleware,
 emailController.createEmailTemplate
);

// Update email template
router.put('/templates/:templateId',
 param('templateId').isMongoId(),
 body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
 body('subject').optional().isString().trim().isLength({ min: 1, max: 200 }),
 body('content').optional().isString().trim().isLength({ min: 1, max: 100000 }),
 body('variables').optional().isArray(),
 body('category').optional().isString().trim(),
 validationMiddleware,
 emailController.updateEmailTemplate
);

// Delete email template
router.delete('/templates/:templateId',
 param('templateId').isMongoId(),
 validationMiddleware,
 emailController.deleteEmailTemplate
);

// Get user's email preferences
router.get('/preferences',
 emailController.getEmailPreferences
);

// Update email preferences
router.put('/preferences',
 emailValidation.updateEmailPreferences,
 validationMiddleware,
 emailController.updateEmailPreferences
);

// Create email alias (e.g., username.projectname@shadownews.com)
router.post('/aliases',
 emailValidation.createEmailAlias,
 validationMiddleware,
 emailController.createEmailAlias
);

// Get user's email aliases
router.get('/aliases',
 emailController.getEmailAliases
);

// Update email alias
router.put('/aliases/:aliasId',
 param('aliasId').isMongoId(),
 body('description').optional().isString().trim().isLength({ max: 200 }),
 body('autoTag').optional().isArray(),
 body('autoTag.*').optional().isString().trim(),
 body('forwardTo').optional().isEmail().normalizeEmail(),
 body('isActive').optional().isBoolean(),
 validationMiddleware,
 emailController.updateEmailAlias
);

// Delete email alias
router.delete('/aliases/:aliasId',
 param('aliasId').isMongoId(),
 validationMiddleware,
 emailController.deleteEmailAlias
);

// Get email digest preview
router.get('/digest/preview',
 query('frequency').isIn(['daily', 'weekly', 'monthly']),
 validationMiddleware,
 emailController.getDigestPreview
);

// Send test digest email
router.post('/digest/test',
 body('frequency').isIn(['daily', 'weekly', 'monthly']),
 validationMiddleware,
 emailController.sendTestDigest
);

// Bulk email operations for repository owners
router.post('/bulk/send',
 rateLimitMiddleware.bulkEmail,
 body('repositoryId').isMongoId(),
 body('subject').isString().trim().isLength({ min: 1, max: 200 }),
 body('content').isString().trim().isLength({ min: 1, max: 50000 }),
 body('includeUnsubscribeLink').optional().isBoolean(),
 body('testMode').optional().isBoolean(),
 body('recipientFilters').optional().isObject(),
 validationMiddleware,
 emailController.sendBulkEmail
);

// Get email bounce list
router.get('/bounces',
 emailValidation.queryValidation,
 validationMiddleware,
 emailController.getBounceList
);

// Remove email from bounce list
router.delete('/bounces/:email',
 param('email').isEmail().normalizeEmail(),
 validationMiddleware,
 emailController.removeFromBounceList
);

// Get email blocklist
router.get('/blocklist',
 emailValidation.queryValidation,
 validationMiddleware,
 emailController.getBlocklist
);

// Add email to blocklist
router.post('/blocklist',
 body('email').isEmail().normalizeEmail(),
 body('reason').optional().isString().trim().isLength({ max: 500 }),
 validationMiddleware,
 emailController.addToBlocklist
);

// Remove from blocklist
router.delete('/blocklist/:email',
 param('email').isEmail().normalizeEmail(),
 validationMiddleware,
 emailController.removeFromBlocklist
);

// Validate email address (check deliverability)
router.post('/validate',
 body('email').isEmail().normalizeEmail(),
 validationMiddleware,
 emailController.validateEmailAddress
);

// Get email engagement metrics for a specific email
router.get('/:emailId/engagement',
 param('emailId').isMongoId(),
 validationMiddleware,
 emailController.getEmailEngagement
);

// Resend failed email
router.post('/:emailId/resend',
 param('emailId').isMongoId(),
 validationMiddleware,
 emailController.resendEmail
);

// Cancel scheduled email
router.delete('/scheduled/:emailId',
 param('emailId').isMongoId(),
 validationMiddleware,
 emailController.cancelScheduledEmail
);

// Email-to-post conversion endpoint
router.post('/convert-to-post/:emailId',
 param('emailId').isMongoId(),
 body('hashtags').optional().isArray(),
 body('hashtags.*').optional().isString().trim(),
 body('repositoryIds').optional().isArray(),
 body('repositoryIds.*').optional().isMongoId(),
 validationMiddleware,
 emailController.convertEmailToPost
);

// Get unsubscribe link for user
router.get('/unsubscribe-link',
 emailController.getUnsubscribeLink
);

// Handle unsubscribe (public endpoint with token)
router.get('/unsubscribe/:token',
 param('token').isString().isLength({ min: 32 }),
 validationMiddleware,
 emailController.handleUnsubscribe
);

module.exports = router;
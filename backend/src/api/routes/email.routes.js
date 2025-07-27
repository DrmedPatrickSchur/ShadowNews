/**
 * @fileoverview Email Management Routes for ShadowNews Platform
 * 
 * Comprehensive email system routing for the ShadowNews email-first news platform.
 * This module handles all email-related operations including inbound email processing,
 * digest generation, template management, user preferences, email aliases, bulk operations,
 * and comprehensive email analytics. Features robust email service provider integration,
 * webhook handling, deliverability management, and advanced email automation.
 * 
 * Key Features:
 * - Email-first content creation with inbound email processing
 * - Automated digest generation and distribution
 * - Custom email template system with variable substitution
 * - User preference management and subscription controls
 * - Email alias system for organized content routing
 * - Bulk email operations for repository communications
 * - Advanced email analytics and engagement tracking
 * - Bounce and blocklist management for deliverability
 * - Email service provider webhook integration
 * - Email-to-post conversion for seamless content flow
 * 
 * Email-First Features:
 * - Inbound email parsing and content extraction
 * - Automatic post creation from email content
 * - Email alias routing for organized content management
 * - Reply-by-email functionality for engagement
 * - Email thread preservation and conversation tracking
 * 
 * Automation Features:
 * - Scheduled email sending with queue management
 * - Automated digest generation based on user preferences
 * - Template-based email composition with personalization
 * - Bulk operations for repository communications
 * - Event-driven email notifications and alerts
 * 
 * Analytics and Monitoring:
 * - Email engagement tracking (opens, clicks, replies)
 * - Bounce and deliverability monitoring
 * - User preference analytics and optimization
 * - Campaign performance metrics and reporting
 * - Email service provider webhook event processing
 * 
 * Security Features:
 * - Email validation and deliverability checking
 * - Spam prevention and content filtering
 * - Unsubscribe link generation and management
 * - Rate limiting for abuse prevention
 * - Secure token-based unsubscribe handling
 * 
 * Dependencies:
 * - express: Web framework for route definition and handling
 * - express-validator: Input validation and sanitization
 * - emailController: Business logic for email operations
 * - authMiddleware: Authentication and authorization middleware
 * - validationMiddleware: Input validation and sanitization
 * - rateLimitMiddleware: Rate limiting for abuse prevention
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for email routing
const express = require('express');                          // Express web framework
const router = express.Router();                             // Express router instance
const { body, param, query } = require('express-validator'); // Input validation utilities

// Controller and middleware imports
const emailController = require('../controllers/email.controller');         // Email business logic
const authMiddleware = require('../middlewares/auth.middleware');           // Authentication middleware
const validationMiddleware = require('../middlewares/validation.middleware'); // Input validation
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware'); // Rate limiting

/**
 * Comprehensive Email Validation Rules
 * Pre-defined validation schemas for all email-related operations
 * 
 * These validation rules ensure data integrity, security, and proper
 * formatting for all email operations. Each rule set is tailored to
 * specific endpoint requirements and includes security considerations.
 */
const emailValidation = {
  /**
   * Email Sending Validation Rules
   * Comprehensive validation for outbound email operations
   */
  sendEmail: [
    body('to').isEmail().normalizeEmail()
      .withMessage('Valid recipient email address is required'),
    body('subject').isString().trim().isLength({ min: 1, max: 200 })
      .withMessage('Subject must be between 1 and 200 characters'),
    body('body').isString().trim().isLength({ min: 1, max: 50000 })
      .withMessage('Email body must be between 1 and 50,000 characters'),
    body('repositoryId').optional().isMongoId()
      .withMessage('Repository ID must be a valid MongoDB ObjectId'),
    body('attachments').optional().isArray()
      .withMessage('Attachments must be an array'),
    body('attachments.*.filename').optional().isString()
      .withMessage('Attachment filename must be a string'),
    body('attachments.*.content').optional().isString()
      .withMessage('Attachment content must be a string'),
    body('attachments.*.contentType').optional().isString()
      .withMessage('Attachment content type must be a string'),
    body('hashtags').optional().isArray()
      .withMessage('Hashtags must be an array'),
    body('hashtags.*').optional().isString().trim()
      .withMessage('Each hashtag must be a string'),
    body('scheduleTime').optional().isISO8601()
      .withMessage('Schedule time must be a valid ISO 8601 date'),
    body('isDigest').optional().isBoolean()
      .withMessage('isDigest must be a boolean value')
  ],
  
  /**
   * Email Preferences Update Validation Rules
   * User preference management validation
   */
  updateEmailPreferences: [
    body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'never'])
      .withMessage('Digest frequency must be daily, weekly, monthly, or never'),
    body('notificationTypes').optional().isArray()
      .withMessage('Notification types must be an array'),
    body('notificationTypes.*').optional().isIn(['posts', 'comments', 'mentions', 'repository_updates'])
      .withMessage('Invalid notification type'),
    body('emailFormat').optional().isIn(['html', 'text', 'both'])
      .withMessage('Email format must be html, text, or both'),
    body('timezone').optional().isString()
      .withMessage('Timezone must be a valid string'),
    body('unsubscribeFromAll').optional().isBoolean()
      .withMessage('Unsubscribe from all must be a boolean')
  ],
  
  /**
   * Inbound Email Parsing Validation Rules
   * Validation for incoming email webhook data
   */
  parseInboundEmail: [
    body('from').isEmail().normalizeEmail()
      .withMessage('From address must be a valid email'),
    body('to').isEmail().normalizeEmail()
      .withMessage('To address must be a valid email'),
    body('subject').isString().trim()
      .withMessage('Subject must be a string'),
    body('text').optional().isString()
      .withMessage('Text content must be a string'),
    body('html').optional().isString()
      .withMessage('HTML content must be a string'),
    body('attachments').optional().isArray()
      .withMessage('Attachments must be an array'),
    body('headers').optional().isObject()
      .withMessage('Headers must be an object'),
    body('envelope').optional().isObject()
      .withMessage('Envelope must be an object')
  ],
  
  /**
   * Email Alias Creation Validation Rules
   * Validation for custom email alias creation
   */
  createEmailAlias: [
    body('aliasName').isString().trim().isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9-_]+$/)
      .withMessage('Alias name must be 3-30 characters, alphanumeric with hyphens and underscores only'),
    body('description').optional().isString().trim().isLength({ max: 200 })
      .withMessage('Description must be 200 characters or less'),
    body('autoTag').optional().isArray()
      .withMessage('Auto tags must be an array'),
    body('autoTag.*').optional().isString().trim()
      .withMessage('Each auto tag must be a string'),
    body('forwardTo').optional().isEmail().normalizeEmail()
      .withMessage('Forward to must be a valid email address')
  ],
  
  /**
   * Query Parameter Validation Rules
   * Common validation for pagination and filtering
   */
  queryValidation: [
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['sent', 'pending', 'failed', 'scheduled'])
      .withMessage('Status must be sent, pending, failed, or scheduled'),
    query('repositoryId').optional().isMongoId()
      .withMessage('Repository ID must be a valid MongoDB ObjectId'),
    query('startDate').optional().isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
  ]
};

// ========== PUBLIC WEBHOOK ENDPOINTS ==========
// These endpoints handle external email service provider webhooks

/**
 * Inbound Email Processing Webhook
 * POST /api/email/inbound
 * 
 * Processes incoming emails from email service providers (SendGrid, AWS SES, etc.).
 * This is the core endpoint for email-first content creation functionality.
 * 
 * Features:
 * - Email parsing and content extraction
 * - Automatic post creation from email content
 * - Email alias routing and content organization
 * - Reply detection and thread management
 * - Attachment processing and storage
 * - Spam filtering and validation
 * 
 * Security Features:
 * - Rate limiting to prevent webhook abuse
 * - Email validation and sanitization
 * - Sender verification and authentication
 * - Content filtering and spam detection
 * 
 * Webhook Data:
 * - from: Sender email address
 * - to: Recipient email address (alias)
 * - subject: Email subject line
 * - text: Plain text email content
 * - html: HTML email content
 * - attachments: File attachments array
 * - headers: Email headers object
 * - envelope: Email envelope information
 * 
 * Response:
 * - Processing confirmation
 * - Created post information (if applicable)
 * - Error details for failed processing
 */
router.post('/inbound',
  rateLimitMiddleware.emailInbound,                         // Prevent webhook abuse
  emailValidation.parseInboundEmail,                        // Validate webhook data
  validationMiddleware,                                     // Process validation results
  emailController.handleInboundEmail                        // Handle email processing
);

/**
 * Email Event Tracking Webhook
 * POST /api/email/webhook/events
 * 
 * Handles email event tracking from service providers (opens, clicks, bounces).
 * Provides comprehensive email engagement analytics and deliverability monitoring.
 * 
 * Features:
 * - Email open tracking and analytics
 * - Link click tracking and heatmaps
 * - Bounce and delivery failure handling
 * - Spam complaint processing
 * - Unsubscribe event handling
 * - Email engagement scoring
 * 
 * Event Types:
 * - delivered: Email successfully delivered
 * - opened: Email opened by recipient
 * - clicked: Link clicked in email
 * - bounced: Email delivery failed
 * - complained: Spam complaint received
 * - unsubscribed: User unsubscribed
 * 
 * Response:
 * - Event processing confirmation
 * - Updated analytics data
 * - Action taken (if applicable)
 */
router.post('/webhook/events',
  rateLimitMiddleware.webhook,                              // Prevent webhook abuse
  emailController.handleEmailEvents                         // Handle event processing
);

// ========== AUTHENTICATION REQUIRED FOR ALL ROUTES BELOW ==========
// Middleware to require authentication for all subsequent routes
router.use(authMiddleware.requireAuth);

// ========== EMAIL SENDING AND SCHEDULING ROUTES ==========
// These routes handle outbound email operations

/**
 * Send Email Endpoint
 * POST /api/email/send
 * 
 * Sends individual emails with comprehensive content and delivery options.
 * Supports both immediate sending and scheduling for future delivery.
 * 
 * Middleware Stack:
 * 1. Rate limiting for email sending abuse prevention
 * 2. Input validation and sanitization
 * 3. Controller logic for email composition and sending
 * 
 * Features:
 * - Rich email composition with HTML and text formats
 * - File attachment support with type validation
 * - Email template integration and variable substitution
 * - Repository association for content organization
 * - Hashtag support for content categorization
 * - Delivery confirmation and tracking
 * 
 * Request Body:
 * - to: Recipient email address
 * - subject: Email subject line
 * - body: Email content (HTML or text)
 * - repositoryId: Optional repository association
 * - attachments: Optional file attachments
 * - hashtags: Optional content hashtags
 * - scheduleTime: Optional future delivery time
 * - isDigest: Whether this is a digest email
 * 
 * Response:
 * - Email sending confirmation
 * - Message ID for tracking
 * - Delivery status and timeline
 */
router.post('/send',
  rateLimitMiddleware.emailSend,                            // Prevent email sending abuse
  emailValidation.sendEmail,                                // Validate email data
  validationMiddleware,                                     // Process validation results
  emailController.sendEmail                                 // Handle email sending
);

/**
 * Schedule Email Endpoint
 * POST /api/email/schedule
 * 
 * Schedules emails for future delivery with comprehensive scheduling options.
 * Integrates with job queue system for reliable delivery timing.
 * 
 * Features:
 * - Future delivery scheduling with timezone support
 * - Recurring email support for regular communications
 * - Schedule modification and cancellation
 * - Delivery confirmation and failure handling
 * - Integration with user preference timezone settings
 * 
 * Request Body: Same as send email with required scheduleTime
 * 
 * Response:
 * - Scheduling confirmation
 * - Scheduled email ID for management
 * - Delivery timeline and status
 */
router.post('/schedule',
  emailValidation.sendEmail,                                // Validate email data
  validationMiddleware,                                     // Process validation results
  emailController.scheduleEmail                             // Handle email scheduling
);

// ========== EMAIL HISTORY AND ANALYTICS ROUTES ==========
// These routes provide email tracking and analytics functionality

/**
 * Get Email History Endpoint
 * GET /api/email/history
 * 
 * Retrieves user's email sending history with filtering and pagination.
 * Provides comprehensive email activity tracking and management.
 * 
 * Features:
 * - Paginated email history with sorting options
 * - Filtering by status, date range, and repository
 * - Email engagement metrics and analytics
 * - Delivery status and error information
 * - Template usage tracking
 * 
 * Query Parameters:
 * - page: Page number for pagination
 * - limit: Emails per page
 * - status: Filter by email status
 * - repositoryId: Filter by repository
 * - startDate: Start date for filtering
 * - endDate: End date for filtering
 * 
 * Response:
 * - Paginated email history
 * - Engagement analytics summary
 * - Filter and sorting metadata
 */
router.get('/history',
  emailValidation.queryValidation,                          // Validate query parameters
  validationMiddleware,                                     // Process validation results
  emailController.getEmailHistory                           // Handle history retrieval
);

/**
 * Get Email Statistics Endpoint
 * GET /api/email/stats
 * 
 * Provides comprehensive email analytics and performance metrics.
 * Includes engagement rates, deliverability, and trend analysis.
 * 
 * Features:
 * - Email volume and frequency analytics
 * - Engagement metrics (open rates, click rates)
 * - Deliverability statistics and bounce rates
 * - Repository-specific performance metrics
 * - Time-based trend analysis
 * 
 * Query Parameters:
 * - period: Time period for statistics (day, week, month, year, all)
 * 
 * Response:
 * - Comprehensive email statistics
 * - Engagement rate calculations
 * - Trend analysis and comparisons
 * - Performance recommendations
 */
router.get('/stats',
  query('period').optional().isIn(['day', 'week', 'month', 'year', 'all'])
    .withMessage('Period must be day, week, month, year, or all'),
  validationMiddleware,                                     // Process validation results
  emailController.getEmailStats                             // Handle statistics retrieval
);

// ========== EMAIL TEMPLATE MANAGEMENT ROUTES ==========
// These routes handle email template creation and management

/**
 * Get Email Templates Endpoint
 * GET /api/email/templates
 * 
 * Retrieves available email templates for user composition.
 * Includes both system templates and user-created custom templates.
 * 
 * Features:
 * - System-provided template library
 * - User-created custom templates
 * - Template categorization and organization
 * - Variable placeholder documentation
 * - Preview and usage examples
 * 
 * Response:
 * - Available template library
 * - Template metadata and variables
 * - Usage statistics and popularity
 */
router.get('/templates',
  emailController.getEmailTemplates                         // Handle template retrieval
);

/**
 * Create Email Template Endpoint
 * POST /api/email/templates
 * 
 * Creates custom email templates for reusable email composition.
 * Supports variable substitution and rich formatting options.
 * 
 * Features:
 * - Custom template creation with variable support
 * - HTML and text format templates
 * - Template categorization and organization
 * - Variable placeholder validation
 * - Template sharing and collaboration
 * 
 * Request Body:
 * - name: Template name (1-100 characters)
 * - subject: Email subject template
 * - content: Email content template
 * - variables: Available variables for substitution
 * - category: Template category for organization
 * 
 * Response:
 * - Created template information
 * - Template ID for future use
 * - Variable documentation
 */
router.post('/templates',
  body('name').isString().trim().isLength({ min: 1, max: 100 })
    .withMessage('Template name must be between 1 and 100 characters'),
  body('subject').isString().trim().isLength({ min: 1, max: 200 })
    .withMessage('Subject template must be between 1 and 200 characters'),
  body('content').isString().trim().isLength({ min: 1, max: 100000 })
    .withMessage('Content template must be between 1 and 100,000 characters'),
  body('variables').optional().isArray()
    .withMessage('Variables must be an array'),
  body('category').optional().isString().trim()
    .withMessage('Category must be a string'),
  validationMiddleware,                                     // Process validation results
  emailController.createEmailTemplate                       // Handle template creation
);

/**
 * Update Email Template Endpoint
 * PUT /api/email/templates/:templateId
 * 
 * Updates existing email templates with new content and settings.
 * Maintains version history for template evolution tracking.
 * 
 * Features:
 * - Template content and metadata updates
 * - Version history and change tracking
 * - Template sharing and permission management
 * - Usage impact analysis for template changes
 * 
 * URL Parameters:
 * - templateId: MongoDB ObjectId of the template
 * 
 * Request Body: Optional fields from template creation
 * 
 * Response:
 * - Updated template information
 * - Version history metadata
 * - Usage impact summary
 */
router.put('/templates/:templateId',
  param('templateId').isMongoId()
    .withMessage('Template ID must be a valid MongoDB ObjectId'),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 })
    .withMessage('Template name must be between 1 and 100 characters'),
  body('subject').optional().isString().trim().isLength({ min: 1, max: 200 })
    .withMessage('Subject template must be between 1 and 200 characters'),
  body('content').optional().isString().trim().isLength({ min: 1, max: 100000 })
    .withMessage('Content template must be between 1 and 100,000 characters'),
  body('variables').optional().isArray()
    .withMessage('Variables must be an array'),
  body('category').optional().isString().trim()
    .withMessage('Category must be a string'),
  validationMiddleware,                                     // Process validation results
  emailController.updateEmailTemplate                       // Handle template update
);

/**
 * Delete Email Template Endpoint
 * DELETE /api/email/templates/:templateId
 * 
 * Deletes email templates with proper cleanup and validation.
 * Ensures template dependencies are handled appropriately.
 * 
 * Features:
 * - Template deletion with dependency checking
 * - Usage history preservation
 * - Template backup and recovery options
 * - Impact analysis for template removal
 * 
 * URL Parameters:
 * - templateId: MongoDB ObjectId of the template
 * 
 * Response:
 * - Deletion confirmation
 * - Impact summary
 * - Alternative template suggestions
 */
router.delete('/templates/:templateId',
  param('templateId').isMongoId()
    .withMessage('Template ID must be a valid MongoDB ObjectId'),
  validationMiddleware,                                     // Process validation results
  emailController.deleteEmailTemplate                       // Handle template deletion
);

// ========== USER PREFERENCE MANAGEMENT ROUTES ==========
// These routes handle user email preferences and subscription management

/**
 * Get Email Preferences Endpoint
 * GET /api/email/preferences
 * 
 * Retrieves user's email preferences and subscription settings.
 * Includes digest frequency, notification types, and format preferences.
 * 
 * Features:
 * - Complete preference profile retrieval
 * - Subscription status for all email types
 * - Digest frequency and timing preferences
 * - Email format preferences (HTML, text, both)
 * - Timezone and delivery timing settings
 * 
 * Response:
 * - Complete user email preferences
 * - Subscription status summary
 * - Preference history and changes
 */
router.get('/preferences',
  emailController.getEmailPreferences                       // Handle preference retrieval
);

/**
 * Update Email Preferences Endpoint
 * PUT /api/email/preferences
 * 
 * Updates user email preferences with validation and confirmation.
 * Supports granular control over email types and delivery settings.
 * 
 * Features:
 * - Granular preference control
 * - Digest frequency management
 * - Notification type selection
 * - Email format preferences
 * - Timezone and delivery timing
 * - Unsubscribe options
 * 
 * Request Body:
 * - digestFrequency: How often to receive digests
 * - notificationTypes: Types of notifications to receive
 * - emailFormat: Preferred email format
 * - timezone: User timezone for delivery timing
 * - unsubscribeFromAll: Global unsubscribe option
 * 
 * Response:
 * - Updated preference confirmation
 * - Effective date for changes
 * - Impact summary for preference changes
 */
router.put('/preferences',
  emailValidation.updateEmailPreferences,                   // Validate preference data
  validationMiddleware,                                     // Process validation results
  emailController.updateEmailPreferences                    // Handle preference update
);

// ========== EMAIL ALIAS MANAGEMENT ROUTES ==========
// These routes handle custom email alias creation and management

/**
 * Create Email Alias Endpoint
 * POST /api/email/aliases
 * 
 * Creates custom email aliases for organized content routing.
 * Enables users to have project-specific email addresses.
 * 
 * Features:
 * - Custom alias creation (e.g., username.project@shadownews.com)
 * - Automatic tagging and content organization
 * - Email forwarding and routing rules
 * - Alias activity tracking and analytics
 * - Integration with repository management
 * 
 * Request Body:
 * - aliasName: Unique alias identifier (3-30 characters)
 * - description: Optional alias description
 * - autoTag: Automatic tags for incoming emails
 * - forwardTo: Optional forwarding email address
 * 
 * Response:
 * - Created alias information
 * - Full email address (alias@shadownews.com)
 * - Configuration and routing details
 */
router.post('/aliases',
  emailValidation.createEmailAlias,                        // Validate alias data
  validationMiddleware,                                     // Process validation results
  emailController.createEmailAlias                         // Handle alias creation
);

/**
 * Get Email Aliases Endpoint
 * GET /api/email/aliases
 * 
 * Retrieves user's email aliases with activity and configuration details.
 * Provides comprehensive alias management and monitoring.
 * 
 * Features:
 * - Complete alias listing with status
 * - Activity statistics and usage metrics
 * - Configuration details and routing rules
 * - Email volume and engagement tracking
 * - Alias performance analytics
 * 
 * Response:
 * - User's email aliases
 * - Activity and usage statistics
 * - Configuration and routing details
 */
router.get('/aliases',
  emailController.getEmailAliases                          // Handle alias retrieval
);

/**
 * Update Email Alias Endpoint
 * PUT /api/email/aliases/:aliasId
 * 
 * Updates email alias configuration and settings.
 * Allows modification of routing rules and tagging options.
 * 
 * Features:
 * - Alias configuration updates
 * - Routing rule modifications
 * - Auto-tagging rule changes
 * - Activity status management
 * - Forwarding address updates
 * 
 * URL Parameters:
 * - aliasId: MongoDB ObjectId of the alias
 * 
 * Request Body:
 * - description: Updated alias description
 * - autoTag: Updated auto-tagging rules
 * - forwardTo: Updated forwarding address
 * - isActive: Alias active status
 * 
 * Response:
 * - Updated alias configuration
 * - Change summary and impact
 * - Routing rule confirmation
 */
router.put('/aliases/:aliasId',
  param('aliasId').isMongoId()
    .withMessage('Alias ID must be a valid MongoDB ObjectId'),
  body('description').optional().isString().trim().isLength({ max: 200 })
    .withMessage('Description must be 200 characters or less'),
  body('autoTag').optional().isArray()
    .withMessage('Auto tags must be an array'),
  body('autoTag.*').optional().isString().trim()
    .withMessage('Each auto tag must be a string'),
  body('forwardTo').optional().isEmail().normalizeEmail()
    .withMessage('Forward to must be a valid email address'),
  body('isActive').optional().isBoolean()
    .withMessage('isActive must be a boolean'),
  validationMiddleware,                                     // Process validation results
  emailController.updateEmailAlias                         // Handle alias update
);

/**
 * Delete Email Alias Endpoint
 * DELETE /api/email/aliases/:aliasId
 * 
 * Deletes email aliases with proper cleanup and validation.
 * Ensures alias dependencies and routing are handled appropriately.
 * 
 * Features:
 * - Alias deletion with dependency checking
 * - Email routing cleanup
 * - Activity history preservation
 * - Impact analysis for alias removal
 * 
 * URL Parameters:
 * - aliasId: MongoDB ObjectId of the alias
 * 
 * Response:
 * - Deletion confirmation
 * - Cleanup summary
 * - Alternative routing suggestions
 */
router.delete('/aliases/:aliasId',
  param('aliasId').isMongoId()
    .withMessage('Alias ID must be a valid MongoDB ObjectId'),
  validationMiddleware,                                     // Process validation results
  emailController.deleteEmailAlias                         // Handle alias deletion
);

// ========== DIGEST MANAGEMENT ROUTES ==========
// These routes handle email digest generation and distribution

/**
 * Get Email Digest Preview Endpoint
 * GET /api/email/digest/preview
 * 
 * Generates a preview of the email digest for the specified frequency.
 * Allows users to see what content would be included in their digest.
 * 
 * Features:
 * - Real-time digest content generation
 * - Frequency-based content filtering
 * - Personalized content selection
 * - Preview formatting and styling
 * - Content volume and quality metrics
 * 
 * Query Parameters:
 * - frequency: Digest frequency (daily, weekly, monthly)
 * 
 * Response:
 * - Preview digest content
 * - Content summary and statistics
 * - Expected delivery information
 */
router.get('/digest/preview',
  query('frequency').isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency must be daily, weekly, or monthly'),
  validationMiddleware,                                     // Process validation results
  emailController.getDigestPreview                          // Handle digest preview
);

/**
 * Send Test Digest Email Endpoint
 * POST /api/email/digest/test
 * 
 * Sends a test digest email to the authenticated user.
 * Useful for testing digest formatting and content selection.
 * 
 * Features:
 * - Test digest generation and delivery
 * - Content formatting validation
 * - Personalization testing
 * - Delivery confirmation and tracking
 * - Performance metrics collection
 * 
 * Request Body:
 * - frequency: Digest frequency for test generation
 * 
 * Response:
 * - Test email sending confirmation
 * - Content summary and metrics
 * - Delivery tracking information
 */
router.post('/digest/test',
  body('frequency').isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Frequency must be daily, weekly, or monthly'),
  validationMiddleware,                                     // Process validation results
  emailController.sendTestDigest                            // Handle test digest sending
);

// ========== BULK EMAIL OPERATIONS ==========
// These routes handle bulk email operations for repository communications

/**
 * Send Bulk Email Endpoint
 * POST /api/email/bulk/send
 * 
 * Sends bulk emails to repository subscribers with comprehensive targeting.
 * Includes advanced filtering and delivery optimization.
 * 
 * Middleware Stack:
 * 1. Rate limiting for bulk email abuse prevention
 * 2. Input validation and content verification
 * 3. Controller logic for bulk email processing
 * 
 * Features:
 * - Repository-wide email distribution
 * - Advanced recipient filtering and targeting
 * - Content personalization and templating
 * - Delivery optimization and queue management
 * - Unsubscribe link automatic inclusion
 * - Test mode for validation and preview
 * 
 * Request Body:
 * - repositoryId: Target repository for bulk sending
 * - subject: Email subject line
 * - content: Email content (HTML or text)
 * - includeUnsubscribeLink: Automatic unsubscribe link inclusion
 * - testMode: Send to test recipients only
 * - recipientFilters: Advanced recipient targeting filters
 * 
 * Response:
 * - Bulk email sending confirmation
 * - Recipient count and targeting summary
 * - Delivery queue information and timeline
 */
router.post('/bulk/send',
  rateLimitMiddleware.bulkEmail,                            // Prevent bulk email abuse
  body('repositoryId').isMongoId()
    .withMessage('Repository ID must be a valid MongoDB ObjectId'),
  body('subject').isString().trim().isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
  body('content').isString().trim().isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50,000 characters'),
  body('includeUnsubscribeLink').optional().isBoolean()
    .withMessage('Include unsubscribe link must be a boolean'),
  body('testMode').optional().isBoolean()
    .withMessage('Test mode must be a boolean'),
  body('recipientFilters').optional().isObject()
    .withMessage('Recipient filters must be an object'),
  validationMiddleware,                                     // Process validation results
  emailController.sendBulkEmail                             // Handle bulk email sending
);

// ========== EMAIL DELIVERABILITY MANAGEMENT ROUTES ==========
// These routes handle bounce lists, blocklists, and deliverability optimization

/**
 * Get Email Bounce List Endpoint
 * GET /api/email/bounces
 * 
 * Retrieves email addresses that have bounced with bounce details.
 * Essential for maintaining good email deliverability reputation.
 * 
 * Features:
 * - Comprehensive bounce list with categorization
 * - Bounce reason analysis and categorization
 * - Pagination and filtering for large bounce lists
 * - Bounce pattern analysis and recommendations
 * - Automatic cleanup and retry suggestions
 * 
 * Query Parameters: Standard pagination and filtering options
 * 
 * Response:
 * - Paginated bounce list with details
 * - Bounce categorization and analysis
 * - Deliverability impact metrics
 * - Cleanup recommendations
 */
router.get('/bounces',
  emailValidation.queryValidation,                          // Validate query parameters
  validationMiddleware,                                     // Process validation results
  emailController.getBounceList                             // Handle bounce list retrieval
);

/**
 * Remove Email from Bounce List Endpoint
 * DELETE /api/email/bounces/:email
 * 
 * Removes an email address from the bounce list for retry attempts.
 * Allows manual bounce list management and retry coordination.
 * 
 * Features:
 * - Manual bounce list management
 * - Email address validation before removal
 * - Bounce history preservation for analysis
 * - Retry attempt tracking and optimization
 * 
 * URL Parameters:
 * - email: Email address to remove from bounce list
 * 
 * Response:
 * - Removal confirmation
 * - Updated deliverability status
 * - Retry recommendations
 */
router.delete('/bounces/:email',
  param('email').isEmail().normalizeEmail()
    .withMessage('Email must be a valid email address'),
  validationMiddleware,                                     // Process validation results
  emailController.removeFromBounceList                      // Handle bounce removal
);

/**
 * Get Email Blocklist Endpoint
 * GET /api/email/blocklist
 * 
 * Retrieves email addresses on the user's blocklist.
 * Provides comprehensive blocklist management and organization.
 * 
 * Features:
 * - Complete blocklist with categorization
 * - Block reason tracking and analysis
 * - Pagination and search functionality
 * - Blocklist pattern analysis
 * - Import/export capabilities for blocklist management
 * 
 * Response:
 * - Paginated blocklist with details
 * - Block reason categorization
 * - Blocklist statistics and patterns
 */
router.get('/blocklist',
  emailValidation.queryValidation,                          // Validate query parameters
  validationMiddleware,                                     // Process validation results
  emailController.getBlocklist                              // Handle blocklist retrieval
);

/**
 * Add Email to Blocklist Endpoint
 * POST /api/email/blocklist
 * 
 * Adds an email address to the user's blocklist with reason tracking.
 * Prevents future email delivery to blocked addresses.
 * 
 * Features:
 * - Email address blocking with reason tracking
 * - Automatic block pattern recognition
 * - Integration with spam detection systems
 * - Blocklist synchronization across user accounts
 * 
 * Request Body:
 * - email: Email address to block
 * - reason: Optional reason for blocking
 * 
 * Response:
 * - Blocking confirmation
 * - Updated blocklist statistics
 * - Pattern analysis and recommendations
 */
router.post('/blocklist',
  body('email').isEmail().normalizeEmail()
    .withMessage('Email must be a valid email address'),
  body('reason').optional().isString().trim().isLength({ max: 500 })
    .withMessage('Reason must be 500 characters or less'),
  validationMiddleware,                                     // Process validation results
  emailController.addToBlocklist                           // Handle email blocking
);

/**
 * Remove Email from Blocklist Endpoint
 * DELETE /api/email/blocklist/:email
 * 
 * Removes an email address from the blocklist.
 * Restores email delivery capability to previously blocked addresses.
 * 
 * Features:
 * - Email address unblocking
 * - Block history preservation
 * - Delivery restoration confirmation
 * - Unblock pattern tracking
 * 
 * URL Parameters:
 * - email: Email address to unblock
 * 
 * Response:
 * - Unblocking confirmation
 * - Delivery restoration status
 * - Updated blocklist statistics
 */
router.delete('/blocklist/:email',
  param('email').isEmail().normalizeEmail()
    .withMessage('Email must be a valid email address'),
  validationMiddleware,                                     // Process validation results
  emailController.removeFromBlocklist                       // Handle email unblocking
);

// ========== EMAIL VALIDATION AND VERIFICATION ROUTES ==========
// These routes handle email address validation and deliverability checking

/**
 * Validate Email Address Endpoint
 * POST /api/email/validate
 * 
 * Validates email address format and checks deliverability.
 * Provides comprehensive email validation and reputation checking.
 * 
 * Features:
 * - Email format validation and normalization
 * - Domain validation and MX record checking
 * - Deliverability assessment and scoring
 * - Spam trap and role account detection
 * - Email reputation and blacklist checking
 * 
 * Request Body:
 * - email: Email address to validate
 * 
 * Response:
 * - Validation results and scoring
 * - Deliverability assessment
 * - Recommendations for email handling
 * - Risk factors and mitigation suggestions
 */
router.post('/validate',
  body('email').isEmail().normalizeEmail()
    .withMessage('Email must be a valid email address'),
  validationMiddleware,                                     // Process validation results
  emailController.validateEmailAddress                      // Handle email validation
);

// ========== EMAIL ENGAGEMENT AND ANALYTICS ROUTES ==========
// These routes provide detailed email engagement metrics and analytics

/**
 * Get Email Engagement Metrics Endpoint
 * GET /api/email/:emailId/engagement
 * 
 * Retrieves detailed engagement metrics for a specific email.
 * Provides comprehensive analytics for email performance analysis.
 * 
 * Features:
 * - Complete engagement metrics (opens, clicks, replies)
 * - Geographic and device analytics
 * - Time-based engagement patterns
 * - Recipient behavior analysis
 * - Performance comparison and benchmarking
 * 
 * URL Parameters:
 * - emailId: MongoDB ObjectId of the email
 * 
 * Response:
 * - Comprehensive engagement analytics
 * - Performance metrics and comparisons
 * - Recipient behavior insights
 * - Optimization recommendations
 */
router.get('/:emailId/engagement',
  param('emailId').isMongoId()
    .withMessage('Email ID must be a valid MongoDB ObjectId'),
  validationMiddleware,                                     // Process validation results
  emailController.getEmailEngagement                        // Handle engagement retrieval
);

// ========== EMAIL RETRY AND RECOVERY ROUTES ==========
// These routes handle email retry operations and delivery recovery

/**
 * Resend Failed Email Endpoint
 * POST /api/email/:emailId/resend
 * 
 * Resends a previously failed email with updated delivery parameters.
 * Includes intelligent retry logic and failure analysis.
 * 
 * Features:
 * - Failed email retry with updated parameters
 * - Delivery failure analysis and correction
 * - Automatic retry optimization
 * - Delivery confirmation and tracking
 * - Failure pattern recognition and prevention
 * 
 * URL Parameters:
 * - emailId: MongoDB ObjectId of the failed email
 * 
 * Response:
 * - Resend confirmation and tracking
 * - Updated delivery status
 * - Failure analysis and corrections applied
 */
router.post('/:emailId/resend',
  param('emailId').isMongoId()
    .withMessage('Email ID must be a valid MongoDB ObjectId'),
  validationMiddleware,                                     // Process validation results
  emailController.resendEmail                               // Handle email resending
);

/**
 * Cancel Scheduled Email Endpoint
 * DELETE /api/email/scheduled/:emailId
 * 
 * Cancels a scheduled email before delivery.
 * Provides schedule management and delivery control.
 * 
 * Features:
 * - Scheduled email cancellation
 * - Schedule modification capabilities
 * - Delivery queue management
 * - Cancellation confirmation and tracking
 * 
 * URL Parameters:
 * - emailId: MongoDB ObjectId of the scheduled email
 * 
 * Response:
 * - Cancellation confirmation
 * - Updated schedule status
 * - Alternative scheduling options
 */
router.delete('/scheduled/:emailId',
  param('emailId').isMongoId()
    .withMessage('Email ID must be a valid MongoDB ObjectId'),
  validationMiddleware,                                     // Process validation results
  emailController.cancelScheduledEmail                      // Handle email cancellation
);

// ========== EMAIL-TO-POST CONVERSION ROUTES ==========
// These routes handle email-to-post conversion for content integration

/**
 * Convert Email to Post Endpoint
 * POST /api/email/convert-to-post/:emailId
 * 
 * Converts an email into a ShadowNews post with content preservation.
 * Enables seamless integration between email and post content.
 * 
 * Features:
 * - Email content extraction and formatting
 * - Automatic hashtag and repository tagging
 * - Content optimization for post format
 * - Metadata preservation and linking
 * - Integration with existing post workflow
 * 
 * URL Parameters:
 * - emailId: MongoDB ObjectId of the email to convert
 * 
 * Request Body:
 * - hashtags: Optional hashtags for the post
 * - repositoryIds: Optional repository associations
 * 
 * Response:
 * - Conversion confirmation and post details
 * - Created post information and links
 * - Content preservation summary
 */
router.post('/convert-to-post/:emailId',
  param('emailId').isMongoId()
    .withMessage('Email ID must be a valid MongoDB ObjectId'),
  body('hashtags').optional().isArray()
    .withMessage('Hashtags must be an array'),
  body('hashtags.*').optional().isString().trim()
    .withMessage('Each hashtag must be a string'),
  body('repositoryIds').optional().isArray()
    .withMessage('Repository IDs must be an array'),
  body('repositoryIds.*').optional().isMongoId()
    .withMessage('Each repository ID must be a valid MongoDB ObjectId'),
  validationMiddleware,                                     // Process validation results
  emailController.convertEmailToPost                        // Handle email conversion
);

// ========== UNSUBSCRIBE MANAGEMENT ROUTES ==========
// These routes handle unsubscribe functionality and compliance

/**
 * Get Unsubscribe Link Endpoint
 * GET /api/email/unsubscribe-link
 * 
 * Generates secure unsubscribe links for authenticated users.
 * Provides compliance with email marketing regulations.
 * 
 * Features:
 * - Secure unsubscribe link generation
 * - Token-based unsubscribe authentication
 * - Compliance with CAN-SPAM and GDPR requirements
 * - Granular unsubscribe options
 * 
 * Response:
 * - Secure unsubscribe link with token
 * - Unsubscribe options and categories
 * - Compliance information
 */
router.get('/unsubscribe-link',
  emailController.getUnsubscribeLink                        // Handle unsubscribe link generation
);

/**
 * Handle Unsubscribe Endpoint (Public)
 * GET /api/email/unsubscribe/:token
 * 
 * Processes unsubscribe requests using secure tokens.
 * Public endpoint for email link accessibility.
 * 
 * Features:
 * - Token-based unsubscribe processing
 * - Granular unsubscribe options
 * - Confirmation and feedback collection
 * - Compliance reporting and tracking
 * - User preference preservation options
 * 
 * URL Parameters:
 * - token: Secure unsubscribe token (minimum 32 characters)
 * 
 * Response:
 * - Unsubscribe confirmation
 * - Updated preference status
 * - Re-subscription options
 */
router.get('/unsubscribe/:token',
  param('token').isString().isLength({ min: 32 })
    .withMessage('Token must be a string with at least 32 characters'),
  validationMiddleware,                                     // Process validation results
  emailController.handleUnsubscribe                         // Handle unsubscribe processing
);

// Export configured email router for application use
module.exports = router;
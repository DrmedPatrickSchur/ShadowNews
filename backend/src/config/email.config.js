/**
 * @fileoverview Email Configuration for ShadowNews Platform
 * 
 * Comprehensive email service configuration for the ShadowNews platform.
 * This module manages email providers, inbound email processing, template
 * management, digest scheduling, snowball distribution, and spam prevention.
 * 
 * Key Features:
 * - Multi-provider email service support (SendGrid, etc.)
 * - Inbound email processing and webhook handling
 * - Email template management and customization
 * - Automated digest generation and scheduling
 * - Snowball distribution system for viral content sharing
 * - Rate limiting and spam prevention
 * - Email validation and verification
 * - Queue management for reliable delivery
 * - Analytics and tracking capabilities
 * 
 * Dependencies:
 * - Email service providers (SendGrid, etc.)
 * - Bull queues for email processing
 * - Redis for rate limiting and caching
 * - Environment variables for configuration
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/**
 * Email Configuration Object
 * Manages all email-related settings and service configurations
 */
const config = {
  /**
   * Email Service Provider Configuration
   * Primary email service settings for outbound email delivery
   */
  service: {
    // Email service provider (SendGrid, Mailgun, etc.)
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    
    // API key for email service authentication
    apiKey: process.env.EMAIL_API_KEY,
    
    // Default sender email address for system emails
    fromEmail: process.env.EMAIL_FROM || 'noreply@shadownews.community',
    
    // Display name for email sender
    fromName: process.env.EMAIL_FROM_NAME || 'Shadownews',
    
    // Reply-to address for user responses
    replyTo: process.env.EMAIL_REPLY_TO || 'support@shadownews.community'
  },

  /**
   * Inbound Email Processing Configuration
   * Settings for receiving and processing incoming emails
   */
  inbound: {
    // Domain for receiving emails (e.g., user@shadownews.community)
    domain: process.env.EMAIL_DOMAIN || 'shadownews.community',
    
    // Webhook endpoint for inbound email processing
    webhookUrl: process.env.EMAIL_WEBHOOK_URL || '/api/email/inbound',
    
    // Security token for webhook authentication
    webhookToken: process.env.EMAIL_WEBHOOK_TOKEN,
    
    // Allowed domains for email processing (* = all domains)
    allowedDomains: process.env.EMAIL_ALLOWED_DOMAINS?.split(',') || ['*'],
    
    // Maximum attachment size in bytes (10MB default)
    maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE) || 10485760,
    
    // Supported attachment MIME types for CSV uploads
    supportedAttachments: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },

  /**
   * Email Template Configuration
   * Template IDs for different types of system emails
   */
  templates: {
    // Welcome email for new user registration
    welcome: process.env.EMAIL_TEMPLATE_WELCOME || 'd-welcome123',
    
    // Daily/weekly digest email template
    digest: process.env.EMAIL_TEMPLATE_DIGEST || 'd-digest123',
    
    // General notification email template
    notification: process.env.EMAIL_TEMPLATE_NOTIFICATION || 'd-notification123',
    
    // Password reset email template
    passwordReset: process.env.EMAIL_TEMPLATE_PASSWORD_RESET || 'd-reset123',
    
    // Email address verification template
    emailVerification: process.env.EMAIL_TEMPLATE_VERIFICATION || 'd-verify123',
    
    // Repository invitation email template
    repositoryInvite: process.env.EMAIL_TEMPLATE_REPO_INVITE || 'd-invite123'
  },

  /**
   * Email Digest Configuration
   * Settings for automated digest generation and delivery
   */
  digest: {
    // Enable/disable digest functionality
    enabled: process.env.EMAIL_DIGEST_ENABLED !== 'false',
    
    // Default digest frequency (daily, weekly, monthly)
    defaultFrequency: process.env.EMAIL_DIGEST_FREQUENCY || 'daily',
    
    // Time of day to send digests (24-hour format)
    sendTime: process.env.EMAIL_DIGEST_SEND_TIME || '09:00',
    
    // Timezone for digest scheduling
    timezone: process.env.EMAIL_DIGEST_TIMEZONE || 'UTC',
    
    // Number of emails to process in each batch
    batchSize: parseInt(process.env.EMAIL_DIGEST_BATCH_SIZE) || 100,
    
    // Maximum retry attempts for failed digest deliveries
    maxRetries: parseInt(process.env.EMAIL_DIGEST_MAX_RETRIES) || 3
  },

  /**
   * Rate Limiting Configuration
   * Controls email sending rates to prevent abuse and stay within provider limits
   */
  rateLimit: {
    // Maximum emails per user per day
    maxEmailsPerUser: parseInt(process.env.EMAIL_RATE_LIMIT_USER) || 50,
    
    // Maximum total emails per hour system-wide
    maxEmailsPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_HOUR) || 1000,
    
    // Maximum recipients per individual email
    maxRecipientsPerEmail: parseInt(process.env.EMAIL_MAX_RECIPIENTS) || 100,
    
    // Cooldown period between emails from same user (minutes)
    cooldownPeriod: parseInt(process.env.EMAIL_COOLDOWN_MINUTES) || 60
  },

  /**
   * Snowball Distribution Configuration
   * Settings for viral content sharing mechanism
   */
  snowball: {
    // Enable/disable snowball distribution feature
    enabled: process.env.EMAIL_SNOWBALL_ENABLED !== 'false',
    
    // Minimum karma required to participate in snowball distribution
    minKarmaRequired: parseInt(process.env.EMAIL_SNOWBALL_MIN_KARMA) || 100,
    
    // Maximum number of hops for snowball propagation
    maxHops: parseInt(process.env.EMAIL_SNOWBALL_MAX_HOPS) || 3,
    
    // Require email verification for snowball participation
    verificationRequired: process.env.EMAIL_SNOWBALL_VERIFY !== 'false',
    
    // Honor user opt-out preferences for snowball distribution
    optOutHonored: process.env.EMAIL_SNOWBALL_RESPECT_OPTOUT !== 'false',
    
    // Deduplication window to prevent duplicate snowball emails (hours)
    deduplicationWindow: parseInt(process.env.EMAIL_SNOWBALL_DEDUP_HOURS) || 24
  },

  /**
   * Email Validation Configuration
   * Settings for email address validation and verification
   */
  validation: {
    // Require email verification before activation
    requireVerification: process.env.EMAIL_REQUIRE_VERIFICATION !== 'false',
    
    // Email verification token expiry time (seconds)
    verificationExpiry: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY) || 86400,
    
    // Block disposable/temporary email addresses
    blockDisposable: process.env.EMAIL_BLOCK_DISPOSABLE !== 'false',
    
    // Blocked email domains or addresses
    blockList: process.env.EMAIL_BLOCKLIST?.split(',') || [],
    
    // Allowed email domains (empty = all allowed)
    allowList: process.env.EMAIL_ALLOWLIST?.split(',') || []
  },

  /**
   * Email Queue Configuration
   * Settings for email processing queue management
   */
  queue: {
    // Queue name for email processing jobs
    name: process.env.EMAIL_QUEUE_NAME || 'email-queue',
    
    // Number of concurrent email processing jobs
    concurrency: parseInt(process.env.EMAIL_QUEUE_CONCURRENCY) || 5,
    
    // Delay before retrying failed email jobs (milliseconds)
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY) || 60000,
    
    // Maximum retry attempts for failed emails
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES) || 3,
    
    // Remove completed jobs from queue to save memory
    removeOnComplete: process.env.EMAIL_QUEUE_REMOVE_COMPLETE !== 'false',
    
    // Remove failed jobs from queue (usually kept for debugging)
    removeOnFail: process.env.EMAIL_QUEUE_REMOVE_FAIL === 'true'
  },

  /**
   * Spam Prevention Configuration
   * Settings for detecting and preventing spam emails
   */
  spam: {
    // Enable spam checking for inbound emails
    checkEnabled: process.env.EMAIL_SPAM_CHECK !== 'false',
    
    // SpamAssassin server URL for spam scoring
    spamAssassinUrl: process.env.SPAMASSASSIN_URL,
    
    // Maximum allowed spam score (higher = more likely spam)
    maxSpamScore: parseFloat(process.env.EMAIL_MAX_SPAM_SCORE) || 5.0,
    
    // Greylist period for suspicious emails (minutes)
    greylistMinutes: parseInt(process.env.EMAIL_GREYLIST_MINUTES) || 5,
    
    // External blacklist providers to check against
    blacklistProviders: process.env.EMAIL_BLACKLIST_PROVIDERS?.split(',') || [
      'spamhaus',
      'spamcop'
    ]
  },

  /**
   * Email Analytics Configuration
   * Settings for tracking email performance and engagement
   */
  analytics: {
    // Track email open rates using pixel tracking
    trackOpens: process.env.EMAIL_TRACK_OPENS !== 'false',
    
    // Track link clicks in emails
    trackClicks: process.env.EMAIL_TRACK_CLICKS !== 'false',
    
    // Webhook URL for analytics event notifications
    webhookUrl: process.env.EMAIL_ANALYTICS_WEBHOOK,
    
    // Data retention period for analytics (days)
    retentionDays: parseInt(process.env.EMAIL_ANALYTICS_RETENTION) || 90
  }
};

// Export email configuration
module.exports = config;
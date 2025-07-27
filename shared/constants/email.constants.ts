/**
 * @fileoverview Email Constants Configuration for ShadowNews Platform
 * 
 * This file defines comprehensive email system constants for the ShadowNews platform,
 * an email-first social platform that allows users to create posts and interact with 
 * content through email communication. The platform extends traditional social features
 * with email-based content creation, repository management, and community interaction.
 * 
 * ============================================================================
 * PLATFORM ARCHITECTURE:
 * ============================================================================
 * 
 * Email-First Design:
 * - Users can create posts by sending emails to platform addresses
 * - Email commands enable platform interaction without web interface
 * - Repository-based email organization for content management
 * - Snowball email distribution for organic community growth
 * 
 * Email Processing Pipeline:
 * - Inbound email parsing and validation
 * - Command recognition and execution
 * - Content extraction and post creation
 * - Attachment processing for CSV imports
 * - Reply threading and conversation management
 * 
 * Notification System:
 * - Multi-channel notifications (email, web, push)
 * - Customizable notification preferences
 * - Digest delivery with configurable frequency
 * - Real-time and batch notification processing
 * 
 * Repository Features:
 * - Email-based repository membership management
 * - Snowball distribution for organic growth
 * - Privacy controls and visibility settings
 * - Quality scoring and moderation systems
 * 
 * ============================================================================
 * CORE FEATURES:
 * ============================================================================
 * 
 * Email-to-Post Creation:
 * - Transform emails into platform posts automatically
 * - Support for rich text, attachments, and metadata
 * - Hashtag and mention parsing from email content
 * - Reply threading for comment conversations
 * 
 * Command System:
 * - Text-based commands for platform interaction
 * - Account management through email commands
 * - Content moderation and voting via email
 * - Analytics and statistics retrieval
 * 
 * Digest and Notifications:
 * - Personalized content digests with configurable frequency
 * - Real-time notifications for interactions and mentions
 * - Repository growth updates and milestone notifications
 * - Karma system progress tracking and achievements
 * 
 * Snowball Distribution:
 * - Organic email list growth through quality referrals
 * - Automated verification and quality assessment
 * - Controlled growth rate with anti-spam protection
 * - Trust-based email validation and approval
 * 
 * Privacy and Security:
 * - GDPR-compliant data handling and export
 * - Configurable privacy levels for content visibility
 * - Bounce and complaint tracking for deliverability
 * - Rate limiting and abuse prevention
 * 
 * ============================================================================
 * USAGE PATTERNS:
 * ============================================================================
 * 
 * Email Processing:
 * - Parse inbound emails for post creation and commands
 * - Validate email format and domain requirements
 * - Extract metadata and content for platform integration
 * - Handle attachments for CSV imports and media uploads
 * 
 * Template Management:
 * - Generate personalized email templates for different notification types
 * - Support for dynamic content injection and localization
 * - Consistent branding and formatting across all communications
 * - Responsive email design for mobile and desktop clients
 * 
 * Repository Management:
 * - Organize email communications within themed repositories
 * - Manage member permissions and access controls
 * - Track repository growth and engagement metrics
 * - Facilitate discovery through quality scoring
 * 
 * Analytics and Monitoring:
 * - Track email open rates and click-through rates
 * - Monitor bounce rates and delivery statistics
 * - Measure user engagement and platform adoption
 * - Generate reports for community growth and health
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// ============================================================================
// Email System Configuration
// ============================================================================

/**
 * Core Email System Constants
 * 
 * Fundamental email configuration for the ShadowNews platform including
 * domain settings, system email addresses, and inbound email processing.
 * 
 * Domain Strategy:
 * - Dedicated @artofdigitalshadow.org domain for platform emails
 * - Separate system addresses for different functions
 * - Consistent branding across all email communications
 * - Professional email handling for user trust
 * 
 * System Email Types:
 * - SYSTEM_EMAIL: Automated platform notifications and updates
 * - NOREPLY_EMAIL: One-way communications that don't accept replies
 * - SUPPORT_EMAIL: User support and help desk communications
 * 
 * Inbound Processing:
 * - POST_PREFIX: Emails for creating new posts
 * - REPLY_PREFIX: Emails for replying to existing posts/comments
 * - COMMAND_PREFIX: Emails containing platform commands
 * - REPOSITORY_PREFIX: Repository-specific email communications
 */
export const EMAIL_CONSTANTS = {
  // Primary email domain for all platform communications
  DOMAIN: '@artofdigitalshadow.org',
  
  // System email addresses for different communication types
  SYSTEM_EMAIL: 'system@artofdigitalshadow.org',      // Automated platform notifications
  NOREPLY_EMAIL: 'noreply@artofdigitalshadow.org',    // One-way communications
  SUPPORT_EMAIL: 'support@artofdigitalshadow.org',    // User support and assistance
  
  // Inbound email address prefixes for different content types
  INBOUND: {
    POST_PREFIX: 'post',           // Create new posts via email
    REPLY_PREFIX: 'reply',         // Reply to posts and comments
    COMMAND_PREFIX: 'cmd',         // Execute platform commands
    REPOSITORY_PREFIX: 'repo',     // Repository-specific communications
  },

  // ============================================================================
  // Email Subject Lines and Templates
  // ============================================================================

  /**
   * Standardized Email Subject Lines
   * 
   * Consistent subject line templates for different types of platform emails.
   * Supports template variables for personalization and dynamic content.
   * 
   * Template Variables:
   * - {{frequency}}: Digest frequency (daily, weekly, etc.)
   * - {{count}}: Numeric values (post count, member count, karma points)
   * - {{title}}: Post titles and content references
   * - {{username}}: User identification and mentions
   * - {{repository}}: Repository names and references
   * - {{karma}}: Karma point values and milestones
   * 
   * Subject Line Strategy:
   * - Clear and actionable subject lines for better open rates
   * - Emoji usage for visual appeal and categorization
   * - Personalization for improved user engagement
   * - Consistent branding and tone across all communications
   */
  SUBJECTS: {
    WELCOME: 'Welcome to Shadownews - Your posting email is ready!',
    VERIFY_EMAIL: 'Verify your Shadownews email address',
    PASSWORD_RESET: 'Reset your Shadownews password',
    DIGEST: '🌟 Your {{frequency}} Shadownews digest: {{count}} must-read posts',
    POST_NOTIFICATION: 'New comment on your post: {{title}}',
    MENTION_NOTIFICATION: '{{username}} mentioned you in a comment',
    REPOSITORY_INVITE: 'You\'ve been invited to join {{repository}} repository',
    REPOSITORY_MILESTONE: '🎉 {{repository}} reached {{count}} members!',
    KARMA_MILESTONE: '⭐ You\'ve reached {{karma}} karma points!',
    SNOWBALL_UPDATE: '📧 Your repository grew by {{count}} new emails',
  },

  /**
   * Email Template Identifiers
   * 
   * Template names for different types of platform emails, used for
   * rendering appropriate email content and styling.
   * 
   * Template Categories:
   * - Authentication: User verification and password management
   * - Notifications: Real-time updates and mentions
   * - Digests: Periodic content summaries
   * - Repository: Community and repository management
   * - Achievements: Karma milestones and platform progress
   * - Growth: Snowball distribution and network expansion
   */
  TEMPLATES: {
    WELCOME: 'welcome',              // New user onboarding email
    VERIFY: 'verify-email',          // Email address verification
    RESET: 'password-reset',         // Password reset instructions
    DIGEST: 'digest',                // Periodic content digest
    NOTIFICATION: 'notification',    // Real-time activity notifications
    REPOSITORY: 'repository',        // Repository-related communications
    KARMA: 'karma-update',           // Karma milestone achievements
    SNOWBALL: 'snowball-growth',     // Snowball distribution updates
  },

  // ============================================================================
  // Email Command System
  // ============================================================================

  /**
   * Email Command Definitions
   * 
   * Text-based commands that users can send via email to interact with
   * the platform without using the web interface. Enables email-only
   * platform interaction for accessibility and convenience.
   * 
   * Command Categories:
   * - Information: HELP, STATS - Get platform information and user statistics
   * - Subscription: SUBSCRIBE, UNSUBSCRIBE, PAUSE, RESUME - Manage email preferences
   * - Content: DELETE, UPVOTE, DOWNVOTE - Interact with posts and comments
   * - Management: REPOSITORY, EXPORT, PRIVACY - Account and data management
   * 
   * Command Usage:
   * - Send email to cmd@shadownews.community with command in subject or body
   * - Commands are case-insensitive for user convenience
   * - Some commands accept parameters for specific actions
   * - Rate limiting prevents abuse and spam
   */
  COMMANDS: {
    HELP: 'HELP',                    // Display available commands and usage instructions
    STATS: 'STATS',                  // Show user statistics and platform metrics
    SUBSCRIBE: 'SUBSCRIBE',          // Subscribe to repository or notification type
    UNSUBSCRIBE: 'UNSUBSCRIBE',      // Unsubscribe from repository or notifications
    PAUSE: 'PAUSE',                  // Temporarily pause all email notifications
    RESUME: 'RESUME',                // Resume paused email notifications
    DELETE: 'DELETE',                // Delete a post or comment
    UPVOTE: 'UPVOTE',                // Upvote a post or comment
    DOWNVOTE: 'DOWNVOTE',            // Downvote a post or comment
    REPOSITORY: 'REPOSITORY',        // Repository management commands
    EXPORT: 'EXPORT',                // Export user data for GDPR compliance
    PRIVACY: 'PRIVACY',              // Privacy settings and data control
  },

  // ============================================================================
  // Digest and Notification Configuration
  // ============================================================================

  /**
   * Digest Frequency Options
   * 
   * Available frequencies for content digest delivery, allowing users
   * to customize how often they receive curated content summaries.
   * 
   * Frequency Types:
   * - INSTANT: Real-time notifications for immediate updates
   * - DAILY: Once per day digest at user's preferred time
   * - WEEKLY: Weekly summary of top content and activities
   * - BIWEEKLY: Every two weeks for less frequent updates
   * - MONTHLY: Monthly digest for minimal email frequency
   */
  DIGEST_FREQUENCIES: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
    INSTANT: 'instant',
  } as const,

  /**
   * Digest Delivery Times
   * 
   * Standard delivery times for scheduled digest emails,
   * optimized for different user preferences and time zones.
   * 
   * Time Strategy:
   * - Multiple time options to accommodate different schedules
   * - Times chosen based on optimal email engagement data
   * - 24-hour format for clarity and consistency
   * - Timezone handling managed separately in user preferences
   */
  DIGEST_TIMES: {
    MORNING: '08:00',                // Early morning for commute reading
    NOON: '12:00',                   // Lunch time for midday updates
    EVENING: '18:00',                // End of workday for evening reading
    NIGHT: '21:00',                  // Evening for relaxed content consumption
  },

  // ============================================================================
  // Email Attachment Processing
  // ============================================================================

  /**
   * Email Attachment Configuration
   * 
   * Settings for processing email attachments, particularly CSV files
   * for repository management and data import functionality.
   * 
   * Security Considerations:
   * - File size limits prevent resource exhaustion
   * - MIME type validation prevents malicious file uploads
   * - Extension whitelist for additional security
   * - Virus scanning and content validation recommended
   * 
   * Supported Use Cases:
   * - CSV email imports for repository growth
   * - Spreadsheet data for analytics and reporting
   * - Text file attachments for content creation
   * - Document attachments for rich content posts
   */
  ATTACHMENTS: {
    MAX_SIZE: 10 * 1024 * 1024,      // 10MB maximum file size
    
    // Allowed MIME types for attachment validation
    ALLOWED_TYPES: [
      'text/csv',                                                          // CSV files
      'application/vnd.ms-excel',                                         // Excel 97-2003
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel 2007+
      'text/plain',                                                       // Plain text files
    ],
    
    // File extension validation for additional security
    CSV_EXTENSIONS: ['.csv', '.txt'],     // CSV and text file extensions
    EXCEL_EXTENSIONS: ['.xls', '.xlsx'],  // Excel file extensions
  },

  // ============================================================================
  // Email Validation and Parsing
  // ============================================================================

  /**
   * Email Content Validation Rules
   * 
   * Validation constraints for incoming email content to ensure
   * platform quality and prevent abuse.
   * 
   * Content Limits:
   * - Subject length limits for database efficiency and display consistency
   * - Body length limits to prevent spam and ensure quality content
   * - Recipient limits to prevent mass email abuse
   * - Attachment limits for resource management
   * 
   * Quality Assurance:
   * - Minimum content length ensures meaningful posts
   * - Maximum limits prevent platform abuse
   * - Recipient limits protect against spam
   * - Balanced constraints for usability and security
   */
  VALIDATION: {
    MAX_SUBJECT_LENGTH: 200,         // Maximum characters in email subject
    MAX_BODY_LENGTH: 50000,          // Maximum characters in email body
    MIN_BODY_LENGTH: 10,             // Minimum characters for meaningful content
    MAX_RECIPIENTS: 50,              // Maximum recipients per email
    MAX_CC_RECIPIENTS: 10,           // Maximum CC recipients per email
    MAX_ATTACHMENTS: 5,              // Maximum attachments per email
  },

  /**
   * Content Parsing Regular Expressions
   * 
   * Regular expressions for extracting structured data from email content,
   * including hashtags, mentions, URLs, and commands.
   * 
   * Parsing Features:
   * - Unicode support for international characters
   * - URL detection for automatic link creation
   * - Email validation for contact management
   * - Command parsing for email-based interaction
   * 
   * Performance Optimization:
   * - Compiled regexes for efficient parsing
   * - Global flags for complete content scanning
   * - Case-insensitive matching where appropriate
   * - Balanced precision and performance
   */
  PARSING: {
    HASHTAG_REGEX: /#[\w\u0080-\uFFFF]+/g,                               // Hashtag detection
    MENTION_REGEX: /@[\w\u0080-\uFFFF]+/g,                               // User mention detection
    URL_REGEX: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, // URL detection
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,                          // Email format validation
    COMMAND_REGEX: /^(HELP|STATS|SUBSCRIBE|UNSUBSCRIBE|PAUSE|RESUME|DELETE|UPVOTE|DOWNVOTE|REPOSITORY|EXPORT|PRIVACY)(\s+(.+))?$/i, // Command parsing
  },

  // ============================================================================
  // Rate Limiting and Abuse Prevention
  // ============================================================================

  /**
   * Email Rate Limiting Configuration
   * 
   * Rate limits for different types of email-based actions to prevent
   * spam and abuse while allowing legitimate platform usage.
   * 
   * Rate Limit Categories:
   * - Content Creation: Limits on post and comment creation
   * - Platform Commands: Limits on command usage
   * - Repository Management: Limits on invitations and management
   * - User Preferences: Limits on settings changes
   * 
   * Anti-Abuse Strategy:
   * - Reasonable limits for normal usage patterns
   * - Progressive restrictions for suspicious activity
   * - Per-user tracking for fair resource allocation
   * - Cooldown periods for sustained high activity
   */
  RATE_LIMITS: {
    POSTS_PER_HOUR: 10,              // Maximum posts per user per hour
    POSTS_PER_DAY: 50,               // Maximum posts per user per day
    COMMANDS_PER_HOUR: 20,           // Maximum commands per user per hour
    REPOSITORY_INVITES_PER_DAY: 100, // Maximum repository invites per day
    DIGEST_CHANGES_PER_WEEK: 5,      // Maximum digest preference changes per week
  },

  // ============================================================================
  // Snowball Distribution System
  // ============================================================================

  /**
   * Snowball Email Distribution Configuration
   * 
   * Settings for the organic email list growth system that allows
   * repositories to expand through quality referrals and trust networks.
   * 
   * Growth Control:
   * - Minimum email threshold prevents premature activation
   * - Maximum growth rate prevents explosive expansion
   * - Quality thresholds ensure content standards
   * - Verification requirements for trust and security
   * 
   * Quality Assurance:
   * - Multiple referral requirements for auto-addition
   * - Cooldown periods prevent rapid expansion
   * - Hop limits prevent excessive distribution
   * - Trust scoring for quality control
   */
  SNOWBALL: {
    MIN_EMAILS_TO_START: 10,                    // Minimum emails required to start snowball
    MAX_GROWTH_RATE: 2.0,                       // Maximum 200% growth per cycle
    QUALITY_THRESHOLD: 0.7,                     // Minimum quality score for inclusion
    VERIFICATION_REQUIRED: true,                // Email verification required
    COOL_DOWN_PERIOD: 24 * 60 * 60 * 1000,     // 24 hours cooldown in milliseconds
    MAX_HOPS: 3,                                // Maximum distribution hops
    AUTO_ADD_THRESHOLD: 5,                      // Auto-add if referred by 5+ trusted sources
  },

  // ============================================================================
  // Privacy and Data Protection
  // ============================================================================

  /**
   * Privacy and Data Protection Settings
   * 
   * Configuration for user privacy controls, data protection, and
   * GDPR compliance features.
   * 
   * Privacy Features:
   * - Configurable content visibility levels
   * - Anonymous posting capabilities
   * - Encrypted email list storage
   * - GDPR-compliant data export
   * 
   * Data Protection:
   * - Privacy-by-design implementation
   * - User control over data visibility
   * - Secure data handling practices
   * - Compliance with international privacy regulations
   */
  PRIVACY: {
    DEFAULT_VISIBILITY: 'public',                                // Default content visibility
    VISIBILITY_LEVELS: ['public', 'repository', 'private'] as const, // Available visibility options
    ANONYMOUS_POSTING: true,                                     // Allow anonymous posts
    ENCRYPTED_LISTS: true,                                       // Encrypt sensitive email lists
    GDPR_EXPORT_FORMAT: 'json',                                  // Data export format for GDPR
  },

  // ============================================================================
  // Notification System Configuration
  // ============================================================================

  /**
   * Multi-Channel Notification System
   * 
   * Configuration for the platform's notification system supporting
   * multiple delivery channels and user preference management.
   * 
   * Notification Types:
   * - Content interactions (replies, mentions, votes)
   * - Repository activities (invites, growth, milestones)
   * - Achievement notifications (karma, milestones)
   * - System communications (digests, announcements)
   * 
   * Delivery Channels:
   * - Email notifications for detailed communications
   * - Web notifications for real-time updates
   * - Push notifications for mobile engagement
   * 
   * Preference Management:
   * - Per-notification-type channel selection
   * - User customizable notification settings
   * - Reasonable defaults for new users
   * - Easy opt-out and preference updates
   */
  NOTIFICATIONS: {
    TYPES: {
      POST_REPLY: 'post_reply',              // Reply to user's post
      COMMENT_REPLY: 'comment_reply',        // Reply to user's comment
      MENTION: 'mention',                    // User mentioned in content
      UPVOTE: 'upvote',                      // Content received upvote
      REPOSITORY_INVITE: 'repository_invite', // Invited to join repository
      REPOSITORY_GROWTH: 'repository_growth', // Repository membership growth
      KARMA_MILESTONE: 'karma_milestone',    // Karma point milestone reached
      DIGEST: 'digest',                      // Periodic content digest
      SYSTEM: 'system',                      // System announcements
    },
    
    CHANNELS: {
      EMAIL: 'email',                        // Email delivery
      WEB: 'web',                           // Web interface notifications
      PUSH: 'push',                         // Push notifications
    },
    
    // Default notification preferences for new users
    DEFAULT_PREFERENCES: {
      post_reply: ['email', 'web'],          // Email and web for post replies
      comment_reply: ['email', 'web'],       // Email and web for comment replies
      mention: ['email', 'web', 'push'],     // All channels for mentions
      upvote: ['web'],                       // Web only for upvotes
      repository_invite: ['email', 'web', 'push'], // All channels for invites
      repository_growth: ['email'],          // Email only for growth updates
      karma_milestone: ['email', 'web'],     // Email and web for milestones
      digest: ['email'],                     // Email only for digests
      system: ['email', 'web'],             // Email and web for system messages
    },
  },

  // ============================================================================
  // Email Header Configuration
  // ============================================================================

  /**
   * Standard Email Headers
   * 
   * Email header definitions for proper email handling, threading,
   * and platform integration.
   * 
   * Standard Headers:
   * - MESSAGE_ID: Unique message identification
   * - IN_REPLY_TO: Reply threading support
   * - REFERENCES: Email conversation threading
   * - LIST_UNSUBSCRIBE: RFC-compliant unsubscribe links
   * - LIST_ID: Mailing list identification
   * 
   * Custom Headers:
   * - X_SHADOWNEWS_*: Platform-specific metadata
   * - Content type and platform identification
   * - Repository and karma tracking
   * - Integration with platform features
   */
  HEADERS: {
    MESSAGE_ID: 'Message-ID',                 // Unique message identifier
    IN_REPLY_TO: 'In-Reply-To',              // Parent message for threading
    REFERENCES: 'References',                 // Conversation thread references
    X_SHADOWNEWS_TYPE: 'X-Shadownews-Type',  // Platform content type
    X_SHADOWNEWS_ID: 'X-Shadownews-ID',      // Platform content ID
    X_SHADOWNEWS_REPOSITORY: 'X-Shadownews-Repository', // Repository association
    X_SHADOWNEWS_KARMA: 'X-Shadownews-Karma', // User karma metadata
    LIST_UNSUBSCRIBE: 'List-Unsubscribe',    // RFC-compliant unsubscribe
    LIST_ID: 'List-ID',                       // Mailing list identification
  },

  // ============================================================================
  // Email Deliverability and Bounce Handling
  // ============================================================================

  /**
   * Bounce and Deliverability Management
   * 
   * Configuration for handling email bounces, complaints, and
   * deliverability issues to maintain platform email reputation.
   * 
   * Bounce Categories:
   * - Hard bounces: Permanent delivery failures
   * - Soft bounces: Temporary delivery issues
   * - Complaints: User-reported spam or unwanted email
   * 
   * Reputation Management:
   * - Automatic suspension for problematic addresses
   * - Threshold-based bounce handling
   * - Complaint tracking and response
   * - Proactive deliverability monitoring
   */
  BOUNCE: {
    HARD_BOUNCE_THRESHOLD: 3,                     // Hard bounces before suspension
    SOFT_BOUNCE_THRESHOLD: 5,                     // Soft bounces before investigation
    COMPLAINT_THRESHOLD: 2,                       // Complaints before suspension
    SUSPENSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days suspension in milliseconds
  },

  // ============================================================================
  // Email Analytics and Tracking
  // ============================================================================

  /**
   * Email Analytics Configuration
   * 
   * Settings for tracking email engagement and platform usage
   * through email interactions.
   * 
   * Tracking Features:
   * - Email open tracking with privacy considerations
   * - Link click tracking for engagement metrics
   * - Platform integration for comprehensive analytics
   * - User privacy controls and opt-out options
   * 
   * Privacy Balance:
   * - Optional tracking with user consent
   * - Anonymized analytics where possible
   * - Clear disclosure of tracking practices
   * - Easy opt-out mechanisms for privacy-conscious users
   */
  ANALYTICS: {
    TRACK_OPENS: true,                        // Track email open rates
    TRACK_CLICKS: true,                       // Track link click-through rates
    PIXEL_ENDPOINT: '/api/email/track',       // Tracking pixel endpoint
    LINK_WRAPPER_ENDPOINT: '/api/email/click', // Link tracking endpoint
  },
} as const;

// ============================================================================
// Email Error Codes
// ============================================================================

/**
 * Email-Specific Error Codes
 * 
 * Standardized error codes for email processing and handling,
 * enabling precise error identification and user feedback.
 * 
 * Error Categories:
 * - Format and validation errors
 * - Rate limiting and abuse prevention
 * - Attachment and content processing
 * - Authorization and security
 * - Platform limits and restrictions
 */
export const EMAIL_ERROR_CODES = {
  INVALID_FORMAT: 'EMAIL_INVALID_FORMAT',                   // Email format validation failed
  DOMAIN_MISMATCH: 'EMAIL_DOMAIN_MISMATCH',                 // Email domain not supported
  RATE_LIMIT_EXCEEDED: 'EMAIL_RATE_LIMIT_EXCEEDED',         // Rate limit threshold exceeded
  ATTACHMENT_TOO_LARGE: 'EMAIL_ATTACHMENT_TOO_LARGE',       // Attachment exceeds size limit
  INVALID_ATTACHMENT_TYPE: 'EMAIL_INVALID_ATTACHMENT_TYPE', // Unsupported attachment type
  PARSING_FAILED: 'EMAIL_PARSING_FAILED',                   // Email content parsing failed
  COMMAND_NOT_RECOGNIZED: 'EMAIL_COMMAND_NOT_RECOGNIZED',   // Unknown command in email
  UNAUTHORIZED: 'EMAIL_UNAUTHORIZED',                       // Insufficient permissions
  BOUNCE_THRESHOLD_EXCEEDED: 'EMAIL_BOUNCE_THRESHOLD_EXCEEDED', // Too many bounces
  SNOWBALL_LIMIT_REACHED: 'EMAIL_SNOWBALL_LIMIT_REACHED',   // Snowball growth limit reached
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * TypeScript Type Definitions
 * 
 * Type definitions for email constants to ensure type safety
 * and provide IntelliSense support for developers.
 */

export type EmailCommand = keyof typeof EMAIL_CONSTANTS.COMMANDS;
export type DigestFrequency = typeof EMAIL_CONSTANTS.DIGEST_FREQUENCIES[keyof typeof EMAIL_CONSTANTS.DIGEST_FREQUENCIES];
export type NotificationType = keyof typeof EMAIL_CONSTANTS.NOTIFICATIONS.TYPES;
export type NotificationChannel = keyof typeof EMAIL_CONSTANTS.NOTIFICATIONS.CHANNELS;
export type PrivacyLevel = typeof EMAIL_CONSTANTS.PRIVACY.VISIBILITY_LEVELS[number];
export type EmailErrorCode = typeof EMAIL_ERROR_CODES[keyof typeof EMAIL_ERROR_CODES];
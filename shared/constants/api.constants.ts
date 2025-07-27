/**
 * ============================================================================
 * API Constants for ShadowNews Platform
 * ============================================================================
 * 
 * Centralized API configuration and constants for the ShadowNews email-first
 * social platform. This file defines all API endpoints, HTTP status codes,
 * WebSocket events, and configuration values used across both frontend and
 * backend services.
 * 
 * Architecture Overview:
 * - RESTful API design with versioned endpoints for stable integration
 * - WebSocket real-time communication for live updates and notifications
 * - Rate limiting configuration for API protection and fair usage
 * - Error code standardization for consistent error handling
 * - Caching strategies for performance optimization
 * 
 * Platform Features Covered:
 * - Authentication: Login, registration, OAuth, 2FA, and session management
 * - User Management: Profiles, karma system, achievements, and social features
 * - Content System: Posts, comments, voting, and content moderation
 * - Email Repository: CSV processing, email parsing, and repository management
 * - Snowball Distribution: Community-driven content distribution algorithms
 * - AI Integration: Content analysis, hashtag suggestions, and moderation
 * - Search & Discovery: Global search, trending content, and recommendations
 * - Analytics: User engagement, growth metrics, and platform insights
 * - Administration: User management, content moderation, and system monitoring
 * 
 * Design Patterns:
 * - Constant object exports with TypeScript 'as const' for type safety
 * - Parameterized endpoint functions for dynamic URL generation
 * - Hierarchical organization for logical grouping and maintainability
 * - Environment variable integration for deployment flexibility
 * 
 * Usage Patterns:
 * - Frontend: HTTP client configuration and API request construction
 * - Backend: Route definition and endpoint validation
 * - Testing: Mock API configuration and endpoint verification
 * - Documentation: API reference generation and integration guides
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 * ============================================================================
 */

// ============================================================================
// Base Configuration & Environment
// ============================================================================

/**
 * API Base URL Configuration
 * 
 * Primary API endpoint for all HTTP requests. Supports environment-specific
 * configuration through environment variables with fallback to development.
 * 
 * Environment Variables:
 * - REACT_APP_API_URL: Production API endpoint
 * - Fallback: localhost:5000 for local development
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * WebSocket Base URL Configuration
 * 
 * WebSocket endpoint for real-time communication including live updates,
 * notifications, and collaborative features.
 * 
 * Features Supported:
 * - Real-time post updates and voting
 * - Live comment threads and discussions
 * - Notification delivery and user presence
 * - Repository collaboration and snowball progress
 */
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

/**
 * Email Domain Configuration
 * 
 * Default email domain for ShadowNews email repository system.
 * Used for email parsing, repository creation, and snowball distribution.
 * 
 * Email Repository Features:
 * - Automatic email processing and categorization
 * - Repository creation from email domains
 * - Community-driven content curation through emails
 */
export const EMAIL_DOMAIN = process.env.REACT_APP_EMAIL_DOMAIN || '@artofdigitalshadow.org';

// ============================================================================
// Global API Configuration
// ============================================================================

/**
 * API Version Identifier
 * 
 * Current API version for endpoint routing and client compatibility.
 * Enables versioned API evolution and backward compatibility.
 */
export const API_VERSION = 'v1';

/**
 * Request Timeout Configuration
 * 
 * Default timeout for HTTP requests to prevent hanging connections
 * and ensure responsive user experience across platform features.
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * File Upload Limits
 * 
 * Maximum file size limits for various upload operations including
 * user avatars, CSV files, and media attachments.
 */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB - General file upload limit
export const MAX_CSV_ROWS = 10000;               // CSV processing row limit for email repositories
export const MAX_BATCH_SIZE = 100;               // Batch operation size for bulk API requests

// ============================================================================
// API Endpoints Configuration
// ============================================================================

/**
 * Comprehensive API Endpoints Mapping
 * 
 * Centralized definition of all API endpoints for the ShadowNews platform.
 * Organized by functional domains for maintainability and discoverability.
 * 
 * Endpoint Design Principles:
 * - RESTful resource-based URL structure
 * - Consistent naming conventions across all endpoints
 * - Parameterized functions for dynamic URL generation
 * - Hierarchical organization by feature domain
 * 
 * Usage Examples:
 * - Static endpoints: API_ENDPOINTS.AUTH.LOGIN
 * - Dynamic endpoints: API_ENDPOINTS.USERS.BY_ID('123')
 * - Nested resources: API_ENDPOINTS.REPOSITORIES.MEMBERS('repo-id')
 */
export const API_ENDPOINTS = {
  // ========================================================================
  // Authentication & Authorization Endpoints
  // ========================================================================
  
  /**
   * Authentication Endpoints
   * 
   * Handles user authentication, registration, and session management.
   * Supports traditional email/password auth and OAuth integrations.
   * 
   * Features:
   * - Email/password authentication with secure session management
   * - OAuth integration with Google, GitHub, and LinkedIn
   * - Two-factor authentication for enhanced security
   * - Email verification and password reset workflows
   * - Username and email availability checking
   */
  AUTH: {
    LOGIN: '/auth/login',                    // POST - User login with credentials
    REGISTER: '/auth/register',              // POST - New user registration
    LOGOUT: '/auth/logout',                  // POST - User session termination
    REFRESH: '/auth/refresh',                // POST - JWT token refresh
    VERIFY_EMAIL: '/auth/verify-email',      // POST - Email verification confirmation
    RESET_PASSWORD: '/auth/reset-password',  // POST - Password reset request
    CHANGE_PASSWORD: '/auth/change-password', // PUT - Password change with current password
    CHECK_USERNAME: '/auth/check-username',  // GET - Username availability check
    CHECK_EMAIL: '/auth/check-email',        // GET - Email availability check
    TWO_FACTOR: '/auth/2fa',                // POST - Two-factor authentication setup/verify
    
    /**
     * OAuth Authentication Endpoints
     * 
     * Third-party authentication providers for streamlined user onboarding.
     * Supports major platforms for developer and professional community integration.
     */
    OAUTH: {
      GOOGLE: '/auth/oauth/google',      // GET - Google OAuth authentication
      GITHUB: '/auth/oauth/github',      // GET - GitHub OAuth authentication  
      LINKEDIN: '/auth/oauth/linkedin'   // GET - LinkedIn OAuth authentication
    }
  },

  // ========================================================================
  // User Management Endpoints
  // ========================================================================
  
  /**
   * User Management Endpoints
   * 
   * Comprehensive user profile management, social features, and account settings.
   * Supports the ShadowNews karma system and community interaction features.
   * 
   * Features:
   * - User profile management with customizable settings
   * - Karma history tracking and achievement system
   * - Social following/follower relationships
   * - Privacy controls and notification preferences
   * - Avatar upload and profile customization
   */
  USERS: {
    BASE: '/users',                              // GET - User list with pagination
    PROFILE: '/users/profile',                   // GET/PUT - Current user profile
    BY_ID: (id: string) => `/users/${id}`,       // GET - User profile by ID
    UPDATE_PROFILE: '/users/profile/update',     // PUT - Update user profile information
    UPLOAD_AVATAR: '/users/avatar',              // POST - Upload user avatar image
    KARMA_HISTORY: '/users/karma/history',       // GET - User karma points history
    ACHIEVEMENTS: '/users/achievements',         // GET - User achievements and badges
    SETTINGS: '/users/settings',                 // GET/PUT - User account settings
    PRIVACY: '/users/privacy',                   // GET/PUT - Privacy preferences
    NOTIFICATIONS: '/users/notifications',       // GET/PUT - Notification settings
    BLOCKED: '/users/blocked',                   // GET/POST/DELETE - Blocked users management
    FOLLOW: (id: string) => `/users/${id}/follow`,      // POST - Follow another user
    UNFOLLOW: (id: string) => `/users/${id}/unfollow`,  // DELETE - Unfollow user
    FOLLOWERS: (id: string) => `/users/${id}/followers`, // GET - User's followers list
    FOLLOWING: (id: string) => `/users/${id}/following`  // GET - Users being followed
  },

  // ========================================================================
  // Content Management Endpoints - Posts
  // ========================================================================
  
  /**
   * Posts Management Endpoints
   * 
   * Core content creation, interaction, and discovery features for the
   * ShadowNews social platform. Supports voting, flagging, and analytics.
   * 
   * Features:
   * - Post creation with rich content support
   * - Community voting system (upvote/downvote)
   * - Content discovery through trending, hot, and top algorithms
   * - Hashtag-based categorization and search
   * - Content moderation and flagging system
   * - Post analytics and engagement metrics
   */
  POSTS: {
    BASE: '/posts',                                    // GET - Posts list with filters
    BY_ID: (id: string) => `/posts/${id}`,             // GET - Individual post details
    CREATE: '/posts/create',                           // POST - Create new post
    UPDATE: (id: string) => `/posts/${id}/update`,     // PUT - Update existing post
    DELETE: (id: string) => `/posts/${id}/delete`,     // DELETE - Remove post
    UPVOTE: (id: string) => `/posts/${id}/upvote`,     // POST - Upvote post
    DOWNVOTE: (id: string) => `/posts/${id}/downvote`, // POST - Downvote post
    UNVOTE: (id: string) => `/posts/${id}/unvote`,     // DELETE - Remove vote
    FLAG: (id: string) => `/posts/${id}/flag`,         // POST - Flag inappropriate content
    TRENDING: '/posts/trending',                       // GET - Trending posts algorithm
    HOT: '/posts/hot',                                 // GET - Hot posts based on recent activity
    NEW: '/posts/new',                                 // GET - Newest posts chronologically
    TOP: '/posts/top',                                 // GET - Top posts by vote score
    BY_HASHTAG: (tag: string) => `/posts/hashtag/${tag}`,     // GET - Posts by hashtag
    BY_USER: (userId: string) => `/posts/user/${userId}`,     // GET - Posts by specific user
    SEARCH: '/posts/search',                           // GET - Search posts with query
    RELATED: (id: string) => `/posts/${id}/related`,   // GET - Related posts recommendation
    ANALYTICS: (id: string) => `/posts/${id}/analytics` // GET - Post performance analytics
  },

  // ========================================================================
  // Content Management Endpoints - Comments
  // ========================================================================
  
  /**
   * Comments Management Endpoints
   * 
   * Threaded discussion system supporting nested comments, voting,
   * and moderation for community engagement on posts.
   * 
   * Features:
   * - Nested comment threads with unlimited depth
   * - Comment voting and reputation system
   * - Content moderation and flagging
   * - User comment history and analytics
   * - Thread-based organization for complex discussions
   */
  COMMENTS: {
    BASE: '/comments',                                      // GET - Comments list
    BY_POST: (postId: string) => `/posts/${postId}/comments`, // GET - Comments for specific post
    BY_ID: (id: string) => `/comments/${id}`,               // GET - Individual comment details
    CREATE: '/comments/create',                             // POST - Create new comment
    UPDATE: (id: string) => `/comments/${id}/update`,       // PUT - Update existing comment
    DELETE: (id: string) => `/comments/${id}/delete`,       // DELETE - Remove comment
    UPVOTE: (id: string) => `/comments/${id}/upvote`,       // POST - Upvote comment
    DOWNVOTE: (id: string) => `/comments/${id}/downvote`,   // POST - Downvote comment
    UNVOTE: (id: string) => `/comments/${id}/unvote`,       // DELETE - Remove vote
    FLAG: (id: string) => `/comments/${id}/flag`,           // POST - Flag inappropriate comment
    THREAD: (id: string) => `/comments/${id}/thread`,       // GET - Complete comment thread
    BY_USER: (userId: string) => `/comments/user/${userId}` // GET - Comments by specific user
  },

  // ========================================================================
  // Email Repository System Endpoints
  // ========================================================================
  
  /**
   * Repository Management Endpoints
   * 
   * Core email repository system for organizing and managing email-based
   * content communities. Supports the unique ShadowNews email-first approach.
   * 
   * Features:
   * - Email-based repository creation and management
   * - Community membership and collaboration tools
   * - Repository analytics and performance metrics
   * - Import/export functionality for data portability
   * - Topic-based organization and discovery
   * - Repository merging for community consolidation
   */
  REPOSITORIES: {
    BASE: '/repositories',                                     // GET - Repository list
    BY_ID: (id: string) => `/repositories/${id}`,             // GET - Repository details
    CREATE: '/repositories/create',                           // POST - Create new repository
    UPDATE: (id: string) => `/repositories/${id}/update`,     // PUT - Update repository settings
    DELETE: (id: string) => `/repositories/${id}/delete`,     // DELETE - Remove repository
    BY_USER: (userId: string) => `/repositories/user/${userId}`,      // GET - User's repositories
    BY_TOPIC: (topic: string) => `/repositories/topic/${topic}`,      // GET - Repositories by topic
    TRENDING: '/repositories/trending',                        // GET - Trending repositories
    SEARCH: '/repositories/search',                           // GET - Search repositories
    JOIN: (id: string) => `/repositories/${id}/join`,         // POST - Join repository community
    LEAVE: (id: string) => `/repositories/${id}/leave`,       // DELETE - Leave repository
    MEMBERS: (id: string) => `/repositories/${id}/members`,   // GET - Repository members list
    INVITE: (id: string) => `/repositories/${id}/invite`,     // POST - Invite users to repository
    MERGE: '/repositories/merge',                             // POST - Merge repositories
    STATS: (id: string) => `/repositories/${id}/stats`,       // GET - Repository statistics
    EXPORT: (id: string) => `/repositories/${id}/export`,     // GET - Export repository data
    IMPORT: (id: string) => `/repositories/${id}/import`,     // POST - Import repository data
    SETTINGS: (id: string) => `/repositories/${id}/settings`, // GET/PUT - Repository configuration
    ANALYTICS: (id: string) => `/repositories/${id}/analytics` // GET - Repository analytics
  },

  // ========================================================================
  // Email Processing & Communication Endpoints
  // ========================================================================
  
  /**
   * Email System Endpoints
   * 
   * Email processing pipeline for the ShadowNews email-first social platform.
   * Handles email parsing, repository integration, and notification delivery.
   * 
   * Features:
   * - Incoming email parsing and content extraction
   * - Email template management for notifications
   * - Digest subscription and delivery system
   * - Email verification and anti-spam measures
   * - Webhook integration for external email services
   * - Preference management for personalized communication
   */
  EMAIL: {
    SEND: '/email/send',                 // POST - Send email notification
    PARSE: '/email/parse',               // POST - Parse incoming email content
    WEBHOOK: '/email/webhook',           // POST - Webhook for email service integration
    VERIFY: '/email/verify',             // POST - Verify email address ownership
    UNSUBSCRIBE: '/email/unsubscribe',   // GET/POST - Unsubscribe from emails
    PREFERENCES: '/email/preferences',   // GET/PUT - Email communication preferences
    
    /**
     * Email Digest System
     * 
     * Automated digest delivery system for community updates and content summaries.
     * Supports personalized content curation and scheduling preferences.
     */
    DIGEST: {
      SUBSCRIBE: '/email/digest/subscribe',     // POST - Subscribe to digest emails
      UNSUBSCRIBE: '/email/digest/unsubscribe', // DELETE - Unsubscribe from digests
      PREVIEW: '/email/digest/preview',         // GET - Preview digest content
      SETTINGS: '/email/digest/settings'        // GET/PUT - Digest delivery preferences
    },
    
    /**
     * Email Template Management
     * 
     * Template system for consistent email design and content management.
     * Supports dynamic content injection and multi-language templates.
     */
    TEMPLATES: {
      LIST: '/email/templates',                              // GET - Available email templates
      BY_ID: (id: string) => `/email/templates/${id}`,       // GET - Specific template details
      CREATE: '/email/templates/create',                     // POST - Create new template
      UPDATE: (id: string) => `/email/templates/${id}/update`, // PUT - Update template
      DELETE: (id: string) => `/email/templates/${id}/delete`  // DELETE - Remove template
    }
  },

  // ========================================================================
  // CSV Processing & Data Import Endpoints
  // ========================================================================
  
  /**
   * CSV Processing Endpoints
   * 
   * Bulk data processing system for email repository creation and management.
   * Supports large-scale email import and validation workflows.
   * 
   * Features:
   * - CSV file upload and validation
   * - Asynchronous batch processing with progress tracking
   * - Data export functionality for repository backup
   * - Processing history and audit trails
   * - Template generation for proper CSV format
   */
  CSV: {
    UPLOAD: '/csv/upload',                        // POST - Upload CSV file for processing
    PARSE: '/csv/parse',                          // POST - Parse and validate CSV data
    VALIDATE: '/csv/validate',                    // POST - Validate CSV format and content
    PROCESS: '/csv/process',                      // POST - Process validated CSV data
    EXPORT: '/csv/export',                        // GET - Export data in CSV format
    TEMPLATES: '/csv/templates',                  // GET - Download CSV templates
    HISTORY: '/csv/history',                      // GET - Processing history and logs
    STATUS: (jobId: string) => `/csv/status/${jobId}` // GET - Check processing job status
  },

  // ========================================================================
  // Snowball Distribution System Endpoints
  // ========================================================================
  
  /**
   * Snowball Distribution Endpoints
   * 
   * Community-driven content distribution algorithm unique to ShadowNews.
   * Implements the "snowball effect" for organic content amplification.
   * 
   * Features:
   * - Snowball initiation for viral content distribution
   * - Real-time progress tracking and analytics
   * - Community approval/rejection mechanisms
   * - Historical snowball analysis and insights
   * - Configuration management for distribution parameters
   */
  SNOWBALL: {
    INITIATE: '/snowball/initiate',                  // POST - Start snowball distribution
    STATUS: (id: string) => `/snowball/status/${id}`, // GET - Track snowball progress
    HISTORY: '/snowball/history',                    // GET - Historical snowball data
    ANALYTICS: '/snowball/analytics',                // GET - Snowball performance metrics
    SETTINGS: '/snowball/settings',                  // GET/PUT - Distribution configuration
    PREVIEW: '/snowball/preview',                    // GET - Preview snowball potential
    APPROVE: (id: string) => `/snowball/approve/${id}`, // POST - Approve snowball distribution
    REJECT: (id: string) => `/snowball/reject/${id}`    // POST - Reject snowball distribution
  },

  // ========================================================================
  // AI & Machine Learning Integration Endpoints
  // ========================================================================
  
  /**
   * AI-Powered Features Endpoints
   * 
   * Machine learning integration for content analysis, moderation,
   * and intelligent community features throughout the platform.
   * 
   * Features:
   * - Automated hashtag suggestions for content categorization
   * - Content summarization for quick consumption
   * - Topic extraction and trend analysis
   * - Content moderation and safety filtering
   * - Similarity detection for related content discovery
   * - Sentiment analysis for community mood tracking
   */
  AI: {
    SUGGEST_HASHTAGS: '/ai/hashtags/suggest',  // POST - Generate hashtag suggestions
    SUMMARIZE: '/ai/summarize',                // POST - Summarize long content
    EXTRACT_TOPICS: '/ai/topics/extract',      // POST - Extract topics from content
    GENERATE_TITLE: '/ai/title/generate',      // POST - Generate content titles
    MODERATE_CONTENT: '/ai/moderate',          // POST - AI content moderation
    SIMILAR_POSTS: '/ai/posts/similar',        // POST - Find similar posts
    TRENDING_TOPICS: '/ai/topics/trending',    // GET - AI-detected trending topics
    SENTIMENT: '/ai/sentiment',                // POST - Analyze content sentiment
    TRANSLATE: '/ai/translate'                 // POST - Translate content
  },

  // ========================================================================
  // Search & Discovery Endpoints
  // ========================================================================
  
  /**
   * Search System Endpoints
   * 
   * Comprehensive search and content discovery system supporting
   * global search across all platform content and entities.
   * 
   * Features:
   * - Global search across posts, users, and repositories
   * - Advanced search with filters and sorting options
   * - Search autocomplete and suggestions
   * - Search history tracking for personalization
   * - Trending search terms and topic discovery
   */
  SEARCH: {
    GLOBAL: '/search',                     // GET - Global search across all content
    POSTS: '/search/posts',                // GET - Search posts specifically
    USERS: '/search/users',                // GET - Search users and profiles
    REPOSITORIES: '/search/repositories',  // GET - Search email repositories
    HASHTAGS: '/search/hashtags',          // GET - Search hashtags and topics
    AUTOCOMPLETE: '/search/autocomplete',  // GET - Search autocomplete suggestions
    ADVANCED: '/search/advanced',          // GET - Advanced search with filters
    HISTORY: '/search/history',            // GET - User search history
    TRENDING: '/search/trending'           // GET - Trending search terms
  },

  // ========================================================================
  // Analytics & Insights Endpoints
  // ========================================================================
  
  /**
   * Analytics System Endpoints
   * 
   * Comprehensive analytics and insights for users, content creators,
   * and platform administrators to understand engagement and growth.
   * 
   * Features:
   * - User engagement metrics and activity tracking
   * - Content performance analytics and insights
   * - Repository growth and community health metrics
   * - Platform-wide analytics dashboard
   * - Data export functionality for external analysis
   */
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',     // GET - Main analytics dashboard
    POSTS: '/analytics/posts',             // GET - Post performance analytics
    USERS: '/analytics/users',             // GET - User engagement analytics
    REPOSITORIES: '/analytics/repositories', // GET - Repository analytics
    ENGAGEMENT: '/analytics/engagement',   // GET - Community engagement metrics
    GROWTH: '/analytics/growth',           // GET - Platform growth analytics
    EXPORT: '/analytics/export'            // GET - Export analytics data
  },

  // ========================================================================
  // Administration & Moderation Endpoints
  // ========================================================================
  
  /**
   * Admin Management Endpoints
   * 
   * Administrative tools for platform management, content moderation,
   * and system monitoring. Restricted to admin user roles.
   * 
   * Features:
   * - User management and moderation tools
   * - Content moderation and policy enforcement
   * - System monitoring and health checks
   * - Bulk operations for administrative efficiency
   * - Audit logs and administrative reporting
   */
  ADMIN: {
    DASHBOARD: '/admin/dashboard',         // GET - Admin dashboard overview
    USERS: '/admin/users',                 // GET/PUT/DELETE - User management
    POSTS: '/admin/posts',                 // GET/PUT/DELETE - Content management
    REPORTS: '/admin/reports',             // GET - User reports and flags
    SETTINGS: '/admin/settings',           // GET/PUT - Platform settings
    LOGS: '/admin/logs',                   // GET - System and audit logs
    MODERATION: '/admin/moderation',       // GET/PUT - Content moderation queue
    BULK_ACTIONS: '/admin/bulk-actions'    // POST - Bulk administrative operations
  },

  // ========================================================================
  // Notification System Endpoints
  // ========================================================================
  
  /**
   * Notification Management Endpoints
   * 
   * Real-time notification system for user engagement and platform
   * communication. Supports multiple notification channels and preferences.
   * 
   * Features:
   * - Real-time notification delivery and management
   * - Notification preference configuration
   * - Read/unread status tracking
   * - Bulk notification operations
   * - Subscription management for notification types
   */
  NOTIFICATIONS: {
    BASE: '/notifications',                              // GET - User notifications list
    UNREAD: '/notifications/unread',                     // GET - Unread notifications count
    MARK_READ: (id: string) => `/notifications/${id}/read`, // PUT - Mark notification as read
    MARK_ALL_READ: '/notifications/read-all',            // PUT - Mark all notifications read
    DELETE: (id: string) => `/notifications/${id}/delete`, // DELETE - Remove notification
    SETTINGS: '/notifications/settings',                 // GET/PUT - Notification preferences
    SUBSCRIBE: '/notifications/subscribe',               // POST - Subscribe to notifications
    UNSUBSCRIBE: '/notifications/unsubscribe'            // DELETE - Unsubscribe from notifications
  }
} as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

/**
 * Standardized HTTP Status Codes
 * 
 * Comprehensive mapping of HTTP status codes used throughout the ShadowNews
 * platform for consistent API response handling and error management.
 * 
 * Categories:
 * - 2xx Success: Successful request processing and completion
 * - 4xx Client Error: Client-side errors and invalid requests
 * - 5xx Server Error: Server-side errors and system failures
 * 
 * Usage:
 * - API response status validation
 * - Error handling and user feedback
 * - Logging and monitoring systems
 * - Client-side response processing
 */
export const HTTP_STATUS = {
  // Success Responses (2xx)
  OK: 200,                    // Standard successful request
  CREATED: 201,               // Resource successfully created
  ACCEPTED: 202,              // Request accepted for processing
  NO_CONTENT: 204,            // Successful request with no content to return
  
  // Client Error Responses (4xx)
  BAD_REQUEST: 400,           // Invalid request syntax or parameters
  UNAUTHORIZED: 401,          // Authentication required or failed
  FORBIDDEN: 403,             // Access denied despite valid authentication
  NOT_FOUND: 404,             // Requested resource does not exist
  CONFLICT: 409,              // Request conflicts with current state
  UNPROCESSABLE_ENTITY: 422,  // Request syntax valid but semantically incorrect
  TOO_MANY_REQUESTS: 429,     // Rate limit exceeded
  
  // Server Error Responses (5xx)
  INTERNAL_SERVER_ERROR: 500, // Generic server error
  BAD_GATEWAY: 502,           // Invalid response from upstream server
  SERVICE_UNAVAILABLE: 503,   // Service temporarily unavailable
  GATEWAY_TIMEOUT: 504        // Upstream server timeout
} as const;

// ============================================================================
// Application Error Codes
// ============================================================================

/**
 * Application-Specific Error Codes
 * 
 * Standardized error codes for precise error identification and handling
 * across the ShadowNews platform. Enables detailed error reporting and
 * user-friendly error messages.
 * 
 * Error Code Structure:
 * - Prefix indicates functional domain (AUTH, USER, POST, etc.)
 * - Three-digit suffix for specific error identification
 * - Consistent naming convention for maintainability
 * 
 * Benefits:
 * - Precise error identification for debugging
 * - Internationalization support for error messages
 * - Analytics and monitoring of specific error patterns
 * - Automated error handling and recovery
 */
export const ERROR_CODES = {
  // Authentication & Authorization Errors (AUTH)
  INVALID_CREDENTIALS: 'AUTH001',    // Wrong username/password combination
  TOKEN_EXPIRED: 'AUTH002',          // JWT token has expired
  TOKEN_INVALID: 'AUTH003',          // JWT token is malformed or invalid
  USER_NOT_VERIFIED: 'AUTH004',      // Email verification required
  USER_BLOCKED: 'AUTH005',           // User account is blocked or suspended
  
  // User Management Errors (USER)
  USER_NOT_FOUND: 'USER001',         // Requested user does not exist
  USERNAME_TAKEN: 'USER002',         // Username already in use
  EMAIL_TAKEN: 'USER003',            // Email address already registered
  INVALID_EMAIL: 'USER004',          // Email format is invalid
  
  // Post & Content Errors (POST)
  POST_NOT_FOUND: 'POST001',         // Requested post does not exist
  POST_DELETED: 'POST002',           // Post has been deleted
  ALREADY_VOTED: 'POST003',          // User has already voted on this post
  
  // Repository System Errors (REPO)
  REPOSITORY_NOT_FOUND: 'REPO001',   // Requested repository does not exist
  REPOSITORY_FULL: 'REPO002',        // Repository has reached member limit
  NOT_MEMBER: 'REPO003',             // User is not a repository member
  ALREADY_MEMBER: 'REPO004',         // User is already a repository member
  
  // Email Processing Errors (EMAIL)
  EMAIL_SEND_FAILED: 'EMAIL001',     // Email delivery failed
  INVALID_EMAIL_FORMAT: 'EMAIL002',  // Email format validation failed
  EMAIL_NOT_VERIFIED: 'EMAIL003',    // Email address not verified
  
  // CSV Processing Errors (CSV)
  CSV_PARSE_ERROR: 'CSV001',         // CSV file parsing failed
  CSV_TOO_LARGE: 'CSV002',           // CSV file exceeds size limit
  CSV_INVALID_FORMAT: 'CSV003',      // CSV format does not match requirements
  
  // General System Errors (GEN)
  VALIDATION_ERROR: 'GEN001',        // Input validation failed
  RATE_LIMIT_EXCEEDED: 'GEN002',     // API rate limit exceeded
  SERVER_ERROR: 'GEN003',            // Internal server error
  NOT_FOUND: 'GEN004',               // Generic resource not found
  FORBIDDEN: 'GEN005'                // Generic access forbidden
} as const;

// ============================================================================
// WebSocket Events
// ============================================================================

/**
 * Real-Time WebSocket Events
 * 
 * Event definitions for real-time communication between client and server.
 * Enables live updates, notifications, and collaborative features.
 * 
 * Event Categories:
 * - Connection: WebSocket connection lifecycle management
 * - Content: Real-time updates for posts, comments, and repositories
 * - User: User presence and activity notifications
 * - Notifications: Real-time notification delivery
 * - Snowball: Live snowball distribution progress
 * 
 * Real-Time Features:
 * - Live post voting and comment updates
 * - Real-time notification delivery
 * - User presence and typing indicators
 * - Collaborative repository management
 * - Live snowball distribution tracking
 */
export const WS_EVENTS = {
  // Connection Lifecycle Events
  CONNECT: 'connect',                    // WebSocket connection established
  DISCONNECT: 'disconnect',              // WebSocket connection terminated
  ERROR: 'error',                        // WebSocket error occurred
  RECONNECT: 'reconnect',                // WebSocket reconnection attempt
  
  // Post Real-Time Events
  POST_CREATED: 'post:created',          // New post created
  POST_UPDATED: 'post:updated',          // Post content or metadata updated
  POST_DELETED: 'post:deleted',          // Post removed from platform
  POST_VOTED: 'post:voted',              // Post vote count changed
  
  // Comment Real-Time Events
  COMMENT_CREATED: 'comment:created',    // New comment added to post
  COMMENT_UPDATED: 'comment:updated',    // Comment content modified
  COMMENT_DELETED: 'comment:deleted',    // Comment removed from thread
  COMMENT_VOTED: 'comment:voted',        // Comment vote count changed
  
  // Repository Real-Time Events
  REPOSITORY_UPDATED: 'repository:updated',           // Repository settings changed
  REPOSITORY_MEMBER_JOINED: 'repository:member:joined',  // New member joined
  REPOSITORY_MEMBER_LEFT: 'repository:member:left',      // Member left repository
  REPOSITORY_EMAIL_ADDED: 'repository:email:added',      // New email processed
  
  // Notification Real-Time Events
  NOTIFICATION_NEW: 'notification:new',   // New notification created
  NOTIFICATION_READ: 'notification:read', // Notification marked as read
  
  // User Presence Events
  USER_ONLINE: 'user:online',            // User came online
  USER_OFFLINE: 'user:offline',          // User went offline
  USER_TYPING: 'user:typing',            // User is typing (comments/posts)
  
  // Snowball Distribution Events
  SNOWBALL_STARTED: 'snowball:started',     // Snowball distribution initiated
  SNOWBALL_PROGRESS: 'snowball:progress',   // Snowball distribution progress update
  SNOWBALL_COMPLETED: 'snowball:completed'  // Snowball distribution completed
} as const;

// ============================================================================
// Pagination Configuration
// ============================================================================

/**
 * Pagination Settings
 * 
 * Standardized pagination parameters for consistent API responses
 * and optimal performance across different content types.
 * 
 * Performance Considerations:
 * - Balanced page sizes for optimal loading times
 * - Maximum limits to prevent resource exhaustion
 * - Content-specific optimizations for different data types
 * - Mobile-friendly pagination for responsive design
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,           // Starting page number for pagination
  DEFAULT_LIMIT: 20,         // Default items per page
  MAX_LIMIT: 100,            // Maximum items per page to prevent abuse
  POSTS_PER_PAGE: 30,        // Optimal posts per page for feed display
  COMMENTS_PER_PAGE: 50,     // Comments per page for threaded discussions
  USERS_PER_PAGE: 20,        // Users per page for directory listings
  REPOSITORIES_PER_PAGE: 15, // Repositories per page for discovery
  EMAILS_PER_PAGE: 100       // Emails per page for repository management
} as const;

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

/**
 * API Rate Limiting Configuration
 * 
 * Rate limiting rules to protect the platform from abuse while ensuring
 * fair usage for legitimate users. Prevents spam and resource exhaustion.
 * 
 * Rate Limit Structure:
 * - WINDOW: Time window in milliseconds for rate limit calculation
 * - MAX: Maximum requests allowed within the time window
 * 
 * Protection Categories:
 * - Authentication: Prevents brute force attacks
 * - Content Creation: Prevents spam and content flooding
 * - API Access: Ensures fair resource distribution
 * - File Uploads: Prevents storage abuse
 * - AI Services: Manages computational resource usage
 */
export const RATE_LIMITS = {
  // Authentication Rate Limits
  AUTH: {
    LOGIN: { WINDOW: 900000, MAX: 5 },         // 15 minutes, 5 login attempts
    REGISTER: { WINDOW: 3600000, MAX: 3 },     // 1 hour, 3 registration attempts
    PASSWORD_RESET: { WINDOW: 3600000, MAX: 3 } // 1 hour, 3 password reset attempts
  },
  
  // General API Rate Limits
  API: {
    DEFAULT: { WINDOW: 60000, MAX: 100 },      // 1 minute, 100 general requests
    POSTS: { WINDOW: 60000, MAX: 30 },         // 1 minute, 30 post operations
    COMMENTS: { WINDOW: 60000, MAX: 60 },      // 1 minute, 60 comment operations
    UPLOADS: { WINDOW: 300000, MAX: 10 },      // 5 minutes, 10 file uploads
    EMAILS: { WINDOW: 3600000, MAX: 50 },      // 1 hour, 50 email operations
    AI: { WINDOW: 60000, MAX: 20 }             // 1 minute, 20 AI service requests
  }
} as const;

// ============================================================================
// Caching Configuration
// ============================================================================

/**
 * Cache Key Templates and TTL Configuration
 * 
 * Standardized caching strategy for performance optimization across
 * the ShadowNews platform. Defines cache keys and expiration times.
 * 
 * Cache Strategy:
 * - Parameterized cache keys for consistent naming
 * - TTL optimization based on data volatility
 * - Hierarchical cache invalidation support
 * - Memory-efficient cache key generation
 * 
 * Performance Benefits:
 * - Reduced database queries for frequently accessed data
 * - Improved response times for common operations
 * - Lower server resource utilization
 * - Enhanced user experience with faster loading
 */
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,                           // Individual user data cache
  POST: (id: string) => `post:${id}`,                           // Individual post data cache
  POSTS_LIST: (type: string, page: number) => `posts:${type}:${page}`, // Paginated post lists
  REPOSITORY: (id: string) => `repository:${id}`,               // Repository data cache
  TRENDING_HASHTAGS: 'hashtags:trending',                       // Trending hashtags cache
  USER_KARMA: (id: string) => `karma:${id}`,                    // User karma points cache
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`   // User notifications cache
} as const;

/**
 * Cache Time-To-Live (TTL) Configuration
 * 
 * Cache expiration times optimized for different data types and usage patterns.
 * Balances data freshness with performance benefits.
 * 
 * TTL Categories:
 * - SHORT: Frequently changing data requiring fresh updates
 * - MEDIUM: Moderately stable data with occasional updates
 * - LONG: Stable data with infrequent changes
 * - VERY_LONG: Static or rarely changing data
 */
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes - Frequently updated data (notifications, live counters)
  MEDIUM: 1800,    // 30 minutes - Moderately stable data (user profiles, post lists)
  LONG: 3600,      // 1 hour - Stable data (repository settings, user preferences)
  VERY_LONG: 86400 // 24 hours - Static data (trending topics, popular content)
} as const;
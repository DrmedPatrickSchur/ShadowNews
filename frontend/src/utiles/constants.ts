/**
 * @fileoverview Application Constants and Configuration Values
 * 
 * Central configuration file containing all application constants, routes, endpoints,
 * and configuration values for the ShadowNews email-first social platform.
 * 
 * ## Architecture Overview
 * 
 * This constants file serves as the single source of truth for all static
 * configuration values used throughout the ShadowNews application. It provides
 * type-safe constants for API endpoints, routes, limits, permissions, and
 * feature toggles.
 * 
 * ## Key Features
 * 
 * ### 🌐 API & Routes Configuration
 * - Centralized API endpoint management
 * - Type-safe route definitions
 * - Environment-aware URL configuration
 * 
 * ### 🎯 Business Logic Constants
 * - Karma system configuration and milestones
 * - User permission levels and requirements
 * - Email platform specific commands and workflows
 * 
 * ### 📊 Limits & Validation
 * - Content length limits and validation rules
 * - Rate limiting and pagination settings
 * - File upload constraints and processing limits
 * 
 * ### 🔧 System Configuration
 * - WebSocket event definitions
 * - Local storage key management
 * - Feature flags and experimental features
 * 
 * ### 🎨 UI/UX Constants
 * - Theme options and styling constants
 * - Sort options and filtering preferences
 * - Notification types and messaging
 * 
 * ## Email Platform Integration
 * 
 * ShadowNews uniquely combines traditional social features with email-first
 * interactions, requiring specialized constants for:
 * 
 * - **Email Commands**: POST, COMMENT, UPVOTE, REPOSITORY management
 * - **Repository Types**: Public, private, invite-only email collections
 * - **Snowball System**: Viral email distribution and growth tracking
 * - **Digest Frequency**: Customizable email notification preferences
 * 
 * ## Type Safety
 * 
 * All constants use TypeScript's `as const` assertion for literal type
 * inference, providing compile-time safety and better IDE support.
 * 
 * ## Usage Patterns
 * 
 * ```typescript
 * // API endpoints
 * const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.POSTS}`);
 * 
 * // Route navigation
 * navigate(ROUTES.REPOSITORY_DETAIL.replace(':id', repositoryId));
 * 
 * // Permission checks
 * if (userKarma >= USER_PERMISSIONS.CREATE_REPOSITORY) {
 *   // Allow repository creation
 * }
 * 
 * // Validation
 * if (title.length > MAX_LIMITS.POST_TITLE_LENGTH) {
 *   // Show error
 * }
 * ```
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-01-27
 */

/* =============================================================================
   Environment Configuration
   Base URLs and environment-specific settings
   ============================================================================= */

/**
 * API Base URL
 * Primary backend API endpoint for all HTTP requests
 * 
 * @const {string} API_BASE_URL
 * @description Main API server URL with environment fallback
 * 
 * Environment Variables:
 * - Production: Configured via REACT_APP_API_URL
 * - Development: Defaults to localhost:5000/api
 * - Testing: Can be overridden for integration tests
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * WebSocket Base URL
 * Real-time communication endpoint for live updates
 * 
 * @const {string} WS_BASE_URL
 * @description WebSocket server URL for real-time features
 * 
 * Real-time Features:
 * - Live post updates and voting
 * - Real-time comment notifications
 * - Repository growth tracking
 * - User presence and activity
 */
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

/**
 * Application Branding
 * Core application identity and messaging
 */

/** Application name displayed throughout the platform */
export const APP_NAME = 'Shadownews';

/** Marketing tagline emphasizing community growth and viral distribution */
export const APP_TAGLINE = 'Where Ideas Snowball Into Communities';

/** Email domain for platform-specific email addresses and repositories */
export const APP_EMAIL_DOMAIN = '@shadownews.community';

/* =============================================================================
   Application Routes
   Client-side routing paths and navigation structure
   ============================================================================= */

/**
 * Application Routes Configuration
 * Centralized route definitions for React Router navigation
 * 
 * @const {Object} ROUTES
 * @description Complete routing map for ShadowNews application
 * 
 * Route Categories:
 * - **Authentication**: Login, register, password management
 * - **Content**: Posts, comments, submissions
 * - **Repositories**: Email collection management
 * - **User**: Profiles, settings, personalization
 * - **Discovery**: Trending, search, filtering
 * - **Legal**: Privacy policy, terms of service
 * 
 * Dynamic Routes:
 * - `:id` - Resource identifiers (posts, repositories)
 * - `:username` - User profile identification
 * - `:token` - Authentication and verification tokens
 * 
 * Usage:
 * ```typescript
 * // Static routes
 * navigate(ROUTES.TRENDING);
 * 
 * // Dynamic routes
 * navigate(ROUTES.POST_DETAIL.replace(':id', postId));
 * navigate(ROUTES.PROFILE.replace(':username', username));
 * ```
 */
export const ROUTES = {
  /** Home page - main feed and landing */
  HOME: '/',
  
  /** Authentication routes */
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  EMAIL_VERIFY: '/verify-email/:token',
  
  /** Content discovery and browsing */
  POSTS: '/posts',
  POST_DETAIL: '/posts/:id',
  SUBMIT: '/submit',
  TRENDING: '/trending',
  NEW: '/new',
  TOP: '/top',
  
  /** Email repository management */
  REPOSITORIES: '/repositories',
  REPOSITORY_DETAIL: '/repositories/:id',
  
  /** User management and personalization */
  PROFILE: '/u/:username',
  SETTINGS: '/settings',
  
  /** Platform information and legal */
  ABOUT: '/about',
  API_DOCS: '/api-docs',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

/* =============================================================================
   API Endpoints
   Backend service endpoints for HTTP communication
   ============================================================================= */

/**
 * API Endpoints Configuration
 * Comprehensive backend API endpoint definitions
 * 
 * @const {Object} API_ENDPOINTS
 * @description RESTful API endpoints for all backend services
 * 
 * Endpoint Categories:
 * - **Authentication**: User login, registration, verification
 * - **User Management**: Profiles, avatars, user content
 * - **Content Operations**: Posts, comments, voting systems
 * - **Repository Services**: Email collections, CSV operations
 * - **Email Platform**: Sending, posting, digest management
 * - **Search & Discovery**: Content search across all resources
 * - **Analytics**: Performance metrics and user insights
 * 
 * Parameter Patterns:
 * - `:id` - Primary resource identifier
 * - `:userId` - User identification
 * - `:postId` - Post identification
 * - `:username` - Human-readable user identifier
 * - `:tag` - Hashtag name without # symbol
 * - `:token` - Authentication or verification token
 * 
 * Usage Examples:
 * ```typescript
 * // Simple endpoint
 * fetch(`${API_BASE_URL}${API_ENDPOINTS.POSTS}`);
 * 
 * // Parameterized endpoint
 * const url = `${API_BASE_URL}${API_ENDPOINTS.POST_BY_ID.replace(':id', postId)}`;
 * fetch(url);
 * ```
 */
export const API_ENDPOINTS = {
  /* -------------------------------------------------------------------------
     Authentication Endpoints
     User authentication, verification, and session management
     ------------------------------------------------------------------------- */
  
  /** User login with credentials */
  LOGIN: '/auth/login',
  
  /** New user registration */
  REGISTER: '/auth/register',
  
  /** User logout and session termination */
  LOGOUT: '/auth/logout',
  
  /** JWT token refresh for session extension */
  REFRESH_TOKEN: '/auth/refresh',
  
  /** Email address verification confirmation */
  VERIFY_EMAIL: '/auth/verify-email',
  
  /** Password reset request initiation */
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  /** Password reset completion with token */
  RESET_PASSWORD: '/auth/reset-password',
  
  /* -------------------------------------------------------------------------
     User Management Endpoints
     Profile management, user content, and account operations
     ------------------------------------------------------------------------- */
  
  /** Current user profile information */
  PROFILE: '/users/profile',
  
  /** Public user profile by username */
  USER_BY_USERNAME: '/users/:username',
  
  /** Update current user profile */
  UPDATE_PROFILE: '/users/profile',
  
  /** Upload user avatar image */
  UPLOAD_AVATAR: '/users/avatar',
  
  /** User's submitted posts */
  USER_POSTS: '/users/:userId/posts',
  
  /** User's posted comments */
  USER_COMMENTS: '/users/:userId/comments',
  
  /** User's created repositories */
  USER_REPOSITORIES: '/users/:userId/repositories',
  
  /* -------------------------------------------------------------------------
     Post Management Endpoints
     Content creation, interaction, and voting
     ------------------------------------------------------------------------- */
  
  /** All posts with pagination and filtering */
  POSTS: '/posts',
  
  /** Individual post by ID */
  POST_BY_ID: '/posts/:id',
  
  /** Create new post */
  CREATE_POST: '/posts',
  
  /** Update existing post */
  UPDATE_POST: '/posts/:id',
  
  /** Delete post */
  DELETE_POST: '/posts/:id',
  
  /** Upvote post */
  UPVOTE_POST: '/posts/:id/upvote',
  
  /** Downvote post */
  DOWNVOTE_POST: '/posts/:id/downvote',
  
  /* -------------------------------------------------------------------------
     Comment System Endpoints
     Discussion threading and comment management
     ------------------------------------------------------------------------- */
  
  /** All comments (admin/moderation) */
  COMMENTS: '/comments',
  
  /** Comments for specific post */
  POST_COMMENTS: '/posts/:postId/comments',
  
  /** Create new comment */
  CREATE_COMMENT: '/comments',
  
  /** Update existing comment */
  UPDATE_COMMENT: '/comments/:id',
  
  /** Delete comment */
  DELETE_COMMENT: '/comments/:id',
  
  /** Upvote comment */
  UPVOTE_COMMENT: '/comments/:id/upvote',
  
  /** Downvote comment */
  DOWNVOTE_COMMENT: '/comments/:id/downvote',
  
  /* -------------------------------------------------------------------------
     Repository Management Endpoints
     Email collection operations and CSV processing
     ------------------------------------------------------------------------- */
  
  /** All repositories with pagination */
  REPOSITORIES: '/repositories',
  
  /** Individual repository by ID */
  REPOSITORY_BY_ID: '/repositories/:id',
  
  /** Create new email repository */
  CREATE_REPOSITORY: '/repositories',
  
  /** Update repository metadata */
  UPDATE_REPOSITORY: '/repositories/:id',
  
  /** Delete repository */
  DELETE_REPOSITORY: '/repositories/:id',
  
  /** List emails in repository */
  REPOSITORY_EMAILS: '/repositories/:id/emails',
  
  /** Add emails to repository */
  ADD_EMAILS: '/repositories/:id/emails',
  
  /** Remove specific email from repository */
  REMOVE_EMAIL: '/repositories/:id/emails/:emailId',
  
  /** Upload CSV file to repository */
  UPLOAD_CSV: '/repositories/:id/upload-csv',
  
  /** Download repository as CSV */
  DOWNLOAD_CSV: '/repositories/:id/download-csv',
  
  /** Repository analytics and statistics */
  REPOSITORY_STATS: '/repositories/:id/stats',
  
  /* -------------------------------------------------------------------------
     Email Platform Endpoints
     Email-first social features and distribution
     ------------------------------------------------------------------------- */
  
  /** Send individual email */
  SEND_EMAIL: '/email/send',
  
  /** Convert email to post */
  EMAIL_TO_POST: '/email/post',
  
  /** Generate and send digest emails */
  EMAIL_DIGEST: '/email/digest',
  
  /** User email notification preferences */
  EMAIL_PREFERENCES: '/email/preferences',
  
  /** Unsubscribe from emails via token */
  UNSUBSCRIBE: '/email/unsubscribe/:token',
  
  /* -------------------------------------------------------------------------
     Search and Discovery Endpoints
     Content search across all platform resources
     ------------------------------------------------------------------------- */
  
  /** Global search across all content */
  SEARCH: '/search',
  
  /** Search posts specifically */
  SEARCH_POSTS: '/search/posts',
  
  /** Search users by username or bio */
  SEARCH_USERS: '/search/users',
  
  /** Search email repositories */
  SEARCH_REPOSITORIES: '/search/repositories',
  
  /** Search hashtags and topics */
  SEARCH_HASHTAGS: '/search/hashtags',
  
  /* -------------------------------------------------------------------------
     Hashtag and Topic Endpoints
     Topic discovery and following functionality
     ------------------------------------------------------------------------- */
  
  /** Currently trending hashtags */
  TRENDING_HASHTAGS: '/hashtags/trending',
  
  /** Posts tagged with specific hashtag */
  HASHTAG_POSTS: '/hashtags/:tag/posts',
  
  /** Follow hashtag for notifications */
  FOLLOW_HASHTAG: '/hashtags/:tag/follow',
  
  /** Unfollow hashtag */
  UNFOLLOW_HASHTAG: '/hashtags/:tag/unfollow',
  
  /* -------------------------------------------------------------------------
     Analytics Endpoints
     Performance metrics and insights
     ------------------------------------------------------------------------- */
  
  /** Individual post analytics */
  POST_ANALYTICS: '/analytics/posts/:id',
  
  /** Repository performance metrics */
  REPOSITORY_ANALYTICS: '/analytics/repositories/:id',
  
  /** User activity and engagement analytics */
  USER_ANALYTICS: '/analytics/users/:id',
} as const;

/* =============================================================================
   Karma System Configuration
   Community reputation and achievement system
   ============================================================================= */

/**
 * Karma Milestones
 * Progressive achievement levels based on community contribution
 * 
 * @const {Object} KARMA_MILESTONES
 * @description Reputation thresholds that unlock features and recognition
 * 
 * Milestone Benefits:
 * - **Recognition**: Status badges and community standing
 * - **Permissions**: Progressive feature access and capabilities
 * - **Trust**: Increased voting weight and moderation abilities
 * - **Exclusive Access**: Advanced features and API access
 * 
 * Progression Philosophy:
 * - Encourage positive community participation
 * - Reward consistent high-quality contributions
 * - Create aspirational goals for user engagement
 * - Balance accessibility with exclusivity
 * 
 * Usage:
 * ```typescript
 * // Check milestone eligibility
 * const userMilestone = Object.entries(KARMA_MILESTONES)
 *   .reverse()
 *   .find(([name, threshold]) => userKarma >= threshold);
 * ```
 */
export const KARMA_MILESTONES = {
  /** New user starting journey - 0 karma */
  NEWBIE: 0,
  
  /** Email verified, basic credibility - 10 karma */
  VERIFIED: 10,
  
  /** Regular contributor with community engagement - 50 karma */
  CONTRIBUTOR: 50,
  
  /** Active community member with consistent participation - 100 karma */
  ACTIVE_MEMBER: 100,
  
  /** Trusted user with proven track record - 250 karma */
  TRUSTED_USER: 250,
  
  /** Power user with significant influence - 500 karma */
  POWER_USER: 500,
  
  /** Community leader shaping platform direction - 1000 karma */
  COMMUNITY_LEADER: 1000,
  
  /** Moderator with content curation abilities - 2500 karma */
  MODERATOR: 2500,
  
  /** Platform ambassador and advocate - 5000 karma */
  AMBASSADOR: 5000,
  
  /** Legendary contributor with maximum privileges - 10000 karma */
  LEGEND: 10000,
} as const;

/**
 * Karma Rewards System
 * Points awarded for various platform activities
 * 
 * @const {Object} KARMA_REWARDS
 * @description Karma point values for user actions and achievements
 * 
 * Reward Categories:
 * - **Onboarding**: First-time action bonuses
 * - **Content Creation**: Posts, comments, repositories
 * - **Community Engagement**: Voting, curation, sharing
 * - **Platform Growth**: Referrals, verification, consistency
 * 
 * Design Principles:
 * - Higher rewards for content creation vs. consumption
 * - Bonus points for first-time achievements
 * - Graduated rewards based on content quality
 * - Anti-gaming measures for sustainable growth
 */
export const KARMA_REWARDS = {
  /** First post creation bonus */
  FIRST_POST: 50,
  
  /** First comment contribution bonus */
  FIRST_COMMENT: 20,
  
  /** First voting interaction bonus */
  FIRST_UPVOTE: 10,
  
  /** Points per post upvote received */
  POST_UPVOTED: 5,
  
  /** Points per comment upvote received */
  COMMENT_UPVOTED: 2,
  
  /** Repository creation achievement */
  CREATE_REPOSITORY: 100,
  
  /** CSV upload and email curation */
  UPLOAD_CSV: 50,
  
  /** Email verification completion */
  EMAIL_VERIFIED: 25,
  
  /** Daily login consistency reward */
  DAILY_LOGIN: 5,
  
  /** Successful user referral */
  REFERRED_USER: 100,
  
  /** Quality content curation bonus */
  QUALITY_CURATOR: 20,
} as const;

/* =============================================================================
   User Permissions System
   Feature access control based on karma thresholds
   ============================================================================= */

/**
 * User Permissions Configuration
 * Karma-gated feature access and platform capabilities
 * 
 * @const {Object} USER_PERMISSIONS
 * @description Minimum karma required for various platform features
 * 
 * Permission Philosophy:
 * - **Progressive Trust**: More karma = more capabilities
 * - **Anti-Abuse**: Prevent new account exploitation
 * - **Quality Control**: Ensure experienced users moderate content
 * - **Exclusive Features**: Reward high-contributing members
 * 
 * Permission Categories:
 * - **Basic Actions**: Core platform functionality
 * - **Social Features**: Community interaction capabilities
 * - **Content Management**: Creation and moderation tools
 * - **Advanced Features**: API access and platform governance
 * 
 * Implementation:
 * ```typescript
 * const canCreateRepository = userKarma >= USER_PERMISSIONS.CREATE_REPOSITORY;
 * const canModerate = userKarma >= USER_PERMISSIONS.MODERATE_CONTENT;
 * ```
 */
export const USER_PERMISSIONS = {
  /** Create posts - available to all users */
  CREATE_POST: 0,
  
  /** Create comments - available to all users */
  CREATE_COMMENT: 0,
  
  /** Upvote content - requires basic verification */
  UPVOTE: 10,
  
  /** Downvote content - requires established reputation */
  DOWNVOTE: 50,
  
  /** Create email repositories - requires active participation */
  CREATE_REPOSITORY: 100,
  
  /** Delete own content - available to all users */
  DELETE_OWN_CONTENT: 0,
  
  /** Edit own content - available to all users */
  EDIT_OWN_CONTENT: 0,
  
  /** Flag inappropriate content - requires active participation */
  FLAG_CONTENT: 100,
  
  /** Moderate community content - requires moderator status */
  MODERATE_CONTENT: 2500,
  
  /** Access platform API - requires power user status */
  ACCESS_API: 500,
  
  /** Custom email signature - requires active participation */
  CUSTOM_EMAIL_SIGNATURE: 100,
  
  /** Weighted voting influence - requires community leader status */
  WEIGHTED_VOTING: 1000,
  
  /** Platform governance participation - requires ambassador status */
  GOVERNANCE_PARTICIPATION: 5000,
} as const;

/* =============================================================================
   Content Types and Classification
   Post categories and content organization
   ============================================================================= */

/**
 * Post Types Configuration
 * Content categorization for different submission types
 * 
 * @const {Object} POST_TYPES
 * @description Available post categories following Hacker News conventions
 * 
 * Content Types:
 * - **LINK**: External URL sharing and discussion
 * - **TEXT**: Self-posts with original content or questions
 * - **ASK**: Community questions and advice requests
 * - **SHOW**: Project showcases and product launches
 * - **JOB**: Employment opportunities and career postings
 * - **POLL**: Community polling and opinion gathering
 * 
 * Usage in forms and filtering:
 * ```typescript
 * <select value={postType} onChange={setPostType}>
 *   {Object.entries(POST_TYPES).map(([key, value]) => (
 *     <option key={key} value={value}>{key}</option>
 *   ))}
 * </select>
 * ```
 */
export const POST_TYPES = {
  /** External link sharing */
  LINK: 'link',
  
  /** Original text content */
  TEXT: 'text',
  
  /** Community questions */
  ASK: 'ask',
  
  /** Project showcases */
  SHOW: 'show',
  
  /** Job postings */
  JOB: 'job',
  
  /** Community polls */
  POLL: 'poll',
} as const;

/**
 * Content Sorting Options
 * Algorithm-based content ranking and discovery
 * 
 * @const {Object} SORT_OPTIONS
 * @description Content sorting algorithms for different discovery needs
 * 
 * Sorting Algorithms:
 * - **HOT**: Balanced scoring combining recency and engagement
 * - **NEW**: Chronological ordering by submission time
 * - **TOP**: Pure vote-based ranking for quality content
 * - **CONTROVERSIAL**: High engagement with mixed voting patterns
 * - **RISING**: Recently submitted content gaining momentum
 */
export const SORT_OPTIONS = {
  /** Hot algorithm balancing votes and time */
  HOT: 'hot',
  
  /** Newest content first */
  NEW: 'new',
  
  /** Highest voted content */
  TOP: 'top',
  
  /** Most controversial discussions */
  CONTROVERSIAL: 'controversial',
  
  /** Rapidly gaining traction */
  RISING: 'rising',
} as const;

/**
 * Time Range Filters
 * Temporal filtering for content discovery
 * 
 * @const {Object} TIME_FILTERS
 * @description Time-based content filtering options
 * 
 * Usage with sorting:
 * - Combine with TOP sorting for "best of" time periods
 * - Filter trending content by recency
 * - Historical content analysis and discovery
 */
export const TIME_FILTERS = {
  /** Last hour - breaking news and live events */
  HOUR: 'hour',
  
  /** Last 24 hours - daily highlights */
  DAY: 'day',
  
  /** Last week - weekly roundup */
  WEEK: 'week',
  
  /** Last month - monthly best content */
  MONTH: 'month',
  
  /** Last year - annual highlights */
  YEAR: 'year',
  
  /** All time - historical best content */
  ALL: 'all',
} as const;

/* =============================================================================
   Email Platform Commands
   Email-first interaction system
   ============================================================================= */

/**
 * Email Commands Configuration
 * Email-based platform interaction commands
 * 
 * @const {Object} EMAIL_COMMANDS
 * @description Commands available via email interface for ShadowNews
 * 
 * Email Platform Features:
 * ShadowNews uniquely supports email-first interactions, allowing users
 * to participate in the platform entirely through email without web access.
 * 
 * Command Categories:
 * - **Content Creation**: POST, COMMENT commands
 * - **Engagement**: UPVOTE interactions
 * - **Information**: STATS, HELP requests
 * - **Subscription**: SUBSCRIBE, UNSUBSCRIBE management
 * - **Organization**: REPOSITORY, DIGEST management
 * 
 * Email Command Format:
 * ```
 * Subject: POST "My Amazing Discovery"
 * Body: Check out this interesting article...
 * 
 * Subject: UPVOTE #12345
 * Body: [Empty - command is in subject]
 * ```
 */
export const EMAIL_COMMANDS = {
  /** Create new post via email */
  POST: 'POST',
  
  /** Add comment to existing post */
  COMMENT: 'COMMENT',
  
  /** Upvote post or comment via email */
  UPVOTE: 'UPVOTE',
  
  /** Request platform statistics */
  STATS: 'STATS',
  
  /** Subscribe to email notifications */
  SUBSCRIBE: 'SUBSCRIBE',
  
  /** Unsubscribe from notifications */
  UNSUBSCRIBE: 'UNSUBSCRIBE',
  
  /** Request help and command list */
  HELP: 'HELP',
  DIGEST: 'DIGEST',
  REPOSITORY: 'REPOSITORY',
} as const;

export const REPOSITORY_PRIVACY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  INVITE_ONLY: 'invite_only',
} as const;

export const SNOWBALL_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const DIGEST_FREQUENCY = {
  REALTIME: 'realtime',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  NEVER: 'never',
} as const;

export const NOTIFICATION_TYPES = {
  POST_REPLY: 'post_reply',
  COMMENT_REPLY: 'comment_reply',
  MENTION: 'mention',
  UPVOTE: 'upvote',
  REPOSITORY_INVITE: 'repository_invite',
  REPOSITORY_UPDATE: 'repository_update',
  KARMA_MILESTONE: 'karma_milestone',
  SYSTEM: 'system',
} as const;

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

export const MAX_LIMITS = {
  POST_TITLE_LENGTH: 300,
  POST_TEXT_LENGTH: 40000,
  POST_URL_LENGTH: 2048,
  COMMENT_LENGTH: 10000,
  USERNAME_LENGTH: 25,
  BIO_LENGTH: 500,
  REPOSITORY_NAME_LENGTH: 100,
  REPOSITORY_DESCRIPTION_LENGTH: 500,
  HASHTAG_LENGTH: 50,
  EMAIL_SUBJECT_LENGTH: 200,
  CSV_FILE_SIZE_MB: 10,
  CSV_MAX_EMAILS: 10000,
  BULK_EMAIL_BATCH_SIZE: 100,
  SEARCH_QUERY_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  POSTS_PER_PAGE: 30,
  COMMENTS_PER_PAGE: 50,
  REPOSITORIES_PER_PAGE: 20,
  NOTIFICATIONS_PER_PAGE: 20,
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,25}$/,
  HASHTAG: /^#[a-zA-Z0-9_]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'Server error. Our team has been notified.',
  EMAIL_TAKEN: 'This email is already registered.',
  USERNAME_TAKEN: 'This username is already taken.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_NOT_VERIFIED: 'Please verify your email first.',
  KARMA_INSUFFICIENT: 'You need more karma to perform this action.',
} as const;

export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  COMMENT_POSTED: 'Comment posted successfully!',
  REPOSITORY_CREATED: 'Repository created successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  CSV_UPLOADED: 'CSV file uploaded successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_RESET: 'Password reset successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  LOGGED_IN: 'Welcome back!',
  LOGGED_OUT: 'Logged out successfully.',
  SUBSCRIBED: 'Subscribed successfully!',
  UNSUBSCRIBED: 'Unsubscribed successfully.',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'shadownews_auth_token',
  REFRESH_TOKEN: 'shadownews_refresh_token',
  USER_PREFERENCES: 'shadownews_user_preferences',
  THEME: 'shadownews_theme',
  DRAFT_POST: 'shadownews_draft_post',
  VIEWED_POSTS: 'shadownews_viewed_posts',
  COLLAPSED_COMMENTS: 'shadownews_collapsed_comments',
  SORT_PREFERENCE: 'shadownews_sort_preference',
  REPOSITORY_VIEW: 'shadownews_repository_view',
} as const;

export const WEBSOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Posts
  POST_CREATED: 'post:created',
  POST_UPDATED: 'post:updated',
  POST_DELETED: 'post:deleted',
  POST_VOTED: 'post:voted',
  
  // Comments
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  COMMENT_VOTED: 'comment:voted',
  
  // Repositories
  REPOSITORY_UPDATED: 'repository:updated',
  EMAILS_ADDED: 'repository:emails_added',
  SNOWBALL_PROGRESS: 'repository:snowball_progress',
  
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  
  // User
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  KARMA_UPDATE: 'user:karma_update',
} as const;

export const META_TAGS = {
  DEFAULT_TITLE: 'Shadownews - Where Ideas Snowball Into Communities',
  DEFAULT_DESCRIPTION: 'Join Shadownews, the enhanced Hacker News clone with email repositories, snowball distribution, and AI-powered features. Share ideas, build communities, grow networks.',
  DEFAULT_IMAGE: '/og-image.png',
  TWITTER_HANDLE: '@shadownews',
} as const;

export const FEATURE_FLAGS = {
  AI_HASHTAGS: true,
  EMAIL_POSTING: true,
  SNOWBALL_DISTRIBUTION: true,
  PWA_ENABLED: true,
  DARK_MODE: true,
  API_ACCESS: true,
  CSV_IMPORT: true,
  REAL_TIME_UPDATES: true,
  ADVANCED_SEARCH: true,
  MEETING_SCHEDULER: false,
} as const;
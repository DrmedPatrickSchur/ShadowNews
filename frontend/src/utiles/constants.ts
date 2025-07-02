export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
export const APP_NAME = 'Shadownews';
export const APP_TAGLINE = 'Where Ideas Snowball Into Communities';
export const APP_EMAIL_DOMAIN = '@shadownews.community';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  POSTS: '/posts',
  POST_DETAIL: '/posts/:id',
  SUBMIT: '/submit',
  REPOSITORIES: '/repositories',
  REPOSITORY_DETAIL: '/repositories/:id',
  PROFILE: '/u/:username',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  EMAIL_VERIFY: '/verify-email/:token',
  TRENDING: '/trending',
  NEW: '/new',
  TOP: '/top',
  ABOUT: '/about',
  API_DOCS: '/api-docs',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // User
  PROFILE: '/users/profile',
  USER_BY_USERNAME: '/users/:username',
  UPDATE_PROFILE: '/users/profile',
  UPLOAD_AVATAR: '/users/avatar',
  USER_POSTS: '/users/:userId/posts',
  USER_COMMENTS: '/users/:userId/comments',
  USER_REPOSITORIES: '/users/:userId/repositories',
  
  // Posts
  POSTS: '/posts',
  POST_BY_ID: '/posts/:id',
  CREATE_POST: '/posts',
  UPDATE_POST: '/posts/:id',
  DELETE_POST: '/posts/:id',
  UPVOTE_POST: '/posts/:id/upvote',
  DOWNVOTE_POST: '/posts/:id/downvote',
  
  // Comments
  COMMENTS: '/comments',
  POST_COMMENTS: '/posts/:postId/comments',
  CREATE_COMMENT: '/comments',
  UPDATE_COMMENT: '/comments/:id',
  DELETE_COMMENT: '/comments/:id',
  UPVOTE_COMMENT: '/comments/:id/upvote',
  DOWNVOTE_COMMENT: '/comments/:id/downvote',
  
  // Repositories
  REPOSITORIES: '/repositories',
  REPOSITORY_BY_ID: '/repositories/:id',
  CREATE_REPOSITORY: '/repositories',
  UPDATE_REPOSITORY: '/repositories/:id',
  DELETE_REPOSITORY: '/repositories/:id',
  REPOSITORY_EMAILS: '/repositories/:id/emails',
  ADD_EMAILS: '/repositories/:id/emails',
  REMOVE_EMAIL: '/repositories/:id/emails/:emailId',
  UPLOAD_CSV: '/repositories/:id/upload-csv',
  DOWNLOAD_CSV: '/repositories/:id/download-csv',
  REPOSITORY_STATS: '/repositories/:id/stats',
  
  // Email
  SEND_EMAIL: '/email/send',
  EMAIL_TO_POST: '/email/post',
  EMAIL_DIGEST: '/email/digest',
  EMAIL_PREFERENCES: '/email/preferences',
  UNSUBSCRIBE: '/email/unsubscribe/:token',
  
  // Search
  SEARCH: '/search',
  SEARCH_POSTS: '/search/posts',
  SEARCH_USERS: '/search/users',
  SEARCH_REPOSITORIES: '/search/repositories',
  SEARCH_HASHTAGS: '/search/hashtags',
  
  // Hashtags
  TRENDING_HASHTAGS: '/hashtags/trending',
  HASHTAG_POSTS: '/hashtags/:tag/posts',
  FOLLOW_HASHTAG: '/hashtags/:tag/follow',
  UNFOLLOW_HASHTAG: '/hashtags/:tag/unfollow',
  
  // Analytics
  POST_ANALYTICS: '/analytics/posts/:id',
  REPOSITORY_ANALYTICS: '/analytics/repositories/:id',
  USER_ANALYTICS: '/analytics/users/:id',
} as const;

export const KARMA_MILESTONES = {
  NEWBIE: 0,
  VERIFIED: 10,
  CONTRIBUTOR: 50,
  ACTIVE_MEMBER: 100,
  TRUSTED_USER: 250,
  POWER_USER: 500,
  COMMUNITY_LEADER: 1000,
  MODERATOR: 2500,
  AMBASSADOR: 5000,
  LEGEND: 10000,
} as const;

export const KARMA_REWARDS = {
  FIRST_POST: 50,
  FIRST_COMMENT: 20,
  FIRST_UPVOTE: 10,
  POST_UPVOTED: 5,
  COMMENT_UPVOTED: 2,
  CREATE_REPOSITORY: 100,
  UPLOAD_CSV: 50,
  EMAIL_VERIFIED: 25,
  DAILY_LOGIN: 5,
  REFERRED_USER: 100,
  QUALITY_CURATOR: 20,
} as const;

export const USER_PERMISSIONS = {
  CREATE_POST: 0,
  CREATE_COMMENT: 0,
  UPVOTE: 10,
  DOWNVOTE: 50,
  CREATE_REPOSITORY: 100,
  DELETE_OWN_CONTENT: 0,
  EDIT_OWN_CONTENT: 0,
  FLAG_CONTENT: 100,
  MODERATE_CONTENT: 2500,
  ACCESS_API: 500,
  CUSTOM_EMAIL_SIGNATURE: 100,
  WEIGHTED_VOTING: 1000,
  GOVERNANCE_PARTICIPATION: 5000,
} as const;

export const POST_TYPES = {
  LINK: 'link',
  TEXT: 'text',
  ASK: 'ask',
  SHOW: 'show',
  JOB: 'job',
  POLL: 'poll',
} as const;

export const SORT_OPTIONS = {
  HOT: 'hot',
  NEW: 'new',
  TOP: 'top',
  CONTROVERSIAL: 'controversial',
  RISING: 'rising',
} as const;

export const TIME_FILTERS = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
} as const;

export const EMAIL_COMMANDS = {
  POST: 'POST',
  COMMENT: 'COMMENT',
  UPVOTE: 'UPVOTE',
  STATS: 'STATS',
  SUBSCRIBE: 'SUBSCRIBE',
  UNSUBSCRIBE: 'UNSUBSCRIBE',
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
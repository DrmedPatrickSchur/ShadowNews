export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
export const EMAIL_DOMAIN = process.env.REACT_APP_EMAIL_DOMAIN || '@shadownews.community';

export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_CSV_ROWS = 10000;
export const MAX_BATCH_SIZE = 100;

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    CHECK_USERNAME: '/auth/check-username',
    CHECK_EMAIL: '/auth/check-email',
    TWO_FACTOR: '/auth/2fa',
    OAUTH: {
      GOOGLE: '/auth/oauth/google',
      GITHUB: '/auth/oauth/github',
      LINKEDIN: '/auth/oauth/linkedin'
    }
  },

  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile/update',
    UPLOAD_AVATAR: '/users/avatar',
    KARMA_HISTORY: '/users/karma/history',
    ACHIEVEMENTS: '/users/achievements',
    SETTINGS: '/users/settings',
    PRIVACY: '/users/privacy',
    NOTIFICATIONS: '/users/notifications',
    BLOCKED: '/users/blocked',
    FOLLOW: (id: string) => `/users/${id}/follow`,
    UNFOLLOW: (id: string) => `/users/${id}/unfollow`,
    FOLLOWERS: (id: string) => `/users/${id}/followers`,
    FOLLOWING: (id: string) => `/users/${id}/following`
  },

  // Posts endpoints
  POSTS: {
    BASE: '/posts',
    BY_ID: (id: string) => `/posts/${id}`,
    CREATE: '/posts/create',
    UPDATE: (id: string) => `/posts/${id}/update`,
    DELETE: (id: string) => `/posts/${id}/delete`,
    UPVOTE: (id: string) => `/posts/${id}/upvote`,
    DOWNVOTE: (id: string) => `/posts/${id}/downvote`,
    UNVOTE: (id: string) => `/posts/${id}/unvote`,
    FLAG: (id: string) => `/posts/${id}/flag`,
    TRENDING: '/posts/trending',
    HOT: '/posts/hot',
    NEW: '/posts/new',
    TOP: '/posts/top',
    BY_HASHTAG: (tag: string) => `/posts/hashtag/${tag}`,
    BY_USER: (userId: string) => `/posts/user/${userId}`,
    SEARCH: '/posts/search',
    RELATED: (id: string) => `/posts/${id}/related`,
    ANALYTICS: (id: string) => `/posts/${id}/analytics`
  },

  // Comments endpoints
  COMMENTS: {
    BASE: '/comments',
    BY_POST: (postId: string) => `/posts/${postId}/comments`,
    BY_ID: (id: string) => `/comments/${id}`,
    CREATE: '/comments/create',
    UPDATE: (id: string) => `/comments/${id}/update`,
    DELETE: (id: string) => `/comments/${id}/delete`,
    UPVOTE: (id: string) => `/comments/${id}/upvote`,
    DOWNVOTE: (id: string) => `/comments/${id}/downvote`,
    UNVOTE: (id: string) => `/comments/${id}/unvote`,
    FLAG: (id: string) => `/comments/${id}/flag`,
    THREAD: (id: string) => `/comments/${id}/thread`,
    BY_USER: (userId: string) => `/comments/user/${userId}`
  },

  // Repositories endpoints
  REPOSITORIES: {
    BASE: '/repositories',
    BY_ID: (id: string) => `/repositories/${id}`,
    CREATE: '/repositories/create',
    UPDATE: (id: string) => `/repositories/${id}/update`,
    DELETE: (id: string) => `/repositories/${id}/delete`,
    BY_USER: (userId: string) => `/repositories/user/${userId}`,
    BY_TOPIC: (topic: string) => `/repositories/topic/${topic}`,
    TRENDING: '/repositories/trending',
    SEARCH: '/repositories/search',
    JOIN: (id: string) => `/repositories/${id}/join`,
    LEAVE: (id: string) => `/repositories/${id}/leave`,
    MEMBERS: (id: string) => `/repositories/${id}/members`,
    INVITE: (id: string) => `/repositories/${id}/invite`,
    MERGE: '/repositories/merge',
    STATS: (id: string) => `/repositories/${id}/stats`,
    EXPORT: (id: string) => `/repositories/${id}/export`,
    IMPORT: (id: string) => `/repositories/${id}/import`,
    SETTINGS: (id: string) => `/repositories/${id}/settings`,
    ANALYTICS: (id: string) => `/repositories/${id}/analytics`
  },

  // Email endpoints
  EMAIL: {
    SEND: '/email/send',
    PARSE: '/email/parse',
    WEBHOOK: '/email/webhook',
    VERIFY: '/email/verify',
    UNSUBSCRIBE: '/email/unsubscribe',
    PREFERENCES: '/email/preferences',
    DIGEST: {
      SUBSCRIBE: '/email/digest/subscribe',
      UNSUBSCRIBE: '/email/digest/unsubscribe',
      PREVIEW: '/email/digest/preview',
      SETTINGS: '/email/digest/settings'
    },
    TEMPLATES: {
      LIST: '/email/templates',
      BY_ID: (id: string) => `/email/templates/${id}`,
      CREATE: '/email/templates/create',
      UPDATE: (id: string) => `/email/templates/${id}/update`,
      DELETE: (id: string) => `/email/templates/${id}/delete`
    }
  },

  // CSV endpoints
  CSV: {
    UPLOAD: '/csv/upload',
    PARSE: '/csv/parse',
    VALIDATE: '/csv/validate',
    PROCESS: '/csv/process',
    EXPORT: '/csv/export',
    TEMPLATES: '/csv/templates',
    HISTORY: '/csv/history',
    STATUS: (jobId: string) => `/csv/status/${jobId}`
  },

  // Snowball endpoints
  SNOWBALL: {
    INITIATE: '/snowball/initiate',
    STATUS: (id: string) => `/snowball/status/${id}`,
    HISTORY: '/snowball/history',
    ANALYTICS: '/snowball/analytics',
    SETTINGS: '/snowball/settings',
    PREVIEW: '/snowball/preview',
    APPROVE: (id: string) => `/snowball/approve/${id}`,
    REJECT: (id: string) => `/snowball/reject/${id}`
  },

  // AI endpoints
  AI: {
    SUGGEST_HASHTAGS: '/ai/hashtags/suggest',
    SUMMARIZE: '/ai/summarize',
    EXTRACT_TOPICS: '/ai/topics/extract',
    GENERATE_TITLE: '/ai/title/generate',
    MODERATE_CONTENT: '/ai/moderate',
    SIMILAR_POSTS: '/ai/posts/similar',
    TRENDING_TOPICS: '/ai/topics/trending',
    SENTIMENT: '/ai/sentiment',
    TRANSLATE: '/ai/translate'
  },

  // Search endpoints
  SEARCH: {
    GLOBAL: '/search',
    POSTS: '/search/posts',
    USERS: '/search/users',
    REPOSITORIES: '/search/repositories',
    HASHTAGS: '/search/hashtags',
    AUTOCOMPLETE: '/search/autocomplete',
    ADVANCED: '/search/advanced',
    HISTORY: '/search/history',
    TRENDING: '/search/trending'
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    POSTS: '/analytics/posts',
    USERS: '/analytics/users',
    REPOSITORIES: '/analytics/repositories',
    ENGAGEMENT: '/analytics/engagement',
    GROWTH: '/analytics/growth',
    EXPORT: '/analytics/export'
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    POSTS: '/admin/posts',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    LOGS: '/admin/logs',
    MODERATION: '/admin/moderation',
    BULK_ACTIONS: '/admin/bulk-actions'
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}/delete`,
    SETTINGS: '/notifications/settings',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe'
  }
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  TOKEN_INVALID: 'AUTH003',
  USER_NOT_VERIFIED: 'AUTH004',
  USER_BLOCKED: 'AUTH005',
  
  // User errors
  USER_NOT_FOUND: 'USER001',
  USERNAME_TAKEN: 'USER002',
  EMAIL_TAKEN: 'USER003',
  INVALID_EMAIL: 'USER004',
  
  // Post errors
  POST_NOT_FOUND: 'POST001',
  POST_DELETED: 'POST002',
  ALREADY_VOTED: 'POST003',
  
  // Repository errors
  REPOSITORY_NOT_FOUND: 'REPO001',
  REPOSITORY_FULL: 'REPO002',
  NOT_MEMBER: 'REPO003',
  ALREADY_MEMBER: 'REPO004',
  
  // Email errors
  EMAIL_SEND_FAILED: 'EMAIL001',
  INVALID_EMAIL_FORMAT: 'EMAIL002',
  EMAIL_NOT_VERIFIED: 'EMAIL003',
  
  // CSV errors
  CSV_PARSE_ERROR: 'CSV001',
  CSV_TOO_LARGE: 'CSV002',
  CSV_INVALID_FORMAT: 'CSV003',
  
  // General errors
  VALIDATION_ERROR: 'GEN001',
  RATE_LIMIT_EXCEEDED: 'GEN002',
  SERVER_ERROR: 'GEN003',
  NOT_FOUND: 'GEN004',
  FORBIDDEN: 'GEN005'
} as const;

export const WS_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect',
  
  // Post events
  POST_CREATED: 'post:created',
  POST_UPDATED: 'post:updated',
  POST_DELETED: 'post:deleted',
  POST_VOTED: 'post:voted',
  
  // Comment events
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  COMMENT_VOTED: 'comment:voted',
  
  // Repository events
  REPOSITORY_UPDATED: 'repository:updated',
  REPOSITORY_MEMBER_JOINED: 'repository:member:joined',
  REPOSITORY_MEMBER_LEFT: 'repository:member:left',
  REPOSITORY_EMAIL_ADDED: 'repository:email:added',
  
  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  
  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
  
  // Snowball events
  SNOWBALL_STARTED: 'snowball:started',
  SNOWBALL_PROGRESS: 'snowball:progress',
  SNOWBALL_COMPLETED: 'snowball:completed'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  POSTS_PER_PAGE: 30,
  COMMENTS_PER_PAGE: 50,
  USERS_PER_PAGE: 20,
  REPOSITORIES_PER_PAGE: 15,
  EMAILS_PER_PAGE: 100
} as const;

export const RATE_LIMITS = {
  AUTH: {
    LOGIN: { WINDOW: 900000, MAX: 5 }, // 15 min, 5 attempts
    REGISTER: { WINDOW: 3600000, MAX: 3 }, // 1 hour, 3 attempts
    PASSWORD_RESET: { WINDOW: 3600000, MAX: 3 } // 1 hour, 3 attempts
  },
  API: {
    DEFAULT: { WINDOW: 60000, MAX: 100 }, // 1 min, 100 requests
    POSTS: { WINDOW: 60000, MAX: 30 }, // 1 min, 30 posts
    COMMENTS: { WINDOW: 60000, MAX: 60 }, // 1 min, 60 comments
    UPLOADS: { WINDOW: 300000, MAX: 10 }, // 5 min, 10 uploads
    EMAILS: { WINDOW: 3600000, MAX: 50 }, // 1 hour, 50 emails
    AI: { WINDOW: 60000, MAX: 20 } // 1 min, 20 AI requests
  }
} as const;

export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  POST: (id: string) => `post:${id}`,
  POSTS_LIST: (type: string, page: number) => `posts:${type}:${page}`,
  REPOSITORY: (id: string) => `repository:${id}`,
  TRENDING_HASHTAGS: 'hashtags:trending',
  USER_KARMA: (id: string) => `karma:${id}`,
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`
} as const;

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;
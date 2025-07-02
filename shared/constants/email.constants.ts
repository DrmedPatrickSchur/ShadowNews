export const EMAIL_CONSTANTS = {
  DOMAIN: '@shadownews.community',
  SYSTEM_EMAIL: 'system@shadownews.community',
  NOREPLY_EMAIL: 'noreply@shadownews.community',
  SUPPORT_EMAIL: 'support@shadownews.community',
  
  INBOUND: {
    POST_PREFIX: 'post',
    REPLY_PREFIX: 'reply',
    COMMAND_PREFIX: 'cmd',
    REPOSITORY_PREFIX: 'repo',
  },
  
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
  
  TEMPLATES: {
    WELCOME: 'welcome',
    VERIFY: 'verify-email',
    RESET: 'password-reset',
    DIGEST: 'digest',
    NOTIFICATION: 'notification',
    REPOSITORY: 'repository',
    KARMA: 'karma-update',
    SNOWBALL: 'snowball-growth',
  },
  
  COMMANDS: {
    HELP: 'HELP',
    STATS: 'STATS',
    SUBSCRIBE: 'SUBSCRIBE',
    UNSUBSCRIBE: 'UNSUBSCRIBE',
    PAUSE: 'PAUSE',
    RESUME: 'RESUME',
    DELETE: 'DELETE',
    UPVOTE: 'UPVOTE',
    DOWNVOTE: 'DOWNVOTE',
    REPOSITORY: 'REPOSITORY',
    EXPORT: 'EXPORT',
    PRIVACY: 'PRIVACY',
  },
  
  DIGEST_FREQUENCIES: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
    INSTANT: 'instant',
  } as const,
  
  DIGEST_TIMES: {
    MORNING: '08:00',
    NOON: '12:00',
    EVENING: '18:00',
    NIGHT: '21:00',
  },
  
  ATTACHMENTS: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    CSV_EXTENSIONS: ['.csv', '.txt'],
    EXCEL_EXTENSIONS: ['.xls', '.xlsx'],
  },
  
  VALIDATION: {
    MAX_SUBJECT_LENGTH: 200,
    MAX_BODY_LENGTH: 50000,
    MIN_BODY_LENGTH: 10,
    MAX_RECIPIENTS: 50,
    MAX_CC_RECIPIENTS: 10,
    MAX_ATTACHMENTS: 5,
  },
  
  PARSING: {
    HASHTAG_REGEX: /#[\w\u0080-\uFFFF]+/g,
    MENTION_REGEX: /@[\w\u0080-\uFFFF]+/g,
    URL_REGEX: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    COMMAND_REGEX: /^(HELP|STATS|SUBSCRIBE|UNSUBSCRIBE|PAUSE|RESUME|DELETE|UPVOTE|DOWNVOTE|REPOSITORY|EXPORT|PRIVACY)(\s+(.+))?$/i,
  },
  
  RATE_LIMITS: {
    POSTS_PER_HOUR: 10,
    POSTS_PER_DAY: 50,
    COMMANDS_PER_HOUR: 20,
    REPOSITORY_INVITES_PER_DAY: 100,
    DIGEST_CHANGES_PER_WEEK: 5,
  },
  
  SNOWBALL: {
    MIN_EMAILS_TO_START: 10,
    MAX_GROWTH_RATE: 2.0, // 200% max growth per cycle
    QUALITY_THRESHOLD: 0.7,
    VERIFICATION_REQUIRED: true,
    COOL_DOWN_PERIOD: 24 * 60 * 60 * 1000, // 24 hours in ms
    MAX_HOPS: 3,
    AUTO_ADD_THRESHOLD: 5, // Auto-add if referred by 5+ trusted sources
  },
  
  PRIVACY: {
    DEFAULT_VISIBILITY: 'public',
    VISIBILITY_LEVELS: ['public', 'repository', 'private'] as const,
    ANONYMOUS_POSTING: true,
    ENCRYPTED_LISTS: true,
    GDPR_EXPORT_FORMAT: 'json',
  },
  
  NOTIFICATIONS: {
    TYPES: {
      POST_REPLY: 'post_reply',
      COMMENT_REPLY: 'comment_reply',
      MENTION: 'mention',
      UPVOTE: 'upvote',
      REPOSITORY_INVITE: 'repository_invite',
      REPOSITORY_GROWTH: 'repository_growth',
      KARMA_MILESTONE: 'karma_milestone',
      DIGEST: 'digest',
      SYSTEM: 'system',
    },
    CHANNELS: {
      EMAIL: 'email',
      WEB: 'web',
      PUSH: 'push',
    },
    DEFAULT_PREFERENCES: {
      post_reply: ['email', 'web'],
      comment_reply: ['email', 'web'],
      mention: ['email', 'web', 'push'],
      upvote: ['web'],
      repository_invite: ['email', 'web', 'push'],
      repository_growth: ['email'],
      karma_milestone: ['email', 'web'],
      digest: ['email'],
      system: ['email', 'web'],
    },
  },
  
  HEADERS: {
    MESSAGE_ID: 'Message-ID',
    IN_REPLY_TO: 'In-Reply-To',
    REFERENCES: 'References',
    X_SHADOWNEWS_TYPE: 'X-Shadownews-Type',
    X_SHADOWNEWS_ID: 'X-Shadownews-ID',
    X_SHADOWNEWS_REPOSITORY: 'X-Shadownews-Repository',
    X_SHADOWNEWS_KARMA: 'X-Shadownews-Karma',
    LIST_UNSUBSCRIBE: 'List-Unsubscribe',
    LIST_ID: 'List-ID',
  },
  
  BOUNCE: {
    HARD_BOUNCE_THRESHOLD: 3,
    SOFT_BOUNCE_THRESHOLD: 5,
    COMPLAINT_THRESHOLD: 2,
    SUSPENSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },
  
  ANALYTICS: {
    TRACK_OPENS: true,
    TRACK_CLICKS: true,
    PIXEL_ENDPOINT: '/api/email/track',
    LINK_WRAPPER_ENDPOINT: '/api/email/click',
  },
} as const;

export type EmailCommand = keyof typeof EMAIL_CONSTANTS.COMMANDS;
export type DigestFrequency = typeof EMAIL_CONSTANTS.DIGEST_FREQUENCIES[keyof typeof EMAIL_CONSTANTS.DIGEST_FREQUENCIES];
export type NotificationType = keyof typeof EMAIL_CONSTANTS.NOTIFICATIONS.TYPES;
export type NotificationChannel = keyof typeof EMAIL_CONSTANTS.NOTIFICATIONS.CHANNELS;
export type PrivacyLevel = typeof EMAIL_CONSTANTS.PRIVACY.VISIBILITY_LEVELS[number];

export const EMAIL_ERROR_CODES = {
  INVALID_FORMAT: 'EMAIL_INVALID_FORMAT',
  DOMAIN_MISMATCH: 'EMAIL_DOMAIN_MISMATCH',
  RATE_LIMIT_EXCEEDED: 'EMAIL_RATE_LIMIT_EXCEEDED',
  ATTACHMENT_TOO_LARGE: 'EMAIL_ATTACHMENT_TOO_LARGE',
  INVALID_ATTACHMENT_TYPE: 'EMAIL_INVALID_ATTACHMENT_TYPE',
  PARSING_FAILED: 'EMAIL_PARSING_FAILED',
  COMMAND_NOT_RECOGNIZED: 'EMAIL_COMMAND_NOT_RECOGNIZED',
  UNAUTHORIZED: 'EMAIL_UNAUTHORIZED',
  BOUNCE_THRESHOLD_EXCEEDED: 'EMAIL_BOUNCE_THRESHOLD_EXCEEDED',
  SNOWBALL_LIMIT_REACHED: 'EMAIL_SNOWBALL_LIMIT_REACHED',
} as const;

export type EmailErrorCode = typeof EMAIL_ERROR_CODES[keyof typeof EMAIL_ERROR_CODES];
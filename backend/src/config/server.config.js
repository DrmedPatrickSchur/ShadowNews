module.exports = {
 port: process.env.PORT || 3001,
 env: process.env.NODE_ENV || 'development',
 cors: {
   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
   credentials: true,
   optionsSuccessStatus: 200,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
   exposedHeaders: ['X-Total-Count', 'X-Page-Count']
 },
 rateLimit: {
   windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
   max: process.env.RATE_LIMIT_MAX || 100,
   message: 'Too many requests from this IP, please try again later.',
   standardHeaders: true,
   legacyHeaders: false,
   skip: (req) => {
     const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
     return whitelist.includes(req.ip);
   }
 },
 upload: {
   maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024,
   maxFiles: process.env.MAX_FILES || 5,
   allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
   tempDirectory: process.env.TEMP_DIR || './temp/uploads'
 },
 pagination: {
   defaultLimit: 20,
   maxLimit: 100,
   defaultSort: '-createdAt'
 },
 security: {
   bcryptRounds: process.env.BCRYPT_ROUNDS || 12,
   jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
   jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
   refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
   cookieOptions: {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
     maxAge: 30 * 24 * 60 * 60 * 1000
   }
 },
 email: {
   defaultSender: process.env.DEFAULT_EMAIL_SENDER || 'noreply@shadownews.community',
   domainSuffix: '@shadownews.community',
   maxEmailsPerDay: process.env.MAX_EMAILS_PER_DAY || 100,
   digestHour: process.env.DIGEST_HOUR || 8,
   digestTimezone: process.env.DIGEST_TIMEZONE || 'UTC'
 },
 karma: {
   actions: {
     postCreated: 50,
     commentCreated: 20,
     postUpvoted: 10,
     commentUpvoted: 5,
     csvUploaded: 100,
     repositoryCreated: 200,
     emailVerified: 50,
     dailyLogin: 5
   },
   milestones: {
     customSignature: 100,
     repositoryCreation: 500,
     weightedVoting: 1000,
     platformGovernance: 5000
   }
 },
 snowball: {
   minEmailsForSnowball: 10,
   maxSnowballDepth: 3,
   snowballCooldown: 24 * 60 * 60 * 1000,
   qualityThreshold: 0.7,
   autoApprovalThreshold: 0.9
 },
 cache: {
   ttl: {
     posts: 5 * 60,
     comments: 5 * 60,
     user: 10 * 60,
     repository: 15 * 60,
     trending: 2 * 60
   }
 },
 workers: {
   concurrency: process.env.WORKER_CONCURRENCY || 5,
   maxJobRetries: process.env.MAX_JOB_RETRIES || 3,
   jobTimeout: process.env.JOB_TIMEOUT || 30000,
   queues: {
     email: 'email-processing',
     digest: 'digest-generation',
     snowball: 'snowball-distribution',
     cleanup: 'data-cleanup',
     analytics: 'analytics-processing'
   }
 },
 ai: {
   enabled: process.env.AI_ENABLED === 'true',
   hashtagSuggestionLimit: 5,
   summarizationLength: 150,
   sentimentAnalysisThreshold: 0.7
 },
 websocket: {
   pingInterval: 30000,
   pingTimeout: 5000,
   maxConnections: process.env.MAX_WS_CONNECTIONS || 10000,
   messageRateLimit: 10
 },
 monitoring: {
   enableMetrics: process.env.ENABLE_METRICS === 'true',
   metricsPort: process.env.METRICS_PORT || 9090,
   logLevel: process.env.LOG_LEVEL || 'info',
   sentryDsn: process.env.SENTRY_DSN || null
 }
};
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
 env: process.env.NODE_ENV || 'development',
 port: parseInt(process.env.PORT, 10) || 3001,
 
 // Database
 mongodb: {
   uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews',
   options: {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
   }
 },
 
 // Redis
 redis: {
   host: process.env.REDIS_HOST || 'localhost',
   port: parseInt(process.env.REDIS_PORT, 10) || 6379,
   password: process.env.REDIS_PASSWORD || undefined,
   db: parseInt(process.env.REDIS_DB, 10) || 0,
   ttl: 3600, // 1 hour default TTL
 },
 
 // JWT
 jwt: {
   secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
   accessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 30,
   refreshExpirationDays: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 30,
   resetPasswordExpirationMinutes: 10,
   verifyEmailExpirationMinutes: 60,
 },
 
 // Email
 email: {
   smtp: {
     host: process.env.SMTP_HOST || 'smtp.gmail.com',
     port: parseInt(process.env.SMTP_PORT, 10) || 587,
     secure: process.env.SMTP_SECURE === 'true',
     auth: {
       user: process.env.SMTP_USERNAME,
       pass: process.env.SMTP_PASSWORD,
     },
   },
   from: process.env.EMAIL_FROM || 'noreply@shadownews.community',
   inbound: {
     domain: process.env.INBOUND_EMAIL_DOMAIN || 'shadownews.community',
     webhook: process.env.INBOUND_EMAIL_WEBHOOK || '/api/email/inbound',
     apiKey: process.env.INBOUND_EMAIL_API_KEY,
   },
 },
 
 // SendGrid (for production email)
 sendgrid: {
   apiKey: process.env.SENDGRID_API_KEY,
   webhookVerificationKey: process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY,
   templates: {
     welcome: process.env.SENDGRID_WELCOME_TEMPLATE_ID,
     digest: process.env.SENDGRID_DIGEST_TEMPLATE_ID,
     passwordReset: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID,
     repositoryInvite: process.env.SENDGRID_REPOSITORY_INVITE_TEMPLATE_ID,
   },
 },
 
 // AI Services
 ai: {
   openai: {
     apiKey: process.env.OPENAI_API_KEY,
     model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
     maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 150,
   },
   huggingface: {
     apiKey: process.env.HUGGINGFACE_API_KEY,
     sentimentModel: 'distilbert-base-uncased-finetuned-sst-2-english',
     summaryModel: 'facebook/bart-large-cnn',
   },
 },
 
 // AWS S3 (for CSV storage)
 aws: {
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   region: process.env.AWS_REGION || 'us-east-1',
   s3: {
     bucket: process.env.AWS_S3_BUCKET || 'shadownews-uploads',
     csvPrefix: 'csv/',
     avatarPrefix: 'avatars/',
     maxFileSize: 10 * 1024 * 1024, // 10MB
   },
 },
 
 // Rate Limiting
 rateLimit: {
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: process.env.NODE_ENV === 'production' ? 100 : 1000,
   message: 'Too many requests from this IP, please try again later.',
   skipSuccessfulRequests: false,
   keyGenerator: (req) => req.ip,
 },
 
 // CORS
 cors: {
   origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
   credentials: true,
   optionsSuccessStatus: 200,
 },
 
 // Security
 security: {
   bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
   cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret-change-this',
   sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
 },
 
 // Karma System
 karma: {
   actions: {
     postCreated: 50,
     commentCreated: 20,
     postUpvoted: 10,
     commentUpvoted: 5,
     repositoryCreated: 100,
     csvUploaded: 100,
     emailVerified: 25,
     dailyLogin: 5,
   },
   milestones: {
     customSignature: 100,
     repositoryCreation: 500,
     weightedVoting: 1000,
     platformGovernance: 5000,
   },
   multipliers: {
     curatorUpvote: 5,
     qualityPost: 2,
     viralPost: 3,
   },
 },
 
 // Repository Settings
 repository: {
   minEmails: 10,
   maxEmails: 10000,
   snowballMultiplier: 1.5,
   verificationRequired: true,
   autoAddThreshold: 0.7, // 70% quality score
   digestFrequency: 'weekly', // daily, weekly, monthly
 },
 
 // WebSocket
 websocket: {
   pingTimeout: 60000,
   pingInterval: 25000,
   upgradeTimeout: 10000,
   maxHttpBufferSize: 1e6,
 },
 
 // Pagination
 pagination: {
   defaultLimit: 20,
   maxLimit: 100,
 },
 
 // Logging
 logging: {
   level: process.env.LOG_LEVEL || 'info',
   format: process.env.LOG_FORMAT || 'json',
   dir: process.env.LOG_DIR || 'logs',
 },
 
 // Queue Settings
 queue: {
   redis: {
     host: process.env.REDIS_HOST || 'localhost',
     port: parseInt(process.env.REDIS_PORT, 10) || 6379,
   },
   defaultJobOptions: {
     removeOnComplete: true,
     removeOnFail: false,
     attempts: 3,
     backoff: {
       type: 'exponential',
       delay: 2000,
     },
   },
 },
 
 // Feature Flags
 features: {
   emailPosting: process.env.FEATURE_EMAIL_POSTING !== 'false',
   aiHashtags: process.env.FEATURE_AI_HASHTAGS !== 'false',
   snowballDistribution: process.env.FEATURE_SNOWBALL !== 'false',
   digestEmails: process.env.FEATURE_DIGEST_EMAILS !== 'false',
   mobileApp: process.env.FEATURE_MOBILE_APP !== 'false',
 },
 
 // Analytics
 analytics: {
   googleAnalytics: process.env.GA_TRACKING_ID,
   mixpanel: process.env.MIXPANEL_TOKEN,
   segment: process.env.SEGMENT_WRITE_KEY,
 },
 
 // External APIs
 external: {
   clearbit: {
     apiKey: process.env.CLEARBIT_API_KEY,
   },
   hunter: {
     apiKey: process.env.HUNTER_API_KEY,
   },
 },
};

// Validate required configuration
const requiredEnvVars = [
 'JWT_SECRET',
 'MONGODB_URI',
 'SMTP_USERNAME',
 'SMTP_PASSWORD',
];

if (config.env === 'production') {
 requiredEnvVars.push(
   'SENDGRID_API_KEY',
   'AWS_ACCESS_KEY_ID',
   'AWS_SECRET_ACCESS_KEY',
   'REDIS_PASSWORD'
 );
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
 throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../../utils/redis');
const logger = require('../../utils/logger');

// Create different rate limiters for different endpoints
const createRateLimiter = (options) => {
 const defaultOptions = {
   store: new RedisStore({
     client: redis,
     prefix: 'rate-limit:',
   }),
   standardHeaders: true,
   legacyHeaders: false,
   handler: (req, res) => {
     logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
     res.status(429).json({
       error: 'Too many requests',
       message: 'Please try again later',
       retryAfter: res.getHeader('Retry-After'),
     });
   },
   skip: (req) => {
     // Skip rate limiting for whitelisted IPs or authenticated admins
     if (req.user && req.user.role === 'admin') return true;
     if (process.env.WHITELIST_IPS && process.env.WHITELIST_IPS.includes(req.ip)) return true;
     return false;
   },
 };

 return rateLimit({ ...defaultOptions, ...options });
};

// General API rate limit
const general = createRateLimiter({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 100, // 100 requests per windowMs
 message: 'Too many requests from this IP',
});

// Strict rate limit for authentication endpoints
const auth = createRateLimiter({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 5, // 5 requests per windowMs
 skipSuccessfulRequests: true,
 message: 'Too many authentication attempts',
});

// Rate limit for post creation
const createPost = createRateLimiter({
 windowMs: 60 * 60 * 1000, // 1 hour
 max: 10, // 10 posts per hour
 keyGenerator: (req) => req.user?.id || req.ip,
 message: 'Post creation limit reached. Please wait before posting again',
});

// Rate limit for comment creation
const createComment = createRateLimiter({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 30, // 30 comments per 15 minutes
 keyGenerator: (req) => req.user?.id || req.ip,
 message: 'Comment limit reached. Please slow down',
});

// Rate limit for email sending
const emailSend = createRateLimiter({
 windowMs: 60 * 60 * 1000, // 1 hour
 max: 20, // 20 emails per hour
 keyGenerator: (req) => req.user?.id || req.ip,
 message: 'Email sending limit reached',
});

// Rate limit for CSV uploads
const csvUpload = createRateLimiter({
 windowMs: 24 * 60 * 60 * 1000, // 24 hours
 max: 10, // 10 CSV uploads per day
 keyGenerator: (req) => req.user?.id || req.ip,
 message: 'Daily CSV upload limit reached',
});

// Rate limit for repository creation
const createRepository = createRateLimiter({
 windowMs: 24 * 60 * 60 * 1000, // 24 hours
 max: 5, // 5 repositories per day
 keyGenerator: (req) => req.user?.id || req.ip,
 message: 'Daily repository creation limit reached',
});

// Rate limit for API endpoints (stricter for non-authenticated users)
const api = createRateLimiter({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: (req) => (req.user ? 1000 : 100), // Higher limit for authenticated users
 keyGenerator: (req) => req.user?.id || req.ip,
 message: 'API rate limit exceeded',
});

// Rate limit for search endpoints
const search = createRateLimiter({
 windowMs: 1 * 60 * 1000, // 1 minute
 max: 30, // 30 searches per minute
 keyGenerator: (req) => req.user?.id || req.ip,
 message: 'Search rate limit exceeded. Please wait before searching again',
});

// Dynamic rate limiter based on user karma
const karmaBasedLimiter = (baseMax = 10, karmaMultiplier = 0.01) => {
 return createRateLimiter({
   windowMs: 60 * 60 * 1000, // 1 hour
   max: (req) => {
     if (!req.user) return baseMax;
     const karmaBonus = Math.floor(req.user.karma * karmaMultiplier);
     return Math.min(baseMax + karmaBonus, baseMax * 10); // Cap at 10x base
   },
   keyGenerator: (req) => req.user?.id || req.ip,
 });
};

// WebSocket connection rate limit
const websocket = createRateLimiter({
 windowMs: 1 * 60 * 1000, // 1 minute
 max: 5, // 5 connection attempts per minute
 keyGenerator: (req) => req.ip,
 message: 'Too many WebSocket connection attempts',
});

module.exports = {
 general,
 auth,
 createPost,
 createComment,
 emailSend,
 csvUpload,
 createRepository,
 api,
 search,
 karmaBasedLimiter,
 websocket,
 createRateLimiter,
};
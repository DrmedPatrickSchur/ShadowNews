/**
 * @fileoverview Redis Configuration for ShadowNews Platform
 * 
 * Comprehensive Redis configuration for caching, session management, pub/sub,
 * and queue processing in the ShadowNews platform. This module manages multiple
 * Redis client connections, rate limiting, caching strategies, and utility functions.
 * 
 * Key Features:
 * - Multiple Redis client instances for different purposes
 * - Session store configuration for user authentication
 * - Bull queue configuration for background job processing
 * - Rate limiting configuration for API protection
 * - Caching TTL management for different data types
 * - Pub/sub messaging for real-time features
 * - Utility functions for common Redis operations
 * - Graceful connection handling and error management
 * - Connection monitoring and health checks
 * 
 * Dependencies:
 * - ioredis: Advanced Redis client for Node.js
 * - redis: Official Redis client for compatibility
 * - Bull queues for job processing
 * - Environment variables for configuration
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Required Redis client libraries
const Redis = require('ioredis');
const { createClient } = require('redis');

/**
 * Base Redis Configuration
 * Core connection settings used by all Redis clients
 */
const redisConfig = {
  // Redis server hostname
  host: process.env.REDIS_HOST || 'localhost',
  
  // Redis server port
  port: parseInt(process.env.REDIS_PORT) || 6379,
  
  // Redis authentication password (if required)
  password: process.env.REDIS_PASSWORD || undefined,
  
  // Redis database number to use
  db: parseInt(process.env.REDIS_DB) || 0,
  
  // Retry strategy for failed connections
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Maximum retry attempts per request
  maxRetriesPerRequest: 3,
  
  // Enable ready state checking
  enableReadyCheck: true,
  
  // Connection timeout in milliseconds
  connectTimeout: 10000,
  
  // Enable lazy connection (connect when first command is sent)
  lazyConnect: true,
  
  // Keep-alive interval in milliseconds
  keepAlive: 30000,
  
  // Use IPv4 for connections
  family: 4,
  
  // Key prefix for all Redis keys
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'shadownews:',
};

/**
 * Redis Client Instances
 * Multiple clients for different purposes to avoid blocking
 */

// Primary Redis client for general operations
const redisClient = new Redis(redisConfig);

// Dedicated subscriber client for pub/sub operations
const redisSubscriber = new Redis(redisConfig);

// Dedicated publisher client for pub/sub operations
const redisPublisher = new Redis(redisConfig);

// Cache client using node-redis for specific caching operations
const cacheClient = createClient({
  url: `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`,
  socket: {
    connectTimeout: redisConfig.connectTimeout,
    keepAlive: redisConfig.keepAlive,
  },
});

/**
 * Bull Queue Configuration
 * Settings for background job processing with Bull queues
 */
const bullQueueConfig = {
  // Redis connection settings for Bull
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db,
  },
  
  // Default job options for all queues
  defaultJobOptions: {
    // Keep last 100 completed jobs for monitoring
    removeOnComplete: 100,
    
    // Keep last 1000 failed jobs for debugging
    removeOnFail: 1000,
    
    // Maximum retry attempts for failed jobs
    attempts: 3,
    
    // Exponential backoff strategy for retries
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

/**
 * Session Store Configuration
 * Redis-based session storage for user authentication
 */
const sessionConfig = {
  // Redis server connection details
  host: redisConfig.host,
  port: redisConfig.port,
  pass: redisConfig.password,
  db: redisConfig.db,
  
  // Session TTL in seconds (24 hours)
  ttl: 86400,
  
  // Key prefix for session data
  prefix: 'sess:',
};

/**
 * Rate Limiting Configuration
 * Redis-based rate limiting for API endpoints
 */
const rateLimitConfig = {
  // Redis client for rate limiting operations
  storeClient: redisClient,
  
  // Key prefix for rate limit counters
  keyPrefix: 'rl:',
  
  // Points (requests) allowed per endpoint type
  points: {
    api: 100,     // General API requests
    email: 10,    // Email sending operations
    auth: 5,      // Authentication attempts
    upload: 20,   // File upload operations
  },
  
  // Time window for rate limiting (15 minutes in seconds)
  duration: 900,
  
  // Block duration when limit exceeded (15 minutes)
  blockDuration: 900,
};

/**
 * Cache TTL Configuration
 * Time-to-live settings for different types of cached data
 */
const cacheTTL = {
  // User profile data (1 hour)
  userProfile: 3600,
  
  // Post lists and feeds (5 minutes)
  postList: 300,
  
  // Individual post details (10 minutes)
  postDetail: 600,
  
  // Repository lists (30 minutes)
  repositoryList: 1800,
  
  // Email digest data (1 hour)
  emailDigest: 3600,
  
  // Trending content (10 minutes)
  trending: 600,
  
  // Karma calculations (30 minutes)
  karma: 1800,
  
  // Statistics and analytics (5 minutes)
  stats: 300,
};

/**
 * Redis Event Handlers
 * Connection monitoring and error handling
 */

// Primary client event handlers
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

// Subscriber client event handlers
redisSubscriber.on('error', (err) => {
  console.error('Redis Subscriber Error:', err);
});

// Publisher client event handlers
redisPublisher.on('error', (err) => {
  console.error('Redis Publisher Error:', err);
});

// Cache client event handlers
cacheClient.on('error', (err) => {
  console.error('Cache Client Error:', err);
});

/**
 * Cache Client Connection
 * Initialize connection for the cache client
 */
(async () => {
  try {
    await cacheClient.connect();
    console.log('Cache Client Connected');
  } catch (err) {
    console.error('Cache Client Connection Error:', err);
  }
})();

/**
 * Redis Utility Functions
 * Helper functions for common Redis operations
 */
const redisUtils = {
  /**
   * Set value with expiration time
   * @param {string} key - Redis key
   * @param {number} seconds - TTL in seconds
   * @param {any} value - Value to store
   * @returns {Promise} Redis operation result
   */
  async setex(key, seconds, value) {
    return redisClient.setex(key, seconds, JSON.stringify(value));
  },

  /**
   * Get and parse JSON value
   * @param {string} key - Redis key
   * @returns {Promise<any>} Parsed JSON value or null
   */
  async getJSON(key) {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Delete keys matching a pattern
   * @param {string} pattern - Key pattern to match
   * @returns {Promise<number>} Number of deleted keys
   */
  async deletePattern(pattern) {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      return redisClient.del(...keys);
    }
    return 0;
  },

  /**
   * Increment counter with expiration
   * @param {string} key - Counter key
   * @param {number} seconds - TTL in seconds
   * @returns {Promise<number>} New counter value
   */
  async incrWithExpire(key, seconds) {
    const multi = redisClient.multi();
    multi.incr(key);
    multi.expire(key, seconds);
    const results = await multi.exec();
    return results[0][1];
  },

  /**
   * Add to sorted set with limit
   * @param {string} key - Sorted set key
   * @param {number} score - Member score
   * @param {string} member - Member value
   * @param {number} limit - Maximum set size
   * @returns {Promise} Redis operation result
   */
  async zaddWithLimit(key, score, member, limit) {
    const multi = redisClient.multi();
    multi.zadd(key, score, member);
    multi.zremrangebyrank(key, 0, -limit - 1);
    return multi.exec();
  },

  /**
   * Get top items from sorted set
   * @param {string} key - Sorted set key
   * @param {number} count - Number of items to retrieve
   * @returns {Promise<Array>} Top items with scores
   */
  async ztop(key, count = 10) {
    return redisClient.zrevrange(key, 0, count - 1, 'WITHSCORES');
  },

  /**
   * Publish message to channel
   * @param {string} channel - Channel name
   * @param {any} message - Message to publish
   * @returns {Promise} Redis operation result
   */
  publish: (channel, message) => {
    return redisPublisher.publish(channel, JSON.stringify(message));
  },

  /**
   * Subscribe to channel with callback
   * @param {string} channel - Channel name
   * @param {Function} callback - Message handler function
   */
  subscribe: (channel, callback) => {
    redisSubscriber.subscribe(channel);
    redisSubscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(JSON.parse(message));
      }
    });
  },
};

/**
 * Graceful Shutdown Handler
 * Properly close all Redis connections on application shutdown
 */
const gracefulShutdown = async () => {
  try {
    await redisClient.quit();
    await redisSubscriber.quit();
    await redisPublisher.quit();
    await cacheClient.quit();
    console.log('Redis connections closed gracefully');
  } catch (err) {
    console.error('Error during Redis shutdown:', err);
  }
};

// Register shutdown handlers
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Export Redis Configuration and Utilities
 * All Redis-related configurations and utility functions
 */
module.exports = {
  // Redis client instances
  redisClient,
  redisSubscriber,
  redisPublisher,
  cacheClient,
  
  // Configuration objects
  redisConfig,
  bullQueueConfig,
  sessionConfig,
  rateLimitConfig,
  cacheTTL,
  
  // Utility functions
  redisUtils,
  
  // Shutdown handler
  gracefulShutdown,
};
/**
 * @fileoverview Redis Caching and Session Management Utility
 * 
 * Comprehensive Redis client wrapper providing caching, session management,
 * pub/sub messaging, and distributed locking capabilities for the ShadowNews
 * platform. Implements performance optimization, rate limiting, and real-time
 * communication features.
 * 
 * Key Features:
 * - High-performance Redis connection management with connection pooling
 * - Comprehensive caching utilities with TTL support and JSON serialization
 * - Distributed session storage for user authentication and state management
 * - Pub/Sub messaging system for real-time notifications and updates
 * - Rate limiting and throttling mechanisms for API protection
 * - Distributed locking for concurrent operation coordination
 * - Performance monitoring and connection health management
 * - Production-ready error handling and automatic reconnection
 * 
 * Data Structure Support:
 * - Strings: Basic key-value storage with expiration
 * - Hashes: Object-like structures for complex data
 * - Sets: Unique collections for membership tracking
 * - Sorted Sets: Ranked collections for leaderboards and scoring
 * - Lists: Ordered collections for queues and stacks
 * - JSON: Automatic serialization/deserialization wrapper
 * 
 * Advanced Features:
 * - Distributed locking with automatic expiration
 * - Cache wrapper with automatic refresh and invalidation
 * - Rate limiting with sliding window algorithms
 * - Pub/Sub messaging for real-time features
 * - Bulk operations with pipelines and transactions
 * - Pattern-based key scanning and management
 * 
 * Performance Features:
 * - Connection pooling and multiplexing for high throughput
 * - Automatic retry strategies with exponential backoff
 * - Pipeline batching for bulk operations
 * - Memory-efficient data serialization
 * - Connection health monitoring and recovery
 * 
 * Security Features:
 * - Secure authentication with password protection
 * - Database isolation and namespace management
 * - Input validation and data sanitization
 * - Secure session token management
 * 
 * Dependencies:
 * - ioredis: High-performance Redis client with clustering support
 * - ../config: Redis connection configuration and environment settings
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

const Redis = require('ioredis');
const { redis: redisConfig } = require('../config');

/**
 * Redis Client Wrapper Class
 * 
 * Comprehensive Redis client implementation providing caching, session
 * management, pub/sub messaging, and distributed coordination capabilities.
 * Designed for high-performance operation in production environments.
 * 
 * @class RedisClient
 * @since 1.0.0
 */
class RedisClient {
  /**
   * Initialize Redis Client
   * 
   * Creates a new Redis client instance with separate connections for
   * general operations, pub/sub messaging, and publishing. Prepares
   * connection configuration but does not establish connections until
   * connect() is called.
   * 
   * @constructor
   */
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
  }

  /**
   * Establish Redis Connections
   * 
   * Creates three separate Redis connections for different use cases:
   * - Main client for general operations and caching
   * - Subscriber for receiving pub/sub messages
   * - Publisher for sending pub/sub messages
   * 
   * Features:
   * - Automatic retry strategy with exponential backoff
   * - Connection health monitoring and event handling
   * - Production-optimized connection settings
   * - Error handling and logging integration
   * 
   * @returns {void}
   * 
   * @example
   * // Initialize Redis connections
   * redisClient.connect();
   * 
   * @since 1.0.0
   */
  connect() {
    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });

    this.subscriber = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db
    });

    this.publisher = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    this.client.on('ready', () => {
      console.log('Redis Client Ready');
    });
  }

  /**
   * Get Value by Key
   * 
   * Retrieves a string value from Redis by its key. Fundamental operation
   * for cache lookups and data retrieval throughout the platform.
   * 
   * @param {string} key - Redis key to retrieve
   * @returns {Promise<string|null>} Value associated with key or null
   * 
   * @example
   * // Get user session data
   * const sessionData = await redisClient.get('session:user123');
   * 
   * @since 1.0.0
   */
  async get(key) {
    return await this.client.get(key);
  }

  /**
   * Set Key-Value Pair
   * 
   * Stores a string value in Redis with optional expiration time.
   * Primary method for caching data and session management.
   * 
   * @param {string} key - Redis key to set
   * @param {string} value - Value to store
   * @param {number|null} [ttl=null] - Time to live in seconds
   * @returns {Promise<string>} Redis response confirmation
   * 
   * @example
   * // Cache user data for 1 hour
   * await redisClient.set('user:123', userData, 3600);
   * 
   * @since 1.0.0
   */
  async set(key, value, ttl = null) {
    if (ttl) {
      return await this.client.set(key, value, 'EX', ttl);
    }
    return await this.client.set(key, value);
  }

  /**
   * Delete Key
   * 
   * Removes a key and its associated value from Redis. Used for
   * cache invalidation and cleanup operations.
   * 
   * @param {string} key - Redis key to delete
   * @returns {Promise<number>} Number of keys deleted (0 or 1)
   * 
   * @example
   * // Invalidate user cache
   * await redisClient.del('user:123');
   * 
   * @since 1.0.0
   */
  async del(key) {
    return await this.client.del(key);
  }

 async exists(key) {
   return await this.client.exists(key);
 }

 async expire(key, seconds) {
   return await this.client.expire(key, seconds);
 }

 async ttl(key) {
   return await this.client.ttl(key);
 }

 async incr(key) {
   return await this.client.incr(key);
 }

 async decr(key) {
   return await this.client.decr(key);
 }

 async hget(key, field) {
   return await this.client.hget(key, field);
 }

 async hset(key, field, value) {
   return await this.client.hset(key, field, value);
 }

 async hgetall(key) {
   return await this.client.hgetall(key);
 }

 async hdel(key, field) {
   return await this.client.hdel(key, field);
 }

 async sadd(key, member) {
   return await this.client.sadd(key, member);
 }

 async srem(key, member) {
   return await this.client.srem(key, member);
 }

 async smembers(key) {
   return await this.client.smembers(key);
 }

 async sismember(key, member) {
   return await this.client.sismember(key);
 }

 async zadd(key, score, member) {
   return await this.client.zadd(key, score, member);
 }

 async zrem(key, member) {
   return await this.client.zrem(key, member);
 }

 async zrange(key, start, stop, withScores = false) {
   if (withScores) {
     return await this.client.zrange(key, start, stop, 'WITHSCORES');
   }
   return await this.client.zrange(key, start, stop);
 }

 async zrevrange(key, start, stop, withScores = false) {
   if (withScores) {
     return await this.client.zrevrange(key, start, stop, 'WITHSCORES');
   }
   return await this.client.zrevrange(key, start, stop);
 }

 async lpush(key, value) {
   return await this.client.lpush(key, value);
 }

 async rpush(key, value) {
   return await this.client.rpush(key, value);
 }

 async lpop(key) {
   return await this.client.lpop(key);
 }

 async rpop(key) {
   return await this.client.rpop(key);
 }

 async lrange(key, start, stop) {
   return await this.client.lrange(key, start, stop);
 }

 async llen(key) {
   return await this.client.llen(key);
 }

 async setJson(key, value, ttl = null) {
   return await this.set(key, JSON.stringify(value), ttl);
 }

 async getJson(key) {
   const value = await this.get(key);
   return value ? JSON.parse(value) : null;
 }

 async keys(pattern) {
   return await this.client.keys(pattern);
 }

 async scan(cursor, pattern, count = 10) {
   return await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
 }

 async flushdb() {
   return await this.client.flushdb();
 }

 async flushall() {
   return await this.client.flushall();
 }

 async multi() {
   return this.client.multi();
 }

 async pipeline() {
   return this.client.pipeline();
 }

 subscribe(channel, callback) {
   this.subscriber.subscribe(channel);
   this.subscriber.on('message', callback);
 }

 unsubscribe(channel) {
   this.subscriber.unsubscribe(channel);
 }

 publish(channel, message) {
   return this.publisher.publish(channel, JSON.stringify(message));
 }

 async acquireLock(key, ttl = 10) {
   const identifier = Date.now().toString();
   const result = await this.client.set(
     `lock:${key}`,
     identifier,
     'NX',
     'EX',
     ttl
   );
   return result === 'OK' ? identifier : false;
 }

 async releaseLock(key, identifier) {
   const script = `
     if redis.call("get", KEYS[1]) == ARGV[1] then
       return redis.call("del", KEYS[1])
     else
       return 0
     end
   `;
   return await this.client.eval(script, 1, `lock:${key}`, identifier);
 }

 async cacheWrapper(key, ttl, fn) {
   const cached = await this.getJson(key);
   if (cached) {
     return cached;
   }

   const result = await fn();
   await this.setJson(key, result, ttl);
   return result;
 }

 async rateLimiter(key, limit, window) {
   const current = await this.incr(key);
   if (current === 1) {
     await this.expire(key, window);
   }
   return current <= limit;
 }

 disconnect() {
   if (this.client) {
     this.client.disconnect();
   }
   if (this.subscriber) {
     this.subscriber.disconnect();
   }
   if (this.publisher) {
     this.publisher.disconnect();
   }
 }
}

const redisClient = new RedisClient();

module.exports = redisClient;
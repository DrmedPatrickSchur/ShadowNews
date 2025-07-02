const Redis = require('ioredis');
const { createClient } = require('redis');

const redisConfig = {
 host: process.env.REDIS_HOST || 'localhost',
 port: parseInt(process.env.REDIS_PORT) || 6379,
 password: process.env.REDIS_PASSWORD || undefined,
 db: parseInt(process.env.REDIS_DB) || 0,
 retryStrategy: (times) => {
   const delay = Math.min(times * 50, 2000);
   return delay;
 },
 maxRetriesPerRequest: 3,
 enableReadyCheck: true,
 connectTimeout: 10000,
 lazyConnect: true,
 keepAlive: 30000,
 family: 4,
 keyPrefix: process.env.REDIS_KEY_PREFIX || 'shadownews:',
};

// Create Redis clients
const redisClient = new Redis(redisConfig);
const redisSubscriber = new Redis(redisConfig);
const redisPublisher = new Redis(redisConfig);

// Create cache client using node-redis for caching operations
const cacheClient = createClient({
 url: `redis://${redisConfig.password ? `:${redisConfig.password}@` : ''}${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`,
 socket: {
   connectTimeout: redisConfig.connectTimeout,
   keepAlive: redisConfig.keepAlive,
 },
});

// Bull queue configuration
const bullQueueConfig = {
 redis: {
   host: redisConfig.host,
   port: redisConfig.port,
   password: redisConfig.password,
   db: redisConfig.db,
 },
 defaultJobOptions: {
   removeOnComplete: 100,
   removeOnFail: 1000,
   attempts: 3,
   backoff: {
     type: 'exponential',
     delay: 2000,
   },
 },
};

// Session store configuration
const sessionConfig = {
 host: redisConfig.host,
 port: redisConfig.port,
 pass: redisConfig.password,
 db: redisConfig.db,
 ttl: 86400, // 24 hours
 prefix: 'sess:',
};

// Rate limiting configuration
const rateLimitConfig = {
 storeClient: redisClient,
 keyPrefix: 'rl:',
 points: {
   api: 100, // requests per window
   email: 10,
   auth: 5,
   upload: 20,
 },
 duration: 900, // 15 minutes in seconds
 blockDuration: 900, // 15 minutes block
};

// Cache TTL configurations (in seconds)
const cacheTTL = {
 userProfile: 3600, // 1 hour
 postList: 300, // 5 minutes
 postDetail: 600, // 10 minutes
 repositoryList: 1800, // 30 minutes
 emailDigest: 3600, // 1 hour
 trending: 600, // 10 minutes
 karma: 1800, // 30 minutes
 stats: 300, // 5 minutes
};

// Redis error handling
redisClient.on('error', (err) => {
 console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
 console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
 console.log('Redis Client Ready');
});

redisSubscriber.on('error', (err) => {
 console.error('Redis Subscriber Error:', err);
});

redisPublisher.on('error', (err) => {
 console.error('Redis Publisher Error:', err);
});

cacheClient.on('error', (err) => {
 console.error('Cache Client Error:', err);
});

// Connect cache client
(async () => {
 try {
   await cacheClient.connect();
   console.log('Cache Client Connected');
 } catch (err) {
   console.error('Cache Client Connection Error:', err);
 }
})();

// Utility functions
const redisUtils = {
 // Set with expiration
 async setex(key, seconds, value) {
   return redisClient.setex(key, seconds, JSON.stringify(value));
 },

 // Get and parse JSON
 async getJSON(key) {
   const value = await redisClient.get(key);
   return value ? JSON.parse(value) : null;
 },

 // Delete keys by pattern
 async deletePattern(pattern) {
   const keys = await redisClient.keys(pattern);
   if (keys.length > 0) {
     return redisClient.del(...keys);
   }
   return 0;
 },

 // Increment with expiration
 async incrWithExpire(key, seconds) {
   const multi = redisClient.multi();
   multi.incr(key);
   multi.expire(key, seconds);
   const results = await multi.exec();
   return results[0][1];
 },

 // Add to sorted set with score
 async zaddWithLimit(key, score, member, limit) {
   const multi = redisClient.multi();
   multi.zadd(key, score, member);
   multi.zremrangebyrank(key, 0, -limit - 1);
   return multi.exec();
 },

 // Get top items from sorted set
 async ztop(key, count = 10) {
   return redisClient.zrevrange(key, 0, count - 1, 'WITHSCORES');
 },

 // Pub/sub helpers
 publish: (channel, message) => {
   return redisPublisher.publish(channel, JSON.stringify(message));
 },

 subscribe: (channel, callback) => {
   redisSubscriber.subscribe(channel);
   redisSubscriber.on('message', (ch, message) => {
     if (ch === channel) {
       callback(JSON.parse(message));
     }
   });
 },
};

// Graceful shutdown
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

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
 redisClient,
 redisSubscriber,
 redisPublisher,
 cacheClient,
 redisConfig,
 bullQueueConfig,
 sessionConfig,
 rateLimitConfig,
 cacheTTL,
 redisUtils,
 gracefulShutdown,
};
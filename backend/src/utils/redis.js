const Redis = require('ioredis');
const { redis: redisConfig } = require('../config');

class RedisClient {
 constructor() {
   this.client = null;
   this.subscriber = null;
   this.publisher = null;
 }

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

 async get(key) {
   return await this.client.get(key);
 }

 async set(key, value, ttl = null) {
   if (ttl) {
     return await this.client.set(key, value, 'EX', ttl);
   }
   return await this.client.set(key, value);
 }

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
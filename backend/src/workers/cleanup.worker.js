const Bull = require('bull');
const cron = require('node-cron');
const { Redis } = require('ioredis');
const mongoose = require('mongoose');
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');
const User = require('../models/User.model');
const Repository = require('../models/Repository.model');
const Email = require('../models/Email.model');
const logger = require('../utils/logger');
const config = require('../config');

const redis = new Redis(config.redis);
const cleanupQueue = new Bull('cleanup', {
 redis: config.redis,
 defaultJobOptions: {
   removeOnComplete: true,
   removeOnFail: false,
   attempts: 3,
   backoff: {
     type: 'exponential',
     delay: 2000
   }
 }
});

const CLEANUP_TASKS = {
 EXPIRED_SESSIONS: 'expired-sessions',
 ORPHANED_COMMENTS: 'orphaned-comments',
 SPAM_POSTS: 'spam-posts',
 INACTIVE_USERS: 'inactive-users',
 TEMP_FILES: 'temp-files',
 OLD_NOTIFICATIONS: 'old-notifications',
 INVALID_EMAILS: 'invalid-emails',
 CACHE_CLEANUP: 'cache-cleanup',
 DEAD_REPOSITORIES: 'dead-repositories',
 ANALYTICS_AGGREGATION: 'analytics-aggregation'
};

cleanupQueue.process(CLEANUP_TASKS.EXPIRED_SESSIONS, async (job) => {
 const { batchSize = 1000 } = job.data;
 let cleaned = 0;

 try {
   const pattern = 'session:*';
   const stream = redis.scanStream({ match: pattern, count: 100 });

   stream.on('data', async (keys) => {
     if (keys.length) {
       const pipeline = redis.pipeline();
       
       for (const key of keys) {
         const ttl = await redis.ttl(key);
         if (ttl === -1) {
           const session = await redis.get(key);
           if (session) {
             const sessionData = JSON.parse(session);
             if (Date.now() - sessionData.lastAccess > 7 * 24 * 60 * 60 * 1000) {
               pipeline.del(key);
               cleaned++;
             }
           }
         }
       }
       
       await pipeline.exec();
     }
   });

   await new Promise((resolve) => stream.on('end', resolve));
   logger.info(`Cleaned ${cleaned} expired sessions`);
   return { cleaned };
 } catch (error) {
   logger.error('Session cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.ORPHANED_COMMENTS, async (job) => {
 const { batchSize = 500 } = job.data;
 let cleaned = 0;

 try {
   const orphanedComments = await Comment.find({
     $or: [
       { postId: { $exists: false } },
       { postId: null }
     ]
   }).limit(batchSize);

   const postIds = [...new Set(orphanedComments.map(c => c.postId).filter(Boolean))];
   const existingPosts = await Post.find({ _id: { $in: postIds } }).select('_id');
   const existingPostIds = new Set(existingPosts.map(p => p._id.toString()));

   const toDelete = orphanedComments.filter(comment => 
     !comment.postId || !existingPostIds.has(comment.postId.toString())
   );

   if (toDelete.length > 0) {
     await Comment.deleteMany({ _id: { $in: toDelete.map(c => c._id) } });
     cleaned = toDelete.length;
   }

   logger.info(`Cleaned ${cleaned} orphaned comments`);
   return { cleaned };
 } catch (error) {
   logger.error('Orphaned comments cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.SPAM_POSTS, async (job) => {
 const { threshold = -10, batchSize = 100 } = job.data;
 let cleaned = 0;

 try {
   const spamPosts = await Post.find({
     score: { $lt: threshold },
     createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
     flagCount: { $gte: 5 }
   }).limit(batchSize);

   for (const post of spamPosts) {
     await Comment.deleteMany({ postId: post._id });
     await Post.findByIdAndDelete(post._id);
     
     await User.findByIdAndUpdate(post.authorId, {
       $inc: { karma: -50, spamViolations: 1 }
     });

     await redis.sadd('spam:authors', post.authorId.toString());
     cleaned++;
   }

   logger.info(`Cleaned ${cleaned} spam posts`);
   return { cleaned };
 } catch (error) {
   logger.error('Spam cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.INACTIVE_USERS, async (job) => {
 const { inactiveDays = 365, batchSize = 100 } = job.data;
 let processed = 0;

 try {
   const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);
   
   const inactiveUsers = await User.find({
     lastActive: { $lt: cutoffDate },
     karma: { $lt: 100 },
     emailVerified: false
   }).limit(batchSize);

   for (const user of inactiveUsers) {
     const postCount = await Post.countDocuments({ authorId: user._id });
     const commentCount = await Comment.countDocuments({ authorId: user._id });
     
     if (postCount === 0 && commentCount === 0) {
       await Repository.updateMany(
         { ownerId: user._id },
         { $set: { status: 'archived', archivedAt: new Date() } }
       );
       
       await User.findByIdAndUpdate(user._id, {
         $set: { 
           status: 'inactive',
           deactivatedAt: new Date()
         }
       });
       
       processed++;
     }
   }

   logger.info(`Processed ${processed} inactive users`);
   return { processed };
 } catch (error) {
   logger.error('Inactive users cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.TEMP_FILES, async (job) => {
 const fs = require('fs').promises;
 const path = require('path');
 let cleaned = 0;

 try {
   const tempDir = path.join(__dirname, '../../temp');
   const files = await fs.readdir(tempDir);
   
   const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;

   for (const file of files) {
     const filePath = path.join(tempDir, file);
     const stats = await fs.stat(filePath);
     
     if (stats.mtimeMs < cutoffTime) {
       await fs.unlink(filePath);
       cleaned++;
     }
   }

   logger.info(`Cleaned ${cleaned} temporary files`);
   return { cleaned };
 } catch (error) {
   logger.error('Temp files cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.OLD_NOTIFICATIONS, async (job) => {
 const { daysOld = 30, batchSize = 1000 } = job.data;
 let cleaned = 0;

 try {
   const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
   const pattern = 'notification:*';
   const stream = redis.scanStream({ match: pattern, count: 100 });

   stream.on('data', async (keys) => {
     if (keys.length) {
       const pipeline = redis.pipeline();
       
       for (const key of keys) {
         const notification = await redis.get(key);
         if (notification) {
           const data = JSON.parse(notification);
           if (new Date(data.createdAt) < cutoffDate && data.read) {
             pipeline.del(key);
             cleaned++;
           }
         }
       }
       
       await pipeline.exec();
     }
   });

   await new Promise((resolve) => stream.on('end', resolve));
   logger.info(`Cleaned ${cleaned} old notifications`);
   return { cleaned };
 } catch (error) {
   logger.error('Notifications cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.INVALID_EMAILS, async (job) => {
 const { batchSize = 500 } = job.data;
 let cleaned = 0;

 try {
   const invalidEmails = await Email.find({
     $or: [
       { bounceCount: { $gte: 3 } },
       { status: 'invalid' },
       { verificationFailed: true }
     ]
   }).limit(batchSize);

   for (const email in invalidEmails) {
     await Repository.updateMany(
       { 'emails.address': email.address },
       { $pull: { emails: { address: email.address } } }
     );
     
     await Email.findByIdAndDelete(email._id);
     await redis.sadd('blacklist:emails', email.address);
     cleaned++;
   }

   logger.info(`Cleaned ${cleaned} invalid emails`);
   return { cleaned };
 } catch (error) {
   logger.error('Invalid emails cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.CACHE_CLEANUP, async (job) => {
 let cleaned = 0;

 try {
   const patterns = [
     'cache:post:*',
     'cache:user:*',
     'cache:repo:*',
     'cache:trending:*'
   ];

   for (const pattern of patterns) {
     const stream = redis.scanStream({ match: pattern, count: 100 });
     
     stream.on('data', async (keys) => {
       if (keys.length) {
         const pipeline = redis.pipeline();
         
         for (const key of keys) {
           const ttl = await redis.ttl(key);
           if (ttl === -1 || ttl > 86400) {
             pipeline.expire(key, 3600);
             cleaned++;
           }
         }
         
         await pipeline.exec();
       }
     });

     await new Promise((resolve) => stream.on('end', resolve));
   }

   await redis.del('cache:stats:*');
   
   logger.info(`Reset ${cleaned} cache entries`);
   return { cleaned };
 } catch (error) {
   logger.error('Cache cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.DEAD_REPOSITORIES, async (job) => {
 const { inactiveDays = 180, minEmails = 10 } = job.data;
 let cleaned = 0;

 try {
   const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);
   
   const deadRepos = await Repository.find({
     lastActivity: { $lt: cutoffDate },
     emailCount: { $lt: minEmails },
     status: 'active'
   }).limit(100);

   for (const repo of deadRepos) {
     const recentPosts = await Post.countDocuments({
       repositoryId: repo._id,
       createdAt: { $gt: cutoffDate }
     });

     if (recentPosts === 0) {
       await Repository.findByIdAndUpdate(repo._id, {
         $set: { 
           status: 'archived',
           archivedAt: new Date(),
           archivedReason: 'inactivity'
         }
       });
       
       await User.findByIdAndUpdate(repo.ownerId, {
         $inc: { karma: -10 }
       });
       
       cleaned++;
     }
   }

   logger.info(`Archived ${cleaned} dead repositories`);
   return { cleaned };
 } catch (error) {
   logger.error('Dead repositories cleanup error:', error);
   throw error;
 }
});

cleanupQueue.process(CLEANUP_TASKS.ANALYTICS_AGGREGATION, async (job) => {
 const { date = new Date() } = job.data;
 
 try {
   const startOfDay = new Date(date);
   startOfDay.setHours(0, 0, 0, 0);
   const endOfDay = new Date(date);
   endOfDay.setHours(23, 59, 59, 999);

   const [posts, comments, newUsers, activeRepos] = await Promise.all([
     Post.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
     Comment.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
     User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
     Repository.countDocuments({ 
       lastActivity: { $gte: startOfDay, $lte: endOfDay },
       status: 'active'
     })
   ]);

   const topPosts = await Post.find({
     createdAt: { $gte: startOfDay, $lte: endOfDay }
   })
   .sort({ score: -1 })
   .limit(10)
   .select('title score');

   const analytics = {
     date: startOfDay,
     metrics: {
       posts,
       comments,
       newUsers,
       activeRepos,
       engagement: (posts + comments) / (await User.countDocuments({ status: 'active' }))
     },
     topPosts
   };

   await redis.hset(
     'analytics:daily',
     startOfDay.toISOString().split('T')[0],
     JSON.stringify(analytics)
   );

   logger.info(`Aggregated analytics for ${startOfDay.toISOString().split('T')[0]}`);
   return analytics;
 } catch (error) {
   logger.error('Analytics aggregation error:', error);
   throw error;
 }
});

cron.schedule('0 2 * * *', async () => {
 await cleanupQueue.add(CLEANUP_TASKS.EXPIRED_SESSIONS);
 await cleanupQueue.add(CLEANUP_TASKS.OLD_NOTIFICATIONS);
 await cleanupQueue.add(CLEANUP_TASKS.CACHE_CLEANUP);
 logger.info('Scheduled daily cleanup tasks');
});

cron.schedule('0 3 * * *', async () => {
 await cleanupQueue.add(CLEANUP_TASKS.ORPHANED_COMMENTS);
 await cleanupQueue.add(CLEANUP_TASKS.SPAM_POSTS);
 await cleanupQueue.add(CLEANUP_TASKS.TEMP_FILES);
 logger.info('Scheduled daily content cleanup');
});

cron.schedule('0 4 * * 1', async () => {
 await cleanupQueue.add(CLEANUP_TASKS.INVALID_EMAILS);
 await cleanupQueue.add(CLEANUP_TASKS.DEAD_REPOSITORIES);
 logger.info('Scheduled weekly cleanup tasks');
});

cron.schedule('0 5 1 * *', async () => {
 await cleanupQueue.add(CLEANUP_TASKS.INACTIVE_USERS);
 logger.info('Scheduled monthly user cleanup');
});

cron.schedule('0 0 * * *', async () => {
 await cleanupQueue.add(CLEANUP_TASKS.ANALYTICS_AGGREGATION, {
   date: new Date(Date.now() - 24 * 60 * 60 * 1000)
 });
 logger.info('Scheduled analytics aggregation');
});

cleanupQueue.on('completed', (job, result) => {
 logger.info(`Cleanup job ${job.name} completed:`, result);
});

cleanupQueue.on('failed', (job, err) => {
 logger.error(`Cleanup job ${job.name} failed:`, err);
});

module.exports = cleanupQueue;
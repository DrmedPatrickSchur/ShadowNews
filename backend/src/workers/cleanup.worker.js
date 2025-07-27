/**
 * @fileoverview Cleanup Background Worker
 * 
 * Background worker process for automated system maintenance and cleanup operations.
 * Handles periodic cleanup of expired sessions, orphaned data, spam content, inactive users,
 * temporary files, old notifications, and system analytics aggregation.
 * 
 * This worker runs on scheduled intervals using cron jobs to maintain system health,
 * prevent data bloat, and ensure optimal performance across the ShadowNews platform.
 * 
 * Key Fea  } catch (error) {
    logger.error('Spam cleanup error:', error);
    throw error;
  }
});

/**
 * Inactive Users Cleanup Task
 * 
 * Archives user accounts that have been inactive for extended periods
 * and have minimal platform engagement. Helps maintain active user
 * metrics and reduces storage for dormant accounts.
 * 
 * Inactive User Criteria:
 * - No activity for specified number of days (default: 365)
 * - Low karma score (less than 100)
 * - Unverified email address
 * - No posts or comments created
 * 
 * Archive Process:
 * - Mark associated repositories as archived
 * - Set user status to 'inactive'
 * - Record deactivation timestamp
 * - Preserve data for potential reactivation
 * 
 * @param {Object} job - Bull job object containing user cleanup parameters
 * @param {number} job.data.inactiveDays - Days of inactivity before archival (default: 365)
 * @param {number} job.data.batchSize - Maximum users to process (default: 100)
 * @returns {Promise<Object>} Cleanup result with count of archived users
 * 
 * @since 1.0.0
 */:
 * - Automated expired session cleanup from Redis
 * - Orphaned comment removal and data integrity maintenance
 * - Spam post detection and automated removal
 * - Inactive user account management and archival
 * - Temporary file cleanup to prevent disk space issues
 * - Old notification purging for memory optimization
 * - Invalid email address blacklisting and removal
 * - Cache optimization and TTL management
 * - Dead repository archival based on activity metrics
 * - Daily analytics aggregation for reporting
 * 
 * Cleanup Tasks:
 * - EXPIRED_SESSIONS: Remove old Redis sessions (daily 2 AM)
 * - ORPHANED_COMMENTS: Clean comments without parent posts (daily 3 AM)
 * - SPAM_POSTS: Remove flagged spam content (daily 3 AM)
 * - INACTIVE_USERS: Archive users with no activity (monthly)
 * - TEMP_FILES: Remove temporary upload files (daily 3 AM)
 * - OLD_NOTIFICATIONS: Purge read notifications older than 30 days (daily 2 AM)
 * - INVALID_EMAILS: Remove bounced/invalid email addresses (weekly)
 * - CACHE_CLEANUP: Reset cache TTL and remove stale entries (daily 2 AM)
 * - DEAD_REPOSITORIES: Archive inactive repositories (weekly)
 * - ANALYTICS_AGGREGATION: Daily metrics collection (midnight)
 * 
 * Scheduling:
 * - Frequency: Multiple cron schedules for different task types
 * - Triggers: Time-based automatic execution
 * - Dependencies: Redis, MongoDB, file system access
 * 
 * Dependencies:
 * - bull: Job queue management for reliable task processing
 * - node-cron: Cron-based task scheduling
 * - ioredis: Redis client for session and cache management
 * - mongoose: MongoDB operations for data cleanup
 * - fs: File system operations for temporary file cleanup
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Bull queue management library for reliable background job processing
const Bull = require('bull');

// Node.js cron scheduler for time-based task execution
const cron = require('node-cron');

// Redis client for session management and caching operations
const { Redis } = require('ioredis');

// Mongoose ODM for MongoDB database operations
const mongoose = require('mongoose');

// Database models for cleanup operations
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');
const User = require('../models/User.model');
const Repository = require('../models/Repository.model');
const Email = require('../models/Email.model');

// Centralized logging utility for cleanup operations tracking
const logger = require('../utils/logger');

// Application configuration including Redis connection settings
const config = require('../config');

/**
 * Redis Connection Setup
 * Establishes connection to Redis server for session and cache management
 */
const redis = new Redis(config.redis);

/**
 * Cleanup Job Queue Configuration
 * Bull queue instance for managing background cleanup tasks with retry logic
 * and failure handling to ensure reliable cleanup operations
 */
const cleanupQueue = new Bull('cleanup', {
  redis: config.redis, // Redis connection configuration
  defaultJobOptions: {
    removeOnComplete: true, // Clean up completed jobs to prevent memory bloat
    removeOnFail: false, // Keep failed jobs for debugging
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential', // Use exponential backoff for retries
      delay: 2000 // Initial delay of 2 seconds
    }
  }
});

/**
 * Cleanup Task Types Enumeration
 * Defines all available cleanup tasks with descriptive identifiers
 * for organized task management and scheduling
 */
const CLEANUP_TASKS = {
  EXPIRED_SESSIONS: 'expired-sessions', // Remove old Redis user sessions
  ORPHANED_COMMENTS: 'orphaned-comments', // Clean comments without parent posts
  SPAM_POSTS: 'spam-posts', // Remove flagged spam content
  INACTIVE_USERS: 'inactive-users', // Archive users with no recent activity
  TEMP_FILES: 'temp-files', // Remove temporary upload files
  OLD_NOTIFICATIONS: 'old-notifications', // Purge old read notifications
  INVALID_EMAILS: 'invalid-emails', // Remove bounced/invalid email addresses
  CACHE_CLEANUP: 'cache-cleanup', // Reset cache TTL and remove stale entries
  DEAD_REPOSITORIES: 'dead-repositories', // Archive repositories with no activity
  ANALYTICS_AGGREGATION: 'analytics-aggregation' // Aggregate daily platform metrics
};

/**
 * Expired Sessions Cleanup Task
 * 
 * Removes expired user sessions from Redis to free up memory and maintain security.
 * Scans all session keys and deletes sessions that haven't been accessed for more than 7 days.
 * Uses Redis streaming for efficient processing of large numbers of sessions without memory issues.
 * 
 * Process:
 * 1. Scan Redis for all session keys matching pattern 'session:*'
 * 2. Check TTL for each session key
 * 3. For keys without TTL (-1), parse session data
 * 4. Delete sessions not accessed for more than 7 days
 * 5. Use Redis pipeline for efficient batch operations
 * 
 * Performance Optimizations:
 * - Streaming scan to handle large datasets
 * - Pipeline operations for batch deletions
 * - Configurable batch size for memory management
 * 
 * @param {Object} job - Bull job object containing task parameters
 * @param {number} job.data.batchSize - Maximum number of sessions to process (default: 1000)
 * @returns {Promise<Object>} Cleanup result with count of cleaned sessions
 */
cleanupQueue.process(CLEANUP_TASKS.EXPIRED_SESSIONS, async (job) => {
  const { batchSize = 1000 } = job.data;
  let cleaned = 0;

  try {
    // Pattern to match all user session keys in Redis
    const pattern = 'session:*';
    // Create streaming scanner for memory-efficient processing
    const stream = redis.scanStream({ match: pattern, count: 100 });

    // Process session keys in batches as they're discovered
    stream.on('data', async (keys) => {
      if (keys.length) {
        // Use Redis pipeline for efficient batch operations
        const pipeline = redis.pipeline();
        
        // Check each session key for expiration
        for (const key of keys) {
          // Get TTL to check if session has expiration set
          const ttl = await redis.ttl(key);
          // If TTL is -1, key exists but has no expiration set
          if (ttl === -1) {
            const session = await redis.get(key);
            if (session) {
              const sessionData = JSON.parse(session);
              // Check if session hasn't been accessed for more than 7 days
              if (Date.now() - sessionData.lastAccess > 7 * 24 * 60 * 60 * 1000) {
                pipeline.del(key);
                cleaned++;
              }
            }
          }
        }
        
        // Execute all delete operations in a single batch
        await pipeline.exec();
      }
    });

    // Wait for streaming scan to complete
    await new Promise((resolve) => stream.on('end', resolve));
    logger.info(`Cleaned ${cleaned} expired sessions`);
    return { cleaned };
  } catch (error) {
    logger.error('Session cleanup error:', error);
    throw error;
  }
});

/**
 * Orphaned Comments Cleanup Task
 * 
 * Removes comments that have lost their parent posts due to post deletion
 * or data inconsistencies. Maintains referential integrity in the comment
 * system by cleaning up orphaned references and freeing storage space.
 * 
 * Process:
 * 1. Find comments with missing or null postId references
 * 2. Verify if referenced posts actually exist in database
 * 3. Delete comments whose parent posts no longer exist
 * 4. Process in batches to handle large comment datasets efficiently
 * 
 * Data Integrity Features:
 * - Cross-references comment-post relationships
 * - Batch processing for performance optimization
 * - Safe deletion with existence verification
 * 
 * @param {Object} job - Bull job object containing cleanup parameters
 * @param {number} job.data.batchSize - Maximum comments to process (default: 500)
 * @returns {Promise<Object>} Cleanup result with count of deleted comments
 * 
 * @since 1.0.0
 */
cleanupQueue.process(CLEANUP_TASKS.ORPHANED_COMMENTS, async (job) => {
  const { batchSize = 500 } = job.data;
  let cleaned = 0;

  try {
    // Find comments with missing or null post references
    const orphanedComments = await Comment.find({
      $or: [
        { postId: { $exists: false } }, // Comments without postId field
        { postId: null } // Comments with null postId
      ]
    }).limit(batchSize);

    // Extract unique post IDs from comments for verification
    const postIds = [...new Set(orphanedComments.map(c => c.postId).filter(Boolean))];
    // Verify which posts actually exist in database
    const existingPosts = await Post.find({ _id: { $in: postIds } }).select('_id');
    const existingPostIds = new Set(existingPosts.map(p => p._id.toString()));

    // Filter comments whose parent posts don't exist
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

/**
 * Spam Posts Cleanup Task
 * 
 * Automatically removes posts identified as spam based on multiple quality
 * metrics including user flags, karma scores, and age. Implements automated
 * moderation to maintain content quality and user experience.
 * 
 * Spam Detection Criteria:
 * - Posts with score below threshold (default: -10)
 * - Posts older than 24 hours to allow community moderation
 * - Posts with 5 or more user flags
 * 
 * Enforcement Actions:
 * - Delete spam post and associated comments
 * - Penalize author with karma reduction (-50)
 * - Increment author's spam violation count
 * - Add author to spam watch list in Redis
 * 
 * @param {Object} job - Bull job object containing spam cleanup parameters
 * @param {number} job.data.threshold - Minimum score for spam detection (default: -10)
 * @param {number} job.data.batchSize - Maximum posts to process (default: 100)
 * @returns {Promise<Object>} Cleanup result with count of removed spam posts
 * 
 * @since 1.0.0
 */
cleanupQueue.process(CLEANUP_TASKS.SPAM_POSTS, async (job) => {
  const { threshold = -10, batchSize = 100 } = job.data;
  let cleaned = 0;

  try {
    // Find posts matching spam criteria
    const spamPosts = await Post.find({
      score: { $lt: threshold }, // Below quality threshold
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // At least 24 hours old
      flagCount: { $gte: 5 } // Multiple user flags
    }).limit(batchSize);

    for (const post of spamPosts) {
      // Remove all comments associated with spam post
      await Comment.deleteMany({ postId: post._id });
      // Delete the spam post itself
      await Post.findByIdAndDelete(post._id);
      
      // Penalize the author for posting spam
      await User.findByIdAndUpdate(post.authorId, {
        $inc: { karma: -50, spamViolations: 1 }
      });

      // Add author to spam monitoring list
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
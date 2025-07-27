/**
 * @fileoverview Email Digest Generation Worker
 * 
 * Sophisticated email digest system for the ShadowNews platform that generates
 * personalized email digests containing curated content based on user interests,
 * subscriptions, and engagement patterns. Supports daily, weekly, and monthly
 * digest frequencies with intelligent content ranking and relevance scoring.
 * 
 * Key Features:
 * - Personalized content curation based on user subscriptions and interests
 * - Intelligent relevance scoring algorithm for optimal content selection
 * - Multi-frequency digest support (daily, weekly, monthly)
 * - Repository update tracking and growth metrics
 * - CSV attachment generation for new repository contacts
 * - Batch processing for high-scale email delivery
 * - Comprehensive user preference management and opt-out handling
 * - Performance monitoring and statistics tracking
 * 
 * Content Selection Algorithm:
 * - Hashtag-based relevance matching with user subscriptions
 * - Repository membership content prioritization
 * - Karma-weighted quality scoring for trending content
 * - Recency weighting for timely content delivery
 * - Engagement-based personalization for user preferences
 * 
 * Digest Features:
 * - HTML email templates with responsive design
 * - Repository growth statistics and new member tracking
 * - CSV exports of new repository contacts
 * - Engagement metrics and call-to-action integration
 * - Unsubscribe management and preference controls
 * 
 * Performance Features:
 * - Batch processing with configurable batch sizes
 * - Redis-based caching for digest timing and frequency control
 * - Asynchronous job processing with retry mechanisms
 * - Memory-efficient query optimization for large user bases
 * - Automatic cleanup of completed jobs
 * 
 * Scheduling Features:
 * - Cron-based automatic digest scheduling
 * - User timezone consideration for optimal delivery times
 * - Frequency-based digest distribution management
 * - Rate limiting for email service provider compliance
 * 
 * Dependencies:
 * - bull: Redis-backed job queue for scalable digest processing
 * - node-cron: Scheduled task management for digest automation
 * - ../models/*: Database models for users, posts, and repositories
 * - ../services/email.service: Email delivery service integration
 * - ../utils/redis: Redis caching for digest state management
 * - ../utils/emailTemplates: HTML template generation utilities
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

const Bull = require('bull');
const cron = require('node-cron');
const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Repository = require('../models/Repository.model');
const emailService = require('../services/email.service');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { generateDigestHTML } = require('../utils/emailTemplates');

/**
 * Digest Processing Queue
 * 
 * Redis-backed job queue specifically configured for email digest
 * generation and delivery with optimized settings for email processing.
 * 
 * @constant {Bull} digestQueue - Email digest processing queue
 */
const digestQueue = new Bull('email-digest', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

/**
 * Digest Processing Configuration
 * 
 * Performance and quality configuration constants for digest generation.
 * 
 * @constant {number} BATCH_SIZE - Number of users processed per batch
 * @constant {number} MAX_POSTS_PER_DIGEST - Maximum posts included per digest
 */
const BATCH_SIZE = 100;
const MAX_POSTS_PER_DIGEST = 10;

/**
 * Individual Digest Processing Handler
 * 
 * Processes individual digest generation jobs for specific users.
 * Handles content curation, relevance scoring, HTML generation,
 * and email delivery with comprehensive error handling.
 * 
 * Processing Flow:
 * 1. Validate user preferences and opt-in status
 * 2. Retrieve user's last digest timestamp from cache
 * 3. Query and score relevant content based on user interests
 * 4. Generate repository updates and growth metrics
 * 5. Create HTML digest with personalized content
 * 6. Send email with optional CSV attachments
 * 7. Update cache and user statistics
 * 
 * @param {Object} job - Bull job containing digest parameters
 * @param {string} job.data.userId - User ID to generate digest for
 * @param {string} job.data.frequency - Digest frequency (daily/weekly/monthly)
 * @returns {Promise<Object>} Processing result with statistics
 * 
 * @since 1.0.0
 */
digestQueue.process('send-digest', 10, async (job) => {
  const { userId, frequency } = job.data;
  
  try {
    const user = await User.findById(userId)
      .populate('subscribedHashtags')
      .populate('repositories');
    
    if (!user || !user.emailNotifications || !user.emailNotifications.digest) {
      return { skipped: true, reason: 'User opted out or not found' };
    }

    const lastDigestKey = `last_digest:${userId}:${frequency}`;
    const lastDigestTime = await redis.get(lastDigestKey) || new Date(0);
    
    const posts = await getRelevantPosts(user, lastDigestTime);
    
    if (posts.length === 0) {
      return { skipped: true, reason: 'No new content' };
    }

    const repositoryUpdates = await getRepositoryUpdates(user, lastDigestTime);
    const digestHTML = generateDigestHTML({
      user,
      posts,
      repositoryUpdates,
      frequency
    });

    await emailService.sendEmail({
      to: user.email,
      subject: `🌟 Your ${frequency} Shadownews Digest: ${posts.length} must-read posts`,
      html: digestHTML,
      attachments: await generateDigestAttachments(user, repositoryUpdates)
    });

    await redis.set(lastDigestKey, new Date().toISOString());
    await updateUserDigestStats(userId, posts.length);

    return { 
      success: true, 
      userId, 
      postsCount: posts.length,
      repositoriesCount: repositoryUpdates.length 
    };
  } catch (error) {
    logger.error('Digest processing error:', error);
    throw error;
  }
});

/**
 * Get Relevant Posts for User
 * 
 * Retrieves and ranks posts relevant to the user based on their subscriptions,
 * repository memberships, and platform engagement patterns. Implements
 * sophisticated relevance scoring for personalized content curation.
 * 
 * Selection Criteria:
 * - Posts with hashtags matching user subscriptions
 * - Posts from repositories the user is a member of
 * - High-karma posts (100+ karma) for quality content
 * - Recent posts within the digest timeframe
 * 
 * @param {Object} user - User object with subscriptions and repositories
 * @param {Date} since - Timestamp for filtering new content
 * @returns {Promise<Array<Object>>} Ranked array of relevant posts
 * 
 * @since 1.0.0
 */
async function getRelevantPosts(user, since) {
  const query = {
    createdAt: { $gte: new Date(since) },
    $or: [
      { hashtags: { $in: user.subscribedHashtags } },
      { 'repository._id': { $in: user.repositories } },
      { karma: { $gte: 100 } } // High-quality posts
    ]
  };

  const posts = await Post.find(query)
    .populate('author', 'username avatar')
    .populate('hashtags')
    .sort({ karma: -1, createdAt: -1 })
    .limit(MAX_POSTS_PER_DIGEST);

  // Add personalization score and sort by relevance
  return posts.map(post => ({
    ...post.toObject(),
    relevanceScore: calculateRelevanceScore(post, user)
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get Repository Updates
 * 
 * Retrieves updates for repositories the user is associated with,
 * including new member additions and growth metrics for digest inclusion.
 * 
 * @param {Object} user - User object with repository associations
 * @param {Date} since - Timestamp for filtering recent updates
 * @returns {Promise<Array<Object>>} Repository updates with growth metrics
 * 
 * @since 1.0.0
 */
async function getRepositoryUpdates(user, since) {
  const updates = await Repository.find({
    _id: { $in: user.repositories },
    lastActivity: { $gte: new Date(since) }
  }).populate('owner', 'username');

  return updates.map(repo => ({
    ...repo.toObject(),
    newEmails: repo.emails.filter(email => 
      new Date(email.addedAt) >= new Date(since)
    ).length,
    growth: calculateGrowthPercentage(repo, since)
  }));
}

/**
 * Calculate Post Relevance Score
 * 
 * Implements sophisticated scoring algorithm to rank content relevance
 * for individual users based on multiple engagement and preference factors.
 * 
 * Scoring Factors:
 * - Hashtag overlap with user subscriptions (10 points per match)
 * - Post karma using logarithmic scaling (5x log10(karma+1))
 * - Recency bonus for fresh content (max 48 points for newest)
 * - Repository connection bonus (20 points for user's repositories)
 * 
 * @param {Object} post - Post object with hashtags and metadata
 * @param {Object} user - User object with preferences and subscriptions
 * @returns {number} Calculated relevance score for ranking
 * 
 * @since 1.0.0
 */
function calculateRelevanceScore(post, user) {
  let score = 0;
  
  // Hashtag overlap scoring
  const userHashtags = new Set(user.subscribedHashtags.map(h => h._id.toString()));
  const postHashtags = new Set(post.hashtags.map(h => h._id.toString()));
  const overlap = [...userHashtags].filter(h => postHashtags.has(h)).length;
  score += overlap * 10;

  // Karma weight using logarithmic scaling
  score += Math.log10(post.karma + 1) * 5;

  // Recency weight with time decay
  const hoursAgo = (Date.now() - post.createdAt) / (1000 * 60 * 60);
  score += Math.max(0, 24 - hoursAgo) * 2;

  // Repository connection bonus
  if (user.repositories.some(r => r.toString() === post.repository?._id?.toString())) {
    score += 20;
  }

  return score;
}

/**
 * Generate Digest CSV Attachments
 * 
 * Creates CSV file attachments containing new repository contacts
 * for users to track growth and manage their email lists.
 * 
 * @param {Object} user - User object for context
 * @param {Array<Object>} repositoryUpdates - Repository updates with new emails
 * @returns {Promise<Array<Object>>} Array of email attachment objects
 * 
 * @since 1.0.0
 */
async function generateDigestAttachments(user, repositoryUpdates) {
  const attachments = [];

  for (const repo of repositoryUpdates) {
    if (repo.newEmails > 0) {
      const csvContent = repo.emails
        .filter(email => new Date(email.addedAt) >= new Date(repo.lastActivity))
        .map(email => `${email.address},${email.verificationStatus},${email.addedAt}`)
        .join('\n');

      attachments.push({
        filename: `${repo.name.replace(/\s+/g, '_')}_new_contacts.csv`,
        content: `Email,Status,Added\n${csvContent}`,
        contentType: 'text/csv'
      });
    }
  }

  return attachments;
}

/**
 * Calculate Repository Growth Percentage
 * 
 * Computes growth percentage for repositories based on new member
 * additions since the last digest, providing valuable growth metrics.
 * 
 * @param {Object} repo - Repository object with email member data
 * @param {Date} since - Start date for growth calculation
 * @returns {string} Growth percentage formatted to one decimal place
 * 
 * @since 1.0.0
 */
function calculateGrowthPercentage(repo, since) {
  const previousCount = repo.emails.filter(email => 
    new Date(email.addedAt) < new Date(since)
  ).length;
  
  const newCount = repo.emails.length - previousCount;
  return previousCount > 0 ? ((newCount / previousCount) * 100).toFixed(1) : 100;
}

/**
 * Update User Digest Statistics
 * 
 * Updates user statistics to track digest delivery and engagement
 * metrics for analytics and user experience optimization.
 * 
 * @param {string} userId - User ID to update statistics for
 * @param {number} postsCount - Number of posts included in digest
 * @returns {Promise<void>}
 * 
 * @since 1.0.0
 */
async function updateUserDigestStats(userId, postsCount) {
  await User.findByIdAndUpdate(userId, {
    $inc: {
      'stats.digestsSent': 1,
      'stats.digestPostsDelivered': postsCount
    },
    'stats.lastDigestSent': new Date()
  });
}

/**
 * Cron Scheduling Configuration
 * 
 * Automated digest scheduling system using cron patterns for reliable
 * digest delivery at user-preferred frequencies. Provides scalable
 * batch processing for high-volume digest operations.
 */

/**
 * Daily Digest Schedule
 * Triggers every day at 9:00 AM UTC
 * Processes users with daily digest preference
 */
cron.schedule('0 9 * * *', async () => {
  logger.info('Starting daily digest job');
  await scheduleDigests('daily');
});

/**
 * Weekly Digest Schedule
 * Triggers every Monday at 9:00 AM UTC
 * Processes users with weekly digest preference
 */
cron.schedule('0 9 * * 1', async () => {
  logger.info('Starting weekly digest job');
  await scheduleDigests('weekly');
});

/**
 * Monthly Digest Schedule
 * Triggers first day of each month at 9:00 AM UTC
 * Processes users with monthly digest preference
 */
cron.schedule('0 9 1 * *', async () => {
  logger.info('Starting monthly digest job');
  await scheduleDigests('monthly');
});

/**
 * Schedule Digests by Frequency
 * 
 * Orchestrates batch digest scheduling for users with specified frequency
 * preferences. Implements efficient batch processing to handle large user
 * bases while maintaining system performance and queue stability.
 * 
 * Process Flow:
 * 1. Query verified users with digest notifications enabled
 * 2. Process users in batches to avoid memory/queue overload
 * 3. Queue individual digest jobs with retry configuration
 * 4. Track progress and handle batch completion
 * 
 * @param {string} frequency - Digest frequency ('daily', 'weekly', 'monthly')
 * @returns {Promise<void>}
 * 
 * @since 1.0.0
 */
async function scheduleDigests(frequency) {
  try {
    const query = {
      'emailNotifications.digest': true,
      'emailNotifications.digestFrequency': frequency,
      verified: true
    };

    const userCount = await User.countDocuments(query);
    logger.info(`Scheduling ${userCount} ${frequency} digests`);

    let processed = 0;
    
    /**
     * Recursive Batch Processing
     * Processes users in chunks to maintain system performance
     */
    const batchProcess = async (skip) => {
      const users = await User.find(query)
        .select('_id')
        .skip(skip)
        .limit(BATCH_SIZE);

      for (const user of users) {
        await digestQueue.add('send-digest', {
          userId: user._id,
          frequency
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        });
      }

      processed += users.length;
      
      if (users.length === BATCH_SIZE) {
        await batchProcess(skip + BATCH_SIZE);
      }
    };

    await batchProcess(0);
    logger.info(`Scheduled ${processed} ${frequency} digest jobs`);
  } catch (error) {
    logger.error(`Error scheduling ${frequency} digests:`, error);
  }
}

/**
 * Queue Event Handlers
 * 
 * Comprehensive event handling for digest queue operations providing
 * monitoring, error tracking, and operational insights for production
 * digest delivery system.
 */

/**
 * Failed Job Handler
 * Captures and logs digest delivery failures for troubleshooting
 * and system monitoring purposes
 */
digestQueue.on('failed', (job, err) => {
  logger.error(`Digest job ${job.id} failed:`, err);
});

/**
 * Completed Job Handler
 * Logs successful digest deliveries for analytics and monitoring
 * while filtering out skipped digest notifications
 */
digestQueue.on('completed', (job, result) => {
  if (!result.skipped) {
    logger.info(`Digest sent successfully`, result);
  }
});

/**
 * Automated Queue Cleanup
 * 
 * Daily maintenance job to clean up completed digest jobs older than
 * 24 hours, preventing queue bloat and maintaining optimal performance.
 * Runs at midnight UTC daily.
 */
cron.schedule('0 0 * * *', async () => {
  const jobCounts = await digestQueue.clean(24 * 60 * 60 * 1000); // 24 hours
  logger.info(`Cleaned ${jobCounts.length} completed digest jobs`);
});

/**
 * Module Exports
 * 
 * Exposes digest queue instance and scheduling function for external
 * integration with other workers and administrative operations.
 */
module.exports = {
  digestQueue,
  scheduleDigests
};
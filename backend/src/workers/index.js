/**
 * @fileoverview Workers Queue Management System
 * 
 * Centralized background job processing system for the ShadowNews platform.
 * Manages distributed queues for email processing, digest generation, snowball
 * distribution, and data cleanup operations using Redis-backed Bull queues.
 * 
 * Key Features:
 * - Multi-worker queue processing with configurable concurrency
 * - Redis-backed persistent job storage and distribution
 * - Automatic retry strategies with exponential backoff
 * - Comprehensive job monitoring and error handling
 * - Scheduled recurring tasks with cron-like scheduling
 * - Queue management and administrative operations
 * - Graceful shutdown and error recovery mechanisms
 * - Performance monitoring and statistics collection
 * 
 * Worker Types:
 * - Email Worker: Processes incoming emails and email-based posting
 * - Digest Worker: Generates daily/weekly email digests for users
 * - Snowball Worker: Manages viral distribution and community growth
 * - Cleanup Worker: Performs maintenance and data cleanup operations
 * 
 * Queue Features:
 * - Priority-based job processing for critical operations
 * - Automatic job retry with configurable failure strategies
 * - Job progress tracking and status monitoring
 * - Dead letter queue handling for failed jobs
 * - Memory-efficient job processing with batching
 * - Rate limiting and throttling for external API calls
 * 
 * Production Features:
 * - Horizontal scaling with multiple worker instances
 * - Health monitoring and alerting integration
 * - Job performance metrics and analytics
 * - Graceful degradation under high load
 * - Resource usage optimization and memory management
 * 
 * Dependencies:
 * - bull: Redis-backed job queue system with advanced features
 * - ioredis: High-performance Redis client for queue persistence
 * - ../utils/logger: Centralized logging for job monitoring
 * - ../config: Configuration management for queue settings
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

const Queue = require('bull');
const Redis = require('ioredis');
const { logger } = require('../utils/logger');
const config = require('../config');

// Import specialized worker processors
const emailWorker = require('./email.worker');
const digestWorker = require('./digest.worker');
const snowballWorker = require('./snowball.worker');
const cleanupWorker = require('./cleanup.worker');

/**
 * Redis Connection Configuration
 * 
 * Dedicated Redis connection for queue management with optimized settings
 * for high-throughput job processing and reliable message delivery.
 * 
 * Features:
 * - Unlimited retry attempts for queue reliability
 * - Disabled ready check for faster connection establishment
 * - Production-optimized connection pooling
 */
const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

/**
 * Queue Definitions
 * 
 * Organized collection of specialized job queues for different platform
 * operations. Each queue is optimized for its specific use case with
 * appropriate concurrency limits and processing strategies.
 * 
 * @constant {Object} queues - Collection of Bull job queues
 * @property {Queue} emailQueue - Email processing and email-to-post conversion
 * @property {Queue} digestQueue - Daily/weekly digest email generation
 * @property {Queue} snowballQueue - Viral distribution and growth processing
 * @property {Queue} cleanupQueue - Data maintenance and cleanup operations
 */
const queues = {
  emailQueue: new Queue('email-processing', { redis }),
  digestQueue: new Queue('digest-generation', { redis }),
  snowballQueue: new Queue('snowball-distribution', { redis }),
  cleanupQueue: new Queue('data-cleanup', { redis }),
};

/**
 * Initialize All Background Workers
 * 
 * Sets up job processors for each queue with appropriate concurrency limits,
 * error handling, and monitoring. Configures recurring scheduled jobs and
 * establishes comprehensive logging for job lifecycle events.
 * 
 * Concurrency Configuration:
 * - Email Processing: 10 concurrent jobs for high throughput
 * - Digest Generation: 5 concurrent jobs to manage email sending rates
 * - Snowball Distribution: 3 concurrent jobs for controlled growth
 * - Data Cleanup: 1 concurrent job to prevent resource conflicts
 * 
 * @returns {void}
 * 
 * @example
 * // Initialize the worker system
 * initializeWorkers();
 * 
 * @since 1.0.0
 */
const initializeWorkers = () => {
  // Email processing worker with high concurrency for real-time processing
  queues.emailQueue.process(10, emailWorker.processEmail);
  queues.emailQueue.on('completed', (job, result) => {
    logger.info(`Email job ${job.id} completed`, { result });
  });
  queues.emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed`, { error: err.message });
  });

  // Digest generation worker with moderate concurrency for email sending
  queues.digestQueue.process(5, digestWorker.generateDigest);
  queues.digestQueue.on('completed', (job, result) => {
    logger.info(`Digest job ${job.id} completed`, { recipientCount: result.recipientCount });
  });
  queues.digestQueue.on('failed', (job, err) => {
    logger.error(`Digest job ${job.id} failed`, { error: err.message });
  });

  // Snowball distribution worker with controlled concurrency for growth management
  queues.snowballQueue.process(3, snowballWorker.processSnowball);
  queues.snowballQueue.on('completed', (job, result) => {
    logger.info(`Snowball job ${job.id} completed`, { 
      newEmails: result.newEmailsAdded,
      repository: result.repositoryId 
    });
  });
  queues.snowballQueue.on('failed', (job, err) => {
    logger.error(`Snowball job ${job.id} failed`, { error: err.message });
  });

  // Cleanup worker with single concurrency to prevent resource conflicts
  queues.cleanupQueue.process(1, cleanupWorker.performCleanup);
  queues.cleanupQueue.on('completed', (job, result) => {
    logger.info(`Cleanup job ${job.id} completed`, { 
      deletedItems: result.deletedCount 
    });
  });
  queues.cleanupQueue.on('failed', (job, err) => {
    logger.error(`Cleanup job ${job.id} failed`, { error: err.message });
  });

  // Initialize recurring scheduled jobs
  setupRecurringJobs();

  logger.info('All workers initialized successfully');
};

/**
 * Setup Recurring Scheduled Jobs
 * 
 * Configures cron-based scheduled jobs for regular platform maintenance
 * and user engagement operations. Uses UTC timezone for consistency
 * across distributed deployments.
 * 
 * Scheduled Operations:
 * - Daily Digest: 8:00 AM UTC daily for morning engagement
 * - Weekly Digest: Monday 9:00 AM UTC for weekly summaries
 * - Data Cleanup: 3:00 AM UTC daily for low-traffic maintenance
 * - Snowball Processing: Every 30 minutes for growth opportunity detection
 * 
 * @returns {void}
 * @since 1.0.0
 */
const setupRecurringJobs = () => {
  // Daily digest email generation at optimal engagement time
  queues.digestQueue.add(
    'daily-digest',
    { type: 'daily', time: '08:00' },
    {
      repeat: {
        cron: '0 8 * * *',
        tz: 'UTC'
      }
    }
  );

  // Weekly digest compilation for comprehensive content summaries
  queues.digestQueue.add(
    'weekly-digest',
    { type: 'weekly', day: 'monday', time: '09:00' },
    {
      repeat: {
        cron: '0 9 * * 1',
        tz: 'UTC'
      }
    }
  );

  // Automated data cleanup during low-traffic hours
  queues.cleanupQueue.add(
    'daily-cleanup',
    { 
      targets: ['expired-sessions', 'old-notifications', 'temp-files'],
      daysToKeep: 30 
    },
    {
      repeat: {
        cron: '0 3 * * *',
        tz: 'UTC'
      }
    }
  );

  // Continuous snowball distribution processing for viral growth
  queues.snowballQueue.add(
    'process-pending-snowballs',
    { status: 'pending' },
    {
      repeat: {
        cron: '*/30 * * * *'
      }
    }
  );

  logger.info('Recurring jobs scheduled');
};

/**
 * Add Email Processing Job
 * 
 * Queues an email for processing with automatic retry strategy and
 * error handling. Used for email-to-post conversion and email validation.
 * 
 * @param {Object} emailData - Email processing data
 * @param {Object} [options={}] - Additional job options
 * @returns {Promise<Job>} Bull job instance
 * 
 * @example
 * // Queue email for processing
 * await addEmailJob({
 *   from: 'user@example.com',
 *   subject: 'New AI Discovery',
 *   body: 'Content here...'
 * });
 * 
 * @since 1.0.0
 */
const addEmailJob = async (emailData, options = {}) => {
  return await queues.emailQueue.add('process-email', emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    ...options
  });
};

/**
 * Add Digest Generation Job
 * 
 * Queues a digest generation task with retry strategy optimized for
 * email delivery operations and external service dependencies.
 * 
 * @param {Object} digestData - Digest generation parameters
 * @param {Object} [options={}] - Additional job options
 * @returns {Promise<Job>} Bull job instance
 * 
 * @example
 * // Queue digest generation
 * await addDigestJob({
 *   type: 'daily',
 *   userId: 'user123',
 *   preferences: { topics: ['AI', 'Tech'] }
 * });
 * 
 * @since 1.0.0
 */
const addDigestJob = async (digestData, options = {}) => {
  return await queues.digestQueue.add('generate-digest', digestData, {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    ...options
  });
};

/**
 * Add Snowball Distribution Job
 * 
 * Queues a snowball distribution task with priority support and
 * exponential backoff for managing viral growth operations.
 * 
 * @param {Object} snowballData - Snowball distribution parameters
 * @param {Object} [options={}] - Additional job options
 * @returns {Promise<Job>} Bull job instance
 * 
 * @example
 * // Queue high-priority snowball distribution
 * await addSnowballJob({
 *   repositoryId: 'repo123',
 *   emails: ['user1@example.com', 'user2@example.com'],
 *   priority: 10
 * });
 * 
 * @since 1.0.0
 */
const addSnowballJob = async (snowballData, options = {}) => {
  return await queues.snowballQueue.add('process-snowball', snowballData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    priority: snowballData.priority || 0,
    ...options
  });
};

/**
 * Add Data Cleanup Job
 * 
 * Queues a data cleanup task with single retry attempt for maintenance
 * operations that should not be repeated excessively.
 * 
 * @param {Object} cleanupData - Cleanup operation parameters
 * @param {Object} [options={}] - Additional job options
 * @returns {Promise<Job>} Bull job instance
 * 
 * @example
 * // Queue cleanup operation
 * await addCleanupJob({
 *   type: 'expired-sessions',
 *   olderThan: '7d'
 * });
 * 
 * @since 1.0.0
 */
const addCleanupJob = async (cleanupData, options = {}) => {
  return await queues.cleanupQueue.add('cleanup-data', cleanupData, {
    attempts: 1,
    ...options
  });
};

/**
 * Get Queue Statistics
 * 
 * Retrieves comprehensive statistics for all queues including job counts
 * by status. Essential for monitoring queue health and performance.
 * 
 * @returns {Promise<Object>} Statistics object with counts for each queue
 * 
 * @example
 * // Get current queue statistics
 * const stats = await getQueueStats();
 * console.log(stats.emailQueue.waiting); // Number of waiting jobs
 * 
 * @since 1.0.0
 */
const getQueueStats = async () => {
  const stats = {};
  
  for (const [name, queue] of Object.entries(queues)) {
    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getPausedCount()
    ]);

    stats[name] = {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused
    };
  }

  return stats;
};

/**
 * Clean Queue Jobs
 * 
 * Removes completed, failed, or stuck jobs from a specific queue to
 * prevent memory buildup and maintain queue performance.
 * 
 * @param {string} queueName - Name of the queue to clean
 * @param {number} [grace=0] - Grace period in milliseconds
 * @param {number} [limit=100] - Maximum number of jobs to clean
 * @param {string} [status='completed'] - Job status to clean
 * @returns {Promise<number>} Number of jobs cleaned
 * 
 * @example
 * // Clean completed jobs from email queue
 * await cleanQueue('emailQueue', 0, 50, 'completed');
 * 
 * @since 1.0.0
 */
const cleanQueue = async (queueName, grace = 0, limit = 100, status = 'completed') => {
  if (!queues[queueName]) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  return await queues[queueName].clean(grace, status, limit);
};

/**
 * Pause Queue Processing
 * 
 * Temporarily halts job processing for a specific queue while preserving
 * queued jobs. Useful for maintenance or troubleshooting operations.
 * 
 * @param {string} queueName - Name of the queue to pause
 * @returns {Promise<void>}
 * 
 * @example
 * // Pause email processing for maintenance
 * await pauseQueue('emailQueue');
 * 
 * @since 1.0.0
 */
const pauseQueue = async (queueName) => {
  if (!queues[queueName]) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  await queues[queueName].pause();
  logger.info(`Queue ${queueName} paused`);
};

/**
 * Resume Queue Processing
 * 
 * Resumes job processing for a previously paused queue, allowing
 * accumulated jobs to be processed normally.
 * 
 * @param {string} queueName - Name of the queue to resume
 * @returns {Promise<void>}
 * 
 * @example
 * // Resume email processing after maintenance
 * await resumeQueue('emailQueue');
 * 
 * @since 1.0.0
 */
const resumeQueue = async (queueName) => {
  if (!queues[queueName]) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  await queues[queueName].resume();
  logger.info(`Queue ${queueName} resumed`);
};

/**
 * Graceful Shutdown
 * 
 * Performs graceful shutdown of all worker queues and Redis connections.
 * Ensures in-progress jobs complete before terminating and prevents
 * data loss during application shutdown.
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // Shutdown workers during application termination
 * process.on('SIGTERM', async () => {
 *   await shutdown();
 *   process.exit(0);
 * });
 * 
 * @since 1.0.0
 */
const shutdown = async () => {
  logger.info('Shutting down workers...');
  
  try {
    // Close all queues gracefully
    await Promise.all(
      Object.values(queues).map(queue => queue.close())
    );
    
    // Close Redis connection
    await redis.quit();
    
    logger.info('Workers shut down successfully');
  } catch (error) {
    logger.error('Error during worker shutdown', { error: error.message });
    throw error;
  }
};

/**
 * Worker System Exports
 * 
 * Comprehensive API for managing the background job processing system.
 * Provides functions for job queue management, monitoring, and administration.
 * 
 * @since 1.0.0
 */
module.exports = {
  initializeWorkers,
  addEmailJob,
  addDigestJob,
  addSnowballJob,
  addCleanupJob,
  getQueueStats,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  shutdown,
  queues
};
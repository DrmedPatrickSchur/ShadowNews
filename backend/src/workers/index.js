const Queue = require('bull');
const Redis = require('ioredis');
const { logger } = require('../utils/logger');
const config = require('../config');

// Import workers
const emailWorker = require('./email.worker');
const digestWorker = require('./digest.worker');
const snowballWorker = require('./snowball.worker');
const cleanupWorker = require('./cleanup.worker');

// Redis connection
const redis = new Redis({
 host: config.redis.host,
 port: config.redis.port,
 password: config.redis.password,
 maxRetriesPerRequest: null,
 enableReadyCheck: false,
});

// Create queues
const queues = {
 emailQueue: new Queue('email-processing', { redis }),
 digestQueue: new Queue('digest-generation', { redis }),
 snowballQueue: new Queue('snowball-distribution', { redis }),
 cleanupQueue: new Queue('data-cleanup', { redis }),
};

// Initialize workers
const initializeWorkers = () => {
 // Email processing worker
 queues.emailQueue.process(10, emailWorker.processEmail);
 queues.emailQueue.on('completed', (job, result) => {
   logger.info(`Email job ${job.id} completed`, { result });
 });
 queues.emailQueue.on('failed', (job, err) => {
   logger.error(`Email job ${job.id} failed`, { error: err.message });
 });

 // Digest generation worker
 queues.digestQueue.process(5, digestWorker.generateDigest);
 queues.digestQueue.on('completed', (job, result) => {
   logger.info(`Digest job ${job.id} completed`, { recipientCount: result.recipientCount });
 });
 queues.digestQueue.on('failed', (job, err) => {
   logger.error(`Digest job ${job.id} failed`, { error: err.message });
 });

 // Snowball distribution worker
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

 // Cleanup worker
 queues.cleanupQueue.process(1, cleanupWorker.performCleanup);
 queues.cleanupQueue.on('completed', (job, result) => {
   logger.info(`Cleanup job ${job.id} completed`, { 
     deletedItems: result.deletedCount 
   });
 });
 queues.cleanupQueue.on('failed', (job, err) => {
   logger.error(`Cleanup job ${job.id} failed`, { error: err.message });
 });

 // Set up recurring jobs
 setupRecurringJobs();

 logger.info('All workers initialized successfully');
};

// Set up recurring jobs
const setupRecurringJobs = () => {
 // Daily digest at 8 AM
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

 // Weekly digest on Mondays at 9 AM
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

 // Cleanup old data daily at 3 AM
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

 // Process pending snowball distributions every 30 minutes
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

// Queue management functions
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

const addCleanupJob = async (cleanupData, options = {}) => {
 return await queues.cleanupQueue.add('cleanup-data', cleanupData, {
   attempts: 1,
   ...options
 });
};

// Queue statistics
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

// Clean specific queue
const cleanQueue = async (queueName, grace = 0, limit = 100, status = 'completed') => {
 if (!queues[queueName]) {
   throw new Error(`Queue ${queueName} not found`);
 }
 
 return await queues[queueName].clean(grace, status, limit);
};

// Pause/Resume queue operations
const pauseQueue = async (queueName) => {
 if (!queues[queueName]) {
   throw new Error(`Queue ${queueName} not found`);
 }
 
 await queues[queueName].pause();
 logger.info(`Queue ${queueName} paused`);
};

const resumeQueue = async (queueName) => {
 if (!queues[queueName]) {
   throw new Error(`Queue ${queueName} not found`);
 }
 
 await queues[queueName].resume();
 logger.info(`Queue ${queueName} resumed`);
};

// Graceful shutdown
const shutdown = async () => {
 logger.info('Shutting down workers...');
 
 try {
   // Close all queues
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

// Export functions and queues
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
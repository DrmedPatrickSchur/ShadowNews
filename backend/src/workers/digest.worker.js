const Bull = require('bull');
const cron = require('node-cron');
const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Repository = require('../models/Repository.model');
const emailService = require('../services/email.service');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { generateDigestHTML } = require('../utils/emailTemplates');

const digestQueue = new Bull('email-digest', {
 redis: {
   host: process.env.REDIS_HOST || 'localhost',
   port: process.env.REDIS_PORT || 6379,
   password: process.env.REDIS_PASSWORD
 }
});

const BATCH_SIZE = 100;
const MAX_POSTS_PER_DIGEST = 10;

// Process individual digest jobs
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

// Get relevant posts for user based on interests
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

 // Add personalization score
 return posts.map(post => ({
   ...post.toObject(),
   relevanceScore: calculateRelevanceScore(post, user)
 })).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Get repository updates
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

// Calculate relevance score for post
function calculateRelevanceScore(post, user) {
 let score = 0;
 
 // Hashtag overlap
 const userHashtags = new Set(user.subscribedHashtags.map(h => h._id.toString()));
 const postHashtags = new Set(post.hashtags.map(h => h._id.toString()));
 const overlap = [...userHashtags].filter(h => postHashtags.has(h)).length;
 score += overlap * 10;

 // Karma weight
 score += Math.log10(post.karma + 1) * 5;

 // Recency weight
 const hoursAgo = (Date.now() - post.createdAt) / (1000 * 60 * 60);
 score += Math.max(0, 24 - hoursAgo) * 2;

 // Repository connection
 if (user.repositories.some(r => r.toString() === post.repository?._id?.toString())) {
   score += 20;
 }

 return score;
}

// Generate CSV attachments for repositories
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

// Calculate repository growth percentage
function calculateGrowthPercentage(repo, since) {
 const previousCount = repo.emails.filter(email => 
   new Date(email.addedAt) < new Date(since)
 ).length;
 
 const newCount = repo.emails.length - previousCount;
 return previousCount > 0 ? ((newCount / previousCount) * 100).toFixed(1) : 100;
}

// Update user digest statistics
async function updateUserDigestStats(userId, postsCount) {
 await User.findByIdAndUpdate(userId, {
   $inc: {
     'stats.digestsSent': 1,
     'stats.digestPostsDelivered': postsCount
   },
   'stats.lastDigestSent': new Date()
 });
}

// Schedule daily digests
cron.schedule('0 9 * * *', async () => {
 logger.info('Starting daily digest job');
 await scheduleDigests('daily');
});

// Schedule weekly digests (Mondays at 9 AM)
cron.schedule('0 9 * * 1', async () => {
 logger.info('Starting weekly digest job');
 await scheduleDigests('weekly');
});

// Schedule monthly digests (1st of each month at 9 AM)
cron.schedule('0 9 1 * *', async () => {
 logger.info('Starting monthly digest job');
 await scheduleDigests('monthly');
});

// Schedule digests for all users with given frequency
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

// Handle failed jobs
digestQueue.on('failed', (job, err) => {
 logger.error(`Digest job ${job.id} failed:`, err);
});

// Handle completed jobs
digestQueue.on('completed', (job, result) => {
 if (!result.skipped) {
   logger.info(`Digest sent successfully`, result);
 }
});

// Clean up old jobs
cron.schedule('0 0 * * *', async () => {
 const jobCounts = await digestQueue.clean(24 * 60 * 60 * 1000); // 24 hours
 logger.info(`Cleaned ${jobCounts.length} completed digest jobs`);
});

module.exports = {
 digestQueue,
 scheduleDigests
};
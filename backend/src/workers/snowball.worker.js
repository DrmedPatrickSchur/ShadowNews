const Bull = require('bull');
const { Repository, Email, User } = require('../models');
const csvService = require('../services/csv.service');
const emailService = require('../services/email.service');
const snowballService = require('../services/snowball.service');
const logger = require('../utils/logger');
const { redis } = require('../utils/redis');

const snowballQueue = new Bull('snowball-processing', {
 redis: {
   host: process.env.REDIS_HOST || 'localhost',
   port: process.env.REDIS_PORT || 6379,
   password: process.env.REDIS_PASSWORD
 }
});

const BATCH_SIZE = 100;
const MAX_DEPTH = 3;
const QUALITY_THRESHOLD = 0.7;

snowballQueue.process('process-csv', async (job) => {
 const { repositoryId, csvData, userId, depth = 0 } = job.data;

 try {
   logger.info(`Processing snowball CSV for repository ${repositoryId}, depth ${depth}`);

   const repository = await Repository.findById(repositoryId);
   if (!repository) {
     throw new Error('Repository not found');
   }

   const parsedEmails = await csvService.parseEmailList(csvData);
   const validEmails = await validateEmails(parsedEmails, repository);
   
   const newEmails = await filterExistingEmails(validEmails, repositoryId);
   
   const qualityScores = await calculateQualityScores(newEmails, repository);
   
   const approvedEmails = newEmails.filter((email, index) => 
     qualityScores[index] >= QUALITY_THRESHOLD
   );

   await processEmailBatch(approvedEmails, repository, userId);

   if (depth < MAX_DEPTH) {
     await triggerNextSnowball(approvedEmails, repository, depth + 1);
   }

   await updateRepositoryStats(repository, approvedEmails.length);

   await notifyRepositoryOwner(repository, {
     newEmailsCount: approvedEmails.length,
     totalEmailsCount: repository.emailCount + approvedEmails.length,
     depth
   });

   return {
     processed: approvedEmails.length,
     rejected: newEmails.length - approvedEmails.length,
     depth
   };

 } catch (error) {
   logger.error(`Snowball processing error: ${error.message}`, {
     repositoryId,
     userId,
     error: error.stack
   });
   throw error;
 }
});

snowballQueue.process('verify-email', async (job) => {
 const { email, repositoryId } = job.data;

 try {
   const isValid = await emailService.verifyEmail(email);
   
   if (isValid) {
     await Email.findOneAndUpdate(
       { email, repository: repositoryId },
       { 
         verified: true, 
         verifiedAt: new Date(),
         status: 'active'
       }
     );
   } else {
     await Email.findOneAndUpdate(
       { email, repository: repositoryId },
       { 
         verified: false,
         status: 'invalid'
       }
     );
   }

   return { email, isValid };
 } catch (error) {
   logger.error(`Email verification error: ${error.message}`, { email });
   throw error;
 }
});

snowballQueue.process('analyze-network', async (job) => {
 const { repositoryId } = job.data;

 try {
   const repository = await Repository.findById(repositoryId)
     .populate('emails');

   const networkAnalysis = await snowballService.analyzeNetwork(repository);
   
   await Repository.findByIdAndUpdate(repositoryId, {
     networkStats: {
       totalReach: networkAnalysis.totalReach,
       avgEngagement: networkAnalysis.avgEngagement,
       topContributors: networkAnalysis.topContributors,
       growthRate: networkAnalysis.growthRate,
       lastAnalyzed: new Date()
     }
   });

   await cacheNetworkAnalysis(repositoryId, networkAnalysis);

   return networkAnalysis;
 } catch (error) {
   logger.error(`Network analysis error: ${error.message}`, { repositoryId });
   throw error;
 }
});

async function validateEmails(emails, repository) {
 const validEmails = [];
 
 for (const emailData of emails) {
   const { email, metadata } = emailData;
   
   if (!isValidEmailFormat(email)) continue;
   
   if (repository.blacklist.includes(email)) continue;
   
   if (await isSpamEmail(email)) continue;
   
   const domain = email.split('@')[1];
   if (repository.blockedDomains.includes(domain)) continue;
   
   validEmails.push({
     email,
     metadata,
     addedAt: new Date()
   });
 }
 
 return validEmails;
}

async function filterExistingEmails(emails, repositoryId) {
 const emailAddresses = emails.map(e => e.email);
 
 const existingEmails = await Email.find({
   email: { $in: emailAddresses },
   repository: repositoryId
 }).select('email');
 
 const existingSet = new Set(existingEmails.map(e => e.email));
 
 return emails.filter(e => !existingSet.has(e.email));
}

async function calculateQualityScores(emails, repository) {
 const scores = [];
 
 for (const emailData of emails) {
   let score = 0;
   
   const domain = emailData.email.split('@')[1];
   if (repository.trustedDomains.includes(domain)) {
     score += 0.3;
   }
   
   if (emailData.metadata?.source === 'verified_user') {
     score += 0.4;
   }
   
   const domainReputation = await getDomainReputation(domain);
   score += domainReputation * 0.3;
   
   scores.push(Math.min(score, 1));
 }
 
 return scores;
}

async function processEmailBatch(emails, repository, userId) {
 const emailDocs = [];
 
 for (const emailData of emails) {
   emailDocs.push({
     email: emailData.email,
     repository: repository._id,
     addedBy: userId,
     metadata: emailData.metadata,
     status: 'pending_verification',
     snowballDepth: emailData.metadata?.depth || 0,
     qualityScore: emailData.metadata?.qualityScore || 0
   });
 }
 
 await Email.insertMany(emailDocs);
 
 for (const email of emailDocs) {
   await snowballQueue.add('verify-email', {
     email: email.email,
     repositoryId: repository._id
   }, {
     delay: Math.random() * 5000,
     attempts: 3,
     backoff: {
       type: 'exponential',
       delay: 2000
     }
   });
 }
}

async function triggerNextSnowball(emails, repository, nextDepth) {
 const eligibleEmails = emails.filter(e => 
   e.metadata?.allowSnowball !== false
 );
 
 for (const email of eligibleEmails) {
   const user = await User.findOne({ email: email.email });
   
   if (user && user.csvUploads && user.csvUploads.length > 0) {
     for (const csvUpload of user.csvUploads) {
       await snowballQueue.add('process-csv', {
         repositoryId: repository._id,
         csvData: csvUpload.data,
         userId: user._id,
         depth: nextDepth
       }, {
         delay: nextDepth * 10000,
         priority: MAX_DEPTH - nextDepth
       });
     }
   }
 }
}

async function updateRepositoryStats(repository, newEmailCount) {
 const growthRate = calculateGrowthRate(
   repository.emailCount,
   repository.emailCount + newEmailCount,
   repository.createdAt
 );
 
 await Repository.findByIdAndUpdate(repository._id, {
   $inc: { emailCount: newEmailCount },
   $push: {
     growthHistory: {
       date: new Date(),
       count: newEmailCount,
       total: repository.emailCount + newEmailCount
     }
   },
   growthRate,
   lastSnowballAt: new Date()
 });
}

async function notifyRepositoryOwner(repository, stats) {
 const owner = await User.findById(repository.owner);
 
 if (owner && owner.notifications.snowballUpdates) {
   await emailService.sendEmail({
     to: owner.email,
     subject: `🚀 Your "${repository.name}" repository is growing!`,
     template: 'snowball-update',
     data: {
       repositoryName: repository.name,
       newEmails: stats.newEmailsCount,
       totalEmails: stats.totalEmailsCount,
       depth: stats.depth
     }
   });
 }
}

async function getDomainReputation(domain) {
 const cacheKey = `domain_reputation:${domain}`;
 const cached = await redis.get(cacheKey);
 
 if (cached) {
   return parseFloat(cached);
 }
 
 const reputation = await snowballService.checkDomainReputation(domain);
 
 await redis.setex(cacheKey, 86400, reputation.toString());
 
 return reputation;
}

async function isSpamEmail(email) {
 const spamPatterns = [
   /^test\d+@/,
   /^noreply@/,
   /^donotreply@/,
   /^admin@/,
   /^info@/,
   /\+spam/
 ];
 
 return spamPatterns.some(pattern => pattern.test(email));
}

function isValidEmailFormat(email) {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return emailRegex.test(email);
}

function calculateGrowthRate(oldCount, newCount, createdAt) {
 const daysActive = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
 if (daysActive < 1) return 0;
 
 return ((newCount - oldCount) / oldCount) / daysActive;
}

async function cacheNetworkAnalysis(repositoryId, analysis) {
 const cacheKey = `network_analysis:${repositoryId}`;
 await redis.setex(cacheKey, 3600, JSON.stringify(analysis));
}

snowballQueue.on('completed', (job, result) => {
 logger.info(`Snowball job ${job.id} completed`, result);
});

snowballQueue.on('failed', (job, err) => {
 logger.error(`Snowball job ${job.id} failed`, {
   error: err.message,
   data: job.data
 });
});

snowballQueue.on('stalled', (job) => {
 logger.warn(`Snowball job ${job.id} stalled`, job.data);
});

module.exports = snowballQueue;
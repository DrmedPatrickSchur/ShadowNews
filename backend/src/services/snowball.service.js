const Repository = require('../models/Repository.model');
const Email = require('../models/Email.model');
const User = require('../models/User.model');
const csvService = require('./csv.service');
const emailService = require('./email.service');
const logger = require('../utils/logger');
const { validateEmail } = require('../utils/validators');
const crypto = require('crypto');

class SnowballService {
 constructor() {
   this.MIN_QUALITY_SCORE = 0.7;
   this.MAX_EMAILS_PER_BATCH = 100;
   this.SNOWBALL_MULTIPLIER = 1.5;
   this.VERIFICATION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
 }

 async processSnowballDistribution(repositoryId, csvContent, initiatorUserId) {
   try {
     const repository = await Repository.findById(repositoryId);
     if (!repository) {
       throw new Error('Repository not found');
     }

     const emails = await csvService.parseEmails(csvContent);
     const validEmails = await this.validateAndFilterEmails(emails, repository);
     
     const snowballBatch = {
       repositoryId,
       initiatorUserId,
       timestamp: new Date(),
       batchId: this.generateBatchId(),
       emails: validEmails
     };

     const results = await this.distributeToEmails(snowballBatch, repository);
     await this.updateRepositoryStats(repository, results);
     await this.recordSnowballEvent(snowballBatch, results);

     return results;
   } catch (error) {
     logger.error('Snowball distribution failed:', error);
     throw error;
   }
 }

 async validateAndFilterEmails(emails, repository) {
   const validEmails = [];
   const existingEmails = await this.getExistingRepositoryEmails(repository._id);

   for (const email of emails) {
     if (!validateEmail(email)) continue;
     if (existingEmails.has(email.toLowerCase())) continue;
     if (await this.isEmailBlacklisted(email)) continue;
     
     const qualityScore = await this.calculateEmailQualityScore(email);
     if (qualityScore >= this.MIN_QUALITY_SCORE) {
       validEmails.push({
         email: email.toLowerCase(),
         qualityScore,
         source: 'snowball',
         verificationToken: this.generateVerificationToken()
       });
     }
   }

   return validEmails.slice(0, this.MAX_EMAILS_PER_BATCH);
 }

 async distributeToEmails(snowballBatch, repository) {
   const results = {
     sent: 0,
     failed: 0,
     opted_in: 0,
     bounced: 0,
     emails: []
   };

   for (const emailData of snowballBatch.emails) {
     try {
       const inviteResult = await this.sendSnowballInvite(emailData, repository, snowballBatch);
       
       if (inviteResult.success) {
         results.sent++;
         await this.addEmailToRepository(repository._id, emailData, 'pending');
       } else {
         results.failed++;
       }

       results.emails.push({
         email: emailData.email,
         status: inviteResult.success ? 'sent' : 'failed',
         reason: inviteResult.reason
       });
     } catch (error) {
       logger.error(`Failed to process email ${emailData.email}:`, error);
       results.failed++;
     }
   }

   return results;
 }

 async sendSnowballInvite(emailData, repository, snowballBatch) {
   try {
     const inviteData = {
       to: emailData.email,
       subject: `You're invited to join ${repository.name} on Shadownews`,
       template: 'snowball-invite',
       data: {
         repositoryName: repository.name,
         repositoryDescription: repository.description,
         memberCount: repository.memberCount,
         inviterName: await this.getInviterName(snowballBatch.initiatorUserId),
         verificationToken: emailData.verificationToken,
         optInUrl: `${process.env.BASE_URL}/repository/join/${repository._id}?token=${emailData.verificationToken}`,
         optOutUrl: `${process.env.BASE_URL}/unsubscribe?token=${emailData.verificationToken}`,
         topPosts: await this.getTopRepositoryPosts(repository._id, 3)
       }
     };

     const result = await emailService.sendEmail(inviteData);
     return { success: true, messageId: result.messageId };
   } catch (error) {
     return { success: false, reason: error.message };
   }
 }

 async processOptIn(repositoryId, email, verificationToken) {
   const repository = await Repository.findById(repositoryId);
   if (!repository) {
     throw new Error('Repository not found');
   }

   const emailEntry = await Email.findOne({
     repositoryId,
     email: email.toLowerCase(),
     verificationToken,
     status: 'pending'
   });

   if (!emailEntry) {
     throw new Error('Invalid or expired verification token');
   }

   if (Date.now() - emailEntry.createdAt > this.VERIFICATION_EXPIRY) {
     throw new Error('Verification token expired');
   }

   emailEntry.status = 'verified';
   emailEntry.verifiedAt = new Date();
   emailEntry.snowballContribution = await this.calculateSnowballContribution(email);
   await emailEntry.save();

   await this.updateRepositoryMemberCount(repository);
   await this.checkForSnowballBonus(repository, emailEntry);
   
   return { success: true, contribution: emailEntry.snowballContribution };
 }

 async calculateSnowballContribution(email) {
   const domain = email.split('@')[1];
   const domainAuthority = await this.getDomainAuthority(domain);
   const networkSize = await this.estimateNetworkSize(email);
   
   return {
     potentialReach: Math.floor(networkSize * this.SNOWBALL_MULTIPLIER),
     qualityScore: domainAuthority,
     estimatedGrowth: Math.floor(networkSize * 0.15) // 15% conversion estimate
   };
 }

 async addEmailToRepository(repositoryId, emailData, status = 'pending') {
   const email = new Email({
     repositoryId,
     email: emailData.email,
     source: emailData.source,
     status,
     qualityScore: emailData.qualityScore,
     verificationToken: emailData.verificationToken,
     addedAt: new Date()
   });

   await email.save();
   return email;
 }

 async getExistingRepositoryEmails(repositoryId) {
   const emails = await Email.find({ repositoryId }).select('email');
   return new Set(emails.map(e => e.email.toLowerCase()));
 }

 async calculateEmailQualityScore(email) {
   const domain = email.split('@')[1];
   let score = 0.5;

   if (await this.isBusinessEmail(domain)) score += 0.2;
   if (await this.isDomainVerified(domain)) score += 0.2;
   if (!await this.isDisposableEmail(domain)) score += 0.1;

   return Math.min(score, 1);
 }

 async isBusinessEmail(domain) {
   const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
   return !personalDomains.includes(domain.toLowerCase());
 }

 async isDomainVerified(domain) {
   // Check DNS records, MX records, etc.
   return true; // Simplified for now
 }

 async isDisposableEmail(domain) {
   // Check against disposable email domain list
   const disposableDomains = ['tempmail.com', '10minutemail.com'];
   return disposableDomains.includes(domain.toLowerCase());
 }

 async isEmailBlacklisted(email) {
   const blacklist = await Email.findOne({
     email: email.toLowerCase(),
     status: 'blacklisted'
   });
   return !!blacklist;
 }

 async getDomainAuthority(domain) {
   // Implement domain authority calculation
   // Could integrate with external APIs
   return 0.75; // Placeholder
 }

 async estimateNetworkSize(email) {
   // Estimate potential network size based on domain, activity, etc.
   const domain = email.split('@')[1];
   if (await this.isBusinessEmail(domain)) {
     return 50; // Business emails typically have larger networks
   }
   return 20; // Personal email estimate
 }

 async updateRepositoryStats(repository, results) {
   repository.stats.totalInvitesSent += results.sent;
   repository.stats.snowballGrowth += results.sent;
   repository.stats.lastSnowballDate = new Date();
   
   await repository.save();
 }

 async updateRepositoryMemberCount(repository) {
   const verifiedCount = await Email.countDocuments({
     repositoryId: repository._id,
     status: 'verified'
   });
   
   repository.memberCount = verifiedCount;
   await repository.save();
 }

 async recordSnowballEvent(snowballBatch, results) {
   const event = {
     type: 'snowball_distribution',
     repositoryId: snowballBatch.repositoryId,
     initiatorId: snowballBatch.initiatorUserId,
     batchId: snowballBatch.batchId,
     timestamp: snowballBatch.timestamp,
     results: {
       emailsSent: results.sent,
       emailsFailed: results.failed,
       totalProcessed: results.sent + results.failed
     }
   };

   await logger.logEvent(event);
 }

 async checkForSnowballBonus(repository, emailEntry) {
   const recentOptIns = await Email.countDocuments({
     repositoryId: repository._id,
     status: 'verified',
     verifiedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
   });

   if (recentOptIns >= 10) {
     await this.awardSnowballBonus(repository.ownerId, repository._id);
   }
 }

 async awardSnowballBonus(userId, repositoryId) {
   const user = await User.findById(userId);
   if (user) {
     user.karma += 100;
     user.achievements.push({
       type: 'snowball_growth',
       repositoryId,
       date: new Date()
     });
     await user.save();
   }
 }

 async getInviterName(userId) {
   const user = await User.findById(userId).select('username name');
   return user ? (user.name || user.username) : 'A Shadownews member';
 }

 async getTopRepositoryPosts(repositoryId, limit = 3) {
   // Get top posts associated with this repository
   const posts = await Post.find({ repositories: repositoryId })
     .sort({ score: -1, createdAt: -1 })
     .limit(limit)
     .select('title url score commentCount');
   
   return posts;
 }

 generateBatchId() {
   return crypto.randomBytes(16).toString('hex');
 }

 generateVerificationToken() {
   return crypto.randomBytes(32).toString('hex');
 }

 async getSnowballAnalytics(repositoryId, dateRange) {
   const repository = await Repository.findById(repositoryId);
   if (!repository) {
     throw new Error('Repository not found');
   }

   const analytics = {
     totalGrowth: repository.stats.snowballGrowth,
     conversionRate: await this.calculateConversionRate(repositoryId),
     topContributors: await this.getTopSnowballContributors(repositoryId),
     growthTimeline: await this.getGrowthTimeline(repositoryId, dateRange),
     networkReach: await this.calculateNetworkReach(repositoryId)
   };

   return analytics;
 }

 async calculateConversionRate(repositoryId) {
   const invited = await Email.countDocuments({
     repositoryId,
     source: 'snowball'
   });
   
   const verified = await Email.countDocuments({
     repositoryId,
     source: 'snowball',
     status: 'verified'
   });

   return invited > 0 ? (verified / invited) * 100 : 0;
 }

 async getTopSnowballContributors(repositoryId, limit = 5) {
   const contributors = await Email.aggregate([
     { $match: { repositoryId, source: 'snowball', status: 'verified' } },
     { $group: {
       _id: '$addedBy',
       count: { $sum: 1 },
       totalReach: { $sum: '$snowballContribution.potentialReach' }
     }},
     { $sort: { totalReach: -1 } },
     { $limit: limit }
   ]);

   return contributors;
 }

 async getGrowthTimeline(repositoryId, days = 30) {
   const timeline = [];
   const now = new Date();
   
   for (let i = 0; i < days; i++) {
     const date = new Date(now - i * 24 * 60 * 60 * 1000);
     const dayStart = new Date(date.setHours(0, 0, 0, 0));
     const dayEnd = new Date(date.setHours(23, 59, 59, 999));
     
     const growth = await Email.countDocuments({
       repositoryId,
       source: 'snowball',
       createdAt: { $gte: dayStart, $lte: dayEnd }
     });
     
     timeline.push({ date: dayStart, growth });
   }
   
   return timeline.reverse();
 }

 async calculateNetworkReach(repositoryId) {
   const emails = await Email.find({
     repositoryId,
     status: 'verified'
   }).select('snowballContribution');

   const totalReach = emails.reduce((sum, email) => {
     return sum + (email.snowballContribution?.potentialReach || 0);
   }, 0);

   return totalReach;
 }
}

module.exports = new SnowballService();
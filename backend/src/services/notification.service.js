/**
 * @fileoverview notification.service.js
 * 
 * Implementation file for notification.service.js
 * 
 * Key Features:
 * - Core functionality
 * - Error handling
 * - Performance optimization
 * 
 * Dependencies:
 *  * - No external dependencies
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */\n\nconst nodemailer = require('nodemailer');
const Bull = require('bull');
const { redis } = require('../utils/redis');
const User = require('../models/User.model');
const Repository = require('../models/Repository.model');
const { logger } = require('../utils/logger');
const { emailTemplates } = require('../utils/emailTemplates');
const config = require('../config');

class NotificationService {
 constructor() {
   this.transporter = nodemailer.createTransport({
     host: config.email.smtp.host,
     port: config.email.smtp.port,
     secure: config.email.smtp.secure,
     auth: {
       user: config.email.smtp.user,
       pass: config.email.smtp.pass
     }
   });

   this.notificationQueue = new Bull('notifications', {
     redis: {
       host: config.redis.host,
       port: config.redis.port,
       password: config.redis.password
     }
   });

   this.initializeQueue();
 }

 initializeQueue() {
   this.notificationQueue.process('email', 10, async (job) => {
     const { type, data } = job.data;
     
     try {
       switch (type) {
         case 'post_reply':
           await this.sendPostReplyNotification(data);
           break;
         case 'comment_reply':
           await this.sendCommentReplyNotification(data);
           break;
         case 'repository_invite':
           await this.sendRepositoryInviteNotification(data);
           break;
         case 'snowball_update':
           await this.sendSnowballUpdateNotification(data);
           break;
         case 'karma_milestone':
           await this.sendKarmaMilestoneNotification(data);
           break;
         case 'digest':
           await this.sendDigestNotification(data);
           break;
         case 'mention':
           await this.sendMentionNotification(data);
           break;
         case 'repository_growth':
           await this.sendRepositoryGrowthNotification(data);
           break;
         default:
           logger.warn(`Unknown notification type: ${type}`);
       }
     } catch (error) {
       logger.error('Notification processing error:', error);
       throw error;
     }
   });

   this.notificationQueue.on('failed', (job, err) => {
     logger.error(`Notification job ${job.id} failed:`, err);
   });
 }

 async queueNotification(type, data, options = {}) {
   try {
     const job = await this.notificationQueue.add('email', {
       type,
       data
     }, {
       attempts: 3,
       backoff: {
         type: 'exponential',
         delay: 2000
       },
       ...options
     });

     return job.id;
   } catch (error) {
     logger.error('Failed to queue notification:', error);
     throw error;
   }
 }

 async sendPostReplyNotification(data) {
   const { postId, authorId, replyAuthorId, replyContent } = data;
   
   const author = await User.findById(authorId).select('email username notificationPreferences');
   if (!author || !author.notificationPreferences.postReplies) return;

   const replyAuthor = await User.findById(replyAuthorId).select('username');
   
   const unsubscribeToken = await this.generateUnsubscribeToken(author._id, 'postReplies');
   
   const emailContent = emailTemplates.postReply({
     authorName: author.username,
     replyAuthorName: replyAuthor.username,
     postLink: `${config.app.url}/post/${postId}`,
     replyContent: replyContent.substring(0, 200) + '...',
     unsubscribeLink: `${config.app.url}/unsubscribe/${unsubscribeToken}`
   });

   await this.sendEmail({
     to: author.email,
     subject: `${replyAuthor.username} replied to your post on Shadownews`,
     html: emailContent,
     category: 'post-reply'
   });
 }

 async sendCommentReplyNotification(data) {
   const { commentId, postId, authorId, replyAuthorId, replyContent } = data;
   
   const author = await User.findById(authorId).select('email username notificationPreferences');
   if (!author || !author.notificationPreferences.commentReplies) return;

   const replyAuthor = await User.findById(replyAuthorId).select('username');
   
   const unsubscribeToken = await this.generateUnsubscribeToken(author._id, 'commentReplies');
   
   const emailContent = emailTemplates.commentReply({
     authorName: author.username,
     replyAuthorName: replyAuthor.username,
     commentLink: `${config.app.url}/post/${postId}#comment-${commentId}`,
     replyContent: replyContent.substring(0, 200) + '...',
     unsubscribeLink: `${config.app.url}/unsubscribe/${unsubscribeToken}`
   });

   await this.sendEmail({
     to: author.email,
     subject: `${replyAuthor.username} replied to your comment on Shadownews`,
     html: emailContent,
     category: 'comment-reply'
   });
 }

 async sendRepositoryInviteNotification(data) {
   const { repositoryId, invitedUserId, inviterUserId } = data;
   
   const invitedUser = await User.findById(invitedUserId).select('email username notificationPreferences');
   if (!invitedUser || !invitedUser.notificationPreferences.repositoryInvites) return;

   const inviter = await User.findById(inviterUserId).select('username');
   const repository = await Repository.findById(repositoryId).select('name topic emailCount');
   
   const emailContent = emailTemplates.repositoryInvite({
     invitedUserName: invitedUser.username,
     inviterName: inviter.username,
     repositoryName: repository.name,
     repositoryTopic: repository.topic,
     emailCount: repository.emailCount,
     acceptLink: `${config.app.url}/repository/${repositoryId}/accept`,
     declineLink: `${config.app.url}/repository/${repositoryId}/decline`
   });

   await this.sendEmail({
     to: invitedUser.email,
     subject: `${inviter.username} invited you to join ${repository.name} repository`,
     html: emailContent,
     category: 'repository-invite'
   });
 }

 async sendSnowballUpdateNotification(data) {
   const { repositoryId, ownerId, newEmailsCount, totalEmails } = data;
   
   const owner = await User.findById(ownerId).select('email username notificationPreferences');
   if (!owner || !owner.notificationPreferences.snowballUpdates) return;

   const repository = await Repository.findById(repositoryId).select('name topic');
   
   const emailContent = emailTemplates.snowballUpdate({
     ownerName: owner.username,
     repositoryName: repository.name,
     newEmailsCount,
     totalEmails,
     repositoryLink: `${config.app.url}/repository/${repositoryId}`,
     manageLink: `${config.app.url}/repository/${repositoryId}/manage`
   });

   await this.sendEmail({
     to: owner.email,
     subject: `Your ${repository.name} repository grew by ${newEmailsCount} emails!`,
     html: emailContent,
     category: 'snowball-update'
   });
 }

 async sendKarmaMilestoneNotification(data) {
   const { userId, milestone, nextMilestone, unlockedFeatures } = data;
   
   const user = await User.findById(userId).select('email username notificationPreferences');
   if (!user || !user.notificationPreferences.karmaMilestones) return;
   
   const emailContent = emailTemplates.karmaMilestone({
     userName: user.username,
     milestone,
     nextMilestone,
     unlockedFeatures,
     profileLink: `${config.app.url}/user/${user.username}`
   });

   await this.sendEmail({
     to: user.email,
     subject: `Congratulations! You've reached ${milestone} karma on Shadownews`,
     html: emailContent,
     category: 'karma-milestone'
   });
 }

 async sendDigestNotification(data) {
   const { userId, posts, timeframe } = data;
   
   const user = await User.findById(userId)
     .select('email username notificationPreferences followedTopics');
   
   if (!user || !user.notificationPreferences.digest) return;
   
   const unsubscribeToken = await this.generateUnsubscribeToken(user._id, 'digest');
   
   const emailContent = emailTemplates.digest({
     userName: user.username,
     posts,
     timeframe,
     followedTopics: user.followedTopics,
     homeLink: config.app.url,
     unsubscribeLink: `${config.app.url}/unsubscribe/${unsubscribeToken}`
   });

   await this.sendEmail({
     to: user.email,
     subject: `Your ${timeframe} Shadownews digest: ${posts.length} trending posts`,
     html: emailContent,
     category: 'digest',
     attachments: await this.generateDigestCSV(posts, user.followedTopics)
   });
 }

 async sendMentionNotification(data) {
   const { mentionedUserId, mentionerUserId, postId, commentId, context } = data;
   
   const mentionedUser = await User.findById(mentionedUserId)
     .select('email username notificationPreferences');
   
   if (!mentionedUser || !mentionedUser.notificationPreferences.mentions) return;

   const mentioner = await User.findById(mentionerUserId).select('username');
   
   const link = commentId 
     ? `${config.app.url}/post/${postId}#comment-${commentId}`
     : `${config.app.url}/post/${postId}`;
   
   const emailContent = emailTemplates.mention({
     mentionedUserName: mentionedUser.username,
     mentionerName: mentioner.username,
     context: context.substring(0, 200) + '...',
     link
   });

   await this.sendEmail({
     to: mentionedUser.email,
     subject: `${mentioner.username} mentioned you on Shadownews`,
     html: emailContent,
     category: 'mention'
   });
 }

 async sendRepositoryGrowthNotification(data) {
   const { repositoryId, ownerId, stats } = data;
   
   const owner = await User.findById(ownerId).select('email username notificationPreferences');
   if (!owner || !owner.notificationPreferences.repositoryGrowth) return;

   const repository = await Repository.findById(repositoryId).select('name topic');
   
   const emailContent = emailTemplates.repositoryGrowth({
     ownerName: owner.username,
     repositoryName: repository.name,
     stats,
     repositoryLink: `${config.app.url}/repository/${repositoryId}`,
     analyticsLink: `${config.app.url}/repository/${repositoryId}/analytics`
   });

   await this.sendEmail({
     to: owner.email,
     subject: `Weekly growth report for ${repository.name}`,
     html: emailContent,
     category: 'repository-growth',
     attachments: await this.generateGrowthReportCSV(repositoryId, stats)
   });
 }

 async sendEmail(emailData) {
   try {
     const mailOptions = {
       from: `Shadownews <${config.email.from}>`,
       to: emailData.to,
       subject: emailData.subject,
       html: emailData.html,
       headers: {
         'X-Category': emailData.category,
         'List-Unsubscribe': emailData.unsubscribeLink || `${config.app.url}/settings/notifications`
       },
       attachments: emailData.attachments || []
     };

     const info = await this.transporter.sendMail(mailOptions);
     
     await this.logEmailSent(emailData.to, emailData.category);
     
     logger.info(`Email sent successfully: ${info.messageId}`);
     return info;
   } catch (error) {
     logger.error('Email sending failed:', error);
     throw error;
   }
 }

 async generateUnsubscribeToken(userId, notificationType) {
   const token = require('crypto').randomBytes(32).toString('hex');
   const key = `unsubscribe:${token}`;
   
   await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify({
     userId: userId.toString(),
     notificationType
   }));
   
   return token;
 }

 async processUnsubscribe(token) {
   const key = `unsubscribe:${token}`;
   const data = await redis.get(key);
   
   if (!data) {
     throw new Error('Invalid or expired unsubscribe token');
   }
   
   const { userId, notificationType } = JSON.parse(data);
   
   await User.findByIdAndUpdate(userId, {
     [`notificationPreferences.${notificationType}`]: false
   });
   
   await redis.del(key);
   
   return { userId, notificationType };
 }

 async logEmailSent(email, category) {
   const key = `email:sent:${new Date().toISOString().split('T')[0]}`;
   const member = `${email}:${category}`;
   
   await redis.zincrby(key, 1, member);
   await redis.expire(key, 90 * 24 * 60 * 60);
 }

 async generateDigestCSV(posts, followedTopics) {
   const csv = require('csv-stringify/sync');
   
   const records = posts.map(post => ({
     title: post.title,
     author: post.author.username,
     score: post.score,
     comments: post.commentCount,
     url: `${config.app.url}/post/${post._id}`,
     topics: post.hashtags.join(', ')
   }));
   
   const csvContent = csv.stringify(records, {
     header: true,
     columns: ['title', 'author', 'score', 'comments', 'url', 'topics']
   });
   
   return [{
     filename: `shadownews-digest-${new Date().toISOString().split('T')[0]}.csv`,
     content: csvContent,
     contentType: 'text/csv'
   }];
 }

 async generateGrowthReportCSV(repositoryId, stats) {
   const csv = require('csv-stringify/sync');
   
   const records = [
     { metric: 'Total Emails', value: stats.totalEmails },
     { metric: 'New This Week', value: stats.newThisWeek },
     { metric: 'Active Users', value: stats.activeUsers },
     { metric: 'Engagement Rate', value: `${stats.engagementRate}%` },
     { metric: 'Snowball Multiplier', value: stats.snowballMultiplier }
   ];
   
   const csvContent = csv.stringify(records, {
     header: true,
     columns: ['metric', 'value']
   });
   
   return [{
     filename: `repository-growth-${new Date().toISOString().split('T')[0]}.csv`,
     content: csvContent,
     contentType: 'text/csv'
   }];
 }

 async getUserNotificationPreferences(userId) {
   const user = await User.findById(userId).select('notificationPreferences');
   return user?.notificationPreferences || {};
 }

 async updateUserNotificationPreferences(userId, preferences) {
   return await User.findByIdAndUpdate(
     userId,
     { notificationPreferences: preferences },
     { new: true, runValidators: true }
   );
 }

 async getNotificationStats(userId) {
   const key = `email:sent:${new Date().toISOString().split('T')[0]}`;
   const stats = await redis.zrange(key, 0, -1, 'WITHSCORES');
   
   const userStats = {};
   for (let i = 0; i < stats.length; i += 2) {
     const [email, category] = stats[i].split(':');
     const count = parseInt(stats[i + 1]);
     
     if (email === (await User.findById(userId).select('email')).email) {
       userStats[category] = (userStats[category] || 0) + count;
     }
   }
   
   return userStats;
 }
}

module.exports = new NotificationService();
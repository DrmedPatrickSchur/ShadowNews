const Bull = require('bull');
const { parseEmail } = require('../services/emailParser.service');
const { createPost } = require('../services/posts.service');
const { processSnowball } = require('../services/snowball.service');
const { sendNotification } = require('../services/notification.service');
const { updateUserKarma } = require('../services/karma.service');
const { addEmailToRepository } = require('../services/repository.service');
const { extractHashtags, suggestHashtags } = require('../services/ai.service');
const logger = require('../utils/logger');
const config = require('../config');

const emailQueue = new Bull('email-processing', {
 redis: {
   host: config.redis.host,
   port: config.redis.port,
   password: config.redis.password
 }
});

const snowballQueue = new Bull('snowball-distribution', {
 redis: {
   host: config.redis.host,
   port: config.redis.port,
   password: config.redis.password
 }
});

emailQueue.process('inbound-email', async (job) => {
 const { emailData } = job.data;
 
 try {
   logger.info(`Processing email from: ${emailData.from}`);
   
   const parsedEmail = await parseEmail(emailData);
   
   if (!parsedEmail.isValid) {
     throw new Error(`Invalid email format: ${parsedEmail.error}`);
   }
   
   const { command, userId, content, attachments } = parsedEmail;
   
   switch (command) {
     case 'POST':
       await handlePostCommand(userId, content, attachments);
       break;
       
     case 'COMMENT':
       await handleCommentCommand(userId, content, parsedEmail.parentId);
       break;
       
     case 'UPVOTE':
       await handleUpvoteCommand(userId, parsedEmail.targetId);
       break;
       
     case 'REPOSITORY':
       await handleRepositoryCommand(userId, content, attachments);
       break;
       
     case 'SUBSCRIBE':
       await handleSubscribeCommand(userId, parsedEmail.hashtags);
       break;
       
     case 'UNSUBSCRIBE':
       await handleUnsubscribeCommand(userId, parsedEmail.hashtags);
       break;
       
     case 'STATS':
       await handleStatsCommand(userId);
       break;
       
     default:
       await handleDefaultPost(userId, content, attachments);
   }
   
   await job.progress(100);
   return { success: true, command, userId };
   
 } catch (error) {
   logger.error('Email processing error:', error);
   throw error;
 }
});

async function handlePostCommand(userId, content, attachments) {
 const hashtags = await extractHashtags(content.body);
 const suggestedTags = await suggestHashtags(content.body);
 
 const postData = {
   userId,
   title: content.subject,
   body: content.body,
   hashtags: [...new Set([...hashtags, ...suggestedTags])],
   source: 'email',
   attachments: []
 };
 
 if (attachments?.csv) {
   const csvData = await processCsvAttachment(attachments.csv);
   postData.repository = {
     emails: csvData.emails,
     metadata: csvData.metadata
   };
   
   await snowballQueue.add('process-csv', {
     userId,
     csvData,
     postId: null
   });
 }
 
 const post = await createPost(postData);
 
 await updateUserKarma(userId, 'post_created', 50);
 
 await sendNotification({
   userId,
   type: 'post_created',
   data: {
     postId: post._id,
     title: post.title
   }
 });
 
 if (postData.repository) {
   await snowballQueue.add('initiate-snowball', {
     postId: post._id,
     userId,
     initialEmails: postData.repository.emails
   });
 }
 
 return post;
}

async function handleCommentCommand(userId, content, parentId) {
 const { addComment } = require('../services/comments.service');
 
 const comment = await addComment({
   userId,
   postId: parentId,
   body: content.body,
   source: 'email'
 });
 
 await updateUserKarma(userId, 'comment_created', 20);
 
 return comment;
}

async function handleUpvoteCommand(userId, targetId) {
 const { upvotePost } = require('../services/posts.service');
 
 await upvotePost(userId, targetId);
 await updateUserKarma(userId, 'post_upvoted', 10);
 
 return { success: true };
}

async function handleRepositoryCommand(userId, content, attachments) {
 if (!attachments?.csv) {
   throw new Error('Repository command requires CSV attachment');
 }
 
 const csvData = await processCsvAttachment(attachments.csv);
 const { createRepository } = require('../services/repository.service');
 
 const repository = await createRepository({
   userId,
   name: content.subject,
   description: content.body,
   emails: csvData.emails,
   hashtags: await extractHashtags(content.body)
 });
 
 await updateUserKarma(userId, 'repository_created', 100);
 
 await snowballQueue.add('repository-snowball', {
   repositoryId: repository._id,
   userId,
   emails: csvData.emails
 });
 
 return repository;
}

async function handleSubscribeCommand(userId, hashtags) {
 const { subscribeToHashtags } = require('../services/users.service');
 
 await subscribeToHashtags(userId, hashtags);
 
 await sendNotification({
   userId,
   type: 'subscription_confirmed',
   data: { hashtags }
 });
 
 return { success: true };
}

async function handleUnsubscribeCommand(userId, hashtags) {
 const { unsubscribeFromHashtags } = require('../services/users.service');
 
 await unsubscribeFromHashtags(userId, hashtags);
 
 return { success: true };
}

async function handleStatsCommand(userId) {
 const { getUserStats } = require('../services/users.service');
 const stats = await getUserStats(userId);
 
 await sendNotification({
   userId,
   type: 'stats_report',
   data: stats,
   channel: 'email'
 });
 
 return { success: true };
}

async function handleDefaultPost(userId, content, attachments) {
 return handlePostCommand(userId, content, attachments);
}

async function processCsvAttachment(csvBuffer) {
 const { parseCsv } = require('../utils/csvParser');
 
 const data = await parseCsv(csvBuffer);
 const emails = [];
 const metadata = {
   totalRows: data.length,
   processedAt: new Date(),
   columns: Object.keys(data[0] || {})
 };
 
 for (const row of data) {
   if (row.email && isValidEmail(row.email)) {
     emails.push({
       email: row.email.toLowerCase().trim(),
       name: row.name || '',
       tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
       metadata: row
     });
   }
 }
 
 return { emails, metadata };
}

function isValidEmail(email) {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return emailRegex.test(email);
}

emailQueue.on('completed', (job, result) => {
 logger.info(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
 logger.error(`Email job ${job.id} failed:`, err);
});

emailQueue.on('stalled', (job) => {
 logger.warn(`Email job ${job.id} stalled`);
});

process.on('SIGTERM', async () => {
 logger.info('SIGTERM received, closing email queue...');
 await emailQueue.close();
 process.exit(0);
});

module.exports = emailQueue;
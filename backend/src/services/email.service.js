/**
 * @fileoverview email.service.js
 * 
 * Implementation file for email.service.js
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
const { simpleParser } = require('mailparser');
const Bull = require('bull');
const crypto = require('crypto');
const { promisify } = require('util');
const EmailModel = require('../models/Email.model');
const UserModel = require('../models/User.model');
const PostModel = require('../models/Post.model');
const RepositoryModel = require('../models/Repository.model');
const aiService = require('./ai.service');
const snowballService = require('./snowball.service');
const logger = require('../utils/logger');
const { emailConfig } = require('../config');
const { validateEmail, sanitizeEmailContent } = require('../utils/validators');

class EmailService {
 constructor() {
   this.transporter = nodemailer.createTransport({
     host: emailConfig.smtp.host,
     port: emailConfig.smtp.port,
     secure: emailConfig.smtp.secure,
     auth: {
       user: emailConfig.smtp.auth.user,
       pass: emailConfig.smtp.auth.pass
     }
   });

   this.emailQueue = new Bull('email-queue', {
     redis: {
       host: process.env.REDIS_HOST,
       port: process.env.REDIS_PORT
     }
   });

   this.initializeQueueProcessors();
 }

 initializeQueueProcessors() {
   this.emailQueue.process('send-email', async (job) => {
     return await this.sendEmail(job.data);
   });

   this.emailQueue.process('process-inbound', async (job) => {
     return await this.processInboundEmail(job.data);
   });

   this.emailQueue.process('send-digest', async (job) => {
     return await this.sendDigestEmail(job.data);
   });
 }

 async sendEmail({ to, subject, html, text, attachments = [], metadata = {} }) {
   try {
     const messageId = crypto.randomBytes(16).toString('hex');
     
     const mailOptions = {
       from: `Shadownews <${emailConfig.from}>`,
       to,
       subject,
       html,
       text,
       attachments,
       headers: {
         'X-Shadownews-ID': messageId,
         'X-Shadownews-Type': metadata.type || 'general'
       }
     };

     const info = await this.transporter.sendMail(mailOptions);

     await EmailModel.create({
       messageId,
       to,
       from: emailConfig.from,
       subject,
       content: text,
       htmlContent: html,
       type: metadata.type || 'outbound',
       status: 'sent',
       metadata,
       sentAt: new Date()
     });

     logger.info(`Email sent successfully to ${to}`, { messageId, subject });
     return { success: true, messageId, info };

   } catch (error) {
     logger.error('Email sending failed', { error: error.message, to, subject });
     throw error;
   }
 }

 async processInboundEmail(rawEmail) {
   try {
     const parsed = await simpleParser(rawEmail);
     
     const fromEmail = parsed.from.value[0].address;
     const toEmail = parsed.to.value[0].address;
     const subject = parsed.subject;
     const content = parsed.text || '';
     const html = parsed.html || '';
     const attachments = parsed.attachments || [];

     const user = await UserModel.findOne({ 
       $or: [
         { email: fromEmail },
         { shadowEmail: fromEmail }
       ]
     });

     if (!user) {
       await this.sendEmail({
         to: fromEmail,
         subject: 'Re: ' + subject,
         text: 'Your email address is not registered with Shadownews. Please sign up at https://shadownews.com',
         html: '<p>Your email address is not registered with Shadownews. Please <a href="https://shadownews.com/signup">sign up</a> to post.</p>'
       });
       return { success: false, reason: 'User not found' };
     }

     const emailRecord = await EmailModel.create({
       messageId: parsed.messageId,
       from: fromEmail,
       to: toEmail,
       subject,
       content,
       htmlContent: html,
       type: 'inbound',
       userId: user._id,
       attachments: attachments.map(att => ({
         filename: att.filename,
         contentType: att.contentType,
         size: att.size,
         content: att.content
       })),
       processedAt: new Date()
     });

     if (toEmail.endsWith('@shadownews.community')) {
       return await this.createPostFromEmail(user, emailRecord, attachments);
     } else if (toEmail.includes('+repo-') && toEmail.endsWith('@shadownews.community')) {
       return await this.addToRepository(user, emailRecord, attachments);
     } else if (subject.toLowerCase().startsWith('re:')) {
       return await this.createCommentFromEmail(user, emailRecord);
     }

     return { success: true, action: 'stored', emailId: emailRecord._id };

   } catch (error) {
     logger.error('Failed to process inbound email', { error: error.message });
     throw error;
   }
 }

 async createPostFromEmail(user, emailRecord, attachments) {
   try {
     const { subject, content, htmlContent } = emailRecord;
     
     const hashtags = await aiService.suggestHashtags(content);
     const summary = await aiService.generateSummary(content);

     const csvAttachments = attachments.filter(att => 
       att.contentType === 'text/csv' || att.filename.endsWith('.csv')
     );

     let repositoryIds = [];
     if (csvAttachments.length > 0) {
       for (const csv of csvAttachments) {
         const repository = await this.processCSVAttachment(user, csv, subject);
         if (repository) {
           repositoryIds.push(repository._id);
         }
       }
     }

     const post = await PostModel.create({
       userId: user._id,
       title: subject,
       content: sanitizeEmailContent(content),
       htmlContent: sanitizeEmailContent(htmlContent),
       hashtags,
       summary,
       source: 'email',
       emailId: emailRecord._id,
       repositoryIds,
       karma: 0,
       createdAt: new Date()
     });

     await user.updateOne({ 
       $inc: { karma: 50 },
       $push: { posts: post._id }
     });

     if (repositoryIds.length > 0) {
       await snowballService.initiateSnowball({
         postId: post._id,
         repositoryIds,
         userId: user._id
       });
     }

     await this.sendEmail({
       to: user.email,
       subject: 'Your post has been published on Shadownews',
       html: `
         <h2>Post Published Successfully!</h2>
         <p>Your post "${subject}" is now live on Shadownews.</p>
         <p>View it here: <a href="${process.env.FRONTEND_URL}/post/${post._id}">View Post</a></p>
         <p>Current karma: ${user.karma + 50} (+50)</p>
       `,
       text: `Your post "${subject}" has been published. View it at ${process.env.FRONTEND_URL}/post/${post._id}`
     });

     return { success: true, action: 'post_created', postId: post._id };

   } catch (error) {
     logger.error('Failed to create post from email', { error: error.message });
     throw error;
   }
 }

 async processCSVAttachment(user, csvAttachment, context) {
   try {
     const csvContent = csvAttachment.content.toString('utf-8');
     const lines = csvContent.split('\n');
     const headers = lines[0].split(',').map(h => h.trim());
     
     if (!headers.includes('email')) {
       logger.warn('CSV missing email column', { filename: csvAttachment.filename });
       return null;
     }

     const emails = [];
     for (let i = 1; i < lines.length; i++) {
       const values = lines[i].split(',');
       const emailIndex = headers.indexOf('email');
       const email = values[emailIndex]?.trim();
       
       if (email && validateEmail(email)) {
         emails.push({
           email,
           metadata: headers.reduce((acc, header, index) => {
             if (header !== 'email') {
               acc[header] = values[index]?.trim();
             }
             return acc;
           }, {})
         });
       }
     }

     const repository = await RepositoryModel.create({
       name: `${context} - ${new Date().toLocaleDateString()}`,
       ownerId: user._id,
       emails,
       totalEmails: emails.length,
       verifiedEmails: 0,
       source: 'csv_upload',
       csvFilename: csvAttachment.filename,
       createdAt: new Date()
     });

     return repository;

   } catch (error) {
     logger.error('Failed to process CSV attachment', { error: error.message });
     return null;
   }
 }

 async createCommentFromEmail(user, emailRecord) {
   try {
     const { subject, content } = emailRecord;
     const postIdMatch = subject.match(/\[Post:([a-f0-9]{24})\]/);
     
     if (!postIdMatch) {
       await this.sendEmail({
         to: user.email,
         subject: 'Could not process your comment',
         text: 'Unable to identify which post you are commenting on. Please use the reply button on the website.',
         html: '<p>Unable to identify which post you are commenting on. Please use the reply button on the website.</p>'
       });
       return { success: false, reason: 'Post ID not found' };
     }

     const postId = postIdMatch[1];
     const post = await PostModel.findById(postId);
     
     if (!post) {
       return { success: false, reason: 'Post not found' };
     }

     const comment = await CommentModel.create({
       postId,
       userId: user._id,
       content: sanitizeEmailContent(content),
       source: 'email',
       emailId: emailRecord._id,
       karma: 0,
       createdAt: new Date()
     });

     await user.updateOne({ 
       $inc: { karma: 20 },
       $push: { comments: comment._id }
     });

     return { success: true, action: 'comment_created', commentId: comment._id };

   } catch (error) {
     logger.error('Failed to create comment from email', { error: error.message });
     throw error;
   }
 }

 async sendDigestEmail({ userId, frequency = 'daily' }) {
   try {
     const user = await UserModel.findById(userId).populate('followedHashtags repositories');
     
     if (!user || !user.emailDigest || user.emailDigest.frequency !== frequency) {
       return { success: false, reason: 'User digest not configured' };
     }

     const since = this.getDigestSince(frequency);
     
     const posts = await PostModel.find({
       $or: [
         { hashtags: { $in: user.followedHashtags } },
         { repositoryIds: { $in: user.repositories } }
       ],
       createdAt: { $gte: since }
     }).sort({ karma: -1 }).limit(10).populate('userId', 'username');

     if (posts.length === 0) {
       return { success: false, reason: 'No new posts to digest' };
     }

     const html = this.generateDigestHTML(posts, user, frequency);
     const csvData = await this.generateDigestCSV(posts, user);

     await this.sendEmail({
       to: user.email,
       subject: `🌟 Your ${frequency} Shadownews digest: ${posts.length} must-read posts`,
       html,
       text: posts.map(p => `${p.title}\n${process.env.FRONTEND_URL}/post/${p._id}\n\n`).join(''),
       attachments: [{
         filename: `shadownews_digest_${new Date().toISOString().split('T')[0]}.csv`,
         content: csvData
       }],
       metadata: {
         type: 'digest',
         frequency,
         postCount: posts.length
       }
     });

     await user.updateOne({ 
       'emailDigest.lastSent': new Date() 
     });

     return { success: true, postsSent: posts.length };

   } catch (error) {
     logger.error('Failed to send digest email', { error: error.message });
     throw error;
   }
 }

 generateDigestHTML(posts, user, frequency) {
   return `
     <!DOCTYPE html>
     <html>
     <head>
       <style>
         body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
         .header { background: #ff6600; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
         .post { border: 1px solid #e0e0e0; margin: 10px 0; padding: 15px; border-radius: 8px; }
         .post-title { font-size: 18px; font-weight: bold; color: #333; text-decoration: none; }
         .post-meta { color: #666; font-size: 14px; margin: 5px 0; }
         .hashtag { background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
         .cta { background: #ff6600; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
         .footer { color: #666; font-size: 12px; margin-top: 30px; }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="header">
           <h1>Your ${frequency} Shadownews Digest</h1>
           <p>${posts.length} curated posts for ${user.username}</p>
         </div>
         
         ${posts.map(post => `
           <div class="post">
             <a href="${process.env.FRONTEND_URL}/post/${post._id}" class="post-title">${post.title}</a>
             <div class="post-meta">
               by ${post.userId.username} • ${post.karma} karma • ${post.comments?.length || 0} comments
             </div>
             <div>
               ${post.hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}
             </div>
             <p>${post.summary || post.content.substring(0, 150)}...</p>
           </div>
         `).join('')}
         
         <a href="${process.env.FRONTEND_URL}" class="cta">Visit Shadownews</a>
         
         <div class="footer">
           <p>You're receiving this because you subscribed to ${frequency} digests.</p>
           <p><a href="${process.env.FRONTEND_URL}/settings/email">Update preferences</a> | <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${user.unsubscribeToken}">Unsubscribe</a></p>
           <p>Forward this email to grow your network! 🚀</p>
         </div>
       </div>
     </body>
     </html>
   `;
 }

 async generateDigestCSV(posts, user) {
   const csvRows = [
     ['Title', 'Author', 'URL', 'Karma', 'Hashtags', 'Summary']
   ];

   posts.forEach(post => {
     csvRows.push([
       post.title,
       post.userId.username,
       `${process.env.FRONTEND_URL}/post/${post._id}`,
       post.karma,
       post.hashtags.join(', '),
       post.summary || post.content.substring(0, 100)
     ]);
   });

   return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
 }

 getDigestSince(frequency) {
   const now = new Date();
   switch (frequency) {
     case 'daily':
       return new Date(now.setDate(now.getDate() - 1));
     case 'weekly':
       return new Date(now.setDate(now.getDate() - 7));
     case 'monthly':
       return new Date(now.setMonth(now.getMonth() - 1));
     default:
       return new Date(now.setDate(now.getDate() - 1));
   }
 }

 async addToRepository(user, emailRecord, attachments) {
   try {
     const repoMatch = emailRecord.to.match(/\+repo-([a-f0-9]{24})@/);
     if (!repoMatch) {
       return { success: false, reason: 'Invalid repository email format' };
     }

     const repositoryId = repoMatch[1];
     const repository = await RepositoryModel.findOne({
       _id: repositoryId,
       $or: [
         { ownerId: user._id },
         { collaborators: user._id }
       ]
     });

     if (!repository) {
       return { success: false, reason: 'Repository not found or access denied' };
     }

     const newEmails = [];
     const csvAttachments = attachments.filter(att => 
       att.contentType === 'text/csv' || att.filename.endsWith('.csv')
     );

     for (const csv of csvAttachments) {
       const emails = await this.extractEmailsFromCSV(csv);
       newEmails.push(...emails);
     }

     const emailText = emailRecord.content + ' ' + emailRecord.htmlContent;
     const extractedEmails = this.extractEmailsFromText(emailText);
     newEmails.push(...extractedEmails.map(email => ({ email, metadata: { source: 'email_body' } })));

     const uniqueNewEmails = newEmails.filter(newEmail => 
       !repository.emails.some(existing => existing.email === newEmail.email)
     );

     if (uniqueNewEmails.length > 0) {
       await repository.updateOne({
         $push: { emails: { $each: uniqueNewEmails } },
         $inc: { totalEmails: uniqueNewEmails.length }
       });

       await snowballService.processNewEmails({
         repositoryId: repository._id,
         newEmails: uniqueNewEmails,
         sourceUserId: user._id
       });
     }

     return { 
       success: true, 
       action: 'emails_added', 
       count: uniqueNewEmails.length,
       repositoryId: repository._id 
     };

   } catch (error) {
     logger.error('Failed to add to repository', { error: error.message });
     throw error;
   }
 }

 extractEmailsFromText(text) {
   const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
   const matches = text.match(emailRegex) || [];
   return [...new Set(matches)].filter(email => validateEmail(email));
 }

 async extractEmailsFromCSV(csvAttachment) {
   try {
     const csvContent = csvAttachment.content.toString('utf-8');
     const lines = csvContent.split('\n');
     const headers = lines[0].split(',').map(h => h.trim());
     
     const emails = [];
     for (let i = 1; i < lines.length; i++) {
       const values = lines[i].split(',');
       const emailValue = values.find(v => validateEmail(v.trim()));
       
       if (emailValue) {
         emails.push({
           email: emailValue.trim(),
           metadata: {
             source: 'csv_import',
             filename: csvAttachment.filename
           }
         });
       }
     }

     return emails;

   } catch (error) {
     logger.error('Failed to extract emails from CSV', { error: error.message });
     return [];
   }
 }

 async verifyEmailDelivery(email) {
   try {
     await this.transporter.verify();
     return { valid: true, email };
   } catch (error) {
     logger.error('Email verification failed', { error: error.message, email });
     return { valid: false, email, error: error.message };
   }
 }

 async queueEmail(type, data, delay = 0) {
   return await this.emailQueue.add(type, data, {
     delay,
     attempts: 3,
     backoff: {
       type: 'exponential',
       delay: 2000
     }
   });
 }

 async getEmailStats(userId) {
   const [sent, received, digests] = await Promise.all([
     EmailModel.countDocuments({ from: { $regex: userId }, type: 'outbound' }),
     EmailModel.countDocuments({ userId, type: 'inbound' }),
     EmailModel.countDocuments({ userId, 'metadata.type': 'digest' })
   ]);

   return { sent, received, digests };
 }
}

module.exports = new EmailService();
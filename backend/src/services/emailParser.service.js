/**
 * @fileoverview emailParser.service.js
 * 
 * Implementation file for emailParser.service.js
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
 */\n\nconst { simpleParser } = require('mailparser');
const { createHash } = require('crypto');
const sanitizeHtml = require('sanitize-html');
const natural = require('natural');
const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Repository = require('../models/Repository.model');
const aiService = require('./ai.service');
const logger = require('../utils/logger');

class EmailParserService {
 constructor() {
   this.tokenizer = new natural.WordTokenizer();
   this.commands = {
     POST: /^(post|submit)/i,
     COMMENT: /^(comment|reply)/i,
     UPVOTE: /^(upvote|like|\+1)/i,
     DOWNVOTE: /^(downvote|dislike|\-1)/i,
     SUBSCRIBE: /^subscribe\s+#?(\w+)/i,
     UNSUBSCRIBE: /^unsubscribe\s+#?(\w+)/i,
     STATS: /^stats?$/i,
     HELP: /^help$/i,
     REPOSITORY: /^(repo|repository)\s+(\w+)/i,
     ADD_EMAIL: /^add\s+email\s+([\w.-]+@[\w.-]+\.\w+)/i,
     REMOVE_EMAIL: /^remove\s+email\s+([\w.-]+@[\w.-]+\.\w+)/i
   };
 }

 async parseIncomingEmail(rawEmail) {
   try {
     const parsed = await simpleParser(rawEmail);
     
     const emailData = {
       messageId: parsed.messageId,
       from: this.extractEmailAddress(parsed.from),
       to: this.extractEmailAddresses(parsed.to),
       cc: this.extractEmailAddresses(parsed.cc),
       subject: parsed.subject || '',
       text: parsed.text || '',
       html: parsed.html || '',
       attachments: parsed.attachments || [],
       headers: parsed.headers,
       date: parsed.date || new Date(),
       inReplyTo: parsed.inReplyTo,
       references: parsed.references
     };

     const user = await this.authenticateUser(emailData.from);
     if (!user) {
       throw new Error('Unauthorized email sender');
     }

     emailData.userId = user._id;
     emailData.command = this.detectCommand(emailData.subject, emailData.text);
     
     if (emailData.command) {
       return await this.processCommand(emailData, user);
     } else {
       return await this.processPost(emailData, user);
     }
   } catch (error) {
     logger.error('Email parsing error:', error);
     throw error;
   }
 }

 extractEmailAddress(addressObject) {
   if (!addressObject) return null;
   const addresses = addressObject.value || addressObject;
   if (Array.isArray(addresses) && addresses.length > 0) {
     return addresses[0].address?.toLowerCase() || addresses[0].toLowerCase();
   }
   return addressObject.address?.toLowerCase() || addressObject.toLowerCase();
 }

 extractEmailAddresses(addressObject) {
   if (!addressObject) return [];
   const addresses = addressObject.value || addressObject;
   if (Array.isArray(addresses)) {
     return addresses.map(addr => 
       addr.address?.toLowerCase() || addr.toLowerCase()
     );
   }
   return [this.extractEmailAddress(addressObject)].filter(Boolean);
 }

 async authenticateUser(emailAddress) {
   if (!emailAddress) return null;
   
   const user = await User.findOne({
     $or: [
       { email: emailAddress },
       { shadowEmailAlias: emailAddress }
     ]
   });

   return user;
 }

 detectCommand(subject, body) {
   const commandText = subject.toLowerCase().trim();
   
   for (const [commandName, pattern] of Object.entries(this.commands)) {
     const match = commandText.match(pattern);
     if (match) {
       return {
         type: commandName,
         match: match,
         params: match.slice(1)
       };
     }
   }

   const firstLine = body.split('\n')[0].toLowerCase().trim();
   for (const [commandName, pattern] of Object.entries(this.commands)) {
     const match = firstLine.match(pattern);
     if (match) {
       return {
         type: commandName,
         match: match,
         params: match.slice(1)
       };
     }
   }

   return null;
 }

 async processCommand(emailData, user) {
   const { command } = emailData;
   
   switch (command.type) {
     case 'COMMENT':
       return await this.processComment(emailData, user);
     
     case 'UPVOTE':
       return await this.processVote(emailData, user, 1);
     
     case 'DOWNVOTE':
       return await this.processVote(emailData, user, -1);
     
     case 'SUBSCRIBE':
       return await this.processSubscribe(user, command.params[0]);
     
     case 'UNSUBSCRIBE':
       return await this.processUnsubscribe(user, command.params[0]);
     
     case 'STATS':
       return await this.getUserStats(user);
     
     case 'HELP':
       return await this.getHelpText(user);
     
     case 'REPOSITORY':
       return await this.processRepositoryCommand(emailData, user, command.params);
     
     case 'ADD_EMAIL':
       return await this.addEmailToRepository(emailData, user, command.params[0]);
     
     case 'REMOVE_EMAIL':
       return await this.removeEmailFromRepository(emailData, user, command.params[0]);
     
     default:
       return await this.processPost(emailData, user);
   }
 }

 async processPost(emailData, user) {
   const { subject, text, html, attachments } = emailData;
   
   const title = this.sanitizeTitle(subject);
   const content = this.extractContent(text, html);
   const urls = this.extractUrls(content);
   const hashtags = await this.extractHashtags(content, title);
   
   const csvAttachments = attachments.filter(att => 
     att.filename?.toLowerCase().endsWith('.csv')
   );

   const repositories = [];
   for (const csv of csvAttachments) {
     const repo = await this.processCsvAttachment(csv, user);
     if (repo) repositories.push(repo._id);
   }

   const postData = {
     author: user._id,
     title,
     content,
     urls,
     hashtags,
     repositories,
     source: 'email',
     emailMessageId: emailData.messageId,
     karma: 0,
     createdAt: new Date(),
     updatedAt: new Date()
   };

   const post = new Post(postData);
   await post.save();

   await this.updateUserKarma(user, 'post_created', 50);

   return {
     success: true,
     type: 'post',
     data: post,
     message: `Post "${title}" created successfully`
   };
 }

 async processComment(emailData, user) {
   const parentPost = await this.findParentPost(emailData);
   if (!parentPost) {
     throw new Error('Parent post not found for comment');
   }

   const content = this.extractContent(emailData.text, emailData.html);
   
   const comment = {
     author: user._id,
     content,
     createdAt: new Date(),
     karma: 0
   };

   parentPost.comments.push(comment);
   await parentPost.save();

   await this.updateUserKarma(user, 'comment_created', 20);

   return {
     success: true,
     type: 'comment',
     data: comment,
     message: 'Comment added successfully'
   };
 }

 async processVote(emailData, user, value) {
   const post = await this.findTargetPost(emailData);
   if (!post) {
     throw new Error('Target post not found for vote');
   }

   const existingVote = post.votes.find(v => 
     v.user.toString() === user._id.toString()
   );

   if (existingVote) {
     existingVote.value = value;
   } else {
     post.votes.push({ user: user._id, value });
   }

   post.karma = post.votes.reduce((sum, vote) => sum + vote.value, 0);
   await post.save();

   await this.updateUserKarma(user, 'vote_cast', 10);

   return {
     success: true,
     type: 'vote',
     data: { postId: post._id, value },
     message: `${value > 0 ? 'Upvoted' : 'Downvoted'} successfully`
   };
 }

 async processCsvAttachment(attachment, user) {
   try {
     const csvContent = attachment.content.toString('utf-8');
     const emails = this.parseCsvEmails(csvContent);
     
     if (emails.length === 0) return null;

     const repositoryName = attachment.filename.replace('.csv', '');
     
     let repository = await Repository.findOne({
       name: repositoryName,
       owner: user._id
     });

     if (!repository) {
       repository = new Repository({
         name: repositoryName,
         owner: user._id,
         emails: [],
         isPublic: true,
         growthEnabled: true,
         createdAt: new Date()
       });
     }

     const newEmails = emails.filter(email => 
       !repository.emails.some(e => e.email === email)
     );

     for (const email of newEmails) {
       repository.emails.push({
         email,
         addedBy: user._id,
         addedAt: new Date(),
         verified: false,
         source: 'csv_upload'
       });
     }

     repository.totalEmails = repository.emails.length;
     await repository.save();

     return repository;
   } catch (error) {
     logger.error('CSV processing error:', error);
     return null;
   }
 }

 parseCsvEmails(csvContent) {
   const lines = csvContent.split('\n');
   const emails = [];
   const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;

   for (const line of lines) {
     const matches = line.match(emailRegex);
     if (matches) {
       emails.push(...matches.map(e => e.toLowerCase()));
     }
   }

   return [...new Set(emails)];
 }

 sanitizeTitle(title) {
   return sanitizeHtml(title, {
     allowedTags: [],
     allowedAttributes: {}
   }).trim().substring(0, 300);
 }

 extractContent(text, html) {
   if (html) {
     return sanitizeHtml(html, {
       allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
       allowedAttributes: {
         'a': ['href']
       }
     });
   }
   
   return text.replace(/\n/g, '<br>');
 }

 extractUrls(content) {
   const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
   const matches = content.match(urlRegex) || [];
   return [...new Set(matches)];
 }

 async extractHashtags(content, title) {
   const manualHashtags = [];
   const hashtagRegex = /#\w+/g;
   
   const contentMatches = content.match(hashtagRegex) || [];
   const titleMatches = title.match(hashtagRegex) || [];
   
   manualHashtags.push(...contentMatches, ...titleMatches);
   
   const cleanedHashtags = manualHashtags
     .map(tag => tag.substring(1).toLowerCase())
     .filter(tag => tag.length > 2 && tag.length < 30);

   const aiSuggestions = await aiService.suggestHashtags(title + ' ' + content);
   
   return [...new Set([...cleanedHashtags, ...aiSuggestions])].slice(0, 10);
 }

 async findParentPost(emailData) {
   if (emailData.inReplyTo) {
     return await Post.findOne({ emailMessageId: emailData.inReplyTo });
   }
   
   if (emailData.references && emailData.references.length > 0) {
     return await Post.findOne({ 
       emailMessageId: { $in: emailData.references } 
     });
   }

   const subjectMatch = emailData.subject.match(/re:\s*(.+)/i);
   if (subjectMatch) {
     const originalTitle = subjectMatch[1].trim();
     return await Post.findOne({ 
       title: new RegExp(originalTitle, 'i') 
     }).sort({ createdAt: -1 });
   }

   return null;
 }

 async findTargetPost(emailData) {
   return this.findParentPost(emailData);
 }

 async updateUserKarma(user, action, points) {
   user.karma = (user.karma || 0) + points;
   user.karmaHistory = user.karmaHistory || [];
   user.karmaHistory.push({
     action,
     points,
     date: new Date()
   });
   
   await user.save();
 }

 async processSubscribe(user, hashtag) {
   const cleanHashtag = hashtag.replace('#', '').toLowerCase();
   
   if (!user.subscribedHashtags) {
     user.subscribedHashtags = [];
   }
   
   if (!user.subscribedHashtags.includes(cleanHashtag)) {
     user.subscribedHashtags.push(cleanHashtag);
     await user.save();
   }

   return {
     success: true,
     type: 'subscribe',
     data: { hashtag: cleanHashtag },
     message: `Subscribed to #${cleanHashtag}`
   };
 }

 async processUnsubscribe(user, hashtag) {
   const cleanHashtag = hashtag.replace('#', '').toLowerCase();
   
   if (user.subscribedHashtags) {
     user.subscribedHashtags = user.subscribedHashtags.filter(
       h => h !== cleanHashtag
     );
     await user.save();
   }

   return {
     success: true,
     type: 'unsubscribe',
     data: { hashtag: cleanHashtag },
     message: `Unsubscribed from #${cleanHashtag}`
   };
 }

 async getUserStats(user) {
   const postCount = await Post.countDocuments({ author: user._id });
   const repositoryCount = await Repository.countDocuments({ owner: user._id });
   
   return {
     success: true,
     type: 'stats',
     data: {
       karma: user.karma || 0,
       posts: postCount,
       repositories: repositoryCount,
       memberSince: user.createdAt
     },
     message: 'User statistics retrieved'
   };
 }

 async getHelpText(user) {
   const helpText = `
Shadownews Email Commands:

POST/SUBMIT - Create a new post (use as subject)
COMMENT/REPLY - Reply to a post (reply to notification email)
UPVOTE/+1 - Upvote a post
DOWNVOTE/-1 - Downvote a post
SUBSCRIBE #topic - Subscribe to a hashtag
UNSUBSCRIBE #topic - Unsubscribe from a hashtag
STATS - Get your statistics
HELP - Show this help message
REPOSITORY name - Create/access a repository
ADD EMAIL user@example.com - Add email to repository
REMOVE EMAIL user@example.com - Remove email from repository

Attach CSV files to automatically create email repositories!
   `.trim();

   return {
     success: true,
     type: 'help',
     data: { helpText },
     message: 'Help information'
   };
 }

 async processRepositoryCommand(emailData, user, params) {
   const repositoryName = params[0];
   
   let repository = await Repository.findOne({
     name: repositoryName,
     owner: user._id
   });

   if (!repository) {
     repository = new Repository({
       name: repositoryName,
       owner: user._id,
       emails: [],
       isPublic: true,
       growthEnabled: true,
       createdAt: new Date()
     });
     await repository.save();
   }

   return {
     success: true,
     type: 'repository',
     data: repository,
     message: `Repository "${repositoryName}" ${repository.isNew ? 'created' : 'accessed'}`
   };
 }

 async addEmailToRepository(emailData, user, email) {
   const repository = await this.findUserRepository(emailData, user);
   if (!repository) {
     throw new Error('Repository not found');
   }

   const existingEmail = repository.emails.find(e => e.email === email);
   if (existingEmail) {
     return {
       success: false,
       type: 'add_email',
       message: 'Email already exists in repository'
     };
   }

   repository.emails.push({
     email,
     addedBy: user._id,
     addedAt: new Date(),
     verified: false,
     source: 'manual'
   });

   repository.totalEmails = repository.emails.length;
   await repository.save();

   return {
     success: true,
     type: 'add_email',
     data: { email, repository: repository.name },
     message: `Email ${email} added to repository`
   };
 }

 async removeEmailFromRepository(emailData, user, email) {
   const repository = await this.findUserRepository(emailData, user);
   if (!repository) {
     throw new Error('Repository not found');
   }

   repository.emails = repository.emails.filter(e => e.email !== email);
   repository.totalEmails = repository.emails.length;
   await repository.save();

   return {
     success: true,
     type: 'remove_email',
     data: { email, repository: repository.name },
     message: `Email ${email} removed from repository`
   };
 }

 async findUserRepository(emailData, user) {
   const subjectMatch = emailData.subject.match(/repository\s+(\w+)/i);
   if (subjectMatch) {
     return await Repository.findOne({
       name: subjectMatch[1],
       owner: user._id
     });
   }
   
   return await Repository.findOne({ owner: user._id }).sort({ updatedAt: -1 });
 }

 generateEmailHash(email) {
   return createHash('sha256').update(email.toLowerCase()).digest('hex');
 }
}

module.exports = new EmailParserService();
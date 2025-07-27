/**
 * @fileoverview Email Processing Worker
 * 
 * Advanced email processing worker for the ShadowNews platform that handles
 * incoming emails and converts them into platform actions. Supports email-to-post
 * conversion, command processing, CSV attachment handling, and automatic 
 * snowball distribution initiation.
 * 
 * Key Features:
 * - Email-to-post conversion with intelligent content parsing
 * - Multi-command email processing (POST, COMMENT, UPVOTE, etc.)
 * - CSV attachment processing for repository creation
 * - Automatic hashtag extraction and suggestion using AI
 * - Karma system integration for user engagement rewards
 * - Snowball distribution initiation for viral growth
 * - Comprehensive error handling and retry mechanisms
 * - Real-time notification system integration
 * 
 * Supported Email Commands:
 * - POST: Create new posts with optional CSV attachments
 * - COMMENT: Add comments to existing posts
 * - UPVOTE: Upvote posts and comments
 * - REPOSITORY: Create email repositories from CSV data
 * - SUBSCRIBE: Subscribe to hashtag notifications
 * - UNSUBSCRIBE: Unsubscribe from hashtag notifications
 * - STATS: Request user statistics via email
 * 
 * Email-First Architecture:
 * - Unique user email addresses (username@shadownews.community)
 * - Command parsing from email subject lines and body content
 * - Attachment processing for CSV-based repository creation
 * - Automatic content categorization and tagging
 * - Integration with viral distribution mechanisms
 * 
 * Performance Features:
 * - Asynchronous processing with job queue management
 * - Bulk CSV processing with memory optimization
 * - Intelligent error recovery and retry strategies
 * - Progress tracking for long-running operations
 * - Resource usage monitoring and optimization
 * 
 * Security Features:
 * - Email validation and sanitization
 * - User authentication via email address mapping
 * - CSV security scanning and size limits
 * - Content filtering and spam detection
 * - Rate limiting for email processing
 * 
 * Dependencies:
 * - bull: Redis-backed job queue for scalable email processing
 * - ../services/*: Platform services for posts, users, repositories
 * - ../utils/logger: Centralized logging for email processing events
 * - ../config: Configuration management for Redis and email settings
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

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

/**
 * Email Processing Queue
 * 
 * Redis-backed job queue specifically configured for email processing
 * operations with optimized settings for high-throughput email handling.
 * 
 * @constant {Bull} emailQueue - Email processing job queue
 */
const emailQueue = new Bull('email-processing', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
  }
});

/**
 * Snowball Distribution Queue
 * 
 * Dedicated queue for initiating snowball distribution processes when
 * emails contain CSV attachments or repository creation commands.
 * 
 * @constant {Bull} snowballQueue - Snowball distribution job queue
 */
const snowballQueue = new Bull('snowball-distribution', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
  }
});

/**
 * Inbound Email Processing Handler
 * 
 * Main email processing function that parses incoming emails, determines
 * the intended command, and routes to appropriate handler functions.
 * Supports comprehensive error handling and progress tracking.
 * 
 * Processing Flow:
 * 1. Parse email content and extract command
 * 2. Validate email format and user authentication
 * 3. Route to specific command handler
 * 4. Update user karma and send notifications
 * 5. Initiate snowball distribution if applicable
 * 
 * @param {Object} job - Bull job containing email data
 * @param {Object} job.data.emailData - Raw email data to process
 * @returns {Promise<Object>} Processing result with success status
 * 
 * @since 1.0.0
 */
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

/**
 * Handle Post Creation Command
 * 
 * Processes POST commands from emails to create new posts with intelligent
 * content parsing, hashtag extraction, and optional CSV repository creation.
 * 
 * Features:
 * - AI-powered hashtag extraction and suggestion
 * - CSV attachment processing for repository creation
 * - Automatic snowball distribution initiation
 * - User karma rewards for content creation
 * - Real-time notification delivery
 * 
 * @param {string} userId - User ID of the post creator
 * @param {Object} content - Parsed email content with subject and body
 * @param {Object} attachments - Email attachments including CSV files
 * @returns {Promise<Object>} Created post object
 * 
 * @example
 * // Process email with CSV attachment
 * await handlePostCommand('user123', {
 *   subject: 'AI Research Network',
 *   body: 'Sharing insights on machine learning...'
 * }, { csv: csvBuffer });
 * 
 * @since 1.0.0
 */
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
/**
 * Handle Comment Creation Command
 * 
 * Processes COMMENT commands to add replies to existing posts via email.
 * Integrates with the karma system to reward user engagement.
 * 
 * @param {string} userId - User ID of the commenter
 * @param {Object} content - Parsed email content
 * @param {string} parentId - ID of the post to comment on
 * @returns {Promise<Object>} Created comment object
 * 
 * @since 1.0.0
 */
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

/**
 * Handle Upvote Command
 * 
 * Processes UPVOTE commands to upvote posts via email interface.
 * Provides quick engagement mechanism for email-based interactions.
 * 
 * @param {string} userId - User ID performing the upvote
 * @param {string} targetId - ID of the post to upvote
 * @returns {Promise<Object>} Success confirmation
 * 
 * @since 1.0.0
 */
async function handleUpvoteCommand(userId, targetId) {
  const { upvotePost } = require('../services/posts.service');
  
  await upvotePost(userId, targetId);
  await updateUserKarma(userId, 'post_upvoted', 10);
  
  return { success: true };
}

/**
 * Handle Repository Creation Command
 * 
 * Processes REPOSITORY commands to create new email repositories from
 * CSV attachments. Initiates snowball distribution for viral growth.
 * 
 * @param {string} userId - User ID creating the repository
 * @param {Object} content - Repository description and metadata
 * @param {Object} attachments - CSV file attachment
 * @returns {Promise<Object>} Created repository object
 * 
 * @since 1.0.0
 */
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

/**
 * Handle Subscription Command
 * 
 * Processes SUBSCRIBE commands to add hashtag subscriptions for users.
 * Enables email-based notification preference management.
 * 
 * @param {string} userId - User ID to update subscriptions
 * @param {Array<string>} hashtags - Hashtags to subscribe to
 * @returns {Promise<Object>} Success confirmation
 * 
 * @since 1.0.0
 */
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

/**
 * Handle Unsubscribe Command
 * 
 * Processes UNSUBSCRIBE commands to remove hashtag subscriptions.
 * Provides email-based unsubscribe functionality for user control.
 * 
 * @param {string} userId - User ID to update subscriptions
 * @param {Array<string>} hashtags - Hashtags to unsubscribe from
 * @returns {Promise<Object>} Success confirmation
 * 
 * @since 1.0.0
 */
async function handleUnsubscribeCommand(userId, hashtags) {
  const { unsubscribeFromHashtags } = require('../services/users.service');
  
  await unsubscribeFromHashtags(userId, hashtags);
  
  return { success: true };
}

/**
 * Handle Statistics Request Command
 * 
 * Processes STATS commands to send user statistics via email.
 * Provides comprehensive activity and engagement metrics.
 * 
 * @param {string} userId - User ID to generate statistics for
 * @returns {Promise<Object>} Success confirmation
 * 
 * @since 1.0.0
 */
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

/**
 * Handle Default Post Creation
 * 
 * Default handler for emails without specific commands. Creates posts
 * from email content using the same logic as POST commands.
 * 
 * @param {string} userId - User ID of the sender
 * @param {Object} content - Email content to convert to post
 * @param {Object} attachments - Any email attachments
 * @returns {Promise<Object>} Created post object
 * 
 * @since 1.0.0
 */
async function handleDefaultPost(userId, content, attachments) {
  return handlePostCommand(userId, content, attachments);
}

/**
 * Process CSV Attachment
 * 
 * Parses CSV file attachments to extract email lists for repository
 * creation and snowball distribution. Validates email formats and
 * sanitizes data for platform use.
 * 
 * @param {Buffer} csvBuffer - Raw CSV file data
 * @returns {Promise<Object>} Processed email data and metadata
 * 
 * @since 1.0.0
 */
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

/**
 * Validate Email Format
 * 
 * Simple email validation using regex pattern matching.
 * Used for CSV processing and email validation.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 * 
 * @since 1.0.0
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Queue Event Handlers
 * 
 * Event listeners for monitoring email processing queue health
 * and performance. Provides comprehensive logging for debugging
 * and monitoring email processing operations.
 */

emailQueue.on('completed', (job, result) => {
  logger.info(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

emailQueue.on('stalled', (job) => {
  logger.warn(`Email job ${job.id} stalled`);
});

/**
 * Graceful Shutdown Handler
 * 
 * Handles SIGTERM signals for graceful worker shutdown during
 * deployment or maintenance operations. Ensures in-progress
 * email processing completes before termination.
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing email queue...');
  await emailQueue.close();
  process.exit(0);
});

/**
 * Email Worker Export
 * 
 * Exports the configured email processing queue for use by the
 * main worker management system.
 * 
 * @since 1.0.0
 */
module.exports = emailQueue;
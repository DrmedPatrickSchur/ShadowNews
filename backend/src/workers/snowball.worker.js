/**
 * @fileoverview Snowball Distribution Worker
 * 
 * Advanced viral growth worker implementing snowball distribution algorithms
 * for exponential email list expansion. Processes CSV uploads, validates email
 * quality, manages network growth, and orchestrates multi-level distribution
 * to achieve viral repository growth across the ShadowNews platform.
 * 
 * The snowball effect enables organic list growth by leveraging existing
 * member networks, applying quality filters, and managing recursive
 * distribution depth to ensure sustainable, high-quality growth patterns.
 * 
 * Key Features:
 * - Multi-depth CSV processing with recursive snowball triggering
 * - Advanced email validation and quality scoring algorithms
 * - Domain reputation analysis and spam filtering
 * - Network analysis and growth metrics tracking
 * - Batch processing for high-volume email operations
 * - Automated email verification with retry mechanisms
 * - Repository owner notifications and growth analytics
 * - Redis-based caching for performance optimization
 * 
 * Snowball Process Flow:
 * 1. CSV Processing: Parse and validate uploaded contact lists
 * 2. Quality Scoring: Apply multi-factor quality assessment
 * 3. Batch Addition: Add approved emails to repository
 * 4. Verification: Async email address verification
 * 5. Network Analysis: Calculate reach and engagement metrics
 * 6. Recursive Trigger: Initiate next-level snowball if depth allows
 * 7. Notification: Update repository owner with growth statistics
 * 
 * Job Types:
 * - PROCESS_CSV: Main snowball processing for contact expansion
 * - VERIFY_EMAIL: Individual email address verification
 * - ANALYZE_NETWORK: Repository network analysis and metrics
 * 
 * Configuration:
 * - BATCH_SIZE: 100 emails per processing batch
 * - MAX_DEPTH: 3 levels of recursive snowball distribution
 * - QUALITY_THRESHOLD: 0.7 minimum score for email approval
 * 
 * Dependencies:
 * - bull: Job queue management for reliable background processing
 * - Repository/Email/User models: Data persistence and relationships
 * - csvService: CSV parsing and validation utilities
 * - emailService: Email verification and delivery
 * - snowballService: Network analysis and domain reputation
 * - Redis: Caching for performance optimization
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Bull queue management library for reliable background job processing
const Bull = require('bull');

// Database models for snowball distribution operations
const { Repository, Email, User } = require('../models');

// Service dependencies for snowball functionality
const csvService = require('../services/csv.service');
const emailService = require('../services/email.service');
const snowballService = require('../services/snowball.service');

// Centralized logging utility for snowball operations tracking
const logger = require('../utils/logger');

// Redis client for caching and performance optimization
const { redis } = require('../utils/redis');

/**
 * Snowball Job Queue Configuration
 * 
 * Bull queue instance configured for high-throughput snowball processing
 * with Redis backend for reliable job persistence and retry handling.
 */
const snowballQueue = new Bull('snowball-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

/**
 * Snowball Configuration Constants
 * 
 * Configurable parameters for snowball distribution behavior,
 * quality control, and performance optimization.
 */
const BATCH_SIZE = 100; // Maximum emails processed per batch operation
const MAX_DEPTH = 3; // Maximum recursive snowball depth for viral growth
const QUALITY_THRESHOLD = 0.7; // Minimum quality score for email approval

/**
 * CSV Processing Job Handler
 * 
 * Main snowball distribution processor that handles CSV uploads and orchestrates
 * the complete viral growth cycle including validation, quality scoring, batch
 * processing, and recursive snowball triggering for exponential growth.
 * 
 * Process Flow:
 * 1. Parse and validate uploaded CSV email data
 * 2. Filter existing emails to avoid duplicates
 * 3. Calculate quality scores using multi-factor algorithm
 * 4. Process approved emails in batches with verification
 * 5. Trigger next-level snowball if depth limit not reached
 * 6. Update repository statistics and notify owner
 * 
 * Quality Factors:
 * - Domain reputation and trust level
 * - Source verification status
 * - Spam pattern detection
 * - Blacklist and blocklist filtering
 * 
 * @param {Object} job - Bull job object containing snowball parameters
 * @param {string} job.data.repositoryId - Target repository for email expansion
 * @param {string} job.data.csvData - CSV content with email addresses
 * @param {string} job.data.userId - User initiating the snowball process
 * @param {number} job.data.depth - Current snowball depth level (default: 0)
 * @returns {Promise<Object>} Processing result with statistics
 * 
 * @since 1.0.0
 */

snowballQueue.process('process-csv', async (job) => {
  const { repositoryId, csvData, userId, depth = 0 } = job.data;

  try {
    logger.info(`Processing snowball CSV for repository ${repositoryId}, depth ${depth}`);

    // Validate repository existence and access
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      throw new Error('Repository not found');
    }

    // Parse CSV data and validate email format/quality
    const parsedEmails = await csvService.parseEmailList(csvData);
    const validEmails = await validateEmails(parsedEmails, repository);
    
    // Filter out emails already in repository to avoid duplicates
    const newEmails = await filterExistingEmails(validEmails, repositoryId);
    
    // Calculate quality scores for intelligent filtering
    const qualityScores = await calculateQualityScores(newEmails, repository);
    
    // Apply quality threshold to ensure high-value additions
    const approvedEmails = newEmails.filter((email, index) => 
      qualityScores[index] >= QUALITY_THRESHOLD
    );

    // Process approved emails in batches for database efficiency
    await processEmailBatch(approvedEmails, repository, userId);

    // Trigger recursive snowball if depth limit not reached
    if (depth < MAX_DEPTH) {
      await triggerNextSnowball(approvedEmails, repository, depth + 1);
    }

    // Update repository statistics with new growth metrics
    await updateRepositoryStats(repository, approvedEmails.length);

    // Notify repository owner of snowball results
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

/**
 * Email Verification Job Handler
 * 
 * Asynchronous email address verification processor that validates individual
 * email addresses for deliverability and updates their verification status
 * in the database. Uses external verification services for accuracy.
 * 
 * Verification Process:
 * 1. Perform external email deliverability check
 * 2. Update email record with verification result
 * 3. Set appropriate status flags for future processing
 * 
 * @param {Object} job - Bull job object containing verification parameters
 * @param {string} job.data.email - Email address to verify
 * @param {string} job.data.repositoryId - Repository context for the email
 * @returns {Promise<Object>} Verification result with email and validity status
 * 
 * @since 1.0.0
 */
snowballQueue.process('verify-email', async (job) => {
  const { email, repositoryId } = job.data;

  try {
    // Perform external email verification check
    const isValid = await emailService.verifyEmail(email);
    
    if (isValid) {
      // Mark email as verified and active
      await Email.findOneAndUpdate(
        { email, repository: repositoryId },
        { 
          verified: true, 
          verifiedAt: new Date(),
          status: 'active'
        }
      );
    } else {
      // Mark email as invalid for future filtering
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

/**
 * Network Analysis Job Handler
 * 
 * Comprehensive repository network analysis processor that calculates
 * growth metrics, engagement patterns, and viral distribution effectiveness.
 * Results are cached for performance and used for growth optimization.
 * 
 * Analysis Components:
 * - Total network reach calculation
 * - Average engagement metrics
 * - Top contributor identification
 * - Growth rate analysis over time
 * 
 * @param {Object} job - Bull job object containing analysis parameters
 * @param {string} job.data.repositoryId - Repository to analyze
 * @returns {Promise<Object>} Network analysis results with growth metrics
 * 
 * @since 1.0.0
 */
snowballQueue.process('analyze-network', async (job) => {
  const { repositoryId } = job.data;

  try {
    // Load repository with populated email relationships
    const repository = await Repository.findById(repositoryId)
      .populate('emails');

    // Perform comprehensive network analysis
    const networkAnalysis = await snowballService.analyzeNetwork(repository);
    
    // Update repository with calculated network statistics
    await Repository.findByIdAndUpdate(repositoryId, {
      networkStats: {
        totalReach: networkAnalysis.totalReach,
        avgEngagement: networkAnalysis.avgEngagement,
        topContributors: networkAnalysis.topContributors,
        growthRate: networkAnalysis.growthRate,
        lastAnalyzed: new Date()
      }
    });

    // Cache analysis results for performance optimization
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
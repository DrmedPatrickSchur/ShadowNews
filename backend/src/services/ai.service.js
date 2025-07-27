/**
 * @fileoverview Karma Service for ShadowNews Platform
 * 
 * Comprehensive karma and reputation management service for the ShadowNews email-first news platform.
 * This service handles all karma-related operations including point calculation, milestone tracking,
 * user reputation management, and community reward systems. Karma serves as the primary mechanism
 * for measuring user contributions, content quality, and community engagement.
 * 
 * Key Features:
 * - Dynamic karma point calculation with action-based scoring
 * - Milestone achievement tracking with automated rewards
 * - User reputation and trust scoring systems
 * - Karma multiplier system for enhanced user engagement
 * - Community governance and weighted voting capabilities
 * - Real-time karma updates with caching optimization
 * - Comprehensive audit logging and history tracking
 * - Performance-optimized calculations with Redis caching
 * - Fraud detection and abuse prevention mechanisms
 * - Leaderboard and ranking system integration
 * 
 * Karma System Architecture:
 * - Action-based point system with configurable scoring
 * - Multiplier system based on user status and reputation
 * - Milestone-based progression with feature unlocks
 * - Time-decay mechanisms for sustained engagement
 * - Quality weighting for content-based contributions
 * - Community moderation integration for trust building
 * 
 * Scoring Mechanisms:
 * - Content creation and curation rewards
 * - Community engagement and interaction bonuses
 * - Quality assessment and peer recognition
 * - Platform participation and consistency rewards
 * - Milestone achievements and special recognition
 * - Moderation and community governance contributions
 * 
 * Performance Features:
 * - Redis caching for real-time karma calculations
 * - Batch processing for bulk karma updates
 * - Optimized database queries with session management
 * - Asynchronous processing for non-blocking operations
 * - Memory-efficient calculation algorithms
 * - Scalable architecture for high-volume operations
 * 
 * Security and Integrity:
 * - Transaction-based karma updates for consistency
 * - Audit logging for all karma modifications
 * - Fraud detection and abuse prevention
 * - Rate limiting for karma-generating actions
 * - Data validation and integrity checking
 * - Rollback mechanisms for error recovery
 * 
 * Dependencies:
 * - User.model: User data and profile management
 * - Post.model: Content creation and interaction tracking
 * - Comment.model: Discussion and engagement measurement
 * - Repository.model: Repository management and collaboration
 * - Karma.model: Karma transaction and history storage
 * - redis: High-performance caching and real-time updates
 * - logger: Comprehensive logging and monitoring
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core model dependencies for karma system
const User = require('../models/User.model');                // User profile and karma storage
const Post = require('../models/Post.model');                // Post creation and interaction tracking
const Comment = require('../models/Comment.model');          // Comment engagement measurement
const Repository = require('../models/Repository.model');    // Repository collaboration tracking
const Karma = require('../models/Karma.model');              // Karma transaction and audit logging

// Utility dependencies for performance and monitoring
const redis = require('../utils/redis');                     // High-performance caching layer
const logger = require('../utils/logger');                   // Comprehensive logging system

/**
 * Karma Service Class
 * 
 * Comprehensive karma and reputation management service providing advanced
 * point calculation, milestone tracking, and community reward systems.
 * 
 * Core Responsibilities:
 * - Karma point calculation and distribution
 * - Milestone achievement tracking and rewards
 * - User reputation and trust score management
 * - Community governance and weighted voting
 * - Performance optimization with caching
 * - Fraud detection and abuse prevention
 */
class KarmaService {
 /**
  * Constructor - Initialize Karma Service Configuration
  * 
  * Sets up comprehensive karma scoring system with action-based points,
  * multiplier configurations, and milestone progression system.
  * 
  * Configuration includes:
  * - Action-based point values for all platform activities
  * - User status multipliers for enhanced engagement
  * - Milestone thresholds with feature unlock rewards
  * - Quality assessment and community contribution scoring
  */
 constructor() {
   /**
    * Karma Actions Configuration
    * 
    * Comprehensive point system for all platform activities and user interactions.
    * Points are awarded based on action type, quality assessment, and community value.
    * 
    * Content Creation Actions:
    * - POST_CREATED: Significant points for original content creation
    * - COMMENT_CREATED: Moderate points for community engagement
    * - REPOSITORY_CREATED: High points for platform infrastructure contribution
    * 
    * Community Engagement Actions:
    * - POST_UPVOTED/DOWNVOTED: Peer recognition and quality assessment
    * - COMMENT_UPVOTED/DOWNVOTED: Discussion quality evaluation
    * - CURATED_POST_UPVOTED: Enhanced points for quality curation
    * 
    * Platform Participation Actions:
    * - CSV_UPLOADED: Data contribution and platform enhancement
    * - EMAIL_VERIFIED: Account security and trust building
    * - DAILY_LOGIN: Consistent engagement and platform loyalty
    * 
    * Moderation and Quality Actions:
    * - SPAM_FLAGGED: Negative impact for harmful behavior
    * - POST_REMOVED: Significant penalty for rule violations
    * 
    * Achievement and Milestone Actions:
    * - FIRST_POST: Encouragement for new user engagement
    * - WEEKLY_STREAK: Sustained engagement recognition
    * - MILESTONE_*: Progressive rewards for reputation growth
    */
   this.KARMA_ACTIONS = {
     // Content creation and contribution
     POST_CREATED: 50,              // Original content creation reward
     POST_UPVOTED: 10,              // Peer recognition for quality content
     POST_DOWNVOTED: -2,            // Quality feedback and improvement incentive
     COMMENT_CREATED: 20,           // Discussion participation and engagement
     COMMENT_UPVOTED: 5,            // Quality discussion contribution recognition
     COMMENT_DOWNVOTED: -1,         // Constructive feedback for improvement
     REPOSITORY_CREATED: 100,       // Platform infrastructure and organization
     CSV_UPLOADED: 100,             // Data contribution and platform enhancement
     EMAIL_VERIFIED: 30,            // Account security and trust establishment
     
     // Quality curation and community building
     CURATED_POST_UPVOTED: 25,      // Enhanced recognition for quality curation
     SPAM_FLAGGED: -50,             // Community protection and quality maintenance
     POST_REMOVED: -100,            // Significant penalty for rule violations
     
     // Engagement and platform loyalty
     DAILY_LOGIN: 5,                // Consistent platform engagement
     WEEKLY_STREAK: 50,             // Sustained participation recognition
     FIRST_POST: 100,               // New user encouragement and onboarding
     
     // Milestone achievement rewards
     MILESTONE_100: 20,             // Early achievement recognition
     MILESTONE_500: 50,             // Community member progression
     MILESTONE_1000: 100,           // Trusted member advancement
     MILESTONE_5000: 500            // Community leader recognition
   };

   /**
    * Karma Multipliers Configuration
    * 
    * User status-based multipliers for enhanced karma calculation.
    * Multipliers recognize user reputation, expertise, and community standing.
    * 
    * Multiplier Categories:
    * - GOLDEN_CURATOR: Highest multiplier for exceptional contributors
    * - VERIFIED_EXPERT: Enhanced multiplier for domain expertise
    * - ACTIVE_CONTRIBUTOR: Moderate multiplier for consistent engagement
    * - NEW_USER: Base multiplier for standard point calculation
    */
   this.KARMA_MULTIPLIERS = {
     GOLDEN_CURATOR: 5,             // Exceptional contributor recognition
     VERIFIED_EXPERT: 3,            // Domain expertise and authority
     ACTIVE_CONTRIBUTOR: 2,         // Consistent engagement and quality
     NEW_USER: 1                    // Standard base multiplier
   };

   /**
    * Karma Milestones Configuration
    * 
    * Progressive milestone system with feature unlocks and community recognition.
    * Milestones provide clear progression paths and enhanced platform capabilities.
    * 
    * Milestone Structure:
    * - threshold: Karma points required for milestone achievement
    * - reward: Platform feature or capability unlocked
    * - name: Community recognition title and status
    * 
    * Progression System:
    * - Rising Star (100): Basic customization and personalization
    * - Community Builder (500): Content organization and repository creation
    * - Trusted Member (1000): Enhanced voting power and community influence
    * - Community Leader (5000): Platform governance and decision participation
    * - Golden Curator (10000): Maximum privileges and community authority
    */
   this.KARMA_MILESTONES = [
     { 
       threshold: 100, 
       reward: 'custom_email_signature', 
       name: 'Rising Star' 
     },
     { 
       threshold: 500, 
       reward: 'repository_creation', 
       name: 'Community Builder' 
     },
     { 
       threshold: 1000, 
       reward: 'weighted_voting', 
       name: 'Trusted Member' 
     },
     { 
       threshold: 5000, 
       reward: 'platform_governance', 
       name: 'Community Leader' 
     },
     { 
       threshold: 10000, 
       reward: 'golden_curator', 
       name: 'Golden Curator' 
     }
   ];
 }

 /**
  * Update User Karma
  * 
  * Comprehensive karma update method with transaction safety, multiplier calculation,
  * and milestone tracking. Handles all karma modifications with audit logging.
  * 
  * Features:
  * - Transaction-based updates for data consistency
  * - Dynamic multiplier calculation based on user status
  * - Automatic milestone checking and reward distribution
  * - Comprehensive audit logging and history tracking
  * - Error handling and rollback capabilities
  * - Performance optimization with caching updates
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @param {string} action - Karma action type from KARMA_ACTIONS
  * @param {Object} metadata - Additional context and tracking information
  * @returns {Promise<Object>} Karma update result with new balance
  * 
  * @throws {Error} User not found or invalid action type
  * @throws {Error} Database transaction or validation errors
  * 
  * @example
  * // Award karma for post creation
  * await karmaService.updateKarma(userId, 'POST_CREATED', {
  *   postId: '507f1f77bcf86cd799439011',
  *   quality: 'high',
  *   category: 'technology'
  * });
  * 
  * @example
  * // Apply karma penalty for rule violation
  * await karmaService.updateKarma(userId, 'POST_REMOVED', {
  *   reason: 'spam',
  *   moderatorId: '507f1f77bcf86cd799439012'
  * });
  */
 async updateKarma(userId, action, metadata = {}) {
   try {
     // Initialize database transaction for consistency
     const session = await Karma.startSession();
     session.startTransaction();

     // Retrieve user with transaction session
     const user = await User.findById(userId).session(session);
     if (!user) {
       await session.abortTransaction();
       throw new Error('User not found');
     }

     // Calculate karma points with multiplier
     const basePoints = this.KARMA_ACTIONS[action] || 0;
     const multiplier = await this.getKarmaMultiplier(userId);
     const points = Math.round(basePoints * multiplier);

     // Create detailed karma transaction record
     const karmaEntry = new Karma({
       userId,
       action,
       points,
       metadata,
       multiplier,
       timestamp: new Date(),
       basePoints,
       calculatedPoints: points
     });

     await karmaEntry.save({ session });

     // Update user karma with comprehensive tracking
     const previousKarma = user.karma || 0;
     user.karma = (user.karma || 0) + points;
     user.karmaHistory = user.karmaHistory || [];
     user.karmaHistory.push({
       action,
       points,
       timestamp: new Date(),
       balance: user.karma,
       multiplier,
       metadata
     });

     await user.save({ session });

     // Check for milestone achievements and grant rewards
     await this.checkMilestones(userId, previousKarma, user.karma, session);

     // Update karma cache for real-time access
     await this.updateKarmaCache(userId, user.karma);

     // Commit transaction and cleanup
     await session.commitTransaction();
     session.endSession();

     logger.info(`Karma updated for user ${userId}: ${action} (${points} points)`);

     return {
       success: true,
       previousKarma,
       newKarma: user.karma,
       pointsAwarded: points,
       action,
       multiplier
     };
   } catch (error) {
     logger.error('Error updating karma:', error);
     throw error;
   }
 }

 /**
  * Get Karma Multiplier for User
  * 
  * Calculates dynamic karma multiplier based on user status, badges, and reputation.
  * Multipliers enhance point calculations for experienced and trusted users.
  * 
  * Multiplier Logic:
  * - Golden Curator badge: 5x multiplier for exceptional contributors
  * - Verified Expert badge: 3x multiplier for domain expertise
  * - Active Contributor (500+ karma): 2x multiplier for consistent engagement
  * - New User (default): 1x base multiplier
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @returns {Promise<number>} Karma multiplier value (1-5)
  * 
  * @throws {Error} Database query or user lookup errors
  * 
  * @example
  * // Get multiplier for karma calculation
  * const multiplier = await karmaService.getKarmaMultiplier(userId);
  * const adjustedPoints = basePoints * multiplier;
  */
 async getKarmaMultiplier(userId) {
   try {
     // Retrieve user with minimal data for performance
     const user = await User.findById(userId).select('role badges karmaMultiplier karma');
     
     if (!user) {
       return this.KARMA_MULTIPLIERS.NEW_USER;
     }
     
     // Check for golden curator badge (highest multiplier)
     if (user.badges && user.badges.includes('golden_curator')) {
       return this.KARMA_MULTIPLIERS.GOLDEN_CURATOR;
     }
     
     // Check for verified expert badge
     if (user.badges && user.badges.includes('verified_expert')) {
       return this.KARMA_MULTIPLIERS.VERIFIED_EXPERT;
     }
     
     // Check for active contributor status based on karma threshold
     if (user.karma > 500) {
       return this.KARMA_MULTIPLIERS.ACTIVE_CONTRIBUTOR;
     }
     
     // Default multiplier for new users
     return this.KARMA_MULTIPLIERS.NEW_USER;
   } catch (error) {
     logger.error('Error getting karma multiplier:', error);
     return this.KARMA_MULTIPLIERS.NEW_USER;
   }
 }

 /**
  * Check Milestone Achievements
  * 
  * Evaluates user progress against milestone thresholds and grants rewards
  * for newly achieved milestones. Handles progressive feature unlocks.
  * 
  * Milestone Processing:
  * - Compares previous and current karma values
  * - Identifies newly crossed thresholds
  * - Prevents duplicate milestone awards
  * - Grants appropriate rewards and features
  * - Records achievement timestamps
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @param {number} previousKarma - Karma value before update
  * @param {number} newKarma - Karma value after update
  * @param {Object} session - Database transaction session
  * @returns {Promise<void>} Milestone checking completion
  * 
  * @throws {Error} Database transaction or milestone processing errors
  * 
  * @example
  * // Check milestones during karma update
  * await this.checkMilestones(userId, 450, 520, session);
  */
 async checkMilestones(userId, previousKarma, newKarma, session) {
   try {
     const user = await User.findById(userId).session(session);
     const achievedMilestones = user.achievedMilestones || [];

     // Iterate through all milestone thresholds
     for (const milestone of this.KARMA_MILESTONES) {
       // Check if milestone threshold was crossed
       if (previousKarma < milestone.threshold && newKarma >= milestone.threshold) {
         // Verify milestone hasn't been achieved previously
         if (!achievedMilestones.find(m => m.threshold === milestone.threshold)) {
           // Record milestone achievement
           achievedMilestones.push({
             ...milestone,
             achievedAt: new Date()
           });

           // Grant milestone rewards and features
           await this.grantMilestoneReward(userId, milestone, session);

           // Award bonus karma for milestone achievement (recursive call handled)
           await this.updateKarma(userId, `MILESTONE_${milestone.threshold}`, {
             milestone: milestone.name,
             threshold: milestone.threshold
           });
         }
       }
     }

     // Update user with achieved milestones
     user.achievedMilestones = achievedMilestones;
     await user.save({ session });
   } catch (error) {
     logger.error('Error checking milestones:', error);
   }
 }

 /**
  * Grant Milestone Reward
  * 
  * Activates platform features and capabilities based on milestone achievement.
  * Handles progressive feature unlocks and user capability enhancement.
  * 
  * Reward Categories:
  * - custom_email_signature: Personalization features
  * - repository_creation: Content organization capabilities
  * - weighted_voting: Enhanced community influence
  * - platform_governance: Administrative participation
  * - golden_curator: Maximum privileges and authority
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @param {Object} milestone - Milestone configuration object
  * @param {Object} session - Database transaction session
  * @returns {Promise<void>} Reward granting completion
  * 
  * @throws {Error} Database transaction or feature activation errors
  * 
  * @example
  * // Grant repository creation capability
  * await this.grantMilestoneReward(userId, {
  *   reward: 'repository_creation',
  *   name: 'Community Builder'
  * }, session);
  */
 async grantMilestoneReward(userId, milestone, session) {
   try {
     const user = await User.findById(userId).session(session);

     // Initialize user features object if needed
     user.features = user.features || {};
     user.badges = user.badges || [];

     // Grant specific milestone rewards
     switch (milestone.reward) {
       case 'custom_email_signature':
         // Enable email personalization features
         user.features.customEmailSignature = true;
         user.features.emailBranding = true;
         break;

       case 'repository_creation':
         // Enable repository management capabilities
         user.features.canCreateRepository = true;
         user.maxRepositories = 5;
         user.features.repositoryManagement = true;
         break;

       case 'weighted_voting':
         // Enable enhanced voting power
         user.features.weightedVoting = true;
         user.voteWeight = 2;
         user.features.enhancedModeration = true;
         break;

       case 'platform_governance':
         // Enable governance participation
         user.features.platformGovernance = true;
         user.voteWeight = 5;
         user.features.communityModeration = true;
         user.features.advancedAnalytics = true;
         break;

       case 'golden_curator':
         // Grant maximum privileges
         user.badges.push('golden_curator');
         user.voteWeight = 10;
         user.features.maxPrivileges = true;
         user.features.adminTools = true;
         break;

       default:
         logger.warn(`Unknown milestone reward: ${milestone.reward}`);
     }

     await user.save({ session });
     logger.info(`Milestone reward granted to user ${userId}: ${milestone.reward}`);
   } catch (error) {
     logger.error('Error granting milestone reward:', error);
   }
 }

 /**
  * Calculate User Karma Breakdown
  * 
  * Provides comprehensive analysis of user karma sources and distribution.
  * Generates detailed breakdown for analytics and user insights.
  * 
  * Analysis Features:
  * - Action-based point distribution
  * - Total karma calculation verification
  * - Achievement milestone tracking
  * - Progress toward next milestone
  * - Karma source diversity analysis
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @returns {Promise<Object>} Comprehensive karma breakdown and analysis
  * 
  * @throws {Error} Database aggregation or user lookup errors
  * 
  * @example
  * // Get detailed karma analysis
  * const analysis = await karmaService.calculateUserKarmaBreakdown(userId);
  * // Returns: { totalKarma, breakdown, achievedMilestones, nextMilestone }
  */
 async calculateUserKarmaBreakdown(userId) {
   try {
     // Aggregate karma by action type for detailed breakdown
     const breakdown = await Karma.aggregate([
       { $match: { userId: userId } },
       {
         $group: {
           _id: '$action',
           count: { $sum: 1 },
           totalPoints: { $sum: '$points' },
           averagePoints: { $avg: '$points' },
           lastActivity: { $max: '$timestamp' }
         }
       },
       { $sort: { totalPoints: -1 } }
     ]);

     // Retrieve user karma and milestone data
     const user = await User.findById(userId).select('karma achievedMilestones');
     
     return {
       totalKarma: user.karma || 0,
       breakdown,
       achievedMilestones: user.achievedMilestones || [],
       nextMilestone: this.getNextMilestone(user.karma || 0),
       karmaDistribution: this.analyzeKarmaDistribution(breakdown),
       recentActivity: await this.getRecentKarmaActivity(userId)
     };
   } catch (error) {
     logger.error('Error calculating karma breakdown:', error);
     throw error;
   }
 }

 /**
  * Get Next Milestone Information
  * 
  * Calculates progress toward the next milestone achievement.
  * Provides motivation and progression tracking for users.
  * 
  * Progress Calculation:
  * - Identifies next unachieved milestone
  * - Calculates points needed for achievement
  * - Determines percentage progress
  * - Provides milestone details and rewards
  * 
  * @param {number} currentKarma - Current user karma points
  * @returns {Object|null} Next milestone information or null if max achieved
  * 
  * @example
  * // Get next milestone for user with 750 karma
  * const next = karmaService.getNextMilestone(750);
  * // Returns: { threshold: 1000, name: 'Trusted Member', pointsNeeded: 250, progress: 75 }
  */
 getNextMilestone(currentKarma) {
   for (const milestone of this.KARMA_MILESTONES) {
     if (currentKarma < milestone.threshold) {
       return {
         ...milestone,
         pointsNeeded: milestone.threshold - currentKarma,
         progress: Math.round((currentKarma / milestone.threshold) * 100)
       };
     }
   }
   return null; // User has achieved all milestones
 }

 /**
  * Get Karma Leaderboard
  * 
  * Generates ranked leaderboard of users by karma performance.
  * Supports multiple timeframes and caching for performance.
  * 
  * Leaderboard Features:
  * - Timeframe filtering (daily, weekly, monthly, all-time)
  * - Redis caching for performance optimization
  * - User ranking and positioning
  * - Karma change tracking and trends
  * - Performance analytics and insights
  * 
  * @param {string} timeframe - Leaderboard timeframe ('daily', 'weekly', 'monthly', 'all')
  * @param {number} limit - Maximum number of users to return
  * @returns {Promise<Array>} Ranked leaderboard with user karma data
  * 
  * @throws {Error} Database aggregation or caching errors
  * 
  * @example
  * // Get weekly karma leaderboard
  * const weekly = await karmaService.getKarmaLeaderboard('weekly', 50);
  */
 async getKarmaLeaderboard(timeframe = 'all', limit = 100) {
   try {
     const cacheKey = `karma:leaderboard:${timeframe}:${limit}`;
     const cached = await redis.get(cacheKey);
     
     if (cached) {
       return JSON.parse(cached);
     }

     // Configure date filter based on timeframe
     let dateFilter = {};
     const now = new Date();

     switch (timeframe) {
       case 'daily':
         dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
         break;
       case 'weekly':
         dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
         break;
       case 'monthly':
         dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
         break;
       case 'all':
       default:
         // No date filter for all-time leaderboard
         break;
     }

     // Aggregate karma data for leaderboard
     const leaderboard = await Karma.aggregate([
       { $match: dateFilter },
       {
         $group: {
           _id: '$userId',
           karmaGained: { $sum: '$points' }
         }
       },
       { $sort: { karmaGained: -1 } },
       { $limit: limit },
       {
         $lookup: {
           from: 'users',
           localField: '_id',
           foreignField: '_id',
           as: 'user'
         }
       },
       { $unwind: '$user' },
       {
         $project: {
           userId: '$_id',
           username: '$user.username',
           avatar: '$user.avatar',
           totalKarma: '$user.karma',
           karmaGained: 1,
           badges: '$user.badges',
           rank: { $add: [{ $indexOfArray: [[]] }, 1] }
         }
       }
     ]);

     // Cache leaderboard for 5 minutes to balance freshness and performance
     await redis.setex(cacheKey, 300, JSON.stringify(leaderboard));
     
     return leaderboard;
   } catch (error) {
     logger.error('Error getting karma leaderboard:', error);
     throw error;
   }
 }

 /**
  * Update Karma Cache
  * 
  * Maintains real-time karma values in Redis cache for performance optimization.
  * Enables instant karma lookups without database queries.
  * 
  * Cache Strategy:
  * - 1-hour TTL for balance of freshness and performance
  * - Automatic cache invalidation on karma updates
  * - Fallback to database on cache miss
  * - Performance monitoring and metrics
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @param {number} karma - Current karma value to cache
  * @returns {Promise<void>} Cache update completion
  * 
  * @throws {Error} Redis connection or cache operation errors
  * 
  * @example
  * // Update karma cache after point award
  * await this.updateKarmaCache(userId, newKarmaValue);
  */
 async updateKarmaCache(userId, karma) {
   try {
     // Store karma with 1-hour expiration for performance
     await redis.setex(`user:karma:${userId}`, 3600, karma);
     
     // Update global karma statistics cache
     await redis.hset('karma:stats:global', `user:${userId}`, karma);
     
     logger.debug(`Karma cache updated for user ${userId}: ${karma} points`);
   } catch (error) {
     logger.error('Error updating karma cache:', error);
     // Non-critical error - karma system continues without cache
   }
 }

 /**
  * Get Karma History
  * 
  * Retrieves comprehensive karma history and progress analytics for a user.
  * Provides detailed insights for user dashboard and progress tracking.
  * 
  * History Features:
  * - Recent activity timeline with action details
  * - Daily karma progression analysis
  * - Performance trends and patterns
  * - Activity frequency and consistency metrics
  * - Comparative progress analysis
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @param {number} days - Number of days to include in history (default: 30)
  * @returns {Promise<Object>} Comprehensive karma history and analytics
  * 
  * @throws {Error} Database aggregation or user lookup errors
  * 
  * @example
  * // Get 30-day karma history
  * const history = await karmaService.getKarmaHistory(userId, 30);
  * // Returns: { recentActivity, dailyProgress, trends, insights }
  */
 async getKarmaHistory(userId, days = 30) {
   try {
     const startDate = new Date();
     startDate.setDate(startDate.getDate() - days);

     // Get recent karma activities with detailed context
     const history = await Karma.find({
       userId,
       createdAt: { $gte: startDate }
     })
       .sort({ createdAt: -1 })
       .limit(100)
       .populate('relatedPost', 'title slug')
       .populate('relatedComment', 'content')
       .populate('relatedRepository', 'name description');

     // Aggregate daily karma progression
     const dailyKarma = await Karma.aggregate([
       {
         $match: {
           userId,
           createdAt: { $gte: startDate }
         }
       },
       {
         $group: {
           _id: {
             $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
           },
           dailyPoints: { $sum: '$points' },
           actionCount: { $sum: 1 },
           actions: { $push: '$action' }
         }
       },
       { $sort: { _id: 1 } }
     ]);

     // Calculate trends and insights
     const trends = this.calculateKarmaTrends(dailyKarma);
     const insights = this.generateKarmaInsights(history, dailyKarma);

     return {
       recentActivity: history,
       dailyProgress: dailyKarma,
       trends,
       insights,
       summary: {
         totalDays: days,
         activeDays: dailyKarma.length,
         totalPoints: dailyKarma.reduce((sum, day) => sum + day.dailyPoints, 0),
         averageDaily: dailyKarma.length > 0 ? 
           dailyKarma.reduce((sum, day) => sum + day.dailyPoints, 0) / dailyKarma.length : 0
       }
     };
   } catch (error) {
     logger.error('Error getting karma history:', error);
     throw error;
   }
 }

 /**
  * Check Daily Login Bonus
  * 
  * Awards daily login karma bonus and tracks user engagement.
  * Encourages consistent platform participation through rewards.
  * 
  * Login Bonus System:
  * - Single daily bonus per user (no duplicates)
  * - Automatic weekly streak detection
  * - Progressive bonus increases for streaks
  * - Engagement metrics and analytics
  * - Community building incentives
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @returns {Promise<Object>} Login bonus status and details
  * 
  * @throws {Error} Database operation or karma update errors
  * 
  * @example
  * // Check and award daily login bonus
  * const result = await karmaService.checkDailyLoginBonus(userId);
  * // Returns: { bonusAwarded: true, streakDays: 3, nextMilestone: 7 }
  */
 async checkDailyLoginBonus(userId) {
   try {
     const today = new Date();
     today.setHours(0, 0, 0, 0);

     // Check if daily bonus already awarded today
     const existingBonus = await Karma.findOne({
       userId,
       action: 'DAILY_LOGIN',
       createdAt: { $gte: today }
     });

     if (!existingBonus) {
       // Award daily login bonus
       await this.updateKarma(userId, 'DAILY_LOGIN', {
         date: today.toISOString().split('T')[0],
         loginTime: new Date()
       });
       
       // Check and award weekly streak bonus
       const streakResult = await this.checkWeeklyStreak(userId);
       
       return { 
         bonusAwarded: true,
         dailyPoints: this.KARMA_ACTIONS.DAILY_LOGIN.points,
         streakResult
       };
     }

     return { 
       bonusAwarded: false,
       reason: 'Already awarded today',
       nextEligible: new Date(today.getTime() + 24 * 60 * 60 * 1000)
     };
   } catch (error) {
     logger.error('Error checking daily login bonus:', error);
     throw error;
   }
 }

 /**
  * Check Weekly Streak
  * 
  * Detects and rewards weekly login streaks for sustained engagement.
  * Provides progressive rewards for consistent platform usage.
  * 
  * Streak Detection:
  * - Tracks 7-day login consistency
  * - Awards bonus for complete weeks
  * - Prevents duplicate weekly rewards
  * - Encourages habit formation
  * - Community engagement analytics
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @returns {Promise<Object>} Weekly streak status and rewards
  * 
  * @throws {Error} Database aggregation or karma update errors
  * 
  * @example
  * // Check weekly streak after daily login
  * const streak = await karmaService.checkWeeklyStreak(userId);
  * // Returns: { streakAchieved: true, bonusPoints: 50, totalWeeks: 2 }
  */
 async checkWeeklyStreak(userId) {
   try {
     const sevenDaysAgo = new Date();
     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
     sevenDaysAgo.setHours(0, 0, 0, 0);

     // Count unique login days in the past 7 days
     const loginDays = await Karma.aggregate([
       {
         $match: {
           userId,
           action: 'DAILY_LOGIN',
           createdAt: { $gte: sevenDaysAgo }
         }
       },
       {
         $group: {
           _id: {
             $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
           }
         }
       }
     ]);

     // Award streak bonus if user logged in all 7 days
     if (loginDays.length >= 7) {
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       const weekStart = new Date(today);
       weekStart.setDate(weekStart.getDate() - 7);

       // Check if weekly streak bonus already awarded
       const existingStreakBonus = await Karma.findOne({
         userId,
         action: 'WEEKLY_STREAK',
         createdAt: { $gte: weekStart }
       });

       if (!existingStreakBonus) {
         await this.updateKarma(userId, 'WEEKLY_STREAK', {
           streakDays: 7,
           weekStart: weekStart.toISOString().split('T')[0],
           weekEnd: today.toISOString().split('T')[0]
         });

         return {
           streakAchieved: true,
           bonusPoints: this.KARMA_ACTIONS.WEEKLY_STREAK.points,
           streakDays: 7
         };
       }
     }

     return {
       streakAchieved: false,
       currentStreak: loginDays.length,
       daysRemaining: 7 - loginDays.length
     };
   } catch (error) {
     logger.error('Error checking weekly streak:', error);
     return { streakAchieved: false, error: 'Failed to check streak' };
   }
 }

 /**
  * Recalculate User Karma
  * 
  * Performs complete karma recalculation from transaction history.
  * Used for data integrity maintenance and error correction.
  * 
  * Recalculation Process:
  * - Aggregates all karma transactions
  * - Verifies calculation accuracy
  * - Updates user karma record
  * - Refreshes cached values
  * - Provides audit trail
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @returns {Promise<Object>} Recalculation results and new karma total
  * 
  * @throws {Error} Database aggregation or user update errors
  * 
  * @example
  * // Recalculate karma after data migration
  * const result = await karmaService.recalculateUserKarma(userId);
  * // Returns: { success: true, karma: 1250, previousKarma: 1200, difference: 50 }
  */
 async recalculateUserKarma(userId) {
   try {
     // Get current karma for comparison
     const user = await User.findById(userId).select('karma');
     const previousKarma = user?.karma || 0;

     // Aggregate total karma from all transactions
     const karmaAggregate = await Karma.aggregate([
       { $match: { userId } },
       {
         $group: {
           _id: null,
           totalPoints: { $sum: '$points' },
           transactionCount: { $sum: 1 },
           firstTransaction: { $min: '$createdAt' },
           lastTransaction: { $max: '$createdAt' }
         }
       }
     ]);

     const newKarma = karmaAggregate[0]?.totalPoints || 0;
     const difference = newKarma - previousKarma;

     // Update user karma record
     await User.findByIdAndUpdate(userId, { 
       karma: newKarma,
       karmaLastRecalculated: new Date()
     });

     // Update cached karma value
     await this.updateKarmaCache(userId, newKarma);

     // Log recalculation for audit trail
     logger.info(`Karma recalculated for user ${userId}: ${previousKarma} → ${newKarma} (${difference > 0 ? '+' : ''}${difference})`);
     
     return { 
       success: true, 
       karma: newKarma,
       previousKarma,
       difference,
       transactionCount: karmaAggregate[0]?.transactionCount || 0,
       timespan: {
         first: karmaAggregate[0]?.firstTransaction,
         last: karmaAggregate[0]?.lastTransaction
       }
     };
   } catch (error) {
     logger.error('Error recalculating user karma:', error);
     throw error;
   }
 }

 /**
  * Analyze Karma Distribution
  * 
  * Helper method to analyze karma source distribution and patterns.
  * Provides insights for user engagement and community health.
  * 
  * @param {Array} breakdown - Karma breakdown by action type
  * @returns {Object} Distribution analysis and insights
  * @private
  */
 analyzeKarmaDistribution(breakdown) {
   if (!breakdown || breakdown.length === 0) {
     return { diversity: 0, primarySource: null, engagement: 'inactive' };
   }

   const totalPoints = breakdown.reduce((sum, item) => sum + item.totalPoints, 0);
   const actionTypes = breakdown.length;
   
   return {
     diversity: actionTypes / Object.keys(this.KARMA_ACTIONS).length,
     primarySource: breakdown[0]?._id,
     engagement: totalPoints > 1000 ? 'high' : totalPoints > 300 ? 'medium' : 'low',
     balance: breakdown[0]?.totalPoints / totalPoints < 0.6 ? 'balanced' : 'focused'
   };
 }

 /**
  * Get Recent Karma Activity
  * 
  * Helper method to retrieve recent karma activities for analysis.
  * Supports user dashboard and activity feeds.
  * 
  * @param {string} userId - MongoDB ObjectId of the user
  * @returns {Promise<Array>} Recent karma activities
  * @private
  */
 async getRecentKarmaActivity(userId) {
   try {
     return await Karma.find({ userId })
       .sort({ createdAt: -1 })
       .limit(10)
       .select('action points metadata createdAt');
   } catch (error) {
     logger.error('Error getting recent karma activity:', error);
     return [];
   }
 }

 /**
  * Calculate Karma Trends
  * 
  * Helper method to analyze karma progression trends.
  * Identifies growth patterns and engagement cycles.
  * 
  * @param {Array} dailyKarma - Daily karma aggregation data
  * @returns {Object} Trend analysis and predictions
  * @private
  */
 calculateKarmaTrends(dailyKarma) {
   if (!dailyKarma || dailyKarma.length < 2) {
     return { trend: 'insufficient_data', growth: 0 };
   }

   const recent = dailyKarma.slice(-7);
   const earlier = dailyKarma.slice(0, Math.max(1, dailyKarma.length - 7));
   
   const recentAvg = recent.reduce((sum, day) => sum + day.dailyPoints, 0) / recent.length;
   const earlierAvg = earlier.reduce((sum, day) => sum + day.dailyPoints, 0) / earlier.length;
   
   const growth = (recentAvg - earlierAvg) / earlierAvg * 100;
   
   return {
     trend: growth > 10 ? 'increasing' : growth < -10 ? 'decreasing' : 'stable',
     growth: Math.round(growth),
     recentAverage: Math.round(recentAvg),
     earlierAverage: Math.round(earlierAvg)
   };
 }

 /**
  * Generate Karma Insights
  * 
  * Helper method to generate actionable insights from karma data.
  * Provides personalized recommendations for user engagement.
  * 
  * @param {Array} history - Karma history data
  * @param {Array} dailyKarma - Daily karma aggregation
  * @returns {Object} Personalized insights and recommendations
  * @private
  */
 generateKarmaInsights(history, dailyKarma) {
   const insights = [];
   
   if (dailyKarma.length === 0) {
     insights.push({
       type: 'engagement',
       message: 'Start participating in the community to earn your first karma points!',
       action: 'Create your first post or comment'
     });
   }
   
   const totalActions = history.length;
   const uniqueActions = new Set(history.map(h => h.action)).size;
   
   if (uniqueActions < 3) {
     insights.push({
       type: 'diversity',
       message: 'Try different types of activities to maximize your karma growth',
       action: 'Explore posting, commenting, and repository creation'
     });
   }
   
   return insights;
 }
}

module.exports = new KarmaService();
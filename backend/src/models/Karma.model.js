/**
 * @fileoverview Karma Model for ShadowNews Platform
 * 
 * Comprehensive karma/reputation system for tracking user contributions and rewards.
 * This model manages user reputation through transactions, milestones, achievements,
 * and engagement tracking across the ShadowNews platform.
 * 
 * Key Features:
 * - Transaction-based karma tracking with detailed breakdowns
 * - Milestone rewards and achievement system
 * - Voting power multipliers based on reputation
 * - Streak tracking for engagement (daily login, weekly contributions)
 * - Monthly statistics and community ranking
 * - Curator, ambassador, and moderator privileges
 * - Configurable notification preferences
 * 
 * Karma Sources:
 * - Posts: Creating and receiving votes on posts
 * - Comments: Creating and receiving votes on comments
 * - Repositories: Creating and managing email repositories
 * - Curation: Moderating and curating content
 * - Community: System bonuses and special activities
 * 
 * Milestone Rewards:
 * - 100: Custom email signature
 * - 500: Repository creation rights
 * - 1000: Weighted voting power (2x)
 * - 2500: Enhanced voting power (3x)
 * - 5000: Governance participation (5x voting power)
 * 
 * Relationships:
 * - Belongs to User (one-to-one)
 * - References Posts, Comments, Repositories through transactions
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Required dependencies for karma model
const mongoose = require('mongoose');

/**
 * Karma Transaction Schema
 * Tracks individual karma-earning or karma-spending transactions
 * 
 * This schema records every karma change with full audit trail,
 * including the source, amount, and related content that triggered
 * the karma change.
 */
const karmaTransactionSchema = new mongoose.Schema({
  // Karma amount change (positive for earning, negative for spending/penalties)
  amount: {
    type: Number,
    required: true    // Amount of karma gained or lost in this transaction
  },
  
  // Type of action that triggered this karma transaction
  type: {
    type: String,
    enum: [
      'post_upvote',        // Received upvote on post
      'post_downvote',      // Received downvote on post
      'comment_upvote',     // Received upvote on comment
      'comment_downvote',   // Received downvote on comment
      'post_created',       // Created a new post
      'comment_created',    // Created a new comment
      'repository_created', // Created a new repository
      'csv_uploaded',       // Uploaded CSV data to repository
      'email_verified',     // Verified email ownership
      'curator_bonus',      // Bonus for curation activities
      'daily_login',        // Daily login streak bonus
      'milestone_bonus'     // Milestone achievement bonus
    ],
    required: true
  },
  
  // Source category of the karma transaction
  source: {
    type: String,
    enum: [
      'post',        // Post-related karma
      'comment',     // Comment-related karma
      'repository',  // Repository-related karma
      'system',      // System-generated karma (bonuses, streaks)
      'moderation'   // Moderation and curation karma
    ],
    required: true
  },
  
  // Reference to the content that triggered this transaction
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'    // Dynamic reference based on relatedModel field
  },
  
  // Model type for the related content
  relatedModel: {
    type: String,
    enum: ['Post', 'Comment', 'Repository', 'User']
  },
  
  // Human-readable description of the karma transaction
  description: String,
  
  // When this karma transaction occurred
  timestamp: {
    type: Date,
    default: Date.now
  }
});

/**
 * Karma Milestone Schema
 * Tracks achieved karma milestones and their associated rewards
 * 
 * This schema records when users reach significant karma thresholds
 * and unlocks special privileges and rewards for their contributions.
 */
const karmaMilestoneSchema = new mongoose.Schema({
  // Karma amount required for this milestone
  milestone: {
    type: Number,
    required: true    // Total karma threshold (e.g., 100, 500, 1000)
  },
  
  // When this milestone was achieved
  achievedAt: {
    type: Date,
    default: Date.now
  },
  
  // Rewards unlocked by reaching this milestone
  rewards: {
    // Ability to set custom email signature
    customEmailSignature: {
      type: Boolean,
      default: false
    },
    
    // Permission to create new repositories
    repositoryCreationRights: {
      type: Boolean,
      default: false
    },
    
    // Multiplier for voting power in community decisions
    weightedVotingPower: {
      type: Number,
      default: 1    // Standard voting power is 1x
    },
    
    // Access to governance and platform decisions
    governanceParticipation: {
      type: Boolean,
      default: false
    }
  }
});

/**
 * Main Karma Schema
 * Complete karma tracking and management for user reputation
 * 
 * This is the primary schema that tracks all aspects of a user's
 * karma including totals, breakdowns, multipliers, streaks,
 * achievements, and configuration preferences.
 */
const karmaSchema = new mongoose.Schema({
  // Reference to the user who owns this karma record
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true    // One karma record per user
  },
  
  // Total karma points accumulated by the user
  total: {
    type: Number,
    default: 0,
    index: true    // Indexed for leaderboard and ranking queries
  },
  
  // Detailed breakdown of karma by contribution type
  breakdown: {
    // Karma earned from creating and receiving votes on posts
    posts: {
      type: Number,
      default: 0
    },
    
    // Karma earned from creating and receiving votes on comments
    comments: {
      type: Number,
      default: 0
    },
    
    // Karma earned from repository creation and management
    repositories: {
      type: Number,
      default: 0
    },
    
    // Karma earned from curation and moderation activities
    curation: {
      type: Number,
      default: 0
    },
    
    // Karma earned from community activities and system bonuses
    community: {
      type: Number,
      default: 0
    }
  },
  
  // Multipliers that enhance karma earning potential
  multipliers: {
    // Bonus for consistently creating high-quality content
    qualityContent: {
      type: Number,
      default: 1.0,
      min: 1.0,      // Minimum multiplier (no penalty)
      max: 2.0       // Maximum 2x bonus for exceptional quality
    },
    
    // Bonus for regular, consistent contributions
    consistency: {
      type: Number,
      default: 1.0,
      min: 1.0,      // Minimum multiplier (no penalty)
      max: 1.5       // Maximum 1.5x bonus for consistency
    },
    
    // Bonus for demonstrated expertise in specific domains
    expertise: {
      type: Number,
      default: 1.0,
      min: 1.0,      // Minimum multiplier (no penalty)  
      max: 2.0       // Maximum 2x bonus for recognized expertise
    }
  },
  
  // Engagement streaks that provide bonus karma
  streaks: {
    // Daily login streak tracking
    dailyLogin: {
      // Current consecutive days of login
      current: {
        type: Number,
        default: 0
      },
      
      // Longest streak ever achieved
      longest: {
        type: Number,
        default: 0
      },
      
      // Last login date for streak calculation
      lastLogin: Date
    },
    
    // Weekly contribution streak tracking
    weeklyContribution: {
      // Current consecutive weeks with contributions
      current: {
        type: Number,
        default: 0
      },
      
      // Longest contribution streak ever achieved
      longest: {
        type: Number,
        default: 0
      },
      
      // Last contribution date for streak calculation
      lastContribution: Date
    }
  },
  
  // Special achievements unlocked through various activities
  achievements: [{
    // Type of achievement earned
    type: {
      type: String,
      enum: [
        'first_post',        // Created first post
        'first_comment',     // Created first comment
        'first_upvote',      // Received first upvote
        'first_repository',  // Created first repository
        'trending_post',     // Had a post reach trending status
        'helpful_curator',   // Recognized for helpful curation
        'community_builder', // Active in community building
        'thought_leader',    // Recognized thought leadership
        'snowball_master',   // Expert at snowball distribution
        'email_evangelist'   // Promoted email-first communication
      ]
    },
    
    // When this achievement was unlocked
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    
    // Additional metadata specific to the achievement
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Karma milestones achieved by the user
  milestones: [karmaMilestoneSchema],
  
  // Complete transaction history for audit trail
  transactions: [karmaTransactionSchema],
  
  // Monthly statistics for progress tracking
  monthlyStats: [{
    // Month for these statistics
    month: {
      type: Date,
      required: true
    },
    
    // Karma earned during this month
    earned: {
      type: Number,
      default: 0
    },
    
    // Karma spent/lost during this month
    spent: {
      type: Number,
      default: 0
    },
    
    // Community rank for this month
    rank: Number
  }],
  
  // User preferences for karma system
  settings: {
    // Whether to display karma publicly on profile
    publicDisplay: {
      type: Boolean,
      default: true
    },
    
    // Whether to show detailed karma breakdown
    showBreakdown: {
      type: Boolean,
      default: true
    },
    
    // Email notification preferences
    emailNotifications: {
      // Notify on milestone achievements
      milestones: {
        type: Boolean,
        default: true
      },
      
      // Send weekly karma progress reports
      weeklyReport: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Special privileges and roles
  flags: {
    // Curator status for content moderation
    isCurator: {
      type: Boolean,
      default: false
    },
    
    // Ambassador status for community representation
    isAmbassador: {
      type: Boolean,
      default: false
    },
    
    // Moderator status for platform management
    isModerator: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true    // Automatic createdAt and updatedAt fields
});

// Database indexes for efficient querying
karmaSchema.index({ userId: 1, 'transactions.timestamp': -1 });  // User transaction history
karmaSchema.index({ total: -1 });                                // Leaderboard ranking
karmaSchema.index({ 'monthlyStats.month': -1 });               // Monthly statistics

/**
 * Static Karma Values Configuration
 * Defines the karma points awarded for different activities
 * 
 * These values determine how much karma users earn or lose
 * for various actions throughout the platform.
 */
karmaSchema.statics.KARMA_VALUES = {
  // Content creation rewards
  POST_CREATED: 50,               // Base karma for creating a post
  COMMENT_CREATED: 20,            // Base karma for creating a comment
  REPOSITORY_CREATED: 100,        // Karma for creating a repository
  CSV_UPLOADED: 100,              // Karma for uploading CSV data
  
  // Voting rewards (received)
  POST_UPVOTE_RECEIVED: 10,       // Karma when your post gets upvoted
  POST_DOWNVOTE_RECEIVED: -5,     // Karma penalty when your post gets downvoted
  COMMENT_UPVOTE_RECEIVED: 5,     // Karma when your comment gets upvoted
  COMMENT_DOWNVOTE_RECEIVED: -2,  // Karma penalty when your comment gets downvoted
  
  // Voting rewards (given)
  GIVE_UPVOTE: 1,                 // Small karma reward for giving upvotes
  
  // System and engagement rewards
  EMAIL_VERIFIED: 50,             // Karma for verifying email address
  CURATOR_BONUS: 25,              // Bonus karma for curation activities
  DAILY_LOGIN: 5,                 // Daily login streak bonus
  WEEKLY_STREAK: 50,              // Weekly contribution streak bonus
  
  // Milestone bonuses
  MILESTONE_100: 10,              // Bonus karma for reaching 100 karma
  MILESTONE_500: 50,              // Bonus karma for reaching 500 karma
  MILESTONE_1000: 100,            // Bonus karma for reaching 1000 karma
  MILESTONE_5000: 500             // Bonus karma for reaching 5000 karma
};

/**
 * Static Milestone Rewards Configuration
 * Defines the rewards unlocked at each karma milestone
 * 
 * These milestones provide increasing privileges and capabilities
 * as users demonstrate their value to the community.
 */
karmaSchema.statics.MILESTONES = {
  100: { 
    customEmailSignature: true     // Unlock custom email signatures
  },
  500: { 
    repositoryCreationRights: true // Unlock ability to create repositories
  },
  1000: { 
    weightedVotingPower: 2         // 2x voting power in community decisions
  },
  2500: { 
    weightedVotingPower: 3         // 3x voting power in community decisions
  },
  5000: { 
    governanceParticipation: true, // Access to platform governance
    weightedVotingPower: 5         // 5x voting power in community decisions
  }
};

/**
 * Add Karma Transaction
 * Records a new karma transaction and updates totals and breakdowns
 * 
 * This method is the primary way to modify a user's karma, ensuring
 * proper audit trail and automatic milestone checking.
 * 
 * @param {string} type - Type of karma transaction
 * @param {number} amount - Karma amount (positive or negative)
 * @param {string} source - Source category of the karma
 * @param {ObjectId} relatedId - Related content ID (optional)
 * @param {string} relatedModel - Related content model name (optional)
 * @param {string} description - Human-readable description (optional)
 * @returns {Promise<Karma>} Updated karma document
 */
karmaSchema.methods.addTransaction = async function(type, amount, source, relatedId = null, relatedModel = null, description = null) {
  // Add transaction to history
  this.transactions.push({
    type,
    amount,
    source,
    relatedId,
    relatedModel,
    description
  });
  
  // Update total karma
  this.total += amount;
  
  // Update breakdown by source category
  switch(source) {
    case 'post':
      this.breakdown.posts += amount;
      break;
    case 'comment':
      this.breakdown.comments += amount;
      break;
    case 'repository':
      this.breakdown.repositories += amount;
      break;
    case 'moderation':
      this.breakdown.curation += amount;
      break;
    case 'system':
      this.breakdown.community += amount;
      break;
  }
  
  // Check for new milestone achievements
  await this.checkMilestones();
  return this.save();
};

/**
 * Check and Process Milestone Achievements
 * Automatically detects and processes new milestone achievements
 * 
 * This method runs after each karma transaction to check if the user
 * has reached any new milestones and awards appropriate bonuses.
 * 
 * @returns {Promise<void>}
 */
karmaSchema.methods.checkMilestones = async function() {
  // Get all milestone values sorted ascending
  const milestoneValues = Object.keys(this.constructor.MILESTONES).map(Number).sort((a, b) => a - b);
  
  // Check each milestone threshold
  for (const milestone of milestoneValues) {
    const existingMilestone = this.milestones.find(m => m.milestone === milestone);
    
    // If milestone not yet achieved and karma total meets threshold
    if (!existingMilestone && this.total >= milestone) {
      // Add milestone achievement
      this.milestones.push({
        milestone,
        rewards: this.constructor.MILESTONES[milestone]
      });
      
      // Award milestone bonus karma
      await this.addTransaction(
        'milestone_bonus',
        this.constructor.KARMA_VALUES[`MILESTONE_${milestone}`] || 0,
        'system',
        null,
        null,
        `Reached ${milestone} karma milestone`
      );
    }
  }
};

/**
 * Update Engagement Streak
 * Updates login or contribution streaks and awards bonuses
 * 
 * This method tracks user engagement patterns and rewards
 * consistent participation with bonus karma.
 * 
 * @param {string} type - Type of streak ('login' or 'contribution')
 * @returns {Promise<Karma>} Updated karma document
 */
karmaSchema.methods.updateStreak = async function(type) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (type === 'login') {
    const lastLogin = this.streaks.dailyLogin.lastLogin;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset streak if more than a day has passed
    if (!lastLogin || lastLogin < yesterday) {
      this.streaks.dailyLogin.current = 1;
    } 
    // Continue streak if logged in yesterday
    else if (lastLogin >= yesterday && lastLogin < today) {
      this.streaks.dailyLogin.current += 1;
      
      // Update longest streak record
      if (this.streaks.dailyLogin.current > this.streaks.dailyLogin.longest) {
        this.streaks.dailyLogin.longest = this.streaks.dailyLogin.current;
      }
    }
    
    // Update last login timestamp
    this.streaks.dailyLogin.lastLogin = now;
  }
  
  return this.save();
};

/**
 * Get User's Voting Power
 * Calculates the user's voting power based on achieved milestones
 * 
 * Users with higher karma have enhanced voting power in community
 * decisions and content ranking algorithms.
 * 
 * @returns {number} Voting power multiplier (1x for standard users)
 */
karmaSchema.methods.getVotingPower = function() {
  // Find the highest milestone with voting power rewards
  const milestone = this.milestones
    .filter(m => m.rewards.weightedVotingPower)
    .sort((a, b) => b.milestone - a.milestone)[0];
  
  return milestone ? milestone.rewards.weightedVotingPower : 1;
};

/**
 * Check Repository Creation Rights
 * Determines if user has earned the right to create repositories
 * 
 * Repository creation is a privilege earned through karma milestones
 * to ensure quality and prevent spam.
 * 
 * @returns {boolean} True if user can create repositories
 */
karmaSchema.methods.canCreateRepository = function() {
  return this.milestones.some(m => m.rewards.repositoryCreationRights);
};

/**
 * Get Monthly Community Rank
 * Calculates the user's rank within the community for the current month
 * 
 * This method determines how the user ranks compared to other users
 * based on karma earned in the current month.
 * 
 * @returns {Promise<number>} User's rank (1 = highest karma earner)
 */
karmaSchema.methods.getMonthlyRank = async function() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Count users with higher monthly karma earnings
  const rank = await this.constructor.countDocuments({
    'monthlyStats.month': startOfMonth,
    'monthlyStats.earned': { 
      $gt: this.monthlyStats.find(s => s.month.getTime() === startOfMonth.getTime())?.earned || 0 
    }
  }) + 1;
  
  return rank;
};

// Create and export the Karma model
const Karma = mongoose.model('Karma', karmaSchema);

module.exports = Karma;
/**
 * @fileoverview Karma System Constants for ShadowNews Platform
 * 
 * This file defines the comprehensive karma system for the ShadowNews platform,
 * an advanced gamification and reputation system that rewards quality contributions,
 * community building, and positive platform engagement. The karma system serves
 * as the foundation for user progression, privileges, and community standing.
 * 
 * ============================================================================
 * KARMA SYSTEM ARCHITECTURE:
 * ============================================================================
 * 
 * Gamification Philosophy:
 * - Merit-based progression system rewarding quality contributions
 * - Progressive privilege unlocking based on community standing
 * - Anti-gaming mechanisms to prevent manipulation and abuse
 * - Community-driven validation through voting and curation
 * 
 * Scoring Methodology:
 * - Action-based point allocation for different platform activities
 * - Multiplier system for exceptional content and timing
 * - Decay mechanisms to ensure continued engagement
 * - Rate limiting to prevent point farming and abuse
 * 
 * Milestone System:
 * - Progressive unlocking of platform features and privileges
 * - Visual recognition through badges and special status
 * - Weighted voting power for experienced community members
 * - Repository creation limits based on demonstrated responsibility
 * 
 * Community Benefits:
 * - Quality content incentivization through point rewards
 * - Spam and low-quality content deterrence through penalties
 * - Community self-moderation through weighted voting
 * - Recognition and status for valuable community contributors
 * 
 * ============================================================================
 * CORE FEATURES:
 * ============================================================================
 * 
 * Content Quality Incentives:
 * - Higher rewards for posts that receive community approval
 * - Bonus points for viral content and trending topics
 * - Penalties for flagged or removed content
 * - Special recognition for curated quality content
 * 
 * Repository Management:
 * - Progressive repository creation privileges
 * - Email list growth rewards and milestone bonuses
 * - Snowball distribution success incentives
 * - Quality curation and moderation responsibilities
 * 
 * Email Integration:
 * - Email-to-post creation rewards
 * - Successful email invitation bonuses
 * - CSV import and data management incentives
 * - Email engagement and quality metrics
 * 
 * Community Building:
 * - User referral and onboarding rewards
 * - Daily and weekly engagement bonuses
 * - Long-term commitment recognition
 * - Special achievement unlocking system
 * 
 * Anti-Abuse Mechanisms:
 * - Rate limiting for point accumulation
 * - Penalties for detected spam and manipulation
 * - Account suspension and permanent ban consequences
 * - Community-driven flagging and moderation
 * 
 * ============================================================================
 * USAGE PATTERNS:
 * ============================================================================
 * 
 * Point Calculation:
 * - Base points for actions with multiplier application
 * - Context-aware bonus calculations
 * - Rate limit validation and enforcement
 * - Historical tracking and analytics
 * 
 * Milestone Progression:
 * - Current milestone calculation based on total karma
 * - Next milestone prediction and progress tracking
 * - Privilege unlocking and feature access control
 * - Badge and recognition system integration
 * 
 * Community Moderation:
 * - Weighted voting based on karma levels
 * - Moderation tool access for high-karma users
 * - Quality curation responsibilities and rewards
 * - Spam detection and penalty application
 * 
 * Achievement System:
 * - Special milestone recognition and celebration
 * - Rare achievement unlocking for exceptional contributions
 * - Community leaderboards and recognition programs
 * - Long-term engagement and loyalty rewards
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// ============================================================================
// Karma Actions and Point Values
// ============================================================================

/**
 * Karma Actions and Point Allocation
 * 
 * Comprehensive point system for different platform activities, designed to
 * incentivize quality contributions and positive community engagement while
 * deterring spam and abuse.
 * 
 * Design Principles:
 * - Higher rewards for content creation than consumption
 * - Significant penalties for negative behaviors
 * - Progressive rewards for community building activities
 * - Balanced point values to prevent inflation
 * 
 * Action Categories:
 * - Content Creation: Posts, comments, and repository management
 * - Community Engagement: Voting, sharing, and curation
 * - Email Integration: Email-based posting and list building
 * - Platform Building: Referrals, data contributions, and growth
 * - Quality Assurance: Curation, moderation, and spam detection
 * - Penalties: Negative behaviors and policy violations
 */
export const KARMA_ACTIONS = {
  // ============================================================================
  // Post Creation and Engagement Actions
  // ============================================================================
  
  /**
   * Post-Related Karma Actions
   * 
   * Rewards and penalties for post creation and community response.
   * Designed to encourage quality content while discouraging spam.
   */
  CREATE_POST: 50,                  // Base reward for creating a new post
  POST_UPVOTED: 10,                 // Reward for each upvote received
  POST_DOWNVOTED: -2,               // Minor penalty for downvotes (community feedback)
  POST_FLAGGED: -50,                // Significant penalty for community-flagged content
  POST_REMOVED: -100,               // Major penalty for removed content
  POST_FEATURED: 100,               // Bonus for featured/highlighted content
  
  // ============================================================================
  // Comment Creation and Engagement Actions
  // ============================================================================
  
  /**
   * Comment-Related Karma Actions
   * 
   * Encourages thoughtful discussion and quality responses while
   * maintaining lower point values than posts to balance effort.
   */
  CREATE_COMMENT: 20,               // Base reward for creating a comment
  COMMENT_UPVOTED: 5,               // Reward for each comment upvote
  COMMENT_DOWNVOTED: -1,            // Minor penalty for comment downvotes
  COMMENT_FLAGGED: -25,             // Penalty for flagged comments
  COMMENT_BEST_ANSWER: 50,          // Bonus for comments marked as best answers
  
  // ============================================================================
  // Repository Management Actions
  // ============================================================================
  
  /**
   * Repository-Related Karma Actions
   * 
   * Rewards for building and managing email repositories, with
   * progressive bonuses for successful community building.
   */
  CREATE_REPOSITORY: 100,           // Base reward for creating a repository
  REPOSITORY_EMAIL_ADDED: 2,        // Small reward for each email added
  REPOSITORY_EMAIL_VERIFIED: 5,     // Bonus for verified email addresses
  REPOSITORY_SHARED: 25,            // Reward for repository sharing
  REPOSITORY_MERGED: 150,           // Bonus for successful repository merges
  REPOSITORY_MILESTONE_100: 200,    // Milestone bonus for 100 members
  REPOSITORY_MILESTONE_500: 500,    // Milestone bonus for 500 members
  REPOSITORY_MILESTONE_1000: 1000,  // Major milestone bonus for 1000 members
  
  // ============================================================================
  // Email Integration Actions
  // ============================================================================
  
  /**
   * Email-Based Platform Actions
   * 
   * Rewards for email-first platform features including email posting,
   * invitations, and list building activities.
   */
  EMAIL_POST_CREATED: 60,           // Bonus for posts created via email
  EMAIL_INVITE_SENT: 10,            // Reward for sending platform invitations
  EMAIL_INVITE_ACCEPTED: 30,        // Bonus when invitation is accepted
  EMAIL_BOUNCE: -5,                 // Minor penalty for email bounces
  EMAIL_UNSUBSCRIBE: -10,           // Penalty for unsubscribe requests
  
  // ============================================================================
  // CSV Data Management Actions
  // ============================================================================
  
  /**
   * CSV and Data Management Actions
   * 
   * Incentives for contributing and managing structured data within
   * the platform, particularly for email list building.
   */
  CSV_UPLOADED: 75,                 // Reward for uploading CSV data
  CSV_EMAILS_IMPORTED: 1,           // Small reward per email imported
  CSV_DOWNLOAD_BY_OTHER: 15,        // Bonus when others download your CSV
  CSV_MALFORMED: -20,               // Penalty for malformed or invalid CSV data
  
  // ============================================================================
  // Content Curation Actions
  // ============================================================================
  
  /**
   * Quality Curation and Moderation Actions
   * 
   * Rewards for community moderation and quality control activities,
   * with penalties for incorrect moderation decisions.
   */
  CURATE_QUALITY_POST: 15,          // Reward for identifying quality content
  CURATE_REMOVE_SPAM: 20,           // Reward for successful spam identification
  CURATE_FALSE_FLAG: -30,           // Penalty for incorrect flagging
  GOLDEN_CURATOR_BONUS: 5,          // Multiplier bonus for experienced curators
  
  // ============================================================================
  // Snowball Distribution Actions
  // ============================================================================
  
  /**
   * Snowball Growth and Distribution Actions
   * 
   * Rewards for successful organic growth through the snowball
   * email distribution system, with escalating bonuses.
   */
  SNOWBALL_INITIATED: 25,           // Base reward for starting snowball distribution
  SNOWBALL_GROWTH_10X: 100,         // Bonus for 10x repository growth
  SNOWBALL_GROWTH_50X: 500,         // Major bonus for 50x growth
  SNOWBALL_GROWTH_100X: 1000,       // Exceptional bonus for 100x growth
  
  // ============================================================================
  // User Engagement and Retention Actions
  // ============================================================================
  
  /**
   * User Activity and Retention Actions
   * 
   * Rewards for consistent platform engagement and community building,
   * designed to encourage long-term participation.
   */
  FIRST_LOGIN_WEEK: 50,             // Bonus for logging in within first week
  DAILY_ACTIVE_BONUS: 5,            // Small daily activity reward
  WEEKLY_STREAK_BONUS: 25,          // Weekly engagement streak bonus
  MONTHLY_STREAK_BONUS: 100,        // Monthly engagement streak bonus
  REFERRAL_SIGNUP: 100,             // Reward for successful user referrals
  PROFILE_COMPLETED: 25,            // Bonus for completing user profile
  
  // ============================================================================
  // AI Integration Actions
  // ============================================================================
  
  /**
   * AI-Assisted Platform Actions
   * 
   * Rewards for positive interaction with AI features and
   * successful AI-generated content validation.
   */
  AI_SUGGESTION_ACCEPTED: 5,        // Reward for accepting AI suggestions
  AI_HASHTAG_TRENDING: 20,          // Bonus for hashtags that become trending via AI
  AI_SUMMARY_HELPFUL: 10,           // Reward for AI summaries marked as helpful
  
  // ============================================================================
  // Penalty Actions and Policy Violations
  // ============================================================================
  
  /**
   * Penalty Actions for Policy Violations
   * 
   * Significant penalties for platform abuse, manipulation, and
   * policy violations to maintain community standards.
   */
  SPAM_DETECTED: -100,              // Major penalty for spam detection
  MULTIPLE_ACCOUNTS: -500,          // Severe penalty for multi-account abuse
  VOTE_MANIPULATION: -250,          // Penalty for vote manipulation
  HARASSMENT: -1000,                // Severe penalty for harassment
  BAN_PERMANENT: -10000,            // Maximum penalty for permanent ban
} as const;

// ============================================================================
// Karma Milestones and Privilege System
// ============================================================================

/**
 * Karma Milestone System
 * 
 * Progressive privilege system that unlocks platform features and
 * recognition based on accumulated karma points. Designed to create
 * clear progression paths and incentivize continued engagement.
 * 
 * Milestone Benefits:
 * - Feature Access: Progressive unlocking of platform capabilities
 * - Recognition: Badges, special status, and community visibility
 * - Voting Power: Weighted voting for experienced community members
 * - Repository Limits: Increased creation and management privileges
 * - Support Priority: Enhanced support for valuable community members
 * 
 * Design Philosophy:
 * - Clear progression paths with meaningful rewards
 * - Balanced privilege distribution to maintain community fairness
 * - Visual recognition for achievement and status
 * - Practical benefits that enhance platform experience
 */
export const KARMA_MILESTONES = {
  /**
   * NEWBIE (0+ karma)
   * Entry-level users with basic platform access
   */
  NEWBIE: {
    threshold: 0,
    perks: ['Basic posting', 'Commenting', 'Upvoting'],
    emailSignature: false,
    customUsername: false,
    repositoryLimit: 0,
    votingPower: 1,
    badge: 'Newcomer',
    color: '#718096',
  },
  
  /**
   * CONTRIBUTOR (100+ karma)
   * Active users who have demonstrated basic engagement
   */
  CONTRIBUTOR: {
    threshold: 100,
    perks: ['Custom email signature', 'Create 1 repository', 'Downvoting'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: 1,
    votingPower: 1,
    badge: 'Contributor',
    color: '#4299E1',
  },
  
  /**
   * ACTIVE_MEMBER (500+ karma)
   * Regular contributors with established community presence
   */
  ACTIVE_MEMBER: {
    threshold: 500,
    perks: ['Create 3 repositories', 'Weighted votes (1.5x)', 'Priority support'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: 3,
    votingPower: 1.5,
    badge: 'Active Member',
    color: '#48BB78',
  },
  
  /**
   * POWER_USER (1000+ karma)
   * Experienced users with significant platform investment
   */
  POWER_USER: {
    threshold: 1000,
    perks: ['Create 5 repositories', 'Weighted votes (2x)', 'Beta features'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: 5,
    votingPower: 2,
    badge: 'Power User',
    color: '#9F7AEA',
  },
  
  /**
   * COMMUNITY_LEADER (2500+ karma)
   * Trusted community members with moderation capabilities
   */
  COMMUNITY_LEADER: {
    threshold: 2500,
    perks: ['Unlimited repositories', 'Weighted votes (3x)', 'Moderation tools'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: -1, // unlimited
    votingPower: 3,
    badge: 'Community Leader',
    color: '#ED8936',
  },
  
  /**
   * PLATFORM_AMBASSADOR (5000+ karma)
   * Elite users with platform governance participation
   */
  PLATFORM_AMBASSADOR: {
    threshold: 5000,
    perks: ['Platform governance', 'Weighted votes (5x)', 'Direct feature requests'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: -1,
    votingPower: 5,
    badge: 'Ambassador',
    color: '#E53E3E',
  },
  
  /**
   * LEGENDARY (10000+ karma)
   * Legendary contributors with maximum privileges and recognition
   */
  LEGENDARY: {
    threshold: 10000,
    perks: ['Hall of fame', 'Weighted votes (10x)', 'Lifetime perks'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: -1,
    votingPower: 10,
    badge: 'Legend',
    color: '#D69E2E',
  },
} as const;

// ============================================================================
// Karma Decay and Maintenance System
// ============================================================================

/**
 * Karma Decay Configuration
 * 
 * Prevents karma inflation and encourages continued engagement by
 * implementing gradual point decay for inactive users.
 * 
 * Decay Philosophy:
 * - Encourage continued platform engagement
 * - Prevent karma hoarding and inflation
 * - Protect high-value contributors from excessive decay
 * - Maintain dynamic and active community rankings
 */
export const KARMA_DECAY = {
  INACTIVE_DAYS: 30,                // Days before decay begins
  DAILY_DECAY_RATE: 0.001,          // 0.1% daily decay rate after inactivity
  MAX_DECAY_PERCENTAGE: 0.2,        // Maximum 20% total karma can decay
  PROTECTED_THRESHOLD: 1000,        // Users above this karma are protected from decay
} as const;

// ============================================================================
// Karma Multipliers and Bonuses
// ============================================================================

/**
 * Karma Multiplier System
 * 
 * Dynamic bonus system that amplifies karma rewards based on
 * content quality, timing, and special circumstances.
 * 
 * Multiplier Categories:
 * - Content Quality: Rewards for high-performing content
 * - Timing Bonuses: Special periods with increased rewards
 * - User Status: Bonuses for new users and special events
 * - Viral Content: Exceptional rewards for viral posts
 */
export const KARMA_MULTIPLIERS = {
  TRENDING_POST: 2,                 // 2x multiplier for trending posts
  VIRAL_POST: 5,                    // 5x multiplier for viral content
  QUALITY_SCORE_HIGH: 1.5,          // 1.5x for high-quality content
  QUALITY_SCORE_LOW: 0.5,           // 0.5x penalty for low-quality content
  NEW_USER_BONUS: 1.2,              // 1.2x bonus for new users (first 30 days)
  WEEKEND_BONUS: 1.1,               // 1.1x weekend activity bonus
  SPECIAL_EVENT: 2,                 // 2x during platform events
} as const;

// ============================================================================
// Rate Limiting and Anti-Abuse
// ============================================================================

/**
 * Karma Rate Limiting Configuration
 * 
 * Prevents point farming and abuse while allowing legitimate
 * high-activity users to earn appropriate rewards.
 * 
 * Rate Limit Strategy:
 * - Daily and hourly caps prevent excessive point accumulation
 * - Loss limits prevent catastrophic karma destruction
 * - Cooldown periods prevent rapid-fire gaming
 * - Balanced limits for normal vs. exceptional usage
 */
export const KARMA_RATE_LIMITS = {
  MAX_DAILY_GAIN: 500,              // Maximum karma gain per day
  MAX_HOURLY_GAIN: 100,             // Maximum karma gain per hour
  MAX_DAILY_LOSS: -200,             // Maximum karma loss per day
  VOTING_COOLDOWN_SECONDS: 1,       // Cooldown between votes
  POST_COOLDOWN_MINUTES: 5,         // Cooldown between posts
  COMMENT_COOLDOWN_MINUTES: 1,      // Cooldown between comments
} as const;

// ============================================================================
// Special Achievement System
// ============================================================================

/**
 * Special Achievement Recognition
 * 
 * Unique achievements for exceptional contributions and milestones,
 * providing additional recognition beyond regular karma progression.
 * 
 * Achievement Categories:
 * - First Actions: Recognition for initial platform engagement
 * - Exceptional Performance: Rewards for outstanding contributions
 * - Community Building: Recognition for platform growth contributions
 * - Long-term Commitment: Loyalty and persistence recognition
 */
export const SPECIAL_ACHIEVEMENTS = {
  FIRST_POST: { karma: 100, badge: 'First Steps', icon: '🚀' },
  FIRST_REPOSITORY: { karma: 200, badge: 'Repository Creator', icon: '📁' },
  FIRST_SNOWBALL: { karma: 300, badge: 'Snowball Starter', icon: '❄️' },
  VIRAL_POST_1K: { karma: 500, badge: 'Viral Sensation', icon: '🔥' },
  HELPFUL_CURATOR: { karma: 250, badge: 'Quality Guardian', icon: '⭐' },
  EMAIL_MASTER: { karma: 400, badge: 'Email Wizard', icon: '📧' },
  COMMUNITY_BUILDER: { karma: 1000, badge: 'Community Pillar', icon: '🏛️' },
  YEAR_MEMBER: { karma: 500, badge: 'Veteran', icon: '🎖️' },
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * TypeScript Type Definitions
 * 
 * Type definitions for karma system constants to ensure type safety
 * and provide IntelliSense support for developers.
 */

export type KarmaAction = keyof typeof KARMA_ACTIONS;
export type KarmaMilestone = keyof typeof KARMA_MILESTONES;
export type KarmaMultiplier = keyof typeof KARMA_MULTIPLIERS;
export type SpecialAchievement = keyof typeof SPECIAL_ACHIEVEMENTS;

/**
 * Karma Transaction Interface
 * 
 * Structure for tracking individual karma-affecting actions
 * and maintaining audit trail for transparency and debugging.
 */
export interface KarmaTransaction {
  userId: string;                    // User receiving karma change
  action: KarmaAction;               // Type of action performed
  points: number;                    // Calculated karma points (including multipliers)
  multiplier?: number;               // Applied multiplier value
  timestamp: Date;                   // When the action occurred
  relatedId?: string;                // ID of related content (post, comment, etc.)
  relatedType?: 'post' | 'comment' | 'repository' | 'email' | 'csv'; // Type of related content
}

/**
 * User Karma Statistics Interface
 * 
 * Comprehensive karma statistics and progression information
 * for user profile display and milestone tracking.
 */
export interface UserKarmaStats {
  total: number;                     // Total accumulated karma
  rank: number;                      // Platform-wide karma ranking
  milestone: KarmaMilestone;         // Current milestone level
  dailyGain: number;                 // Karma gained today
  weeklyGain: number;                // Karma gained this week
  monthlyGain: number;               // Karma gained this month
  achievements: SpecialAchievement[]; // Unlocked special achievements
  nextMilestone: {                   // Next milestone information
    name: KarmaMilestone;
    pointsNeeded: number;
    perksUnlocked: string[];
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate Karma Change with Multipliers
 * 
 * Calculates the final karma change for an action, applying
 * appropriate multipliers based on context and conditions.
 * 
 * @param action - The karma action being performed
 * @param multipliers - Object indicating which multipliers are active
 * @returns Final karma points to award/deduct
 */
export const calculateKarmaChange = (
  action: KarmaAction,
  multipliers: Partial<Record<KarmaMultiplier, boolean>> = {}
): number => {
  let basePoints = KARMA_ACTIONS[action];
  let totalMultiplier = 1;

  // Apply all active multipliers
  Object.entries(multipliers).forEach(([key, active]) => {
    if (active && key in KARMA_MULTIPLIERS) {
      totalMultiplier *= KARMA_MULTIPLIERS[key as KarmaMultiplier];
    }
  });

  return Math.round(basePoints * totalMultiplier);
};

/**
 * Get Current Karma Milestone
 * 
 * Determines the current milestone based on total karma points.
 * Returns the highest milestone the user qualifies for.
 * 
 * @param karma - User's total karma points
 * @returns Current milestone name
 */
export const getCurrentMilestone = (karma: number): KarmaMilestone => {
  const milestones = Object.entries(KARMA_MILESTONES)
    .sort(([, a], [, b]) => b.threshold - a.threshold);
  
  for (const [name, data] of milestones) {
    if (karma >= data.threshold) {
      return name as KarmaMilestone;
    }
  }
  
  return 'NEWBIE';
};

/**
 * Get Next Karma Milestone
 * 
 * Calculates the next milestone the user can achieve and
 * how many points are needed to reach it.
 * 
 * @param karma - User's current karma points
 * @returns Next milestone information or null if at highest level
 */
export const getNextMilestone = (karma: number): { name: KarmaMilestone; pointsNeeded: number } | null => {
  const milestones = Object.entries(KARMA_MILESTONES)
    .sort(([, a], [, b]) => a.threshold - b.threshold);
  
  for (const [name, data] of milestones) {
    if (karma < data.threshold) {
      return {
        name: name as KarmaMilestone,
        pointsNeeded: data.threshold - karma,
      };
    }
  }
  
  return null; // User has reached the highest milestone
};
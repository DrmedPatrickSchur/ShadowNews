/**
 * @fileoverview User Interface Definitions for ShadowNews Platform
 * 
 * This file defines comprehensive type definitions for the user management system
 * within the ShadowNews platform, covering user authentication, profile management,
 * social features, privacy controls, and community engagement mechanics. The user
 * system serves as the foundation for all platform interactions including content
 * creation, email repository management, and social networking features.
 * 
 * ============================================================================
 * USER SYSTEM ARCHITECTURE:
 * ============================================================================
 * 
 * Authentication and Security:
 * - Email-based authentication with email verification
 * - Shadow email assignment (username@shadownews.community)
 * - Two-factor authentication support for enhanced security
 * - API key management for third-party integrations
 * - Session management with device tracking
 * - Role-based access control (RBAC) system
 * 
 * Profile and Identity Management:
 * - Comprehensive user profiles with display customization
 * - Avatar and bio management for personal branding
 * - Username and display name flexibility
 * - Privacy settings for granular visibility control
 * - Profile verification system for trusted users
 * - Professional profile features for content creators
 * 
 * Social Features and Networking:
 * - Follow/follower system for content discovery
 * - User blocking and privacy protection
 * - Direct messaging capabilities (future implementation)
 * - Social proof through karma and badge systems
 * - Community building through repository membership
 * - Collaborative content creation and curation
 * 
 * Karma and Reputation System:
 * - Comprehensive karma tracking for user reputation
 * - Activity-based karma earning and losing mechanisms
 * - Quality scoring based on community engagement
 * - Achievement system with progressive milestones
 * - Badge recognition for community contributions
 * - Leaderboards and community recognition features
 * 
 * ============================================================================
 * CORE FEATURES:
 * ============================================================================
 * 
 * Email Integration:
 * - Shadow email system for platform-specific communications
 * - Email repository creation and management
 * - CSV upload capabilities for email list building
 * - Email digest customization and delivery preferences
 * - Snowball distribution tracking and analytics
 * - Email engagement metrics and optimization
 * 
 * Repository Management:
 * - Email repository creation and administration
 * - Community building through shared email lists
 * - Repository membership and invitation systems
 * - Collaborative content curation and management
 * - Repository analytics and growth tracking
 * - Cross-repository content distribution
 * 
 * Content Creation and Engagement:
 * - Multi-channel content creation (web, email, API)
 * - Content quality scoring and community feedback
 * - Hashtag-based content organization and discovery
 * - Engagement tracking across posts and comments
 * - Content moderation and community management
 * - Viral content distribution through snowball system
 * 
 * Privacy and Security:
 * - Granular privacy controls for profile visibility
 * - Data sharing preferences and GDPR compliance
 * - Content visibility controls and audience targeting
 * - Secure API access with rate limiting
 * - Two-factor authentication and account security
 * - Comprehensive audit trails and activity logging
 * 
 * Personalization and Preferences:
 * - Theme customization (light, dark, auto)
 * - Language and timezone localization
 * - Notification preferences across multiple channels
 * - Content display preferences and filtering options
 * - Email digest customization and scheduling
 * - Accessibility features and user experience optimization
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// ============================================================================
// Core User Interface
// ============================================================================

/**
 * User Interface (IUser)
 * 
 * The central user interface representing complete user profiles within the
 * ShadowNews platform. Includes authentication, profile data, social features,
 * preferences, and comprehensive activity tracking.
 * 
 * User Features:
 * - Complete profile management with display customization
 * - Shadow email integration for platform communications
 * - Social networking with follow/follower relationships
 * - Repository membership and content organization
 * - Comprehensive privacy and security controls
 * - Activity tracking and engagement analytics
 * 
 * Authentication:
 * - Email-based authentication with verification
 * - Two-factor authentication support for security
 * - Role-based access control for platform permissions
 * - API key management for third-party integrations
 * 
 * Social and Engagement:
 * - Karma system for reputation and community standing
 * - Badge system for achievements and recognition
 * - Repository creation and membership management
 * - Social following and community building features
 */
export interface IUser {
  _id: string;                          // Unique user identifier
  username: string;                     // Unique username for identification
  email: string;                        // Primary email address for authentication
  shadowEmail: string;                  // Platform email (username@shadownews.community)
  displayName: string;                  // Public display name for community interaction
  bio?: string;                         // Optional user biography and description
  avatar?: string;                      // Profile avatar image URL
  karma: number;                        // Community reputation score
  badges: IBadge[];                     // Earned achievement badges
  joinedAt: Date;                       // Platform registration date
  lastActiveAt: Date;                   // Last activity timestamp
  emailVerified: boolean;               // Email verification status
  twoFactorEnabled: boolean;            // Two-factor authentication status
  role: UserRole;                       // User role and permissions level
  status: UserStatus;                   // Account status and restrictions
  preferences: IUserPreferences;       // User customization preferences
  repositories: string[];              // Repository IDs (owned and joined)
  following: string[];                  // User IDs being followed
  followers: string[];                  // User IDs of followers
  blockedUsers: string[];               // User IDs that are blocked
  notificationTokens: INotificationToken[]; // Push notification device tokens
  apiKeys: IApiKey[];                   // API access keys for integrations
  stats: IUserStats;                    // Comprehensive activity statistics
  privacy: IPrivacySettings;           // Privacy and visibility controls
  createdAt: Date;                      // Account creation timestamp
  updatedAt: Date;                      // Last profile update timestamp
}

/**
 * Public User Interface (IUserPublic)
 * 
 * Sanitized user profile interface for public display with privacy
 * controls applied. Used for user discovery, following lists, and
 * public profile viewing.
 * 
 * Public Features:
 * - Basic identification and display information
 * - Community reputation indicators (karma, badges)
 * - Public activity statistics and achievements
 * - Privacy-compliant data exposure
 */
export interface IUserPublic {
  _id: string;                          // Unique user identifier
  username: string;                     // Public username
  displayName: string;                  // Public display name
  bio?: string;                         // Public biography (if privacy allows)
  avatar?: string;                      // Public avatar image
  karma: number;                        // Community reputation score
  badges: IBadge[];                     // Public achievement badges
  joinedAt: Date;                       // Public join date
  stats: IUserStatsPublic;             // Public activity statistics
}

// ============================================================================
// User Preferences and Customization
// ============================================================================

/**
 * User Preferences Interface (IUserPreferences)
 * 
 * Comprehensive user customization settings covering appearance,
 * notifications, privacy, and platform behavior preferences.
 * 
 * Preference Categories:
 * - Theme and display customization for personalized experience
 * - Email digest configuration and content filtering
 * - Multi-channel notification preferences and controls
 * - Content display settings and accessibility options
 * - Posting defaults and content creation preferences
 */
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';     // UI theme preference
  language: string;                     // Platform language (ISO code)
  timezone: string;                     // User timezone for scheduling
  emailDigest: {                        // Email digest configuration
    enabled: boolean;                   // Whether digest emails are enabled
    frequency: DigestFrequency;         // How often to send digest emails
    topics: string[];                   // Hashtags to include in digest
    includeFollowing: boolean;          // Include content from followed users
    includeRepositories: boolean;       // Include repository content
  };
  notifications: {                      // Notification preferences
    email: {                            // Email notification settings
      comments: boolean;                // Notify on comments to user's content
      mentions: boolean;                // Notify on username mentions
      follows: boolean;                 // Notify on new followers
      upvotes: boolean;                 // Notify on content upvotes
      repositoryInvites: boolean;       // Notify on repository invitations
      repositoryUpdates: boolean;       // Notify on repository activity
      announcements: boolean;           // Notify on platform announcements
    };
    push: {                             // Push notification settings
      enabled: boolean;                 // Whether push notifications are enabled
      comments: boolean;                // Push notify on comments
      mentions: boolean;                // Push notify on mentions
      directMessages: boolean;          // Push notify on direct messages
    };
    inApp: {                            // In-app notification settings
      enabled: boolean;                 // Whether in-app notifications are enabled
      sound: boolean;                   // Whether to play notification sounds
    };
  };
  display: {                            // Display preferences
    showKarma: boolean;                 // Show karma score publicly
    showEmail: boolean;                 // Show email address publicly
    compactView: boolean;               // Use compact layout for content
    autoplayVideos: boolean;            // Autoplay video content
    showNSFW: boolean;                  // Show Not Safe For Work content
  };
  posting: {                            // Content creation preferences
    defaultVisibility: PostVisibility; // Default post visibility setting
    signatureEnabled: boolean;          // Include signature in posts
    signature?: string;                   // Custom signature text for posts
    autoSaveEnabled: boolean;           // Automatically save drafts while editing
    autoSaveInterval: number;           // Auto-save interval in seconds
  };
}

// ============================================================================
// Privacy and Security Settings
// ============================================================================

/**
 * Privacy Settings Interface (IPrivacySettings)
 * 
 * Comprehensive privacy controls for user data and profile visibility
 * with granular permissions and GDPR compliance features.
 * 
 * Privacy Features:
 * - Profile visibility controls for different user groups
 * - Activity and repository visibility management
 * - Direct messaging permissions and restrictions
 * - Data sharing preferences for analytics and marketing
 * - Email domain blocking for unwanted communications
 * - Search engine indexing controls for privacy
 */
export interface IPrivacySettings {
  profileVisibility: ProfileVisibility;  // Who can view user's profile
  showActivity: boolean;                 // Show user activity publicly
  showRepositories: boolean;             // Show repository membership publicly
  allowDirectMessages: MessagePermission; // Who can send direct messages
  allowRepositoryInvites: boolean;       // Allow repository invitations
  searchEngineIndexing: boolean;         // Allow search engine crawling
  dataSharing: {                         // Data usage preferences
    analytics: boolean;                  // Share data for platform analytics
    improvements: boolean;               // Share data for feature improvements
    marketing: boolean;                  // Share data for marketing purposes
  };
  blockedDomains: string[];              // Blocked email domains
}

// ============================================================================
// User Achievement and Recognition System
// ============================================================================

/**
 * Badge Interface (IBadge)
 * 
 * User achievement and recognition system supporting various badge
 * types including progressive and tiered achievements.
 * 
 * Badge Features:
 * - Multiple badge types for different achievements
 * - Progressive badges with completion tracking
 * - Tiered badges with level progression
 * - Visual representation with icons and descriptions
 * - Achievement timestamps for recognition history
 */
export interface IBadge {
  id: string;                           // Unique badge identifier
  type: BadgeType;                      // Badge category and classification
  name: string;                         // Display name for the badge
  description: string;                  // Badge description and requirements
  icon: string;                         // Badge icon URL or identifier
  earnedAt: Date;                       // When the badge was earned
  progress?: number;                    // Progress towards completion (0-100)
  level?: number;                       // Badge level for tiered achievements
}

// ============================================================================
// User Statistics and Analytics
// ============================================================================

/**
 * User Statistics Interface (IUserStats)
 * 
 * Comprehensive user activity tracking and analytics for engagement
 * measurement, quality assessment, and community contribution analysis.
 * 
 * Statistics Categories:
 * - Content creation metrics (posts, comments, uploads)
 * - Engagement metrics (upvotes given/received, interactions)
 * - Repository activity and community building metrics
 * - Email engagement and snowball distribution tracking
 * - Daily activity patterns and engagement analysis
 * - Content quality and community reputation scoring
 */
export interface IUserStats {
  posts: number;                        // Total posts created
  comments: number;                     // Total comments posted
  upvotesGiven: number;                 // Total upvotes given to others
  upvotesReceived: number;              // Total upvotes received on content
  repositoriesCreated: number;          // Number of repositories created
  repositoriesJoined: number;           // Number of repositories joined
  emailsSent: number;                   // Total emails sent through platform
  emailsReceived: number;               // Total emails received through platform
  csvUploads: number;                   // Total CSV files uploaded
  snowballReach: number;                // Total reach through snowball distribution
  dailyActivity: IDailyActivity[];      // Daily activity breakdown
  topHashtags: IHashtagStat[];          // Most used hashtags and engagement
  engagementRate: number;               // Overall engagement rate percentage
  qualityScore: number;                 // AI-calculated content quality score
}

/**
 * Public User Statistics Interface (IUserStatsPublic)
 * 
 * Sanitized user statistics for public display with privacy
 * controls applied. Used for leaderboards and public profiles.
 */
export interface IUserStatsPublic {
  posts: number;                        // Total posts created
  comments: number;                     // Total comments posted
  karma: number;                        // Community reputation score
  repositoriesCreated: number;          // Number of repositories created
  joinedAt: Date;                       // Platform join date
  topHashtags: string[];                // Most used hashtag names only
}

/**
 * Daily Activity Interface (IDailyActivity)
 * 
 * Daily activity tracking for user engagement patterns
 * and community participation analysis.
 */
export interface IDailyActivity {
  date: Date;                           // Activity date
  posts: number;                        // Posts created on this date
  comments: number;                     // Comments posted on this date
  upvotes: number;                      // Upvotes given on this date
  karma: number;                        // Karma earned on this date
}

/**
 * Hashtag Statistics Interface (IHashtagStat)
 * 
 * User hashtag usage and engagement statistics for content
 * analysis and topic affinity tracking.
 */
export interface IHashtagStat {
  hashtag: string;                      // Hashtag name
  count: number;                        // Number of times used
  engagement: number;                   // Average engagement for this hashtag
}

// ============================================================================
// Authentication and Security
// ============================================================================

/**
 * Notification Token Interface (INotificationToken)
 * 
 * Device-specific push notification tokens for multi-platform
 * notification delivery and device management.
 */
export interface INotificationToken {
  token: string;                        // Device notification token
  platform: 'web' | 'ios' | 'android'; // Platform type for token
  deviceId?: string;                    // Optional device identifier
  createdAt: Date;                      // Token registration date
  lastUsedAt: Date;                     // Last successful notification delivery
}

/**
 * API Key Interface (IApiKey)
 * 
 * API access key management for third-party integrations
 * with granular permissions and rate limiting.
 * 
 * API Features:
 * - Named API keys for organization and tracking
 * - Granular permission system for security
 * - Rate limiting to prevent abuse
 * - Usage tracking and analytics
 * - Expiration dates for security rotation
 * - Activity monitoring and audit trails
 */
export interface IApiKey {
  key: string;                          // API key value (hashed in storage)
  name: string;                         // User-friendly name for the key
  permissions: ApiPermission[];         // Array of granted permissions
  rateLimit: number;                    // Requests per minute limit
  createdAt: Date;                      // Key creation timestamp
  lastUsedAt?: Date;                    // Last API request timestamp
  expiresAt?: Date;                     // Optional expiration date
  isActive: boolean;                    // Whether the key is currently active
}

/**
 * User Session Interface (IUserSession)
 * 
 * Authentication session management with device tracking
 * and security monitoring for account protection.
 */
export interface IUserSession {
  userId: string;                       // User ID for the session
  token: string;                        // Session authentication token
  refreshToken: string;                 // Token for session renewal
  deviceInfo: {                         // Device information for security
    userAgent: string;                  // Browser/app user agent
    ip: string;                         // IP address for location tracking
    platform?: string;                  // Platform type (web, mobile, etc.)
  };
  createdAt: Date;                      // Session creation timestamp
  expiresAt: Date;                      // Session expiration timestamp
  lastActivityAt: Date;                 // Last activity in this session
}

// ============================================================================
// User Invitations and Onboarding
// ============================================================================

/**
 * User Invite Interface (IUserInvite)
 * 
 * User invitation system for controlled platform growth and
 * community building through trusted referrals.
 * 
 * Invitation Features:
 * - Email-based invitation system with unique codes
 * - Invitation tracking and status management
 * - Expiration dates for security and freshness
 * - Invitation history and referral tracking
 * - Community growth analytics and insights
 */
export interface IUserInvite {
  email: string;                        // Email address of invitee
  invitedBy: string;                    // User ID of the person sending invite
  inviteCode: string;                   // Unique invitation code
  status: InviteStatus;                 // Current invitation status
  createdAt: Date;                      // Invitation creation timestamp
  acceptedAt?: Date;                    // When invitation was accepted
  expiresAt: Date;                      // Invitation expiration timestamp
}

// ============================================================================
// Karma and Achievement System
// ============================================================================

/**
 * Karma Transaction Interface (IKarmaTransaction)
 * 
 * Individual karma transaction tracking for reputation system
 * transparency and audit trail maintenance.
 * 
 * Karma Features:
 * - Detailed transaction logging for transparency
 * - Multiple karma earning and losing mechanisms
 * - Entity relationship tracking for context
 * - Comprehensive audit trail for reputation integrity
 * - Analytics support for karma distribution analysis
 */
export interface IKarmaTransaction {
  userId: string;                       // User whose karma is affected
  amount: number;                       // Karma change amount (positive or negative)
  type: KarmaActionType;                // Type of action that triggered karma change
  reason: string;                       // Human-readable reason for karma change
  relatedEntityId?: string;             // ID of related post, comment, or repository
  relatedEntityType?: 'post' | 'comment' | 'repository'; // Type of related entity
  createdAt: Date;                      // Transaction timestamp
}

/**
 * User Milestone Interface (IUserMilestone)
 * 
 * Achievement milestone tracking for user progression and
 * community engagement gamification.
 * 
 * Milestone Features:
 * - Progressive achievement tracking with completion status
 * - Reward system for milestone completion
 * - Progress tracking for transparency and motivation
 * - Multiple reward types (karma, badges, features)
 * - Community recognition and leaderboard integration
 */
export interface IUserMilestone {
  type: MilestoneType;                  // Type of milestone being tracked
  achieved: boolean;                    // Whether milestone has been completed
  achievedAt?: Date;                    // When milestone was achieved
  progress: number;                     // Current progress towards milestone
  target: number;                       // Target value needed to complete milestone
  reward?: {                            // Rewards for completing milestone
    karma?: number;                     // Karma points awarded
    badge?: string;                     // Badge ID awarded
    feature?: string;                   // Platform feature unlocked
  };
}

// ============================================================================
// Enumeration Definitions
// ============================================================================

/**
 * User Role Enumeration
 * 
 * Platform role hierarchy for access control and
 * permission management with escalating privileges.
 */
export enum UserRole {
  USER = 'user',                        // Standard user with basic permissions
  MODERATOR = 'moderator',              // Community moderator with content management
  ADMIN = 'admin',                      // Platform administrator with full access
  CURATOR = 'curator',                  // Content curator with enhanced privileges
  DEVELOPER = 'developer'               // Developer with API and system access
}

/**
 * User Status Enumeration
 * 
 * Account status states for user lifecycle management
 * and community moderation controls.
 */
export enum UserStatus {
  ACTIVE = 'active',                    // Active user with full privileges
  INACTIVE = 'inactive',                // Inactive user (dormant account)
  SUSPENDED = 'suspended',              // Temporarily suspended user
  BANNED = 'banned',                    // Permanently banned user
  DELETED = 'deleted'                   // Soft-deleted user account
}

/**
 * Digest Frequency Enumeration
 * 
 * Email digest delivery frequency options for
 * personalized content consumption preferences.
 */
export enum DigestFrequency {
  DAILY = 'daily',                      // Daily digest delivery
  WEEKLY = 'weekly',                    // Weekly digest delivery
  MONTHLY = 'monthly',                  // Monthly digest delivery
  NEVER = 'never'                       // No digest emails
}

/**
 * Post Visibility Enumeration
 * 
 * Content visibility levels for user-generated content
 * with privacy and audience targeting controls.
 */
export enum PostVisibility {
  PUBLIC = 'public',                    // Visible to all users and search engines
  FOLLOWERS = 'followers',              // Visible only to followers
  REPOSITORY = 'repository',            // Visible only within specific repository
  PRIVATE = 'private'                   // Visible only to author
}

/**
 * Profile Visibility Enumeration
 * 
 * User profile visibility levels for privacy control
 * and community interaction management.
 */
export enum ProfileVisibility {
  PUBLIC = 'public',                    // Profile visible to everyone
  REGISTERED = 'registered',            // Profile visible to registered users only
  FOLLOWERS = 'followers',              // Profile visible to followers only
  PRIVATE = 'private'                   // Profile visible only to user
}

/**
 * Message Permission Enumeration
 * 
 * Direct messaging permission levels for communication
 * control and spam prevention.
 */
export enum MessagePermission {
  EVERYONE = 'everyone',                // Accept messages from anyone
  FOLLOWERS = 'followers',              // Accept messages from followers only
  FOLLOWING = 'following',              // Accept messages from users being followed
  NOBODY = 'nobody'                     // Do not accept any direct messages
}

/**
 * Badge Type Enumeration
 * 
 * Achievement badge categories for user recognition
 * and community contribution acknowledgment.
 */
export enum BadgeType {
  KARMA = 'karma',                      // Karma-based achievement badges
  POSTS = 'posts',                      // Post creation achievement badges
  QUALITY = 'quality',                  // Content quality achievement badges
  CURATOR = 'curator',                  // Content curation achievement badges
  HELPER = 'helper',                    // Community assistance achievement badges
  PIONEER = 'pioneer',                  // Early adoption achievement badges
  CONTRIBUTOR = 'contributor',          // Platform contribution achievement badges
  SPECIAL = 'special'                   // Special recognition achievement badges
}

/**
 * API Permission Enumeration
 * 
 * Granular API access permissions for third-party
 * integrations and security control.
 */
export enum ApiPermission {
  READ_POSTS = 'read_posts',            // Permission to read posts via API
  WRITE_POSTS = 'write_posts',          // Permission to create/edit posts via API
  READ_COMMENTS = 'read_comments',      // Permission to read comments via API
  WRITE_COMMENTS = 'write_comments',    // Permission to create/edit comments via API
  READ_REPOSITORIES = 'read_repositories', // Permission to read repositories via API
  WRITE_REPOSITORIES = 'write_repositories', // Permission to manage repositories via API
  READ_USERS = 'read_users',            // Permission to read user data via API
  MANAGE_ACCOUNT = 'manage_account'     // Permission to manage user account via API
}

/**
 * Invite Status Enumeration
 * 
 * Invitation lifecycle states for tracking and
 * invitation management.
 */
export enum InviteStatus {
  PENDING = 'pending',                  // Invitation sent but not yet accepted
  ACCEPTED = 'accepted',                // Invitation accepted and account created
  EXPIRED = 'expired',                  // Invitation expired without acceptance
  REVOKED = 'revoked'                   // Invitation manually revoked
}

/**
 * Karma Action Type Enumeration
 * 
 * Comprehensive karma earning and losing actions for
 * reputation system transparency and game mechanics.
 */
export enum KarmaActionType {
  POST_CREATED = 'post_created',        // Karma for creating a post
  POST_UPVOTED = 'post_upvoted',        // Karma for receiving post upvote
  POST_DOWNVOTED = 'post_downvoted',    // Karma loss for receiving post downvote
  COMMENT_CREATED = 'comment_created',  // Karma for creating a comment
  COMMENT_UPVOTED = 'comment_upvoted',  // Karma for receiving comment upvote
  COMMENT_DOWNVOTED = 'comment_downvoted', // Karma loss for receiving comment downvote
  REPOSITORY_CREATED = 'repository_created', // Karma for creating a repository
  REPOSITORY_JOINED = 'repository_joined', // Karma for joining a repository
  CSV_UPLOADED = 'csv_uploaded',        // Karma for uploading CSV data
  EMAIL_SENT = 'email_sent',            // Karma for sending emails through platform
  CURATED_CONTENT = 'curated_content',  // Karma for quality content curation
  MILESTONE_ACHIEVED = 'milestone_achieved', // Karma for achieving milestones
  BADGE_EARNED = 'badge_earned',        // Karma for earning achievement badges
  DAILY_LOGIN = 'daily_login'           // Karma for daily platform engagement
}

/**
 * Milestone Type Enumeration
 * 
 * Achievement milestone categories for user progression
 * tracking and community engagement gamification.
 */
export enum MilestoneType {
  FIRST_POST = 'first_post',            // First post creation milestone
  FIRST_COMMENT = 'first_comment',      // First comment creation milestone
  FIRST_REPOSITORY = 'first_repository', // First repository creation milestone
  KARMA_100 = 'karma_100',              // Reaching 100 karma points
  KARMA_500 = 'karma_500',              // Reaching 500 karma points
  KARMA_1000 = 'karma_1000',            // Reaching 1000 karma points
  KARMA_5000 = 'karma_5000',            // Reaching 5000 karma points
  POSTS_10 = 'posts_10',                // Creating 10 posts
  POSTS_50 = 'posts_50',                // Creating 50 posts
  POSTS_100 = 'posts_100',              // Creating 100 posts
  QUALITY_CONTRIBUTOR = 'quality_contributor', // High-quality content creator
  COMMUNITY_BUILDER = 'community_builder',     // Active community participant
  SNOWBALL_MASTER = 'snowball_master'   // Master of viral content distribution
}

// ============================================================================
// Utility Functions and Type Guards
// ============================================================================

/**
 * Type guard function to check if user has admin privileges.
 * Used for authorization and permission validation.
 */
export const isUserAdmin = (user: IUser): boolean => 
  user.role === UserRole.ADMIN;

/**
 * Type guard function to check if user has moderator or higher privileges.
 * Used for content moderation and community management features.
 */
export const isUserModerator = (user: IUser): boolean => 
  user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;

/**
 * Type guard function to check if user has curator or higher privileges.
 * Used for content curation and quality control features.
 */
export const isUserCurator = (user: IUser): boolean => 
  user.role === UserRole.CURATOR || isUserModerator(user);

/**
 * Type guard function to check if user can create posts.
 * Validates account status and email verification requirements.
 */
export const canUserPost = (user: IUser): boolean => 
  user.status === UserStatus.ACTIVE && user.emailVerified;

/**
 * Type guard function to check if user has achieved a specific milestone.
 * Used for feature unlocking and achievement validation.
 */
export const hasUserAchievedMilestone = (user: IUser, milestone: MilestoneType): boolean => 
  user.karma >= getMilestoneKarmaRequirement(milestone);

/**
 * Utility function to get karma requirement for specific milestones.
 * Used for achievement validation and progress tracking.
 */
export const getMilestoneKarmaRequirement = (milestone: MilestoneType): number => {
  const requirements: Record<MilestoneType, number> = {
    [MilestoneType.FIRST_POST]: 0,
    [MilestoneType.FIRST_COMMENT]: 0,
    [MilestoneType.FIRST_REPOSITORY]: 0,
    [MilestoneType.KARMA_100]: 100,
    [MilestoneType.KARMA_500]: 500,
    [MilestoneType.KARMA_1000]: 1000,
    [MilestoneType.KARMA_5000]: 5000,
    [MilestoneType.POSTS_10]: 0,
    [MilestoneType.POSTS_50]: 0,
    [MilestoneType.POSTS_100]: 0,
    [MilestoneType.QUALITY_CONTRIBUTOR]: 1000,
    [MilestoneType.COMMUNITY_BUILDER]: 2000,
    [MilestoneType.SNOWBALL_MASTER]: 3000
  };
  return requirements[milestone];
};
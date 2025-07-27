/**
 * User Types and Interfaces - User Management and Authentication System
 * 
 * Comprehensive type definitions for the ShadowNews user management system.
 * This file contains all interfaces and types related to user profiles,
 * authentication, preferences, gamification, and social features.
 * 
 * User System Features:
 * - Authentication: Secure login and session management
 * - Profile Management: Comprehensive user profiles with customization
 * - Karma System: Reputation tracking and gamification
 * - Preferences: Granular user setting and notification control
 * - Social Features: Following, blocking, and interaction management
 * - Badge System: Achievement tracking and recognition
 * - Email Integration: ShadowNews email addresses and digest management
 * 
 * Authentication and Security:
 * - JWT-based Authentication: Secure token-based session management
 * - Email Verification: Multi-step email validation process
 * - Role-based Access: Hierarchical permission system
 * - Privacy Controls: Granular data sharing and visibility settings
 * - Account Security: Password management and security features
 * - Session Management: Multi-device session tracking and control
 * 
 * Gamification and Engagement:
 * - Karma System: Community-driven reputation scoring
 * - Badge System: Achievement recognition and progression
 * - Milestone Tracking: Progress towards reputation goals
 * - Activity Monitoring: User engagement and contribution tracking
 * - Leaderboards: Community recognition and competition
 * - Reward System: Incentives for quality contributions
 * 
 * Social and Communication:
 * - Follow System: Tag-based interest tracking
 * - Blocking: User interaction control and harassment prevention
 * - Notification Management: Granular notification preferences
 * - Email Digests: Automated content curation and delivery
 * - Repository Management: Email repository ownership and collaboration
 * - Community Features: User interaction and engagement tools
 * 
 * @author ShadowNews Team
 * @version 2.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/* =============================================================================
   Core User Types
   Primary user structure and management
   ============================================================================= */

/**
 * User Interface
 * Complete user profile with all features and metadata
 * 
 * @interface User
 * @description Core user entity with profile, preferences, and social features
 * 
 * Features:
 * - Profile Management: Complete user profile with customization
 * - Authentication: Secure identity and session management
 * - Karma System: Reputation tracking and community standing
 * - Social Features: Following, blocking, and interaction management
 * - Email Integration: ShadowNews email and digest management
 * - Gamification: Badge system and achievement tracking
 * - Privacy: Granular privacy and visibility controls
 */
export interface User {
 /** Unique user identifier */
 id: string;
 
 /** Unique username for platform identification */
 username: string;
 
 /** User's primary email address */
 email: string;
 
 /** Auto-generated ShadowNews email for platform features */
 shadownewsEmail: string;
 
 /** Optional avatar URL for profile display */
 avatar?: string;
 
 /** Optional user biography and description */
 bio?: string;
 
 /** User karma points reflecting community standing */
 karma: number;
 
 /** Account creation timestamp */
 createdAt: string;
 
 /** Last profile update timestamp */
 updatedAt: string;
 
 /** Last activity timestamp for presence tracking */
 lastActiveAt: string;
 
 /** Whether user's email address has been verified */
 isEmailVerified: boolean;
 
 /** Whether user account is currently active */
 isActive: boolean;
 
 /** User's role determining platform permissions */
 role: UserRole;
 
 /** User preferences and settings */
 preferences: UserPreferences;
 
 /** Array of earned badges and achievements */
 badges: Badge[];
 
 /** Array of repository IDs owned by user */
 repositories: string[];
 
 /** Array of hashtags user follows for personalization */
 followedTags: string[];
 
 /** Array of user IDs that have been blocked */
 blockedUsers: string[];
}

/**
 * User Role Enumeration
 * Hierarchical permission levels for platform access
 * 
 * @enum UserRole
 * @description Different user roles with varying permissions
 */
export enum UserRole {
 /** Standard user with basic platform access */
 USER = 'user',
 
 /** Moderator with content management permissions */
 MODERATOR = 'moderator',
 
 /** Administrator with full platform control */
 ADMIN = 'admin',
 
 /** Curator with specialized content curation permissions */
 CURATOR = 'curator'
}

/**
 * User Preferences Interface
 * Comprehensive user setting and preference management
 * 
 * @interface UserPreferences
 * @description User-configurable settings and preferences
 * 
 * Features:
 * - Theme Selection: UI appearance customization
 * - Email Preferences: Digest and notification settings
 * - Privacy Controls: Data sharing and visibility settings
 * - Notification Management: Granular notification preferences
 */
export interface UserPreferences {
 /** UI theme preference */
 theme: 'light' | 'dark' | 'auto';
 
 /** Frequency for email digest delivery */
 emailDigestFrequency: DigestFrequency;
 
 /** Detailed notification preferences */
 notificationSettings: NotificationSettings;
 
 /** Privacy and data sharing controls */
 privacySettings: PrivacySettings;
 displaySettings: DisplaySettings;
}

export enum DigestFrequency {
 NEVER = 'never',
 DAILY = 'daily',
 WEEKLY = 'weekly',
 MONTHLY = 'monthly'
}

export interface NotificationSettings {
 emailNotifications: {
   newFollower: boolean;
   postUpvoted: boolean;
   commentReply: boolean;
   repositoryInvite: boolean;
   digestEmail: boolean;
   snowballUpdate: boolean;
 };
 pushNotifications: {
   enabled: boolean;
   newFollower: boolean;
   postUpvoted: boolean;
   commentReply: boolean;
   trending: boolean;
 };
 inAppNotifications: {
   showCount: boolean;
   playSound: boolean;
 };
}

export interface PrivacySettings {
 profileVisibility: 'public' | 'private' | 'followers';
 showEmail: boolean;
 allowRepositoryInvites: boolean;
 allowSnowballInclusion: boolean;
 anonymousPosting: boolean;
 dataSharing: {
   analytics: boolean;
   improvements: boolean;
   thirdParty: boolean;
 };
}

export interface DisplaySettings {
 postsPerPage: number;
 defaultSort: PostSortOrder;
 showKarmaBreakdown: boolean;
 compactView: boolean;
 showRepositoryStats: boolean;
 autoplayVideos: boolean;
 fontSize: 'small' | 'medium' | 'large';
}

export enum PostSortOrder {
 HOT = 'hot',
 NEW = 'new',
 TOP = 'top',
 RISING = 'rising',
 CONTROVERSIAL = 'controversial'
}

export interface Badge {
 id: string;
 type: BadgeType;
 name: string;
 description: string;
 icon: string;
 earnedAt: string;
 tier?: BadgeTier;
}

export enum BadgeType {
 KARMA_MILESTONE = 'karma_milestone',
 POST_COUNT = 'post_count',
 COMMENT_COUNT = 'comment_count',
 REPOSITORY_CREATOR = 'repository_creator',
 SNOWBALL_MASTER = 'snowball_master',
 CURATOR = 'curator',
 EARLY_ADOPTER = 'early_adopter',
 CONTRIBUTOR = 'contributor',
 HELPFUL = 'helpful',
 VERIFIED = 'verified'
}

export enum BadgeTier {
 BRONZE = 'bronze',
 SILVER = 'silver',
 GOLD = 'gold',
 PLATINUM = 'platinum'
}

export interface UserStats {
 totalPosts: number;
 totalComments: number;
 totalUpvotesGiven: number;
 totalUpvotesReceived: number;
 averagePostKarma: number;
 repositoriesCreated: number;
 repositoriesJoined: number;
 emailsContributed: number;
 snowballReach: number;
 curatorScore?: number;
}

export interface UserActivity {
 id: string;
 userId: string;
 type: ActivityType;
 timestamp: string;
 details: ActivityDetails;
}

export enum ActivityType {
 POST_CREATED = 'post_created',
 COMMENT_CREATED = 'comment_created',
 POST_UPVOTED = 'post_upvoted',
 COMMENT_UPVOTED = 'comment_upvoted',
 REPOSITORY_CREATED = 'repository_created',
 REPOSITORY_JOINED = 'repository_joined',
 CSV_UPLOADED = 'csv_uploaded',
 EMAIL_SENT = 'email_sent',
 BADGE_EARNED = 'badge_earned',
 MILESTONE_REACHED = 'milestone_reached'
}

export interface ActivityDetails {
 targetId?: string;
 targetType?: 'post' | 'comment' | 'repository' | 'user';
 targetTitle?: string;
 metadata?: Record<string, any>;
}

export interface UserSession {
 userId: string;
 token: string;
 refreshToken: string;
 expiresAt: string;
 deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
 userAgent: string;
 platform: string;
 isMobile: boolean;
 isPWA: boolean;
}

export interface AuthState {
 user: User | null;
 session: UserSession | null;
 isAuthenticated: boolean;
 isLoading: boolean;
 error: string | null;
}

export interface LoginCredentials {
 email: string;
 password: string;
 rememberMe?: boolean;
}

export interface RegisterData {
 username: string;
 email: string;
 password: string;
 confirmPassword: string;
 acceptTerms: boolean;
 subscribeNewsletter?: boolean;
}

export interface UpdateProfileData {
 username?: string;
 bio?: string;
 avatar?: string;
 preferences?: Partial<UserPreferences>;
}

export interface PasswordResetRequest {
 email: string;
}

export interface PasswordResetConfirm {
 token: string;
 newPassword: string;
 confirmPassword: string;
}

export interface KarmaTransaction {
 id: string;
 userId: string;
 amount: number;
 type: KarmaTransactionType;
 reason: string;
 timestamp: string;
 relatedId?: string;
 relatedType?: 'post' | 'comment' | 'repository';
}

export enum KarmaTransactionType {
 POST_UPVOTED = 'post_upvoted',
 POST_DOWNVOTED = 'post_downvoted',
 COMMENT_UPVOTED = 'comment_upvoted',
 COMMENT_DOWNVOTED = 'comment_downvoted',
 POST_CREATED = 'post_created',
 COMMENT_CREATED = 'comment_created',
 REPOSITORY_CREATED = 'repository_created',
 CSV_CONTRIBUTED = 'csv_contributed',
 CURATOR_BONUS = 'curator_bonus',
 MILESTONE_BONUS = 'milestone_bonus',
 PENALTY = 'penalty'
}

export interface UserRepository {
 repositoryId: string;
 role: RepositoryRole;
 joinedAt: string;
 emailsContributed: number;
 lastActivity: string;
}

export enum RepositoryRole {
 OWNER = 'owner',
 MODERATOR = 'moderator',
 CONTRIBUTOR = 'contributor',
 MEMBER = 'member'
}

export interface EmailCommand {
 command: EmailCommandType;
 subject: string;
 body?: string;
 attachments?: EmailAttachment[];
 timestamp: string;
}

export enum EmailCommandType {
 POST = 'POST',
 COMMENT = 'COMMENT',
 UPVOTE = 'UPVOTE',
 SUBSCRIBE = 'SUBSCRIBE',
 UNSUBSCRIBE = 'UNSUBSCRIBE',
 STATS = 'STATS',
 HELP = 'HELP'
}

export interface EmailAttachment {
 filename: string;
 mimeType: string;
 size: number;
 url?: string;
}

export interface CuratorStats {
 userId: string;
 curatorScore: number;
 postsReviewed: number;
 accuracyRate: number;
 flaggedContent: number;
 approvedContent: number;
 weightMultiplier: number;
 specializations: string[];
}

export interface UserInvite {
 id: string;
 inviterId: string;
 inviteeEmail: string;
 type: InviteType;
 targetId?: string;
 status: InviteStatus;
 createdAt: string;
 expiresAt: string;
 acceptedAt?: string;
}

export enum InviteType {
 PLATFORM = 'platform',
 REPOSITORY = 'repository',
 MODERATOR = 'moderator'
}

export enum InviteStatus {
 PENDING = 'pending',
 ACCEPTED = 'accepted',
 DECLINED = 'declined',
 EXPIRED = 'expired'
}

export interface UserBlock {
 id: string;
 blockerId: string;
 blockedUserId: string;
 reason?: string;
 createdAt: string;
}

export interface UserReport {
 id: string;
 reporterId: string;
 reportedUserId: string;
 reason: ReportReason;
 description: string;
 status: ReportStatus;
 createdAt: string;
 resolvedAt?: string;
 resolvedBy?: string;
}

export enum ReportReason {
 SPAM = 'spam',
 HARASSMENT = 'harassment',
 INAPPROPRIATE_CONTENT = 'inappropriate_content',
 IMPERSONATION = 'impersonation',
 OTHER = 'other'
}

export enum ReportStatus {
 PENDING = 'pending',
 INVESTIGATING = 'investigating',
 RESOLVED = 'resolved',
 DISMISSED = 'dismissed'
}

export interface UserNotification {
 id: string;
 userId: string;
 type: NotificationType;
 title: string;
 message: string;
 isRead: boolean;
 actionUrl?: string;
 metadata?: Record<string, any>;
 createdAt: string;
 readAt?: string;
}

export enum NotificationType {
 POST_UPVOTED = 'post_upvoted',
 COMMENT_REPLY = 'comment_reply',
 NEW_FOLLOWER = 'new_follower',
 REPOSITORY_INVITE = 'repository_invite',
 MILESTONE_REACHED = 'milestone_reached',
 BADGE_EARNED = 'badge_earned',
 SNOWBALL_UPDATE = 'snowball_update',
 SYSTEM = 'system'
}

export interface UserApiKey {
 id: string;
 userId: string;
 name: string;
 key: string;
 permissions: ApiPermission[];
 lastUsed?: string;
 createdAt: string;
 expiresAt?: string;
 isActive: boolean;
}

export enum ApiPermission {
 READ_POSTS = 'read_posts',
 WRITE_POSTS = 'write_posts',
 READ_REPOSITORIES = 'read_repositories',
 WRITE_REPOSITORIES = 'write_repositories',
 READ_USERS = 'read_users',
 MANAGE_ACCOUNT = 'manage_account'
}
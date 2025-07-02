export interface User {
 id: string;
 username: string;
 email: string;
 shadownewsEmail: string;
 avatar?: string;
 bio?: string;
 karma: number;
 createdAt: string;
 updatedAt: string;
 lastActiveAt: string;
 isEmailVerified: boolean;
 isActive: boolean;
 role: UserRole;
 preferences: UserPreferences;
 badges: Badge[];
 repositories: string[];
 followedTags: string[];
 blockedUsers: string[];
}

export enum UserRole {
 USER = 'user',
 MODERATOR = 'moderator',
 ADMIN = 'admin',
 CURATOR = 'curator'
}

export interface UserPreferences {
 theme: 'light' | 'dark' | 'auto';
 emailDigestFrequency: DigestFrequency;
 notificationSettings: NotificationSettings;
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
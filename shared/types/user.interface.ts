export interface IUser {
  _id: string;
  username: string;
  email: string;
  shadowEmail: string; // username@shadownews.community
  displayName: string;
  bio?: string;
  avatar?: string;
  karma: number;
  badges: IBadge[];
  joinedAt: Date;
  lastActiveAt: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  role: UserRole;
  status: UserStatus;
  preferences: IUserPreferences;
  repositories: string[]; // Repository IDs
  following: string[]; // User IDs
  followers: string[]; // User IDs
  blockedUsers: string[]; // User IDs
  notificationTokens: INotificationToken[];
  apiKeys: IApiKey[];
  stats: IUserStats;
  privacy: IPrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  _id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  karma: number;
  badges: IBadge[];
  joinedAt: Date;
  stats: IUserStatsPublic;
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailDigest: {
    enabled: boolean;
    frequency: DigestFrequency;
    topics: string[]; // Hashtags
    includeFollowing: boolean;
    includeRepositories: boolean;
  };
  notifications: {
    email: {
      comments: boolean;
      mentions: boolean;
      follows: boolean;
      upvotes: boolean;
      repositoryInvites: boolean;
      repositoryUpdates: boolean;
      announcements: boolean;
    };
    push: {
      enabled: boolean;
      comments: boolean;
      mentions: boolean;
      directMessages: boolean;
    };
    inApp: {
      enabled: boolean;
      sound: boolean;
    };
  };
  display: {
    showKarma: boolean;
    showEmail: boolean;
    compactView: boolean;
    autoplayVideos: boolean;
    showNSFW: boolean;
  };
  posting: {
    defaultVisibility: PostVisibility;
    signatureEnabled: boolean;
    signature?: string;
    autoSaveEnabled: boolean;
    autoSaveInterval: number; // seconds
  };
}

export interface IPrivacySettings {
  profileVisibility: ProfileVisibility;
  showActivity: boolean;
  showRepositories: boolean;
  allowDirectMessages: MessagePermission;
  allowRepositoryInvites: boolean;
  searchEngineIndexing: boolean;
  dataSharing: {
    analytics: boolean;
    improvements: boolean;
    marketing: boolean;
  };
  blockedDomains: string[]; // Email domains
}

export interface IBadge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  progress?: number; // For progressive badges
  level?: number; // For tiered badges
}

export interface IUserStats {
  posts: number;
  comments: number;
  upvotesGiven: number;
  upvotesReceived: number;
  repositoriesCreated: number;
  repositoriesJoined: number;
  emailsSent: number;
  emailsReceived: number;
  csvUploads: number;
  snowballReach: number; // Total emails reached through snowball
  dailyActivity: IDailyActivity[];
  topHashtags: IHashtagStat[];
  engagementRate: number;
  qualityScore: number; // AI-calculated content quality
}

export interface IUserStatsPublic {
  posts: number;
  comments: number;
  karma: number;
  repositoriesCreated: number;
  joinedAt: Date;
  topHashtags: string[];
}

export interface IDailyActivity {
  date: Date;
  posts: number;
  comments: number;
  upvotes: number;
  karma: number;
}

export interface IHashtagStat {
  hashtag: string;
  count: number;
  engagement: number;
}

export interface INotificationToken {
  token: string;
  platform: 'web' | 'ios' | 'android';
  deviceId?: string;
  createdAt: Date;
  lastUsedAt: Date;
}

export interface IApiKey {
  key: string;
  name: string;
  permissions: ApiPermission[];
  rateLimit: number;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface IUserSession {
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    platform?: string;
  };
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export interface IUserInvite {
  email: string;
  invitedBy: string; // User ID
  inviteCode: string;
  status: InviteStatus;
  createdAt: Date;
  acceptedAt?: Date;
  expiresAt: Date;
}

export interface IKarmaTransaction {
  userId: string;
  amount: number;
  type: KarmaActionType;
  reason: string;
  relatedEntityId?: string; // Post, Comment, or Repository ID
  relatedEntityType?: 'post' | 'comment' | 'repository';
  createdAt: Date;
}

export interface IUserMilestone {
  type: MilestoneType;
  achieved: boolean;
  achievedAt?: Date;
  progress: number;
  target: number;
  reward?: {
    karma?: number;
    badge?: string;
    feature?: string;
  };
}

// Enums
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  CURATOR = 'curator',
  DEVELOPER = 'developer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DELETED = 'deleted'
}

export enum DigestFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never'
}

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  REPOSITORY = 'repository',
  PRIVATE = 'private'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  REGISTERED = 'registered',
  FOLLOWERS = 'followers',
  PRIVATE = 'private'
}

export enum MessagePermission {
  EVERYONE = 'everyone',
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',
  NOBODY = 'nobody'
}

export enum BadgeType {
  KARMA = 'karma',
  POSTS = 'posts',
  QUALITY = 'quality',
  CURATOR = 'curator',
  HELPER = 'helper',
  PIONEER = 'pioneer',
  CONTRIBUTOR = 'contributor',
  SPECIAL = 'special'
}

export enum ApiPermission {
  READ_POSTS = 'read_posts',
  WRITE_POSTS = 'write_posts',
  READ_COMMENTS = 'read_comments',
  WRITE_COMMENTS = 'write_comments',
  READ_REPOSITORIES = 'read_repositories',
  WRITE_REPOSITORIES = 'write_repositories',
  READ_USERS = 'read_users',
  MANAGE_ACCOUNT = 'manage_account'
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export enum KarmaActionType {
  POST_CREATED = 'post_created',
  POST_UPVOTED = 'post_upvoted',
  POST_DOWNVOTED = 'post_downvoted',
  COMMENT_CREATED = 'comment_created',
  COMMENT_UPVOTED = 'comment_upvoted',
  COMMENT_DOWNVOTED = 'comment_downvoted',
  REPOSITORY_CREATED = 'repository_created',
  REPOSITORY_JOINED = 'repository_joined',
  CSV_UPLOADED = 'csv_uploaded',
  EMAIL_SENT = 'email_sent',
  CURATED_CONTENT = 'curated_content',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  BADGE_EARNED = 'badge_earned',
  DAILY_LOGIN = 'daily_login'
}

export enum MilestoneType {
  FIRST_POST = 'first_post',
  FIRST_COMMENT = 'first_comment',
  FIRST_REPOSITORY = 'first_repository',
  KARMA_100 = 'karma_100',
  KARMA_500 = 'karma_500',
  KARMA_1000 = 'karma_1000',
  KARMA_5000 = 'karma_5000',
  POSTS_10 = 'posts_10',
  POSTS_50 = 'posts_50',
  POSTS_100 = 'posts_100',
  QUALITY_CONTRIBUTOR = 'quality_contributor',
  COMMUNITY_BUILDER = 'community_builder',
  SNOWBALL_MASTER = 'snowball_master'
}

// Type guards
export const isUserAdmin = (user: IUser): boolean => 
  user.role === UserRole.ADMIN;

export const isUserModerator = (user: IUser): boolean => 
  user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;

export const isUserCurator = (user: IUser): boolean => 
  user.role === UserRole.CURATOR || isUserModerator(user);

export const canUserPost = (user: IUser): boolean => 
  user.status === UserStatus.ACTIVE && user.emailVerified;

export const hasUserAchievedMilestone = (user: IUser, milestone: MilestoneType): boolean => 
  user.karma >= getMilestoneKarmaRequirement(milestone);

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
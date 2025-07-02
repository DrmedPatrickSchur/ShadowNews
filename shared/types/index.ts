// User types
export interface User {
  _id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  karma: number;
  role: UserRole;
  emailVerified: boolean;
  privateEmail: string;
  shadownewsEmail: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  settings: UserSettings;
  badges: Badge[];
  repositories: string[];
  following: string[];
  followers: string[];
  blockedUsers: string[];
  notificationPreferences: NotificationPreferences;
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  CURATOR = 'curator'
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  emailDigestFrequency: 'daily' | 'weekly' | 'never';
  showEmail: boolean;
  allowSnowballInclusion: boolean;
  autoSubscribeToReplies: boolean;
  privateMode: boolean;
  language: string;
  timezone: string;
}

export interface NotificationPreferences {
  email: {
    comments: boolean;
    mentions: boolean;
    follows: boolean;
    repositoryUpdates: boolean;
    weeklyDigest: boolean;
    snowballNotifications: boolean;
  };
  push: {
    comments: boolean;
    mentions: boolean;
    follows: boolean;
    trending: boolean;
  };
}

export interface Badge {
  type: BadgeType;
  awardedAt: Date;
  value?: number;
}

export enum BadgeType {
  EARLY_ADOPTER = 'early_adopter',
  GOLDEN_CURATOR = 'golden_curator',
  REPOSITORY_CREATOR = 'repository_creator',
  KARMA_MILESTONE = 'karma_milestone',
  CONTRIBUTOR = 'contributor',
  VERIFIED = 'verified'
}

// Post types
export interface Post {
  _id: string;
  title: string;
  url?: string;
  text?: string;
  author: string | User;
  points: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  hashtags: string[];
  repository?: string | Repository;
  upvoters: string[];
  downvoters: string[];
  flags: Flag[];
  edited: boolean;
  editHistory?: EditHistory[];
  aiSuggestedHashtags?: string[];
  emailSource?: EmailSource;
  visibility: PostVisibility;
  sticky: boolean;
  locked: boolean;
}

export enum PostVisibility {
  PUBLIC = 'public',
  REPOSITORY = 'repository',
  PRIVATE = 'private'
}

export interface EditHistory {
  editedAt: Date;
  editedBy: string;
  previousContent: {
    title?: string;
    text?: string;
    url?: string;
  };
}

export interface EmailSource {
  messageId: string;
  fromEmail: string;
  subject: string;
  receivedAt: Date;
  parsed: boolean;
}

// Comment types
export interface Comment {
  _id: string;
  postId: string;
  parentId?: string;
  author: string | User;
  text: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  upvoters: string[];
  downvoters: string[];
  flags: Flag[];
  edited: boolean;
  deleted: boolean;
  children?: Comment[];
  depth: number;
}

// Repository types
export interface Repository {
  _id: string;
  name: string;
  description: string;
  owner: string | User;
  moderators: string[];
  hashtags: string[];
  emails: RepositoryEmail[];
  emailCount: number;
  activeEmailCount: number;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
  settings: RepositorySettings;
  stats: RepositoryStats;
  csvImports: CSVImport[];
  snowballEnabled: boolean;
  visibility: RepositoryVisibility;
  verified: boolean;
  icon?: string;
  coverImage?: string;
}

export enum RepositoryVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite'
}

export interface RepositoryEmail {
  email: string;
  addedAt: Date;
  addedBy: string;
  source: EmailSource;
  verified: boolean;
  active: boolean;
  unsubscribedAt?: Date;
  tags: string[];
  metadata?: Record<string, any>;
}

export enum EmailSource {
  MANUAL = 'manual',
  CSV_IMPORT = 'csv',
  SNOWBALL = 'snowball',
  API = 'api',
  SIGNUP = 'signup'
}

export interface RepositorySettings {
  autoApprove: boolean;
  requireVerification: boolean;
  snowballMultiplier: number;
  qualityThreshold: number;
  allowedDomains: string[];
  blockedDomains: string[];
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
  emailTemplate?: string;
}

export interface RepositoryStats {
  totalEmails: number;
  activeEmails: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  engagementRate: number;
  snowballContribution: number;
  topContributors: string[];
  lastActivityAt: Date;
}

export interface CSVImport {
  _id: string;
  filename: string;
  importedAt: Date;
  importedBy: string;
  rowCount: number;
  successCount: number;
  errorCount: number;
  errors?: CSVError[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CSVError {
  row: number;
  email: string;
  error: string;
}

// Email types
export interface Email {
  _id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: Attachment[];
  sentAt: Date;
  type: EmailType;
  status: EmailStatus;
  repository?: string;
  metadata?: EmailMetadata;
  trackingId?: string;
  opens: number;
  clicks: number;
}

export enum EmailType {
  DIGEST = 'digest',
  NOTIFICATION = 'notification',
  VERIFICATION = 'verification',
  INVITATION = 'invitation',
  POST = 'post',
  SYSTEM = 'system'
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  BOUNCED = 'bounced',
  FAILED = 'failed',
  OPENED = 'opened',
  CLICKED = 'clicked'
}

export interface EmailMetadata {
  postId?: string;
  repositoryId?: string;
  userId?: string;
  campaignId?: string;
  tags?: string[];
}

export interface Attachment {
  filename: string;
  contentType: string;
  size: number;
  url?: string;
}

// Karma types
export interface KarmaTransaction {
  _id: string;
  userId: string;
  amount: number;
  type: KarmaType;
  reason: string;
  relatedId?: string;
  createdAt: Date;
}

export enum KarmaType {
  POST_UPVOTED = 'post_upvoted',
  POST_DOWNVOTED = 'post_downvoted',
  COMMENT_UPVOTED = 'comment_upvoted',
  COMMENT_DOWNVOTED = 'comment_downvoted',
  POST_CREATED = 'post_created',
  COMMENT_CREATED = 'comment_created',
  REPOSITORY_CREATED = 'repository_created',
  CSV_UPLOADED = 'csv_uploaded',
  EMAIL_VERIFIED = 'email_verified',
  CURATOR_BONUS = 'curator_bonus',
  MILESTONE_REACHED = 'milestone_reached',
  FLAGGED_CONTENT = 'flagged_content'
}

// Notification types
export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  COMMENT = 'comment',
  MENTION = 'mention',
  FOLLOW = 'follow',
  UPVOTE = 'upvote',
  REPOSITORY_INVITE = 'repository_invite',
  REPOSITORY_UPDATE = 'repository_update',
  KARMA_MILESTONE = 'karma_milestone',
  SYSTEM = 'system'
}

// Flag types
export interface Flag {
  userId: string;
  reason: FlagReason;
  description?: string;
  createdAt: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export enum FlagReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  OFF_TOPIC = 'off_topic',
  DUPLICATE = 'duplicate',
  MISLEADING = 'misleading',
  OTHER = 'other'
}

// API types
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// WebSocket types
export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export enum WSMessageType {
  POST_CREATED = 'post_created',
  POST_UPDATED = 'post_updated',
  POST_DELETED = 'post_deleted',
  COMMENT_CREATED = 'comment_created',
  COMMENT_UPDATED = 'comment_updated',
  COMMENT_DELETED = 'comment_deleted',
  NOTIFICATION = 'notification',
  REPOSITORY_UPDATE = 'repository_update',
  USER_STATUS = 'user_status',
  SYSTEM = 'system'
}

// Search types
export interface SearchParams {
  query: string;
  filters?: SearchFilters;
  pagination: PaginationParams;
}

export interface SearchFilters {
  type?: ('post' | 'comment' | 'user' | 'repository')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hashtags?: string[];
  authors?: string[];
  repositories?: string[];
  minKarma?: number;
  sortBy?: 'relevance' | 'date' | 'points' | 'comments';
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties?: Record<string, any>;
  page?: string;
  referrer?: string;
  userAgent?: string;
}

export interface RepositoryAnalytics {
  repositoryId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    emailsAdded: number;
    emailsRemoved: number;
    snowballGrowth: number;
    engagementRate: number;
    digestsSent: number;
    opensRate: number;
    clicksRate: number;
  };
  topPerformers: {
    posts: string[];
    contributors: string[];
  };
}

// Session types
export interface Session {
  _id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  device?: {
    type: string;
    os: string;
    browser: string;
  };
}

// Upload types
export interface FileUpload {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  used: boolean;
  metadata?: Record<string, any>;
}

// Export all enums for convenience
export const Enums = {
  UserRole,
  BadgeType,
  PostVisibility,
  RepositoryVisibility,
  EmailSource,
  EmailType,
  EmailStatus,
  KarmaType,
  NotificationType,
  FlagReason,
  WSMessageType
};
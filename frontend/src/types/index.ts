// Core user types
export interface User {
 id: string;
 username: string;
 email: string;
 shadownewsEmail: string;
 karma: number;
 createdAt: Date;
 updatedAt: Date;
 avatar?: string;
 bio?: string;
 badges: Badge[];
 settings: UserSettings;
 repositories: string[];
 isVerified: boolean;
 role: UserRole;
}

export interface UserSettings {
 emailDigestFrequency: DigestFrequency;
 notificationPreferences: NotificationPreferences;
 privacySettings: PrivacySettings;
 theme: 'light' | 'dark' | 'auto';
 timezone: string;
}

export interface NotificationPreferences {
 emailNotifications: boolean;
 pushNotifications: boolean;
 commentReplies: boolean;
 postUpvotes: boolean;
 repositoryUpdates: boolean;
 weeklyDigest: boolean;
}

export interface PrivacySettings {
 showEmail: boolean;
 allowRepositoryInvites: boolean;
 publicProfile: boolean;
 anonymousPosting: boolean;
}

export enum UserRole {
 USER = 'user',
 MODERATOR = 'moderator',
 ADMIN = 'admin',
 CURATOR = 'curator'
}

export enum DigestFrequency {
 DAILY = 'daily',
 WEEKLY = 'weekly',
 MONTHLY = 'monthly',
 NEVER = 'never'
}

// Post and content types
export interface Post {
 id: string;
 title: string;
 url?: string;
 text?: string;
 author: User;
 authorId: string;
 score: number;
 votes: Vote[];
 comments: Comment[];
 commentCount: number;
 hashtags: string[];
 repositories: string[];
 createdAt: Date;
 updatedAt: Date;
 isDeleted: boolean;
 isPinned: boolean;
 editHistory: EditHistory[];
}

export interface Comment {
 id: string;
 postId: string;
 parentId?: string;
 author: User;
 authorId: string;
 text: string;
 score: number;
 votes: Vote[];
 children: Comment[];
 createdAt: Date;
 updatedAt: Date;
 isDeleted: boolean;
 editHistory: EditHistory[];
}

export interface Vote {
 userId: string;
 value: 1 | -1;
 timestamp: Date;
}

export interface EditHistory {
 text: string;
 editedAt: Date;
 editedBy: string;
}

// Repository and email types
export interface Repository {
 id: string;
 name: string;
 description: string;
 owner: User;
 ownerId: string;
 hashtags: string[];
 emails: EmailEntry[];
 emailCount: number;
 subscribers: string[];
 subscriberCount: number;
 isPublic: boolean;
 autoAddThreshold: number;
 snowballEnabled: boolean;
 createdAt: Date;
 updatedAt: Date;
 lastActivityAt: Date;
 stats: RepositoryStats;
 settings: RepositorySettings;
}

export interface EmailEntry {
 id: string;
 email: string;
 name?: string;
 addedBy: string;
 addedAt: Date;
 source: EmailSource;
 verified: boolean;
 tags: string[];
 unsubscribed: boolean;
 bounceCount: number;
 engagementScore: number;
}

export enum EmailSource {
 MANUAL = 'manual',
 CSV_UPLOAD = 'csv_upload',
 SNOWBALL = 'snowball',
 API = 'api',
 FORWARD = 'forward'
}

export interface RepositoryStats {
 totalEmails: number;
 verifiedEmails: number;
 activeEmails: number;
 growthRate: number;
 engagementRate: number;
 snowballMultiplier: number;
 lastSnowballAt?: Date;
}

export interface RepositorySettings {
 requireVerification: boolean;
 allowSnowball: boolean;
 snowballMinEmails: number;
 autoRemoveBounced: boolean;
 customEmailTemplate?: string;
 webhookUrl?: string;
}

// CSV and upload types
export interface CSVUpload {
 id: string;
 fileName: string;
 fileSize: number;
 uploadedBy: string;
 uploadedAt: Date;
 status: UploadStatus;
 totalRows: number;
 processedRows: number;
 validEmails: number;
 invalidEmails: number;
 duplicates: number;
 errors: UploadError[];
}

export enum UploadStatus {
 PENDING = 'pending',
 PROCESSING = 'processing',
 COMPLETED = 'completed',
 FAILED = 'failed',
 PARTIAL = 'partial'
}

export interface UploadError {
 row: number;
 email: string;
 error: string;
}

// Email and digest types
export interface EmailMessage {
 id: string;
 from: string;
 to: string[];
 cc?: string[];
 bcc?: string[];
 subject: string;
 body: string;
 html?: string;
 attachments?: Attachment[];
 messageId: string;
 inReplyTo?: string;
 references?: string[];
 status: EmailStatus;
 sentAt?: Date;
 createdAt: Date;
}

export interface Attachment {
 filename: string;
 contentType: string;
 size: number;
 url: string;
}

export enum EmailStatus {
 QUEUED = 'queued',
 SENDING = 'sending',
 SENT = 'sent',
 FAILED = 'failed',
 BOUNCED = 'bounced'
}

export interface Digest {
 id: string;
 userId: string;
 type: DigestType;
 posts: Post[];
 repositories: Repository[];
 stats: DigestStats;
 scheduledFor: Date;
 sentAt?: Date;
 opened: boolean;
 clicked: boolean;
}

export enum DigestType {
 DAILY = 'daily',
 WEEKLY = 'weekly',
 TOPIC = 'topic',
 REPOSITORY = 'repository'
}

export interface DigestStats {
 newPosts: number;
 topPosts: number;
 newComments: number;
 repositoryGrowth: number;
 karmaGained: number;
}

// Karma and gamification types
export interface Badge {
 id: string;
 name: string;
 description: string;
 icon: string;
 tier: BadgeTier;
 awardedAt: Date;
 progress?: number;
}

export enum BadgeTier {
 BRONZE = 'bronze',
 SILVER = 'silver',
 GOLD = 'gold',
 PLATINUM = 'platinum'
}

export interface KarmaMilestone {
 threshold: number;
 title: string;
 description: string;
 rewards: string[];
 reached: boolean;
 reachedAt?: Date;
}

export interface KarmaTransaction {
 id: string;
 userId: string;
 amount: number;
 type: KarmaType;
 reason: string;
 relatedId?: string;
 createdAt: Date;
}

export enum KarmaType {
 POST_UPVOTE = 'post_upvote',
 COMMENT_UPVOTE = 'comment_upvote',
 POST_DOWNVOTE = 'post_downvote',
 COMMENT_DOWNVOTE = 'comment_downvote',
 POST_CREATED = 'post_created',
 COMMENT_CREATED = 'comment_created',
 REPOSITORY_CREATED = 'repository_created',
 CSV_UPLOADED = 'csv_uploaded',
 CURATION_REWARD = 'curation_reward',
 MILESTONE_BONUS = 'milestone_bonus'
}

// API and request types
export interface ApiResponse<T> {
 success: boolean;
 data?: T;
 error?: ApiError;
 pagination?: Pagination;
}

export interface ApiError {
 code: string;
 message: string;
 field?: string;
 details?: any;
}

export interface Pagination {
 page: number;
 limit: number;
 total: number;
 hasNext: boolean;
 hasPrev: boolean;
}

export interface QueryParams {
 page?: number;
 limit?: number;
 sort?: string;
 order?: 'asc' | 'desc';
 search?: string;
 filters?: Record<string, any>;
}

// WebSocket types
export interface WebSocketMessage {
 type: WebSocketEventType;
 payload: any;
 timestamp: Date;
 userId?: string;
}

export enum WebSocketEventType {
 POST_CREATED = 'post_created',
 POST_UPDATED = 'post_updated',
 POST_DELETED = 'post_deleted',
 COMMENT_CREATED = 'comment_created',
 COMMENT_UPDATED = 'comment_updated',
 VOTE_CHANGED = 'vote_changed',
 REPOSITORY_UPDATED = 'repository_updated',
 USER_ONLINE = 'user_online',
 USER_OFFLINE = 'user_offline',
 NOTIFICATION = 'notification'
}

// Notification types
export interface Notification {
 id: string;
 userId: string;
 type: NotificationType;
 title: string;
 message: string;
 link?: string;
 read: boolean;
 createdAt: Date;
 expiresAt?: Date;
 data?: any;
}

export enum NotificationType {
 COMMENT_REPLY = 'comment_reply',
 POST_UPVOTE = 'post_upvote',
 MENTION = 'mention',
 REPOSITORY_INVITE = 'repository_invite',
 KARMA_MILESTONE = 'karma_milestone',
 DIGEST_READY = 'digest_ready',
 SYSTEM = 'system'
}

// Form and input types
export interface LoginFormData {
 email: string;
 password: string;
 rememberMe?: boolean;
}

export interface RegisterFormData {
 username: string;
 email: string;
 password: string;
 confirmPassword: string;
 acceptTerms: boolean;
}

export interface PostFormData {
 title: string;
 url?: string;
 text?: string;
 hashtags: string[];
 repositories?: string[];
}

export interface CommentFormData {
 text: string;
 parentId?: string;
}

export interface RepositoryFormData {
 name: string;
 description: string;
 hashtags: string[];
 isPublic: boolean;
 settings: Partial<RepositorySettings>;
}

// Analytics types
export interface Analytics {
 event: AnalyticsEvent;
 properties?: Record<string, any>;
 timestamp: Date;
 userId?: string;
 sessionId: string;
}

export enum AnalyticsEvent {
 PAGE_VIEW = 'page_view',
 POST_CREATED = 'post_created',
 COMMENT_CREATED = 'comment_created',
 VOTE_CAST = 'vote_cast',
 REPOSITORY_CREATED = 'repository_created',
 CSV_UPLOADED = 'csv_uploaded',
 EMAIL_SENT = 'email_sent',
 SEARCH_PERFORMED = 'search_performed',
 SHARE_CLICKED = 'share_clicked'
}

// Search types
export interface SearchResult {
 posts: Post[];
 comments: Comment[];
 users: User[];
 repositories: Repository[];
 totalResults: number;
 searchTime: number;
}

export interface SearchFilters {
 type?: 'all' | 'posts' | 'comments' | 'users' | 'repositories';
 dateRange?: DateRange;
 hashtags?: string[];
 minScore?: number;
 author?: string;
}

export interface DateRange {
 start: Date;
 end: Date;
}

// Theme types
export interface Theme {
 name: string;
 colors: ThemeColors;
 fonts: ThemeFonts;
 spacing: ThemeSpacing;
 breakpoints: ThemeBreakpoints;
}

export interface ThemeColors {
 primary: string;
 secondary: string;
 background: string;
 surface: string;
 text: string;
 textSecondary: string;
 border: string;
 error: string;
 warning: string;
 success: string;
 info: string;
}

export interface ThemeFonts {
 body: string;
 heading: string;
 mono: string;
}

export interface ThemeSpacing {
 xs: string;
 sm: string;
 md: string;
 lg: string;
 xl: string;
}

export interface ThemeBreakpoints {
 xs: number;
 sm: number;
 md: number;
 lg: number;
 xl: number;
}
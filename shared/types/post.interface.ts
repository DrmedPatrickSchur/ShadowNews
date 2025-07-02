export interface IPost {
 _id: string;
 title: string;
 content: string;
 url?: string;
 author: IAuthor;
 hashtags: string[];
 score: number;
 upvotes: string[];
 downvotes: string[];
 commentCount: number;
 emailRepositoryId?: string;
 emailRecipientCount: number;
 snowballMultiplier: number;
 attachments: IAttachment[];
 metadata: IPostMetadata;
 visibility: PostVisibility;
 status: PostStatus;
 createdAt: Date;
 updatedAt: Date;
 editedAt?: Date;
 deletedAt?: Date;
}

export interface IAuthor {
 _id: string;
 username: string;
 email: string;
 avatarUrl?: string;
 karma: number;
 badges: BadgeType[];
 isVerified: boolean;
}

export interface IAttachment {
 _id: string;
 type: AttachmentType;
 url: string;
 filename: string;
 size: number;
 mimeType: string;
 csvMetadata?: ICsvMetadata;
}

export interface ICsvMetadata {
 rowCount: number;
 columnCount: number;
 headers: string[];
 emailColumnIndex?: number;
 validEmailCount: number;
 addedToRepository: boolean;
}

export interface IPostMetadata {
 source: PostSource;
 emailMessageId?: string;
 parentPostId?: string;
 aiSuggestedHashtags: string[];
 readingTime: number;
 language: string;
 isEdited: boolean;
 editHistory: IEditRecord[];
 viewCount: number;
 shareCount: number;
 reportCount: number;
 lastActivityAt: Date;
}

export interface IEditRecord {
 editedAt: Date;
 editedBy: string;
 changes: {
   title?: string;
   content?: string;
   hashtags?: string[];
 };
}

export interface IPostEngagement {
 postId: string;
 userId: string;
 type: EngagementType;
 timestamp: Date;
}

export interface IPostAnalytics {
 postId: string;
 hourlyViews: number[];
 dailyViews: number[];
 engagementRate: number;
 clickThroughRate: number;
 emailOpenRate: number;
 snowballGrowthRate: number;
 topReferrers: IReferrer[];
 demographicBreakdown: IDemographic[];
}

export interface IReferrer {
 source: string;
 count: number;
 percentage: number;
}

export interface IDemographic {
 category: string;
 value: string;
 count: number;
 percentage: number;
}

export interface IPostFilter {
 hashtags?: string[];
 author?: string;
 dateRange?: {
   start: Date;
   end: Date;
 };
 minScore?: number;
 hasRepository?: boolean;
 status?: PostStatus;
 sortBy?: PostSortOption;
 limit?: number;
 offset?: number;
}

export interface IPostCreateInput {
 title: string;
 content: string;
 url?: string;
 hashtags: string[];
 emailRepositoryId?: string;
 attachments?: File[];
 visibility?: PostVisibility;
}

export interface IPostUpdateInput {
 title?: string;
 content?: string;
 url?: string;
 hashtags?: string[];
 visibility?: PostVisibility;
}

export interface IPostEmailInput {
 from: string;
 to: string;
 subject: string;
 body: string;
 attachments?: IEmailAttachment[];
 messageId: string;
 receivedAt: Date;
}

export interface IEmailAttachment {
 filename: string;
 content: Buffer;
 contentType: string;
 size: number;
}

export interface ITrendingPost extends IPost {
 trendingScore: number;
 velocityScore: number;
 peakPosition: number;
 timeInTop: number;
 projectedReach: number;
}

export interface IPostRecommendation {
 post: IPost;
 relevanceScore: number;
 reason: RecommendationReason;
 explanation: string;
}

export enum PostStatus {
 DRAFT = 'draft',
 PUBLISHED = 'published',
 HIDDEN = 'hidden',
 DELETED = 'deleted',
 FLAGGED = 'flagged',
 ARCHIVED = 'archived'
}

export enum PostVisibility {
 PUBLIC = 'public',
 REPOSITORY_ONLY = 'repository_only',
 FOLLOWERS_ONLY = 'followers_only',
 PRIVATE = 'private'
}

export enum PostSource {
 WEB = 'web',
 EMAIL = 'email',
 API = 'api',
 MOBILE = 'mobile',
 SCHEDULED = 'scheduled'
}

export enum AttachmentType {
 CSV = 'csv',
 IMAGE = 'image',
 DOCUMENT = 'document',
 REPOSITORY = 'repository',
 OTHER = 'other'
}

export enum BadgeType {
 VERIFIED = 'verified',
 GOLDEN_CURATOR = 'golden_curator',
 TOP_CONTRIBUTOR = 'top_contributor',
 REPOSITORY_OWNER = 'repository_owner',
 EARLY_ADOPTER = 'early_adopter',
 MODERATOR = 'moderator'
}

export enum EngagementType {
 VIEW = 'view',
 UPVOTE = 'upvote',
 DOWNVOTE = 'downvote',
 COMMENT = 'comment',
 SHARE = 'share',
 SAVE = 'save',
 REPORT = 'report',
 CLICK = 'click'
}

export enum PostSortOption {
 HOT = 'hot',
 NEW = 'new',
 TOP_DAY = 'top_day',
 TOP_WEEK = 'top_week',
 TOP_MONTH = 'top_month',
 TOP_YEAR = 'top_year',
 TOP_ALL = 'top_all',
 CONTROVERSIAL = 'controversial',
 MOST_DISCUSSED = 'most_discussed',
 TRENDING = 'trending'
}

export enum RecommendationReason {
 SIMILAR_HASHTAGS = 'similar_hashtags',
 AUTHOR_FOLLOWING = 'author_following',
 REPOSITORY_MEMBER = 'repository_member',
 TRENDING_TOPIC = 'trending_topic',
 COLLABORATIVE_FILTERING = 'collaborative_filtering',
 CONTENT_SIMILARITY = 'content_similarity'
}

export type PostVoteAction = 'upvote' | 'downvote' | 'unvote';

export interface IPostVotePayload {
 postId: string;
 action: PostVoteAction;
}

export interface IPostWebSocketEvent {
 type: PostWebSocketEventType;
 payload: IPost | IPostVotePayload | IPostEngagement;
 timestamp: Date;
}

export enum PostWebSocketEventType {
 POST_CREATED = 'post_created',
 POST_UPDATED = 'post_updated',
 POST_DELETED = 'post_deleted',
 POST_VOTED = 'post_voted',
 POST_VIEWED = 'post_viewed',
 TRENDING_UPDATED = 'trending_updated'
}

export interface IPostValidation {
 isValid: boolean;
 errors: {
   field: string;
   message: string;
 }[];
}

export interface IPostModerationAction {
 postId: string;
 action: ModerationAction;
 reason: string;
 moderatorId: string;
 timestamp: Date;
 notes?: string;
}

export enum ModerationAction {
 APPROVE = 'approve',
 FLAG = 'flag',
 HIDE = 'hide',
 DELETE = 'delete',
 RESTORE = 'restore',
 LOCK_COMMENTS = 'lock_comments',
 UNLOCK_COMMENTS = 'unlock_comments'
}
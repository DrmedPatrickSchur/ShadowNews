export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  karma: number;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  name: string;
  slug: string;
  emailCount: number;
  isPublic: boolean;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface Hashtag {
  id: string;
  name: string;
  count: number;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  url?: string;
  author: User;
  hashtags: Hashtag[];
  repositories: Repository[];
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  commentCount: number;
  viewCount: number;
  emailReachCount: number;
  isSticky: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  score: number;
  hotScore: number;
  emailPostId?: string;
  sourceEmail?: string;
  attachedCSVs?: CSVAttachment[];
}

export interface CSVAttachment {
  id: string;
  filename: string;
  size: number;
  emailCount: number;
  uploadedAt: string;
  downloadUrl: string;
  previewData?: EmailPreview[];
}

export interface EmailPreview {
  email: string;
  name?: string;
  tags?: string[];
  verified: boolean;
}

export interface PostVote {
  userId: string;
  postId: string;
  value: 'up' | 'down';
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  content?: string;
  url?: string;
  hashtags: string[];
  repositoryIds?: string[];
  attachedCSVs?: File[];
  sourceEmail?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  url?: string;
  hashtags?: string[];
  repositoryIds?: string[];
}

export interface PostFilters {
  hashtags?: string[];
  author?: string;
  repository?: string;
  dateFrom?: string;
  dateTo?: string;
  minUpvotes?: number;
  hasUrl?: boolean;
  hasCSV?: boolean;
  searchQuery?: string;
}

export interface PostSort {
  field: 'hot' | 'new' | 'top' | 'controversial' | 'emailReach';
  order: 'asc' | 'desc';
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface PostListParams {
  page: number;
  limit: number;
  filters?: PostFilters;
  sort?: PostSort;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TrendingHashtag extends Hashtag {
  growthRate: number;
  postsToday: number;
  postsThisWeek: number;
}

export interface PostAnalytics {
  postId: string;
  views: number;
  uniqueViewers: number;
  upvoteRate: number;
  commentRate: number;
  shareCount: number;
  emailClickRate: number;
  csvDownloads: number;
  reachGrowth: DailyMetric[];
  engagementByHour: HourlyMetric[];
  topReferrers: Referrer[];
}

export interface DailyMetric {
  date: string;
  value: number;
}

export interface HourlyMetric {
  hour: number;
  value: number;
}

export interface Referrer {
  source: string;
  count: number;
  percentage: number;
}

export interface PostModerationAction {
  id: string;
  postId: string;
  moderatorId: string;
  action: 'lock' | 'unlock' | 'sticky' | 'unsticky' | 'delete' | 'restore';
  reason?: string;
  timestamp: string;
}

export interface PostReport {
  id: string;
  postId: string;
  reporterId: string;
  reason: 'spam' | 'inappropriate' | 'misleading' | 'duplicate' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EmailPostMapping {
  emailId: string;
  postId: string;
  subject: string;
  sender: string;
  processedAt: string;
  extractedHashtags: string[];
  attachmentCount: number;
}

export interface PostSubscription {
  userId: string;
  postId: string;
  notifyOnComments: boolean;
  notifyOnUpdates: boolean;
  createdAt: string;
}

export interface RelatedPost {
  post: Post;
  relevanceScore: number;
  sharedHashtags: string[];
  sharedRepositories: string[];
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export interface ScheduledPost extends CreatePostInput {
  scheduledFor: string;
  timezone: string;
  status: PostStatus.SCHEDULED;
}

export interface PostDraft extends CreatePostInput {
  id: string;
  lastSavedAt: string;
  status: PostStatus.DRAFT;
}

export interface PostWebSocketEvent {
  type: 'post:created' | 'post:updated' | 'post:deleted' | 'post:voted';
  payload: {
    post?: Post;
    postId?: string;
    vote?: PostVote;
    userId?: string;
  };
  timestamp: string;
}
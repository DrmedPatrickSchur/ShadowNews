/**
 * Post Types and Interfaces - Content Management System
 * 
 * Comprehensive type definitions for the ShadowNews post and content management
 * system. This file contains all interfaces and types related to posts, comments,
 * voting, content curation, and email-to-post conversion functionality.
 * 
 * Post System Architecture:
 * - Content Types: Support for URL links, text posts, and email-derived content
 * - Social Features: Voting, commenting, and community engagement
 * - Email Integration: Convert emails to posts with CSV attachment support
 * - Content Curation: Hashtag-based organization and repository association
 * - Analytics: Comprehensive post performance and engagement tracking
 * - Moderation: Content management and community oversight tools
 * - Real-time: Live updates via WebSocket events
 * 
 * Email-First Features:
 * - Email to Post: Convert emails to posts with metadata preservation
 * - CSV Attachments: Email attachment processing for repository building
 * - Email Reach: Track viral spread through email sharing
 * - Repository Integration: Connect posts to email repositories
 * - Source Tracking: Maintain email origin and threading information
 * - Email Analytics: Track email-based engagement and growth
 * 
 * Content Management:
 * - Post Lifecycle: Draft, published, scheduled, archived states
 * - Version Control: Edit history and change tracking
 * - Content Types: URL links, text posts, email conversions
 * - Hashtag System: Topic-based content organization
 * - Repository Linking: Email repository associations
 * - Moderation Tools: Lock, sticky, delete, and restore operations
 * 
 * Social Interaction:
 * - Voting System: Upvote/downvote with karma implications
 * - Comment Threading: Hierarchical discussion support
 * - User Subscriptions: Follow posts for updates
 * - Notifications: Real-time updates for engagement
 * - Sharing: Social sharing and viral tracking
 * - Related Content: Algorithm-based content recommendations
 * 
 * Analytics and Metrics:
 * - Engagement Tracking: Views, votes, comments, shares
 * - Email Reach: Viral spread through email channels
 * - Performance Metrics: Hot scores, trending analysis
 * - Time-based Analytics: Daily, hourly engagement patterns
 * - Referrer Tracking: Traffic source analysis
 * - Growth Metrics: Content performance over time
 * 
 * Quality Assurance:
 * - Content Validation: Title, content, and URL validation
 * - Spam Prevention: Automated and manual spam detection
 * - Report System: Community-driven content moderation
 * - Duplicate Detection: Prevent duplicate content posting
 * - Quality Scoring: Algorithmic content quality assessment
 * - Moderation Workflow: Structured content review process
 * 
 * Dependencies:
 * - User Types: User profile and authentication information
 * - Repository Types: Email repository integration
 * - File API: Browser File API for CSV attachment handling
 * - WebSocket: Real-time communication for live updates
 * 
 * @author ShadowNews Team
 * @version 2.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/* =============================================================================
   Core Entity Types
   Fundamental entities for the post system
   ============================================================================= */

/**
 * User Interface (Post Context)
 * User information for post authorship and attribution
 * 
 * @interface User
 * @description Simplified user interface for post-related contexts
 */
export interface User {
  /** Unique user identifier */
  id: string;
  
  /** Username for display and @mentions */
  username: string;
  
  /** User email address */
  email: string;
  
  /** Optional avatar URL for visual identification */
  avatar?: string;
  
  /** User karma points reflecting reputation */
  karma: number;
  
  /** Account creation timestamp */
  createdAt: string;
  
  /** Last profile update timestamp */
  updatedAt: string;
}

/**
 * Repository Interface (Post Context)
 * Email repository information for post associations
 * 
 * @interface Repository
 * @description Simplified repository interface for post contexts
 */
export interface Repository {
  /** Unique repository identifier */
  id: string;
  
  /** Repository name for display */
  name: string;
  
  /** URL-friendly repository slug */
  slug: string;
  
  /** Total number of emails in repository */
  emailCount: number;
  
  /** Whether repository is publicly accessible */
  isPublic: boolean;
  
  /** Repository owner information */
  owner: User;
  
  /** Repository creation timestamp */
  createdAt: string;
  
  /** Last repository update timestamp */
  updatedAt: string;
}

/**
 * Hashtag Interface
 * Topic categorization and content organization
 * 
 * @interface Hashtag
 * @description Hashtag with usage statistics
 */
export interface Hashtag {
  /** Unique hashtag identifier */
  id: string;
  
  /** Hashtag name (without # symbol) */
  name: string;
  
  /** Number of posts using this hashtag */
  count: number;
}

/* =============================================================================
   Post Content Types
   Core post structure and content management
   ============================================================================= */

/**
 * Post Interface
 * Complete post structure with content, metadata, and social features
 * 
 * @interface Post
 * @description Full post definition with all features and metadata
 * 
 * Features:
 * - Content Types: URL links, text content, email conversions
 * - Social Interaction: Voting, commenting, and engagement tracking
 * - Email Integration: Email-to-post conversion with CSV attachments
 * - Repository Links: Association with email repositories
 * - Analytics: Performance metrics and reach tracking
 * - Moderation: Content management and oversight capabilities
 * - Lifecycle: Creation, editing, deletion, and restoration
 */
export interface Post {
  /** Unique post identifier */
  id: string;
  
  /** Post title for display and search */
  title: string;
  
  /** Optional text content for discussion posts */
  content?: string;
  
  /** Optional URL for link posts */
  url?: string;
  
  /** Post author information */
  /** Post author information */
  author: User;
  
  /** Array of hashtags for categorization and discovery */
  hashtags: Hashtag[];
  
  /** Array of associated email repositories */
  repositories: Repository[];
  
  /** Number of upvotes received */
  upvotes: number;
  
  /** Number of downvotes received */
  downvotes: number;
  
  /** Current user's vote on this post */
  userVote?: 'up' | 'down' | null;
  
  /** Total number of comments on this post */
  commentCount: number;
  
  /** Total number of views */
  viewCount: number;
  
  /** Number of people reached via email sharing */
  emailReachCount: number;
  
  /** Whether post is pinned by moderators */
  isSticky: boolean;
  
  /** Whether post is locked from further comments */
  isLocked: boolean;
  
  /** Whether post has been soft deleted */
  isDeleted: boolean;
  
  /** Timestamp when post was deleted */
  deletedAt?: string;
  
  /** Timestamp when post was last edited */
  editedAt?: string;
  
  /** Post creation timestamp */
  createdAt: string;
  
  /** Last post update timestamp */
  updatedAt: string;
  
  /** Calculated score based on votes and engagement */
  score: number;
  
  /** Hot score for trending algorithm */
  hotScore: number;
  
  /** Original email post ID if derived from email */
  emailPostId?: string;
  
  /** Source email address if converted from email */
  sourceEmail?: string;
  
  /** Array of CSV attachments from email conversion */
  attachedCSVs?: CSVAttachment[];
}

/* =============================================================================
   Email Integration Types
   Email-to-post conversion and CSV attachment handling
   ============================================================================= */

/**
 * CSV Attachment Interface
 * File attachment from email-to-post conversion
 * 
 * @interface CSVAttachment
 * @description CSV file attached to posts via email conversion
 * 
 * Features:
 * - File Metadata: Size, name, and upload information
 * - Email Preview: Sample email data from CSV
 * - Download Access: Secure file access and download
 * - Email Counting: Statistics on email content
 */
export interface CSVAttachment {
  /** Unique attachment identifier */
  id: string;
  
  /** Original filename of the CSV */
  filename: string;
  
  /** File size in bytes */
  size: number;
  
  /** Number of email addresses in CSV */
  emailCount: number;
  
  /** Upload timestamp */
  uploadedAt: string;
  
  /** Secure download URL */
  downloadUrl: string;
  
  /** Preview of email data for display */
  previewData?: EmailPreview[];
}

/**
 * Email Preview Interface
 * Sample email data for CSV attachment preview
 * 
 * @interface EmailPreview
 * @description Preview of email data from CSV attachments
 */
export interface EmailPreview {
  /** Email address */
  email: string;
  
  /** Optional contact name */
  name?: string;
  
  /** Optional tags for categorization */
  tags?: string[];
  
  /** Whether email address has been verified */
  verified: boolean;
}

/* =============================================================================
   Voting and Engagement Types
   User interaction and social features
   ============================================================================= */

/**
 * Post Vote Interface
 * Individual vote record for posts
 * 
 * @interface PostVote
 * @description Single vote cast by user on a post
 */
export interface PostVote {
  /** User ID who cast the vote */
  userId: string;
  
  /** Post ID that was voted on */
  postId: string;
  
  /** Vote direction: up or down */
  value: 'up' | 'down';
  
  /** Timestamp when vote was cast */
  createdAt: string;
}

/* =============================================================================
   Post Management Types
   Post creation, editing, and lifecycle management
   ============================================================================= */

/**
 * Create Post Input Interface
 * Data required for creating new posts
 * 
 * @interface CreatePostInput
 * @description Input data for post creation
 * 
 * Features:
 * - Content Types: URL and text post support
 * - Organization: Hashtag and repository association
 * - Email Integration: CSV attachment and source tracking
 * - Flexible Content: Support for various post types
 */
export interface CreatePostInput {
  /** Post title (required) */
  title: string;
  
  /** Optional text content for discussion posts */
  content?: string;
  
  /** Optional URL for link posts */
  url?: string;
  
  /** Array of hashtag names for categorization */
  hashtags: string[];
  
  /** Optional array of repository IDs to associate */
  repositoryIds?: string[];
  
  /** Optional CSV files to attach */
  attachedCSVs?: File[];
  
  /** Optional source email address for email-derived posts */
  sourceEmail?: string;
}

/**
 * Update Post Input Interface
 * Data for updating existing posts
 * 
 * @interface UpdatePostInput
 * @description Input data for post updates
 */
export interface UpdatePostInput {
  /** Updated post title */
  title?: string;
  
  /** Updated text content */
  content?: string;
  
  /** Updated URL */
  url?: string;
  
  /** Updated hashtags array */
  hashtags?: string[];
  
  /** Updated repository associations */
  repositoryIds?: string[];
}

/* =============================================================================
   Post Filtering and Sorting Types
   Content discovery and organization
   ============================================================================= */

/**
 * Post Filters Interface
 * Filtering options for post queries
 * 
 * @interface PostFilters
 * @description Comprehensive filtering options for post discovery
 */
export interface PostFilters {
  /** Filter by hashtags */
  hashtags?: string[];
  
  /** Filter by author username */
  author?: string;
  
  /** Filter by repository association */
  repository?: string;
  
  /** Filter by creation date from */
  dateFrom?: string;
  
  /** Filter by creation date to */
  dateTo?: string;
  
  /** Filter by minimum upvote count */
  minUpvotes?: number;
  
  /** Filter posts that have URLs */
  hasUrl?: boolean;
  
  /** Filter posts that have CSV attachments */
  hasCSV?: boolean;
  
  /** Text search query */
  searchQuery?: string;
}

/**
 * Post Sort Interface
 * Sorting options for post lists
 * 
 * @interface PostSort
 * @description Sorting configuration for post queries
 */
export interface PostSort {
  /** Field to sort by */
  field: 'hot' | 'new' | 'top' | 'controversial' | 'emailReach';
  
  /** Sort direction */
  order: 'asc' | 'desc';
  
  /** Time frame for 'top' sorting */
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}

/**
 * Post List Parameters Interface
 * Query parameters for paginated post lists
 * 
 * @interface PostListParams
 * @description Parameters for fetching post lists
 */
export interface PostListParams {
  /** Page number for pagination */
  page: number;
  
  /** Number of posts per page */
  limit: number;
  
  /** Optional filtering criteria */
  filters?: PostFilters;
  
  /** Optional sorting configuration */
  sort?: PostSort;
}

/**
 * Post List Response Interface
 * Paginated post list response
 * 
 * @interface PostListResponse
 * @description Response structure for post list queries
 */
export interface PostListResponse {
  /** Array of posts for current page */
  posts: Post[];
  
  /** Total number of posts matching criteria */
  total: number;
  
  /** Current page number */
  page: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Whether more pages are available */
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
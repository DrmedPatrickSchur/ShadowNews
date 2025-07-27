/**
 * @fileoverview Post Interface Definitions for ShadowNews Platform
 * 
 * This file defines comprehensive type definitions for the post system within
 * the ShadowNews platform, an email-first social platform that enables content
 * creation through multiple channels including web interface, email submissions,
 * and API integrations. These interfaces support rich content creation, engagement
 * tracking, and community interaction features.
 * 
 * ============================================================================
 * POST SYSTEM ARCHITECTURE:
 * ============================================================================
 * 
 * Multi-Source Content Creation:
 * - Web-based post creation with rich text editing
 * - Email-to-post conversion with automatic parsing
 * - API-driven content creation for integrations
 * - Mobile app support with optimized interfaces
 * - Scheduled posting with queue management
 * 
 * Content Types and Features:
 * - Text posts with markdown support and rich formatting
 * - Link posts with automatic preview generation
 * - Email-originated posts with full metadata preservation
 * - CSV attachment processing for repository building
 * - Multi-media content support with file attachments
 * 
 * Engagement and Interaction:
 * - Comprehensive voting system (upvote/downvote)
 * - Threaded comment system with unlimited nesting
 * - Social sharing and cross-platform distribution
 * - Content curation and quality scoring
 * - Real-time engagement tracking and analytics
 * 
 * Repository Integration:
 * - Repository-specific content organization
 * - Email list integration and management
 * - Snowball distribution for viral content
 * - Community-driven content discovery
 * - Hashtag-based categorization and filtering
 * 
 * ============================================================================
 * CORE FEATURES:
 * ============================================================================
 * 
 * Content Management:
 * - Multi-format content creation and editing
 * - Version control with complete edit history
 * - Content visibility controls and privacy settings
 * - Automated content moderation and quality checks
 * - AI-powered hashtag suggestions and categorization
 * 
 * Email Integration:
 * - Email-to-post conversion with intelligent parsing
 * - Attachment processing and CSV import capabilities
 * - Email metadata preservation and traceability
 * - Repository email list integration
 * - Email engagement tracking and analytics
 * 
 * Social Features:
 * - Community voting and engagement systems
 * - Content sharing and viral distribution
 * - User reputation and karma integration
 * - Social proof and trending algorithms
 * - Community moderation and flagging systems
 * 
 * Analytics and Insights:
 * - Real-time engagement tracking and metrics
 * - Content performance analytics and insights
 * - Audience demographics and behavior analysis
 * - Viral coefficient tracking and optimization
 * - ROI measurement for content creators
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// ============================================================================
// Core Post Interface
// ============================================================================

/**
 * Post Interface (IPost)
 * 
 * The central post interface representing all types of content within the
 * ShadowNews platform. Supports multiple content sources, engagement tracking,
 * and comprehensive metadata management.
 * 
 * Content Features:
 * - Multi-source content creation (web, email, API, mobile)
 * - Rich content support with text, URLs, and attachments
 * - Hashtag-based categorization and discovery
 * - Repository association for email list integration
 * - Advanced engagement tracking and social features
 * 
 * Email Integration:
 * - Email-to-post conversion with full metadata preservation
 * - Repository email list integration and management
 * - CSV attachment processing for email list building
 * - Snowball distribution tracking and optimization
 * 
 * Social and Engagement:
 * - Comprehensive voting system with fraud prevention
 * - Comment count tracking and thread management
 * - Social sharing and viral distribution metrics
 * - Community moderation and quality control
 */
export interface IPost {
  _id: string;                          // Unique post identifier
  title: string;                        // Post title and headline
  content: string;                      // Main post content (markdown supported)
  url?: string;                         // Optional URL for link posts
  author: IAuthor;                      // Post author information
  hashtags: string[];                   // Categorization hashtags
  score: number;                        // Net voting score (upvotes - downvotes)
  upvotes: string[];                    // Array of user IDs who upvoted
  downvotes: string[];                  // Array of user IDs who downvoted
  commentCount: number;                 // Total number of comments
  emailRepositoryId?: string;           // Associated email repository ID
  emailRecipientCount: number;          // Number of email recipients (if applicable)
  snowballMultiplier: number;           // Viral distribution multiplier
  attachments: IAttachment[];           // File attachments and media
  metadata: IPostMetadata;              // Comprehensive post metadata
  visibility: PostVisibility;          // Content visibility and privacy level
  status: PostStatus;                   // Post publication and moderation status
  createdAt: Date;                      // Post creation timestamp
  updatedAt: Date;                      // Last modification timestamp
  editedAt?: Date;                      // Last edit timestamp (if edited)
  deletedAt?: Date;                     // Soft deletion timestamp (if deleted)
}

/**
 * Author Interface (IAuthor)
 * 
 * Author information embedded within posts for efficient display
 * and interaction without requiring separate user lookups.
 * 
 * Author Features:
 * - Basic identification and display information
 * - Karma and reputation tracking for trust signals
 * - Badge system for recognition and status
 * - Verification status for credibility
 */
export interface IAuthor {
  _id: string;                          // Unique user identifier
  username: string;                     // User's platform username
  email: string;                        // User's email address
  avatarUrl?: string;                   // Profile avatar image URL
  karma: number;                        // User's karma/reputation score
  badges: BadgeType[];                  // Earned achievement badges
  isVerified: boolean;                  // Verification status for credibility
}

// ============================================================================
// Attachment System
// ============================================================================

/**
 * Attachment Interface (IAttachment)
 * 
 * File attachment system supporting multiple content types with
 * special handling for CSV files and email repository building.
 * 
 * Attachment Types:
 * - CSV files for email repository building and data import
 * - Images for visual content and media sharing
 * - Documents for comprehensive content sharing
 * - Repository exports for data portability
 * - General file support for flexible content creation
 */
export interface IAttachment {
  _id: string;                          // Unique attachment identifier
  type: AttachmentType;                 // Type of attachment for processing
  url: string;                          // Storage URL for file access
  filename: string;                     // Original or processed filename
  size: number;                         // File size in bytes
  mimeType: string;                     // MIME type for proper handling
  csvMetadata?: ICsvMetadata;           // Additional metadata for CSV files
}

/**
 * CSV Metadata Interface (ICsvMetadata)
 * 
 * Specialized metadata for CSV file attachments used in email
 * repository building and data import operations.
 * 
 * CSV Processing Features:
 * - Automatic row and column counting for validation
 * - Header extraction and analysis for smart mapping
 * - Email column detection and validation
 * - Quality metrics and import success tracking
 * - Repository integration status tracking
 */
export interface ICsvMetadata {
  rowCount: number;                     // Total number of rows in CSV
  columnCount: number;                  // Number of columns detected
  headers: string[];                    // Column headers from first row
  emailColumnIndex?: number;            // Index of email column (if detected)
  validEmailCount: number;              // Number of valid email addresses found
  addedToRepository: boolean;           // Whether emails were added to repository
}

// ============================================================================
// Post Metadata and History
// ============================================================================

/**
 * Post Metadata Interface (IPostMetadata)
 * 
 * Comprehensive metadata tracking for posts including source attribution,
 * engagement metrics, edit history, and analytics data.
 * 
 * Metadata Categories:
 * - Source tracking for content attribution and analytics
 * - AI enhancement features and suggestions
 * - Engagement metrics and performance tracking
 * - Edit history and version control
 * - Content analysis and optimization data
 */
export interface IPostMetadata {
  source: PostSource;                   // Source of post creation (web, email, etc.)
  emailMessageId?: string;              // Original email message ID (if from email)
  parentPostId?: string;                // Parent post ID (if reply or related)
  aiSuggestedHashtags: string[];        // AI-generated hashtag suggestions
  readingTime: number;                  // Estimated reading time in minutes
  language: string;                     // Detected or specified content language
  isEdited: boolean;                    // Whether post has been modified
  editHistory: IEditRecord[];           // Complete edit history for transparency
  viewCount: number;                    // Total number of post views
  shareCount: number;                   // Number of times post was shared
  reportCount: number;                  // Number of community reports/flags
  lastActivityAt: Date;                 // Timestamp of last engagement activity
}

/**
 * Edit Record Interface (IEditRecord)
 * 
 * Individual edit record for version control and transparency.
 * Tracks all modifications made to posts for audit trail.
 */
export interface IEditRecord {
  editedAt: Date;                       // Timestamp of edit
  editedBy: string;                     // User ID who made the edit
  changes: {                            // Specific changes made
    title?: string;                     // Previous title (if changed)
    content?: string;                   // Previous content (if changed)
    hashtags?: string[];                // Previous hashtags (if changed)
  };
}

// ============================================================================
// Engagement and Analytics
// ============================================================================

/**
 * Post Engagement Interface (IPostEngagement)
 * 
 * Individual engagement event tracking for detailed analytics
 * and user behavior analysis.
 */
export interface IPostEngagement {
  postId: string;                       // Post being engaged with
  userId: string;                       // User performing engagement
  type: EngagementType;                 // Type of engagement action
  timestamp: Date;                      // When engagement occurred
}

/**
 * Post Analytics Interface (IPostAnalytics)
 * 
 * Comprehensive analytics data for post performance tracking,
 * audience insights, and content optimization.
 * 
 * Analytics Features:
 * - Time-series engagement tracking (hourly, daily)
 * - Engagement rate calculation and optimization
 * - Email performance metrics for email-originated content
 * - Viral distribution tracking (snowball metrics)
 * - Traffic source analysis and referrer tracking
 * - Audience demographic breakdown and insights
 */
export interface IPostAnalytics {
  postId: string;                       // Post being analyzed
  hourlyViews: number[];                // Views per hour (24-hour array)
  dailyViews: number[];                 // Views per day (configurable period)
  engagementRate: number;               // Percentage of viewers who engaged
  clickThroughRate: number;             // CTR for link posts
  emailOpenRate: number;                // Open rate if distributed via email
  snowballGrowthRate: number;           // Viral coefficient and growth rate
  topReferrers: IReferrer[];            // Top traffic sources
  demographicBreakdown: IDemographic[]; // Audience demographic analysis
}

/**
 * Referrer Interface (IReferrer)
 * 
 * Traffic source tracking for understanding content distribution
 * and audience acquisition channels.
 */
export interface IReferrer {
  source: string;                       // Referrer source (domain, platform, etc.)
  count: number;                        // Number of referrals from this source
  percentage: number;                   // Percentage of total traffic
}

/**
 * Demographic Interface (IDemographic)
 * 
 * Audience demographic breakdown for content optimization
 * and targeted content creation.
 */
export interface IDemographic {
  category: string;                     // Demographic category (age, location, etc.)
  value: string;                        // Specific value within category
  count: number;                        // Number of users in this demographic
  percentage: number;                   // Percentage of total audience
}

// ============================================================================
// Data Transfer Objects and Input Interfaces
// ============================================================================

/**
 * Post Filter Interface (IPostFilter)
 * 
 * Comprehensive filtering options for post discovery, search,
 * and content curation with multiple criteria support.
 */
export interface IPostFilter {
  hashtags?: string[];                  // Filter by specific hashtags
  author?: string;                      // Filter by author ID or username
  dateRange?: {                         // Date range filter
    start: Date;                        // Start date
    end: Date;                          // End date
  };
  minScore?: number;                    // Minimum voting score filter
  hasRepository?: boolean;              // Filter posts with email repositories
  status?: PostStatus;                  // Filter by post status
  sortBy?: PostSortOption;              // Sorting criteria
  limit?: number;                       // Maximum results to return
  offset?: number;                      // Pagination offset
}

/**
 * Post Create Input Interface (IPostCreateInput)
 * 
 * Input validation interface for creating new posts through
 * web interface or API with comprehensive field support.
 */
export interface IPostCreateInput {
  title: string;                        // Required post title
  content: string;                      // Required post content
  url?: string;                         // Optional URL for link posts
  hashtags: string[];                   // Categorization hashtags
  emailRepositoryId?: string;           // Optional repository association
  attachments?: File[];                 // File attachments (web interface)
  visibility?: PostVisibility;         // Content visibility setting
}

/**
 * Post Update Input Interface (IPostUpdateInput)
 * 
 * Input validation interface for updating existing posts
 * with partial update support and change tracking.
 */
export interface IPostUpdateInput {
  title?: string;                       // Updated title (optional)
  content?: string;                     // Updated content (optional)
  url?: string;                         // Updated URL (optional)
  hashtags?: string[];                  // Updated hashtags (optional)
  visibility?: PostVisibility;         // Updated visibility (optional)
}

/**
 * Post Email Input Interface (IPostEmailInput)
 * 
 * Input interface for creating posts from email messages
 * with full email metadata preservation and processing.
 */
export interface IPostEmailInput {
  from: string;                         // Sender email address
  to: string;                           // Recipient email address
  subject: string;                      // Email subject line
  body: string;                         // Email body content
  attachments?: IEmailAttachment[];     // Email file attachments
  messageId: string;                    // Unique email message identifier
  receivedAt: Date;                     // Email receipt timestamp
}

/**
 * Email Attachment Interface (IEmailAttachment)
 * 
 * Email-specific attachment interface for processing files
 * sent via email with binary content support.
 */
export interface IEmailAttachment {
  filename: string;                     // Original attachment filename
  content: Buffer;                      // Binary file content
  contentType: string;                  // MIME type of attachment
  size: number;                         // File size in bytes
}

// ============================================================================
// Advanced Post Features
// ============================================================================

/**
 * Trending Post Interface (ITrendingPost)
 * 
 * Extended post interface with trending-specific metrics
 * for viral content tracking and trending algorithms.
 */
export interface ITrendingPost extends IPost {
  trendingScore: number;                // Calculated trending score
  velocityScore: number;                // Rate of engagement increase
  peakPosition: number;                 // Highest trending position achieved
  timeInTop: number;                    // Time spent in trending positions
  projectedReach: number;               // Estimated total reach potential
}

/**
 * Post Recommendation Interface (IPostRecommendation)
 * 
 * Content recommendation system interface with relevance
 * scoring and explanation for personalized content discovery.
 */
export interface IPostRecommendation {
  post: IPost;                          // Recommended post object
  relevanceScore: number;               // Relevance score (0-1)
  reason: RecommendationReason;         // Recommendation algorithm reason
  explanation: string;                  // Human-readable explanation
}

// ============================================================================
// Enumeration Definitions
// ============================================================================

/**
 * Post Status Enumeration
 * 
 * Content lifecycle and moderation states for posts
 * with comprehensive status tracking.
 */
export enum PostStatus {
  DRAFT = 'draft',                      // Draft state (not published)
  PUBLISHED = 'published',              // Published and visible
  HIDDEN = 'hidden',                    // Hidden from public view
  DELETED = 'deleted',                  // Soft deleted (recoverable)
  FLAGGED = 'flagged',                  // Flagged for review
  ARCHIVED = 'archived'                 // Archived (read-only)
}

/**
 * Post Visibility Enumeration
 * 
 * Content visibility and privacy controls for audience
 * targeting and content access management.
 */
export enum PostVisibility {
  PUBLIC = 'public',                    // Visible to all users
  REPOSITORY_ONLY = 'repository_only',  // Visible only within repository
  FOLLOWERS_ONLY = 'followers_only',    // Visible only to followers
  PRIVATE = 'private'                   // Visible only to author
}

/**
 * Post Source Enumeration
 * 
 * Content creation source tracking for analytics
 * and user experience optimization.
 */
export enum PostSource {
  WEB = 'web',                          // Created via web interface
  EMAIL = 'email',                      // Created from email
  API = 'api',                          // Created via API
  MOBILE = 'mobile',                    // Created via mobile app
  SCHEDULED = 'scheduled'               // Created via scheduled posting
}

/**
 * Attachment Type Enumeration
 * 
 * File attachment categorization for proper processing
 * and display optimization.
 */
export enum AttachmentType {
  CSV = 'csv',                          // CSV files for email repositories
  IMAGE = 'image',                      // Image files for visual content
  DOCUMENT = 'document',                // Document files for sharing
  REPOSITORY = 'repository',            // Repository export files
  OTHER = 'other'                       // Other file types
}

/**
 * Badge Type Enumeration
 * 
 * User recognition and achievement system for
 * community building and engagement incentives.
 */
export enum BadgeType {
  VERIFIED = 'verified',                // Verified user status
  GOLDEN_CURATOR = 'golden_curator',    // Exceptional content curation
  TOP_CONTRIBUTOR = 'top_contributor',  // High-value content contributor
  REPOSITORY_OWNER = 'repository_owner', // Repository creator and manager
  EARLY_ADOPTER = 'early_adopter',      // Early platform adopter
  MODERATOR = 'moderator'               // Community moderator
}

/**
 * Engagement Type Enumeration
 * 
 * User interaction tracking for analytics
 * and engagement optimization.
 */
export enum EngagementType {
  VIEW = 'view',                        // Content view/impression
  UPVOTE = 'upvote',                    // Positive vote
  DOWNVOTE = 'downvote',                // Negative vote
  COMMENT = 'comment',                  // Comment creation
  SHARE = 'share',                      // Content sharing
  SAVE = 'save',                        // Content bookmarking
  REPORT = 'report',                    // Content reporting/flagging
  CLICK = 'click'                       // Link click (for link posts)
}

/**
 * Post Sort Option Enumeration
 * 
 * Content sorting algorithms for discovery
 * and personalized content feeds.
 */
export enum PostSortOption {
  HOT = 'hot',                          // Trending/hot content algorithm
  NEW = 'new',                          // Newest content first
  TOP_DAY = 'top_day',                  // Top content from past day
  TOP_WEEK = 'top_week',                // Top content from past week
  TOP_MONTH = 'top_month',              // Top content from past month
  TOP_YEAR = 'top_year',                // Top content from past year
  TOP_ALL = 'top_all',                  // All-time top content
  CONTROVERSIAL = 'controversial',      // Controversial content algorithm
  MOST_DISCUSSED = 'most_discussed',    // Content with most comments
  TRENDING = 'trending'                 // Viral/trending content
}

/**
 * Recommendation Reason Enumeration
 * 
 * Content recommendation algorithm identification
 * for transparency and optimization.
 */
export enum RecommendationReason {
  SIMILAR_HASHTAGS = 'similar_hashtags',           // Based on hashtag similarity
  AUTHOR_FOLLOWING = 'author_following',           // Following the author
  REPOSITORY_MEMBER = 'repository_member',         // Member of related repository
  TRENDING_TOPIC = 'trending_topic',               // Part of trending topic
  COLLABORATIVE_FILTERING = 'collaborative_filtering', // User behavior similarity
  CONTENT_SIMILARITY = 'content_similarity'       // Content similarity analysis
}

/**
 * Moderation Action Enumeration
 * 
 * Content moderation actions for community
 * management and quality control.
 */
export enum ModerationAction {
  APPROVE = 'approve',                  // Approve flagged content
  FLAG = 'flag',                        // Flag content for review
  HIDE = 'hide',                        // Hide content from public view
  DELETE = 'delete',                    // Delete content permanently
  RESTORE = 'restore',                  // Restore deleted/hidden content
  LOCK_COMMENTS = 'lock_comments',      // Prevent new comments
  UNLOCK_COMMENTS = 'unlock_comments'   // Allow comments again
}

// ============================================================================
// Action and Event Interfaces
// ============================================================================

/**
 * Post Vote Action Type
 * 
 * Voting action types for content engagement
 * with support for vote removal.
 */
export type PostVoteAction = 'upvote' | 'downvote' | 'unvote';

/**
 * Post Vote Payload Interface (IPostVotePayload)
 * 
 * WebSocket payload for real-time vote updates
 * and live engagement tracking.
 */
export interface IPostVotePayload {
  postId: string;                       // Post being voted on
  action: PostVoteAction;               // Voting action performed
}

/**
 * Post WebSocket Event Interface (IPostWebSocketEvent)
 * 
 * Real-time event interface for live updates
 * and collaborative features.
 */
export interface IPostWebSocketEvent {
  type: PostWebSocketEventType;         // Event type for routing
  payload: IPost | IPostVotePayload | IPostEngagement; // Event data
  timestamp: Date;                      // Event occurrence timestamp
}

/**
 * Post WebSocket Event Type Enumeration
 * 
 * Real-time event types for WebSocket communication
 * and live update distribution.
 */
export enum PostWebSocketEventType {
  POST_CREATED = 'post_created',        // New post created
  POST_UPDATED = 'post_updated',        // Post modified
  POST_DELETED = 'post_deleted',        // Post removed
  POST_VOTED = 'post_voted',            // Post vote changed
  POST_VIEWED = 'post_viewed',          // Post viewed by user
  TRENDING_UPDATED = 'trending_updated' // Trending status changed
}

// ============================================================================
// Validation and Moderation Interfaces
// ============================================================================

/**
 * Post Validation Interface (IPostValidation)
 * 
 * Input validation response interface for
 * client-side error handling and user feedback.
 */
export interface IPostValidation {
  isValid: boolean;                     // Overall validation status
  errors: {                             // Field-specific validation errors
    field: string;                      // Field name with error
    message: string;                    // Error message for user display
  }[];
}

/**
 * Post Moderation Action Interface (IPostModerationAction)
 * 
 * Moderation action tracking for audit trail
 * and community management transparency.
 */
export interface IPostModerationAction {
  postId: string;                       // Post being moderated
  action: ModerationAction;             // Moderation action taken
  reason: string;                       // Reason for moderation action
  moderatorId: string;                  // Moderator who took action
  timestamp: Date;                      // When action was taken
  notes?: string;                       // Optional additional notes
}
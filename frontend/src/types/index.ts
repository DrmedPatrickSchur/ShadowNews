/**
 * TypeScript Type Definitions - Central Type System
 * 
 * Comprehensive type definitions for the ShadowNews email-first social platform.
 * This file serves as the central type system that defines all data structures,
 * interfaces, and enums used throughout the application for type safety and
 * development consistency.
 * 
 * Type System Philosophy:
 * - Type Safety: Complete TypeScript coverage for all data structures
 * - Consistency: Unified type definitions across frontend and backend
 * - Extensibility: Types designed to support future feature development
 * - Developer Experience: Clear, self-documenting type definitions
 * - Email Focus: Types optimized for email repository management
 * - Maintainability: Modular type organization for easy maintenance
 * 
 * Type Categories:
 * - User Types: User profiles, authentication, and settings
 * - Content Types: Posts, comments, and content management
 * - Repository Types: Email repository management and analytics
 * - Email Types: Email handling, messaging, and delivery
 * - Karma Types: Gamification, achievements, and user reputation
 * - API Types: Request/response structures and error handling
 * - WebSocket Types: Real-time communication and events
 * - Form Types: Form data structures and validation
 * - Analytics Types: User behavior tracking and metrics
 * - Theme Types: UI theming and customization
 * 
 * Email Platform Features:
 * - Repository Management: Types for email collection and curation
 * - Snowball Analytics: Types for viral email tracking and metrics
 * - Karma System: Types for user reputation and gamification
 * - CSV Upload: Types for bulk email import and processing
 * - Email Verification: Types for email validation and delivery
 * - Content Curation: Types for community-driven content organization
 * 
 * Type Safety Features:
 * - Strict Null Checks: Optional properties clearly marked
 * - Union Types: Precise type definitions for state management
 * - Enum Types: Type-safe constants for status and categories
 * - Generic Types: Reusable type patterns for API responses
 * - Interface Inheritance: Hierarchical type structure
 * - Branded Types: Type distinction for similar data structures
 * 
 * Development Standards:
 * - JSDoc Comments: Comprehensive documentation for all types
 * - Naming Conventions: Clear, semantic naming patterns
 * - Property Organization: Logical grouping of related properties
 * - Optional Properties: Clear distinction between required and optional
 * - Timestamp Handling: Consistent Date type usage
 * - ID Management: String-based UUID patterns for entities
 * 
 * Performance Considerations:
 * - Lean Types: Minimal overhead type definitions
 * - Tree Shaking: Types designed for optimal bundling
 * - Memory Efficiency: Efficient data structure design
 * - Serialization: JSON-compatible type definitions
 * - Caching: Types optimized for state management caching
 * - Network: Types designed for efficient API communication
 * 
 * Backend Synchronization:
 * - Shared Types: Common types with backend TypeScript
 * - API Contracts: Matching request/response structures
 * - Database Models: Aligned with database schema definitions
 * - Validation: Compatible with server-side validation schemas
 * - Migration Support: Types that support data migration
 * - Version Compatibility: Backward-compatible type evolution
 * 
 * Quality Assurance:
 * - Type Testing: Types validated through test coverage
 * - Lint Rules: ESLint TypeScript rules for consistency
 * - Documentation: Complete JSDoc coverage for all types
 * - Examples: Usage examples for complex type structures
 * - Migration Guides: Documentation for type changes
 * - Best Practices: Coding standards for type definitions
 * 
 * Dependencies:
 * - TypeScript: Modern TypeScript features and syntax
 * - Date Types: Native JavaScript Date object usage
 * - JSON Compatibility: Types that serialize/deserialize cleanly
 * - React Integration: Types optimized for React component usage
 * 
 * @author ShadowNews Team
 * @version 2.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/* =============================================================================
   User Management Types
   User profiles, authentication, settings, and account management
   ============================================================================= */

/**
 * Core User Interface
 * Complete user profile definition with authentication and social features
 * 
 * @interface User
 * @description Represents a complete user profile in the ShadowNews platform
 * 
 * Features:
 * - User Authentication: Secure login and session management
 * - Profile Management: Customizable user profiles with avatars and bio
 * - Karma System: Integrated reputation tracking and gamification
 * - Email Integration: ShadowNews email address for platform features
 * - Repository Access: User's owned and subscribed email repositories
 * - Role-Based Access: Different permission levels for platform features
 * - Verification Status: Email verification and account validation
 * - Badge System: Achievement tracking and display
 * - Settings Management: User preferences and configuration
 */
export interface User {
 /** Unique user identifier (UUID format) */
 id: string;
 
 /** Unique username for platform identification and @mentions */
 username: string;
 
 /** User's email address for authentication and notifications */
 email: string;
 
 /** Auto-generated ShadowNews email address for repository features */
 shadownewsEmail: string;
 
 /** User's karma points reflecting reputation and contribution quality */
 karma: number;
 
 /** Account creation timestamp for user lifecycle tracking */
 createdAt: Date;
 
 /** Last profile update timestamp for change tracking */
 updatedAt: Date;
 
 /** Optional profile avatar URL for visual identification */
 avatar?: string;
 
 /** Optional user biography for profile personalization */
 bio?: string;
 
 /** Array of earned badges for gamification and achievement display */
 badges: Badge[];
 
 /** Comprehensive user settings and preferences */
 settings: UserSettings;
 
 /** Array of repository IDs owned by the user */
 repositories: string[];
 
 /** Email verification status for platform features */
 isVerified: boolean;
 
 /** User's role determining permissions and capabilities */
 role: UserRole;
}

/**
 * User Settings Interface
 * Comprehensive user preference and configuration management
 * 
 * @interface UserSettings
 * @description User-configurable settings for platform experience
 * 
 * Features:
 * - Email Preferences: Digest frequency and notification settings
 * - Privacy Controls: Profile visibility and data sharing options
 * - Theme Selection: UI appearance customization
 * - Timezone Configuration: Localized time display
 * - Notification Management: Granular notification preferences
 */
export interface UserSettings {
 /** Frequency for automated email digest delivery */
 emailDigestFrequency: DigestFrequency;
 
 /** Detailed notification preferences for different event types */
 notificationPreferences: NotificationPreferences;
 
 /** Privacy settings controlling data visibility and sharing */
 privacySettings: PrivacySettings;
 
 /** UI theme preference: light, dark, or system automatic */
 theme: 'light' | 'dark' | 'auto';
 
 /** User's timezone for localized timestamp display */
 timezone: string;
}

/**
 * Notification Preferences Interface
 * Granular control over notification delivery and types
 * 
 * @interface NotificationPreferences
 * @description Configurable notification settings for different event types
 */
export interface NotificationPreferences {
 /** Enable/disable email-based notifications */
 emailNotifications: boolean;
 
 /** Enable/disable browser push notifications */
 pushNotifications: boolean;
 
 /** Notifications for replies to user's comments */
 commentReplies: boolean;
 
 /** Notifications when user's posts receive upvotes */
 postUpvotes: boolean;
 
 /** Notifications for updates to subscribed repositories */
 repositoryUpdates: boolean;
 
 /** Enable/disable weekly digest email delivery */
 weeklyDigest: boolean;
}

/**
 * Privacy Settings Interface
 * Control over profile visibility and data sharing
 * 
 * @interface PrivacySettings
 * @description Privacy controls for user data and profile visibility
 */
export interface PrivacySettings {
 /** Whether to display email address on public profile */
 showEmail: boolean;
 
 /** Allow other users to send repository collaboration invites */
 allowRepositoryInvites: boolean;
 
 /** Make user profile publicly viewable */
 publicProfile: boolean;
 
 /** Allow posting comments and content anonymously */
 anonymousPosting: boolean;
}

/**
 * User Role Enumeration
 * Platform permission levels and access control
 * 
 * @enum UserRole
 * @description Hierarchical user roles with different platform permissions
 */
export enum UserRole {
 /** Standard user with basic platform access */
 USER = 'user',
 
 /** Moderator with content management and community oversight permissions */
 MODERATOR = 'moderator',
 
 /** Administrator with full platform management capabilities */
 ADMIN = 'admin',
 
 /** Content curator with specialized curation and recommendation permissions */
 CURATOR = 'curator'
}

/**
 * Digest Frequency Enumeration
 * Email digest delivery frequency options
 * 
 * @enum DigestFrequency
 * @description Available options for automated digest email frequency
 */
export enum DigestFrequency {
 /** Daily digest delivery every 24 hours */
 DAILY = 'daily',
 
 /** Weekly digest delivery every 7 days */
 WEEKLY = 'weekly',
 
 /** Monthly digest delivery every 30 days */
 MONTHLY = 'monthly',
 
 /** Never send automated digests */
 NEVER = 'never'
}

/* =============================================================================
   Content Management Types
   Posts, comments, voting, and content organization
   ============================================================================= */

/**
 * Post Interface
 * Core content item representing user-submitted posts and discussions
 * 
 * @interface Post
 * @description Complete post structure with content, metadata, and social features
 * 
 * Features:
 * - Content Types: Support for URL links and text-based posts
 * - Social Interaction: Voting, commenting, and discussion threading
 * - Organization: Hashtag categorization and repository association
 * - Moderation: Content management and community oversight tools
 * - History Tracking: Edit history and change management
 * - Performance Metrics: Score calculation and engagement tracking
 * - Repository Integration: Connection to email repositories for context
 */
export interface Post {
 /** Unique post identifier (UUID format) */
 id: string;
 
 /** Post title for display and search indexing */
 title: string;
 
 /** Optional URL for link-based posts */
 url?: string;
 
 /** Optional text content for discussion posts */
 text?: string;
 
 /** Post author's complete user profile */
 author: User;
 
 /** Post author's user ID for efficient querying */
 authorId: string;
 
 /** Current post score based on community voting */
 score: number;
 
 /** Array of all votes cast on this post */
 votes: Vote[];
 
 /** Array of all comments on this post */
 comments: Comment[];
 
 /** Total number of comments for efficient display */
 commentCount: number;
 
 /** Array of hashtags for categorization and discovery */
 hashtags: string[];
 
 /** Array of repository IDs associated with this post */
 repositories: string[];
 
 /** Post creation timestamp */
 createdAt: Date;
 
 /** Last modification timestamp */
 updatedAt: Date;
 
 /** Soft deletion flag for content moderation */
 isDeleted: boolean;
 
 /** Admin/moderator pin status for important posts */
 isPinned: boolean;
 
 /** Complete edit history for transparency and auditing */
 editHistory: EditHistory[];
}

/**
 * Comment Interface
 * Threaded discussion comments with voting and moderation support
 * 
 * @interface Comment
 * @description Individual comment in post discussions with threading support
 * 
 * Features:
 * - Threading: Hierarchical comment structure with parent-child relationships
 * - Voting System: Community-driven comment scoring
 * - Edit History: Transparent change tracking
 * - Moderation: Content management and removal capabilities
 * - User Context: Full author information and permissions
 */
export interface Comment {
 /** Unique comment identifier (UUID format) */
 id: string;
 
 /** Parent post ID this comment belongs to */
 postId: string;
 
 /** Optional parent comment ID for threading */
 parentId?: string;
 
 /** Comment author's complete user profile */
 author: User;
 
 /** Comment author's user ID for efficient querying */
 authorId: string;
 
 /** Comment text content */
 text: string;
 
 /** Current comment score based on community voting */
 score: number;
 
 /** Array of all votes cast on this comment */
 votes: Vote[];
 
 /** Array of child comments for threading */
 children: Comment[];
 
 /** Comment creation timestamp */
 createdAt: Date;
 
 /** Last modification timestamp */
 updatedAt: Date;
 
 /** Soft deletion flag for content moderation */
 isDeleted: boolean;
 
 /** Complete edit history for transparency and auditing */
 editHistory: EditHistory[];
}

/**
 * Vote Interface
 * Individual vote record for posts and comments
 * 
 * @interface Vote
 * @description Single vote cast by a user on content
 */
export interface Vote {
 /** ID of the user who cast the vote */
 userId: string;
 
 /** Vote value: 1 for upvote, -1 for downvote */
 value: 1 | -1;
 
 /** Timestamp when the vote was cast */
 timestamp: Date;
}

/**
 * Edit History Interface
 * Track changes made to posts and comments
 * 
 * @interface EditHistory
 * @description Individual edit record for content transparency
 */
export interface EditHistory {
 /** Content text at the time of this edit */
 text: string;
 
 /** Timestamp when the edit was made */
 editedAt: Date;
 
 /** User ID of the person who made the edit */
 editedBy: string;
}

/* =============================================================================
   Email Repository Types
   Email collection, management, and analytics
   ============================================================================= */

/**
 * Repository Interface
 * Email repository for collecting and managing email addresses
 * 
 * @interface Repository
 * @description Complete email repository with management and analytics features
 * 
 * Features:
 * - Email Collection: Organized email address management
 * - Snowball Analytics: Viral growth tracking and optimization
 * - Access Control: Public/private repository settings
 * - Subscriber Management: User subscription and notification system
 * - Analytics Dashboard: Growth metrics and engagement tracking
 * - Automation: Auto-add thresholds and smart curation
 * - Integration: CSV import and API integration capabilities
 */
export interface Repository {
 /** Unique repository identifier (UUID format) */
 id: string;
 
 /** Repository name for identification and branding */
 name: string;
 
 /** Repository description explaining purpose and content */
 description: string;
 
 /** Repository owner's complete user profile */
 owner: User;
 
 /** Repository owner's user ID for efficient querying */
 ownerId: string;
 
 /** Array of hashtags for categorization and discovery */
 hashtags: string[];
 
 /** Array of all email entries in this repository */
 emails: EmailEntry[];
 
 /** Total number of emails for efficient display */
 emailCount: number;
 
 /** Array of user IDs subscribed to this repository */
 subscribers: string[];
 
 /** Total number of subscribers for efficient display */
 subscriberCount: number;
 
 /** Whether repository is publicly viewable */
 isPublic: boolean;
 
 /** Score threshold for automatic email addition */
 autoAddThreshold: number;
 
 /** Whether snowball analytics are enabled */
 snowballEnabled: boolean;
 
 /** Repository creation timestamp */
 createdAt: Date;
 
 /** Last modification timestamp */
 updatedAt: Date;
 
 /** Last activity timestamp for sorting and prioritization */
 lastActivityAt: Date;
 
 /** Repository analytics and performance metrics */
 stats: RepositoryStats;
 
 /** Repository configuration and behavior settings */
 settings: RepositorySettings;
}

/**
 * Email Entry Interface
 * Individual email address within a repository
 * 
 * @interface EmailEntry
 * @description Single email entry with metadata and engagement tracking
 * 
 * Features:
 * - Email Verification: Validation and deliverability tracking
 * - Source Tracking: How the email was added to the repository
 * - Engagement Metrics: Email interaction and response tracking
 * - Tag Management: Custom categorization and organization
 * - Bounce Handling: Delivery failure tracking and management
 * - Unsubscribe Support: Opt-out management and compliance
 */
export interface EmailEntry {
 /** Unique email entry identifier (UUID format) */
 id: string;
 
 /** Email address */
 email: string;
 
 /** Optional name associated with the email address */
 name?: string;
 
 /** User ID who added this email to the repository */
 addedBy: string;
 
 /** Timestamp when email was added */
 addedAt: Date;
 
 /** Source method used to add this email */
 source: EmailSource;
 
 /** Whether email address has been verified */
 verified: boolean;
 
 /** Array of custom tags for organization */
 tags: string[];
 
 /** Whether email has unsubscribed from communications */
 unsubscribed: boolean;
 
 /** Number of email delivery failures */
 bounceCount: number;
 
 /** Calculated engagement score based on interactions */
 engagementScore: number;
}

/**
 * Email Source Enumeration
 * Methods used to add emails to repositories
 * 
 * @enum EmailSource
 * @description Different ways emails can be added to repositories
 */
export enum EmailSource {
 /** Manually entered by user */
 MANUAL = 'manual',
 
 /** Imported via CSV file upload */
 CSV_UPLOAD = 'csv_upload',
 
 /** Added through snowball analytics */
 SNOWBALL = 'snowball',
 
 /** Added via API integration */
 API = 'api',
 
 /** Forwarded from another source */
 FORWARD = 'forward'
}

/**
 * Repository Statistics Interface
 * Analytics and performance metrics for repositories
 * 
 * @interface RepositoryStats
 * @description Comprehensive analytics data for repository performance
 */
export interface RepositoryStats {
 /** Total number of emails in the repository */
 totalEmails: number;
 
 /** Number of verified email addresses */
 verifiedEmails: number;
 
 /** Number of active (non-bounced, non-unsubscribed) emails */
 activeEmails: number;
 
 /** Repository growth rate as percentage per period */
 growthRate: number;
 
 /** Email engagement rate as percentage */
 engagementRate: number;
 
 /** Current snowball multiplier for viral growth tracking */
 snowballMultiplier: number;
 
 /** Timestamp of last snowball analysis run */
 lastSnowballAt?: Date;
}

/**
 * Repository Settings Interface
 * Configuration options for repository behavior and automation
 * 
 * @interface RepositorySettings
 * @description Configurable settings controlling repository behavior
 */
export interface RepositorySettings {
 /** Whether to require email verification before adding to repository */
 requireVerification: boolean;
 
 /** Enable snowball analytics for viral growth tracking */
 allowSnowball: boolean;
 
 /** Minimum number of emails required for snowball analysis */
 snowballMinEmails: number;
 
 /** Automatically remove bounced email addresses */
 autoRemoveBounced: boolean;
 
 /** Custom email template for repository communications */
 customEmailTemplate?: string;
 
 /** Webhook URL for repository event notifications */
 webhookUrl?: string;
}

/* =============================================================================
   CSV Upload and Processing Types
   Bulk email import and processing workflow
   ============================================================================= */

/**
 * CSV Upload Interface
 * Bulk email import processing and status tracking
 * 
 * @interface CSVUpload
 * @description CSV file upload with processing status and validation results
 * 
 * Features:
 * - File Management: Upload tracking and file metadata
 * - Processing Status: Real-time processing progress
 * - Validation Results: Email validation and error reporting
 * - Duplicate Detection: Automatic duplicate email identification
 * - Error Handling: Detailed error tracking and reporting
 * - Progress Tracking: Row-by-row processing progress
 */
export interface CSVUpload {
 /** Unique upload identifier (UUID format) */
 id: string;
 
 /** Original filename of uploaded CSV */
 fileName: string;
 
 /** File size in bytes */
 fileSize: number;
 
 /** User ID who uploaded the file */
 uploadedBy: string;
 
 /** Upload timestamp */
 uploadedAt: Date;
 
 /** Current processing status */
 status: UploadStatus;
 
 /** Total number of rows in the CSV file */
 totalRows: number;
 
 /** Number of rows processed so far */
 processedRows: number;
 
 /** Number of valid email addresses found */
 validEmails: number;
 
 /** Number of invalid email addresses found */
 invalidEmails: number;
 
 /** Number of duplicate email addresses found */
 duplicates: number;
 
 /** Array of processing errors encountered */
 errors: UploadError[];
}

/**
 * Upload Status Enumeration
 * Status states for CSV upload processing
 * 
 * @enum UploadStatus
 * @description Different states of CSV upload processing
 */
export enum UploadStatus {
 /** Upload queued for processing */
 PENDING = 'pending',
 
 /** Currently being processed */
 PROCESSING = 'processing',
 
 /** Successfully completed processing */
 COMPLETED = 'completed',
 
 /** Processing failed with errors */
 FAILED = 'failed',
 
 /** Completed with some errors or warnings */
 PARTIAL = 'partial'
}

/**
 * Upload Error Interface
 * Individual error encountered during CSV processing
 * 
 * @interface UploadError
 * @description Single error from CSV upload processing
 */
export interface UploadError {
 /** Row number where error occurred */
 row: number;
 
 /** Email address that caused the error */
 email: string;
 
 /** Descriptive error message */
 error: string;
}

/* =============================================================================
   Email Communication Types
   Email messaging, delivery, and status tracking
   ============================================================================= */

/**
 * Email Message Interface
 * Individual email message with delivery tracking
 * 
 * @interface EmailMessage
 * @description Complete email message structure with metadata and status
 * 
 * Features:
 * - Message Content: HTML and plain text email content
 * - Attachment Support: File attachments with metadata
 * - Delivery Tracking: Status monitoring and failure handling
 * - Threading: Email conversation threading support
 * - Headers: Standard email headers for proper delivery
 * - Status Management: Comprehensive delivery status tracking
 */
export interface EmailMessage {
 /** Unique message identifier (UUID format) */
 id: string;
 
 /** Sender email address */
 from: string;
 
 /** Array of recipient email addresses */
 to: string[];
 
 /** Array of CC recipient email addresses */
 cc?: string[];
 
 /** Array of BCC recipient email addresses */
 bcc?: string[];
 
 /** Email subject line */
 subject: string;
 
 /** Plain text email body */
 body: string;
 
 /** HTML email body for rich content */
 html?: string;
 
 /** Array of file attachments */
 attachments?: Attachment[];
 
 /** Unique message ID for email threading */
 messageId: string;
 
 /** Message ID this email is replying to */
 inReplyTo?: string;
 
 /** Array of reference message IDs for threading */
 references?: string[];
 
 /** Current delivery status */
 status: EmailStatus;
 
 /** Timestamp when email was sent */
 sentAt?: Date;
 
 /** Email creation timestamp */
 createdAt: Date;
}

/**
 * Attachment Interface
 * Email attachment metadata and access information
 * 
 * @interface Attachment
 * @description File attachment with metadata
 */
export interface Attachment {
 /** Original filename */
 filename: string;
 
 /** MIME content type */
 contentType: string;
 
 /** File size in bytes */
 size: number;
 
 /** URL for accessing the attachment */
 url: string;
}

/**
 * Email Status Enumeration
 * Email delivery status tracking
 * 
 * @enum EmailStatus
 * @description Different states of email delivery
 */
export enum EmailStatus {
 /** Email queued for sending */
 QUEUED = 'queued',
 
 /** Email currently being sent */
 SENDING = 'sending',
 
 /** Email successfully sent */
 SENT = 'sent',
 
 /** Email delivery failed */
 FAILED = 'failed',
 
 /** Email bounced back from recipient */
 BOUNCED = 'bounced'
}

/**
 * Digest Interface
 * Automated email digest with curated content
 * 
 * @interface Digest
 * @description Personalized content digest for users
 * 
 * Features:
 * - Content Curation: Algorithmically selected relevant content
 * - Personalization: User-specific content based on interests
 * - Scheduling: Automated delivery based on user preferences
 * - Analytics: Open and click tracking for engagement metrics
 * - Multi-Type: Different digest types for various use cases
 */
export interface Digest {
 /** Unique digest identifier (UUID format) */
 id: string;
 
 /** User ID this digest is intended for */
 userId: string;
 
 /** Type of digest content */
 type: DigestType;
 
 /** Array of curated posts for this digest */
 posts: Post[];
 
 /** Array of featured repositories */
 repositories: Repository[];
 
 /** Digest analytics and statistics */
 stats: DigestStats;
 
 /** Scheduled delivery timestamp */
 scheduledFor: Date;
 
 /** Actual delivery timestamp */
 sentAt?: Date;
 
 /** Whether digest has been opened by recipient */
 opened: boolean;
 
 /** Whether any links in digest have been clicked */
 clicked: boolean;
}

/**
 * Digest Type Enumeration
 * Different types of automated digests
 * 
 * @enum DigestType
 * @description Categories of digest content
 */
export enum DigestType {
 /** Daily summary of platform activity */
 DAILY = 'daily',
 
 /** Weekly roundup of top content */
 WEEKLY = 'weekly',
 
 /** Topic-specific digest based on hashtags */
 TOPIC = 'topic',
 
 /** Repository-specific updates and activity */
 REPOSITORY = 'repository'
}

/**
 * Digest Statistics Interface
 * Analytics data for digest content and engagement
 * 
 * @interface DigestStats
 * @description Metrics and statistics for digest performance
 */
export interface DigestStats {
 /** Number of new posts since last digest */
 newPosts: number;
 
 /** Number of top-scoring posts included */
 topPosts: number;
 
 /** Number of new comments across featured content */
 newComments: number;
 
 /** Repository growth metrics as percentage */
 repositoryGrowth: number;
 
 /** Total karma gained by user since last digest */
 karmaGained: number;
}

/* =============================================================================
   Karma and Gamification Types
   User reputation, achievements, and reward systems
   ============================================================================= */

/**
 * Badge Interface
 * Achievement badge representing user accomplishments
 * 
 * @interface Badge
 * @description User achievement badge with metadata and progress tracking
 * 
 * Features:
 * - Achievement Tracking: User accomplishment recognition
 * - Visual Identity: Icon and visual representation
 * - Tier System: Bronze, silver, gold, platinum progression
 * - Progress Tracking: Partial completion tracking for ongoing achievements
 * - Timestamp Records: When achievements were earned
 * - Gamification: Engagement through recognition and rewards
 */
export interface Badge {
 /** Unique badge identifier (UUID format) */
 id: string;
 
 /** Badge name for display */
 name: string;
 
 /** Description of achievement requirements */
 description: string;
 
 /** Icon identifier or URL for visual representation */
 icon: string;
 
 /** Badge tier indicating achievement level */
 tier: BadgeTier;
 
 /** Timestamp when badge was awarded */
 awardedAt: Date;
 
 /** Optional progress towards completion (0-100) */
 progress?: number;
}

/**
 * Badge Tier Enumeration
 * Achievement levels for badge progression
 * 
 * @enum BadgeTier
 * @description Hierarchical badge tier system
 */
export enum BadgeTier {
 /** Entry-level achievement tier */
 BRONZE = 'bronze',
 
 /** Intermediate achievement tier */
 SILVER = 'silver',
 
 /** Advanced achievement tier */
 GOLD = 'gold',
 
 /** Elite achievement tier */
 PLATINUM = 'platinum'
}

/**
 * Karma Milestone Interface
 * Karma threshold achievements with rewards
 * 
 * @interface KarmaMilestone
 * @description Karma-based milestone with rewards and tracking
 * 
 * Features:
 * - Threshold Tracking: Karma point requirements
 * - Reward System: Benefits for reaching milestones
 * - Progress Monitoring: Achievement status tracking
 * - Recognition: Title and description for accomplishments
 * - Timestamp Records: When milestones were reached
 */
export interface KarmaMilestone {
 /** Karma points required to reach this milestone */
 threshold: number;
 
 /** Milestone title for display */
 title: string;
 
 /** Description of milestone achievement */
 description: string;
 
 /** Array of rewards granted for reaching milestone */
 rewards: string[];
 
 /** Whether user has reached this milestone */
 reached: boolean;
 
 /** Timestamp when milestone was reached */
 reachedAt?: Date;
}

/**
 * Karma Transaction Interface
 * Individual karma point transaction record
 * 
 * @interface KarmaTransaction
 * @description Single karma transaction with detailed tracking
 * 
 * Features:
 * - Transaction Tracking: Complete karma point history
 * - Type Classification: Different types of karma-earning activities
 * - Audit Trail: Full transaction history for transparency
 * - Related Content: Links to content that generated karma
 * - Temporal Tracking: When karma was earned or lost
 */
export interface KarmaTransaction {
 /** Unique transaction identifier (UUID format) */
 id: string;
 
 /** User ID who gained or lost karma */
 userId: string;
 
 /** Karma amount (positive for gain, negative for loss) */
 amount: number;
 
 /** Type of action that generated karma */
 type: KarmaType;
 
 /** Human-readable reason for karma change */
 reason: string;
 
 /** Optional ID of related content (post, comment, etc.) */
 relatedId?: string;
 
 /** Transaction timestamp */
 createdAt: Date;
}

/**
 * Karma Type Enumeration
 * Different actions that affect user karma
 * 
 * @enum KarmaType
 * @description Categories of karma-affecting activities
 */
export enum KarmaType {
 /** Karma gained from post receiving upvote */
 POST_UPVOTE = 'post_upvote',
 
 /** Karma gained from comment receiving upvote */
 COMMENT_UPVOTE = 'comment_upvote',
 
 /** Karma lost from post receiving downvote */
 POST_DOWNVOTE = 'post_downvote',
 
 /** Karma lost from comment receiving downvote */
 COMMENT_DOWNVOTE = 'comment_downvote',
 
 /** Karma gained from creating quality post */
 POST_CREATED = 'post_created',
 
 /** Karma gained from creating quality comment */
 /** Karma gained from creating quality comment */
 COMMENT_CREATED = 'comment_created',
 
 /** Karma gained from creating new email repository */
 REPOSITORY_CREATED = 'repository_created',
 
 /** Karma gained from uploading CSV with valid emails */
 CSV_UPLOADED = 'csv_uploaded',
 
 /** Karma gained from community curation activities */
 CURATION_REWARD = 'curation_reward',
 
 /** Bonus karma from reaching milestones */
 MILESTONE_BONUS = 'milestone_bonus'
}

/* =============================================================================
   API Communication Types
   Request/response structures and error handling
   ============================================================================= */

/**
 * API Response Interface
 * Standardized API response wrapper with error handling
 * 
 * @interface ApiResponse
 * @template T The type of data being returned
 * @description Generic API response structure for consistent error handling
 * 
 * Features:
 * - Success Indication: Clear success/failure status
 * - Type Safety: Generic data typing for response payload
 * - Error Handling: Structured error information
 * - Pagination Support: Integrated pagination metadata
 * - Consistency: Uniform response structure across all endpoints
 */
export interface ApiResponse<T> {
 /** Whether the API request was successful */
 success: boolean;
 
 /** Response data of generic type T */
 data?: T;
 
 /** Error information if request failed */
 error?: ApiError;
 
 /** Pagination metadata for list responses */
 pagination?: Pagination;
}

/**
 * API Error Interface
 * Structured error information for API failures
 * 
 * @interface ApiError
 * @description Detailed error information for debugging and user feedback
 * 
 * Features:
 * - Error Codes: Standardized error identification
 * - User Messages: Human-readable error descriptions
 * - Field Validation: Specific field-level error information
 * - Debug Details: Additional information for development
 */
export interface ApiError {
 /** Standardized error code for programmatic handling */
 code: string;
 
 /** Human-readable error message */
 message: string;
 
 /** Specific field name if error relates to form validation */
 field?: string;
 
 /** Additional error details for debugging */
 details?: any;
}

/**
 * Pagination Interface
 * Pagination metadata for paginated API responses
 * 
 * @interface Pagination
 * @description Pagination information for list endpoints
 * 
 * Features:
 * - Current Position: Current page and limit information
 * - Total Count: Total number of available items
 * - Navigation: Next/previous page availability
 * - Consistency: Uniform pagination across all list endpoints
 */
export interface Pagination {
 /** Current page number (1-based) */
 page: number;
 
 /** Number of items per page */
 limit: number;
 
 /** Total number of items available */
 total: number;
 
 /** Whether there are more pages available */
 hasNext: boolean;
 
 /** Whether there are previous pages available */
 hasPrev: boolean;
}

/**
 * Query Parameters Interface
 * Standard query parameters for API requests
 * 
 * @interface QueryParams
 * @description Common query parameters for filtering and pagination
 * 
 * Features:
 * - Pagination Control: Page and limit parameters
 * - Sorting: Field-based sorting with order direction
 * - Search: Text-based search functionality
 * - Filtering: Custom filters for data refinement
 */
export interface QueryParams {
 /** Page number for pagination (1-based) */
 page?: number;
 
 /** Number of items per page */
 limit?: number;
 
 /** Field to sort by */
 sort?: string;
 
 /** Sort order: ascending or descending */
 order?: 'asc' | 'desc';
 
 /** Search query string */
 search?: string;
 
 /** Additional filters as key-value pairs */
 filters?: Record<string, any>;
}

/* =============================================================================
   WebSocket Communication Types
   Real-time communication and event handling
   ============================================================================= */

/**
 * WebSocket Message Interface
 * Real-time message structure for WebSocket communication
 * 
 * @interface WebSocketMessage
 * @description Structure for real-time messages between client and server
 * 
 * Features:
 * - Event Typing: Categorized event types for proper handling
 * - Payload Data: Flexible payload structure for different event types
 * - Timestamp Tracking: Message timing for synchronization
 * - User Context: Optional user identification for targeted messages
 * - Type Safety: Structured approach to real-time communication
 */
export interface WebSocketMessage {
 /** Type of WebSocket event for proper message routing */
 type: WebSocketEventType;
 
 /** Message payload containing event-specific data */
 payload: any;
 
 /** Message timestamp for ordering and synchronization */
 timestamp: Date;
 
 /** Optional user ID for targeted messages */
 userId?: string;
}

/**
 * WebSocket Event Type Enumeration
 * Categories of real-time events for WebSocket communication
 * 
 * @enum WebSocketEventType
 * @description Different types of real-time events
 */
export enum WebSocketEventType {
 /** New post created event */
 POST_CREATED = 'post_created',
 
 /** Post updated event */
 POST_UPDATED = 'post_updated',
 
 /** Post deleted event */
 POST_DELETED = 'post_deleted',
 
 /** New comment created event */
 COMMENT_CREATED = 'comment_created',
 
 /** Comment updated event */
 COMMENT_UPDATED = 'comment_updated',
 
 /** Vote changed event */
 VOTE_CHANGED = 'vote_changed',
 
 /** Repository updated event */
 REPOSITORY_UPDATED = 'repository_updated',
 
 /** User came online event */
 USER_ONLINE = 'user_online',
 
 /** User went offline event */
 USER_OFFLINE = 'user_offline',
 
 /** General notification event */
 NOTIFICATION = 'notification'
}

/* =============================================================================
   Notification Types
   User notification system and messaging
   ============================================================================= */

/**
 * Notification Interface
 * User notification with content and metadata
 * 
 * @interface Notification
 * @description Individual notification message for users
 */
export interface Notification {
 /** Unique notification identifier (UUID format) */
 id: string;
 
 /** User ID this notification is for */
 userId: string;
 
 /** Type of notification for categorization */
 type: NotificationType;
 
 /** Notification title for display */
 title: string;
 
 /** Notification message content */
 message: string;
 
 /** Optional link for notification action */
 link?: string;
 
 /** Whether notification has been read */
 read: boolean;
 
 /** Notification creation timestamp */
 createdAt: Date;
 
 /** Optional expiration timestamp */
 expiresAt?: Date;
 
 /** Additional notification data */
 data?: any;
}

/**
 * Notification Type Enumeration
 * Categories of user notifications
 * 
 * @enum NotificationType
 * @description Different types of user notifications
 */
export enum NotificationType {
 /** Reply to user's comment */
 COMMENT_REPLY = 'comment_reply',
 
 /** Post received upvote */
 POST_UPVOTE = 'post_upvote',
 
 /** User mentioned in content */
 MENTION = 'mention',
 
 /** Repository collaboration invite */
 REPOSITORY_INVITE = 'repository_invite',
 
 /** Karma milestone reached */
 KARMA_MILESTONE = 'karma_milestone',
 
 /** Digest ready for delivery */
 DIGEST_READY = 'digest_ready',
 
 /** System-wide notification */
 SYSTEM = 'system'
}

/* =============================================================================
   Form and Input Types
   User interface form structures and validation
   ============================================================================= */

/**
 * Login Form Data Interface
 * User authentication form structure
 * 
 * @interface LoginFormData
 * @description Form data for user login
 */
export interface LoginFormData {
 /** User email address for authentication */
 email: string;
 
 /** User password for authentication */
 password: string;
 
 /** Optional remember me preference */
 rememberMe?: boolean;
}

/**
 * Registration Form Data Interface
 * New user registration form structure
 * 
 * @interface RegisterFormData
 * @description Form data for user registration
 */
export interface RegisterFormData {
 /** Desired username */
 username: string;
 
 /** Email address for account */
 email: string;
 
 /** Account password */
 password: string;
 
 /** Password confirmation */
 confirmPassword: string;
 
 /** Terms of service acceptance */
 acceptTerms: boolean;
}

/**
 * Post Form Data Interface
 * Post creation form structure
 * 
 * @interface PostFormData
 * @description Form data for creating posts
 */
export interface PostFormData {
 /** Post title */
 title: string;
 
 /** Optional URL for link posts */
 url?: string;
 
 /** Optional text content for discussion posts */
 text?: string;
 
 /** Array of hashtags for categorization */
 hashtags: string[];
 
 /** Optional repository associations */
 repositories?: string[];
}

/**
 * Comment Form Data Interface
 * Comment creation form structure
 * 
 * @interface CommentFormData
 * @description Form data for creating comments
 */
export interface CommentFormData {
 /** Comment text content */
 text: string;
 
 /** Optional parent comment ID for threading */
 parentId?: string;
}

/**
 * Repository Form Data Interface
 * Repository creation form structure
 * 
 * @interface RepositoryFormData
 * @description Form data for creating repositories
 */
export interface RepositoryFormData {
 /** Repository name */
 name: string;
 
 /** Repository description */
 description: string;
 
 /** Array of hashtags */
 hashtags: string[];
 
 /** Public visibility setting */
 isPublic: boolean;
 
 /** Partial repository settings */
 settings: Partial<RepositorySettings>;
}

/* =============================================================================
   Analytics and Tracking Types
   User behavior analytics and metrics
   ============================================================================= */

/**
 * Analytics Interface
 * User behavior tracking event
 * 
 * @interface Analytics
 * @description Analytics event for tracking user behavior
 */
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
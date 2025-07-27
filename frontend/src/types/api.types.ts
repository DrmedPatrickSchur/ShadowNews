/**
 * API Types and Interfaces - HTTP Communication Definitions
 * 
 * Comprehensive API type definitions for the ShadowNews email-first social platform.
 * This file contains all request/response interfaces, error structures, and API
 * communication patterns used throughout the frontend application for type-safe
 * communication with the backend services.
 * 
 * API Architecture:
 * - RESTful Design: Standard HTTP methods and status codes
 * - Type Safety: Complete TypeScript coverage for all API calls
 * - Error Handling: Structured error responses with detailed information
 * - Pagination: Consistent pagination patterns across all list endpoints
 * - Authentication: JWT-based authentication with refresh token support
 * - File Upload: Support for CSV uploads and file attachments
 * - Real-time: WebSocket message types for live updates
 * - Batching: Batch operation support for efficient API usage
 * 
 * Email Platform Features:
 * - Repository Management: API types for email collection and curation
 * - CSV Processing: Bulk email import and export operations
 * - Snowball Analytics: Viral growth tracking and optimization
 * - Email Commands: Email-based interaction with the platform
 * - Digest Generation: Automated content curation and delivery
 * - Karma System: User reputation tracking and gamification
 * 
 * Communication Patterns:
 * - Request/Response: Standard HTTP request/response pairs
 * - Real-time Updates: WebSocket message types for live features
 * - File Operations: Upload progress tracking and metadata
 * - Batch Processing: Multiple operations in single requests
 * - Health Monitoring: Service status and health check responses
 * - Analytics: User behavior tracking and metrics collection
 * 
 * Error Handling:
 * - Structured Errors: Consistent error response format
 * - Field Validation: Specific field-level error information
 * - Rate Limiting: API rate limit information and retry logic
 * - Network Failures: Timeout and connection error handling
 * - Authentication: Token expiration and refresh mechanisms
 * - File Upload: Upload progress and failure recovery
 * 
 * Performance Features:
 * - Pagination: Cursor-based and offset-based pagination
 * - Caching: Cache-friendly response structures
 * - Compression: Optimized data transfer formats
 * - Progress Tracking: Real-time upload/download progress
 * - Abort Support: Request cancellation capabilities
 * - Retry Logic: Automatic retry with exponential backoff
 * 
 * Security Considerations:
 * - Authentication: Secure token-based authentication
 * - Authorization: Role-based access control
 * - Data Validation: Server-side validation with client feedback
 * - Rate Limiting: API abuse prevention and fair usage
 * - File Security: Safe file upload and processing
 * - Privacy: User data protection and consent management
 * 
 * Integration Features:
 * - WebSocket: Real-time communication for live updates
 * - File Processing: CSV import/export with progress tracking
 * - AI Integration: Hashtag suggestions and content analysis
 * - Email Processing: Email parsing and command execution
 * - Analytics: User behavior tracking and metrics
 * - Export/Import: Data portability and migration support
 * 
 * Dependencies:
 * - TypeScript: Modern TypeScript features for type safety
 * - HTTP Client: Axios or fetch API for HTTP communication
 * - WebSocket: Native WebSocket API for real-time features
 * - File API: Browser File API for upload functionality
 * 
 * @author ShadowNews Team
 * @version 2.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/* =============================================================================
   Core API Response Types
   Standard response structures and error handling
   ============================================================================= */

/**
 * Generic API Response Interface
 * Standardized response wrapper for all API endpoints
 * 
 * @interface ApiResponse
 * @template T The type of data being returned
 * @description Universal API response structure with consistent error handling
 * 
 * Features:
 * - Success Indication: Clear success/failure status
 * - Generic Data: Type-safe response data
 * - Error Details: Comprehensive error information
 * - Metadata: Additional response context and pagination
 * - Messaging: Human-readable status messages
 */
export interface ApiResponse<T = any> {
  /** Whether the API request completed successfully */
  success: boolean;
  
  /** Response data of the specified generic type */
  data?: T;
  
  /** Detailed error information if request failed */
  error?: ApiError;
  
  /** Human-readable response message */
  message?: string;
  
  /** Additional response metadata including pagination */
  metadata?: ResponseMetadata;
}

/**
 * API Error Interface
 * Structured error information for failed requests
 * 
 * @interface ApiError
 * @description Detailed error structure for debugging and user feedback
 * 
 * Features:
 * - Error Codes: Standardized error identification
 * - User Messages: Clear, actionable error descriptions
 * - Debug Details: Additional context for development
 * - Timestamps: Error occurrence tracking
 */
export interface ApiError {
  /** Standardized error code for programmatic handling */
  code: string;
  
  /** Human-readable error message for user display */
  message: string;
  
  /** Additional error context and debugging information */
  details?: Record<string, any>;
  
  /** ISO timestamp when error occurred */
  timestamp: string;
}

/**
 * Response Metadata Interface
 * Additional context and pagination information for API responses
 * 
 * @interface ResponseMetadata
 * @description Metadata accompanying API responses
 * 
 * Features:
 * - Pagination: Page-based and cursor-based pagination support
 * - Totals: Total count information for list responses
 * - Navigation: Next page and continuation support
 */
export interface ResponseMetadata {
  /** Current page number for paginated responses */
  page?: number;
  
  /** Number of items per page */
  limit?: number;
  
  /** Total number of items available */
  total?: number;
  
  /** Whether more pages are available */
  hasMore?: boolean;
  
  /** Cursor for next page in cursor-based pagination */
  nextCursor?: string;
}

/* =============================================================================
   Request Parameter Types
   Query parameters and request configuration
   ============================================================================= */

/**
 * Pagination Parameters Interface
 * Standard pagination options for list endpoints
 * 
 * @interface PaginationParams
 * @description Common pagination parameters for API requests
 * 
 * Features:
 * - Flexible Pagination: Support for both offset and cursor-based pagination
 * - Sorting: Field-based sorting with direction control
 * - Limit Control: Configurable page sizes
 */
export interface PaginationParams {
  /** Page number for offset-based pagination (1-based) */
  page?: number;
  
  /** Maximum number of items to return */
  limit?: number;
  
  /** Cursor for cursor-based pagination */
  cursor?: string;
  
  /** Field name to sort by */
  sortBy?: string;
  
  /** Sort direction: ascending or descending */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search Parameters Interface
 * Search and filtering options extending pagination
 * 
 * @interface SearchParams
 * @description Search parameters with pagination and filtering
 * 
 * Features:
 * - Text Search: Query string search across content
 * - Advanced Filtering: Custom filter parameters
 * - Combined Operations: Search with pagination and sorting
 */
export interface SearchParams extends PaginationParams {
  /** Search query string */
  /** Search query string */
  q?: string;
  
  /** Additional search filters as key-value pairs */
  filters?: Record<string, any>;
}

/* =============================================================================
   Authentication Types
   User authentication and token management
   ============================================================================= */

/**
 * Authentication Tokens Interface
 * JWT tokens for user authentication and session management
 * 
 * @interface AuthTokens
 * @description Token pair for secure authentication
 * 
 * Features:
 * - Access Token: Short-lived token for API authentication
 * - Refresh Token: Long-lived token for session renewal
 * - Expiration: Token lifetime tracking
 */
export interface AuthTokens {
  /** JWT access token for API authentication */
  accessToken: string;
  
  /** Refresh token for obtaining new access tokens */
  refreshToken: string;
  
  /** Token expiration time in seconds */
  expiresIn: number;
}

/**
 * Login Request Interface
 * User credentials for authentication
 * 
 * @interface LoginRequest
 * @description Login form data for user authentication
 */
export interface LoginRequest {
  /** User email address */
  email: string;
  
  /** User password */
  password: string;
  
  /** Whether to extend session duration */
  rememberMe?: boolean;
}

/**
 * Registration Request Interface
 * New user account creation data
 * 
 * @interface RegisterRequest
 * @description User registration form data
 */
export interface RegisterRequest {
  /** User email address for account creation */
  email: string;
  
  /** Account password */
  password: string;
  
  /** Unique username for platform identification */
  username: string;
  
  /** Optional full name for profile display */
  fullName?: string;
  
  /** Optional array of user interests for personalization */
  interests?: string[];
}

/**
 * Refresh Token Request Interface
 * Token refresh for session renewal
 * 
 * @interface RefreshTokenRequest
 * @description Request to refresh authentication tokens
 */
export interface RefreshTokenRequest {
  /** Current refresh token to exchange for new access token */
  refreshToken: string;
}

/* =============================================================================
   Content Management Types
   Post and comment creation and modification
   ============================================================================= */

/**
 * Create Post Request Interface
 * New post creation with content and metadata
 * 
 * @interface CreatePostRequest
 * @description Request data for creating new posts
 * 
 * Features:
 * - Content Types: Support for URL links and text posts
 * - Categorization: Hashtag-based organization
 * - Repository Links: Association with email repositories
 * - Scheduling: Future publication support
 */
export interface CreatePostRequest {
  /** Post title for display and search */
  title: string;
  
  /** Optional text content for discussion posts */
  content?: string;
  
  /** Optional URL for link posts */
  url?: string;
  
  /** Array of hashtags for categorization */
  hashtags: string[];
  
  /** Optional array of repository IDs to associate with post */
  repositoryIds?: string[];
  
  /** Optional ISO timestamp for scheduled publication */
  scheduledAt?: string;
}

/**
 * Update Post Request Interface
 * Post modification with partial updates
 * 
 * @interface UpdatePostRequest
 * @description Request data for updating existing posts
 */
export interface UpdatePostRequest {
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

/**
 * Create Comment Request Interface
 * New comment creation with threading support
 * 
 * @interface CreateCommentRequest
 * @description Request data for creating comments
 */
export interface CreateCommentRequest {
  /** Comment text content */
  content: string;
  
  /** Optional parent comment ID for threading */
  parentId?: string;
}

/**
 * Update Comment Request Interface
 * Comment modification
 * 
 * @interface UpdateCommentRequest
 * @description Request data for updating comments
 */
export interface UpdateCommentRequest {
  /** Updated comment content */
  content: string;
}

/**
 * Vote Request Interface
 * Voting on posts and comments
 * 
 * @interface VoteRequest
 * @description Request data for casting votes
 */
export interface VoteRequest {
  /** Vote direction: upvote or downvote */
  direction: 'up' | 'down';
}

/* =============================================================================
   Repository Management Types
   Email repository creation and administration
   ============================================================================= */

/**
 * Create Repository Request Interface
 * New email repository creation
 * 
 * @interface CreateRepositoryRequest
 * @description Request data for creating email repositories
 * 
 * Features:
 * - Repository Metadata: Name, description, and categorization
 * - Privacy Controls: Public/private repository settings
 * - Quality Thresholds: Automated email curation settings
 * - Auto-add Features: Intelligent email collection
 */
export interface CreateRepositoryRequest {
  /** Repository name for identification */
  name: string;
  
  /** Repository description explaining purpose */
  description: string;
  
  /** Repository topic for categorization */
  topic: string;
  
  /** Array of hashtags for discovery */
  hashtags: string[];
  
  /** Whether repository should be private (default: false) */
  isPrivate?: boolean;
  
  /** Quality threshold score for automatic email addition */
  qualityThreshold?: number;
  
  /** Whether to automatically add high-quality emails */
  autoAddEmails?: boolean;
}

/**
 * Update Repository Request Interface
 * Repository modification with partial updates
 * 
 * @interface UpdateRepositoryRequest
 * @description Request data for updating repository settings
 */
export interface UpdateRepositoryRequest {
  /** Updated repository name */
  name?: string;
  
  /** Updated repository description */
  description?: string;
  
  /** Updated hashtags array */
  hashtags?: string[];
  
  /** Updated privacy setting */
  isPrivate?: boolean;
  
  /** Updated quality threshold */
  qualityThreshold?: number;
  
  /** Updated auto-add setting */
  autoAddEmails?: boolean;
}

/**
 * Add Emails to Repository Request Interface
 * Bulk email addition to repositories
 * 
 * @interface AddEmailsToRepositoryRequest
 * @description Request data for adding emails to repositories
 * 
 * Features:
 * - Manual Entry: Direct email address input
 * - CSV Upload: Bulk import from CSV files
 * - Verification: Optional email verification requirement
 */
export interface AddEmailsToRepositoryRequest {
  /** Array of email addresses to add */
  emails: string[];
  
  /** Optional CSV file for bulk import */
  csvFile?: File;
  
  /** Whether email verification is required */
  verificationRequired?: boolean;
}

/**
 * Remove Emails from Repository Request Interface
 * Bulk email removal from repositories
 * 
 * @interface RemoveEmailsFromRepositoryRequest
 * @description Request data for removing emails from repositories
 */
export interface RemoveEmailsFromRepositoryRequest {
  /** Array of email addresses to remove */
  emails: string[];
}

/**
 * Merge Repositories Request Interface
 * Repository consolidation and merging
 * 
 * @interface MergeRepositoriesRequest
 * @description Request data for merging two repositories
 */
export interface MergeRepositoriesRequest {
  /** Source repository ID to merge from */
  sourceRepositoryId: string;
  
  /** Target repository ID to merge into */
  targetRepositoryId: string;
  
  /** Whether to keep source repository after merge */
  keepSource?: boolean;
}

/* =============================================================================
   Email Communication Types
   Email sending and attachment handling
   ============================================================================= */

/**
 * Email Post Request Interface
 * Email composition and sending
 * 
 * @interface EmailPostRequest
 * @description Request data for sending emails
 * 
 * Features:
 * - Standard Email: From, to, subject, body structure
 * - Rich Content: HTML email support
 * - Attachments: File attachment support with metadata
 */
export interface EmailPostRequest {
  /** Sender email address */
  from: string;
  
  /** Recipient email address */
  to: string;
  
  /** Email subject line */
  subject: string;
  
  /** Email body content (plain text or HTML) */
  body: string;
  
  /** Optional array of file attachments */
  attachments?: EmailAttachment[];
}

/**
 * Email Attachment Interface
 * File attachment metadata for emails
 * 
 * @interface EmailAttachment
 * @description Email attachment with content and metadata
 */
export interface EmailAttachment {
  /** Original filename of the attachment */
  filename: string;
  
  /** MIME content type of the file */
  contentType: string;
  
  /** Base64-encoded file content */
  content: string;
  
  /** File size in bytes */
  size: number;
}

/* =============================================================================
   User Profile and Preferences Types
   User settings, preferences, and profile management
   ============================================================================= */

/**
 * Email Digest Preferences Interface
 * User preferences for automated email digest delivery
 * 
 * @interface EmailDigestPreferences
 * @description Configurable preferences for digest emails
 */
export interface EmailDigestPreferences {
  /** Digest delivery frequency */
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  
  /** Preferred time of day for digest delivery */
  timeOfDay?: string;
  
  /** User timezone for scheduling delivery */
  timezone?: string;
  
  /** Topics to include in digest */
  includeTopics: string[];
  
  /** Topics to exclude from digest */
  excludeTopics: string[];
  
  /** Minimum karma threshold for content inclusion */
  minKarmaThreshold?: number;
}

/**
 * Update User Profile Request Interface
 * User profile modification with comprehensive settings
 * 
 * @interface UpdateUserProfileRequest
 * @description Request data for updating user profiles
 */
export interface UpdateUserProfileRequest {
  /** Updated username */
  username?: string;
  
  /** Updated full name */
  fullName?: string;
  
  /** Updated biography */
  bio?: string;
  
  /** Updated avatar URL */
  avatar?: string;
  
  /** Updated interests array */
  interests?: string[];
  
  /** Updated email digest preferences */
  emailPreferences?: EmailDigestPreferences;
  
  /** Updated privacy settings */
  privacySettings?: PrivacySettings;
}

/**
 * Privacy Settings Interface
 * User privacy controls and data sharing preferences
 * 
 * @interface PrivacySettings
 * @description Privacy configuration options for users
 */
export interface PrivacySettings {
  /** Whether to show email address on profile */
  showEmail: boolean;
  
  /** Allow repository collaboration invites */
  allowRepositoryInvites: boolean;
  
  /** Enable anonymous posting capability */
  anonymousPosting: boolean;
  
  /** Allow data sharing for analytics */
  dataSharing: boolean;
  
  /** Make profile publicly visible */
  publicProfile: boolean;
}

/* =============================================================================
   File Processing Types
   CSV upload/export and data processing
   ============================================================================= */

/**
 * CSV Upload Request Interface
 * Bulk email import via CSV file upload
 * 
 * @interface CSVUploadRequest
 * @description Request data for CSV email imports
 * 
 * Features:
 * - File Upload: Browser File API integration
 * - Column Mapping: Flexible CSV column assignment
 * - Duplicate Handling: Skip or merge duplicate emails
 * - Repository Targeting: Direct import to specific repository
 */
export interface CSVUploadRequest {
  /** CSV file to upload */
  file: File;
  
  /** Target repository ID for email import */
  repositoryId: string;
  
  /** Optional column mapping for CSV parsing */
  columnMapping?: {
    /** Email address column name */
    email: string;
    /** Optional name column */
    name?: string;
    /** Optional tags column */
    tags?: string;
  };
  
  /** Whether to skip duplicate email addresses */
  skipDuplicates?: boolean;
}

/**
 * CSV Export Request Interface
 * Repository data export to CSV format
 * 
 * @interface CSVExportRequest
 * @description Request data for exporting repository data
 */
export interface CSVExportRequest {
  /** Repository ID to export */
  repositoryId: string;
  
  /** Export format: CSV or Excel */
  format: 'csv' | 'xlsx';
  
  /** Whether to include email metadata */
  includeMetadata?: boolean;
  
  /** Optional date range filter */
  dateRange?: {
    /** Start date (ISO string) */
    start: string;
    /** End date (ISO string) */
    end: string;
  };
}

/**
 * Snowball Analytics Request Interface
 * Viral growth analysis and metrics
 * 
 * @interface SnowballAnalyticsRequest
 * @description Request data for snowball analytics
 */
export interface SnowballAnalyticsRequest {
  /** Repository ID for analysis */
  repositoryId: string;
  
  /** Optional date range for analysis */
  dateRange?: {
    /** Analysis start date */
    start: string;
    /** Analysis end date */
    end: string;
  };
  
  /** Specific metrics to calculate */
  metrics?: string[];
}

/* =============================================================================
   Real-time Communication Types
   WebSocket messages and real-time updates
   ============================================================================= */

/**
 * WebSocket Message Interface
 * Real-time message structure for live updates
 * 
 * @interface WebSocketMessage
 * @template T The payload type for the message
 * @description Structure for WebSocket communication
 */
export interface WebSocketMessage<T = any> {
  /** Message type for routing and handling */
  type: WebSocketMessageType;
  
  /** Message payload with typed data */
  payload: T;
  
  /** ISO timestamp when message was sent */
  timestamp: string;
  
  /** Unique message identifier */
  id: string;
}

/**
 * WebSocket Message Type Enumeration
 * Categories of real-time events
 * 
 * @enum WebSocketMessageType
 * @description Types of WebSocket messages for event handling
 */
export enum WebSocketMessageType {
  /** New post created event */
  POST_CREATED = 'POST_CREATED',
  
  /** Post updated event */
  POST_UPDATED = 'POST_UPDATED',
  
  /** Post deleted event */
  POST_DELETED = 'POST_DELETED',
  
  /** New comment created event */
  COMMENT_CREATED = 'COMMENT_CREATED',
  
  /** Comment updated event */
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  
  /** Comment deleted event */
  COMMENT_DELETED = 'COMMENT_DELETED',
  
  /** Vote changed event */
  VOTE_CHANGED = 'VOTE_CHANGED',
  
  /** Repository updated event */
  REPOSITORY_UPDATED = 'REPOSITORY_UPDATED',
  
  /** Email added to repository event */
  EMAIL_ADDED = 'EMAIL_ADDED',
  
  /** User karma updated event */
  KARMA_UPDATED = 'KARMA_UPDATED',
  
  /** General notification event */
  NOTIFICATION = 'NOTIFICATION',
  
  /** User presence update event */
  PRESENCE_UPDATE = 'PRESENCE_UPDATE',
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export enum NotificationType {
  POST_REPLY = 'POST_REPLY',
  COMMENT_REPLY = 'COMMENT_REPLY',
  MENTION = 'MENTION',
  KARMA_MILESTONE = 'KARMA_MILESTONE',
  REPOSITORY_INVITE = 'REPOSITORY_INVITE',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  DIGEST_READY = 'DIGEST_READY',
  SNOWBALL_GROWTH = 'SNOWBALL_GROWTH',
  SYSTEM = 'SYSTEM',
}

export interface BatchRequest<T> {
  operations: BatchOperation<T>[];
}

export interface BatchOperation<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: T;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  onUploadProgress?: (progress: FileUploadProgress) => void;
  onDownloadProgress?: (progress: FileUploadProgress) => void;
  signal?: AbortSignal;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    email: ServiceStatus;
    storage: ServiceStatus;
  };
  timestamp: string;
}

export interface ServiceStatus {
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface AIHashtagSuggestionRequest {
  content: string;
  existingTags?: string[];
  maxSuggestions?: number;
}

export interface AIHashtagSuggestionResponse {
  suggestions: Array<{
    tag: string;
    confidence: number;
    reason?: string;
  }>;
}

export interface EmailCommandRequest {
  command: string;
  parameters?: string[];
  context?: Record<string, any>;
}

export interface EmailCommandResponse {
  success: boolean;
  result?: any;
  message: string;
}

export interface KarmaTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  type: 'earned' | 'spent' | 'bonus';
  relatedEntity?: {
    type: 'post' | 'comment' | 'repository' | 'curation';
    id: string;
  };
  createdAt: string;
}

export interface RepositoryStats {
  totalEmails: number;
  verifiedEmails: number;
  pendingEmails: number;
  growthRate: number;
  engagementRate: number;
  snowballMultiplier: number;
  topContributors: Array<{
    userId: string;
    emailsAdded: number;
    karma: number;
  }>;
  recentActivity: Array<{
    type: string;
    count: number;
    timestamp: string;
  }>;
}

export interface ExportDataRequest {
  includeTypes: Array<'posts' | 'comments' | 'repositories' | 'emails' | 'karma'>;
  format: 'json' | 'csv' | 'zip';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ImportDataRequest {
  file: File;
  type: 'repository' | 'emails' | 'posts';
  options?: {
    skipDuplicates?: boolean;
    validateEmails?: boolean;
    autoTag?: boolean;
  };
}
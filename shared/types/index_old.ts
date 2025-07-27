/**
 * @fileoverview Shared Type Definitions Hub for ShadowNews Platform
 * 
 * This file serves as the central type definition hub for the ShadowNews platform,
 * an innovative email-first social platform that enables content creation and
 * community interaction through email communication. This index file imports
 * and re-exports all type definitions for centralized access across the application.
 * 
 * ============================================================================
 * TYPE SYSTEM ARCHITECTURE:
 * ============================================================================
 * 
 * Modular Type Organization:
 * - Separate interface files for each major domain (User, Post, Repository)
 * - Centralized re-export for convenient importing across the application
 * - Strict type safety for runtime error prevention
 * - Extensible interfaces for future feature additions
 * 
 * Domain Separation:
 * - user.interface.ts: User management and authentication types
 * - post.interface.ts: Content creation and interaction types
 * - repository.interface.ts: Email repository and community management types
 * - index.ts: Central hub with common types and re-exports
 * 
 * Design Principles:
 * - Clear separation of concerns between domains
 * - Consistent naming conventions across all types
 * - Documentation-driven development support
 * - Maintainable and scalable type definitions
 * 
 * Platform Features Covered:
 * - Email-to-post creation and processing
 * - Repository-based email organization
 * - Snowball distribution for organic growth
 * - Advanced karma and achievement systems
 * - Multi-channel notification management
 * - Real-time collaboration and updates
 * - Comprehensive analytics and reporting
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// ============================================================================
// Domain-Specific Type Imports
// ============================================================================

// Import and re-export all user-related types
export * from './user.interface';

// Import and re-export all post-related types  
export * from './post.interface';

// Import and re-export all repository-related types
export * from './repository.interface';

// ============================================================================
// Common Platform Types and Enumerations
// ============================================================================

/**
 * API Communication Types
 * 
 * Standardized types for API requests, responses, and data transfer
 * across the ShadowNews platform with comprehensive error handling.
 */

/**
 * Pagination Parameters Interface
 * 
 * Standardized pagination configuration for API requests
 * and data retrieval optimization.
 */
export interface PaginationParams {
  page: number;                         // Page number (1-based)
  limit: number;                        // Items per page
  sort?: string;                        // Field to sort by
  order?: 'asc' | 'desc';              // Sort order direction
}

/**
 * Paginated Response Interface
 * 
 * Standardized API response format for paginated data with
 * comprehensive metadata for client-side pagination controls.
 */
export interface PaginatedResponse<T> {
  data: T[];                            // Array of items for current page
  total: number;                        // Total number of items across all pages
  page: number;                         // Current page number
  pages: number;                        // Total number of pages
  limit: number;                        // Items per page limit
  hasNext: boolean;                     // Whether next page exists
  hasPrev: boolean;                     // Whether previous page exists
}

/**
 * API Response Interface
 * 
 * Standardized API response wrapper for consistent error handling
 * and success/failure indication across all endpoints.
 */
export interface ApiResponse<T = any> {
  success: boolean;                     // Whether request was successful
  data?: T;                             // Response data (if successful)
  error?: ApiError;                     // Error information (if failed)
  message?: string;                     // Optional message for additional context
}

/**
 * API Error Interface
 * 
 * Detailed error information for API failures with support
 * for field-specific validation errors.
 */
export interface ApiError {
  code: string;                         // Error code for programmatic handling
  message: string;                      // Human-readable error message
  field?: string;                       // Specific field that caused error (validation)
  details?: Record<string, any>;        // Additional error context
}

// ============================================================================
// Real-Time Communication Types
// ============================================================================

/**
 * WebSocket Message Interface
 * 
 * Real-time communication message format for WebSocket connections
 * with comprehensive metadata and payload support.
 */
export interface WSMessage {
  type: WSMessageType;                  // Message type for routing and handling
  payload: any;                         // Message payload data
  timestamp: Date;                      // Message creation timestamp
  userId?: string;                      // Originating user ID (if applicable)
}

/**
 * WebSocket Message Type Enumeration
 * 
 * Real-time event types for WebSocket communication and
 * live update distribution.
 */
export enum WSMessageType {
  POST_CREATED = 'post_created',        // New post created
  POST_UPDATED = 'post_updated',        // Post modified
  POST_DELETED = 'post_deleted',        // Post removed
  COMMENT_CREATED = 'comment_created',  // New comment added
  COMMENT_UPDATED = 'comment_updated',  // Comment modified
  COMMENT_DELETED = 'comment_deleted',  // Comment removed
  NOTIFICATION = 'notification',        // New notification
  REPOSITORY_UPDATE = 'repository_update', // Repository changes
  USER_STATUS = 'user_status',          // User online/offline status
  SYSTEM = 'system'                     // System announcements
}

// ============================================================================
// Search and Discovery Types
// ============================================================================

/**
 * Search Parameters Interface
 * 
 * Comprehensive search configuration with filtering and pagination
 * support for content discovery and exploration.
 */
export interface SearchParams {
  query: string;                        // Search query string
  filters?: SearchFilters;              // Optional search filters
  pagination: PaginationParams;         // Pagination configuration
}

/**
 * Search Filters Interface
 * 
 * Advanced filtering options for search refinement and
 * content discovery optimization.
 */
export interface SearchFilters {
  type?: ('post' | 'comment' | 'user' | 'repository')[]; // Content types to search
  dateRange?: {                         // Date range filter
    start: Date;                        // Start date
    end: Date;                          // End date
  };
  hashtags?: string[];                  // Filter by hashtags
  authors?: string[];                   // Filter by specific authors
  repositories?: string[];              // Filter by repositories
  minKarma?: number;                    // Minimum author karma filter
  sortBy?: 'relevance' | 'date' | 'points' | 'comments'; // Sort criteria
}

// ============================================================================
// Analytics and Monitoring Types
// ============================================================================

/**
 * Analytics Event Interface
 * 
 * User behavior tracking and analytics event structure for
 * platform optimization and user experience insights.
 */
export interface AnalyticsEvent {
  event: string;                        // Event name/identifier
  userId?: string;                      // User who triggered event (if logged in)
  sessionId: string;                    // Session identifier for tracking
  timestamp: Date;                      // Event occurrence timestamp
  properties?: Record<string, any>;     // Event-specific properties
  page?: string;                        // Page where event occurred
  referrer?: string;                    // Referrer URL
  userAgent?: string;                   // User agent string
}

// ============================================================================
// Email Communication Types
// ============================================================================

/**
 * Email Attachment Interface
 * 
 * File attachment metadata for email messages with
 * security and storage management.
 */
export interface Attachment {
  filename: string;                     // Attachment filename
  contentType: string;                  // MIME type of attachment
  size: number;                         // File size in bytes
  url?: string;                         // Storage URL for attachment
}

/**
 * Email Metadata Interface
 * 
 * Additional contextual information for email tracking and
 * campaign management.
 */
export interface EmailMetadata {
  postId?: string;                      // Related post ID
  repositoryId?: string;                // Related repository ID
  userId?: string;                      // Related user ID
  campaignId?: string;                  // Marketing campaign ID
  tags?: string[];                      // Email categorization tags
}

// ============================================================================
// Karma and Gamification Types
// ============================================================================

/**
 * Karma Transaction Interface
 * 
 * Individual karma-affecting action record for transparency,
 * auditing, and user engagement tracking.
 */
export interface KarmaTransaction {
  _id: string;                          // Unique transaction identifier
  userId: string;                       // User receiving karma change
  amount: number;                       // Karma points awarded or deducted
  type: KarmaType;                      // Type of action that triggered karma change
  reason: string;                       // Human-readable reason for karma change
  relatedId?: string;                   // ID of related content (post, comment, etc.)
  createdAt: Date;                      // Transaction timestamp
}

/**
 * Karma Type Enumeration
 * 
 * All possible karma-affecting actions on the platform for
 * comprehensive gamification and user behavior tracking.
 */
export enum KarmaType {
  POST_UPVOTED = 'post_upvoted',        // Post received upvote
  POST_DOWNVOTED = 'post_downvoted',    // Post received downvote
  COMMENT_UPVOTED = 'comment_upvoted',  // Comment received upvote
  COMMENT_DOWNVOTED = 'comment_downvoted', // Comment received downvote
  POST_CREATED = 'post_created',        // User created new post
  COMMENT_CREATED = 'comment_created',  // User created new comment
  REPOSITORY_CREATED = 'repository_created', // User created new repository
  CSV_UPLOADED = 'csv_uploaded',        // User uploaded CSV data
  EMAIL_VERIFIED = 'email_verified',    // Email address verified
  CURATOR_BONUS = 'curator_bonus',      // Content curation bonus
  MILESTONE_REACHED = 'milestone_reached', // Karma milestone achieved
  FLAGGED_CONTENT = 'flagged_content'   // Content was flagged by community
}

// ============================================================================
// Notification System Types
// ============================================================================

/**
 * Notification Interface
 * 
 * In-platform notification system for real-time user engagement
 * and activity updates with comprehensive metadata support.
 */
export interface Notification {
  _id: string;                          // Unique notification identifier
  userId: string;                       // Target user for notification
  type: NotificationType;               // Category of notification
  title: string;                        // Notification title/headline
  message: string;                      // Notification content/body
  link?: string;                        // Optional link for click-through action
  read: boolean;                        // Read status for user interface
  createdAt: Date;                      // Notification creation timestamp
  metadata?: Record<string, any>;       // Additional notification metadata
}

/**
 * Notification Type Enumeration
 * 
 * Categories of platform notifications for user engagement
 * and activity tracking.
 */
export enum NotificationType {
  COMMENT = 'comment',                  // New comment on user's content
  MENTION = 'mention',                  // User mentioned in content
  FOLLOW = 'follow',                    // New follower notification
  UPVOTE = 'upvote',                    // Content received upvote
  REPOSITORY_INVITE = 'repository_invite', // Invitation to join repository
  REPOSITORY_UPDATE = 'repository_update', // Repository changes or updates
  KARMA_MILESTONE = 'karma_milestone',  // Karma milestone achievement
  SYSTEM = 'system'                     // System announcements and updates
}

// ============================================================================
// Content Moderation Types
// ============================================================================

/**
 * Flag Interface
 * 
 * Content moderation and community reporting system with
 * comprehensive tracking and resolution management.
 */
export interface Flag {
  userId: string;                       // User who reported the content
  reason: FlagReason;                   // Category of reported issue
  description?: string;                 // Optional detailed description
  createdAt: Date;                      // Flag creation timestamp
  resolved: boolean;                    // Whether flag has been addressed
  resolvedBy?: string;                  // Moderator who resolved the flag
  resolvedAt?: Date;                    // Flag resolution timestamp
}

/**
 * Flag Reason Enumeration
 * 
 * Standardized categories for content reporting and moderation.
 */
export enum FlagReason {
  SPAM = 'spam',                        // Spam or promotional content
  INAPPROPRIATE = 'inappropriate',      // Inappropriate or offensive content
  OFF_TOPIC = 'off_topic',              // Content not relevant to discussion
  DUPLICATE = 'duplicate',              // Duplicate or redundant content
  MISLEADING = 'misleading',            // False or misleading information
  OTHER = 'other'                       // Other issues not covered above
}

// ============================================================================
// Session Management Types
// ============================================================================

/**
 * Session Interface
 * 
 * User session management and security tracking with device
 * information and activity monitoring.
 */
export interface Session {
  _id: string;                          // Unique session identifier
  userId: string;                       // User associated with session
  token: string;                        // Session authentication token
  refreshToken: string;                 // Token refresh for extended sessions
  expiresAt: Date;                      // Session expiration timestamp
  createdAt: Date;                      // Session creation timestamp
  lastActivity: Date;                   // Last activity timestamp
  ipAddress: string;                    // Client IP address
  userAgent: string;                    // Client user agent string
  device?: {                            // Device information (parsed from user agent)
    type: string;                       // Device type (mobile, desktop, tablet)
    os: string;                         // Operating system
    browser: string;                    // Browser application
  };
}

// ============================================================================
// File Management Types
// ============================================================================

/**
 * File Upload Interface
 * 
 * File upload management and tracking with metadata and
 * usage monitoring for storage optimization.
 */
export interface FileUpload {
  _id: string;                          // Unique file identifier
  filename: string;                     // Generated filename for storage
  originalName: string;                 // Original filename from upload
  mimetype: string;                     // File MIME type
  size: number;                         // File size in bytes
  url: string;                          // Storage URL for file access
  uploadedBy: string;                   // User who uploaded the file
  uploadedAt: Date;                     // Upload timestamp
  used: boolean;                        // Whether file is actively used
  metadata?: Record<string, any>;       // Additional file metadata
}

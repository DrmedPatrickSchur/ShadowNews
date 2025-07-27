/**
 * @fileoverview Comments Routes for ShadowNews Platform
 * 
 * Comprehensive commenting system routing for the ShadowNews email-first news platform.
 * This module handles all comment-related operations including threaded discussions,
 * voting mechanisms, moderation tools, and user interaction features. Supports nested
 * comment threads, real-time updates, content moderation, and integration with the
 * email digest system for comprehensive community engagement.
 * 
 * Key Features:
 * - Threaded comment system with unlimited nesting depth
 * - Comprehensive voting and reputation system
 * - Content moderation and flagging mechanisms
 * - User comment history and activity tracking
 * - Search functionality across comment content
 * - Bulk moderation tools for administrators
 * - Email digest integration for comment notifications
 * - Real-time comment updates and notifications
 * - Comment export for external processing
 * 
 * Comment Thread Structure:
 * - Hierarchical threading with parent-child relationships
 * - Depth-based display rendering for user interfaces
 * - Pagination support for large comment threads
 * - Efficient retrieval of comment trees
 * - Real-time updates for active discussions
 * 
 * Security Features:
 * - Authentication required for comment creation and voting
 * - Ownership verification for comment editing and deletion
 * - Rate limiting to prevent spam and abuse
 * - Content validation and sanitization
 * - Moderation flags and automated content filtering
 * - Role-based access control for administrative operations
 * 
 * Voting and Engagement:
 * - Upvote system for quality content promotion
 * - Karma integration for user reputation building
 * - Vote tracking and manipulation prevention
 * - Comment score calculation and ranking
 * - User engagement metrics and analytics
 * 
 * Moderation Features:
 * - User flagging system for inappropriate content
 * - Automated content filtering and detection
 * - Bulk moderation tools for administrators
 * - Comment hiding and removal capabilities
 * - User reporting and moderation queue management
 * 
 * Dependencies:
 * - express: Web framework for route definition and handling
 * - commentsController: Business logic for comment operations
 * - authMiddleware: Authentication and authorization middleware
 * - validationMiddleware: Input validation and sanitization
 * - rateLimitMiddleware: Rate limiting for abuse prevention
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for comment routing
const express = require('express');                          // Express web framework
const router = express.Router();                             // Express router instance

// Controller and middleware imports
const commentsController = require('../controllers/comments.controller');       // Comment business logic
const authMiddleware = require('../middlewares/auth.middleware');               // Authentication middleware
const validationMiddleware = require('../middlewares/validation.middleware');   // Input validation
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');     // Rate limiting

// ========== PUBLIC COMMENT RETRIEVAL ROUTES ==========
// These routes provide read access to comments without authentication requirements

/**
 * Get Comments by Post Endpoint
 * GET /api/comments/posts/:postId/comments
 * 
 * Retrieves all comments for a specific post in threaded format.
 * Supports pagination, sorting, and depth control for optimal user experience.
 * 
 * Features:
 * - Hierarchical comment threading with parent-child relationships
 * - Pagination support for large comment sets
 * - Multiple sorting options (newest, oldest, popular, controversial)
 * - Depth limiting for performance optimization
 * - Vote counts and user reputation display
 * - Real-time comment count updates
 * 
 * URL Parameters:
 * - postId: MongoDB ObjectId of the post
 * 
 * Query Parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Comments per page (default: 20, max: 100)
 * - sort: Sort order (newest, oldest, popular, controversial)
 * - depth: Maximum nesting depth (default: 10)
 * 
 * Response:
 * - Nested comment tree structure
 * - Comment metadata (votes, timestamps, user info)
 * - Pagination information
 * - Total comment count for the post
 */
router.get('/posts/:postId/comments', commentsController.getCommentsByPost);

/**
 * Get Single Comment Endpoint
 * GET /api/comments/:commentId
 * 
 * Retrieves a specific comment by its unique identifier.
 * Includes complete comment metadata and relationship information.
 * 
 * Features:
 * - Complete comment data with user information
 * - Vote counts and user voting status (if authenticated)
 * - Parent and child comment references
 * - Comment edit history (if available)
 * - Moderation status and flags
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the comment
 * 
 * Response:
 * - Complete comment object with metadata
 * - User information (username, karma, avatar)
 * - Voting information and user interaction status
 * - Timestamp information (created, edited)
 */
router.get('/:commentId', commentsController.getCommentById);

/**
 * Get Comment Replies Endpoint
 * GET /api/comments/:commentId/replies
 * 
 * Retrieves direct replies to a specific comment.
 * Supports pagination and sorting for large reply sets.
 * 
 * Features:
 * - Direct child comments only (one level deep)
 * - Pagination support for performance
 * - Sorting options for reply organization
 * - Real-time reply count updates
 * - User interaction status for authenticated users
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the parent comment
 * 
 * Query Parameters:
 * - page: Page number for pagination
 * - limit: Replies per page
 * - sort: Sort order for replies
 * 
 * Response:
 * - Array of direct reply comments
 * - Pagination metadata
 * - Parent comment context
 */
router.get('/:commentId/replies', commentsController.getCommentReplies);

// ========== AUTHENTICATED COMMENT CREATION ROUTES ==========
// These routes handle comment creation and require user authentication

/**
 * Create Comment Endpoint
 * POST /api/comments/posts/:postId/comments
 * 
 * Creates a new top-level comment on a specific post.
 * Requires authentication and includes comprehensive validation.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Rate limiting to prevent comment spam
 * 3. Input validation and sanitization
 * 4. Controller logic for comment creation
 * 
 * Security Features:
 * - User authentication required
 * - Rate limiting to prevent spam (30 comments per 15 minutes)
 * - Content validation and sanitization
 * - XSS prevention through input filtering
 * - Comment length limits for quality control
 * 
 * URL Parameters:
 * - postId: MongoDB ObjectId of the target post
 * 
 * Request Body:
 * - text: Comment content (1-5000 characters)
 * - mentions: Optional array of mentioned usernames
 * - attachments: Optional file attachments
 * 
 * Response:
 * - Created comment object with generated ID
 * - User information and metadata
 * - Post context and relationship data
 */
router.post(
  '/posts/:postId/comments',
  authMiddleware.authenticate,                              // Verify user authentication
  rateLimitMiddleware.commentCreation,                      // Prevent comment spam
  validationMiddleware.validateComment,                     // Validate comment content
  commentsController.createComment                          // Handle comment creation
);

/**
 * Reply to Comment Endpoint
 * POST /api/comments/:commentId/replies
 * 
 * Creates a reply to an existing comment, establishing parent-child relationship.
 * Supports unlimited nesting depth with performance optimizations.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Rate limiting for reply creation
 * 3. Input validation and sanitization
 * 4. Controller logic for reply creation
 * 
 * Features:
 * - Threaded conversation support
 * - Automatic notification to parent comment author
 * - Mention detection and user notifications
 * - Context preservation for email digests
 * - Real-time updates for active discussions
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the parent comment
 * 
 * Request Body:
 * - text: Reply content (1-5000 characters)
 * - mentions: Optional array of mentioned usernames
 * 
 * Response:
 * - Created reply comment with parent relationship
 * - Updated thread structure information
 * - Notification status for mentioned users
 */
router.post(
  '/:commentId/replies',
  authMiddleware.authenticate,                              // Verify user authentication
  rateLimitMiddleware.commentCreation,                      // Prevent reply spam
  validationMiddleware.validateComment,                     // Validate reply content
  commentsController.replyToComment                         // Handle reply creation
);

// ========== COMMENT MODIFICATION ROUTES ==========
// These routes handle comment editing and deletion with ownership verification

/**
 * Update Comment Endpoint
 * PUT /api/comments/:commentId
 * 
 * Updates an existing comment with ownership verification.
 * Maintains edit history and provides change tracking.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Comment ownership verification
 * 3. Input validation for updated content
 * 4. Controller logic for comment update
 * 
 * Security Features:
 * - Ownership verification required
 * - Edit time window enforcement (typically 15 minutes)
 * - Edit history preservation for transparency
 * - Content validation and sanitization
 * - Moderation flag preservation
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the comment to update
 * 
 * Request Body:
 * - text: Updated comment content
 * - editReason: Optional reason for the edit
 * 
 * Response:
 * - Updated comment object with edit timestamp
 * - Edit history metadata
 * - Change summary for transparency
 */
router.put(
  '/:commentId',
  authMiddleware.authenticate,                              // Verify user authentication
  authMiddleware.checkCommentOwnership,                     // Verify comment ownership
  validationMiddleware.validateCommentUpdate,               // Validate update content
  commentsController.updateComment                          // Handle comment update
);

/**
 * Delete Comment Endpoint
 * DELETE /api/comments/:commentId
 * 
 * Deletes a comment with ownership verification and proper cleanup.
 * Handles cascading deletion for reply threads if configured.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Comment ownership verification
 * 3. Controller logic for comment deletion
 * 
 * Security Features:
 * - Ownership verification required
 * - Soft deletion for content preservation
 * - Reply thread handling (preserve or cascade)
 * - Vote and karma adjustment
 * - Audit trail maintenance
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the comment to delete
 * 
 * Response:
 * - Deletion confirmation
 * - Updated thread structure
 * - Karma adjustment information
 */
router.delete(
  '/:commentId',
  authMiddleware.authenticate,                              // Verify user authentication
  authMiddleware.checkCommentOwnership,                     // Verify comment ownership
  commentsController.deleteComment                          // Handle comment deletion
);

// ========== VOTING AND ENGAGEMENT ROUTES ==========
// These routes handle user voting and engagement interactions

/**
 * Upvote Comment Endpoint
 * POST /api/comments/:commentId/upvote
 * 
 * Adds an upvote to a comment and updates user karma.
 * Prevents duplicate voting and vote manipulation.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Rate limiting for voting actions
 * 3. Controller logic for vote processing
 * 
 * Features:
 * - Duplicate vote prevention
 * - Karma calculation and updating
 * - Vote weight based on user reputation
 * - Real-time score updates
 * - Vote manipulation detection
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the comment to upvote
 * 
 * Response:
 * - Updated vote count
 * - User voting status
 * - Karma changes for comment author
 */
router.post(
  '/:commentId/upvote',
  authMiddleware.authenticate,                              // Verify user authentication
  rateLimitMiddleware.voting,                               // Prevent vote manipulation
  commentsController.upvoteComment                          // Handle upvote processing
);

/**
 * Remove Upvote Endpoint
 * DELETE /api/comments/:commentId/upvote
 * 
 * Removes a user's upvote from a comment.
 * Updates vote counts and karma accordingly.
 * 
 * Features:
 * - Vote removal validation
 * - Karma adjustment for removed votes
 * - Real-time score updates
 * - User voting status tracking
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the comment
 * 
 * Response:
 * - Updated vote count
 * - Karma adjustment information
 * - User voting status update
 */
router.delete(
  '/:commentId/upvote',
  authMiddleware.authenticate,                              // Verify user authentication
  commentsController.removeUpvote                           // Handle upvote removal
);

// ========== MODERATION AND CONTENT MANAGEMENT ROUTES ==========
// These routes handle content moderation and community management

/**
 * Flag Comment Endpoint
 * POST /api/comments/:commentId/flag
 * 
 * Flags a comment for moderation review.
 * Supports multiple flag types and community-based moderation.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Rate limiting for flagging actions
 * 3. Flag validation and categorization
 * 4. Controller logic for flag processing
 * 
 * Features:
 * - Multiple flag categories (spam, harassment, off-topic, etc.)
 * - Duplicate flag prevention per user
 * - Automatic moderation thresholds
 * - Moderator notification system
 * - Community-based content quality control
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the comment to flag
 * 
 * Request Body:
 * - reason: Flag category (spam, harassment, inappropriate, etc.)
 * - description: Optional detailed description
 * 
 * Response:
 * - Flag confirmation
 * - Moderation queue status
 * - Community flagging statistics
 */
router.post(
  '/:commentId/flag',
  authMiddleware.authenticate,                              // Verify user authentication
  rateLimitMiddleware.flagging,                             // Prevent flag abuse
  validationMiddleware.validateFlag,                        // Validate flag data
  commentsController.flagComment                            // Handle comment flagging
);

// ========== USER ACTIVITY AND HISTORY ROUTES ==========
// These routes provide user activity tracking and comment history

/**
 * Get User Comments Endpoint
 * GET /api/comments/users/:userId/comments
 * 
 * Retrieves comment history for a specific user.
 * Supports pagination and privacy controls.
 * 
 * Features:
 * - User comment history with pagination
 * - Privacy settings respect for private profiles
 * - Comment score and engagement metrics
 * - Date range filtering options
 * - Sort by various criteria (newest, popular, controversial)
 * 
 * URL Parameters:
 * - userId: MongoDB ObjectId of the user
 * 
 * Query Parameters:
 * - page: Page number for pagination
 * - limit: Comments per page
 * - sort: Sort order (newest, popular, score)
 * - dateFrom: Start date for filtering
 * - dateTo: End date for filtering
 * 
 * Response:
 * - Paginated user comment history
 * - Comment engagement statistics
 * - User profile context
 */
router.get(
  '/users/:userId/comments',
  commentsController.getUserComments                        // Handle user comment retrieval
);

/**
 * Search Comments Endpoint
 * GET /api/comments/search
 * 
 * Searches across comment content with advanced filtering options.
 * Supports full-text search and metadata filtering.
 * 
 * Features:
 * - Full-text search across comment content
 * - User and post filtering options
 * - Date range and score filtering
 * - Pagination and sorting support
 * - Search result highlighting
 * 
 * Query Parameters:
 * - q: Search query string
 * - author: Filter by comment author
 * - postId: Filter by specific post
 * - minScore: Minimum comment score
 * - dateFrom: Start date for filtering
 * - dateTo: End date for filtering
 * - page: Page number for pagination
 * - limit: Results per page
 * 
 * Response:
 * - Paginated search results
 * - Search metadata and statistics
 * - Highlighted search terms
 */
router.get(
  '/search',
  validationMiddleware.validateSearch,                      // Validate search parameters
  commentsController.searchComments                         // Handle comment search
);

// ========== ADMINISTRATIVE AND BULK OPERATIONS ==========
// These routes provide administrative tools for content management

/**
 * Bulk Delete Comments Endpoint
 * POST /api/comments/bulk/delete
 * 
 * Performs bulk deletion of comments for moderation purposes.
 * Requires moderator privileges and comprehensive logging.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Moderator role verification
 * 3. Bulk operation validation
 * 4. Controller logic for bulk deletion
 * 
 * Security Features:
 * - Moderator role verification required
 * - Bulk operation limits for safety
 * - Comprehensive audit logging
 * - Rollback capabilities for mistakes
 * - User notification for affected content
 * 
 * Request Body:
 * - commentIds: Array of comment IDs to delete
 * - reason: Reason for bulk deletion
 * - notifyUsers: Whether to notify affected users
 * 
 * Response:
 * - Deletion summary and statistics
 * - Failed deletion details
 * - Audit log entries
 */
router.post(
  '/bulk/delete',
  authMiddleware.authenticate,                              // Verify user authentication
  authMiddleware.checkModeratorRole,                        // Verify moderator privileges
  validationMiddleware.validateBulkOperation,               // Validate bulk operation
  commentsController.bulkDeleteComments                     // Handle bulk deletion
);

/**
 * Get Comment Thread Endpoint
 * GET /api/comments/:commentId/thread
 * 
 * Retrieves complete comment thread including ancestors and descendants.
 * Provides full context for complex discussions.
 * 
 * Features:
 * - Complete thread hierarchy retrieval
 * - Ancestor and descendant comment chains
 * - Thread depth and breadth information
 * - Performance optimization for large threads
 * - Context preservation for user navigation
 * 
 * URL Parameters:
 * - commentId: MongoDB ObjectId of the reference comment
 * 
 * Query Parameters:
 * - maxDepth: Maximum depth for descendant retrieval
 * - includeDeleted: Whether to include deleted comments
 * 
 * Response:
 * - Complete thread structure
 * - Comment hierarchy metadata
 * - Navigation aids for user interface
 */
router.get(
  '/:commentId/thread',
  commentsController.getCommentThread                       // Handle thread retrieval
);

/**
 * Export Comments for Digest Endpoint
 * GET /api/comments/export/:postId
 * 
 * Exports comments in format suitable for email digests.
 * Provides formatted content for newsletter generation.
 * 
 * Features:
 * - Email-friendly comment formatting
 * - Thread structure preservation
 * - User mention handling
 * - Content length optimization
 * - HTML and plain text formats
 * 
 * URL Parameters:
 * - postId: MongoDB ObjectId of the post
 * 
 * Query Parameters:
 * - format: Export format (html, text, json)
 * - limit: Maximum comments to include
 * - minScore: Minimum comment score for inclusion
 * 
 * Response:
 * - Formatted comment data for email
 * - Thread structure information
 * - User engagement statistics
 */
router.get(
  '/export/:postId',
  authMiddleware.authenticate,                              // Verify user authentication
  commentsController.exportCommentsForDigest               // Handle comment export
);

// Export configured comments router for application use
module.exports = router;

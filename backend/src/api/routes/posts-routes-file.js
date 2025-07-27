/**
 * @fileoverview Posts Routes for ShadowNews Platform
 * 
 * Comprehensive post management routing system for the ShadowNews email-first news platform.
 * This module handles all post-related operations including content creation, discovery, interaction,
 * moderation, and analytics. Features email-first content creation, advanced search capabilities,
 * voting mechanisms, repository integration, CSV data management, and comprehensive content analytics.
 * 
 * Key Features:
 * - Email-first post creation with seamless content integration
 * - Advanced post discovery with trending and recommendation algorithms
 * - Comprehensive voting and engagement tracking system
 * - Repository-based content organization and association
 * - CSV data upload and management for structured content
 * - Real-time analytics and performance metrics
 * - Content moderation and community quality controls
 * - Advanced search with filtering and relevance scoring
 * - Hashtag-based content categorization and discovery
 * - User activity tracking and content history
 * 
 * Content Discovery Features:
 * - Trending posts with algorithmic ranking
 * - Repository-based content organization
 * - Hashtag-based categorization and filtering
 * - Related post recommendations
 * - Advanced search with relevance scoring
 * - User-specific content feeds and personalization
 * 
 * Engagement Features:
 * - Voting system with karma integration
 * - Comment threading and discussion management
 * - Content sharing and viral mechanics
 * - User interaction tracking and analytics
 * - Community engagement metrics
 * 
 * Content Management:
 * - Email-to-post conversion for seamless publishing
 * - Rich content editing and formatting
 * - Repository association and organization
 * - CSV data integration for structured content
 * - Content versioning and edit history
 * - Bulk operations for administrative management
 * 
 * Security and Moderation:
 * - Content validation and sanitization
 * - Community-based flagging system
 * - Automated content filtering
 * - Spam prevention and detection
 * - Rate limiting for abuse prevention
 * 
 * Dependencies:
 * - express: Web framework for route definition and handling
 * - postsController: Business logic for post operations
 * - authMiddleware: Authentication and authorization middleware
 * - validationMiddleware: Input validation and sanitization
 * - rateLimitMiddleware: Rate limiting for abuse prevention
 * - uploadMiddleware: File upload handling for CSV data
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for post routing
const express = require('express');                          // Express web framework
const router = express.Router();                             // Express router instance

// Controller and middleware imports
const postsController = require('../controllers/posts.controller');         // Post business logic
const authMiddleware = require('../middlewares/auth.middleware');           // Authentication middleware
const validationMiddleware = require('../middlewares/validation.middleware'); // Input validation
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware'); // Rate limiting
const uploadMiddleware = require('../middlewares/upload.middleware');       // File upload handling

// ========== PUBLIC POST DISCOVERY ROUTES ==========
// These routes provide public access to post content and discovery features

/**
 * Get All Posts Endpoint
 * GET /api/posts/
 * 
 * Retrieves paginated list of posts with comprehensive filtering and sorting options.
 * Supports advanced discovery algorithms and personalization features.
 * 
 * Features:
 * - Pagination with configurable page size
 * - Multiple sorting algorithms (hot, new, top, controversial)
 * - Advanced filtering by date, score, and metadata
 * - Personalized content recommendations (if authenticated)
 * - Repository and hashtag filtering
 * - Search query integration
 * - Real-time popularity scoring
 * 
 * Query Parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Posts per page (default: 20, max: 100)
 * - sort: Sort algorithm (hot, new, top, controversial)
 * - timeframe: Time filter (hour, day, week, month, year, all)
 * - repository: Filter by repository ID
 * - hashtag: Filter by hashtag
 * - minScore: Minimum post score filter
 * 
 * Response:
 * - Paginated post list with metadata
 * - Post engagement metrics (votes, comments, views)
 * - User interaction status (if authenticated)
 * - Repository and hashtag information
 * - Pagination and filtering metadata
 */
router.get('/', postsController.getAllPosts);

/**
 * Get Trending Posts Endpoint
 * GET /api/posts/trending
 * 
 * Retrieves currently trending posts using advanced algorithmic ranking.
 * Features velocity-based trending detection and community engagement analysis.
 * 
 * Features:
 * - Advanced trending algorithm with velocity detection
 * - Community engagement weight factors
 * - Time-decay scoring for recency bias
 * - Quality threshold filtering
 * - Geographic and demographic trending analysis
 * - Trending category breakdown (tech, politics, science, etc.)
 * 
 * Query Parameters:
 * - timeframe: Trending window (hour, 6hour, day, week)
 * - category: Filter by content category
 * - limit: Maximum trending posts to return
 * 
 * Response:
 * - Trending posts with velocity scores
 * - Trending metadata and algorithmic insights
 * - Category-specific trending breakdowns
 * - Trending timeline and momentum indicators
 */
router.get('/trending', postsController.getTrendingPosts);

/**
 * Get Posts by Hashtag Endpoint
 * GET /api/posts/hashtag/:hashtag
 * 
 * Retrieves posts associated with a specific hashtag.
 * Provides hashtag-based content discovery and community organization.
 * 
 * Features:
 * - Hashtag-based content filtering
 * - Related hashtag suggestions
 * - Hashtag popularity and usage statistics
 * - Time-based hashtag trend analysis
 * - Cross-hashtag content recommendations
 * 
 * URL Parameters:
 * - hashtag: Hashtag name (without # prefix)
 * 
 * Query Parameters:
 * - page: Page number for pagination
 * - limit: Posts per page
 * - sort: Sort order for hashtag posts
 * - timeframe: Time filter for hashtag posts
 * 
 * Response:
 * - Hashtag-filtered post list
 * - Hashtag statistics and trends
 * - Related hashtag recommendations
 * - Community engagement metrics for hashtag
 */
router.get('/hashtag/:hashtag', postsController.getPostsByHashtag);

/**
 * Get Posts by Repository Endpoint
 * GET /api/posts/repository/:repositoryId
 * 
 * Retrieves posts associated with a specific repository.
 * Enables repository-based content organization and discovery.
 * 
 * Features:
 * - Repository-specific content filtering
 * - Repository activity and engagement metrics
 * - Repository member content preferences
 * - Cross-repository content recommendations
 * - Repository quality and curation metrics
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of the repository
 * 
 * Query Parameters:
 * - page: Page number for pagination
 * - limit: Posts per page
 * - sort: Sort order for repository posts
 * - timeframe: Time filter for repository activity
 * 
 * Response:
 * - Repository-filtered post list
 * - Repository activity statistics
 * - Member engagement metrics
 * - Content quality indicators
 */
router.get('/repository/:repositoryId', postsController.getPostsByRepository);

/**
 * Get Single Post Endpoint
 * GET /api/posts/:id
 * 
 * Retrieves detailed information for a specific post.
 * Includes comprehensive metadata, engagement metrics, and related content.
 * 
 * Features:
 * - Complete post data with rich metadata
 * - Engagement metrics and analytics
 * - User interaction status (if authenticated)
 * - Repository and hashtag associations
 * - Related content recommendations
 * - View tracking and analytics
 * - Comment count and preview
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post
 * 
 * Response:
 * - Complete post object with metadata
 * - Author information and reputation
 * - Engagement metrics (votes, comments, views, shares)
 * - Repository and hashtag associations
 * - Related post recommendations
 * - User interaction history (if authenticated)
 */
router.get('/:id', postsController.getPostById);

/**
 * Get Post Comments Endpoint
 * GET /api/posts/:id/comments
 * 
 * Retrieves comments for a specific post in threaded format.
 * Provides comprehensive discussion management and organization.
 * 
 * Features:
 * - Threaded comment display with nesting
 * - Comment sorting and filtering options
 * - Pagination for large comment threads
 * - Comment quality and moderation indicators
 * - Real-time comment updates
 * - User interaction status for comments
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post
 * 
 * Query Parameters:
 * - page: Page number for comment pagination
 * - limit: Comments per page
 * - sort: Comment sort order (newest, oldest, best, controversial)
 * - depth: Maximum comment nesting depth
 * 
 * Response:
 * - Threaded comment structure
 * - Comment engagement metrics
 * - User voting status (if authenticated)
 * - Comment moderation status
 * - Discussion quality indicators
 */
router.get('/:id/comments', postsController.getPostComments);

// ========== AUTHENTICATED POST CREATION ROUTES ==========
// These routes handle post creation with authentication requirements

/**
 * Create Post Endpoint
 * POST /api/posts/
 * 
 * Creates a new post with comprehensive content validation and processing.
 * Supports rich content creation with repository association and hashtag tagging.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Rate limiting for post creation abuse prevention
 * 3. Input validation and content sanitization
 * 4. Controller logic for post creation and processing
 * 
 * Features:
 * - Rich content creation with title, URL, and text content
 * - Automatic hashtag detection and association
 * - Repository linking and content organization
 * - Content quality scoring and validation
 * - Duplicate content detection and prevention
 * - Spam filtering and abuse prevention
 * 
 * Request Body:
 * - title: Post title (5-300 characters)
 * - url: Optional URL for link posts
 * - text: Optional text content for text posts
 * - hashtags: Optional hashtag array for categorization
 * - repositoryIds: Optional repository associations
 * 
 * Response:
 * - Created post object with generated ID
 * - Post metadata and associations
 * - Quality score and ranking information
 * - Content processing status
 */
router.post('/', 
  authMiddleware.requireAuth,                               // Verify user authentication
  rateLimitMiddleware.postCreation,                         // Prevent post creation spam
  validationMiddleware.validatePost,                        // Validate post content
  postsController.createPost                                // Handle post creation
);

/**
 * Create Post from Email Endpoint
 * POST /api/posts/email
 * 
 * Creates a post from email content using email authentication tokens.
 * Core feature for email-first content creation workflow.
 * 
 * Middleware Stack:
 * 1. Email token validation for secure email-to-post conversion
 * 2. Email content validation and processing
 * 3. Controller logic for email content transformation
 * 
 * Features:
 * - Email-to-post content transformation
 * - Automatic content extraction and formatting
 * - Email metadata preservation and linking
 * - Repository routing based on email alias
 * - Hashtag detection from email content
 * - Attachment processing and integration
 * 
 * Request Body:
 * - emailToken: Secure email authentication token
 * - subject: Email subject (becomes post title)
 * - body: Email content (text or HTML)
 * - fromEmail: Sender email address
 * - toEmail: Recipient email alias
 * - attachments: Optional email attachments
 * 
 * Response:
 * - Created post from email content
 * - Email-to-post transformation summary
 * - Content processing and optimization results
 * - Repository routing and association details
 */
router.post('/email', 
  authMiddleware.validateEmailToken,                        // Validate email authentication token
  validationMiddleware.validateEmailPost,                   // Validate email post content
  postsController.createPostFromEmail                       // Handle email-to-post conversion
);

// ========== POST MODIFICATION ROUTES ==========
// These routes handle post editing and deletion with ownership verification

/**
 * Update Post Endpoint
 * PUT /api/posts/:id
 * 
 * Updates an existing post with ownership verification and edit tracking.
 * Maintains content history and provides change transparency.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Post ownership verification
 * 3. Content validation for updates
 * 4. Controller logic for post modification
 * 
 * Features:
 * - Content update with edit history preservation
 * - Ownership verification for security
 * - Edit time window enforcement
 * - Content quality re-evaluation
 * - Change notification to subscribers
 * - Edit reason tracking and transparency
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post to update
 * 
 * Request Body:
 * - title: Updated post title
 * - text: Updated text content
 * - hashtags: Updated hashtag associations
 * - editReason: Optional reason for edit
 * 
 * Response:
 * - Updated post object with edit metadata
 * - Edit history and change summary
 * - Content quality re-evaluation results
 * - Notification status for subscribers
 */
router.put('/:id', 
  authMiddleware.requireAuth,                               // Verify user authentication
  authMiddleware.checkPostOwnership,                        // Verify post ownership
  validationMiddleware.validatePost,                        // Validate updated content
  postsController.updatePost                                // Handle post update
);

/**
 * Delete Post Endpoint
 * DELETE /api/posts/:id
 * 
 * Deletes a post with ownership verification and proper cleanup.
 * Handles cascading deletion of associated content and relationships.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Post ownership verification
 * 3. Controller logic for post deletion and cleanup
 * 
 * Features:
 * - Ownership verification for security
 * - Soft deletion with content preservation options
 * - Cascading cleanup of comments and votes
 * - Repository association cleanup
 * - Karma adjustment for deletion
 * - Audit trail maintenance
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post to delete
 * 
 * Response:
 * - Deletion confirmation and summary
 * - Cleanup operation results
 * - Karma adjustment information
 * - Content preservation status
 */
router.delete('/:id', 
  authMiddleware.requireAuth,                               // Verify user authentication
  authMiddleware.checkPostOwnership,                        // Verify post ownership
  postsController.deletePost                                // Handle post deletion
);

// ========== POST INTERACTION ROUTES ==========
// These routes handle user interactions with posts (voting, commenting)

/**
 * Upvote Post Endpoint
 * POST /api/posts/:id/upvote
 * 
 * Adds an upvote to a post with vote validation and karma processing.
 * Integrates with reputation system and content ranking algorithms.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Rate limiting for voting abuse prevention
 * 3. Controller logic for vote processing and karma calculation
 * 
 * Features:
 * - Duplicate vote prevention per user
 * - Karma calculation and author reputation updates
 * - Vote weight based on user reputation
 * - Real-time score updates and ranking adjustment
 * - Vote manipulation detection and prevention
 * - Community engagement tracking
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post to upvote
 * 
 * Response:
 * - Vote confirmation and updated score
 * - Karma changes for post author
 * - User voting status update
 * - Post ranking adjustment information
 */
router.post('/:id/upvote', 
  authMiddleware.requireAuth,                               // Verify user authentication
  rateLimitMiddleware.voting,                               // Prevent vote manipulation
  postsController.upvotePost                                // Handle upvote processing
);

/**
 * Remove Upvote Endpoint
 * DELETE /api/posts/:id/upvote
 * 
 * Removes a user's upvote from a post with vote tracking and karma adjustment.
 * Maintains voting history and reputation consistency.
 * 
 * Features:
 * - Vote removal validation and processing
 * - Karma adjustment for removed votes
 * - Real-time score and ranking updates
 * - Vote history preservation for analytics
 * - User voting status tracking
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post
 * 
 * Response:
 * - Vote removal confirmation
 * - Updated post score and ranking
 * - Karma adjustment summary
 * - User voting status update
 */
router.delete('/:id/upvote', 
  authMiddleware.requireAuth,                               // Verify user authentication
  postsController.removeUpvote                              // Handle upvote removal
);

/**
 * Add Comment to Post Endpoint
 * POST /api/posts/:id/comments
 * 
 * Adds a comment to a post with content validation and discussion threading.
 * Integrates with notification system and community engagement tracking.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Rate limiting for comment spam prevention
 * 3. Comment content validation and sanitization
 * 4. Controller logic for comment creation and threading
 * 
 * Features:
 * - Comment content validation and sanitization
 * - Discussion threading and organization
 * - Notification to post author and mentioned users
 * - Comment quality scoring and moderation
 * - Real-time discussion updates
 * - User mention detection and processing
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post
 * 
 * Request Body:
 * - text: Comment content (1-5000 characters)
 * - parentId: Optional parent comment for threading
 * - mentions: Optional array of mentioned usernames
 * 
 * Response:
 * - Created comment with metadata
 * - Discussion threading information
 * - Notification status for mentions
 * - Comment quality assessment
 */
router.post('/:id/comments', 
  authMiddleware.requireAuth,                               // Verify user authentication
  rateLimitMiddleware.commenting,                           // Prevent comment spam
  validationMiddleware.validateComment,                     // Validate comment content
  postsController.addComment                                // Handle comment creation
);

// ========== POST ORGANIZATION AND MANAGEMENT ROUTES ==========
// These routes handle post organization, data management, and associations

/**
 * Attach Repository to Post Endpoint
 * POST /api/posts/:id/repository
 * 
 * Associates a repository with a post for content organization.
 * Enables repository-based content curation and management.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Post ownership verification
 * 3. Controller logic for repository association
 * 
 * Features:
 * - Repository association with ownership verification
 * - Content organization and categorization
 * - Repository member notification
 * - Content quality and relevance scoring
 * - Cross-repository content recommendations
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post
 * 
 * Request Body:
 * - repositoryId: MongoDB ObjectId of the repository
 * - relevanceScore: Optional relevance assessment
 * - notes: Optional association notes
 * 
 * Response:
 * - Repository association confirmation
 * - Content organization updates
 * - Repository member notification status
 * - Quality and relevance assessment
 */
router.post('/:id/repository', 
  authMiddleware.requireAuth,                               // Verify user authentication
  authMiddleware.checkPostOwnership,                        // Verify post ownership
  postsController.attachRepository                          // Handle repository association
);

/**
 * Upload CSV to Post Endpoint
 * POST /api/posts/:id/csv
 * 
 * Uploads and processes CSV data associated with a post.
 * Enables structured data integration and analysis within posts.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Post ownership verification
 * 3. File upload handling for CSV data
 * 4. CSV validation and processing
 * 5. Controller logic for data integration
 * 
 * Features:
 * - CSV file upload and validation
 * - Structured data processing and integration
 * - Data visualization and analysis tools
 * - Data quality assessment and reporting
 * - Integration with post content and discussions
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post
 * 
 * Request:
 * - csv: CSV file upload (multipart form data)
 * - columnMapping: Optional column interpretation mapping
 * - dataDescription: Optional description of the data
 * 
 * Response:
 * - CSV processing confirmation and summary
 * - Data quality assessment results
 * - Integration status with post content
 * - Data visualization and analysis options
 */
router.post('/:id/csv', 
  authMiddleware.requireAuth,                               // Verify user authentication
  authMiddleware.checkPostOwnership,                        // Verify post ownership
  uploadMiddleware.single('csv'),                           // Handle CSV file upload
  validationMiddleware.validateCSV,                         // Validate CSV structure
  postsController.uploadCSV                                 // Handle CSV processing
);

// ========== POST ANALYTICS AND INSIGHTS ROUTES ==========
// These routes provide post performance analytics and insights

/**
 * Get Post Analytics Endpoint
 * GET /api/posts/:id/analytics
 * 
 * Retrieves comprehensive analytics for a specific post.
 * Provides detailed performance metrics and engagement insights.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Post ownership verification for detailed analytics
 * 3. Controller logic for analytics compilation and reporting
 * 
 * Features:
 * - Comprehensive engagement metrics (views, votes, comments, shares)
 * - Time-based analytics and trend analysis
 * - Audience demographics and geographic insights
 * - Traffic source analysis and referrer tracking
 * - Content performance benchmarking
 * - Optimization recommendations and insights
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post
 * 
 * Query Parameters:
 * - timeframe: Analytics timeframe (hour, day, week, month)
 * - metrics: Specific metrics to include in response
 * - compare: Comparison period for trend analysis
 * 
 * Response:
 * - Comprehensive post analytics dashboard
 * - Engagement metrics and trends
 * - Audience insights and demographics
 * - Performance benchmarking and comparisons
 * - Optimization recommendations
 */
router.get('/:id/analytics', 
  authMiddleware.requireAuth,                               // Verify user authentication
  authMiddleware.checkPostOwnership,                        // Verify post ownership
  postsController.getPostAnalytics                          // Handle analytics retrieval
);

// ========== CONTENT MODERATION ROUTES ==========
// These routes handle content moderation and community quality control

/**
 * Flag Post for Moderation Endpoint
 * POST /api/posts/:id/flag
 * 
 * Flags a post for moderation review with detailed flag categorization.
 * Supports community-driven content quality control and moderation.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Flag validation and categorization
 * 3. Controller logic for moderation queue management
 * 
 * Features:
 * - Multiple flag categories (spam, inappropriate, off-topic, etc.)
 * - Duplicate flag prevention per user
 * - Automatic moderation threshold triggers
 * - Moderator notification and queue management
 * - Community-based quality control
 * - Flag analytics and pattern recognition
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the post to flag
 * 
 * Request Body:
 * - reason: Flag category (spam, inappropriate, misinformation, etc.)
 * - description: Optional detailed description of the issue
 * - severity: Optional severity assessment
 * 
 * Response:
 * - Flag submission confirmation
 * - Moderation queue status update
 * - Community flagging statistics
 * - Expected review timeline
 */
router.post('/:id/flag', 
  authMiddleware.requireAuth,                               // Verify user authentication
  validationMiddleware.validateFlag,                        // Validate flag submission
  postsController.flagPost                                  // Handle post flagging
);

// ========== CONTENT DISCOVERY AND RECOMMENDATION ROUTES ==========
// These routes provide advanced content discovery and recommendation features

/**
 * Get Related Posts Endpoint
 * GET /api/posts/:id/related
 * 
 * Retrieves posts related to the specified post using content analysis.
 * Provides intelligent content discovery and user engagement optimization.
 * 
 * Features:
 * - Content similarity analysis and matching
 * - User interest and behavior-based recommendations
 * - Repository and hashtag correlation analysis
 * - Engagement pattern recognition
 * - Collaborative filtering and recommendation algorithms
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the reference post
 * 
 * Query Parameters:
 * - limit: Maximum related posts to return
 * - algorithm: Recommendation algorithm preference
 * - exclude: Post IDs to exclude from recommendations
 * 
 * Response:
 * - Related post recommendations with similarity scores
 * - Recommendation algorithm insights
 * - Content correlation analysis
 * - User engagement optimization suggestions
 */
router.get('/:id/related', postsController.getRelatedPosts);

/**
 * Get Posts by User Endpoint
 * GET /api/posts/user/:userId
 * 
 * Retrieves posts created by a specific user with activity tracking.
 * Provides user content history and activity analysis.
 * 
 * Features:
 * - User content history with pagination
 * - Post performance and engagement metrics
 * - Content quality and reputation tracking
 * - Activity timeline and posting patterns
 * - User specialization and expertise analysis
 * 
 * URL Parameters:
 * - userId: MongoDB ObjectId of the user
 * 
 * Query Parameters:
 * - page: Page number for pagination
 * - limit: Posts per page
 * - sort: Sort order (newest, popular, controversial)
 * - timeframe: Time filter for user activity
 * 
 * Response:
 * - User's post history with metadata
 * - Content performance analytics
 * - User activity patterns and insights
 * - Expertise and specialization indicators
 */
router.get('/user/:userId', postsController.getPostsByUser);

/**
 * Search Posts Endpoint
 * GET /api/posts/search
 * 
 * Searches posts using advanced full-text search and filtering capabilities.
 * Provides comprehensive content discovery and relevance scoring.
 * 
 * Features:
 * - Full-text search across post content
 * - Advanced filtering by metadata, dates, and engagement
 * - Relevance scoring and result ranking
 * - Search result highlighting and snippets
 * - Search analytics and query optimization
 * - Saved search and alert capabilities
 * 
 * Query Parameters:
 * - q: Search query string
 * - sort: Result sorting (relevance, date, popularity)
 * - filter: Advanced filtering options
 * - page: Page number for pagination
 * - limit: Results per page
 * - highlight: Enable search term highlighting
 * 
 * Response:
 * - Paginated search results with relevance scores
 * - Search metadata and statistics
 * - Query suggestions and refinements
 * - Search result highlighting and snippets
 */
router.get('/search', validationMiddleware.validateSearch, postsController.searchPosts);

// ========== ADMINISTRATIVE OPERATIONS ==========
// These routes provide administrative tools for content management

/**
 * Bulk Delete Posts Endpoint
 * POST /api/posts/bulk/delete
 * 
 * Performs bulk deletion of posts for administrative content management.
 * Requires admin privileges and provides comprehensive auditing.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Admin role verification
 * 3. Controller logic for bulk operations and auditing
 * 
 * Features:
 * - Administrative bulk post deletion
 * - Comprehensive audit logging and tracking
 * - Cascading cleanup of related content
 * - Rollback capabilities for recovery
 * - User notification for affected content
 * - Impact analysis and reporting
 * 
 * Request Body:
 * - postIds: Array of post IDs for deletion
 * - reason: Administrative reason for bulk deletion
 * - notifyUsers: Whether to notify affected users
 * - preserveData: Data preservation options
 * 
 * Response:
 * - Bulk deletion summary and results
 * - Audit trail and logging information
 * - User notification status
 * - Recovery and rollback options
 */
router.post('/bulk/delete', 
  authMiddleware.requireAuth,                               // Verify user authentication
  authMiddleware.requireAdmin,                              // Verify admin privileges
  postsController.bulkDelete                                // Handle bulk deletion
);

// Export configured posts router for application use
module.exports = router;
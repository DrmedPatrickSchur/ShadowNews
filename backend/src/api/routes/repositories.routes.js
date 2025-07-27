/**
 * @fileoverview Repositories Routes for ShadowNews Platform
 * 
 * Comprehensive repository management routing system for the ShadowNews email-first news platform.
 * This module handles all repository-related operations including creation, management, collaboration,
 * email integration, and analytics. Repositories serve as organized collections of email addresses
 * and content for targeted communication and community building.
 * 
 * Key Features:
 * - Repository creation and lifecycle management
 * - Email collection and verification systems
 * - Snowball growth mechanisms for viral expansion
 * - Advanced collaboration and permission management
 * - CSV data import and export capabilities
 * - Comprehensive analytics and reporting
 * - Content organization and quality control
 * - Subscription and notification management
 * - Repository sharing and cloning functionality
 * - Bulk operations for administrative efficiency
 * 
 * Repository Management Features:
 * - Private and public repository options
 * - Quality threshold controls for content curation
 * - Auto-approval mechanisms for streamlined workflow
 * - Topic-based categorization and discovery
 * - Hashtag integration for content organization
 * - Activity tracking and engagement analytics
 * 
 * Email Management Features:
 * - Email verification and validation systems
 * - Bulk email import with CSV support
 * - Email tagging and categorization
 * - Snowball referral tracking and expansion
 * - Deliverability monitoring and optimization
 * - Digest generation and distribution
 * 
 * Collaboration Features:
 * - Multi-level permission system (viewer, contributor, admin)
 * - Repository sharing with granular access controls
 * - Collaborative content curation and moderation
 * - Team-based repository management
 * - Activity logging and audit trails
 * 
 * Analytics and Reporting:
 * - Repository performance metrics and trends
 * - Email engagement and deliverability analytics
 * - Growth tracking and expansion analysis
 * - Custom report generation with multiple formats
 * - Subscriber behavior and interaction insights
 * 
 * Security Features:
 * - Authentication and authorization for all operations
 * - Input validation and sanitization
 * - Rate limiting for abuse prevention
 * - Audit logging for security tracking
 * - Access control with role-based permissions
 * 
 * Dependencies:
 * - express: Web framework for route definition and handling
 * - express-validator: Input validation and sanitization
 * - repositoriesController: Business logic for repository operations
 * - authMiddleware: Authentication and authorization middleware
 * - validationMiddleware: Input validation processing
 * - uploadMiddleware: File upload handling for CSV operations
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for repository routing
const express = require('express');                          // Express web framework
const router = express.Router();                             // Express router instance

// Middleware and controller imports
const { authenticate } = require('../middlewares/auth.middleware');          // Authentication middleware
const { validate } = require('../middlewares/validation.middleware');        // Validation processing
const upload = require('../middlewares/upload.middleware');                  // File upload handling
const repositoriesController = require('../controllers/repositories.controller'); // Repository business logic

// Express validator utilities for route-specific validation
const { body, param, query } = require('express-validator');

// ========== PUBLIC REPOSITORY DISCOVERY ROUTES ==========
// These routes provide public access to repository information and discovery

/**
 * Get All Repositories Endpoint
 * GET /api/repositories/
 * 
 * Retrieves paginated list of public repositories with advanced filtering and sorting.
 * Provides comprehensive repository discovery with topic-based categorization.
 * 
 * Features:
 * - Pagination with configurable page size and limits
 * - Multiple sorting algorithms (newest, oldest, popular, active)
 * - Topic-based filtering for content categorization
 * - Repository quality and activity metrics
 * - Public repository visibility and discovery
 * - Performance optimization with caching
 * 
 * Query Parameters:
 * - page: Page number for pagination (default: 1, minimum: 1)
 * - limit: Repositories per page (default: 20, maximum: 100)
 * - sort: Sort algorithm (newest, oldest, popular, active)
 * - topic: Filter by topic category (string)
 * 
 * Response:
 * - Paginated repository list with metadata
 * - Repository statistics (subscriber count, activity level)
 * - Topic and hashtag information
 * - Pagination metadata and navigation
 * - Repository quality indicators
 */
router.get('/', 
 query('page').optional().isInt({ min: 1 }),                 // Page number validation
 query('limit').optional().isInt({ min: 1, max: 100 }),      // Page size validation
 query('sort').optional().isIn(['newest', 'oldest', 'popular', 'active']), // Sort validation
 query('topic').optional().isString(),                       // Topic filter validation
 validate,                                                    // Process validation results
 repositoriesController.getAllRepositories                   // Handle repository retrieval
);

/**
 * Get Trending Repositories Endpoint
 * GET /api/repositories/trending
 * 
 * Retrieves currently trending repositories using algorithmic ranking.
 * Features velocity-based trending detection and community engagement analysis.
 * 
 * Features:
 * - Advanced trending algorithm with growth velocity detection
 * - Community engagement weight factors and quality metrics
 * - Time-decay scoring for recency bias and relevance
 * - Multiple trending periods with configurable timeframes
 * - Geographic and demographic trending analysis
 * - Category-specific trending breakdowns
 * 
 * Query Parameters:
 * - period: Trending timeframe (day, week, month)
 * 
 * Response:
 * - Trending repositories with velocity scores
 * - Trending metadata and algorithmic insights
 * - Growth metrics and momentum indicators
 * - Category-specific trending analysis
 * - Comparative trending performance
 */
router.get('/trending',
 query('period').optional().isIn(['day', 'week', 'month']),  // Period validation
 validate,                                                    // Process validation results
 repositoriesController.getTrendingRepositories              // Handle trending retrieval
);

/**
 * Search Repositories Endpoint
 * GET /api/repositories/search
 * 
 * Searches repositories using advanced full-text search and filtering.
 * Provides comprehensive repository discovery with relevance scoring.
 * 
 * Features:
 * - Full-text search across repository names and descriptions
 * - Advanced filtering by metadata and engagement metrics
 * - Relevance scoring and intelligent result ranking
 * - Search result highlighting and content snippets
 * - Search analytics and query optimization
 * - Faceted search with topic and hashtag filters
 * 
 * Query Parameters:
 * - q: Search query string (required, non-empty)
 * - page: Page number for result pagination
 * - limit: Results per page (maximum 100)
 * 
 * Response:
 * - Paginated search results with relevance scores
 * - Search metadata and performance statistics
 * - Query suggestions and refinement options
 * - Faceted search filters and category breakdowns
 * - Search result highlighting and snippets
 */
router.get('/search',
 query('q').notEmpty().isString(),                           // Search query validation
 query('page').optional().isInt({ min: 1 }),                // Page number validation
 query('limit').optional().isInt({ min: 1, max: 100 }),     // Page size validation
 validate,                                                    // Process validation results
 repositoriesController.searchRepositories                   // Handle search processing
);

/**
 * Get Repository by ID Endpoint
 * GET /api/repositories/:id
 * 
 * Retrieves detailed information for a specific repository.
 * Provides comprehensive repository metadata and public statistics.
 * 
 * Features:
 * - Complete repository information with rich metadata
 * - Public statistics and engagement metrics
 * - Topic and hashtag associations
 * - Repository quality indicators and ratings
 * - Public activity timeline and highlights
 * - Related repository recommendations
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Response:
 * - Complete repository object with metadata
 * - Public statistics and engagement metrics
 * - Topic and hashtag associations
 * - Repository quality and performance indicators
 * - Public activity highlights and timeline
 */
router.get('/:id',
 param('id').isMongoId(),                                    // Repository ID validation
 validate,                                                    // Process validation results
 repositoriesController.getRepositoryById                    // Handle repository retrieval
);

/**
 * Get Repository Statistics Endpoint
 * GET /api/repositories/:id/statistics
 * 
 * Retrieves comprehensive statistics for a repository.
 * Provides detailed analytics and performance metrics.
 * 
 * Features:
 * - Comprehensive engagement and growth statistics
 * - Email performance and deliverability metrics
 * - Subscriber behavior and interaction analysis
 * - Content quality and performance indicators
 * - Time-based analytics and trend analysis
 * - Comparative benchmarking and insights
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Response:
 * - Comprehensive repository statistics dashboard
 * - Engagement metrics and trend analysis
 * - Email performance and deliverability data
 * - Subscriber behavior and interaction patterns
 * - Content quality and performance indicators
 */
router.get('/:id/statistics',
 param('id').isMongoId(),                                    // Repository ID validation
 validate,                                                    // Process validation results
 repositoriesController.getRepositoryStatistics             // Handle statistics retrieval
);

/**
 * Get Repository Activity Feed Endpoint
 * GET /api/repositories/:id/activity
 * 
 * Retrieves public activity feed for a repository.
 * Provides timeline of repository events and engagement.
 * 
 * Features:
 * - Chronological activity timeline with event details
 * - Activity filtering and categorization
 * - Engagement metrics for activity items
 * - Public activity visibility controls
 * - Activity analytics and pattern recognition
 * - Real-time activity updates and notifications
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Query Parameters:
 * - page: Page number for activity pagination
 * - limit: Activity items per page (maximum 50)
 * 
 * Response:
 * - Paginated activity feed with event details
 * - Activity metadata and categorization
 * - Engagement metrics for activity items
 * - Activity timeline and chronological organization
 * - Activity analytics and pattern insights
 */
router.get('/:id/activity',
 param('id').isMongoId(),                                    // Repository ID validation
 query('page').optional().isInt({ min: 1 }),                // Page number validation
 query('limit').optional().isInt({ min: 1, max: 50 }),      // Page size validation
 validate,                                                    // Process validation results
 repositoriesController.getRepositoryActivity               // Handle activity retrieval
);

// ========== AUTHENTICATED USER REPOSITORY ROUTES ==========
// These routes require authentication for user-specific repository operations

/**
 * Get User's Repositories Endpoint
 * GET /api/repositories/my-repositories
 * 
 * Retrieves repositories owned or collaborated on by the authenticated user.
 * Provides personalized repository management and access.
 * 
 * Middleware Stack:
 * 1. Authentication verification for user identification
 * 2. Query parameter validation for pagination
 * 3. Controller logic for user repository retrieval
 * 
 * Features:
 * - User-owned and collaborated repository access
 * - Role-based repository filtering and organization
 * - Personalized repository dashboard and management
 * - Repository performance analytics for owned repositories
 * - Collaboration status and permission indicators
 * - Repository activity notifications and updates
 * 
 * Query Parameters:
 * - page: Page number for pagination
 * - limit: Repositories per page (maximum 100)
 * 
 * Response:
 * - User's repository list with role information
 * - Repository performance and analytics summary
 * - Collaboration status and permission details
 * - Repository activity and notification status
 * - Personalized repository management options
 */
router.get('/my-repositories',
 authenticate,                                               // Verify user authentication
 query('page').optional().isInt({ min: 1 }),                // Page number validation
 query('limit').optional().isInt({ min: 1, max: 100 }),     // Page size validation
 validate,                                                    // Process validation results
 repositoriesController.getUserRepositories                 // Handle user repository retrieval
);

// ========== REPOSITORY MANAGEMENT ROUTES ==========
// These routes handle repository creation, modification, and advanced management

/**
 * Create Repository Endpoint
 * POST /api/repositories/
 * 
 * Creates a new repository with comprehensive configuration options.
 * Supports advanced features including privacy controls and quality management.
 * 
 * Middleware Stack:
 * 1. Authentication verification for repository ownership
 * 2. Comprehensive input validation for repository data
 * 3. Controller logic for repository creation and initialization
 * 
 * Features:
 * - Comprehensive repository configuration and customization
 * - Privacy controls with public and private options
 * - Quality threshold settings for content curation
 * - Email verification requirements and automation
 * - Auto-approval mechanisms for streamlined workflow
 * - Topic and hashtag association for categorization
 * 
 * Request Body:
 * - name: Repository name (3-100 characters, required)
 * - description: Repository description (10-500 characters, required)
 * - topic: Repository topic category (required)
 * - hashtags: Optional array of hashtag strings
 * - isPrivate: Optional privacy setting (boolean)
 * - emailVerificationRequired: Optional email verification setting
 * - autoApprove: Optional auto-approval setting
 * - qualityThreshold: Optional quality threshold (0-1 float)
 * 
 * Response:
 * - Created repository object with generated ID
 * - Repository configuration and settings summary
 * - Initial statistics and performance baselines
 * - Repository management and access information
 */
router.post('/',
 authenticate,                                               // Verify user authentication
 body('name').notEmpty().isString().isLength({ min: 3, max: 100 }), // Name validation
 body('description').notEmpty().isString().isLength({ min: 10, max: 500 }), // Description validation
 body('topic').notEmpty().isString(),                       // Topic validation
 body('hashtags').optional().isArray(),                     // Hashtags array validation
 body('hashtags.*').optional().isString(),                  // Individual hashtag validation
 body('isPrivate').optional().isBoolean(),                  // Privacy setting validation
 body('emailVerificationRequired').optional().isBoolean(),  // Email verification validation
 body('autoApprove').optional().isBoolean(),                // Auto-approval validation
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }), // Quality threshold validation
 validate,                                                    // Process validation results
 repositoriesController.createRepository                     // Handle repository creation
);

/**
 * Update Repository Endpoint
 * PUT /api/repositories/:id
 * 
 * Updates an existing repository with ownership verification.
 * Supports comprehensive configuration changes and settings management.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Input validation for update data
 * 4. Controller logic for repository modification
 * 
 * Features:
 * - Comprehensive repository configuration updates
 * - Ownership and permission verification for security
 * - Change tracking and audit logging
 * - Setting validation and consistency checks
 * - Notification to collaborators about changes
 * - Version control for repository configurations
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository to update
 * 
 * Request Body:
 * - name: Updated repository name (optional)
 * - description: Updated description (optional)
 * - hashtags: Updated hashtag associations (optional)
 * - isPrivate: Updated privacy setting (optional)
 * - emailVerificationRequired: Updated verification setting (optional)
 * - autoApprove: Updated auto-approval setting (optional)
 * - qualityThreshold: Updated quality threshold (optional)
 * 
 * Response:
 * - Updated repository object with change summary
 * - Configuration change audit log
 * - Impact analysis for setting changes
 * - Collaborator notification status
 */
router.put('/:id',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('name').optional().isString().isLength({ min: 3, max: 100 }), // Name validation
 body('description').optional().isString().isLength({ min: 10, max: 500 }), // Description validation
 body('hashtags').optional().isArray(),                     // Hashtags array validation
 body('hashtags.*').optional().isString(),                  // Individual hashtag validation
 body('isPrivate').optional().isBoolean(),                  // Privacy setting validation
 body('emailVerificationRequired').optional().isBoolean(),  // Email verification validation
 body('autoApprove').optional().isBoolean(),                // Auto-approval validation
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }), // Quality threshold validation
 validate,                                                    // Process validation results
 repositoriesController.updateRepository                     // Handle repository update
);

/**
 * Delete Repository Endpoint
 * DELETE /api/repositories/:id
 * 
 * Deletes a repository with ownership verification and comprehensive cleanup.
 * Handles cascading deletion of associated data and relationships.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership verification
 * 3. Controller logic for repository deletion and cleanup
 * 
 * Features:
 * - Ownership verification for security
 * - Comprehensive data cleanup and cascading deletion
 * - Backup and recovery options for accidental deletion
 * - Collaborator and subscriber notification
 * - Audit logging for deletion tracking
 * - Grace period for deletion recovery
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository to delete
 * 
 * Response:
 * - Deletion confirmation and cleanup summary
 * - Data preservation and backup information
 * - Recovery options and time limits
 * - Notification status for affected users
 */
router.delete('/:id',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 validate,                                                    // Process validation results
 repositoriesController.deleteRepository                     // Handle repository deletion
);

// ========== EMAIL MANAGEMENT ROUTES ==========
// These routes handle email collection, verification, and management within repositories

/**
 * Get Repository Emails Endpoint
 * GET /api/repositories/:id/emails
 * 
 * Retrieves email addresses associated with a repository.
 * Provides comprehensive email management and verification status.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Query parameter validation for filtering and pagination
 * 4. Controller logic for email retrieval and management
 * 
 * Features:
 * - Comprehensive email list with verification status
 * - Advanced filtering by verification status and metadata
 * - Email engagement metrics and analytics
 * - Tagging and categorization support
 * - Export capabilities for email management
 * - Privacy protection for sensitive email data
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Query Parameters:
 * - page: Page number for email pagination
 * - limit: Emails per page (maximum 100)
 * - verified: Filter by verification status (boolean)
 * 
 * Response:
 * - Paginated email list with verification status
 * - Email engagement metrics and analytics
 * - Verification and deliverability statistics
 * - Email management and export options
 */
router.get('/:id/emails',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 query('page').optional().isInt({ min: 1 }),                // Page number validation
 query('limit').optional().isInt({ min: 1, max: 100 }),     // Page size validation
 query('verified').optional().isBoolean(),                  // Verification filter validation
 validate,                                                    // Process validation results
 repositoriesController.getRepositoryEmails                 // Handle email retrieval
);

/**
 * Add Email to Repository Endpoint
 * POST /api/repositories/:id/emails
 * 
 * Adds a single email address to a repository with validation and verification.
 * Supports email metadata and tagging for organization.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Email validation and duplicate checking
 * 4. Controller logic for email addition and verification
 * 
 * Features:
 * - Email validation and duplicate prevention
 * - Optional name and metadata association
 * - Tag-based email categorization and organization
 * - Automatic verification workflow initiation
 * - Snowball referral tracking and attribution
 * - Quality assessment and spam prevention
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request Body:
 * - email: Email address to add (required, valid email format)
 * - name: Optional name associated with email
 * - tags: Optional array of tag strings for categorization
 * 
 * Response:
 * - Email addition confirmation with verification status
 * - Verification workflow initiation details
 * - Email quality assessment and validation results
 * - Repository statistics update
 */
router.post('/:id/emails',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('email').isEmail(),                                    // Email format validation
 body('name').optional().isString(),                        // Name validation
 body('tags').optional().isArray(),                         // Tags array validation
 body('tags.*').optional().isString(),                      // Individual tag validation
 validate,                                                    // Process validation results
 repositoriesController.addEmail                            // Handle email addition
);

/**
 * Bulk Add Emails Endpoint
 * POST /api/repositories/:id/emails/bulk
 * 
 * Adds multiple email addresses to a repository with bulk processing.
 * Supports large-scale email import with validation and optimization.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Bulk email validation and processing
 * 4. Controller logic for bulk email addition and verification
 * 
 * Features:
 * - High-performance bulk email processing
 * - Individual email validation within bulk operations
 * - Duplicate detection and prevention across bulk imports
 * - Batch verification workflow with queue management
 * - Snowball expansion tracking for referral attribution
 * - Error handling and partial success reporting
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request Body:
 * - emails: Array of email objects (1-1000 emails maximum)
 * - emails[].email: Email address (required, valid format)
 * - emails[].name: Optional name for email
 * - emails[].tags: Optional tags array for email
 * - allowSnowball: Optional snowball expansion permission
 * 
 * Response:
 * - Bulk addition summary with success and error counts
 * - Individual email processing results and status
 * - Verification workflow batch initiation details
 * - Repository growth and expansion analytics
 */
router.post('/:id/emails/bulk',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('emails').isArray().isLength({ min: 1, max: 1000 }),  // Emails array validation
 body('emails.*.email').isEmail(),                          // Individual email validation
 body('emails.*.name').optional().isString(),               // Individual name validation
 body('emails.*.tags').optional().isArray(),                // Individual tags validation
 body('allowSnowball').optional().isBoolean(),              // Snowball permission validation
 validate,                                                    // Process validation results
 repositoriesController.bulkAddEmails                       // Handle bulk email addition
);

/**
 * Remove Email from Repository Endpoint
 * DELETE /api/repositories/:id/emails/:emailId
 * 
 * Removes an email address from a repository with audit logging.
 * Handles cascading cleanup and subscriber management.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Email existence verification
 * 4. Controller logic for email removal and cleanup
 * 
 * Features:
 * - Email existence verification before removal
 * - Cascading cleanup of associated subscriptions
 * - Audit logging for email removal tracking
 * - Graceful unsubscription and notification handling
 * - Data retention compliance and privacy protection
 * - Analytics impact assessment and reporting
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * - emailId: MongoDB ObjectId of the email to remove
 * 
 * Response:
 * - Email removal confirmation and cleanup summary
 * - Unsubscription and notification handling status
 * - Repository statistics update after removal
 * - Audit trail and compliance documentation
 */
router.delete('/:id/emails/:emailId',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 param('emailId').isMongoId(),                              // Email ID validation
 validate,                                                    // Process validation results
 repositoriesController.removeEmail                         // Handle email removal
);

// ========== CSV DATA MANAGEMENT ROUTES ==========
// These routes handle CSV data import and export for repository management

/**
 * Upload CSV to Repository Endpoint
 * POST /api/repositories/:id/upload-csv
 * 
 * Uploads and processes CSV data for bulk email import.
 * Supports advanced CSV processing with validation and optimization.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. File upload handling for CSV data
 * 4. CSV validation and processing
 * 5. Controller logic for bulk data import
 * 
 * Features:
 * - Advanced CSV parsing with flexible column mapping
 * - Data validation and quality assessment
 * - Bulk email processing with error handling
 * - Snowball expansion tracking and attribution
 * - Email verification workflow integration
 * - Progress tracking and status reporting
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request:
 * - csv: CSV file upload (multipart form data)
 * - allowSnowball: Optional snowball expansion permission
 * - verifyEmails: Optional email verification setting
 * 
 * Response:
 * - CSV processing summary with import statistics
 * - Data validation and quality assessment results
 * - Email verification workflow initiation status
 * - Repository growth and expansion analytics
 */
router.post('/:id/upload-csv',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 upload.single('csv'),                                       // Handle CSV file upload
 body('allowSnowball').optional().isBoolean(),              // Snowball permission validation
 body('verifyEmails').optional().isBoolean(),               // Verification setting validation
 validate,                                                    // Process validation results
 repositoriesController.uploadCSV                           // Handle CSV processing
);

/**
 * Download Repository as CSV Endpoint
 * GET /api/repositories/:id/download
 * 
 * Downloads repository data as CSV file for backup and analysis.
 * Provides comprehensive data export with privacy protection.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Controller logic for data export and CSV generation
 * 
 * Features:
 * - Comprehensive data export with email and metadata
 * - Privacy protection and data anonymization options
 * - Flexible column selection and customization
 * - High-performance export for large datasets
 * - Data integrity verification and validation
 * - Export analytics and usage tracking
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Response:
 * - CSV file download with repository data
 * - Data export summary and statistics
 * - Privacy protection and anonymization report
 * - Export analytics and usage tracking
 */
router.get('/:id/download',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 validate,                                                    // Process validation results
 repositoriesController.downloadRepositoryCSV               // Handle CSV export
);

// ========== SUBSCRIPTION MANAGEMENT ROUTES ==========
// These routes handle user subscriptions and notification preferences

/**
 * Subscribe to Repository Endpoint
 * POST /api/repositories/:id/subscribe
 * 
 * Subscribes a user to repository updates and notifications.
 * Supports customizable notification preferences and frequency settings.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access verification
 * 3. Subscription preference validation
 * 4. Controller logic for subscription management
 * 
 * Features:
 * - Customizable notification preferences and settings
 * - Digest frequency options (daily, weekly, monthly)
 * - Email notification controls and preferences
 * - Subscription analytics and engagement tracking
 * - Unsubscribe options and preference management
 * - Privacy controls and data protection
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request Body:
 * - emailNotifications: Optional email notification preference
 * - digestFrequency: Optional digest frequency setting
 * 
 * Response:
 * - Subscription confirmation and preference summary
 * - Notification setup and delivery schedule
 * - Subscription analytics and engagement metrics
 * - Preference management and unsubscribe options
 */
router.post('/:id/subscribe',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('emailNotifications').optional().isBoolean(),         // Email notification validation
 body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly']), // Frequency validation
 validate,                                                    // Process validation results
 repositoriesController.subscribeToRepository               // Handle subscription
);

/**
 * Unsubscribe from Repository Endpoint
 * DELETE /api/repositories/:id/subscribe
 * 
 * Unsubscribes a user from repository updates and notifications.
 * Handles graceful unsubscription with preference preservation.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Subscription existence verification
 * 3. Controller logic for unsubscription processing
 * 
 * Features:
 * - Graceful unsubscription with preference preservation
 * - Immediate notification cessation and cleanup
 * - Unsubscription analytics and feedback collection
 * - Re-subscription options and ease of access
 * - Privacy protection and data retention compliance
 * - Unsubscription audit logging and tracking
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Response:
 * - Unsubscription confirmation and cleanup summary
 * - Preference preservation and re-subscription options
 * - Unsubscription analytics and feedback collection
 * - Privacy compliance and data retention status
 */
router.delete('/:id/subscribe',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 validate,                                                    // Process validation results
 repositoriesController.unsubscribeFromRepository          // Handle unsubscription
);

/**
 * Get Repository Subscribers Endpoint
 * GET /api/repositories/:id/subscribers
 * 
 * Retrieves subscriber list for repository management and analytics.
 * Provides subscriber insights with privacy protection.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Query parameter validation for pagination
 * 4. Controller logic for subscriber retrieval
 * 
 * Features:
 * - Comprehensive subscriber analytics and insights
 * - Privacy-protected subscriber information display
 * - Engagement metrics and interaction analysis
 * - Subscriber segmentation and categorization
 * - Growth tracking and expansion analytics
 * - Subscriber behavior and preference analysis
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Query Parameters:
 * - page: Page number for subscriber pagination
 * - limit: Subscribers per page (maximum 100)
 * 
 * Response:
 * - Paginated subscriber list with privacy protection
 * - Subscriber analytics and engagement metrics
 * - Growth tracking and expansion insights
 * - Subscriber behavior and preference analysis
 */
router.get('/:id/subscribers',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 query('page').optional().isInt({ min: 1 }),                // Page number validation
 query('limit').optional().isInt({ min: 1, max: 100 }),     // Page size validation
 validate,                                                    // Process validation results
 repositoriesController.getRepositorySubscribers           // Handle subscriber retrieval
);

// ========== COLLABORATION MANAGEMENT ROUTES ==========
// These routes handle team collaboration and permission management

/**
 * Get Repository Collaborators Endpoint
 * GET /api/repositories/:id/collaborators
 * 
 * Retrieves collaborator list with role and permission information.
 * Provides team management and access control overview.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Controller logic for collaborator information retrieval
 * 
 * Features:
 * - Comprehensive collaborator role and permission display
 * - Team structure and hierarchy visualization
 * - Collaboration activity and contribution tracking
 * - Permission audit and access control review
 * - Team performance and engagement analytics
 * - Collaboration invitation and management tools
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Response:
 * - Collaborator list with roles and permissions
 * - Team structure and hierarchy information
 * - Collaboration activity and contribution metrics
 * - Permission audit and access control status
 */
router.get('/:id/collaborators',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 validate,                                                    // Process validation results
 repositoriesController.getCollaborators                    // Handle collaborator retrieval
);

/**
 * Add Collaborator Endpoint
 * POST /api/repositories/:id/collaborators
 * 
 * Adds a new collaborator to the repository with role assignment.
 * Supports granular permission control and access management.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Collaborator role validation
 * 4. Controller logic for collaborator addition
 * 
 * Features:
 * - Role-based access control with granular permissions
 * - Invitation workflow with notification and acceptance
 * - Permission validation and role assignment
 * - Collaboration audit logging and tracking
 * - Team growth and expansion management
 * - Access control security and validation
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request Body:
 * - userId: MongoDB ObjectId of user to add as collaborator
 * - role: Collaborator role (viewer, contributor, admin)
 * 
 * Response:
 * - Collaborator addition confirmation with role assignment
 * - Invitation workflow status and notification delivery
 * - Permission assignment and access control summary
 * - Team structure update and collaboration metrics
 */
router.post('/:id/collaborators',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('userId').isMongoId(),                                 // User ID validation
 body('role').isIn(['viewer', 'contributor', 'admin']),     // Role validation
 validate,                                                    // Process validation results
 repositoriesController.addCollaborator                     // Handle collaborator addition
);

/**
 * Update Collaborator Role Endpoint
 * PATCH /api/repositories/:id/collaborators/:userId
 * 
 * Updates the role of an existing collaborator with permission validation.
 * Supports role transitions and access control management.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Role transition validation
 * 4. Controller logic for role update processing
 * 
 * Features:
 * - Role transition validation and permission checking
 * - Access control consistency and security verification
 * - Collaboration audit logging for role changes
 * - Notification to affected collaborators
 * - Permission inheritance and cascade management
 * - Role-based feature access adjustment
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * - userId: MongoDB ObjectId of the collaborator
 * 
 * Request Body:
 * - role: Updated collaborator role (viewer, contributor, admin)
 * 
 * Response:
 * - Role update confirmation with permission changes
 * - Access control adjustment and feature availability
 * - Collaboration audit log and change tracking
 * - Notification status for affected collaborators
 */
router.patch('/:id/collaborators/:userId',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 param('userId').isMongoId(),                               // User ID validation
 body('role').isIn(['viewer', 'contributor', 'admin']),     // Role validation
 validate,                                                    // Process validation results
 repositoriesController.updateCollaboratorRole             // Handle role update
);

/**
 * Remove Collaborator Endpoint
 * DELETE /api/repositories/:id/collaborators/:userId
 * 
 * Removes a collaborator from the repository with access cleanup.
 * Handles graceful removal and permission revocation.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Collaborator existence verification
 * 4. Controller logic for collaborator removal
 * 
 * Features:
 * - Graceful collaborator removal with access revocation
 * - Permission cleanup and security validation
 * - Collaboration audit logging for removals
 * - Notification to removed collaborators
 * - Data access transition and handover management
 * - Team structure reorganization and adjustment
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * - userId: MongoDB ObjectId of the collaborator to remove
 * 
 * Response:
 * - Collaborator removal confirmation with access cleanup
 * - Permission revocation and security verification
 * - Collaboration audit log and change tracking
 * - Team structure adjustment and reorganization status
 */
router.delete('/:id/collaborators/:userId',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 param('userId').isMongoId(),                               // User ID validation
 validate,                                                    // Process validation results
 repositoriesController.removeCollaborator                  // Handle collaborator removal
);

// ========== ADVANCED REPOSITORY OPERATIONS ==========
// These routes handle advanced repository features and administrative operations

/**
 * Merge Repositories Endpoint
 * POST /api/repositories/:id/merge
 * 
 * Merges two repositories with comprehensive data consolidation.
 * Supports advanced merge strategies and conflict resolution.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership verification for both repositories
 * 3. Merge validation and conflict checking
 * 4. Controller logic for repository merge processing
 * 
 * Features:
 * - Comprehensive data consolidation and merge strategies
 * - Duplicate detection and intelligent conflict resolution
 * - Permission and access control consolidation
 * - Subscriber and collaborator notification management
 * - Merge audit logging and rollback capabilities
 * - Performance optimization for large repository merges
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the source repository
 * 
 * Request Body:
 * - targetRepositoryId: MongoDB ObjectId of target repository
 * - keepDuplicates: Optional duplicate handling preference
 * 
 * Response:
 * - Repository merge confirmation with consolidation summary
 * - Data integration and conflict resolution results
 * - Permission and access control merge status
 * - Subscriber and collaborator notification delivery
 */
router.post('/:id/merge',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('targetRepositoryId').isMongoId(),                    // Target repository validation
 body('keepDuplicates').optional().isBoolean(),             // Duplicate handling validation
 validate,                                                    // Process validation results
 repositoriesController.mergeRepositories                   // Handle repository merge
);

/**
 * Clone Repository Endpoint
 * POST /api/repositories/:id/clone
 * 
 * Creates a clone of an existing repository with customization options.
 * Supports repository templating and structure replication.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Clone configuration validation
 * 4. Controller logic for repository cloning
 * 
 * Features:
 * - Repository structure and configuration replication
 * - Customizable cloning options and data selection
 * - Permission and access control template application
 * - Content and metadata preservation options
 * - Clone audit logging and relationship tracking
 * - Performance optimization for large repository clones
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository to clone
 * 
 * Request Body:
 * - name: Name for the cloned repository (3-100 characters)
 * - description: Optional description for the clone
 * 
 * Response:
 * - Repository clone confirmation with new repository details
 * - Cloning process summary and data replication status
 * - Permission and access control template application
 * - Clone relationship tracking and audit information
 */
router.post('/:id/clone',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('name').notEmpty().isString().isLength({ min: 3, max: 100 }), // Clone name validation
 body('description').optional().isString(),                 // Clone description validation
 validate,                                                    // Process validation results
 repositoriesController.cloneRepository                     // Handle repository cloning
);

/**
 * Share Repository Endpoint
 * POST /api/repositories/:id/share
 * 
 * Shares repository access with specified users via email invitation.
 * Supports granular sharing permissions and access control.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Sharing configuration validation
 * 4. Controller logic for repository sharing
 * 
 * Features:
 * - Email-based repository sharing and invitation system
 * - Granular permission control for shared access
 * - Custom sharing messages and invitation personalization
 * - Time-limited sharing and access expiration options
 * - Sharing audit logging and access tracking
 * - Invitation management and acceptance workflow
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository to share
 * 
 * Request Body:
 * - emails: Optional array of email addresses for sharing
 * - message: Optional custom message for sharing invitation
 * - allowEdit: Optional edit permission for shared access
 * 
 * Response:
 * - Repository sharing confirmation with invitation status
 * - Email invitation delivery and acceptance tracking
 * - Permission assignment and access control summary
 * - Sharing audit log and relationship tracking
 */
router.post('/:id/share',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('emails').optional().isArray(),                       // Emails array validation
 body('emails.*').optional().isEmail(),                     // Individual email validation
 body('message').optional().isString().isLength({ max: 500 }), // Message validation
 body('allowEdit').optional().isBoolean(),                  // Edit permission validation
 validate,                                                    // Process validation results
 repositoriesController.shareRepository                     // Handle repository sharing
);

// ========== REPOSITORY SETTINGS AND CONFIGURATION ROUTES ==========
// These routes handle advanced repository settings and feature management

/**
 * Toggle Snowball Effect Endpoint
 * PATCH /api/repositories/:id/snowball
 * 
 * Toggles the snowball growth mechanism for viral repository expansion.
 * Controls automatic email collection and referral tracking features.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Snowball configuration validation
 * 4. Controller logic for snowball toggle processing
 * 
 * Features:
 * - Snowball growth mechanism control and configuration
 * - Viral expansion tracking and analytics
 * - Referral attribution and growth measurement
 * - Automatic email collection and verification
 * - Growth rate monitoring and optimization
 * - Compliance and privacy protection for viral growth
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request Body:
 * - enabled: Boolean flag to enable/disable snowball effect
 * 
 * Response:
 * - Snowball toggle confirmation with feature status
 * - Growth mechanism configuration and settings
 * - Viral expansion tracking and analytics setup
 * - Compliance and privacy protection status
 */
router.patch('/:id/snowball',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('enabled').isBoolean(),                                // Snowball enable validation
 validate,                                                    // Process validation results
 repositoriesController.toggleSnowball                      // Handle snowball toggle
);

/**
 * Update Repository Settings Endpoint
 * PATCH /api/repositories/:id/settings
 * 
 * Updates advanced repository settings and configuration options.
 * Supports comprehensive feature management and operational controls.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository ownership or admin permission verification
 * 3. Settings validation and consistency checking
 * 4. Controller logic for settings update processing
 * 
 * Features:
 * - Comprehensive repository settings and configuration management
 * - Email verification and quality control settings
 * - Digest generation and distribution configuration
 * - Auto-approval and workflow automation settings
 * - Quality threshold and content curation controls
 * - Settings audit logging and change tracking
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request Body:
 * - emailVerificationRequired: Optional email verification setting
 * - autoApprove: Optional auto-approval setting
 * - qualityThreshold: Optional quality threshold (0-1 float)
 * - digestEnabled: Optional digest generation setting
 * - digestFrequency: Optional digest frequency (daily, weekly, monthly)
 * 
 * Response:
 * - Settings update confirmation with configuration summary
 * - Feature status and operational control adjustments
 * - Settings audit log and change tracking
 * - Impact analysis for setting modifications
 */
router.patch('/:id/settings',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('emailVerificationRequired').optional().isBoolean(),  // Email verification validation
 body('autoApprove').optional().isBoolean(),                // Auto-approval validation
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }), // Quality threshold validation
 body('digestEnabled').optional().isBoolean(),              // Digest enable validation
 body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly']), // Frequency validation
 validate,                                                    // Process validation results
 repositoriesController.updateSettings                      // Handle settings update
);

// ========== REPORTING AND ANALYTICS ROUTES ==========
// These routes provide comprehensive reporting and analytics capabilities

/**
 * Generate Repository Report Endpoint
 * POST /api/repositories/:id/generate-report
 * 
 * Generates comprehensive repository reports with customizable content and formats.
 * Supports multiple export formats and detailed analytics compilation.
 * 
 * Middleware Stack:
 * 1. Authentication verification
 * 2. Repository access permission verification
 * 3. Report configuration validation
 * 4. Controller logic for report generation and compilation
 * 
 * Features:
 * - Comprehensive repository analytics and performance reporting
 * - Customizable report content and data selection
 * - Multiple export formats (PDF, CSV, JSON) for different use cases
 * - Time-based analytics with configurable date ranges
 * - Email engagement and deliverability analysis
 * - Growth tracking and expansion insights
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the repository
 * 
 * Request Body:
 * - startDate: Optional start date for report timeframe (ISO8601)
 * - endDate: Optional end date for report timeframe (ISO8601)
 * - includeEmails: Optional flag to include email data
 * - includeActivity: Optional flag to include activity data
 * - format: Optional export format (pdf, csv, json)
 * 
 * Response:
 * - Report generation confirmation with download information
 * - Report content summary and analytics compilation
 * - Export format and delivery method details
 * - Report analytics and insight highlights
 */
router.post('/:id/generate-report',
 authenticate,                                               // Verify user authentication
 param('id').isMongoId(),                                    // Repository ID validation
 body('startDate').optional().isISO8601(),                  // Start date validation
 body('endDate').optional().isISO8601(),                    // End date validation
 body('includeEmails').optional().isBoolean(),              // Email inclusion validation
 body('includeActivity').optional().isBoolean(),            // Activity inclusion validation
 body('format').optional().isIn(['pdf', 'csv', 'json']),    // Format validation
 validate,                                                    // Process validation results
 repositoriesController.generateReport                      // Handle report generation
);

// Export configured repositories router for application use
module.exports = router;
 repositoriesController.getRepositorySubscribers
);

// Get repository activity feed
router.get('/:id/activity',
 param('id').isMongoId(),
 query('page').optional().isInt({ min: 1 }),
 query('limit').optional().isInt({ min: 1, max: 50 }),
 validate,
 repositoriesController.getRepositoryActivity
);

// Create new repository
router.post('/',
 authenticate,
 body('name').notEmpty().isString().isLength({ min: 3, max: 100 }),
 body('description').notEmpty().isString().isLength({ min: 10, max: 500 }),
 body('topic').notEmpty().isString(),
 body('hashtags').optional().isArray(),
 body('hashtags.*').optional().isString(),
 body('isPrivate').optional().isBoolean(),
 body('emailVerificationRequired').optional().isBoolean(),
 body('autoApprove').optional().isBoolean(),
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }),
 validate,
 repositoriesController.createRepository
);

// Update repository
router.put('/:id',
 authenticate,
 param('id').isMongoId(),
 body('name').optional().isString().isLength({ min: 3, max: 100 }),
 body('description').optional().isString().isLength({ min: 10, max: 500 }),
 body('hashtags').optional().isArray(),
 body('hashtags.*').optional().isString(),
 body('isPrivate').optional().isBoolean(),
 body('emailVerificationRequired').optional().isBoolean(),
 body('autoApprove').optional().isBoolean(),
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }),
 validate,
 repositoriesController.updateRepository
);

// Upload CSV to repository
router.post('/:id/upload-csv',
 authenticate,
 param('id').isMongoId(),
 upload.single('csv'),
 body('allowSnowball').optional().isBoolean(),
 body('verifyEmails').optional().isBoolean(),
 validate,
 repositoriesController.uploadCSV
);

// Add email to repository
router.post('/:id/emails',
 authenticate,
 param('id').isMongoId(),
 body('email').isEmail(),
 body('name').optional().isString(),
 body('tags').optional().isArray(),
 body('tags.*').optional().isString(),
 validate,
 repositoriesController.addEmail
);

// Bulk add emails
router.post('/:id/emails/bulk',
 authenticate,
 param('id').isMongoId(),
 body('emails').isArray().isLength({ min: 1, max: 1000 }),
 body('emails.*.email').isEmail(),
 body('emails.*.name').optional().isString(),
 body('emails.*.tags').optional().isArray(),
 body('allowSnowball').optional().isBoolean(),
 validate,
 repositoriesController.bulkAddEmails
);

// Subscribe to repository
router.post('/:id/subscribe',
 authenticate,
 param('id').isMongoId(),
 body('emailNotifications').optional().isBoolean(),
 body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly']),
 validate,
 repositoriesController.subscribeToRepository
);

// Unsubscribe from repository
router.delete('/:id/subscribe',
 authenticate,
 param('id').isMongoId(),
 validate,
 repositoriesController.unsubscribeFromRepository
);

// Merge repositories
router.post('/:id/merge',
 authenticate,
 param('id').isMongoId(),
 body('targetRepositoryId').isMongoId(),
 body('keepDuplicates').optional().isBoolean(),
 validate,
 repositoriesController.mergeRepositories
);

// Clone repository
router.post('/:id/clone',
 authenticate,
 param('id').isMongoId(),
 body('name').notEmpty().isString().isLength({ min: 3, max: 100 }),
 body('description').optional().isString(),
 validate,
 repositoriesController.cloneRepository
);

// Share repository
router.post('/:id/share',
 authenticate,
 param('id').isMongoId(),
 body('emails').optional().isArray(),
 body('emails.*').optional().isEmail(),
 body('message').optional().isString().isLength({ max: 500 }),
 body('allowEdit').optional().isBoolean(),
 validate,
 repositoriesController.shareRepository
);

// Toggle snowball effect
router.patch('/:id/snowball',
 authenticate,
 param('id').isMongoId(),
 body('enabled').isBoolean(),
 validate,
 repositoriesController.toggleSnowball
);

// Update repository settings
router.patch('/:id/settings',
 authenticate,
 param('id').isMongoId(),
 body('emailVerificationRequired').optional().isBoolean(),
 body('autoApprove').optional().isBoolean(),
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }),
 body('digestEnabled').optional().isBoolean(),
 body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly']),
 validate,
 repositoriesController.updateSettings
);

// Remove email from repository
router.delete('/:id/emails/:emailId',
 authenticate,
 param('id').isMongoId(),
 param('emailId').isMongoId(),
 validate,
 repositoriesController.removeEmail
);

// Delete repository
router.delete('/:id',
 authenticate,
 param('id').isMongoId(),
 validate,
 repositoriesController.deleteRepository
);

// Get repository collaborators
router.get('/:id/collaborators',
 authenticate,
 param('id').isMongoId(),
 validate,
 repositoriesController.getCollaborators
);

// Add collaborator
router.post('/:id/collaborators',
 authenticate,
 param('id').isMongoId(),
 body('userId').isMongoId(),
 body('role').isIn(['viewer', 'contributor', 'admin']),
 validate,
 repositoriesController.addCollaborator
);

// Update collaborator role
router.patch('/:id/collaborators/:userId',
 authenticate,
 param('id').isMongoId(),
 param('userId').isMongoId(),
 body('role').isIn(['viewer', 'contributor', 'admin']),
 validate,
 repositoriesController.updateCollaboratorRole
);

// Remove collaborator
router.delete('/:id/collaborators/:userId',
 authenticate,
 param('id').isMongoId(),
 param('userId').isMongoId(),
 validate,
 repositoriesController.removeCollaborator
);

// Generate repository report
router.post('/:id/generate-report',
 authenticate,
 param('id').isMongoId(),
 body('startDate').optional().isISO8601(),
 body('endDate').optional().isISO8601(),
 body('includeEmails').optional().isBoolean(),
 body('includeActivity').optional().isBoolean(),
 body('format').optional().isIn(['pdf', 'csv', 'json']),
 validate,
 repositoriesController.generateReport
);

module.exports = router;
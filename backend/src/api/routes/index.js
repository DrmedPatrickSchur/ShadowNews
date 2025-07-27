/**
 * @fileoverview CSV Processing Routes for ShadowNews Platform
 * 
 * Comprehensive CSV data processing and management routing system for the ShadowNews platform.
 * This module handles all CSV-related operations including file upload, validation, processing,
 * data export, and bulk email management. Serves as the central hub for structured data operations
 * within repositories, enabling efficient bulk email collection and management workflows.
 * 
 * Key Features:
 * - High-performance CSV file upload and processing
 * - Advanced data validation and quality assessment
 * - Snowball effect CSV processing for viral growth
 * - Multi-file CSV merging and consolidation
 * - Filtered data export with customization options
 * - Real-time processing status and progress tracking
 * - Comprehensive error handling and recovery
 * - Processing history and audit logging
 * - Performance analytics and optimization
 * - Bulk operation management and control
 * 
 * CSV Processing Features:
 * - Large file processing with streaming and chunking
 * - Real-time validation and error reporting
 * - Duplicate detection and deduplication algorithms
 * - Data quality assessment and scoring
 * - Email validation and deliverability checking
 * - Character encoding detection and conversion
 * - Progress tracking and status updates
 * 
 * Data Management Features:
 * - Repository-based data organization and storage
 * - Email segmentation and tagging support
 * - Snowball referral tracking and attribution
 * - Data lineage and provenance tracking
 * - Quality metrics and performance indicators
 * - Backup and recovery mechanisms
 * 
 * Export and Analytics:
 * - Flexible data export with filtering options
 * - Custom column selection and formatting
 * - Analytics and insights generation
 * - Performance metrics and optimization recommendations
 * - Data usage tracking and compliance reporting
 * 
 * Security and Compliance:
 * - File type validation and security scanning
 * - Rate limiting for abuse prevention
 * - Authentication and authorization controls
 * - Data privacy protection and anonymization
 * - Audit logging and compliance tracking
 * - Secure file storage and cleanup
 * 
 * Performance Optimization:
 * - Streaming processing for large files
 * - Background job processing and queuing
 * - Memory-efficient data handling
 * - Parallel processing and optimization
 * - Caching and performance enhancement
 * - Resource monitoring and management
 * 
 * Dependencies:
 * - express: Web framework for route definition and handling
 * - multer: File upload middleware for CSV processing
 * - csvController: Business logic for CSV operations
 * - authMiddleware: Authentication and authorization middleware
 * - validationMiddleware: Input validation and data quality checking
 * - rateLimitMiddleware: Rate limiting for abuse prevention
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for CSV processing routing
const express = require('express');                          // Express web framework
const router = express.Router();                             // Express router instance
const multer = require('multer');                            // File upload middleware

// Middleware and controller imports
const { authenticateUser } = require('../middlewares/auth.middleware');         // Authentication middleware
const { validateCSV, validateRepositoryId } = require('../middlewares/validation.middleware'); // Validation middleware
const { rateLimitCSV } = require('../middlewares/rateLimit.middleware');        // Rate limiting
const csvController = require('../controllers/csv.controller');                 // CSV business logic

// ========== MULTER CONFIGURATION FOR CSV UPLOADS ==========
// Advanced file upload configuration with security and performance optimization

/**
 * Multer Upload Configuration
 * 
 * Comprehensive file upload configuration optimized for CSV processing.
 * Includes security validation, size limits, and performance optimization.
 * 
 * Configuration Features:
 * - Memory storage for efficient processing and security
 * - File size limits to prevent abuse and performance issues
 * - MIME type validation for security and data integrity
 * - Single file upload restriction for focused processing
 * - Error handling for invalid file types and sizes
 * 
 * Security Features:
 * - File type validation (CSV and Excel formats only)
 * - Size limit enforcement (10MB maximum)
 * - Memory storage for secure processing without disk persistence
 * - File content validation before processing
 * 
 * Performance Features:
 * - Memory storage for fast access and processing
 * - Streaming processing capability for large files
 * - Efficient memory management and cleanup
 * - Optimized for high-throughput CSV operations
 */
const upload = multer({
 storage: multer.memoryStorage(),                            // Memory storage for security and performance
 limits: {
   fileSize: 10 * 1024 * 1024,                               // 10MB maximum file size
   files: 1                                                   // Single file upload only
 },
 fileFilter: (req, file, cb) => {                            // File type validation
   if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
     cb(null, true);                                          // Accept valid CSV files
   } else {
     cb(new Error('Only CSV files are allowed'), false);     // Reject invalid file types
   }
 }
});

// ========== CSV UPLOAD AND PROCESSING ROUTES ==========
// These routes handle CSV file upload, validation, and bulk processing

/**
 * Upload CSV to Repository Endpoint
 * POST /api/csv/upload/:repositoryId
 * 
 * Uploads and processes CSV file for bulk email import into a repository.
 * Provides comprehensive data validation, processing, and quality assessment.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. CSV upload rate limiting for abuse prevention
 * 3. Repository ID validation and access control
 * 4. File upload handling with security validation
 * 5. CSV content validation and quality assessment
 * 6. Controller logic for data processing and import
 * 
 * Features:
 * - High-performance CSV file upload and processing
 * - Real-time data validation and quality assessment
 * - Duplicate detection and intelligent deduplication
 * - Email validation and deliverability checking
 * - Progress tracking and status updates
 * - Error handling and recovery mechanisms
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of target repository
 * 
 * Request:
 * - csv: CSV file upload (multipart form data, maximum 10MB)
 * 
 * Response:
 * - CSV upload confirmation with processing status
 * - Data validation and quality assessment results
 * - Processing progress tracking and timeline
 * - Error reporting and resolution guidance
 * - Import statistics and performance metrics
 */
router.post(
 '/upload/:repositoryId',
 authenticateUser,                                          // Verify user authentication
 rateLimitCSV,                                              // Apply CSV-specific rate limiting
 validateRepositoryId,                                      // Validate repository access
 upload.single('csv'),                                      // Handle CSV file upload
 validateCSV,                                               // Validate CSV content and structure
 csvController.uploadCSV                                    // Process CSV upload and import
);

/**
 * Preview CSV Before Upload Endpoint
 * POST /api/csv/preview
 * 
 * Previews CSV file content and structure before full processing.
 * Provides data preview, validation results, and processing estimates.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. File upload handling with validation
 * 3. Controller logic for CSV preview and analysis
 * 
 * Features:
 * - CSV content preview with sample data display
 * - Data structure analysis and column mapping
 * - Validation results and quality assessment
 * - Processing time and resource estimates
 * - Error detection and resolution recommendations
 * - Data formatting and standardization preview
 * 
 * Request:
 * - csv: CSV file upload for preview (multipart form data)
 * 
 * Response:
 * - CSV preview with sample data and structure analysis
 * - Validation results and quality assessment summary
 * - Processing estimates and resource requirements
 * - Error detection and resolution recommendations
 * - Data standardization and formatting preview
 */
router.post(
 '/preview',
 authenticateUser,                                          // Verify user authentication
 upload.single('csv'),                                      // Handle CSV file upload
 csvController.previewCSV                                   // Generate CSV preview and analysis
);

/**
 * Validate CSV Structure Endpoint
 * POST /api/csv/validate
 * 
 * Validates CSV file structure, format, and data quality.
 * Provides comprehensive validation reporting without data import.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. File upload handling with basic validation
 * 3. Controller logic for comprehensive CSV validation
 * 
 * Features:
 * - Comprehensive CSV structure and format validation
 * - Data quality assessment and scoring
 * - Column mapping and data type analysis
 * - Error detection and detailed reporting
 * - Data standardization recommendations
 * - Performance optimization suggestions
 * 
 * Request:
 * - csv: CSV file upload for validation (multipart form data)
 * 
 * Response:
 * - Comprehensive validation report with quality scores
 * - Error detection and detailed issue descriptions
 * - Column mapping and data type analysis
 * - Data standardization and optimization recommendations
 * - Processing readiness assessment and guidance
 */
router.post(
 '/validate',
 authenticateUser,                                          // Verify user authentication
 upload.single('csv'),                                      // Handle CSV file upload
 csvController.validateCSVStructure                         // Perform comprehensive validation
);

// ========== REPOSITORY DATA EXPORT ROUTES ==========
// These routes handle data export and download functionality

/**
 * Download Repository as CSV Endpoint
 * GET /api/csv/download/:repositoryId
 * 
 * Downloads complete repository data as formatted CSV file.
 * Provides comprehensive data export with customization options.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. Repository ID validation and access control
 * 3. Controller logic for data export and CSV generation
 * 
 * Features:
 * - Complete repository data export with all metadata
 * - Customizable column selection and formatting
 * - Data privacy protection and anonymization options
 * - High-performance export for large datasets
 * - Compression and optimization for download efficiency
 * - Export audit logging and tracking
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of repository to download
 * 
 * Response:
 * - CSV file download with complete repository data
 * - Export metadata and generation information
 * - Data integrity verification and validation
 * - Download analytics and usage tracking
 */
router.get(
 '/download/:repositoryId',
 authenticateUser,                                          // Verify user authentication
 validateRepositoryId,                                      // Validate repository access
 csvController.downloadRepositoryCSV                        // Generate and download CSV
);

/**
 * Export Filtered Repository Data Endpoint
 * POST /api/csv/export/:repositoryId
 * 
 * Exports filtered and customized repository data as CSV.
 * Supports advanced filtering, column selection, and data customization.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. Repository ID validation and access control
 * 3. Controller logic for filtered export and customization
 * 
 * Features:
 * - Advanced data filtering and query capabilities
 * - Custom column selection and ordering
 * - Data transformation and formatting options
 * - Export scheduling and background processing
 * - Performance optimization for complex queries
 * - Export analytics and usage insights
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of repository to export
 * 
 * Request Body:
 * - filters: Data filtering criteria and conditions
 * - columns: Column selection and ordering preferences
 * - format: Export formatting and transformation options
 * 
 * Response:
 * - Filtered CSV export with customized data
 * - Export processing status and progress tracking
 * - Data filtering and transformation summary
 * - Performance metrics and optimization insights
 */
router.post(
 '/export/:repositoryId',
 authenticateUser,                                          // Verify user authentication
 validateRepositoryId,                                      // Validate repository access
 csvController.exportFilteredCSV                           // Generate filtered export
);

// ========== SNOWBALL PROCESSING ROUTES ==========
// These routes handle viral growth and referral CSV processing

/**
 * Process Snowball CSV Endpoint
 * POST /api/csv/snowball/:repositoryId
 * 
 * Processes CSV files containing snowball referrals and viral growth data.
 * Handles referral attribution, growth tracking, and viral expansion analytics.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. Repository ID validation and access control
 * 3. File upload handling with snowball-specific validation
 * 4. CSV content validation for referral data
 * 5. Controller logic for snowball processing and attribution
 * 
 * Features:
 * - Snowball referral processing and attribution tracking
 * - Viral growth analytics and expansion measurement
 * - Referral chain analysis and relationship mapping
 * - Growth velocity calculation and optimization
 * - Quality assessment for referral sources
 * - Performance tracking for viral campaigns
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of target repository
 * 
 * Request:
 * - csv: CSV file with snowball referral data (multipart form data)
 * 
 * Response:
 * - Snowball processing confirmation with attribution results
 * - Viral growth analytics and expansion metrics
 * - Referral chain analysis and relationship mapping
 * - Growth optimization recommendations and insights
 * - Performance tracking and campaign effectiveness
 */
router.post(
 '/snowball/:repositoryId',
 authenticateUser,                                          // Verify user authentication
 validateRepositoryId,                                      // Validate repository access
 upload.single('csv'),                                      // Handle CSV file upload
 validateCSV,                                               // Validate CSV content
 csvController.processSnowballCSV                          // Process snowball data
);

// ========== CSV MANAGEMENT AND ANALYTICS ROUTES ==========
// These routes provide CSV processing history, analytics, and management

/**
 * Get CSV Processing History Endpoint
 * GET /api/csv/history/:repositoryId
 * 
 * Retrieves comprehensive CSV processing history for a repository.
 * Provides processing analytics, performance metrics, and audit logging.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. Repository ID validation and access control
 * 3. Controller logic for history retrieval and analytics compilation
 * 
 * Features:
 * - Complete CSV processing history with detailed metadata
 * - Processing performance analytics and optimization insights
 * - Error tracking and resolution documentation
 * - Data quality trends and improvement tracking
 * - Usage patterns and behavior analysis
 * - Audit logging and compliance reporting
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of repository
 * 
 * Response:
 * - Comprehensive processing history with metadata
 * - Performance analytics and optimization recommendations
 * - Error tracking and resolution documentation
 * - Data quality trends and improvement insights
 * - Usage analytics and behavior patterns
 */
router.get(
 '/history/:repositoryId',
 authenticateUser,                                          // Verify user authentication
 validateRepositoryId,                                      // Validate repository access
 csvController.getCSVHistory                                // Retrieve processing history
);

/**
 * Get CSV Processing Statistics Endpoint
 * GET /api/csv/stats/:repositoryId
 * 
 * Retrieves comprehensive CSV processing statistics and analytics.
 * Provides performance metrics, optimization insights, and usage analytics.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. Repository ID validation and access control
 * 3. Controller logic for statistics compilation and analysis
 * 
 * Features:
 * - Comprehensive processing statistics and performance metrics
 * - Data quality analytics and improvement tracking
 * - Usage patterns and behavior analysis
 * - Resource utilization and optimization insights
 * - Error rate analysis and resolution tracking
 * - Comparative analytics and benchmarking
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of repository
 * 
 * Response:
 * - Comprehensive processing statistics dashboard
 * - Performance metrics and optimization recommendations
 * - Data quality analytics and improvement tracking
 * - Usage patterns and resource utilization insights
 * - Error analysis and resolution effectiveness
 */
router.get(
 '/stats/:repositoryId',
 authenticateUser,                                          // Verify user authentication
 validateRepositoryId,                                      // Validate repository access
 csvController.getCSVStats                                  // Retrieve processing statistics
);

// ========== ADVANCED CSV OPERATIONS ==========
// These routes handle complex CSV operations and batch processing

/**
 * Merge Multiple CSV Files Endpoint
 * POST /api/csv/merge/:repositoryId
 * 
 * Merges multiple CSV files into a single consolidated dataset.
 * Supports intelligent deduplication, data harmonization, and quality optimization.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. Repository ID validation and access control
 * 3. Multiple file upload handling (maximum 5 files)
 * 4. Controller logic for CSV merging and consolidation
 * 
 * Features:
 * - Multiple CSV file merging with intelligent consolidation
 * - Advanced deduplication algorithms and conflict resolution
 * - Data harmonization and standardization across files
 * - Quality assessment and optimization during merge
 * - Performance optimization for large file operations
 * - Merge analytics and conflict resolution reporting
 * 
 * URL Parameters:
 * - repositoryId: MongoDB ObjectId of target repository
 * 
 * Request:
 * - csvFiles: Multiple CSV file uploads (maximum 5 files, multipart form data)
 * 
 * Response:
 * - CSV merge confirmation with consolidation summary
 * - Deduplication and conflict resolution results
 * - Data harmonization and standardization report
 * - Quality assessment and optimization outcomes
 * - Performance metrics and operation efficiency
 */
router.post(
 '/merge/:repositoryId',
 authenticateUser,                                          // Verify user authentication
 validateRepositoryId,                                      // Validate repository access
 upload.array('csvFiles', 5),                               // Handle multiple file uploads
 csvController.mergeCSVFiles                                // Process CSV file merging
);

/**
 * Cancel CSV Processing Job Endpoint
 * DELETE /api/csv/cancel/:jobId
 * 
 * Cancels an ongoing CSV processing job with graceful cleanup.
 * Provides job termination with resource cleanup and status reporting.
 * 
 * Middleware Stack:
 * 1. User authentication verification
 * 2. Controller logic for job cancellation and cleanup
 * 
 * Features:
 * - Graceful CSV processing job cancellation
 * - Resource cleanup and memory management
 * - Partial data preservation and recovery options
 * - Job cancellation audit logging and tracking
 * - Performance impact assessment and reporting
 * - Status synchronization and notification handling
 * 
 * URL Parameters:
 * - jobId: Unique identifier of the processing job to cancel
 * 
 * Response:
 * - Job cancellation confirmation with cleanup summary
 * - Resource cleanup and memory management status
 * - Partial data preservation and recovery options
 * - Cancellation audit log and tracking information
 * - Performance impact assessment and system status
 */
router.delete(
 '/cancel/:jobId',
 authenticateUser,                                          // Verify user authentication
 csvController.cancelCSVProcessing                          // Cancel processing job
);

// Export configured CSV router for application use
module.exports = router;
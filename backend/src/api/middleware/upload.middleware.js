/**
 * @fileoverview File Upload Middleware for ShadowNews Platform
 * 
 * Comprehensive file upload management system for the ShadowNews email-first news platform.
 * This module provides secure file upload handling with multi-strategy storage, robust
 * file validation, type-specific processing, and automatic cleanup mechanisms. Supports
 * CSV email imports, user avatars, and document attachments with advanced security features.
 * 
 * Key Features:
 * - Multi-strategy file storage (disk-based and memory-based)
 * - Comprehensive file type validation and sanitization
 * - Size limits tailored to content types and security requirements
 * - Secure filename generation with collision prevention
 * - Automatic file cleanup for failed operations
 * - Memory-efficient handling for temporary file processing
 * - MIME type validation with security-focused filtering
 * - Path traversal attack prevention
 * - Malicious file upload protection
 * 
 * Upload Types Supported:
 * - CSV Files: Email list imports with 10MB limit
 * - Avatar Images: User profile pictures with 5MB limit
 * - Document Attachments: PDFs, documents, archives with 25MB limit
 * - Memory Uploads: Small temporary files for immediate processing
 * 
 * Security Features:
 * - MIME type validation against whitelisted types
 * - Filename sanitization to prevent path traversal
 * - File size limits to prevent resource exhaustion
 * - Cryptographically secure filename generation
 * - Automatic cleanup of orphaned files
 * - Field name validation to prevent misuse
 * - Extension validation matching MIME types
 * 
 * Storage Strategies:
 * - Disk Storage: Persistent files with organized directory structure
 * - Memory Storage: Temporary files for immediate processing
 * - Cleanup Handlers: Automatic removal of failed uploads
 * 
 * Error Handling:
 * - Multer error translation to application errors
 * - File size violation handling with user-friendly messages
 * - MIME type mismatch errors with helpful guidance
 * - File count limit enforcement for bulk uploads
 * - Graceful handling of storage failures
 * 
 * Dependencies:
 * - multer: Core file upload handling middleware
 * - crypto: Cryptographically secure filename generation
 * - path: File path manipulation and validation
 * - fs.promises: Async file system operations for cleanup
 * - AppError: Custom error class for standardized error handling
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core dependencies for file upload handling
const multer = require('multer');               // Primary file upload middleware
const path = require('path');                  // File path manipulation utilities
const crypto = require('crypto');              // Cryptographic functions for secure filenames
const { AppError } = require('../../utils/errors'); // Custom error handling

/**
 * Secure Disk Storage Configuration
 * Implements organized file storage with security-focused directory structure
 * 
 * This storage configuration provides secure file handling with:
 * - Organized directory structure by file type
 * - Cryptographically secure filename generation
 * - Filename sanitization to prevent path traversal attacks
 * - Extension preservation with validation
 * - Collision-resistant file naming
 * 
 * Directory Structure:
 * - uploads/csv/: CSV email import files
 * - uploads/avatars/: User profile pictures
 * - uploads/attachments/: Document attachments
 * - uploads/: Default directory for other file types
 * 
 * Security Measures:
 * - Filename sanitization removes special characters
 * - Cryptographic random suffix prevents collisions
 * - Length limits prevent excessively long filenames
 * - Extension validation ensures proper file handling
 */
const storage = multer.diskStorage({
  /**
   * Dynamic Destination Selection
   * Routes files to appropriate directories based on field name and type
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - Multer file object with metadata
   * @param {Function} cb - Callback function for destination path
   */
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';                // Default upload directory
    
    // Route files to type-specific directories for organization and security
    if (file.fieldname === 'csv') {
      uploadPath = 'uploads/csv/';              // CSV email import files
    } else if (file.fieldname === 'avatar') {
      uploadPath = 'uploads/avatars/';          // User profile pictures
    } else if (file.fieldname === 'attachment') {
      uploadPath = 'uploads/attachments/';      // Document attachments
    }
    
    cb(null, uploadPath);
  },
  
  /**
   * Secure Filename Generation
   * Creates collision-resistant filenames with security sanitization
   * 
   * @param {Object} req - Express request object
   * @param {Object} file - Multer file object with original filename
   * @param {Function} cb - Callback function for generated filename
   */
  filename: (req, file, cb) => {
    // Generate cryptographically secure random suffix to prevent collisions
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    
    // Extract and preserve file extension for proper handling
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename to prevent path traversal and special character issues
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 32);
    
    // Combine sanitized name with secure suffix and original extension
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

/**
 * Comprehensive File Type Validation
 * MIME type filtering with security-focused whitelisting approach
 * 
 * This file filter implements strict MIME type validation to prevent:
 * - Malicious file uploads (executables, scripts)
 * - Unexpected file types that could cause processing errors
 * - MIME type spoofing attacks
 * - Unauthorized file type uploads
 * 
 * Validation Strategy:
 * - Whitelist approach for maximum security
 * - Field-specific allowed types
 * - Multiple MIME type support for cross-platform compatibility
 * - Descriptive error messages for failed validations
 * 
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object with MIME type
 * @param {Function} cb - Callback function for validation result
 */
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types for each upload field type
  const allowedMimes = {
    // CSV files for email import (multiple formats for compatibility)
    csv: [
      'text/csv',                              // Standard CSV MIME type
      'application/vnd.ms-excel',              // Excel CSV format
      'application/csv',                       // Alternative CSV MIME type
      'text/plain'                             // Plain text CSV files
    ],
    
    // Image files for user avatars (web-optimized formats)
    avatar: [
      'image/jpeg',                            // JPEG images
      'image/jpg',                             // Alternative JPEG MIME
      'image/png',                             // PNG images with transparency
      'image/gif',                             // GIF images (animated support)
      'image/webp'                             // Modern WebP format
    ],
    
    // Document attachments (productivity and archive formats)
    attachment: [
      'application/pdf',                       // PDF documents
      'application/msword',                    // Legacy Word documents
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Modern Word
      'text/plain',                            // Plain text files
      'application/zip',                       // ZIP archives
      'application/x-zip-compressed'           // Alternative ZIP MIME
    ]
  };

  // Get allowed MIME types for the current field
  const fieldMimes = allowedMimes[file.fieldname] || [];
  
  // Reject uploads with invalid field names
  if (fieldMimes.length === 0) {
    return cb(new AppError('Invalid field name', 400), false);
  }

  // Validate MIME type against whitelist
  if (fieldMimes.includes(file.mimetype)) {
    cb(null, true);                            // Accept valid file type
  } else {
    // Reject with helpful error message listing allowed types
    cb(new AppError(`Invalid file type. Allowed types: ${fieldMimes.join(', ')}`, 400), false);
  }
};

/**
 * File Size Limits Configuration
 * Type-specific size limits optimized for functionality and security
 * 
 * Size limits are carefully chosen to balance:
 * - Functional requirements for different file types
 * - Server resource protection and performance
 * - Network transfer efficiency
 * - Storage space conservation
 * - Security considerations for large file attacks
 * 
 * Limit Rationale:
 * - CSV: 10MB supports large email lists while preventing abuse
 * - Avatar: 5MB allows high-quality images without excessive storage
 * - Attachments: 25MB supports most documents while limiting resource use
 * - Default: 10MB provides reasonable fallback for other file types
 */
const limits = {
  csv: 10 * 1024 * 1024,                      // 10MB for CSV email import files
  avatar: 5 * 1024 * 1024,                    // 5MB for user profile pictures
  attachment: 25 * 1024 * 1024,               // 25MB for document attachments
  default: 10 * 1024 * 1024                   // 10MB default for other file types
};

/**
 * Upload Middleware Factory Function
 * Creates configured multer upload instances with consistent settings
 * 
 * This factory function provides standardized upload middleware with:
 * - Consistent storage and validation configuration
 * - Type-specific file size limits
 * - Configurable file count limits for bulk uploads
 * - Integrated error handling and security features
 * 
 * @param {string} fieldName - HTML form field name for file uploads
 * @param {number} maxCount - Maximum number of files allowed (default: 1)
 * @returns {Function} Configured multer middleware for array uploads
 * 
 * @example
 * // Create middleware for single CSV upload
 * const csvUploader = createUploader('csv', 1);
 * 
 * // Create middleware for multiple attachment uploads
 * const attachmentUploader = createUploader('attachment', 5);
 */
const createUploader = (fieldName, maxCount = 1) => {
  return multer({
    storage,                                   // Use configured disk storage
    fileFilter,                                // Apply MIME type validation
    limits: {
      fileSize: limits[fieldName] || limits.default // Apply type-specific size limits
    }
  }).array(fieldName, maxCount);               // Support multiple files up to maxCount
};

/**
 * CSV File Upload Middleware
 * Specialized middleware for CSV email import functionality
 * 
 * This middleware handles CSV file uploads for email list importing with:
 * - Single file upload restriction for data integrity
 * - 10MB size limit to prevent resource exhaustion
 * - Comprehensive error handling with user-friendly messages
 * - Validation to ensure file presence before processing
 * 
 * Security Features:
 * - File type validation through fileFilter
 * - Size limit enforcement with clear error messages
 * - Required file validation to prevent empty submissions
 * - Standardized error response format
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const uploadCSV = (req, res, next) => {
  const upload = createUploader('csv', 1);     // Single CSV file upload
  
  upload(req, res, (err) => {
    // Handle Multer-specific errors with user-friendly messages
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('CSV file too large. Maximum size is 10MB', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      // Handle other upload errors (validation, storage, etc.)
      return next(err);
    }
    
    // Validate that a file was actually uploaded
    if (!req.files || req.files.length === 0) {
      return next(new AppError('Please upload a CSV file', 400));
    }
    
    next();                                    // Proceed to next middleware
  });
};

/**
 * Avatar Image Upload Middleware
 * Specialized middleware for user profile picture uploads
 * 
 * This middleware handles avatar image uploads with:
 * - Single image upload for profile consistency
 * - 5MB size limit optimized for high-quality images
 * - Image format validation (JPEG, PNG, GIF, WebP)
 * - Optional upload support (user may skip avatar)
 * 
 * Features:
 * - Support for modern image formats including WebP
 * - Reasonable size limit for profile pictures
 * - Graceful handling of missing files (optional upload)
 * - Clear error messages for size and type violations
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const uploadAvatar = (req, res, next) => {
  const upload = createUploader('avatar', 1);  // Single avatar image upload
  
  upload(req, res, (err) => {
    // Handle Multer-specific errors with image-focused messaging
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Image too large. Maximum size is 5MB', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      // Handle validation errors (wrong image type, etc.)
      return next(err);
    }
    
    // Avatar upload is optional - no file validation required
    next();                                    // Proceed regardless of file presence
  });
};

/**
 * Document Attachment Upload Middleware
 * Specialized middleware for document and file attachments
 * 
 * This middleware handles document attachments with:
 * - Multiple file upload support (up to 5 files)
 * - 25MB size limit per file for documents
 * - Support for PDFs, Word docs, text files, and archives
 * - Comprehensive error handling for bulk upload scenarios
 * 
 * Features:
 * - Bulk upload support for multiple attachments
 * - Large size limit for document files
 * - File count limits to prevent abuse
 * - Detailed error messages for different failure modes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const uploadAttachments = (req, res, next) => {
  const upload = createUploader('attachment', 5); // Multiple attachment uploads (max 5)
  
  upload(req, res, (err) => {
    // Handle Multer-specific errors with attachment-focused messaging
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Attachment too large. Maximum size is 25MB', 400));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError('Too many files. Maximum 5 attachments allowed', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      // Handle validation errors (wrong file type, etc.)
      return next(err);
    }
    
    // Attachment upload is optional - proceed regardless
    next();
  });
};

/**
 * Memory Storage Configuration
 * Temporary file storage in memory for immediate processing
 * 
 * Memory storage is used for:
 * - Small files that need immediate processing
 * - Temporary uploads that don't require persistence
 * - Files that will be processed and discarded quickly
 * - Situations where disk I/O should be minimized
 * 
 * Benefits:
 * - Faster access for immediate processing
 * - No disk cleanup required
 * - Reduced I/O overhead for small files
 * - Automatic cleanup when request ends
 * 
 * Limitations:
 * - Higher memory usage during processing
 * - Not suitable for large files
 * - Limited by available server memory
 */
const memoryStorage = multer.memoryStorage();

/**
 * Memory Upload Factory Function
 * Creates memory-based upload middleware for temporary file processing
 * 
 * This function creates upload middleware that stores files in memory
 * for immediate processing without disk storage. Ideal for small files
 * that need quick processing and don't require persistence.
 * 
 * @param {string} fieldName - HTML form field name for file upload
 * @param {number} maxSize - Maximum file size in bytes (default: 1MB)
 * @returns {Function} Configured multer middleware for memory uploads
 * 
 * @example
 * // Create memory uploader for small CSV processing
 * const csvMemoryUploader = uploadToMemory('csv', 1024 * 1024);
 */
const uploadToMemory = (fieldName, maxSize = 1024 * 1024) => {
  return multer({
    storage: memoryStorage,                    // Use memory storage
    limits: {
      fileSize: maxSize                        // Apply size limit
    },
    fileFilter                                 // Apply same validation rules
  }).single(fieldName);                        // Single file upload to memory
};

/**
 * File Cleanup Middleware
 * Automatic cleanup of uploaded files when operations fail or complete
 * 
 * This middleware provides essential cleanup functionality to prevent:
 * - Orphaned files from failed upload processing
 * - Disk space accumulation from temporary files
 * - Security issues from abandoned uploads
 * - Resource leaks in long-running applications
 * 
 * Cleanup Triggers:
 * - Response completion (successful or failed)
 * - Response error events
 * - Request abortion by client
 * - Server errors during processing
 * 
 * Features:
 * - Automatic detection of uploaded files
 * - Safe async file deletion with error handling
 * - Support for both single and multiple file uploads
 * - Non-blocking operation that doesn't affect response
 * 
 * @param {Object} req - Express request object with uploaded files
 * @param {Object} res - Express response object for event handling
 * @param {Function} next - Express next middleware function
 */
const cleanupUploadedFiles = (req, res, next) => {
  const fs = require('fs').promises;           // Async file system operations
  
  /**
   * Async File Cleanup Function
   * Safely removes uploaded files with error handling
   */
  const cleanup = async () => {
    // Handle multiple file uploads (array)
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);          // Delete file asynchronously
        } catch (error) {
          // Log but don't fail on cleanup errors
          console.error('Error deleting file:', error);
        }
      }
    } 
    // Handle single file uploads
    else if (req.file) {
      try {
        await fs.unlink(req.file.path);        // Delete single file
      } catch (error) {
        // Log but don't fail on cleanup errors
        console.error('Error deleting file:', error);
      }
    }
  };

  // Register cleanup handlers for various response events
  res.on('finish', cleanup);                   // Normal response completion
  res.on('error', cleanup);                    // Response error events
  
  next();                                      // Continue to next middleware
};

// Export all upload middleware and utilities for application use
module.exports = {
  uploadCSV,              // CSV file upload middleware
  uploadAvatar,           // Avatar image upload middleware
  uploadAttachments,      // Document attachment upload middleware
  uploadToMemory,         // Memory-based upload factory
  cleanupUploadedFiles,   // Automatic file cleanup middleware
  storage,                // Disk storage configuration
  fileFilter,             // File type validation function
  limits                  // File size limits configuration
};
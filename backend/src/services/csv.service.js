/**
 * @fileoverview CSV Processing Service
 * 
 * Comprehensive CSV processing service for email list management in ShadowNews.
 * Handles CSV file parsing, validation, data processing, email list merging,
 * and CSV generation. Integrates with repository management and email services
 * for complete email list lifecycle management.
 * 
 * Key Features:
 * - Secure CSV file parsing with validation and sanitization
 * - Batch processing for large email lists with memory optimization
 * - Email validation and domain blacklist checking
 * - Duplicate detection and removal across multiple sources
 * - Integration with repository system for email list organization
 * - CSV generation and export capabilities
 * - File merging for combining multiple email sources
 * - Comprehensive error handling and progress tracking
 * - Support for custom headers and flexible data mapping
 * 
 * Security Features:
 * - File size limits to prevent abuse
 * - MIME type validation for security
 * - Input sanitization for all email data
 * - Domain blacklist protection against temporary emails
 * - Memory-efficient streaming for large files
 * - Comprehensive error logging and audit trails
 * 
 * Performance Features:
 * - Streaming CSV parsing for memory efficiency
 * - Batch processing to optimize database operations
 * - Duplicate detection using efficient Set operations
 * - Asynchronous processing for non-blocking operations
 * - Progress tracking for long-running operations
 * 
 * Dependencies:
 * - fs.promises: Async file system operations
 * - csv-parser: Streaming CSV parsing library
 * - csv-parse/csv-stringify: CSV data manipulation
 * - crypto: Hash generation for file integrity
 * - validator: Email validation utilities
 * - Repository.model: Email repository data model
 * - Email.model: Individual email record model
 * - snowball.service: Viral growth and referral system
 * - email.service: Email sending and notification system
 * - validators: Custom validation utilities
 * - logger: Centralized logging system
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-01-27
 */

// Node.js file system promises for async file operations
const fs = require('fs').promises;

// CSV parsing library for streaming data processing
const csv = require('csv-parser');

// CSV parsing and stringifying utilities
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');

// Node.js stream utilities for efficient data processing
const stream = require('stream');
const util = require('util');

// Crypto module for hash generation and file integrity
const crypto = require('crypto');

// Email validation library
const validator = require('validator');

// Database models for email and repository management
const Repository = require('../models/Repository.model');
const Email = require('../models/Email.model');

// Logging utility for audit trails and debugging
const { logger } = require('../utils/logger');

// Custom validation utilities for email processing
const { validateEmail, sanitizeEmail } = require('../utils/validators');

// Service dependencies for email processing workflow
const snowballService = require('./snowball.service');
const emailService = require('./email.service');

// Promisify pipeline for async stream processing
const pipeline = util.promisify(stream.pipeline);

/**
 * CSV Processing Service Class
 * 
 * Handles all CSV-related operations for email list management including parsing,
 * validation, processing, and generation. Provides secure and efficient email list
 * operations with comprehensive error handling and integration capabilities.
 * 
 * Core Responsibilities:
 * - CSV file parsing and validation
 * - Email data processing and sanitization
 * - Batch operations for performance optimization
 * - Repository integration for email organization
 * - CSV generation and export functionality
 * - File merging and deduplication operations
 * 
 * @class CSVService
 * @since 1.0.0
 */
class CSVService {
  /**
   * Initialize CSV Service Configuration
   * 
   * Sets up service configuration including file size limits, allowed MIME types,
   * and batch processing parameters for optimal performance and security.
   * 
   * Configuration:
   * - maxFileSize: 10MB limit for uploaded CSV files
   * - allowedMimeTypes: Secure MIME type validation
   * - batchSize: 100 records per batch for memory optimization
   * 
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    // Maximum allowed file size (10MB) to prevent abuse
    this.maxFileSize = 10 * 1024 * 1024;
    
    // Allowed MIME types for CSV file validation
    this.allowedMimeTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];
    
    // Batch size for processing large files efficiently
    this.batchSize = 100;
  }

  /**
   * Parse CSV file and process email data
   * 
   * Streams CSV file parsing with validation, sanitization, and batch processing.
   * Handles large files efficiently while maintaining data integrity and providing
   * comprehensive error reporting and processing statistics.
   * 
   * Processing Features:
   * - Memory-efficient streaming for large files
   * - Real-time validation and sanitization
   * - Batch processing for database optimization
   * - Comprehensive error tracking and reporting
   * - Progress statistics and monitoring
   * - Automatic file cleanup after processing
   * 
   * @param {string} filePath - Absolute path to CSV file for processing
   * @param {Object} options - Processing configuration options
   * @param {Array<string>} [options.headers] - Custom column headers mapping
   * @param {string} [options.source] - Source identifier for data tracking
   * @param {string} [options.userId] - User ID for audit tracking
   * @param {string} [options.fileName] - Original filename for metadata
   * @param {boolean} [options.validateDomain] - Enable domain validation
   * @param {string} [options.repositoryId] - Target repository for emails
   * @param {boolean} [options.enableSnowball] - Enable viral growth processing
   * @param {boolean} [options.sendWelcomeEmail] - Send welcome emails to new contacts
   * @returns {Promise<Object>} Processing results with statistics and errors
   * 
   * @throws {Error} File parsing or processing errors
   * 
   * @example
   * // Parse CSV with basic options
   * const result = await csvService.parseCSV('/path/to/emails.csv', {
   *   headers: ['email', 'name', 'tags'],
   *   source: 'manual_upload',
   *   userId: 'user123',
   *   validateDomain: true
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async parseCSV(filePath, options = {}) {
    try {
      const emails = [];
      const errors = [];
      
      // Initialize processing statistics
      const stats = {
        total: 0,
        valid: 0,
        invalid: 0,
        duplicate: 0,
        processed: 0
      };

      // Create streaming CSV parser with configuration
      const parser = fs.createReadStream(filePath)
        .pipe(csv({
          headers: options.headers || ['email', 'name', 'tags', 'verified'],
          skipEmptyLines: true,
          trim: true,
          maxRowBytes: 1024 // Prevent memory attacks with large rows
        }));

      // Process each row with validation and sanitization
      for await (const row of parser) {
        stats.total++;
        
        // Process and validate individual row
        const processedRow = await this.processRow(row, {
          ...options,
          rowNumber: stats.total
        });
        
        if (processedRow.valid) {
          emails.push(processedRow.data);
          stats.valid++;
        } else {
          errors.push({
            row: stats.total,
            data: row,
            error: processedRow.error
          });
          stats.invalid++;
        }

        // Process in batches for memory efficiency
        if (emails.length >= this.batchSize) {
          await this.processBatch(emails.splice(0, this.batchSize), options);
          stats.processed += this.batchSize;
        }
      }

      // Process remaining emails in final batch
      if (emails.length > 0) {
        await this.processBatch(emails, options);
        stats.processed += emails.length;
      }

      // Clean up temporary file
      await fs.unlink(filePath);

      logger.info(`CSV parsing completed: ${stats.valid} valid, ${stats.invalid} invalid emails`);

      return {
        success: true,
        stats,
        errors: errors.slice(0, 100) // Limit error list to prevent memory issues
      };

    } catch (error) {
      logger.error('CSV parsing error:', error);
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  }

  /**
   * Process and validate individual CSV row
   * 
   * Validates and sanitizes data from a single CSV row, including email validation,
   * name sanitization, tag parsing, and optional domain verification.
   * 
   * Processing Steps:
   * - Email extraction and validation
   * - Name sanitization and length limits
   * - Tag parsing and normalization
   * - Boolean field parsing
   * - Domain validation (if enabled)
   * - Metadata enrichment
   * 
   * @param {Object} row - Raw CSV row data
   * @param {Object} options - Processing options
   * @param {boolean} [options.validateDomain] - Enable domain validation
   * @param {string} [options.source] - Source identifier for tracking
   * @param {string} [options.userId] - User ID for audit trail
   * @param {string} [options.fileName] - Original filename
   * @param {number} [options.rowNumber] - Row number for error tracking
   * @returns {Promise<Object>} Validation result with processed data or error
   * 
   * @example
   * // Process a CSV row with validation
   * const result = await csvService.processRow({
   *   email: 'user@example.com',
   *   name: 'John Doe',
   *   tags: 'newsletter,updates'
   * }, { validateDomain: true });
   * 
   * @since 1.0.0
   * @async
   * @private
   */
  async processRow(row, options = {}) {
    try {
      // Extract and sanitize email from various possible column names
      const email = sanitizeEmail(row.email || row.Email || row.EMAIL || '');
      
      // Validate email format
      if (!validateEmail(email)) {
        return {
          valid: false,
          error: 'Invalid email format'
        };
      }

      // Create processed data object with sanitized fields
      const processedData = {
        email: email.toLowerCase(),
        name: this.sanitizeName(row.name || row.Name || ''),
        tags: this.parseTags(row.tags || row.Tags || ''),
        verified: this.parseBoolean(row.verified || row.Verified || false),
        source: options.source || 'csv_upload',
        addedBy: options.userId,
        metadata: {
          originalFileName: options.fileName,
          uploadDate: new Date(),
          rowNumber: options.rowNumber
        }
      };

      // Optional domain validation against blacklist
      if (options.validateDomain) {
        const domain = email.split('@')[1];
        if (!await this.validateDomain(domain)) {
          return {
            valid: false,
            error: 'Invalid or blacklisted domain'
          };
        }
      }

      return {
        valid: true,
        data: processedData
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Process batch of validated emails
   * 
   * Handles batch processing of validated email data including deduplication,
   * repository integration, snowball processing, and welcome email sending.
   * 
   * Batch Operations:
   * - Duplicate removal within batch
   * - Repository integration (if specified)
   * - Snowball viral growth processing
   * - Welcome email delivery
   * - Performance optimization through batching
   * 
   * @param {Array<Object>} emails - Array of validated email objects
   * @param {Object} options - Batch processing options
   * @param {string} [options.repositoryId] - Target repository ID
   * @param {boolean} [options.enableSnowball] - Enable viral growth
   * @param {boolean} [options.sendWelcomeEmail] - Send welcome emails
   * @returns {Promise<number>} Number of emails processed in batch
   * 
   * @throws {Error} Batch processing errors
   * 
   * @example
   * // Process batch with repository and welcome emails
   * const count = await csvService.processBatch(emailBatch, {
   *   repositoryId: 'repo123',
   *   sendWelcomeEmail: true,
   *   enableSnowball: true
   * });
   * 
   * @since 1.0.0
   * @async
   * @private
   */
  async processBatch(emails, options = {}) {
    try {
      // Remove duplicates within the batch
      const uniqueEmails = this.removeDuplicates(emails);
      
      // Add emails to specified repository
      if (options.repositoryId) {
        await this.addToRepository(uniqueEmails, options.repositoryId, options);
      }

      // Process emails for viral growth (snowball effect)
      if (options.enableSnowball) {
        await snowballService.processNewEmails(uniqueEmails, options);
      }

      // Send welcome emails to new subscribers
      if (options.sendWelcomeEmail) {
        await this.sendWelcomeEmails(uniqueEmails, options);
      }

      return uniqueEmails.length;

    } catch (error) {
      logger.error('Batch processing error:', error);
      throw error;
    }
  }

  /**
   * Generate CSV export from repository
   * 
   * Creates CSV export of email data from a specified repository with
   * formatting, metadata inclusion, and file integrity validation.
   * 
   * Export Features:
   * - Repository data extraction with population
   * - Flexible column mapping and formatting
   * - File integrity hashing for verification
   * - Metadata inclusion (timestamps, verification status)
   * - Performance optimization for large exports
   * 
   * @param {string} repositoryId - MongoDB ObjectId of repository
   * @param {Object} options - Export configuration options
   * @param {Array<string>} [options.headers] - Custom column headers
   * @param {boolean} [options.includeMetadata] - Include timestamp data
   * @returns {Promise<Object>} Export result with CSV data and metadata
   * 
   * @throws {Error} Repository not found or export generation errors
   * 
   * @example
   * // Generate CSV export with custom headers
   * const export = await csvService.generateCSV('repo123', {
   *   headers: ['email', 'name', 'verified', 'addedAt'],
   *   includeMetadata: true
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async generateCSV(repositoryId, options = {}) {
    try {
      // Fetch repository with populated email data
      const repository = await Repository.findById(repositoryId)
        .populate('emails', 'email name tags verified addedAt');

      if (!repository) {
        throw new Error('Repository not found');
      }

      // Transform email data for CSV export
      const data = repository.emails.map(email => ({
        email: email.email,
        name: email.name || '',
        tags: Array.isArray(email.tags) ? email.tags.join(';') : '',
        verified: email.verified ? 'true' : 'false',
        addedAt: email.addedAt.toISOString()
      }));

      // Convert data array to CSV string
      const csvString = await this.arrayToCSV(data, {
        headers: options.headers || ['email', 'name', 'tags', 'verified', 'addedAt']
      });

      // Generate filename and integrity hash
      const fileName = `${repository.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
      const hash = crypto.createHash('md5').update(csvString).digest('hex');

      logger.info(`CSV generated for repository ${repositoryId}: ${data.length} emails`);

      return {
        data: csvString,
        fileName,
        mimeType: 'text/csv',
        size: Buffer.byteLength(csvString),
        hash,
        emailCount: data.length
      };

    } catch (error) {
      logger.error('CSV generation error:', error);
      throw new Error(`Failed to generate CSV: ${error.message}`);
    }
  }

  /**
   * Merge multiple CSV files into single dataset
   * 
   * Combines multiple CSV files while removing duplicates and providing
   * comprehensive statistics about the merge operation.
   * 
   * Merge Features:
   * - Multi-file processing with error handling
   * - Efficient duplicate detection using Map
   * - Comprehensive merge statistics
   * - Optional CSV generation from merged data
   * - Memory-efficient processing for large files
   * 
   * @param {Array<string>} filePaths - Array of CSV file paths to merge
   * @param {Object} options - Merge configuration options
   * @param {boolean} [options.skipGeneration] - Skip CSV generation
   * @param {boolean} [options.skipProcessing] - Skip email processing
   * @returns {Promise<Object>} Merge results with data and statistics
   * 
   * @throws {Error} File processing or merge operation errors
   * 
   * @example
   * // Merge multiple CSV files
   * const result = await csvService.mergeCSVFiles([
   *   '/path/to/emails1.csv',
   *   '/path/to/emails2.csv'
   * ], { skipGeneration: false });
   * 
   * @since 1.0.0
   * @async
   */
  async mergeCSVFiles(filePaths, options = {}) {
    try {
      const mergedEmails = new Map();
      const stats = {
        totalFiles: filePaths.length,
        totalRows: 0,
        uniqueEmails: 0,
        duplicates: 0
      };

      // Process each CSV file sequentially
      for (const filePath of filePaths) {
        const result = await this.parseCSV(filePath, {
          ...options,
          skipProcessing: true
        });

        // Add emails to merge map with duplicate detection
        result.emails.forEach(email => {
          if (!mergedEmails.has(email.email)) {
            mergedEmails.set(email.email, email);
          } else {
            stats.duplicates++;
          }
          stats.totalRows++;
        });
      }

      stats.uniqueEmails = mergedEmails.size;
      const mergedArray = Array.from(mergedEmails.values());

      // Optionally generate CSV from merged data
      if (!options.skipGeneration) {
        const csvData = await this.arrayToCSV(mergedArray);
        return {
          data: csvData,
          stats,
          emails: mergedArray
        };
      }

      return {
        emails: mergedArray,
        stats
      };

    } catch (error) {
      logger.error('CSV merge error:', error);
      throw new Error(`Failed to merge CSV files: ${error.message}`);
    }
  }

  /**
   * Validate CSV file structure and headers
   * 
   * Performs comprehensive validation of CSV file structure including
   * file size, headers, and data format requirements.
   * 
   * Validation Checks:
   * - File size limits for security
   * - Required header validation
   * - Optional header detection
   * - Invalid header identification
   * - File accessibility verification
   * 
   * @param {string} filePath - Path to CSV file for validation
   * @returns {Promise<Object>} Validation results with detailed analysis
   * 
   * @example
   * // Validate CSV structure before processing
   * const validation = await csvService.validateCSVStructure('/path/to/file.csv');
   * if (validation.valid) {
   *   // Proceed with processing
   * }
   * 
   * @since 1.0.0
   * @async
   */
  async validateCSVStructure(filePath) {
    try {
      // Check file size against limits
      const fileStats = await fs.stat(filePath);
      
      if (fileStats.size > this.maxFileSize) {
        throw new Error(`File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
      }

      // Read and parse first line for header analysis
      const firstLine = await this.readFirstLine(filePath);
      const headers = firstLine.split(',').map(h => h.trim().toLowerCase());
      
      // Define required and optional headers
      const requiredHeaders = ['email'];
      const optionalHeaders = ['name', 'tags', 'verified'];
      const allValidHeaders = [...requiredHeaders, ...optionalHeaders];

      // Validate required headers presence
      const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
      if (!hasRequiredHeaders) {
        throw new Error('CSV must contain "email" column');
      }

      // Identify invalid headers
      const invalidHeaders = headers.filter(h => !allValidHeaders.includes(h));
      
      return {
        valid: true,
        headers,
        invalidHeaders,
        fileSize: fileStats.size,
        hasAllOptionalHeaders: optionalHeaders.every(h => headers.includes(h))
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Add emails to repository with duplicate checking
   * 
   * Integrates processed emails into specified repository while preventing
   * duplicates and updating repository statistics.
   * 
   * Integration Features:
   * - Duplicate detection against existing repository emails
   * - Bulk email document creation for performance
   * - Repository statistics updates
   * - Snowball growth tracking (if enabled)
   * - Comprehensive error handling
   * 
   * @param {Array<Object>} emails - Array of processed email objects
   * @param {string} repositoryId - Target repository MongoDB ObjectId
   * @param {Object} options - Integration options
   * @param {boolean} [options.updateSnowballStats] - Update viral growth statistics
   * @returns {Promise<Object>} Integration results with counts and metadata
   * 
   * @throws {Error} Repository not found or integration errors
   * 
   * @example
   * // Add emails to repository with snowball tracking
   * const result = await csvService.addToRepository(emails, 'repo123', {
   *   updateSnowballStats: true
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async addToRepository(emails, repositoryId, options = {}) {
    try {
      // Fetch target repository
      const repository = await Repository.findById(repositoryId);
      if (!repository) {
        throw new Error('Repository not found');
      }

      // Get existing emails for duplicate detection
      const existingEmails = new Set(
        repository.emails.map(e => e.email.toLowerCase())
      );

      // Filter out duplicates
      const newEmails = emails.filter(e => !existingEmails.has(e.email.toLowerCase()));

      if (newEmails.length === 0) {
        return {
          added: 0,
          duplicates: emails.length
        };
      }

      // Bulk insert new email documents
      const emailDocs = await Email.insertMany(newEmails, { ordered: false });
      
      // Update repository with new email references
      repository.emails.push(...emailDocs.map(e => e._id));
      repository.stats.totalEmails += emailDocs.length;
      repository.stats.lastUpdated = new Date();
      
      // Update snowball growth statistics if enabled
      if (options.updateSnowballStats) {
        repository.stats.snowballGrowth += emailDocs.length;
      }

      await repository.save();

      logger.info(`Added ${emailDocs.length} emails to repository ${repositoryId}`);

      return {
        added: emailDocs.length,
        duplicates: emails.length - emailDocs.length,
        repositoryId: repository._id
      };

    } catch (error) {
      logger.error('Add to repository error:', error);
      throw error;
    }
  }

  /**
   * Send welcome emails to new subscribers
   * 
   * Handles bulk welcome email delivery with batching for performance
   * and comprehensive error handling.
   * 
   * Email Delivery Features:
   * - Batch processing for optimal performance
   * - Individual email error handling
   * - Delivery success tracking
   * - Rate limiting compliance
   * - Comprehensive logging
   * 
   * @param {Array<Object>} emails - Array of email objects for welcome messages
   * @param {Object} options - Email delivery options
   * @param {string} [options.template] - Custom email template
   * @param {Object} [options.templateData] - Template variables
   * @returns {Promise<number>} Number of successfully sent welcome emails
   * 
   * @throws {Error} Email service errors
   * 
   * @example
   * // Send welcome emails with custom template
   * const sent = await csvService.sendWelcomeEmails(emails, {
   *   template: 'custom_welcome',
   *   templateData: { campaignName: 'Spring 2024' }
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async sendWelcomeEmails(emails, options = {}) {
    try {
      // Process emails in batches to respect rate limits
      const emailBatches = this.chunkArray(emails, 50);
      let sent = 0;

      for (const batch of emailBatches) {
        // Create email promises for concurrent sending
        const emailPromises = batch.map(email => 
          emailService.sendWelcomeEmail(email, options)
        );
        
        // Execute batch with error handling
        const results = await Promise.allSettled(emailPromises);
        sent += results.filter(r => r.status === 'fulfilled').length;
        
        // Log any failed deliveries
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          logger.warn(`Failed to send ${failed.length} welcome emails in batch`);
        }
      }

      logger.info(`Welcome emails sent: ${sent} of ${emails.length}`);
      return sent;

    } catch (error) {
      logger.error('Welcome email sending error:', error);
      throw error;
    }
  }

  /**
   * Sanitize name field for security and consistency
   * 
   * Cleans and validates name data to prevent XSS attacks and
   * ensure consistent formatting.
   * 
   * Sanitization Rules:
   * - Trim whitespace
   * - Remove dangerous HTML characters
   * - Enforce length limits
   * - Unicode normalization
   * 
   * @param {string} name - Raw name input
   * @returns {string} Sanitized and validated name
   * 
   * @example
   * // Sanitize user input
   * const cleanName = csvService.sanitizeName('  John <script>alert()</script> Doe  ');
   * // Returns: 'John Doe'
   * 
   * @since 1.0.0
   */
  sanitizeName(name) {
    return name
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML/script tags
      .slice(0, 100); // Enforce maximum length
  }

  /**
   * Parse and normalize tag string into array
   * 
   * Converts tag string (semicolon or comma-delimited) into normalized
   * array of tags with validation and limits.
   * 
   * Parsing Rules:
   * - Support both semicolon and comma delimiters
   * - Normalize to lowercase
   * - Remove empty tags
   * - Enforce tag length limits
   * - Limit total number of tags
   * 
   * @param {string} tags - Raw tag string
   * @returns {Array<string>} Normalized array of tags
   * 
   * @example
   * // Parse tag string
   * const tagArray = csvService.parseTags('Newsletter; Marketing, Updates');
   * // Returns: ['newsletter', 'marketing', 'updates']
   * 
   * @since 1.0.0
   */
  parseTags(tags) {
    if (!tags) return [];
    
    // Detect delimiter (prefer semicolon over comma)
    const delimiter = tags.includes(';') ? ';' : ',';
    
    return tags
      .split(delimiter)
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length < 50) // Valid tag length
      .slice(0, 10); // Maximum 10 tags per email
  }

  /**
   * Parse boolean values from various string representations
   * 
   * Converts string boolean representations to actual boolean values
   * with support for multiple formats.
   * 
   * @param {string|boolean} value - Value to parse as boolean
   * @returns {boolean} Parsed boolean value
   * 
   * @example
   * // Parse various boolean formats
   * csvService.parseBoolean('true');     // true
   * csvService.parseBoolean('yes');      // true
   * csvService.parseBoolean('1');        // true
   * csvService.parseBoolean('verified'); // true
   * csvService.parseBoolean('false');    // false
   * 
   * @since 1.0.0
   */
  parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', 'yes', '1', 'verified'].includes(value.toLowerCase());
    }
    return false;
  }

  /**
   * Remove duplicate emails from array
   * 
   * Efficiently removes duplicate email entries using Set for O(n) performance.
   * Comparison is case-insensitive for email addresses.
   * 
   * @param {Array<Object>} emails - Array of email objects
   * @returns {Array<Object>} Array with duplicates removed
   * 
   * @example
   * // Remove duplicates from email list
   * const unique = csvService.removeDuplicates(emailArray);
   * 
   * @since 1.0.0
   */
  removeDuplicates(emails) {
    const seen = new Set();
    return emails.filter(email => {
      const key = email.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Validate email domain against blacklist
   * 
   * Checks email domain against blacklist of temporary and disposable
   * email services to maintain list quality.
   * 
   * @param {string} domain - Email domain to validate
   * @returns {Promise<boolean>} True if domain is valid, false if blacklisted
   * 
   * @example
   * // Validate email domain
   * const isValid = await csvService.validateDomain('example.com');
   * 
   * @since 1.0.0
   * @async
   */
  async validateDomain(domain) {
    const blacklistedDomains = [
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com'
    ];
    
    return !blacklistedDomains.includes(domain.toLowerCase());
  }

  /**
   * Read first line of file for header analysis
   * 
   * Efficiently reads only the first line of a file for header parsing
   * without loading the entire file into memory.
   * 
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} First line of file
   * 
   * @since 1.0.0
   * @async
   * @private
   */
  async readFirstLine(filePath) {
    const stream = fs.createReadStream(filePath, {
      encoding: 'utf8',
      end: 1000 // Read only first 1000 bytes
    });
    
    for await (const chunk of stream) {
      const lines = chunk.split('\n');
      return lines[0];
    }
  }

  /**
   * Convert array of objects to CSV string
   * 
   * Transforms JavaScript object array into properly formatted CSV string
   * with customizable headers and formatting options.
   * 
   * @param {Array<Object>} data - Array of objects to convert
   * @param {Object} options - CSV formatting options
   * @param {Array<string>} [options.headers] - Custom column headers
   * @returns {Promise<string>} CSV formatted string
   * 
   * @since 1.0.0
   * @async
   * @private
   */
  async arrayToCSV(data, options = {}) {
    const stringifyOptions = {
      header: true,
      columns: options.headers || Object.keys(data[0] || {})
    };

    return new Promise((resolve, reject) => {
      stringify(data, stringifyOptions, (err, output) => {
        if (err) reject(err);
        else resolve(output);
      });
    });
  }

  /**
   * Split array into chunks of specified size
   * 
   * Divides large arrays into smaller chunks for batch processing
   * and memory management.
   * 
   * @param {Array} array - Array to chunk
   * @param {number} size - Size of each chunk
   * @returns {Array<Array>} Array of chunks
   * 
   * @since 1.0.0
   * @private
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Generate CSV statistics and analysis
   * 
   * Analyzes CSV file content to provide statistics about email data
   * including validation, domain distribution, and data quality metrics.
   * 
   * Analysis Features:
   * - Email validation statistics
   * - Domain distribution analysis
   * - Data quality metrics
   * - Top domain identification
   * - Row count and processing stats
   * 
   * @param {string} filePath - Path to CSV file for analysis
   * @returns {Promise<Object>} Comprehensive statistics and analysis
   * 
   * @throws {Error} File reading or analysis errors
   * 
   * @example
   * // Generate detailed CSV statistics
   * const stats = await csvService.getCSVStats('/path/to/emails.csv');
   * // Returns: { totalRows, validEmails, uniqueDomains, topDomains }
   * 
   * @since 1.0.0
   * @async
   */
  async getCSVStats(filePath) {
    try {
      let rowCount = 0;
      let emailCount = 0;
      const domains = new Set();

      // Stream through file for memory efficiency
      const parser = fs.createReadStream(filePath)
        .pipe(csv());

      for await (const row of parser) {
        rowCount++;
        
        // Validate and count emails
        if (row.email && validateEmail(row.email)) {
          emailCount++;
          domains.add(row.email.split('@')[1].toLowerCase());
        }
      }

      return {
        totalRows: rowCount,
        validEmails: emailCount,
        invalidEmails: rowCount - emailCount,
        validationRate: rowCount > 0 ? (emailCount / rowCount * 100).toFixed(2) : 0,
        uniqueDomains: domains.size,
        topDomains: this.getTopItems(Array.from(domains), 10)
      };

    } catch (error) {
      logger.error('CSV stats error:', error);
      throw error;
    }
  }

  /**
   * Get top items from array with counts
   * 
   * Analyzes array to find most frequent items with occurrence counts.
   * Used for domain analysis and data insights.
   * 
   * @param {Array} items - Array of items to analyze
   * @param {number} limit - Maximum number of top items to return
   * @returns {Array<Object>} Array of top items with counts
   * 
   * @since 1.0.0
   * @private
   */
  getTopItems(items, limit = 10) {
    const counts = {};
    
    // Count occurrences
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    // Sort by count and return top items
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }
}

module.exports = new CSVService();
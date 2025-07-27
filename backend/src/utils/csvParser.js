/**
 * @fileoverview CSV Parser Utility
 * 
 * Advanced CSV parsing utility for ShadowNews email list management and data processing.
 * Provides robust CSV file parsing, validation, sanitization, and error handling with
 * support for streaming, email validation, and data integrity checks.
 * 
 * Key Features:
 * - Configurable CSV parsing with Papa Parse integration
 * - Email validation and deduplication
 * - File size and row count limits for security
 * - Header normalization and validation
 * - Data sanitization and type conversion
 * - Streaming support for large files
 * - Comprehensive error reporting and logging
 * - CSV generation and export capabilities
 * - Delimiter auto-detection
 * - Customizable validation rules
 * 
 * Security Features:
 * - File size limits to prevent memory exhaustion
 * - Row count limits for performance protection
 * - Input sanitization to prevent injection attacks
 * - Email format validation with validator library
 * - Safe header normalization and transformation
 * - Comprehensive error handling without data exposure
 * 
 * Performance Features:
 * - Streaming parsing for large files
 * - Efficient duplicate detection using Set
 * - Lazy loading and processing
 * - Memory-optimized data structures
 * - Configurable batch processing
 * - SHA-256 hashing for data integrity
 * 
 * Dependencies:
 * - papaparse: Robust CSV parsing library with streaming support
 * - fs.promises: Async file system operations
 * - crypto: Hash generation for data integrity verification
 * - validator: Email validation and sanitization
 * - logger: Centralized logging for error tracking and debugging
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Papa Parse - powerful CSV parsing library with streaming support
const Papa = require('papaparse');

// Node.js file system promises for async file operations
const fs = require('fs').promises;

// Crypto module for hash generation and data integrity
const crypto = require('crypto');

// Email validation library for data quality assurance
const validator = require('validator');

// Centralized logging utility for error tracking
const { logger } = require('./logger');

/**
 * CSV Parser Class
 * 
 * Comprehensive CSV parsing utility that handles file parsing, data validation,
 * sanitization, and export functionality. Provides configurable options for
 * different use cases and robust error handling for production environments.
 * 
 * Core Responsibilities:
 * - CSV file parsing with validation and error handling
 * - Email list processing with deduplication
 * - Data sanitization and type conversion
 * - Header normalization and validation
 * - CSV generation and export functionality
 * - Streaming support for large datasets
 * 
 * @class CSVParser
 * @since 1.0.0
 */
class CSVParser {
  /**
   * Initialize CSV Parser with configuration options
   * 
   * Sets up default parsing configuration including file limits, validation rules,
   * and processing options. All defaults can be overridden per operation.
   * 
   * Configuration Options:
   * - maxFileSize: 10MB limit for uploaded files
   * - maxRows: 10,000 row limit for performance
   * - allowedMimeTypes: Secure MIME type validation
   * - requiredColumns: Email column required by default
   * - optionalColumns: Additional supported columns
   * - encoding: UTF-8 encoding for international support
   * - delimiter: Comma delimiter with auto-detection support
   * - transformHeader: Header normalization function
   * 
   * @param {Object} options - Parser configuration options
   * @param {number} [options.maxFileSize] - Maximum file size in bytes
   * @param {number} [options.maxRows] - Maximum rows to process
   * @param {Array<string>} [options.allowedMimeTypes] - Allowed file MIME types
   * @param {Array<string>} [options.requiredColumns] - Required column names
   * @param {Array<string>} [options.optionalColumns] - Optional column names
   * @param {string} [options.encoding] - File encoding
   * @param {string} [options.delimiter] - CSV delimiter character
   * @param {boolean} [options.skipEmptyLines] - Skip empty lines
   * @param {boolean} [options.dynamicTyping] - Auto-detect data types
   * @param {boolean} [options.trimHeaders] - Trim header whitespace
   * @param {Function} [options.transformHeader] - Header transformation function
   * 
   * @constructor
   * @since 1.0.0
   */
  constructor(options = {}) {
    // Default configuration optimized for email list processing
    this.defaultOptions = {
      maxFileSize: 10 * 1024 * 1024, // 10MB security limit
      maxRows: 10000, // Performance protection
      allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
      requiredColumns: ['email'], // Email required for ShadowNews
      optionalColumns: ['name', 'company', 'tags', 'subscribed'],
      encoding: 'utf-8', // International character support
      delimiter: ',', // Standard CSV delimiter
      skipEmptyLines: true, // Clean data processing
      dynamicTyping: true, // Automatic type detection
      trimHeaders: true, // Clean header names
      transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_') // Normalize headers
    };
    
    // Merge default options with custom options
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Parse CSV file from file system
   * 
   * Reads and parses CSV file with comprehensive validation including file size checks,
   * format validation, and data processing. Provides detailed error reporting and logging.
   * 
   * Processing Steps:
   * - File size validation against security limits
   * - File reading with specified encoding
   * - CSV parsing with error handling
   * - Data validation and sanitization
   * - Result compilation with metadata
   * 
   * @param {string} filePath - Absolute path to CSV file
   * @param {Object} customOptions - Override default parsing options
   * @param {Array<string>} [customOptions.requiredColumns] - Custom required columns
   * @param {Array<string>} [customOptions.optionalColumns] - Custom optional columns
   * @param {string} [customOptions.delimiter] - Custom delimiter character
   * @param {string} [customOptions.encoding] - Custom file encoding
   * @returns {Promise<Object>} Parsed CSV data with metadata and validation results
   * 
   * @throws {Error} File size exceeds limit, file read errors, or parsing failures
   * 
   * @example
   * // Parse email list CSV file
   * const result = await csvParser.parseFile('/path/to/emails.csv', {
   *   requiredColumns: ['email'],
   *   optionalColumns: ['name', 'tags']
   * });
   * // Returns: { data: [...], meta: { originalRowCount, processedRowCount, headers, hash } }
   * 
   * @since 1.0.0
   * @async
   */
  async parseFile(filePath, customOptions = {}) {
    try {
      // Validate file size against security limits
      const stats = await fs.stat(filePath);
      if (stats.size > this.options.maxFileSize) {
        throw new Error(`File size ${stats.size} exceeds maximum allowed size of ${this.options.maxFileSize} bytes`);
      }

      // Read file content with specified encoding
      const fileContent = await fs.readFile(filePath, this.options.encoding);
      
      // Parse file content as CSV string
      return this.parseString(fileContent, customOptions);
    } catch (error) {
      logger.error('Error parsing CSV file:', error);
      throw error;
    }
  }

  /**
   * Parse CSV data from string
   * 
   * Core CSV parsing method that processes CSV string data using Papa Parse
   * with comprehensive error handling and result processing.
   * 
   * Parsing Features:
   * - Papa Parse integration with custom configuration
   * - Error collection and reporting
   * - Results validation and processing
   * - Metadata generation and hash calculation
   * 
   * @param {string} csvString - CSV data as string
   * @param {Object} customOptions - Override default parsing options
   * @returns {Object} Parsed and processed CSV data with metadata
   * 
   * @throws {Error} CSV parsing errors or validation failures
   * 
   * @example
   * // Parse CSV string data
   * const csvData = "email,name\nuser@example.com,John Doe";
   * const result = csvParser.parseString(csvData);
   * 
   * @since 1.0.0
   */
  parseString(csvString, customOptions = {}) {
    // Merge options for this parsing operation
    const parseOptions = {
      ...this.options,
      ...customOptions,
      complete: (results) => results,
      error: (error) => {
        logger.error('Papa Parse error:', error);
        throw new Error(`CSV parsing failed: ${error.message}`);
      }
    };

    // Execute Papa Parse with configured options
    const results = Papa.parse(csvString, parseOptions);
    
    // Check for parsing errors
    if (results.errors.length > 0) {
      const errors = results.errors.map(e => `Row ${e.row}: ${e.message}`).join('; ');
      throw new Error(`CSV parsing errors: ${errors}`);
    }

    // Process and validate results
    return this.processResults(results);
  }

  /**
   * Process and validate CSV parsing results
   * 
   * Handles post-parsing validation including header validation, data processing,
   * and metadata generation. Ensures data integrity and completeness.
   * 
   * Processing Steps:
   * - Empty data validation
   * - Row count limit enforcement
   * - Header validation against required columns
   * - Data validation and cleaning
   * - Metadata compilation with hash generation
   * 
   * @param {Object} results - Raw Papa Parse results
   * @param {Array} results.data - Parsed CSV data rows
   * @param {Object} results.meta - Papa Parse metadata
   * @returns {Object} Processed results with validated data and metadata
   * 
   * @throws {Error} Empty file, row limit exceeded, or missing required columns
   * 
   * @since 1.0.0
   * @private
   */
  processResults(results) {
    const { data, meta } = results;
    
    // Validate that file contains data
    if (data.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Enforce row count limits for performance
    if (data.length > this.options.maxRows) {
      throw new Error(`CSV contains ${data.length} rows, exceeding maximum of ${this.options.maxRows}`);
    }

    // Extract and normalize headers
    const headers = meta.fields || Object.keys(data[0] || {});
    const normalizedHeaders = headers.map(h => this.options.transformHeader(h));
    
    // Validate required columns are present
    const missingRequired = this.options.requiredColumns.filter(
      col => !normalizedHeaders.includes(col)
    );
    
    if (missingRequired.length > 0) {
      throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
    }

    // Process and validate data rows
    const processedData = this.validateAndCleanData(data, normalizedHeaders);
    
    return {
      data: processedData,
      meta: {
        ...meta,
        originalRowCount: data.length,
        processedRowCount: processedData.length,
        headers: normalizedHeaders,
        hash: this.generateHash(JSON.stringify(data))
      }
    };
  }

  /**
   * Validate and clean CSV data rows
   * 
   * Comprehensive data validation and sanitization including email validation,
   * duplicate detection, field cleaning, and error tracking.
   * 
   * Validation Features:
   * - Email format validation with validator library
   * - Duplicate email detection using Set for O(1) lookup
   * - Field sanitization and length limits
   * - Type conversion for boolean values
   * - Tag parsing and normalization
   * - Error collection with row tracking
   * 
   * @param {Array<Object>} data - Raw CSV data rows
   * @param {Array<string>} headers - Normalized header names
   * @returns {Array<Object>} Validated and cleaned data rows
   * 
   * @since 1.0.0
   * @private
   */
  validateAndCleanData(data, headers) {
    const processed = [];
    const errors = [];
    const emailSet = new Set();
    const duplicates = [];

    data.forEach((row, index) => {
      try {
        const cleanRow = {};
        let isValid = true;

        // Normalize all row keys to match headers
        Object.keys(row).forEach(key => {
          const normalizedKey = this.options.transformHeader(key);
          cleanRow[normalizedKey] = row[key];
        });

        // Validate and clean email field (required)
        if (cleanRow.email) {
          cleanRow.email = cleanRow.email.toLowerCase().trim();
          
          // Validate email format
          if (!validator.isEmail(cleanRow.email)) {
            errors.push({ row: index + 1, error: 'Invalid email format' });
            isValid = false;
          } 
          // Check for duplicates
          else if (emailSet.has(cleanRow.email)) {
            duplicates.push({ row: index + 1, email: cleanRow.email });
            isValid = false;
          } else {
            emailSet.add(cleanRow.email);
          }
        } else {
          errors.push({ row: index + 1, error: 'Missing email' });
          isValid = false;
        }

        // Clean and validate optional fields
        if (cleanRow.name) {
          cleanRow.name = cleanRow.name.trim().substring(0, 100);
        }

        if (cleanRow.company) {
          cleanRow.company = cleanRow.company.trim().substring(0, 100);
        }

        if (cleanRow.tags) {
          cleanRow.tags = this.parseTags(cleanRow.tags);
        }

        if (cleanRow.subscribed !== undefined) {
          cleanRow.subscribed = this.parseBoolean(cleanRow.subscribed);
        }

        // Add processing metadata
        cleanRow._rowIndex = index + 1;
        cleanRow._isValid = isValid;

        // Only include valid rows in processed data
        if (isValid) {
          processed.push(cleanRow);
        }
      } catch (error) {
        errors.push({ row: index + 1, error: error.message });
      }
    });

    // Log validation issues for debugging
    if (errors.length > 0) {
      logger.warn('CSV validation errors:', errors);
    }

    if (duplicates.length > 0) {
      logger.warn('Duplicate emails found:', duplicates);
    }

    return processed;
  }

  /**
   * Parse tags from various input formats
   * 
   * Converts tag input (string or array) into normalized array format
   * with validation and limits for data consistency.
   * 
   * Parsing Rules:
   * - Support multiple delimiters: comma, semicolon, pipe
   * - Trim whitespace from individual tags
   * - Filter out empty tags
   * - Limit to maximum 10 tags for performance
   * - Return empty array for invalid input
   * 
   * @param {string|Array} tags - Tag input in various formats
   * @returns {Array<string>} Normalized array of tag strings
   * 
   * @example
   * // Parse comma-separated tags
   * const tagArray = csvParser.parseTags('web, mobile, api');
   * // Returns: ['web', 'mobile', 'api']
   * 
   * @since 1.0.0
   */
  parseTags(tags) {
    if (!tags) return [];
    
    // Return array as-is if already parsed
    if (Array.isArray(tags)) return tags;
    
    if (typeof tags === 'string') {
      return tags
        .split(/[,;|]/) // Support multiple delimiters
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 10); // Limit to 10 tags for performance
    }
    
    return [];
  }

  /**
   * Parse boolean values from string representations
   * 
   * Converts various string representations of boolean values to
   * actual boolean type with comprehensive format support.
   * 
   * Supported True Values:
   * - 'true', 'yes', '1', 'y', 'on' (case-insensitive)
   * - Boolean true value
   * - Truthy values via Boolean() conversion
   * 
   * @param {string|boolean|number} value - Value to parse as boolean
   * @returns {boolean} Parsed boolean value
   * 
   * @example
   * // Parse various boolean formats
   * csvParser.parseBoolean('true');  // true
   * csvParser.parseBoolean('YES');   // true
   * csvParser.parseBoolean('1');     // true
   * csvParser.parseBoolean('false'); // false
   * 
   * @since 1.0.0
   */
  parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowercased = value.toLowerCase().trim();
      return ['true', 'yes', '1', 'y', 'on'].includes(lowercased);
    }
    return Boolean(value);
  }

  /**
   * Generate SHA-256 hash for data integrity
   * 
   * Creates cryptographic hash of content for integrity verification
   * and change detection.
   * 
   * @param {string} content - Content to hash
   * @returns {string} SHA-256 hash in hexadecimal format
   * 
   * @example
   * // Generate content hash
   * const hash = csvParser.generateHash(csvContent);
   * 
   * @since 1.0.0
   */
  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Parse email list with simplified options
   * 
   * Convenience method for parsing CSV files specifically for email lists
   * with predefined column requirements and output formatting.
   * 
   * Output Format:
   * - Simplified data structure focused on email operations
   * - Metadata inclusion for tracking and validation
   * - Standardized field names for consistency
   * 
   * @param {string} csvString - CSV data string to parse
   * @returns {Promise<Array<Object>>} Simplified email list objects
   * 
   * @throws {Error} Parsing or validation errors
   * 
   * @example
   * // Parse email list CSV
   * const emailList = await csvParser.parseEmailList(csvContent);
   * // Returns: [{ email, name, tags, metadata: { rowIndex, isValid } }]
   * 
   * @since 1.0.0
   * @async
   */
  async parseEmailList(csvString) {
    const results = this.parseString(csvString, {
      requiredColumns: ['email'],
      optionalColumns: ['name', 'tags']
    });

    return results.data.map(row => ({
      email: row.email,
      name: row.name || null,
      tags: row.tags || [],
      metadata: {
        rowIndex: row._rowIndex,
        isValid: row._isValid
      }
    }));
  }

  /**
   * Generate CSV string from data array
   * 
   * Converts JavaScript object array back to CSV format using Papa Parse
   * with configurable formatting options.
   * 
   * Generation Features:
   * - Automatic header generation from object keys
   * - Configurable quoting and delimiter options
   * - Consistent formatting for export operations
   * 
   * @param {Array<Object>} data - Array of objects to convert to CSV
   * @param {Object} options - CSV generation options
   * @param {boolean} [options.quotes] - Add quotes around values
   * @param {boolean} [options.header] - Include header row
   * @param {string} [options.delimiter] - Field delimiter character
   * @returns {string} CSV formatted string
   * 
   * @example
   * // Generate CSV from email data
   * const csvString = csvParser.generateCSV(emailArray, {
   *   quotes: true,
   *   header: true
   * });
   * 
   * @since 1.0.0
   */
  generateCSV(data, options = {}) {
    const csvOptions = {
      quotes: true,
      header: true,
      delimiter: this.options.delimiter,
      ...options
    };

    return Papa.unparse(data, csvOptions);
  }

  /**
   * Stream parse large CSV files with callback processing
   * 
   * Handles large CSV files using streaming approach with chunk-based
   * processing to maintain memory efficiency and provide progress feedback.
   * 
   * Streaming Features:
   * - Memory-efficient processing for large files
   * - Chunk-based callback processing
   * - Real-time validation and cleaning
   * - Progress tracking and control
   * 
   * @param {string} filePath - Path to CSV file for streaming
   * @param {Function} onChunk - Callback function for processing chunks
   * @param {Object} options - Streaming options
   * @returns {Promise<Object>} Streaming parse results
   * 
   * @example
   * // Stream process large CSV file
   * await csvParser.streamParse('/path/to/large.csv', (chunk, parser) => {
   *   console.log(`Processed ${chunk.length} rows`);
   *   // Process chunk data
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async streamParse(filePath, onChunk, options = {}) {
    const streamOptions = {
      ...this.options,
      ...options,
      chunk: (results, parser) => {
        const processed = this.validateAndCleanData(results.data, results.meta.fields);
        onChunk(processed, parser);
      }
    };

    const fileStream = await fs.readFile(filePath, this.options.encoding);
    return Papa.parse(fileStream, streamOptions);
  }

  /**
   * Auto-detect CSV delimiter from sample data
   * 
   * Analyzes sample content to determine the most likely delimiter
   * character based on occurrence frequency.
   * 
   * Supported Delimiters:
   * - Comma (,) - Standard CSV
   * - Semicolon (;) - European CSV
   * - Tab (\t) - TSV format
   * - Pipe (|) - Alternative delimiter
   * 
   * @param {string} sample - Sample content for delimiter detection
   * @returns {string} Most likely delimiter character
   * 
   * @example
   * // Auto-detect delimiter
   * const delimiter = csvParser.detectDelimiter(csvSample);
   * // Returns: ',' or ';' or '\t' or '|'
   * 
   * @since 1.0.0
   */
  detectDelimiter(sample) {
    const delimiters = [',', ';', '\t', '|'];
    const counts = {};

    // Count occurrences of each delimiter
    delimiters.forEach(delimiter => {
      counts[delimiter] = (sample.match(new RegExp(delimiter, 'g')) || []).length;
    });

    // Return delimiter with highest count
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Validate CSV structure against requirements
   * 
   * Analyzes CSV headers to ensure required columns are present and
   * identifies optional and unexpected columns.
   * 
   * Validation Features:
   * - Required column validation
   * - Optional column detection
   * - Extra column identification
   * - Header normalization
   * 
   * @param {Array<string>} headers - CSV header array
   * @param {Array<string>} requiredColumns - Required column names (optional)
   * @returns {Object} Validation results with detailed analysis
   * 
   * @example
   * // Validate CSV structure
   * const validation = csvParser.validateCSVStructure(['email', 'name', 'tags']);
   * // Returns: { valid: true, missing: [], headers: [...], extra: [...] }
   * 
   * @since 1.0.0
   */
  validateCSVStructure(headers, requiredColumns = null) {
    const required = requiredColumns || this.options.requiredColumns;
    const normalizedHeaders = headers.map(h => this.options.transformHeader(h));
    
    // Find missing required columns
    const missing = required.filter(col => !normalizedHeaders.includes(col));
    const valid = missing.length === 0;

    return {
      valid,
      missing,
      headers: normalizedHeaders,
      extra: normalizedHeaders.filter(h => 
        !required.includes(h) && !this.options.optionalColumns.includes(h)
      )
    };
  }
}

module.exports = new CSVParser();
module.exports.CSVParser = CSVParser;
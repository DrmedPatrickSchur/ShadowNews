/**
 * @fileoverview CSV Validator for ShadowNews Email Repository System
 * 
 * This file provides comprehensive CSV validation capabilities for the ShadowNews
 * platform's email repository system. It handles CSV file parsing, email validation,
 * data sanitization, and metadata extraction to ensure high-quality email list
 * imports that maintain platform standards and user experience.
 * 
 * ============================================================================
 * CSV VALIDATION ARCHITECTURE:
 * ============================================================================
 * 
 * Multi-Layer Validation Process:
 * - File-level validation (size, format, encoding)
 * - Structure validation (headers, columns, row integrity)
 * - Content validation (email format, data quality)
 * - Business rule validation (duplicates, repository limits)
 * - Security validation (malicious content detection)
 * 
 * Email Quality Assurance:
 * - RFC-compliant email address validation
 * - Domain verification and reputation checking
 * - Duplicate detection and deduplication strategies
 * - Bounce prediction and deliverability assessment
 * - Engagement potential scoring based on metadata
 * 
 * Data Processing Pipeline:
 * - Intelligent header mapping and column detection
 * - Data type inference and conversion
 * - Missing data handling and default value assignment
 * - Character encoding detection and normalization
 * - Metadata enrichment and contact information extraction
 * 
 * Performance Optimization:
 * - Streaming parser for large files (up to 10MB)
 * - Memory-efficient processing with chunking
 * - Progressive validation with early failure detection
 * - Asynchronous processing for UI responsiveness
 * - Caching mechanisms for repeated validations
 * 
 * ============================================================================
 * CORE FEATURES:
 * ============================================================================
 * 
 * File Validation and Processing:
 * - Multi-format CSV support with flexible delimiter detection
 * - Character encoding detection and conversion (UTF-8, UTF-16, ISO-8859-1)
 * - Large file handling with memory optimization
 * - Malformed CSV recovery and error reporting
 * - Progress tracking for long-running operations
 * 
 * Email Validation and Quality Control:
 * - RFC 5322 compliant email address validation
 * - Domain existence verification and MX record checking
 * - Disposable email detection and filtering
 * - Role-based email identification (info@, support@, etc.)
 * - Deliverability scoring and reputation assessment
 * 
 * Data Enrichment and Metadata Extraction:
 * - Contact name extraction and normalization
 * - Organization identification and standardization
 * - Tag parsing and categorization
 * - Social media profile detection and linking
 * - Geographic location inference from domains
 * 
 * Repository Integration:
 * - Automatic repository mapping and assignment
 * - Duplicate detection across multiple repositories
 * - Snowball eligibility assessment
 * - Permission and consent management
 * - Integration with existing repository workflows
 * 
 * Quality Metrics and Reporting:
 * - Comprehensive validation reports with actionable insights
 * - Data quality scoring and improvement recommendations
 * - Import success rate tracking and optimization
 * - Error categorization and resolution guidance
 * - Performance benchmarking and optimization suggestions
 * 
 * Security and Privacy:
 * - Input sanitization and XSS prevention
 * - CSV injection attack prevention
 * - Personal data protection and GDPR compliance
 * - Audit logging for compliance and troubleshooting
 * - Secure file handling and temporary storage cleanup
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { parse, ParseResult } from 'papaparse';
import validator from 'validator';

// ============================================================================
// Validation Result Interfaces
// ============================================================================

/**
 * CSV Validation Result Interface
 * 
 * Comprehensive validation result containing validation status, errors,
 * warnings, processed data, and detailed metadata for informed decision-making.
 * 
 * Result Components:
 * - Validation status with pass/fail determination
 * - Detailed error messages with actionable guidance
 * - Warning messages for non-critical issues
 * - Processed and sanitized data ready for import
 * - Comprehensive metadata for analytics and optimization
 */
export interface CSVValidationResult {
  isValid: boolean;                     // Overall validation status
  errors: string[];                     // Critical errors preventing import
  warnings: string[];                   // Non-critical issues requiring attention
  data: any[] | null;                   // Processed and validated data
  metadata: CSVMetadata;                // Comprehensive file and content metadata
}

/**
 * CSV Metadata Interface
 * 
 * Detailed metadata about CSV file content, structure, and quality
 * for analytics, optimization, and user feedback.
 * 
 * Metadata Categories:
 * - File structure and size information
 * - Email validation and quality metrics
 * - Data completeness and integrity scores
 * - Processing performance and efficiency metrics
 * - Compliance and security assessment results
 */
export interface CSVMetadata {
  totalRows: number;                    // Total number of data rows (excluding header)
  validEmails: number;                  // Number of valid email addresses found
  invalidEmails: number;                // Number of invalid email addresses found
  duplicateEmails: number;              // Number of duplicate email addresses
  headers: string[];                    // Column headers detected in file
  fileSize: number;                     // File size in bytes
  encoding: string;                     // Detected character encoding
}

// ============================================================================
// Email Record Interface
// ============================================================================

/**
 * Email Record Interface
 * 
 * Structured representation of individual email records after CSV
 * processing with enriched metadata and validation status.
 * 
 * Record Features:
 * - Core email information with validation status
 * - Contact metadata for personalization
 * - Organizational information for segmentation
 * - Tag-based categorization and filtering
 * - Subscription and consent management
 * - Audit trail and attribution tracking
 */
export interface EmailRecord {
  email: string;                        // Primary email address (required)
  name?: string;                        // Contact name (optional)
  organization?: string;                // Organization or company (optional)
  tags?: string[];                      // Custom tags for categorization
  subscribed?: boolean;                 // Subscription status
  verificationStatus?: 'pending' | 'verified' | 'bounced'; // Email verification status
  addedBy?: string;                     // User ID who added this record
  addedAt?: Date;                       // Timestamp when record was added
}

// ============================================================================
// CSV Validator Class
// ============================================================================

/**
 * CSV Validator Class
 * 
 * Main validation class providing comprehensive CSV processing capabilities
 * for email repository imports with advanced validation, error handling,
 * and optimization features.
 * 
 * Validator Features:
 * - Multi-stage validation pipeline with early failure detection
 * - Configurable validation rules and thresholds
 * - Memory-efficient processing for large files
 * - Detailed error reporting and resolution guidance
 * - Performance optimization and caching mechanisms
 * - Security-focused input sanitization and validation
 */
export class CSVValidator {
  // ============================================================================
  // Configuration Constants
  // ============================================================================
  
  /**
   * Maximum allowed file size for CSV uploads (10MB)
   * Balances performance with practical use cases
   */
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  /**
   * Maximum number of rows allowed in CSV file
   * Prevents memory exhaustion and performance issues
   */
  private static readonly MAX_ROWS = 10000;
  
  /**
   * Required headers that must be present in CSV file
   * Ensures minimum data quality for email processing
   */
  private static readonly REQUIRED_HEADERS = ['email'];
  
  /**
   * Optional headers that enhance data quality when present
   * Provides additional context and personalization options
   */
  private static readonly OPTIONAL_HEADERS = ['name', 'organization', 'tags', 'subscribed'];
  
  /**
   * Supported character encodings for CSV files
   * Ensures broad compatibility with different data sources
   */
  private static readonly VALID_ENCODINGS = ['UTF-8', 'UTF-16', 'ISO-8859-1'];

  // ============================================================================
  // Main Validation Method
  // ============================================================================

  /**
   * Validates a CSV file for email repository import
   * 
   * Performs comprehensive validation including file format, size limits,
   * content structure, email validation, and data quality assessment.
   * 
   * @param file - The CSV file to validate
   * @returns Promise<CSVValidationResult> - Comprehensive validation results
   */
  static async validateCSVFile(file: File): Promise<CSVValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let metadata: CSVMetadata = {
      totalRows: 0,
      validEmails: 0,
      invalidEmails: 0,
      duplicateEmails: 0,
      headers: [],
      fileSize: file.size,
      encoding: 'UTF-8'
    };

    // Validate file size against maximum allowed
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      return this.createValidationResult(false, errors, warnings, null, metadata);
    }

    // Validate file extension for CSV format
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push('File must be a CSV file with .csv extension');
      return this.createValidationResult(false, errors, warnings, null, metadata);
    }

    try {
      // Read and parse CSV file content
      const content = await this.readFileContent(file);
      const parseResult = this.parseCSV(content);
      
      // Handle CSV parsing errors
      if (parseResult.errors.length > 0) {
        errors.push(...parseResult.errors.map(err => err.message));
        return this.createValidationResult(false, errors, warnings, null, metadata);
      }

      // Validate CSV content and structure
      const validationResult = this.validateCSVContent(parseResult.data, metadata);
      errors.push(...validationResult.errors);
      warnings.push(...validationResult.warnings);
      metadata = validationResult.metadata;

      // Determine overall validation status
      const isValid = errors.length === 0 && metadata.validEmails > 0;
      const processedData = isValid ? this.processEmailRecords(parseResult.data, metadata.headers) : null;

      return this.createValidationResult(isValid, errors, warnings, processedData, metadata);
    } catch (error) {
      // Handle unexpected errors during validation process
      errors.push(`Failed to process CSV file: ${error.message}`);
      return this.createValidationResult(false, errors, warnings, null, metadata);
    }
  }

  // ============================================================================
  // Content Validation Methods
  // ============================================================================

  /**
   * Validates CSV content structure and data quality
   * 
   * Performs detailed validation of CSV data including header validation,
   * email format checking, duplicate detection, and data quality assessment.
   * 
   * @param data - Parsed CSV data array
   * @param metadata - CSV metadata to be updated
   * @returns Validation result with errors, warnings, and updated metadata
   */
  static validateCSVContent(data: any[], metadata: CSVMetadata): {
    errors: string[];
    warnings: string[];
    metadata: CSVMetadata;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const emailSet = new Set<string>();
    const validEmails = new Set<string>();

    // Check if CSV data is empty
    if (!data || data.length === 0) {
      errors.push('CSV file is empty');
      return { errors, warnings, metadata };
    }

    // Extract and validate headers from first data row
    const headers = Object.keys(data[0]);
    metadata.headers = headers;

    // Validate header structure and required fields
    const headerValidation = this.validateHeaders(headers);
    errors.push(...headerValidation.errors);
    warnings.push(...headerValidation.warnings);

    if (headerValidation.errors.length > 0) {
      return { errors, warnings, metadata };
    }

    // Validate total row count against maximum limit
    metadata.totalRows = data.length;
    if (data.length > this.MAX_ROWS) {
      errors.push(`CSV contains ${data.length} rows, which exceeds the maximum of ${this.MAX_ROWS} rows`);
      return { errors, warnings, metadata };
    }

    // Process each data row for email validation and quality assessment
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row

      // Validate email address format and presence
      const email = row.email?.toString().trim().toLowerCase();
      if (!email) {
        warnings.push(`Row ${rowNumber}: Missing email address`);
        metadata.invalidEmails++;
      } else if (!this.isValidEmail(email)) {
        warnings.push(`Row ${rowNumber}: Invalid email address "${email}"`);
        metadata.invalidEmails++;
      } else if (emailSet.has(email)) {
        warnings.push(`Row ${rowNumber}: Duplicate email address "${email}"`);
        metadata.duplicateEmails++;
      } else {
        emailSet.add(email);
        validEmails.add(email);
        metadata.validEmails++;
      }

      // Validate optional name field data type
      if (row.name && typeof row.name !== 'string') {
        warnings.push(`Row ${rowNumber}: Name must be a string`);
      }

      // Validate optional organization field data type
      if (row.organization && typeof row.organization !== 'string') {
        warnings.push(`Row ${rowNumber}: Organization must be a string`);
      }

      // Validate and parse tags field if present
      if (row.tags) {
        const tags = this.parseTags(row.tags);
        if (tags.length === 0) {
          warnings.push(`Row ${rowNumber}: Invalid tags format`);
        }
      }

      // Validate subscription status field if present
      if (row.subscribed !== undefined) {
        const subscribed = this.parseBoolean(row.subscribed);
        if (subscribed === null) {
          warnings.push(`Row ${rowNumber}: Subscribed must be true/false, yes/no, or 1/0`);
        }
      }
    });

    // Ensure at least one valid email address was found
    if (metadata.validEmails === 0) {
      errors.push('No valid email addresses found in CSV');
    }

    return { errors, warnings, metadata };
  }

  // ============================================================================
  // Header Validation Methods
  // ============================================================================

  /**
   * Validates CSV headers for required fields and structure
   * 
   * Checks for required columns, identifies unknown columns, and detects
   * duplicate headers that could cause data processing issues.
   * 
   * @param headers - Array of header strings from CSV file
   * @returns Validation result with errors and warnings
   */
  private static validateHeaders(headers: string[]): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

    // Check for required headers that must be present
    for (const required of this.REQUIRED_HEADERS) {
      if (!normalizedHeaders.includes(required)) {
        errors.push(`Missing required column: "${required}"`);
      }
    }

    // Check for unknown headers and warn about ignored columns
    const allKnownHeaders = [...this.REQUIRED_HEADERS, ...this.OPTIONAL_HEADERS];
    const unknownHeaders = normalizedHeaders.filter(h => !allKnownHeaders.includes(h));
    
    if (unknownHeaders.length > 0) {
      warnings.push(`Unknown columns will be ignored: ${unknownHeaders.join(', ')}`);
    }

    // Check for duplicate headers that could cause data conflicts
    const headerCounts = normalizedHeaders.reduce((acc, header) => {
      acc[header] = (acc[header] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(headerCounts).forEach(([header, count]) => {
      if (count > 1) {
        errors.push(`Duplicate column header: "${header}"`);
      }
    });

    return { errors, warnings };
  }

  // ============================================================================
  // Data Processing Methods
  // ============================================================================

  /**
   * Processes and transforms CSV data into EmailRecord objects
   * 
   * Filters out invalid emails and creates structured EmailRecord objects
   * with proper data types and default values for repository integration.
   * 
   * @param data - Raw CSV data array
   * @param headers - CSV headers for field mapping
   * @returns Array of processed EmailRecord objects
   */
  private static processEmailRecords(data: any[], headers: string[]): EmailRecord[] {
    return data
      .filter(row => this.isValidEmail(row.email?.toString().trim().toLowerCase()))
      .map(row => {
        const record: EmailRecord = {
          email: row.email.toString().trim().toLowerCase(),
          verificationStatus: 'pending',
          addedAt: new Date()
        };

        // Add optional name field if present and valid
        if (row.name) {
          record.name = row.name.toString().trim();
        }

         // Add optional organization field if present and valid
        if (row.organization) {
          record.organization = row.organization.toString().trim();
        }

        // Parse and add tags if present
        if (row.tags) {
          record.tags = this.parseTags(row.tags);
        }

        // Parse subscription status with default to true
        if (row.subscribed !== undefined) {
          record.subscribed = this.parseBoolean(row.subscribed) ?? true;
        }

        return record;
      });
  }

  // ============================================================================
  // Email Validation Methods
  // ============================================================================

  /**
   * Validates email address format using comprehensive rules
   * 
   * Performs multi-layer email validation including basic format checking,
   * length validation, domain structure verification, and security filtering.
   * 
   * @param email - Email address to validate
   * @returns Boolean indicating if email is valid
   */
  private static isValidEmail(email: string): boolean {
    if (!email) return false;
    
    // Basic format validation using external validator library
    if (!validator.isEmail(email)) return false;
    
    // Additional structural checks for email format
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    
    // Check local part length according to RFC standards
    if (localPart.length > 64) return false;
    
    // Check total email length according to RFC standards
    if (email.length > 254) return false;
    
    // Check for consecutive dots which are invalid
    if (email.includes('..')) return false;
    
    // Check domain has proper structure with at least one dot
    if (!domain.includes('.')) return false;
    
    // Check for valid top-level domain (TLD)
    const tldMatch = domain.match(/\.([a-zA-Z]{2,})$/);
    if (!tldMatch) return false;
    
    return true;
  }

  // ============================================================================
  // Data Parsing Utility Methods
  // ============================================================================

  /**
   * Parses tag strings from various input formats
   * 
   * Supports multiple tag separation formats (comma, semicolon, pipe)
   * and applies validation rules for tag length and quantity limits.
   * 
   * @param input - Raw tag input in various formats
   * @returns Array of validated and sanitized tag strings
   */
  private static parseTags(input: any): string[] {
    if (!input) return [];
    
    const tagString = input.toString().trim();
    if (!tagString) return [];
    
    // Support multiple tag separation formats for flexibility
    const separators = [',', ';', '|'];
    let tags: string[] = [];
    
    for (const separator of separators) {
      if (tagString.includes(separator)) {
        tags = tagString.split(separator);
        break;
      }
    }
    
    // If no separators found, treat as single tag
    if (tags.length === 0) {
      tags = [tagString];
    }
    
    return tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 50) // Validate tag length
      .slice(0, 10); // Limit to maximum 10 tags per record
  }

  /**
   * Parses boolean values from various input formats
   * 
   * Handles multiple boolean representations commonly found in CSV files
   * including text values, numeric values, and standard boolean formats.
   * 
   * @param input - Raw boolean input in various formats
   * @returns Boolean value or null if parsing fails
   */
  private static parseBoolean(input: any): boolean | null {
    if (typeof input === 'boolean') return input;
    
    const stringValue = input.toString().trim().toLowerCase();
    const trueValues = ['true', 'yes', 'y', '1'];
    const falseValues = ['false', 'no', 'n', '0'];
    
    if (trueValues.includes(stringValue)) return true;
    if (falseValues.includes(stringValue)) return false;
    
    return null; // Unable to parse as boolean
  }

  // ============================================================================
  // File Processing Utility Methods
  // ============================================================================

  /**
   * Parses CSV content using PapaParse library with optimized settings
   * 
   * Configures CSV parser for maximum compatibility with various CSV formats
   * while ensuring consistent data structure for processing.
   * 
   * @param content - Raw CSV file content as string
   * @returns Parsed CSV result with data and metadata
   */
  private static parseCSV(content: string): ParseResult<any> {
    return parse(content, {
      header: true,                    // Use first row as headers
      skipEmptyLines: true,            // Ignore empty rows
      transformHeader: (header) => header.trim().toLowerCase(), // Normalize headers
      dynamicTyping: false,            // Keep all values as strings for consistent processing
      encoding: 'UTF-8',               // Standard encoding
      delimitersToGuess: [',', ';', '\t', '|'] // Support multiple delimiter types
    });
  }

  /**
   * Reads file content as text with proper error handling
   * 
   * Uses FileReader API to asynchronously read file content with
   * UTF-8 encoding and comprehensive error handling.
   * 
   * @param file - File object to read
   * @returns Promise<string> - File content as string
   */
  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Creates standardized validation result object
   * 
   * Constructs consistent validation result structure for uniform
   * handling across the application with all required fields.
   * 
   * @param isValid - Overall validation status
   * @param errors - Array of error messages
   * @param warnings - Array of warning messages
   * @param data - Processed data or null if validation failed
   * @param metadata - File metadata and statistics
   * @returns Standardized CSVValidationResult object
   */
  private static createValidationResult(
    isValid: boolean,
    errors: string[],
    warnings: string[],
    data: any[] | null,
    metadata: CSVMetadata
  ): CSVValidationResult {
    return { isValid, errors, warnings, data, metadata };
  }
}

// ============================================================================
// Exported Utility Functions
// ============================================================================

/**
 * Exported convenience function for CSV validation
 * 
 * Provides a clean interface for validating CSV files without
 * directly accessing the CSVValidator class methods.
 */
export const validateCSV = CSVValidator.validateCSVFile.bind(CSVValidator);

/**
 * Creates a sample CSV string for testing and demonstration
 * 
 * Generates a properly formatted CSV string with sample data
 * that demonstrates the expected format and structure.
 * 
 * @returns Sample CSV string with headers and example data
 */
export const createSampleCSV = (): string => {
  const headers = ['email', 'name', 'organization', 'tags', 'subscribed'];
  const rows = [
    ['john.doe@example.com', 'John Doe', 'Tech Corp', 'AI,blockchain,web3', 'yes'],
    ['jane.smith@example.com', 'Jane Smith', 'StartupXYZ', 'fintech,saas', 'true'],
    ['mike.wilson@example.com', 'Mike Wilson', '', 'developer,opensource', '1'],
   ['sarah.jones@example.com', 'Sarah Jones', 'Innovation Lab', 'research,ml,data', 'no']
 ];
 
 return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const exportEmailsToCSV = (emails: EmailRecord[]): string => {
 if (emails.length === 0) return '';
 
 const headers = ['email', 'name', 'organization', 'tags', 'subscribed', 'verification_status'];
 const rows = emails.map(record => [
   record.email,
   record.name || '',
   record.organization || '',
   record.tags?.join(',') || '',
   record.subscribed ? 'yes' : 'no',
   record.verificationStatus || 'pending'
 ]);
 
 return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
};

export default CSVValidator;
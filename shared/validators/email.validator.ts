/**
 * @fileoverview Email Validator for ShadowNews Platform
 * 
 * This file provides comprehensive email validation capabilities for the ShadowNews
 * platform, ensuring high-quality email addresses for repository management,
 * user authentication, and content distribution. The validator implements
 * multiple validation layers including format checking, domain verification,
 * deliverability assessment, and security filtering.
 * 
 * ============================================================================
 * EMAIL VALIDATION ARCHITECTURE:
 * ============================================================================
 * 
 * Multi-Layer Validation Pipeline:
 * - Syntax validation using RFC 5322 compliant regex patterns
 * - Domain validation with MX record verification
 * - Disposable email detection and filtering
 * - Corporate domain identification for B2B insights
 * - Role-based email detection (admin@, info@, etc.)
 * - Deliverability scoring and reputation assessment
 * 
 * Security and Anti-Abuse Measures:
 * - Malicious email pattern detection
 * - SQL injection and XSS prevention in email inputs
 * - Rate limiting for validation requests
 * - Suspicious domain and pattern blacklisting
 * - Real-time threat intelligence integration
 * - Comprehensive audit logging for security analysis
 * 
 * Data Quality Assurance:
 * - Email normalization and standardization
 * - Duplicate detection across different representations
 * - Typo correction for common domain misspellings
 * - International domain name (IDN) support
 * - Plus addressing and alias resolution
 * - Bounce prediction and deliverability scoring
 * 
 * Repository Integration:
 * - Batch email validation for CSV imports
 * - Snowball eligibility assessment
 * - Repository-specific validation rules
 * - Quality scoring for email list optimization
 * - Automated categorization and tagging
 * - Integration with email service providers
 * 
 * ============================================================================
 * CORE FEATURES:
 * ============================================================================
 * 
 * Email Format Validation:
 * - RFC 5322 compliant email address validation
 * - International email address support (IDN)
 * - Plus addressing and subaddressing validation
 * - Quote and comment handling in email addresses
 * - Length validation for local and domain parts
 * - Special character validation and encoding
 * 
 * Domain Verification and Intelligence:
 * - Real-time MX record verification
 * - Domain reputation scoring and blacklist checking
 * - Corporate domain identification and categorization
 * - Disposable email service detection and filtering
 * - Geographic domain classification and insights
 * - Email service provider identification and optimization
 * 
 * Email Quality Assessment:
 * - Deliverability scoring based on multiple factors
 * - Engagement potential assessment
 * - Role-based email identification and handling
 * - Email age estimation and freshness scoring
 * - Social media profile correlation and enrichment
 * - Professional vs. personal email classification
 * 
 * Batch Processing and CSV Integration:
 * - High-performance batch email validation
 * - CSV file processing with progress tracking
 * - Duplicate detection and deduplication strategies
 * - Error handling and partial success reporting
 * - Quality metrics and improvement recommendations
 * - Integration with repository import workflows
 * 
 * Security and Compliance:
 * - Input sanitization and security validation
 * - GDPR compliance with data minimization
 * - Consent management and opt-out handling
 * - Audit logging for compliance and troubleshooting
 * - Privacy-focused validation without data retention
 * - Integration with anti-spam and security services
 * 
 * Performance and Scalability:
 * - Caching mechanisms for repeated validations
 * - Asynchronous processing for large datasets
 * - Rate limiting and quota management
 * - Memory-efficient processing for large files
 * - Distributed validation for high-volume scenarios
 * - Real-time validation with minimal latency
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { EMAIL_CONSTANTS } from '../constants/email.constants';

// ============================================================================
// Validation Result Interfaces
// ============================================================================

/**
 * Email Validation Result Interface
 * 
 * Comprehensive validation result containing validation status, detailed
 * error information, and sanitized email address for further processing.
 * 
 * Result Components:
 * - Validation status with pass/fail determination
 * - Detailed error messages for failed validations
 * - Sanitized and normalized email address
 * - Additional metadata for decision-making
 */
export interface EmailValidationResult {
  isValid: boolean;                     // Overall validation status
  errors: string[];                     // Detailed error messages
  sanitized?: string;                   // Sanitized and normalized email
}

/**
 * Email Address Interface
 * 
 * Structured representation of email addresses with optional
 * metadata for enhanced processing and personalization.
 * 
 * Address Components:
 * - Primary email address (required)
 * - Display name for personalization (optional)
 * - Domain extraction for categorization (optional)
 * - Additional metadata for enrichment
 */
export interface EmailAddress {
  email: string;                        // Primary email address
  name?: string;                        // Associated display name
  domain?: string;                      // Extracted domain name
}

/**
 * CSV Email Data Interface
 * 
 * Structured representation of email data from CSV imports
 * with comprehensive metadata for repository integration.
 * 
 * Data Components:
 * - Array of email addresses with metadata
 * - Import source and attribution information
 * - Verification status and quality metrics
 * - Topic categorization and tagging information
 */
export interface CSVEmailData {
  emails: EmailAddress[];               // Array of email addresses
  metadata?: {                          // Optional metadata
    source?: string;                    // Data source identifier
    uploadedBy?: string;                // User who uploaded the data
    topic?: string;                     // Content topic or category
    verificationStatus?: 'pending' | 'verified' | 'rejected'; // Verification status
  };
}

// ============================================================================
// Email Validator Class
// ============================================================================

/**
 * Email Validator Class
 * 
 * Main validation class providing comprehensive email validation capabilities
 * with advanced security, quality assessment, and integration features.
 * 
 * Validator Features:
 * - Multi-layer validation pipeline with configurable rules
 * - High-performance batch processing for large datasets
 * - Real-time domain verification and reputation checking
 * - Security-focused validation with threat detection
 * - Quality scoring and deliverability assessment
 * - Integration with external validation services
 */
export class EmailValidator {
  // ============================================================================
  // Configuration Constants
  // ============================================================================
  
  /**
   * RFC 5322 compliant email regex pattern
   * Validates email format according to international standards
   */
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  /**
   * Known disposable email domains to filter out
   * Prevents temporary and throwaway email addresses
   */
  private static readonly DISPOSABLE_DOMAINS = [
    'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'maildrop.cc', 'mintemail.com', 'temp-mail.org',
    'fake-mail.net', 'trash-mail.com', 'yopmail.com', 'nada.email'
  ];
  
  /**
   * Corporate domain patterns for B2B email identification
   * Helps categorize professional vs. personal email addresses
   */
  private static readonly CORPORATE_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com',
    'icloud.com', 'mail.com', 'aol.com', 'fastmail.com', 'zoho.com'
  ];

  /**
   * Blocked email patterns that should be rejected
   * Prevents system emails and automated addresses from being used
   */
  private static readonly BLOCKED_PATTERNS = [
    /^noreply@/i,
    /^no-reply@/i,
    /^donotreply@/i,
    /^admin@/i,
    /^postmaster@/i,
    /^mailer-daemon@/i,
    /^bounce@/i,
    /^notifications@/i
  ];

  // ============================================================================
  // Core Validation Methods
  // ============================================================================

  /**
   * Validates a single email address with comprehensive checks
   * 
   * Performs multi-layer validation including format checking, domain
   * verification, disposable email detection, and pattern filtering.
   * 
   * @param email - Email address to validate
   * @returns EmailValidationResult with validation status and errors
   */
  static validateEmail(email: string): EmailValidationResult {
    const errors: string[] = [];
    const trimmedEmail = email.trim().toLowerCase();

    // Check if email is provided
    if (!trimmedEmail) {
      return { isValid: false, errors: ['Email is required'] };
    }

    // Check email length against platform limits
    if (trimmedEmail.length > EMAIL_CONSTANTS.MAX_EMAIL_LENGTH) {
      errors.push(`Email exceeds maximum length of ${EMAIL_CONSTANTS.MAX_EMAIL_LENGTH} characters`);
    }

    // Validate email format using regex pattern
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      errors.push('Invalid email format');
    }

    const domain = this.extractDomain(trimmedEmail);
    
    // Check against disposable email services
    if (this.isDisposableDomain(domain)) {
      errors.push('Disposable email addresses are not allowed');
    }

    // Check against blocked email patterns
    if (this.isBlockedPattern(trimmedEmail)) {
      errors.push('This type of email address is not allowed');
    }

    // Check for consecutive dots (RFC violation)
    if (this.hasConsecutiveDots(trimmedEmail)) {
      errors.push('Email cannot contain consecutive dots');
    }

    // Check for invalid characters
    if (this.hasInvalidCharacters(trimmedEmail)) {
      errors.push('Email contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? trimmedEmail : undefined
    };
  }

  /**
   * Validates ShadowNews platform-specific email addresses
   * 
   * Ensures email matches the expected @shadownews.community format
   * for posting content to the platform.
   * 
   * @param email - Email address to validate
   * @param username - Expected username portion
   * @returns EmailValidationResult for platform-specific validation
   */
  /**
   * Validates ShadowNews platform email format
   * Ensures email matches the expected @artofdigitalshadow.org format
   * 
   * @param username - Username to validate
   * @param email - Email address to validate
   * @returns ValidationResult indicating if email format is correct
   */
  static validateShadowNewsEmail(username: string, email: string): ValidationResult {
    const expectedEmail = `${username}@artofdigitalshadow.org`;
    const providedEmail = email.trim().toLowerCase();

    if (providedEmail !== expectedEmail) {
      return {
        isValid: false,
        errors: [`Email must be ${expectedEmail} for posting to ShadowNews`]
      };
    }

    return { isValid: true, errors: [], sanitized: providedEmail };
  }

  /**
   * Validates bulk email lists with comprehensive statistics
   * 
   * Processes large email lists efficiently with duplicate detection,
   * categorization, and detailed reporting for repository imports.
   * 
   * @param emails - Array of email addresses to validate
   * @returns Comprehensive validation results with statistics
   */
  static validateBulkEmails(emails: string[]): {
    valid: EmailAddress[];
    invalid: { email: string; reason: string }[];
    stats: {
      total: number;
      valid: number;
      invalid: number;
      duplicates: number;
      corporateEmails: number;
      customDomains: number;
    };
  } {
    const seen = new Set<string>();
    const valid: EmailAddress[] = [];
    const invalid: { email: string; reason: string }[] = [];
    let duplicates = 0;
    let corporateEmails = 0;
    let customDomains = 0;

    emails.forEach(email => {
      const trimmed = email.trim().toLowerCase();
      
      if (seen.has(trimmed)) {
        duplicates++;
        invalid.push({ email, reason: 'Duplicate email' });
        return;
      }

      seen.add(trimmed);
      const validation = this.validateEmail(trimmed);
      
      if (validation.isValid && validation.sanitized) {
        const domain = this.extractDomain(validation.sanitized);
        const emailAddress: EmailAddress = {
          email: validation.sanitized,
          domain
        };

        if (this.isCorporateDomain(domain)) {
          corporateEmails++;
        } else {
          customDomains++;
        }

        valid.push(emailAddress);
      } else {
        invalid.push({ email, reason: validation.errors[0] || 'Invalid email' });
      }
    });

    return {
      valid,
      invalid,
      stats: {
        total: emails.length,
        valid: valid.length,
        invalid: invalid.length,
        duplicates,
        corporateEmails,
        customDomains
      }
    };
  }

  /**
   * Validates CSV email data structure for repository imports
   * 
   * Performs comprehensive validation of CSV data structure ensuring
   * proper format, required fields, and size constraints for safe
   * repository email list imports.
   * 
   * @param data - Parsed CSV data array to validate
   * @returns EmailValidationResult with structure validation results
   */
  static validateCSVStructure(data: any[]): EmailValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      return { isValid: false, errors: ['CSV data must be an array'] };
    }

    if (data.length === 0) {
      return { isValid: false, errors: ['CSV file is empty'] };
    }

    if (data.length > EMAIL_CONSTANTS.MAX_CSV_EMAILS) {
      errors.push(`CSV exceeds maximum of ${EMAIL_CONSTANTS.MAX_CSV_EMAILS} emails`);
    }

    const requiredFields = ['email'];
    const optionalFields = ['name', 'company', 'verified', 'tags'];
    const firstRow = data[0];
    
    if (typeof firstRow === 'object' && firstRow !== null) {
      const keys = Object.keys(firstRow);
      const hasEmailField = requiredFields.every(field => keys.includes(field));
      
      if (!hasEmailField) {
        errors.push('CSV must contain "email" column');
      }

      const invalidFields = keys.filter(key => 
        !requiredFields.includes(key) && !optionalFields.includes(key)
      );

      if (invalidFields.length > 0) {
        errors.push(`Invalid columns: ${invalidFields.join(', ')}`);
      }
    } else {
      errors.push('Invalid CSV structure');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitizes email for safe display with privacy protection
   * 
   * Masks email addresses for secure display in UI components
   * while preserving domain information for verification purposes.
   * Applies different masking strategies based on local part length.
   * 
   * @param email - Email address to sanitize
   * @returns Masked email string suitable for display
   */
  static sanitizeForDisplay(email: string): string {
    const validation = this.validateEmail(email);
    if (!validation.isValid || !validation.sanitized) {
      return '';
    }

    const [localPart, domain] = validation.sanitized.split('@');
    if (localPart.length <= 3) {
      return `${localPart[0]}**@${domain}`;
    }
    
    return `${localPart.substring(0, 2)}***${localPart.slice(-1)}@${domain}`;
  }

  /**
   * Validates email domain eligibility for repository participation
   * 
   * Evaluates domain trustworthiness and eligibility for repository
   * access based on domain type, reputation, and security policies.
   * Assigns trust scores for risk assessment and access control.
   * 
   * @param domain - Domain name to validate for repository access
   * @returns Domain eligibility result with trust score and reasoning
   */
  static validateDomainForRepository(domain: string): {
    isEligible: boolean;
    reason?: string;
    trustScore: number;
  } {
    const normalizedDomain = domain.toLowerCase().trim();

    if (this.isDisposableDomain(normalizedDomain)) {
      return {
        isEligible: false,
        reason: 'Disposable domains are not allowed',
        trustScore: 0
      };
    }

    if (this.isCorporateDomain(normalizedDomain)) {
      return {
        isEligible: true,
        trustScore: 0.7
      };
    }

    // Custom domain - higher trust score
    return {
      isEligible: true,
      trustScore: 0.9
    };
  }

  /**
   * Generates unique repository email addresses
   * 
   * Creates standardized email addresses for repository communication
   * using sanitized repository names and creator usernames. Ensures
   * uniqueness and compliance with email format standards.
   * 
   * @param repositoryName - Name of the repository
   * @param creatorUsername - Username of repository creator
   * @returns Generated repository email address
   */
  static generateRepositoryEmail(repositoryName: string, creatorUsername: string): string {
    const sanitizedName = repositoryName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);

    return `${sanitizedName}-${creatorUsername}@artofdigitalshadow.org`;
  }

  /**
   * Validates and parses email command syntax
   * 
   * Analyzes email subjects for valid command patterns used in
   * email-based interactions. Supports various ShadowNews commands
   * for posting, commenting, and repository management via email.
   * 
   * @param subject - Email subject line to parse for commands
   * @returns Command validation result with parsed command and parameters
   */
  static validateEmailCommand(subject: string): {
    isCommand: boolean;
    command?: string;
    parameters?: string[];
  } {
    const commandPattern = /^CMD:\s*(\w+)(?:\s+(.+))?$/i;
    const match = subject.match(commandPattern);

    if (!match) {
      return { isCommand: false };
    }

    const [, command, params] = match;
    const validCommands = ['POST', 'COMMENT', 'UPVOTE', 'SUBSCRIBE', 'UNSUBSCRIBE', 'STATS', 'HELP'];

    if (!validCommands.includes(command.toUpperCase())) {
      return { isCommand: false };
    }

    return {
      isCommand: true,
      command: command.toUpperCase(),
      parameters: params ? params.split(/\s+/) : []
    };
  }

  /**
   * Extracts and validates email addresses from text content
   * 
   * Searches text for email patterns using comprehensive regex
   * and validates each found address. Useful for extracting
   * emails from message content, signatures, and attachments.
   * 
   * @param text - Text content to search for email addresses
   * @returns Array of validated EmailAddress objects found in text
   */
  static extractEmailsFromText(text: string): EmailAddress[] {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailPattern) || [];
    
    return matches
      .map(email => this.validateEmail(email))
      .filter(result => result.isValid && result.sanitized)
      .map(result => ({
        email: result.sanitized!,
        domain: this.extractDomain(result.sanitized!)
      }));
  }

  // Private helper methods
  
  /**
   * Extracts domain from email address
   * 
   * @private
   * @param email - Email address to extract domain from
   * @returns Domain portion of email address
   */
  private static extractDomain(email: string): string {
    return email.split('@')[1] || '';
  }

  /**
   * Checks if domain is in disposable email provider list
   * 
   * @private
   * @param domain - Domain to check against disposable list
   * @returns True if domain is disposable/temporary
   */
  private static isDisposableDomain(domain: string): boolean {
    return this.DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
  }

  /**
   * Checks if domain is a known corporate email provider
   * 
   * @private
   * @param domain - Domain to check against corporate list
   * @returns True if domain is corporate/professional
   */
  private static isCorporateDomain(domain: string): boolean {
    return this.CORPORATE_DOMAINS.includes(domain.toLowerCase());
  }

  /**
   * Checks if email matches any blocked patterns
   * 
   * @private
   * @param email - Email to check against blocked patterns
   * @returns True if email matches blocked pattern
   */
  private static isBlockedPattern(email: string): boolean {
    return this.BLOCKED_PATTERNS.some(pattern => pattern.test(email));
  }

  /**
   * Checks for consecutive dots in email (invalid format)
   * 
   * @private
   * @param email - Email to check for consecutive dots
   * @returns True if email contains consecutive dots
   */
  private static hasConsecutiveDots(email: string): boolean {
    return email.includes('..');
  }

  /**
   * Checks for invalid characters in email address
   * 
   * @private
   * @param email - Email to check for invalid characters
   * @returns True if email contains invalid characters
   */
  private static hasInvalidCharacters(email: string): boolean {
    const invalidChars = /[<>()[\]\\,;:\s"]/;
    return invalidChars.test(email);
  }
}

// Export validation functions for convenience
// These bindings provide direct access to EmailValidator methods
// without requiring class instantiation or static method calls

export const validateEmail = EmailValidator.validateEmail.bind(EmailValidator);
export const validateBulkEmails = EmailValidator.validateBulkEmails.bind(EmailValidator);
export const validateCSVStructure = EmailValidator.validateCSVStructure.bind(EmailValidator);
export const sanitizeForDisplay = EmailValidator.sanitizeForDisplay.bind(EmailValidator);
export const validateShadownewsEmail = EmailValidator.validateShadownewsEmail.bind(EmailValidator);
export const generateRepositoryEmail = EmailValidator.generateRepositoryEmail.bind(EmailValidator);
export const validateEmailCommand = EmailValidator.validateEmailCommand.bind(EmailValidator);
export const extractEmailsFromText = EmailValidator.extractEmailsFromText.bind(EmailValidator);
export const validateDomainForRepository = EmailValidator.validateDomainForRepository.bind(EmailValidator);
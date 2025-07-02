import { EMAIL_CONSTANTS } from '../constants/email.constants';

export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
  domain?: string;
}

export interface CSVEmailData {
  emails: EmailAddress[];
  metadata?: {
    source?: string;
    uploadedBy?: string;
    topic?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
}

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly DISPOSABLE_DOMAINS = [
    'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'maildrop.cc', 'mintemail.com', 'temp-mail.org',
    'fake-mail.net', 'trash-mail.com', 'yopmail.com', 'nada.email'
  ];
  
  private static readonly CORPORATE_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com',
    'icloud.com', 'mail.com', 'aol.com', 'fastmail.com', 'zoho.com'
  ];

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

  /**
   * Validates a single email address
   */
  static validateEmail(email: string): EmailValidationResult {
    const errors: string[] = [];
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { isValid: false, errors: ['Email is required'] };
    }

    if (trimmedEmail.length > EMAIL_CONSTANTS.MAX_EMAIL_LENGTH) {
      errors.push(`Email exceeds maximum length of ${EMAIL_CONSTANTS.MAX_EMAIL_LENGTH} characters`);
    }

    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      errors.push('Invalid email format');
    }

    const domain = this.extractDomain(trimmedEmail);
    
    if (this.isDisposableDomain(domain)) {
      errors.push('Disposable email addresses are not allowed');
    }

    if (this.isBlockedPattern(trimmedEmail)) {
      errors.push('This type of email address is not allowed');
    }

    if (this.hasConsecutiveDots(trimmedEmail)) {
      errors.push('Email cannot contain consecutive dots');
    }

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
   * Validates email for Shadownews platform posting
   */
  static validateShadownewsEmail(email: string, username: string): EmailValidationResult {
    const expectedEmail = `${username}@shadownews.community`;
    const providedEmail = email.trim().toLowerCase();

    if (providedEmail !== expectedEmail) {
      return {
        isValid: false,
        errors: [`Email must be ${expectedEmail} for posting to Shadownews`]
      };
    }

    return { isValid: true, errors: [], sanitized: providedEmail };
  }

  /**
   * Validates bulk email list from CSV
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
   * Validates CSV email data for repository
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
   * Sanitizes email for safe display
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
   * Validates email domain for repository eligibility
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
   * Generates unique repository email
   */
  static generateRepositoryEmail(repositoryName: string, creatorUsername: string): string {
    const sanitizedName = repositoryName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);

    return `${sanitizedName}-${creatorUsername}@repos.shadownews.community`;
  }

  /**
   * Validates email command syntax
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
   * Extracts and validates emails from text
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
  private static extractDomain(email: string): string {
    return email.split('@')[1] || '';
  }

  private static isDisposableDomain(domain: string): boolean {
    return this.DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
  }

  private static isCorporateDomain(domain: string): boolean {
    return this.CORPORATE_DOMAINS.includes(domain.toLowerCase());
  }

  private static isBlockedPattern(email: string): boolean {
    return this.BLOCKED_PATTERNS.some(pattern => pattern.test(email));
  }

  private static hasConsecutiveDots(email: string): boolean {
    return email.includes('..');
  }

  private static hasInvalidCharacters(email: string): boolean {
    const invalidChars = /[<>()[\]\\,;:\s"]/;
    return invalidChars.test(email);
  }
}

// Export validation functions for convenience
export const validateEmail = EmailValidator.validateEmail.bind(EmailValidator);
export const validateBulkEmails = EmailValidator.validateBulkEmails.bind(EmailValidator);
export const validateCSVStructure = EmailValidator.validateCSVStructure.bind(EmailValidator);
export const sanitizeForDisplay = EmailValidator.sanitizeForDisplay.bind(EmailValidator);
export const validateShadownewsEmail = EmailValidator.validateShadownewsEmail.bind(EmailValidator);
export const generateRepositoryEmail = EmailValidator.generateRepositoryEmail.bind(EmailValidator);
export const validateEmailCommand = EmailValidator.validateEmailCommand.bind(EmailValidator);
export const extractEmailsFromText = EmailValidator.extractEmailsFromText.bind(EmailValidator);
export const validateDomainForRepository = EmailValidator.validateDomainForRepository.bind(EmailValidator);
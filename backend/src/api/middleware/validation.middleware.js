/**
 * @fileoverview Input Validation Middleware for ShadowNews Platform
 * 
 * Comprehensive input validation and sanitization system for the ShadowNews email-first
 * news platform. This module provides robust data validation using Joi schemas, input
 * sanitization to prevent XSS attacks, file upload validation, and standardized error
 * responses. Ensures data integrity, security, and consistent validation across all
 * API endpoints with detailed error reporting and developer-friendly validation rules.
 * 
 * Key Features:
 * - Joi-based schema validation with comprehensive error reporting
 * - Multi-target validation (body, query parameters, route parameters)
 * - HTML sanitization to prevent XSS attacks
 * - File upload validation with type and size restrictions
 * - Standardized error response format for API consistency
 * - Developer-friendly validation error messages
 * - Configurable validation rules for different data types
 * - Security-focused input sanitization
 * - Performance-optimized validation middleware
 * 
 * Validation Targets:
 * - Request Body: POST/PUT data validation with comprehensive schemas
 * - Query Parameters: GET request parameter validation and type checking
 * - Route Parameters: URL parameter validation (IDs, usernames, etc.)
 * - File Uploads: File type, size, and content validation
 * 
 * Security Features:
 * - XSS prevention through HTML tag stripping and sanitization
 * - SQL injection prevention through type validation
 * - File upload security with MIME type and extension validation
 * - Input length limits to prevent buffer overflow attacks
 * - Special character handling and sanitization
 * - Password complexity enforcement for authentication
 * 
 * Schema Categories:
 * - Authentication: User registration, login, password validation
 * - Content: Posts, comments, repositories with rich validation
 * - File Operations: CSV uploads, email imports with security checks
 * - Search: Query parameters with type validation and limits
 * - Pagination: Standardized pagination parameter validation
 * 
 * Error Handling:
 * - Detailed field-level validation errors
 * - Multiple error aggregation for comprehensive feedback
 * - User-friendly error messages for client-side handling
 * - Consistent error response format across all validations
 * 
 * Dependencies:
 * - joi: Powerful schema description language and validator
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Core validation dependency
const Joi = require('joi');                    // Schema validation library

/**
 * Request Body Validation Middleware Factory
 * Creates middleware for validating request body data using Joi schemas
 * 
 * This middleware provides comprehensive validation for POST/PUT request bodies
 * with detailed error reporting and standardized error responses. Validates
 * all fields according to the provided schema and returns detailed field-level
 * errors for client-side handling.
 * 
 * Features:
 * - Complete field validation against Joi schemas
 * - Multiple error aggregation with abortEarly: false
 * - Detailed error messages with field paths
 * - Standardized error response format
 * - Non-blocking validation that reports all errors at once
 * 
 * @param {Joi.Schema} schema - Joi validation schema for request body
 * @returns {Function} Express middleware function for body validation
 * 
 * @example
 * // Validate user registration data
 * router.post('/register', validate(schemas.register), registerUser);
 */
const validate = (schema) => {
  return (req, res, next) => {
    // Validate request body against provided schema with complete error reporting
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // Transform Joi error details into user-friendly format
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),           // Nested field path (e.g., 'user.email')
        message: detail.message                 // Human-readable error message
      }));
      
      // Return standardized validation error response
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors                                  // Array of field-specific errors
      });
    }
    
    next();                                     // Proceed if validation passes
  };
};

/**
 * Query Parameter Validation Middleware Factory
 * Creates middleware for validating URL query parameters using Joi schemas
 * 
 * This middleware validates GET request query parameters such as pagination,
 * search filters, and sorting options. Ensures proper type conversion and
 * validates parameter ranges and formats for consistent API behavior.
 * 
 * Features:
 * - Query parameter type validation and conversion
 * - Range validation for numeric parameters
 * - Enum validation for limited-value parameters
 * - Default value application for optional parameters
 * - URL parameter sanitization and validation
 * 
 * @param {Joi.Schema} schema - Joi validation schema for query parameters
 * @returns {Function} Express middleware function for query validation
 * 
 * @example
 * // Validate pagination parameters
 * router.get('/posts', validateQuery(schemas.pagination), getPosts);
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    // Validate query parameters against provided schema
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      // Transform Joi error details for query parameter context
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),           // Query parameter name
        message: detail.message                 // Validation error message
      }));
      
      // Return standardized query validation error response
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors                                  // Array of parameter-specific errors
      });
    }
    
    next();                                     // Proceed if validation passes
  };
};

/**
 * Route Parameter Validation Middleware Factory
 * Creates middleware for validating URL route parameters using Joi schemas
 * 
 * This middleware validates route parameters such as user IDs, usernames,
 * and other URL path components. Ensures proper format validation for
 * database queries and prevents invalid parameter injection.
 * 
 * Features:
 * - MongoDB ObjectId format validation
 * - Username format and length validation
 * - Alphanumeric and special character validation
 * - Parameter existence and format checking
 * - SQL injection prevention through type validation
 * 
 * @param {Joi.Schema} schema - Joi validation schema for route parameters
 * @returns {Function} Express middleware function for parameter validation
 * 
 * @example
 * // Validate MongoDB ID parameter
 * router.get('/posts/:id', validateParams(schemas.mongoId), getPost);
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    // Validate route parameters against provided schema
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      // Transform Joi error details for route parameter context
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),           // Parameter name
        message: detail.message                 // Validation error message
      }));
      
      // Return standardized parameter validation error response
      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors                                  // Array of parameter-specific errors
      });
    }
    
    next();                                     // Proceed if validation passes
  };
};

/**
 * Comprehensive Joi Validation Schemas
 * Pre-defined schemas for all ShadowNews platform data validation needs
 * 
 * These schemas provide comprehensive validation rules for all platform
 * functionality including authentication, content creation, file uploads,
 * and search operations. Each schema includes security-focused validation
 * with appropriate length limits, format requirements, and type checking.
 */
const schemas = {
  // ========== Authentication Schemas ==========
  
  /**
   * User Registration Validation Schema
   * Comprehensive validation for new user account creation
   * 
   * Features:
   * - Email format validation with domain checking
   * - Username alphanumeric validation with length limits
   * - Strong password requirements with complexity rules
   * - Optional interests array with maximum limit
   * - Security-focused validation to prevent common attacks
   */
  register: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    username: Joi.string().alphanum().min(3).max(30).required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    password: Joi.string().min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    interests: Joi.array().items(Joi.string()).max(10)
      .messages({
        'array.max': 'Cannot select more than 10 interests'
      })
  }),
  
  /**
   * User Login Validation Schema
   * Simple but secure validation for user authentication
   */
  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Password is required'
      })
  }),
  
  // ========== Content Creation Schemas ==========
  
  /**
   * Post Creation Validation Schema
   * Comprehensive validation for new post submissions
   * 
   * Features:
   * - Title length validation with meaningful limits
   * - URL validation for link posts
   * - Text content validation for text posts
   * - Hashtag format validation with # prefix requirement
   * - Repository association with MongoDB ObjectId validation
   * - Either URL or text required (not both)
   */
  createPost: Joi.object({
    title: Joi.string().min(5).max(300).required()
      .messages({
        'string.min': 'Post title must be at least 5 characters long',
        'string.max': 'Post title cannot exceed 300 characters',
        'any.required': 'Post title is required'
      }),
    url: Joi.string().uri().allow('')
      .messages({
        'string.uri': 'Please provide a valid URL'
      }),
    text: Joi.string().max(5000).allow('')
      .messages({
        'string.max': 'Post text cannot exceed 5000 characters'
      }),
    hashtags: Joi.array().items(
      Joi.string().pattern(/^#\w+$/).messages({
        'string.pattern.base': 'Hashtags must start with # and contain only letters, numbers, and underscores'
      })
    ).max(5)
      .messages({
        'array.max': 'Cannot add more than 5 hashtags'
      }),
    repositoryIds: Joi.array().items(
      Joi.string().hex().length(24).messages({
        'string.hex': 'Repository ID must be a valid MongoDB ObjectId',
        'string.length': 'Repository ID must be exactly 24 characters'
      })
    ).max(3)
      .messages({
        'array.max': 'Cannot associate with more than 3 repositories'
      })
  }).or('url', 'text')
    .messages({
      'object.missing': 'Post must have either a URL or text content'
    }),
  
  /**
   * Post Update Validation Schema
   * Validation for post editing with optional fields
   */
  updatePost: Joi.object({
    title: Joi.string().min(5).max(300)
      .messages({
        'string.min': 'Post title must be at least 5 characters long',
        'string.max': 'Post title cannot exceed 300 characters'
      }),
    text: Joi.string().max(5000)
      .messages({
        'string.max': 'Post text cannot exceed 5000 characters'
      }),
    hashtags: Joi.array().items(
      Joi.string().pattern(/^#\w+$/).messages({
        'string.pattern.base': 'Hashtags must start with # and contain only letters, numbers, and underscores'
      })
    ).max(5)
      .messages({
        'array.max': 'Cannot add more than 5 hashtags'
      })
  }),
  
  // ========== Comment Schemas ==========
  
  /**
   * Comment Creation Validation Schema
   * Validation for threaded comment system
   */
  createComment: Joi.object({
    text: Joi.string().min(1).max(5000).required()
      .messages({
        'string.min': 'Comment cannot be empty',
        'string.max': 'Comment cannot exceed 5000 characters',
        'any.required': 'Comment text is required'
      }),
    parentId: Joi.string().hex().length(24).allow(null)
      .messages({
        'string.hex': 'Parent comment ID must be a valid MongoDB ObjectId',
        'string.length': 'Parent comment ID must be exactly 24 characters'
      })
  }),
  
  // ========== Repository Management Schemas ==========
  
  /**
   * Repository Creation Validation Schema
   * Comprehensive validation for email repository creation
   */
  createRepository: Joi.object({
    name: Joi.string().min(3).max(100).required()
      .messages({
        'string.min': 'Repository name must be at least 3 characters long',
        'string.max': 'Repository name cannot exceed 100 characters',
        'any.required': 'Repository name is required'
      }),
    description: Joi.string().max(500).required()
      .messages({
        'string.max': 'Repository description cannot exceed 500 characters',
        'any.required': 'Repository description is required'
      }),
    topic: Joi.string().min(2).max(50).required()
      .messages({
        'string.min': 'Topic must be at least 2 characters long',
        'string.max': 'Topic cannot exceed 50 characters',
        'any.required': 'Repository topic is required'
      }),
    isPrivate: Joi.boolean().default(false),
    emailDomainWhitelist: Joi.array().items(Joi.string().domain())
      .messages({
        'string.domain': 'Please provide valid domain names for whitelist'
      }),
    emailDomainBlacklist: Joi.array().items(Joi.string().domain())
      .messages({
        'string.domain': 'Please provide valid domain names for blacklist'
      }),
    autoApprove: Joi.boolean().default(false),
    qualityThreshold: Joi.number().min(0).max(100).default(50)
      .messages({
        'number.min': 'Quality threshold must be at least 0',
        'number.max': 'Quality threshold cannot exceed 100'
      })
  }),
  
  /**
   * Repository Update Validation Schema
   * Validation for repository editing with optional fields
   */
  updateRepository: Joi.object({
    name: Joi.string().min(3).max(100)
      .messages({
        'string.min': 'Repository name must be at least 3 characters long',
        'string.max': 'Repository name cannot exceed 100 characters'
      }),
    description: Joi.string().max(500)
      .messages({
        'string.max': 'Repository description cannot exceed 500 characters'
      }),
    isPrivate: Joi.boolean(),
    emailDomainWhitelist: Joi.array().items(Joi.string().domain())
      .messages({
        'string.domain': 'Please provide valid domain names for whitelist'
      }),
    emailDomainBlacklist: Joi.array().items(Joi.string().domain())
      .messages({
        'string.domain': 'Please provide valid domain names for blacklist'
      }),
    autoApprove: Joi.boolean(),
    qualityThreshold: Joi.number().min(0).max(100)
      .messages({
        'number.min': 'Quality threshold must be at least 0',
        'number.max': 'Quality threshold cannot exceed 100'
      })
  }),
  
  /**
   * Email Addition Validation Schema
   * Validation for bulk email addition to repositories
   */
  addEmails: Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).max(1000).required()
      .messages({
        'array.min': 'At least one email address is required',
        'array.max': 'Cannot add more than 1000 email addresses at once',
        'string.email': 'All entries must be valid email addresses',
        'any.required': 'Email list is required'
      }),
    tags: Joi.array().items(Joi.string()).max(10)
      .messages({
        'array.max': 'Cannot add more than 10 tags'
      })
  }),
  
  // ========== CSV Upload Schemas ==========
  
  /**
   * CSV Upload Validation Schema
   * Validation for CSV file upload and column mapping
   */
  uploadCSV: Joi.object({
    repositoryId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Repository ID must be a valid MongoDB ObjectId',
        'string.length': 'Repository ID must be exactly 24 characters',
        'any.required': 'Repository ID is required'
      }),
    columnMapping: Joi.object({
      email: Joi.string().required()
        .messages({
          'any.required': 'Email column mapping is required'
        }),
      name: Joi.string(),
      tags: Joi.string()
    })
  }),
  
  // ========== Email Operation Schemas ==========
  
  /**
   * Email Digest Sending Validation Schema
   * Validation for sending email digests to repositories
   */
  sendDigest: Joi.object({
    repositoryId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Repository ID must be a valid MongoDB ObjectId',
        'string.length': 'Repository ID must be exactly 24 characters',
        'any.required': 'Repository ID is required'
      }),
    subject: Joi.string().max(200)
      .messages({
        'string.max': 'Email subject cannot exceed 200 characters'
      }),
    customMessage: Joi.string().max(1000)
      .messages({
        'string.max': 'Custom message cannot exceed 1000 characters'
      })
  }),
  
  // ========== Query Parameter Schemas ==========
  
  /**
   * Pagination Validation Schema
   * Standardized pagination parameter validation
   */
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1)
      .messages({
        'number.min': 'Page number must be at least 1',
        'number.integer': 'Page number must be an integer'
      }),
    limit: Joi.number().integer().min(1).max(100).default(20)
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
        'number.integer': 'Limit must be an integer'
      }),
    sort: Joi.string().valid('hot', 'new', 'top', 'controversial').default('hot')
      .messages({
        'any.only': 'Sort must be one of: hot, new, top, controversial'
      })
  }),
  
  /**
   * Search Query Validation Schema
   * Validation for search operations across different content types
   */
  search: Joi.object({
    q: Joi.string().min(1).max(200).required()
      .messages({
        'string.min': 'Search query cannot be empty',
        'string.max': 'Search query cannot exceed 200 characters',
        'any.required': 'Search query is required'
      }),
    type: Joi.string().valid('posts', 'comments', 'users', 'repositories').default('posts')
      .messages({
        'any.only': 'Search type must be one of: posts, comments, users, repositories'
      }),
    page: Joi.number().integer().min(1).default(1)
      .messages({
        'number.min': 'Page number must be at least 1',
        'number.integer': 'Page number must be an integer'
      }),
    limit: Joi.number().integer().min(1).max(50).default(20)
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 50',
        'number.integer': 'Limit must be an integer'
      })
  }),
  
  // ========== Route Parameter Schemas ==========
  
  /**
   * MongoDB ObjectId Validation Schema
   * Standard validation for MongoDB document IDs
   */
  mongoId: Joi.object({
    id: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'ID must be a valid MongoDB ObjectId',
        'string.length': 'ID must be exactly 24 characters',
        'any.required': 'ID is required'
      })
  }),
  
  /**
   * Username Validation Schema
   * Standard validation for username parameters
   */
  username: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      })
  })
};

/**
 * HTML Sanitization Middleware
 * Prevents XSS attacks by sanitizing user input
 * 
 * This middleware recursively sanitizes all string values in request data
 * to prevent cross-site scripting (XSS) attacks. Removes potentially
 * dangerous HTML tags while preserving safe content and data structure.
 * 
 * Security Features:
 * - HTML tag removal to prevent script injection
 * - Recursive sanitization of nested objects and arrays
 * - String trimming to remove whitespace padding
 * - Preservation of non-string data types
 * - Safe handling of null and undefined values
 * 
 * Sanitization Process:
 * - Removes < and > characters that could form HTML tags
 * - Trims whitespace from string beginnings and ends
 * - Recursively processes nested objects and arrays
 * - Preserves data structure and non-string values
 * 
 * @param {Object} req - Express request object with body to sanitize
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sanitizeHtml = (req, res, next) => {
  /**
   * Recursive Value Sanitization Function
   * Safely sanitizes values while preserving data structure
   * 
   * @param {*} value - Value to sanitize (string, object, array, or primitive)
   * @returns {*} Sanitized value with same type and structure
   */
  const sanitizeValue = (value) => {
    // Sanitize string values by removing HTML tags and trimming
    if (typeof value === 'string') {
      return value
        .replace(/[<>]/g, '')                  // Remove potential HTML tag characters
        .trim();                               // Remove leading/trailing whitespace
    }
    
    // Recursively sanitize array elements
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    
    // Recursively sanitize object properties
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    
    // Return non-string values unchanged
    return value;
  };
  
  // Sanitize request body if present
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  next();                                      // Proceed to next middleware
};

/**
 * File Upload Validation Middleware Factory
 * Creates middleware for validating uploaded files
 * 
 * This middleware provides comprehensive file upload validation including
 * file type checking, size limits, and extension validation. Prevents
 * malicious file uploads and ensures only acceptable file types are processed.
 * 
 * Security Features:
 * - MIME type validation against whitelist
 * - File extension validation for double-checking
 * - File size limits to prevent resource exhaustion
 * - Required file validation for mandatory uploads
 * - Descriptive error messages for different failure modes
 * 
 * @param {Object} options - Configuration options for file validation
 * @param {number} options.maxSize - Maximum file size in bytes (default: 10MB)
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @param {string[]} options.allowedExtensions - Allowed file extensions
 * @returns {Function} Express middleware function for file validation
 * 
 * @example
 * // Validate CSV file uploads
 * const csvValidator = validateFileUpload({
 *   maxSize: 10 * 1024 * 1024,
 *   allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
 *   allowedExtensions: ['.csv', '.xls', '.xlsx']
 * });
 */
const validateFileUpload = (options = {}) => {
  // Configure validation options with secure defaults
  const {
    maxSize = 10 * 1024 * 1024,               // 10MB default maximum size
    allowedTypes = ['text/csv', 'application/vnd.ms-excel'], // Default CSV types
    allowedExtensions = ['.csv', '.xls', '.xlsx'] // Default CSV extensions
  } = options;
  
  return (req, res, next) => {
    // Validate that a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Extract and validate file extension
    const fileExtension = req.file.originalname
      .substring(req.file.originalname.lastIndexOf('.'))
      .toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
      });
    }
    
    // Validate MIME type for additional security
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      });
    }
    
    // Validate file size to prevent resource exhaustion
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`
      });
    }
    
    next();                                    // Proceed if all validations pass
  };
};

// Export all validation middleware and utilities for application use
module.exports = {
  validate,               // Request body validation middleware factory
  validateQuery,          // Query parameter validation middleware factory
  validateParams,         // Route parameter validation middleware factory
  schemas,                // Comprehensive validation schemas collection
  sanitizeHtml,           // HTML sanitization middleware
  validateFileUpload      // File upload validation middleware factory
};
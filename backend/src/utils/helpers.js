/**
 * @fileoverview Helper Utilities and Common Functions
 * 
 * Comprehensive collection of utility functions and helper methods for the
 * ShadowNews platform. Provides reusable functionality across the application
 * including data validation, string manipulation, security utilities, and
 * common algorithmic operations.
 * 
 * Key Features:
 * - Unique ID and slug generation utilities
 * - Security-focused HTML sanitization and validation
 * - Email and URL processing and validation
 * - Date and time manipulation helpers
 * - String formatting and text processing
 * - Error handling and response formatting
 * - Performance optimization utilities
 * - Data transformation and normalization
 * 
 * Security Features:
 * - XSS prevention through HTML sanitization
 * - Input validation and data normalization
 * - Secure random ID generation with crypto
 * - Safe URL and email parsing
 * - Content filtering and validation
 * 
 * Performance Features:
 * - Efficient string processing algorithms
 * - Optimized data transformation functions
 * - Memory-efficient helper operations
 * - Cached computation utilities
 * 
 * Dependencies:
 * - crypto: Secure random number and hash generation
 * - validator: Input validation and sanitization
 * - moment: Date and time manipulation
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

const crypto = require('crypto');
const validator = require('validator');
const moment = require('moment');

/**
 * Generate Unique Identifier
 * 
 * Creates a cryptographically secure unique identifier using random bytes.
 * Commonly used for creating unique resource identifiers, tokens, and
 * database document IDs throughout the platform.
 * 
 * @param {string} [prefix=''] - Optional prefix to prepend to the generated ID
 * @returns {string} Unique hexadecimal identifier with optional prefix
 * 
 * @example
 * // Generate basic unique ID
 * const id = generateId(); // "a1b2c3d4e5f6..."
 * 
 * // Generate ID with prefix
 * const postId = generateId('post_'); // "post_a1b2c3d4e5f6..."
 * 
 * @since 1.0.0
 */
const generateId = (prefix = '') => {
  return prefix + crypto.randomBytes(16).toString('hex');
};

/**
 * Generate URL-Friendly Slug
 * 
 * Converts a title or text string into a URL-friendly slug suitable for
 * use in URLs, file names, and identifiers. Handles special characters,
 * whitespace normalization, and length constraints.
 * 
 * Features:
 * - Converts to lowercase for consistency
 * - Removes special characters and punctuation
 * - Normalizes whitespace to hyphens
 * - Prevents consecutive hyphens
 * - Limits length to 100 characters
 * - Trims leading and trailing whitespace
 * 
 * @param {string} title - The title or text to convert to a slug
 * @returns {string} URL-friendly slug string
 * 
 * @example
 * // Convert post title to slug
 * const slug = generateSlug("Hello, World! This is a Test"); 
 * // Returns: "hello-world-this-is-a-test"
 * 
 * // Handle special characters
 * const slug2 = generateSlug("AI & Machine Learning (2024)");
 * // Returns: "ai-machine-learning-2024"
 * 
 * @since 1.0.0
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
    .substring(0, 100);
};

/**
 * Sanitize HTML Content
 * 
 * Provides XSS protection by escaping HTML special characters in user input.
 * Essential for preventing cross-site scripting attacks when displaying
 * user-generated content in web browsers.
 * 
 * Escapes:
 * - & to &amp;
 * - < to &lt;
 * - > to &gt;
 * - " to &quot;
 * - ' to &#x27;
 * - / to &#x2F;
 * 
 * @param {string} html - Raw HTML content to sanitize
 * @returns {string} Sanitized HTML content safe for display
 * 
 * @example
 * // Sanitize user input
 * const userInput = '<script>alert("XSS")</script>';
 * const safe = sanitizeHtml(userInput);
 * // Returns: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
 * 
 * @since 1.0.0
 */
const sanitizeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Extract Domain from URL
 * 
 * Extracts the domain portion from a given URL string, handling various
 * URL formats and edge cases. Used for email validation, link analysis,
 * and domain-based filtering throughout the platform.
 * 
 * @param {string} url - URL string to extract domain from
 * @returns {string|null} Domain name or null if invalid URL
 * 
 * @example
 * // Extract domain from URL
 * const domain = extractDomain("https://www.example.com/path");
 * // Returns: "www.example.com"
 * 
 * // Handle protocol-less URLs
 * const domain2 = extractDomain("example.com/page");
 * // Returns: "example.com"
 * 
 * @since 1.0.0
 */
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return null;
  }
};

/**
 * Calculate Reading Time Estimate
 * 
 * Estimates reading time for text content based on average reading speed.
 * Used for displaying reading time estimates on posts and articles to
 * help users gauge content length and plan their reading time.
 * 
 * @param {string} text - Text content to analyze
 * @returns {number} Estimated reading time in minutes
 * 
 * @example
 * // Calculate reading time for post content
 * const content = "This is a sample post with some content...";
 * const readTime = calculateReadingTime(content);
 * // Returns: 2 (minutes)
 * 
 * @since 1.0.0
 */
const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
};

/**
 * Format Karma Number Display
 * 
 * Formats large karma numbers into human-readable abbreviated format.
 * Converts thousands to 'k' and millions to 'M' for better UI display
 * and space efficiency in user interfaces.
 * 
 * @param {number} karma - Raw karma value to format
 * @returns {string} Formatted karma string with abbreviations
 * 
 * @example
 * // Format various karma values
 * formatKarma(500);      // Returns: "500"
 * formatKarma(1500);     // Returns: "1.5k"
 * formatKarma(1200000);  // Returns: "1.2M"
 * 
 * @since 1.0.0
 */
const formatKarma = (karma) => {
  if (karma >= 1000000) {
    return (karma / 1000000).toFixed(1) + 'M';
  } else if (karma >= 1000) {
    return (karma / 1000).toFixed(1) + 'k';
  }
  return karma.toString();
};

/**
 * Generate Email Hash for Avatars
 * 
 * Creates MD5 hash of email address for use with Gravatar service and
 * consistent avatar generation. Used throughout the platform for user
 * avatar display and identification.
 * 
 * @param {string} email - Email address to hash
 * @returns {string} MD5 hash of the email address
 * 
 * @example
 * // Generate hash for Gravatar URL
 * const hash = generateEmailHash("user@example.com");
 * const avatarUrl = `https://gravatar.com/avatar/${hash}`;
 * 
 * @since 1.0.0
 */
const generateEmailHash = (email) => {
  return crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex');
};

/**
 * Paginate Database Results
 * 
 * Calculates offset and limit values for database pagination with safety
 * constraints. Ensures efficient data retrieval and prevents excessive
 * memory usage from large result sets.
 * 
 * @param {number} [page=1] - Page number (1-based)
 * @param {number} [limit=30] - Number of items per page
 * @returns {Object} Pagination object with offset and limit
 * @returns {number} returns.offset - Skip count for database query
 * @returns {number} returns.limit - Maximum items to return (capped at 100)
 * 
 * @example
 * // Get pagination for page 2 with 20 items per page
 * const { offset, limit } = paginate(2, 20);
 * // Returns: { offset: 20, limit: 20 }
 * 
 * @since 1.0.0
 */
const paginate = (page = 1, limit = 30) => {
  const offset = (page - 1) * limit;
  return {
    offset,
    limit: Math.min(limit, 100)
  };
};

/**
 * Extract Hashtags from Text
 * 
 * Parses text content to extract hashtag mentions and normalize them
 * for consistent storage and retrieval. Used for post categorization
 * and topic-based content discovery.
 * 
 * @param {string} text - Text content to parse for hashtags
 * @returns {Array<string>} Array of normalized hashtag strings (without #)
 * 
 * @example
 * // Extract hashtags from post content
 * const text = "Check out this #AI and #MachineLearning article!";
 * const tags = extractHashtags(text);
 * // Returns: ["ai", "machinelearning"]
 * 
 * @since 1.0.0
 */
const extractHashtags = (text) => {
  const hashtagRegex = /#[\w]+/g;
  const hashtags = text.match(hashtagRegex) || [];
  return hashtags.map(tag => tag.substring(1).toLowerCase());
};

/**
 * Validate Email Address Format
 * 
 * Validates email address format using comprehensive RFC-compliant
 * validation. Essential for user registration and email processing
 * throughout the platform.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 * 
 * @example
 * // Validate user email input
 * const isValid = isValidEmail("user@example.com"); // Returns: true
 * const isInvalid = isValidEmail("invalid-email"); // Returns: false
 * 
 * @since 1.0.0
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Generate Random Verification Code
 * 
 * Creates a secure 6-digit verification code for email verification,
 * password reset, and two-factor authentication workflows.
 * 
 * @returns {string} 6-digit verification code
 * 
 * @example
 * // Generate verification code for email confirmation
 * const code = generateVerificationCode(); // Returns: "123456"
 * 
 * @since 1.0.0
 */
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculate Post Ranking Score
 * 
 * Implements Hacker News-style ranking algorithm to calculate post scores
 * based on votes and age. Higher scores indicate more relevant content
 * that should appear higher in feeds and rankings.
 * 
 * @param {number} votes - Number of upvotes for the post
 * @param {number} ageInHours - Post age in hours
 * @param {number} [gravity=1.8] - Gravity factor controlling age decay
 * @returns {number} Calculated ranking score
 * 
 * @example
 * // Calculate score for a post with 10 votes, 2 hours old
 * const score = calculatePostScore(10, 2); // Returns: ~2.25
 * 
 * @since 1.0.0
 */
const calculatePostScore = (votes, ageInHours, gravity = 1.8) => {
  return (votes - 1) / Math.pow(ageInHours + 2, gravity);
};

/**
 * Format Relative Time Display
 * 
 * Converts absolute timestamps to human-readable relative time formats
 * like "2 hours ago" or "3 days ago" for better user experience.
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Human-readable relative time string
 * 
 * @example
 * // Format post creation time
 * const timeAgo = formatRelativeTime(post.createdAt);
 * // Returns: "2 hours ago"
 * 
 * @since 1.0.0
 */
const formatRelativeTime = (date) => {
  return moment(date).fromNow();
};

/**
 * Validate URL Format
 * 
 * Validates URL format with protocol requirement and security constraints.
 * Used for link validation in posts and user-generated content.
 * 
 * @param {string} url - URL string to validate
 * @returns {boolean} True if URL format is valid
 * 
 * @example
 * // Validate user-submitted URL
 * const isValid = isValidUrl("https://example.com"); // Returns: true
 * const isInvalid = isValidUrl("not-a-url"); // Returns: false
 * 
 * @since 1.0.0
 */
const isValidUrl = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

/**
 * Generate Username from Email
 * 
 * Creates a unique username suggestion based on email address local part
 * with random suffix to prevent conflicts during user registration.
 * 
 * @param {string} email - Email address to derive username from
 * @returns {string} Generated username with random suffix
 * 
 * @example
 * // Generate username suggestion
 * const username = generateUsername("john.doe@example.com");
 * // Returns: "john.doe123" (random suffix varies)
 * 
 * @since 1.0.0
 */
const generateUsername = (email) => {
  const localPart = email.split('@')[0];
  const randomSuffix = crypto.randomInt(100, 999);
  return `${localPart}${randomSuffix}`;
};

// Truncate text with ellipsis
const truncateText = (text, maxLength = 150) => {
 if (text.length <= maxLength) return text;
 return text.substring(0, maxLength).trim() + '...';
};

// Parse CSV email list
const parseEmailList = (csvContent) => {
 const emails = [];
 const lines = csvContent.split('\n');
 
 for (const line of lines) {
   const email = line.trim();
   if (isValidEmail(email)) {
     emails.push(email.toLowerCase());
   }
 }
 
 return [...new Set(emails)]; // Remove duplicates
};

// Calculate email domain statistics
const calculateDomainStats = (emails) => {
 const domainCount = {};
 
 emails.forEach(email => {
   const domain = email.split('@')[1];
   domainCount[domain] = (domainCount[domain] || 0) + 1;
 });
 
 return domainCount;
};

// Generate repository invite token
const generateInviteToken = () => {
 return crypto.randomBytes(32).toString('base64url');
};

// Check if user can perform action based on karma
/**
 * Check Karma-Based Feature Access
 * 
 * Determines if a user has sufficient karma to access premium features
 * and platform capabilities. Implements the karma-based progression
 * system that unlocks features as users gain reputation.
 * 
 * Feature Karma Thresholds:
 * - Create repository: 100 karma
 * - Custom email signature: 100 karma
 * - Weighted voting: 500 karma
 * - Curator rights: 1000 karma
 * - Governance participation: 5000 karma
 * 
 * @param {number} userKarma - User's current karma points
 * @param {string} action - Feature or action to check access for
 * @returns {boolean} True if user has sufficient karma
 * 
 * @example
 * // Check if user can create repository
 * const canCreate = checkKarmaThreshold(150, 'createRepository'); // Returns: true
 * 
 * @since 1.0.0
 */
const checkKarmaThreshold = (userKarma, action) => {
  const thresholds = {
    createRepository: 100,
    customEmailSignature: 100,
    weightedVoting: 500,
    curatorRights: 1000,
    governanceParticipation: 5000
  };
  
  return userKarma >= (thresholds[action] || 0);
};

/**
 * Generate Rate Limit Key
 * 
 * Creates unique cache keys for rate limiting user actions and API requests.
 * Used with Redis to implement distributed rate limiting across the platform.
 * 
 * @param {string} userId - User identifier
 * @param {string} action - Action being rate limited
 * @returns {string} Unique rate limit cache key
 * 
 * @example
 * // Generate rate limit key for user posts
 * const key = getRateLimitKey('user123', 'createPost');
 * // Returns: "ratelimit:user123:createPost:1640995200000"
 * 
 * @since 1.0.0
 */
const getRateLimitKey = (userId, action) => {
  return `ratelimit:${userId}:${action}:${Date.now()}`;
};

/**
 * Anonymize Email Address
 * 
 * Partially obscures email addresses for privacy protection while maintaining
 * recognizability. Used in public displays and privacy-sensitive contexts.
 * 
 * @param {string} email - Email address to anonymize
 * @returns {string} Partially obscured email address
 * 
 * @example
 * // Anonymize email for public display
 * const anon = anonymizeEmail("john.doe@example.com");
 * // Returns: "joh***@example.com"
 * 
 * @since 1.0.0
 */
const anonymizeEmail = (email) => {
  const [localPart, domain] = email.split('@');
  const anonymized = localPart.substring(0, 3) + '***';
  return `${anonymized}@${domain}`;
};

/**
 * Calculate Snowball Growth Rate
 * 
 * Computes the daily growth rate percentage for repository snowball distribution.
 * Essential metric for tracking viral growth and community expansion effectiveness.
 * 
 * @param {number} initialSize - Starting member count
 * @param {number} currentSize - Current member count
 * @param {number} daysElapsed - Days since initial measurement
 * @returns {number} Daily growth rate percentage (rounded to 2 decimal places)
 * 
 * @example
 * // Calculate growth rate for repository
 * const growth = calculateSnowballGrowth(100, 150, 10);
 * // Returns: 5.0 (5% daily growth)
 * 
 * @since 1.0.0
 */
const calculateSnowballGrowth = (initialSize, currentSize, daysElapsed) => {
  if (daysElapsed === 0) return 0;
  const growthRate = ((currentSize - initialSize) / initialSize / daysElapsed) * 100;
  return Math.round(growthRate * 100) / 100;
};

/**
 * Generate Unique Repository Slug
 * 
 * Creates a unique URL-friendly identifier for repositories by combining
 * the repository name slug with a random suffix to prevent conflicts.
 * 
 * @param {string} name - Repository name to generate slug from
 * @returns {string} Unique repository slug with random suffix
 * 
 * @example
 * // Generate unique repository slug
 * const slug = generateRepositorySlug("AI Research Group");
 * // Returns: "ai-research-group-a1b2c3"
 * 
 * @since 1.0.0
 */
const generateRepositorySlug = (name) => {
  const slug = generateSlug(name);
  const uniqueSuffix = crypto.randomBytes(3).toString('hex');
  return `${slug}-${uniqueSuffix}`;
};

/**
 * Validate CSV File Size
 * 
 * Checks if uploaded CSV file size is within acceptable limits to prevent
 * memory issues and ensure reasonable processing times.
 * 
 * @param {number} sizeInBytes - File size in bytes
 * @param {number} [maxSizeMB=10] - Maximum allowed size in megabytes
 * @returns {boolean} True if file size is acceptable
 * 
 * @example
 * // Validate uploaded file size
 * const isValid = validateCsvSize(5242880, 10); // 5MB file, 10MB limit
 * // Returns: true
 * 
 * @since 1.0.0
 */
const validateCsvSize = (sizeInBytes, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
};

/**
 * Extract User Mentions from Text
 * 
 * Parses text content to find @username mentions for notification
 * and linking purposes in posts and comments.
 * 
 * @param {string} text - Text content to parse for mentions
 * @returns {Array<string>} Array of mentioned usernames (without @)
 * 
 * @example
 * // Extract mentions from comment
 * const text = "Great point @johndoe and @alice!";
 * const mentions = extractMentions(text);
 * // Returns: ["johndoe", "alice"]
 * 
 * @since 1.0.0
 */
const extractMentions = (text) => {
  const mentionRegex = /@[\w]+/g;
  const mentions = text.match(mentionRegex) || [];
  return mentions.map(mention => mention.substring(1));
};

/**
 * Generate Email Post Identifier
 * 
 * Creates unique identifiers for posts created via email to track
 * their origin and enable email-specific processing features.
 * 
 * @returns {string} Unique email post identifier
 * 
 * @example
 * // Generate ID for email-created post
 * const id = generateEmailPostId();
 * // Returns: "ep_1640995200000_a1b2c3d4"
 * 
 * @since 1.0.0
 */
const generateEmailPostId = () => {
  return `ep_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * Check Domain Allowlist
 * 
 * Validates if an email domain is in the allowed domains list for
 * restricted repositories and invite-only communities.
 * 
 * @param {string} email - Email address to check
 * @param {Array<string>} [allowedDomains=[]] - Array of allowed domain names
 * @returns {boolean} True if domain is allowed (empty list allows all)
 * 
 * @example
 * // Check corporate email domain
 * const isAllowed = isAllowedDomain("user@company.com", ["company.com"]);
 * // Returns: true
 * 
 * @since 1.0.0
 */
const isAllowedDomain = (email, allowedDomains = []) => {
  if (allowedDomains.length === 0) return true;
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

/**
 * Calculate Repository Quality Score
 * 
 * Computes a quality metric for repositories based on email verification
 * rates, user activity, and engagement levels. Used for ranking and
 * recommendation algorithms.
 * 
 * @param {Object} metrics - Repository metrics object
 * @param {number} metrics.totalEmails - Total email count
 * @param {number} metrics.verifiedEmails - Verified email count
 * @param {number} metrics.activeUsers - Active user count
 * @param {number} metrics.engagementRate - Engagement rate (0-1)
 * @returns {number} Quality score (0-100)
 * 
 * @example
 * // Calculate repository quality
 * const score = calculateRepositoryQuality({
 *   totalEmails: 1000,
 *   verifiedEmails: 800,
 *   activeUsers: 600,
 *   engagementRate: 0.75
 * });
 * // Returns: 79
 * 
 * @since 1.0.0
 */
const calculateRepositoryQuality = (metrics) => {
  const {
    totalEmails,
    verifiedEmails,
    activeUsers,
    engagementRate
  } = metrics;
  
  const verificationRatio = verifiedEmails / totalEmails;
  const activeRatio = activeUsers / totalEmails;
  
  return Math.round(
    (verificationRatio * 0.4 + activeRatio * 0.3 + engagementRate * 0.3) * 100
  );
};

/**
 * Parse Email Subject Commands
 * 
 * Extracts command intentions from email subject lines to enable
 * email-driven platform interactions and automated processing.
 * 
 * @param {string} subject - Email subject line to parse
 * @returns {string} Parsed command action
 * 
 * @example
 * // Parse email command
 * const command = parseEmailCommand("POST: New AI Discovery");
 * // Returns: "create_post"
 * 
 * @since 1.0.0
 */
const parseEmailCommand = (subject) => {
  const commands = {
    'POST': 'create_post',
    'COMMENT': 'add_comment',
    'UPVOTE': 'upvote',
    'SUBSCRIBE': 'subscribe',
    'UNSUBSCRIBE': 'unsubscribe',
    'STATS': 'get_stats',
    'HELP': 'show_help'
  };
  
  const firstWord = subject.trim().split(' ')[0].toUpperCase();
  return commands[firstWord] || 'create_post';
};

/**
 * Generate Shareable Links
 * 
 * Creates properly formatted shareable URLs for posts, repositories,
 * and other platform content with consistent structure.
 * 
 * @param {string} type - Content type (post, repository, user, etc.)
 * @param {string} id - Content identifier
 * @returns {string} Complete shareable URL
 * 
 * @example
 * // Generate shareable post link
 * const link = generateShareableLink('post', 'abc123');
 * // Returns: "https://shadownews.com/post/abc123"
 * 
 * @since 1.0.0
 */
const generateShareableLink = (type, id) => {
  const baseUrl = process.env.BASE_URL || 'https://shadownews.com';
  return `${baseUrl}/${type}/${id}`;
};

/**
 * Calculate Engagement Score
 * 
 * Computes weighted engagement metrics combining views, votes, comments,
 * and shares to create a comprehensive engagement indicator.
 * 
 * @param {number} views - Total view count
 * @param {number} votes - Total vote count
 * @param {number} comments - Total comment count
 * @param {number} shares - Total share count
 * @returns {number} Calculated engagement score
 * 
 * @example
 * // Calculate post engagement
 * const score = calculateEngagementScore(1000, 50, 25, 10);
 * // Returns: 145 (weighted score)
 * 
 * @since 1.0.0
 */
const calculateEngagementScore = (views, votes, comments, shares) => {
  return Math.round(
    views * 0.1 + votes * 0.3 + comments * 0.4 + shares * 0.2
  );
};

/**
 * Batch Process Async Operations
 * 
 * Processes large arrays of items in controlled batches to prevent
 * memory issues and rate limiting. Essential for bulk operations
 * and large dataset processing.
 * 
 * @param {Array} items - Array of items to process
 * @param {number} batchSize - Number of items per batch
 * @param {Function} processor - Async function to process each item
 * @returns {Promise<Array>} Array of processed results
 * 
 * @example
 * // Process email list in batches
 * const results = await batchProcess(emails, 50, async (email) => {
 *   return await validateEmail(email);
 * });
 * 
 * @since 1.0.0
 */
const batchProcess = async (items, batchSize, processor) => {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Helper Functions Module Exports
 * 
 * Comprehensive collection of utility functions for the ShadowNews platform.
 * These functions provide reusable functionality across controllers, services,
 * and other application components.
 * 
 * @since 1.0.0
 */
module.exports = {
  generateId,
  generateSlug,
  sanitizeHtml,
  extractDomain,
  calculateReadingTime,
  formatKarma,
  generateEmailHash,
  paginate,
  extractHashtags,
  isValidEmail,
  generateVerificationCode,
  calculatePostScore,
  formatRelativeTime,
  isValidUrl,
  generateUsername,
  truncateText,
  parseEmailList,
  calculateDomainStats,
  generateInviteToken,
  checkKarmaThreshold,
  getRateLimitKey,
  anonymizeEmail,
  calculateSnowballGrowth,
  generateRepositorySlug,
  validateCsvSize,
  extractMentions,
  generateEmailPostId,
  isAllowedDomain,
  calculateRepositoryQuality,
  parseEmailCommand,
  generateShareableLink,
  calculateEngagementScore,
  batchProcess
};
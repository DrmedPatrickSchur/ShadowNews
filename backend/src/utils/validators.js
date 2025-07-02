const validator = require('validator');
const { EMAIL_REGEX, USERNAME_REGEX, HASHTAG_REGEX } = require('../config/constants');

// User validation
const validateEmail = (email) => {
 if (!email || typeof email !== 'string') return false;
 return validator.isEmail(email) && email.length <= 255;
};

const validateUsername = (username) => {
 if (!username || typeof username !== 'string') return false;
 return USERNAME_REGEX.test(username) && username.length >= 3 && username.length <= 30;
};

const validatePassword = (password) => {
 if (!password || typeof password !== 'string') return false;
 return password.length >= 8 && 
        password.length <= 128 &&
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) && 
        /[0-9]/.test(password);
};

// Post validation
const validatePostTitle = (title) => {
 if (!title || typeof title !== 'string') return false;
 const trimmed = title.trim();
 return trimmed.length >= 3 && trimmed.length <= 300;
};

const validatePostContent = (content) => {
 if (!content || typeof content !== 'string') return false;
 const trimmed = content.trim();
 return trimmed.length >= 10 && trimmed.length <= 10000;
};

const validatePostUrl = (url) => {
 if (!url) return true; // URL is optional
 if (typeof url !== 'string') return false;
 return validator.isURL(url, {
   protocols: ['http', 'https'],
   require_protocol: true,
   require_valid_protocol: true
 });
};

const validateHashtags = (hashtags) => {
 if (!Array.isArray(hashtags)) return false;
 if (hashtags.length > 10) return false;
 
 return hashtags.every(tag => {
   if (typeof tag !== 'string') return false;
   return HASHTAG_REGEX.test(tag) && tag.length >= 2 && tag.length <= 50;
 });
};

// Comment validation
const validateCommentContent = (content) => {
 if (!content || typeof content !== 'string') return false;
 const trimmed = content.trim();
 return trimmed.length >= 1 && trimmed.length <= 5000;
};

// Repository validation
const validateRepositoryName = (name) => {
 if (!name || typeof name !== 'string') return false;
 const trimmed = name.trim();
 return trimmed.length >= 3 && trimmed.length <= 100;
};

const validateRepositoryDescription = (description) => {
 if (!description || typeof description !== 'string') return false;
 const trimmed = description.trim();
 return trimmed.length >= 10 && trimmed.length <= 500;
};

const validateEmailList = (emails) => {
 if (!Array.isArray(emails)) return false;
 if (emails.length === 0 || emails.length > 10000) return false;
 
 const uniqueEmails = new Set();
 
 for (const email of emails) {
   if (!validateEmail(email)) return false;
   if (uniqueEmails.has(email.toLowerCase())) return false;
   uniqueEmails.add(email.toLowerCase());
 }
 
 return true;
};

// CSV validation
const validateCSVSize = (sizeInBytes) => {
 const maxSize = 10 * 1024 * 1024; // 10MB
 return sizeInBytes > 0 && sizeInBytes <= maxSize;
};

const validateCSVHeaders = (headers) => {
 if (!Array.isArray(headers) || headers.length === 0) return false;
 
 const requiredHeaders = ['email'];
 const validOptionalHeaders = ['name', 'company', 'tags', 'verified', 'subscribed'];
 
 const headerSet = new Set(headers.map(h => h.toLowerCase().trim()));
 
 // Check required headers
 for (const required of requiredHeaders) {
   if (!headerSet.has(required)) return false;
 }
 
 // Check all headers are valid
 for (const header of headerSet) {
   if (!requiredHeaders.includes(header) && !validOptionalHeaders.includes(header)) {
     return false;
   }
 }
 
 return true;
};

// Pagination validation
const validatePagination = (page, limit) => {
 const pageNum = parseInt(page);
 const limitNum = parseInt(limit);
 
 if (isNaN(pageNum) || isNaN(limitNum)) return false;
 if (pageNum < 1 || pageNum > 10000) return false;
 if (limitNum < 1 || limitNum > 100) return false;
 
 return true;
};

// Sort validation
const validateSortField = (field, allowedFields) => {
 if (!field || typeof field !== 'string') return false;
 return allowedFields.includes(field);
};

const validateSortOrder = (order) => {
 return order === 'asc' || order === 'desc' || order === '1' || order === '-1';
};

// Search validation
const validateSearchQuery = (query) => {
 if (!query || typeof query !== 'string') return false;
 const trimmed = query.trim();
 return trimmed.length >= 2 && trimmed.length <= 200;
};

// Date validation
const validateDateRange = (startDate, endDate) => {
 if (!startDate || !endDate) return false;
 
 const start = new Date(startDate);
 const end = new Date(endDate);
 
 if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
 if (start > end) return false;
 
 const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year
 return (end - start) <= maxRange;
};

// Karma validation
const validateKarmaAmount = (amount) => {
 const num = parseInt(amount);
 if (isNaN(num)) return false;
 return num >= -1000 && num <= 1000;
};

// MongoDB ObjectId validation
const validateObjectId = (id) => {
 if (!id || typeof id !== 'string') return false;
 return /^[0-9a-fA-F]{24}$/.test(id);
};

// Sanitization helpers
const sanitizeInput = (input) => {
 if (typeof input !== 'string') return input;
 return validator.escape(input.trim());
};

const sanitizeEmail = (email) => {
 if (!email || typeof email !== 'string') return '';
 return validator.normalizeEmail(email.trim().toLowerCase());
};

const sanitizeUrl = (url) => {
 if (!url || typeof url !== 'string') return '';
 return validator.trim(url);
};

const sanitizeHashtag = (hashtag) => {
 if (!hashtag || typeof hashtag !== 'string') return '';
 return hashtag.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Export validators
module.exports = {
 // User validators
 validateEmail,
 validateUsername,
 validatePassword,
 
 // Post validators
 validatePostTitle,
 validatePostContent,
 validatePostUrl,
 validateHashtags,
 
 // Comment validators
 validateCommentContent,
 
 // Repository validators
 validateRepositoryName,
 validateRepositoryDescription,
 validateEmailList,
 
 // CSV validators
 validateCSVSize,
 validateCSVHeaders,
 
 // Pagination validators
 validatePagination,
 
 // Sort validators
 validateSortField,
 validateSortOrder,
 
 // Search validators
 validateSearchQuery,
 
 // Date validators
 validateDateRange,
 
 // Karma validators
 validateKarmaAmount,
 
 // MongoDB validators
 validateObjectId,
 
 // Sanitization helpers
 sanitizeInput,
 sanitizeEmail,
 sanitizeUrl,
 sanitizeHashtag
};
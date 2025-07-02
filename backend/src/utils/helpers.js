const crypto = require('crypto');
const validator = require('validator');
const moment = require('moment');

// Generate unique ID
const generateId = (prefix = '') => {
 return prefix + crypto.randomBytes(16).toString('hex');
};

// Generate unique slug from title
const generateSlug = (title) => {
 return title
   .toLowerCase()
   .replace(/[^\w\s-]/g, '')
   .replace(/\s+/g, '-')
   .replace(/--+/g, '-')
   .trim()
   .substring(0, 100);
};

// Sanitize HTML content
const sanitizeHtml = (html) => {
 return html
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#x27;')
   .replace(/\//g, '&#x2F;');
};

// Extract domain from URL
const extractDomain = (url) => {
 try {
   const urlObj = new URL(url);
   return urlObj.hostname.replace('www.', '');
 } catch (e) {
   return null;
 }
};

// Calculate reading time
const calculateReadingTime = (text) => {
 const wordsPerMinute = 200;
 const wordCount = text.trim().split(/\s+/).length;
 const readingTime = Math.ceil(wordCount / wordsPerMinute);
 return readingTime;
};

// Format karma number
const formatKarma = (karma) => {
 if (karma >= 1000000) {
   return (karma / 1000000).toFixed(1) + 'M';
 } else if (karma >= 1000) {
   return (karma / 1000).toFixed(1) + 'k';
 }
 return karma.toString();
};

// Generate email hash for avatars
const generateEmailHash = (email) => {
 return crypto
   .createHash('md5')
   .update(email.toLowerCase().trim())
   .digest('hex');
};

// Paginate results
const paginate = (page = 1, limit = 30) => {
 const offset = (page - 1) * limit;
 return {
   offset,
   limit: Math.min(limit, 100)
 };
};

// Extract hashtags from text
const extractHashtags = (text) => {
 const hashtagRegex = /#[\w]+/g;
 const hashtags = text.match(hashtagRegex) || [];
 return hashtags.map(tag => tag.substring(1).toLowerCase());
};

// Validate email format
const isValidEmail = (email) => {
 return validator.isEmail(email);
};

// Generate random verification code
const generateVerificationCode = () => {
 return crypto.randomInt(100000, 999999).toString();
};

// Calculate post score (for ranking)
const calculatePostScore = (votes, ageInHours, gravity = 1.8) => {
 return (votes - 1) / Math.pow(ageInHours + 2, gravity);
};

// Format relative time
const formatRelativeTime = (date) => {
 return moment(date).fromNow();
};

// Check if URL is valid
const isValidUrl = (url) => {
 return validator.isURL(url, {
   protocols: ['http', 'https'],
   require_protocol: true
 });
};

// Generate username from email
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

// Rate limit key generator
const getRateLimitKey = (userId, action) => {
 return `ratelimit:${userId}:${action}:${Date.now()}`;
};

// Anonymize email for privacy
const anonymizeEmail = (email) => {
 const [localPart, domain] = email.split('@');
 const anonymized = localPart.substring(0, 3) + '***';
 return `${anonymized}@${domain}`;
};

// Calculate snowball growth rate
const calculateSnowballGrowth = (initialSize, currentSize, daysElapsed) => {
 if (daysElapsed === 0) return 0;
 const growthRate = ((currentSize - initialSize) / initialSize / daysElapsed) * 100;
 return Math.round(growthRate * 100) / 100;
};

// Generate unique repository slug
const generateRepositorySlug = (name) => {
 const slug = generateSlug(name);
 const uniqueSuffix = crypto.randomBytes(3).toString('hex');
 return `${slug}-${uniqueSuffix}`;
};

// Validate CSV file size
const validateCsvSize = (sizeInBytes, maxSizeMB = 10) => {
 const maxSizeBytes = maxSizeMB * 1024 * 1024;
 return sizeInBytes <= maxSizeBytes;
};

// Extract mentions from text
const extractMentions = (text) => {
 const mentionRegex = /@[\w]+/g;
 const mentions = text.match(mentionRegex) || [];
 return mentions.map(mention => mention.substring(1));
};

// Generate email post ID
const generateEmailPostId = () => {
 return `ep_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

// Check if email is from allowed domain
const isAllowedDomain = (email, allowedDomains = []) => {
 if (allowedDomains.length === 0) return true;
 const domain = email.split('@')[1];
 return allowedDomains.includes(domain);
};

// Calculate repository quality score
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

// Parse email command
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

// Generate shareable link
const generateShareableLink = (type, id) => {
 const baseUrl = process.env.BASE_URL || 'https://shadownews.com';
 return `${baseUrl}/${type}/${id}`;
};

// Calculate engagement score
const calculateEngagementScore = (views, votes, comments, shares) => {
 return Math.round(
   views * 0.1 + votes * 0.3 + comments * 0.4 + shares * 0.2
 );
};

// Batch process async operations
const batchProcess = async (items, batchSize, processor) => {
 const results = [];
 
 for (let i = 0; i < items.length; i += batchSize) {
   const batch = items.slice(i, i + batchSize);
   const batchResults = await Promise.all(batch.map(processor));
   results.push(...batchResults);
 }
 
 return results;
};

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
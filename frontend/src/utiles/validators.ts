// Email validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHADOWNEWS_EMAIL_REGEX = /^[a-zA-Z0-9_-]+@shadownews\.community$/;
const DOMAIN_BLACKLIST = ['tempmail.com', 'throwaway.email', 'guerrillamail.com'];

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Username requirements
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const RESERVED_USERNAMES = ['admin', 'root', 'system', 'shadownews', 'support', 'api', 'mail'];

// Post and comment requirements
const POST_TITLE_MIN_LENGTH = 5;
const POST_TITLE_MAX_LENGTH = 300;
const POST_BODY_MAX_LENGTH = 10000;
const COMMENT_MIN_LENGTH = 2;
const COMMENT_MAX_LENGTH = 5000;

// URL validation
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// Hashtag validation
const HASHTAG_REGEX = /^#[a-zA-Z0-9_]{1,30}$/;
const MAX_HASHTAGS_PER_POST = 5;

// CSV validation
const MAX_CSV_SIZE_MB = 10;
const MAX_CSV_ROWS = 10000;
const ALLOWED_CSV_HEADERS = ['email', 'name', 'organization', 'tags'];

// Repository validation
const REPOSITORY_NAME_REGEX = /^[a-zA-Z0-9\s_-]{3,50}$/;
const MIN_EMAILS_FOR_REPOSITORY = 10;
const MAX_EMAILS_PER_REPOSITORY = 50000;

// Validation functions
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const domain = email.split('@')[1].toLowerCase();
  if (DOMAIN_BLACKLIST.includes(domain)) {
    return { isValid: false, error: 'Temporary email addresses are not allowed' };
  }

  return { isValid: true };
};

export const validateShadownewsEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!SHADOWNEWS_EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid Shadownews email format' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return { isValid: false, error: 'Password must contain uppercase, lowercase, number, and special character' };
  }

  return { isValid: true };
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { isValid: false, error: 'Username must be 3-20 characters, alphanumeric with _ or -' };
  }

  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved' };
  }

  return { isValid: true };
};

export const validatePostTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }

  if (title.length < POST_TITLE_MIN_LENGTH) {
    return { isValid: false, error: `Title must be at least ${POST_TITLE_MIN_LENGTH} characters` };
  }

  if (title.length > POST_TITLE_MAX_LENGTH) {
    return { isValid: false, error: `Title must not exceed ${POST_TITLE_MAX_LENGTH} characters` };
  }

  return { isValid: true };
};

export const validatePostBody = (body: string): { isValid: boolean; error?: string } => {
  if (body && body.length > POST_BODY_MAX_LENGTH) {
    return { isValid: false, error: `Post body must not exceed ${POST_BODY_MAX_LENGTH} characters` };
  }

  return { isValid: true };
};

export const validateComment = (comment: string): { isValid: boolean; error?: string } => {
  if (!comment || comment.trim().length === 0) {
    return { isValid: false, error: 'Comment is required' };
  }

  if (comment.length < COMMENT_MIN_LENGTH) {
    return { isValid: false, error: `Comment must be at least ${COMMENT_MIN_LENGTH} characters` };
  }

  if (comment.length > COMMENT_MAX_LENGTH) {
    return { isValid: false, error: `Comment must not exceed ${COMMENT_MAX_LENGTH} characters` };
  }

  return { isValid: true };
};

export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: true }; // URL is optional
  }

  if (!URL_REGEX.test(url)) {
    return { isValid: false, error: 'Invalid URL format' };
  }

  return { isValid: true };
};

export const validateHashtag = (hashtag: string): { isValid: boolean; error?: string } => {
  if (!HASHTAG_REGEX.test(hashtag)) {
    return { isValid: false, error: 'Hashtag must start with # and contain only letters, numbers, or underscores (max 30 chars)' };
  }

  return { isValid: true };
};

export const validateHashtags = (hashtags: string[]): { isValid: boolean; error?: string } => {
  if (hashtags.length > MAX_HASHTAGS_PER_POST) {
    return { isValid: false, error: `Maximum ${MAX_HASHTAGS_PER_POST} hashtags allowed per post` };
  }

  for (const hashtag of hashtags) {
    const result = validateHashtag(hashtag);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
};

export const validateCSVFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  if (!file.name.endsWith('.csv')) {
    return { isValid: false, error: 'File must be in CSV format' };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_CSV_SIZE_MB) {
    return { isValid: false, error: `File size must not exceed ${MAX_CSV_SIZE_MB}MB` };
  }

  return { isValid: true };
};

export const validateCSVHeaders = (headers: string[]): { isValid: boolean; error?: string } => {
  if (!headers.includes('email')) {
    return { isValid: false, error: 'CSV must contain an "email" column' };
  }

  const invalidHeaders = headers.filter(h => !ALLOWED_CSV_HEADERS.includes(h));
  if (invalidHeaders.length > 0) {
    return { isValid: false, error: `Invalid headers: ${invalidHeaders.join(', ')}. Allowed: ${ALLOWED_CSV_HEADERS.join(', ')}` };
  }

  return { isValid: true };
};

export const validateCSVRowCount = (rowCount: number): { isValid: boolean; error?: string } => {
  if (rowCount > MAX_CSV_ROWS) {
    return { isValid: false, error: `CSV must not exceed ${MAX_CSV_ROWS} rows` };
  }

  return { isValid: true };
};

export const validateRepositoryName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Repository name is required' };
  }

  if (!REPOSITORY_NAME_REGEX.test(name)) {
    return { isValid: false, error: 'Repository name must be 3-50 characters, alphanumeric with spaces, _ or -' };
  }

  return { isValid: true };
};

export const validateRepositoryEmails = (emails: string[]): { isValid: boolean; error?: string } => {
  if (emails.length < MIN_EMAILS_FOR_REPOSITORY) {
    return { isValid: false, error: `Repository must contain at least ${MIN_EMAILS_FOR_REPOSITORY} emails` };
  }

  if (emails.length > MAX_EMAILS_PER_REPOSITORY) {
    return { isValid: false, error: `Repository cannot exceed ${MAX_EMAILS_PER_REPOSITORY} emails` };
  }

  return { isValid: true };
};

export const validateEmailList = (emails: string[]): { isValid: boolean; invalidEmails: string[] } => {
  const invalidEmails: string[] = [];

  emails.forEach(email => {
    const result = validateEmail(email);
    if (!result.isValid) {
      invalidEmails.push(email);
    }
  });

  return {
    isValid: invalidEmails.length === 0,
    invalidEmails
  };
};

// Form validation helpers
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateRegistrationForm = (data: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error!;
  }

  const usernameResult = validateUsername(data.username);
  if (!usernameResult.isValid) {
    errors.username = usernameResult.error!;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error!;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePostForm = (data: {
  title: string;
  url?: string;
  body?: string;
  hashtags: string[];
}): ValidationResult => {
  const errors: Record<string, string> = {};

  const titleResult = validatePostTitle(data.title);
  if (!titleResult.isValid) {
    errors.title = titleResult.error!;
  }

  if (data.url) {
    const urlResult = validateUrl(data.url);
    if (!urlResult.isValid) {
      errors.url = urlResult.error!;
    }
  }

  if (data.body) {
    const bodyResult = validatePostBody(data.body);
    if (!bodyResult.isValid) {
      errors.body = bodyResult.error!;
    }
  }

  const hashtagsResult = validateHashtags(data.hashtags);
  if (!hashtagsResult.isValid) {
    errors.hashtags = hashtagsResult.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRepositoryForm = (data: {
  name: string;
  description?: string;
  emails: string[];
  isPublic: boolean;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  const nameResult = validateRepositoryName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  }

  const emailsResult = validateRepositoryEmails(data.emails);
  if (!emailsResult.isValid) {
    errors.emails = emailsResult.error!;
  }

  const emailListResult = validateEmailList(data.emails);
  if (!emailListResult.isValid) {
    errors.invalidEmails = `Invalid emails: ${emailListResult.invalidEmails.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const sanitizeHashtag = (hashtag: string): string => {
  if (!hashtag.startsWith('#')) {
    hashtag = '#' + hashtag;
  }
  return hashtag.toLowerCase().replace(/[^#a-z0-9_]/g, '');
};

export const sanitizeEmailList = (emails: string[]): string[] => {
  return emails
    .map(email => email.trim().toLowerCase())
    .filter(email => validateEmail(email).isValid);
};

// Rate limiting validators
export const validateRateLimit = (attempts: number, maxAttempts: number, windowMinutes: number): { isValid: boolean; error?: string } => {
  if (attempts >= maxAttempts) {
    return { isValid: false, error: `Too many attempts. Please try again in ${windowMinutes} minutes.` };
  }
  return { isValid: true };
};

// File upload validators
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeMB = 5;

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { isValid: false, error: `Image size must not exceed ${maxSizeMB}MB` };
  }

  return { isValid: true };
};

// Export all validators as a namespace for convenience
export const Validators = {
  email: validateEmail,
  shadownewsEmail: validateShadownewsEmail,
  password: validatePassword,
  username: validateUsername,
  postTitle: validatePostTitle,
  postBody: validatePostBody,
  comment: validateComment,
  url: validateUrl,
  hashtag: validateHashtag,
  hashtags: validateHashtags,
  csvFile: validateCSVFile,
  csvHeaders: validateCSVHeaders,
  csvRowCount: validateCSVRowCount,
  repositoryName: validateRepositoryName,
  repositoryEmails: validateRepositoryEmails,
  emailList: validateEmailList,
  registrationForm: validateRegistrationForm,
  postForm: validatePostForm,
  repositoryForm: validateRepositoryForm,
  rateLimit: validateRateLimit,
  imageFile: validateImageFile,
  sanitize: {
    input: sanitizeInput,
    hashtag: sanitizeHashtag,
    emailList: sanitizeEmailList
  }
};
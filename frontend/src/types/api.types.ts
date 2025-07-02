export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
  nextCursor?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  q?: string;
  filters?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  interests?: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CreatePostRequest {
  title: string;
  content?: string;
  url?: string;
  hashtags: string[];
  repositoryIds?: string[];
  scheduledAt?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  url?: string;
  hashtags?: string[];
  repositoryIds?: string[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface VoteRequest {
  direction: 'up' | 'down';
}

export interface CreateRepositoryRequest {
  name: string;
  description: string;
  topic: string;
  hashtags: string[];
  isPrivate?: boolean;
  qualityThreshold?: number;
  autoAddEmails?: boolean;
}

export interface UpdateRepositoryRequest {
  name?: string;
  description?: string;
  hashtags?: string[];
  isPrivate?: boolean;
  qualityThreshold?: number;
  autoAddEmails?: boolean;
}

export interface AddEmailsToRepositoryRequest {
  emails: string[];
  csvFile?: File;
  verificationRequired?: boolean;
}

export interface RemoveEmailsFromRepositoryRequest {
  emails: string[];
}

export interface MergeRepositoriesRequest {
  sourceRepositoryId: string;
  targetRepositoryId: string;
  keepSource?: boolean;
}

export interface EmailPostRequest {
  from: string;
  to: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: string;
  size: number;
}

export interface EmailDigestPreferences {
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  timeOfDay?: string;
  timezone?: string;
  includeTopics: string[];
  excludeTopics: string[];
  minKarmaThreshold?: number;
}

export interface UpdateUserProfileRequest {
  username?: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  interests?: string[];
  emailPreferences?: EmailDigestPreferences;
  privacySettings?: PrivacySettings;
}

export interface PrivacySettings {
  showEmail: boolean;
  allowRepositoryInvites: boolean;
  anonymousPosting: boolean;
  dataSharing: boolean;
  publicProfile: boolean;
}

export interface CSVUploadRequest {
  file: File;
  repositoryId: string;
  columnMapping?: {
    email: string;
    name?: string;
    tags?: string;
  };
  skipDuplicates?: boolean;
}

export interface CSVExportRequest {
  repositoryId: string;
  format: 'csv' | 'xlsx';
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SnowballAnalyticsRequest {
  repositoryId: string;
  dateRange?: {
    start: string;
    end: string;
  };
  metrics?: string[];
}

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
  id: string;
}

export enum WebSocketMessageType {
  POST_CREATED = 'POST_CREATED',
  POST_UPDATED = 'POST_UPDATED',
  POST_DELETED = 'POST_DELETED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  VOTE_CHANGED = 'VOTE_CHANGED',
  REPOSITORY_UPDATED = 'REPOSITORY_UPDATED',
  EMAIL_ADDED = 'EMAIL_ADDED',
  KARMA_UPDATED = 'KARMA_UPDATED',
  NOTIFICATION = 'NOTIFICATION',
  PRESENCE_UPDATE = 'PRESENCE_UPDATE',
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export enum NotificationType {
  POST_REPLY = 'POST_REPLY',
  COMMENT_REPLY = 'COMMENT_REPLY',
  MENTION = 'MENTION',
  KARMA_MILESTONE = 'KARMA_MILESTONE',
  REPOSITORY_INVITE = 'REPOSITORY_INVITE',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  DIGEST_READY = 'DIGEST_READY',
  SNOWBALL_GROWTH = 'SNOWBALL_GROWTH',
  SYSTEM = 'SYSTEM',
}

export interface BatchRequest<T> {
  operations: BatchOperation<T>[];
}

export interface BatchOperation<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: T;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  onUploadProgress?: (progress: FileUploadProgress) => void;
  onDownloadProgress?: (progress: FileUploadProgress) => void;
  signal?: AbortSignal;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    email: ServiceStatus;
    storage: ServiceStatus;
  };
  timestamp: string;
}

export interface ServiceStatus {
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface AIHashtagSuggestionRequest {
  content: string;
  existingTags?: string[];
  maxSuggestions?: number;
}

export interface AIHashtagSuggestionResponse {
  suggestions: Array<{
    tag: string;
    confidence: number;
    reason?: string;
  }>;
}

export interface EmailCommandRequest {
  command: string;
  parameters?: string[];
  context?: Record<string, any>;
}

export interface EmailCommandResponse {
  success: boolean;
  result?: any;
  message: string;
}

export interface KarmaTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  type: 'earned' | 'spent' | 'bonus';
  relatedEntity?: {
    type: 'post' | 'comment' | 'repository' | 'curation';
    id: string;
  };
  createdAt: string;
}

export interface RepositoryStats {
  totalEmails: number;
  verifiedEmails: number;
  pendingEmails: number;
  growthRate: number;
  engagementRate: number;
  snowballMultiplier: number;
  topContributors: Array<{
    userId: string;
    emailsAdded: number;
    karma: number;
  }>;
  recentActivity: Array<{
    type: string;
    count: number;
    timestamp: string;
  }>;
}

export interface ExportDataRequest {
  includeTypes: Array<'posts' | 'comments' | 'repositories' | 'emails' | 'karma'>;
  format: 'json' | 'csv' | 'zip';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ImportDataRequest {
  file: File;
  type: 'repository' | 'emails' | 'posts';
  options?: {
    skipDuplicates?: boolean;
    validateEmails?: boolean;
    autoTag?: boolean;
  };
}
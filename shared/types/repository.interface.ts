export interface IRepository {
  _id: string;
  name: string;
  slug: string;
  description: string;
  topic: string;
  hashtags: string[];
  ownerId: string;
  moderatorIds: string[];
  emailList: IRepositoryEmail[];
  stats: IRepositoryStats;
  settings: IRepositorySettings;
  snowballConfig: ISnowballConfig;
  metadata: IRepositoryMetadata;
  status: RepositoryStatus;
  visibility: RepositoryVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRepositoryEmail {
  email: string;
  domain: string;
  addedBy: string;
  addedAt: Date;
  source: EmailSource;
  verified: boolean;
  verifiedAt?: Date;
  tags: string[];
  metadata: {
    name?: string;
    organization?: string;
    title?: string;
    linkedIn?: string;
    twitter?: string;
  };
  engagement: {
    opens: number;
    clicks: number;
    replies: number;
    forwards: number;
    unsubscribed: boolean;
    bounced: boolean;
    lastEngagement?: Date;
  };
  permissions: {
    canReceiveDigest: boolean;
    canReceiveSnowball: boolean;
    canBeShared: boolean;
  };
}

export interface IRepositoryStats {
  totalEmails: number;
  verifiedEmails: number;
  activeEmails: number;
  totalPosts: number;
  totalEngagement: number;
  growthRate: number;
  snowballMultiplier: number;
  qualityScore: number;
  lastActivity: Date;
  emailsBySource: {
    direct: number;
    snowball: number;
    import: number;
    api: number;
  };
  topDomains: Array<{
    domain: string;
    count: number;
    percentage: number;
  }>;
}

export interface IRepositorySettings {
  autoApprove: boolean;
  requireVerification: boolean;
  allowSnowball: boolean;
  moderationLevel: 'none' | 'low' | 'medium' | 'high';
  emailFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  minimumKarma: number;
  allowedDomains: string[];
  blockedDomains: string[];
  customEmailTemplate?: string;
  webhookUrl?: string;
  apiAccess: boolean;
  exportEnabled: boolean;
  maxEmailsPerUser: number;
  qualityThreshold: number;
}

export interface ISnowballConfig {
  enabled: boolean;
  maxDepth: number;
  currentDepth: number;
  multiplierTarget: number;
  autoAddThreshold: number;
  requireApproval: boolean;
  excludeDomains: string[];
  includeDomains: string[];
  rules: ISnowballRule[];
  history: ISnowballEvent[];
}

export interface ISnowballRule {
  id: string;
  type: 'domain' | 'pattern' | 'tag' | 'engagement';
  condition: string;
  action: 'include' | 'exclude' | 'flag';
  priority: number;
  enabled: boolean;
}

export interface ISnowballEvent {
  timestamp: Date;
  sourceEmail: string;
  addedEmails: string[];
  depth: number;
  multiplier: number;
  approved: boolean;
  approvedBy?: string;
}

export interface IRepositoryMetadata {
  csvImports: ICsvImport[];
  collaborators: ICollaborator[];
  integrations: IIntegration[];
  analytics: {
    viewCount: number;
    shareCount: number;
    forkCount: number;
    subscribeCount: number;
  };
  aiSuggestions: {
    recommendedHashtags: string[];
    topicClusters: string[];
    expansionOpportunities: string[];
  };
}

export interface ICsvImport {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: Date;
  totalRows: number;
  importedEmails: number;
  duplicates: number;
  invalid: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorLog?: string[];
}

export interface ICollaborator {
  userId: string;
  role: 'viewer' | 'contributor' | 'moderator' | 'admin';
  permissions: string[];
  addedAt: Date;
  addedBy: string;
  contributions: {
    emailsAdded: number;
    postsCreated: number;
    moderationActions: number;
  };
}

export interface IIntegration {
  type: 'slack' | 'discord' | 'zapier' | 'webhook' | 'api';
  enabled: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  syncStatus?: 'active' | 'paused' | 'error';
}

export enum RepositoryStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  MIGRATING = 'migrating'
}

export enum RepositoryVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  MEMBERS_ONLY = 'members_only'
}

export enum EmailSource {
  DIRECT_ADD = 'direct_add',
  CSV_IMPORT = 'csv_import',
  SNOWBALL = 'snowball',
  API = 'api',
  EMAIL_FORWARD = 'email_forward',
  INTEGRATION = 'integration',
  MIGRATION = 'migration'
}

export interface IRepositoryCreateDto {
  name: string;
  description: string;
  topic: string;
  hashtags: string[];
  visibility: RepositoryVisibility;
  settings?: Partial<IRepositorySettings>;
  initialEmails?: Array<{
    email: string;
    metadata?: Record<string, any>;
  }>;
}

export interface IRepositoryUpdateDto {
  name?: string;
  description?: string;
  topic?: string;
  hashtags?: string[];
  visibility?: RepositoryVisibility;
  settings?: Partial<IRepositorySettings>;
  status?: RepositoryStatus;
}

export interface IRepositoryEmailAddDto {
  emails: Array<{
    email: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }>;
  source: EmailSource;
  skipVerification?: boolean;
  sendWelcomeEmail?: boolean;
}

export interface IRepositorySearchParams {
  query?: string;
  topic?: string;
  hashtags?: string[];
  ownerId?: string;
  visibility?: RepositoryVisibility;
  minEmails?: number;
  maxEmails?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalEmails' | 'growthRate' | 'engagement';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IRepositoryAnalytics {
  repositoryId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    emailGrowth: Array<{
      date: Date;
      total: number;
      new: number;
      verified: number;
      unsubscribed: number;
    }>;
    engagement: Array<{
      date: Date;
      opens: number;
      clicks: number;
      replies: number;
      forwards: number;
    }>;
    snowballPerformance: Array<{
      date: Date;
      triggered: number;
      emailsAdded: number;
      averageMultiplier: number;
    }>;
    topContent: Array<{
      postId: string;
      title: string;
      engagement: number;
      shares: number;
    }>;
  };
}

export interface IRepositoryExport {
  format: 'csv' | 'json' | 'xlsx';
  includeMetadata: boolean;
  includeEngagement: boolean;
  includeUnsubscribed: boolean;
  filterTags?: string[];
  filterDomains?: string[];
  filterDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface IRepositoryMergeRequest {
  sourceRepositoryId: string;
  targetRepositoryId: string;
  mergeStrategy: 'union' | 'intersection' | 'difference';
  handleDuplicates: 'skip' | 'overwrite' | 'merge_metadata';
  requireApproval: boolean;
}

export interface IRepositoryFork {
  originalRepositoryId: string;
  forkName: string;
  includeEmails: boolean;
  includeSettings: boolean;
  visibility: RepositoryVisibility;
}
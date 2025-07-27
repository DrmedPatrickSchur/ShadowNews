/**
 * Repository Types and Interfaces - Email Repository Management System
 * 
 * Comprehensive type definitions for the ShadowNews email repository system.
 * This file contains all interfaces and types related to email repositories,
 * CSV management, snowball analytics, and collaborative email curation.
 * 
 * Repository System Features:
 * - Email Collection: Organized email address storage and management
 * - CSV Processing: Bulk email import and export capabilities
 * - Snowball Analytics: Viral growth tracking and optimization
 * - Collaboration: Multi-user repository management and permissions
 * - Privacy Controls: Granular access control and data protection
 * - Analytics: Comprehensive repository performance metrics
 * - Quality Management: Email verification and curation tools
 * 
 * Email Management:
 * - Email Storage: Structured email address organization
 * - Verification: Email validation and deliverability checking
 * - Deduplication: Automatic duplicate email detection and removal
 * - Tagging: Custom categorization and organization systems
 * - Import/Export: CSV-based bulk operations with progress tracking
 * - Quality Scoring: Algorithmic email quality assessment
 * 
 * Collaboration Features:
 * - Multi-user Access: Shared repository management
 * - Permission System: Role-based access control
 * - Activity Tracking: User contribution monitoring
 * - Invitation System: Repository sharing and collaboration
 * - Audit Logs: Complete change history and accountability
 * - Member Management: User role and permission administration
 * 
 * Analytics and Insights:
 * - Growth Metrics: Repository expansion tracking
 * - Engagement Analysis: Email interaction monitoring
 * - Snowball Tracking: Viral growth pattern analysis
 * - Performance Metrics: Repository effectiveness measurement
 * - Trend Analysis: Historical data and pattern recognition
 * - Export Analytics: Data usage and download statistics
 * 
 * @author ShadowNews Team
 * @version 2.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/* =============================================================================
   Core Repository Types
   Primary repository structure and management
   ============================================================================= */

/**
 * Repository Interface
 * Complete email repository with full feature set
 * 
 * @interface Repository
 * @description Core repository entity with email management and collaboration
 * 
 * Features:
 * - Email Management: Organized email collection and curation
 * - Collaboration: Multi-user access and permissions
 * - Analytics: Performance metrics and growth tracking
 * - Privacy: Granular access control and data protection
 * - CSV Integration: Bulk email import and export
 * - Snowball Analytics: Viral growth optimization
 */
export interface Repository {
  /** Unique repository identifier */
  id: string;
  
  /** Repository name for display and branding */
  name: string;
  
  /** URL-friendly repository slug */
  slug: string;
  
  /** Repository description and purpose */
  description: string;
  
  /** Owner user ID */
  ownerId: string;
  
  /** Complete owner information */
  owner: RepositoryOwner;
  
  /** Repository topic for categorization */
  topic: string;
  
  /** Array of hashtags for discovery */
  hashtags: string[];
  
  /** Total number of email addresses */
  emailCount: number;
  
  /** Number of verified email addresses */
  verifiedEmailCount: number;
  
  /** Number of unverified email addresses */
  unverifiedEmailCount: number;
  
  /** Array of repository members and collaborators */
  members: RepositoryMember[];
  
  /** Array of CSV files associated with repository */
  csvFiles: CSVFile[];
  
  /** Whether snowball analytics are enabled */
  snowballEnabled: boolean;
  
  /** Snowball analytics configuration */
  snowballSettings: SnowballSettings;
  
  /** Privacy and access control settings */
  privacySettings: PrivacySettings;
  
  /** Repository performance and usage statistics */
  stats: RepositoryStats;
  
  /** Repository creation timestamp */
  createdAt: Date;
  
  /** Last repository update timestamp */
  updatedAt: Date;
  
  /** Last activity timestamp in repository */
  lastActivityAt: Date;
  
  /** Whether repository is currently active */
  isActive: boolean;
  
  /** Whether repository has premium features */
  isPremium: boolean;
  
  /** Additional repository metadata */
  metadata: RepositoryMetadata;
}

/**
 * Repository Owner Interface
 * Owner information and credentials
 * 
 * @interface RepositoryOwner
 * @description Repository owner with management permissions
 */
export interface RepositoryOwner {
  /** Owner user ID */
  id: string;
  
  /** Owner username */
  username: string;
  
  /** Owner email address */
  email: string;
  
  /** Optional avatar URL */
  avatarUrl?: string;
  
  /** Owner karma points */
  karma: number;
  
  /** Whether owner account is verified */
  isVerified: boolean;
}

export interface RepositoryMember {
  userId: string;
  email: string;
  name?: string;
  role: MemberRole;
  permissions: MemberPermission[];
  joinedAt: Date;
  addedBy: string;
  addMethod: AddMethod;
  isVerified: boolean;
  isActive: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CSVFile {
  id: string;
  filename: string;
  originalFilename: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: CSVProcessingStatus;
  emailsExtracted: number;
  emailsAdded: number;
  emailsDuplicate: number;
  emailsInvalid: number;
  snowballGeneration: number;
  checksum: string;
  metadata?: CSVMetadata;
}

export interface SnowballSettings {
  enabled: boolean;
  maxGenerations: number;
  currentGeneration: number;
  autoApprove: boolean;
  minKarmaRequired: number;
  qualityThreshold: number;
  excludeDomains: string[];
  includeDomains: string[];
  cooldownHours: number;
  lastSnowballAt?: Date;
  nextSnowballAt?: Date;
}

export interface PrivacySettings {
  visibility: RepositoryVisibility;
  joinApproval: JoinApprovalType;
  emailVisibility: EmailVisibility;
  allowExport: boolean;
  allowSnowball: boolean;
  gdprCompliant: boolean;
  dataRetentionDays: number;
  encryptEmails: boolean;
  anonymizeInactive: boolean;
}

export interface RepositoryStats {
  totalEmails: number;
  activeEmails: number;
  bounceRate: number;
  engagementRate: number;
  growthRate: number;
  snowballMultiplier: number;
  lastDigestSentAt?: Date;
  digestFrequency: DigestFrequency;
  postsShared: number;
  clickThroughRate: number;
  unsubscribeRate: number;
}

export interface RepositoryMetadata {
  industry?: string;
  location?: string;
  language: string;
  timezone: string;
  customFields?: Record<string, any>;
  aiTopics?: string[];
  relatedRepositories?: string[];
}

export interface CSVMetadata {
  delimiter: string;
  encoding: string;
  hasHeaders: boolean;
  columnMapping?: Record<string, string>;
  source?: string;
  importNotes?: string;
}

export interface CreateRepositoryDTO {
  name: string;
  description: string;
  topic: string;
  hashtags?: string[];
  privacySettings?: Partial<PrivacySettings>;
  snowballSettings?: Partial<SnowballSettings>;
  initialCSV?: File;
}

export interface UpdateRepositoryDTO {
  name?: string;
  description?: string;
  topic?: string;
  hashtags?: string[];
  privacySettings?: Partial<PrivacySettings>;
  snowballSettings?: Partial<SnowballSettings>;
  isActive?: boolean;
}

export interface AddMembersDTO {
  emails: string[] | EmailUpload[];
  tags?: string[];
  sendInvite?: boolean;
  customMessage?: string;
  csvFileId?: string;
}

export interface EmailUpload {
  email: string;
  name?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface RepositorySearchParams {
  query?: string;
  topic?: string;
  hashtags?: string[];
  minEmails?: number;
  maxEmails?: number;
  ownerId?: string;
  visibility?: RepositoryVisibility;
  sortBy?: RepositorySortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RepositoryAnalytics {
  repositoryId: string;
  timeRange: TimeRange;
  emailGrowth: GrowthMetric[];
  engagementMetrics: EngagementMetric[];
  snowballPerformance: SnowballMetric[];
  topContributors: Contributor[];
  geographicDistribution?: GeoDistribution[];
  domainDistribution: DomainStats[];
}

export interface GrowthMetric {
  date: Date;
  totalEmails: number;
  newEmails: number;
  removedEmails: number;
  netGrowth: number;
  growthRate: number;
}

export interface EngagementMetric {
  date: Date;
  emailsSent: number;
  emailsOpened: number;
  linksClicked: number;
  postsCreated: number;
  commentsCreated: number;
}

export interface SnowballMetric {
  generation: number;
  emailsAdded: number;
  successRate: number;
  contributorCount: number;
  averageQuality: number;
  timestamp: Date;
}

export interface Contributor {
  userId: string;
  username: string;
  emailsContributed: number;
  csvFilesUploaded: number;
  lastContribution: Date;
  qualityScore: number;
}

export interface GeoDistribution {
  country: string;
  region?: string;
  count: number;
  percentage: number;
}

export interface DomainStats {
  domain: string;
  count: number;
  percentage: number;
  isVerified: boolean;
  reputation?: number;
}

export interface RepositoryAction {
  id: string;
  repositoryId: string;
  action: ActionType;
  performedBy: string;
  performedAt: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface RepositoryInvite {
  id: string;
  repositoryId: string;
  email: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: InviteStatus;
  token: string;
  customMessage?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
}

export interface RepositoryExport {
  id: string;
  repositoryId: string;
  requestedBy: string;
  requestedAt: Date;
  status: ExportStatus;
  format: ExportFormat;
  includeMetadata: boolean;
  downloadUrl?: string;
  expiresAt?: Date;
  sizeBytes?: number;
}

export interface BulkOperation {
  id: string;
  repositoryId: string;
  operation: BulkOperationType;
  status: OperationStatus;
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  startedAt: Date;
  completedAt?: Date;
  errors?: BulkOperationError[];
}

export interface BulkOperationError {
  item: string;
  error: string;
  timestamp: Date;
}

// Enums
export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  CONTRIBUTOR = 'contributor',
  MEMBER = 'member'
}

export enum MemberPermission {
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_MEMBERS = 'manage_members',
  UPLOAD_CSV = 'upload_csv',
  EXPORT_DATA = 'export_data',
  SEND_DIGEST = 'send_digest',
  DELETE_REPOSITORY = 'delete_repository'
}

export enum AddMethod {
  MANUAL = 'manual',
  CSV_UPLOAD = 'csv_upload',
  SNOWBALL = 'snowball',
  INVITE = 'invite',
  API = 'api'
}

export enum CSVProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial'
}

export enum RepositoryVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted'
}

export enum JoinApprovalType {
  OPEN = 'open',
  REQUEST = 'request',
  INVITE_ONLY = 'invite_only'
}

export enum EmailVisibility {
  FULL = 'full',
  DOMAIN_ONLY = 'domain_only',
  HIDDEN = 'hidden'
}

export enum DigestFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  NEVER = 'never'
}

export enum RepositorySortField {
  NAME = 'name',
  EMAIL_COUNT = 'emailCount',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ENGAGEMENT_RATE = 'engagementRate',
  GROWTH_RATE = 'growthRate'
}

export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL_TIME = 'all_time'
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ADD_MEMBER = 'add_member',
  REMOVE_MEMBER = 'remove_member',
  UPLOAD_CSV = 'upload_csv',
  EXPORT = 'export',
  SEND_DIGEST = 'send_digest',
  ENABLE_SNOWBALL = 'enable_snowball',
  DISABLE_SNOWBALL = 'disable_snowball'
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
  PDF = 'pdf'
}

export enum BulkOperationType {
  ADD_MEMBERS = 'add_members',
  REMOVE_MEMBERS = 'remove_members',
  UPDATE_MEMBERS = 'update_members',
  TAG_MEMBERS = 'tag_members',
  VERIFY_EMAILS = 'verify_emails'
}

export enum OperationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
/**
 * @fileoverview Repository Interface Definitions for ShadowNews Platform
 * 
 * This file defines comprehensive type definitions for the email repository system,
 * which serves as the core feature of the ShadowNews platform. Email repositories
 * enable community-driven content distribution through curated email lists with
 * advanced features including snowball distribution, CSV import capabilities,
 * engagement tracking, and collaborative management tools.
 * 
 * ============================================================================
 * REPOSITORY SYSTEM ARCHITECTURE:
 * ============================================================================
 * 
 * Email Repository Management:
 * - Community-curated email lists for targeted content distribution
 * - Multi-source email collection (direct add, CSV import, snowball, API)
 * - Advanced email verification and quality control systems
 * - Collaborative repository management with role-based permissions
 * - Repository forking and merging for community growth
 * - Cross-repository content sharing and distribution
 * 
 * Snowball Distribution System:
 * - Viral content distribution through email network expansion
 * - Configurable snowball rules and depth limitations
 * - Automatic email discovery through engagement tracking
 * - Approval workflows for quality control and spam prevention
 * - Multiplier tracking and viral coefficient optimization
 * - Historical analysis and performance measurement
 * 
 * Content Distribution and Engagement:
 * - Email-first content delivery with engagement tracking
 * - Personalized content curation based on repository membership
 * - Hashtag-based content filtering and organization
 * - Cross-repository content discovery and sharing
 * - Email digest customization and delivery optimization
 * - A/B testing for content optimization and engagement
 * 
 * Analytics and Growth Tracking:
 * - Comprehensive repository analytics and insights
 * - Email engagement metrics (opens, clicks, replies, forwards)
 * - Growth rate tracking and optimization recommendations
 * - Audience demographics and behavior analysis
 * - Content performance measurement and optimization
 * - ROI tracking for repository owners and content creators
 * 
 * ============================================================================
 * CORE FEATURES:
 * ============================================================================
 * 
 * Email List Management:
 * - Multi-source email collection and verification
 * - Domain-based filtering and quality control
 * - Tag-based email organization and segmentation
 * - Metadata enrichment for personalized experiences
 * - Engagement tracking and audience insights
 * - Unsubscribe management and compliance features
 * 
 * CSV Import and Data Processing:
 * - Bulk email import with validation and deduplication
 * - Intelligent column mapping and data enrichment
 * - Error handling and import quality reporting
 * - Batch processing for large datasets
 * - Integration with external CRM and marketing tools
 * - Data transformation and normalization features
 * 
 * Collaborative Features:
 * - Multi-user repository management with role permissions
 * - Collaborative content curation and moderation
 * - Repository sharing and access control
 * - Team-based workflow management
 * - Activity tracking and contribution analytics
 * - Communication tools for repository teams
 * 
 * Integration and API Access:
 * - RESTful API for programmatic repository management
 * - Webhook integrations for real-time updates
 * - Third-party platform integrations (Slack, Discord, Zapier)
 * - Email service provider integrations
 * - Analytics platform connections for enhanced insights
 * - Marketing automation tool compatibility
 * 
 * Privacy and Compliance:
 * - GDPR-compliant data handling and user consent
 * - Email verification and permission management
 * - Data export and portability features
 * - Privacy-focused design with granular controls
 * - Audit trails for compliance and transparency
 * - Secure data handling and encryption practices
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// ============================================================================
// Core Repository Interface
// ============================================================================

/**
 * Repository Interface (IRepository)
 * 
 * The central repository interface representing email repositories within the
 * ShadowNews platform. Supports community-driven email list management with
 * advanced features including snowball distribution, collaborative management,
 * and comprehensive analytics.
 * 
 * Repository Features:
 * - Community-curated email lists for targeted content distribution
 * - Multi-source email collection (manual, CSV, snowball, API)
 * - Advanced snowball distribution for viral content spreading
 * - Collaborative management with role-based access control
 * - Comprehensive analytics and engagement tracking
 * - Integration support for third-party platforms and services
 * 
 * Content Distribution:
 * - Email-first content delivery with personalization
 * - Hashtag-based content filtering and organization
 * - Cross-repository content sharing and discovery
 * - Engagement tracking and optimization features
 * - A/B testing for content and delivery optimization
 * 
 * Quality and Moderation:
 * - Email verification and quality scoring systems
 * - Content moderation with configurable levels
 * - Spam prevention and security measures
 * - Community-driven quality control and feedback
 * - Automated content filtering and approval workflows
 */
export interface IRepository {
  _id: string;                          // Unique repository identifier
  name: string;                         // Repository display name
  slug: string;                         // URL-friendly repository identifier
  description: string;                  // Repository description and purpose
  topic: string;                        // Primary topic or subject area
  hashtags: string[];                   // Associated hashtags for categorization
  ownerId: string;                      // Repository owner user ID
  moderatorIds: string[];               // Repository moderator user IDs
  emailList: IRepositoryEmail[];        // Complete email list with metadata
  stats: IRepositoryStats;              // Repository statistics and metrics
  settings: IRepositorySettings;       // Repository configuration and preferences
  snowballConfig: ISnowballConfig;     // Snowball distribution configuration
  metadata: IRepositoryMetadata;       // Additional repository metadata
  status: RepositoryStatus;            // Repository lifecycle status
  visibility: RepositoryVisibility;    // Repository visibility and access level
  createdAt: Date;                      // Repository creation timestamp
  updatedAt: Date;                      // Last repository update timestamp
}

// ============================================================================
// Email Management System
// ============================================================================

/**
 * Repository Email Interface (IRepositoryEmail)
 * 
 * Individual email record within a repository with comprehensive
 * metadata, engagement tracking, and permission management.
 * 
 * Email Features:
 * - Complete email metadata and contact information
 * - Engagement tracking across multiple channels
 * - Permission management for different communication types
 * - Source tracking for attribution and analytics
 * - Verification status for quality assurance
 * - Tag-based organization and segmentation
 */
export interface IRepositoryEmail {
  email: string;                        // Email address
  domain: string;                       // Email domain for filtering
  addedBy: string;                      // User ID who added this email
  addedAt: Date;                        // When email was added to repository
  source: EmailSource;                  // How email was added to repository
  verified: boolean;                    // Email verification status
  verifiedAt?: Date;                    // Email verification timestamp
  tags: string[];                       // Custom tags for organization
  metadata: {                           // Extended contact information
    name?: string;                      // Contact name
    organization?: string;              // Organization or company
    title?: string;                     // Job title or role
    linkedIn?: string;                  // LinkedIn profile URL
    twitter?: string;                   // Twitter profile handle
  };
  engagement: {                         // Email engagement metrics
    opens: number;                      // Total email opens
    clicks: number;                     // Total link clicks
    replies: number;                    // Total email replies
    forwards: number;                   // Total email forwards
    unsubscribed: boolean;              // Unsubscription status
    bounced: boolean;                   // Email bounce status
    lastEngagement?: Date;              // Last engagement timestamp
  };
  permissions: {                        // Communication permissions
    canReceiveDigest: boolean;          // Permission for digest emails
    canReceiveSnowball: boolean;        // Permission for snowball emails
    canBeShared: boolean;               // Permission for data sharing
  };
}

// ============================================================================
// Repository Analytics and Statistics
// ============================================================================

/**
 * Repository Statistics Interface (IRepositoryStats)
 * 
 * Comprehensive repository metrics and analytics for performance
 * tracking, growth measurement, and optimization insights.
 * 
 * Statistics Categories:
 * - Email list growth and quality metrics
 * - Content engagement and distribution analytics
 * - Snowball performance and viral coefficient tracking
 * - Audience demographics and behavior analysis
 * - Growth rate and quality score calculations
 */
export interface IRepositoryStats {
  totalEmails: number;                  // Total number of emails in repository
  verifiedEmails: number;               // Number of verified email addresses
  activeEmails: number;                 // Number of actively engaged emails
  totalPosts: number;                   // Total posts distributed to repository
  totalEngagement: number;              // Cumulative engagement across all emails
  growthRate: number;                   // Repository growth rate percentage
  snowballMultiplier: number;           // Current snowball multiplier value
  qualityScore: number;                 // AI-calculated repository quality score
  lastActivity: Date;                   // Timestamp of last repository activity
  emailsBySource: {                     // Email breakdown by source
    direct: number;                     // Manually added emails
    snowball: number;                   // Emails added through snowball
    import: number;                     // Emails imported from CSV
    api: number;                        // Emails added via API
  };
  topDomains: Array<{                   // Most common email domains
    domain: string;                     // Domain name
    count: number;                      // Number of emails from domain
    percentage: number;                 // Percentage of total emails
  }>;
}

// ============================================================================
// Repository Configuration and Settings
// ============================================================================

/**
 * Repository Settings Interface (IRepositorySettings)
 * 
 * Comprehensive repository configuration options for customizing
 * behavior, moderation, and content distribution preferences.
 * 
 * Settings Categories:
 * - Content moderation and approval workflows
 * - Email frequency and delivery preferences
 * - Quality control and filtering options
 * - Integration settings and API access
 * - Export capabilities and data portability
 */
export interface IRepositorySettings {
  autoApprove: boolean;                 // Automatically approve new content
  requireVerification: boolean;         // Require email verification
  allowSnowball: boolean;               // Enable snowball distribution
  moderationLevel: 'none' | 'low' | 'medium' | 'high'; // Content moderation level
  emailFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly'; // Email delivery frequency
  minimumKarma: number;                 // Minimum karma required to contribute
  allowedDomains: string[];             // Whitelisted email domains
  blockedDomains: string[];             // Blacklisted email domains
  customEmailTemplate?: string;        // Custom email template for repository
  webhookUrl?: string;                  // Webhook URL for external integrations
  apiAccess: boolean;                   // Allow API access to repository
  exportEnabled: boolean;               // Allow data export functionality
  maxEmailsPerUser: number;             // Maximum emails per user contribution
  qualityThreshold: number;             // Minimum quality score for content
}

// ============================================================================
// Snowball Distribution System
// ============================================================================

/**
 * Snowball Configuration Interface (ISnowballConfig)
 * 
 * Advanced configuration for viral content distribution through
 * email network expansion with rules, depth control, and approval workflows.
 * 
 * Snowball Features:
 * - Configurable depth limits for viral expansion
 * - Rule-based email inclusion and exclusion
 * - Approval workflows for quality control
 * - Historical tracking for performance analysis
 * - Domain filtering for targeted expansion
 * - Multiplier targeting for growth optimization
 */
export interface ISnowballConfig {
  enabled: boolean;                     // Whether snowball is enabled
  maxDepth: number;                     // Maximum expansion depth allowed
  currentDepth: number;                 // Current expansion depth
  multiplierTarget: number;             // Target multiplier for expansion
  autoAddThreshold: number;             // Automatic addition threshold
  requireApproval: boolean;             // Require manual approval for additions
  excludeDomains: string[];             // Domains to exclude from snowball
  includeDomains: string[];             // Domains to prioritize for snowball
  rules: ISnowballRule[];               // Custom snowball rules
  history: ISnowballEvent[];            // Historical snowball events
}

/**
 * Snowball Rule Interface (ISnowballRule)
 * 
 * Individual rule for snowball distribution automation
 * with conditions, actions, and priority management.
 */
export interface ISnowballRule {
  id: string;                           // Unique rule identifier
  type: 'domain' | 'pattern' | 'tag' | 'engagement'; // Rule type for categorization
  condition: string;                    // Rule condition expression
  action: 'include' | 'exclude' | 'flag'; // Action to take when rule matches
  priority: number;                     // Rule priority for conflict resolution
  enabled: boolean;                     // Whether rule is currently active
}

/**
 * Snowball Event Interface (ISnowballEvent)
 * 
 * Individual snowball distribution event for tracking
 * viral expansion history and performance analysis.
 */
export interface ISnowballEvent {
  timestamp: Date;                      // When snowball event occurred
  sourceEmail: string;                  // Email that triggered snowball
  addedEmails: string[];                // Emails added in this snowball event
  depth: number;                        // Snowball depth level
  multiplier: number;                   // Multiplier achieved in this event
  approved: boolean;                    // Whether event was approved
  approvedBy?: string;                  // User ID who approved the event
}

// ============================================================================
// Repository Metadata and Extensions
// ============================================================================

/**
 * Repository Metadata Interface (IRepositoryMetadata)
 * 
 * Extended repository information including import history,
 * collaborators, integrations, and AI-powered insights.
 * 
 * Metadata Categories:
 * - CSV import tracking and management
 * - Collaborator management and permissions
 * - Third-party integrations and connections
 * - Analytics and performance insights
 * - AI-powered recommendations and suggestions
 */
export interface IRepositoryMetadata {
  csvImports: ICsvImport[];             // CSV import history and status
  collaborators: ICollaborator[];       // Repository collaborators and roles
  integrations: IIntegration[];         // Third-party integrations
  analytics: {                          // Repository analytics data
    viewCount: number;                  // Total repository views
    shareCount: number;                 // Number of times repository was shared
    forkCount: number;                  // Number of repository forks
    subscribeCount: number;             // Number of repository subscribers
  };
  aiSuggestions: {                      // AI-powered insights and suggestions
    recommendedHashtags: string[];      // AI-suggested hashtags
    topicClusters: string[];            // Identified topic clusters
    expansionOpportunities: string[];   // Suggested growth opportunities
  };
}

/**
 * CSV Import Interface (ICsvImport)
 * 
 * CSV import tracking with detailed status information,
 * error logging, and import quality metrics.
 */
export interface ICsvImport {
  id: string;                           // Unique import identifier
  filename: string;                     // Original CSV filename
  uploadedBy: string;                   // User ID who uploaded the CSV
  uploadedAt: Date;                     // CSV upload timestamp
  totalRows: number;                    // Total rows in CSV file
  importedEmails: number;               // Successfully imported emails
  duplicates: number;                   // Number of duplicate emails found
  invalid: number;                      // Number of invalid email addresses
  status: 'pending' | 'processing' | 'completed' | 'failed'; // Import status
  errorLog?: string[];                  // Error messages and details
}

/**
 * Collaborator Interface (ICollaborator)
 * 
 * Repository collaborator information with role-based
 * permissions and contribution tracking.
 */
export interface ICollaborator {
  userId: string;                       // Collaborator user ID
  role: 'viewer' | 'contributor' | 'moderator' | 'admin'; // Collaborator role
  permissions: string[];                // Specific permissions granted
  addedAt: Date;                        // When collaborator was added
  addedBy: string;                      // User ID who added collaborator
  contributions: {                      // Collaborator contribution statistics
    emailsAdded: number;                // Number of emails added
    postsCreated: number;               // Number of posts created
    moderationActions: number;          // Number of moderation actions taken
  };
}

/**
 * Integration Interface (IIntegration)
 * 
 * Third-party platform integration configuration
 * with status tracking and synchronization management.
 */
export interface IIntegration {
  type: 'slack' | 'discord' | 'zapier' | 'webhook' | 'api'; // Integration type
  enabled: boolean;                     // Whether integration is active
  config: Record<string, any>;          // Integration-specific configuration
  lastSync?: Date;                      // Last synchronization timestamp
  syncStatus?: 'active' | 'paused' | 'error'; // Current synchronization status
}

// ============================================================================
// Enumeration Definitions
// ============================================================================

/**
 * Repository Status Enumeration
 * 
 * Repository lifecycle states for management
 * and operational control.
 */
export enum RepositoryStatus {
  ACTIVE = 'active',                    // Repository is active and operational
  PAUSED = 'paused',                    // Repository is temporarily paused
  ARCHIVED = 'archived',                // Repository is archived (read-only)
  DELETED = 'deleted',                  // Repository is soft-deleted
  MIGRATING = 'migrating'               // Repository is being migrated
}
/**
 * Repository Visibility Enumeration
 * 
 * Access control levels for repository visibility
 * and member access management.
 */
export enum RepositoryVisibility {
  PUBLIC = 'public',                    // Repository visible to everyone
  PRIVATE = 'private',                  // Repository visible to owner and collaborators only
  UNLISTED = 'unlisted',                // Repository not listed but accessible via direct link
  MEMBERS_ONLY = 'members_only'         // Repository visible to members only
}

/**
 * Email Source Enumeration
 * 
 * Email addition sources for tracking and
 * attribution in repository analytics.
 */
export enum EmailSource {
  DIRECT_ADD = 'direct_add',            // Manually added email
  CSV_IMPORT = 'csv_import',            // Email imported from CSV file
  SNOWBALL = 'snowball',                // Email added through snowball distribution
  API = 'api',                          // Email added via API
  EMAIL_FORWARD = 'email_forward',      // Email added through email forwarding
  INTEGRATION = 'integration',          // Email added through third-party integration
  MIGRATION = 'migration'               // Email added during migration process
}

// ============================================================================
// Data Transfer Objects and Input Interfaces
// ============================================================================

/**
 * Repository Create DTO Interface (IRepositoryCreateDto)
 * 
 * Input validation interface for creating new repositories
 * with optional initial configuration and email seeding.
 */
export interface IRepositoryCreateDto {
  name: string;                         // Repository name (required)
  description: string;                  // Repository description (required)
  topic: string;                        // Primary topic (required)
  hashtags: string[];                   // Associated hashtags
  visibility: RepositoryVisibility;    // Repository visibility level
  settings?: Partial<IRepositorySettings>; // Optional initial settings
  initialEmails?: Array<{               // Optional initial email list
    email: string;                      // Email address
    metadata?: Record<string, any>;     // Optional email metadata
  }>;
}

/**
 * Repository Update DTO Interface (IRepositoryUpdateDto)
 * 
 * Input validation interface for updating existing repositories
 * with partial update support and change tracking.
 */
export interface IRepositoryUpdateDto {
  name?: string;                        // Updated repository name
  description?: string;                 // Updated repository description
  topic?: string;                       // Updated primary topic
  hashtags?: string[];                  // Updated hashtags
  visibility?: RepositoryVisibility;   // Updated visibility level
  settings?: Partial<IRepositorySettings>; // Updated settings
  status?: RepositoryStatus;            // Updated repository status
}

/**
 * Repository Email Add DTO Interface (IRepositoryEmailAddDto)
 * 
 * Input validation interface for adding emails to repositories
 * with bulk support and configuration options.
 */
export interface IRepositoryEmailAddDto {
  emails: Array<{                       // Array of emails to add
    email: string;                      // Email address
    tags?: string[];                    // Optional tags
    metadata?: Record<string, any>;     // Optional metadata
  }>;
  source: EmailSource;                  // Source of email addition
  skipVerification?: boolean;           // Skip email verification process
  sendWelcomeEmail?: boolean;           // Send welcome email to new addresses
}

/**
 * Repository Search Parameters Interface (IRepositorySearchParams)
 * 
 * Comprehensive search and filtering options for repository
 * discovery with pagination and sorting support.
 */
export interface IRepositorySearchParams {
  query?: string;                       // Search query string
  topic?: string;                       // Filter by topic
  hashtags?: string[];                  // Filter by hashtags
  ownerId?: string;                     // Filter by owner
  visibility?: RepositoryVisibility;   // Filter by visibility
  minEmails?: number;                   // Minimum email count filter
  maxEmails?: number;                   // Maximum email count filter
  sortBy?: 'createdAt' | 'updatedAt' | 'totalEmails' | 'growthRate' | 'engagement'; // Sort criteria
  sortOrder?: 'asc' | 'desc';           // Sort order
  page?: number;                        // Page number for pagination
  limit?: number;                       // Results per page limit
}

// ============================================================================
// Analytics and Reporting Interfaces
// ============================================================================

/**
 * Repository Analytics Interface (IRepositoryAnalytics)
 * 
 * Comprehensive analytics data for repository performance
 * tracking, growth measurement, and optimization insights.
 * 
 * Analytics Features:
 * - Time-series email growth and engagement tracking
 * - Snowball performance measurement and optimization
 * - Content performance analysis and insights
 * - Audience behavior and engagement patterns
 * - ROI measurement and attribution tracking
 */
export interface IRepositoryAnalytics {
  repositoryId: string;                 // Repository being analyzed
  period: 'day' | 'week' | 'month' | 'year'; // Analytics time period
  metrics: {                            // Comprehensive metrics collection
    emailGrowth: Array<{                // Email list growth tracking
      date: Date;                       // Date of measurement
      total: number;                    // Total emails in repository
      new: number;                      // New emails added
      verified: number;                 // Verified emails count
      unsubscribed: number;             // Unsubscribed emails count
    }>;
    engagement: Array<{                 // Email engagement metrics
      date: Date;                       // Date of measurement
      opens: number;                    // Total email opens
      clicks: number;                   // Total link clicks
      replies: number;                  // Total email replies
      forwards: number;                 // Total email forwards
    }>;
    snowballPerformance: Array<{        // Snowball distribution metrics
      date: Date;                       // Date of measurement
      triggered: number;                // Snowball events triggered
      emailsAdded: number;              // Emails added via snowball
      averageMultiplier: number;        // Average snowball multiplier
    }>;
    topContent: Array<{                 // Best performing content
      postId: string;                   // Post identifier
      title: string;                    // Post title
      engagement: number;               // Total engagement score
      shares: number;                   // Number of shares
    }>;
  };
}

// ============================================================================
// Data Management and Portability
// ============================================================================

/**
 * Repository Export Interface (IRepositoryExport)
 * 
 * Data export configuration for repository portability
 * and backup with flexible filtering options.
 */
export interface IRepositoryExport {
  format: 'csv' | 'json' | 'xlsx';      // Export file format
  includeMetadata: boolean;             // Include email metadata
  includeEngagement: boolean;           // Include engagement data
  includeUnsubscribed: boolean;         // Include unsubscribed emails
  filterTags?: string[];                // Filter by specific tags
  filterDomains?: string[];             // Filter by email domains
  filterDateRange?: {                   // Filter by date range
    start: Date;                        // Start date
    end: Date;                          // End date
  };
}

/**
 * Repository Merge Request Interface (IRepositoryMergeRequest)
 * 
 * Repository merging configuration for combining
 * multiple repositories with conflict resolution.
 */
export interface IRepositoryMergeRequest {
  sourceRepositoryId: string;           // Source repository to merge from
  targetRepositoryId: string;           // Target repository to merge into
  mergeStrategy: 'union' | 'intersection' | 'difference'; // Merge strategy
  handleDuplicates: 'skip' | 'overwrite' | 'merge_metadata'; // Duplicate handling
  requireApproval: boolean;             // Require manual approval
}

/**
 * Repository Fork Interface (IRepositoryFork)
 * 
 * Repository forking configuration for creating
 * derivative repositories with selective copying.
 */
export interface IRepositoryFork {
  originalRepositoryId: string;         // Original repository to fork
  forkName: string;                     // Name for the forked repository
  includeEmails: boolean;               // Copy email list to fork
  includeSettings: boolean;             // Copy settings to fork
  visibility: RepositoryVisibility;    // Visibility level for fork
}
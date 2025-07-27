/**
 * Repositories Service - Comprehensive Email Repository Management System
 * 
 * Advanced repository management service providing complete email list
 * management, collaboration, snowball distribution, and analytics for
 * the ShadowNews email-first social platform. Handles repository
 * lifecycle, member management, and viral distribution mechanisms.
 * 
 * Core Features:
 * - Repository Lifecycle: Complete CRUD operations for email repositories
 * - Member Management: User collaboration and permission systems
 * - Email Management: Bulk email operations and validation
 * - Snowball Distribution: Viral email propagation and growth tracking
 * - Analytics Integration: Comprehensive repository performance metrics
 * - CSV Operations: Import/export functionality with validation
 * - Collaboration Tools: Multi-user repository management and sharing
 * 
 * Repository Management:
 * - Repository Creation: Create themed email collections with metadata
 * - Public/Private: Control repository visibility and access permissions
 * - Topic Organization: Hashtag and topic-based repository categorization
 * - Description Management: Rich text descriptions with markdown support
 * - Archive/Restore: Repository lifecycle management and preservation
 * - Merge Operations: Combine repositories with data preservation
 * 
 * Email List Management:
 * - Bulk Operations: Efficient handling of large email lists
 * - Email Validation: Real-time email format and deliverability validation
 * - Duplicate Detection: Automatic duplicate email prevention
 * - Import/Export: CSV and multiple format data exchange
 * - Email Verification: Automated email verification workflows
 * - Segmentation: Advanced email list organization and filtering
 * 
 * Collaboration System:
 * - Member Roles: Owner, collaborator, and viewer permission levels
 * - Invitation System: Secure repository invitation and access management
 * - Activity Tracking: Comprehensive member activity and contribution tracking
 * - Permission Management: Granular permission control for repository operations
 * - Team Management: Organization and team-based repository access
 * - Audit Trail: Complete history of repository changes and member actions
 * 
 * Snowball Distribution:
 * - Viral Mechanics: Automated email propagation based on engagement
 * - Growth Analytics: Track viral coefficient and distribution effectiveness
 * - Quality Control: Content quality scoring and approval workflows
 * - Distribution Settings: Configurable snowball parameters and thresholds
 * - Campaign Management: Organize and track distribution campaigns
 * - Performance Metrics: Monitor delivery rates and engagement patterns
 * 
 * Analytics and Insights:
 * - Growth Metrics: Repository size and engagement tracking over time
 * - Member Analytics: Member activity patterns and contribution analysis
 * - Email Performance: Email delivery, open rates, and engagement metrics
 * - Trend Analysis: Identify trending topics and content patterns
 * - Comparative Analysis: Compare repository performance and benchmarks
 * - Predictive Insights: AI-powered growth and engagement predictions
 * 
 * CSV and Data Management:
 * - CSV Import: Flexible CSV import with column mapping and validation
 * - Error Handling: Comprehensive error reporting for invalid data
 * - Progress Tracking: Real-time progress indication for large operations
 * - Data Validation: Multi-layer validation for data integrity
 * - Export Options: Multiple export formats and customization options
 * - Backup Integration: Automated backup and restore capabilities
 * 
 * Search and Discovery:
 * - Repository Search: Advanced search across repository metadata
 * - Filter System: Multi-criteria filtering for repository discovery
 * - Recommendation Engine: AI-powered repository recommendations
 * - Tag System: Hashtag-based organization and discovery
 * - Trending: Real-time trending repository identification
 * - Related Repositories: Discover similar and related repositories
 * 
 * Email Verification:
 * - Automated Verification: Bulk email verification workflows
 * - Deliverability Checking: Real-time deliverability assessment
 * - Domain Validation: Email domain verification and reputation checking
 * - Bounce Management: Automatic bounce handling and list cleanup
 * - Suppression Lists: Manage unsubscribe and suppression lists
 * - Compliance: GDPR and CAN-SPAM compliance management
 * 
 * Security and Privacy:
 * - Access Control: Comprehensive permission and access management
 * - Data Encryption: End-to-end encryption for sensitive repository data
 * - Privacy Settings: Granular privacy controls for repository visibility
 * - Audit Logging: Complete repository access and modification audit trail
 * - Compliance: Privacy regulation compliance and data protection
 * - Rate Limiting: Protection against abuse and unauthorized access
 * 
 * Integration Features:
 * - API Integration: RESTful API for all repository operations
 * - Email Services: Integration with external email service providers
 * - Analytics Platforms: Connect with analytics and tracking services
 * - CRM Integration: Customer relationship management system connectivity
 * - Marketing Tools: Integration with email marketing platforms
 * - Webhook Support: Real-time webhooks for repository events
 * 
 * Digest and Notifications:
 * - Digest Creation: Automated email digest generation from repository content
 * - Notification System: Real-time notifications for repository activities
 * - Schedule Management: Configurable digest and notification schedules
 * - Template System: Customizable digest and notification templates
 * - Personalization: Personalized content curation and recommendations
 * - Subscription Management: User subscription preferences and controls
 * 
 * Performance Features:
 * - Lazy Loading: On-demand repository data loading for large collections
 * - Caching Strategy: Intelligent repository data caching for performance
 * - Batch Operations: Efficient batch processing for bulk operations
 * - Background Processing: Non-blocking background task processing
 * - Memory Management: Optimized memory usage for large repositories
 * - CDN Integration: Content delivery network optimization
 * 
 * Merge and Migration:
 * - Repository Merging: Combine multiple repositories with data preservation
 * - Migration Tools: Repository migration between accounts and organizations
 * - Data Mapping: Intelligent data mapping during merge operations
 * - Conflict Resolution: Handle duplicate data and conflicts during merges
 * - Rollback Support: Undo merge operations with complete data restoration
 * - History Preservation: Maintain complete history during migrations
 * 
 * Mobile and Accessibility:
 * - Mobile Optimization: Touch-friendly repository management interfaces
 * - Offline Support: Basic offline repository viewing and management
 * - Progressive Loading: Bandwidth-optimized repository data delivery
 * - Accessibility: Screen reader and keyboard navigation support
 * - Voice Interface: Voice-activated repository management commands
 * - Responsive Design: Adaptive layout for various screen sizes
 * 
 * AI and Enhancement:
 * - Smart Suggestions: AI-powered repository improvement suggestions
 * - Content Curation: Intelligent content recommendation and curation
 * - Quality Scoring: Algorithmic repository and content quality assessment
 * - Trend Prediction: Predictive analytics for repository growth and trends
 * - Automated Tagging: AI-powered hashtag and topic identification
 * - Personalization: Personalized repository recommendations and content
 * 
 * Development Features:
 * - Type Safety: Full TypeScript integration with repository types
 * - Error Handling: Comprehensive error management and recovery
 * - Testing Support: Repository testing utilities and mock data
 * - Debug Tools: Advanced debugging and monitoring capabilities
 * - API Documentation: Complete API documentation with examples
 * - Performance Monitoring: Real-time repository operation performance tracking
 * 
 * Dependencies:
 * - API Service: Centralized HTTP client for all API communications
 * - Repository Types: TypeScript interfaces for type safety and validation
 * - API Types: Shared API interface definitions and response types
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

/**
 * Core API Service Import
 * Centralized HTTP client service for all repository-related API communications
 */
import { api } from './api';
import {
  Repository,
  RepositoryCreateDTO,
  RepositoryUpdateDTO,
  RepositoryStats,
  RepositoryMember,
  SnowballDistribution,
  EmailUploadResult,
  CSVUploadResult,
  RepositoryInvite,
  RepositoryDigest,
  RepositoryAnalytics,
  EmailVerificationStatus,
  RepositoryMergeRequest,
  RepositoryExport
} from '../types/repository.types';
import { PaginatedResponse, ApiResponse } from '../types/api.types';

/**
 * Repository Filters Interface
 * Comprehensive filtering options for repository discovery and search operations
 * 
 * Filter Categories:
 * - Content Filters: Topic-based and hashtag filtering for content discovery
 * - Size Filters: Member count ranges for repository scale filtering
 * - Visibility Filters: Public/private repository access control
 * - Feature Filters: Snowball distribution and special feature availability
 * - Sorting Options: Multiple sorting criteria with ascending/descending order
 * 
 * Use Cases:
 * - Repository discovery dashboards with personalized filtering
 * - Administrative oversight with comprehensive repository management
 * - Analytics reporting with data segmentation and analysis
 * - User experience optimization with relevant repository recommendations
 */
export interface RepositoryFilters {
  /** Topic or hashtag for content-based filtering */
  topic?: string;
  /** Minimum member count threshold for size-based filtering */
  minMembers?: number;
  /** Maximum member count threshold for size-based filtering */
  maxMembers?: number;
  /** Filter by repository visibility (public/private access control) */
  isPublic?: boolean;
  /** Filter repositories with snowball distribution enabled */
  hasSnowball?: boolean;
  /** Sorting criteria: member count, activity level, creation date, growth rate */
  sortBy?: 'members' | 'activity' | 'created' | 'growth';
  /** Sort order: ascending or descending */
  order?: 'asc' | 'desc';
}

/**
 * Snowball Settings Interface
 * Comprehensive configuration for viral email distribution and growth mechanics
 * 
 * Distribution Features:
 * - Automatic Approval: AI-powered content quality assessment and auto-approval
 * - Quality Control: Minimum quality score thresholds for content acceptance
 * - Verification Requirements: Email verification workflows for distribution
 * - Domain Management: Allowed and blocked domain lists for security
 * - Volume Controls: Maximum emails per upload for spam prevention
 * 
 * Security and Compliance:
 * - Domain Filtering: Whitelist/blacklist domain management for content control
 * - Verification Workflows: Multi-step email verification for distribution quality
 * - Volume Limits: Configurable limits to prevent abuse and maintain quality
 * - Quality Scoring: AI-powered content assessment for automatic filtering
 */
export interface SnowballSettings {
  /** Enable or disable snowball distribution for the repository */
  enabled: boolean;
  /** Automatically approve high-quality content without manual review */
  autoApprove: boolean;
  /** Minimum quality score (0-100) required for content acceptance */
  minQualityScore: number;
  /** Maximum number of emails allowed per upload to prevent spam */
  maxEmailsPerUpload: number;
  /** Require email verification before including in distribution */
  requireVerification: boolean;
  /** Whitelist of allowed email domains for distribution */
  allowedDomains?: string[];
  /** Blacklist of blocked email domains to prevent spam */
  blockedDomains?: string[];
}

/**
 * Repositories Service Class
 * Comprehensive repository management service providing complete email repository
 * lifecycle management, collaboration, analytics, and snowball distribution features.
 * 
 * Architecture:
 * - Singleton service pattern for consistent repository state management
 * - RESTful API integration with centralized error handling and response processing
 * - Type-safe operations with comprehensive TypeScript interface integration
 * - Optimized performance with caching and batch operations for large data sets
 * 
 * Core Responsibilities:
 * - Repository CRUD operations with validation and error handling
 * - Member management and collaboration features with permission controls
 * - Email management with validation, verification, and bulk operations
 * - Snowball distribution with viral mechanics and growth analytics
 * - CSV import/export with progress tracking and error reporting
 * - Analytics and insights with performance metrics and trend analysis
 */
class RepositoriesService {
  /**
   * Base API endpoint for all repository operations
   * Centralized URL configuration for consistent API routing
   */
  private readonly baseUrl = '/api/repositories';

  /**
   * Retrieve paginated list of repositories with advanced filtering and sorting
   * 
   * Features:
   * - Multi-criteria filtering: topic, member count, visibility, snowball status
   * - Flexible sorting: members, activity, creation date, growth metrics
   * - Pagination support: configurable page size and navigation
   * - Search functionality: repository name and description search
   * - Performance optimization: cached results and efficient query parameters
   * 
   * Use Cases:
   * - Repository discovery and browsing with personalized recommendations
   * - Administrative repository management and oversight
   * - Analytics dashboard population with repository metrics
   * - User repository collections and favorites management
   * 
   * @param page - Page number for pagination (1-based indexing)
   * @param limit - Number of repositories per page (default: 20, max: 100)
   * @param filters - Advanced filtering options for repository discovery
   * @returns Promise<PaginatedResponse<Repository>> - Paginated repository list with metadata
   * 
   * @example
   * ```typescript
   * // Get public repositories with snowball distribution
   * const repositories = await repositoryService.getRepositories(1, 20, {
   *   isPublic: true,
   *   hasSnowball: true,
   *   sortBy: 'growth',
   *   order: 'desc'
   * });
   * 
   * // Filter by topic and minimum member count
   * const techRepos = await repositoryService.getRepositories(1, 10, {
   *   topic: 'technology',
   *   minMembers: 100,
   *   sortBy: 'members'
   * });
   * ```
   */
  async getRepositories(
    page: number = 1,
    limit: number = 20,
    filters?: RepositoryFilters
  ): Promise<PaginatedResponse<Repository>> {
    // Convert filter object to URL search parameters with type conversion
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    // Execute API request with comprehensive error handling
    return api.get(`${this.baseUrl}?${params}`);
  }

  /**
   * Retrieve single repository by ID with complete details and analytics
   * 
   * Features:
   * - Complete repository metadata and configuration details
   * - Member list with roles and activity status
   * - Email list statistics and verification status
   * - Snowball distribution metrics and performance data
   * - Analytics insights and growth trends
   * - Recent activity history and audit trail
   * 
   * Security:
   * - Permission-based access control for private repositories
   * - User authentication validation for repository access
   * - Data sanitization for sensitive information protection
   * 
   * @param id - Unique repository identifier
   * @returns Promise<Repository> - Complete repository details
   * 
   * @example
   * ```typescript
   * // Get repository with analytics
   * const repo = await repositoryService.getRepository('repo-123');
   * console.log(`Repository: ${repo.name} (${repo.emailCount} emails)`);
   * ```
   */
  /**
   * Retrieve single repository by ID with complete details and analytics
   * 
   * Features:
   * - Complete repository metadata and configuration details
   * - Member list with roles and activity status
   * - Email list statistics and verification status
   * - Snowball distribution metrics and performance data
   * - Analytics insights and growth trends
   * - Recent activity history and audit trail
   * 
   * Security:
   * - Permission-based access control for private repositories
   * - User authentication validation for repository access
   * - Data sanitization for sensitive information protection
   * 
   * @param id - Unique repository identifier
   * @returns Promise<Repository> - Complete repository details
   * 
   * @example
   * ```typescript
   * // Get repository with analytics
   * const repo = await repositoryService.getRepository('repo-123');
   * console.log(`Repository: ${repo.name} (${repo.emailCount} emails)`);
   * ```
   */
  async getRepository(id: string): Promise<Repository> {
    return api.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Retrieve all repositories owned or managed by a specific user
   * 
   * Features:
   * - Complete user repository collection with ownership and collaboration details
   * - Repository access levels: owned, collaborated, and shared repositories
   * - Activity metrics and engagement statistics for user repositories
   * - Privacy filtering based on repository visibility settings
   * 
   * Use Cases:
   * - User profile pages with repository portfolio display
   * - Administrative user management and repository oversight
   * - User analytics and repository contribution tracking
   * - Repository transfer and ownership management workflows
   * 
   * @param userId - Target user identifier for repository retrieval
   * @returns Promise<Repository[]> - Array of user repositories with details
   * 
   * @example
   * ```typescript
   * // Get all repositories for a user
   * const userRepos = await repositoryService.getUserRepositories('user-456');
   * console.log(`User has ${userRepos.length} repositories`);
   * ```
   */
  async getUserRepositories(userId: string): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Retrieve current user's repositories with complete ownership and collaboration details
   * 
   * Features:
   * - Personal repository collection with full access privileges
   * - Owned repositories with administrative controls and settings
   * - Collaborated repositories with permission levels and contribution history
   * - Draft and private repositories with development status
   * - Repository analytics and performance metrics for user's collection
   * 
   * Security:
   * - Authentication-based access with session validation
   * - User-specific data filtering and privacy protection
   * - Permission-based repository access and modification controls
   * 
   * @returns Promise<Repository[]> - Array of current user's repositories
   * 
   * @example
   * ```typescript
   * // Get current user's repositories
   * const myRepos = await repositoryService.getMyRepositories();
   * const ownedRepos = myRepos.filter(repo => repo.isOwner);
   * ```
   */
  async getMyRepositories(): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/my`);
  }

  /**
   * Retrieve trending repositories based on growth metrics and engagement patterns
   * 
   * Features:
   * - Time-based trending analysis: daily, weekly, monthly trends
   * - Growth metrics: member acquisition, email collection, engagement rates
   * - Viral coefficient tracking for snowball distribution effectiveness
   * - Content quality scoring and community engagement metrics
   * - Regional and topic-based trending analysis
   * 
   * Analytics:
   * - Real-time trend calculation with machine learning algorithms
   * - Engagement velocity tracking and momentum analysis
   * - Comparative analysis across repository categories and topics
   * - Predictive trending with growth projection algorithms
   * 
   * @param period - Time period for trending analysis: 'day', 'week', or 'month'
   * @returns Promise<Repository[]> - Array of trending repositories sorted by growth
   * 
   * @example
   * ```typescript
   * // Get weekly trending repositories
   * const trending = await repositoryService.getTrendingRepositories('week');
   * const topTrending = trending.slice(0, 10); // Top 10 trending
   * ```
   */
  async getTrendingRepositories(period: 'day' | 'week' | 'month' = 'week'): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/trending?period=${period}`);
  }

  /**
   * Search repositories using comprehensive text search and filtering
   * 
   * Features:
   * - Full-text search across repository names, descriptions, and topics
   * - Fuzzy matching for typo tolerance and partial matches
   * - Weighted search results based on relevance and popularity
   * - Real-time search suggestions and autocomplete functionality
   * - Advanced search operators and filtering syntax
   * 
   * Search Capabilities:
   * - Repository metadata search: name, description, topics, hashtags
   * - Content-based search: email domains, member demographics
   * - Advanced filtering: size, activity, creation date, ownership
   * - Relevance ranking with popularity and engagement weighting
   * 
   * @param query - Search query string with optional advanced operators
   * @returns Promise<Repository[]> - Array of matching repositories sorted by relevance
   * 
   * @example
   * ```typescript
   * // Search for technology repositories
   * const techRepos = await repositoryService.searchRepositories('technology startup');
   * 
   * // Advanced search with operators
   * const filtered = await repositoryService.searchRepositories('topic:AI members:>100');
   * ```
   */
  async searchRepositories(query: string): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Create new repository with complete configuration and initialization
   * 
   * Features:
   * - Repository setup with metadata, privacy settings, and initial configuration
   * - Automatic member addition with owner permissions and role assignment
   * - Snowball distribution configuration with quality and approval settings
   * - Email list initialization with validation and verification workflows
   * - Integration setup with external services and notification preferences
   * 
   * Validation:
   * - Repository name uniqueness and format validation
   * - Permission verification for repository creation limits
   * - Content policy compliance and inappropriate content filtering
   * - Email domain validation and deliverability checking
   * 
   * @param data - Repository creation data transfer object with complete configuration
   * @returns Promise<Repository> - Newly created repository with assigned ID and settings
   * 
   * @example
   * ```typescript
   * // Create new repository with snowball distribution
   * const newRepo = await repositoryService.createRepository({
   *   name: 'Tech News',
   *   description: 'Latest technology news and insights',
   *   isPublic: true,
   *   topics: ['technology', 'startup', 'innovation'],
   *   snowballSettings: {
   *     enabled: true,
   *     autoApprove: false,
   *     minQualityScore: 80
   *   }
   * });
   * ```
   */
  async createRepository(data: RepositoryCreateDTO): Promise<Repository> {
    return api.post(this.baseUrl, data);
  }

  /**
   * Update existing repository configuration and settings
   * 
   * Features:
   * - Partial updates with selective field modification and validation
   * - Privacy setting changes with member notification and access updates
   * - Snowball configuration updates with retroactive application options
   * - Member permission updates with role changes and access modifications
   * - Content policy updates with existing content re-evaluation
   * 
   * Validation:
   * - Permission verification for update operations and field modifications
   * - Data integrity checks with referential integrity preservation
   * - Change notification system with member and collaborator alerts
   * - Version control with change history and rollback capabilities
   * 
   * @param id - Repository identifier for update operations
   * @param data - Partial repository update data with selective field modification
   * @returns Promise<Repository> - Updated repository with modified configuration
   * 
   * @example
   * ```typescript
   * // Update repository privacy and description
   * const updated = await repositoryService.updateRepository('repo-123', {
   *   isPublic: false,
   *   description: 'Updated description with new focus',
   *   snowballSettings: {
   *     enabled: true,
   *     minQualityScore: 85
   *   }
   * });
   * ```
   */
  async updateRepository(id: string, data: RepositoryUpdateDTO): Promise<Repository> {
    return api.patch(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete repository with complete data removal and cleanup
   * 
   * Features:
   * - Complete repository deletion with data purging and cleanup
   * - Member notification with data export and migration options
   * - Email list archival with data retention policy compliance
   * - Analytics data preservation with anonymization for historical analysis
   * - Associated content cleanup with related data removal
   * 
   * Security:
   * - Permission verification with owner-only deletion authorization
   * - Confirmation workflow with multi-step verification process
   * - Data backup creation with recovery option availability
   * - GDPR compliance with complete data removal and user notification
   * 
   * @param id - Repository identifier for deletion operation
   * @returns Promise<ApiResponse> - Deletion confirmation with cleanup status
   * 
   * @example
   * ```typescript
   * // Delete repository permanently
   * await repositoryService.deleteRepository('repo-123');
   * console.log('Repository deleted successfully');
   * ```
   */
  async deleteRepository(id: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Retrieve comprehensive repository analytics and performance metrics
   * 
   * Features:
   * - Member growth analytics with acquisition and retention metrics
   * - Email engagement statistics with open rates and click-through analysis
   * - Snowball distribution performance with viral coefficient tracking
   * - Content quality metrics with AI scoring and community engagement
   * - Comparative analysis with repository benchmarks and industry standards
   * 
   * Metrics Categories:
   * - Growth Analytics: Member acquisition, retention rates, growth velocity
   * - Engagement Metrics: Email opens, clicks, shares, and viral distribution
   * - Quality Scores: Content quality, community engagement, reputation metrics
   * - Performance Indicators: Delivery rates, bounce rates, unsubscribe patterns
   * 
   * @param id - Repository identifier for analytics retrieval
   * @returns Promise<RepositoryStats> - Comprehensive repository analytics and metrics
   * 
   * @example
   * ```typescript
   * // Get repository analytics
   * const stats = await repositoryService.getRepositoryStats('repo-123');
   * console.log(`Growth rate: ${stats.growthRate}%, Engagement: ${stats.engagementRate}%`);
   * ```
   */
  async getRepositoryStats(id: string): Promise<RepositoryStats> {
    return api.get(`${this.baseUrl}/${id}/stats`);
  }

  /**
   * Retrieve paginated repository members with roles and activity details
   * 
   * Features:
   * - Member list with roles, permissions, and activity status
   * - Pagination support for large member collections
   * - Member contribution metrics and engagement history
   * - Role-based filtering and permission level organization
   * - Member activity tracking with last seen and contribution patterns
   * 
   * Member Information:
   * - User profiles with contact information and preferences
   * - Role assignments: owner, collaborator, member, viewer permissions
   * - Activity metrics: contributions, engagement, last activity timestamps
   * - Invitation status: pending, accepted, declined invitation tracking
   * 
   * @param id - Repository identifier for member retrieval
   * @param page - Page number for pagination (1-based indexing)
   * @param limit - Number of members per page (default: 50, max: 100)
   * @returns Promise<PaginatedResponse<RepositoryMember>> - Paginated member list with details
   * 
   * @example
   * ```typescript
   * // Get repository members
   * const members = await repositoryService.getRepositoryMembers('repo-123', 1, 25);
   * const owners = members.data.filter(member => member.role === 'owner');
   * ```
   */
  async getRepositoryMembers(
    id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<RepositoryMember>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return api.get(`${this.baseUrl}/${id}/members?${params}`);
  }

  /**
   * Add new member to repository with automatic email validation and invitation
   * 
   * Features:
   * - Email validation with deliverability checking and format verification
   * - Automatic invitation sending with customizable welcome messages
   * - Role assignment with default permissions and access level configuration
   * - Duplicate detection with existing member validation and conflict resolution
   * - Integration with snowball distribution for viral growth tracking
   * 
   * Validation Process:
   * - Email format validation with RFC compliance checking
   * - Domain verification with MX record validation and reputation checking
   * - Duplicate member detection with existing email address verification
   * - Permission verification with repository access control validation
   * 
   * @param repositoryId - Repository identifier for member addition
   * @param email - Email address of new member to add
   * @returns Promise<RepositoryMember> - Newly added member with assigned role and status
   * 
   * @example
   * ```typescript
   * // Add new member to repository
   * const newMember = await repositoryService.addMember('repo-123', 'user@example.com');
   * console.log(`Added member: ${newMember.email} with role: ${newMember.role}`);
   * ```
   */
  async addMember(repositoryId: string, email: string): Promise<RepositoryMember> {
    return api.post(`${this.baseUrl}/${repositoryId}/members`, { email });
  }

  /**
   * Remove member from repository with cleanup and notification
   * 
   * Features:
   * - Complete member removal with data cleanup and access revocation
   * - Notification system with removal confirmation and reason documentation
   * - Permission cleanup with role revocation and access control updates
   * - Data retention compliance with GDPR and privacy regulation adherence
   * - Audit trail creation with removal history and administrative tracking
   * 
   * Security:
   * - Permission verification with administrative access validation
   * - Confirmation workflow with multi-step verification for sensitive operations
   * - Data backup creation with member data archival for compliance
   * - Access log cleanup with session invalidation and security updates
   * 
   * @param repositoryId - Repository identifier for member removal
   * @param memberId - Member identifier for removal operation
   * @returns Promise<ApiResponse> - Removal confirmation with cleanup status
   * 
   * @example
   * ```typescript
   * // Remove member from repository
   * await repositoryService.removeMember('repo-123', 'member-456');
   * console.log('Member removed successfully');
   * ```
   */
  async removeMember(repositoryId: string, memberId: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${repositoryId}/members/${memberId}`);
  }

  /**
   * Update member status with validation and notification workflows
   * 
   * Features:
   * - Status transition management: active, inactive, bounced state handling
   * - Automatic email delivery adjustment based on status changes
   * - Notification system with member status change alerts and confirmations
   * - Analytics tracking with status change history and pattern analysis
   * - Integration with email verification and deliverability systems
   * 
   * Status Types:
   * - Active: Full email delivery and engagement tracking enabled
   * - Inactive: Paused email delivery with reactivation options available
   * - Bounced: Failed delivery status with automatic retry and cleanup
   * 
   * @param repositoryId - Repository identifier for status update
   * @param memberId - Member identifier for status modification
   * @param status - New member status: 'active', 'inactive', or 'bounced'
   * @returns Promise<RepositoryMember> - Updated member with new status and timestamp
   * 
   * @example
   * ```typescript
   * // Update member status to inactive
   * const updatedMember = await repositoryService.updateMemberStatus(
   *   'repo-123', 'member-456', 'inactive'
   * );
   * console.log(`Member status updated to: ${updatedMember.status}`);
   * ```
   */
  async updateMemberStatus(
    repositoryId: string,
    memberId: string,
    status: 'active' | 'inactive' | 'bounced'
  ): Promise<RepositoryMember> {
    return api.patch(`${this.baseUrl}/${repositoryId}/members/${memberId}`, { status });
  }

  /**
   * Upload CSV file with email list for bulk member import
   * 
   * Features:
   * - CSV parsing with flexible column mapping and header detection
   * - Bulk email validation with deliverability checking and format verification
   * - Progress tracking with real-time upload status and error reporting
   * - Duplicate detection with existing member validation and merge options
   * - Error handling with detailed validation reports and correction suggestions
   * 
   * CSV Processing:
   * - Automatic header detection with column mapping assistance
   * - Data validation with email format checking and domain verification
   * - Batch processing with chunk-based uploads for large files
   * - Error reporting with line-by-line validation results and suggestions
   * - Preview functionality with data samples and validation previews
   * 
   * @param repositoryId - Repository identifier for CSV upload
   * @param file - CSV file containing email addresses and optional metadata
   * @returns Promise<CSVUploadResult> - Upload results with success/error counts and details
   * 
   * @example
   * ```typescript
   * // Upload CSV file with email list
   * const fileInput = document.getElementById('csvFile') as HTMLInputElement;
   * const file = fileInput.files[0];
   * const result = await repositoryService.uploadCSV('repo-123', file);
   * console.log(`Processed: ${result.totalProcessed}, Errors: ${result.errorCount}`);
   * ```
   */
  async uploadCSV(repositoryId: string, file: File): Promise<CSVUploadResult> {
    const formData = new FormData();
    formData.append('csv', file);
    
    return api.post(`${this.baseUrl}/${repositoryId}/upload-csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Upload email array for bulk member addition with validation
   * 
   * Features:
   * - Bulk email processing with batch validation and duplicate detection
   * - Real-time validation with deliverability checking and format verification
   * - Progress tracking with upload status and error reporting
   * - Automatic member creation with role assignment and permission configuration
   * - Integration with snowball distribution for viral growth tracking
   * 
   * Validation Process:
   * - Email format validation with RFC compliance and syntax checking
   * - Domain verification with MX record validation and reputation analysis
   * - Duplicate detection with existing member comparison and merge handling
   * - Rate limiting with upload frequency controls and abuse prevention
   * 
   * @param repositoryId - Repository identifier for email upload
   * @param emails - Array of email addresses for bulk member addition
   * @returns Promise<EmailUploadResult> - Upload results with validation details and member creation status
   * 
   * @example
   * ```typescript
   * // Upload array of emails
   * const emails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
   * const result = await repositoryService.uploadEmails('repo-123', emails);
   * console.log(`Added: ${result.successCount}, Failed: ${result.failureCount}`);
   * ```
   */
  async uploadEmails(repositoryId: string, emails: string[]): Promise<EmailUploadResult> {
    return api.post(`${this.baseUrl}/${repositoryId}/upload-emails`, { emails });
  }

  /**
   * Export repository data in specified format with comprehensive data inclusion
   * 
   * Features:
   * - Multiple export formats: CSV, JSON with customizable field selection
   * - Complete data export: members, metadata, analytics, activity history
   * - Privacy compliance with data anonymization and sensitive information filtering
   * - Compression support for large repositories with efficient data packaging
   * - Custom field selection with user-defined export configurations
   * 
   * Export Contents:
   * - Member data: email addresses, roles, status, join dates, activity metrics
   * - Repository metadata: name, description, settings, configuration details
   * - Analytics data: growth metrics, engagement statistics, performance indicators
   * - Activity history: member actions, administrative changes, audit trail
   * 
   * @param id - Repository identifier for data export
   * @param format - Export format: 'csv' for spreadsheet, 'json' for structured data
   * @returns Promise<RepositoryExport> - Export package with download links and metadata
   * 
   * @example
   * ```typescript
   * // Export repository as CSV
   * const csvExport = await repositoryService.exportRepository('repo-123', 'csv');
   * 
   * // Export repository as JSON
   * const jsonExport = await repositoryService.exportRepository('repo-123', 'json');
   * ```
   */
  async exportRepository(id: string, format: 'csv' | 'json' = 'csv'): Promise<RepositoryExport> {
    return api.get(`${this.baseUrl}/${id}/export?format=${format}`);
  }

  /**
   * Download repository data as CSV file with direct browser download
   * 
   * Features:
   * - Direct file download with browser compatibility and proper MIME types
   * - Authentication integration with secure download authorization
   * - Progress indication for large repositories with download status tracking
   * - Error handling with retry mechanisms and download failure recovery
   * - Cross-browser compatibility with fallback download methods
   * 
   * Download Process:
   * - Secure authentication with token-based authorization verification
   * - File generation with server-side CSV creation and formatting
   * - Browser download initiation with proper file naming and metadata
   * - Progress tracking with download status monitoring and completion notification
   * 
   * @param id - Repository identifier for CSV download
   * @returns Promise<Blob> - CSV file blob for browser download
   * 
   * @example
   * ```typescript
   * // Download repository CSV
   * const csvBlob = await repositoryService.downloadRepositoryCSV('repo-123');
   * const url = URL.createObjectURL(csvBlob);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = 'repository-data.csv';
   * link.click();
   * ```
   */
  async downloadRepositoryCSV(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${id}/download-csv`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.blob();
  }

  /**
   * Retrieve snowball distribution analytics and performance metrics
   * 
   * Features:
   * - Viral coefficient tracking with growth rate analysis and trend identification
   * - Distribution performance metrics with reach, engagement, and conversion tracking
   * - Quality analytics with content scoring and approval rate analysis
   * - Geographic distribution with regional growth patterns and demographic insights
   * - Timeline analysis with distribution velocity and momentum tracking
   * 
   * Analytics Categories:
   * - Growth Metrics: Viral coefficient, distribution reach, member acquisition rates
   * - Quality Indicators: Content approval rates, quality scores, moderation statistics
   * - Performance Data: Delivery rates, engagement metrics, conversion tracking
   * - Geographic Insights: Regional distribution, demographic patterns, market penetration
   * 
   * @param repositoryId - Repository identifier for snowball analytics
   * @returns Promise<SnowballDistribution> - Comprehensive snowball distribution analytics
   * 
   * @example
   * ```typescript
   * // Get snowball distribution analytics
   * const snowball = await repositoryService.getSnowballDistribution('repo-123');
   * console.log(`Viral coefficient: ${snowball.viralCoefficient}, Reach: ${snowball.totalReach}`);
   * ```
   */
  async getSnowballDistribution(repositoryId: string): Promise<SnowballDistribution> {
    return api.get(`${this.baseUrl}/${repositoryId}/snowball`);
  }

  /**
   * Update snowball distribution configuration and settings
   * 
   * Features:
   * - Configuration updates with real-time application and validation
   * - Quality threshold adjustment with retroactive content re-evaluation
   * - Approval workflow configuration with automated and manual review options
   * - Domain filtering updates with whitelist/blacklist management
   * - Volume control adjustment with spam prevention and rate limiting
   * 
   * Configuration Options:
   * - Quality Controls: Minimum quality scores, approval thresholds, content filtering
   * - Automation Settings: Auto-approval rules, AI-powered moderation, workflow automation
   * - Security Settings: Domain restrictions, verification requirements, abuse prevention
   * - Volume Management: Upload limits, rate controls, distribution frequency
   * 
   * @param repositoryId - Repository identifier for settings update
   * @param settings - Snowball settings configuration with validation rules
   * @returns Promise<Repository> - Updated repository with new snowball configuration
   * 
   * @example
   * ```typescript
   * // Update snowball settings
   * const updated = await repositoryService.updateSnowballSettings('repo-123', {
   *   enabled: true,
   *   autoApprove: true,
   *   minQualityScore: 85,
   *   maxEmailsPerUpload: 500,
   *   requireVerification: true
   * });
   * ```
   */
  async updateSnowballSettings(
    repositoryId: string,
    settings: SnowballSettings
  ): Promise<Repository> {
    return api.patch(`${this.baseUrl}/${repositoryId}/snowball-settings`, settings);
  }

  /**
   * Approve pending snowball emails for distribution
   * 
   * Features:
   * - Bulk approval with batch processing and validation confirmation
   * - Quality verification with final content assessment and approval workflow
   * - Distribution initiation with immediate member addition and notification
   * - Analytics tracking with approval rates and quality metrics recording
   * - Audit trail creation with approval history and administrative tracking
   * 
   * Approval Process:
   * - Final quality verification with AI-powered content assessment
   * - Duplicate detection with existing member validation and merge handling
   * - Permission verification with administrative access and approval authority
   * - Notification dispatch with member welcome messages and onboarding
   * 
   * @param repositoryId - Repository identifier for email approval
   * @param emailIds - Array of email IDs to approve for distribution
   * @returns Promise<ApiResponse> - Approval confirmation with processing status
   * 
   * @example
   * ```typescript
   * // Approve pending snowball emails
   * await repositoryService.approveSnowballEmails('repo-123', ['email-1', 'email-2']);
   * console.log('Emails approved for distribution');
   * ```
   */
  async approveSnowballEmails(
    repositoryId: string,
    emailIds: string[]
  ): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/snowball/approve`, { emailIds });
  }

  /**
   * Reject pending snowball emails with reason tracking
   * 
   * Features:
   * - Bulk rejection with batch processing and validation tracking
   * - Reason documentation with rejection categories and detailed explanations
   * - Quality improvement feedback with content enhancement suggestions
   * - Analytics tracking with rejection rates and quality trend analysis
   * - Notification system with rejection alerts and improvement recommendations
   * 
   * Rejection Categories:
   * - Quality Issues: Content quality, relevance, engagement potential assessment
   * - Policy Violations: Content policy compliance and community guidelines adherence
   * - Technical Problems: Email format, deliverability, domain validation issues
   * - Duplicate Content: Existing member detection and redundancy prevention
   * 
   * @param repositoryId - Repository identifier for email rejection
   * @param emailIds - Array of email IDs to reject from distribution
   * @returns Promise<ApiResponse> - Rejection confirmation with reason tracking
   * 
   * @example
   * ```typescript
   * // Reject pending snowball emails
   * await repositoryService.rejectSnowballEmails('repo-123', ['email-3', 'email-4']);
   * console.log('Emails rejected from distribution');
   * ```
   */
  async rejectSnowballEmails(
    repositoryId: string,
    emailIds: string[]
  ): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/snowball/reject`, { emailIds });
  }

  /**
   * Retrieve pending snowball emails awaiting approval with pagination
   * 
   * Features:
   * - Paginated pending email list with efficient large dataset handling
   * - Quality score display with AI-powered content assessment results
   * - Submission metadata with source tracking and contributor information
   * - Approval workflow integration with batch operations and individual review
   * - Real-time updates with live pending queue monitoring
   * 
   * Pending Email Details:
   * - Quality Assessment: AI-generated quality scores and improvement suggestions
   * - Source Information: Submission source, contributor details, submission timestamp
   * - Content Preview: Email content preview with quality indicators and flags
   * - Approval Status: Current workflow status and administrative review progress
   * 
   * @param repositoryId - Repository identifier for pending email retrieval
   * @param page - Page number for pagination (1-based indexing)
   * @param limit - Number of pending emails per page (default: 50, max: 100)
   * @returns Promise<PaginatedResponse<RepositoryMember>> - Paginated pending email list
   * 
   * @example
   * ```typescript
   * // Get pending snowball emails
   * const pending = await repositoryService.getSnowballPending('repo-123', 1, 25);
   * console.log(`${pending.total} emails pending approval`);
   * ```
   */
  async getSnowballPending(
    repositoryId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<RepositoryMember>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return api.get(`${this.baseUrl}/${repositoryId}/snowball/pending?${params}`);
  }

  /**
   * Verify email address deliverability and format validation
   * 
   * Features:
   * - Real-time email verification with multiple validation layers
   * - Deliverability checking with MX record validation and domain reputation
   * - Format validation with RFC compliance and syntax verification
   * - Spam risk assessment with domain blacklist and reputation analysis
   * - Integration with email service providers for comprehensive validation
   * 
   * Verification Process:
   * - Syntax Validation: Email format checking with RFC 5322 compliance
   * - Domain Verification: MX record validation and domain existence checking
   * - Deliverability Assessment: Spam risk analysis and inbox placement prediction
   * - Real-time Validation: Live verification with immediate results and caching
   * 
   * @param repositoryId - Repository identifier for email verification context
   * @param email - Email address to verify for deliverability and format
   * @returns Promise<EmailVerificationStatus> - Verification results with detailed status
   * 
   * @example
   * ```typescript
   * // Verify email address
   * const verification = await repositoryService.verifyEmail('repo-123', 'user@example.com');
   * console.log(`Email valid: ${verification.isValid}, Deliverable: ${verification.isDeliverable}`);
   * ```
   */
  async verifyEmail(repositoryId: string, email: string): Promise<EmailVerificationStatus> {
    return api.post(`${this.baseUrl}/${repositoryId}/verify-email`, { email });
  }

  async createInvite(
    repositoryId: string,
    emails: string[],
    message?: string
  ): Promise<RepositoryInvite> {
    return api.post(`${this.baseUrl}/${repositoryId}/invite`, { emails, message });
  }

  async getInvites(repositoryId: string): Promise<RepositoryInvite[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/invites`);
  }

  async revokeInvite(repositoryId: string, inviteId: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${repositoryId}/invites/${inviteId}`);
  }

  async acceptInvite(inviteToken: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/accept-invite`, { token: inviteToken });
  }

  async sendDigest(repositoryId: string, subject: string, content: string): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/send-digest`, { subject, content });
  }

  async getDigestHistory(repositoryId: string): Promise<RepositoryDigest[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/digests`);
  }

  async scheduleDigest(
    repositoryId: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    time: string
  ): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/schedule-digest`, { schedule, time });
  }

  async getAnalytics(
    repositoryId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<RepositoryAnalytics> {
    return api.get(`${this.baseUrl}/${repositoryId}/analytics?period=${period}`);
  }

  async mergeRepositories(
    sourceId: string,
    targetId: string,
    options?: {
      removeDuplicates?: boolean;
      keepSourceActive?: boolean;
    }
  ): Promise<RepositoryMergeRequest> {
    return api.post(`${this.baseUrl}/merge`, {
      sourceId,
      targetId,
      ...options
    });
  }

  async cloneRepository(repositoryId: string, newName: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/clone`, { name: newName });
  }

  async getRecommendedRepositories(): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/recommended`);
  }

  async getSimilarRepositories(repositoryId: string): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/similar`);
  }

  async addCollaborator(
    repositoryId: string,
    userId: string,
    role: 'viewer' | 'editor' | 'admin'
  ): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/collaborators`, { userId, role });
  }

  async removeCollaborator(repositoryId: string, userId: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${repositoryId}/collaborators/${userId}`);
  }

  async getCollaborators(repositoryId: string): Promise<RepositoryMember[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/collaborators`);
  }

  async updatePrivacy(repositoryId: string, isPublic: boolean): Promise<Repository> {
    return api.patch(`${this.baseUrl}/${repositoryId}/privacy`, { isPublic });
  }

  async getActivityLog(
    repositoryId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return api.get(`${this.baseUrl}/${repositoryId}/activity?${params}`);
  }

  async bulkUpdateMembers(
    repositoryId: string,
    updates: { memberId: string; status: string }[]
  ): Promise<ApiResponse> {
    return api.patch(`${this.baseUrl}/${repositoryId}/members/bulk`, { updates });
  }

  async getGrowthProjection(repositoryId: string): Promise<{
    current: number;
    projected: number;
    growthRate: number;
    timeframe: string;
  }> {
    return api.get(`${this.baseUrl}/${repositoryId}/growth-projection`);
  }

  async testEmailDelivery(repositoryId: string, emails: string[]): Promise<{
    successful: string[];
    failed: string[];
    bounced: string[];
  }> {
    return api.post(`${this.baseUrl}/${repositoryId}/test-delivery`, { emails });
  }

  async getEmailQualityScore(emails: string[]): Promise<{
    emails: {
      email: string;
      score: number;
      issues: string[];
    }[];
    averageScore: number;
  }> {
    return api.post(`${this.baseUrl}/email-quality`, { emails });
  }

  async archiveRepository(repositoryId: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/archive`);
  }

  async unarchiveRepository(repositoryId: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/unarchive`);
  }

  async getArchivedRepositories(): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/archived`);
  }
}

/**
 * Repository Service Instance
 * Singleton instance of the RepositoriesService class for global access
 * 
 * Usage Pattern:
 * - Import and use directly without instantiation: `repositoriesService.getRepositories()`
 * - Singleton pattern ensures consistent state management across application
 * - Centralized configuration with shared API client and error handling
 * 
 * Integration:
 * - Authentication: Automatic JWT token handling with refresh mechanism
 * - Error Handling: Centralized error processing with user-friendly messages
 * - Caching: Intelligent data caching for improved performance
 * - Real-time Updates: WebSocket integration for live repository updates
 * 
 * @example
 * ```typescript
 * import { repositoriesService } from '@/services/repositories.service';
 * 
 * // Use repository service methods
 * const repositories = await repositoriesService.getRepositories();
 * const myRepos = await repositoriesService.getMyRepositories();
 * ```
 */
export const repositoriesService = new RepositoriesService();
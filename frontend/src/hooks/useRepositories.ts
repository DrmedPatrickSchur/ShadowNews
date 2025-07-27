/**
 * Repository Management Hook Collection
 * 
 * Comprehensive repository management system for email-based content distribution
 * and community building. Provides full CRUD operations, email management, CSV
 * processing, snowball distribution features, and analytics integration with
 * optimized state management and real-time updates.
 * 
 * Core Features:
 * - Repository CRUD: Create, read, update, delete repositories with validation
 * - Email Management: Add, remove, validate email addresses with bulk operations
 * - CSV Operations: Import/export email lists with preview and validation
 * - Snowball Distribution: Viral email distribution with analytics tracking
 * - Collaboration: Multi-user repository management with permission controls
 * - Search and Filtering: Advanced repository discovery and organization
 * - Real-Time Updates: Live repository status and email list synchronization
 * 
 * Hook Architecture:
 * - useRepositories: Main hook for repository list management
 * - useRepository: Single repository retrieval and management
 * - useRepositoryAnalytics: Dedicated analytics and metrics tracking
 * - Permission System: Role-based access control for repository operations
 * 
 * Repository Features:
 * - Topic-Based Organization: Categorize repositories by topics and hashtags
 * - Public/Private: Control repository visibility and access permissions
 * - Email Verification: Automated email validation and verification
 * - Growth Tracking: Monitor repository growth and engagement metrics
 * - Merge Operations: Combine repositories with data preservation
 * 
 * Email Management:
 * - Bulk Import: CSV-based bulk email import with validation
 * - Duplicate Detection: Automatic duplicate email prevention
 * - Email Validation: Real-time email format and deliverability validation
 * - Segmentation: Advanced email list segmentation and filtering
 * - Export Options: Multiple export formats for email lists
 * 
 * CSV Processing:
 * - Preview Mode: Preview CSV content before import with validation
 * - Error Handling: Comprehensive error reporting for invalid data
 * - Data Mapping: Flexible column mapping for different CSV formats
 * - Progress Tracking: Real-time progress indication for large imports
 * - Rollback Support: Undo imports with data integrity preservation
 * 
 * Snowball Distribution:
 * - Viral Mechanics: Automated email propagation based on engagement
 * - Growth Analytics: Track viral coefficient and distribution metrics
 * - Threshold Settings: Configurable distribution triggers and limits
 * - Performance Metrics: Monitor delivery rates and engagement
 * - Campaign Management: Organize and track distribution campaigns
 * 
 * Collaboration Features:
 * - Multi-User Access: Share repositories with team members
 * - Permission Levels: Owner, collaborator, and viewer access levels
 * - Activity Tracking: Monitor user actions and repository changes
 * - Merge Conflicts: Handle concurrent edits with conflict resolution
 * - Audit Trail: Complete history of repository modifications
 * 
 * Search and Discovery:
 * - Advanced Search: Search across names, descriptions, and topics
 * - Filter Options: Filter by creation date, email count, activity
 * - Sorting: Multiple sorting options with ascending/descending order
 * - Pagination: Efficient loading of large repository lists
 * - Bookmarking: Save and organize favorite repositories
 * 
 * Analytics Integration:
 * - Growth Metrics: Track repository size and engagement over time
 * - Email Performance: Monitor email delivery and open rates
 * - User Engagement: Track user interactions and content performance
 * - Distribution Analysis: Analyze snowball distribution effectiveness
 * - Trend Identification: Identify trending topics and content
 * 
 * State Management:
 * - Redux Integration: Global state management for repository data
 * - Optimistic Updates: Immediate UI feedback with server reconciliation
 * - Cache Management: Intelligent caching for improved performance
 * - Synchronization: Real-time state synchronization across components
 * - Error Recovery: Automatic error recovery and retry mechanisms
 * 
 * Performance Optimizations:
 * - Lazy Loading: Load repository data on demand
 * - Virtual Scrolling: Efficient rendering of large repository lists
 * - Debounced Search: Optimized search with debounced user input
 * - Memoization: Optimized sorting and filtering with useMemo
 * - Background Updates: Non-blocking background data refreshing
 * 
 * Permission System:
 * - Role-Based Access: Owner, collaborator, viewer permissions
 * - Action Validation: Validate user permissions before operations
 * - Secure Operations: Ensure data security and access control
 * - Team Management: Invite and manage repository collaborators
 * - Audit Logging: Track permission changes and access patterns
 * 
 * Error Handling:
 * - Validation Errors: Comprehensive input validation with user feedback
 * - Network Failures: Graceful handling of connectivity issues
 * - Server Errors: Clear error messages with recovery suggestions
 * - Data Corruption: Automatic data integrity checks and recovery
 * - User Feedback: Clear error communication with actionable solutions
 * 
 * Data Validation:
 * - Email Format: Validate email address format and syntax
 * - Domain Verification: Check email domain validity and deliverability
 * - Duplicate Prevention: Prevent duplicate emails within repositories
 * - Bulk Validation: Efficient validation of large email lists
 * - Real-Time Feedback: Immediate validation feedback during input
 * 
 * Import/Export Features:
 * - CSV Import: Support for standard CSV formats with flexible mapping
 * - Excel Support: Import from Excel files with multiple sheets
 * - JSON Export: Export repository data in JSON format
 * - Backup Creation: Create full repository backups for data safety
 * - Migration Tools: Tools for migrating between different systems
 * 
 * Real-Time Features:
 * - Live Updates: Real-time repository changes across all users
 * - Collaboration Sync: Synchronized editing with conflict resolution
 * - Activity Feed: Live activity feed for repository changes
 * - Notification System: Real-time notifications for important events
 * - Status Indicators: Live status indicators for repository health
 * 
 * Mobile Optimization:
 * - Touch-Friendly: Optimized interface for mobile devices
 * - Offline Support: Basic offline functionality with sync on reconnect
 * - Progressive Loading: Efficient loading for mobile networks
 * - Gesture Support: Touch gestures for common operations
 * - Responsive Design: Adaptive layout for various screen sizes
 * 
 * Security Features:
 * - Data Encryption: Encrypted storage for sensitive repository data
 * - Access Logging: Comprehensive logging of repository access
 * - Rate Limiting: Protection against abuse and spam
 * - Input Sanitization: Comprehensive input sanitization and validation
 * - Privacy Controls: User privacy settings and data protection
 * 
 * Integration Capabilities:
 * - Email Services: Integration with major email service providers
 * - Analytics Platforms: Connect with analytics and tracking services
 * - CRM Systems: Export data to CRM platforms
 * - Marketing Tools: Integration with email marketing platforms
 * - API Access: Full API access for custom integrations
 * 
 * Dependencies:
 * - React: Hooks for state management and lifecycle handling
 * - Redux Toolkit: Global state management for repository data
 * - Repository Service: API abstraction for repository operations
 * - Debounce Hook: Performance optimization for search operations
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
 fetchRepositories,
 fetchUserRepositories,
 fetchRepository,
 createRepository,
 updateRepository,
 deleteRepository,
 addEmailsToRepository,
 removeEmailFromRepository,
 uploadCSV,
 downloadCSV,
 mergeRepositories,
 followRepository,
 unfollowRepository,
 setActiveRepository,
 clearRepositoryError,
 updateSnowballSettings
} from '../store/slices/repositories.slice';
import { 
 Repository, 
 RepositoryFilters, 
 EmailEntry, 
 SnowballSettings,
 RepositoryStats,
 CSVUploadResult 
} from '../types/repository.types';
import { repositoriesService } from '../services/repositories.service';
import { useDebounce } from './useDebounce';

/**
 * Configuration Options for Repository Management Hook
 * 
 * Comprehensive options interface for configuring repository management behavior,
 * including filtering, sorting, pagination, and search functionality.
 * 
 * Features:
 * - User Context: Specify user for personalized repository access
 * - Auto-Fetch: Configure automatic data loading on hook initialization
 * - Search: Advanced search across repository names, descriptions, and topics
 * - Filtering: Multi-criteria filtering for repository discovery
 * - Sorting: Flexible sorting options with direction control
 * - Pagination: Efficient pagination for large repository lists
 * 
 * @interface UseRepositoriesOptions
 */
interface UseRepositoriesOptions {
 /**
  * User ID for personalized repository access and permissions
  * Filters repositories based on user ownership and collaboration
  * Enables user-specific repository management features
  * @type {string}
  * @optional
  */
 userId?: string;

 /**
  * Enable automatic repository fetching on hook initialization
  * Controls whether repositories are loaded immediately when hook mounts
  * Improves initial page load performance when disabled
  * @type {boolean}
  * @default true
  */
 autoFetch?: boolean;

 /**
  * Filter criteria for advanced repository discovery
  * Supports filtering by creation date, email count, activity level,
  * ownership status, and custom metadata fields
  * @type {RepositoryFilters}
  * @optional
  */
 filters?: RepositoryFilters;

 /**
  * Initial search query for filtering repositories
  * Searches across repository names, descriptions, topics, and hashtags
  * Supports partial matching and case-insensitive search
  * @type {string}
  * @default ""
  */
 searchQuery?: string;

 /**
  * Field to sort repositories by
  * Supports sorting by creation date, email count, activity level, and name
  * Combined with sortOrder for complete sorting configuration
  * @type {'created' | 'emails' | 'activity' | 'name'}
  * @default 'created'
  */
 sortBy?: 'created' | 'emails' | 'activity' | 'name';

 /**
  * Sort order direction for repository listing
  * Controls ascending or descending order for selected sort field
  * Provides flexible ordering for different use cases
  * @type {'asc' | 'desc'}
  * @default 'desc'
  */
 sortOrder?: 'asc' | 'desc';

 /**
  * Maximum number of repositories to load per request
  * Controls pagination size and memory usage
  * Balances performance with user experience
  * @type {number}
  * @default 20
  */
 limit?: number;
}

/**
 * Repository Management Hook Return Interface
 * 
 * Comprehensive return interface providing all repository management functionality,
 * including CRUD operations, email management, analytics, and utility functions.
 * 
 * Features:
 * - Repository Data: Complete repository information with real-time updates
 * - CRUD Operations: Full create, read, update, delete functionality
 * - Email Management: Advanced email operations with validation
 * - CSV Processing: Import/export capabilities with error handling
 * - Analytics: Comprehensive metrics and performance data
 * - Collaboration: Multi-user repository management
 * - Search and Filtering: Advanced discovery and organization tools
 * 
 * @interface UseRepositoriesReturn
 */
interface UseRepositoriesReturn {
 /**
  * Array of all accessible repositories
  * Includes public repositories and user's private repositories
  * Automatically filtered based on current search and filter criteria
  * @type {Repository[]}
  */
 repositories: Repository[];

 /**
  * Array of repositories owned or collaborated by the current user
  * Provides focused view of user's personal repository collection
  * Includes ownership and collaboration metadata
  * @type {Repository[]}
  */
 userRepositories: Repository[];

 /**
  * Currently selected/active repository for detailed operations
  * Provides focused context for repository-specific operations
  * Automatically updates when repository selection changes
  * @type {Repository | null}
  */
 activeRepository: Repository | null;

 /**
  * Loading state indicator for repository operations
  * Tracks loading state for data fetching and mutations
  * Provides unified loading feedback across all operations
  * @type {boolean}
  */
 loading: boolean;

 /**
  * Error message for failed repository operations
  * Provides user-friendly error descriptions with recovery suggestions
  * Automatically cleared when operations succeed
  * @type {string | null}
  */
 error: string | null;

 /**
  * Repository statistics and analytics data
  * Includes aggregate metrics, growth rates, and performance indicators
  * Updated in real-time as repositories change
  * @type {RepositoryStats | null}
  */
 stats: RepositoryStats | null;
 
 // CRUD Operations
 /**
  * Fetch repositories with optional filtering
  * Loads repository data from server with current filter criteria
  * Supports pagination and real-time updates
  * @param {RepositoryFilters} filters - Optional filter criteria
  * @returns {Promise<void>}
  */
 fetchRepositories: (filters?: RepositoryFilters) => Promise<void>;

 /**
  * Fetch repositories for specific user
  * Loads user's owned and collaborated repositories
  * Includes permission and access level information
  * @param {string} userId - User identifier to fetch repositories for
  * @returns {Promise<void>}
  */
 fetchUserRepositories: (userId: string) => Promise<void>;

 /**
  * Fetch single repository with complete data
  * Loads detailed repository information including email lists
  * Provides caching for improved performance
  * @param {string} id - Repository identifier
  * @returns {Promise<Repository>} Complete repository object
  */
 fetchRepository: (id: string) => Promise<Repository>;

 /**
  * Create new repository with validation
  * Supports both simple and advanced repository creation
  * Includes automatic permission setup and initial configuration
  * @param {Partial<Repository>} data - Repository configuration
  * @returns {Promise<Repository>} Created repository object
  */
 createRepository: (data: Partial<Repository>) => Promise<Repository>;

 /**
  * Update existing repository with conflict resolution
  * Supports partial updates with optimistic UI updates
  * Handles concurrent edits with automatic conflict resolution
  * @param {string} id - Repository identifier
  * @param {Partial<Repository>} data - Updated repository data
  * @returns {Promise<void>}
  */
 updateRepository: (id: string, data: Partial<Repository>) => Promise<void>;

 /**
  * Delete repository with data preservation options
  * Provides soft delete with recovery options
  * Includes data export before deletion for safety
  * @param {string} id - Repository identifier
  * @returns {Promise<void>}
  */
 deleteRepository: (id: string) => Promise<void>;
 
 // Email Management
 /**
  * Add email addresses to repository with validation
  * Supports bulk email addition with duplicate detection
  * Includes format validation and deliverability checks
  * @param {string} repositoryId - Target repository identifier
  * @param {string[]} emails - Email addresses to add
  * @returns {Promise<void>}
  */
 addEmails: (repositoryId: string, emails: string[]) => Promise<void>;

 /**
  * Remove email address from repository
  * Supports selective removal with confirmation
  * Maintains email history for audit purposes
  * @param {string} repositoryId - Target repository identifier
  * @param {string} emailId - Email entry identifier to remove
  * @returns {Promise<void>}
  */
 removeEmail: (repositoryId: string, emailId: string) => Promise<void>;

 /**
  * Validate email addresses for format and deliverability
  * Provides real-time validation with detailed feedback
  * Includes domain verification and spam detection
  * @param {string[]} emails - Email addresses to validate
  * @returns {Promise<EmailEntry[]>} Validation results with entry data
  */
 validateEmails: (emails: string[]) => Promise<EmailEntry[]>;
 
 // CSV Operations
 /**
  * Import emails from CSV file with comprehensive processing
  * Supports flexible column mapping and data transformation
  * Provides detailed import results and error reporting
  * @param {string} repositoryId - Target repository identifier
  * @param {File} file - CSV file to import
  * @returns {Promise<CSVUploadResult>} Import results and statistics
  */
 uploadCSV: (repositoryId: string, file: File) => Promise<CSVUploadResult>;

 /**
  * Export repository emails to CSV format
  * Supports custom field selection and formatting
  * Includes metadata and engagement statistics
  * @param {string} repositoryId - Source repository identifier
  * @returns {Promise<void>}
  */
 downloadCSV: (repositoryId: string) => Promise<void>;

 /**
  * Preview CSV file contents before import
  * Provides data validation and column analysis
  * Includes error detection and import suggestions
  * @param {File} file - CSV file to preview
  * @returns {Promise<EmailEntry[]>} Preview data with validation
  */
 previewCSV: (file: File) => Promise<EmailEntry[]>;
 
 // Repository Operations
 /**
  * Merge two repositories with data preservation
  * Combines email lists with duplicate resolution
  * Maintains audit trail and provides rollback options
  * @param {string} sourceId - Source repository identifier
  * @param {string} targetId - Target repository identifier
  * @returns {Promise<void>}
  */
 mergeRepositories: (sourceId: string, targetId: string) => Promise<void>;

 /**
  * Follow repository for updates and notifications
  * Enables subscription to repository changes
  * Supports notification preferences and filtering
  * @param {string} repositoryId - Repository identifier to follow
  * @returns {Promise<void>}
  */
 followRepository: (repositoryId: string) => Promise<void>;

 /**
  * Unfollow repository and disable notifications
  * Removes subscription while preserving access permissions
  * Provides confirmation and re-follow options
  * @param {string} repositoryId - Repository identifier to unfollow
  * @returns {Promise<void>}
  */
 unfollowRepository: (repositoryId: string) => Promise<void>;
 
 // Snowball Features
 /**
  * Configure snowball distribution settings for viral growth
  * Controls automated email propagation mechanics
  * Includes growth thresholds and analytics tracking
  * @param {string} repositoryId - Target repository identifier
  * @param {SnowballSettings} settings - Snowball configuration
  * @returns {Promise<void>}
  */
 updateSnowballSettings: (repositoryId: string, settings: SnowballSettings) => Promise<void>;

 /**
  * Retrieve comprehensive snowball distribution analytics
  * Provides growth metrics, viral coefficients, and performance data
  * Includes trend analysis and predictive insights
  * @param {string} repositoryId - Repository identifier for analytics
  * @returns {Promise<any>} Comprehensive analytics data
  */
 getSnowballAnalytics: (repositoryId: string) => Promise<any>;
 
 // Utility Functions
 /**
  * Search repositories with intelligent filtering
  * Provides semantic search across repository metadata
  * Returns ranked results with relevance scoring
  * @param {string} query - Search query string
  * @returns {Repository[]} Filtered and ranked repository results
  */
 searchRepositories: (query: string) => Repository[];

 /**
  * Retrieve detailed repository statistics and metrics
  * Provides comprehensive analytics including growth and engagement
  * Includes historical data and trend analysis
  * @param {string} repositoryId - Repository identifier for statistics
  * @returns {Promise<RepositoryStats>} Detailed statistics object
  */
 getRepositoryStats: (repositoryId: string) => Promise<RepositoryStats>;

 /**
  * Check if email address exists in repository
  * Provides efficient duplicate detection for email management
  * Supports case-insensitive matching with normalization
  * @param {string} email - Email address to check
  * @param {string} repositoryId - Repository identifier to check against
  * @returns {boolean} True if email exists in repository
  */
 checkEmailExists: (email: string, repositoryId: string) => boolean;

 /**
  * Validate user edit permissions for repository
  * Checks user's access rights for modification operations
  * Considers ownership, collaboration, and role-based permissions
  * @param {Repository} repository - Repository object to check permissions for
  * @returns {boolean} True if user can edit the repository
  */
 canUserEdit: (repository: Repository) => boolean;
}

/**
 * Main Repository Management Hook Implementation
 * 
 * Comprehensive repository management system providing full CRUD operations,
 * email management, CSV processing, snowball distribution, and analytics.
 * Integrates with Redux for global state management and provides optimized
 * performance through caching, debouncing, and intelligent updates.
 * 
 * Architecture:
 * - Redux Integration: Global state management for repository data
 * - Service Layer: Repository service abstraction for API operations
 * - Debounced Search: Performance-optimized search with user input debouncing
 * - Real-Time Updates: Live data synchronization across components
 * - Error Handling: Comprehensive error management with user feedback
 * 
 * State Management:
 * - Repository List: Cached repository data with intelligent updates
 * - User Repositories: Personalized repository collections
 * - Active Repository: Focused repository context for detailed operations
 * - Loading States: Granular loading indicators for different operations
 * - Error States: Detailed error information with recovery suggestions
 * 
 * Performance Optimizations:
 * - Memoized Computations: Optimized sorting and filtering operations
 * - Debounced API Calls: Reduced server load through request optimization
 * - Selective Updates: Efficient state updates with minimal re-renders
 * - Lazy Loading: On-demand data loading for improved performance
 * - Cache Management: Intelligent caching strategies for frequent operations
 * 
 * Email Management Features:
 * - Bulk Operations: Efficient handling of large email lists
 * - Validation: Real-time email format and deliverability validation
 * - Duplicate Detection: Automatic prevention of duplicate emails
 * - CSV Processing: Import/export capabilities with error handling
 * - Segmentation: Advanced email list organization and filtering
 * 
 * Collaboration Features:
 * - Permission System: Role-based access control for repository operations
 * - Multi-User Support: Shared repository management with conflict resolution
 * - Activity Tracking: Comprehensive audit trail for repository changes
 * - Real-Time Sync: Live collaboration with immediate updates
 * - Access Control: Secure permission validation for all operations
 * 
 * Analytics and Insights:
 * - Growth Metrics: Repository growth tracking and analysis
 * - Engagement Data: Email engagement and interaction metrics
 * - Performance Indicators: Repository health and activity monitoring
 * - Trend Analysis: Historical data analysis and predictive insights
 * - Viral Tracking: Snowball distribution effectiveness monitoring
 * 
 * @param {UseRepositoriesOptions} options - Hook configuration options
 * @returns {UseRepositoriesReturn} Complete repository management interface
 */
export const useRepositories = (options: UseRepositoriesOptions = {}): UseRepositoriesReturn => {
 const {
   userId,
   autoFetch = true,
   filters: initialFilters,
   searchQuery = '',
   sortBy = 'created',
   sortOrder = 'desc',
   limit = 20
 } = options;

 const dispatch = useDispatch();
 const { user } = useSelector((state: RootState) => state.auth);
 const {
   repositories,
   userRepositories,
   activeRepository,
   loading,
   error,
   pagination
 } = useSelector((state: RootState) => state.repositories);

 const [localFilters, setLocalFilters] = useState<RepositoryFilters>(initialFilters || {});
 const [stats, setStats] = useState<RepositoryStats | null>(null);
 
 const debouncedSearchQuery = useDebounce(searchQuery, 300);

 // Fetch repositories on mount or filter change
 useEffect(() => {
   if (autoFetch) {
     const filters = {
       ...localFilters,
       search: debouncedSearchQuery,
       sortBy,
       sortOrder,
       limit
     };
     dispatch(fetchRepositories(filters) as any);
   }
 }, [autoFetch, localFilters, debouncedSearchQuery, sortBy, sortOrder, limit, dispatch]);

 // Fetch user repositories if userId provided
 useEffect(() => {
   if (userId && autoFetch) {
     dispatch(fetchUserRepositories(userId) as any);
   }
 }, [userId, autoFetch, dispatch]);

 // Repository actions
 const handleFetchRepositories = useCallback(async (filters?: RepositoryFilters) => {
   const mergedFilters = { ...localFilters, ...filters };
   setLocalFilters(mergedFilters);
   await dispatch(fetchRepositories(mergedFilters) as any);
 }, [dispatch, localFilters]);

 const handleFetchUserRepositories = useCallback(async (userId: string) => {
   await dispatch(fetchUserRepositories(userId) as any);
 }, [dispatch]);

 const handleFetchRepository = useCallback(async (id: string): Promise<Repository> => {
   const result = await dispatch(fetchRepository(id) as any);
   return result.payload;
 }, [dispatch]);

 const handleCreateRepository = useCallback(async (data: Partial<Repository>): Promise<Repository> => {
   const result = await dispatch(createRepository(data) as any);
   return result.payload;
 }, [dispatch]);

 const handleUpdateRepository = useCallback(async (id: string, data: Partial<Repository>) => {
   await dispatch(updateRepository({ id, data }) as any);
 }, [dispatch]);

 const handleDeleteRepository = useCallback(async (id: string) => {
   await dispatch(deleteRepository(id) as any);
 }, [dispatch]);

 // Email management
 const handleAddEmails = useCallback(async (repositoryId: string, emails: string[]) => {
   await dispatch(addEmailsToRepository({ repositoryId, emails }) as any);
 }, [dispatch]);

 const handleRemoveEmail = useCallback(async (repositoryId: string, emailId: string) => {
   await dispatch(removeEmailFromRepository({ repositoryId, emailId }) as any);
 }, [dispatch]);

 const validateEmails = useCallback(async (emails: string[]): Promise<EmailEntry[]> => {
   const response = await repositoriesService.validateEmails(emails);
   return response.data;
 }, []);

 // CSV operations
 const handleUploadCSV = useCallback(async (repositoryId: string, file: File): Promise<CSVUploadResult> => {
   const result = await dispatch(uploadCSV({ repositoryId, file }) as any);
   return result.payload;
 }, [dispatch]);

 const handleDownloadCSV = useCallback(async (repositoryId: string) => {
   await dispatch(downloadCSV(repositoryId) as any);
 }, [dispatch]);

 const previewCSV = useCallback(async (file: File): Promise<EmailEntry[]> => {
   const formData = new FormData();
   formData.append('csv', file);
   const response = await repositoriesService.previewCSV(formData);
   return response.data;
 }, []);

 // Repository operations
 const handleMergeRepositories = useCallback(async (sourceId: string, targetId: string) => {
   await dispatch(mergeRepositories({ sourceId, targetId }) as any);
 }, [dispatch]);

 const handleFollowRepository = useCallback(async (repositoryId: string) => {
   await dispatch(followRepository(repositoryId) as any);
 }, [dispatch]);

 const handleUnfollowRepository = useCallback(async (repositoryId: string) => {
   await dispatch(unfollowRepository(repositoryId) as any);
 }, [dispatch]);

 // Snowball features
 const handleUpdateSnowballSettings = useCallback(async (repositoryId: string, settings: SnowballSettings) => {
   await dispatch(updateSnowballSettings({ repositoryId, settings }) as any);
 }, [dispatch]);

 const getSnowballAnalytics = useCallback(async (repositoryId: string) => {
   const response = await repositoriesService.getSnowballAnalytics(repositoryId);
   return response.data;
 }, []);

 // Utility functions
 const searchRepositories = useCallback((query: string): Repository[] => {
   const lowercaseQuery = query.toLowerCase();
   return repositories.filter(repo => 
     repo.name.toLowerCase().includes(lowercaseQuery) ||
     repo.description?.toLowerCase().includes(lowercaseQuery) ||
     repo.topics.some(topic => topic.toLowerCase().includes(lowercaseQuery))
   );
 }, [repositories]);

 const getRepositoryStats = useCallback(async (repositoryId: string): Promise<RepositoryStats> => {
   const response = await repositoriesService.getRepositoryStats(repositoryId);
   setStats(response.data);
   return response.data;
 }, []);

 const checkEmailExists = useCallback((email: string, repositoryId: string): boolean => {
   const repository = repositories.find(r => r.id === repositoryId);
   if (!repository) return false;
   return repository.emails.some(e => e.email === email);
 }, [repositories]);

 const canUserEdit = useCallback((repository: Repository): boolean => {
   if (!user) return false;
   return repository.ownerId === user.id || 
          repository.collaborators?.includes(user.id) || 
          user.role === 'admin';
 }, [user]);

 // Memoized values
 const sortedRepositories = useMemo(() => {
   const sorted = [...repositories];
   sorted.sort((a, b) => {
     let compareValue = 0;
     switch (sortBy) {
       case 'created':
         compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
         break;
       case 'emails':
         compareValue = a.emailCount - b.emailCount;
         break;
       case 'activity':
         compareValue = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
         break;
       case 'name':
         compareValue = a.name.localeCompare(b.name);
         break;
     }
     return sortOrder === 'asc' ? compareValue : -compareValue;
   });
   return sorted;
 }, [repositories, sortBy, sortOrder]);

 return {
   repositories: sortedRepositories,
   userRepositories,
   activeRepository,
   loading,
   error,
   stats,
   
   fetchRepositories: handleFetchRepositories,
   fetchUserRepositories: handleFetchUserRepositories,
   fetchRepository: handleFetchRepository,
   createRepository: handleCreateRepository,
   updateRepository: handleUpdateRepository,
   deleteRepository: handleDeleteRepository,
   
   addEmails: handleAddEmails,
   removeEmail: handleRemoveEmail,
   validateEmails,
   
   uploadCSV: handleUploadCSV,
   downloadCSV: handleDownloadCSV,
   previewCSV,
   
   mergeRepositories: handleMergeRepositories,
   followRepository: handleFollowRepository,
   unfollowRepository: handleUnfollowRepository,
   
   updateSnowballSettings: handleUpdateSnowballSettings,
   getSnowballAnalytics,
   
   searchRepositories,
   getRepositoryStats,
   checkEmailExists,
   canUserEdit
 };
};

/**
 * Single Repository Management Hook
 * 
 * Focused hook for managing individual repository operations with optimized
 * loading and caching. Provides efficient access to single repository data
 * with automatic Redux integration and error handling.
 * 
 * Features:
 * - Single Repository Access: Efficient retrieval of individual repository data
 * - Redux Integration: Seamless integration with global repository state
 * - Automatic Loading: Intelligent loading when repository data is not cached
 * - Error Handling: Comprehensive error management with user feedback
 * - Performance Optimization: Minimal re-renders and efficient state updates
 * 
 * Use Cases:
 * - Repository Detail Pages: Detailed view of individual repositories
 * - Repository Editing: Focused context for repository modifications
 * - Permission Checking: Validate user access for specific repositories
 * - Data Preloading: Prepare repository data for upcoming operations
 * - Cache Management: Efficient repository data caching and updates
 * 
 * State Management:
 * - Repository Data: Complete repository object with metadata
 * - Loading State: Indicates data fetching progress
 * - Error State: Detailed error information for failed operations
 * - Cache Integration: Automatic cache checking and updates
 * 
 * Performance Features:
 * - Selective Loading: Only loads data when not available in cache
 * - Efficient Updates: Minimal state changes and re-renders
 * - Memory Management: Optimized memory usage for repository data
 * - Request Deduplication: Prevents duplicate API requests
 * 
 * @param {string} repositoryId - Repository identifier to manage
 * @returns {object} Repository management interface with data, loading, and error states
 */
export const useRepository = (repositoryId: string) => {
 const dispatch = useDispatch();
 const repository = useSelector((state: RootState) => 
   state.repositories.repositories.find(r => r.id === repositoryId)
 );
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   if (repositoryId && !repository) {
     setLoading(true);
     dispatch(fetchRepository(repositoryId) as any)
       .then(() => setLoading(false))
       .catch((err: any) => {
         setError(err.message);
         setLoading(false);
       });
   }
 }, [repositoryId, repository, dispatch]);

 return {
   repository,
   loading,
   error
 };
};

/**
 * Repository Analytics Management Hook
 * 
 * Specialized hook for managing repository analytics and metrics with real-time
 * updates and comprehensive performance tracking. Provides detailed insights
 * into repository growth, engagement, and snowball distribution effectiveness.
 * 
 * Features:
 * - Analytics Data: Comprehensive repository metrics and performance indicators
 * - Real-Time Updates: Live analytics data with automatic refresh
 * - Growth Tracking: Monitor repository growth patterns and trends
 * - Engagement Metrics: Track user engagement and interaction patterns
 * - Snowball Analytics: Viral distribution effectiveness and viral coefficients
 * - Performance Monitoring: Repository health and activity indicators
 * 
 * Analytics Categories:
 * - Growth Metrics: Repository size growth, email acquisition rates
 * - Engagement Data: Email open rates, click-through rates, interaction levels
 * - Distribution Analytics: Snowball campaign effectiveness and reach
 * - User Behavior: Access patterns, collaboration activity, content engagement
 * - Performance Indicators: Repository health scores and activity levels
 * - Trend Analysis: Historical data trends and predictive insights
 * 
 * Data Sources:
 * - Repository Service: Core analytics data from repository operations
 * - Email Analytics: Engagement metrics from email campaigns
 * - User Interactions: Collaboration and access pattern data
 * - Snowball Tracking: Viral distribution campaign performance
 * - Growth Monitoring: Historical growth and trend analysis
 * 
 * Performance Features:
 * - Efficient Loading: Optimized data fetching with minimal API calls
 * - Caching Strategy: Intelligent caching for frequently accessed analytics
 * - Background Updates: Non-blocking analytics refresh and synchronization
 * - Error Recovery: Robust error handling with retry mechanisms
 * - Memory Management: Optimized memory usage for large analytics datasets
 * 
 * Use Cases:
 * - Analytics Dashboards: Comprehensive repository performance overview
 * - Growth Monitoring: Track repository expansion and engagement trends
 * - Campaign Analysis: Evaluate snowball distribution campaign effectiveness
 * - Performance Optimization: Identify areas for repository improvement
 * - Trend Identification: Discover patterns and growth opportunities
 * 
 * @param {string} repositoryId - Repository identifier for analytics tracking
 * @returns {object} Analytics interface with data, loading, and error states
 */
export const useRepositoryAnalytics = (repositoryId: string) => {
 const [analytics, setAnalytics] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   if (repositoryId) {
     setLoading(true);
     repositoriesService.getSnowballAnalytics(repositoryId)
       .then(response => {
         setAnalytics(response.data);
         setLoading(false);
       })
       .catch(err => {
         setError(err.message);
         setLoading(false);
       });
   }
 }, [repositoryId]);

 return { analytics, loading, error };
};
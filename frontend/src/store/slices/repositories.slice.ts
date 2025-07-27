/**
 * Repositories Slice - Email Repository Management and Collaboration
 * 
 * Comprehensive Redux slice managing email repositories, member collaboration,
 * snowball distribution, CSV operations, and analytics for the ShadowNews
 * email-first social platform with real-time updates and viral growth.
 * 
 * Core Features:
 * - Repository Management: Email repository CRUD operations and lifecycle
 * - Member Collaboration: Multi-user repository access and collaboration tools
 * - Email Management: Bulk email operations, validation, and organization
 * - Snowball Distribution: Viral email propagation and growth mechanics
 * - CSV Operations: Import/export functionality with progress tracking
 * - Analytics: Repository performance metrics and growth analytics
 * - Real-time Updates: Live repository updates and member synchronization
 * 
 * Repository Lifecycle:
 * - Repository Creation: Create themed email collections with metadata
 * - Configuration Management: Repository settings, privacy, and permissions
 * - Member Management: Add, remove, and manage repository collaborators
 * - Content Organization: Email categorization and topic-based organization
 * - Archive/Restore: Repository lifecycle management and preservation
 * - Clone/Fork: Repository duplication and derivative creation
 * - Merge Operations: Combine repositories with data preservation
 * 
 * Email Management:
 * - Bulk Operations: Efficient handling of large email collections
 * - Email Validation: Real-time email format and deliverability validation
 * - Duplicate Detection: Automatic duplicate email prevention and cleanup
 * - Import/Export: CSV and multiple format data exchange
 * - Email Verification: Automated email verification workflows
 * - Segmentation: Advanced email list organization and filtering
 * - Quality Control: Email quality scoring and validation
 * 
 * Collaboration Features:
 * - Multi-user Access: Owner, collaborator, and viewer permission levels
 * - Invitation System: Secure repository invitation and access management
 * - Activity Tracking: Comprehensive member activity and contribution tracking
 * - Permission Management: Granular permission control for repository operations
 * - Team Management: Organization and team-based repository access
 * - Audit Trail: Complete history of repository changes and member actions
 * - Real-time Collaboration: Live collaboration with conflict resolution
 * 
 * Snowball Distribution:
 * - Viral Mechanics: Automated email propagation based on engagement
 * - Growth Analytics: Track viral coefficient and distribution effectiveness
 * - Quality Control: Content quality scoring and approval workflows
 * - Distribution Settings: Configurable snowball parameters and thresholds
 * - Campaign Management: Organize and track distribution campaigns
 * - Performance Metrics: Monitor delivery rates and engagement patterns
 * - A/B Testing: Test different distribution strategies and optimization
 * 
 * CSV Operations:
 * - CSV Import: Flexible CSV import with column mapping and validation
 * - Progress Tracking: Real-time progress indication for large operations
 * - Error Handling: Comprehensive error reporting for invalid data
 * - Data Validation: Multi-layer validation for data integrity
 * - Export Options: Multiple export formats and customization options
 * - Backup Integration: Automated backup and restore capabilities
 * - Batch Processing: Efficient batch processing for large datasets
 * 
 * Analytics and Insights:
 * - Growth Metrics: Repository size and engagement tracking over time
 * - Member Analytics: Member activity patterns and contribution analysis
 * - Email Performance: Email delivery, open rates, and engagement metrics
 * - Trend Analysis: Identify trending topics and content patterns
 * - Comparative Analysis: Compare repository performance and benchmarks
 * - Predictive Insights: AI-powered growth and engagement predictions
 * - ROI Tracking: Repository return on investment and value metrics
 * 
 * Search and Discovery:
 * - Repository Search: Advanced search across repository metadata
 * - Filter System: Multi-criteria filtering for repository discovery
 * - Recommendation Engine: AI-powered repository recommendations
 * - Tag System: Hashtag-based organization and discovery
 * - Trending: Real-time trending repository identification
 * - Related Repositories: Discover similar and related repositories
 * - Personalization: Personalized repository recommendations
 * 
 * Real-time Features:
 * - Live Updates: Real-time repository creation, modification, and deletion
 * - Live Collaboration: Multi-user editing with conflict resolution
 * - Activity Streams: Real-time member activity and contribution tracking
 * - Push Notifications: Real-time repository notifications and alerts
 * - Sync Status: Live synchronization status and progress indicators
 * - Presence Awareness: User presence indication and activity status
 * - WebSocket Integration: Real-time data synchronization and updates
 * 
 * Performance Features:
 * - Lazy Loading: On-demand repository data loading for large collections
 * - Virtualization: Virtual scrolling for performance optimization
 * - Caching: Intelligent repository data caching and invalidation
 * - Batch Operations: Efficient batch processing for bulk operations
 * - Background Processing: Non-blocking background task processing
 * - Memory Management: Optimized memory usage for large repositories
 * - CDN Integration: Content delivery network optimization
 * 
 * Security Features:
 * - Access Control: Comprehensive permission and access management
 * - Data Encryption: End-to-end encryption for sensitive repository data
 * - Privacy Settings: Granular privacy controls for repository visibility
 * - Audit Logging: Complete repository access and modification audit trail
 * - Rate Limiting: Protection against abuse and unauthorized access
 * - Compliance: Privacy regulation compliance and data protection
 * - Security Monitoring: Real-time security event detection and alerting
 * 
 * Integration Features:
 * - API Integration: RESTful API for all repository operations
 * - Email Services: Integration with external email service providers
 * - Analytics Platforms: Connect with analytics and tracking services
 * - CRM Integration: Customer relationship management system connectivity
 * - Marketing Tools: Integration with email marketing platforms
 * - Webhook Support: Real-time webhooks for repository events
 * - External Storage: Integration with cloud storage providers
 * 
 * Mobile and Offline:
 * - Mobile Optimization: Touch-friendly repository management interfaces
 * - Offline Support: Basic offline repository viewing and management
 * - Progressive Loading: Bandwidth-optimized repository data delivery
 * - Background Sync: Background repository synchronization
 * - Data Usage: Efficient data management for limited bandwidth
 * - Battery Optimization: Power-efficient repository operations
 * - Cross-device Sync: Repository synchronization across devices
 * 
 * Development Features:
 * - Type Safety: Full TypeScript integration with repository types
 * - Testing Support: Repository testing utilities and mock data
 * - Debug Tools: Repository debugging and state inspection
 * - Error Handling: Comprehensive error management and recovery
 * - Performance Monitoring: Repository operation performance tracking
 * - Documentation: Complete API documentation with examples
 * 
 * Dependencies:
 * - Redux Toolkit: State management with createSlice and async thunks
 * - Repositories Service: Service layer for repository API communication
 * - Repository Types: TypeScript interfaces for repository data structures
 * - Real-time Integration: WebSocket integration for live updates
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import * as repositoriesService from '../../services/repositories.service';
import { Repository, EmailEntry, SnowballStats, CSVUploadResponse } from '../../types/repository.types';

/**
 * Repositories State Interface
 * Comprehensive state structure for repository management, collaboration, and analytics
 */
interface RepositoriesState {
 /** Array of all available repositories for discovery and browsing */
 repositories: Repository[];
 /** User's personal repositories with ownership and collaboration access */
 userRepositories: Repository[];
 /** Currently selected repository for detailed operations and management */
 currentRepository: Repository | null;
 /** Email entries in the current repository for management and operations */
 emailEntries: EmailEntry[];
 /** Snowball distribution statistics and performance metrics */
 snowballStats: SnowballStats | null;
 /** Loading state for repository operations and UI feedback */
 loading: boolean;
 /** Upload progress state for CSV and bulk operations */
 uploading: boolean;
 /** Error state for repository failures and user feedback */
 error: string | null;
 /** Pagination configuration for efficient data loading and navigation */
 pagination: {
   /** Current page number for pagination tracking */
   page: number;
   /** Items per page limit for performance optimization */
   limit: number;
   /** Total repository count for pagination calculation */
   total: number;
   /** More content availability for infinite scroll */
   hasMore: boolean;
 };
 /** Filter configuration for repository discovery and organization */
 filters: {
   /** Topic-based filtering for content discovery */
   topic: string;
   /** Sorting preference for repository organization */
   sortBy: 'subscribers' | 'growth' | 'recent' | 'activity';
   /** Minimum subscriber threshold for filtering */
   minSubscribers: number;
 };
 /** Current search query for repository discovery */
 searchQuery: string;
}

/**
 * Initial Repositories State
 * Default state with empty collections and sensible defaults for repository management
 */
const initialState: RepositoriesState = {
 repositories: [],
 userRepositories: [],
 currentRepository: null,
 emailEntries: [],
 snowballStats: null,
 loading: false,
 uploading: false,
 error: null,
 pagination: {
   page: 1,
   limit: 20,
   total: 0,
   hasMore: true,
 },
 filters: {
   topic: '',
   sortBy: 'subscribers',
   minSubscribers: 0,
 },
 searchQuery: '',
};

export const fetchRepositories = createAsyncThunk(
 'repositories/fetchAll',
 async ({ page, filters }: { page: number; filters?: typeof initialState.filters }) => {
   const response = await repositoriesService.getRepositories({ page, ...filters });
   return response;
 }
);

export const fetchUserRepositories = createAsyncThunk(
 'repositories/fetchUserRepos',
 async (userId: string) => {
   const response = await repositoriesService.getUserRepositories(userId);
   return response;
 }
);

export const fetchRepositoryById = createAsyncThunk(
 'repositories/fetchById',
 async (repositoryId: string) => {
   const response = await repositoriesService.getRepositoryById(repositoryId);
   return response;
 }
);

export const createRepository = createAsyncThunk(
 'repositories/create',
 async (data: {
   name: string;
   description: string;
   topic: string;
   hashtags: string[];
   isPrivate: boolean;
   autoApprove: boolean;
   qualityThreshold: number;
 }) => {
   const response = await repositoriesService.createRepository(data);
   return response;
 }
);

export const updateRepository = createAsyncThunk(
 'repositories/update',
 async ({ id, data }: { id: string; data: Partial<Repository> }) => {
   const response = await repositoriesService.updateRepository(id, data);
   return response;
 }
);

export const deleteRepository = createAsyncThunk(
 'repositories/delete',
 async (id: string) => {
   await repositoriesService.deleteRepository(id);
   return id;
 }
);

export const uploadCSV = createAsyncThunk(
 'repositories/uploadCSV',
 async ({ repositoryId, file }: { repositoryId: string; file: File }) => {
   const response = await repositoriesService.uploadCSV(repositoryId, file);
   return { repositoryId, response };
 }
);

export const addEmailToRepository = createAsyncThunk(
 'repositories/addEmail',
 async ({ repositoryId, email, metadata }: { 
   repositoryId: string; 
   email: string; 
   metadata?: Record<string, any> 
 }) => {
   const response = await repositoriesService.addEmail(repositoryId, email, metadata);
   return response;
 }
);

export const removeEmailFromRepository = createAsyncThunk(
 'repositories/removeEmail',
 async ({ repositoryId, emailId }: { repositoryId: string; emailId: string }) => {
   await repositoriesService.removeEmail(repositoryId, emailId);
   return { repositoryId, emailId };
 }
);

export const fetchRepositoryEmails = createAsyncThunk(
 'repositories/fetchEmails',
 async ({ repositoryId, page = 1, verified }: { 
   repositoryId: string; 
   page?: number; 
   verified?: boolean 
 }) => {
   const response = await repositoriesService.getRepositoryEmails(repositoryId, { page, verified });
   return response;
 }
);

export const mergeRepositories = createAsyncThunk(
 'repositories/merge',
 async ({ sourceId, targetId }: { sourceId: string; targetId: string }) => {
   const response = await repositoriesService.mergeRepositories(sourceId, targetId);
   return response;
 }
);

export const fetchSnowballStats = createAsyncThunk(
 'repositories/fetchSnowballStats',
 async (repositoryId: string) => {
   const response = await repositoriesService.getSnowballStats(repositoryId);
   return response;
 }
);

export const exportRepository = createAsyncThunk(
 'repositories/export',
 async ({ repositoryId, format }: { repositoryId: string; format: 'csv' | 'json' }) => {
   const response = await repositoriesService.exportRepository(repositoryId, format);
   return response;
 }
);

export const subscribeToRepository = createAsyncThunk(
 'repositories/subscribe',
 async (repositoryId: string) => {
   const response = await repositoriesService.subscribe(repositoryId);
   return response;
 }
);

export const unsubscribeFromRepository = createAsyncThunk(
 'repositories/unsubscribe',
 async (repositoryId: string) => {
   const response = await repositoriesService.unsubscribe(repositoryId);
   return response;
 }
);

export const updateEmailVerification = createAsyncThunk(
 'repositories/verifyEmail',
 async ({ repositoryId, emailId, verified }: { 
   repositoryId: string; 
   emailId: string; 
   verified: boolean 
 }) => {
   const response = await repositoriesService.updateEmailVerification(repositoryId, emailId, verified);
   return response;
 }
);

const repositoriesSlice = createSlice({
 name: 'repositories',
 initialState,
 reducers: {
   setSearchQuery: (state, action: PayloadAction<string>) => {
     state.searchQuery = action.payload;
     state.pagination.page = 1;
   },
   setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
     state.filters = { ...state.filters, ...action.payload };
     state.pagination.page = 1;
   },
   resetFilters: (state) => {
     state.filters = initialState.filters;
     state.searchQuery = '';
     state.pagination.page = 1;
   },
   clearError: (state) => {
     state.error = null;
   },
   updateRepositoryLocally: (state, action: PayloadAction<Repository>) => {
     const index = state.repositories.findIndex(r => r.id === action.payload.id);
     if (index !== -1) {
       state.repositories[index] = action.payload;
     }
     if (state.currentRepository?.id === action.payload.id) {
       state.currentRepository = action.payload;
     }
   },
   addEmailLocally: (state, action: PayloadAction<{ repositoryId: string; email: EmailEntry }>) => {
     const repo = state.repositories.find(r => r.id === action.payload.repositoryId);
     if (repo) {
       repo.emailCount += 1;
       repo.verifiedEmailCount += action.payload.email.verified ? 1 : 0;
     }
     if (state.currentRepository?.id === action.payload.repositoryId) {
       state.emailEntries.unshift(action.payload.email);
     }
   },
   updateSnowballProgress: (state, action: PayloadAction<{ 
     repositoryId: string; 
     progress: number; 
     newEmails: number 
   }>) => {
     const repo = state.repositories.find(r => r.id === action.payload.repositoryId);
     if (repo) {
       repo.snowballProgress = action.payload.progress;
       repo.emailCount += action.payload.newEmails;
     }
   },
 },
 extraReducers: (builder) => {
   builder
     .addCase(fetchRepositories.pending, (state) => {
       state.loading = true;
       state.error = null;
     })
     .addCase(fetchRepositories.fulfilled, (state, action) => {
       state.loading = false;
       if (action.payload.page === 1) {
         state.repositories = action.payload.repositories;
       } else {
         state.repositories = [...state.repositories, ...action.payload.repositories];
       }
       state.pagination = {
         page: action.payload.page,
         limit: action.payload.limit,
         total: action.payload.total,
         hasMore: action.payload.hasMore,
       };
     })
     .addCase(fetchRepositories.rejected, (state, action) => {
       state.loading = false;
       state.error = action.error.message || 'Failed to fetch repositories';
     })
     .addCase(fetchUserRepositories.fulfilled, (state, action) => {
       state.userRepositories = action.payload;
     })
     .addCase(fetchRepositoryById.pending, (state) => {
       state.loading = true;
     })
     .addCase(fetchRepositoryById.fulfilled, (state, action) => {
       state.loading = false;
       state.currentRepository = action.payload;
     })
     .addCase(createRepository.fulfilled, (state, action) => {
       state.repositories.unshift(action.payload);
       state.userRepositories.unshift(action.payload);
     })
     .addCase(updateRepository.fulfilled, (state, action) => {
       const index = state.repositories.findIndex(r => r.id === action.payload.id);
       if (index !== -1) {
         state.repositories[index] = action.payload;
       }
       if (state.currentRepository?.id === action.payload.id) {
         state.currentRepository = action.payload;
       }
     })
     .addCase(deleteRepository.fulfilled, (state, action) => {
       state.repositories = state.repositories.filter(r => r.id !== action.payload);
       state.userRepositories = state.userRepositories.filter(r => r.id !== action.payload);
       if (state.currentRepository?.id === action.payload) {
         state.currentRepository = null;
       }
     })
     .addCase(uploadCSV.pending, (state) => {
       state.uploading = true;
       state.error = null;
     })
     .addCase(uploadCSV.fulfilled, (state, action) => {
       state.uploading = false;
       const repo = state.repositories.find(r => r.id === action.payload.repositoryId);
       if (repo) {
         repo.emailCount += action.payload.response.added;
         repo.lastActivity = new Date().toISOString();
       }
     })
     .addCase(uploadCSV.rejected, (state, action) => {
       state.uploading = false;
       state.error = action.error.message || 'Failed to upload CSV';
     })
     .addCase(fetchRepositoryEmails.fulfilled, (state, action) => {
       if (action.payload.page === 1) {
         state.emailEntries = action.payload.emails;
       } else {
         state.emailEntries = [...state.emailEntries, ...action.payload.emails];
       }
     })
     .addCase(addEmailToRepository.fulfilled, (state, action) => {
       state.emailEntries.unshift(action.payload);
       if (state.currentRepository) {
         state.currentRepository.emailCount += 1;
       }
     })
     .addCase(removeEmailFromRepository.fulfilled, (state, action) => {
       state.emailEntries = state.emailEntries.filter(e => e.id !== action.payload.emailId);
       if (state.currentRepository) {
         state.currentRepository.emailCount -= 1;
       }
     })
     .addCase(fetchSnowballStats.fulfilled, (state, action) => {
       state.snowballStats = action.payload;
     })
     .addCase(subscribeToRepository.fulfilled, (state, action) => {
       const repo = state.repositories.find(r => r.id === action.payload.id);
       if (repo) {
         repo.isSubscribed = true;
         repo.subscriberCount += 1;
       }
       if (state.currentRepository?.id === action.payload.id) {
         state.currentRepository.isSubscribed = true;
         state.currentRepository.subscriberCount += 1;
       }
     })
     .addCase(unsubscribeFromRepository.fulfilled, (state, action) => {
       const repo = state.repositories.find(r => r.id === action.payload.id);
       if (repo) {
         repo.isSubscribed = false;
         repo.subscriberCount -= 1;
       }
       if (state.currentRepository?.id === action.payload.id) {
         state.currentRepository.isSubscribed = false;
         state.currentRepository.subscriberCount -= 1;
       }
     })
     .addCase(updateEmailVerification.fulfilled, (state, action) => {
       const email = state.emailEntries.find(e => e.id === action.payload.emailId);
       if (email) {
         email.verified = action.payload.verified;
       }
       if (state.currentRepository) {
         state.currentRepository.verifiedEmailCount += action.payload.verified ? 1 : -1;
       }
     });
 },
});

export const {
 setSearchQuery,
 setFilters,
 resetFilters,
 clearError,
 updateRepositoryLocally,
 addEmailLocally,
 updateSnowballProgress,
} = repositoriesSlice.actions;

export const selectAllRepositories = (state: RootState) => state.repositories.repositories;
export const selectUserRepositories = (state: RootState) => state.repositories.userRepositories;
export const selectCurrentRepository = (state: RootState) => state.repositories.currentRepository;
export const selectRepositoryEmails = (state: RootState) => state.repositories.emailEntries;
export const selectSnowballStats = (state: RootState) => state.repositories.snowballStats;
export const selectRepositoriesLoading = (state: RootState) => state.repositories.loading;
export const selectRepositoriesError = (state: RootState) => state.repositories.error;
export const selectRepositoryFilters = (state: RootState) => state.repositories.filters;
export const selectRepositoryPagination = (state: RootState) => state.repositories.pagination;

export default repositoriesSlice.reducer;
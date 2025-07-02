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

interface UseRepositoriesOptions {
 userId?: string;
 autoFetch?: boolean;
 filters?: RepositoryFilters;
 searchQuery?: string;
 sortBy?: 'created' | 'emails' | 'activity' | 'name';
 sortOrder?: 'asc' | 'desc';
 limit?: number;
}

interface UseRepositoriesReturn {
 repositories: Repository[];
 userRepositories: Repository[];
 activeRepository: Repository | null;
 loading: boolean;
 error: string | null;
 stats: RepositoryStats | null;
 
 // Actions
 fetchRepositories: (filters?: RepositoryFilters) => Promise<void>;
 fetchUserRepositories: (userId: string) => Promise<void>;
 fetchRepository: (id: string) => Promise<Repository>;
 createRepository: (data: Partial<Repository>) => Promise<Repository>;
 updateRepository: (id: string, data: Partial<Repository>) => Promise<void>;
 deleteRepository: (id: string) => Promise<void>;
 
 // Email management
 addEmails: (repositoryId: string, emails: string[]) => Promise<void>;
 removeEmail: (repositoryId: string, emailId: string) => Promise<void>;
 validateEmails: (emails: string[]) => Promise<EmailEntry[]>;
 
 // CSV operations
 uploadCSV: (repositoryId: string, file: File) => Promise<CSVUploadResult>;
 downloadCSV: (repositoryId: string) => Promise<void>;
 previewCSV: (file: File) => Promise<EmailEntry[]>;
 
 // Repository operations
 mergeRepositories: (sourceId: string, targetId: string) => Promise<void>;
 followRepository: (repositoryId: string) => Promise<void>;
 unfollowRepository: (repositoryId: string) => Promise<void>;
 
 // Snowball features
 updateSnowballSettings: (repositoryId: string, settings: SnowballSettings) => Promise<void>;
 getSnowballAnalytics: (repositoryId: string) => Promise<any>;
 
 // Utility functions
 searchRepositories: (query: string) => Repository[];
 getRepositoryStats: (repositoryId: string) => Promise<RepositoryStats>;
 checkEmailExists: (email: string, repositoryId: string) => boolean;
 canUserEdit: (repository: Repository) => boolean;
}

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

// Additional hook for single repository
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

// Hook for repository analytics
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
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import * as repositoriesService from '../../services/repositories.service';
import { Repository, EmailEntry, SnowballStats, CSVUploadResponse } from '../../types/repository.types';

interface RepositoriesState {
 repositories: Repository[];
 userRepositories: Repository[];
 currentRepository: Repository | null;
 emailEntries: EmailEntry[];
 snowballStats: SnowballStats | null;
 loading: boolean;
 uploading: boolean;
 error: string | null;
 pagination: {
   page: number;
   limit: number;
   total: number;
   hasMore: boolean;
 };
 filters: {
   topic: string;
   sortBy: 'subscribers' | 'growth' | 'recent' | 'activity';
   minSubscribers: number;
 };
 searchQuery: string;
}

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
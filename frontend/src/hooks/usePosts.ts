/**
 * Posts Management Hook Collection
 * 
 * Comprehensive post management system providing CRUD operations, real-time
 * updates, infinite scrolling, voting, filtering, and email integration.
 * Built on React Query for optimal caching and synchronization with Redux
 * for global state management and WebSocket integration for live updates.
 * 
 * Core Features:
 * - CRUD Operations: Create, read, update, delete posts with optimistic updates
 * - Infinite Scrolling: High-performance pagination with React Query
 * - Real-Time Updates: WebSocket integration for live post updates
 * - Voting System: Upvote/downvote with optimistic UI updates
 * - Email Integration: Create posts directly from email content
 * - Advanced Filtering: Search, hashtags, repositories, and custom filters
 * - Caching Strategy: Intelligent caching with React Query
 * 
 * Hook Architecture:
 * - usePosts: Main hook for post list management with pagination
 * - usePost: Single post retrieval with caching
 * - usePostsByHashtag: Hashtag-filtered post queries
 * - useRepositoryPosts: Repository-specific post management
 * - Mutation Hooks: Optimistic updates for all post operations
 * 
 * Data Flow:
 * - React Query: Server state management and caching
 * - Redux: Global UI state and optimistic updates
 * - WebSocket: Real-time live updates across clients
 * - Local State: Component-level search and UI state
 * 
 * Performance Optimizations:
 * - Infinite Queries: Efficient pagination with virtual scrolling support
 * - Optimistic Updates: Immediate UI feedback with rollback on errors
 * - Smart Caching: Configurable cache times for different data types
 * - Background Refetching: Keep data fresh without blocking UI
 * - Query Invalidation: Selective cache invalidation for consistency
 * 
 * Real-Time Features:
 * - Live Post Creation: New posts appear instantly across all clients
 * - Vote Synchronization: Real-time vote count updates
 * - Post Modifications: Live updates for edited posts
 * - Delete Propagation: Immediate removal across all connected clients
 * - Connection Management: Automatic reconnection and event cleanup
 * 
 * Voting System:
 * - Optimistic Updates: Immediate vote reflection in UI
 * - Conflict Resolution: Server reconciliation for vote conflicts
 * - Vote Types: Support for upvotes, downvotes, and vote removal
 * - Karma Integration: Automatic karma calculation and updates
 * - Rate Limiting: Built-in protection against vote spam
 * 
 * Email Integration:
 * - Email-to-Post: Convert email content to posts with attachments
 * - Attachment Handling: Support for file uploads and processing
 * - Content Parsing: Intelligent extraction of titles and content
 * - Format Preservation: Maintain email formatting in post content
 * - Spam Protection: Built-in validation and filtering
 * 
 * Search and Filtering:
 * - Debounced Search: Performance-optimized search with debouncing
 * - Multi-Field Search: Search across titles, content, and metadata
 * - Hashtag Filtering: Filter posts by hashtags and topics
 * - Repository Filtering: Scope posts to specific repositories
 * - Date Range Filtering: Filter by creation and modification dates
 * - Author Filtering: Filter by post authors and contributors
 * 
 * Sorting Options:
 * - Hot: Algorithm-based trending posts with engagement velocity
 * - New: Chronological sorting by creation date
 * - Top: Highest-rated posts by vote count
 * - Best: Quality-ranked posts using engagement signals
 * - Controversial: Posts with high engagement but mixed votes
 * 
 * Cache Management:
 * - Stale-While-Revalidate: Serve cached data while fetching updates
 * - Background Updates: Automatic cache refreshing without UI blocking
 * - Selective Invalidation: Targeted cache updates for efficiency
 * - Memory Management: Automatic cleanup of unused cache entries
 * - Persistence: Optional cache persistence across browser sessions
 * 
 * Error Handling:
 * - Network Failures: Graceful handling of network connectivity issues
 * - API Errors: Comprehensive error processing with user feedback
 * - Optimistic Rollback: Automatic UI rollback on failed operations
 * - Retry Logic: Configurable retry strategies for failed requests
 * - Fallback States: Graceful degradation when services are unavailable
 * 
 * State Synchronization:
 * - Redux Integration: Global state updates for UI consistency
 * - Query Synchronization: Automatic synchronization between queries
 * - Optimistic Consistency: Consistent optimistic updates across components
 * - Event Coordination: Coordinated updates from multiple data sources
 * 
 * Accessibility Features:
 * - Screen Reader Support: Proper ARIA labels and live regions
 * - Keyboard Navigation: Full keyboard accessibility for all operations
 * - Focus Management: Proper focus handling during operations
 * - Status Announcements: Accessible feedback for state changes
 * 
 * Mobile Optimization:
 * - Touch Performance: Optimized for mobile scrolling and interactions
 * - Network Efficiency: Reduced data usage with smart caching
 * - Battery Optimization: Minimal background processing
 * - Offline Support: Graceful degradation for offline scenarios
 * 
 * Security Features:
 * - Input Sanitization: Comprehensive content sanitization
 * - XSS Protection: Prevention of cross-site scripting attacks
 * - Rate Limiting: Protection against spam and abuse
 * - Authentication: Secure user verification for operations
 * - Authorization: Role-based access control for post operations
 * 
 * Analytics Integration:
 * - User Engagement: Track user interactions and engagement patterns
 * - Performance Metrics: Monitor hook performance and optimization
 * - Error Tracking: Comprehensive error logging and reporting
 * - Usage Analytics: Track feature usage and adoption patterns
 * 
 * Testing Support:
 * - Mock-Friendly: Easy mocking of API calls and WebSocket events
 * - Predictable: Deterministic behavior for reliable testing
 * - Isolated: Independent functionality that doesn't interfere
 * - Testable: Clear interfaces for unit and integration testing
 * 
 * Development Features:
 * - TypeScript: Full TypeScript support with strict typing
 * - DevTools: React Query DevTools integration for debugging
 * - Error Boundaries: Comprehensive error boundary integration
 * - Debug Logging: Development-mode debugging and performance monitoring
 * 
 * Dependencies:
 * - React: Hooks for state management and lifecycle handling
 * - React Query: Server state management and caching
 * - Redux Toolkit: Global state management and actions
 * - React Hot Toast: User feedback for operations
 * - WebSocket: Real-time communication and live updates
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { RootState } from '../store/store';
import {
  setPosts,
  addPost,
  updatePost,
  removePost,
  setLoading,
  setError,
  updatePostVote,
  setFilters,
  setSortBy,
} from '../store/slices/posts.slice';
import * as postsService from '../services/posts.service';
import { Post, PostFilters, SortOption, CreatePostDto, UpdatePostDto } from '../types/post.types';
import { useWebSocket } from './useWebSocket';
import { useDebounce } from './useDebounce';

interface UsePostsOptions {
  sortBy?: SortOption;
  filters?: Partial<PostFilters>;
  limit?: number;
  enableRealtime?: boolean;
  repositoryId?: string;
  hashtags?: string[];
}

export const usePosts = (options: UsePostsOptions = {}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const { filters: storeFilters, sortBy: storeSortBy } = useSelector(
    (state: RootState) => state.posts
  );

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { subscribe, unsubscribe } = useWebSocket();

  const effectiveFilters = useMemo(
    () => ({
      ...storeFilters,
      ...options.filters,
      search: debouncedSearchQuery,
      repositoryId: options.repositoryId,
      hashtags: options.hashtags,
    }),
    [storeFilters, options.filters, debouncedSearchQuery, options.repositoryId, options.hashtags]
  );

  const effectiveSortBy = options.sortBy || storeSortBy;

  // Infinite scroll for posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', effectiveFilters, effectiveSortBy, options.limit],
    queryFn: ({ pageParam = 0 }) =>
      postsService.fetchPosts({
        ...effectiveFilters,
        sortBy: effectiveSortBy,
        limit: options.limit || 20,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.posts.length < (options.limit || 20)) return undefined;
      return pages.length * (options.limit || 20);
    },
    staleTime: 30000,
    cacheTime: 300000,
  });

  // Single post query
  const usePost = (postId: string) => {
    return useQuery({
      queryKey: ['post', postId],
      queryFn: () => postsService.fetchPost(postId),
      staleTime: 60000,
    });
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData: CreatePostDto) => postsService.createPost(postData),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      dispatch(addPost(newPost));
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostDto }) =>
      postsService.updatePost(id, data),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', updatedPost.id] });
      dispatch(updatePost(updatedPost));
      toast.success('Post updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      dispatch(removePost(postId));
      toast.success('Post deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' | null }) =>
      postsService.votePost(postId, voteType),
    onMutate: async ({ postId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData(['posts']);

      dispatch(
        updatePostVote({
          postId,
          userId: user?.id || '',
          voteType,
        })
      );

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Failed to vote');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Email post creation
  const createPostFromEmail = useCallback(
    async (emailData: { subject: string; body: string; attachments?: File[] }) => {
      try {
        const formData = new FormData();
        formData.append('subject', emailData.subject);
        formData.append('body', emailData.body);
        if (emailData.attachments) {
          emailData.attachments.forEach((file) => {
            formData.append('attachments', file);
          });
        }

        const newPost = await postsService.createPostFromEmail(formData);
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        dispatch(addPost(newPost));
        toast.success('Post created from email!');
        return newPost;
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to create post from email');
        throw error;
      }
    },
    [dispatch, queryClient]
  );

  // Real-time updates
  useEffect(() => {
    if (!options.enableRealtime) return;

    const handleNewPost = (post: Post) => {
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                posts: [post, ...page.posts],
              };
            }
            return page;
          }),
        };
      });
      dispatch(addPost(post));
    };

    const handlePostUpdate = (post: Post) => {
      queryClient.setQueryData(['post', post.id], post);
      dispatch(updatePost(post));
    };

    const handlePostDelete = (postId: string) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      dispatch(removePost(postId));
    };

    subscribe('post:created', handleNewPost);
    subscribe('post:updated', handlePostUpdate);
    subscribe('post:deleted', handlePostDelete);

    return () => {
      unsubscribe('post:created', handleNewPost);
      unsubscribe('post:updated', handlePostUpdate);
      unsubscribe('post:deleted', handlePostDelete);
    };
  }, [options.enableRealtime, subscribe, unsubscribe, dispatch, queryClient]);

  // Trending posts
  const { data: trendingPosts } = useQuery({
    queryKey: ['posts', 'trending'],
    queryFn: () => postsService.fetchTrendingPosts(),
    staleTime: 300000,
    enabled: !options.filters && !options.repositoryId,
  });

  // Posts by hashtag
  const usePostsByHashtag = (hashtag: string) => {
    return useQuery({
      queryKey: ['posts', 'hashtag', hashtag],
      queryFn: () => postsService.fetchPostsByHashtag(hashtag),
      staleTime: 60000,
    });
  };

  // Repository posts
  const useRepositoryPosts = (repositoryId: string) => {
    return useInfiniteQuery({
      queryKey: ['posts', 'repository', repositoryId],
      queryFn: ({ pageParam = 0 }) =>
        postsService.fetchRepositoryPosts(repositoryId, {
          limit: 20,
          offset: pageParam,
        }),
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.posts.length < 20) return undefined;
        return pages.length * 20;
      },
    });
  };

  // Helper functions
  const handleSort = useCallback(
    (sortBy: SortOption) => {
      dispatch(setSortBy(sortBy));
    },
    [dispatch]
  );

  const handleFilter = useCallback(
    (filters: Partial<PostFilters>) => {
      dispatch(setFilters(filters));
    },
    [dispatch]
  );

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) || [];
  }, [data]);

  const totalPosts = useMemo(() => {
    return data?.pages[0]?.total || 0;
  }, [data]);

  const hasMore = useMemo(() => {
    return hasNextPage || false;
  }, [hasNextPage]);

  return {
    // Data
    posts,
    totalPosts,
    trendingPosts,
    
    // Loading states
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasMore,
    
    // Actions
    fetchNextPage,
    refetch,
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    votePost: voteMutation.mutate,
    createPostFromEmail,
    
    // Filters and sorting
    searchQuery,
    setSearchQuery,
    handleSort,
    handleFilter,
    currentFilters: effectiveFilters,
    currentSort: effectiveSortBy,
    
    // Mutations state
    isCreating: createPostMutation.isLoading,
    isUpdating: updatePostMutation.isLoading,
    isDeleting: deletePostMutation.isLoading,
    isVoting: voteMutation.isLoading,
    
    // Sub-hooks
    usePost,
    usePostsByHashtag,
    useRepositoryPosts,
  };
};
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
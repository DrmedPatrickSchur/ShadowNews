import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PostsService } from '../../services/posts.service';
import { Post, PostVote, PostFilters, PostSortBy, CreatePostDto, UpdatePostDto } from '../../types/post.types';
import { RootState } from '../store';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  filters: PostFilters;
  sortBy: PostSortBy;
  totalCount: number;
  userVotes: Record<string, PostVote>;
  trendingHashtags: string[];
  searchQuery: string;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  filters: {
    hashtags: [],
    repositoryId: null,
    authorId: null,
    dateRange: null,
    hasAttachedRepository: null,
  },
  sortBy: PostSortBy.HOT,
  totalCount: 0,
  userVotes: {},
  trendingHashtags: [],
  searchQuery: '',
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page, reset = false }: { page: number; reset?: boolean }, { getState }) => {
    const state = getState() as RootState;
    const { filters, sortBy, searchQuery } = state.posts;
    
    const response = await PostsService.getPosts({
      page,
      limit: 20,
      filters,
      sortBy,
      search: searchQuery,
    });
    
    return { ...response, reset };
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId: string) => {
    const response = await PostsService.getPostById(postId);
    return response;
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: CreatePostDto) => {
    const response = await PostsService.createPost(postData);
    return response;
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, data }: { postId: string; data: UpdatePostDto }) => {
    const response = await PostsService.updatePost(postId, data);
    return response;
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string) => {
    await PostsService.deletePost(postId);
    return postId;
  }
);

export const votePost = createAsyncThunk(
  'posts/votePost',
  async ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' | null }) => {
    const response = await PostsService.votePost(postId, voteType);
    return { postId, vote: response };
  }
);

export const fetchTrendingHashtags = createAsyncThunk(
  'posts/fetchTrendingHashtags',
  async (timeframe: 'day' | 'week' | 'month' = 'day') => {
    const response = await PostsService.getTrendingHashtags(timeframe);
    return response;
  }
);

export const attachRepository = createAsyncThunk(
  'posts/attachRepository',
  async ({ postId, repositoryId }: { postId: string; repositoryId: string }) => {
    const response = await PostsService.attachRepository(postId, repositoryId);
    return response;
  }
);

export const fetchPostsByEmail = createAsyncThunk(
  'posts/fetchPostsByEmail',
  async (emailId: string) => {
    const response = await PostsService.getPostsByEmailId(emailId);
    return response;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PostFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
      state.hasMore = true;
    },
    setSortBy: (state, action: PayloadAction<PostSortBy>) => {
      state.sortBy = action.payload;
      state.page = 1;
      state.hasMore = true;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
      state.hasMore = true;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
      state.page = 1;
      state.hasMore = true;
    },
    updatePostInList: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      if (state.currentPost?.id === action.payload.id) {
        state.currentPost = action.payload;
      }
    },
    addOptimisticPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    removeOptimisticPost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
    },
    updatePostVote: (state, action: PayloadAction<{ postId: string; delta: number }>) => {
      const post = state.posts.find(p => p.id === action.payload.postId);
      if (post) {
        post.karma += action.payload.delta;
      }
      if (state.currentPost?.id === action.payload.postId) {
        state.currentPost.karma += action.payload.delta;
      }
    },
    addHashtagToFilter: (state, action: PayloadAction<string>) => {
      if (!state.filters.hashtags.includes(action.payload)) {
        state.filters.hashtags.push(action.payload);
        state.page = 1;
        state.hasMore = true;
      }
    },
    removeHashtagFromFilter: (state, action: PayloadAction<string>) => {
      state.filters.hashtags = state.filters.hashtags.filter(tag => tag !== action.payload);
      state.page = 1;
      state.hasMore = true;
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    incrementCommentCount: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.commentCount += 1;
      }
      if (state.currentPost?.id === action.payload) {
        state.currentPost.commentCount += 1;
      }
    },
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.reset) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
        state.totalCount = action.payload.totalCount;
        state.userVotes = { ...state.userVotes, ...action.payload.userVotes };
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
        if (action.payload.userVote) {
          state.userVotes[action.payload.id] = action.payload.userVote;
        }
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch post';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(votePost.fulfilled, (state, action) => {
        const { postId, vote } = action.payload;
        state.userVotes[postId] = vote;
        
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.karma = vote.newKarma;
          post.userVote = vote.voteType;
        }
        
        if (state.currentPost?.id === postId) {
          state.currentPost.karma = vote.newKarma;
          state.currentPost.userVote = vote.voteType;
        }
      })
      .addCase(fetchTrendingHashtags.fulfilled, (state, action) => {
        state.trendingHashtags = action.payload;
      })
      .addCase(attachRepository.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(fetchPostsByEmail.fulfilled, (state, action) => {
        state.posts = action.payload.posts;
        state.totalCount = action.payload.totalCount;
        state.hasMore = false;
      });
  },
});

export const {
  setFilters,
  setSortBy,
  setSearchQuery,
  clearFilters,
  updatePostInList,
  addOptimisticPost,
  removeOptimisticPost,
  updatePostVote,
  addHashtagToFilter,
  removeHashtagFromFilter,
  setCurrentPost,
  incrementCommentCount,
  resetPosts,
} = postsSlice.actions;

export const selectPosts = (state: RootState) => state.posts.posts;
export const selectCurrentPost = (state: RootState) => state.posts.currentPost;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectPostsError = (state: RootState) => state.posts.error;
export const selectHasMorePosts = (state: RootState) => state.posts.hasMore;
export const selectPostsPage = (state: RootState) => state.posts.page;
export const selectPostFilters = (state: RootState) => state.posts.filters;
export const selectPostSortBy = (state: RootState) => state.posts.sortBy;
export const selectPostsTotalCount = (state: RootState) => state.posts.totalCount;
export const selectUserVotes = (state: RootState) => state.posts.userVotes;
export const selectTrendingHashtags = (state: RootState) => state.posts.trendingHashtags;
export const selectSearchQuery = (state: RootState) => state.posts.searchQuery;

export const selectPostById = (postId: string) => (state: RootState) =>
  state.posts.posts.find(post => post.id === postId);

export const selectUserVoteForPost = (postId: string) => (state: RootState) =>
  state.posts.userVotes[postId];

export const selectPostsByHashtag = (hashtag: string) => (state: RootState) =>
  state.posts.posts.filter(post => post.hashtags.includes(hashtag));

export const selectPostsByRepository = (repositoryId: string) => (state: RootState) =>
  state.posts.posts.filter(post => post.attachedRepositories?.some(r => r.id === repositoryId));

export default postsSlice.reducer;
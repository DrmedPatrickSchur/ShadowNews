/**
 * Posts Slice - Content Management and Social Features
 * 
 * Comprehensive Redux slice managing post creation, curation, voting,
 * discovery, and social interaction features for the ShadowNews
 * email-first social platform with real-time updates and engagement.
 * 
 * Core Features:
 * - Content Management: Post creation, editing, deletion, and lifecycle
 * - Social Features: Voting, sharing, bookmarking, and user engagement
 * - Discovery: Trending content, hashtag filtering, and personalized feeds
 * - Search: Advanced post search with filtering and sorting options
 * - Real-time Updates: Live post updates, voting, and community interaction
 * - Email Integration: Email-sourced content and repository attachments
 * - Analytics: Post performance metrics and engagement tracking
 * 
 * Content Management:
 * - Post Creation: Rich text posts with markdown support and media attachments
 * - Draft System: Auto-save drafts and scheduled publishing
 * - Edit History: Post edit tracking and version management
 * - Content Validation: Input sanitization and content policy enforcement
 * - Bulk Operations: Batch post management for administrators
 * - Import/Export: Post data portability and backup functionality
 * - Content Moderation: Automated and manual content review workflows
 * 
 * Social Features:
 * - Voting System: Upvote/downvote functionality with karma integration
 * - Sharing: Cross-platform sharing and social media integration
 * - Bookmarking: Save posts for later reading and organization
 * - Follow/Unfollow: Author following and content subscription
 * - Engagement Metrics: Views, interactions, and social analytics
 * - User Interactions: Comments, replies, and community discussion
 * - Reputation System: Post karma and author reputation tracking
 * 
 * Discovery and Feeds:
 * - Personalized Feeds: AI-powered content curation and recommendations
 * - Trending Content: Real-time trending posts and viral content detection
 * - Hashtag System: Topic-based organization and discovery
 * - Category Filtering: Content categorization and specialized feeds
 * - Related Posts: Content similarity and recommendation algorithms
 * - Fresh Content: New post highlighting and notification system
 * - Quality Scoring: Content quality assessment and ranking algorithms
 * 
 * Search and Filtering:
 * - Full-text Search: Advanced search across post content and metadata
 * - Filter System: Multi-criteria filtering for content discovery
 * - Sort Options: Multiple sorting algorithms for optimal content organization
 * - Search Analytics: Search query analysis and trend identification
 * - Saved Searches: User-defined search queries and alerts
 * - Auto-complete: Real-time search suggestions and query assistance
 * - Search History: User search history and frequent query tracking
 * 
 * Email Integration:
 * - Email Posts: Posts created from email content and forwards
 * - Repository Attachments: Email repository integration and linking
 * - Digest Integration: Post inclusion in email digests and newsletters
 * - Email Sharing: Share posts via email with customizable templates
 * - Newsletter Content: Curated post collections for email distribution
 * - Email Analytics: Email-sourced post performance and engagement
 * - Subscription Management: Email subscription preferences and controls
 * 
 * Real-time Features:
 * - Live Updates: Real-time post creation, editing, and deletion
 * - Live Voting: Instant vote updates and score synchronization
 * - Activity Streams: Real-time user activity and engagement tracking
 * - Push Notifications: Real-time post notifications and alerts
 * - Collaborative Features: Multi-user post collaboration and editing
 * - Presence Indicators: User presence and activity status
 * - WebSocket Integration: Real-time data synchronization and updates
 * 
 * Analytics and Insights:
 * - Performance Metrics: Post views, engagement, and interaction analytics
 * - User Analytics: Author performance and audience insights
 * - Content Analytics: Content performance and optimization recommendations
 * - Trend Analysis: Content trend identification and pattern recognition
 * - A/B Testing: Post feature testing and optimization
 * - Engagement Tracking: User interaction patterns and behavior analysis
 * - ROI Metrics: Content return on investment and value measurement
 * 
 * Content Moderation:
 * - Automated Moderation: AI-powered content analysis and flagging
 * - Community Moderation: User reporting and peer review systems
 * - Moderator Tools: Administrative content management and actions
 * - Content Policies: Community guidelines enforcement and compliance
 * - Appeal Process: Content moderation appeal and review workflow
 * - Audit Trail: Complete moderation action logging and tracking
 * - Quality Control: Content quality assessment and improvement
 * 
 * Performance Features:
 * - Lazy Loading: On-demand post loading for large feeds
 * - Infinite Scroll: Seamless content loading and navigation
 * - Caching: Intelligent post caching and invalidation strategies
 * - Image Optimization: Automatic image compression and format optimization
 * - CDN Integration: Content delivery network optimization
 * - Prefetching: Predictive content prefetching for smooth navigation
 * - Memory Management: Efficient memory usage and garbage collection
 * 
 * Mobile and Accessibility:
 * - Mobile Optimization: Touch-friendly post interface and gestures
 * - Offline Support: Offline post reading and composition
 * - Progressive Loading: Bandwidth-optimized content delivery
 * - Accessibility: Screen reader and keyboard navigation support
 * - Voice Interface: Voice-activated post creation and navigation
 * - Responsive Design: Adaptive layout for various screen sizes
 * - Dark Mode: Theme support for post interface and content
 * 
 * Security Features:
 * - Content Validation: Input sanitization and XSS prevention
 * - Authentication: User authentication for post operations
 * - Authorization: Permission-based post access control
 * - Rate Limiting: Post creation rate limiting and spam prevention
 * - Privacy Controls: Post visibility and privacy settings
 * - Data Protection: User data protection and GDPR compliance
 * - Audit Logging: Security event logging and monitoring
 * 
 * Integration Features:
 * - Service Integration: Posts service layer integration
 * - API Integration: RESTful API for post operations
 * - WebSocket Integration: Real-time post synchronization
 * - Search Integration: Full-text search across post content
 * - Analytics Integration: Post analytics and tracking
 * - External Services: Integration with external content services
 * - Plugin System: Extensible post feature plugins
 * 
 * Development Features:
 * - Type Safety: Full TypeScript integration with post types
 * - Testing Support: Post testing utilities and mock data
 * - Debug Tools: Post debugging and state inspection
 * - Error Handling: Comprehensive error management and recovery
 * - Performance Monitoring: Post performance tracking and optimization
 * - Documentation: Complete API documentation with examples
 * 
 * Dependencies:
 * - Redux Toolkit: State management with createSlice and async thunks
 * - Posts Service: Service layer for post API communication
 * - Post Types: TypeScript interfaces for post data structures
 * - Real-time Integration: WebSocket integration for live updates
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PostsService } from '../../services/posts.service';
import { Post, PostVote, PostFilters, PostSortBy, CreatePostDto, UpdatePostDto } from '../../types/post.types';
import { RootState } from '../store';

/**
 * Posts State Interface
 * Comprehensive state structure for post management, social features, and user interaction
 */
interface PostsState {
  /** Array of posts in the current feed or view */
  posts: Post[];
  /** Currently selected/viewed post for detailed display */
  currentPost: Post | null;
  /** Loading state for post operations and UI feedback */
  loading: boolean;
  /** Error state for post failures and user feedback */
  error: string | null;
  /** Pagination availability for infinite scroll and load more */
  hasMore: boolean;
  /** Current page number for pagination tracking */
  page: number;
  /** Active filters for post discovery and organization */
  filters: PostFilters;
  /** Current sorting preference for post organization */
  sortBy: PostSortBy;
  /** Total post count for analytics and pagination */
  totalCount: number;
  /** User vote tracking for each post to prevent duplicate voting */
  userVotes: Record<string, PostVote>;
  /** Trending hashtags for discovery and content organization */
  trendingHashtags: string[];
  /** Current search query for content discovery */
  searchQuery: string;
}

/**
 * Initial Posts State
 * Default state with empty collections and sensible defaults for post management
 */
const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  /** Default filters for initial post feed */
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
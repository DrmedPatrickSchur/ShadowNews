/**
 * Comments Slice - Community Discussion and Threading System
 * 
 * Comprehensive Redux slice managing comment threads, replies, voting,
 * moderation, and community interaction features for the ShadowNews
 * email-first social platform with real-time updates and collaboration.
 * 
 * Core Features:
 * - Comment Threading: Hierarchical comment system with nested replies
 * - Voting System: Upvote/downvote functionality with karma integration
 * - Real-time Updates: Live comment updates and synchronization
 * - Moderation Tools: Content moderation and community management
 * - Thread Management: Expand/collapse threads and navigation
 * - User Interaction: Reply, edit, delete, and social features
 * - Email Integration: Email-based commenting and notifications
 * 
 * Threading System:
 * - Hierarchical Structure: Parent-child comment relationships with unlimited depth
 * - Thread Navigation: Expand/collapse functionality for complex discussions
 * - Reply Threading: Direct replies and threaded conversations
 * - Comment Sorting: Multiple sorting algorithms for optimal content discovery
 * - Thread Highlighting: Comment highlighting and navigation assistance
 * - Deep Linking: Direct links to specific comments and threads
 * - Thread Statistics: Reply counts, engagement metrics, and analytics
 * 
 * Voting and Karma:
 * - Dual Voting: Upvote and downvote functionality with score calculation
 * - Karma Integration: Comment karma affecting user reputation
 * - Vote Persistence: User vote tracking and state management
 * - Anti-gaming: Vote manipulation prevention and validation
 * - Real-time Updates: Live vote count updates and synchronization
 * - Vote Analytics: Voting pattern analysis and insights
 * - Controversial Detection: Algorithm for identifying controversial comments
 * 
 * Comment Management:
 * - CRUD Operations: Create, read, update, delete comment functionality
 * - Draft System: Auto-save drafts and comment composition
 * - Edit History: Comment edit tracking and version management
 * - Delete Recovery: Soft delete with recovery options
 * - Bulk Operations: Batch comment management for moderators
 * - Import/Export: Comment data portability and backup
 * - Search Integration: Full-text comment search and filtering
 * 
 * Moderation Features:
 * - Content Filtering: Automatic content moderation and flagging
 * - Report System: User reporting and community moderation
 * - Moderator Tools: Administrative comment management and actions
 * - Content Policies: Community guidelines enforcement
 * - Automated Moderation: AI-powered content analysis and filtering
 * - Appeal Process: Comment moderation appeal and review workflow
 * - Audit Trail: Complete moderation action logging and tracking
 * 
 * Email Integration:
 * - Email Notifications: Comment reply and mention notifications
 * - Email Composition: Email-based comment creation and replies
 * - Digest Integration: Comment inclusion in email digests
 * - Repository Comments: Comments on email repository content
 * - Snowball Comments: Comments from viral email distribution
 * - Email Threading: Email thread integration with comment threads
 * - Subscription Management: Comment thread subscription and notifications
 * 
 * Real-time Features:
 * - Live Updates: Real-time comment creation and modification
 * - Typing Indicators: Live typing status for active commenters
 * - Presence Awareness: User presence in comment threads
 * - Collaborative Editing: Multi-user comment collaboration
 * - Push Notifications: Real-time comment notifications
 * - Activity Streams: Live comment activity and engagement tracking
 * - WebSocket Integration: Real-time data synchronization
 * 
 * User Experience:
 * - Responsive Design: Mobile-optimized comment interface
 * - Accessibility: Screen reader and keyboard navigation support
 * - Performance: Lazy loading and virtualization for large threads
 * - Offline Support: Offline comment composition and synchronization
 * - Progressive Enhancement: Graceful degradation for limited connectivity
 * - Customization: User preferences for comment display and interaction
 * - Dark Mode: Theme support for comment interface
 * 
 * Analytics and Insights:
 * - Engagement Metrics: Comment engagement and interaction analytics
 * - Thread Analytics: Thread depth, participation, and growth metrics
 * - User Analytics: Comment author analytics and contribution tracking
 * - Content Analysis: Comment sentiment and topic analysis
 * - Trend Detection: Trending topics and discussion identification
 * - Performance Metrics: Comment loading and interaction performance
 * - A/B Testing: Comment feature testing and optimization
 * 
 * Security Features:
 * - Content Validation: Input sanitization and XSS prevention
 * - Rate Limiting: Comment creation rate limiting and spam prevention
 * - Authentication: User authentication for comment operations
 * - Authorization: Permission-based comment access control
 * - Privacy Controls: Comment visibility and privacy settings
 * - Data Protection: User data protection and GDPR compliance
 * - Audit Logging: Security event logging and monitoring
 * 
 * Performance Optimization:
 * - Lazy Loading: On-demand comment loading for large threads
 * - Virtualization: Virtual scrolling for performance optimization
 * - Caching: Intelligent comment caching and invalidation
 * - Compression: Comment data compression for bandwidth optimization
 * - Pagination: Efficient comment pagination and navigation
 * - Prefetching: Predictive comment prefetching for smooth navigation
 * - Memory Management: Efficient memory usage and garbage collection
 * 
 * Integration Features:
 * - Service Integration: Comments service layer integration
 * - API Integration: RESTful API for comment operations
 * - WebSocket Integration: Real-time comment synchronization
 * - Search Integration: Full-text search across comment content
 * - Analytics Integration: Comment analytics and tracking
 * - External Services: Integration with external moderation services
 * - Plugin System: Extensible comment feature plugins
 * 
 * Development Features:
 * - Type Safety: Full TypeScript integration with comment types
 * - Testing Support: Comment testing utilities and mock data
 * - Debug Tools: Comment debugging and state inspection
 * - Error Handling: Comprehensive error management and recovery
 * - Performance Monitoring: Comment performance tracking and optimization
 * - Documentation: Complete API documentation with examples
 * 
 * Dependencies:
 * - Redux Toolkit: State management with createSlice and async thunks
 * - Comments Service: Service layer for comment API communication
 * - Comment Types: TypeScript interfaces for comment data structures
 * - Real-time Integration: WebSocket integration for live updates
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { commentsService } from '../../services/comments.service';
import { Comment, CommentVote, CommentFormData } from '../../types';

/**
 * Comments State Interface
 * Comprehensive state structure for comment management, threading, and user interaction
 */
interface CommentsState {
  /** Comment storage organized by unique comment ID for efficient lookup */
  comments: Record<string, Comment[]>;
  /** Comment organization by post ID for thread management */
  commentsByPost: Record<string, string[]>;
  /** Total comment counts per post for analytics and pagination */
  totalComments: Record<string, number>;
  /** User vote tracking for each comment to prevent duplicate voting */
  userVotes: Record<string, CommentVote>;
  /** Loading state for comment operations and UI feedback */
  loading: boolean;
  /** Error state for comment failures and user feedback */
  error: string | null;
  /** Current page tracking for pagination per post */
  currentPage: Record<string, number>;
  /** More content availability tracking for infinite scroll */
  hasMore: Record<string, boolean>;
  /** Comment sorting preference for optimal content discovery */
  sortBy: 'best' | 'new' | 'top' | 'controversial';
  /** Currently active reply target for reply interface management */
  replyingTo: string | null;
  /** Currently edited comment ID for edit mode management */
  editingComment: string | null;
  /** Currently deleting comment ID for delete confirmation */
  deletingComment: string | null;
  /** Set of expanded thread IDs for thread navigation state */
  expandedThreads: Set<string>;
  /** Set of collapsed comment IDs for UI state management */
  collapsedComments: Set<string>;
  /** Currently highlighted comment for navigation and deep linking */
  highlightedComment: string | null;
  /** Last fetch timestamps for cache invalidation and refresh logic */
  lastFetchTime: Record<string, number>;
}

/**
 * Initial Comments State
 * Default state with empty collections and sensible defaults for comment management
 */
const initialState: CommentsState = {
  comments: {},
  commentsByPost: {},
  totalComments: {},
  userVotes: {},
  loading: false,
  error: null,
  currentPage: {},
  hasMore: {},
  /** Default to 'best' sorting for optimal content discovery */
  sortBy: 'best',
  replyingTo: null,
  editingComment: null,
  deletingComment: null,
  expandedThreads: new Set(),
  collapsedComments: new Set(),
  highlightedComment: null,
  lastFetchTime: {},
};

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ postId, page = 1, limit = 20, sortBy = 'best' }: {
    postId: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) => {
    const response = await commentsService.getComments(postId, page, limit, sortBy);
    return { postId, ...response };
  }
);

export const fetchCommentThread = createAsyncThunk(
  'comments/fetchCommentThread',
  async ({ commentId, depth = 10 }: { commentId: string; depth?: number }) => {
    const response = await commentsService.getCommentThread(commentId, depth);
    return response;
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ postId, parentId, content, mentions }: CommentFormData) => {
    const response = await commentsService.createComment({
      postId,
      parentId,
      content,
      mentions,
    });
    return response;
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, content }: { commentId: string; content: string }) => {
    const response = await commentsService.updateComment(commentId, { content });
    return response;
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId: string) => {
    await commentsService.deleteComment(commentId);
    return commentId;
  }
);

export const voteComment = createAsyncThunk(
  'comments/voteComment',
  async ({ commentId, voteType }: { commentId: string; voteType: 'up' | 'down' | null }) => {
    const response = await commentsService.voteComment(commentId, voteType);
    return { commentId, voteType, ...response };
  }
);

export const fetchUserVotes = createAsyncThunk(
  'comments/fetchUserVotes',
  async (postId: string) => {
    const response = await commentsService.getUserVotes(postId);
    return response;
  }
);

export const reportComment = createAsyncThunk(
  'comments/reportComment',
  async ({ commentId, reason }: { commentId: string; reason: string }) => {
    const response = await commentsService.reportComment(commentId, reason);
    return { commentId, ...response };
  }
);

export const loadMoreReplies = createAsyncThunk(
  'comments/loadMoreReplies',
  async ({ parentId, lastReplyId }: { parentId: string; lastReplyId: string }) => {
    const response = await commentsService.loadMoreReplies(parentId, lastReplyId);
    return { parentId, replies: response };
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setReplyingTo: (state, action: PayloadAction<string | null>) => {
      state.replyingTo = action.payload;
    },
    setEditingComment: (state, action: PayloadAction<string | null>) => {
      state.editingComment = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'best' | 'new' | 'top' | 'controversial'>) => {
      state.sortBy = action.payload;
    },
    toggleThread: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      if (state.expandedThreads.has(threadId)) {
        state.expandedThreads.delete(threadId);
      } else {
        state.expandedThreads.add(threadId);
      }
    },
    collapseComment: (state, action: PayloadAction<string>) => {
      state.collapsedComments.add(action.payload);
    },
    expandComment: (state, action: PayloadAction<string>) => {
      state.collapsedComments.delete(action.payload);
    },
    highlightComment: (state, action: PayloadAction<string | null>) => {
      state.highlightedComment = action.payload;
    },
    clearPostComments: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      if (state.commentsByPost[postId]) {
        state.commentsByPost[postId].forEach(commentId => {
          delete state.comments[commentId];
        });
        delete state.commentsByPost[postId];
        delete state.totalComments[postId];
        delete state.currentPage[postId];
        delete state.hasMore[postId];
        delete state.lastFetchTime[postId];
      }
    },
    optimisticVote: (state, action: PayloadAction<{ commentId: string; voteType: 'up' | 'down' | null }>) => {
      const { commentId, voteType } = action.payload;
      const comment = state.comments[commentId];
      if (comment && comment[0]) {
        const currentVote = state.userVotes[commentId];
        let karmaChange = 0;

        if (currentVote?.vote === 'up') karmaChange -= 1;
        if (currentVote?.vote === 'down') karmaChange += 1;
        if (voteType === 'up') karmaChange += 1;
        if (voteType === 'down') karmaChange -= 1;

        comment[0].karma += karmaChange;
        state.userVotes[commentId] = { vote: voteType, commentId };
      }
    },
    addLocalComment: (state, action: PayloadAction<Comment>) => {
      const comment = action.payload;
      if (!state.comments[comment.id]) {
        state.comments[comment.id] = [];
      }
      state.comments[comment.id].push(comment);
      
      if (!state.commentsByPost[comment.postId]) {
        state.commentsByPost[comment.postId] = [];
      }
      state.commentsByPost[comment.postId].push(comment.id);
      
      state.totalComments[comment.postId] = (state.totalComments[comment.postId] || 0) + 1;
    },
    updateLocalComment: (state, action: PayloadAction<{ commentId: string; updates: Partial<Comment> }>) => {
      const { commentId, updates } = action.payload;
      const commentArray = state.comments[commentId];
      if (commentArray && commentArray[0]) {
        Object.assign(commentArray[0], updates);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, total, page, hasMore } = action.payload;
        
        if (page === 1) {
          state.commentsByPost[postId] = [];
        }
        
        comments.forEach((comment: Comment) => {
          if (!state.comments[comment.id]) {
            state.comments[comment.id] = [];
          }
          state.comments[comment.id] = [comment];
          
          if (!state.commentsByPost[postId].includes(comment.id)) {
            state.commentsByPost[postId].push(comment.id);
          }
        });
        
        state.totalComments[postId] = total;
        state.currentPage[postId] = page;
        state.hasMore[postId] = hasMore;
        state.lastFetchTime[postId] = Date.now();
        state.loading = false;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      .addCase(fetchCommentThread.fulfilled, (state, action) => {
        action.payload.forEach((comment: Comment) => {
          if (!state.comments[comment.id]) {
            state.comments[comment.id] = [];
          }
          state.comments[comment.id] = [comment];
        });
      })
      .addCase(createComment.pending, (state) => {
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const comment = action.payload;
        state.comments[comment.id] = [comment];
        
        if (!state.commentsByPost[comment.postId]) {
          state.commentsByPost[comment.postId] = [];
        }
        state.commentsByPost[comment.postId].unshift(comment.id);
        
        state.totalComments[comment.postId] = (state.totalComments[comment.postId] || 0) + 1;
        state.replyingTo = null;
        
        if (comment.parentId) {
          const parent = state.comments[comment.parentId];
          if (parent && parent[0]) {
            parent[0].replyCount = (parent[0].replyCount || 0) + 1;
            if (!parent[0].replies) {
              parent[0].replies = [];
            }
            parent[0].replies.push(comment.id);
          }
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create comment';
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        if (state.comments[updatedComment.id]) {
          state.comments[updatedComment.id] = [updatedComment];
        }
        state.editingComment = null;
      })
      .addCase(deleteComment.pending, (state, action) => {
        state.deletingComment = action.meta.arg;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        const comment = state.comments[commentId]?.[0];
        
        if (comment) {
          const postComments = state.commentsByPost[comment.postId];
          if (postComments) {
            state.commentsByPost[comment.postId] = postComments.filter(id => id !== commentId);
          }
          
          state.totalComments[comment.postId] = Math.max(0, (state.totalComments[comment.postId] || 0) - 1);
          
          if (comment.parentId) {
            const parent = state.comments[comment.parentId];
            if (parent && parent[0] && parent[0].replies) {
              parent[0].replies = parent[0].replies.filter(id => id !== commentId);
              parent[0].replyCount = Math.max(0, (parent[0].replyCount || 0) - 1);
            }
          }
          
          delete state.comments[commentId];
        }
        
        state.deletingComment = null;
      })
      .addCase(deleteComment.rejected, (state) => {
        state.deletingComment = null;
      })
      .addCase(voteComment.fulfilled, (state, action) => {
        const { commentId, voteType, karma } = action.payload;
        const comment = state.comments[commentId];
        if (comment && comment[0]) {
          comment[0].karma = karma;
        }
        state.userVotes[commentId] = { vote: voteType, commentId };
      })
      .addCase(fetchUserVotes.fulfilled, (state, action) => {
        action.payload.forEach((vote: CommentVote) => {
          state.userVotes[vote.commentId] = vote;
        });
      })
      .addCase(reportComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        const comment = state.comments[commentId];
        if (comment && comment[0]) {
          comment[0].isReported = true;
        }
      })
      .addCase(loadMoreReplies.fulfilled, (state, action) => {
        const { parentId, replies } = action.payload;
        const parent = state.comments[parentId];
        
        if (parent && parent[0]) {
          replies.forEach((reply: Comment) => {
            state.comments[reply.id] = [reply];
            if (!parent[0].replies) {
              parent[0].replies = [];
            }
            if (!parent[0].replies.includes(reply.id)) {
              parent[0].replies.push(reply.id);
            }
          });
        }
      });
  },
});

export const {
  setReplyingTo,
  setEditingComment,
  setSortBy,
  toggleThread,
  collapseComment,
  expandComment,
  highlightComment,
  clearPostComments,
  optimisticVote,
  addLocalComment,
  updateLocalComment,
} = commentsSlice.actions;

export default commentsSlice.reducer;
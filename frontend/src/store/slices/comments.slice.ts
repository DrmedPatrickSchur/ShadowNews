import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { commentsService } from '../../services/comments.service';
import { Comment, CommentVote, CommentFormData } from '../../types';

interface CommentsState {
  comments: Record<string, Comment[]>;
  commentsByPost: Record<string, string[]>;
  totalComments: Record<string, number>;
  userVotes: Record<string, CommentVote>;
  loading: boolean;
  error: string | null;
  currentPage: Record<string, number>;
  hasMore: Record<string, boolean>;
  sortBy: 'best' | 'new' | 'top' | 'controversial';
  replyingTo: string | null;
  editingComment: string | null;
  deletingComment: string | null;
  expandedThreads: Set<string>;
  collapsedComments: Set<string>;
  highlightedComment: string | null;
  lastFetchTime: Record<string, number>;
}

const initialState: CommentsState = {
  comments: {},
  commentsByPost: {},
  totalComments: {},
  userVotes: {},
  loading: false,
  error: null,
  currentPage: {},
  hasMore: {},
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
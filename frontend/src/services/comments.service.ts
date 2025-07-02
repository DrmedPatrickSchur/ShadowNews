import api from './api';
import { 
  Comment, 
  CommentCreateDTO, 
  CommentUpdateDTO, 
  CommentVoteType,
  CommentThread,
  CommentWithReplies 
} from '../types/comment.types';
import { PaginatedResponse } from '../types/api.types';

class CommentsService {
  private readonly baseURL = '/api/comments';

  async getCommentsByPost(
    postId: string, 
    params?: {
      page?: number;
      limit?: number;
      sort?: 'top' | 'new' | 'controversial';
      depth?: number;
    }
  ): Promise<PaginatedResponse<CommentWithReplies>> {
    const response = await api.get(`${this.baseURL}/post/${postId}`, { params });
    return response.data;
  }

  async getCommentThread(commentId: string, depth: number = 3): Promise<CommentThread> {
    const response = await api.get(`${this.baseURL}/${commentId}/thread`, {
      params: { depth }
    });
    return response.data;
  }

  async getComment(commentId: string): Promise<Comment> {
    const response = await api.get(`${this.baseURL}/${commentId}`);
    return response.data;
  }

  async getUserComments(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`${this.baseURL}/user/${userId}`, { params });
    return response.data;
  }

  async createComment(data: CommentCreateDTO): Promise<Comment> {
    const response = await api.post(this.baseURL, data);
    return response.data;
  }

  async updateComment(commentId: string, data: CommentUpdateDTO): Promise<Comment> {
    const response = await api.put(`${this.baseURL}/${commentId}`, data);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`${this.baseURL}/${commentId}`);
  }

  async voteComment(commentId: string, voteType: CommentVoteType): Promise<Comment> {
    const response = await api.post(`${this.baseURL}/${commentId}/vote`, { voteType });
    return response.data;
  }

  async removeVote(commentId: string): Promise<Comment> {
    const response = await api.delete(`${this.baseURL}/${commentId}/vote`);
    return response.data;
  }

  async reportComment(
    commentId: string, 
    reason: string, 
    details?: string
  ): Promise<void> {
    await api.post(`${this.baseURL}/${commentId}/report`, { reason, details });
  }

  async getChildComments(
    parentId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: 'top' | 'new';
    }
  ): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`${this.baseURL}/${parentId}/replies`, { params });
    return response.data;
  }

  async collapseThread(commentId: string): Promise<void> {
    await api.post(`${this.baseURL}/${commentId}/collapse`);
  }

  async expandThread(commentId: string): Promise<void> {
    await api.post(`${this.baseURL}/${commentId}/expand`);
  }

  async saveComment(commentId: string): Promise<void> {
    await api.post(`${this.baseURL}/${commentId}/save`);
  }

  async unsaveComment(commentId: string): Promise<void> {
    await api.delete(`${this.baseURL}/${commentId}/save`);
  }

  async getSavedComments(
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`${this.baseURL}/saved`, { params });
    return response.data;
  }

  async getCommentHistory(commentId: string): Promise<Comment[]> {
    const response = await api.get(`${this.baseURL}/${commentId}/history`);
    return response.data;
  }

  async searchComments(
    query: string,
    params?: {
      page?: number;
      limit?: number;
      postId?: string;
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`${this.baseURL}/search`, {
      params: { q: query, ...params }
    });
    return response.data;
  }

  async getTopCommenters(
    timeframe: 'day' | 'week' | 'month' | 'year' | 'all',
    limit: number = 10
  ): Promise<Array<{ userId: string; username: string; commentCount: number; karma: number }>> {
    const response = await api.get(`${this.baseURL}/top-commenters`, {
      params: { timeframe, limit }
    });
    return response.data;
  }

  async bulkGetComments(commentIds: string[]): Promise<Comment[]> {
    const response = await api.post(`${this.baseURL}/bulk`, { ids: commentIds });
    return response.data;
  }

  async getCommentContext(commentId: string, contextSize: number = 3): Promise<Comment[]> {
    const response = await api.get(`${this.baseURL}/${commentId}/context`, {
      params: { size: contextSize }
    });
    return response.data;
  }

  async subscribeToComment(commentId: string): Promise<void> {
    await api.post(`${this.baseURL}/${commentId}/subscribe`);
  }

  async unsubscribeFromComment(commentId: string): Promise<void> {
    await api.delete(`${this.baseURL}/${commentId}/subscribe`);
  }

  async getCommentMetadata(commentId: string): Promise<{
    views: number;
    uniqueViewers: number;
    avgReadTime: number;
    engagementRate: number;
  }> {
    const response = await api.get(`${this.baseURL}/${commentId}/metadata`);
    return response.data;
  }

  async previewComment(content: string): Promise<{ html: string; mentions: string[] }> {
    const response = await api.post(`${this.baseURL}/preview`, { content });
    return response.data;
  }

  async getRelatedComments(commentId: string, limit: number = 5): Promise<Comment[]> {
    const response = await api.get(`${this.baseURL}/${commentId}/related`, {
      params: { limit }
    });
    return response.data;
  }

  async exportComments(
    postId: string,
    format: 'json' | 'csv' | 'markdown'
  ): Promise<Blob> {
    const response = await api.get(`${this.baseURL}/export`, {
      params: { postId, format },
      responseType: 'blob'
    });
    return response.data;
  }

  // Email-specific comment features
  async createCommentViaEmail(
    emailData: {
      from: string;
      subject: string;
      body: string;
      inReplyTo?: string;
    }
  ): Promise<Comment> {
    const response = await api.post(`${this.baseURL}/email`, emailData);
    return response.data;
  }

  async getCommentEmailThread(commentId: string): Promise<{
    comment: Comment;
    emailThread: Array<{
      id: string;
      from: string;
      to: string[];
      subject: string;
      date: string;
    }>;
  }> {
    const response = await api.get(`${this.baseURL}/${commentId}/email-thread`);
    return response.data;
  }

  // AI-enhanced features
  async getSuggestedReplies(
    commentId: string,
    tone: 'professional' | 'casual' | 'friendly' | 'constructive'
  ): Promise<string[]> {
    const response = await api.post(`${this.baseURL}/${commentId}/ai/suggest-replies`, { tone });
    return response.data;
  }

  async summarizeThread(commentId: string): Promise<{
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  }> {
    const response = await api.get(`${this.baseURL}/${commentId}/ai/summarize`);
    return response.data;
  }

  async detectToxicity(content: string): Promise<{
    isToxic: boolean;
    score: number;
    categories: string[];
  }> {
    const response = await api.post(`${this.baseURL}/ai/toxicity-check`, { content });
    return response.data;
  }
}

export default new CommentsService();
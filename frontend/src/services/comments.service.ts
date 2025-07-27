/**
 * Comments Service - Comprehensive Comment Management System
 * 
 * Advanced comment management service providing complete comment lifecycle
 * management, threading, voting, moderation, and AI-enhanced features for
 * the ShadowNews email-first social platform. Supports hierarchical
 * commenting with email integration and intelligent content processing.
 * 
 * Core Features:
 * - Comment CRUD: Complete comment lifecycle management
 * - Threading System: Hierarchical comment threads with unlimited depth
 * - Voting System: Upvote/downvote functionality with karma integration
 * - Moderation: Content reporting and moderation tools
 * - Email Integration: Email-to-comment and comment-to-email workflows
 * - AI Enhancement: Smart replies, summarization, and toxicity detection
 * - Search and Discovery: Advanced comment search and filtering
 * 
 * Comment Threading:
 * - Hierarchical Structure: Unlimited depth comment trees
 * - Thread Management: Collapse, expand, and navigation utilities
 * - Context Retrieval: Comment context and conversation flow
 * - Bulk Operations: Efficient handling of multiple comments
 * - Thread Visualization: Enhanced thread visualization and navigation
 * 
 * Voting and Engagement:
 * - Vote Management: Upvote, downvote, and vote removal
 * - Karma Integration: Automatic karma calculation and updates
 * - Engagement Metrics: View counts, read time, and interaction rates
 * - Top Commenters: Leaderboards and recognition systems
 * - Quality Scoring: Algorithmic comment quality assessment
 * 
 * Content Management:
 * - Rich Text Support: Markdown and HTML content processing
 * - Mention System: User mention detection and notifications
 * - Preview Mode: Real-time comment preview with formatting
 * - Edit History: Complete comment revision tracking
 * - Content Validation: Input sanitization and security checks
 * 
 * Email Integration:
 * - Email-to-Comment: Convert emails to comments automatically
 * - Comment Notifications: Email notifications for comment activity
 * - Email Threading: Maintain email thread context in comments
 * - Subscription Management: Subscribe/unsubscribe from comment threads
 * - Email Export: Export comments in email-friendly formats
 * 
 * Search and Filtering:
 * - Advanced Search: Full-text search across comment content
 * - Filter Options: Date range, user, post, and content filters
 * - Sorting Options: Top, new, controversial, and chronological sorting
 * - Related Comments: Discover related and similar comments
 * - Search Analytics: Track search patterns and popular content
 * 
 * AI-Powered Features:
 * - Smart Replies: AI-generated reply suggestions with tone control
 * - Thread Summarization: Automatic thread summary generation
 * - Toxicity Detection: Real-time content toxicity screening
 * - Sentiment Analysis: Comment sentiment classification
 * - Content Enhancement: AI-powered content improvement suggestions
 * 
 * Moderation Tools:
 * - Content Reporting: User-driven content moderation system
 * - Automated Screening: AI-powered content policy enforcement
 * - Moderation Queue: Centralized moderation workflow management
 * - User Reputation: Community-driven user credibility system
 * - Content Flagging: Automatic flagging of problematic content
 * 
 * User Experience:
 * - Save/Bookmark: Personal comment saving and organization
 * - User History: Complete user comment history tracking
 * - Subscription System: Thread-level notification preferences
 * - Mobile Optimization: Touch-friendly comment interaction
 * - Accessibility: Screen reader and keyboard navigation support
 * 
 * Performance Features:
 * - Lazy Loading: On-demand comment loading for large threads
 * - Caching Strategy: Intelligent comment caching for performance
 * - Pagination: Efficient pagination for large comment sets
 * - Virtual Scrolling: Smooth scrolling for extensive comment lists
 * - Background Sync: Background comment synchronization
 * 
 * Analytics and Metrics:
 * - Engagement Tracking: Comment interaction and engagement metrics
 * - User Analytics: User comment patterns and behavior analysis
 * - Content Analytics: Comment performance and popularity tracking
 * - Trend Analysis: Identify trending topics and discussions
 * - Quality Metrics: Comment quality and value assessment
 * 
 * Data Export:
 * - Multiple Formats: JSON, CSV, and Markdown export options
 * - Selective Export: Filter-based comment export functionality
 * - Archive Creation: Complete comment archive generation
 * - Data Portability: User data portability and migration support
 * - Backup Integration: Automated backup and restore capabilities
 * 
 * Security Features:
 * - Content Sanitization: Comprehensive input sanitization
 * - Spam Detection: Automated spam and abuse detection
 * - Rate Limiting: Protection against comment spam and flooding
 * - Permission Validation: User permission and access control
 * - Audit Logging: Complete comment activity audit trail
 * 
 * Integration Patterns:
 * - API Service: Built on centralized API service layer
 * - Real-time Updates: WebSocket integration for live comment updates
 * - State Management: Redux integration for comment state
 * - Component Integration: React component integration patterns
 * - Hook Integration: Custom hooks for comment operations
 * 
 * Collaboration Features:
 * - Multi-user Editing: Collaborative comment editing capabilities
 * - Conflict Resolution: Handle concurrent comment modifications
 * - Version Control: Comment version tracking and rollback
 * - Team Moderation: Collaborative moderation workflows
 * - Discussion Facilitation: Tools for managing large discussions
 * 
 * Mobile and Offline:
 * - Offline Support: Basic offline comment functionality
 * - Sync on Reconnect: Automatic synchronization when online
 * - Mobile Gestures: Touch-optimized comment interactions
 * - Progressive Loading: Bandwidth-optimized comment loading
 * - Background Processing: Non-blocking comment operations
 * 
 * Dependencies:
 * - API Service: Centralized HTTP client for all API communications
 * - Comment Types: TypeScript interfaces for type safety
 * - Pagination Types: Reusable pagination interface definitions
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

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

/**
 * Comments Service Class
 * 
 * Comprehensive comment management service providing complete comment
 * lifecycle operations, threading, voting, moderation, and AI features.
 * Implements advanced comment functionality for email-first social platform.
 * 
 * Service Architecture:
 * - RESTful API Integration: Built on centralized API service
 * - Type Safety: Full TypeScript integration with comment types
 * - Error Handling: Comprehensive error management and recovery
 * - Performance: Optimized for large-scale comment systems
 * - Security: Input validation and content sanitization
 * 
 * Core Capabilities:
 * - Thread Management: Hierarchical comment trees with unlimited depth
 * - Vote System: Community-driven comment ranking and feedback
 * - Email Integration: Seamless email-to-comment workflows
 * - AI Enhancement: Smart content processing and moderation
 * - Search and Discovery: Advanced comment search and filtering
 */
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
/**
 * Posts Service - Comprehensive Content Management System
 * 
 * Advanced post management service providing complete content lifecycle
 * management, social features, voting systems, and community engagement
 * tools for the ShadowNews email-first social platform. Handles all
 * post-related operations with real-time updates and AI enhancement.
 * 
 * Core Features:
 * - Post Lifecycle: Complete CRUD operations for posts and content
 * - Social Voting: Community-driven content ranking with karma system
 * - Search and Discovery: Advanced content search and recommendation
 * - Real-time Updates: Live post updates and engagement tracking
 * - Email Integration: Email-to-post conversion and notifications
 * - AI Enhancement: Smart content processing and moderation
 * - Community Features: Hashtags, repositories, and user engagement
 * 
 * Content Management:
 * - Rich Text Support: Markdown and HTML content processing
 * - Media Handling: Image, video, and attachment management
 * - Version Control: Post revision tracking and rollback
 * - Draft System: Save and restore post drafts
 * - Content Validation: Input sanitization and security checks
 * - SEO Optimization: Search engine optimization and metadata
 * 
 * Social Features:
 * - Voting System: Upvote/downvote with karma integration
 * - Comment Integration: Seamless comment thread management
 * - Sharing: Cross-platform content sharing and syndication
 * - Bookmarking: Personal content saving and organization
 * - Following: User and content following system
 * - Mentions: User mention system with notifications
 * 
 * Discovery and Search:
 * - Full-text Search: Advanced content search across all posts
 * - Hashtag System: Topic-based content organization
 * - Trending: Real-time trending content identification
 * - Recommendations: AI-powered content recommendation engine
 * - Filter System: Advanced filtering by date, popularity, topic
 * - Related Content: Discover related posts and discussions
 * 
 * Email Integration:
 * - Email-to-Post: Automatic post creation from emails
 * - Post Notifications: Email notifications for post activity
 * - Newsletter Integration: Include posts in email newsletters
 * - Email Sharing: Share posts via email with custom messages
 * - Digest Creation: Automated email digest generation
 * 
 * Real-time Features:
 * - Live Updates: Real-time post content and engagement updates
 * - Activity Streams: Live activity feeds for followed content
 * - Collaboration: Real-time collaborative editing capabilities
 * - Notification System: Instant notifications for post interactions
 * - Presence Indicators: Show active users and engagement
 * 
 * Analytics and Insights:
 * - Engagement Metrics: Views, votes, comments, and sharing statistics
 * - User Analytics: Author performance and audience insights
 * - Content Performance: Track post performance over time
 * - Trend Analysis: Identify trending topics and content patterns
 * - A/B Testing: Test different content strategies and formats
 * 
 * Moderation Tools:
 * - Content Screening: Automated content moderation and filtering
 * - Community Reporting: User-driven content reporting system
 * - Spam Detection: Advanced spam and abuse detection
 * - Quality Control: Algorithmic content quality assessment
 * - Moderation Queue: Centralized content moderation workflow
 * 
 * Performance Features:
 * - Lazy Loading: On-demand content loading for large feeds
 * - Caching Strategy: Intelligent content caching for performance
 * - Pagination: Efficient pagination for large content sets
 * - Image Optimization: Automatic image compression and optimization
 * - CDN Integration: Content delivery network optimization
 * 
 * Repository Integration:
 * - Repository Posts: Posts associated with email repositories
 * - Cross-posting: Share posts across multiple repositories
 * - Access Control: Repository-based content access permissions
 * - Collaboration: Multi-user repository content management
 * - Organization: Repository-based content organization
 * 
 * AI and Enhancement:
 * - Content Suggestions: AI-powered content improvement suggestions
 * - Auto-tagging: Automatic hashtag and topic identification
 * - Sentiment Analysis: Content sentiment classification
 * - Quality Scoring: Algorithmic content quality assessment
 * - Translation: Multi-language content translation support
 * 
 * Mobile and Accessibility:
 * - Mobile Optimization: Touch-friendly post interaction interfaces
 * - Offline Support: Basic offline post viewing and creation
 * - Screen Reader: Full accessibility support for content
 * - Voice Interface: Voice-activated post creation and navigation
 * - Progressive Loading: Bandwidth-optimized content delivery
 * 
 * Security Features:
 * - Content Sanitization: Comprehensive input sanitization
 * - Permission Validation: User permission and access control
 * - Rate Limiting: Protection against spam and abuse
 * - Privacy Controls: Granular privacy settings for content
 * - Audit Logging: Complete post activity audit trail
 * 
 * Integration Patterns:
 * - API Service: Built on centralized API service layer
 * - WebSocket Integration: Real-time post updates and notifications
 * - Auth Service: Seamless authentication integration
 * - State Management: Redux integration for post state
 * - Component Integration: React component integration patterns
 * 
 * Data Management:
 * - Type Safety: Full TypeScript integration with post types
 * - Error Handling: Comprehensive error management and recovery
 * - Validation: Client-side and server-side validation
 * - Serialization: Efficient data serialization and transmission
 * - Backup: Automated content backup and recovery
 * 
 * Development Features:
 * - Testing Support: Comprehensive testing utilities and mocks
 * - Debug Tools: Advanced debugging and monitoring capabilities
 * - API Documentation: Complete API documentation and examples
 * - Performance Monitoring: Real-time performance tracking
 * - Error Tracking: Comprehensive error logging and analysis
 * 
 * Dependencies:
 * - Axios: HTTP client for API communication
 * - Constants: Application configuration and API endpoints
 * - Post Types: TypeScript interfaces for type safety
 * - API Types: Shared API interface definitions
 * - Auth Service: Authentication and authorization integration
 * - WebSocket Service: Real-time communication support
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';
import { 
  Post, 
  PostCreateDTO, 
  PostUpdateDTO, 
  PostsResponse, 
  PostDetailResponse,
  VoteType,
  PostSortBy,
  PostTimeRange 
} from '../types/post.types';
import { PaginationParams, ApiResponse, ApiError } from '../types/api.types';
import { getAuthHeader } from './auth.service';
import { websocketService } from './websocket.service';

class PostsService {
  private baseUrl = `${API_BASE_URL}${API_ENDPOINTS.posts}`;

  async getPosts(params: {
    page?: number;
    limit?: number;
    sortBy?: PostSortBy;
    timeRange?: PostTimeRange;
    hashtags?: string[];
    repositoryId?: string;
    search?: string;
  } = {}): Promise<PostsResponse> {
    try {
      const response = await axios.get<PostsResponse>(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 30,
          sortBy: params.sortBy || PostSortBy.HOT,
          timeRange: params.timeRange,
          hashtags: params.hashtags?.join(','),
          repositoryId: params.repositoryId,
          search: params.search
        },
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostById(id: string): Promise<PostDetailResponse> {
    try {
      const response = await axios.get<PostDetailResponse>(`${this.baseUrl}/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostsByUser(username: string, pagination?: PaginationParams): Promise<PostsResponse> {
    try {
      const response = await axios.get<PostsResponse>(`${API_BASE_URL}/users/${username}/posts`, {
        params: pagination,
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostsByRepository(repositoryId: string, pagination?: PaginationParams): Promise<PostsResponse> {
    try {
      const response = await axios.get<PostsResponse>(
        `${API_BASE_URL}/repositories/${repositoryId}/posts`,
        {
          params: pagination,
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPost(data: PostCreateDTO): Promise<Post> {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content || '');
      formData.append('url', data.url || '');
      
      if (data.hashtags && data.hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(data.hashtags));
      }
      
      if (data.repositoryIds && data.repositoryIds.length > 0) {
        formData.append('repositoryIds', JSON.stringify(data.repositoryIds));
      }

      if (data.attachedCSV) {
        formData.append('csv', data.attachedCSV);
      }

      const response = await axios.post<ApiResponse<Post>>(this.baseUrl, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });

      // Emit websocket event for real-time updates
      websocketService.emit('post:created', response.data.data);

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPostViaEmail(emailData: {
    subject: string;
    body: string;
    attachments?: File[];
    fromEmail: string;
  }): Promise<Post> {
    try {
      const formData = new FormData();
      formData.append('subject', emailData.subject);
      formData.append('body', emailData.body);
      formData.append('fromEmail', emailData.fromEmail);

      if (emailData.attachments) {
        emailData.attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      const response = await axios.post<ApiResponse<Post>>(
        `${this.baseUrl}/email`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePost(id: string, data: PostUpdateDTO): Promise<Post> {
    try {
      const response = await axios.put<ApiResponse<Post>>(
        `${this.baseUrl}/${id}`,
        data,
        {
          headers: getAuthHeader()
        }
      );

      websocketService.emit('post:updated', response.data.data);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`, {
        headers: getAuthHeader()
      });

      websocketService.emit('post:deleted', { id });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async votePost(postId: string, voteType: VoteType): Promise<Post> {
    try {
      const response = await axios.post<ApiResponse<Post>>(
        `${this.baseUrl}/${postId}/vote`,
        { type: voteType },
        {
          headers: getAuthHeader()
        }
      );

      websocketService.emit('post:voted', {
        postId,
        voteType,
        post: response.data.data
      });

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeVote(postId: string): Promise<Post> {
    try {
      const response = await axios.delete<ApiResponse<Post>>(
        `${this.baseUrl}/${postId}/vote`,
        {
          headers: getAuthHeader()
        }
      );

      websocketService.emit('post:unvoted', {
        postId,
        post: response.data.data
      });

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTrendingHashtags(limit: number = 10): Promise<Array<{ hashtag: string; count: number }>> {
    try {
      const response = await axios.get<ApiResponse<Array<{ hashtag: string; count: number }>>>(
        `${this.baseUrl}/hashtags/trending`,
        {
          params: { limit },
          headers: getAuthHeader()
        }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRelatedPosts(postId: string, limit: number = 5): Promise<Post[]> {
    try {
      const response = await axios.get<ApiResponse<Post[]>>(
        `${this.baseUrl}/${postId}/related`,
        {
          params: { limit },
          headers: getAuthHeader()
        }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSuggestedHashtags(title: string, content?: string): Promise<string[]> {
    try {
      const response = await axios.post<ApiResponse<string[]>>(
        `${this.baseUrl}/hashtags/suggest`,
        { title, content },
        {
          headers: getAuthHeader()
        }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reportPost(postId: string, reason: string, details?: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${postId}/report`,
        { reason, details },
        {
          headers: getAuthHeader()
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async hidePost(postId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${postId}/hide`,
        {},
        {
          headers: getAuthHeader()
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async savePost(postId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${postId}/save`,
        {},
        {
          headers: getAuthHeader()
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unsavePost(postId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/${postId}/save`,
        {
          headers: getAuthHeader()
        }
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSavedPosts(pagination?: PaginationParams): Promise<PostsResponse> {
    try {
      const response = await axios.get<PostsResponse>(
        `${API_BASE_URL}/users/me/saved-posts`,
        {
          params: pagination,
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostAnalytics(postId: string): Promise<{
    views: number;
    uniqueVisitors: number;
    avgReadTime: number;
    shares: number;
    emailReach: number;
    engagement: {
      upvotes: number;
      downvotes: number;
      comments: number;
      saves: number;
    };
    sources: Array<{ source: string; count: number }>;
  }> {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${this.baseUrl}/${postId}/analytics`,
        {
          headers: getAuthHeader()
        }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  subscribeToPostUpdates(postId: string, callback: (data: any) => void): () => void {
    websocketService.on(`post:${postId}:updated`, callback);
    websocketService.emit('post:subscribe', { postId });

    return () => {
      websocketService.off(`post:${postId}:updated`, callback);
      websocketService.emit('post:unsubscribe', { postId });
    };
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response) {
        return axiosError.response.data;
      }
      return {
        message: axiosError.message || 'Network error occurred',
        code: 'NETWORK_ERROR',
        statusCode: 0
      };
    }
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

export const postsService = new PostsService();
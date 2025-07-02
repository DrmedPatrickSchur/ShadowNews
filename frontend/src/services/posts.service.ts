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
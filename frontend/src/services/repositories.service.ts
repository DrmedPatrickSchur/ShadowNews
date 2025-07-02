import { api } from './api';
import {
  Repository,
  RepositoryCreateDTO,
  RepositoryUpdateDTO,
  RepositoryStats,
  RepositoryMember,
  SnowballDistribution,
  EmailUploadResult,
  CSVUploadResult,
  RepositoryInvite,
  RepositoryDigest,
  RepositoryAnalytics,
  EmailVerificationStatus,
  RepositoryMergeRequest,
  RepositoryExport
} from '../types/repository.types';
import { PaginatedResponse, ApiResponse } from '../types/api.types';

export interface RepositoryFilters {
  topic?: string;
  minMembers?: number;
  maxMembers?: number;
  isPublic?: boolean;
  hasSnowball?: boolean;
  sortBy?: 'members' | 'activity' | 'created' | 'growth';
  order?: 'asc' | 'desc';
}

export interface SnowballSettings {
  enabled: boolean;
  autoApprove: boolean;
  minQualityScore: number;
  maxEmailsPerUpload: number;
  requireVerification: boolean;
  allowedDomains?: string[];
  blockedDomains?: string[];
}

class RepositoriesService {
  private readonly baseUrl = '/api/repositories';

  async getRepositories(
    page: number = 1,
    limit: number = 20,
    filters?: RepositoryFilters
  ): Promise<PaginatedResponse<Repository>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return api.get(`${this.baseUrl}?${params}`);
  }

  async getRepository(id: string): Promise<Repository> {
    return api.get(`${this.baseUrl}/${id}`);
  }

  async getUserRepositories(userId: string): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/user/${userId}`);
  }

  async getMyRepositories(): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/my`);
  }

  async getTrendingRepositories(period: 'day' | 'week' | 'month' = 'week'): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/trending?period=${period}`);
  }

  async searchRepositories(query: string): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
  }

  async createRepository(data: RepositoryCreateDTO): Promise<Repository> {
    return api.post(this.baseUrl, data);
  }

  async updateRepository(id: string, data: RepositoryUpdateDTO): Promise<Repository> {
    return api.patch(`${this.baseUrl}/${id}`, data);
  }

  async deleteRepository(id: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${id}`);
  }

  async getRepositoryStats(id: string): Promise<RepositoryStats> {
    return api.get(`${this.baseUrl}/${id}/stats`);
  }

  async getRepositoryMembers(
    id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<RepositoryMember>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return api.get(`${this.baseUrl}/${id}/members?${params}`);
  }

  async addMember(repositoryId: string, email: string): Promise<RepositoryMember> {
    return api.post(`${this.baseUrl}/${repositoryId}/members`, { email });
  }

  async removeMember(repositoryId: string, memberId: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${repositoryId}/members/${memberId}`);
  }

  async updateMemberStatus(
    repositoryId: string,
    memberId: string,
    status: 'active' | 'inactive' | 'bounced'
  ): Promise<RepositoryMember> {
    return api.patch(`${this.baseUrl}/${repositoryId}/members/${memberId}`, { status });
  }

  async uploadCSV(repositoryId: string, file: File): Promise<CSVUploadResult> {
    const formData = new FormData();
    formData.append('csv', file);
    
    return api.post(`${this.baseUrl}/${repositoryId}/upload-csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async uploadEmails(repositoryId: string, emails: string[]): Promise<EmailUploadResult> {
    return api.post(`${this.baseUrl}/${repositoryId}/upload-emails`, { emails });
  }

  async exportRepository(id: string, format: 'csv' | 'json' = 'csv'): Promise<RepositoryExport> {
    return api.get(`${this.baseUrl}/${id}/export?format=${format}`);
  }

  async downloadRepositoryCSV(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${id}/download-csv`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.blob();
  }

  async getSnowballDistribution(repositoryId: string): Promise<SnowballDistribution> {
    return api.get(`${this.baseUrl}/${repositoryId}/snowball`);
  }

  async updateSnowballSettings(
    repositoryId: string,
    settings: SnowballSettings
  ): Promise<Repository> {
    return api.patch(`${this.baseUrl}/${repositoryId}/snowball-settings`, settings);
  }

  async approveSnowballEmails(
    repositoryId: string,
    emailIds: string[]
  ): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/snowball/approve`, { emailIds });
  }

  async rejectSnowballEmails(
    repositoryId: string,
    emailIds: string[]
  ): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/snowball/reject`, { emailIds });
  }

  async getSnowballPending(
    repositoryId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<RepositoryMember>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return api.get(`${this.baseUrl}/${repositoryId}/snowball/pending?${params}`);
  }

  async verifyEmail(repositoryId: string, email: string): Promise<EmailVerificationStatus> {
    return api.post(`${this.baseUrl}/${repositoryId}/verify-email`, { email });
  }

  async createInvite(
    repositoryId: string,
    emails: string[],
    message?: string
  ): Promise<RepositoryInvite> {
    return api.post(`${this.baseUrl}/${repositoryId}/invite`, { emails, message });
  }

  async getInvites(repositoryId: string): Promise<RepositoryInvite[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/invites`);
  }

  async revokeInvite(repositoryId: string, inviteId: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${repositoryId}/invites/${inviteId}`);
  }

  async acceptInvite(inviteToken: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/accept-invite`, { token: inviteToken });
  }

  async sendDigest(repositoryId: string, subject: string, content: string): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/send-digest`, { subject, content });
  }

  async getDigestHistory(repositoryId: string): Promise<RepositoryDigest[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/digests`);
  }

  async scheduleDigest(
    repositoryId: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    time: string
  ): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/schedule-digest`, { schedule, time });
  }

  async getAnalytics(
    repositoryId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<RepositoryAnalytics> {
    return api.get(`${this.baseUrl}/${repositoryId}/analytics?period=${period}`);
  }

  async mergeRepositories(
    sourceId: string,
    targetId: string,
    options?: {
      removeDuplicates?: boolean;
      keepSourceActive?: boolean;
    }
  ): Promise<RepositoryMergeRequest> {
    return api.post(`${this.baseUrl}/merge`, {
      sourceId,
      targetId,
      ...options
    });
  }

  async cloneRepository(repositoryId: string, newName: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/clone`, { name: newName });
  }

  async getRecommendedRepositories(): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/recommended`);
  }

  async getSimilarRepositories(repositoryId: string): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/similar`);
  }

  async addCollaborator(
    repositoryId: string,
    userId: string,
    role: 'viewer' | 'editor' | 'admin'
  ): Promise<ApiResponse> {
    return api.post(`${this.baseUrl}/${repositoryId}/collaborators`, { userId, role });
  }

  async removeCollaborator(repositoryId: string, userId: string): Promise<ApiResponse> {
    return api.delete(`${this.baseUrl}/${repositoryId}/collaborators/${userId}`);
  }

  async getCollaborators(repositoryId: string): Promise<RepositoryMember[]> {
    return api.get(`${this.baseUrl}/${repositoryId}/collaborators`);
  }

  async updatePrivacy(repositoryId: string, isPublic: boolean): Promise<Repository> {
    return api.patch(`${this.baseUrl}/${repositoryId}/privacy`, { isPublic });
  }

  async getActivityLog(
    repositoryId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return api.get(`${this.baseUrl}/${repositoryId}/activity?${params}`);
  }

  async bulkUpdateMembers(
    repositoryId: string,
    updates: { memberId: string; status: string }[]
  ): Promise<ApiResponse> {
    return api.patch(`${this.baseUrl}/${repositoryId}/members/bulk`, { updates });
  }

  async getGrowthProjection(repositoryId: string): Promise<{
    current: number;
    projected: number;
    growthRate: number;
    timeframe: string;
  }> {
    return api.get(`${this.baseUrl}/${repositoryId}/growth-projection`);
  }

  async testEmailDelivery(repositoryId: string, emails: string[]): Promise<{
    successful: string[];
    failed: string[];
    bounced: string[];
  }> {
    return api.post(`${this.baseUrl}/${repositoryId}/test-delivery`, { emails });
  }

  async getEmailQualityScore(emails: string[]): Promise<{
    emails: {
      email: string;
      score: number;
      issues: string[];
    }[];
    averageScore: number;
  }> {
    return api.post(`${this.baseUrl}/email-quality`, { emails });
  }

  async archiveRepository(repositoryId: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/archive`);
  }

  async unarchiveRepository(repositoryId: string): Promise<Repository> {
    return api.post(`${this.baseUrl}/${repositoryId}/unarchive`);
  }

  async getArchivedRepositories(): Promise<Repository[]> {
    return api.get(`${this.baseUrl}/archived`);
  }
}

export const repositoriesService = new RepositoriesService();
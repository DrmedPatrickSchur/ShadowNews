import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, WS_BASE_URL } from '../utils/constants';
import { 
  Email, 
  EmailDraft, 
  EmailDigest, 
  EmailTemplate, 
  EmailRepository,
  EmailCommand,
  SnowballDistribution,
  EmailAnalytics,
  BulkEmailOperation,
  EmailSubscription
} from '../types/email.types';

class EmailService {
  private api: AxiosInstance;
  private socket: Socket | null = null;
  private subscribers: Map<string, Function[]> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/email`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Initialize WebSocket connection for real-time email updates
  initializeWebSocket(userId: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${WS_BASE_URL}/email`, {
      auth: {
        token: localStorage.getItem('authToken'),
      },
    });

    this.socket.on('connect', () => {
      console.log('Email WebSocket connected');
      this.socket?.emit('subscribe', { userId });
    });

    this.socket.on('email:received', (data) => {
      this.notifySubscribers('email:received', data);
    });

    this.socket.on('email:sent', (data) => {
      this.notifySubscribers('email:sent', data);
    });

    this.socket.on('repository:updated', (data) => {
      this.notifySubscribers('repository:updated', data);
    });

    this.socket.on('snowball:progress', (data) => {
      this.notifySubscribers('snowball:progress', data);
    });
  }

  // Subscribe to email events
  subscribe(event: string, callback: Function): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)?.push(callback);

    return () => {
      const callbacks = this.subscribers.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Send email through the platform
  async sendEmail(draft: EmailDraft): Promise<Email> {
    const response = await this.api.post('/send', draft);
    return response.data;
  }

  // Send email via unique user email address
  async sendViaUniqueEmail(data: {
    from: string;
    subject: string;
    body: string;
    attachments?: File[];
  }): Promise<Email> {
    const formData = new FormData();
    formData.append('from', data.from);
    formData.append('subject', data.subject);
    formData.append('body', data.body);
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await this.api.post('/send-unique', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Process email commands (for email-only users)
  async processEmailCommand(command: EmailCommand): Promise<any> {
    const response = await this.api.post('/command', command);
    return response.data;
  }

  // Get user's email inbox
  async getInbox(params?: {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: 'date' | 'relevance';
  }): Promise<{
    emails: Email[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await this.api.get('/inbox', { params });
    return response.data;
  }

  // Get email by ID
  async getEmailById(emailId: string): Promise<Email> {
    const response = await this.api.get(`/${emailId}`);
    return response.data;
  }

  // Get email templates
  async getTemplates(): Promise<EmailTemplate[]> {
    const response = await this.api.get('/templates');
    return response.data;
  }

  // Create custom email template
  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt'>): Promise<EmailTemplate> {
    const response = await this.api.post('/templates', template);
    return response.data;
  }

  // Update email template
  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await this.api.put(`/templates/${templateId}`, updates);
    return response.data;
  }

  // Delete email template
  async deleteTemplate(templateId: string): Promise<void> {
    await this.api.delete(`/templates/${templateId}`);
  }

  // Email Repository Management
  async createRepository(repository: {
    name: string;
    description: string;
    hashtags: string[];
    isPublic: boolean;
    emails: string[];
  }): Promise<EmailRepository> {
    const response = await this.api.post('/repositories', repository);
    return response.data;
  }

  // Get user's repositories
  async getMyRepositories(): Promise<EmailRepository[]> {
    const response = await this.api.get('/repositories/my');
    return response.data;
  }

  // Get repository by ID
  async getRepository(repositoryId: string): Promise<EmailRepository> {
    const response = await this.api.get(`/repositories/${repositoryId}`);
    return response.data;
  }

  // Update repository
  async updateRepository(repositoryId: string, updates: Partial<EmailRepository>): Promise<EmailRepository> {
    const response = await this.api.put(`/repositories/${repositoryId}`, updates);
    return response.data;
  }

  // Add emails to repository
  async addEmailsToRepository(repositoryId: string, emails: string[]): Promise<EmailRepository> {
    const response = await this.api.post(`/repositories/${repositoryId}/emails`, { emails });
    return response.data;
  }

  // Remove emails from repository
  async removeEmailsFromRepository(repositoryId: string, emails: string[]): Promise<EmailRepository> {
    const response = await this.api.delete(`/repositories/${repositoryId}/emails`, { data: { emails } });
    return response.data;
  }

  // Upload CSV to repository
  async uploadCSVToRepository(repositoryId: string, file: File): Promise<{
    added: number;
    duplicates: number;
    invalid: number;
    emails: string[];
  }> {
    const formData = new FormData();
    formData.append('csv', file);

    const response = await this.api.post(`/repositories/${repositoryId}/upload-csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Export repository as CSV
  async exportRepositoryAsCSV(repositoryId: string): Promise<Blob> {
    const response = await this.api.get(`/repositories/${repositoryId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Snowball Distribution
  async initiateSnowballDistribution(data: {
    postId: string;
    repositoryIds: string[];
    message?: string;
    scheduledAt?: Date;
  }): Promise<SnowballDistribution> {
    const response = await this.api.post('/snowball/initiate', data);
    return response.data;
  }

  // Get snowball distribution status
  async getSnowballStatus(distributionId: string): Promise<SnowballDistribution> {
    const response = await this.api.get(`/snowball/${distributionId}`);
    return response.data;
  }

  // Cancel snowball distribution
  async cancelSnowballDistribution(distributionId: string): Promise<void> {
    await this.api.post(`/snowball/${distributionId}/cancel`);
  }

  // Email Digest Management
  async getDigestSettings(): Promise<EmailDigest> {
    const response = await this.api.get('/digest/settings');
    return response.data;
  }

  // Update digest settings
  async updateDigestSettings(settings: Partial<EmailDigest>): Promise<EmailDigest> {
    const response = await this.api.put('/digest/settings', settings);
    return response.data;
  }

  // Preview next digest
  async previewDigest(): Promise<{
    subject: string;
    content: string;
    recipientCount: number;
  }> {
    const response = await this.api.get('/digest/preview');
    return response.data;
  }

  // Send test digest
  async sendTestDigest(email?: string): Promise<void> {
    await this.api.post('/digest/test', { email });
  }

  // Email Analytics
  async getEmailAnalytics(params?: {
    startDate?: Date;
    endDate?: Date;
    repositoryId?: string;
  }): Promise<EmailAnalytics> {
    const response = await this.api.get('/analytics', { params });
    return response.data;
  }

  // Get repository analytics
  async getRepositoryAnalytics(repositoryId: string): Promise<{
    totalEmails: number;
    activeEmails: number;
    growthRate: number;
    engagementRate: number;
    topDomains: Array<{ domain: string; count: number }>;
    snowballEffectiveness: number;
  }> {
    const response = await this.api.get(`/repositories/${repositoryId}/analytics`);
    return response.data;
  }

  // Bulk Operations
  async bulkVerifyEmails(emails: string[]): Promise<{
    valid: string[];
    invalid: string[];
    unknown: string[];
  }> {
    const response = await this.api.post('/bulk/verify', { emails });
    return response.data;
  }

  // Bulk unsubscribe
  async bulkUnsubscribe(emails: string[]): Promise<BulkEmailOperation> {
    const response = await this.api.post('/bulk/unsubscribe', { emails });
    return response.data;
  }

  // Email Subscriptions
  async getSubscriptions(): Promise<EmailSubscription[]> {
    const response = await this.api.get('/subscriptions');
    return response.data;
  }

  // Update subscription preferences
  async updateSubscription(subscriptionId: string, preferences: Partial<EmailSubscription>): Promise<EmailSubscription> {
    const response = await this.api.put(`/subscriptions/${subscriptionId}`, preferences);
    return response.data;
  }

  // Unsubscribe from specific emails
  async unsubscribe(token: string): Promise<void> {
    await this.api.post('/unsubscribe', { token });
  }

  // Search emails
  async searchEmails(query: string, filters?: {
    repositories?: string[];
    dateRange?: { start: Date; end: Date };
    hasAttachments?: boolean;
    hashtags?: string[];
  }): Promise<Email[]> {
    const response = await this.api.post('/search', { query, filters });
    return response.data;
  }

  // Get suggested emails based on content
  async getSuggestedEmails(content: string, limit: number = 10): Promise<string[]> {
    const response = await this.api.post('/suggest', { content, limit });
    return response.data;
  }

  // Validate email list
  async validateEmailList(emails: string[]): Promise<{
    valid: string[];
    invalid: Array<{ email: string; reason: string }>;
  }> {
    const response = await this.api.post('/validate', { emails });
    return response.data;
  }

  // Merge repositories
  async mergeRepositories(sourceIds: string[], targetId: string): Promise<EmailRepository> {
    const response = await this.api.post('/repositories/merge', { sourceIds, targetId });
    return response.data;
  }

  // Clone repository
  async cloneRepository(repositoryId: string, newName: string): Promise<EmailRepository> {
    const response = await this.api.post(`/repositories/${repositoryId}/clone`, { name: newName });
    return response.data;
  }

  // Get email thread
  async getEmailThread(threadId: string): Promise<Email[]> {
    const response = await this.api.get(`/threads/${threadId}`);
    return response.data;
  }

  // Cleanup and disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscribers.clear();
  }
}

export default new EmailService();
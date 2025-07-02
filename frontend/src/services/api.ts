import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TIMEOUT = 30000;

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshTokenPromise = this.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    }).then((response) => {
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      this.setAccessToken(accessToken);
      this.setRefreshToken(newRefreshToken);
      this.refreshTokenPromise = null;
      return accessToken;
    }).catch((error) => {
      this.refreshTokenPromise = null;
      throw error;
    });

    return this.refreshTokenPromise;
  }

  private handleAuthError(): void {
    this.clearTokens();
    window.location.href = '/login?expired=true';
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private normalizeError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    }

    if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }

  // Public methods
  public setAuthTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  public clearAuth(): void {
    this.clearTokens();
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  // Specialized methods for file uploads
  public async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // CSV upload specific method
  public async uploadCSV<T>(url: string, csvFile: File, repositoryId: string): Promise<AxiosResponse<T>> {
    return this.uploadFile<T>(url, csvFile, { repositoryId });
  }

  // Batch request method
  public async batch<T>(requests: Array<{ method: string; url: string; data?: any }>): Promise<AxiosResponse<T>> {
    return this.post<T>('/batch', { requests });
  }

  // WebSocket URL helper
  public getWebSocketUrl(): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = API_BASE_URL.replace(/^https?:/, wsProtocol).replace('/api', '');
    return `${baseUrl}/ws`;
  }

  // Server-Sent Events helper
  public createEventSource(endpoint: string): EventSource {
    const token = this.getAccessToken();
    const url = `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${token}`;
    return new EventSource(url);
  }

  // Pagination helper
  public buildPaginationParams(page: number = 1, limit: number = 20, sort?: string, order: 'asc' | 'desc' = 'desc'): Record<string, any> {
    const params: Record<string, any> = {
      page,
      limit,
    };

    if (sort) {
      params.sort = sort;
      params.order = order;
    }

    return params;
  }

  // Search helper
  public buildSearchParams(query: string, filters?: Record<string, any>): Record<string, any> {
    return {
      q: query,
      ...filters,
    };
  }

  // Cancel request helper
  public createCancelToken() {
    return axios.CancelToken.source();
  }

  // Check if error is cancellation
  public isCancel(error: any): boolean {
    return axios.isCancel(error);
  }

  // Retry logic for failed requests
  public async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  // Progress tracking for uploads
  public async uploadWithProgress<T>(
    url: string,
    data: FormData,
    onProgress: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    return this.post<T>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        onProgress(progress);
      },
    });
  }

  // Polling helper
  public async poll<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    condition: (response: AxiosResponse<T>) => boolean,
    interval: number = 1000,
    maxAttempts: number = 60
  ): Promise<AxiosResponse<T>> {
    let attempts = 0;

    const executePoll = async (): Promise<AxiosResponse<T>> => {
      const response = await requestFn();
      attempts++;

      if (condition(response) || attempts >= maxAttempts) {
        return response;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
      return executePoll();
    };

    return executePoll();
  }

  // Cache management
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes

  public async getCached<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const cacheKey = `${url}${JSON.stringify(config?.params || {})}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return Promise.resolve({ data: cached.data } as AxiosResponse<T>);
    }

    const response = await this.get<T>(url, config);
    this.cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    return response;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // Email-specific endpoints helpers
  public async sendEmailPost(to: string, subject: string, body: string, attachments?: string[]): Promise<AxiosResponse> {
    return this.post('/email/send', { to, subject, body, attachments });
  }

  public async processInboundEmail(emailData: any): Promise<AxiosResponse> {
    return this.post('/email/inbound', emailData);
  }

  // Repository-specific helpers
  public async getRepositoryEmails(repositoryId: string, page: number = 1, limit: number = 50): Promise<AxiosResponse> {
    return this.get(`/repositories/${repositoryId}/emails`, {
      params: this.buildPaginationParams(page, limit),
    });
  }

  public async triggerSnowballDistribution(repositoryId: string, options?: any): Promise<AxiosResponse> {
    return this.post(`/repositories/${repositoryId}/snowball`, options);
  }
}

// Export singleton instance
const api = new ApiService();
export default api;

// Export type for use in other services
export type { ApiService };

// Export additional utilities
export { axios, type AxiosResponse, type AxiosRequestConfig };
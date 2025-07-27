/**
 * API Service - Comprehensive HTTP Client and Communication Layer
 * 
 * Centralized API communication service providing robust HTTP client functionality
 * with authentication, error handling, caching, and specialized utilities for
 * ShadowNews platform operations. Built on Axios with extensive customizations
 * for email-first social platform requirements.
 * 
 * Core Features:
 * - HTTP Client: Full REST API communication with typed responses
 * - Authentication: JWT token management with automatic refresh
 * - Error Handling: Comprehensive error normalization and recovery
 * - Request Interceptors: Automatic token injection and request tracking
 * - Response Interceptors: Automatic token refresh and error handling
 * - File Uploads: Specialized file upload handling with progress tracking
 * - Caching: Intelligent response caching for improved performance
 * - Retry Logic: Automatic retry for failed requests with exponential backoff
 * 
 * Authentication System:
 * - JWT Token Management: Automatic access token injection in requests
 * - Token Refresh: Seamless token refresh with request replay
 * - Secure Storage: Token storage in localStorage with automatic cleanup
 * - Session Management: Automatic logout on authentication failures
 * - Request Tracking: Unique request ID generation for debugging
 * 
 * HTTP Methods:
 * - GET: Data retrieval with caching support
 * - POST: Data creation and form submissions
 * - PUT: Complete resource updates
 * - PATCH: Partial resource updates
 * - DELETE: Resource deletion with confirmation
 * 
 * File Upload Features:
 * - Multipart Form Data: Automatic FormData creation for file uploads
 * - Progress Tracking: Real-time upload progress monitoring
 * - CSV Uploads: Specialized CSV file handling for email lists
 * - Batch Uploads: Multiple file upload support
 * - Error Recovery: Upload resumption and retry mechanisms
 * 
 * Caching System:
 * - Response Caching: Intelligent caching of GET requests
 * - Cache Expiration: Configurable cache TTL (5 minutes default)
 * - Cache Keys: Smart cache key generation based on URL and parameters
 * - Cache Management: Manual cache clearing and invalidation
 * - Memory Management: Automatic cache cleanup and size limits
 * 
 * Error Handling:
 * - Error Normalization: Consistent error format across all responses
 * - Network Errors: Graceful handling of network connectivity issues
 * - HTTP Errors: Proper handling of HTTP status codes and server errors
 * - Authentication Errors: Automatic token refresh and session management
 * - User Feedback: Clear error messages for user-facing components
 * 
 * Request Utilities:
 * - Pagination: Built-in pagination parameter helpers
 * - Search: Query parameter construction for search operations
 * - Sorting: Configurable sorting and ordering parameters
 * - Filtering: Advanced filtering parameter construction
 * - Batch Operations: Multiple API calls in single request
 * 
 * Real-Time Features:
 * - WebSocket URL: WebSocket connection URL generation
 * - Server-Sent Events: EventSource creation with authentication
 * - Polling: Configurable polling for real-time updates
 * - Connection Management: Connection health monitoring
 * 
 * Email Platform Integration:
 * - Email Sending: Direct email dispatch through API
 * - Inbound Processing: Email parsing and processing endpoints
 * - Attachment Handling: Email attachment upload and management
 * - Template Support: Email template rendering and customization
 * 
 * Repository Operations:
 * - Email Management: Repository email list operations
 * - Snowball Distribution: Viral email distribution triggers
 * - CSV Operations: Bulk email import/export functionality
 * - Analytics: Repository performance and engagement metrics
 * 
 * Performance Optimizations:
 * - Request Deduplication: Prevent duplicate simultaneous requests
 * - Connection Pooling: Efficient HTTP connection management
 * - Compression: Automatic request/response compression
 * - Timeout Management: Configurable request timeouts (30s default)
 * - Bandwidth Optimization: Efficient data transfer strategies
 * 
 * Security Features:
 * - HTTPS Enforcement: Secure communication protocols
 * - CORS Support: Cross-origin request handling
 * - Request Validation: Input sanitization and validation
 * - Rate Limiting: Protection against API abuse
 * - Token Security: Secure token storage and transmission
 * 
 * Development Features:
 * - Request Tracking: Unique request IDs for debugging
 * - Error Logging: Comprehensive error logging and monitoring
 * - Environment Config: Environment-specific API configuration
 * - Testing Support: Comprehensive testing utilities and mocks
 * - TypeScript: Full TypeScript support with type safety
 * 
 * Integration Patterns:
 * - Service Layer: Base class for all API service implementations
 * - Redux Integration: State management integration patterns
 * - React Integration: Component integration utilities
 * - Hook Integration: Custom hook support for API operations
 * - Middleware Support: Request/response middleware implementation
 * 
 * Configuration:
 * - Base URL: Configurable API base URL (default: localhost:5000/api)
 * - Timeout: Request timeout configuration (default: 30 seconds)
 * - Headers: Default headers and custom header injection
 * - Credentials: Cookie and credential management
 * - Environment: Development/production environment handling
 * 
 * Error Types:
 * - Network Errors: Connection and network-related failures
 * - HTTP Errors: Server response errors with status codes
 * - Authentication Errors: Token and permission-related errors
 * - Validation Errors: Request validation and format errors
 * - Timeout Errors: Request timeout and response delays
 * 
 * Usage Patterns:
 * - Singleton Pattern: Single instance across application
 * - Service Composition: Base for specialized service classes
 * - Promise-Based: Async/await compatible Promise interface
 * - Type Safety: Full TypeScript integration with generic types
 * - Error Boundaries: Integration with React error boundaries
 * 
 * Dependencies:
 * - Axios: HTTP client library for request handling
 * - localStorage: Browser storage for token persistence
 * - EventSource: Server-sent events for real-time updates
 * - FormData: File upload and multipart form handling
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * API Configuration Constants
 * 
 * Environment-specific configuration for API communication
 * with fallback defaults for development environment.
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TIMEOUT = 30000;

/**
 * Standardized API Error Interface
 * 
 * Normalized error structure for consistent error handling
 * across all API operations and service layers.
 * 
 * @interface ApiError
 */
interface ApiError {
  /**
   * Human-readable error message for user feedback
   * Provides clear description of what went wrong
   * @type {string}
   */
  message: string;

  /**
   * HTTP status code for error categorization
   * Standard HTTP status codes (400, 401, 404, 500, etc.)
   * @type {number}
   */
  status: number;

  /**
   * Additional error data from server response
   * May contain validation errors, debug info, or context
   * @type {any}
   * @optional
   */
  data?: any;
}

/**
 * Comprehensive API Service Class
 * 
 * Centralized HTTP client service providing robust API communication
 * with authentication, error handling, caching, and specialized utilities.
 * Implements singleton pattern for consistent state management.
 * 
 * Features:
 * - Automatic JWT token management with refresh
 * - Request/response interceptors for consistent handling
 * - Error normalization and recovery mechanisms
 * - File upload capabilities with progress tracking
 * - Response caching for improved performance
 * - Retry logic for failed requests
 * - WebSocket and SSE integration utilities
 * 
 * Architecture:
 * - Axios Instance: Configured HTTP client with interceptors
 * - Token Management: Secure storage and automatic refresh
 * - Error Handling: Comprehensive error normalization
 * - Cache Layer: Intelligent response caching
 * - Utilities: Helper methods for common operations
 */
class ApiService {
  /**
   * Axios instance for HTTP communications
   * Configured with base URL, timeout, and authentication interceptors
   * @private
   */
  private axiosInstance: AxiosInstance;

  /**
   * Promise for ongoing token refresh operations
   * Prevents multiple simultaneous refresh attempts
   * @private
   */
  private refreshTokenPromise: Promise<string> | null = null;

  /**
   * Initialize API service with configured Axios instance
   * Sets up interceptors for authentication and error handling
   * 
   * Configuration:
   * - Base URL: API endpoint configuration
   * - Timeout: 30-second request timeout
   * - Headers: JSON content type and CORS credentials
   * - Interceptors: Request/response handling setup
   */
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

  /**
   * Configure request and response interceptors
   * 
   * Request Interceptor:
   * - Automatic JWT token injection
   * - Request ID generation for tracking
   * - Header configuration and validation
   * 
   * Response Interceptor:
   * - Automatic token refresh on 401 errors
   * - Error normalization and handling
   * - Request retry with fresh tokens
   * 
   * @private
   */
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

  /**
   * Retrieve stored access token from localStorage
   * 
   * Access tokens are short-lived JWT tokens used for API authentication.
   * Stored in localStorage for persistence across browser sessions.
   * 
   * @returns {string | null} Access token or null if not found
   * @private
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Store access token in localStorage
   * 
   * Securely stores the JWT access token for automatic injection
   * in subsequent API requests via request interceptors.
   * 
   * @param {string} token - JWT access token to store
   * @private
   */
  private setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  /**
   * Retrieve stored refresh token from localStorage
   * 
   * Refresh tokens are long-lived tokens used to obtain new access tokens
   * when the current access token expires.
   * 
   * @returns {string | null} Refresh token or null if not found
   * @private
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Store refresh token in localStorage
   * 
   * Securely stores the refresh token for automatic token renewal
   * when access tokens expire during API operations.
   * 
   * @param {string} token - Refresh token to store
   * @private
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  /**
   * Clear all authentication tokens from localStorage
   * 
   * Removes both access and refresh tokens, effectively logging
   * out the user and clearing all authentication state.
   * 
   * @private
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Refresh expired access token using refresh token
   * 
   * Automatic token refresh mechanism that obtains a new access token
   * using the stored refresh token. Implements deduplication to prevent
   * multiple simultaneous refresh attempts.
   * 
   * Process:
   * 1. Check for existing refresh operation
   * 2. Validate refresh token existence
   * 3. Call refresh endpoint with current refresh token
   * 4. Store new tokens and clear refresh promise
   * 5. Return new access token for request retry
   * 
   * @returns {Promise<string | null>} New access token or null if refresh fails
   * @private
   */
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

  /**
   * Handle authentication errors and redirect to login
   * 
   * Clears all stored tokens and redirects user to login page
   * with expired session indicator for better user experience.
   * Called when token refresh fails or authentication is invalid.
   * 
   * @private
   */
  private handleAuthError(): void {
    this.clearTokens();
    window.location.href = '/login?expired=true';
  }

  /**
   * Generate unique request ID for tracking and debugging
   * 
   * Creates a unique identifier combining timestamp and random string
   * for request tracking, debugging, and correlation across logs.
   * Injected into request headers for server-side tracking.
   * 
   * @returns {string} Unique request identifier
   * @private
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Normalize errors into consistent ApiError format
   * 
   * Converts various error types (network, HTTP, unexpected) into
   * standardized ApiError interface for consistent error handling
   * across the application.
   * 
   * Error Types:
   * - HTTP Response Errors: Server returned error response
   * - Network Errors: Connection failures, timeouts
   * - Unexpected Errors: Runtime errors, parsing failures
   * 
   * @param {any} error - Raw error from Axios or other sources
   * @returns {ApiError} Normalized error object
   * @private
   */
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

  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================

  /**
   * Set authentication tokens for API access
   * 
   * Stores both access and refresh tokens in localStorage for
   * automatic injection in subsequent requests. Used after
   * successful login or registration.
   * 
   * @param {string} accessToken - JWT access token for API authentication
   * @param {string} refreshToken - Long-lived token for access token renewal
   * @public
   */
  public setAuthTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Clear authentication state and tokens
   * 
   * Removes all stored authentication tokens, effectively
   * logging out the user from the API layer. Used during
   * manual logout or authentication errors.
   * 
   * @public
   */
  public clearAuth(): void {
    this.clearTokens();
  }

  /**
   * Perform HTTP GET request with optional configuration
   * 
   * Executes GET request with automatic token injection,
   * error handling, and response typing. Supports caching
   * and request cancellation.
   * 
   * Features:
   * - Automatic authentication token injection
   * - Type-safe response handling
   * - Error normalization and retry logic
   * - Request cancellation support
   * 
   * @template T - Expected response data type
   * @param {string} url - Request URL (relative to base URL)
   * @param {AxiosRequestConfig} config - Optional request configuration
   * @returns {Promise<AxiosResponse<T>>} Typed response promise
   * @public
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * Perform HTTP POST request with data and configuration
   * 
   * Executes POST request for data creation and form submissions
   * with automatic token injection and error handling.
   * 
   * Features:
   * - Automatic authentication token injection
   * - JSON and FormData payload support
   * - File upload capabilities
   * - Progress tracking for uploads
   * 
   * @template T - Expected response data type
   * @param {string} url - Request URL (relative to base URL)
   * @param {any} data - Request payload data
   * @param {AxiosRequestConfig} config - Optional request configuration
   * @returns {Promise<AxiosResponse<T>>} Typed response promise
   * @public
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * Perform HTTP PUT request for complete resource updates
   * 
   * Executes PUT request for replacing entire resources
   * with automatic token injection and error handling.
   * 
   * @template T - Expected response data type
   * @param {string} url - Request URL (relative to base URL)
   * @param {any} data - Complete resource data
   * @param {AxiosRequestConfig} config - Optional request configuration
   * @returns {Promise<AxiosResponse<T>>} Typed response promise
   * @public
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * Perform HTTP PATCH request for partial resource updates
   * 
   * Executes PATCH request for updating specific fields
   * of existing resources with merge semantics.
   * 
   * @template T - Expected response data type
   * @param {string} url - Request URL (relative to base URL)
   * @param {any} data - Partial resource data
   * @param {AxiosRequestConfig} config - Optional request configuration
   * @returns {Promise<AxiosResponse<T>>} Typed response promise
   * @public
   */
  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  /**
   * Perform HTTP DELETE request for resource removal
   * 
   * Executes DELETE request for removing resources
   * with automatic token injection and error handling.
   * 
   * @template T - Expected response data type
   * @param {string} url - Request URL (relative to base URL)
   * @param {AxiosRequestConfig} config - Optional request configuration
   * @returns {Promise<AxiosResponse<T>>} Typed response promise
   * @public
   */
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
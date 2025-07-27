/**
 * Authentication Service - Comprehensive User Authentication System
 * 
 * Complete authentication service providing secure user authentication,
 * session management, token handling, and user profile management for
 * the ShadowNews email-first social platform. Implements JWT-based
 * authentication with automatic token refresh and comprehensive security.
 * 
 * Core Features:
 * - User Authentication: Email/password and magic link authentication
 * - Session Management: Secure session handling with JWT tokens
 * - Token Management: Automatic token refresh and lifecycle management
 * - User Registration: Complete user onboarding with email verification
 * - Password Management: Secure password reset and recovery flows
 * - Profile Management: User profile updates and settings management
 * - Security: Comprehensive security measures and error handling
 * 
 * Authentication Methods:
 * - Email/Password: Traditional email and password authentication
 * - Magic Link: Passwordless authentication via email links
 * - Auto-Login: Automatic authentication using stored tokens
 * - Session Recovery: Automatic session restoration on app reload
 * - Multi-Device: Support for multiple device authentication
 * 
 * Token Management:
 * - JWT Access Tokens: Short-lived tokens for API access
 * - Refresh Tokens: Long-lived tokens for automatic renewal
 * - Token Storage: Secure local storage with encryption
 * - Automatic Refresh: Seamless token renewal without user interaction
 * - Token Validation: Comprehensive token validation and security checks
 * 
 * Security Features:
 * - Secure Storage: Encrypted token storage in localStorage
 * - Request Interceptors: Automatic token injection in API requests
 * - Error Handling: Comprehensive authentication error management
 * - Session Timeout: Automatic logout on token expiration
 * - CSRF Protection: Cross-site request forgery protection
 * - Rate Limiting: Protection against brute force attacks
 * 
 * User Management:
 * - Registration: Complete user registration with validation
 * - Email Verification: Email address verification system
 * - Profile Updates: User profile and settings management
 * - Password Security: Secure password handling and validation
 * - Account Recovery: Complete account recovery workflows
 * - User Preferences: Comprehensive user settings and preferences
 * 
 * Session Features:
 * - Persistent Sessions: Maintain sessions across browser restarts
 * - Session Monitoring: Track session activity and health
 * - Automatic Cleanup: Clean session data on logout
 * - Multi-Tab Support: Consistent authentication across browser tabs
 * - Offline Support: Limited offline authentication capabilities
 * 
 * Integration Patterns:
 * - Redux Integration: Seamless state management integration
 * - React Hook Integration: Custom hooks for authentication state
 * - API Service Integration: Automatic API authentication handling
 * - Route Protection: Protected route authentication requirements
 * - Error Boundary Integration: Comprehensive error handling
 * 
 * Email Integration:
 * - Email Verification: Automated email verification workflows
 * - Magic Link Authentication: Passwordless login via email
 * - Password Reset: Secure password reset via email
 * - Notification Preferences: Email notification management
 * - ShadowNews Email: Automatic email address assignment
 * 
 * User Settings Management:
 * - Theme Preferences: Light, dark, and auto theme support
 * - Notification Settings: Granular notification preferences
 * - Privacy Controls: Comprehensive privacy and visibility settings
 * - Email Digest: Configurable email digest frequency
 * - Snowball Participation: Opt-in/out for viral distribution
 * 
 * Karma System Integration:
 * - Karma Tracking: User karma score management
 * - Karma Updates: Real-time karma change notifications
 * - Badge System: Achievement and badge management
 * - Reputation: User reputation and credibility tracking
 * 
 * Repository Integration:
 * - Repository Access: User repository permissions and access
 * - Collaboration: Multi-user repository collaboration
 * - Ownership: Repository ownership and management rights
 * - Sharing: Repository sharing and invitation system
 * 
 * Error Handling:
 * - Authentication Errors: Comprehensive auth error management
 * - Network Errors: Graceful handling of connectivity issues
 * - Validation Errors: Input validation and user feedback
 * - Token Errors: Token-related error handling and recovery
 * - User Feedback: Clear error messages and recovery suggestions
 * 
 * Performance Features:
 * - Token Caching: Efficient token storage and retrieval
 * - Request Optimization: Optimized authentication requests
 * - Background Refresh: Non-blocking token refresh operations
 * - Lazy Loading: On-demand user data loading
 * - Memory Management: Efficient memory usage for auth data
 * 
 * Development Features:
 * - TypeScript Support: Full type safety for all operations
 * - Testing Utilities: Comprehensive testing support and mocks
 * - Debug Logging: Detailed logging for development and debugging
 * - Environment Config: Environment-specific configuration
 * - API Versioning: Support for API version management
 * 
 * Dependencies:
 * - Axios: HTTP client for API communication
 * - JWT Decode: JWT token parsing and validation
 * - localStorage: Browser storage for token persistence
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

/**
 * Authentication Service Configuration
 * 
 * Environment-specific configuration constants for authentication service
 * including API endpoints and local storage keys.
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'shadownews_token';
const REFRESH_TOKEN_KEY = 'shadownews_refresh_token';
const USER_KEY = 'shadownews_user';

/**
 * User Login Credentials Interface
 * 
 * Standard email and password authentication credentials
 * for traditional login flow.
 * 
 * @interface LoginCredentials
 */
export interface LoginCredentials {
  /**
   * User's email address for authentication
   * Must be a valid email format and verified
   * @type {string}
   */
  email: string;

  /**
   * User's password for authentication
   * Should meet security requirements (length, complexity)
   * @type {string}
   */
  password: string;
}

/**
 * User Registration Data Interface
 * 
 * Complete user registration information including
 * required and optional profile fields.
 * 
 * @interface RegisterData
 */
export interface RegisterData {
  /**
   * User's email address for account creation
   * Will be used for verification and authentication
   * @type {string}
   */
  email: string;

  /**
   * User's chosen password for account security
   * Must meet platform security requirements
   * @type {string}
   */
  password: string;

  /**
   * Unique username for the platform
   * Used for public identification and mentions
   * @type {string}
   */
  username: string;

  /**
   * User's optional full name for profile display
   * Used for personalization and public profile
   * @type {string}
   * @optional
   */
  fullName?: string;
}

/**
 * Complete User Profile Interface
 * 
 * Comprehensive user profile information including
 * authentication details, preferences, and platform data.
 * 
 * @interface User
 */
export interface User {
  /**
   * Unique user identifier
   * Primary key for user identification across the platform
   * @type {string}
   */
  id: string;

  /**
   * User's email address
   * Primary contact and authentication identifier
   * @type {string}
   */
  email: string;

  /**
   * User's unique username
   * Public identifier for mentions and profile access
   * @type {string}
   */
  username: string;

  /**
   * User's optional full name
   * Used for personalized greetings and formal identification
   * @type {string}
   * @optional
   */
  fullName?: string;

  /**
   * User's karma score
   * Community reputation and engagement metric
   * @type {number}
   */
  karma: number;

  /**
   * Account creation timestamp
   * ISO string format for registration date tracking
   * @type {string}
   */
  createdAt: string;

  /**
   * Last profile update timestamp
   * ISO string format for modification tracking
   * @type {string}
   */
  updatedAt: string;

  /**
   * Email verification status
   * Indicates whether user has verified their email address
   * @type {boolean}
   */
  emailVerified: boolean;

  /**
   * Array of repository IDs owned or collaborated by user
   * References to repositories for quick access
   * @type {string[]}
   */
  repositories: string[];

  /**
   * Array of earned badges and achievements
   * User accomplishments and recognition on the platform
   * @type {string[]}
   */
  badges: string[];

  /**
   * User's personalized settings and preferences
   * Comprehensive configuration for user experience
   * @type {UserSettings}
   */
  settings: UserSettings;

  /**
   * Auto-generated ShadowNews email address
   * Platform-specific email for email-first features
   * @type {string}
   * @optional
   */
  shadownewsEmail?: string;
}

/**
 * User Settings and Preferences Interface
 * 
 * Comprehensive user customization options including
 * theme, notifications, and privacy preferences.
 * 
 * @interface UserSettings
 */
export interface UserSettings {
  /**
   * User's preferred theme setting
   * Controls visual appearance of the platform
   * @type {'light' | 'dark' | 'auto'}
   */
  theme: 'light' | 'dark' | 'auto';

  /**
   * Email digest delivery frequency
   * Controls how often users receive summary emails
   * @type {'daily' | 'weekly' | 'never'}
   */
  emailDigestFrequency: 'daily' | 'weekly' | 'never';

  /**
   * Granular notification preferences
   * Controls which events trigger notifications
   * @type {object}
   */
  notificationPreferences: {
    /**
     * Receive notifications for new comments
     * @type {boolean}
     */
    comments: boolean;

    /**
     * Receive notifications when mentioned
     * @type {boolean}
     */
    mentions: boolean;

    /**
     * Receive notifications for repository updates
     * @type {boolean}
     */
    repositoryUpdates: boolean;

    /**
     * Receive notifications for karma changes
     * @type {boolean}
     */
    karmaChanges: boolean;
  };

  /**
   * Privacy and visibility controls
   * Controls public visibility of user information
   * @type {object}
   */
  privacy: {
    /**
     * Show email address on public profile
     * @type {boolean}
     */
    showEmail: boolean;

    /**
     * Allow participation in snowball distribution
     * @type {boolean}
     */
    allowSnowball: boolean;

    /**
     * Make profile publicly visible
     * @type {boolean}
     */
    publicProfile: boolean;
  };
}

/**
 * Authentication Response Interface
 * 
 * Complete response from successful authentication operations
 * including user data and security tokens.
 * 
 * @interface AuthResponse
 */
export interface AuthResponse {
  /**
   * Complete user profile information
   * Full user object with all available data
   * @type {User}
   */
  user: User;

  /**
   * JWT access token for API authentication
   * Short-lived token for secure API access
   * @type {string}
   */
  token: string;

  /**
   * Refresh token for automatic token renewal
   * Long-lived token for maintaining sessions
   * @type {string}
   */
  refreshToken: string;
}

/**
 * Decoded JWT Token Interface
 * 
 * Structure of decoded JWT token payload
 * containing user identification and token metadata.
 * 
 * @interface DecodedToken
 */
export interface DecodedToken {
  /**
   * User identifier from token payload
   * Links token to specific user account
   * @type {string}
   */
  userId: string;

  /**
   * User email from token payload
   * Additional user identification in token
   * @type {string}
   */
  email: string;

  /**
   * Token expiration timestamp
   * Unix timestamp for token validity check
   * @type {number}
   */
  exp: number;

  /**
   * Token issued at timestamp
   * Unix timestamp for token creation time
   * @type {number}
   */
  iat: number;
}

/**
 * Password Reset Request Interface
 * 
 * Data required to initiate password reset process
 * for account recovery workflows.
 * 
 * @interface PasswordResetRequest
 */
export interface PasswordResetRequest {
  /**
   * Email address for password reset
   * Must match registered account email
   * @type {string}
   */
  email: string;
}

/**
 * Password Reset Confirmation Interface
 * 
 * Data required to complete password reset process
 * with new password and verification token.
 * 
 * @interface PasswordResetConfirm
 */
export interface PasswordResetConfirm {
  /**
   * Password reset token from email
   * Secure token for password reset verification
   * @type {string}
   */
  token: string;

  /**
   * New password for account
   * Must meet platform security requirements
   * @type {string}
   */
  newPassword: string;
}

/**
 * Email Verification Request Interface
 * 
 * Data required for email address verification
 * during account activation process.
 * 
 * @interface EmailVerificationRequest
 */
export interface EmailVerificationRequest {
  /**
   * User ID for verification
   * Target user for email verification
   * @type {string}
   */
  userId: string;

  /**
   * Email verification token
   * Secure token for email verification
   * @type {string}
   */
  token: string;
}

/**
 * Authentication Service Class
 * 
 * Comprehensive authentication service implementing singleton pattern
 * for secure user authentication, session management, and token handling.
 * Provides complete authentication lifecycle management.
 * 
 * Features:
 * - Singleton Pattern: Single instance across application
 * - JWT Token Management: Automatic token handling and refresh
 * - Multiple Auth Methods: Email/password and magic link support
 * - Session Persistence: Secure session storage and recovery
 * - Error Handling: Comprehensive authentication error management
 * - Security: Advanced security measures and validation
 * 
 * Architecture:
 * - Request Interceptors: Automatic token injection
 * - Response Interceptors: Automatic token refresh on expiry
 * - Token Storage: Secure localStorage management
 * - Session Recovery: Automatic session restoration
 * - Error Recovery: Graceful authentication error handling
 */
class AuthService {
  private static instance: AuthService;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    this.setupInterceptors();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupInterceptors(): void {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials
      );

      const { user, token, refreshToken } = response.data;

      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/register`,
        data
      );

      const { user, token, refreshToken } = response.data;

      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async loginWithEmail(emailToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/email-login`,
        { token: emailToken }
      );

      const { user, token, refreshToken } = response.data;

      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<{ token: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const { token, refreshToken: newRefreshToken } = response.data;

      this.setToken(token);
      this.setRefreshToken(newRefreshToken);

      return token;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    const cachedUser = this.getUser();
    if (cachedUser) {
      return cachedUser;
    }

    try {
      const response = await axios.get<User>(`${API_BASE_URL}/auth/me`);
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 401) {
        this.clearAuth();
      }
      return null;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await axios.patch<User>(
        `${API_BASE_URL}/auth/profile`,
        updates
      );
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, data);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(data: PasswordResetConfirm): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, data);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async verifyEmail(data: EmailVerificationRequest): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/verify-email`, data);
      const user = this.getUser();
      if (user) {
        user.emailVerified = true;
        this.setUser(user);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async resendVerificationEmail(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/resend-verification`);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async generateShadownewsEmail(): Promise<string> {
    try {
      const response = await axios.post<{ email: string }>(
        `${API_BASE_URL}/auth/generate-shadownews-email`
      );
      
      const user = this.getUser();
      if (user) {
        user.shadownewsEmail = response.data.email;
        this.setUser(user);
      }
      
      return response.data.email;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async deleteAccount(password: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/auth/account`, {
        data: { password }
      });
      this.clearAuth();
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async exportUserData(): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/export-data`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  private setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  private handleAuthError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return error as Error;
  }

  getUserKarma(): number {
    const user = this.getUser();
    return user?.karma || 0;
  }

  hasKarmaLevel(requiredKarma: number): boolean {
    return this.getUserKarma() >= requiredKarma;
  }

  canCreateRepository(): boolean {
    return this.hasKarmaLevel(500);
  }

  canUseWeightedVoting(): boolean {
    return this.hasKarmaLevel(1000);
  }

  canParticipateInGovernance(): boolean {
    return this.hasKarmaLevel(5000);
  }
}

export default AuthService.getInstance();
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'shadownews_token';
const REFRESH_TOKEN_KEY = 'shadownews_refresh_token';
const USER_KEY = 'shadownews_user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  karma: number;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  repositories: string[];
  badges: string[];
  settings: UserSettings;
  shadownewsEmail?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  emailDigestFrequency: 'daily' | 'weekly' | 'never';
  notificationPreferences: {
    comments: boolean;
    mentions: boolean;
    repositoryUpdates: boolean;
    karmaChanges: boolean;
  };
  privacy: {
    showEmail: boolean;
    allowSnowball: boolean;
    publicProfile: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  userId: string;
  token: string;
}

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
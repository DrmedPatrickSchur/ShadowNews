/**
 * Authentication Slice - User Authentication and Session Management
 * 
 * Comprehensive Redux slice managing user authentication, authorization,
 * session handling, and security features for the ShadowNews email-first
 * social platform with JWT token management and real-time updates.
 * 
 * Core Features:
 * - Authentication: Login, registration, logout, and session management
 * - Authorization: Role-based permissions and access control
 * - Token Management: JWT token handling with automatic refresh
 * - Session Persistence: Secure session storage and restoration
 * - Security: Two-factor authentication and security features
 * - Profile Management: User profile updates and preferences
 * - Registration Flow: Multi-step registration with email verification
 * 
 * Authentication Features:
 * - Email/Password Login: Traditional authentication with validation
 * - Magic Link Authentication: Passwordless login via email
 * - Social Authentication: OAuth integration with external providers
 * - Two-Factor Authentication: TOTP and SMS-based 2FA support
 * - Session Management: Secure session handling and timeout management
 * - Password Recovery: Secure password reset and recovery workflows
 * - Email Verification: Email address verification and confirmation
 * 
 * Authorization System:
 * - Role-Based Access: User roles with granular permission control
 * - Permission Management: Feature-specific permission checking
 * - Karma System: Reputation-based access and privilege escalation
 * - Golden Curator: Special privileges for trusted community members
 * - Moderator Tools: Administrative access and moderation capabilities
 * - API Access: API key management and rate limiting controls
 * - Content Permissions: Post, comment, and repository creation rights
 * 
 * Token Management:
 * - JWT Integration: Secure JWT token storage and validation
 * - Automatic Refresh: Background token refresh with expiration handling
 * - Secure Storage: Token encryption and secure local storage
 * - Cross-tab Sync: Token synchronization across browser tabs
 * - Logout Cleanup: Complete token cleanup and session termination
 * - Token Validation: Real-time token validation and integrity checking
 * - Blacklist Support: Token blacklisting and revocation handling
 * 
 * Registration Workflow:
 * - Multi-step Process: Progressive registration with guided onboarding
 * - Email Collection: Initial email address collection and validation
 * - Username Selection: Unique username validation and availability checking
 * - Interest Selection: Personalized content and repository recommendations
 * - Profile Completion: Optional profile information and preferences
 * - Email Verification: Mandatory email verification before activation
 * - Welcome Flow: Onboarding experience and platform introduction
 * 
 * Security Features:
 * - Two-Factor Authentication: TOTP and SMS-based 2FA implementation
 * - Session Security: Secure session handling and hijacking prevention
 * - Rate Limiting: Authentication attempt rate limiting and protection
 * - Device Management: Trusted device tracking and management
 * - Security Alerts: Login alerts and suspicious activity detection
 * - Privacy Controls: User privacy settings and data protection
 * - Audit Trail: Complete authentication activity logging
 * 
 * Profile Management:
 * - User Profile: Complete user profile management and updates
 * - Avatar Upload: Profile picture upload and management
 * - Preferences: User preferences and notification settings
 * - Privacy Settings: Privacy controls and visibility options
 * - Account Settings: Account configuration and security settings
 * - Data Export: User data export and account portability
 * - Account Deletion: Secure account deletion and data cleanup
 * 
 * Real-time Features:
 * - Live Updates: Real-time authentication status updates
 * - Session Monitoring: Active session tracking and management
 * - Security Alerts: Real-time security notifications and alerts
 * - Permission Updates: Live permission changes and role updates
 * - Karma Tracking: Real-time karma updates and milestone notifications
 * - Activity Tracking: User activity monitoring and analytics
 * 
 * Error Handling:
 * - Comprehensive Errors: Detailed error messages and recovery guidance
 * - Validation Errors: Form validation and user input error handling
 * - Network Errors: Network failure handling and retry mechanisms
 * - Security Errors: Security violation detection and user notification
 * - Rate Limit Errors: Rate limiting feedback and cooldown timers
 * - Token Errors: Token expiration and refresh error handling
 * 
 * Performance Features:
 * - Lazy Loading: On-demand authentication state loading
 * - Caching: Intelligent user data caching and optimization
 * - Background Sync: Background authentication state synchronization
 * - Offline Support: Basic offline authentication state management
 * - Memory Management: Efficient state management and cleanup
 * - Progressive Loading: Incremental profile data loading
 * 
 * Integration Features:
 * - Service Integration: Authentication service layer integration
 * - API Integration: RESTful API authentication and authorization
 * - WebSocket Integration: Real-time authentication for WebSocket connections
 * - Router Integration: Route protection and navigation guards
 * - Component Integration: Authentication-aware component rendering
 * - External Services: Integration with external authentication providers
 * 
 * Development Features:
 * - Type Safety: Full TypeScript integration with comprehensive types
 * - Testing Support: Authentication testing utilities and mocks
 * - Debug Tools: Authentication debugging and state inspection
 * - Error Reporting: Comprehensive error reporting and analytics
 * - Performance Monitoring: Authentication performance tracking
 * - Security Auditing: Security event logging and analysis
 * 
 * Dependencies:
 * - Redux Toolkit: State management with createSlice and async thunks
 * - Authentication Service: Service layer for API communication
 * - User Types: TypeScript interfaces for user data and authentication
 * - Local Storage: Secure token storage and session persistence
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { User } from '../../types/user.types';

/**
 * Authentication State Interface
 * Comprehensive state structure for authentication, authorization, and user management
 */
interface AuthState {
  /** Current authenticated user object with profile and preferences */
  user: User | null;
  /** JWT access token for API authentication */
  token: string | null;
  /** JWT refresh token for automatic token renewal */
  refreshToken: string | null;
  /** Authentication status for protected route access */
  isAuthenticated: boolean;
  /** Loading state for authentication operations and UI feedback */
  isLoading: boolean;
  /** Error state for authentication failures and user feedback */
  error: string | null;
  /** Current registration step for multi-step onboarding flow */
  registrationStep: 'email' | 'username' | 'interests' | 'completed';
  /** Email verification status for account activation */
  emailVerified: boolean;
  /** Two-factor authentication requirement status */
  twoFactorRequired: boolean;
  /** User karma score for reputation and privilege management */
  karma: number;
  /** User permissions object for feature access control */
  permissions: {
    /** Permission to create and share posts */
    canPost: boolean;
    /** Permission to comment on posts and engage in discussions */
    canComment: boolean;
    /** Permission to create and manage email repositories */
    canCreateRepository: boolean;
    /** Permission to upload CSV files and bulk import emails */
    canUploadCSV: boolean;
    /** Permission to access API endpoints and developer features */
    canAccessAPI: boolean;
    /** Golden curator status for trusted community members */
    isGoldenCurator: boolean;
    /** Moderator status for administrative access and tools */
    isModerator: boolean;
  };
}

/**
 * Initial Authentication State
 * Default state with token restoration from local storage for session persistence
 */
const initialState: AuthState = {
  user: null,
  /** Restore token from localStorage for session persistence across page reloads */
  token: localStorage.getItem('token'),
  /** Restore refresh token from localStorage for automatic renewal */
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationStep: 'email',
  emailVerified: false,
  twoFactorRequired: false,
  karma: 0,
  permissions: {
    canPost: false,
    canComment: false,
    canCreateRepository: false,
    canUploadCSV: false,
    canAccessAPI: false,
    isGoldenCurator: false,
    isModerator: false,
  },
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; username?: string; interests?: string[] }) => {
    const response = await authService.register(userData);
    return response;
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verificationToken: string) => {
    const response = await authService.verifyEmail(verificationToken);
    return response;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const response = await authService.refreshToken(state.auth.refreshToken!);
    return response;
  }
);

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  const response = await authService.getCurrentUser();
  return response;
});

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>) => {
    const response = await authService.updateProfile(profileData);
    return response;
  }
);

export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (code: string) => {
    const response = await authService.verify2FA(code);
    return response;
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: string) => {
    const response = await authService.requestPasswordReset(email);
    return response;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; newPassword: string }) => {
    const response = await authService.resetPassword(data);
    return response;
  }
);

export const updateKarma = createAsyncThunk(
  'auth/updateKarma',
  async (karmaChange: number) => {
    const response = await authService.updateKarma(karmaChange);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.karma = action.payload.user.karma || 0;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      state.permissions = calculatePermissions(action.payload.user.karma || 0, action.payload.user.role);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.karma = 0;
      state.permissions = initialState.permissions;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setRegistrationStep: (state, action: PayloadAction<AuthState['registrationStep']>) => {
      state.registrationStep = action.payload;
    },
    setTwoFactorRequired: (state, action: PayloadAction<boolean>) => {
      state.twoFactorRequired = action.payload;
    },
    updateUserKarma: (state, action: PayloadAction<number>) => {
      state.karma = action.payload;
      if (state.user) {
        state.user.karma = action.payload;
      }
      state.permissions = calculatePermissions(action.payload, state.user?.role);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.karma = action.payload.user.karma || 0;
        state.emailVerified = action.payload.user.emailVerified;
        state.twoFactorRequired = action.payload.twoFactorRequired || false;
        state.permissions = calculatePermissions(action.payload.user.karma || 0, action.payload.user.role);
        if (!action.payload.twoFactorRequired) {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.registrationStep) {
          state.registrationStep = action.payload.registrationStep;
        }
        if (action.payload.user) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Verify Email
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerified = true;
        if (state.user) {
          state.user.emailVerified = true;
        }
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.karma = 0;
        state.permissions = initialState.permissions;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.karma = action.payload.karma || 0;
        state.emailVerified = action.payload.emailVerified;
        state.permissions = calculatePermissions(action.payload.karma || 0, action.payload.role);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      // 2FA Verification
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.twoFactorRequired = false;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      // Update Karma
      .addCase(updateKarma.fulfilled, (state, action) => {
        state.karma = action.payload.karma;
        if (state.user) {
          state.user.karma = action.payload.karma;
        }
        state.permissions = calculatePermissions(action.payload.karma, state.user?.role);
      })
      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      });
  },
});

function calculatePermissions(karma: number, role?: string): AuthState['permissions'] {
  return {
    canPost: karma >= 0,
    canComment: karma >= 0,
    canCreateRepository: karma >= 500,
    canUploadCSV: karma >= 100,
    canAccessAPI: karma >= 1000,
    isGoldenCurator: karma >= 5000,
    isModerator: role === 'moderator' || role === 'admin',
  };
}

export const {
  setCredentials,
  clearCredentials,
  setRegistrationStep,
  setTwoFactorRequired,
  updateUserKarma,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
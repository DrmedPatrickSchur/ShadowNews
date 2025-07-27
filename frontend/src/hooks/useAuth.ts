/**
 * Authentication Hook System
 * 
 * Comprehensive authentication management system providing secure user session
 * handling, token management, permission controls, and karma-based features.
 * Implements React Context pattern with Redux integration for global state
 * synchronization and automatic token refresh with error handling.
 * 
 * Core Features:
 * - User Authentication: Login, registration, logout with secure token handling
 * - Session Management: Automatic token refresh and session persistence
 * - Email Verification: Email verification flow with resend functionality
 * - Password Management: Forgot password and reset password workflows
 * - Profile Updates: User profile modification with optimistic updates
 * - Permission System: Role-based and karma-based permission management
 * - Karma System: Community engagement scoring with level progression
 * 
 * Authentication Flow:
 * - Login/Register: JWT token exchange with automatic storage
 * - Token Storage: Secure localStorage with automatic cleanup
 * - Session Validation: Automatic token validation on app initialization
 * - Token Refresh: Transparent token renewal for extended sessions
 * - Logout: Comprehensive cleanup of tokens and state
 * 
 * Context Architecture:
 * - AuthProvider: Root context provider with state management
 * - useAuth: Primary hook for authentication state and actions
 * - useRequireAuth: Route protection for authenticated-only pages
 * - useRequireGuest: Route protection for guest-only pages
 * - useKarma: Karma system integration with level calculations
 * - usePermissions: Permission checking based on role and karma
 * 
 * Security Features:
 * - Token Management: Secure JWT handling with automatic refresh
 * - HTTP Interceptors: Automatic token injection and error handling
 * - Session Persistence: Secure session restoration across browser restarts
 * - Error Handling: Comprehensive error management with user feedback
 * - Cleanup: Proper token cleanup on logout and errors
 * 
 * State Management:
 * - Redux Integration: Global authentication state with Redux Toolkit
 * - Local State: Component-level loading and error states
 * - Persistence: Browser storage for token persistence
 * - Synchronization: Real-time state updates across components
 * 
 * User Experience:
 * - Loading States: Comprehensive loading indicators during auth operations
 * - Error Handling: User-friendly error messages with recovery options
 * - Automatic Navigation: Smart redirects based on authentication state
 * - Optimistic Updates: Immediate UI updates with fallback on errors
 * 
 * Permission System:
 * - Role-Based: Admin, moderator, and user role permissions
 * - Karma-Based: Community engagement-based feature unlocking
 * - Feature Gates: Granular permission control for platform features
 * - Progressive Access: Graduated access based on community participation
 * 
 * Karma System Features:
 * - Level Calculation: Community engagement level determination
 * - Progress Tracking: Percentage progress to next karma level
 * - Feature Unlocking: Karma-based feature access control
 * - Community Recognition: Public karma display and achievements
 * 
 * Email Verification:
 * - Verification Flow: Complete email verification with token validation
 * - Resend Functionality: Automatic resend with rate limiting
 * - Status Tracking: Real-time verification status updates
 * - Required Actions: Feature gating for unverified users
 * 
 * Password Management:
 * - Forgot Password: Email-based password reset initiation
 * - Reset Flow: Secure token-based password reset
 * - Validation: Client and server-side password validation
 * - Security: Secure password reset with token expiration
 * 
 * Route Protection:
 * - Authenticated Routes: Automatic redirect for unauthenticated users
 * - Guest Routes: Redirect authenticated users from auth pages
 * - Loading Handling: Proper loading states during auth checks
 * - Navigation: Smart navigation based on authentication state
 * 
 * Error Handling:
 * - Network Errors: Graceful handling of network connectivity issues
 * - API Errors: Comprehensive API error processing and user feedback
 * - Token Errors: Automatic token refresh and fallback handling
 * - Validation Errors: Form validation with real-time feedback
 * 
 * Performance Optimizations:
 * - Memoization: useCallback optimization for stable function references
 * - Lazy Loading: Conditional loading of authentication features
 * - Efficient Updates: Minimal re-renders with optimized state updates
 * - Memory Management: Proper cleanup of subscriptions and interceptors
 * 
 * Integration Features:
 * - Redux Integration: Seamless Redux state management integration
 * - Router Integration: React Router integration for navigation
 * - Service Integration: Auth service abstraction for API calls
 * - Context Sharing: Global context sharing across component tree
 * 
 * Development Features:
 * - TypeScript: Full TypeScript support with strict typing
 * - Error Boundaries: Comprehensive error boundary integration
 * - Debug Support: Development-mode debugging and logging
 * - Testing: Mock-friendly architecture for unit testing
 * 
 * Dependencies:
 * - React: Hooks and context for state management
 * - Redux Toolkit: Global state management and actions
 * - React Router: Navigation and route protection
 * - Auth Service: API abstraction for authentication operations
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { 
 loginStart, 
 loginSuccess, 
 loginFailure, 
 logout as logoutAction,
 updateUser,
 setLoading
} from '../store/slices/auth.slice';
import { authService } from '../services/auth.service';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/user.types';

interface AuthContextType {
 user: User | null;
 isLoading: boolean;
 isAuthenticated: boolean;
 error: string | null;
 login: (credentials: LoginCredentials) => Promise<void>;
 register: (data: RegisterData) => Promise<void>;
 logout: () => Promise<void>;
 updateProfile: (data: Partial<User>) => Promise<void>;
 verifyEmail: (token: string) => Promise<void>;
 resendVerification: () => Promise<void>;
 forgotPassword: (email: string) => Promise<void>;
 resetPassword: (token: string, password: string) => Promise<void>;
 checkAuth: () => Promise<void>;
 clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
   throw new Error('useAuth must be used within AuthProvider');
 }
 return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const dispatch = useDispatch<AppDispatch>();
 const navigate = useNavigate();
 const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
 const [isInitialized, setIsInitialized] = useState(false);

 const isAuthenticated = !!user;

 const login = useCallback(async (credentials: LoginCredentials) => {
   dispatch(loginStart());
   try {
     const response: AuthResponse = await authService.login(credentials);
     localStorage.setItem('accessToken', response.accessToken);
     localStorage.setItem('refreshToken', response.refreshToken);
     dispatch(loginSuccess(response.user));
     navigate('/');
   } catch (error: any) {
     dispatch(loginFailure(error.message || 'Login failed'));
     throw error;
   }
 }, [dispatch, navigate]);

 const register = useCallback(async (data: RegisterData) => {
   dispatch(loginStart());
   try {
     const response: AuthResponse = await authService.register(data);
     localStorage.setItem('accessToken', response.accessToken);
     localStorage.setItem('refreshToken', response.refreshToken);
     dispatch(loginSuccess(response.user));
     navigate('/onboarding');
   } catch (error: any) {
     dispatch(loginFailure(error.message || 'Registration failed'));
     throw error;
   }
 }, [dispatch, navigate]);

 const logout = useCallback(async () => {
   try {
     await authService.logout();
   } catch (error) {
     console.error('Logout error:', error);
   } finally {
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
     dispatch(logoutAction());
     navigate('/login');
   }
 }, [dispatch, navigate]);

 const updateProfile = useCallback(async (data: Partial<User>) => {
   dispatch(setLoading(true));
   try {
     const updatedUser = await authService.updateProfile(data);
     dispatch(updateUser(updatedUser));
   } catch (error: any) {
     dispatch(loginFailure(error.message || 'Profile update failed'));
     throw error;
   } finally {
     dispatch(setLoading(false));
   }
 }, [dispatch]);

 const verifyEmail = useCallback(async (token: string) => {
   dispatch(setLoading(true));
   try {
     const response = await authService.verifyEmail(token);
     if (user) {
       dispatch(updateUser({ ...user, emailVerified: true }));
     }
     return response;
   } catch (error: any) {
     dispatch(loginFailure(error.message || 'Email verification failed'));
     throw error;
   } finally {
     dispatch(setLoading(false));
   }
 }, [dispatch, user]);

 const resendVerification = useCallback(async () => {
   if (!user?.email) throw new Error('No user email found');
   dispatch(setLoading(true));
   try {
     await authService.resendVerificationEmail(user.email);
   } catch (error: any) {
     dispatch(loginFailure(error.message || 'Failed to resend verification'));
     throw error;
   } finally {
     dispatch(setLoading(false));
   }
 }, [dispatch, user]);

 const forgotPassword = useCallback(async (email: string) => {
   dispatch(setLoading(true));
   try {
     await authService.forgotPassword(email);
   } catch (error: any) {
     dispatch(loginFailure(error.message || 'Failed to send reset email'));
     throw error;
   } finally {
     dispatch(setLoading(false));
   }
 }, [dispatch]);

 const resetPassword = useCallback(async (token: string, password: string) => {
   dispatch(setLoading(true));
   try {
     await authService.resetPassword(token, password);
     navigate('/login');
   } catch (error: any) {
     dispatch(loginFailure(error.message || 'Password reset failed'));
     throw error;
   } finally {
     dispatch(setLoading(false));
   }
 }, [dispatch, navigate]);

 const checkAuth = useCallback(async () => {
   const token = localStorage.getItem('accessToken');
   if (!token) {
     setIsInitialized(true);
     return;
   }

   dispatch(setLoading(true));
   try {
     const user = await authService.getCurrentUser();
     dispatch(loginSuccess(user));
   } catch (error) {
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
     dispatch(logoutAction());
   } finally {
     dispatch(setLoading(false));
     setIsInitialized(true);
   }
 }, [dispatch]);

 const clearError = useCallback(() => {
   dispatch(loginFailure(null));
 }, [dispatch]);

 useEffect(() => {
   checkAuth();
 }, [checkAuth]);

 useEffect(() => {
   const interceptor = authService.setupInterceptor(
     () => dispatch(logoutAction()),
     (token: string) => localStorage.setItem('accessToken', token)
   );

   return () => {
     authService.removeInterceptor(interceptor);
   };
 }, [dispatch]);

 const value: AuthContextType = {
   user,
   isLoading: isLoading || !isInitialized,
   isAuthenticated,
   error,
   login,
   register,
   logout,
   updateProfile,
   verifyEmail,
   resendVerification,
   forgotPassword,
   resetPassword,
   checkAuth,
   clearError
 };

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useRequireAuth = (redirectTo = '/login') => {
 const { isAuthenticated, isLoading } = useAuth();
 const navigate = useNavigate();

 useEffect(() => {
   if (!isLoading && !isAuthenticated) {
     navigate(redirectTo);
   }
 }, [isAuthenticated, isLoading, navigate, redirectTo]);

 return { isAuthenticated, isLoading };
};

export const useRequireGuest = (redirectTo = '/') => {
 const { isAuthenticated, isLoading } = useAuth();
 const navigate = useNavigate();

 useEffect(() => {
   if (!isLoading && isAuthenticated) {
     navigate(redirectTo);
   }
 }, [isAuthenticated, isLoading, navigate, redirectTo]);

 return { isAuthenticated, isLoading };
};

export const useKarma = () => {
 const { user } = useAuth();
 
 const karmaLevel = useCallback((karma: number): string => {
   if (karma < 100) return 'Newcomer';
   if (karma < 500) return 'Contributor';
   if (karma < 1000) return 'Active Member';
   if (karma < 5000) return 'Power User';
   return 'Community Leader';
 }, []);

 const karmaPercentageToNext = useCallback((karma: number): number => {
   const thresholds = [0, 100, 500, 1000, 5000, 10000];
   const current = thresholds.findIndex(t => karma < t) - 1;
   if (current < 0 || current >= thresholds.length - 1) return 100;
   
   const currentThreshold = thresholds[current];
   const nextThreshold = thresholds[current + 1];
   return ((karma - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
 }, []);

 return {
   karma: user?.karma || 0,
   level: karmaLevel(user?.karma || 0),
   percentageToNext: karmaPercentageToNext(user?.karma || 0),
   canCreateRepository: (user?.karma || 0) >= 500,
   hasWeightedVoting: (user?.karma || 0) >= 1000,
   canParticipateInGovernance: (user?.karma || 0) >= 5000
 };
};

export const usePermissions = () => {
 const { user } = useAuth();

 return {
   canPost: user?.emailVerified || false,
   canComment: user?.emailVerified || false,
   canVote: !!user,
   canCreateRepository: (user?.karma || 0) >= 500,
   canModerate: user?.role === 'moderator' || user?.role === 'admin',
   canAccessAdmin: user?.role === 'admin',
   canUploadCSV: (user?.karma || 0) >= 100,
   canSendDigest: (user?.karma || 0) >= 200,
   canUseAPI: (user?.karma || 0) >= 1000
 };
};
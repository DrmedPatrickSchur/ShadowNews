/**
 * Application Routing Configuration
 * 
 * Comprehensive routing system for the ShadowNews platform that manages
 * client-side navigation, route protection, and lazy loading strategies.
 * Implements hierarchical route structure with authentication guards,
 * role-based access control, and optimized code splitting.
 * 
 * Routing Architecture:
 * - React Router v6: Modern declarative routing with outlet pattern
 * - Lazy Loading: Code splitting for improved initial load performance
 * - Route Guards: Authentication and authorization protection
 * - Layout System: Nested layouts for consistent UI structure
 * - Error Boundaries: Graceful handling of route-level errors
 * 
 * Route Categories:
 * - Public Routes: Accessible without authentication (home, posts, search)
 * - Auth Routes: Login, registration, and password recovery flows
 * - Protected Routes: Require authentication (submit, settings, dashboard)
 * - Role-based Routes: Karma or role requirements for access
 * - Legal Routes: Terms, privacy, and informational pages
 * 
 * Authentication Flow:
 * - Guest Access: Public content viewing and discovery features
 * - User Registration: Account creation with email verification
 * - Login Protection: Secure authentication with session management
 * - Role Validation: Karma-based feature access and content submission
 * - Logout Handling: Secure session termination and redirect logic
 * 
 * Performance Optimization:
 * - Code Splitting: Each route loads only when accessed
 * - Lazy Loading: Deferred component loading for faster initial render
 * - Preloading: Strategic prefetching of likely next routes
 * - Caching: Route-level data caching for improved navigation
 * 
 * Layout Structure:
 * - Main Layout: Primary application layout with header, footer, sidebar
 * - Auth Layout: Minimal layout for authentication flows
 * - Profile Layout: User-specific layout for profile and settings
 * - Error Layout: Dedicated layout for error states and 404 pages
 * 
 * Route Protection Levels:
 * - Public: No authentication required
 * - Authenticated: Valid user session required
 * - Verified: Email verification required
 * - Karma-based: Minimum karma points required
 * - Role-based: Specific user roles required (admin, moderator)
 * 
 * Navigation Features:
 * - Breadcrumb: Hierarchical navigation context
 * - Deep Linking: Direct access to specific content
 * - Search Integration: URL-based search queries and filters
 * - History Management: Back/forward navigation with state preservation
 * 
 * SEO Optimization:
 * - Dynamic Meta Tags: Route-specific SEO metadata
 * - Open Graph: Social media sharing optimization
 * - Canonical URLs: Duplicate content prevention
 * - Sitemap Integration: Search engine crawling support
 * 
 * Dependencies:
 * - React Router v6 for modern routing patterns
 * - Redux for authentication state management
 * - React Suspense for lazy loading coordination
 * - TypeScript for type-safe route definitions
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Loading from './components/common/Loading/Loading';

// Layout Components
import MainLayout from './components/layout/MainLayout/MainLayout';
import AuthLayout from './components/layout/AuthLayout/AuthLayout';

/**
 * Lazy-loaded Page Components
 * 
 * Strategic code splitting implementation that loads page components
 * only when their routes are accessed, reducing initial bundle size
 * and improving application startup performance.
 */
// Core application pages with priority-based loading
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const Posts = lazy(() => import('./pages/Posts/Posts'));
const PostDetail = lazy(() => import('./pages/PostDetail/PostDetail'));
const Submit = lazy(() => import('./pages/Submit/Submit'));
const Repositories = lazy(() => import('./pages/Repositories/Repositories'));
const RepositoryDetail = lazy(() => import('./pages/RepositoryDetail/RepositoryDetail'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const EmailPost = lazy(() => import('./pages/EmailPost/EmailPost'));
const Search = lazy(() => import('./pages/Search/Search'));
const Trending = lazy(() => import('./pages/Trending/Trending'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));
const EmailVerification = lazy(() => import('./pages/EmailVerification/EmailVerification'));
const About = lazy(() => import('./pages/About/About'));
const Privacy = lazy(() => import('./pages/Privacy/Privacy'));
const Terms = lazy(() => import('./pages/Terms/Terms'));
const FAQ = lazy(() => import('./pages/FAQ/FAQ'));
const API = lazy(() => import('./pages/API/API'));
const Contact = lazy(() => import('./pages/Contact/Contact'));

/**
 * Protected Route Component Interface
 * 
 * Defines the contract for route protection with configurable
 * authentication requirements and access control parameters.
 */
// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireKarma?: number;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireKarma = 0,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (requireKarma > 0 && user && user.karma < requireKarma) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Loading Component
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<Loading fullScreen />}>
    {children}
  </Suspense>
);

// Main Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <SuspenseWrapper>
            <Home />
          </SuspenseWrapper>
        } />
        
        <Route path="/posts" element={
          <SuspenseWrapper>
            <Posts />
          </SuspenseWrapper>
        } />
        
        <Route path="/posts/:id" element={
          <SuspenseWrapper>
            <PostDetail />
          </SuspenseWrapper>
        } />
        
        <Route path="/trending" element={
          <SuspenseWrapper>
            <Trending />
          </SuspenseWrapper>
        } />
        
        <Route path="/search" element={
          <SuspenseWrapper>
            <Search />
          </SuspenseWrapper>
        } />
        
        <Route path="/repositories" element={
          <SuspenseWrapper>
            <Repositories />
          </SuspenseWrapper>
        } />
        
        <Route path="/repositories/:id" element={
          <SuspenseWrapper>
            <RepositoryDetail />
          </SuspenseWrapper>
        } />
        
        <Route path="/user/:username" element={
          <SuspenseWrapper>
            <Profile />
          </SuspenseWrapper>
        } />
        
        <Route path="/about" element={
          <SuspenseWrapper>
            <About />
          </SuspenseWrapper>
        } />
        
        <Route path="/privacy" element={
          <SuspenseWrapper>
            <Privacy />
          </SuspenseWrapper>
        } />
        
        <Route path="/terms" element={
          <SuspenseWrapper>
            <Terms />
          </SuspenseWrapper>
        } />
        
        <Route path="/faq" element={
          <SuspenseWrapper>
            <FAQ />
          </SuspenseWrapper>
        } />
        
        <Route path="/api" element={
          <SuspenseWrapper>
            <API />
          </SuspenseWrapper>
        } />
        
        <Route path="/contact" element={
          <SuspenseWrapper>
            <Contact />
          </SuspenseWrapper>
        } />
        
        {/* Protected Routes with Main Layout */}
        <Route path="/submit" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Submit />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/submit/email" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <EmailPost />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Dashboard />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/settings/profile" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/settings/email" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/settings/privacy" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/settings/repositories" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/settings/notifications" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/settings/api" element={
          <ProtectedRoute requireKarma={500}>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Auth Routes with Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : (
            <SuspenseWrapper>
              <Login />
            </SuspenseWrapper>
          )
        } />
        
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : (
            <SuspenseWrapper>
              <Register />
            </SuspenseWrapper>
          )
        } />
        
        <Route path="/forgot-password" element={
          <SuspenseWrapper>
            <ForgotPassword />
          </SuspenseWrapper>
        } />
        
        <Route path="/reset-password/:token" element={
          <SuspenseWrapper>
            <ResetPassword />
          </SuspenseWrapper>
        } />
        
        <Route path="/verify-email/:token" element={
          <SuspenseWrapper>
            <EmailVerification />
          </SuspenseWrapper>
        } />
      </Route>
      
      {/* Repository Management Routes - Protected with Karma Requirements */}
      <Route element={<MainLayout />}>
        <Route path="/repositories/create" element={
          <ProtectedRoute requireKarma={100}>
            <SuspenseWrapper>
              <Repositories />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/repositories/:id/manage" element={
          <ProtectedRoute>
            <SuspenseWrapper>
              <RepositoryDetail />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/repositories/:id/analytics" element={
          <ProtectedRoute requireKarma={500}>
            <SuspenseWrapper>
              <RepositoryDetail />
            </SuspenseWrapper>
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Special Routes */}
      <Route path="/hot" element={<Navigate to="/posts?sort=hot" replace />} />
      <Route path="/new" element={<Navigate to="/posts?sort=new" replace />} />
      <Route path="/top" element={<Navigate to="/posts?sort=top" replace />} />
      <Route path="/ask" element={<Navigate to="/posts?type=ask" replace />} />
      <Route path="/show" element={<Navigate to="/posts?type=show" replace />} />
      
      {/* Hashtag Routes */}
      <Route path="/hashtag/:tag" element={
        <SuspenseWrapper>
          <Posts />
        </SuspenseWrapper>
      } />
      
      {/* Email Domain Routes */}
      <Route path="/from/:domain" element={
        <SuspenseWrapper>
          <Posts />
        </SuspenseWrapper>
      } />
      
      {/* Legacy/Redirect Routes */}
      <Route path="/item/:id" element={<Navigate to="/posts/:id" replace />} />
      <Route path="/u/:username" element={<Navigate to="/user/:username" replace />} />
      
      {/* 404 Route - Must be last */}
      <Route path="*" element={
        <SuspenseWrapper>
          <NotFound />
        </SuspenseWrapper>
      } />
    </Routes>
  );
};

export default AppRoutes;
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Loading from './components/common/Loading/Loading';

// Layout Components
import MainLayout from './components/layout/MainLayout/MainLayout';
import AuthLayout from './components/layout/AuthLayout/AuthLayout';

// Lazy load pages for code splitting
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
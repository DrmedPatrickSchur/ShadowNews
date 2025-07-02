import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

import { store } from './store/store';
import { useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import { useTheme } from './hooks/useTheme';
import { checkAuthStatus } from './store/slices/auth.slice';

import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import LoadingSpinner from './components/common/Loading/Loading';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator/OfflineIndicator';
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop';

// Lazy load pages for better performance
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
const EmailPost = lazy(() => import('./pages/EmailPost/EmailPost'));
const Search = lazy(() => import('./pages/Search/Search'));
const Trending = lazy(() => import('./pages/Trending/Trending'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirects to home if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connectWebSocket, disconnectWebSocket } = useWebSocket();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, connectWebSocket, disconnectWebSocket]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <OfflineIndicator />
      <ScrollToTop />
    </div>
  );
};

// App Component
const App: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Check authentication status on app load
    store.dispatch(checkAuthStatus());

    // Apply theme
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    // Handle install prompt for PWA
    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show install button in UI if needed
    });
  }, [theme]);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Router>
            <AppLayout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/search" element={<Search />} />
                <Route path="/user/:username" element={<Profile />} />
                
                {/* Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/submit"
                  element={
                    <ProtectedRoute>
                      <Submit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repositories"
                  element={
                    <ProtectedRoute>
                      <Repositories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:id"
                  element={
                    <ProtectedRoute>
                      <RepositoryDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/email-post"
                  element={
                    <ProtectedRoute>
                      <EmailPost />
                    </ProtectedRoute>
                  }
                />

                {/* Hashtag Routes */}
                <Route path="/tag/:tag" element={<Posts />} />

                {/* Repository Routes */}
                <Route path="/r/:repository" element={<Posts />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </Router>
        </HelmetProvider>
        
        {/* Global Components */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#F3F4F6' : '#111827',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        
        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
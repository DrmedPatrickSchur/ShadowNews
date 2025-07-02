import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import App from './App';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';

import './styles/globals.css';
import './styles/variables.css';
import './styles/tailwind.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// Initialize analytics if in production
if (!isDevelopment && process.env.REACT_APP_ANALYTICS_ID) {
  import('./utils/analytics').then(({ initAnalytics }) => {
    initAnalytics(process.env.REACT_APP_ANALYTICS_ID!);
  });
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <WebSocketProvider>
                  <App />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      },
                      success: {
                        iconTheme: {
                          primary: 'var(--color-success)',
                          secondary: 'var(--bg-primary)',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: 'var(--color-error)',
                          secondary: 'var(--bg-primary)',
                        },
                      },
                    }}
                  />
                </WebSocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
          {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('Shadownews is ready for offline use!');
  },
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', (event) => {
        if ((event.target as ServiceWorker).state === 'activated') {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});

// Report web vitals (CLS, FID, FCP, LCP, TTFB)
reportWebVitals((metric) => {
  if (!isDevelopment && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  if (isDevelopment) {
    console.log(metric);
  }
});

// Handle uncaught errors
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (!isDevelopment && window.gtag) {
    window.gtag('event', 'exception', {
      description: event.reason?.toString() || 'Unknown error',
      fatal: false,
    });
  }
});

// Detect if app is launched as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  document.documentElement.classList.add('pwa-mode');
  
  // Track PWA usage
  if (!isDevelopment && window.gtag) {
    window.gtag('event', 'pwa_launch', {
      event_category: 'PWA',
      non_interaction: true,
    });
  }
}

// Handle online/offline status
window.addEventListener('online', () => {
  document.documentElement.classList.remove('offline');
  import('react-hot-toast').then(({ toast }) => {
    toast.success('Back online!');
  });
});

window.addEventListener('offline', () => {
  document.documentElement.classList.add('offline');
  import('react-hot-toast').then(({ toast }) => {
    toast.error('You are offline. Some features may be limited.');
  });
});

// Type declarations for window
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
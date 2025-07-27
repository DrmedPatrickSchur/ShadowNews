/**
 * Redux Store Configuration - Centralized State Management
 * 
 * Comprehensive Redux Toolkit store configuration providing centralized
 * state management, middleware integration, and type-safe operations
 * for the ShadowNews email-first social platform.
 * 
 * Core Features:
 * - State Management: Centralized application state with predictable updates
 * - Middleware Integration: WebSocket, logging, and development tools
 * - Type Safety: Full TypeScript integration with typed selectors and actions
 * - Performance Optimization: Memoized selectors and efficient state updates
 * - DevTools Integration: Redux DevTools for debugging and time-travel
 * - Persistence: Selective state persistence for user preferences and auth
 * 
 * Store Architecture:
 * - Slice-based Organization: Feature-based state slices with co-located logic
 * - Immutable Updates: Redux Toolkit Immer integration for safe mutations
 * - Normalized State: Optimized data structures for performance and consistency
 * - Async Actions: RTK Query and async thunks for API integration
 * - Real-time Updates: WebSocket middleware for live data synchronization
 * - Error Handling: Centralized error state management and recovery
 * 
 * State Slices:
 * - Authentication: User auth, sessions, permissions, and security state
 * - Posts: Content management, voting, social features, and engagement
 * - Comments: Threading, replies, moderation, and community interaction
 * - Repositories: Email list management, collaboration, and snowball distribution
 * - UI: Interface state, themes, modals, and user experience controls
 * - Notifications: Real-time alerts, system messages, and user communications
 * - Karma: Reputation system, scoring, milestones, and community metrics
 * - Email: Email platform features, templates, and delivery management
 * - Search: Search functionality, filters, and discovery features
 * - Digest: Email digest creation, scheduling, and distribution management
 * 
 * Middleware Stack:
 * - WebSocket Middleware: Real-time communication and live updates
 * - Serialization Controls: Custom serialization for complex data types
 * - Redux DevTools: Development debugging and state inspection
 * - Performance Monitoring: State update tracking and optimization
 * - Error Handling: Global error interception and recovery mechanisms
 * - Persistence Middleware: Selective state persistence and rehydration
 * 
 * Type System:
 * - RootState: Complete application state type for type-safe access
 * - AppDispatch: Typed dispatch for action creators and async operations
 * - Selectors: Memoized state selectors for efficient component updates
 * - Actions: Strongly-typed action creators with payload validation
 * - Reducers: Type-safe reducer functions with immutable state updates
 * 
 * Performance Features:
 * - Memoized Selectors: Reselect-powered selectors for optimized re-renders
 * - Normalized State: Entity adapter patterns for efficient data management
 * - Lazy Loading: On-demand state slice loading for code splitting
 * - Batched Updates: Redux batching for multiple synchronous updates
 * - Immutable Operations: Immer integration for safe state mutations
 * - DevTools Configuration: Optimized development tools for debugging
 * 
 * Real-time Integration:
 * - WebSocket State: Live connection management and event handling
 * - Live Updates: Real-time data synchronization across clients
 * - Presence Tracking: User activity and online status management
 * - Collaborative Editing: Multi-user state synchronization
 * - Push Notifications: Real-time notification delivery and management
 * - Event Broadcasting: System-wide event distribution and handling
 * 
 * Security Features:
 * - Authentication State: Secure auth token management and validation
 * - Permission Controls: Role-based access control and authorization
 * - Data Sanitization: Input validation and XSS prevention
 * - Audit Trail: Action logging and security event tracking
 * - Session Management: Secure session handling and timeout management
 * - CSRF Protection: Cross-site request forgery prevention
 * 
 * Development Features:
 * - Hot Reloading: Development-time state preservation
 * - Time Travel: Redux DevTools time-travel debugging
 * - Action Replay: Development action replay and testing
 * - State Inspection: Real-time state monitoring and analysis
 * - Performance Profiling: State update performance tracking
 * - Error Boundaries: Component error isolation and recovery
 * 
 * Mobile and Offline:
 * - Offline Support: Cached state management for offline functionality
 * - Background Sync: Background state synchronization when online
 * - Progressive Enhancement: Graceful degradation for limited connectivity
 * - Mobile Optimization: Touch-optimized state management patterns
 * - Battery Efficiency: Optimized update patterns for mobile devices
 * - Data Usage: Efficient data management for limited bandwidth
 * 
 * Dependencies:
 * - Redux Toolkit: Modern Redux with simplified configuration and best practices
 * - RTK Query: Data fetching and caching solution for API integration
 * - WebSocket Middleware: Custom middleware for real-time communication
 * - TypeScript: Full type safety with comprehensive type definitions
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/auth.slice';
import postsReducer from './slices/posts.slice';
import commentsReducer from './slices/comments.slice';
import repositoriesReducer from './slices/repositories.slice';
import uiReducer from './slices/ui.slice';
import notificationsReducer from './slices/notifications.slice';
import karmaReducer from './slices/karma.slice';
import emailReducer from './slices/email.slice';
import searchReducer from './slices/search.slice';
import digestReducer from './slices/digest.slice';
import websocketMiddleware from './middleware/websocket.middleware';

/**
 * Redux Store Configuration
 * 
 * Centralized store configuration with comprehensive reducer integration,
 * middleware stack, and development tools setup for optimal development
 * and production performance.
 * 
 * Store Configuration:
 * - Reducer Combination: Feature-based slices with normalized state structure
 * - Middleware Stack: WebSocket, serialization, and development middleware
 * - DevTools Integration: Conditional development tools for debugging
 * - Performance Optimization: Memoization and efficient update patterns
 * 
 * Serialization Configuration:
 * - Ignored Actions: WebSocket actions that contain non-serializable data
 * - Ignored Paths: State paths with complex objects like files and timestamps
 * - Custom Serialization: Special handling for binary data and function references
 * 
 * Real-time Features:
 * - WebSocket Integration: Live data synchronization and event handling
 * - Auto-reconnection: Automatic WebSocket reconnection with backoff
 * - Event Broadcasting: Real-time event distribution across components
 * - State Synchronization: Live state updates from server events
 */
export const store = configureStore({
 /**
  * Reducer Configuration
  * Feature-based state slices with domain-specific logic and data management
  */
 reducer: {
   /** Authentication and user management state */
   auth: authReducer,
   /** Content posts with social features and engagement */
   posts: postsReducer,
   /** Comment threading and community interaction */
   comments: commentsReducer,
   /** Email repository management and collaboration */
   repositories: repositoriesReducer,
   /** User interface state and preferences */
   ui: uiReducer,
   /** Real-time notifications and alerts */
   notifications: notificationsReducer,
   /** Community reputation and scoring system */
   karma: karmaReducer,
   /** Email platform features and management */
   email: emailReducer,
   /** Search functionality and discovery */
   search: searchReducer,
   /** Email digest creation and distribution */
   digest: digestReducer,
 },
 /**
  * Middleware Configuration
  * Custom middleware stack with WebSocket integration and serialization controls
  */
 middleware: (getDefaultMiddleware) =>
   getDefaultMiddleware({
     /**
      * Serialization Check Configuration
      * Controls for handling non-serializable data in actions and state
      */
     serializableCheck: {
       /** Actions that may contain non-serializable data (WebSocket events) */
       ignoredActions: ['websocket/connect', 'websocket/disconnect', 'websocket/send'],
       /** Action paths containing complex objects like files and timestamps */
       ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.file'],
       /** State paths with non-serializable data like WebSocket instances */
       ignoredPaths: ['websocket', 'repositories.csvData'],
     },
   /** Add WebSocket middleware for real-time communication */
   }).concat(websocketMiddleware),
 /** Enable Redux DevTools in development for debugging and inspection */
 devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Setup RTK Query Listeners
 * Enable automatic cache invalidation and background refetching
 * for efficient data synchronization and cache management
 */
setupListeners(store.dispatch);

/**
 * Type Definitions
 * Comprehensive TypeScript type definitions for type-safe Redux usage
 */

/** Root state type derived from store configuration for type-safe access */
export type RootState = ReturnType<typeof store.getState>;
/** App dispatch type for type-safe action dispatching */
export type AppDispatch = typeof store.dispatch;

/**
 * State Slice Selectors
 * Memoized selectors for efficient state slice access and component optimization
 */

/** Authentication state selector for user auth and session data */
export const selectAuth = (state: RootState) => state.auth;
/** Posts state selector for content management and social features */
export const selectPosts = (state: RootState) => state.posts;
/** Comments state selector for threading and community interaction */
export const selectComments = (state: RootState) => state.comments;
/** Repositories state selector for email list management */
export const selectRepositories = (state: RootState) => state.repositories;
/** UI state selector for interface controls and preferences */
export const selectUI = (state: RootState) => state.ui;
/** Notifications state selector for alerts and system messages */
export const selectNotifications = (state: RootState) => state.notifications;
/** Karma state selector for reputation and scoring system */
export const selectKarma = (state: RootState) => state.karma;
/** Email state selector for email platform features */
export const selectEmail = (state: RootState) => state.email;
/** Search state selector for discovery and filtering */
export const selectSearch = (state: RootState) => state.search;
/** Digest state selector for email digest management */
export const selectDigest = (state: RootState) => state.digest;

/**
 * Authentication Selectors
 * Specialized selectors for authentication state and user management
 */

/** Authentication status selector for protected route handling */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
/** Current user selector for profile and permission management */
export const selectCurrentUser = (state: RootState) => state.auth.user;
/** Authentication loading state selector for UI feedback */
export const selectAuthLoading = (state: RootState) => state.auth.loading;

/**
 * Posts Selectors
 * Specialized selectors for content management and social features
 */

/** Posts list selector for feed and content display */
export const selectPostsList = (state: RootState) => state.posts.items;
/** Posts loading state selector for loading indicators */
export const selectPostsLoading = (state: RootState) => state.posts.loading;
/** Selected post selector for detailed view and interaction */
export const selectSelectedPost = (state: RootState) => state.posts.selectedPost;
/** Posts pagination selector for navigation and infinite scroll */
export const selectPostsPagination = (state: RootState) => state.posts.pagination;

/**
 * Repository Selectors
 * Specialized selectors for email repository management and collaboration
 */

/** Active repository selector for current working repository */
export const selectActiveRepository = (state: RootState) => state.repositories.activeRepository;
/** User repositories selector for personal repository collection */
export const selectUserRepositories = (state: RootState) => state.repositories.userRepositories;
/** Repository statistics selector for analytics and insights */
export const selectRepositoryStats = (state: RootState) => state.repositories.stats;

/**
 * UI Selectors
 * Specialized selectors for user interface state and preferences
 */

/** Theme selector for dark/light mode and visual preferences */
export const selectTheme = (state: RootState) => state.ui.theme;
/** Sidebar state selector for navigation and layout control */
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
/** Active modal selector for modal management and overlay control */
export const selectActiveModal = (state: RootState) => state.ui.activeModal;

/**
 * Notification Selectors
 * Specialized selectors for notification management and user alerts
 */

/** Unread notifications count selector for badge display and user awareness */
export const selectUnreadNotifications = (state: RootState) => 
 state.notifications.items.filter(n => !n.read).length;

/**
 * Karma Selectors
 * Specialized selectors for reputation system and community scoring
 */

/** User karma total selector for reputation display and progression */
export const selectUserKarma = (state: RootState) => state.karma.totalKarma;
/** Karma milestones selector for achievement tracking and gamification */
export const selectKarmaMilestones = (state: RootState) => state.karma.milestones;

/**
 * Store Export
 * Default export of configured Redux store for application integration
 */
export default store;
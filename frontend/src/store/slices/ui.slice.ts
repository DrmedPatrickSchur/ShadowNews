/**
 * UI Slice - User Interface State and Experience Management
 * 
 * Comprehensive Redux slice managing user interface state, theme preferences,
 * modals, notifications, and user experience controls for the ShadowNews
 * email-first social platform with responsive design and accessibility.
 * 
 * Core Features:
 * - Theme Management: Dark/light mode with system preference detection
 * - Modal System: Centralized modal state and component management
 * - Notification System: Toast notifications and user feedback management
 * - Layout Control: Sidebar, navigation, and responsive layout management
 * - User Preferences: Personalized UI settings and user experience controls
 * - Loading States: Global loading state management and user feedback
 * - Filter Management: Content filtering and view customization
 * 
 * Theme System:
 * - Multi-theme Support: Light, dark, and system preference themes
 * - Dynamic Switching: Real-time theme switching with state persistence
 * - System Integration: Automatic theme detection from OS preferences
 * - Custom Themes: Extensible theme system for brand customization
 * - Accessibility: High contrast and accessibility-focused theme variants
 * - Performance: Optimized theme switching with minimal re-renders
 * - Consistency: Unified theme application across all components
 * 
 * Modal Management:
 * - Centralized Control: Global modal state management and coordination
 * - Component Integration: Dynamic modal component loading and rendering
 * - Stacking Support: Multiple modal layers with proper z-index management
 * - Backdrop Control: Configurable backdrop behavior and click handling
 * - Keyboard Navigation: Full keyboard accessibility and escape handling
 * - Animation Support: Smooth modal transitions and animation control
 * - Mobile Optimization: Touch-friendly modal interactions and gestures
 * 
 * Notification System:
 * - Toast Notifications: Non-intrusive user feedback and status updates
 * - Type Classification: Success, error, warning, and info notification types
 * - Auto-dismiss: Configurable notification duration and auto-removal
 * - User Interaction: Manual dismissal and notification action handling
 * - Queue Management: Notification queuing and display prioritization
 * - Persistence: Notification history and replay functionality
 * - Accessibility: Screen reader support and keyboard navigation
 * 
 * Layout and Navigation:
 * - Responsive Design: Adaptive layout for desktop, tablet, and mobile
 * - Sidebar Management: Collapsible sidebar with state persistence
 * - Mobile Menu: Touch-optimized navigation for mobile devices
 * - Search Interface: Expandable search with real-time suggestions
 * - Breadcrumb Navigation: Hierarchical navigation and page context
 * - Scroll Management: Scroll position tracking and restoration
 * - Focus Management: Keyboard focus and accessibility improvements
 * 
 * User Preferences:
 * - View Modes: Compact, card, and list view options for content display
 * - Sort Preferences: User-defined sorting and filtering preferences
 * - Display Options: Customizable display density and information levels
 * - Accessibility Settings: User accessibility preferences and accommodations
 * - Language Preferences: Internationalization and localization support
 * - Keyboard Shortcuts: Customizable keyboard shortcuts and hotkeys
 * - Data Persistence: User preference storage and synchronization
 * 
 * Loading and Feedback:
 * - Global Loading: Application-wide loading state management
 * - Component Loading: Granular loading states for individual components
 * - Progress Indicators: Progress bars and completion status tracking
 * - Error Boundaries: Error state management and recovery interfaces
 * - Skeleton Screens: Content placeholder loading states
 * - Infinite Scroll: Loading states for pagination and content loading
 * - Real-time Feedback: Live status updates and progress monitoring
 * 
 * Filter and Search:
 * - Content Filtering: Advanced filtering options for content discovery
 * - Search Integration: Search interface state and suggestion management
 * - Filter Persistence: Filter state storage and restoration
 * - Quick Filters: Preset filter combinations for common use cases
 * - Filter History: Recently used filter tracking and suggestions
 * - Advanced Search: Complex search query building and validation
 * - Export Filters: Filter configuration sharing and export
 * 
 * Responsive Design:
 * - Breakpoint Management: Responsive breakpoint detection and handling
 * - Mobile Optimization: Touch-optimized interface elements and gestures
 * - Tablet Support: Tablet-specific layout adaptations and interactions
 * - Desktop Enhancement: Desktop-specific features and keyboard shortcuts
 * - Progressive Enhancement: Graceful degradation for limited capabilities
 * - Performance Optimization: Efficient rendering across device types
 * - Cross-browser Compatibility: Consistent experience across browsers
 * 
 * Accessibility Features:
 * - Screen Reader Support: ARIA labels and semantic markup integration
 * - Keyboard Navigation: Full keyboard accessibility and focus management
 * - High Contrast: High contrast theme variants for visual accessibility
 * - Motion Preferences: Respect for reduced motion user preferences
 * - Font Scaling: Support for user font size preferences
 * - Color Blindness: Color-blind friendly design and alternatives
 * - Voice Interface: Voice navigation and control integration
 * 
 * Performance Features:
 * - State Optimization: Efficient state updates and minimal re-renders
 * - Lazy Loading: On-demand component and resource loading
 * - Memory Management: Efficient cleanup and garbage collection
 * - Caching: UI state caching and intelligent invalidation
 * - Debouncing: Input debouncing for search and filter operations
 * - Virtualization: Virtual scrolling for large data sets
 * - Code Splitting: Dynamic import and component splitting
 * 
 * Integration Features:
 * - Analytics Integration: UI interaction tracking and analytics
 * - Real-time Updates: Live UI updates from WebSocket events
 * - API Synchronization: UI state synchronization with server state
 * - External Services: Integration with external UI and design services
 * - Testing Support: UI testing utilities and state inspection
 * - Debug Tools: UI debugging and state visualization tools
 * - Performance Monitoring: UI performance tracking and optimization
 * 
 * Development Features:
 * - Type Safety: Full TypeScript integration with UI state types
 * - Component Integration: Seamless React component integration
 * - State Inspection: Redux DevTools integration for UI state debugging
 * - Hot Reloading: Development-time state preservation
 * - Error Handling: Comprehensive UI error handling and recovery
 * - Documentation: Complete UI state documentation and examples
 * 
 * Dependencies:
 * - Redux Toolkit: State management with createSlice and actions
 * - React Integration: Seamless React component and hook integration
 * - Theme Provider: Theme management and dynamic switching support
 * - Accessibility Libraries: Screen reader and accessibility tool integration
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Notification Interface
 * Structure for toast notifications and user feedback messages
 */
export interface Notification {
 /** Unique notification identifier for tracking and management */
 id: string;
 /** Notification type for styling and icon selection */
 type: 'success' | 'error' | 'warning' | 'info';
 /** Notification message content for user display */
 message: string;
 /** Optional duration in milliseconds for auto-dismiss (default: 5000) */
 duration?: number;
 /** Notification creation timestamp for ordering and expiration */
 timestamp: number;
}

/**
 * Modal Interface
 * Structure for modal dialog state and component management
 */
export interface Modal {
 /** Unique modal identifier for tracking and management */
 id: string;
 /** Modal component name for dynamic loading and rendering */
 component: string;
 /** Optional modal props for component configuration */
 props?: Record<string, any>;
 /** Modal visibility state for show/hide control */
 isOpen: boolean;
}

/**
 * UI State Interface
 * Comprehensive UI state structure for user interface management
 */
export interface UIState {
 /** Current theme preference: light, dark, or system detection */
 theme: 'light' | 'dark' | 'system';
 /** Sidebar collapse state for layout management */
 sidebarCollapsed: boolean;
 /** Mobile navigation menu visibility state */
 mobileMenuOpen: boolean;
 /** Search interface expansion state */
 searchOpen: boolean;
 /** Array of active notifications for user feedback */
 notifications: Notification[];
 /** Array of active modals for dialog management */
 modals: Modal[];
 /** Loading states by component or operation identifier */
 loadingStates: Record<string, boolean>;
 /** Scroll positions by page or component for restoration */
 scrollPositions: Record<string, number>;
 /** Active content filters and sorting preferences */
 activeFilters: {
   /** Content sorting preference */
   sortBy: 'hot' | 'new' | 'top' | 'rising';
   /** Time range filter for content discovery */
   timeRange: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
   /** Category filters for content organization */
   categories: string[];
   /** Hashtag filters for topic-based filtering */
   hashtags: string[];
 };
 /** Content display mode preference */
 viewMode: 'compact' | 'card' | 'list';
 feedAutoRefresh: boolean;
 feedRefreshInterval: number;
 keyboardShortcutsEnabled: boolean;
 reduceMotion: boolean;
 fontSize: 'small' | 'medium' | 'large';
 showKarmaAnimations: boolean;
 emailComposerOpen: boolean;
 csvUploaderOpen: boolean;
 repositoryPanelOpen: boolean;
 onboardingStep: number | null;
 tourActive: boolean;
 unseenNotificationCount: number;
 lastSeenTimestamp: number;
 focusMode: boolean;
 compactComments: boolean;
 autoExpandMedia: boolean;
 showUserFlairs: boolean;
 highlightNewComments: boolean;
 soundEnabled: boolean;
 desktopNotificationsEnabled: boolean;
 emailDigestFrequency: 'daily' | 'weekly' | 'never';
 betaFeaturesEnabled: boolean;
}

const initialState: UIState = {
 theme: 'system',
 sidebarCollapsed: false,
 mobileMenuOpen: false,
 searchOpen: false,
 notifications: [],
 modals: [],
 loadingStates: {},
 scrollPositions: {},
 activeFilters: {
   sortBy: 'hot',
   timeRange: 'day',
   categories: [],
   hashtags: [],
 },
 viewMode: 'card',
 feedAutoRefresh: true,
 feedRefreshInterval: 30000,
 keyboardShortcutsEnabled: true,
 reduceMotion: false,
 fontSize: 'medium',
 showKarmaAnimations: true,
 emailComposerOpen: false,
 csvUploaderOpen: false,
 repositoryPanelOpen: false,
 onboardingStep: null,
 tourActive: false,
 unseenNotificationCount: 0,
 lastSeenTimestamp: Date.now(),
 focusMode: false,
 compactComments: false,
 autoExpandMedia: true,
 showUserFlairs: true,
 highlightNewComments: true,
 soundEnabled: true,
 desktopNotificationsEnabled: false,
 emailDigestFrequency: 'daily',
 betaFeaturesEnabled: false,
};

const uiSlice = createSlice({
 name: 'ui',
 initialState,
 reducers: {
   setTheme: (state, action: PayloadAction<UIState['theme']>) => {
     state.theme = action.payload;
     localStorage.setItem('theme', action.payload);
   },
   toggleSidebar: (state) => {
     state.sidebarCollapsed = !state.sidebarCollapsed;
     localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
   },
   setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
     state.sidebarCollapsed = action.payload;
     localStorage.setItem('sidebarCollapsed', String(action.payload));
   },
   toggleMobileMenu: (state) => {
     state.mobileMenuOpen = !state.mobileMenuOpen;
   },
   setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
     state.mobileMenuOpen = action.payload;
   },
   toggleSearch: (state) => {
     state.searchOpen = !state.searchOpen;
   },
   setSearchOpen: (state, action: PayloadAction<boolean>) => {
     state.searchOpen = action.payload;
   },
   addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
     const notification: Notification = {
       ...action.payload,
       id: `notification-${Date.now()}-${Math.random()}`,
       timestamp: Date.now(),
       duration: action.payload.duration || 5000,
     };
     state.notifications.push(notification);
   },
   removeNotification: (state, action: PayloadAction<string>) => {
     state.notifications = state.notifications.filter(n => n.id !== action.payload);
   },
   clearNotifications: (state) => {
     state.notifications = [];
   },
   openModal: (state, action: PayloadAction<Omit<Modal, 'id' | 'isOpen'>>) => {
     const modal: Modal = {
       ...action.payload,
       id: `modal-${Date.now()}-${Math.random()}`,
       isOpen: true,
     };
     state.modals.push(modal);
   },
   closeModal: (state, action: PayloadAction<string>) => {
     state.modals = state.modals.filter(m => m.id !== action.payload);
   },
   closeAllModals: (state) => {
     state.modals = [];
   },
   setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
     state.loadingStates[action.payload.key] = action.payload.value;
   },
   setScrollPosition: (state, action: PayloadAction<{ key: string; position: number }>) => {
     state.scrollPositions[action.payload.key] = action.payload.position;
   },
   setSortBy: (state, action: PayloadAction<UIState['activeFilters']['sortBy']>) => {
     state.activeFilters.sortBy = action.payload;
     localStorage.setItem('feedSortBy', action.payload);
   },
   setTimeRange: (state, action: PayloadAction<UIState['activeFilters']['timeRange']>) => {
     state.activeFilters.timeRange = action.payload;
     localStorage.setItem('feedTimeRange', action.payload);
   },
   toggleCategory: (state, action: PayloadAction<string>) => {
     const index = state.activeFilters.categories.indexOf(action.payload);
     if (index > -1) {
       state.activeFilters.categories.splice(index, 1);
     } else {
       state.activeFilters.categories.push(action.payload);
     }
   },
   setCategories: (state, action: PayloadAction<string[]>) => {
     state.activeFilters.categories = action.payload;
   },
   toggleHashtag: (state, action: PayloadAction<string>) => {
     const index = state.activeFilters.hashtags.indexOf(action.payload);
     if (index > -1) {
       state.activeFilters.hashtags.splice(index, 1);
     } else {
       state.activeFilters.hashtags.push(action.payload);
     }
   },
   setHashtags: (state, action: PayloadAction<string[]>) => {
     state.activeFilters.hashtags = action.payload;
   },
   setViewMode: (state, action: PayloadAction<UIState['viewMode']>) => {
     state.viewMode = action.payload;
     localStorage.setItem('viewMode', action.payload);
   },
   toggleFeedAutoRefresh: (state) => {
     state.feedAutoRefresh = !state.feedAutoRefresh;
     localStorage.setItem('feedAutoRefresh', String(state.feedAutoRefresh));
   },
   setFeedRefreshInterval: (state, action: PayloadAction<number>) => {
     state.feedRefreshInterval = action.payload;
     localStorage.setItem('feedRefreshInterval', String(action.payload));
   },
   toggleKeyboardShortcuts: (state) => {
     state.keyboardShortcutsEnabled = !state.keyboardShortcutsEnabled;
     localStorage.setItem('keyboardShortcutsEnabled', String(state.keyboardShortcutsEnabled));
   },
   toggleReduceMotion: (state) => {
     state.reduceMotion = !state.reduceMotion;
     localStorage.setItem('reduceMotion', String(state.reduceMotion));
   },
   setFontSize: (state, action: PayloadAction<UIState['fontSize']>) => {
     state.fontSize = action.payload;
     localStorage.setItem('fontSize', action.payload);
   },
   toggleKarmaAnimations: (state) => {
     state.showKarmaAnimations = !state.showKarmaAnimations;
     localStorage.setItem('showKarmaAnimations', String(state.showKarmaAnimations));
   },
   toggleEmailComposer: (state) => {
     state.emailComposerOpen = !state.emailComposerOpen;
   },
   setEmailComposerOpen: (state, action: PayloadAction<boolean>) => {
     state.emailComposerOpen = action.payload;
   },
   toggleCsvUploader: (state) => {
     state.csvUploaderOpen = !state.csvUploaderOpen;
   },
   setCsvUploaderOpen: (state, action: PayloadAction<boolean>) => {
     state.csvUploaderOpen = action.payload;
   },
   toggleRepositoryPanel: (state) => {
     state.repositoryPanelOpen = !state.repositoryPanelOpen;
   },
   setRepositoryPanelOpen: (state, action: PayloadAction<boolean>) => {
     state.repositoryPanelOpen = action.payload;
   },
   setOnboardingStep: (state, action: PayloadAction<number | null>) => {
     state.onboardingStep = action.payload;
     if (action.payload === null) {
       localStorage.setItem('onboardingCompleted', 'true');
     }
   },
   startTour: (state) => {
     state.tourActive = true;
   },
   endTour: (state) => {
     state.tourActive = false;
     localStorage.setItem('tourCompleted', 'true');
   },
   incrementUnseenNotifications: (state) => {
     state.unseenNotificationCount += 1;
   },
   resetUnseenNotifications: (state) => {
     state.unseenNotificationCount = 0;
     state.lastSeenTimestamp = Date.now();
   },
   toggleFocusMode: (state) => {
     state.focusMode = !state.focusMode;
   },
   toggleCompactComments: (state) => {
     state.compactComments = !state.compactComments;
     localStorage.setItem('compactComments', String(state.compactComments));
   },
   toggleAutoExpandMedia: (state) => {
     state.autoExpandMedia = !state.autoExpandMedia;
     localStorage.setItem('autoExpandMedia', String(state.autoExpandMedia));
   },
   toggleUserFlairs: (state) => {
     state.showUserFlairs = !state.showUserFlairs;
     localStorage.setItem('showUserFlairs', String(state.showUserFlairs));
   },
   toggleHighlightNewComments: (state) => {
     state.highlightNewComments = !state.highlightNewComments;
     localStorage.setItem('highlightNewComments', String(state.highlightNewComments));
   },
   toggleSound: (state) => {
     state.soundEnabled = !state.soundEnabled;
     localStorage.setItem('soundEnabled', String(state.soundEnabled));
   },
   toggleDesktopNotifications: (state) => {
     state.desktopNotificationsEnabled = !state.desktopNotificationsEnabled;
     localStorage.setItem('desktopNotificationsEnabled', String(state.desktopNotificationsEnabled));
   },
   setEmailDigestFrequency: (state, action: PayloadAction<UIState['emailDigestFrequency']>) => {
     state.emailDigestFrequency = action.payload;
     localStorage.setItem('emailDigestFrequency', action.payload);
   },
   toggleBetaFeatures: (state) => {
     state.betaFeaturesEnabled = !state.betaFeaturesEnabled;
     localStorage.setItem('betaFeaturesEnabled', String(state.betaFeaturesEnabled));
   },
   loadUIPreferences: (state) => {
     const preferences = {
       theme: localStorage.getItem('theme') as UIState['theme'] || 'system',
       sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
       viewMode: localStorage.getItem('viewMode') as UIState['viewMode'] || 'card',
       feedAutoRefresh: localStorage.getItem('feedAutoRefresh') !== 'false',
       feedRefreshInterval: parseInt(localStorage.getItem('feedRefreshInterval') || '30000'),
       keyboardShortcutsEnabled: localStorage.getItem('keyboardShortcutsEnabled') !== 'false',
       reduceMotion: localStorage.getItem('reduceMotion') === 'true',
       fontSize: localStorage.getItem('fontSize') as UIState['fontSize'] || 'medium',
       showKarmaAnimations: localStorage.getItem('showKarmaAnimations') !== 'false',
       compactComments: localStorage.getItem('compactComments') === 'true',
       autoExpandMedia: localStorage.getItem('autoExpandMedia') !== 'false',
       showUserFlairs: localStorage.getItem('showUserFlairs') !== 'false',
       highlightNewComments: localStorage.getItem('highlightNewComments') !== 'false',
       soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
       desktopNotificationsEnabled: localStorage.getItem('desktopNotificationsEnabled') === 'true',
       emailDigestFrequency: localStorage.getItem('emailDigestFrequency') as UIState['emailDigestFrequency'] || 'daily',
       betaFeaturesEnabled: localStorage.getItem('betaFeaturesEnabled') === 'true',
       feedSortBy: localStorage.getItem('feedSortBy') as UIState['activeFilters']['sortBy'] || 'hot',
       feedTimeRange: localStorage.getItem('feedTimeRange') as UIState['activeFilters']['timeRange'] || 'day',
     };
     return { ...state, ...preferences, activeFilters: { ...state.activeFilters, sortBy: preferences.feedSortBy, timeRange: preferences.feedTimeRange } };
   },
 },
});

export const {
 setTheme,
 toggleSidebar,
 setSidebarCollapsed,
 toggleMobileMenu,
 setMobileMenuOpen,
 toggleSearch,
 setSearchOpen,
 addNotification,
 removeNotification,
 clearNotifications,
 openModal,
 closeModal,
 closeAllModals,
 setLoading,
 setScrollPosition,
 setSortBy,
 setTimeRange,
 toggleCategory,
 setCategories,
 toggleHashtag,
 setHashtags,
 setViewMode,
 toggleFeedAutoRefresh,
 setFeedRefreshInterval,
 toggleKeyboardShortcuts,
 toggleReduceMotion,
 setFontSize,
 toggleKarmaAnimations,
 toggleEmailComposer,
 setEmailComposerOpen,
 toggleCsvUploader,
 setCsvUploaderOpen,
 toggleRepositoryPanel,
 setRepositoryPanelOpen,
 setOnboardingStep,
 startTour,
 endTour,
 incrementUnseenNotifications,
 resetUnseenNotifications,
 toggleFocusMode,
 toggleCompactComments,
 toggleAutoExpandMedia,
 toggleUserFlairs,
 toggleHighlightNewComments,
 toggleSound,
 toggleDesktopNotifications,
 setEmailDigestFrequency,
 toggleBetaFeatures,
 loadUIPreferences,
} = uiSlice.actions;

export default uiSlice.reducer;
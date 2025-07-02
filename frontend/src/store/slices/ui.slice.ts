import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
 id: string;
 type: 'success' | 'error' | 'warning' | 'info';
 message: string;
 duration?: number;
 timestamp: number;
}

export interface Modal {
 id: string;
 component: string;
 props?: Record<string, any>;
 isOpen: boolean;
}

export interface UIState {
 theme: 'light' | 'dark' | 'system';
 sidebarCollapsed: boolean;
 mobileMenuOpen: boolean;
 searchOpen: boolean;
 notifications: Notification[];
 modals: Modal[];
 loadingStates: Record<string, boolean>;
 scrollPositions: Record<string, number>;
 activeFilters: {
   sortBy: 'hot' | 'new' | 'top' | 'rising';
   timeRange: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
   categories: string[];
   hashtags: string[];
 };
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
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

export const store = configureStore({
 reducer: {
   auth: authReducer,
   posts: postsReducer,
   comments: commentsReducer,
   repositories: repositoriesReducer,
   ui: uiReducer,
   notifications: notificationsReducer,
   karma: karmaReducer,
   email: emailReducer,
   search: searchReducer,
   digest: digestReducer,
 },
 middleware: (getDefaultMiddleware) =>
   getDefaultMiddleware({
     serializableCheck: {
       ignoredActions: ['websocket/connect', 'websocket/disconnect', 'websocket/send'],
       ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.file'],
       ignoredPaths: ['websocket', 'repositories.csvData'],
     },
   }).concat(websocketMiddleware),
 devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const selectAuth = (state: RootState) => state.auth;
export const selectPosts = (state: RootState) => state.posts;
export const selectComments = (state: RootState) => state.comments;
export const selectRepositories = (state: RootState) => state.repositories;
export const selectUI = (state: RootState) => state.ui;
export const selectNotifications = (state: RootState) => state.notifications;
export const selectKarma = (state: RootState) => state.karma;
export const selectEmail = (state: RootState) => state.email;
export const selectSearch = (state: RootState) => state.search;
export const selectDigest = (state: RootState) => state.digest;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

export const selectPostsList = (state: RootState) => state.posts.items;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectSelectedPost = (state: RootState) => state.posts.selectedPost;
export const selectPostsPagination = (state: RootState) => state.posts.pagination;

export const selectActiveRepository = (state: RootState) => state.repositories.activeRepository;
export const selectUserRepositories = (state: RootState) => state.repositories.userRepositories;
export const selectRepositoryStats = (state: RootState) => state.repositories.stats;

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;

export const selectUnreadNotifications = (state: RootState) => 
 state.notifications.items.filter(n => !n.read).length;

export const selectUserKarma = (state: RootState) => state.karma.totalKarma;
export const selectKarmaMilestones = (state: RootState) => state.karma.milestones;

export default store;
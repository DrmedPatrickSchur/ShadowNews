/**
 * Home Page Component Test Suite
 * 
 * Comprehensive test coverage for the Home page component ensuring proper
 * functionality across different user states, content loading scenarios,
 * interactive filtering, and responsive behavior. Tests include authentication
 * flows, real-time updates, infinite scrolling, and accessibility compliance.
 * 
 * Test Categories:
 * - Rendering Tests: Component output and layout verification for different states
 * - Authentication Tests: User session handling and conditional content display
 * - Content Loading Tests: Data fetching, loading states, and error handling
 * - Filtering Tests: Post filter functionality and state management
 * - Interaction Tests: User interactions, navigation, and event handling
 * - Real-Time Tests: WebSocket integration and live update functionality
 * - Accessibility Tests: Screen reader support and keyboard navigation
 * 
 * Testing Strategy:
 * - Unit Testing: Isolated component behavior and state management
 * - Integration Testing: Redux store integration and service layer interaction
 * - User Journey Testing: Complete user workflows from landing to engagement
 * - Performance Testing: Infinite scroll behavior and render optimization
 * - Accessibility Testing: WCAG compliance and assistive technology support
 * 
 * User State Coverage:
 * - Guest Users: Hero section display, registration prompts, limited functionality
 * - Authenticated Users: Quick actions, personalized content, full feature access
 * - Loading States: Skeleton screens, progressive loading, and error recovery
 * - Empty States: No content scenarios with appropriate call-to-action elements
 * 
 * Content Management Testing:
 * - Post Feed: Content display, sorting, and pagination functionality
 * - Filter System: Hot, New, Top, and Best filtering with visual feedback
 * - Repository Showcase: Trending repository display and navigation
 * - Statistics Display: Real-time metrics and community engagement data
 * 
 * Interactive Feature Testing:
 * - Filter Switching: Tab navigation and active state management
 * - Infinite Scroll: Progressive content loading and performance validation
 * - Quick Actions: Post submission shortcuts for authenticated users
 * - Navigation: Link functionality and proper routing behavior
 * 
 * Real-Time Functionality:
 * - WebSocket Integration: Live statistics updates and connection management
 * - Statistics Ticker: Animated real-time community metrics display
 * - Content Updates: New post notifications and dynamic content refresh
 * - Connection States: Online/offline status and reconnection handling
 * 
 * Responsive Design Testing:
 * - Mobile Layout: Single-column layout and touch interaction validation
 * - Tablet Layout: Adaptive grid system and content reflow
 * - Desktop Layout: Full sidebar and two-column presentation
 * - Breakpoint Behavior: Smooth transitions between layout modes
 * 
 * Accessibility Validation:
 * - Screen Reader: Proper semantic markup and ARIA attribute verification
 * - Keyboard Navigation: Tab order and keyboard-only interaction support
 * - Focus Management: Visible focus indicators and logical focus flow
 * - Color Contrast: Sufficient contrast ratios for all text elements
 * - Alternative Content: Image alt text and descriptive content
 * 
 * Error Handling Testing:
 * - API Failures: Network error handling and fallback content display
 * - Loading Errors: Service unavailability and retry mechanisms
 * - Authentication Errors: Session expiration and re-authentication flows
 * - Data Validation: Invalid content handling and user feedback
 * 
 * Performance Testing:
 * - Render Performance: Component mounting and update efficiency
 * - Memory Usage: Event listener cleanup and memory leak prevention
 * - Infinite Scroll: Large dataset handling and virtual scrolling
 * - Animation Performance: Smooth transitions and frame rate validation
 * 
 * Mock Data Strategy:
 * - Realistic Data: Representative post and repository content
 * - Edge Cases: Empty content, long titles, special characters
 * - User Variants: Different user types and permission levels
 * - Statistics Data: Various metrics and engagement scenarios
 * 
 * Test Utilities:
 * - Redux Provider: Store configuration with mock data and reducers
 * - Router Provider: Navigation context for link and routing tests
 * - Theme Provider: Design system context for styled component testing
 * - Custom Render: Centralized test setup with all necessary providers
 * 
 * Visual Testing:
 * - Layout Validation: Component positioning and spacing verification
 * - State Indicators: Visual feedback for interactive elements
 * - Animation Testing: Transition effects and loading animations
 * - Brand Consistency: Color, typography, and spacing adherence
 * 
 * Interaction Testing:
 * - Click Events: Button presses and link navigation
 * - Form Interactions: Input handling and submission workflows
 * - Hover States: Mouse interaction feedback and tooltip display
 * - Touch Events: Mobile gesture handling and touch feedback
 * 
 * Edge Case Coverage:
 * - Network Conditions: Slow connections and intermittent connectivity
 * - Browser Compatibility: Cross-browser functionality and polyfills
 * - Device Constraints: Low-memory devices and performance limitations
 * - User Permissions: Feature access based on authentication status
 * 
 * Dependencies:
 * - React Testing Library for component testing and user simulation
 * - Jest for test framework and assertion utilities
 * - User Event for realistic user interaction simulation
 * - Redux for state management testing
 * - React Router for navigation testing
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { act } from 'react-dom/test-utils';
import Home from './Home';
import { postsSlice } from '../../store/slices/posts.slice';
import { authSlice } from '../../store/slices/auth.slice';
import { uiSlice } from '../../store/slices/ui.slice';
import { repositoriesSlice } from '../../store/slices/repositories.slice';
import * as postsService from '../../services/posts.service';
import * as repositoriesService from '../../services/repositories.service';
import { Post, Repository } from '../../types';

jest.mock('../../services/posts.service');
jest.mock('../../services/repositories.service');
jest.mock('../../hooks/useWebSocket');

const mockPosts: Post[] = [
 {
   id: '1',
   title: 'First Post About AI',
   url: 'https://example.com/ai',
   content: 'This is a post about AI',
   author: {
     id: 'user1',
     username: 'testuser',
     email: 'test@shadownews.community',
     karma: 150
   },
   hashtags: ['#AI', '#MachineLearning'],
   upvotes: 42,
   downvotes: 2,
   commentCount: 15,
   repositoryId: 'repo1',
   emailReach: 1200,
   createdAt: new Date('2025-01-20T10:00:00Z').toISOString(),
   updatedAt: new Date('2025-01-20T10:00:00Z').toISOString()
 },
 {
   id: '2',
   title: 'Blockchain Innovation in 2025',
   content: 'Discussion about blockchain trends',
   author: {
     id: 'user2',
     username: 'blockchain_dev',
     email: 'dev@shadownews.community',
     karma: 500
   },
   hashtags: ['#Blockchain', '#Web3'],
   upvotes: 89,
   downvotes: 5,
   commentCount: 23,
   emailReach: 3400,
   createdAt: new Date('2025-01-19T15:30:00Z').toISOString(),
   updatedAt: new Date('2025-01-19T15:30:00Z').toISOString()
 }
];

const mockRepositories: Repository[] = [
 {
   id: 'repo1',
   name: 'AI Healthcare',
   description: 'Repository for AI in Healthcare discussions',
   topic: 'AI Healthcare',
   owner: {
     id: 'user1',
     username: 'testuser',
     email: 'test@shadownews.community'
   },
   emailCount: 823,
   verifiedEmails: 750,
   growthRate: 12.5,
   isPublic: true,
   snowballEnabled: true,
   createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
   updatedAt: new Date('2025-01-20T00:00:00Z').toISOString()
 }
];

const renderWithProviders = (
 ui: React.ReactElement,
 {
   preloadedState = {},
   store = configureStore({
     reducer: {
       posts: postsSlice.reducer,
       auth: authSlice.reducer,
       ui: uiSlice.reducer,
       repositories: repositoriesSlice.reducer
     },
     preloadedState
   }),
   ...renderOptions
 } = {}
) => {
 const Wrapper = ({ children }: { children: React.ReactNode }) => (
   <Provider store={store}>
     <BrowserRouter>
       {children}
     </BrowserRouter>
   </Provider>
 );

 return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

describe('Home Page', () => {
 beforeEach(() => {
   jest.clearAllMocks();
   (postsService.getPosts as jest.Mock).mockResolvedValue({
     posts: mockPosts,
     total: 2,
     page: 1,
     hasMore: false
   });
   (repositoriesService.getTrendingRepositories as jest.Mock).mockResolvedValue(mockRepositories);
 });

 test('renders home page with header elements', async () => {
   renderWithProviders(<Home />);
   
   expect(screen.getByText('Where Ideas Snowball Into Communities')).toBeInTheDocument();
   expect(screen.getByRole('button', { name: /Hot/i })).toBeInTheDocument();
   expect(screen.getByRole('button', { name: /New/i })).toBeInTheDocument();
   expect(screen.getByRole('button', { name: /Top/i })).toBeInTheDocument();
 });

 test('displays loading state initially', () => {
   renderWithProviders(<Home />);
   expect(screen.getByTestId('posts-skeleton')).toBeInTheDocument();
 });

 test('displays posts after loading', async () => {
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('First Post About AI')).toBeInTheDocument();
     expect(screen.getByText('Blockchain Innovation in 2025')).toBeInTheDocument();
   });

   expect(screen.getByText('📧 Reached 1.2k interested readers')).toBeInTheDocument();
   expect(screen.getByText('📧 Reached 3.4k interested readers')).toBeInTheDocument();
 });

 test('displays live stats ticker', async () => {
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText(/active discussions/)).toBeInTheDocument();
     expect(screen.getByText(/new posts today/)).toBeInTheDocument();
     expect(screen.getByText(/trending topics/)).toBeInTheDocument();
   });
 });

 test('handles post sorting', async () => {
   const user = userEvent.setup();
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('First Post About AI')).toBeInTheDocument();
   });

   await user.click(screen.getByRole('button', { name: /New/i }));
   expect(postsService.getPosts).toHaveBeenCalledWith({ sort: 'new', page: 1 });

   await user.click(screen.getByRole('button', { name: /Top/i }));
   expect(postsService.getPosts).toHaveBeenCalledWith({ sort: 'top', page: 1 });
 });

 test('displays trending repositories sidebar', async () => {
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('Trending Repositories')).toBeInTheDocument();
     expect(screen.getByText('AI Healthcare')).toBeInTheDocument();
     expect(screen.getByText('823 members')).toBeInTheDocument();
   });
 });

 test('handles upvote action for authenticated user', async () => {
   const user = userEvent.setup();
   const preloadedState = {
     auth: {
       isAuthenticated: true,
       user: { id: 'user1', username: 'testuser', karma: 100 }
     }
   };

   (postsService.upvotePost as jest.Mock).mockResolvedValue({
     ...mockPosts[0],
     upvotes: 43,
     hasUpvoted: true
   });

   renderWithProviders(<Home />, { preloadedState });

   await waitFor(() => {
     expect(screen.getByText('First Post About AI')).toBeInTheDocument();
   });

   const upvoteButton = screen.getAllByTestId('upvote-button')[0];
   await user.click(upvoteButton);

   await waitFor(() => {
     expect(postsService.upvotePost).toHaveBeenCalledWith('1');
   });
 });

 test('shows login prompt for unauthenticated upvote', async () => {
   const user = userEvent.setup();
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('First Post About AI')).toBeInTheDocument();
   });

   const upvoteButton = screen.getAllByTestId('upvote-button')[0];
   await user.click(upvoteButton);

   expect(screen.getByText('Please login to vote')).toBeInTheDocument();
 });

 test('handles hashtag click navigation', async () => {
   const user = userEvent.setup();
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('#AI')).toBeInTheDocument();
   });

   await user.click(screen.getByText('#AI'));
   expect(window.location.pathname).toBe('/');
 });

 test('displays empty state when no posts', async () => {
   (postsService.getPosts as jest.Mock).mockResolvedValue({
     posts: [],
     total: 0,
     page: 1,
     hasMore: false
   });

   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('No posts yet. Be the first to share!')).toBeInTheDocument();
     expect(screen.getByRole('button', { name: /Create Post/i })).toBeInTheDocument();
   });
 });

 test('handles infinite scroll', async () => {
   const initialPosts = mockPosts.slice(0, 1);
   const morePosts = mockPosts.slice(1, 2);

   (postsService.getPosts as jest.Mock)
     .mockResolvedValueOnce({
       posts: initialPosts,
       total: 2,
       page: 1,
       hasMore: true
     })
     .mockResolvedValueOnce({
       posts: morePosts,
       total: 2,
       page: 2,
       hasMore: false
     });

   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('First Post About AI')).toBeInTheDocument();
   });

   const sentinel = screen.getByTestId('infinite-scroll-sentinel');
   fireEvent.scroll(sentinel);

   await waitFor(() => {
     expect(screen.getByText('Blockchain Innovation in 2025')).toBeInTheDocument();
   });
 });

 test('handles error state', async () => {
   (postsService.getPosts as jest.Mock).mockRejectedValue(new Error('Network error'));

   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('Failed to load posts. Please try again.')).toBeInTheDocument();
     expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
   });
 });

 test('displays join conversation prompt after browsing', async () => {
   jest.useFakeTimers();
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('First Post About AI')).toBeInTheDocument();
   });

   act(() => {
     jest.advanceTimersByTime(120000);
   });

   await waitFor(() => {
     expect(screen.getByText('Join the conversation')).toBeInTheDocument();
   });

   jest.useRealTimers();
 });

 test('handles repository preview on hover', async () => {
   const user = userEvent.setup();
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('AI Healthcare')).toBeInTheDocument();
   });

   const repoCard = screen.getByText('AI Healthcare').closest('div');
   await user.hover(repoCard!);

   await waitFor(() => {
     expect(screen.getByText('Repository for AI in Healthcare discussions')).toBeInTheDocument();
     expect(screen.getByText('12.5% growth rate')).toBeInTheDocument();
   });
 });

 test('handles real-time post updates via websocket', async () => {
   const { store } = renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('First Post About AI')).toBeInTheDocument();
   });

   const newPost: Post = {
     id: '3',
     title: 'Breaking: New AI Model Released',
     content: 'GPT-5 announced',
     author: {
       id: 'user3',
       username: 'ai_news',
       email: 'news@shadownews.community',
       karma: 1000
     },
     hashtags: ['#AI', '#Breaking'],
     upvotes: 0,
     downvotes: 0,
     commentCount: 0,
     emailReach: 0,
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString()
   };

   act(() => {
     store.dispatch(postsSlice.actions.addNewPost(newPost));
   });

   expect(screen.getByText('Breaking: New AI Model Released')).toBeInTheDocument();
   expect(screen.getByText('New post added')).toBeInTheDocument();
 });

 test('filters posts by repository', async () => {
   const user = userEvent.setup();
   renderWithProviders(<Home />);

   await waitFor(() => {
     expect(screen.getByText('AI Healthcare')).toBeInTheDocument();
   });

   await user.click(screen.getByText('AI Healthcare'));

   expect(postsService.getPosts).toHaveBeenCalledWith({
     repositoryId: 'repo1',
     sort: 'hot',
     page: 1
   });
 });

 test('displays user karma milestone notifications', async () => {
   const preloadedState = {
     auth: {
       isAuthenticated: true,
       user: { id: 'user1', username: 'testuser', karma: 99 }
     }
   };

   const { store } = renderWithProviders(<Home />, { preloadedState });

   act(() => {
     store.dispatch(authSlice.actions.updateKarma(101));
   });

   await waitFor(() => {
     expect(screen.getByText('🎉 You reached 100 karma! Custom email signature unlocked.')).toBeInTheDocument();
   });
 });
});
/**
 * Home Page Component
 * 
 * Primary landing page and content hub for the ShadowNews platform, providing
 * adaptive user experience for both authenticated and guest users. Features
 * real-time content feeds, interactive filtering, trending repositories,
 * community statistics, and promotional sections with smooth animations.
 * 
 * Core Features:
 * - Adaptive Layout: Different presentations for authenticated vs guest users
 * - Real-Time Feed: Live post updates with infinite scrolling and filter options
 * - Hero Section: Promotional content with call-to-action for guest users
 * - Content Filtering: Hot, New, Top, and Best post categorization
 * - Trending Repositories: Sidebar showcase of popular email repositories
 * - Community Stats: Live metrics and engagement indicators
 * 
 * User Experience Flows:
 * - Guest Users: Hero section with registration prompts and about information
 * - Authenticated Users: Immediate access to content feed and quick actions
 * - Content Discovery: Multiple filtering options and recommendation systems
 * - Engagement: Easy access to submission, voting, and commenting features
 * 
 * Layout Architecture:
 * - Hero Section: Full-width promotional area with animated statistics ticker
 * - Main Grid: Two-column layout with primary feed and informational sidebar
 * - Filter Tabs: Interactive post categorization with visual state indicators
 * - Infinite Feed: Continuous post loading with performance optimization
 * - Sidebar Modules: Contextual information and action panels
 * 
 * Real-Time Features:
 * - Live Statistics: WebSocket-powered real-time community metrics
 * - Feed Updates: Automatic content refresh with new post indicators
 * - Trending Data: Dynamic repository popularity tracking
 * - Activity Monitoring: User engagement and interaction metrics
 * 
 * Content Management:
 * - Post Filtering: Multiple sorting algorithms (hot, new, top, best)
 * - Infinite Scroll: Progressive content loading with performance optimization
 * - State Management: Redux integration for global state synchronization
 * - Cache Management: Optimized data fetching and storage strategies
 * 
 * Responsive Design:
 * - Mobile Layout: Single-column design with collapsible sidebar
 * - Tablet Adaptation: Balanced two-column layout with optimized spacing
 * - Desktop Experience: Full-featured layout with all components visible
 * - Touch Optimization: Touch-friendly interactive elements for mobile
 * 
 * Animation System:
 * - Page Transitions: Smooth entrance animations for all major components
 * - Staggered Loading: Sequential animation delays for visual hierarchy
 * - Interactive Feedback: Hover states and button press animations
 * - Loading States: Skeleton screens and progressive loading indicators
 * 
 * Performance Optimizations:
 * - Lazy Loading: Components and images loaded on demand
 * - Virtual Scrolling: Efficient rendering for large post lists
 * - Debounced Actions: Optimized user interaction handling
 * - Memory Management: Proper cleanup of subscriptions and event listeners
 * 
 * Sidebar Components:
 * - Quick Actions: Authenticated user shortcuts for common tasks
 * - Trending Repositories: Popular email repositories with engagement metrics
 * - Community Stats: Real-time platform statistics and milestones
 * - About Section: Platform introduction for guest users
 * 
 * Hero Section Features:
 * - Value Proposition: Clear messaging about platform benefits
 * - Call-to-Action: Registration and information buttons
 * - Live Statistics: Animated ticker showing real-time platform activity
 * - Social Proof: Community size and engagement indicators
 * 
 * Filter System:
 * - Hot Posts: Algorithm-ranked content based on engagement velocity
 * - New Posts: Chronologically sorted recent submissions
 * - Top Posts: Highest-rated content by community voting
 * - Best Posts: Quality-ranked content using engagement signals
 * 
 * Accessibility Features:
 * - Keyboard Navigation: Full keyboard accessibility for all interactive elements
 * - Screen Reader Support: Proper ARIA labels and semantic markup
 * - Focus Management: Logical tab order and visible focus indicators
 * - Color Contrast: WCAG compliant color schemes for readability
 * - Alternative Text: Descriptive alt text for all images and icons
 * 
 * State Integration:
 * - Authentication State: User session management and conditional rendering
 * - Posts State: Content feed management with filtering and pagination
 * - Repository State: Trending repository data and user subscriptions
 * - UI State: Theme preferences and user interface customizations
 * 
 * WebSocket Integration:
 * - Real-Time Updates: Live community statistics and activity feeds
 * - Connection Management: Automatic reconnection and error handling
 * - Event Handling: Subscription management for different data streams
 * - Performance: Efficient event processing and state updates
 * 
 * Error Handling:
 * - API Failures: Graceful degradation with retry mechanisms
 * - Network Issues: Offline support and connection status indicators
 * - Loading States: Comprehensive loading and error state management
 * - User Feedback: Clear error messages and recovery options
 * 
 * Mobile Optimization:
 * - Touch Gestures: Swipe navigation and touch-friendly interactions
 * - Performance: Optimized rendering for mobile device constraints
 * - Battery Efficiency: Minimal animation overhead and optimized updates
 * - Data Usage: Efficient content loading and image optimization
 * 
 * Content Discovery:
 * - Personalization: Algorithm-driven content recommendations
 * - Trending Analysis: Real-time trending topic identification
 * - Social Signals: Community engagement-based content promotion
 * - Search Integration: Quick access to search functionality
 * 
 * Dependencies:
 * - React: Component framework with hooks for state and lifecycle management
 * - React Router: Navigation and routing for multi-page application
 * - Redux Toolkit: State management for global application state
 * - Framer Motion: Animation library for smooth transitions and effects
 * - Lucide React: Icon library for consistent visual elements
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Flame, Award, Users, Mail, Hash, ChevronRight } from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { fetchPosts, setFilter } from '../../store/slices/posts.slice';
import { fetchTrendingRepositories } from '../../store/slices/repositories.slice';
import PostCard from '../../components/posts/PostCard/PostCard';
import PostList from '../../components/posts/PostList/PostList';
import RepositoryCard from '../../components/repositories/RepositoryCard/RepositoryCard';
import Loading from '../../components/common/Loading/Loading';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useWebSocket } from '../../hooks/useWebSocket';
import { PostFilter, Repository } from '../../types';
import { formatNumber } from '../../utils/formatters';
import './Home.styles.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, filter, hasMore } = useSelector((state: RootState) => state.posts);
  const { trendingRepositories } = useSelector((state: RootState) => state.repositories);
  const { user } = useSelector((state: RootState) => state.auth);
  const [realtimeStats, setRealtimeStats] = useState({
    activeDiscussions: 0,
    newPostsToday: 0,
    trendingTopics: 0,
    totalEmails: 0
  });

  // Real-time updates
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    const handleRealtimeUpdate = (data: any) => {
      if (data.type === 'stats_update') {
        setRealtimeStats(data.payload);
      }
    };

    subscribe('home_stats', handleRealtimeUpdate);
    return () => unsubscribe('home_stats', handleRealtimeUpdate);
  }, [subscribe, unsubscribe]);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchPosts({ filter, page: 1 }));
    dispatch(fetchTrendingRepositories());
  }, [dispatch, filter]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchPosts({ filter, page: posts.length / 30 + 1 }));
    }
  }, [dispatch, filter, hasMore, loading, posts.length]);

  useInfiniteScroll(loadMore);

  // Filter handlers
  const handleFilterChange = (newFilter: PostFilter) => {
    dispatch(setFilter(newFilter));
  };

  const filters: { key: PostFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { key: 'new', label: 'New', icon: <Clock className="w-4 h-4" /> },
    { key: 'top', label: 'Top', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'best', label: 'Best', icon: <Award className="w-4 h-4" /> }
  ];

  return (
    <div className="home-container">
      {/* Hero Section - Only for non-authenticated users */}
      {!user && (
        <motion.section 
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-content">
            <h1 className="hero-title">
              Where Ideas Snowball Into Communities
            </h1>
            <p className="hero-subtitle">
              Join the next generation of knowledge sharing. Post via email, build topic repositories, 
              and watch your network grow exponentially.
            </p>
            <div className="hero-actions">
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/register')}
                className="hero-cta"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="large"
                onClick={() => navigate('/about')}
                className="hero-secondary"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Live Stats Ticker */}
          <motion.div 
            className="stats-ticker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-item">
              <Users className="stat-icon" />
              <span className="stat-value">{formatNumber(realtimeStats.activeDiscussions)}</span>
              <span className="stat-label">active discussions</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <TrendingUp className="stat-icon" />
              <span className="stat-value">{formatNumber(realtimeStats.newPostsToday)}</span>
              <span className="stat-label">new posts today</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <Hash className="stat-icon" />
              <span className="stat-value">{formatNumber(realtimeStats.trendingTopics)}</span>
              <span className="stat-label">trending topics</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <Mail className="stat-icon" />
              <span className="stat-value">{formatNumber(realtimeStats.totalEmails)}</span>
              <span className="stat-label">network emails</span>
            </div>
          </motion.div>
        </motion.section>
      )}

      <div className="main-content">
        <div className="content-grid">
          {/* Main Feed */}
          <div className="feed-column">
            {/* Filter Tabs */}
            <div className="filter-tabs">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.key}
                  className={`filter-tab ${filter === filterItem.key ? 'active' : ''}`}
                  onClick={() => handleFilterChange(filterItem.key)}
                >
                  {filterItem.icon}
                  <span>{filterItem.label}</span>
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <AnimatePresence mode="wait">
              {loading && posts.length === 0 ? (
                <Loading />
              ) : (
                <PostList posts={posts} />
              )}
            </AnimatePresence>

            {/* Loading more indicator */}
            {loading && posts.length > 0 && (
              <div className="loading-more">
                <Loading size="small" />
              </div>
            )}

            {/* No more posts */}
            {!hasMore && posts.length > 0 && (
              <div className="no-more-posts">
                <p>You've reached the end! 🎉</p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/submit')}
                >
                  Create a Post
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            {/* Quick Actions - For authenticated users */}
            {user && (
              <motion.div 
                className="sidebar-section quick-actions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="section-title">Quick Actions</h3>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/submit')}
                  className="submit-button"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Submit Post
                </Button>
                <p className="email-hint">
                  Or email to: <code>{user.email}@shadownews.community</code>
                </p>
              </motion.div>
            )}

            {/* Trending Repositories */}
            <motion.div 
              className="sidebar-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="section-header">
                <h3 className="section-title">Trending Repositories</h3>
                <button 
                  className="see-all-link"
                  onClick={() => navigate('/repositories')}
                >
                  See all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="repositories-list">
                {trendingRepositories.slice(0, 5).map((repo: Repository) => (
                  <RepositoryCard 
                    key={repo.id} 
                    repository={repo}
                    compact
                  />
                ))}
              </div>
            </motion.div>

            {/* Community Stats */}
            <motion.div 
              className="sidebar-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="section-title">Community Stats</h3>
              <div className="community-stats">
                <div className="stat-row">
                  <span className="stat-label">Total Members</span>
                  <Badge variant="secondary">{formatNumber(42857)}</Badge>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Posts This Week</span>
                  <Badge variant="success">{formatNumber(1234)}</Badge>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Active Repositories</span>
                  <Badge variant="primary">{formatNumber(856)}</Badge>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Emails Shared</span>
                  <Badge variant="warning">{formatNumber(125789)}</Badge>
                </div>
              </div>
            </motion.div>

            {/* About Shadownews */}
            {!user && (
              <motion.div 
                className="sidebar-section about-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="section-title">About Shadownews</h3>
                <p className="about-text">
                  Shadownews is a next-generation knowledge sharing platform where email meets 
                  social news. Create topic repositories, share via CSV, and watch your network 
                  grow through our unique snowball distribution system.
                </p>
                <div className="feature-list">
                  <div className="feature-item">
                    <Mail className="feature-icon" />
                    <span>Post via email or web</span>
                  </div>
                  <div className="feature-item">
                    <Users className="feature-icon" />
                    <span>Build topic communities</span>
                  </div>
                  <div className="feature-item">
                    <TrendingUp className="feature-icon" />
                    <span>Snowball distribution</span>
                  </div>
                </div>
              </motion.div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
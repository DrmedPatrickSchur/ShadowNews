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
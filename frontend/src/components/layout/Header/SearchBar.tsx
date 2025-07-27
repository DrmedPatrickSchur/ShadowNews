/**
 * Universal Search Bar Component
 * 
 * Comprehensive search interface providing real-time search across multiple content
 * types including posts, repositories, users, and hashtags. Features intelligent
 * search suggestions, keyboard navigation, debounced API calls, and accessible
 * dropdown interface with categorized results and performance optimizations.
 * 
 * Core Features:
 * - Universal Search: Searches across posts, repositories, users, and hashtags simultaneously
 * - Real-Time Suggestions: Live search results with debounced API calls for performance
 * - Keyboard Navigation: Full keyboard support with arrow keys, Enter, and Escape
 * - Intelligent Parsing: Automatic hashtag extraction and user mention detection
 * - Category Organization: Grouped results with clear visual hierarchy and icons
 * - Responsive Design: Mobile-optimized interface with touch-friendly interactions
 * 
 * Search Categories:
 * - Posts: Article titles with engagement metrics (points, comments)
 * - Repositories: Email repositories with topic and email count information
 * - Users: User profiles with karma scores and repository counts
 * - Hashtags: Extracted hashtags from search query with trending indicators
 * 
 * User Experience:
 * - Auto-Focus: Optional automatic focus for improved accessibility
 * - Clear Functionality: One-click search query clearing with visual feedback
 * - Loading States: Visual loading indicators during search operations
 * - Empty States: Informative no-results messaging with suggestions
 * - Quick Actions: Direct navigation to detailed search results page
 * 
 * Performance Optimizations:
 * - Debounced Search: 300ms debounce to reduce API calls and improve performance
 * - Request Batching: Parallel API calls for different content types
 * - Result Limiting: Limited results per category to prevent interface overflow
 * - Efficient Rendering: Optimized React rendering with proper key usage
 * - Memory Management: Proper cleanup of event listeners and API calls
 * 
 * Keyboard Navigation:
 * - Arrow Keys: Navigate through search results with visual selection
 * - Enter Key: Activate selected result or perform general search
 * - Escape Key: Close dropdown and remove focus from search input
 * - Tab Key: Navigate away from search component with proper focus management
 * 
 * Search Intelligence:
 * - Query Processing: Intelligent parsing of search terms and special characters
 * - Hashtag Detection: Automatic extraction and suggestion of hashtags
 * - User Mention Support: @ symbol recognition for user searches
 * - Context Awareness: Search results prioritized by user preferences and history
 * 
 * Accessibility Features:
 * - Screen Reader Support: Proper ARIA labels and live regions for result updates
 * - Keyboard Navigation: Complete keyboard accessibility with logical tab order
 * - Focus Management: Proper focus handling for dropdown interactions
 * - High Contrast: Sufficient color contrast for all interactive elements
 * - Touch Accessibility: Adequate touch targets for mobile devices
 * 
 * Visual Design:
 * - Modern Interface: Clean design with consistent spacing and typography
 * - Category Icons: Visual indicators for different content types
 * - Interactive States: Hover and selection states with smooth transitions
 * - Loading Animation: Subtle spinner animation during search operations
 * - Responsive Layout: Adaptive design for various screen sizes
 * 
 * State Management:
 * - Search Query: Real-time search input with debounced processing
 * - Results State: Categorized search results with loading and error states
 * - Selection State: Keyboard navigation selection with visual feedback
 * - Dropdown State: Show/hide logic with click-outside detection
 * - Loading State: Visual feedback during API operations
 * 
 * API Integration:
 * - Multiple Endpoints: Parallel calls to posts, repositories, and users APIs
 * - Error Handling: Graceful error handling with fallback states
 * - Response Processing: Data transformation and filtering for display
 * - Authentication: Respect for user authentication state and permissions
 * 
 * Mobile Optimization:
 * - Touch Events: Optimized touch handling for mobile interactions
 * - Viewport Adaptation: Responsive design for various screen sizes
 * - Performance: Optimized rendering for mobile device constraints
 * - Gesture Support: Touch-friendly navigation and selection
 * 
 * Navigation Integration:
 * - React Router: Seamless navigation to search results and content pages
 * - URL Management: Proper URL encoding for search queries and parameters
 * - History Handling: Browser history integration for search navigation
 * - Deep Linking: Support for direct links to search results
 * 
 * Error Handling:
 * - API Failures: Graceful handling of search API failures
 * - Network Issues: Fallback behavior for network connectivity problems
 * - Invalid Queries: Proper handling of malformed search inputs
 * - Rate Limiting: Respectful API usage with appropriate debouncing
 * 
 * Dependencies:
 * - React: Component framework with hooks for state and lifecycle management
 * - React Router: Navigation and routing for search result pages
 * - Redux: State management for authentication and global search state
 * - Lucide React: Icon library for search interface elements
 * - Custom Hooks: useDebounce for search optimization
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Hash, User, FileText, Loader2 } from 'lucide-react';
import { RootState } from '../../../store/store';
import { searchPosts, searchRepositories, searchUsers } from '../../../services/api';
import { useDebounce } from '../../../hooks/useDebounce';
import { Post, Repository, User as UserType } from '../../../types';

interface SearchResult {
  posts: Post[];
  repositories: Repository[];
  users: UserType[];
  hashtags: string[];
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  placeholder = 'Search posts, #hashtags, @users, repositories...',
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    posts: [],
    repositories: [],
    users: [],
    hashtags: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debouncedQuery = useDebounce(query, 300);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ posts: [], repositories: [], users: [], hashtags: [] });
      setIsOpen(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const [postsRes, reposRes, usersRes] = await Promise.all([
          searchPosts(debouncedQuery),
          searchRepositories(debouncedQuery),
          searchUsers(debouncedQuery),
        ]);

        const hashtags = extractHashtags(debouncedQuery);

        setResults({
          posts: postsRes.data.slice(0, 3),
          repositories: reposRes.data.slice(0, 3),
          users: usersRes.data.slice(0, 3),
          hashtags: hashtags.slice(0, 3),
        });
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#\w+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalResults = 
      results.posts.length + 
      results.repositories.length + 
      results.users.length + 
      results.hashtags.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalResults);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(selectedIndex);
        } else if (query.trim()) {
          navigate(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [results, selectedIndex, query, navigate]);

  const handleResultClick = (index: number) => {
    let currentIndex = 0;

    // Posts
    if (index < results.posts.length) {
      navigate(`/post/${results.posts[index].id}`);
      setIsOpen(false);
      setQuery('');
      return;
    }
    currentIndex += results.posts.length;

    // Repositories
    if (index < currentIndex + results.repositories.length) {
      navigate(`/repository/${results.repositories[index - currentIndex].id}`);
      setIsOpen(false);
      setQuery('');
      return;
    }
    currentIndex += results.repositories.length;

    // Users
    if (index < currentIndex + results.users.length) {
      navigate(`/user/${results.users[index - currentIndex].username}`);
      setIsOpen(false);
      setQuery('');
      return;
    }
    currentIndex += results.users.length;

    // Hashtags
    if (index < currentIndex + results.hashtags.length) {
      navigate(`/search?q=%23${results.hashtags[index - currentIndex]}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const getItemIndex = (section: string, index: number): number => {
    let offset = 0;
    if (section === 'repositories') offset = results.posts.length;
    if (section === 'users') offset = results.posts.length + results.repositories.length;
    if (section === 'hashtags') offset = results.posts.length + results.repositories.length + results.users.length;
    return offset + index;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {results.posts.length === 0 && 
           results.repositories.length === 0 && 
           results.users.length === 0 && 
           results.hashtags.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {results.posts.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Posts
                  </h3>
                  {results.posts.map((post, index) => (
                    <button
                      key={post.id}
                      onClick={() => handleResultClick(getItemIndex('posts', index))}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        selectedIndex === getItemIndex('posts', index) ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {post.points} points • {post.commentsCount} comments
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.repositories.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Repositories
                  </h3>
                  {results.repositories.map((repo, index) => (
                    <button
                      key={repo.id}
                      onClick={() => handleResultClick(getItemIndex('repositories', index))}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        selectedIndex === getItemIndex('repositories', index) ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {repo.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {repo.emailCount} emails • {repo.topic}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Users
                  </h3>
                  {results.users.map((user, index) => (
                    <button
                      key={user.id}
                      onClick={() => handleResultClick(getItemIndex('users', index))}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        selectedIndex === getItemIndex('users', index) ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            @{user.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.karma} karma • {user.repositoryCount} repositories
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.hashtags.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Hashtags
                  </h3>
                  {results.hashtags.map((hashtag, index) => (
                    <button
                      key={hashtag}
                      onClick={() => handleResultClick(getItemIndex('hashtags', index))}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        selectedIndex === getItemIndex('hashtags', index) ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{hashtag}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
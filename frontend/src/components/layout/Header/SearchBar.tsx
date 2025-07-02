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
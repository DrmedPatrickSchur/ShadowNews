import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Bell, Search, PlusCircle, Mail, Hash, TrendingUp, User, LogOut, Settings, BarChart3, Moon, Sun } from 'lucide-react';
import { RootState } from '../../../store/store';
import { logout } from '../../../store/slices/auth.slice';
import { toggleTheme } from '../../../store/slices/ui.slice';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { formatKarma } from '../../../utils/formatters';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme, unreadNotifications } = useSelector((state: RootState) => state.ui);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { isConnected } = useWebSocket();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const navItems = [
    { label: 'Top', path: '/', icon: TrendingUp },
    { label: 'New', path: '/new', icon: Hash },
    { label: 'Repositories', path: '/repositories', icon: Mail },
    { label: 'Submit', path: '/submit', icon: PlusCircle, authRequired: true },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-white dark:bg-gray-900'} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                Shadownews
              </span>
              {!isConnected && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                  Offline
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </button>
                  {isNotificationOpen && (
                    <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatKarma(user?.karma || 0)} karma
                      </p>
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          to={`/u/${user?.username}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search Bar (Desktop) */}
        {isSearchOpen && (
          <div className="hidden md:block absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-3xl mx-auto p-4">
              <SearchBar onClose={() => setIsSearchOpen(false)} autoFocus />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="pb-3">
              <SearchBar onClose={() => setIsMenuOpen(false)} />
            </div>

            {/* Mobile Navigation */}
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile User Section */}
            {isAuthenticated ? (
              <>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <Link
                  to={`/u/${user?.username}`}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatKarma(user?.karma || 0)} karma
                    </p>
                  </div>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-lg text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Theme Toggle (Mobile) */}
            <button
              onClick={handleThemeToggle}
              className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
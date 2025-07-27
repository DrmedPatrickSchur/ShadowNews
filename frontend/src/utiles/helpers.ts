/**
 * @fileoverview helpers.ts
 * 
 * Implementation file for helpers.ts
 * 
 * Key Features:
 * - Core functionality
 * - Error handling
 * - Performance optimization
 * 
 * Dependencies:
 *  * - No external dependencies
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */\n\nimport { formatDistanceToNow, parseISO, format, isValid } from 'date-fns';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const timeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

export const formatDate = (date: string | Date, formatStr: string = 'PPP'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
};

export const generateGravatar = (email: string, size: number = 80): string => {
  const hash = Array.from(email.trim().toLowerCase())
    .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
    .toString(16)
    .padStart(32, '0');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
};

export const extractHashtags = (text: string): string[] => {
  const regex = /#[a-zA-Z0-9_]+/g;
  const matches = text.match(regex) || [];
  return [...new Set(matches.map(tag => tag.toLowerCase()))];
};

export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
};

export const parseMarkdown = (markdown: string): string => {
  const clean = DOMPurify.sanitize(markdown);
  return marked.parse(clean, { gfm: true, breaks: true }) as string;
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateCSV = (file: File): { valid: boolean; error?: string } => {
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    return { valid: false, error: 'File must be a CSV' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  return { valid: true };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const parseEmailAddresses = (csvContent: string): string[] => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = csvContent.match(emailRegex) || [];
  return [...new Set(matches.map(email => email.toLowerCase()))];
};

export const calculateSnowballGrowth = (
  initialEmails: number,
  shareRate: number = 0.1,
  iterations: number = 5
): number[] => {
  const growth = [initialEmails];
  for (let i = 1; i <= iterations; i++) {
    const newEmails = Math.floor(growth[i - 1] * shareRate);
    growth.push(growth[i - 1] + newEmails);
  }
  return growth;
};

export const generateRepositoryStats = (emails: string[]): {
  total: number;
  domains: { [key: string]: number };
  topDomains: { domain: string; count: number }[];
} => {
  const domains: { [key: string]: number } = {};
  
  emails.forEach(email => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain) {
      domains[domain] = (domains[domain] || 0) + 1;
    }
  });
  
  const topDomains = Object.entries(domains)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    total: emails.length,
    domains,
    topDomains
  };
};

export const getKarmaLevel = (karma: number): {
  level: string;
  nextLevel: number;
  progress: number;
  perks: string[];
} => {
  const levels = [
    { threshold: 0, name: 'Lurker', perks: ['Read posts', 'Upvote'] },
    { threshold: 100, name: 'Contributor', perks: ['Custom email signature'] },
    { threshold: 500, name: 'Active Member', perks: ['Create repositories'] },
    { threshold: 1000, name: 'Power User', perks: ['Weighted voting'] },
    { threshold: 5000, name: 'Community Leader', perks: ['Platform governance'] },
    { threshold: 10000, name: 'Shadownews Elite', perks: ['All features', 'Special badge'] }
  ];
  
  const currentLevelIndex = levels.findIndex((_, i) => 
    i === levels.length - 1 || karma < levels[i + 1].threshold
  );
  
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];
  
  return {
    level: currentLevel.name,
    nextLevel: nextLevel?.threshold || currentLevel.threshold,
    progress: nextLevel 
      ? ((karma - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100
      : 100,
    perks: currentLevel.perks
  };
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch {
    return false;
  }
};

export const generateShareUrl = (postId: string, title: string): string => {
  const baseUrl = window.location.origin;
  const slug = generateSlug(title);
  return `${baseUrl}/posts/${postId}/${slug}`;
};

export const detectColorScheme = (): 'light' | 'dark' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const highlightText = (text: string, query: string): string => {
  if (!query) return text;
  const escapedQuery = escapeRegExp(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const sortByKey = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) return [...new Set(array)];
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

export const extractDomain = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const parseQueryParams = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getScrollPercentage = (): number => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
};

export const smoothScroll = (elementId: string, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
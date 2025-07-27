/**
 * @fileoverview formatters.ts
 * 
 * Implementation file for formatters.ts
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
 */\n\nexport const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export const formatKarma = (karma: number): string => {
  if (karma < 0) {
    return karma.toString();
  }
  return `+${formatNumber(karma)}`;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }
};

export const formatFullDate = (date: string | Date): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleDateString('en-US', options);
};

export const formatShortDate = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  if (isToday) {
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  
  if (isYesterday) {
    return 'Yesterday';
  }
  
  const daysDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const formatEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 3) {
    return email;
  }
  
  const visibleChars = 3;
  const maskedPortion = username.substring(visibleChars);
  const maskLength = Math.min(maskedPortion.length, 5);
  const mask = '*'.repeat(maskLength);
  
  return `${username.substring(0, visibleChars)}${mask}@${domain}`;
};

export const formatEmailCount = (count: number): string => {
  if (count === 0) return 'No emails yet';
  if (count === 1) return '1 email';
  return `${formatNumber(count)} emails`;
};

export const formatRepositorySize = (size: number): string => {
  if (size === 0) return 'Empty repository';
  if (size === 1) return '1 member';
  return `${formatNumber(size)} members`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatUsername = (username: string): string => {
  return `@${username}`;
};

export const formatDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export const formatHashtag = (tag: string): string => {
  if (tag.startsWith('#')) {
    return tag;
  }
  return `#${tag}`;
};

export const formatHashtags = (tags: string[]): string => {
  return tags.map(formatHashtag).join(' ');
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

export const formatGrowth = (current: number, previous: number): string => {
  if (previous === 0) return '+∞';
  const growth = ((current - previous) / previous) * 100;
  const sign = growth >= 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};

export const formatSnowballMultiplier = (multiplier: number): string => {
  return `${multiplier.toFixed(1)}x`;
};

export const formatEngagementRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};

export const formatReadingTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  if (minutes < 1) return 'Less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};

export const formatPostTitle = (title: string, maxLength: number = 80): string => {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength - 3)}...`;
};

export const formatExcerpt = (content: string, maxLength: number = 150): string => {
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  if (plainText.length <= maxLength) return plainText;
  
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return `${truncated.substring(0, lastSpace)}...`;
  }
  
  return `${truncated}...`;
};

export const formatCSVPreview = (rows: number, columns: number): string => {
  return `${formatNumber(rows)} rows × ${columns} columns`;
};

export const formatTimezone = (date: Date = new Date()): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  
  return `${timeZone} (UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')})`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
};

export const formatPluralCount = (
  count: number, 
  singular: string, 
  plural?: string
): string => {
  const pluralForm = plural || `${singular}s`;
  return count === 1 
    ? `${count} ${singular}`
    : `${formatNumber(count)} ${pluralForm}`;
};

export const formatList = (
  items: string[], 
  maxItems: number = 3
): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  if (items.length <= maxItems) {
    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1);
    return `${otherItems.join(', ')}, and ${lastItem}`;
  }
  
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - maxItems;
  return `${displayItems.join(', ')}, and ${remainingCount} more`;
};

export const formatURL = (url: string): string => {
  return url.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatEmailSubject = (subject: string): string => {
  const prefix = '[Shadownews] ';
  if (subject.startsWith(prefix)) {
    return subject;
  }
  return `${prefix}${subject}`;
};

export const formatScore = (upvotes: number, downvotes: number): string => {
  const score = upvotes - downvotes;
  return formatKarma(score);
};

export const formatActivity = (lastActive: Date | string): string => {
  const date = new Date(lastActive);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 5) return 'Active now';
  if (diffMinutes < 60) return 'Active recently';
  if (diffMinutes < 1440) return 'Active today';
  if (diffMinutes < 10080) return 'Active this week';
  return 'Inactive';
};

export const formatCurrency = (
  amount: number, 
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
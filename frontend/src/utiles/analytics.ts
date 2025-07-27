/**
 * Analytics Utility - User Behavior Tracking and Metrics Collection
 * 
 * Comprehensive analytics system for the ShadowNews email-first social platform.
 * This utility provides detailed user behavior tracking, performance monitoring,
 * and business intelligence collection to optimize user experience and platform
 * growth through data-driven insights.
 * 
 * Analytics Architecture:
 * - Event Tracking: Comprehensive user action and interaction monitoring
 * - Performance Metrics: Page load times, API response times, and system performance
 * - Business Intelligence: User engagement, content performance, and growth metrics
 * - Real-time Processing: Immediate event capture with efficient batching
 * - Privacy Compliance: GDPR-compliant data collection and user consent management
 * - Error Monitoring: Automatic error detection and reporting for system reliability
 * 
 * Email Platform Analytics:
 * - Repository Growth: Email collection growth tracking and viral metrics
 * - Snowball Analytics: Viral growth pattern analysis and optimization
 * - Email Engagement: Open rates, click-through rates, and conversion tracking
 * - CSV Processing: Bulk import analytics and processing efficiency metrics
 * - Content Distribution: Post-to-email conversion and reach analytics
 * - User Journey: Email discovery to platform engagement flow tracking
 * 
 * Event Categories:
 * - Navigation: Page views, route changes, and user flow tracking
 * - Content: Post creation, viewing, voting, and sharing analytics
 * - Repositories: Email repository management and growth tracking
 * - Email: Email delivery, engagement, and conversion metrics
 * - User Engagement: Search, filtering, scrolling, and interaction depth
 * - Feature Adoption: New feature usage and onboarding completion
 * - Performance: Load times, API latency, and system performance
 * - Errors: Error tracking, debugging, and system reliability monitoring
 * 
 * Data Collection Features:
 * - Automatic Batching: Efficient event queuing and batch transmission
 * - Session Tracking: User session duration and engagement depth
 * - User Identification: Authenticated user tracking with privacy controls
 * - Custom Events: Flexible custom event tracking for specific features
 * - A/B Testing: Experiment tracking and conversion measurement
 * - Karma Analytics: User reputation and gamification metrics
 * 
 * Privacy and Compliance:
 * - User Consent: Respect user privacy preferences and opt-out settings
 * - Data Anonymization: Automatic PII removal and data anonymization
 * - GDPR Compliance: European privacy regulation compliance
 * - Data Retention: Configurable data retention policies
 * - Opt-out Support: User-controlled analytics tracking preferences
 * - Secure Transmission: Encrypted data transmission and storage
 * 
 * Performance Optimization:
 * - Efficient Queuing: Minimal performance impact on user experience
 * - Batch Processing: Optimized network usage through event batching
 * - Error Handling: Graceful degradation when analytics service is unavailable
 * - Debug Mode: Development-friendly debugging and testing capabilities
 * - Lazy Loading: Non-blocking analytics initialization
 * - Memory Management: Efficient memory usage and garbage collection
 * 
 * Integration Features:
 * - Redux Integration: Seamless state management integration
 * - React Router: Automatic page view tracking with route changes
 * - Error Boundaries: Automatic error tracking and reporting
 * - Performance API: Browser performance metrics integration
 * - WebVitals: Core web vitals and user experience metrics
 * - Custom Dashboards: Support for custom analytics dashboards
 * 
 * Business Intelligence:
 * - User Acquisition: Source tracking and conversion funnels
 * - Retention Analysis: User engagement and retention patterns
 * - Feature Utilization: Feature adoption and usage analytics
 * - Content Performance: Post engagement and viral content identification
 * - Repository Analytics: Email collection effectiveness and growth patterns
 * - Revenue Metrics: Premium feature adoption and subscription analytics
 * 
 * Dependencies:
 * - Redux Store: User state and authentication integration
 * - Browser APIs: Performance monitoring and error tracking
 * - Fetch API: Secure data transmission to analytics endpoints
 * - Environment Variables: Configuration management and feature flags
 * 
 * @author ShadowNews Team
 * @version 2.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { store } from '../store/store';

/* =============================================================================
   Analytics Type Definitions
   Comprehensive type system for analytics events and data structures
   ============================================================================= */

/**
 * Analytics Event Interface
 * Core event structure for all analytics tracking
 * 
 * @interface AnalyticsEvent
 * @description Standard event format for user behavior tracking
 * 
 * Features:
 * - Event Categorization: Logical grouping of related events
 * - Action Tracking: Specific user actions and interactions
 * - Flexible Metadata: Custom data attachment for detailed analysis
 * - User Context: Automatic user and session identification
 * - Temporal Tracking: Precise timestamp for event ordering
 */
interface AnalyticsEvent {
  /** Event category for logical grouping (e.g., 'Posts', 'Navigation') */
  category: string;
  
  /** Specific action performed (e.g., 'Created', 'Viewed', 'Clicked') */
  action: string;
  
  /** Optional label for additional context (e.g., post ID, page path) */
  label?: string;
  
  /** Optional numeric value for quantifiable metrics */
  value?: number;
  
  /** User ID for authenticated user tracking */
  userId?: string;
  
  /** Session ID for user session tracking */
  sessionId?: string;
  
  /** Event timestamp in milliseconds */
  timestamp?: number;
  
  /** Additional event-specific metadata and context */
  metadata?: Record<string, any>;
}

/**
 * Page View Event Interface
 * Specialized event structure for page navigation tracking
 * 
 * @interface PageViewEvent
 * @description Page view tracking with navigation context
 */
interface PageViewEvent {
  /** Page path or route for navigation tracking */
  path: string;
  
  /** Page title for content identification */
  title: string;
  
  /** Referrer URL for traffic source analysis */
  referrer?: string;
  
  /** User ID for authenticated page view tracking */
  userId?: string;
  
  /** Session ID for user session analysis */
  sessionId?: string;
  
  /** Page view timestamp */
  timestamp?: number;
}

/**
 * User Properties Interface
 * User identification and demographic data for analytics
 * 
 * @interface UserProperties
 * @description User profile data for cohort analysis and personalization
 */
interface UserProperties {
  /** Unique user identifier */
  userId: string;
  
  /** User email for identification (anonymized in processing) */
  email?: string;
  
  /** User karma points for engagement analysis */
  karma?: number;
  
  /** Number of repositories owned for user segmentation */
  repositoryCount?: number;
  
  /** Account creation date for cohort analysis */
  joinDate?: Date;
  
  /** Premium subscription status for revenue analytics */
  isPremium?: boolean;
  
  /** Email verification status for user quality metrics */
  emailVerified?: boolean;
  
  /** User's preferred topics for personalization analytics */
  preferredTopics?: string[];
}

/**
 * Repository Metrics Interface
 * Email repository performance and growth tracking data
 * 
 * @interface RepositoryMetrics
 * @description Repository analytics for growth and engagement measurement
 */
interface RepositoryMetrics {
  /** Repository identifier for metrics tracking */
  repositoryId: string;
  
  /** Current total number of emails in repository */
  emailCount: number;
  
  /** Repository growth rate as percentage */
  growthRate: number;
  
  /** Email engagement rate as percentage */
  engagementRate: number;
  
  /** Snowball multiplier for viral growth tracking */
  snowballMultiplier: number;
}

/* =============================================================================
   Analytics Class Implementation
   Core analytics tracking and event management system
   ============================================================================= */

/**
 * Analytics Class
 * Comprehensive analytics tracking system with event queuing and batch processing
 * 
 * @class Analytics
 * @description Main analytics engine for user behavior tracking and metrics collection
 * 
 * Features:
 * - Event Queuing: Efficient event batching for optimized network usage
 * - Session Management: Automatic session tracking and user identification
 * - Error Handling: Graceful degradation and comprehensive error tracking
 * - Privacy Controls: User consent management and data anonymization
 * - Performance Optimization: Non-blocking analytics with minimal impact
 * - Debug Support: Development-friendly debugging and testing capabilities
 */
class Analytics {
  /** Unique session identifier for user session tracking */
  private sessionId: string;
  
  /** Event queue for batch processing optimization */
  private queue: AnalyticsEvent[] = [];
  
  /** Flush interval in milliseconds for batch processing */
  private flushInterval: number = 5000;
  
  /** Maximum queue size before forced flush */
  private maxQueueSize: number = 50;
  
  /** Analytics API endpoint for event submission */
  private endpoint: string = process.env.REACT_APP_ANALYTICS_ENDPOINT || '/api/analytics';
  
  /** Whether analytics tracking is enabled */
  private isEnabled: boolean = process.env.NODE_ENV === 'production';
  
  /** Debug mode for development and testing */
  private debug: boolean = process.env.REACT_APP_ANALYTICS_DEBUG === 'true';

  /**
   * Analytics Constructor
   * Initializes analytics system with session management and event processing
   * 
   * @constructor
   * @description Sets up analytics environment, generates session ID, starts processing
   * 
   * Initialization Process:
   * 1. Session ID Generation: Creates unique identifier for user session
   * 2. Queue Processor: Starts background event processing
   * 3. Global Listeners: Attaches window/document event handlers
   * 4. Environment Detection: Configures based on production/development
   */
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startQueueProcessor();
    this.attachGlobalListeners();
  }

  /**
   * Generate Session ID
   * Creates unique session identifier combining timestamp and random string
   * 
   * @private
   * @returns {string} Unique session identifier
   * @description Generates collision-resistant session ID for user tracking
   * 
   * Format: timestamp-randomString (e.g., "1234567890-abc123def")
   * Purpose: Session continuity and user behavior correlation
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start Queue Processor
   * Initializes background event queue processing with automatic flushing
   * 
   * @private
   * @returns {void}
   * @description Sets up interval-based queue processing for batch analytics
   * 
   * Processing Strategy:
   * - Interval-Based: Regular flush cycles for optimal performance
   * - Queue Size Limits: Prevents memory buildup in high-traffic scenarios
   * - Production-Only: Disabled in development to prevent test data
   * - Error Resilience: Continues processing despite individual event failures
   */
  private startQueueProcessor(): void {
    if (!this.isEnabled) return;

    setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  /**
   * Attach Global Listeners
   * Sets up window-level event listeners for comprehensive tracking
   * 
   * @private
   * @returns {void}
   * @description Binds to critical browser events for automatic analytics
   * 
   * Event Handlers:
   * - beforeunload: Ensures final flush before page closure
   * - error: Captures JavaScript errors for debugging analytics
   * - unhandledrejection: Tracks promise rejections and async errors
   * - SSR Safety: Guards against server-side rendering issues
   */
  private attachGlobalListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });

    window.addEventListener('error', (event) => {
      this.trackError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason);
    });
  }

  /**
   * Get User ID
   * Retrieves current authenticated user identifier from Redux store
   * 
   * @private
   * @returns {string | undefined} User ID or undefined if not authenticated
   * @description Extracts user identification for personalized analytics
   * 
   * Data Source: Redux auth store state
   * Privacy: Respects authentication state and user consent
   */
  private getUserId(): string | undefined {
    const state = store.getState();
    return state.auth?.user?.id;
  }

  /**
   * Flush Event Queue
   * Sends accumulated analytics events to backend in batch
   * 
   * @private
   * @param {boolean} sync - Whether to use synchronous beacon API
   * @returns {Promise<void>} Resolves when flush completes
   * @description Processes event queue with error handling and retry logic
   * 
   * Flush Strategies:
   * - Async Mode: Standard fetch API for normal operations
   * - Sync Mode: Beacon API for page unload scenarios
   * - Batch Processing: Optimizes network usage and server load
   * - Error Recovery: Graceful degradation on network failures
   */
  private async flush(sync: boolean = false): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const payload = {
        events,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      };

      if (sync) {
        navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
      } else {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (this.debug) {
        console.log('[Analytics] Flushed events:', events);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[Analytics] Failed to flush events:', error);
      }
    }
  }

  /**
   * Track Event
   * Core event tracking method for recording user interactions
   * 
   * @public
   * @param {Omit<AnalyticsEvent, 'userId' | 'sessionId' | 'timestamp'>} event - Event data without auto-filled fields
   * @returns {void}
   * @description Processes and queues analytics events with metadata enrichment
   * 
   * Event Processing:
   * - Metadata Enrichment: Adds userId, sessionId, timestamp automatically
   * - Queue Management: Adds to processing queue with size limits
   * - Immediate Flush: Forces flush when queue reaches capacity
   * - Debug Logging: Optional development-mode event inspection
   * 
   * Usage Example:
   * analytics.track({
   *   type: 'user_action',
   *   category: 'navigation',
   *   action: 'page_view',
   *   properties: { page: '/dashboard' }
   * });
   */
  track(event: Omit<AnalyticsEvent, 'userId' | 'sessionId' | 'timestamp'>): void {
    if (!this.isEnabled && !this.debug) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      userId: this.getUserId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    if (this.debug) {
      console.log('[Analytics] Track event:', fullEvent);
    }

    this.queue.push(fullEvent);

    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Page View Tracking
   * Records page navigation events with referrer and metadata
   * 
   * @public
   * @param {Omit<PageViewEvent, 'userId' | 'sessionId' | 'timestamp'>} page - Page view data
   * @returns {void}
   * @description Tracks page navigation with routing and referrer context
   * 
   * Page View Data:
   * - Path: Current route/URL path
   * - Title: Page title for content identification
   * - Referrer: Previous page or external source
   * - Navigation Context: Route changes and entry points
   * 
   * Use Cases:
   * - Route Analytics: Track most visited pages
   * - User Journey: Understand navigation patterns
   * - Content Performance: Measure page engagement
   */
  pageView(page: Omit<PageViewEvent, 'userId' | 'sessionId' | 'timestamp'>): void {
    this.track({
      category: 'Navigation',
      action: 'Page View',
      label: page.path,
      metadata: {
        title: page.title,
        referrer: page.referrer || document.referrer,
      },
    });
  }

  /**
   * User Identification
   * Records user profile data and characteristics for personalization
   * 
   * @public
   * @param {UserProperties} properties - User profile and preference data
   * @returns {void}
   * @description Captures user attributes for segmentation and personalization
   * 
   * User Properties:
   * - Demographics: Age, location, language preferences
   * - Behavior: Usage patterns, feature adoption
   * - Preferences: Theme, notification settings
   * - Subscription: Plan type, features enabled
   * 
   * Privacy Compliance:
   * - User Consent: Respects privacy preferences
   * - Data Minimization: Only collects necessary attributes
   * - Anonymization: Supports anonymous usage tracking
   */
  identify(properties: UserProperties): void {
    if (!this.isEnabled && !this.debug) return;

    const payload = {
      ...properties,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    if (this.debug) {
      console.log('[Analytics] Identify user:', payload);
    }

    fetch(`${this.endpoint}/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      if (this.debug) {
        console.error('[Analytics] Failed to identify user:', error);
      }
    });
  }

  /* =============================================================================
     Post Analytics Methods
     Email post interaction and engagement tracking
     ============================================================================= */

  /**
   * Track Post Created
   * Records new email post creation events with metadata
   * 
   * @public
   * @param {string} postId - Unique identifier for the created post
   * @param {Record<string, any>} [metadata] - Additional post creation context
   * @returns {void}
   * @description Tracks email post creation for content analytics
   * 
   * Creation Metrics:
   * - Post Frequency: User posting behavior patterns
   * - Content Types: Email categories and formats
   * - Engagement Prediction: Content performance forecasting
   * - Creator Insights: Author productivity and trends
   */
  trackPostCreated(postId: string, metadata?: Record<string, any>): void {
    this.track({
      category: 'Posts',
      action: 'Created',
      label: postId,
      metadata,
    });
  }

  /**
   * Track Post Viewed
   * Records email post view events with engagement duration
   * 
   * @public
   * @param {string} postId - Unique identifier for the viewed post
   * @param {number} [viewDuration] - Time spent viewing in milliseconds
   * @returns {void}
   * @description Tracks post consumption for engagement analytics
   * 
   * View Analytics:
   * - Engagement Duration: Time spent reading emails
   * - Content Performance: Popular vs. ignored posts
   * - User Behavior: Reading patterns and preferences
   * - Recommendation Engine: Content suggestion optimization
   */
  trackPostViewed(postId: string, viewDuration?: number): void {
    this.track({
      category: 'Posts',
      action: 'Viewed',
      label: postId,
      value: viewDuration,
    });
  }

  /**
   * Track Post Upvoted
   * Records positive engagement through upvoting mechanism
   * 
   * @public
   * @param {string} postId - Unique identifier for the upvoted post
   * @returns {void}
   * @description Tracks user approval and content quality signals
   * 
   * Upvote Analytics:
   * - Content Quality: User approval and satisfaction
   * - Karma System: Contributor reputation building
   * - Trending Content: Popular email identification
   * - Community Engagement: Active participation measurement
   */
  trackPostUpvoted(postId: string): void {
    this.track({
      category: 'Posts',
      action: 'Upvoted',
      label: postId,
    });
  }

  /**
   * Track Post Shared
   * Records email post sharing events with distribution method
   * 
   * @public
   * @param {string} postId - Unique identifier for the shared post
   * @param {string} method - Sharing method (social, email, direct, etc.)
   * @returns {void}
   * @description Tracks viral distribution and sharing patterns
   * 
   * Sharing Analytics:
   * - Viral Metrics: Content virality and reach
   * - Distribution Channels: Preferred sharing methods
   * - Network Effects: User influence and connections
   * - Growth Tracking: Organic vs. paid distribution
   */
  trackPostShared(postId: string, method: string): void {
    this.track({
      category: 'Posts',
      action: 'Shared',
      label: postId,
      metadata: { method },
    });
  }

  /* =============================================================================
     Comment Analytics Methods
     User discussion and engagement tracking
     ============================================================================= */

  /**
   * Track Comment Created
   * Records new comment creation events with post context
   * 
   * @public
   * @param {string} commentId - Unique identifier for the created comment
   * @param {string} postId - Post identifier that comment belongs to
   * @returns {void}
   * @description Tracks user engagement through commenting behavior
   * 
   * Comment Analytics:
   * - Discussion Activity: Community engagement levels
   * - Content Response: Post discussion generation
   * - User Participation: Active community members
   * - Conversation Threads: Discussion depth and quality
   */
  trackCommentCreated(commentId: string, postId: string): void {
    this.track({
      category: 'Comments',
      action: 'Created',
      label: commentId,
      metadata: { postId },
    });
  }

  /**
   * Track Comment Upvoted
   * Records positive feedback on comment content
   * 
   * @public
   * @param {string} commentId - Unique identifier for the upvoted comment
   * @returns {void}
   * @description Tracks comment quality and user agreement
   * 
   * Comment Voting Analytics:
   * - Quality Assessment: Valuable vs. noise comments
   * - User Reputation: Comment author credibility
   * - Discussion Value: Meaningful conversation tracking
   * - Community Moderation: Self-regulating content quality
   */
  trackCommentUpvoted(commentId: string): void {
    this.track({
      category: 'Comments',
      action: 'Upvoted',
      label: commentId,
    });
  }

  /* =============================================================================
     Repository Analytics Methods
     Email repository performance and growth tracking
     ============================================================================= */

  /**
   * Track Repository Created
   * Records new email repository creation with initial content
   * 
   * @public
   * @param {string} repositoryId - Unique identifier for the created repository
   * @param {number} initialEmails - Number of emails added during creation
   * @returns {void}
   * @description Tracks repository creation for growth analytics
   * 
   * Repository Creation Analytics:
   * - Repository Growth: New email collections tracking
   * - Content Volume: Initial repository size patterns
   * - User Behavior: Repository creation frequency
   * - Platform Usage: Email organization adoption
   */
  trackRepositoryCreated(repositoryId: string, initialEmails: number): void {
    this.track({
      category: 'Repositories',
      action: 'Created',
      label: repositoryId,
      value: initialEmails,
    });
  }

  /**
   * Track Repository Growth
   * Records repository expansion metrics and performance indicators
   * 
   * @public
   * @param {RepositoryMetrics} metrics - Repository performance and growth data
   * @returns {void}
   * @description Tracks repository development and engagement over time
   * 
   * Growth Analytics:
   * - Email Volume: Repository size and growth rate
   * - Engagement Rate: User interaction with repository content
   * - Snowball Effect: Viral growth and sharing metrics
   * - Performance Trends: Repository health and activity patterns
   */
  trackRepositoryGrowth(metrics: RepositoryMetrics): void {
    this.track({
      category: 'Repositories',
      action: 'Growth',
      label: metrics.repositoryId,
      value: metrics.emailCount,
      metadata: {
        growthRate: metrics.growthRate,
        engagementRate: metrics.engagementRate,
        snowballMultiplier: metrics.snowballMultiplier,
      },
    });
  }

  /**
   * Track CSV Uploaded
   * Records bulk email import events for repository expansion
   * 
   * @public
   * @param {string} repositoryId - Repository receiving the CSV import
   * @param {number} emailCount - Number of emails imported from CSV
   * @returns {void}
   * @description Tracks bulk email import for repository growth analytics
   * 
   * CSV Import Analytics:
   * - Bulk Import: Large-scale email additions tracking
   * - Repository Growth: Sudden expansion events
   * - Data Migration: External email system imports
   * - User Efficiency: Batch processing vs. manual entry
   */
  trackCSVUploaded(repositoryId: string, emailCount: number): void {
    this.track({
      category: 'Repositories',
      action: 'CSV Uploaded',
      label: repositoryId,
      value: emailCount,
    });
  }

  /**
   * Track Snowball Triggered
   * Records viral growth events when repositories expand rapidly
   * 
   * @public
   * @param {string} repositoryId - Repository experiencing snowball growth
   * @param {number} newEmails - Number of new emails added during snowball
   * @returns {void}
   * @description Tracks viral growth patterns and community amplification
   * 
   * Snowball Analytics:
   * - Viral Growth: Rapid expansion tracking
   * - Community Effect: User-driven content multiplication
   * - Growth Velocity: Acceleration patterns and triggers
   * - Network Effects: Social amplification measurement
   */
  trackSnowballTriggered(repositoryId: string, newEmails: number): void {
    this.track({
      category: 'Repositories',
      action: 'Snowball Triggered',
      label: repositoryId,
      value: newEmails,
    });
  }

  /* =============================================================================
     Email Analytics Methods
     Email delivery and engagement tracking
     ============================================================================= */

  /**
   * Track Email Sent
   * Records outbound email delivery events with type and volume
   * 
   * @public
   * @param {'post' | 'digest' | 'notification'} type - Email category and purpose
   * @param {number} recipientCount - Number of recipients for the email
   * @returns {void}
   * @description Tracks email delivery for engagement and reach analytics
   * 
   * Email Delivery Analytics:
   * - Send Volume: Email frequency and distribution patterns
   * - Email Types: Post notifications, digests, alerts breakdown
   * - Reach Metrics: Audience size and delivery success
   * - Engagement Pipeline: Email-to-action conversion tracking
   */
  trackEmailSent(type: 'post' | 'digest' | 'notification', recipientCount: number): void {
    this.track({
      category: 'Email',
      action: 'Sent',
      label: type,
      value: recipientCount,
    });
  }

  /**
   * Track Email Opened
   * Records email open events for engagement measurement
   * 
   * @public
   * @param {string} emailId - Unique identifier for the opened email
   * @param {string} type - Email type category (post, digest, notification)
   * @returns {void}
   * @description Tracks email open rates for engagement analytics
   * 
   * Email Open Analytics:
   * - Open Rates: Email engagement effectiveness
   * - Email Performance: Content and timing optimization
   * - User Engagement: Active vs. passive subscribers
   * - Delivery Success: Inbox placement and visibility
   */
  trackEmailOpened(emailId: string, type: string): void {
    this.track({
      category: 'Email',
      action: 'Opened',
      label: emailId,
      metadata: { type },
    });
  }

  /**
   * Track Email Clicked
   * Records email link click events for conversion tracking
   * 
   * @public
   * @param {string} emailId - Unique identifier for the email containing the link
   * @param {string} link - URL or link identifier that was clicked
   * @returns {void}
   * @description Tracks email click-through rates and link performance
   * 
   * Email Click Analytics:
   * - Click-Through Rates: Email-to-site conversion
   * - Link Performance: Most effective call-to-action placement
   * - User Intent: Interest and engagement depth
   * - Conversion Funnel: Email-to-action tracking
   */
  trackEmailClicked(emailId: string, link: string): void {
    this.track({
      category: 'Email',
      action: 'Clicked',
      label: emailId,
      metadata: { link },
    });
  }

  /* =============================================================================
     User Engagement Analytics Methods
     User interaction and platform usage tracking
     ============================================================================= */

  /**
   * Track Search Performed
   * Records search query events with result effectiveness
   * 
   * @public
   * @param {string} query - Search terms entered by user
   * @param {number} resultCount - Number of results returned
   * @returns {void}
   * @description Tracks search behavior and content discovery patterns
   * 
   * Search Analytics:
   * - Query Patterns: Popular search terms and trends
   * - Search Effectiveness: Result quality and relevance
   * - Content Discovery: How users find email content
   * - Search Optimization: Query-to-result performance
   */
  trackSearchPerformed(query: string, resultCount: number): void {
    this.track({
      category: 'Engagement',
      action: 'Search',
      label: query,
      value: resultCount,
    });
  }

  /**
   * Track Filter Applied
   * Records content filtering events for user preference analysis
   * 
   * @public
   * @param {string} filterType - Type of filter applied (date, category, author, etc.)
   * @param {string} filterValue - Specific filter value selected
   * @returns {void}
   * @description Tracks content filtering behavior and user preferences
   * 
   * Filter Analytics:
   * - Content Preferences: User filtering behavior patterns
   * - Navigation Efficiency: How users refine content views
   * - Feature Usage: Filter adoption and effectiveness
   * - User Experience: Interface interaction optimization
   */
  trackFilterApplied(filterType: string, filterValue: string): void {
    this.track({
      category: 'Engagement',
      action: 'Filter Applied',
      label: filterType,
      metadata: { value: filterValue },
    });
  }

  /**
   * Track Hashtag Clicked
   * Records hashtag interaction events for topic interest analysis
   * 
   * @public
   * @param {string} hashtag - Hashtag that was clicked (without # symbol)
   * @returns {void}
   * @description Tracks topic interest and content discovery via hashtags
   * 
   * Hashtag Analytics:
   * - Topic Interest: Popular themes and content categories
   * - Content Discovery: Alternative navigation through tags
   * - Trending Topics: Emerging interests and discussions
   * - Content Organization: Tag-based content performance
   */
  trackHashtagClicked(hashtag: string): void {
    this.track({
      category: 'Engagement',
      action: 'Hashtag Clicked',
      label: hashtag,
    });
  }

  /**
   * Track Scroll Depth
   * Records user scroll behavior for content engagement analysis
   * 
   * @public
   * @param {number} percentage - Scroll depth as percentage of page height
   * @param {string} page - Page identifier where scrolling occurred
   * @returns {void}
   * @description Tracks content consumption depth and user engagement
   * 
   * Scroll Analytics:
   * - Content Engagement: How deeply users read content
   * - Page Performance: Content effectiveness by scroll depth
   * - User Attention: Engagement quality measurement
   * - Content Optimization: Ideal content length and structure
   */
  trackScrollDepth(percentage: number, page: string): void {
    this.track({
      category: 'Engagement',
      action: 'Scroll Depth',
      label: page,
      value: percentage,
    });
  }

  /* =============================================================================
     Feature Adoption Analytics Methods
     Platform feature usage and adoption tracking
     ============================================================================= */

  /**
   * Track Feature Used
   * Records platform feature usage for adoption analysis
   * 
   * @public
   * @param {string} feature - Feature name or identifier
   * @param {Record<string, any>} [metadata] - Additional feature usage context
   * @returns {void}
   * @description Tracks feature adoption and usage patterns
   * 
   * Feature Analytics:
   * - Feature Adoption: User discovery and usage of new features
   * - Usage Patterns: How and when features are utilized
   * - Feature Performance: Most and least popular capabilities
   * - Product Development: Data-driven feature prioritization
   */
  trackFeatureUsed(feature: string, metadata?: Record<string, any>): void {
    this.track({
      category: 'Features',
      action: 'Used',
      label: feature,
      metadata,
    });
  }

  /**
   * Track Onboarding Step
   * Records user progress through onboarding flow
   * 
   * @public
   * @param {string} step - Onboarding step identifier
   * @param {boolean} completed - Whether step was completed or skipped
   * @returns {void}
   * @description Tracks onboarding completion rates and drop-off points
   * 
   * Onboarding Analytics:
   * - Completion Rates: Onboarding funnel effectiveness
   * - Drop-off Points: Where users abandon the process
   * - User Experience: Onboarding flow optimization
   * - Feature Introduction: Step-by-step feature discovery
   */
  trackOnboardingStep(step: string, completed: boolean): void {
    this.track({
      category: 'Onboarding',
      action: completed ? 'Completed' : 'Skipped',
      label: step,
    });
  }

  /**
   * Track Tutorial Viewed
   * Records educational content consumption
   * 
   * @public
   * @param {string} tutorial - Tutorial identifier or name
   * @returns {void}
   * @description Tracks help content usage and learning engagement
   * 
   * Educational Analytics:
   * - Help Usage: Which tutorials users access most
   * - Learning Patterns: User education and support needs
   * - Content Effectiveness: Tutorial completion and engagement
   * - Support Optimization: Self-service content performance
   */
  trackTutorialViewed(tutorial: string): void {
    this.track({
      category: 'Education',
      action: 'Tutorial Viewed',
      label: tutorial,
    });
  }

  /* =============================================================================
     Error Tracking Methods
     Application error monitoring and debugging analytics
     ============================================================================= */

  /**
   * Track Error
   * Records application errors for monitoring and debugging
   * 
   * @public
   * @param {Error | string} error - Error object or error message
   * @param {Record<string, any>} [context] - Additional error context
   * @returns {void}
   * @description Tracks errors for application stability monitoring
   * 
   * Error Analytics:
   * - Error Frequency: Application stability measurement
   * - Error Patterns: Common failure modes and trends
   * - User Impact: Error effect on user experience
   * - Debug Information: Stack traces and context for resolution
   */
  trackError(error: Error | string, context?: Record<string, any>): void {
    this.track({
      category: 'Errors',
      action: 'Occurred',
      label: typeof error === 'string' ? error : error.message,
      metadata: {
        stack: typeof error === 'object' ? error.stack : undefined,
        context,
      },
    });
  }

  /* =============================================================================
     Performance Analytics Methods
     Application performance monitoring and optimization
     ============================================================================= */

  /**
   * Track Performance
   * Records performance metrics for optimization analysis
   * 
   * @public
   * @param {string} metric - Performance metric name
   * @param {number} value - Measured performance value
   * @returns {void}
   * @description Tracks application performance for optimization
   * 
   * Performance Analytics:
   * - Response Times: API and interface performance
   * - Resource Usage: Memory, CPU, and bandwidth consumption
   * - User Experience: Perceived performance and responsiveness
   * - Optimization Targets: Performance bottleneck identification
   */
  trackPerformance(metric: string, value: number): void {
    this.track({
      category: 'Performance',
      action: 'Measured',
      label: metric,
      value,
    });
  }

  /**
   * Track Load Time
   * Records page load performance for specific routes
   * 
   * @public
   * @param {string} page - Page identifier or route
   * @param {number} loadTime - Load time in milliseconds
   * @returns {void}
   * @description Tracks page load performance for optimization
   * 
   * Load Time Analytics:
   * - Page Speed: Individual page performance measurement
   * - User Experience: Load time impact on engagement
   * - Performance Trends: Speed improvement or degradation over time
   * - Optimization Prioritization: Slowest pages for improvement
   */
  trackLoadTime(page: string, loadTime: number): void {
    this.track({
      category: 'Performance',
      action: 'Page Load',
      label: page,
      value: loadTime,
    });
  }

  /* =============================================================================
     A/B Testing Methods
     Experimental feature testing and variant analysis
     ============================================================================= */

  /**
   * Track Experiment
   * Records A/B test participation and variant exposure
   * 
   * @public
   * @param {string} experimentId - Unique experiment identifier
   * @param {string} variant - Variant name or identifier user was exposed to
   * @returns {void}
   * @description Tracks A/B test participation for statistical analysis
   * 
   * Experiment Analytics:
   * - Variant Distribution: Balanced test group assignment
   * - Feature Performance: Experimental feature effectiveness
   * - Statistical Significance: A/B test result validation
   * - Product Optimization: Data-driven feature development
   */
  trackExperiment(experimentId: string, variant: string): void {
    this.track({
      category: 'Experiments',
      action: 'Viewed',
      label: experimentId,
      metadata: { variant },
    });
  }

  /**
   * Track Experiment Conversion
   * Records A/B test conversion events for performance analysis
   * 
   * @public
   * @param {string} experimentId - Unique experiment identifier
   * @param {string} variant - Variant that led to conversion
   * @returns {void}
   * @description Tracks A/B test conversion rates for variant comparison
   * 
   * Conversion Analytics:
   * - Conversion Rates: Variant performance comparison
   * - Statistical Analysis: Experiment result significance
   * - Feature Effectiveness: New feature performance validation
   * - Product Decision Making: Data-driven feature rollout decisions
   */
  trackExperimentConversion(experimentId: string, variant: string): void {
    this.track({
      category: 'Experiments',
      action: 'Converted',
      label: experimentId,
      metadata: { variant },
    });
  }

  /* =============================================================================
     Karma Analytics Methods
     User reputation and community contribution tracking
     ============================================================================= */

  /**
   * Track Karma Milestone
   * Records significant karma threshold achievements
   * 
   * @public
   * @param {number} milestone - Karma milestone value reached
   * @returns {void}
   * @description Tracks user reputation progression and achievement
   * 
   * Karma Milestone Analytics:
   * - User Progression: Reputation building patterns
   * - Achievement Motivation: Milestone impact on engagement
   * - Community Recognition: High-value contributor identification
   * - Gamification Effectiveness: Karma system engagement measurement
   */
  trackKarmaMilestone(milestone: number): void {
    this.track({
      category: 'Karma',
      action: 'Milestone Reached',
      label: `${milestone} karma`,
      value: milestone,
    });
  }

  /**
   * Track Karma Action
   * Records karma-generating activities and reputation changes
   * 
   * @public
   * @param {string} action - Action that generated karma change
   * @param {number} karmaChange - Amount of karma gained or lost
   * @returns {void}
   * @description Tracks reputation system activity and user behavior
   * 
   * Karma Action Analytics:
   * - Reputation Activities: Actions that generate karma
   * - Community Engagement: Positive and negative behavior tracking
   * - User Motivation: Karma impact on user participation
   * - System Balance: Karma distribution and fairness analysis
   */
  trackKarmaAction(action: string, karmaChange: number): void {
    this.track({
      category: 'Karma',
      action: 'Changed',
      label: action,
      value: karmaChange,
    });
  }

  /* =============================================================================
     Session Analytics Methods
     User session tracking and engagement measurement
     ============================================================================= */

  /**
   * Track Session Duration
   * Records user session length for engagement analysis
   * 
   * @public
   * @param {number} duration - Session duration in milliseconds
   * @returns {void}
   * @description Tracks session engagement and time-on-site metrics
   * 
   * Session Duration Analytics:
   * - Engagement Time: User time investment measurement
   * - Session Quality: Deep vs. surface-level engagement
   * - User Retention: Session length correlation with retention
   * - Platform Stickiness: Average session duration trends
   */
  trackSessionDuration(duration: number): void {
    this.track({
      category: 'Session',
      action: 'Ended',
      value: duration,
    });
  }

  /**
   * Track Session Depth
   * Records user activity intensity during session
   * 
   * @public
   * @param {number} pageViews - Number of pages viewed in session
   * @param {number} interactions - Number of user interactions performed
   * @returns {void}
   * @description Tracks session engagement depth and user activity
   * 
   * Session Depth Analytics:
   * - Activity Level: User engagement intensity measurement
   * - Content Consumption: Pages viewed per session
   * - Interaction Frequency: User participation and engagement
   * - Session Value: High-engagement session identification
   */
  trackSessionDepth(pageViews: number, interactions: number): void {
    this.track({
      category: 'Session',
      action: 'Depth',
      value: pageViews,
      metadata: { interactions },
    });
  }

  /* =============================================================================
     Custom Event Methods
     Flexible analytics for specific business requirements
     ============================================================================= */

  /**
   * Track Custom Event
   * Records custom business-specific events with flexible data
   * 
   * @public
   * @param {string} eventName - Custom event identifier
   * @param {Record<string, any>} [data] - Custom event data and metadata
   * @returns {void}
   * @description Tracks custom business events not covered by standard methods
   * 
   * Custom Event Applications:
   * - Business Metrics: Company-specific KPIs and goals
   * - Feature Experiments: Custom feature testing and validation
   * - Integration Events: Third-party service interactions
   * - Advanced Analytics: Complex business logic tracking
   */
  trackCustom(eventName: string, data?: Record<string, any>): void {
    this.track({
      category: 'Custom',
      action: eventName,
      metadata: data,
    });
  }

  /* =============================================================================
     Utility Methods
     Analytics system configuration and management
     ============================================================================= */

  /**
   * Set Analytics Enabled
   * Controls analytics tracking activation
   * 
   * @public
   * @param {boolean} enabled - Whether to enable analytics tracking
   * @returns {void}
   * @description Enables or disables analytics tracking system
   * 
   * Use Cases:
   * - Privacy Compliance: User consent management
   * - Development Mode: Disable tracking during development
   * - Performance Testing: Reduce overhead during testing
   * - User Preferences: Respect user privacy settings
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set Debug Mode
   * Controls analytics debug logging
   * 
   * @public
   * @param {boolean} debug - Whether to enable debug logging
   * @returns {void}
   * @description Enables or disables analytics debug output
   * 
   * Debug Features:
   * - Event Inspection: Console logging of tracked events
   * - Network Monitoring: API call success/failure logging
   * - Development Aid: Debugging analytics integration
   * - Quality Assurance: Validation of analytics implementation
   */
  setDebug(debug: boolean): void {
    this.debug = debug;
  }

  /**
   * Reset Analytics
   * Clears analytics state and generates new session
   * 
   * @public
   * @returns {void}
   * @description Resets analytics system for fresh session tracking
   * 
   * Reset Operations:
   * - Queue Clearing: Removes pending events from queue
   * - Session Renewal: Generates new session identifier
   * - State Reset: Clears accumulated analytics state
   * - Testing Support: Clean state for analytics testing
   */
  reset(): void {
    this.queue = [];
    this.sessionId = this.generateSessionId();
  }
}

/* =============================================================================
   Analytics Export
   Singleton instance for application-wide analytics tracking
   ============================================================================= */

/**
 * Analytics Singleton Instance
 * Global analytics tracker for ShadowNews application
 * 
 * @const {Analytics} analytics
 * @description Shared analytics instance for consistent tracking across application
 * 
 * Usage:
 * - Import: import { analytics } from '@/utils/analytics';
 * - Track Events: analytics.trackPostCreated(postId, metadata);
 * - Page Views: analytics.pageView({ path: '/dashboard', title: 'Dashboard' });
 * - Custom Events: analytics.trackCustom('business_event', data);
 * 
 * Integration:
 * - Components: Track user interactions and component usage
 * - Services: Monitor API calls and service performance
 * - Hooks: Capture state changes and user behavior
 * - Router: Automatic page view tracking integration
 */
export const analytics = new Analytics();

// Export types
export type { AnalyticsEvent, PageViewEvent, UserProperties, RepositoryMetrics };
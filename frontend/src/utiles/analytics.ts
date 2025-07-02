import { store } from '../store/store';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
}

interface UserProperties {
  userId: string;
  email?: string;
  karma?: number;
  repositoryCount?: number;
  joinDate?: Date;
  isPremium?: boolean;
  emailVerified?: boolean;
  preferredTopics?: string[];
}

interface RepositoryMetrics {
  repositoryId: string;
  emailCount: number;
  growthRate: number;
  engagementRate: number;
  snowballMultiplier: number;
}

class Analytics {
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: number = 5000;
  private maxQueueSize: number = 50;
  private endpoint: string = process.env.REACT_APP_ANALYTICS_ENDPOINT || '/api/analytics';
  private isEnabled: boolean = process.env.NODE_ENV === 'production';
  private debug: boolean = process.env.REACT_APP_ANALYTICS_DEBUG === 'true';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startQueueProcessor();
    this.attachGlobalListeners();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startQueueProcessor(): void {
    if (!this.isEnabled) return;

    setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

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

  private getUserId(): string | undefined {
    const state = store.getState();
    return state.auth?.user?.id;
  }

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

  // Post Analytics
  trackPostCreated(postId: string, metadata?: Record<string, any>): void {
    this.track({
      category: 'Posts',
      action: 'Created',
      label: postId,
      metadata,
    });
  }

  trackPostViewed(postId: string, viewDuration?: number): void {
    this.track({
      category: 'Posts',
      action: 'Viewed',
      label: postId,
      value: viewDuration,
    });
  }

  trackPostUpvoted(postId: string): void {
    this.track({
      category: 'Posts',
      action: 'Upvoted',
      label: postId,
    });
  }

  trackPostShared(postId: string, method: string): void {
    this.track({
      category: 'Posts',
      action: 'Shared',
      label: postId,
      metadata: { method },
    });
  }

  // Comment Analytics
  trackCommentCreated(commentId: string, postId: string): void {
    this.track({
      category: 'Comments',
      action: 'Created',
      label: commentId,
      metadata: { postId },
    });
  }

  trackCommentUpvoted(commentId: string): void {
    this.track({
      category: 'Comments',
      action: 'Upvoted',
      label: commentId,
    });
  }

  // Repository Analytics
  trackRepositoryCreated(repositoryId: string, initialEmails: number): void {
    this.track({
      category: 'Repositories',
      action: 'Created',
      label: repositoryId,
      value: initialEmails,
    });
  }

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

  trackCSVUploaded(repositoryId: string, emailCount: number): void {
    this.track({
      category: 'Repositories',
      action: 'CSV Uploaded',
      label: repositoryId,
      value: emailCount,
    });
  }

  trackSnowballTriggered(repositoryId: string, newEmails: number): void {
    this.track({
      category: 'Repositories',
      action: 'Snowball Triggered',
      label: repositoryId,
      value: newEmails,
    });
  }

  // Email Analytics
  trackEmailSent(type: 'post' | 'digest' | 'notification', recipientCount: number): void {
    this.track({
      category: 'Email',
      action: 'Sent',
      label: type,
      value: recipientCount,
    });
  }

  trackEmailOpened(emailId: string, type: string): void {
    this.track({
      category: 'Email',
      action: 'Opened',
      label: emailId,
      metadata: { type },
    });
  }

  trackEmailClicked(emailId: string, link: string): void {
    this.track({
      category: 'Email',
      action: 'Clicked',
      label: emailId,
      metadata: { link },
    });
  }

  // User Engagement Analytics
  trackSearchPerformed(query: string, resultCount: number): void {
    this.track({
      category: 'Engagement',
      action: 'Search',
      label: query,
      value: resultCount,
    });
  }

  trackFilterApplied(filterType: string, filterValue: string): void {
    this.track({
      category: 'Engagement',
      action: 'Filter Applied',
      label: filterType,
      metadata: { value: filterValue },
    });
  }

  trackHashtagClicked(hashtag: string): void {
    this.track({
      category: 'Engagement',
      action: 'Hashtag Clicked',
      label: hashtag,
    });
  }

  trackScrollDepth(percentage: number, page: string): void {
    this.track({
      category: 'Engagement',
      action: 'Scroll Depth',
      label: page,
      value: percentage,
    });
  }

  // Feature Adoption Analytics
  trackFeatureUsed(feature: string, metadata?: Record<string, any>): void {
    this.track({
      category: 'Features',
      action: 'Used',
      label: feature,
      metadata,
    });
  }

  trackOnboardingStep(step: string, completed: boolean): void {
    this.track({
      category: 'Onboarding',
      action: completed ? 'Completed' : 'Skipped',
      label: step,
    });
  }

  trackTutorialViewed(tutorial: string): void {
    this.track({
      category: 'Education',
      action: 'Tutorial Viewed',
      label: tutorial,
    });
  }

  // Error Tracking
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

  // Performance Analytics
  trackPerformance(metric: string, value: number): void {
    this.track({
      category: 'Performance',
      action: 'Measured',
      label: metric,
      value,
    });
  }

  trackLoadTime(page: string, loadTime: number): void {
    this.track({
      category: 'Performance',
      action: 'Page Load',
      label: page,
      value: loadTime,
    });
  }

  // A/B Testing
  trackExperiment(experimentId: string, variant: string): void {
    this.track({
      category: 'Experiments',
      action: 'Viewed',
      label: experimentId,
      metadata: { variant },
    });
  }

  trackExperimentConversion(experimentId: string, variant: string): void {
    this.track({
      category: 'Experiments',
      action: 'Converted',
      label: experimentId,
      metadata: { variant },
    });
  }

  // Karma Analytics
  trackKarmaMilestone(milestone: number): void {
    this.track({
      category: 'Karma',
      action: 'Milestone Reached',
      label: `${milestone} karma`,
      value: milestone,
    });
  }

  trackKarmaAction(action: string, karmaChange: number): void {
    this.track({
      category: 'Karma',
      action: 'Changed',
      label: action,
      value: karmaChange,
    });
  }

  // Session Analytics
  trackSessionDuration(duration: number): void {
    this.track({
      category: 'Session',
      action: 'Ended',
      value: duration,
    });
  }

  trackSessionDepth(pageViews: number, interactions: number): void {
    this.track({
      category: 'Session',
      action: 'Depth',
      value: pageViews,
      metadata: { interactions },
    });
  }

  // Custom Events
  trackCustom(eventName: string, data?: Record<string, any>): void {
    this.track({
      category: 'Custom',
      action: eventName,
      metadata: data,
    });
  }

  // Utility Methods
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setDebug(debug: boolean): void {
    this.debug = debug;
  }

  reset(): void {
    this.queue = [];
    this.sessionId = this.generateSessionId();
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export types
export type { AnalyticsEvent, PageViewEvent, UserProperties, RepositoryMetrics };
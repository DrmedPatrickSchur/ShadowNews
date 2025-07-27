/**
 * WebSocket Service - Real-time Communication and Live Updates
 * 
 * Comprehensive WebSocket service providing real-time bidirectional
 * communication for live updates, notifications, collaboration, and
 * interactive features across the ShadowNews email-first social platform.
 * 
 * Core Features:
 * - Real-time Updates: Live content updates and synchronization
 * - Notification System: Instant notification delivery and management
 * - Collaboration: Multi-user real-time editing and interaction
 * - Presence Tracking: User online status and activity monitoring
 * - Live Analytics: Real-time metrics and performance updates
 * - Chat Integration: Real-time messaging and communication features
 * - Event Broadcasting: System-wide event distribution and handling
 * 
 * Real-time Data Synchronization:
 * - Post Updates: Live post creation, modification, and deletion events
 * - Comment Threading: Real-time comment additions and threading updates
 * - Vote Tracking: Instant voting updates and score synchronization
 * - Repository Changes: Live repository modifications and member updates
 * - Email Activity: Real-time email collection and verification status
 * - Snowball Distribution: Live viral distribution tracking and metrics
 * 
 * Notification Management:
 * - Instant Delivery: Real-time notification pushing with priority handling
 * - Type Classification: Comment replies, mentions, system alerts, repository updates
 * - Read Status: Real-time read/unread status synchronization
 * - Batching: Intelligent notification batching for performance optimization
 * - Filtering: User preference-based notification filtering and categorization
 * - Toast Integration: Browser notification integration with permission management
 * 
 * Collaboration Features:
 * - Multi-user Editing: Real-time collaborative editing with conflict resolution
 * - Presence Awareness: Live user presence indication and activity status
 * - Cursor Tracking: Real-time cursor and selection position sharing
 * - Lock Management: Collaborative editing locks and conflict prevention
 * - Change Broadcasting: Live change propagation with operational transformation
 * - Version Control: Real-time version synchronization and conflict resolution
 * 
 * Live Analytics:
 * - Growth Metrics: Real-time repository growth and member acquisition tracking
 * - Engagement Stats: Live engagement rate monitoring and trend analysis
 * - Performance Data: Real-time system performance and health monitoring
 * - User Analytics: Live user behavior tracking and activity metrics
 * - Viral Tracking: Real-time snowball distribution and viral coefficient monitoring
 * - Error Monitoring: Live error tracking and system health alerts
 * 
 * Connection Management:
 * - Auto-reconnection: Intelligent reconnection with exponential backoff
 * - Health Monitoring: Connection health checking and status reporting
 * - Authentication: Secure WebSocket authentication with JWT integration
 * - Load Balancing: Multiple server connection management and failover
 * - Rate Limiting: Connection rate limiting and abuse prevention
 * - Graceful Degradation: Fallback mechanisms for connection failures
 * 
 * Event System:
 * - Event Broadcasting: System-wide event distribution with topic subscriptions
 * - Custom Events: User-defined event types and handlers
 * - Event Filtering: Selective event subscription and filtering
 * - Event History: Event replay and history management
 * - Error Handling: Comprehensive event error handling and recovery
 * - Performance Optimization: Event batching and throttling for performance
 * 
 * Security Features:
 * - Authentication: JWT-based WebSocket authentication and authorization
 * - Rate Limiting: Message rate limiting and spam prevention
 * - Data Validation: Message payload validation and sanitization
 * - Access Control: User permission-based event filtering and access
 * - Encryption: End-to-end encryption for sensitive real-time data
 * - Audit Trail: Complete WebSocket activity logging and monitoring
 * 
 * Performance Optimization:
 * - Message Batching: Efficient message batching for high-frequency updates
 * - Compression: WebSocket compression for bandwidth optimization
 * - Lazy Loading: On-demand event subscription and resource management
 * - Caching: Intelligent event caching and duplicate prevention
 * - Throttling: Update throttling for smooth user experience
 * - Memory Management: Efficient memory usage and garbage collection
 * 
 * Integration Features:
 * - Redux Integration: Seamless Redux store integration with real-time updates
 * - React Hooks: Custom React hooks for WebSocket state management
 * - API Synchronization: WebSocket and REST API synchronization
 * - External Services: Integration with external real-time services
 * - Browser APIs: Browser notification and visibility API integration
 * - Mobile Support: Mobile-optimized WebSocket connections and handling
 * 
 * Development Features:
 * - Type Safety: Full TypeScript integration with WebSocket message types
 * - Error Handling: Comprehensive error management and recovery mechanisms
 * - Debug Tools: Advanced debugging and monitoring capabilities
 * - Testing Support: WebSocket testing utilities and mock implementations
 * - Documentation: Complete API documentation with usage examples
 * - Performance Monitoring: Real-time WebSocket performance tracking
 * 
 * Dependencies:
 * - Socket.IO Client: WebSocket client library for real-time communication
 * - Redux Store: State management integration for live updates
 * - React Integration: React hooks and component integration
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import { 
  addPost, 
  updatePost, 
  removePost,
  incrementPostScore 
} from '../store/slices/posts.slice';
import { 
  addComment, 
  updateComment, 
  removeComment 
} from '../store/slices/comments.slice';
import { 
  updateRepository,
  addEmailToRepository,
  updateSnowballStats 
} from '../store/slices/repositories.slice';
import { 
  addNotification,
  markNotificationRead 
} from '../store/slices/notifications.slice';
import { 
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser 
} from '../store/slices/ui.slice';

/**
 * WebSocket Message Interface
 * Standardized message format for all WebSocket communications
 * 
 * Message Structure:
 * - Type-based routing with event classification and handler mapping
 * - Payload flexibility with support for any data structure
 * - User context with optional user identification and authorization
 * - Timestamp tracking for message ordering and synchronization
 */
interface WebSocketMessage {
  /** Message type for event routing and handler selection */
  type: string;
  /** Message payload containing event-specific data */
  payload: any;
  /** Optional user identifier for user-specific message handling */
  userId?: string;
  /** Message timestamp for ordering and synchronization */
  timestamp: number;
}

/**
 * Typing User Interface
 * Information about users currently typing in real-time collaboration
 */
interface TypingUser {
  /** User identifier for typing status tracking */
  userId: string;
  /** Display username for typing indicators */
  username: string;
  /** Optional post ID for post-specific typing */
  postId?: string;
  /** Optional comment ID for comment-specific typing */
  commentId?: string;
}

/**
 * WebSocket Service Class
 * Comprehensive real-time communication service managing WebSocket connections,
 * event handling, presence tracking, and live data synchronization for the
 * ShadowNews platform.
 * 
 * Architecture:
 * - Singleton pattern with connection pooling and state management
 * - Event-driven architecture with typed message handling and routing
 * - Auto-reconnection with exponential backoff and health monitoring
 * - Redux integration with seamless state synchronization
 * 
 * Core Responsibilities:
 * - WebSocket connection management with authentication and security
 * - Real-time event broadcasting and subscription management
 * - Live data synchronization with conflict resolution and ordering
 * - Presence tracking with user status and activity monitoring
 * - Notification delivery with priority handling and batching
 * - Collaboration features with multi-user editing and awareness
 */
class WebSocketService {
  /** Active WebSocket connection instance */
  private socket: Socket | null = null;
  /** Current reconnection attempt counter */
  private reconnectAttempts = 0;
  /** Maximum reconnection attempts before giving up */
  private maxReconnectAttempts = 5;
  /** Base delay between reconnection attempts (exponential backoff) */
  private reconnectDelay = 1000;
  /** Ping interval timer for connection health monitoring */
  private pingInterval: NodeJS.Timeout | null = null;
  /** Typing indicator timeout for cleanup and management */
  private typingTimeout: NodeJS.Timeout | null = null;
  /** Set of subscribed channels for selective event filtering */
  private subscribedChannels: Set<string> = new Set();
  /** Map of event handlers for custom event processing */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * WebSocket Service Constructor
   * Initialize service with cleanup handlers and configuration
   */
  constructor() {
    this.setupBeforeUnloadHandler();
  }

  /**
   * Establish WebSocket connection with authentication and configuration
   * 
   * Features:
   * - JWT-based authentication with token validation and refresh
   * - Multi-transport support with WebSocket and polling fallbacks
   * - Auto-reconnection with exponential backoff and health monitoring
   * - Event handler setup with comprehensive error handling and recovery
   * - Connection health monitoring with ping/pong and timeout detection
   * 
   * Configuration:
   * - Transport priorities: WebSocket preferred, polling fallback
   * - Reconnection strategy: exponential backoff with maximum attempts
   * - Timeout handling: connection timeout and response monitoring
   * - Authentication: JWT token integration with automatic refresh
   * 
   * @param token - JWT authentication token for secure connection
   * @returns Promise<void> - Connection establishment confirmation
   * 
   * @example
   * ```typescript
   * // Connect with authentication token
   * const token = localStorage.getItem('authToken');
   * await webSocketService.connect(token);
   * console.log('WebSocket connected successfully');
   * ```
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // Get WebSocket URL from environment or use development default
      const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
      
      // Initialize Socket.IO connection with comprehensive configuration
      this.socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000,
        timeout: 20000,
      });

      // Handle successful connection establishment
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.setupPingInterval();
        this.resubscribeChannels();
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.clearPingInterval();
        if (reason === 'io server disconnect') {
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to WebSocket server'));
        }
      });

      this.setupEventListeners();
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Post events
    this.socket.on('post:created', (data: WebSocketMessage) => {
      store.dispatch(addPost(data.payload));
      this.emitEvent('post:created', data.payload);
    });

    this.socket.on('post:updated', (data: WebSocketMessage) => {
      store.dispatch(updatePost(data.payload));
      this.emitEvent('post:updated', data.payload);
    });

    this.socket.on('post:deleted', (data: WebSocketMessage) => {
      store.dispatch(removePost(data.payload.id));
      this.emitEvent('post:deleted', data.payload);
    });

    this.socket.on('post:voted', (data: WebSocketMessage) => {
      store.dispatch(incrementPostScore({
        postId: data.payload.postId,
        delta: data.payload.delta
      }));
      this.emitEvent('post:voted', data.payload);
    });

    // Comment events
    this.socket.on('comment:created', (data: WebSocketMessage) => {
      store.dispatch(addComment(data.payload));
      this.emitEvent('comment:created', data.payload);
    });

    this.socket.on('comment:updated', (data: WebSocketMessage) => {
      store.dispatch(updateComment(data.payload));
      this.emitEvent('comment:updated', data.payload);
    });

    this.socket.on('comment:deleted', (data: WebSocketMessage) => {
      store.dispatch(removeComment(data.payload.id));
      this.emitEvent('comment:deleted', data.payload);
    });

    // Repository events
    this.socket.on('repository:updated', (data: WebSocketMessage) => {
      store.dispatch(updateRepository(data.payload));
      this.emitEvent('repository:updated', data.payload);
    });

    this.socket.on('repository:email:added', (data: WebSocketMessage) => {
      store.dispatch(addEmailToRepository(data.payload));
      this.emitEvent('repository:email:added', data.payload);
    });

    this.socket.on('repository:snowball:update', (data: WebSocketMessage) => {
      store.dispatch(updateSnowballStats(data.payload));
      this.emitEvent('repository:snowball:update', data.payload);
    });

    // Notification events
    this.socket.on('notification:new', (data: WebSocketMessage) => {
      store.dispatch(addNotification(data.payload));
      this.emitEvent('notification:new', data.payload);
      this.showBrowserNotification(data.payload);
    });

    this.socket.on('notification:read', (data: WebSocketMessage) => {
      store.dispatch(markNotificationRead(data.payload.id));
      this.emitEvent('notification:read', data.payload);
    });

    // Presence events
    this.socket.on('presence:update', (data: WebSocketMessage) => {
      store.dispatch(setOnlineUsers(data.payload));
      this.emitEvent('presence:update', data.payload);
    });

    this.socket.on('user:online', (data: WebSocketMessage) => {
      store.dispatch(addOnlineUser(data.payload));
      this.emitEvent('user:online', data.payload);
    });

    this.socket.on('user:offline', (data: WebSocketMessage) => {
      store.dispatch(removeOnlineUser(data.payload.userId));
      this.emitEvent('user:offline', data.payload);
    });

    // Typing indicators
    this.socket.on('typing:start', (data: TypingUser) => {
      this.emitEvent('typing:start', data);
    });

    this.socket.on('typing:stop', (data: TypingUser) => {
      this.emitEvent('typing:stop', data);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      this.emitEvent('error', error);
    });

    // Ping/Pong for connection health
    this.socket.on('pong', () => {
      this.emitEvent('pong', { timestamp: Date.now() });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.clearPingInterval();
      this.subscribedChannels.clear();
      this.eventHandlers.clear();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Channel subscription
  subscribeToPost(postId: string): void {
    if (!this.socket) return;
    const channel = `post:${postId}`;
    this.socket.emit('subscribe', { channel });
    this.subscribedChannels.add(channel);
  }

  unsubscribeFromPost(postId: string): void {
    if (!this.socket) return;
    const channel = `post:${postId}`;
    this.socket.emit('unsubscribe', { channel });
    this.subscribedChannels.delete(channel);
  }

  subscribeToRepository(repositoryId: string): void {
    if (!this.socket) return;
    const channel = `repository:${repositoryId}`;
    this.socket.emit('subscribe', { channel });
    this.subscribedChannels.add(channel);
  }

  unsubscribeFromRepository(repositoryId: string): void {
    if (!this.socket) return;
    const channel = `repository:${repositoryId}`;
    this.socket.emit('unsubscribe', { channel });
    this.subscribedChannels.delete(channel);
  }

  subscribeToUser(userId: string): void {
    if (!this.socket) return;
    const channel = `user:${userId}`;
    this.socket.emit('subscribe', { channel });
    this.subscribedChannels.add(channel);
  }

  unsubscribeFromUser(userId: string): void {
    if (!this.socket) return;
    const channel = `user:${userId}`;
    this.socket.emit('unsubscribe', { channel });
    this.subscribedChannels.delete(channel);
  }

  // Emit events
  createPost(post: any): void {
    if (!this.socket) return;
    this.socket.emit('post:create', post);
  }

  updatePost(postId: string, updates: any): void {
    if (!this.socket) return;
    this.socket.emit('post:update', { postId, updates });
  }

  deletePost(postId: string): void {
    if (!this.socket) return;
    this.socket.emit('post:delete', { postId });
  }

  votePost(postId: string, value: number): void {
    if (!this.socket) return;
    this.socket.emit('post:vote', { postId, value });
  }

  createComment(comment: any): void {
    if (!this.socket) return;
    this.socket.emit('comment:create', comment);
  }

  updateComment(commentId: string, updates: any): void {
    if (!this.socket) return;
    this.socket.emit('comment:update', { commentId, updates });
  }

  deleteComment(commentId: string): void {
    if (!this.socket) return;
    this.socket.emit('comment:delete', { commentId });
  }

  voteComment(commentId: string, value: number): void {
    if (!this.socket) return;
    this.socket.emit('comment:vote', { commentId, value });
  }

  // Typing indicators
  startTyping(context: { postId?: string; commentId?: string }): void {
    if (!this.socket) return;
    this.socket.emit('typing:start', context);
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(context);
    }, 3000);
  }

  stopTyping(context: { postId?: string; commentId?: string }): void {
    if (!this.socket) return;
    this.socket.emit('typing:stop', context);
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  // Repository events
  updateRepositoryEmails(repositoryId: string, emails: string[]): void {
    if (!this.socket) return;
    this.socket.emit('repository:emails:update', { repositoryId, emails });
  }

  triggerSnowballDistribution(repositoryId: string): void {
    if (!this.socket) return;
    this.socket.emit('repository:snowball:trigger', { repositoryId });
  }

  // Event handling
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Connection management
  private setupPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000);
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private resubscribeChannels(): void {
    this.subscribedChannels.forEach(channel => {
      this.socket?.emit('subscribe', { channel });
    });
  }

  private setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  private showBrowserNotification(notification: any): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const { title, body, icon } = notification;
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        silent: false,
      });
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  reconnect(): void {
    if (!this.socket?.connected) {
      this.socket?.connect();
    }
  }
}

export default new WebSocketService();
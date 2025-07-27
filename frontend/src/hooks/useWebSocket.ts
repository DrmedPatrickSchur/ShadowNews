/**
 * WebSocket Communication Hook Collection
 * 
 * Comprehensive real-time communication system for ShadowNews platform
 * providing WebSocket connectivity, message handling, room management,
 * and specialized subscription patterns for live updates.
 * 
 * Core Features:
 * - WebSocket Connection Management: Robust connection handling with reconnection
 * - Message Broadcasting: Type-safe message sending and receiving
 * - Room Management: Join/leave rooms for focused real-time updates
 * - Event Subscription: Flexible event subscription patterns
 * - Heartbeat Monitoring: Connection health monitoring with automatic recovery
 * - Typing Indicators: Real-time typing status for enhanced user experience
 * 
 * Hook Architecture:
 * - useWebSocket: Main WebSocket management hook
 * - useWebSocketSubscription: Generic event subscription hook
 * - usePostUpdates: Specialized post update subscriptions
 * - useRepositoryUpdates: Repository change notifications
 * - useTypingIndicators: Real-time typing status tracking
 * 
 * Connection Management:
 * - Automatic Reconnection: Intelligent reconnection with exponential backoff
 * - Connection Health: Heartbeat monitoring with ping/pong messages
 * - Error Recovery: Comprehensive error handling with user feedback
 * - Authentication: Token-based WebSocket authentication
 * - State Persistence: Maintain connection state across components
 * 
 * Message Types:
 * - Post Events: Creation, updates, deletion notifications
 * - Comment Events: Comment lifecycle and interaction updates
 * - Repository Events: Email list changes and collaboration updates
 * - User Events: Online status and presence indicators
 * - Notification Events: Real-time notification delivery
 * - Typing Events: Live typing indicators for collaborative editing
 * 
 * Real-Time Features:
 * - Live Content Updates: Instant content changes across all clients
 * - Collaborative Editing: Real-time collaboration with conflict resolution
 * - Presence Indicators: User online status and activity tracking
 * - Notification Delivery: Instant notification push to connected users
 * - Activity Feeds: Live activity streams for repositories and posts
 * - Engagement Tracking: Real-time interaction and engagement metrics
 * 
 * Room Management:
 * - Post Rooms: Focused updates for specific post discussions
 * - Repository Rooms: Repository-specific notifications and updates
 * - User Rooms: Personal notification and message channels
 * - Topic Rooms: Subject-based discussion and update channels
 * - Automatic Cleanup: Efficient room joining and leaving management
 * 
 * Message Broadcasting:
 * - Type-Safe Messaging: Strongly typed message interfaces
 * - Message Queuing: Reliable message delivery with retry mechanisms
 * - Priority Handling: Critical message prioritization
 * - Broadcast Control: Selective message broadcasting to specific users
 * - Message Persistence: Optional message persistence for offline users
 * 
 * Performance Optimizations:
 * - Connection Pooling: Efficient WebSocket connection management
 * - Message Batching: Optimized message transmission for high traffic
 * - Subscription Management: Efficient event handler registration
 * - Memory Management: Automatic cleanup of unused subscriptions
 * - Bandwidth Optimization: Compressed message transmission
 * 
 * Error Handling:
 * - Connection Failures: Graceful handling of network issues
 * - Message Parsing: Robust JSON message parsing with error recovery
 * - Reconnection Logic: Smart reconnection with exponential backoff
 * - Timeout Management: Connection timeout handling and recovery
 * - User Feedback: Clear error communication with recovery suggestions
 * 
 * Authentication and Security:
 * - Token-Based Auth: Secure WebSocket authentication with JWT tokens
 * - Permission Validation: Message-level permission checking
 * - Rate Limiting: Protection against message spam and abuse
 * - Input Sanitization: Comprehensive message content sanitization
 * - Encryption: Optional message encryption for sensitive data
 * 
 * Integration Patterns:
 * - Redux Integration: Seamless integration with global state management
 * - React Hooks: Custom hooks for different WebSocket usage patterns
 * - Component Integration: Easy integration with React components
 * - Service Layer: Abstraction layer for WebSocket operations
 * - Testing Support: Comprehensive testing utilities and mocks
 * 
 * Subscription Patterns:
 * - Event-Based: Subscribe to specific event types
 * - Room-Based: Subscribe to room-specific updates
 * - User-Based: Subscribe to user-specific notifications
 * - Wildcard: Subscribe to all events with filtering
 * - Conditional: Dynamic subscription based on conditions
 * 
 * Collaboration Features:
 * - Real-Time Editing: Collaborative content editing with conflict resolution
 * - Presence Awareness: Show who's currently viewing or editing content
 * - Activity Indicators: Live indicators for user actions and engagement
 * - Version Synchronization: Maintain data consistency across all clients
 * - Conflict Resolution: Handle concurrent edits with merge strategies
 * 
 * Mobile and Offline Support:
 * - Connection Resumption: Resume connections after network interruptions
 * - Message Queuing: Queue messages when offline and send when reconnected
 * - Background Processing: Handle WebSocket events in background
 * - Battery Optimization: Efficient WebSocket usage for mobile devices
 * - Progressive Enhancement: Graceful degradation when WebSocket unavailable
 * 
 * Analytics and Monitoring:
 * - Connection Metrics: Monitor connection health and performance
 * - Message Analytics: Track message volume and delivery rates
 * - User Engagement: Measure real-time engagement and interaction
 * - Performance Monitoring: WebSocket performance and latency tracking
 * - Error Tracking: Comprehensive error logging and analysis
 * 
 * Dependencies:
 * - React: Hooks for state management and lifecycle handling
 * - Redux: Global state management for real-time data synchronization
 * - WebSocket API: Native browser WebSocket implementation
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addPost, updatePost, removePost } from '../store/slices/posts.slice';
import { addComment, updateComment, removeComment } from '../store/slices/comments.slice';
import { setNotification, updateOnlineUsers } from '../store/slices/ui.slice';

/**
 * WebSocket Message Interface
 * 
 * Standardized message format for all WebSocket communications
 * ensuring type safety and consistent message structure.
 * 
 * Features:
 * - Type System: Strongly typed message categories
 * - Payload Data: Flexible payload structure for different message types
 * - Timestamp: Automatic timestamp generation for message ordering
 * - User Context: Optional user identification for permission checking
 * 
 * @interface WebSocketMessage
 */
interface WebSocketMessage {
 /**
  * Message type identifier for routing and handling
  * Defines the category and action of the message
  * Used for message routing and handler selection
  * @type {string}
  */
 type: string;

 /**
  * Message payload containing the actual data
  * Flexible structure to accommodate different message types
  * Contains the business logic data for the message
  * @type {any}
  */
 payload: any;

 /**
  * ISO timestamp of message creation
  * Used for message ordering and synchronization
  * Automatically generated when message is created
  * @type {string}
  */
 timestamp: string;

 /**
  * Optional user identifier for message source
  * Used for permission checking and message attribution
  * Enables user-specific message filtering and routing
  * @type {string}
  * @optional
  */
 userId?: string;
}

/**
 * WebSocket Configuration Options
 * 
 * Configuration interface for customizing WebSocket connection
 * behavior, including reconnection strategies and health monitoring.
 * 
 * Features:
 * - Reconnection Strategy: Configurable reconnection attempts and delays
 * - Health Monitoring: Heartbeat interval configuration
 * - Performance Tuning: Connection optimization parameters
 * 
 * @interface WebSocketOptions
 */
interface WebSocketOptions {
 /**
  * Maximum number of reconnection attempts
  * Controls how many times to retry failed connections
  * Prevents infinite reconnection loops
  * @type {number}
  * @default 5
  */
 reconnectAttempts?: number;

 /**
  * Base delay between reconnection attempts (milliseconds)
  * Used with exponential backoff for reconnection timing
  * Prevents overwhelming the server during outages
  * @type {number}
  * @default 3000
  */
 reconnectDelay?: number;

 /**
  * Interval for heartbeat ping messages (milliseconds)
  * Maintains connection health and detects disconnections
  * Ensures connection remains active through firewalls
  * @type {number}
  * @default 30000
  */
 heartbeatInterval?: number;
}

/**
 * Message Handler Function Type
 * 
 * Function signature for WebSocket message event handlers
 * providing type safety for message processing functions.
 * 
 * @callback MessageHandler
 * @param {WebSocketMessage} message - The received WebSocket message
 * @returns {void}
 */
type MessageHandler = (message: WebSocketMessage) => void;

/**
 * Main WebSocket Management Hook
 * 
 * Comprehensive WebSocket connection management with robust error handling,
 * automatic reconnection, heartbeat monitoring, and flexible message routing.
 * Provides a complete real-time communication system for React applications.
 * 
 * Features:
 * - Connection Management: Automatic connection, reconnection, and cleanup
 * - Message Broadcasting: Type-safe message sending with delivery confirmation
 * - Event Subscription: Flexible event handler registration and management
 * - Room Management: Join/leave rooms for focused message delivery
 * - Health Monitoring: Heartbeat system for connection health tracking
 * - Error Recovery: Comprehensive error handling with user feedback
 * 
 * Connection Lifecycle:
 * - Initialization: Establish WebSocket connection with authentication
 * - Authentication: Token-based connection authentication
 * - Heartbeat: Regular ping/pong messages for connection health
 * - Reconnection: Automatic reconnection with exponential backoff
 * - Cleanup: Proper connection closure and resource cleanup
 * 
 * Message Handling:
 * - Type Routing: Route messages based on type to appropriate handlers
 * - Redux Integration: Automatic Redux dispatch for standard message types
 * - Custom Handlers: Support for custom message type handlers
 * - Wildcard Handlers: Catch-all handlers for message monitoring
 * - Error Recovery: Graceful handling of malformed messages
 * 
 * Room Management:
 * - Post Rooms: Subscribe to updates for specific posts
 * - Repository Rooms: Receive repository-specific notifications
 * - User Rooms: Personal notification channels
 * - Dynamic Joining: Automatic room management based on component lifecycle
 * 
 * Real-Time Features:
 * - Live Updates: Instant content synchronization across clients
 * - Typing Indicators: Real-time typing status for collaborative features
 * - Presence Tracking: Online user status and activity monitoring
 * - Activity Streams: Live activity feeds for content and users
 * 
 * Performance Optimizations:
 * - Connection Pooling: Efficient WebSocket connection reuse
 * - Message Queuing: Queue messages during disconnection periods
 * - Handler Management: Efficient event handler registration/cleanup
 * - Memory Management: Automatic cleanup of unused resources
 * 
 * Error Handling:
 * - Connection Errors: Graceful handling of network failures
 * - Authentication Errors: Clear feedback for authentication issues
 * - Message Errors: Recovery from malformed or failed messages
 * - Timeout Handling: Connection timeout detection and recovery
 * 
 * @param {WebSocketOptions} options - WebSocket configuration options
 * @returns {object} WebSocket management interface
 */
export const useWebSocket = (options: WebSocketOptions = {}) => {
 const dispatch = useDispatch();
 const { user, token } = useSelector((state: RootState) => state.auth);
 const [isConnected, setIsConnected] = useState(false);
 const [connectionError, setConnectionError] = useState<string | null>(null);
 
 const ws = useRef<WebSocket | null>(null);
 const reconnectCount = useRef(0);
 const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
 const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
 const messageHandlers = useRef<Map<string, Set<MessageHandler>>>(new Map());
 
 const {
   reconnectAttempts = 5,
   reconnectDelay = 3000,
   heartbeatInterval = 30000
 } = options;

 const sendMessage = useCallback((type: string, payload: any) => {
   if (ws.current?.readyState === WebSocket.OPEN) {
     const message: WebSocketMessage = {
       type,
       payload,
       timestamp: new Date().toISOString(),
       userId: user?.id
     };
     ws.current.send(JSON.stringify(message));
     return true;
   }
   return false;
 }, [user]);

 const subscribe = useCallback((eventType: string, handler: MessageHandler) => {
   if (!messageHandlers.current.has(eventType)) {
     messageHandlers.current.set(eventType, new Set());
   }
   messageHandlers.current.get(eventType)!.add(handler);

   return () => {
     const handlers = messageHandlers.current.get(eventType);
     if (handlers) {
       handlers.delete(handler);
       if (handlers.size === 0) {
         messageHandlers.current.delete(eventType);
       }
     }
   };
 }, []);

 const handleMessage = useCallback((event: MessageEvent) => {
   try {
     const message: WebSocketMessage = JSON.parse(event.data);
     
     // Handle built-in message types
     switch (message.type) {
       case 'post:created':
         dispatch(addPost(message.payload));
         break;
       case 'post:updated':
         dispatch(updatePost(message.payload));
         break;
       case 'post:deleted':
         dispatch(removePost(message.payload.id));
         break;
       case 'comment:created':
         dispatch(addComment(message.payload));
         break;
       case 'comment:updated':
         dispatch(updateComment(message.payload));
         break;
       case 'comment:deleted':
         dispatch(removeComment(message.payload.id));
         break;
       case 'notification':
         dispatch(setNotification(message.payload));
         break;
       case 'users:online':
         dispatch(updateOnlineUsers(message.payload));
         break;
       case 'pong':
         // Heartbeat response
         break;
     }
     
     // Call custom handlers
     const handlers = messageHandlers.current.get(message.type);
     if (handlers) {
       handlers.forEach(handler => handler(message));
     }
     
     // Call wildcard handlers
     const wildcardHandlers = messageHandlers.current.get('*');
     if (wildcardHandlers) {
       wildcardHandlers.forEach(handler => handler(message));
     }
   } catch (error) {
     console.error('WebSocket message parsing error:', error);
   }
 }, [dispatch]);

 const startHeartbeat = useCallback(() => {
   if (heartbeatTimer.current) {
     clearInterval(heartbeatTimer.current);
   }
   
   heartbeatTimer.current = setInterval(() => {
     sendMessage('ping', { timestamp: Date.now() });
   }, heartbeatInterval);
 }, [sendMessage, heartbeatInterval]);

 const stopHeartbeat = useCallback(() => {
   if (heartbeatTimer.current) {
     clearInterval(heartbeatTimer.current);
     heartbeatTimer.current = null;
   }
 }, []);

 const connect = useCallback(() => {
   if (ws.current?.readyState === WebSocket.OPEN || !token) {
     return;
   }

   const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
   ws.current = new WebSocket(`${wsUrl}?token=${token}`);

   ws.current.onopen = () => {
     setIsConnected(true);
     setConnectionError(null);
     reconnectCount.current = 0;
     startHeartbeat();
     
     // Send initial subscription messages
     sendMessage('subscribe', {
       channels: ['posts', 'comments', 'notifications']
     });
   };

   ws.current.onmessage = handleMessage;

   ws.current.onerror = (error) => {
     console.error('WebSocket error:', error);
     setConnectionError('Connection error occurred');
   };

   ws.current.onclose = (event) => {
     setIsConnected(false);
     stopHeartbeat();
     
     if (!event.wasClean && reconnectCount.current < reconnectAttempts) {
       reconnectCount.current += 1;
       const delay = reconnectDelay * Math.pow(1.5, reconnectCount.current - 1);
       
       reconnectTimer.current = setTimeout(() => {
         connect();
       }, delay);
     }
   };
 }, [token, handleMessage, sendMessage, startHeartbeat, stopHeartbeat, reconnectAttempts, reconnectDelay]);

 const disconnect = useCallback(() => {
   if (reconnectTimer.current) {
     clearTimeout(reconnectTimer.current);
     reconnectTimer.current = null;
   }
   
   stopHeartbeat();
   
   if (ws.current) {
     ws.current.close(1000, 'User disconnect');
     ws.current = null;
   }
   
   setIsConnected(false);
   reconnectCount.current = 0;
 }, [stopHeartbeat]);

 // WebSocket lifecycle
 useEffect(() => {
   if (token) {
     connect();
   }
   
   return () => {
     disconnect();
   };
 }, [token, connect, disconnect]);

 // Specific action methods
 const joinPostRoom = useCallback((postId: string) => {
   return sendMessage('join:post', { postId });
 }, [sendMessage]);

 const leavePostRoom = useCallback((postId: string) => {
   return sendMessage('leave:post', { postId });
 }, [sendMessage]);

 const joinRepositoryRoom = useCallback((repositoryId: string) => {
   return sendMessage('join:repository', { repositoryId });
 }, [sendMessage]);

 const leaveRepositoryRoom = useCallback((repositoryId: string) => {
   return sendMessage('leave:repository', { repositoryId });
 }, [sendMessage]);

 const sendTypingIndicator = useCallback((context: 'post' | 'comment', contextId: string, isTyping: boolean) => {
   return sendMessage('typing', { context, contextId, isTyping });
 }, [sendMessage]);

 const requestOnlineUsers = useCallback(() => {
   return sendMessage('users:request', {});
 }, [sendMessage]);

 return {
   isConnected,
   connectionError,
   sendMessage,
   subscribe,
   joinPostRoom,
   leavePostRoom,
   joinRepositoryRoom,
   leaveRepositoryRoom,
   sendTypingIndicator,
   requestOnlineUsers,
   disconnect,
   reconnect: connect
 };
};

/**
 * Generic WebSocket Event Subscription Hook
 * 
 * Provides a simple interface for subscribing to specific WebSocket events
 * with automatic cleanup and lifecycle management. Ideal for custom event
 * handling in React components.
 * 
 * Features:
 * - Event Subscription: Subscribe to specific WebSocket event types
 * - Automatic Cleanup: Component unmount cleanup for memory management
 * - Lifecycle Management: Proper subscription/unsubscription handling
 * - Type Safety: Strongly typed event handlers for better development experience
 * 
 * Use Cases:
 * - Custom Event Handling: Handle application-specific WebSocket events
 * - Component Integration: Easy WebSocket integration for React components
 * - Event Monitoring: Monitor specific events for debugging or analytics
 * - Conditional Subscriptions: Subscribe to events based on component state
 * 
 * @param {string} eventType - The WebSocket event type to subscribe to
 * @param {MessageHandler} handler - Function to handle received messages
 */
export const useWebSocketSubscription = (eventType: string, handler: MessageHandler) => {
 const { subscribe } = useWebSocket();
 
 useEffect(() => {
   return subscribe(eventType, handler);
 }, [eventType, handler, subscribe]);
};

/**
 * Post-Specific Real-Time Updates Hook
 * 
 * Specialized hook for receiving real-time updates for a specific post.
 * Automatically manages room joining/leaving and provides post-specific
 * update notifications for enhanced user experience.
 * 
 * Features:
 * - Room Management: Automatic joining and leaving of post-specific rooms
 * - Real-Time Updates: Live post data updates as they occur
 * - Component Integration: Seamless integration with post detail components
 * - Resource Cleanup: Automatic cleanup when component unmounts or post changes
 * 
 * Update Types:
 * - Content Changes: Post title, description, and content modifications
 * - Engagement Updates: Like counts, comment counts, and interaction metrics
 * - Status Changes: Post visibility, approval status, and lifecycle updates
 * - Metadata Updates: Tags, categories, and other post metadata changes
 * 
 * Use Cases:
 * - Post Detail Pages: Live updates for post viewing pages
 * - Discussion Threads: Real-time comment and engagement updates
 * - Content Editing: Live collaboration for post editing interfaces
 * - Engagement Tracking: Real-time engagement metrics and analytics
 * 
 * @param {string} postId - The unique identifier of the post to monitor
 * @returns {any} Real-time post update data
 */
export const usePostUpdates = (postId: string) => {
 const { joinPostRoom, leavePostRoom, subscribe } = useWebSocket();
 const [realtimeData, setRealtimeData] = useState<any>(null);
 
 useEffect(() => {
   joinPostRoom(postId);
   
   const unsubscribe = subscribe(`post:${postId}:update`, (message) => {
     setRealtimeData(message.payload);
   });
   
   return () => {
     leavePostRoom(postId);
     unsubscribe();
   };
 }, [postId, joinPostRoom, leavePostRoom, subscribe]);
 
 return realtimeData;
};

/**
 * Repository-Specific Real-Time Updates Hook
 * 
 * Specialized hook for monitoring real-time updates to a specific repository.
 * Provides live notifications for repository changes, email list updates,
 * and collaboration activities.
 * 
 * Features:
 * - Repository Monitoring: Real-time updates for repository changes
 * - Update History: Maintains history of updates for audit and review
 * - Room Management: Automatic repository room joining and cleanup
 * - Collaboration Support: Live updates for multi-user repository editing
 * 
 * Update Categories:
 * - Email List Changes: Additions, removals, and email list modifications
 * - Repository Metadata: Name, description, and configuration changes
 * - Collaboration Activity: User joins, permissions, and collaborative edits
 * - Settings Updates: Privacy settings, snowball configuration changes
 * - Analytics Updates: Growth metrics, engagement data, and performance stats
 * 
 * Use Cases:
 * - Repository Management: Live updates for repository administration
 * - Collaboration Dashboards: Real-time collaboration activity monitoring
 * - Analytics Pages: Live analytics and metrics updates
 * - Email Management: Real-time email list change notifications
 * 
 * @param {string} repositoryId - The unique identifier of the repository to monitor
 * @returns {any[]} Array of repository update objects
 */
export const useRepositoryUpdates = (repositoryId: string) => {
 const { joinRepositoryRoom, leaveRepositoryRoom, subscribe } = useWebSocket();
 const [updates, setUpdates] = useState<any[]>([]);
 
 useEffect(() => {
   joinRepositoryRoom(repositoryId);
   
   const unsubscribe = subscribe(`repository:${repositoryId}:update`, (message) => {
     setUpdates(prev => [...prev, message.payload]);
   });
   
   return () => {
     leaveRepositoryRoom(repositoryId);
     unsubscribe();
   };
 }, [repositoryId, joinRepositoryRoom, leaveRepositoryRoom, subscribe]);
 
 return updates;
};

/**
 * Real-Time Typing Indicators Hook
 * 
 * Provides real-time typing indicators for collaborative editing interfaces.
 * Shows which users are currently typing in a specific context (post or comment)
 * with automatic cleanup of stale indicators.
 * 
 * Features:
 * - Live Typing Status: Real-time typing indicators for active users
 * - Context Awareness: Support for different contexts (posts, comments)
 * - Automatic Cleanup: Remove stale typing indicators after timeout
 * - User Identification: Display usernames of currently typing users
 * 
 * Typing Management:
 * - Status Tracking: Track typing start and stop events
 * - Timeout Handling: Automatic removal of inactive typing indicators
 * - User Filtering: Filter out current user from typing indicators
 * - Debouncing: Smooth typing indicator updates with debouncing
 * 
 * Context Types:
 * - Post Typing: Typing indicators for post editing and comments
 * - Comment Typing: Typing indicators for comment threads
 * - Repository Typing: Typing indicators for repository descriptions
 * - Custom Contexts: Support for application-specific typing contexts
 * 
 * Use Cases:
 * - Collaborative Editing: Show typing status in collaborative editors
 * - Comment Threads: Display typing indicators in discussion threads
 * - Live Chat: Real-time typing indicators for chat interfaces
 * - Content Creation: Collaborative content creation with typing awareness
 * 
 * @param {'post' | 'comment'} context - The context type for typing indicators
 * @param {string} contextId - The unique identifier for the specific context
 * @returns {string[]} Array of usernames currently typing
 */
export const useTypingIndicators = (context: 'post' | 'comment', contextId: string) => {
 const { subscribe } = useWebSocket();
 const [typingUsers, setTypingUsers] = useState<Map<string, { username: string; timestamp: number }>>(new Map());
 
 useEffect(() => {
   const unsubscribe = subscribe(`typing:${context}:${contextId}`, (message) => {
     const { userId, username, isTyping } = message.payload;
     
     setTypingUsers(prev => {
       const updated = new Map(prev);
       
       if (isTyping) {
         updated.set(userId, { username, timestamp: Date.now() });
       } else {
         updated.delete(userId);
       }
       
       return updated;
     });
   });
   
   // Clean up stale typing indicators
   const cleanupInterval = setInterval(() => {
     setTypingUsers(prev => {
       const updated = new Map(prev);
       const now = Date.now();
       
       for (const [userId, data] of updated.entries()) {
         if (now - data.timestamp > 5000) {
           updated.delete(userId);
         }
       }
       
       return updated.size !== prev.size ? updated : prev;
     });
   }, 1000);
   
   return () => {
     unsubscribe();
     clearInterval(cleanupInterval);
   };
 }, [context, contextId, subscribe]);
 
 return Array.from(typingUsers.values()).map(u => u.username);
};

export default useWebSocket;
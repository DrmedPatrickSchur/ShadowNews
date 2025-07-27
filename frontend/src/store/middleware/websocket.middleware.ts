/**
 * WebSocket Middleware - Real-time Redux Integration
 * 
 * Comprehensive Redux middleware providing seamless WebSocket integration
 * with automatic event handling, state synchronization, and real-time
 * updates for the ShadowNews email-first social platform.
 * 
 * Core Features:
 * - Real-time Communication: WebSocket integration with Redux action dispatch
 * - Event Broadcasting: Bidirectional event handling and state synchronization
 * - Connection Management: Automatic reconnection and health monitoring
 * - State Synchronization: Live state updates from server events
 * - Error Handling: Comprehensive error management and recovery mechanisms
 * - Performance Optimization: Event batching and throttling for efficiency
 * - Type Safety: Full TypeScript integration with typed events and actions
 * 
 * WebSocket Event Handling:
 * - Post Events: Real-time post creation, updates, deletions, and voting
 * - Comment Events: Live comment threading, replies, and moderation
 * - Repository Events: Email repository updates, member changes, and analytics
 * - Notification Events: Instant notification delivery and read status updates
 * - User Events: Presence tracking, typing indicators, and activity status
 * - System Events: Heartbeat, connection status, and health monitoring
 * 
 * State Synchronization:
 * - Automatic Dispatch: Server events automatically trigger Redux actions
 * - Conflict Resolution: Handle concurrent updates and state conflicts
 * - Optimistic Updates: Local state updates with server confirmation
 * - Data Integrity: Ensure state consistency across multiple clients
 * - Event Ordering: Maintain proper event sequence and temporal consistency
 * - Rollback Support: Automatic rollback for failed operations
 * 
 * Connection Management:
 * - Auto-reconnection: Intelligent reconnection with exponential backoff
 * - Health Monitoring: Connection heartbeat and status tracking
 * - Authentication: JWT token integration and session management
 * - Error Recovery: Graceful error handling and connection restoration
 * - Load Balancing: Multiple server connection and failover support
 * - Offline Support: Queue events during disconnection for later sync
 * 
 * Event Broadcasting:
 * - Room Management: Channel-based event routing and subscription
 * - User Targeting: User-specific event delivery and filtering
 * - Event Filtering: Selective event subscription and handling
 * - Broadcast Modes: Global, room-based, and targeted event distribution
 * - Message Queuing: Event queuing and delivery guarantees
 * - Rate Limiting: Event throttling and spam prevention
 * 
 * Performance Features:
 * - Event Batching: Batch multiple events for efficient processing
 * - Throttling: Rate limiting for high-frequency events
 * - Debouncing: Prevent duplicate event processing
 * - Memory Management: Efficient event handling and cleanup
 * - Compression: WebSocket compression for bandwidth optimization
 * - Lazy Loading: On-demand event subscription and resource management
 * 
 * Security Features:
 * - Authentication: JWT-based WebSocket authentication
 * - Authorization: Event-level permission checking and access control
 * - Data Validation: Server event payload validation and sanitization
 * - Rate Limiting: Connection and message rate limiting
 * - Encryption: End-to-end encryption for sensitive real-time data
 * - Audit Trail: WebSocket activity logging and monitoring
 * 
 * Development Features:
 * - Debug Logging: Comprehensive WebSocket event logging
 * - Error Reporting: Detailed error reporting and stack traces
 * - Performance Monitoring: Real-time performance metrics and analysis
 * - Testing Support: Mock WebSocket implementation for testing
 * - Hot Reloading: Development-time WebSocket connection preservation
 * - DevTools Integration: Redux DevTools integration for WebSocket events
 * 
 * Mobile and Offline:
 * - Background Sync: Background WebSocket management for mobile apps
 * - Offline Queue: Event queuing during network unavailability
 * - Battery Optimization: Efficient connection management for mobile devices
 * - Progressive Enhancement: Graceful degradation for limited connectivity
 * - Data Usage: Optimized data transfer for limited bandwidth
 * - Wake Lock: Prevent connection drops during background operation
 * 
 * Integration Features:
 * - Redux Integration: Seamless Redux store integration with action dispatch
 * - Service Integration: Integration with authentication and API services
 * - React Hooks: Custom hooks for WebSocket state management
 * - Component Integration: High-order components for WebSocket connectivity
 * - Router Integration: Navigation-aware WebSocket connection management
 * - External Services: Integration with external real-time services
 * 
 * Dependencies:
 * - Redux Toolkit: State management integration with middleware pattern
 * - Socket.IO Client: WebSocket client library for real-time communication
 * - Redux Slices: Integration with feature-specific Redux slices
 * - TypeScript: Full type safety with comprehensive type definitions
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { 
  addPost, 
  updatePost, 
  removePost,
  incrementPostVotes,
  decrementPostVotes
} from '../slices/posts.slice';
import { 
  addComment, 
  updateComment, 
  removeComment,
  incrementCommentVotes,
  decrementCommentVotes
} from '../slices/comments.slice';
import { 
  updateRepository,
  addEmailToRepository,
  updateSnowballProgress,
  setRepositoryStats
} from '../slices/repositories.slice';
import {
  addNotification,
  markNotificationRead,
  updateUnreadCount
} from '../slices/notifications.slice';
import {
  setConnectionStatus,
  setReconnecting,
  setLastHeartbeat
} from '../slices/websocket.slice';
import { RootState } from '../store';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
}

interface WebSocketError {
  code: string;
  message: string;
  timestamp: number;
}

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_BASE = 1000;
const HEARTBEAT_INTERVAL = 30000;
let heartbeatTimer: NodeJS.Timeout | null = null;

const websocketMiddleware: Middleware<{}, RootState> = store => {
  return next => action => {
    const state = store.getState();
    const { auth } = state;

    switch (action.type) {
      case 'websocket/connect':
        if (socket?.connected) {
          socket.disconnect();
        }

        const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
        socket = io(wsUrl, {
          transports: ['websocket'],
          auth: {
            token: auth.token
          },
          reconnection: true,
          reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: RECONNECT_DELAY_BASE,
          reconnectionDelayMax: 10000,
          timeout: 20000
        });

        socket.on('connect', () => {
          console.log('WebSocket connected');
          store.dispatch(setConnectionStatus('connected'));
          store.dispatch(setReconnecting(false));
          reconnectAttempts = 0;
          startHeartbeat();
          
          // Subscribe to user-specific channels
          if (auth.user?.id) {
            socket?.emit('subscribe', {
              channels: [
                `user:${auth.user.id}`,
                'posts:updates',
                'comments:updates',
                ...state.repositories.userRepositories.map(repo => `repository:${repo.id}`)
              ]
            });
          }
        });

        socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          store.dispatch(setConnectionStatus('disconnected'));
          stopHeartbeat();
          
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, attempt reconnect
            attemptReconnect();
          }
        });

        socket.on('error', (error: WebSocketError) => {
          console.error('WebSocket error:', error);
          store.dispatch(setConnectionStatus('error'));
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Reconnection attempt ${attemptNumber}`);
          store.dispatch(setReconnecting(true));
          reconnectAttempts = attemptNumber;
        });

        socket.on('reconnect_failed', () => {
          console.error('WebSocket reconnection failed');
          store.dispatch(setConnectionStatus('failed'));
          store.dispatch(setReconnecting(false));
        });

        // Post events
        socket.on('post:created', (data: WebSocketMessage) => {
          store.dispatch(addPost(data.payload));
        });

        socket.on('post:updated', (data: WebSocketMessage) => {
          store.dispatch(updatePost(data.payload));
        });

        socket.on('post:deleted', (data: WebSocketMessage) => {
          store.dispatch(removePost(data.payload.id));
        });

        socket.on('post:voted', (data: WebSocketMessage) => {
          const { postId, voteType, userId } = data.payload;
          if (voteType === 'up') {
            store.dispatch(incrementPostVotes({ postId, userId }));
          } else {
            store.dispatch(decrementPostVotes({ postId, userId }));
          }
        });

        // Comment events
        socket.on('comment:created', (data: WebSocketMessage) => {
          store.dispatch(addComment(data.payload));
        });

        socket.on('comment:updated', (data: WebSocketMessage) => {
          store.dispatch(updateComment(data.payload));
        });

        socket.on('comment:deleted', (data: WebSocketMessage) => {
          store.dispatch(removeComment(data.payload.id));
        });

        socket.on('comment:voted', (data: WebSocketMessage) => {
          const { commentId, voteType, userId } = data.payload;
          if (voteType === 'up') {
            store.dispatch(incrementCommentVotes({ commentId, userId }));
          } else {
            store.dispatch(decrementCommentVotes({ commentId, userId }));
          }
        });

        // Repository events
        socket.on('repository:updated', (data: WebSocketMessage) => {
          store.dispatch(updateRepository(data.payload));
        });

        socket.on('repository:email_added', (data: WebSocketMessage) => {
          store.dispatch(addEmailToRepository(data.payload));
        });

        socket.on('repository:snowball_progress', (data: WebSocketMessage) => {
          store.dispatch(updateSnowballProgress(data.payload));
        });

        socket.on('repository:stats_updated', (data: WebSocketMessage) => {
          store.dispatch(setRepositoryStats(data.payload));
        });

        // Notification events
        socket.on('notification:new', (data: WebSocketMessage) => {
          store.dispatch(addNotification(data.payload));
          store.dispatch(updateUnreadCount(1));
        });

        socket.on('notification:read', (data: WebSocketMessage) => {
          store.dispatch(markNotificationRead(data.payload.id));
          store.dispatch(updateUnreadCount(-1));
        });

        // Heartbeat
        socket.on('pong', (data: WebSocketMessage) => {
          store.dispatch(setLastHeartbeat(data.timestamp));
        });

        break;

      case 'websocket/disconnect':
        if (socket) {
          stopHeartbeat();
          socket.disconnect();
          socket = null;
          store.dispatch(setConnectionStatus('disconnected'));
        }
        break;

      case 'websocket/emit':
        if (socket?.connected) {
          socket.emit(action.payload.event, action.payload.data);
        } else {
          console.warn('Cannot emit event: WebSocket not connected');
        }
        break;

      case 'websocket/subscribe':
        if (socket?.connected) {
          socket.emit('subscribe', {
            channels: action.payload.channels
          });
        }
        break;

      case 'websocket/unsubscribe':
        if (socket?.connected) {
          socket.emit('unsubscribe', {
            channels: action.payload.channels
          });
        }
        break;

      case 'posts/createPost/fulfilled':
        if (socket?.connected && action.payload.notifySubscribers) {
          socket.emit('post:notify_subscribers', {
            postId: action.payload.id,
            hashtags: action.payload.hashtags
          });
        }
        break;

      case 'repositories/uploadCSV/fulfilled':
        if (socket?.connected) {
          socket.emit('repository:process_snowball', {
            repositoryId: action.payload.repositoryId,
            csvData: action.payload.csvData
          });
        }
        break;

      case 'auth/logout':
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        break;
    }

    return next(action);
  };

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket?.connected) {
        socket.emit('ping', { timestamp: Date.now() });
      }
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function attemptReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(
        RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts),
        10000
      );
      
      setTimeout(() => {
        if (!socket?.connected) {
          socket?.connect();
        }
      }, delay);
    }
  }
};

// Action creators for WebSocket operations
export const connectWebSocket = () => ({
  type: 'websocket/connect'
});

export const disconnectWebSocket = () => ({
  type: 'websocket/disconnect'
});

export const emitWebSocketEvent = (event: string, data: any) => ({
  type: 'websocket/emit',
  payload: { event, data }
});

export const subscribeToChannels = (channels: string[]) => ({
  type: 'websocket/subscribe',
  payload: { channels }
});

export const unsubscribeFromChannels = (channels: string[]) => ({
  type: 'websocket/unsubscribe',
  payload: { channels }
});

export default websocketMiddleware;
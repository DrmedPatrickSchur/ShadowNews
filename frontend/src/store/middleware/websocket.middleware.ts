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
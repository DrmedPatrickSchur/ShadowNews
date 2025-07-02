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

interface WebSocketMessage {
  type: string;
  payload: any;
  userId?: string;
  timestamp: number;
}

interface TypingUser {
  userId: string;
  username: string;
  postId?: string;
  commentId?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;
  private subscribedChannels: Set<string> = new Set();
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    this.setupBeforeUnloadHandler();
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
      
      this.socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000,
        timeout: 20000,
      });

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
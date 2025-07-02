import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addPost, updatePost, removePost } from '../store/slices/posts.slice';
import { addComment, updateComment, removeComment } from '../store/slices/comments.slice';
import { setNotification, updateOnlineUsers } from '../store/slices/ui.slice';

interface WebSocketMessage {
 type: string;
 payload: any;
 timestamp: string;
 userId?: string;
}

interface WebSocketOptions {
 reconnectAttempts?: number;
 reconnectDelay?: number;
 heartbeatInterval?: number;
}

type MessageHandler = (message: WebSocketMessage) => void;

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

// Typed event subscription hooks
export const useWebSocketSubscription = (eventType: string, handler: MessageHandler) => {
 const { subscribe } = useWebSocket();
 
 useEffect(() => {
   return subscribe(eventType, handler);
 }, [eventType, handler, subscribe]);
};

// Specific subscription hooks
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
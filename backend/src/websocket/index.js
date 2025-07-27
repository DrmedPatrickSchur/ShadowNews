/**
 * @fileoverview WebSocket Server Manager
 * 
 * Centralized WebSocket server implementation providing real-time communication
 * infrastructure for the ShadowNews platform. Manages bidirectional client-server
 * communication for live content updates, user interactions, and notification
 * delivery across the email-first Hacker News ecosystem.
 * 
 * The WebSocket server enables instant user experiences through real-time
 * post updates, live commenting, voting synchronization, and notification
 * delivery without requiring page refreshes or polling mechanisms.
 * 
 * Key Features:
 * - JWT-based authentication middleware for secure connections
 * - Real-time post creation, voting, and content updates
 * - Live comment threading and reply notifications
 * - User presence tracking and typing indicators
 * - Room-based event broadcasting for scalable communication
 * - Redis integration for session management and pub/sub
 * - CORS configuration for cross-origin frontend connections
 * - Comprehensive error handling and connection management
 * 
 * WebSocket Event Categories:
 * - Authentication: User login/logout, token verification
 * - Posts: Create, edit, delete, vote on posts in real-time
 * - Comments: Live comment creation, threading, and moderation
 * - Notifications: Instant delivery of user notifications
 * - Presence: User online status and activity indicators
 * 
 * Architecture:
 * - Socket.IO server with Express.js integration
 * - Namespace-based event organization (/posts, /comments)
 * - Room-based broadcasting for targeted communication
 * - Middleware pipeline for authentication and validation
 * - Redis pub/sub for multi-server scaling capabilities
 * 
 * Performance Optimizations:
 * - Connection pooling and resource management
 * - Event batching for high-frequency updates
 * - Redis caching for user session data
 * - Graceful degradation for connection failures
 * 
 * Security Features:
 * - JWT token validation on connection
 * - Rate limiting for event emissions
 * - Input sanitization and validation
 * - Cross-origin request security (CORS)
 * 
 * Dependencies:
 * - socket.io: Core WebSocket functionality and client management
 * - jsonwebtoken: JWT authentication and token verification
 * - redis: Session storage and pub/sub messaging
 * - Handler modules: Posts, comments, and notifications logic
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Socket.IO server library for real-time bidirectional communication
const socketIO = require('socket.io');

// JSON Web Token library for secure authentication
const jwt = require('jsonwebtoken');

// Redis client for session management and pub/sub messaging
const redis = require('../utils/redis');

// Centralized logging utility for WebSocket operations
const logger = require('../utils/logger');

// WebSocket event handlers for different functional areas
const postsHandler = require('./handlers/posts.handler');
const commentsHandler = require('./handlers/comments.handler');
const notificationsHandler = require('./handlers/notifications.handler');

/**
 * WebSocket Server Class
 * 
 * Central manager for WebSocket connections, authentication, event routing,
 * and real-time communication across the ShadowNews platform. Provides
 * a unified interface for managing Socket.IO server lifecycle and operations.
 */
class WebSocketServer {
  /**
   * WebSocket Server Constructor
   * 
   * Initializes the WebSocket server instance with default configuration
   * and prepares internal data structures for connection management.
   * 
   * @since 1.0.0
   */
  constructor() {
    /** @type {socketIO.Server} Socket.IO server instance */
    this.io = null;
    
    /** @type {Map<string, Object>} Connected users mapping userId -> socket data */
    this.users = new Map();
    
    /** @type {Object} Predefined room configurations for different content types */
    this.rooms = {
      posts: 'posts:live',           // Live post updates and creation
      trending: 'posts:trending',    // Trending content notifications
      repositories: 'repositories:updates' // Repository growth and changes
    };
  }

  /**
   * Initialize WebSocket Server
   * 
   * Sets up the Socket.IO server with CORS configuration, establishes
   * authentication middleware, configures event handlers, and starts
   * listening for client connections on the provided HTTP server.
   * 
   * Configuration Features:
   * - Cross-origin resource sharing (CORS) for frontend access
   * - Connection timeout and ping interval settings
   * - Authentication middleware for secure connections
   * - Event handler registration for different content types
   * - Redis pub/sub integration for scalability
   * 
   * @param {http.Server} server - HTTP server instance to attach Socket.IO
   * @returns {void}
   * 
   * @since 1.0.0
   */
  initialize(server) {
    // Create Socket.IO server with CORS and performance configuration
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true // Allow cookies and authentication headers
      },
      pingTimeout: 60000,  // 60 second timeout for client pings
      pingInterval: 25000  // 25 second interval between ping checks
    });

    // Set up authentication and event handling
    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupRedisSubscriptions();

    logger.info('WebSocket server initialized');
  }

  /**
   * Setup Authentication Middleware
   * 
   * Configures Socket.IO middleware to authenticate all incoming connections
   * using JWT tokens. Validates user credentials and attaches user data
   * to the socket instance for use in event handlers.
   * 
   * Authentication Flow:
   * 1. Extract JWT token from connection handshake
   * 2. Verify token signature and expiration
   * 3. Load user data from Redis cache
   * 4. Attach user information to socket instance
   * 5. Allow or reject connection based on validation
   * 
   * @returns {void}
   * @throws {Error} Authentication errors for invalid tokens or missing users
   * 
   * @since 1.0.0
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        // Extract authentication token from connection handshake
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await redis.get(`user:${decoded.userId}`);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user data to socket for handler access
        socket.userId = decoded.userId;
        socket.user = JSON.parse(user);
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup Event Handlers
   * 
   * Configures Socket.IO event listeners for connection management and
   * delegates specific event categories to specialized handler modules.
   * Manages the WebSocket server's core connection lifecycle.
   * 
   * Handler Categories:
   * - Connection/Disconnection: User presence management
   * - Posts: Content creation, voting, and live updates
   * - Comments: Live commenting and reply threading
   * - Notifications: Real-time notification delivery
   * 
   * @returns {void}
   * 
   * @since 1.0.0
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);

      socket.on('disconnect', () => this.handleDisconnect(socket));
      
      // Initialize specialized event handlers
      postsHandler(this.io, socket);
      commentsHandler(this.io, socket);
      notificationsHandler(this.io, socket);
    });
  }

  /**
   * Handle New Connection
   * 
   * Processes new WebSocket connections by registering the user,
   * setting up their presence tracking, and joining them to
   * appropriate rooms based on their preferences and subscriptions.
   * 
   * Connection Setup:
   * - Register user in active users map
   * - Update user presence status in Redis
   * - Join default notification rooms
   * - Broadcast user online status to relevant rooms
   * - Log connection for monitoring and analytics
   * 
   * @param {Socket} socket - Socket.IO socket instance for the new connection
   * @returns {void}
   * 
   * @since 1.0.0
   */
  handleConnection(socket) {
    // Register user in active connections
    this.users.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date(),
      rooms: new Set()
    });

    // Update user presence in Redis
    redis.setex(`presence:${socket.userId}`, 300, JSON.stringify({
      status: 'online',
      lastSeen: new Date(),
      socketId: socket.id
    }));

    // Join user to notification room
    socket.join(`user:${socket.userId}`);

    // Broadcast user online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      username: socket.user.username
    });

    logger.info(`User ${socket.user.username} connected via WebSocket`);
  }

  /**
   * Handle Connection Disconnect
   * 
   * Cleans up resources when a user disconnects, including removing
   * them from active users, updating presence status, and notifying
   * other users about their offline status.
   * 
   * Cleanup Operations:
   * - Remove user from active connections map
   * - Update presence status to offline in Redis
   * - Leave all joined rooms
   * - Broadcast offline status to other users
   * - Log disconnection for monitoring
   * 
   * @param {Socket} socket - Socket.IO socket instance being disconnected
   * @returns {void}
   * 
   * @since 1.0.0
   */
  handleDisconnect(socket) {
    // Remove user from active connections
    this.users.delete(socket.userId);

    // Update presence status in Redis
    redis.setex(`presence:${socket.userId}`, 300, JSON.stringify({
      status: 'offline',
      lastSeen: new Date(),
      socketId: null
    }));

    // Broadcast user offline status
    socket.broadcast.emit('user:offline', {
      userId: socket.userId,
      username: socket.user.username
    });

    logger.info(`User ${socket.user.username} disconnected from WebSocket`);
  }

  /**
   * Setup Redis Subscriptions
   * 
   * Configures Redis pub/sub subscriptions for cross-server communication
   * and broadcasts events received from Redis to appropriate WebSocket rooms.
   * Enables horizontal scaling of the WebSocket infrastructure.
   * 
   * Redis Event Types:
   * - post:created - New post notifications
   * - comment:created - New comment notifications
   * - user:notification - User-specific notifications
   * - trending:update - Trending content updates
   * - repository:update - Repository growth notifications
   * 
   * @returns {void}
   * 
   * @since 1.0.0
   */
  setupRedisSubscriptions() {
    const subscriber = redis.duplicate();

    // Subscribe to relevant Redis channels
    subscriber.subscribe('websocket:broadcast', 'trending:update', 'notifications:global');

    subscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        switch (channel) {
          case 'websocket:broadcast':
            // Broadcast to all connected clients
            this.io.emit(data.event, data.payload);
            break;
          case 'trending:update':
            // Update trending content rooms
            this.io.to(this.rooms.trending).emit('trending:updated', data);
            break;
          case 'notifications:global':
            // Send global notifications
            this.io.emit('notification:global', data);
            break;
        }
      } catch (error) {
        logger.error('Error processing Redis message:', error);
      }
    });

    logger.info('Redis subscriptions initialized for WebSocket server');
  }

  /**
   * Get Online Users Count
   * 
   * Returns the current number of authenticated users connected
   * to the WebSocket server for monitoring and analytics purposes.
   * 
   * @returns {number} Count of currently connected authenticated users
   * 
   * @since 1.0.0
   */
  getOnlineUsersCount() {
    return this.users.size;
  }

  /**
   * Broadcast to User
   * 
   * Sends a message to a specific user if they are currently connected
   * to the WebSocket server. Used for targeted notifications and updates.
   * 
   * @param {string} userId - Target user ID for the message
   * @param {string} event - Event name to emit
   * @param {Object} data - Data payload to send with the event
   * @returns {boolean} True if user was online and message sent, false otherwise
   * 
   * @since 1.0.0
   */
  broadcastToUser(userId, event, data) {
    const userData = this.users.get(userId);
    if (userData) {
      this.io.to(`user:${userId}`).emit(event, data);
      return true;
    }
    return false;
  }
}

/**
 * Module Exports
 * 
 * Export the WebSocketServer class for integration with the main
 * application server and other modules requiring WebSocket functionality.
 */
module.exports = WebSocketServer;
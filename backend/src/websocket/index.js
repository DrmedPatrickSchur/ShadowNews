const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const postsHandler = require('./handlers/posts.handler');
const commentsHandler = require('./handlers/comments.handler');
const notificationsHandler = require('./handlers/notifications.handler');

class WebSocketServer {
 constructor() {
   this.io = null;
   this.users = new Map();
   this.rooms = {
     posts: 'posts:live',
     trending: 'posts:trending',
     repositories: 'repositories:updates'
   };
 }

 initialize(server) {
   this.io = socketIO(server, {
     cors: {
       origin: process.env.FRONTEND_URL || 'http://localhost:3000',
       credentials: true
     },
     pingTimeout: 60000,
     pingInterval: 25000
   });

   this.setupMiddleware();
   this.setupEventHandlers();
   this.setupRedisSubscriptions();

   logger.info('WebSocket server initialized');
 }

 setupMiddleware() {
   this.io.use(async (socket, next) => {
     try {
       const token = socket.handshake.auth.token;
       if (!token) {
         return next(new Error('Authentication required'));
       }

       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await redis.get(`user:${decoded.userId}`);
       
       if (!user) {
         return next(new Error('User not found'));
       }

       socket.userId = decoded.userId;
       socket.user = JSON.parse(user);
       next();
     } catch (error) {
       logger.error('WebSocket authentication error:', error);
       next(new Error('Authentication failed'));
     }
   });
 }

 setupEventHandlers() {
   this.io.on('connection', (socket) => {
     this.handleConnection(socket);

     socket.on('disconnect', () => this.handleDisconnect(socket));
     sock
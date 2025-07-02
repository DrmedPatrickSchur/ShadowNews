const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const { connectDatabase } = require('./utils/database');
const { connectRedis } = require('./utils/redis');
const logger = require('./utils/logger');
const config = require('./config');
const websocketHandlers = require('./websocket');
const workers = require('./workers');

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
 cors: {
   origin: config.server.corsOrigins,
   credentials: true
 },
 transports: ['websocket', 'polling']
});

// Security middleware
app.use(helmet({
 contentSecurityPolicy: {
   directives: {
     defaultSrc: ["'self'"],
     styleSrc: ["'self'", "'unsafe-inline'"],
     scriptSrc: ["'self'"],
     imgSrc: ["'self'", "data:", "https:"],
     connectSrc: ["'self'", "wss:", "https:"],
   },
 },
}));

// CORS configuration
app.use(cors({
 origin: config.server.corsOrigins,
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
 allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression());

// MongoDB injection prevention
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
 windowMs: config.server.rateLimitWindow,
 max: config.server.rateLimitMax,
 message: 'Too many requests from this IP, please try again later.',
 standardHeaders: true,
 legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging
if (config.server.nodeEnv !== 'test') {
 app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Trust proxy
app.set('trust proxy', config.server.trustProxy);

// Initialize WebSocket handlers
websocketHandlers(io);

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
 logger.info(`${signal} signal received: closing HTTP server`);
 
 // Stop accepting new connections
 httpServer.close(async () => {
   logger.info('HTTP server closed');
   
   try {
     // Close database connections
     await mongoose.connection.close();
     logger.info('MongoDB connection closed');
     
     // Close Redis connection
     await redis.quit();
     logger.info('Redis connection closed');
     
     // Stop workers
     await workers.stopAll();
     logger.info('Background workers stopped');
     
     process.exit(0);
   } catch (error) {
     logger.error('Error during graceful shutdown:', error);
     process.exit(1);
   }
 });

 // Force close after 30 seconds
 setTimeout(() => {
   logger.error('Could not close connections in time, forcefully shutting down');
   process.exit(1);
 }, 30000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
 logger.error('Uncaught Exception:', error);
 process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
 logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
 process.exit(1);
});

// Start server
const startServer = async () => {
 try {
   // Connect to MongoDB
   await connectDatabase();
   logger.info('MongoDB connected successfully');

   // Connect to Redis
   await connectRedis();
   logger.info('Redis connected successfully');

   // Start background workers
   await workers.startAll();
   logger.info('Background workers started');

   // Start HTTP server
   const PORT = config.server.port || 5000;
   const HOST = config.server.host || '0.0.0.0';
   
   httpServer.listen(PORT, HOST, () => {
     logger.info(`Server running on http://${HOST}:${PORT}`);
     logger.info(`Environment: ${config.server.nodeEnv}`);
     logger.info(`WebSocket server ready`);
     
     // Send ready signal for process managers
     if (process.send) {
       process.send('ready');
     }
   });
 } catch (error) {
   logger.error('Failed to start server:', error);
   process.exit(1);
 }
};

// Initialize server
startServer();

// Export for testing
module.exports = { app, httpServer, io };
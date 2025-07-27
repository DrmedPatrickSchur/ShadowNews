/**
 * @fileoverview Database Configuration for ShadowNews Platform
 * 
 * Centralized MongoDB database configuration for the ShadowNews platform.
 * This module handles database connections, indexing strategies, connection
 * pooling, health monitoring, and backup configurations.
 * 
 * Key Features:
 * - MongoDB connection management with Mongoose ODM
 * - Database index creation and optimization
 * - Connection pooling and timeout configuration
 * - Health check and monitoring capabilities
 * - Graceful connection handling and error recovery
 * - Database backup and maintenance settings
 * - Transaction session management
 * - Collection organization and naming conventions
 * 
 * Dependencies:
 * - mongoose: MongoDB object modeling for Node.js
 * - logger: Winston-based logging system
 * - Environment variables for database configuration
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Required dependencies for database operations
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Database Configuration Object
 * Manages all MongoDB connection settings and database operations
 */
const dbConfig = {
  // MongoDB connection URI from environment or default local instance
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews',
  
  // Mongoose connection options for optimal performance and reliability
  options: {
    // Use new URL parser to avoid deprecation warnings
    useNewUrlParser: true,
    
    // Use new Server Discovery and Monitoring engine
    useUnifiedTopology: true,
    
    // Maximum number of connections in the connection pool
    maxPoolSize: 10,
    
    // Timeout for server selection (5 seconds)
    serverSelectionTimeoutMS: 5000,
    
    // Timeout for socket operations (45 seconds)
    socketTimeoutMS: 45000,
    
    // Use IPv4 for connection (more reliable than IPv6 in many environments)
    family: 4
  },

  /**
   * Database Collections Configuration
   * Centralized collection name management for consistency
   */
  collections: {
    // User accounts and authentication data
    users: 'users',
    
    // Posts/articles shared via email repositories
    posts: 'posts',
    
    // Comments on posts and discussions
    comments: 'comments',
    
    // Email repositories and their metadata
    repositories: 'repositories',
    
    // Email messages and processing data
    emails: 'emails',
    
    // User karma scores and history
    karma: 'karma',
    
    // Daily/weekly digest configurations and history
    digests: 'digests',
    
    // CSV upload tracking and processing status
    csvuploads: 'csvuploads'
  },

  /**
   * Database Indexes Configuration
   * Optimized indexes for query performance and data integrity
   */
  indexes: {
    // Users collection indexes for authentication and user management
    users: [
      { email: 1 },        // Unique index for login lookups
      { username: 1 },     // Unique index for profile queries
      { createdAt: -1 }    // Recent users sorting
    ],
    
    // Posts collection indexes for feed generation and content discovery
    posts: [
      { createdAt: -1 },      // Chronological feed sorting
      { score: -1 },          // Trending/popular content
      { userId: 1 },          // User-specific posts
      { hashtags: 1 },        // Tag-based filtering
      { 'repository.id': 1 }  // Repository-specific posts
    ],
    
    // Comments collection indexes for threaded discussions
    comments: [
      { postId: 1, createdAt: -1 },  // Post comments by date
      { userId: 1 },                 // User comment history
      { parentId: 1 }                // Threaded replies
    ],
    
    // Repositories collection indexes for discovery and management
    repositories: [
      { ownerId: 1 },       // User repository management
      { topic: 1 },         // Category-based discovery
      { emailCount: -1 },   // Activity-based sorting
      { createdAt: -1 }     // Recent repositories
    ],
    
    // Emails collection indexes for processing and association
    emails: [
      { repositoryId: 1 },  // Repository-specific emails
      { email: 1 },         // Sender-based filtering
      { verifiedAt: 1 }     // Verification status queries
    ]
  },

  /**
   * Establish database connection with error handling and monitoring
   * @returns {Promise<mongoose.Connection>} Connected mongoose instance
   */
  connect: async () => {
    try {
      await mongoose.connect(dbConfig.uri, dbConfig.options);
      logger.info('MongoDB connected successfully');
      
      // Set up connection event handlers for monitoring
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      // Create indexes for optimal performance (skip in test environment)
      if (process.env.NODE_ENV !== 'test') {
        await dbConfig.createIndexes();
      }

      return mongoose.connection;
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  },

  /**
   * Gracefully disconnect from database
   * @returns {Promise<void>}
   */
  disconnect: async () => {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('MongoDB disconnect error:', error);
      throw error;
    }
  },

  /**
   * Create database indexes for optimal query performance
   * @returns {Promise<void>}
   */
  createIndexes: async () => {
    try {
      const db = mongoose.connection.db;
      
      for (const [collection, indexes] of Object.entries(dbConfig.indexes)) {
        for (const index of indexes) {
          await db.collection(collection).createIndex(index);
        }
      }
      
      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating indexes:', error);
    }
  },

  /**
   * Database health check
   * @returns {Promise<boolean>} True if database is healthy
   */
  healthCheck: async () => {
    try {
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      return result.ok === 1;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  },

  /**
   * Create database session for transactions
   * @returns {Promise<mongoose.ClientSession>} Database session
   */
  getSession: async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
  },

  /**
   * Database backup configuration
   */
  backup: {
    // Enable automated backups
    enabled: process.env.BACKUP_ENABLED === 'true',
    
    // Backup schedule (cron format - 3 AM daily)
    schedule: process.env.BACKUP_SCHEDULE || '0 3 * * *',
    
    // Backup retention period in days
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS) || 7,
    
    // Backup storage path
    path: process.env.BACKUP_PATH || './backups'
  }
};

// Export database configuration
module.exports = dbConfig;
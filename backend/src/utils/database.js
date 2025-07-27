/**
 * @fileoverview Database Connection and Management Utility
 * 
 * Comprehensive MongoDB database connection and management utility for ShadowNews.
 * Provides robust connection handling, error management, performance monitoring,
 * and administrative operations with production-ready features.
 * 
 * Key Features:
 * - Robust MongoDB connection management with Mongoose
 * - Connection pooling and optimization settings
 * - Comprehensive error handling and logging
 * - Database health monitoring and ping functionality
 * - Index creation and management automation
 * - Transaction support with session management
 * - Database statistics and performance monitoring
 * - Graceful shutdown handling for production deployments
 * - Development utilities for testing and debugging
 * 
 * Security Features:
 * - Environment-based connection string management
 * - Production database protection against dangerous operations
 * - Connection timeout and socket timeout configuration
 * - Secure authentication and authorization support
 * - Connection encryption and SSL/TLS support ready
 * 
 * Performance Features:
 * - Connection pooling with configurable pool size
 * - Optimized connection settings for production use
 * - Efficient index creation and management
 * - Database statistics monitoring for optimization
 * - Connection state monitoring and health checks
 * - Memory-efficient transaction handling
 * 
 * Dependencies:
 * - mongoose: MongoDB object modeling library with robust features
 * - logger: Centralized logging utility for database operations
 * - models: Database model definitions for index automation
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Mongoose ODM for MongoDB with advanced features
const mongoose = require('mongoose');

// Centralized logging utility for database operations
const logger = require('./logger');

/**
 * Database Management Class
 * 
 * Comprehensive database connection and management utility that handles
 * MongoDB operations, connection lifecycle, error handling, and administrative
 * tasks for the ShadowNews platform.
 * 
 * Core Responsibilities:
 * - MongoDB connection establishment and management
 * - Connection pooling and performance optimization
 * - Error handling and recovery mechanisms
 * - Database health monitoring and diagnostics
 * - Index management and maintenance
 * - Transaction support for complex operations
 * - Administrative operations and utilities
 * 
 * @class Database
 * @since 1.0.0
 */
class Database {
  /**
   * Initialize Database Manager
   * 
   * Sets up database instance with null connection state ready for
   * connection establishment through the connect method.
   * 
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    // Connection instance placeholder
    this.connection = null;
  }

  /**
   * Establish MongoDB connection with robust configuration
   * 
   * Creates optimized MongoDB connection with production-ready settings including
   * connection pooling, timeouts, and comprehensive error handling. Configures
   * event listeners for connection monitoring and logging.
   * 
   * Connection Features:
   * - Production-optimized connection settings
   * - Connection pooling with 10 connections maximum
   * - Server selection timeout (5s) for quick failover
   * - Socket timeout (45s) for long-running operations
   * - Comprehensive event logging and monitoring
   * - Environment-based configuration support
   * 
   * @returns {Promise<Object>} MongoDB connection instance
   * 
   * @throws {Error} Connection errors that terminate the application
   * 
   * @example
   * // Establish database connection
   * const connection = await database.connect();
   * console.log('Database connected successfully');
   * 
   * @since 1.0.0
   * @async
   */
  async connect() {
    try {
      // Production-optimized connection options
      const options = {
        useNewUrlParser: true, // Use new URL parser for compatibility
        useUnifiedTopology: true, // Use new server discovery engine
        maxPoolSize: 10, // Maximum 10 connections in pool
        serverSelectionTimeoutMS: 5000, // 5 second server selection timeout
        socketTimeoutMS: 45000, // 45 second socket timeout for operations
      };

      // Environment-based connection string with fallback
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews';
      
      // Set up connection event listeners for monitoring
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.handleConnectionError(err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected successfully');
      });

      // Establish connection with configured options
      this.connection = await mongoose.connect(uri, options);
      
      logger.info('Database connection established with optimized settings');
      return this.connection;
    } catch (error) {
      logger.error('Database connection failed:', error);
      this.handleConnectionError(error);
      process.exit(1);
    }
  }

  /**
   * Gracefully disconnect from MongoDB
   * 
   * Closes MongoDB connection with proper cleanup and error handling.
   * Ensures all pending operations complete before disconnection.
   * 
   * @returns {Promise<void>} Disconnection completion
   * 
   * @example
   * // Gracefully disconnect from database
   * await database.disconnect();
   * console.log('Database disconnected');
   * 
   * @since 1.0.0
   * @async
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      this.connection = null;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Test database connectivity with ping
   * 
   * Sends ping command to MongoDB to verify connection health and
   * responsiveness. Used for health checks and monitoring.
   * 
   * @returns {Promise<boolean>} True if ping successful, false otherwise
   * 
   * @example
   * // Check database health
   * const isHealthy = await database.ping();
   * if (isHealthy) {
   *   console.log('Database is responsive');
   * }
   * 
   * @since 1.0.0
   * @async
   */
  async ping() {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('Database ping failed:', error);
      return false;
    }
  }

  /**
   * Get current database connection instance
   * 
   * Returns the active MongoDB connection instance for direct access
   * to underlying MongoDB operations when needed.
   * 
   * @returns {Object|null} Current MongoDB connection or null if not connected
   * 
   * @example
   * // Get connection for direct operations
   * const connection = database.getConnection();
   * if (connection) {
   *   // Perform direct MongoDB operations
   * }
   * 
   * @since 1.0.0
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Check if database is currently connected
   * 
   * Verifies database connection state using Mongoose readyState.
   * Returns true only when fully connected and ready for operations.
   * 
   * @returns {boolean} True if connected and ready, false otherwise
   * 
   * @example
   * // Check connection status
   * if (database.isConnected()) {
   *   // Safe to perform database operations
   * }
   * 
   * @since 1.0.0
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Create database indexes for all models
   * 
   * Automatically creates indexes for all registered Mongoose models to ensure
   * optimal query performance. Essential for production deployments.
   * 
   * Index Creation Features:
   * - Automatic detection of all registered models
   * - Parallel index creation for performance
   * - Comprehensive error handling and logging
   * - Production deployment automation support
   * 
   * @returns {Promise<void>} Index creation completion
   * 
   * @throws {Error} Index creation errors
   * 
   * @example
   * // Create all database indexes
   * await database.createIndexes();
   * console.log('All indexes created successfully');
   * 
   * @since 1.0.0
   * @async
   */
  async createIndexes() {
    try {
      logger.info('Creating database indexes...');
      
      // Import models to ensure they're registered with Mongoose
      require('../models');
      
      // Create indexes for all registered models in parallel
      await Promise.all(
        mongoose.modelNames().map(async (modelName) => {
          await mongoose.model(modelName).createIndexes();
          logger.debug(`Indexes created for model: ${modelName}`);
        })
      );
      
      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Drop entire database (development only)
   * 
   * Completely removes all database contents including collections and indexes.
   * Protected against accidental execution in production environments.
   * 
   * Safety Features:
   * - Production environment protection
   * - Explicit error for production attempts
   * - Complete database cleanup for testing
   * - Comprehensive logging for audit trails
   * 
   * @returns {Promise<void>} Database drop completion
   * 
   * @throws {Error} Production environment protection or drop errors
   * 
   * @example
   * // Drop database in development/test environment
   * if (process.env.NODE_ENV !== 'production') {
   *   await database.dropDatabase();
   * }
   * 
   * @since 1.0.0
   * @async
   */
  async dropDatabase() {
    // Prevent accidental production database deletion
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop production database');
    }
    
    try {
      await mongoose.connection.db.dropDatabase();
      logger.info('Database dropped successfully');
    } catch (error) {
      logger.error('Error dropping database:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive database statistics
   * 
   * Retrieves detailed database performance and usage statistics for
   * monitoring, optimization, and capacity planning.
   * 
   * Statistics Include:
   * - Database name and collection count
   * - Data size and index size metrics
   * - Total database size and average object size
   * - Object count for capacity planning
   * - Performance metrics for optimization
   * 
   * @returns {Promise<Object|null>} Database statistics object or null if error
   * 
   * @example
   * // Get database performance metrics
   * const stats = await database.getStats();
   * console.log(`Database size: ${stats.totalSize} bytes`);
   * console.log(`Collections: ${stats.collections}`);
   * 
   * @since 1.0.0
   * @async
   */
  async getStats() {
    try {
      const admin = mongoose.connection.db.admin();
      const dbStats = await admin.command({ dbStats: 1 });
      
      return {
        database: dbStats.db,
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        indexSize: dbStats.indexSize,
        totalSize: dbStats.totalSize,
        avgObjSize: dbStats.avgObjSize,
        objects: dbStats.objects,
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return null;
    }
  }

  /**
   * Execute database transaction with session management
   * 
   * Provides transactional database operations with automatic session
   * management, rollback on errors, and proper resource cleanup.
   * 
   * Transaction Features:
   * - Automatic session creation and cleanup
   * - ACID compliance for data consistency
   * - Automatic rollback on errors
   * - Proper resource management
   * - Callback-based operation execution
   * 
   * @param {Function} callback - Async function to execute within transaction
   * @returns {Promise<*>} Result from callback function
   * 
   * @throws {Error} Transaction or callback execution errors
   * 
   * @example
   * // Execute operations in transaction
   * const result = await database.transaction(async (session) => {
   *   const user = await User.create([userData], { session });
   *   const post = await Post.create([postData], { session });
   *   return { user, post };
   * });
   * 
   * @since 1.0.0
   * @async
   */
  async transaction(callback) {
    const session = await mongoose.startSession();
    
    try {
      let result;
      
      // Execute callback within transaction with automatic rollback
      await session.withTransaction(async () => {
        result = await callback(session);
      });
      
      return result;
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    } finally {
      // Ensure session is always cleaned up
      await session.endSession();
    }
  }

  /**
   * Handle connection errors with detailed analysis
   * 
   * Analyzes connection errors to provide specific guidance and
   * appropriate error responses based on error types.
   * 
   * Error Types Handled:
   * - Network connectivity errors
   * - Server selection errors
   * - Authentication failures
   * - Timeout errors
   * - Configuration errors
   * 
   * @param {Error} error - Connection error to analyze
   * 
   * @since 1.0.0
   * @private
   */
  handleConnectionError(error) {
    logger.error('MongoDB connection error:', error);
    
    // Provide specific guidance based on error type
    if (error.name === 'MongoNetworkError') {
      logger.error('Network error: Check if MongoDB is running and accessible');
    } else if (error.name === 'MongooseServerSelectionError') {
      logger.error('Server selection error: Verify connection string and network access');
    } else if (error.name === 'MongoAuthenticationError') {
      logger.error('Authentication error: Check username and password');
    } else if (error.name === 'MongoTimeoutError') {
      logger.error('Timeout error: Check network latency and server load');
    }
  }

  /**
   * Graceful shutdown with connection cleanup
   * 
   * Handles application termination signals to ensure proper database
   * disconnection and resource cleanup before process exit.
   * 
   * Shutdown Features:
   * - Graceful connection termination
   * - Pending operation completion
   * - Resource cleanup and logging
   * - Process exit coordination
   * 
   * @since 1.0.0
   */
  gracefulShutdown() {
    mongoose.connection.close(() => {
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  }
}

const database = new Database();

// Handle process termination
process.on('SIGINT', () => database.gracefulShutdown());
process.on('SIGTERM', () => database.gracefulShutdown());

module.exports = database;
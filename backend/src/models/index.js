/**
 * @fileoverview Database Models Index for ShadowNews Platform
 * 
 * Centralized module exports and database initialization for all Mongoose models.
 * This file serves as the main entry point for database models, providing
 * unified access to all schemas and database operations.
 * 
 * Key Features:
 * - Centralized model imports and exports
 * - Database index creation and optimization
 * - Model initialization and dependency management
 * - Error handling for database schema setup
 * - Performance monitoring for index creation
 * 
 * Exported Models:
 * - User: User accounts and authentication
 * - Post: Content posts and articles
 * - Comment: Threaded discussions and replies
 * - Repository: Email repositories and collections
 * - Email: Email processing and tracking
 * - Karma: User reputation and point tracking
 * 
 * Database Operations:
 * - createIndexes(): Optimizes database performance
 * - initializeModels(): Sets up model relationships
 * 
 * Dependencies:
 * - mongoose: MongoDB object modeling
 * - All model schemas from the models directory
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Required dependencies for database operations
const mongoose = require('mongoose');

// Import all database models
const User = require('./User.model');
const Post = require('./Post.model');
const Comment = require('./Comment.model');
const Repository = require('./Repository.model');
const Email = require('./Email.model');
const Karma = require('./Karma.model');

/**
 * Create Database Indexes
 * Establishes optimized indexes across all models for enhanced query performance
 * 
 * This function ensures that all necessary database indexes are created
 * to support efficient querying, sorting, and filtering operations across
 * the ShadowNews platform.
 * 
 * @returns {Promise<void>} Resolves when all indexes are created
 */
const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');
    
    // Create indexes for each model in parallel for faster setup
    await Promise.all([
      User.createIndexes(),        // User authentication and profile indexes
      Post.createIndexes(),        // Post content and ranking indexes
      Comment.createIndexes(),     // Comment threading and voting indexes
      Repository.createIndexes(),  // Repository discovery and management indexes
      Email.createIndexes(),       // Email processing and tracking indexes
      Karma.createIndexes()        // Karma calculation and leaderboard indexes
    ]);
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
    
    // Don't throw error in production to allow application to start
    // Indexes can be created manually if needed
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
};

/**
 * Initialize Database Models
 * Sets up model relationships and prepares database for operation
 * 
 * This function handles the complete initialization of the database layer,
 * ensuring all models are properly configured and indexes are optimized
 * for the expected query patterns.
 * 
 * @returns {Promise<void>} Resolves when initialization is complete
 */
const initializeModels = async () => {
  try {
    console.log('Initializing database models...');
    
    // Create optimized indexes for all models
    await createIndexes();
    
    console.log('Database models initialized successfully');
  } catch (error) {
    console.error('Error initializing database models:', error);
    throw error;
  }
};

/**
 * Export Database Models and Utilities
 * Makes all models and initialization functions available to the application
 */
module.exports = {
  // Core database models
  User,        // User accounts, authentication, and profiles
  Post,        // Content posts and articles
  Comment,     // Threaded discussions and comments
  Repository,  // Email repositories and collections
  Email,       // Email processing and tracking
  Karma,       // User reputation and karma system
  
  // Database initialization functions
  initializeModels,  // Complete database setup
  createIndexes      // Index creation utility
};
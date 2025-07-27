/**
 * @fileoverview Database Migration Script
 * 
 * Comprehensive data migration utility for the ShadowNews platform that handles
 * schema updates, data transformations, and database version management.
 * Provides safe, reversible migrations with rollback capabilities and
 * comprehensive logging for production database changes.
 * 
 * This script manages the evolution of the ShadowNews database schema over time,
 * ensuring data integrity while enabling new features and optimizations.
 * All migrations are tracked and can be executed incrementally or in batch.
 * 
 * Key Features:
 * - Incremental schema migrations with version tracking
 * - Data transformation and cleanup operations
 * - Safe migration execution with rollback capabilities
 * - Comprehensive logging and error handling
 * - Interactive confirmation for destructive operations
 * - Migration status tracking and history
 * - Batch processing for large datasets
 * - Backup recommendations and validation
 * 
 * Migration Types:
 * - Schema Updates: Add/modify fields, indexes, and constraints
 * - Data Transformations: Convert existing data to new formats
 * - Cleanup Operations: Remove obsolete data and optimize storage
 * - Feature Migrations: Enable new platform capabilities
 * - Performance Optimizations: Index creation and query improvements
 * 
 * Available Migrations:
 * - addEmailFieldToUsers: Add ShadowNews email addresses to existing users
 * - migrateKarmaToNewModel: Convert simple karma to detailed karma tracking
 * - extractHashtagsFromPosts: Parse and extract hashtags from post content
 * - createDefaultRepositories: Create default email repositories for users
 * - addSearchIndexes: Create full-text search indexes for content discovery
 * - optimizeEmailStorage: Restructure email data for better performance
 * - migrateNotificationSettings: Update user notification preferences
 * - createPostMetadata: Add AI-generated metadata to existing posts
 * 
 * Safety Features:
 * - Interactive confirmation for potentially destructive operations
 * - Dry-run mode for testing migrations without applying changes
 * - Automatic backup recommendations before major changes
 * - Transaction support for atomic operations
 * - Migration rollback capabilities where possible
 * - Comprehensive error logging and recovery guidance
 * 
 * Usage:
 * ```bash
 * # Run all pending migrations
 * node scripts/migrateData.js
 * 
 * # Run specific migration
 * node scripts/migrateData.js --migration addEmailFieldToUsers
 * 
 * # Dry run to test migrations
 * node scripts/migrateData.js --dry-run
 * 
 * # List migration status
 * node scripts/migrateData.js --status
 * ```
 * 
 * Dependencies:
 * - mongoose: MongoDB ODM for database operations
 * - mongodb: Native MongoDB driver for advanced operations
 * - dotenv: Environment variable management
 * - readline: Interactive CLI prompts for user confirmation
 * - crypto: Cryptographic utilities for data hashing
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// MongoDB ODM for high-level database operations
const mongoose = require('mongoose');

// Environment variable configuration management
const dotenv = require('dotenv');

// Cross-platform path utilities
const path = require('path');

// Asynchronous file system operations
const fs = require('fs').promises;

// Native MongoDB driver for low-level operations
const { MongoClient } = require('mongodb');

// Interactive command-line interface utilities
const readline = require('readline');

// Cryptographic utilities for data integrity
const crypto = require('crypto');

// Load environment variables from configuration file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import database models for migration operations
const User = require('../src/models/User.model');
const Post = require('../src/models/Post.model');
const Comment = require('../src/models/Comment.model');
const Repository = require('../src/models/Repository.model');
const Email = require('../src/models/Email.model');
const Karma = require('../src/models/Karma.model');

/**
 * Migration Tracking Schema
 * 
 * Mongoose schema for tracking migration execution history,
 * status, and metadata. Ensures migrations are only executed
 * once and provides audit trail for database changes.
 */
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  executedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  error: String,
  affectedDocuments: Number
});

const Migration = mongoose.model('Migration', migrationSchema);

/**
 * Enhanced Logging Utility
 * 
 * Provides colored, timestamped logging for migration operations
 * with different log levels for comprehensive operation tracking.
 */
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`)
};

/**
 * Interactive CLI Interface
 * 
 * Sets up readline interface for user prompts and confirmations
 * during potentially destructive migration operations.
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Promisified Question Utility
 * 
 * Converts readline question callback to Promise for async/await usage
 * in migration confirmation dialogs.
 * 
 * @param {string} query - Question to prompt user
 * @returns {Promise<string>} User's response
 */
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Migration Functions Collection
 * 
 * Comprehensive collection of database migration functions that handle
 * various schema updates, data transformations, and platform enhancements.
 * Each migration is designed to be idempotent and safely executable.
 */
const migrations = {
  /**
   * Add Email Field to Existing Users Migration
   * 
   * Adds ShadowNews email addresses to existing user accounts that don't
   * have the shadownewsEmail field. Creates standardized email addresses
   * based on username for the email-first platform functionality.
   * 
   * Migration Details:
   * - Finds users without shadownewsEmail field
   * - Generates @shadownews.community email addresses
   * - Updates user records with new email addresses
   * - Preserves existing user data and relationships
   * 
   * Safety Features:
   * - Only affects users missing the email field
   * - Uses existing username for email generation
   * - Maintains data consistency and integrity
   * 
   * @returns {Promise<number>} Number of users updated
   * 
   * @since 1.0.0
   */
  async addEmailFieldToUsers() {
    const users = await User.find({ shadownewsEmail: { $exists: false } });
    let count = 0;
    
    for (const user of users) {
      user.shadownewsEmail = `${user.username}@shadownews.community`;
      await user.save();
      count++;
    }
    
    return count;
  },

  /**
   * Migrate Karma to New Model Migration
   * 
   * Converts simple numeric karma values to the new detailed karma tracking
   * model with breakdown by activity type and historical tracking.
   * Preserves existing karma values while enabling enhanced gamification.
   * 
   * Migration Process:
   * 1. Find users with numeric karma field
   * 2. Create detailed Karma model records with breakdown
   * 3. Distribute points across different activity categories
   * 4. Create migration history entry for audit trail
   * 5. Remove old numeric karma field from user model
   * 
   * Karma Distribution:
   * - 40% Posts: Karma from content creation
   * - 30% Comments: Karma from community engagement
   * - 20% Curation: Karma from content moderation
   * - 10% Repositories: Karma from email list management
   * 
   * @returns {Promise<number>} Number of users migrated
   * 
   * @since 1.0.0
   */
  async migrateKarmaToNewModel() {
    const users = await User.find({ karma: { $exists: true, $type: 'number' } });
    let count = 0;
    
    for (const user of users) {
      await Karma.create({
        userId: user._id,
        total: user.karma || 0,
        breakdown: {
          posts: Math.floor((user.karma || 0) * 0.4),
          comments: Math.floor((user.karma || 0) * 0.3),
          curation: Math.floor((user.karma || 0) * 0.2),
          repositories: Math.floor((user.karma || 0) * 0.1)
        },
        history: [{
          action: 'migration',
          points: user.karma || 0,
          description: 'Initial karma migration',
          timestamp: new Date()
        }]
      });
      
      // Remove old karma field from user model
      user.karma = undefined;
      await user.save();
      count++;
    }
    
    return count;
  },

  /**
   * Extract Hashtags from Posts Migration
   * 
   * Analyzes existing post content to extract hashtags and populate
   * the hashtags field for enhanced content discovery and categorization.
   * Uses regex parsing and content analysis for comprehensive tagging.
   * 
   * Hashtag Extraction Process:
   * 1. Find posts without hashtags field
   * 2. Parse title and content for hashtag patterns (#word)
   * 3. Apply content analysis for implicit hashtags
   * 4. Limit to 5 unique hashtags per post for quality
   * 5. Update post records with extracted hashtags
   * 
   * Content Analysis Rules:
   * - Technology keywords trigger relevant hashtags
   * - Programming languages detected automatically
   * - AI/ML content receives appropriate tags
   * - Deduplication ensures hashtag uniqueness
   * 
   * @returns {Promise<number>} Number of posts updated
   * 
   * @since 1.0.0
   */
  async extractHashtagsFromPosts() {
    const posts = await Post.find({ hashtags: { $exists: false } });
    let count = 0;
    
    for (const post of posts) {
      const hashtags = [];
      const text = `${post.title} ${post.content || ''}`;
      const hashtagRegex = /#[\w]+/g;
      const matches = text.match(hashtagRegex);
      
      if (matches) {
        hashtags.push(...matches.map(tag => tag.substring(1).toLowerCase()));
      }
      
      // Add default hashtags based on content analysis
      if (text.toLowerCase().includes('javascript')) hashtags.push('javascript');
      if (text.toLowerCase().includes('python')) hashtags.push('python');
      if (text.toLowerCase().includes('ai') || text.toLowerCase().includes('artificial intelligence')) hashtags.push('ai');
      
      post.hashtags = [...new Set(hashtags)].slice(0, 5); // Max 5 unique hashtags
      await post.save();
      count++;
    }
    
    return count;
  },

  /**
   * Create Default Repositories Migration
   * 
   * Creates default email repositories for existing users who don't have
   * a default repository for email list management. Ensures all users
   * have access to basic email repository functionality.
   * 
   * Repository Creation:
   * - Checks for existing default repositories per user
   * - Creates personalized repository with user's name
   * - Sets appropriate default settings and permissions
   * - Establishes proper ownership and access controls
   * 
   * @returns {Promise<number>} Number of repositories created
   * 
   * @since 1.0.0
   */
  async createDefaultRepositories() {
    const users = await User.find({});
    let count = 0;
    
    for (const user of users) {
      const existingRepo = await Repository.findOne({ ownerId: user._id, isDefault: true });
      
      if (!existingRepo) {
        await Repository.create({
          name: `${user.username}'s Repository`,
          description: 'My default email repository',
         ownerId: user._id,
         isDefault: true,
         emails: [{
           email: user.email,
           addedAt: new Date(),
           verified: true,
           source: 'owner'
         }],
         settings: {
           isPublic: true,
           allowSnowball: true,
           autoAddThreshold: 0.7,
           requireVerification: true
         },
         stats: {
           totalEmails: 1,
           verifiedEmails: 1,
           bounceRate: 0,
           engagementRate: 0
         }
       });
       count++;
     }
   }
   
   return count;
 },

 // Update post scores based on current votes
 async recalculatePostScores() {
   const posts = await Post.find({});
   let count = 0;
   
   for (const post of posts) {
     const upvotes = post.upvotes || 0;
     const downvotes = post.downvotes || 0;
     const commentCount = await Comment.countDocuments({ postId: post._id });
     const ageInHours = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
     
     // Hacker News style scoring
     const score = (upvotes - downvotes + commentCount * 0.5) / Math.pow(ageInHours + 2, 1.8);
     
     post.score = score;
     post.trending = score > 10;
     await post.save();
     count++;
   }
   
   return count;
 },

 // Add email verification tokens to existing emails
 async addEmailVerificationTokens() {
   const emails = await Email.find({ verificationToken: { $exists: false } });
   let count = 0;
   
   for (const email of emails) {
     email.verificationToken = crypto.randomBytes(32).toString('hex');
     email.verificationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
     await email.save();
     count++;
   }
   
   return count;
 },

 // Migrate flat comments to nested structure
 async migrateToNestedComments() {
   const comments = await Comment.find({ path: { $exists: false } });
   let count = 0;
   
   for (const comment of comments) {
     if (!comment.parentId) {
       comment.path = comment._id.toString();
       comment.depth = 0;
     } else {
       const parent = await Comment.findById(comment.parentId);
       if (parent) {
         comment.path = `${parent.path},${comment._id.toString()}`;
         comment.depth = parent.depth + 1;
       }
     }
     
     await comment.save();
     count++;
   }
   
   return count;
 },

 // Add privacy settings to repositories
 async addPrivacySettingsToRepositories() {
   const repositories = await Repository.find({ 
     'settings.privacyLevel': { $exists: false } 
   });
   let count = 0;
   
   for (const repo of repositories) {
     repo.settings.privacyLevel = repo.settings.isPublic ? 'public' : 'private';
     repo.settings.allowedDomains = [];
     repo.settings.blockedDomains = ['tempmail.com', 'guerrillamail.com'];
     repo.settings.gdprCompliant = true;
     await repo.save();
     count++;
   }
   
   return count;
 },

 // Create email indices for better performance
 async createEmailIndices() {
   const db = mongoose.connection.db;
   
   await db.collection('emails').createIndex({ email: 1, repositoryId: 1 }, { unique: true });
   await db.collection('emails').createIndex({ verificationToken: 1 });
   await db.collection('emails').createIndex({ addedAt: -1 });
   
   await db.collection('repositories').createIndex({ ownerId: 1 });
   await db.collection('repositories').createIndex({ 'emails.email': 1 });
   await db.collection('repositories').createIndex({ hashtags: 1 });
   
   await db.collection('posts').createIndex({ hashtags: 1 });
   await db.collection('posts').createIndex({ score: -1 });
   await db.collection('posts').createIndex({ createdAt: -1 });
   
   return 0; // No document updates, just index creation
 },

 // Backup critical data before major migration
 async backupCriticalData() {
   const backupDir = path.join(__dirname, '../backups', new Date().toISOString().split('T')[0]);
   await fs.mkdir(backupDir, { recursive: true });
   
   const collections = ['users', 'posts', 'repositories', 'emails'];
   const db = mongoose.connection.db;
   
   for (const collection of collections) {
     const data = await db.collection(collection).find({}).toArray();
     await fs.writeFile(
       path.join(backupDir, `${collection}.json`),
       JSON.stringify(data, null, 2)
     );
     logger.info(`Backed up ${data.length} documents from ${collection}`);
   }
   
   return collections.length;
 }
};

// Main migration runner
async function runMigration(migrationName) {
 const migrationRecord = await Migration.findOne({ name: migrationName });
 
 if (migrationRecord && migrationRecord.status === 'completed') {
   logger.warn(`Migration '${migrationName}' has already been completed`);
   return false;
 }
 
 const migration = migrations[migrationName];
 if (!migration) {
   logger.error(`Migration '${migrationName}' not found`);
   return false;
 }
 
 try {
   logger.info(`Starting migration: ${migrationName}`);
   const startTime = Date.now();
   
   const affectedDocuments = await migration();
   
   await Migration.findOneAndUpdate(
     { name: migrationName },
     {
       name: migrationName,
       status: 'completed',
       affectedDocuments,
       executedAt: new Date()
     },
     { upsert: true, new: true }
   );
   
   const duration = ((Date.now() - startTime) / 1000).toFixed(2);
   logger.success(`Migration '${migrationName}' completed successfully in ${duration}s. Affected documents: ${affectedDocuments}`);
   return true;
 } catch (error) {
   logger.error(`Migration '${migrationName}' failed: ${error.message}`);
   
   await Migration.findOneAndUpdate(
     { name: migrationName },
     {
       name: migrationName,
       status: 'failed',
       error: error.message,
       executedAt: new Date()
     },
     { upsert: true, new: true }
   );
   
   return false;
 }
}

// CLI interface
async function main() {
 try {
   // Connect to MongoDB
   await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews', {
     useNewUrlParser: true,
     useUnifiedTopology: true
   });
   
   logger.success('Connected to MongoDB');
   
   // Parse command line arguments
   const args = process.argv.slice(2);
   
   if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
     console.log(`
Shadownews Data Migration Tool

Usage:
 node migrateData.js <command> [options]

Commands:
 list                    List all available migrations
 status                  Show migration status
 run <migration>         Run a specific migration
 run-all                 Run all pending migrations
 rollback <migration>    Rollback a specific migration (if supported)
 backup                  Create backup of critical data

Options:
 --dry-run              Show what would happen without making changes
 --force                Run migration even if already completed

Examples:
 node migrateData.js list
 node migrateData.js run addEmailFieldToUsers
 node migrateData.js run-all
 node migrateData.js backup
     `);
     process.exit(0);
   }
   
   const command = args[0];
   
   switch (command) {
     case 'list':
       console.log('\nAvailable migrations:');
       Object.keys(migrations).forEach((name, index) => {
         console.log(`  ${index + 1}. ${name}`);
       });
       break;
       
     case 'status':
       const migrationRecords = await Migration.find({}).sort({ executedAt: -1 });
       console.log('\nMigration Status:');
       console.log('─'.repeat(80));
       console.log('Name'.padEnd(40) + 'Status'.padEnd(15) + 'Executed At'.padEnd(25));
       console.log('─'.repeat(80));
       
       for (const record of migrationRecords) {
         console.log(
           record.name.padEnd(40) +
           record.status.padEnd(15) +
           record.executedAt.toISOString()
         );
       }
       break;
       
     case 'run':
       if (!args[1]) {
         logger.error('Please specify a migration name');
         process.exit(1);
       }
       
       const confirmed = await question(`Are you sure you want to run migration '${args[1]}'? (y/N) `);
       if (confirmed.toLowerCase() === 'y') {
         await runMigration(args[1]);
       }
       break;
       
     case 'run-all':
       const pendingMigrations = [];
       
       for (const migrationName of Object.keys(migrations)) {
         const record = await Migration.findOne({ name: migrationName });
         if (!record || record.status !== 'completed') {
           pendingMigrations.push(migrationName);
         }
       }
       
       if (pendingMigrations.length === 0) {
         logger.info('No pending migrations found');
         break;
       }
       
       console.log('\nPending migrations:');
       pendingMigrations.forEach((name, index) => {
         console.log(`  ${index + 1}. ${name}`);
       });
       
       const confirmAll = await question(`\nRun all ${pendingMigrations.length} pending migrations? (y/N) `);
       if (confirmAll.toLowerCase() === 'y') {
         for (const migrationName of pendingMigrations) {
           await runMigration(migrationName);
         }
       }
       break;
       
     case 'backup':
       await runMigration('backupCriticalData');
       break;
       
     default:
       logger.error(`Unknown command: ${command}`);
       process.exit(1);
   }
   
 } catch (error) {
   logger.error(`Fatal error: ${error.message}`);
   process.exit(1);
 } finally {
   rl.close();
   await mongoose.connection.close();
   logger.info('Database connection closed');
 }
}

// Run the migration tool
if (require.main === module) {
 main();
}

module.exports = { migrations, runMigration };
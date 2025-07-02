const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;
const { MongoClient } = require('mongodb');
const readline = require('readline');
const crypto = require('crypto');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../src/models/User.model');
const Post = require('../src/models/Post.model');
const Comment = require('../src/models/Comment.model');
const Repository = require('../src/models/Repository.model');
const Email = require('../src/models/Email.model');
const Karma = require('../src/models/Karma.model');

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
 name: { type: String, required: true, unique: true },
 executedAt: { type: Date, default: Date.now },
 status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
 error: String,
 affectedDocuments: Number
});

const Migration = mongoose.model('Migration', migrationSchema);

// Utility functions
const logger = {
 info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
 error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
 success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`),
 warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`)
};

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Migration functions
const migrations = {
 // Add email field to existing users
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

 // Convert karma points to new karma model
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
     
     // Remove old karma field
     user.karma = undefined;
     await user.save();
     count++;
   }
   
   return count;
 },

 // Add hashtags to existing posts
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

 // Create default repositories for existing users
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
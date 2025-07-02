const mongoose = require('mongoose');
const logger = require('../utils/logger');

const dbConfig = {
 // MongoDB connection settings
 uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews',
 options: {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   maxPoolSize: 10,
   serverSelectionTimeoutMS: 5000,
   socketTimeoutMS: 45000,
   family: 4
 },

 // Database collections configuration
 collections: {
   users: 'users',
   posts: 'posts',
   comments: 'comments',
   repositories: 'repositories',
   emails: 'emails',
   karma: 'karma',
   digests: 'digests',
   csvuploads: 'csvuploads'
 },

 // Indexes configuration
 indexes: {
   users: [
     { email: 1 },
     { username: 1 },
     { createdAt: -1 }
   ],
   posts: [
     { createdAt: -1 },
     { score: -1 },
     { userId: 1 },
     { hashtags: 1 },
     { 'repository.id': 1 }
   ],
   comments: [
     { postId: 1, createdAt: -1 },
     { userId: 1 },
     { parentId: 1 }
   ],
   repositories: [
     { ownerId: 1 },
     { topic: 1 },
     { emailCount: -1 },
     { createdAt: -1 }
   ],
   emails: [
     { repositoryId: 1 },
     { email: 1 },
     { verifiedAt: 1 }
   ]
 },

 // Connection handlers
 connect: async () => {
   try {
     await mongoose.connect(dbConfig.uri, dbConfig.options);
     logger.info('MongoDB connected successfully');
     
     // Set up connection event handlers
     mongoose.connection.on('error', (err) => {
       logger.error('MongoDB connection error:', err);
     });

     mongoose.connection.on('disconnected', () => {
       logger.warn('MongoDB disconnected');
     });

     mongoose.connection.on('reconnected', () => {
       logger.info('MongoDB reconnected');
     });

     // Create indexes
     if (process.env.NODE_ENV !== 'test') {
       await dbConfig.createIndexes();
     }

     return mongoose.connection;
   } catch (error) {
     logger.error('MongoDB connection failed:', error);
     throw error;
   }
 },

 disconnect: async () => {
   try {
     await mongoose.disconnect();
     logger.info('MongoDB disconnected successfully');
   } catch (error) {
     logger.error('MongoDB disconnect error:', error);
     throw error;
   }
 },

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

 // Health check
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

 // Session configuration for transactions
 getSession: async () => {
   const session = await mongoose.startSession();
   session.startTransaction();
   return session;
 },

 // Backup configuration
 backup: {
   enabled: process.env.BACKUP_ENABLED === 'true',
   schedule: process.env.BACKUP_SCHEDULE || '0 3 * * *',
   retention: parseInt(process.env.BACKUP_RETENTION_DAYS) || 7,
   path: process.env.BACKUP_PATH || './backups'
 }
};

module.exports = dbConfig;
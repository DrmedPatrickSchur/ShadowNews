const mongoose = require('mongoose');
const logger = require('./logger');

class Database {
 constructor() {
   this.connection = null;
 }

 async connect() {
   try {
     const options = {
       useNewUrlParser: true,
       useUnifiedTopology: true,
       maxPoolSize: 10,
       serverSelectionTimeoutMS: 5000,
       socketTimeoutMS: 45000,
     };

     const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews';
     
     mongoose.connection.on('connected', () => {
       logger.info('MongoDB connected successfully');
     });

     mongoose.connection.on('error', (err) => {
       logger.error('MongoDB connection error:', err);
     });

     mongoose.connection.on('disconnected', () => {
       logger.warn('MongoDB disconnected');
     });

     this.connection = await mongoose.connect(uri, options);
     
     return this.connection;
   } catch (error) {
     logger.error('Database connection failed:', error);
     process.exit(1);
   }
 }

 async disconnect() {
   try {
     await mongoose.connection.close();
     logger.info('Database disconnected successfully');
   } catch (error) {
     logger.error('Error disconnecting from database:', error);
   }
 }

 async ping() {
   try {
     await mongoose.connection.db.admin().ping();
     return true;
   } catch (error) {
     logger.error('Database ping failed:', error);
     return false;
   }
 }

 getConnection() {
   return this.connection;
 }

 isConnected() {
   return mongoose.connection.readyState === 1;
 }

 async createIndexes() {
   try {
     logger.info('Creating database indexes...');
     
     // Import models to ensure indexes are created
     require('../models');
     
     await Promise.all(
       mongoose.modelNames().map(async (modelName) => {
         await mongoose.model(modelName).createIndexes();
       })
     );
     
     logger.info('Database indexes created successfully');
   } catch (error) {
     logger.error('Error creating indexes:', error);
   }
 }

 async dropDatabase() {
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

 async transaction(callback) {
   const session = await mongoose.startSession();
   
   try {
     let result;
     
     await session.withTransaction(async () => {
       result = await callback(session);
     });
     
     return result;
   } finally {
     await session.endSession();
   }
 }

 handleConnectionError(error) {
   logger.error('MongoDB connection error:', error);
   
   if (error.name === 'MongoNetworkError') {
     logger.error('Network error: Check if MongoDB is running');
   } else if (error.name === 'MongooseServerSelectionError') {
     logger.error('Server selection error: Check connection string');
   }
 }

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
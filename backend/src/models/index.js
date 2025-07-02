const mongoose = require('mongoose');
const User = require('./User.model');
const Post = require('./Post.model');
const Comment = require('./Comment.model');
const Repository = require('./Repository.model');
const Email = require('./Email.model');
const Karma = require('./Karma.model');

// Create indexes
const createIndexes = async () => {
 try {
   await User.createIndexes();
   await Post.createIndexes();
   await Comment.createIndexes();
   await Repository.createIndexes();
   await Email.createIndexes();
   await Karma.createIndexes();
   console.log('Database indexes created successfully');
 } catch (error) {
   console.error('Error creating indexes:', error);
 }
};

// Initialize models
const initializeModels = async () => {
 await createIndexes();
};

module.exports = {
 User,
 Post,
 Comment,
 Repository,
 Email,
 Karma,
 initializeModels
};
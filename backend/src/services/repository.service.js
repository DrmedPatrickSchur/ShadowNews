const Repository = require('../models/Repository.model');
const Email = require('../models/Email.model');
const User = require('../models/User.model');
const csvService = require('./csv.service');
const snowballService = require('./snowball.service');
const emailService = require('./email.service');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const redis = require('../utils/redis');
const { ValidationError } = require('../utils/errors');

class RepositoryService {
 async createRepository(userId, data) {
   try {
     const user = await User.findById(userId);
     if (!user) {
       throw new ValidationError('User not found');
     }

     const repository = new Repository({
       name: data.name,
       description: data.description,
       owner: userId,
       hashtags: data.hashtags || [],
       emails: data.emails || [],
       isPublic: data.isPublic !== false,
       settings: {
         autoApprove: data.autoApprove || false,
         minKarmaToJoin: data.minKarmaToJoin || 0,
         allowSnowball: data.allowSnowball !== false,
         digestFrequency: data.digestFrequency || 'weekly',
         qualityThreshold: data.qualityThreshold || 0.7
       }
     });

     await repository.save();
     await this.cacheRepository(repository);
     
     logger.info(`Repository
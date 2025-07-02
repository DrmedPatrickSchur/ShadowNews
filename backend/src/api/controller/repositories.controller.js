const Repository = require('../../models/Repository.model');
const User = require('../../models/User.model');
const Email = require('../../models/Email.model');
const csvService = require('../../services/csv.service');
const snowballService = require('../../services/snowball.service');
const emailService = require('../../services/email.service');
const { validationResult } = require('express-validator');

// Get all repositories with pagination
exports.getAllRepositories = async (req, res) => {
 try {
   const { page = 1, limit = 20, sort = '-createdAt', topic, owner } = req.query;
   const query = {};
   
   if (topic) query.topic = new RegExp(topic, 'i');
   if (owner) query.owner = owner;

   const repositories = await Repository.find(query)
     .populate('owner', 'username email karma')
     .sort(sort)
     .limit(limit * 1)
     .skip((page - 1) * limit)
     .exec();

   const count = await Repository.countDocuments(query);

   res.json({
     repositories,
     totalPages: Math.ceil(count / limit),
     currentPage: page,
     total: count
   });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Get single repository by ID
exports.getRepositoryById = async (req, res) => {
 try {
   const repository = await Repository.findById(req.params.id)
     .populate('owner', 'username email karma')
     .populate('collaborators', 'username email');

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   res.json(repository);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Create new repository
exports.createRepository = async (req, res) => {
 try {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   const { name, description, topic, hashtags, isPrivate, initialEmails } = req.body;

   // Check if user has enough karma to create repository
   const user = await User.findById(req.user.id);
   if (user.karma < 500) {
     return res.status(403).json({ error: 'You need at least 500 karma to create a repository' });
   }

   // Check for duplicate repository name for this user
   const existingRepo = await Repository.findOne({ owner: req.user.id, name });
   if (existingRepo) {
     return res.status(400).json({ error: 'You already have a repository with this name' });
   }

   const repository = new Repository({
     name,
     description,
     topic,
     hashtags: hashtags || [],
     owner: req.user.id,
     isPrivate: isPrivate || false,
     emails: [],
     emailCount: 0,
     collaborators: [],
     settings: {
       autoApprove: false,
       qualityThreshold: 0.7,
       allowSnowball: true,
       digestFrequency: 'weekly'
     }
   });

   // Process initial emails if provided
   if (initialEmails && initialEmails.length > 0) {
     const validEmails = await emailService.validateEmails(initialEmails);
     repository.emails = validEmails.map(email => ({
       email,
       addedBy: req.user.id,
       verificationStatus: 'pending',
       source: 'manual'
     }));
     repository.emailCount = validEmails.length;
   }

   await repository.save();

   // Update user's repository count
   await User.findByIdAndUpdate(req.user.id, {
     $push: { repositories: repository._id },
     $inc: { karma: 100 }
   });

   res.status(201).json(repository);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Update repository
exports.updateRepository = async (req, res) => {
 try {
   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Check ownership or collaborator status
   if (repository.owner.toString() !== req.user.id && 
       !repository.collaborators.includes(req.user.id)) {
     return res.status(403).json({ error: 'You do not have permission to update this repository' });
   }

   const allowedUpdates = ['name', 'description', 'hashtags', 'isPrivate', 'settings'];
   const updates = Object.keys(req.body)
     .filter(key => allowedUpdates.includes(key))
     .reduce((obj, key) => {
       obj[key] = req.body[key];
       return obj;
     }, {});

   Object.assign(repository, updates);
   await repository.save();

   res.json(repository);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Delete repository
exports.deleteRepository = async (req, res) => {
 try {
   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Only owner can delete
   if (repository.owner.toString() !== req.user.id) {
     return res.status(403).json({ error: 'Only the owner can delete this repository' });
   }

   await repository.remove();

   // Update user's repository list
   await User.findByIdAndUpdate(req.user.id, {
     $pull: { repositories: repository._id }
   });

   res.json({ message: 'Repository deleted successfully' });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Add emails to repository
exports.addEmails = async (req, res) => {
 try {
   const { emails, source = 'manual' } = req.body;
   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Check permissions
   if (repository.owner.toString() !== req.user.id && 
       !repository.collaborators.includes(req.user.id)) {
     return res.status(403).json({ error: 'You do not have permission to add emails' });
   }

   // Validate and deduplicate emails
   const validEmails = await emailService.validateEmails(emails);
   const existingEmails = repository.emails.map(e => e.email);
   const newEmails = validEmails.filter(email => !existingEmails.includes(email));

   if (newEmails.length === 0) {
     return res.status(400).json({ error: 'No new valid emails to add' });
   }

   // Add new emails
   const emailDocs = newEmails.map(email => ({
     email,
     addedBy: req.user.id,
     verificationStatus: 'pending',
     source,
     addedAt: new Date()
   }));

   repository.emails.push(...emailDocs);
   repository.emailCount = repository.emails.length;
   await repository.save();

   // Trigger verification process
   await emailService.sendVerificationEmails(newEmails, repository._id);

   // Award karma for adding emails
   await User.findByIdAndUpdate(req.user.id, {
     $inc: { karma: newEmails.length * 2 }
   });

   res.json({
     message: `Successfully added ${newEmails.length} new emails`,
     newEmails: newEmails.length,
     totalEmails: repository.emailCount
   });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Upload CSV to repository
exports.uploadCSV = async (req, res) => {
 try {
   if (!req.file) {
     return res.status(400).json({ error: 'No CSV file uploaded' });
   }

   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Check permissions
   if (repository.owner.toString() !== req.user.id && 
       !repository.collaborators.includes(req.user.id)) {
     return res.status(403).json({ error: 'You do not have permission to upload CSV' });
   }

   // Parse CSV
   const emails = await csvService.parseEmailCSV(req.file.path);
   
   // Validate and deduplicate
   const validEmails = await emailService.validateEmails(emails);
   const existingEmails = repository.emails.map(e => e.email);
   const newEmails = validEmails.filter(email => !existingEmails.includes(email));

   if (newEmails.length === 0) {
     return res.status(400).json({ error: 'No new valid emails found in CSV' });
   }

   // Add emails with CSV source
   const emailDocs = newEmails.map(email => ({
     email,
     addedBy: req.user.id,
     verificationStatus: 'pending',
     source: 'csv',
     csvFileName: req.file.originalname,
     addedAt: new Date()
   }));

   repository.emails.push(...emailDocs);
   repository.emailCount = repository.emails.length;
   repository.lastCSVUpload = new Date();
   await repository.save();

   // Trigger snowball effect if enabled
   if (repository.settings.allowSnowball) {
     await snowballService.processSnowball(repository._id, newEmails);
   }

   // Award karma for CSV upload
   await User.findByIdAndUpdate(req.user.id, {
     $inc: { karma: Math.min(newEmails.length * 5, 100) }
   });

   res.json({
     message: 'CSV uploaded successfully',
     emailsFound: emails.length,
     validEmails: validEmails.length,
     newEmails: newEmails.length,
     totalEmails: repository.emailCount,
     snowballTriggered: repository.settings.allowSnowball
   });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Download repository emails as CSV
exports.downloadCSV = async (req, res) => {
 try {
   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Check permissions (private repos require ownership/collaboration)
   if (repository.isPrivate && 
       repository.owner.toString() !== req.user.id && 
       !repository.collaborators.includes(req.user.id)) {
     return res.status(403).json({ error: 'You do not have permission to download this repository' });
   }

   // Get verified emails only
   const verifiedEmails = repository.emails
     .filter(e => e.verificationStatus === 'verified')
     .map(e => ({
       email: e.email,
       addedDate: e.addedAt,
       source: e.source
     }));

   const csv = await csvService.generateEmailCSV(verifiedEmails);

   res.setHeader('Content-Type', 'text/csv');
   res.setHeader('Content-Disposition', `attachment; filename="${repository.name}-emails.csv"`);
   res.send(csv);

   // Track download
   repository.downloadCount = (repository.downloadCount || 0) + 1;
   await repository.save();
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Get repository statistics
exports.getRepositoryStats = async (req, res) => {
 try {
   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   const stats = {
     totalEmails: repository.emailCount,
     verifiedEmails: repository.emails.filter(e => e.verificationStatus === 'verified').length,
     pendingEmails: repository.emails.filter(e => e.verificationStatus === 'pending').length,
     bounceRate: repository.emails.filter(e => e.verificationStatus === 'bounced').length / repository.emailCount,
     sources: {
       manual: repository.emails.filter(e => e.source === 'manual').length,
       csv: repository.emails.filter(e => e.source === 'csv').length,
       snowball: repository.emails.filter(e => e.source === 'snowball').length,
       api: repository.emails.filter(e => e.source === 'api').length
     },
     growthRate: await this.calculateGrowthRate(repository),
     engagementRate: repository.engagementMetrics?.averageOpenRate || 0,
     lastActivity: repository.updatedAt,
     downloadCount: repository.downloadCount || 0,
     collaborators: repository.collaborators.length
   };

   res.json(stats);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Add collaborator to repository
exports.addCollaborator = async (req, res) => {
 try {
   const { userId } = req.body;
   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Only owner can add collaborators
   if (repository.owner.toString() !== req.user.id) {
     return res.status(403).json({ error: 'Only the owner can add collaborators' });
   }

   // Check if user exists
   const collaborator = await User.findById(userId);
   if (!collaborator) {
     return res.status(404).json({ error: 'User not found' });
   }

   // Check if already a collaborator
   if (repository.collaborators.includes(userId)) {
     return res.status(400).json({ error: 'User is already a collaborator' });
   }

   repository.collaborators.push(userId);
   await repository.save();

   // Notify the new collaborator
   await emailService.sendCollaboratorInvite(collaborator.email, repository);

   res.json({ message: 'Collaborator added successfully' });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Remove collaborator from repository
exports.removeCollaborator = async (req, res) => {
 try {
   const { userId } = req.params;
   const repository = await Repository.findById(req.params.id);

   if (!repository) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Only owner can remove collaborators
   if (repository.owner.toString() !== req.user.id) {
     return res.status(403).json({ error: 'Only the owner can remove collaborators' });
   }

   repository.collaborators = repository.collaborators.filter(
     collab => collab.toString() !== userId
   );
   await repository.save();

   res.json({ message: 'Collaborator removed successfully' });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Merge two repositories
exports.mergeRepositories = async (req, res) => {
 try {
   const { sourceRepoId } = req.body;
   const targetRepo = await Repository.findById(req.params.id);
   const sourceRepo = await Repository.findById(sourceRepoId);

   if (!targetRepo || !sourceRepo) {
     return res.status(404).json({ error: 'Repository not found' });
   }

   // Check ownership of both repositories
   if (targetRepo.owner.toString() !== req.user.id || 
       sourceRepo.owner.toString() !== req.user.id) {
     return res.status(403).json({ error: 'You must own both repositories to merge them' });
   }

   // Get all unique emails from source
   const sourceEmails = sourceRepo.emails.map(e => e.email);
   const targetEmails = targetRepo.emails.map(e => e.email);
   const newEmails = sourceEmails.filter(email => !targetEmails.includes(email));

   // Add new emails to target
   const emailDocs = sourceRepo.emails
     .filter(e => newEmails.includes(e.email))
     .map(e => ({
       ...e.toObject(),
       source: 'merge',
       mergedFrom: sourceRepo.name
     }));

   targetRepo.emails.push(...emailDocs);
   targetRepo.emailCount = targetRepo.emails.length;
   await targetRepo.save();

   // Archive source repository
   sourceRepo.isArchived = true;
   sourceRepo.archivedAt = new Date();
   sourceRepo.archiveReason = `Merged into ${targetRepo.name}`;
   await sourceRepo.save();

   res.json({
     message: 'Repositories merged successfully',
     emailsMerged: newEmails.length,
     totalEmails: targetRepo.emailCount
   });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Helper function to calculate growth rate
exports.calculateGrowthRate = async (repository) => {
 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
 
 const recentEmails = repository.emails.filter(e => 
   new Date(e.addedAt) > thirtyDaysAgo
 ).length;
 
 const totalEmails = repository.emailCount || 1;
 return (recentEmails / totalEmails) * 100;
};

// Search repositories
exports.searchRepositories = async (req, res) => {
 try {
   const { q, topic, minEmails, isPrivate } = req.query;
   const query = {};

   if (q) {
     query.$or = [
       { name: new RegExp(q, 'i') },
       { description: new RegExp(q, 'i') },
       { topic: new RegExp(q, 'i') }
     ];
   }

   if (topic) query.topic = new RegExp(topic, 'i');
   if (minEmails) query.emailCount = { $gte: parseInt(minEmails) };
   if (isPrivate !== undefined) query.isPrivate = isPrivate === 'true';

   const repositories = await Repository.find(query)
     .populate('owner', 'username karma')
     .sort('-emailCount')
     .limit(50)
     .exec();

   res.json(repositories);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};

// Get trending repositories
exports.getTrendingRepositories = async (req, res) => {
 try {
   const sevenDaysAgo = new Date();
   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

   const repositories = await Repository.aggregate([
     {
       $match: {
         isPrivate: false,
         updatedAt: { $gte: sevenDaysAgo }
       }
     },
     {
       $addFields: {
         recentGrowth: {
           $size: {
             $filter: {
               input: '$emails',
               cond: { $gte: ['$$this.addedAt', sevenDaysAgo] }
             }
           }
         }
       }
     },
     {
       $sort: { recentGrowth: -1 }
     },
     {
       $limit: 10
     }
   ]);

   await Repository.populate(repositories, {
     path: 'owner',
     select: 'username karma'
   });

   res.json(repositories);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
};
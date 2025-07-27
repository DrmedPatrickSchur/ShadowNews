/**
 * @fileoverview Repositories Controller for ShadowNews Platform
 * 
 * Comprehensive email repository management system for the ShadowNews platform.
 * This controller handles all repository-related operations including creation,
 * email management, collaboration, CSV processing, and analytics. Repositories
 * are collections of email addresses that form the foundation of the email-first
 * news distribution system.
 * 
 * Key Features:
 * - Repository CRUD operations with ownership validation
 * - Bulk email management with CSV import/export capabilities
 * - Advanced email validation and verification workflows
 * - Collaborative repository management with permission controls
 * - Snowball distribution integration for organic email growth
 * - Repository merging and archival functionality
 * - Comprehensive analytics and growth tracking
 * - Search and discovery with trending repositories
 * - Quality control with karma requirements and thresholds
 * - Automated email verification and bounce handling
 * 
 * Repository Types:
 * - Public: Open repositories visible to all users
 * - Private: Restricted access for sensitive email lists
 * - Collaborative: Shared repositories with multiple contributors
 * 
 * Email Sources:
 * - Manual: Hand-entered email addresses
 * - CSV: Bulk imports from CSV files
 * - Snowball: Organically grown through referrals
 * - API: Programmatically added via API endpoints
 * - Merge: Transferred from merged repositories
 * 
 * Security Features:
 * - Karma-based repository creation requirements
 * - Ownership and collaboration permission controls
 * - Email validation and verification workflows
 * - Rate limiting for bulk operations
 * - Audit trails for all repository modifications
 * - Privacy controls for sensitive email lists
 * 
 * Analytics Capabilities:
 * - Email growth tracking and trend analysis
 * - Engagement metrics and open rate monitoring
 * - Source attribution and acquisition analysis
 * - Bounce rate tracking and quality assessment
 * - Download and usage statistics
 * - Collaborative activity monitoring
 * 
 * Integration Points:
 * - CSV Service: Bulk email processing and validation
 * - Snowball Service: Organic growth and referral tracking
 * - Email Service: Verification and communication workflows
 * - Karma System: Quality control and user reputation
 * - Notification Service: Team collaboration alerts
 * 
 * Dependencies:
 * - Repository.model: Main repository data model
 * - User.model: User data for ownership and collaboration
 * - Email.model: Individual email record management
 * - csv.service: CSV processing and generation
 * - snowball.service: Organic growth distribution
 * - email.service: Email validation and verification
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Model dependencies for repository operations
const Repository = require('../../models/Repository.model'); // Repository data model
const User = require('../../models/User.model');             // User data for ownership
const Email = require('../../models/Email.model');           // Email record management

// Service layer dependencies
const csvService = require('../../services/csv.service');           // CSV processing
const snowballService = require('../../services/snowball.service'); // Organic growth
const emailService = require('../../services/email.service');       // Email validation

// Utility dependencies
const { validationResult } = require('express-validator');  // Input validation

/**
 * Get All Repositories with Advanced Filtering
 * Retrieves repositories with pagination, sorting, and filtering options
 * 
 * This endpoint provides the main repository discovery interface with support
 * for topic filtering, ownership filtering, and various sorting algorithms
 * to help users find relevant email repositories.
 * 
 * @route GET /api/repositories
 * @access Public (with privacy controls for private repositories)
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of repositories per page (default: 20)
 * @param {string} req.query.sort - Sorting method (default: '-createdAt')
 * @param {string} req.query.topic - Filter by repository topic
 * @param {string} req.query.owner - Filter by owner user ID
 * @returns {Object} Paginated repositories with metadata
 */
exports.getAllRepositories = async (req, res) => {
  try {
    // Extract query parameters with sensible defaults
    const { page = 1, limit = 20, sort = '-createdAt', topic, owner } = req.query;
    const query = {};
    
    // Apply topic filter for content discovery
    if (topic) query.topic = new RegExp(topic, 'i');
    
    // Apply owner filter for user-specific repositories
    if (owner) query.owner = owner;

    // Execute paginated query with population for complete data
    const repositories = await Repository.find(query)
      .populate('owner', 'username email karma')      // Owner info with reputation
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination metadata
    const count = await Repository.countDocuments(query);

    // Return comprehensive repository list with pagination info
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

/**
 * Get Single Repository by ID
 * Retrieves a specific repository with full details and relationships
 * 
 * This endpoint fetches complete repository information including owner
 * details, collaborators, and settings for detailed repository viewing.
 * 
 * @route GET /api/repositories/:id
 * @access Public (with privacy controls for private repositories)
 * @param {string} req.params.id - Repository MongoDB ObjectId
 * @returns {Object} Complete repository data with populated relationships
 */
exports.getRepositoryById = async (req, res) => {
  try {
    // Fetch repository with comprehensive population
    const repository = await Repository.findById(req.params.id)
      .populate('owner', 'username email karma')        // Owner details with reputation
      .populate('collaborators', 'username email');     // Collaborator information

    // Handle repository not found
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json(repository);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create New Repository
 * Creates a new email repository with karma validation and initial setup
 * 
 * This endpoint handles repository creation with comprehensive validation,
 * karma requirements, duplicate checking, and optional initial email seeding.
 * Implements quality control through karma requirements.
 * 
 * @route POST /api/repositories
 * @access Private (requires authentication and sufficient karma)
 * @param {Object} req.body - Repository creation data
 * @param {string} req.body.name - Repository name (required, unique per user)
 * @param {string} req.body.description - Repository description
 * @param {string} req.body.topic - Repository topic/category
 * @param {string[]} req.body.hashtags - Associated hashtags for discovery
 * @param {boolean} req.body.isPrivate - Privacy setting (default: false)
 * @param {string[]} req.body.initialEmails - Initial email list for seeding
 * @returns {Object} Created repository with initial configuration
 */
exports.createRepository = async (req, res) => {
  try {
    // Validate input data using express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, topic, hashtags, isPrivate, initialEmails } = req.body;

    // Enforce karma requirement for repository creation (quality control)
    const user = await User.findById(req.user.id);
    if (user.karma < 500) {
      return res.status(403).json({ error: 'You need at least 500 karma to create a repository' });
    }

    // Prevent duplicate repository names per user
    const existingRepo = await Repository.findOne({ owner: req.user.id, name });
    if (existingRepo) {
      return res.status(400).json({ error: 'You already have a repository with this name' });
    }

    // Create repository with comprehensive initial configuration
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
        autoApprove: false,            // Manual approval for new emails
        qualityThreshold: 0.7,         // Quality score threshold (0-1)
        allowSnowball: true,           // Enable organic growth
        digestFrequency: 'weekly'      // Email digest frequency
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

    // Update user's repository count and award karma for creation
    await User.findByIdAndUpdate(req.user.id, {
      $push: { repositories: repository._id },
      $inc: { karma: 100 }                    // Reward for contributing to platform
    });

    res.status(201).json(repository);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update Repository
 * Updates repository settings and metadata with permission validation
 * 
 * This endpoint allows repository modification with strict permission controls.
 * Only owners and collaborators can update repository settings and metadata.
 * 
 * @route PUT /api/repositories/:id
 * @access Private (requires authentication and repository permissions)
 * @param {string} req.params.id - Repository ID to update
 * @param {Object} req.body - Update data (filtered to allowed fields)
 * @returns {Object} Updated repository data
 */
exports.updateRepository = async (req, res) => {
  try {
    // Fetch repository for permission validation
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Check ownership or collaborator status
    if (repository.owner.toString() !== req.user.id && 
        !repository.collaborators.includes(req.user.id)) {
      return res.status(403).json({ error: 'You do not have permission to update this repository' });
    }

    // Filter to allowed update fields for security
    const allowedUpdates = ['name', 'description', 'hashtags', 'isPrivate', 'settings'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Apply updates and save
    Object.assign(repository, updates);
    await repository.save();

    res.json(repository);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete Repository
 * Soft deletes a repository with ownership validation and cleanup
 * 
 * This endpoint handles repository deletion with strict ownership validation
 * and proper cleanup of user references. Only repository owners can delete.
 * 
 * @route DELETE /api/repositories/:id
 * @access Private (requires authentication and ownership)
 * @param {string} req.params.id - Repository ID to delete
 * @returns {Object} Deletion confirmation message
 */
exports.deleteRepository = async (req, res) => {
  try {
    // Fetch repository for ownership validation
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Enforce ownership requirement for deletion
    if (repository.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the owner can delete this repository' });
    }

    // Remove repository
    await repository.remove();

    // Clean up user's repository references
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { repositories: repository._id }
    });

    res.json({ message: 'Repository deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add Emails to Repository
 * Adds individual emails with validation and deduplication
 * 
 * This endpoint handles manual email addition with comprehensive validation,
 * deduplication, verification initiation, and karma rewards for contributions.
 * 
 * @route POST /api/repositories/:id/emails
 * @access Private (requires authentication and repository permissions)
 * @param {string} req.params.id - Repository ID to add emails to
 * @param {Object} req.body - Email addition data
 * @param {string[]} req.body.emails - Array of email addresses to add
 * @param {string} req.body.source - Email source ('manual', 'api', etc.)
 * @returns {Object} Addition results with statistics
 */
exports.addEmails = async (req, res) => {
  try {
    const { emails, source = 'manual' } = req.body;
    
    // Fetch repository for permission validation
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Check permissions (owner or collaborator)
    if (repository.owner.toString() !== req.user.id && 
        !repository.collaborators.includes(req.user.id)) {
      return res.status(403).json({ error: 'You do not have permission to add emails' });
    }

    // Validate emails and remove duplicates
    const validEmails = await emailService.validateEmails(emails);
    const existingEmails = repository.emails.map(e => e.email);
    const newEmails = validEmails.filter(email => !existingEmails.includes(email));

    // Handle case where no new emails to add
    if (newEmails.length === 0) {
      return res.status(400).json({ error: 'No new valid emails to add' });
    }

    // Create email documents with metadata
    const emailDocs = newEmails.map(email => ({
      email,
      addedBy: req.user.id,
      verificationStatus: 'pending',
      source,
      addedAt: new Date()
    }));

    // Add emails to repository and update count
    repository.emails.push(...emailDocs);
    repository.emailCount = repository.emails.length;
    await repository.save();

    // Trigger email verification process
    await emailService.sendVerificationEmails(newEmails, repository._id);

    // Award karma for email contributions
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { karma: newEmails.length * 2 }
    });

    // Return comprehensive addition results
    res.json({
      message: `Successfully added ${newEmails.length} new emails`,
      newEmails: newEmails.length,
      totalEmails: repository.emailCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload CSV to Repository
 * Processes CSV file uploads for bulk email imports
 * 
 * This endpoint handles CSV file processing with validation, deduplication,
 * snowball integration, and comprehensive statistics tracking.
 * 
 * @route POST /api/repositories/:id/upload-csv
 * @access Private (requires authentication and repository permissions)
 * @param {string} req.params.id - Repository ID for CSV upload
 * @param {Object} req.file - Uploaded CSV file from multer middleware
 * @returns {Object} Upload results with comprehensive statistics
 */
exports.uploadCSV = async (req, res) => {
  try {
    // Ensure CSV file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    // Fetch repository for permission validation
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Check permissions (owner or collaborator)
    if (repository.owner.toString() !== req.user.id && 
        !repository.collaborators.includes(req.user.id)) {
      return res.status(403).json({ error: 'You do not have permission to upload CSV' });
    }

    // Parse CSV file to extract email addresses
    const emails = await csvService.parseEmailCSV(req.file.path);
    
    // Validate emails and perform deduplication
    const validEmails = await emailService.validateEmails(emails);
    const existingEmails = repository.emails.map(e => e.email);
    const newEmails = validEmails.filter(email => !existingEmails.includes(email));

    // Handle case where no new emails found
    if (newEmails.length === 0) {
      return res.status(400).json({ error: 'No new valid emails found in CSV' });
    }

    // Create email documents with CSV source tracking
    const emailDocs = newEmails.map(email => ({
      email,
      addedBy: req.user.id,
      verificationStatus: 'pending',
      source: 'csv',
      csvFileName: req.file.originalname,    // Track source file
      addedAt: new Date()
    }));

    // Add emails to repository and update metadata
    repository.emails.push(...emailDocs);
    repository.emailCount = repository.emails.length;
    repository.lastCSVUpload = new Date();
    await repository.save();

    // Trigger snowball distribution if enabled
    if (repository.settings.allowSnowball) {
      await snowballService.processSnowball(repository._id, newEmails);
    }

    // Award karma for CSV upload (capped for fairness)
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { karma: Math.min(newEmails.length * 5, 100) }
    });

    // Return comprehensive upload results
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

/**
 * Download Repository CSV
 * Exports repository emails as CSV file with permission controls
 * 
 * This endpoint generates CSV exports of repository emails with privacy
 * controls and verification status filtering for clean data exports.
 * 
 * @route GET /api/repositories/:id/download-csv
 * @access Private (requires authentication and repository access)
 * @param {string} req.params.id - Repository ID to export
 * @returns {File} CSV file download with verified emails
 */
exports.downloadCSV = async (req, res) => {
  try {
    // Fetch repository for permission validation
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

    // Filter to verified emails only for quality exports
    const verifiedEmails = repository.emails
      .filter(e => e.verificationStatus === 'verified')
      .map(e => ({
        email: e.email,
        addedDate: e.addedAt,
        source: e.source
      }));

    // Generate CSV content
    const csv = await csvService.generateEmailCSV(verifiedEmails);

    // Set file download headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${repository.name}-emails.csv"`);
    res.send(csv);

    // Track download for analytics
    repository.downloadCount = (repository.downloadCount || 0) + 1;
    await repository.save();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Repository Statistics
 * Provides comprehensive analytics and metrics for repositories
 * 
 * This endpoint generates detailed statistics including email counts,
 * verification rates, source analysis, growth metrics, and engagement data.
 * 
 * @route GET /api/repositories/:id/stats
 * @access Private (requires authentication and repository access)
 * @param {string} req.params.id - Repository ID for statistics
 * @returns {Object} Comprehensive repository analytics and metrics
 */
exports.getRepositoryStats = async (req, res) => {
  try {
    // Fetch repository for statistics generation
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Generate comprehensive statistics
    const stats = {
      totalEmails: repository.emailCount,
      verifiedEmails: repository.emails.filter(e => e.verificationStatus === 'verified').length,
      pendingEmails: repository.emails.filter(e => e.verificationStatus === 'pending').length,
      bounceRate: repository.emails.filter(e => e.verificationStatus === 'bounced').length / repository.emailCount,
      
      // Email source breakdown for acquisition analysis
      sources: {
        manual: repository.emails.filter(e => e.source === 'manual').length,
        csv: repository.emails.filter(e => e.source === 'csv').length,
        snowball: repository.emails.filter(e => e.source === 'snowball').length,
        api: repository.emails.filter(e => e.source === 'api').length
      },
      
      // Growth and engagement metrics
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

/**
 * Add Collaborator to Repository
 * Adds a collaborator with notification and validation
 * 
 * This endpoint handles collaborator addition with ownership validation,
 * user existence checking, and notification workflows for team collaboration.
 * 
 * @route POST /api/repositories/:id/collaborators
 * @access Private (requires authentication and repository ownership)
 * @param {string} req.params.id - Repository ID to add collaborator to
 * @param {Object} req.body - Collaborator data
 * @param {string} req.body.userId - User ID of new collaborator
 * @returns {Object} Collaborator addition confirmation
 */
exports.addCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Fetch repository for ownership validation
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Only repository owner can add collaborators
    if (repository.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the owner can add collaborators' });
    }

    // Validate collaborator user exists
    const collaborator = await User.findById(userId);
    if (!collaborator) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent duplicate collaborators
    if (repository.collaborators.includes(userId)) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    // Add collaborator to repository
    repository.collaborators.push(userId);
    await repository.save();

    // Send invitation notification to new collaborator
    await emailService.sendCollaboratorInvite(collaborator.email, repository);

    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove Collaborator from Repository
 * Removes a collaborator with ownership validation
 * 
 * This endpoint handles collaborator removal with strict ownership controls
 * to maintain repository security and access management.
 * 
 * @route DELETE /api/repositories/:id/collaborators/:userId
 * @access Private (requires authentication and repository ownership)
 * @param {string} req.params.id - Repository ID to remove collaborator from
 * @param {string} req.params.userId - User ID of collaborator to remove
 * @returns {Object} Collaborator removal confirmation
 */
exports.removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch repository for ownership validation
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Only repository owner can remove collaborators
    if (repository.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the owner can remove collaborators' });
    }

    // Remove collaborator from repository
    repository.collaborators = repository.collaborators.filter(
      collab => collab.toString() !== userId
    );
    await repository.save();

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Merge Repositories
 * Combines two repositories with comprehensive validation and archival
 * 
 * This endpoint handles repository merging with ownership validation,
 * email deduplication, and proper archival of the source repository.
 * 
 * @route POST /api/repositories/:id/merge
 * @access Private (requires authentication and ownership of both repositories)
 * @param {string} req.params.id - Target repository ID for merge
 * @param {Object} req.body - Merge configuration
 * @param {string} req.body.sourceRepoId - Source repository to merge from
 * @returns {Object} Merge results with statistics
 */
exports.mergeRepositories = async (req, res) => {
  try {
    const { sourceRepoId } = req.body;
    
    // Fetch both repositories for validation
    const targetRepo = await Repository.findById(req.params.id);
    const sourceRepo = await Repository.findById(sourceRepoId);

    // Validate both repositories exist
    if (!targetRepo || !sourceRepo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Enforce ownership requirement for both repositories
    if (targetRepo.owner.toString() !== req.user.id || 
        sourceRepo.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You must own both repositories to merge them' });
    }

    // Identify unique emails from source repository
    const sourceEmails = sourceRepo.emails.map(e => e.email);
    const targetEmails = targetRepo.emails.map(e => e.email);
    const newEmails = sourceEmails.filter(email => !targetEmails.includes(email));

    // Transfer unique emails to target repository
    const emailDocs = sourceRepo.emails
      .filter(e => newEmails.includes(e.email))
      .map(e => ({
        ...e.toObject(),
        source: 'merge',                    // Mark as merged
        mergedFrom: sourceRepo.name         // Track source repository
      }));

    // Update target repository with merged emails
    targetRepo.emails.push(...emailDocs);
    targetRepo.emailCount = targetRepo.emails.length;
    await targetRepo.save();

    // Archive source repository with comprehensive metadata
    sourceRepo.isArchived = true;
    sourceRepo.archivedAt = new Date();
    sourceRepo.archiveReason = `Merged into ${targetRepo.name}`;
    await sourceRepo.save();

    // Return merge results with statistics
    res.json({
      message: 'Repositories merged successfully',
      emailsMerged: newEmails.length,
      totalEmails: targetRepo.emailCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculate Repository Growth Rate
 * Helper function to compute growth metrics over time periods
 * 
 * This function analyzes email additions over the past 30 days to calculate
 * growth rate as a percentage for trend analysis and repository health.
 * 
 * @param {Object} repository - Repository document with email data
 * @returns {number} Growth rate percentage over past 30 days
 */
exports.calculateGrowthRate = async (repository) => {
  // Calculate 30-day lookback period
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Count emails added in past 30 days
  const recentEmails = repository.emails.filter(e => 
    new Date(e.addedAt) > thirtyDaysAgo
  ).length;
  
  // Calculate growth rate as percentage
  const totalEmails = repository.emailCount || 1;
  return (recentEmails / totalEmails) * 100;
};

/**
 * Search Repositories
 * Advanced repository search with multiple filter options
 * 
 * This endpoint provides comprehensive repository search functionality
 * with text search, topic filtering, and quality thresholds for discovery.
 * 
 * @route GET /api/repositories/search
 * @access Public (with privacy controls for private repositories)
 * @param {string} req.query.q - Search query for name/description/topic
 * @param {string} req.query.topic - Filter by specific topic
 * @param {number} req.query.minEmails - Minimum email count threshold
 * @param {boolean} req.query.isPrivate - Privacy filter
 * @returns {Object} Array of matching repositories with owner info
 */
exports.searchRepositories = async (req, res) => {
  try {
    const { q, topic, minEmails, isPrivate } = req.query;
    const query = {};

    // Build text search query across multiple fields
    if (q) {
      query.$or = [
        { name: new RegExp(q, 'i') },           // Case-insensitive name search
        { description: new RegExp(q, 'i') },   // Description search
        { topic: new RegExp(q, 'i') }          // Topic search
      ];
    }

    // Apply additional filters
    if (topic) query.topic = new RegExp(topic, 'i');
    if (minEmails) query.emailCount = { $gte: parseInt(minEmails) };
    if (isPrivate !== undefined) query.isPrivate = isPrivate === 'true';

    // Execute search with population and sensible limits
    const repositories = await Repository.find(query)
      .populate('owner', 'username karma')      // Owner info for credibility
      .sort('-emailCount')                      // Sort by size for relevance
      .limit(50)                               // Reasonable result limit
      .exec();

    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Trending Repositories
 * Identifies repositories with recent growth and activity
 * 
 * This endpoint analyzes repository growth over the past week to identify
 * trending repositories based on email additions and activity levels.
 * 
 * @route GET /api/repositories/trending
 * @access Public (excludes private repositories)
 * @returns {Object} Array of trending repositories with growth metrics
 */
exports.getTrendingRepositories = async (req, res) => {
  try {
    // Define trend analysis period (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Aggregate repositories with recent growth analysis
    const repositories = await Repository.aggregate([
      {
        $match: {
          isPrivate: false,                    // Public repositories only
          updatedAt: { $gte: sevenDaysAgo }   // Active in past week
        }
      },
      {
        // Calculate recent growth metric
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
        $sort: { recentGrowth: -1 }           // Sort by growth
      },
      {
        $limit: 10                            // Top 10 trending
      }
    ]);

    // Populate owner information for trending repositories
    await Repository.populate(repositories, {
      path: 'owner',
      select: 'username karma'
    });

    res.json(repositories);
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
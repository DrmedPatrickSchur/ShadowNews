/**
 * @fileoverview Repository Model for ShadowNews Platform
 * 
 * Core model for managing email repositories - curated collections of email addresses
 * for content distribution and community building. This model handles the complete
 * lifecycle of email repositories including creation, management, collaboration,
 * and analytics.
 * 
 * Key Features:
 * - Email collection and verification management
 * - Collaborative repository ownership and moderation
 * - CSV import functionality for bulk email additions
 * - Snowball distribution for organic growth
 * - Quality scoring and categorization
 * - Digest scheduling and email template management
 * - Comprehensive analytics and engagement tracking
 * - Repository linking and cross-collaboration
 * 
 * Email Sources:
 * - Manual: Individually added email addresses
 * - CSV: Bulk imported from CSV files
 * - Snowball: Organic referrals from existing subscribers
 * - API: Programmatically added via API calls
 * 
 * Access Control:
 * - Public repositories: Discoverable and joinable by anyone
 * - Private repositories: Invite-only with controlled access
 * - Role-based collaboration (admin, moderator, contributor)
 * - Karma-based join requirements
 * 
 * Relationships:
 * - Belongs to User (owner)
 * - Has many Users (collaborators)
 * - Contains many Email addresses
 * - Links to other Repositories
 * - Uses EmailTemplates for digests
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Required dependencies for repository model
const mongoose = require('mongoose');

/**
 * Main Repository Schema
 * Comprehensive schema for managing email repositories and their settings
 * 
 * This schema handles all aspects of repository management including
 * email collection, collaboration, settings, and analytics.
 */
const repositorySchema = new mongoose.Schema({
  // Repository name (human-readable identifier)
  name: {
    type: String,
    required: true,    // Every repository must have a name
    trim: true,        // Remove leading/trailing whitespace
    minlength: 3,      // Minimum name length
    maxlength: 100,    // Maximum name length
    index: true        // Indexed for search queries
  },
  
  // URL-friendly slug for repository identification
  slug: {
    type: String,
    required: true,    // Generated automatically from name
    unique: true,      // Must be unique across all repositories
    lowercase: true,   // Normalize to lowercase
    index: true        // Indexed for URL lookups
  },
  
  // Repository description explaining its purpose
  description: {
    type: String,
    required: true,    // Description helps users understand the repository
    maxlength: 500     // Reasonable description length
  },
  
  // User who owns and created this repository
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,    // Every repository must have an owner
    index: true        // Indexed for owner queries
  },
  
  // Hashtags for categorization and discovery
  hashtags: [{
    type: String,
    lowercase: true,   // Normalize hashtags to lowercase
    trim: true         // Remove whitespace
  }],
  
  // Email addresses in this repository
  emails: [{
    // Email address (primary identifier)
    email: {
      type: String,
      required: true,    // Every entry must have an email
      lowercase: true,   // Normalize to lowercase
      trim: true         // Remove whitespace
    },
    
    // Display name for this email address
    name: {
      type: String,
      trim: true         // Optional display name
    },
    
    // User who added this email to the repository
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // When this email was added
    addedAt: {
      type: Date,
      default: Date.now
    },
    
    // How this email was added to the repository
    source: {
      type: String,
      enum: [
        'manual',    // Manually added by user
        'csv',       // Imported from CSV file
        'snowball',  // Added through snowball referral
        'api'        // Added via API call
      ],
      default: 'manual'
    },
    
    // Whether this email address has been verified
    verified: {
      type: Boolean,
      default: false
    },
    
    // Whether this email has opted out of the repository
    optedOut: {
      type: Boolean,
      default: false
    },
    
    // Additional metadata about this email
    metadata: {
      company: String,      // Company affiliation
      title: String,        // Job title
      tags: [String]        // Custom tags for organization
    }
  }],
  
  // Repository configuration and preferences
  settings: {
    // Whether this repository is publicly discoverable
    isPublic: {
      type: Boolean,
      default: true
    },
    
    // Whether to allow snowball distribution from this repository
    allowSnowball: {
      type: Boolean,
      default: true
    },
    
    // Whether to automatically approve join requests
    autoApprove: {
      type: Boolean,
      default: false
    },
    
    // Minimum karma required to join this repository
    minKarmaToJoin: {
      type: Number,
      default: 0
    },
    
    // How often to send digest emails
    digestFrequency: {
      type: String,
      enum: [
        'daily',      // Send daily digests
        'weekly',     // Send weekly digests
        'biweekly',   // Send biweekly digests
        'monthly',    // Send monthly digests
        'never'       // Don't send automatic digests
      ],
      default: 'weekly'
    },
    
    // When to send the next digest
    nextDigestDate: {
      type: Date
    },
    
    // Email template to use for digests
    emailTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate'
    }
  },
  
  // Users who collaborate on this repository
  collaborators: [{
    // User who is a collaborator
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Role and permissions level
    role: {
      type: String,
      enum: [
        'admin',        // Full administrative access
        'moderator',    // Content moderation and management
        'contributor'   // Basic contribution rights
      ],
      default: 'contributor'
    },
    
    // When this user was added as a collaborator
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Analytics and statistics
  stats: {
    // Total number of emails in repository
    totalEmails: {
      type: Number,
      default: 0
    },
    
    // Number of verified email addresses
    verifiedEmails: {
      type: Number,
      default: 0
    },
    
    // Number of active (verified and not opted out) emails
    activeEmails: {
      type: Number,
      default: 0
    },
    
    // Number of emails added through snowball distribution
    snowballEmails: {
      type: Number,
      default: 0
    },
    
    // When the last snowball distribution occurred
    lastSnowballAt: Date,
    
    // Total number of digest emails sent
    digestsSent: {
      type: Number,
      default: 0
    },
    
    // Average email open rate (0.0 to 1.0)
    avgOpenRate: {
      type: Number,
      default: 0
    },
    
    // Average email click-through rate (0.0 to 1.0)
    avgClickRate: {
      type: Number,
      default: 0
    }
  },
  
  // Linked and related repositories
  linkedRepositories: [{
    // Repository that is linked to this one
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository'
    },
    
    // Number of shared email addresses
    sharedEmails: {
      type: Number,
      default: 0
    },
    
    // Type of relationship between repositories
    linkType: {
      type: String,
      enum: [
        'partner',    // Partnership relationship
        'related',    // Related topic areas
        'merged'      // Merged from another repository
      ],
      default: 'related'
    }
  }],
  
  // History of CSV file imports
  csvImports: [{
    // Original filename of the CSV
    filename: String,
    
    // When the import was performed
    importedAt: {
      type: Date,
      default: Date.now
    },
    
    // User who performed the import
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Number of emails successfully added
    emailsAdded: Number,
    
    // Current status of the import
    status: {
      type: String,
      enum: [
        'pending',     // Import queued but not started
        'processing',  // Import currently in progress
        'completed',   // Import finished successfully
        'failed'       // Import failed with errors
      ],
      default: 'pending'
    }
  }],
  
  // History of snowball distribution events
  snowballHistory: [{
    // User who triggered the snowball event
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Source email that started the snowball
    sourceEmail: String,
    
    // Number of new emails added through snowball
    emailsAdded: Number,
    
    // When the snowball event occurred
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Calculated quality score for ranking and discovery
  qualityScore: {
    type: Number,
    default: 0,
    min: 0,         // Minimum quality score
    max: 100        // Maximum quality score
  },
  
  // Custom tags for organization and filtering
  tags: [{
    type: String,
    lowercase: true,   // Normalize tags to lowercase
    trim: true         // Remove whitespace
  }],
  
  // Category classification for discovery
  category: {
    type: String,
    enum: [
      'technology',   // Technology and software
      'business',     // Business and entrepreneurship
      'science',      // Science and research
      'health',       // Health and wellness
      'finance',      // Finance and investing
      'education',    // Education and learning
      'other'         // Other categories
    ],
    default: 'other',
    index: true       // Indexed for category queries
  },
  
  // Whether this repository is currently active
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Whether this is a premium repository with enhanced features
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // Soft deletion timestamp (null if not deleted)
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,        // Automatic createdAt and updatedAt fields
  toJSON: { virtuals: true },    // Include virtual fields in JSON output
  toObject: { virtuals: true }   // Include virtual fields in object output
});

// Database indexes for efficient querying
repositorySchema.index({ owner: 1, isActive: 1 });        // Owner's repositories
repositorySchema.index({ hashtags: 1 });                  // Hashtag searches
repositorySchema.index({ 'emails.email': 1 });           // Email lookups
repositorySchema.index({ category: 1, qualityScore: -1 }); // Category browsing
repositorySchema.index({ createdAt: -1 });                // Recent repositories

/**
 * Virtual: Email Count
 * Calculates the number of active emails (not opted out)
 * 
 * This virtual provides a convenient way to get the count of
 * active emails without manually filtering each time.
 */
repositorySchema.virtual('emailCount').get(function() {
  return this.emails.filter(e => !e.optedOut).length;
});

/**
 * Pre-save Middleware
 * Automatically updates calculated fields and generates slugs
 * 
 * This middleware ensures that derived fields like stats and
 * slugs are always up-to-date when the repository is saved.
 */
repositorySchema.pre('save', async function(next) {
  // Generate unique slug from name if not already set
  if (this.isModified('name') && !this.slug) {
    // Create URL-friendly slug from name
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')    // Remove special characters
      .replace(/\s+/g, '-')        // Replace spaces with hyphens
      .replace(/-+/g, '-')         // Replace multiple hyphens with single
      .trim();                     // Remove leading/trailing whitespace
    
    // Ensure slug is unique by appending counter if needed
    const baseSlug = this.slug;
    let counter = 1;
    while (await mongoose.models.Repository.findOne({ slug: this.slug, _id: { $ne: this._id } })) {
      this.slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  
  // Update statistics when emails are modified
  if (this.isModified('emails')) {
    this.stats.totalEmails = this.emails.length;
    this.stats.verifiedEmails = this.emails.filter(e => e.verified).length;
    this.stats.activeEmails = this.emails.filter(e => !e.optedOut && e.verified).length;
    this.stats.snowballEmails = this.emails.filter(e => e.source === 'snowball').length;
  }
  
  next();
});

/**
 * Add Email to Repository
 * Adds a new email address to the repository with validation
 * 
 * This method handles adding new emails while checking for
 * duplicates and opt-out status to maintain data integrity.
 * 
 * @param {Object} emailData - Email information to add
 * @param {ObjectId} userId - ID of user adding the email
 * @returns {Promise<Object>} The added email object
 * @throws {Error} If email has opted out or other validation fails
 */
repositorySchema.methods.addEmail = async function(emailData, userId) {
  // Check if email already exists in repository
  const existingEmail = this.emails.find(e => e.email === emailData.email.toLowerCase());
  
  if (existingEmail) {
    // Don't allow re-adding opted-out emails
    if (existingEmail.optedOut) {
      throw new Error('This email has opted out of this repository');
    }
    return existingEmail;
  }
  
  // Add new email to repository
  this.emails.push({
    ...emailData,
    email: emailData.email.toLowerCase(),  // Normalize email address
    addedBy: userId,
    addedAt: new Date()
  });
  
  await this.save();
  return this.emails[this.emails.length - 1];
};

/**
 * Remove Email from Repository
 * Soft-removes an email by marking it as opted out
 * 
 * This method provides a way to remove emails while maintaining
 * audit trail and allowing for potential re-subscription.
 * 
 * @param {string} email - Email address to remove
 * @returns {Promise<void>}
 * @throws {Error} If email is not found in repository
 */
repositorySchema.methods.removeEmail = async function(email) {
  // Find the email in the repository
  const emailIndex = this.emails.findIndex(e => e.email === email.toLowerCase());
  
  if (emailIndex === -1) {
    throw new Error('Email not found in repository');
  }
  
  // Mark as opted out rather than hard delete
  this.emails[emailIndex].optedOut = true;
  await this.save();
};

/**
 * Check User Access Permissions
 * Determines if a user can access this repository
 * 
 * This method checks various access controls including public
 * visibility, ownership, and collaboration status.
 * 
 * @param {ObjectId} userId - ID of user to check
 * @returns {boolean} True if user can access repository
 */
repositorySchema.methods.canUserAccess = function(userId) {
  // Public repositories are accessible to everyone
  if (this.settings.isPublic) return true;
  
  // Owner always has access
  if (this.owner.equals(userId)) return true;
  
  // Check if user is a collaborator
  return this.collaborators.some(c => c.user.equals(userId));
};

/**
 * Check User Edit Permissions
 * Determines if a user can edit this repository
 * 
 * This method checks if a user has sufficient permissions
 * to modify repository settings and content.
 * 
 * @param {ObjectId} userId - ID of user to check
 * @returns {boolean} True if user can edit repository
 */
repositorySchema.methods.canUserEdit = function(userId) {
  // Owner always has edit access
  if (this.owner.equals(userId)) return true;
  
  // Check if user is admin or moderator collaborator
  const collaborator = this.collaborators.find(c => c.user.equals(userId));
  return collaborator && ['admin', 'moderator'].includes(collaborator.role);
};

/**
 * Calculate Quality Score
 * Computes a quality score based on various repository metrics
 * 
 * This method evaluates repository quality based on email count,
 * engagement rates, completeness, and community involvement.
 * 
 * @returns {number} Quality score from 0 to 100
 */
repositorySchema.methods.calculateQualityScore = function() {
  let score = 0;
  
  // Email quantity scoring
  if (this.stats.verifiedEmails > 100) score += 20;
  else if (this.stats.verifiedEmails > 50) score += 10;
  else if (this.stats.verifiedEmails > 10) score += 5;
  
  // Email engagement scoring
  if (this.stats.avgOpenRate > 0.3) score += 20;
  else if (this.stats.avgOpenRate > 0.2) score += 10;
  else if (this.stats.avgOpenRate > 0.1) score += 5;
  
  // Click-through rate scoring
  if (this.stats.avgClickRate > 0.1) score += 20;
  else if (this.stats.avgClickRate > 0.05) score += 10;
  else if (this.stats.avgClickRate > 0.02) score += 5;
  
  // Repository completeness scoring
  if (this.description.length > 100) score += 10;  // Good description
  if (this.hashtags.length >= 3) score += 10;      // Well categorized
  if (this.collaborators.length > 0) score += 10;  // Has collaborators
  if (this.stats.snowballEmails > 50) score += 10; // Organic growth
  
  // Cap score at maximum of 100
  this.qualityScore = Math.min(score, 100);
  return this.qualityScore;
};

/**
 * Find Repositories by Hashtag
 * Static method to find repositories with a specific hashtag
 * 
 * This method searches for active repositories that contain
 * the specified hashtag for topic-based discovery.
 * 
 * @param {string} hashtag - Hashtag to search for
 * @returns {Query} Mongoose query for hashtag matches
 */
repositorySchema.statics.findByHashtag = function(hashtag) {
  return this.find({ 
    hashtags: hashtag.toLowerCase(),  // Case-insensitive hashtag match
    isActive: true,                   // Only active repositories
    deletedAt: null                   // Not soft-deleted
  }).populate('owner', 'username karma');  // Include owner info
};

/**
 * Find Public Repositories
 * Static method to find discoverable public repositories
 * 
 * This method retrieves public repositories with pagination
 * and filtering options for discovery pages.
 * 
 * @param {Object} options - Query options (limit, skip, category, sortBy)
 * @returns {Query} Mongoose query for public repositories
 */
repositorySchema.statics.findPublicRepositories = function(options = {}) {
  const { 
    limit = 20,              // Number of repositories to return
    skip = 0,                // Number of repositories to skip
    category,                // Optional category filter
    sortBy = 'qualityScore'  // Field to sort by
  } = options;
  
  // Base query for public, active repositories
  const query = {
    'settings.isPublic': true,
    isActive: true,
    deletedAt: null
  };
  
  // Add category filter if specified
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ [sortBy]: -1 })                      // Sort by specified field (descending)
    .limit(limit)                                // Limit results
    .skip(skip)                                  // Skip for pagination
    .populate('owner', 'username karma avatar'); // Include owner details
};

/**
 * Search Repositories
 * Static method to search repositories by text
 * 
 * This method performs full-text search across repository
 * names, descriptions, hashtags, and tags.
 * 
 * @param {string} searchTerm - Text to search for
 * @param {Object} options - Query options (limit, skip)
 * @returns {Query} Mongoose query for search results
 */
repositorySchema.statics.searchRepositories = function(searchTerm, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    $or: [
      { name: new RegExp(searchTerm, 'i') },        // Search in name
      { description: new RegExp(searchTerm, 'i') }, // Search in description
      { hashtags: new RegExp(searchTerm, 'i') },    // Search in hashtags
      { tags: new RegExp(searchTerm, 'i') }         // Search in tags
    ],
    isActive: true,    // Only active repositories
    deletedAt: null    // Not soft-deleted
  })
  .sort({ qualityScore: -1 })                    // Sort by quality score
  .limit(limit)                                  // Limit results
  .skip(skip)                                    // Skip for pagination
  .populate('owner', 'username karma');          // Include owner info
};

// Create and export the Repository model
const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;
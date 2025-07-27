/**
 * @fileoverview Post Model for ShadowNews Platform
 * 
 * Core content model for posts, articles, and user-generated content.
 * This model handles the complete lifecycle of posts including creation,
 * voting, commenting, repository organization, and engagement tracking.
 * 
 * Key Features:
 * - Flexible content types (URL links, text posts, or both)
 * - Voting system with upvotes and downvotes
 * - Hashtag categorization and discovery
 * - Repository organization and curation
 * - AI-powered metadata and content analysis
 * - Comprehensive engagement and ranking metrics
 * - Edit history tracking and moderation features
 * - Advanced ranking algorithms (hot, controversy, quality)
 * 
 * Content Types:
 * - Link posts: External URLs with optional commentary
 * - Text posts: Original content and discussions
 * - Email-derived posts: Content created from email submissions
 * 
 * Ranking Systems:
 * - Hot ranking: Time-decay algorithm similar to Reddit
 * - Controversy ranking: Balance of upvotes and downvotes
 * - Quality ranking: AI-assisted content quality assessment
 * 
 * Relationships:
 * - Belongs to User (author)
 * - May be derived from Email
 * - Belongs to multiple Repositories
 * - Has many Comments
 * - Has many Votes (upvotes/downvotes)
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Required dependencies for post model
const mongoose = require('mongoose');

/**
 * Main Post Schema
 * Comprehensive schema for managing posts, articles, and user content
 * 
 * This schema handles all aspects of content management including
 * creation, voting, categorization, moderation, and analytics.
 */
const PostSchema = new mongoose.Schema({
  // Post title (required for all posts)
  title: {
    type: String,
    required: true,    // Every post must have a title
    trim: true,        // Remove leading/trailing whitespace
    maxLength: 300     // Enforce reasonable title length
  },
  
  // External URL for link posts (optional)
  url: {
    type: String,
    trim: true,        // Remove leading/trailing whitespace
    validate: {
      validator: function(v) {
        // Allow empty URLs (for text posts)
        if (!v) return true;
        // Validate URL format for link posts
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  
  // Post body text (optional for link posts, required for text posts)
  text: {
    type: String,
    maxLength: 10000   // Limit text length to prevent abuse
  },
  
  // User who created this post
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true     // Every post must have an author
  },
  
  // Email that this post was derived from (if applicable)
  email: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email'       // Optional reference to source email
  },
  
  // Hashtags for categorization and discovery
  hashtags: [{
    type: String,
    lowercase: true,   // Normalize hashtags to lowercase
    trim: true         // Remove whitespace
  }],
  
  // Calculated score based on votes (upvotes - downvotes)
  score: {
    type: Number,
    default: 0,
    index: true        // Indexed for sorting by score
  },
  
  // Users who upvoted this post with timestamps
  upvotes: [{
    // User who gave the upvote
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // When the upvote was given
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Users who downvoted this post with timestamps
  downvotes: [{
    // User who gave the downvote
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // When the downvote was given
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Total number of comments on this post (denormalized for performance)
  commentCount: {
    type: Number,
    default: 0
  },
  
  // Repositories that include this post
  repositories: [{
    // Repository that includes this post
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository'
    },
    // When this post was added to the repository
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Post visibility and access control
  visibility: {
    type: String,
    enum: [
      'public',      // Visible to everyone
      'repository',  // Visible only within specific repositories
      'private'      // Visible only to author
    ],
    default: 'public'
  },
  
  // Post moderation status
  status: {
    type: String,
    enum: [
      'active',   // Normal active post
      'deleted',  // Soft-deleted by author or moderator
      'flagged',  // Flagged for review
      'hidden'    // Hidden by moderators
    ],
    default: 'active'
  },
  
  // User reports and flags for moderation
  flags: [{
    // User who reported this post
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Reason for the flag/report
    reason: String,
    // When the flag was submitted
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // AI-generated metadata and analysis
  aiMetadata: {
    // AI-suggested hashtags based on content analysis
    suggestedHashtags: [String],
    
    // AI-generated summary of the post content
    summary: String,
    
    // Sentiment analysis score (-1 to 1, negative to positive)
    sentiment: {
      type: Number,
      min: -1,
      max: 1
    },
    
    // Topic classification scores for different categories
    topicScores: {
      type: Map,
      of: Number
    }
  },
  
  // Engagement and analytics metrics
  metrics: {
    // Number of times this post has been viewed
    views: {
      type: Number,
      default: 0
    },
    
    // Number of times this post has been shared
    shares: {
      type: Number,
      default: 0
    },
    
    // Number of people reached via email distribution
    emailReach: {
      type: Number,
      default: 0
    },
    
    // Click-through rate for link posts
    clickRate: {
      type: Number,
      default: 0
    },
    
    // Overall engagement score based on interactions
    engagementScore: {
      type: Number,
      default: 0
    }
  },
  
  // Various ranking scores for different algorithms
  ranking: {
    // Hot ranking score (time-decay algorithm)
    hot: {
      type: Number,
      default: 0,
      index: true      // Indexed for hot post queries
    },
    
    // Controversy score (balance of upvotes and downvotes)
    controversy: {
      type: Number,
      default: 0
    },
    
    // Quality score based on AI analysis and engagement
    quality: {
      type: Number,
      default: 0
    }
  },
  
  // Complete edit history for transparency
  editHistory: [{
    // When this edit was made
    timestamp: {
      type: Date,
      default: Date.now
    },
    
    // What changes were made
    changes: {
      title: String,      // Previous title
      text: String,       // Previous text
      url: String,        // Previous URL
      hashtags: [String]  // Previous hashtags
    },
    
    // User who made the edit
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Future publication date for scheduled posts
  scheduledFor: Date,
  
  // Automatic expiration date for temporary posts
  expiresAt: Date
}, {
  timestamps: true,        // Automatic createdAt and updatedAt fields
  toJSON: { virtuals: true },    // Include virtual fields in JSON output
  toObject: { virtuals: true }   // Include virtual fields in object output
});

/**
 * Virtual: Vote Count
 * Calculates the net vote count (upvotes - downvotes)
 * 
 * This virtual provides a convenient way to get the overall
 * vote score without manually calculating it each time.
 */
PostSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

/**
 * Virtual: Is Hot
 * Determines if this post is currently "hot" based on recent activity
 * 
 * A post is considered hot if it has a high ranking score and
 * was created within the last 24 hours.
 */
PostSchema.virtual('isHot').get(function() {
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return this.ranking.hot > 100 && hoursSinceCreation < 24;
});

// Database indexes for efficient querying
PostSchema.index({ createdAt: -1 });                    // Recent posts
PostSchema.index({ 'ranking.hot': -1 });               // Hot posts ranking
PostSchema.index({ author: 1, createdAt: -1 });        // User's posts
PostSchema.index({ hashtags: 1 });                     // Hashtag searches
PostSchema.index({ status: 1, visibility: 1 });       // Moderation queries
PostSchema.index({ '$**': 'text' });                   // Full-text search

/**
 * Pre-save Middleware
 * Automatically updates calculated fields before saving
 * 
 * This middleware ensures that derived fields like score and
 * ranking are always up-to-date when the post is saved.
 */
PostSchema.pre('save', function(next) {
  // Update score when votes change
  if (this.isModified('upvotes') || this.isModified('downvotes')) {
    this.score = this.upvotes.length - this.downvotes.length;
  }
  
  // Update hot ranking when votes or comments change
  if (this.isModified('upvotes') || this.isModified('downvotes') || this.isModified('commentCount')) {
    // Hot ranking algorithm (similar to Reddit's)
    const order = Math.log10(Math.max(Math.abs(this.score), 1));
    const sign = this.score > 0 ? 1 : this.score < 0 ? -1 : 0;
    const seconds = (this.createdAt - new Date(2025, 0, 1)) / 1000;
    this.ranking.hot = sign * order + seconds / 45000;
  }
  
  next();
});

/**
 * Calculate Engagement Score
 * Computes overall engagement based on various interaction metrics
 * 
 * This method calculates a normalized engagement score that considers
 * views, shares, comments, and votes to determine content quality.
 * 
 * @returns {number} Engagement score (0.0 to 1.0+)
 */
PostSchema.methods.calculateEngagement = function() {
  const totalInteractions = this.metrics.views + this.metrics.shares + this.commentCount + this.voteCount;
  
  // Calculate engagement rate if there are views
  this.metrics.engagementScore = totalInteractions > 0 
    ? (this.metrics.shares + this.commentCount + this.voteCount) / this.metrics.views 
    : 0;
  
  return this.metrics.engagementScore;
};

/**
 * Add Post to Repository
 * Associates this post with a specific repository
 * 
 * This method adds the post to a repository's collection,
 * avoiding duplicates and tracking when it was added.
 * 
 * @param {ObjectId} repositoryId - ID of the repository
 * @returns {Promise<void>}
 */
PostSchema.methods.addToRepository = async function(repositoryId) {
  // Check if post is not already in this repository
  if (!this.repositories.some(r => r.repository.equals(repositoryId))) {
    this.repositories.push({ repository: repositoryId });
    await this.save();
  }
};

/**
 * Check User Vote Status
 * Determines if a specific user has voted on this post
 * 
 * This method checks whether a user has upvoted or downvoted
 * this post, useful for preventing duplicate votes.
 * 
 * @param {ObjectId} userId - ID of the user
 * @returns {Object} Object with upvoted and downvoted boolean flags
 */
PostSchema.methods.hasUserVoted = function(userId) {
  return {
    upvoted: this.upvotes.some(v => v.user.equals(userId)),
    downvoted: this.downvotes.some(v => v.user.equals(userId))
  };
};

/**
 * Find Trending Posts
 * Static method to find posts that are currently trending
 * 
 * This method finds posts with high engagement within a
 * specified timeframe, sorted by hot ranking score.
 * 
 * @param {number} timeframe - Hours to look back (default: 24)
 * @returns {Query} Mongoose query for trending posts
 */
PostSchema.statics.findTrending = function(timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.find({
    status: 'active',          // Only active posts
    visibility: 'public',      // Only public posts
    createdAt: { $gte: since } // Within specified timeframe
  })
  .sort({ 'ranking.hot': -1 }) // Sort by hot ranking
  .limit(50);                  // Limit to top 50
};

/**
 * Find Posts by Hashtags
 * Static method to find posts with specific hashtags
 * 
 * This method searches for posts that contain any of the
 * specified hashtags, useful for topic-based discovery.
 * 
 * @param {string[]} hashtags - Array of hashtags to search for
 * @param {Object} options - Additional query options
 * @returns {Query} Mongoose query for hashtag matches
 */
PostSchema.statics.findByHashtags = function(hashtags, options = {}) {
  return this.find({
    status: 'active',              // Only active posts
    hashtags: { $in: hashtags },   // Posts with any of these hashtags
    ...options                     // Additional query options
  }).sort({ createdAt: -1 });      // Sort by newest first
};

// Create and export the Post model
module.exports = mongoose.model('Post', PostSchema);
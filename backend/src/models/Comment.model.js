/**
 * @fileoverview Comment Database Model for ShadowNews Platform
 * 
 * Mongoose schema definition for comment documents in the MongoDB database.
 * This model handles threaded discussions, voting systems, content moderation,
 * and hierarchical comment structures within the ShadowNews platform.
 * 
 * Key Features:
 * - Threaded comment system with unlimited nesting depth
 * - Upvote/downvote system with karma integration
 * - Content moderation with flagging and soft deletion
 * - Rich text content with HTML rendering support
 * - User mentions and hashtag support
 * - Edit history tracking with version control
 * - Source tracking (web, email, API, mobile)
 * - Advanced querying and filtering capabilities
 * 
 * Schema Structure:
 * - author: Reference to User who created the comment
 * - post: Reference to parent Post being commented on
 * - parent: Reference to parent Comment (for threading)
 * - content: Raw text content of the comment
 * - contentHtml: Rendered HTML version for display
 * - mentions: Array of User references mentioned in comment
 * - hashtags: Array of hashtag strings for categorization
 * - voting: Upvoters and downvoters with calculated score
 * - moderation: Flags, deletion status, and edit history
 * - metadata: Source tracking and technical information
 * 
 * Relationships:
 * - Many-to-one with Post (comments belong to posts)
 * - Many-to-one with User (comments have authors)
 * - Self-referencing for threaded replies
 * - Many-to-many with Users (mentions and voting)
 * 
 * Indexes:
 * - Compound index on post + createdAt for chronological retrieval
 * - Index on author for user comment history
 * - Index on parent for thread structure queries
 * - Index on score + createdAt for ranking algorithms
 * - Index on hashtags for tag-based filtering
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Required dependencies for schema definition and database operations
const mongoose = require('mongoose');

/**
 * Comment Schema Definition
 * Defines the structure and validation rules for comment documents
 */
const commentSchema = new mongoose.Schema({
  /**
   * Author Information
   * Reference to the User who created this comment
   */
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for fast author-based queries
  },
  
  /**
   * Post Reference
   * The post this comment belongs to (required for all comments)
   */
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true // Index for post-specific comment retrieval
  },
  
  /**
   * Parent Comment Reference
   * For threaded discussions - null for top-level comments
   */
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true // Index for thread structure queries
  },
  
  /**
   * Content Fields
   * Raw and processed versions of comment content
   */
  
  // Raw text content entered by user
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [10000, 'Comment exceeds maximum length of 10,000 characters']
  },
  
  // HTML-rendered version for display (processed from content)
  contentHtml: {
    type: String,
    // Auto-generated from content during processing
  },
  
  /**
   * Social Features
   * User mentions and hashtag categorization
   */
  
  // Users mentioned in this comment (@username)
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Hashtags extracted from content (#hashtag)
  hashtags: [{
  // Hashtags extracted from content (#hashtag)
  hashtags: [{
    type: String,
    lowercase: true,
    trim: true,
    index: true // Index for hashtag-based filtering
  }],
  
  /**
   * Voting System
   * Upvote/downvote functionality for community feedback
   */
  
  // Users who upvoted this comment
  upvoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Users who downvoted this comment
  downvoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Calculated score (upvotes - downvotes)
  score: {
    type: Number,
    default: 0,
    index: true // Index for score-based sorting
  },
  
  /**
   * Thread Structure
   * Hierarchical positioning within comment threads
   */
  
  // Nesting level (0 = top-level, 1 = reply, 2 = reply to reply, etc.)
  depth: {
    type: Number,
    default: 0,
    min: 0,
    max: 10 // Limit maximum nesting depth for performance
  },
  
  // Number of direct child comments
  childrenCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  /**
   * Moderation System
   * Content moderation and deletion tracking
   */
  
  // Soft deletion flag (preserves thread structure)
  isDeleted: {
    type: Boolean,
    default: false,
    index: true // Index for filtering deleted comments
  },
  
  // Timestamp when comment was deleted
  deletedAt: {
    type: Date
  },
  
  // User or moderator who deleted the comment
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  /**
   * Edit History
   * Track all modifications to comment content
   */
  editHistory: [{
    // Previous version of content
    content: {
      type: String,
      required: true
    },
    
    // When this edit was made
    editedAt: {
      type: Date,
      default: Date.now
    },
    
    // User who made the edit
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  /**
   * Community Flags
   * User-reported content violations
   */
  flags: [{
    // User who flagged this comment
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Reason for flagging
    reason: {
      type: String,
      enum: ['spam', 'offensive', 'off-topic', 'misleading', 'other'],
      required: true
    },
    
    // When the flag was submitted
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  /**
   * Technical Metadata
   * Source tracking and analytics information
   */
  metadata: {
    // Browser user agent string
    userAgent: {
      type: String,
      maxlength: 500
    },
    
    // IP address of commenter (for moderation)
    ipAddress: {
      type: String,
      // Note: Should be hashed for privacy compliance
    },
    
    // Source of comment creation
    source: {
      type: String,
      enum: ['web', 'email', 'api', 'mobile'],
      default: 'web'
    }
  }
}, {
  // Automatic timestamps (createdAt, updatedAt)
  timestamps: true,
  
  // Include virtual fields in JSON output
  toJSON: { virtuals: true },
  
  // Include virtual fields in Object output
  toObject: { virtuals: true }
});

/**
 * Database Indexes
 * Optimized indexes for efficient querying and sorting
 */

// Compound index for retrieving comments by post in chronological order
commentSchema.index({ post: 1, createdAt: -1 });

// Index for retrieving user's comment history
commentSchema.index({ author: 1, createdAt: -1 });

// Index for building threaded comment structures
commentSchema.index({ parent: 1 });

// Compound index for ranking comments by score and recency
commentSchema.index({ score: -1, createdAt: -1 });

// Index for hashtag-based comment filtering
commentSchema.index({ hashtags: 1 });

// Index for moderating deleted comments
commentSchema.index({ isDeleted: 1 });

/**
 * Virtual Fields
 * Computed properties that don't exist in the database
 */

// Calculate total vote count (upvotes - downvotes)
commentSchema.virtual('voteCount').get(function() {
  return this.upvoters.length - this.downvoters.length;
});

// Virtual relationship to child comments for threading
commentSchema.virtual('children', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent'
});

/**
 * Middleware Functions
 * Pre and post-processing hooks for schema operations
 */

// Pre-save middleware to calculate comment depth in thread hierarchy
commentSchema.pre('save', async function(next) {
  // Only calculate depth for comments with parents
  if (this.parent) {
    try {
      const parentComment = await this.constructor.findById(this.parent);
      if (parentComment) {
        // Set depth to parent's depth + 1
        this.depth = parentComment.depth + 1;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

/**
 * Instance Methods
 * Methods available on individual comment documents
 */

/**
 * Upvote this comment
 * @param {ObjectId} userId - ID of user casting the vote
 * @returns {Promise<Comment>} Updated comment document
 */
commentSchema.methods.upvote = async function(userId) {
  const userIdStr = userId.toString();
  
  // Remove user from downvoters if they previously downvoted
  this.downvoters = this.downvoters.filter(id => id.toString() !== userIdStr);
  
  // Add user to upvoters if not already there
  if (!this.upvoters.some(id => id.toString() === userIdStr)) {
    this.upvoters.push(userId);
  }
  
  // Recalculate score
  this.score = this.upvoters.length - this.downvoters.length;
  return this.save();
};

/**
 * Downvote this comment
 * @param {ObjectId} userId - ID of user casting the vote
 * @returns {Promise<Comment>} Updated comment document
 */
commentSchema.methods.downvote = async function(userId) {
  const userIdStr = userId.toString();
  
  // Remove user from upvoters if they previously upvoted
  this.upvoters = this.upvoters.filter(id => id.toString() !== userIdStr);
  
  // Add user to downvoters if not already there
  if (!this.downvoters.some(id => id.toString() === userIdStr)) {
    this.downvoters.push(userId);
  }
  
  // Recalculate score
  this.score = this.upvoters.length - this.downvoters.length;
  return this.save();
};

/**
 * Remove user's vote from this comment
 * @param {ObjectId} userId - ID of user removing their vote
 * @returns {Promise<Comment>} Updated comment document
 */
commentSchema.methods.removeVote = async function(userId) {
  const userIdStr = userId.toString();
  
  // Remove user from both upvoters and downvoters
  this.upvoters = this.upvoters.filter(id => id.toString() !== userIdStr);
  this.downvoters = this.downvoters.filter(id => id.toString() !== userIdStr);
  
  // Recalculate score
  this.score = this.upvoters.length - this.downvoters.length;
  return this.save();
};

/**
 * Soft delete this comment (preserves thread structure)
 * @param {ObjectId} userId - ID of user or moderator deleting the comment
 * @returns {Promise<Comment>} Updated comment document
 */
commentSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  
  // Replace content with deletion marker
  this.content = '[deleted]';
  this.contentHtml = '<p>[deleted]</p>';
  
  return this.save();
};

/**
 * Edit comment content and track change history
 * @param {string} newContent - New content for the comment
 * @param {ObjectId} userId - ID of user making the edit
 * @returns {Promise<Comment>} Updated comment document
 */
commentSchema.methods.edit = async function(newContent, userId) {
  // Save current content to edit history
  this.editHistory.push({
    content: this.content,
    editedBy: userId
  });
  
  // Update content
  this.content = newContent;
  
  return this.save();
};

/**
 * Flag this comment for moderation
 * @param {ObjectId} userId - ID of user flagging the comment
 * @param {string} reason - Reason for flagging (spam, offensive, etc.)
 * @returns {Promise<Comment>} Updated comment document
 */
commentSchema.methods.flag = async function(userId, reason) {
  // Check if user has already flagged this comment
  const existingFlag = this.flags.find(f => f.flaggedBy.toString() === userId.toString());
  
  if (!existingFlag) {
    // Add new flag
    this.flags.push({
      flaggedBy: userId,
      reason: reason
    });
    return this.save();
  }
  
  // Return unchanged if already flagged by this user
  return this;
};

/**
 * Static Methods
 * Methods available on the Comment model itself
 */

/**
 * Get complete comment thread with nested replies
 * @param {ObjectId} commentId - ID of root comment
 * @param {ObjectId} userId - ID of current user (for vote status)
 * @returns {Promise<Object>} Comment thread with nested children
 */
commentSchema.statics.getThread = async function(commentId, userId = null) {
  // Get the root comment with populated fields
  const comment = await this.findById(commentId)
    .populate('author', 'username karma avatar')
    .populate('mentions', 'username');
    
  if (!comment) return null;
  
  // Get all child comments
  const children = await this.find({ parent: commentId, isDeleted: false })
    .populate('author', 'username karma avatar')
    .populate('mentions', 'username')
    .sort({ score: -1, createdAt: -1 });
    
  return {
    ...comment.toObject(),
    children: children,
    // Include user's vote status if userId provided
    hasVoted: userId ? {
      up: comment.upvoters.some(id => id.toString() === userId.toString()),
      down: comment.downvoters.some(id => id.toString() === userId.toString())
    } : null
  };
};

/**
 * Update children count for a parent comment
 * @param {ObjectId} parentId - ID of parent comment
 * @returns {Promise<void>}
 */
commentSchema.statics.updateChildrenCount = async function(parentId) {
  if (!parentId) return;
  
  // Count non-deleted children
  const count = await this.countDocuments({ parent: parentId, isDeleted: false });
  
  // Update parent's children count
  await this.findByIdAndUpdate(parentId, { childrenCount: count });
};

/**
 * Post-save middleware to update parent's children count
 */
commentSchema.post('save', async function() {
  if (this.parent) {
    await this.constructor.updateChildrenCount(this.parent);
  }
});

/**
 * Create and export the Comment model
 */
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
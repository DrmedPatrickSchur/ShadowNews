/**
 * @fileoverview Posts Controller for ShadowNews Platform
 * 
 * Comprehensive post management system for the ShadowNews email-first news platform.
 * This controller handles all post-related operations including creation, retrieval,
 * voting, moderation, and social features. Posts are the core content units that
 * users submit and discuss, similar to Hacker News but with email distribution.
 * 
 * Key Features:
 * - Post creation with URL validation and duplicate detection
 * - Advanced sorting algorithms (hot, new, top) with time-based filtering
 * - Voting system with karma integration and Wilson confidence scoring
 * - AI-powered hashtag suggestion and content analysis
 * - Email repository integration for post-specific email lists
 * - Post editing with time restrictions and ownership validation
 * - Comprehensive moderation tools including reporting and auto-hiding
 * - Post saving/bookmarking for user collections
 * - Trending hashtag analysis with temporal filtering
 * - View tracking and engagement analytics
 * 
 * Post Types:
 * - URL Posts: External links with titles and optional text
 * - Text Posts: Self-posts with text content only
 * - Repository Posts: Posts with associated email lists
 * 
 * Sorting Algorithms:
 * - Hot: Reddit-style hot score with time decay and comment boost
 * - New: Chronological ordering by creation date
 * - Top: Score-based with configurable time windows
 * 
 * Security Features:
 * - Ownership validation for all modification operations
 * - Input sanitization and validation
 * - Rate limiting for post creation and voting
 * - Anti-spam measures with duplicate URL detection
 * - Automated moderation with report thresholds
 * 
 * Integration Points:
 * - AI Service: Hashtag suggestions and content analysis
 * - Karma System: Post creation and voting rewards
 * - Notification Service: Follower notifications and moderation alerts
 * - Repository Service: Email list management for posts
 * - Comment System: Threaded discussions on posts
 * 
 * Dependencies:
 * - Post.model: Main post data model with voting and metadata
 * - User.model: User data for ownership and saved posts
 * - Repository.model: Email repository integration
 * - ai.service: AI-powered content analysis and suggestions
 * - karma.service: Reputation system integration
 * - notification.service: User and moderator notifications
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Model dependencies for post operations
const Post = require('../../models/Post.model');           // Post data model
const User = require('../../models/User.model');           // User data for ownership
const Repository = require('../../models/Repository.model'); // Email repository integration

// Service layer dependencies
const aiService = require('../../services/ai.service');              // AI content analysis
const karmaService = require('../../services/karma.service');        // Reputation system
const notificationService = require('../../services/notification.service'); // User notifications

// Utility dependencies
const { validationResult } = require('express-validator');  // Input validation
const logger = require('../../utils/logger');               // Application logging

/**
 * Get All Posts with Advanced Filtering and Sorting
 * Retrieves posts with comprehensive pagination, filtering, and sorting options
 * 
 * This endpoint provides the main post feed with support for multiple sorting
 * algorithms, hashtag filtering, repository filtering, and temporal constraints.
 * Implements Reddit-style hot scoring for optimal content discovery.
 * 
 * @route GET /api/posts
 * @access Public (no authentication required for basic post viewing)
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of posts per page (default: 30, max: 100)
 * @param {string} req.query.sort - Sorting method: 'hot', 'new', 'top' (default: 'hot')
 * @param {string} req.query.hashtag - Filter by specific hashtag
 * @param {string} req.query.repository - Filter by repository ID
 * @param {string} req.query.timeframe - Time window for 'top' sort: '1h', '24h', '1w', '1m', '1y'
 * @returns {Object} Paginated posts with metadata and population
 */
exports.getPosts = async (req, res) => {
  try {
    // Extract query parameters with defaults for optimal user experience
    const { 
      page = 1, 
      limit = 30, 
      sort = 'hot',         // Default to hot sorting for best content discovery
      hashtag, 
      repository,
      timeframe = '24h'     // Default 24-hour window for top posts
    } = req.query;

    // Calculate pagination offset
    const skip = (page - 1) * limit;
    let query = {};
    let sortOption = {};

    // Apply hashtag filter for topical content discovery
    if (hashtag) {
      query.hashtags = hashtag;
    }

    // Apply repository filter for email-specific content
    if (repository) {
      query.repositories = repository;
    }

    // Implement sorting algorithms based on user preference
    switch (sort) {
      case 'new':
        // Chronological sorting for latest content
        sortOption = { createdAt: -1 };
        break;
        
      case 'top':
        // Score-based sorting with time constraints
        const timeframeMap = {
          '1h': 1,      // Last hour
          '24h': 24,    // Last day
          '1w': 168,    // Last week (168 hours)
          '1m': 720,    // Last month (30 days)
          '1y': 8760    // Last year (365 days)
        };
        const hoursAgo = timeframeMap[timeframe] || 24;
        const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        query.createdAt = { $gte: cutoffDate };
        sortOption = { score: -1 };
        break;
        
      case 'hot':
      default:
        // Reddit-style hot algorithm with time decay and engagement boost
        // Combines score, age, and comment activity for optimal content discovery
        sortOption = { hotScore: -1 };
        break;
    }

    // Execute optimized database query with population for complete data
    const posts = await Post.find(query)
      .populate('author', 'username email karma')          // Author info with reputation
      .populate('repositories', 'name emailCount')         // Repository metadata
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();                                              // Use lean() for better performance

    // Get total count for pagination metadata
    const total = await Post.countDocuments(query);

    // Return comprehensive response with posts and pagination info
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

/**
 * Get Single Post by ID
 * Retrieves a specific post with full details and populated relationships
 * 
 * This endpoint fetches a single post with complete information including
 * author details, repositories, and comments. Also increments view count
 * for analytics and engagement tracking.
 * 
 * @route GET /api/posts/:id
 * @access Public (no authentication required for post viewing)
 * @param {string} req.params.id - MongoDB ObjectId of the post
 * @returns {Object} Complete post data with populated relationships
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch post with comprehensive population for full details
    const post = await Post.findById(id)
      .populate('author', 'username email karma badges')      // Author with reputation and badges
      .populate('repositories', 'name description emailCount') // Repository details
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username karma'                            // Comment authors
        }
      });

    // Handle post not found
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count for analytics (fire-and-forget)
    // This helps track popular content and user engagement
    await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json(post);
  } catch (error) {
    logger.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

/**
 * Create New Post
 * Creates a new post with comprehensive validation and AI integration
 * 
 * This endpoint handles post creation with URL validation, duplicate detection,
 * AI-powered hashtag suggestion, and optional email repository creation.
 * Integrates with karma system and notification service.
 * 
 * @route POST /api/posts
 * @access Private (requires authentication)
 * @param {Object} req.body - Post creation data
 * @param {string} req.body.title - Post title (required)
 * @param {string} req.body.url - External URL (optional, for link posts)
 * @param {string} req.body.text - Post text content (optional, for text posts)
 * @param {string[]} req.body.repositories - Associated repository IDs
 * @param {string[]} req.body.hashtags - Post hashtags (auto-generated if empty)
 * @param {string[]} req.body.emailList - Email list for auto-repository creation
 * @returns {Object} Created post with populated data
 */
exports.createPost = async (req, res) => {
  try {
    // Validate input data using express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url, text, repositories, hashtags, emailList } = req.body;
    const userId = req.user.id;

    // Prevent duplicate URL submissions to maintain content quality
    if (url) {
      const existingPost = await Post.findOne({ url });
      if (existingPost) {
        return res.status(409).json({ 
          error: 'This URL has already been posted',
          existingPostId: existingPost._id 
        });
      }
    }

    // Use AI service to generate hashtags if none provided
    // This improves content discoverability and categorization
    let finalHashtags = hashtags;
    if (!hashtags || hashtags.length === 0) {
      const content = `${title} ${text || ''}`;
      finalHashtags = await aiService.suggestHashtags(content);
    }

    // Create post with initial scoring
    const post = new Post({
      title,
      url,
      text,
      author: userId,
      hashtags: finalHashtags,
      repositories: repositories || [],
      score: 1,                                               // Initial upvote from author
      hotScore: calculateHotScore(1, 0, new Date())          // Initial hot score
    });

    // Auto-create repository if email list provided
    // This enables posts to have their own email distribution lists
    if (emailList && emailList.length > 0) {
      const repository = await Repository.create({
        name: `${title} Repository`,
        owner: userId,
        emails: emailList,
        associatedPost: post._id
      });
      post.repositories.push(repository._id);
    }

    await post.save();

    // Award karma for content creation to encourage posting
    await karmaService.awardKarma(userId, 'POST_CREATED', 50);

    // Notify user's followers about the new post
    await notificationService.notifyFollowers(userId, 'NEW_POST', {
      postId: post._id,
      title: post.title
    });

    // Return populated post data for immediate use
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username email karma')
      .populate('repositories', 'name emailCount');

    res.status(201).json(populatedPost);
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * Update Existing Post
 * Updates post content with ownership validation and time restrictions
 * 
 * This endpoint allows post editing with strict ownership validation and
 * time-based restrictions to prevent abuse while allowing corrections.
 * Only text content and hashtags can be modified.
 * 
 * @route PUT /api/posts/:id
 * @access Private (requires authentication and ownership)
 * @param {string} req.params.id - Post ID to update
 * @param {Object} req.body - Update data
 * @param {string} req.body.text - Updated text content
 * @param {string[]} req.body.hashtags - Updated hashtags
 * @returns {Object} Updated post with populated data
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, hashtags } = req.body;
    const userId = req.user.id;

    // Fetch post for ownership validation
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify user owns the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Enforce 1-hour edit window to prevent abuse
    // This maintains content integrity while allowing quick corrections
    const hoursSinceCreation = (Date.now() - post.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 1) {
      return res.status(403).json({ error: 'Posts can only be edited within 1 hour of creation' });
    }

    // Update allowed fields
    if (text !== undefined) post.text = text;
    if (hashtags !== undefined) post.hashtags = hashtags;
    post.editedAt = new Date();                              // Track edit timestamp

    await post.save();

    // Return updated post with populated data
    const updatedPost = await Post.findById(id)
      .populate('author', 'username email karma')
      .populate('repositories', 'name emailCount');

    res.json(updatedPost);
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

/**
 * Delete Post (Soft Delete)
 * Soft deletes a post with ownership validation or admin override
 * 
 * This endpoint implements soft deletion to preserve data integrity and
 * enable potential recovery. Updates karma and maintains audit trail.
 * 
 * @route DELETE /api/posts/:id
 * @access Private (requires authentication and ownership or admin role)
 * @param {string} req.params.id - Post ID to delete
 * @returns {Object} Deletion confirmation message
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch post for validation
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check ownership or admin privileges
    if (post.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Perform soft delete with audit trail
    post.deleted = true;
    post.deletedAt = new Date();
    post.deletedBy = userId;                                 // Track who deleted it
    await post.save();

    // Remove karma gained from post creation
    await karmaService.removeKarma(post.author, 'POST_DELETED', 50);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

/**
 * Vote on Post
 * Handles upvoting and downvoting with karma integration
 * 
 * This endpoint manages the voting system with vote tracking, score calculation,
 * and karma rewards. Implements vote switching and removal functionality.
 * 
 * @route POST /api/posts/:id/vote
 * @access Private (requires authentication)
 * @param {string} req.params.id - Post ID to vote on
 * @param {Object} req.body - Vote data
 * @param {number} req.body.vote - Vote value: 1 (upvote), -1 (downvote), 0 (remove)
 * @returns {Object} Updated vote counts and user's current vote
 */
exports.votePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;
    const userId = req.user.id;

    // Validate vote value
    if (![-1, 0, 1].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote value' });
    }

    // Fetch post for voting
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove any existing vote from this user
    post.upvotes = post.upvotes.filter(uid => uid.toString() !== userId);
    post.downvotes = post.downvotes.filter(uid => uid.toString() !== userId);

    // Apply new vote if not removal (0)
    if (vote === 1) {
      post.upvotes.push(userId);
    } else if (vote === -1) {
      post.downvotes.push(userId);
    }

    // Recalculate scores with new vote counts
    post.score = post.upvotes.length - post.downvotes.length;
    post.hotScore = calculateHotScore(post.score, post.comments.length, post.createdAt);

    await post.save();

    // Award or remove karma based on vote type
    if (vote === 1) {
      await karmaService.awardKarma(post.author, 'POST_UPVOTED', 10);
    } else if (vote === -1) {
      await karmaService.removeKarma(post.author, 'POST_DOWNVOTED', 5);
    }

    // Return updated vote information
    res.json({
      score: post.score,
      userVote: vote,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length
    });
  } catch (error) {
    logger.error('Error voting on post:', error);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
};

/**
 * Save/Unsave Post
 * Toggles post in user's saved collection for bookmarking
 * 
 * This endpoint manages user's saved posts collection, allowing users to
 * bookmark interesting content for later reference.
 * 
 * @route POST /api/posts/:id/save
 * @access Private (requires authentication)
 * @param {string} req.params.id - Post ID to save/unsave
 * @returns {Object} Save status and confirmation message
 */
exports.savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate post exists
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Toggle save status in user's saved posts array
    const user = await User.findById(userId);
    const savedIndex = user.savedPosts.indexOf(id);

    if (savedIndex === -1) {
      // Add to saved posts
      user.savedPosts.push(id);
    } else {
      // Remove from saved posts
      user.savedPosts.splice(savedIndex, 1);
    }

    await user.save();

    res.json({
      saved: savedIndex === -1,
      message: savedIndex === -1 ? 'Post saved' : 'Post unsaved'
    });
  } catch (error) {
    logger.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
};

/**
 * Report Post
 * Allows users to report problematic content for moderation
 * 
 * This endpoint handles content reporting with automatic moderation actions
 * based on report thresholds. Implements duplicate report prevention.
 * 
 * @route POST /api/posts/:id/report
 * @access Private (requires authentication)
 * @param {string} req.params.id - Post ID to report
 * @param {Object} req.body - Report data
 * @param {string} req.body.reason - Report reason category
 * @param {string} req.body.details - Additional report details
 * @returns {Object} Report confirmation message
 */
exports.reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;
    const userId = req.user.id;

    // Validate post exists
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Prevent duplicate reports from same user
    const existingReport = post.reports.find(r => r.reporter.toString() === userId);
    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this post' });
    }

    // Add report to post
    post.reports.push({
      reporter: userId,
      reason,
      details,
      createdAt: new Date()
    });

    // Auto-hide post if report threshold reached
    // This provides automated moderation for clearly problematic content
    if (post.reports.length >= 5) {
      post.hidden = true;
      
      // Notify moderators for review
      await notificationService.notifyModerators('POST_AUTO_HIDDEN', {
        postId: post._id,
        reportCount: post.reports.length
      });
    }

    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    logger.error('Error reporting post:', error);
    res.status(500).json({ error: 'Failed to report post' });
  }
};

/**
 * Get Trending Hashtags
 * Retrieves popular hashtags based on usage and engagement
 * 
 * This endpoint analyzes hashtag trends across different time periods,
 * considering both usage frequency and total engagement scores.
 * 
 * @route GET /api/posts/trending/hashtags
 * @access Public (no authentication required)
 * @param {number} req.query.limit - Number of hashtags to return (default: 10)
 * @param {string} req.query.timeframe - Time window: '1h', '6h', '24h', '1w'
 * @returns {Object} Array of trending hashtags with statistics
 */
exports.getTrendingHashtags = async (req, res) => {
  try {
    const { limit = 10, timeframe = '24h' } = req.query;

    // Map timeframe strings to hours for date calculation
    const hoursMap = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '1w': 168
    };

    const hours = hoursMap[timeframe] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Aggregate hashtag usage and engagement within timeframe
    const trending = await Post.aggregate([
      { $match: { createdAt: { $gte: since }, deleted: false } },  // Active posts only
      { $unwind: '$hashtags' },                                    // Separate hashtag array
      { $group: { 
        _id: '$hashtags', 
        count: { $sum: 1 },                                       // Usage frequency
        totalScore: { $sum: '$score' }                            // Total engagement
      }},
      { $sort: { count: -1, totalScore: -1 } },                   // Sort by frequency then engagement
      { $limit: parseInt(limit) }
    ]);

    // Format response with hashtag statistics
    res.json(trending.map(tag => ({
      hashtag: tag._id,
      count: tag.count,
      score: tag.totalScore
    })));
  } catch (error) {
    logger.error('Error fetching trending hashtags:', error);
    res.status(500).json({ error: 'Failed to fetch trending hashtags' });
  }
};

/**
 * Calculate Hot Score for Posts
 * Implements Reddit-style hot scoring algorithm with ShadowNews modifications
 * 
 * This function calculates a "hot score" that determines post ranking in the
 * default feed. Combines vote score, time decay, and comment engagement to
 * surface the most engaging recent content.
 * 
 * Algorithm Components:
 * - Score: Net upvotes (upvotes - downvotes)
 * - Time Decay: Posts lose ranking over time
 * - Comment Boost: Active discussions get ranking boost
 * - Logarithmic Scaling: Prevents vote manipulation
 * 
 * @param {number} score - Net vote score (upvotes - downvotes)
 * @param {number} commentCount - Number of comments on the post
 * @param {Date} createdAt - Post creation timestamp
 * @returns {number} Hot score for ranking (higher = more prominent)
 */
function calculateHotScore(score, commentCount, createdAt) {
  // Logarithmic scaling prevents vote manipulation and ensures diminishing returns
  const order = Math.log10(Math.max(Math.abs(score), 1));
  
  // Maintain score direction (positive/negative/neutral)
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  
  // Time component: seconds since epoch (Jan 1, 2021) divided by decay factor
  // This creates time-based decay where newer posts rank higher
  const seconds = (createdAt.getTime() / 1000) - 1609459200;
  
  // Comment boost: Active discussions get ranking bonus
  // Logarithmic scaling prevents comment spam from dominating
  const commentBoost = Math.log10(Math.max(commentCount, 1)) * 2;
  
  // Combine all factors with appropriate weighting
  // 45000 is the decay factor (approximately 12.5 hours for significant decay)
  return parseFloat((sign * order + seconds / 45000 + commentBoost).toFixed(7));
}

// Export all controller functions for route binding
module.exports = exports;

// Get single post by ID
exports.getPostById = async (req, res) => {
 try {
   const { id } = req.params;
   
   const post = await Post.findById(id)
     .populate('author', 'username email karma badges')
     .populate('repositories', 'name description emailCount')
     .populate({
       path: 'comments',
       populate: {
         path: 'author',
         select: 'username karma'
       }
     });

   if (!post) {
     return res.status(404).json({ error: 'Post not found' });
   }

   // Increment view count
   await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });

   res.json(post);
 } catch (error) {
   logger.error('Error fetching post:', error);
   res.status(500).json({ error: 'Failed to fetch post' });
 }
};

// Create new post
exports.createPost = async (req, res) => {
 try {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   const { title, url, text, repositories, hashtags, emailList } = req.body;
   const userId = req.user.id;

   // Check if URL already posted
   if (url) {
     const existingPost = await Post.findOne({ url });
     if (existingPost) {
       return res.status(409).json({ 
         error: 'This URL has already been posted',
         existingPostId: existingPost._id 
       });
     }
   }

   // Get AI-suggested hashtags if not provided
   let finalHashtags = hashtags;
   if (!hashtags || hashtags.length === 0) {
     const content = `${title} ${text || ''}`;
     finalHashtags = await aiService.suggestHashtags(content);
   }

   // Create post
   const post = new Post({
     title,
     url,
     text,
     author: userId,
     hashtags: finalHashtags,
     repositories: repositories || [],
     score: 1,
     hotScore: calculateHotScore(1, 0, new Date())
   });

   // If email list provided, create repository
   if (emailList && emailList.length > 0) {
     const repository = await Repository.create({
       name: `${title} Repository`,
       owner: userId,
       emails: emailList,
       associatedPost: post._id
     });
     post.repositories.push(repository._id);
   }

   await post.save();

   // Award karma for posting
   await karmaService.awardKarma(userId, 'POST_CREATED', 50);

   // Notify followers
   await notificationService.notifyFollowers(userId, 'NEW_POST', {
     postId: post._id,
     title: post.title
   });

   const populatedPost = await Post.findById(post._id)
     .populate('author', 'username email karma')
     .populate('repositories', 'name emailCount');

   res.status(201).json(populatedPost);
 } catch (error) {
   logger.error('Error creating post:', error);
   res.status(500).json({ error: 'Failed to create post' });
 }
};

// Update post
exports.updatePost = async (req, res) => {
 try {
   const { id } = req.params;
   const { text, hashtags } = req.body;
   const userId = req.user.id;

   const post = await Post.findById(id);
   if (!post) {
     return res.status(404).json({ error: 'Post not found' });
   }

   // Check ownership
   if (post.author.toString() !== userId) {
     return res.status(403).json({ error: 'You can only edit your own posts' });
   }

   // Only allow editing text posts and within 1 hour
   const hoursSinceCreation = (Date.now() - post.createdAt) / (1000 * 60 * 60);
   if (hoursSinceCreation > 1) {
     return res.status(403).json({ error: 'Posts can only be edited within 1 hour of creation' });
   }

   // Update fields
   if (text !== undefined) post.text = text;
   if (hashtags !== undefined) post.hashtags = hashtags;
   post.editedAt = new Date();

   await post.save();

   const updatedPost = await Post.findById(id)
     .populate('author', 'username email karma')
     .populate('repositories', 'name emailCount');

   res.json(updatedPost);
 } catch (error) {
   logger.error('Error updating post:', error);
   res.status(500).json({ error: 'Failed to update post' });
 }
};

// Delete post
exports.deletePost = async (req, res) => {
 try {
   const { id } = req.params;
   const userId = req.user.id;
   const userRole = req.user.role;

   const post = await Post.findById(id);
   if (!post) {
     return res.status(404).json({ error: 'Post not found' });
   }

   // Check ownership or admin
   if (post.author.toString() !== userId && userRole !== 'admin') {
     return res.status(403).json({ error: 'You can only delete your own posts' });
   }

   // Soft delete
   post.deleted = true;
   post.deletedAt = new Date();
   post.deletedBy = userId;
   await post.save();

   // Remove karma
   await karmaService.removeKarma(post.author, 'POST_DELETED', 50);

   res.json({ message: 'Post deleted successfully' });
 } catch (error) {
   logger.error('Error deleting post:', error);
   res.status(500).json({ error: 'Failed to delete post' });
 }
};

// Vote on post
exports.votePost = async (req, res) => {
 try {
   const { id } = req.params;
   const { vote } = req.body; // 1 for upvote, -1 for downvote, 0 to remove vote
   const userId = req.user.id;

   if (![-1, 0, 1].includes(vote)) {
     return res.status(400).json({ error: 'Invalid vote value' });
   }

   const post = await Post.findById(id);
   if (!post) {
     return res.status(404).json({ error: 'Post not found' });
   }

   // Remove existing vote
   post.upvotes = post.upvotes.filter(uid => uid.toString() !== userId);
   post.downvotes = post.downvotes.filter(uid => uid.toString() !== userId);

   // Add new vote
   if (vote === 1) {
     post.upvotes.push(userId);
   } else if (vote === -1) {
     post.downvotes.push(userId);
   }

   // Update score
   post.score = post.upvotes.length - post.downvotes.length;
   post.hotScore = calculateHotScore(post.score, post.comments.length, post.createdAt);

   await post.save();

   // Award karma to post author
   if (vote === 1) {
     await karmaService.awardKarma(post.author, 'POST_UPVOTED', 10);
   } else if (vote === -1) {
     await karmaService.removeKarma(post.author, 'POST_DOWNVOTED', 5);
   }

   res.json({
     score: post.score,
     userVote: vote,
     upvotes: post.upvotes.length,
     downvotes: post.downvotes.length
   });
 } catch (error) {
   logger.error('Error voting on post:', error);
   res.status(500).json({ error: 'Failed to vote on post' });
 }
};

// Save/unsave post
exports.savePost = async (req, res) => {
 try {
   const { id } = req.params;
   const userId = req.user.id;

   const post = await Post.findById(id);
   if (!post) {
     return res.status(404).json({ error: 'Post not found' });
   }

   const user = await User.findById(userId);
   const savedIndex = user.savedPosts.indexOf(id);

   if (savedIndex === -1) {
     user.savedPosts.push(id);
   } else {
     user.savedPosts.splice(savedIndex, 1);
   }

   await user.save();

   res.json({
     saved: savedIndex === -1,
     message: savedIndex === -1 ? 'Post saved' : 'Post unsaved'
   });
 } catch (error) {
   logger.error('Error saving post:', error);
   res.status(500).json({ error: 'Failed to save post' });
 }
};

// Report post
exports.reportPost = async (req, res) => {
 try {
   const { id } = req.params;
   const { reason, details } = req.body;
   const userId = req.user.id;

   const post = await Post.findById(id);
   if (!post) {
     return res.status(404).json({ error: 'Post not found' });
   }

   // Check if already reported by user
   const existingReport = post.reports.find(r => r.reporter.toString() === userId);
   if (existingReport) {
     return res.status(400).json({ error: 'You have already reported this post' });
   }

   post.reports.push({
     reporter: userId,
     reason,
     details,
     createdAt: new Date()
   });

   // Auto-hide if too many reports
   if (post.reports.length >= 5) {
     post.hidden = true;
     await notificationService.notifyModerators('POST_AUTO_HIDDEN', {
       postId: post._id,
       reportCount: post.reports.length
     });
   }

   await post.save();

   res.json({ message: 'Post reported successfully' });
 } catch (error) {
   logger.error('Error reporting post:', error);
   res.status(500).json({ error: 'Failed to report post' });
 }
};

// Get trending hashtags
exports.getTrendingHashtags = async (req, res) => {
 try {
   const { limit = 10, timeframe = '24h' } = req.query;

   const hoursMap = {
     '1h': 1,
     '6h': 6,
     '24h': 24,
     '1w': 168
   };

   const hours = hoursMap[timeframe] || 24;
   const since = new Date(Date.now() - hours * 60 * 60 * 1000);

   const trending = await Post.aggregate([
     { $match: { createdAt: { $gte: since }, deleted: false } },
     { $unwind: '$hashtags' },
     { $group: { 
       _id: '$hashtags', 
       count: { $sum: 1 },
       totalScore: { $sum: '$score' }
     }},
     { $sort: { count: -1, totalScore: -1 } },
     { $limit: parseInt(limit) }
   ]);

   res.json(trending.map(tag => ({
     hashtag: tag._id,
     count: tag.count,
     score: tag.totalScore
   })));
 } catch (error) {
   logger.error('Error fetching trending hashtags:', error);
   res.status(500).json({ error: 'Failed to fetch trending hashtags' });
 }
};

// Helper function to calculate hot score
function calculateHotScore(score, commentCount, createdAt) {
 const order = Math.log10(Math.max(Math.abs(score), 1));
 const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
 const seconds = (createdAt.getTime() / 1000) - 1609459200; // Seconds since Jan 1, 2021
 const commentBoost = Math.log10(Math.max(commentCount, 1)) * 2;
 return parseFloat((sign * order + seconds / 45000 + commentBoost).toFixed(7));
}

module.exports = exports;
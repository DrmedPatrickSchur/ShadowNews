/**
 * @fileoverview Comments Controller for ShadowNews Platform
 * 
 * Comprehensive comment management system handling threaded discussions, voting,
 * and moderation for posts. This controller implements a Reddit-style threaded
 * comment system with unlimited nesting, voting mechanisms, and AI-powered
 * content enhancement.
 * 
 * Key Features:
 * - Threaded comment system with unlimited nesting depth
 * - Voting system with upvotes/downvotes and Wilson scoring
 * - AI-powered hashtag suggestion and content analysis
 * - Real-time notifications for comment interactions
 * - Soft deletion preserving thread structure
 * - Karma integration for community reputation
 * - Edit windows with audit trails
 * - Moderation capabilities for admins
 * - Pagination and sorting (best, new, old, top)
 * 
 * Comment Structure:
 * - Root comments: Direct replies to posts (parentId: null)
 * - Nested comments: Replies to other comments (parentId: set)
 * - Recursive loading: Fetches entire comment trees
 * - Vote aggregation: Calculates Wilson confidence intervals
 * 
 * Security Features:
 * - Input validation and sanitization
 * - User ownership verification for edits/deletes
 * - Rate limiting on comment creation
 * - IP tracking for moderation purposes
 * - Edit time windows to prevent abuse
 * - Soft deletion preserving conversation context
 * 
 * AI Integration:
 * - Automatic hashtag suggestions based on content
 * - Content quality analysis and scoring
 * - Spam detection and filtering
 * - Sentiment analysis for moderation
 * 
 * Dependencies:
 * - Comment model: MongoDB schema for comment data
 * - Post model: Integration with post comment counts
 * - User model: Author information and permissions
 * - karma.service: Community reputation management
 * - notification.service: Real-time user notifications
 * - ai.service: Content analysis and enhancement
 * - express-validator: Input validation and sanitization
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Database models for comment operations
const Comment = require('../../models/Comment.model');     // Comment database schema
const Post = require('../../models/Post.model');           // Post database schema
const User = require('../../models/User.model');           // User database schema

// Service layer dependencies
const karmaService = require('../../services/karma.service');           // Karma/reputation management
const notificationService = require('../../services/notification.service'); // User notifications
const aiService = require('../../services/ai.service');                 // AI content analysis

// Validation and utilities
const { validationResult } = require('express-validator');  // Input validation

/**
 * Comments Controller Object
 * Main controller containing all comment-related endpoint handlers
 * 
 * This controller follows RESTful patterns and implements comprehensive
 * comment management for the ShadowNews platform's discussion system.
 */
const commentsController = {

  /**
   * Create New Comment
   * Creates a new comment or reply with AI enhancement and notifications
   * 
   * This endpoint handles both root comments (replies to posts) and nested
   * comments (replies to other comments). It integrates AI for hashtag
   * suggestions and sends notifications to relevant users.
   * 
   * @route POST /api/comments
   * @access Private (requires authentication)
   * @param {Object} req.body - Comment creation data
   * @param {string} req.body.postId - ID of the post being commented on
   * @param {string} req.body.parentId - ID of parent comment (null for root comments)
   * @param {string} req.body.content - Comment text content
   * @param {string[]} req.body.hashtags - Optional hashtags (AI suggests if empty)
   * @returns {Object} Created comment with populated user data
   */
  async createComment(req, res) {
    try {
      // Validate input data using express-validator rules
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract comment data from request
      const { postId, parentId, content, hashtags } = req.body;
      const userId = req.user.id;

      // Verify that the target post exists and is accessible
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Verify parent comment exists if this is a nested reply
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment) {
          return res.status(404).json({ error: 'Parent comment not found' });
        }
      }

      // Use AI to suggest hashtags if none provided by user
      // This enhances content discoverability and categorization
      let finalHashtags = hashtags;
      if (!hashtags || hashtags.length === 0) {
        finalHashtags = await aiService.suggestHashtags(content);
      }

      // Create new comment document with all metadata
      const comment = new Comment({
        postId,                    // Reference to the post
        parentId,                  // Reference to parent comment (null for root)
        userId,                    // Comment author
        content,                   // Comment text content
        hashtags: finalHashtags,   // AI-suggested or user-provided hashtags
        metadata: {
          userAgent: req.get('user-agent'),  // Browser/client information
          ipAddress: req.ip                  // IP address for moderation
        }
      });

      // Save comment to database
      await comment.save();

      // Update post's comment count and last activity timestamp
      // This denormalization improves query performance
      await Post.findByIdAndUpdate(postId, {
        $inc: { commentCount: 1 },    // Increment comment counter
        lastActivity: new Date()       // Update activity timestamp
      });

      // Award karma to the comment author for contributing to discussion
      await karmaService.awardKarma(userId, 'comment_created', comment._id);

      // Send notification to post author (if not commenting on own post)
      if (post.userId.toString() !== userId) {
        await notificationService.notify({
          userId: post.userId,
          type: 'comment_on_post',
          data: {
            commentId: comment._id,
            postId: post._id,
            commentAuthor: req.user.username
          }
        });
      }

      // Send notification to parent comment author (if replying to someone else)
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (parentComment.userId.toString() !== userId) {
          await notificationService.notify({
            userId: parentComment.userId,
            type: 'reply_to_comment',
            data: {
              commentId: comment._id,
              parentCommentId: parentId,
              replyAuthor: req.user.username
            }
          });
        }
      }

      // Populate user data for response (username, avatar, karma)
      await comment.populate('userId', 'username avatar karma');
      
      // Return created comment with success status
      res.status(201).json({
        success: true,
        comment
      });

    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  },

  /**
   * Get Post Comments
   * Retrieves threaded comments for a specific post with pagination and sorting
   * 
   * This endpoint fetches root comments and their nested replies, implementing
   * various sorting algorithms and pagination for optimal user experience.
   * 
   * @route GET /api/posts/:postId/comments
   * @access Public
   * @param {string} req.params.postId - ID of the post
   * @param {string} req.query.sort - Sort method (best, new, old, top)
   * @param {number} req.query.limit - Number of comments to return
   * @param {number} req.query.offset - Pagination offset
   * @returns {Object} Array of threaded comments with user votes
   */
  async getPostComments(req, res) {
    try {
      const { postId } = req.params;
      const { sort = 'best', limit = 50, offset = 0 } = req.query;

      // Build sort criteria based on user preference
      let sortCriteria = {};
      switch (sort) {
        case 'new':
          sortCriteria = { createdAt: -1 };    // Newest first
          break;
        case 'old':
          sortCriteria = { createdAt: 1 };     // Oldest first
          break;
        case 'top':
          sortCriteria = { score: -1 };        // Highest score first
          break;
        case 'best':
        default:
          sortCriteria = { wilsonScore: -1 };  // Best algorithm (default)
          break;
      }

      // Get root comments (direct replies to post)
      // Only fetch non-deleted comments to maintain clean threads
      const comments = await Comment.find({
        postId,              // Comments for this specific post
        parentId: null,      // Only root comments (no nested replies)
        deleted: false       // Exclude soft-deleted comments
      })
        .sort(sortCriteria)                                          // Apply sorting
        .limit(parseInt(limit))                                      // Limit results
        .skip(parseInt(offset))                                      // Pagination offset
        .populate('userId', 'username avatar karma badges')         // Include user data
        .lean();                                                     // Plain objects for performance

      // Get nested comments (replies) for each root comment
      // This creates the full threaded comment structure
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await getCommentReplies(comment._id, req.user?.id);
          return {
            ...comment,
            replies,    // Nested comment tree
            userVote: req.user ? await getUserVote(comment._id, req.user.id) : null
          };
        })
      );

      // Return threaded comments with pagination info
      res.json({
        success: true,
        comments: commentsWithReplies,
        hasMore: comments.length === parseInt(limit)  // Pagination indicator
      });

    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  },

  /**
   * Update Comment
   * Allows comment authors to edit their comments within a time window
   * 
   * This endpoint provides comment editing functionality with ownership
   * verification, time window restrictions, and AI re-analysis.
   * 
   * @route PUT /api/comments/:commentId
   * @access Private (requires authentication and ownership)
   * @param {string} req.params.commentId - ID of comment to update
   * @param {Object} req.body - Updated comment data
   * @param {string} req.body.content - New comment content
   * @returns {Object} Updated comment with user data
   */
  async updateComment(req, res) {
    try {
      // Validate input data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Find the comment to update
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Verify user owns this comment
      if (comment.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized to edit this comment' });
      }

      // Check edit time window (5 minutes for regular users)
      // This prevents abuse while allowing quick corrections
      const editWindow = 5 * 60 * 1000;  // 5 minutes in milliseconds
      if (Date.now() - comment.createdAt > editWindow && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Edit window has expired' });
      }

      // Update comment content and metadata
      comment.content = content;
      comment.edited = true;              // Mark as edited
      comment.editedAt = new Date();      // Timestamp the edit
      
      // Re-analyze content with AI for updated hashtags
      comment.hashtags = await aiService.suggestHashtags(content);
      
      // Save changes to database
      await comment.save();
      
      // Populate user data for response
      await comment.populate('userId', 'username avatar karma');

      // Return updated comment
      res.json({
        success: true,
        comment
      });

    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  },

  /**
   * Delete Comment
   * Soft-deletes comments while preserving thread structure
   * 
   * This endpoint implements soft deletion to maintain conversation flow
   * while removing inappropriate content. Adjusts karma and post counts.
   * 
   * @route DELETE /api/comments/:commentId
   * @access Private (requires authentication and ownership or admin)
   * @param {string} req.params.commentId - ID of comment to delete
   * @returns {Object} Deletion success confirmation
   */
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      // Find the comment to delete
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check ownership or admin privileges
      if (comment.userId.toString() !== userId && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized to delete this comment' });
      }

      // Soft delete to preserve thread structure and context
      // This maintains conversation flow while hiding inappropriate content
      comment.deleted = true;                  // Mark as deleted
      comment.deletedAt = new Date();          // Timestamp deletion
      comment.deletedBy = userId;              // Track who deleted it
      comment.content = '[deleted]';           // Replace content
      comment.hashtags = [];                   // Clear hashtags
      
      // Save deletion changes
      await comment.save();

      // Update post's comment count (decrement)
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: -1 }
      });

      // Remove karma that was awarded for this comment
      await karmaService.removeKarma(comment.userId, 'comment_deleted', comment._id);

      // Return deletion confirmation
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });

    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  },

  /**
   * Vote on Comment
   * Handles upvotes, downvotes, and vote removal for comments
   * 
   * This endpoint implements the voting system with Wilson confidence
   * scoring for quality ranking and karma adjustments for authors.
   * 
   * @route POST /api/comments/:commentId/vote
   * @access Private (requires authentication)
   * @param {string} req.params.commentId - ID of comment to vote on
   * @param {Object} req.body - Vote data
   * @param {number} req.body.value - Vote value (1=upvote, -1=downvote, 0=remove)
   * @returns {Object} Updated score and user vote status
   */
  async voteComment(req, res) {
    try {
      const { commentId } = req.params;
      const { value } = req.body; // 1 for upvote, -1 for downvote, 0 to remove vote
      const userId = req.user.id;

      // Find the comment to vote on
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if user has already voted on this comment
      const existingVoteIndex = comment.votes.findIndex(
        vote => vote.userId.toString() === userId
      );

      let karmaChange = 0;
      
      if (existingVoteIndex > -1) {
        // User has already voted - update or remove existing vote
        const oldValue = comment.votes[existingVoteIndex].value;
        
        if (value === 0) {
          // Remove existing vote
          comment.votes.splice(existingVoteIndex, 1);
          karmaChange = -oldValue;  // Reverse the karma effect
        } else {
          // Change existing vote (e.g., upvote to downvote)
          comment.votes[existingVoteIndex].value = value;
          karmaChange = value - oldValue;  // Net karma change
        }
      } else if (value !== 0) {
        // Add new vote (user hasn't voted before)
        comment.votes.push({ userId, value });
        karmaChange = value;
      }

      // Recalculate comment scores
      comment.score = comment.votes.reduce((sum, vote) => sum + vote.value, 0);
      comment.wilsonScore = calculateWilsonScore(comment.votes);
      
      // Save updated comment
      await comment.save();

      // Update comment author's karma based on vote change
      if (karmaChange !== 0) {
        const karmaType = karmaChange > 0 ? 'comment_upvoted' : 'comment_downvoted';
        await karmaService.awardKarma(comment.userId, karmaType, comment._id);
      }

      // Return updated vote information
      res.json({
        success: true,
        score: comment.score,
        userVote: value
      });

    } catch (error) {
      console.error('Vote comment error:', error);
      res.status(500).json({ error: 'Failed to vote on comment' });
    }
  },

  /**
   * Get Single Comment
   * Retrieves a specific comment with its replies and user vote status
   * 
   * This endpoint fetches detailed information about a single comment
   * including its full reply tree and the requesting user's vote.
   * 
   * @route GET /api/comments/:commentId
   * @access Public
   * @param {string} req.params.commentId - ID of comment to retrieve
   * @returns {Object} Comment with replies and user vote information
   */
  async getComment(req, res) {
    try {
      const { commentId } = req.params;
      
      // Find comment with populated user and post data
      const comment = await Comment.findById(commentId)
        .populate('userId', 'username avatar karma badges')
        .populate('postId', 'title slug');

      // Check if comment exists and is not deleted
      if (!comment || comment.deleted) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Get all replies to this comment (recursive)
      const replies = await getCommentReplies(comment._id, req.user?.id);
      
      // Return comment with full reply tree and user vote status
      res.json({
        success: true,
        comment: {
          ...comment.toObject(),
          replies,
          userVote: req.user ? await getUserVote(comment._id, req.user.id) : null
        }
      });

    } catch (error) {
      console.error('Get comment error:', error);
      res.status(500).json({ error: 'Failed to fetch comment' });
    }
  },

  /**
   * Get User Comments
   * Retrieves all comments by a specific user with pagination
   * 
   * This endpoint fetches a user's comment history for profile pages
   * and user activity tracking, excluding deleted comments.
   * 
   * @route GET /api/users/:userId/comments
   * @access Public
   * @param {string} req.params.userId - ID of user whose comments to fetch
   * @param {number} req.query.limit - Number of comments to return
   * @param {number} req.query.offset - Pagination offset
   * @returns {Object} Array of user's comments with post information
   */
  async getUserComments(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // Find all non-deleted comments by the user
      const comments = await Comment.find({
        userId,              // Comments by this user
        deleted: false       // Exclude deleted comments
      })
        .sort({ createdAt: -1 })                           // Newest first
        .limit(parseInt(limit))                            // Pagination limit
        .skip(parseInt(offset))                            // Pagination offset
        .populate('postId', 'title slug')                  // Include post info
        .lean();                                           // Plain objects

      // Return user's comments with pagination info
      res.json({
        success: true,
        comments,
        hasMore: comments.length === parseInt(limit)
      });

    } catch (error) {
      console.error('Get user comments error:', error);
      res.status(500).json({ error: 'Failed to fetch user comments' });
    }
  }
};

/**
 * Helper Functions
 * Utility functions for comment operations and calculations
 */

/**
 * Get Comment Replies Recursively
 * Fetches all nested replies for a comment in threaded structure
 * 
 * This function recursively builds the complete comment tree by fetching
 * replies and their sub-replies, creating the full conversation structure.
 * 
 * @param {string} parentId - ID of parent comment
 * @param {string} userId - ID of requesting user (for vote status)
 * @returns {Array} Array of nested reply objects
 */
async function getCommentReplies(parentId, userId) {
  // Find all direct replies to the parent comment
  const replies = await Comment.find({
    parentId,               // Replies to this parent
    deleted: false          // Exclude deleted comments
  })
    .sort({ wilsonScore: -1 })                           // Best replies first
    .populate('userId', 'username avatar karma badges')  // Include user data
    .lean();                                             // Plain objects

  // Recursively fetch sub-replies for each reply
  return Promise.all(
    replies.map(async (reply) => ({
      ...reply,
      replies: await getCommentReplies(reply._id, userId),  // Recursive call
      userVote: userId ? await getUserVote(reply._id, userId) : null
    }))
  );
}

/**
 * Get User Vote on Comment
 * Retrieves the current user's vote value for a specific comment
 * 
 * This function checks if a user has voted on a comment and returns
 * their vote value (1, -1, or 0 for no vote).
 * 
 * @param {string} commentId - ID of the comment
 * @param {string} userId - ID of the user
 * @returns {number} Vote value (1, -1, or 0)
 */
async function getUserVote(commentId, userId) {
  // Find comment and check for user's vote
  const comment = await Comment.findById(commentId, 'votes');
  const vote = comment.votes.find(v => v.userId.toString() === userId);
  return vote ? vote.value : 0;
}

/**
 * Calculate Wilson Confidence Score
 * Computes Wilson confidence interval for comment ranking
 * 
 * This algorithm provides better ranking than simple vote counts by
 * accounting for the confidence interval of the approval rating.
 * Used by Reddit and other platforms for "best" sorting.
 * 
 * @param {Array} votes - Array of vote objects with value property
 * @returns {number} Wilson confidence score (0-1)
 */
function calculateWilsonScore(votes) {
  // Count positive and negative votes
  const upvotes = votes.filter(v => v.value > 0).length;
  const downvotes = votes.filter(v => v.value < 0).length;
  const total = upvotes + downvotes;
  
  // Return 0 for comments with no votes
  if (total === 0) return 0;
  
  // Wilson confidence interval calculation (95% confidence)
  const z = 1.96; // 95% confidence level
  const phat = upvotes / total;  // Sample proportion
  
  // Wilson score formula
  const score = (phat + z*z/(2*total) - z * Math.sqrt((phat*(1-phat)+z*z/(4*total))/total))/(1+z*z/total);
  
  return score;
}

// Export the comments controller
module.exports = commentsController;
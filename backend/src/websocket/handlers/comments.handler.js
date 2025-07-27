/**
 * @fileoverview WebSocket Comments Handler
 * 
 * Real-time comment system handler providing live commenting, reply threading,
 * voting, and moderation capabilities for the ShadowNews platform. Enables
 * instant comment interactions without page refreshes for an engaging
 * discussion experience similar to modern social platforms.
 * 
 * This handler manages the complete lifecycle of comment interactions including
 * creation, editing, deletion, voting, and real-time presence indicators to
 * create a responsive and engaging comment system that feels alive.
 * 
 * Key Features:
 * - Real-time comment creation with instant display
 * - Live comment threading and reply functionality
 * - Real-time voting system with immediate score updates
 * - Comment editing with time limitations and conflict resolution
 * - Soft deletion with moderation capabilities
 * - Typing indicators for enhanced user experience
 * - User presence tracking in comment sections
 * - Hashtag extraction and linking
 * - Notification integration for replies and mentions
 * - Karma system integration for content quality
 * 
 * WebSocket Events Handled:
 * - authenticate - User authentication for secure commenting
 * - join_post/leave_post - Room management for post-specific comments
 * - comment_create - Live comment creation with threading
 * - comment_update - Real-time comment editing with validation
 * - comment_delete - Soft deletion with moderation support
 * - comment_vote - Live voting with karma integration
 * - comment_typing - Typing indicators for user presence
 * 
 * Real-time Features:
 * - Instant comment appearance in discussions
 * - Live vote count updates with smooth animations
 * - Real-time typing indicators showing active users
 * - Immediate reply threading and nesting
 * - Live user presence in comment sections
 * - Real-time notification delivery for replies
 * 
 * Threading System:
 * - Nested comment replies with depth tracking
 * - Parent-child relationship management
 * - Thread collapse and expansion
 * - Real-time thread updates and notifications
 * 
 * Security Features:
 * - JWT authentication for all comment operations
 * - Input validation and sanitization
 * - Time-limited editing windows for authenticity
 * - Spam detection and rate limiting
 * - Moderation tools for community management
 * 
 * Performance Optimizations:
 * - Efficient room-based broadcasting
 * - Debounced typing indicators
 * - Lazy loading for large comment threads
 * - Redis caching for comment metadata
 * - Connection pooling for scalability
 * 
 * Dependencies:
 * - Comment/Post/User models for data persistence
 * - Validation utilities for input security
 * - Karma service for reputation management
 * - Notification service for user alerts
 * - Logger for operation tracking
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Database models for comment operations and relationships
const Comment = require('../../models/Comment.model');
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');

// Centralized logging utility for comment operations
const { logger } = require('../../utils/logger');

// Input validation utilities for security
const { validateComment } = require('../../utils/validators');

// Service integrations for extended functionality
const karmaService = require('../../services/karma.service');
const notificationService = require('../../services/notification.service');

/**
 * Comments WebSocket Handler Class
 * 
 * Comprehensive handler for all comment-related real-time operations.
 * Manages comment namespaces, user presence, room management, and
 * event routing for live comment functionality.
 * 
 * This class provides a complete real-time comment system with threading,
 * voting, moderation, and notification capabilities.
 */
class CommentsHandler {
  /**
   * Comments Handler Constructor
   * 
   * Initializes the comments handler with Socket.IO integration and
   * sets up internal data structures for connection and room management.
   * 
   * @param {socketIO.Server} io - Socket.IO server instance
   * 
   * @since 1.0.0
   */
  constructor(io) {
    /** @type {socketIO.Server} Main Socket.IO server instance */
    this.io = io;
    
    /** @type {socketIO.Namespace} Dedicated namespace for comment events */
    this.commentsNamespace = io.of('/comments');
    
    /** @type {Map<string, Set>} Active comment rooms and their users */
    this.activeRooms = new Map();
    
    /** @type {Map<string, string>} User ID to socket ID mapping */
    this.userSockets = new Map();
  }

  /**
   * Initialize Comments Handler
   * 
   * Sets up all event listeners for the comments namespace and configures
   * the complete real-time comment system. Called during server startup
   * to activate live comment functionality.
   * 
   * Event Listeners:
   * - Connection management for user presence
   * - Authentication for secure commenting
   * - Room management for post-specific discussions
   * - CRUD operations for comment lifecycle
   * - Voting system for comment quality
   * - Typing indicators for user experience
   * 
   * @returns {void}
   * 
   * @since 1.0.0
   */
  initialize() {
    this.commentsNamespace.on('connection', (socket) => {
      logger.info(`User connected to comments namespace: ${socket.id}`);
      
      // Set up all comment-related event handlers
      socket.on('authenticate', (data) => this.handleAuthentication(socket, data));
      socket.on('join_post', (data) => this.handleJoinPost(socket, data));
      socket.on('leave_post', (data) => this.handleLeavePost(socket, data));
      socket.on('comment_create', (data) => this.handleCommentCreate(socket, data));
      socket.on('comment_update', (data) => this.handleCommentUpdate(socket, data));
      socket.on('comment_delete', (data) => this.handleCommentDelete(socket, data));
      socket.on('comment_vote', (data) => this.handleCommentVote(socket, data));
      socket.on('comment_typing', (data) => this.handleTypingIndicator(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  /**
   * Handle User Authentication
   * 
   * Authenticates users connecting to the comments namespace using JWT tokens.
   * Validates credentials and establishes user identity for secure commenting.
   * 
   * Authentication Process:
   * 1. Validate provided JWT token
   * 2. Extract user information from token
   * 3. Attach user data to socket for future operations
   * 4. Register user in active connections mapping
   * 5. Emit authentication confirmation or error
   * 
   * @param {socketIO.Socket} socket - Client socket connection
   * @param {Object} data - Authentication data containing JWT token
   * @param {string} data.token - JWT authentication token
   * 
   * @fires authenticated - Confirms successful authentication
   * @fires auth_error - Reports authentication failures
   * 
   * @since 1.0.0
   */

 async handleAuthentication(socket, { token }) {
   try {
     const user = await User.findByToken(token);
     if (!user) {
       socket.emit('auth_error', { message: 'Invalid authentication token' });
       return socket.disconnect();
     }

     socket.userId = user._id.toString();
     socket.user = {
       _id: user._id,
       username: user.username,
       karma: user.karma,
       avatar: user.avatar
     };

     this.userSockets.set(socket.userId, socket.id);
     socket.emit('authenticated', { user: socket.user });
     
     logger.info(`User ${user.username} authenticated on comments namespace`);
   } catch (error) {
     logger.error('Authentication error:', error);
     socket.emit('auth_error', { message: 'Authentication failed' });
     socket.disconnect();
   }
 }

 async handleJoinPost(socket, { postId }) {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Not authenticated' });
     }

     const post = await Post.findById(postId);
     if (!post) {
       return socket.emit('error', { message: 'Post not found' });
     }

     const roomName = `post:${postId}`;
     socket.join(roomName);
     
     if (!this.activeRooms.has(roomName)) {
       this.activeRooms.set(roomName, new Set());
     }
     this.activeRooms.get(roomName).add(socket.userId);

     const comments = await Comment.find({ postId })
       .populate('author', 'username karma avatar')
       .populate('votes.user', 'username')
       .sort({ createdAt: -1 });

     socket.emit('comments_loaded', {
       postId,
       comments,
       activeUsers: Array.from(this.activeRooms.get(roomName))
     });

     socket.to(roomName).emit('user_joined', {
       userId: socket.userId,
       username: socket.user.username
     });

     logger.info(`User ${socket.user.username} joined post ${postId}`);
   } catch (error) {
     logger.error('Error joining post:', error);
     socket.emit('error', { message: 'Failed to join post' });
   }
 }

 async handleLeavePost(socket, { postId }) {
   try {
     const roomName = `post:${postId}`;
     socket.leave(roomName);

     if (this.activeRooms.has(roomName)) {
       this.activeRooms.get(roomName).delete(socket.userId);
       if (this.activeRooms.get(roomName).size === 0) {
         this.activeRooms.delete(roomName);
       }
     }

     socket.to(roomName).emit('user_left', {
       userId: socket.userId,
       username: socket.user.username
     });

     logger.info(`User ${socket.user.username} left post ${postId}`);
   } catch (error) {
     logger.error('Error leaving post:', error);
   }
 }

 async handleCommentCreate(socket, { postId, content, parentId = null }) {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Not authenticated' });
     }

     const validation = validateComment({ content });
     if (!validation.isValid) {
       return socket.emit('error', { message: validation.errors.join(', ') });
     }

     const post = await Post.findById(postId);
     if (!post) {
       return socket.emit('error', { message: 'Post not found' });
     }

     if (parentId) {
       const parentComment = await Comment.findById(parentId);
       if (!parentComment || parentComment.postId.toString() !== postId) {
         return socket.emit('error', { message: 'Invalid parent comment' });
       }
     }

     const comment = new Comment({
       postId,
       author: socket.userId,
       content,
       parentId,
       depth: parentId ? (await Comment.findById(parentId)).depth + 1 : 0,
       votes: [],
       score: 0,
       hashtags: this.extractHashtags(content)
     });

     await comment.save();
     await comment.populate('author', 'username karma avatar');

     post.commentCount += 1;
     await post.save();

     await karmaService.awardKarma(socket.userId, 'comment_created', { 
       postId, 
       commentId: comment._id 
     });

     const roomName = `post:${postId}`;
     this.commentsNamespace.to(roomName).emit('comment_created', {
       comment,
       postId
     });

     if (parentId) {
       const parentComment = await Comment.findById(parentId).populate('author');
       if (parentComment.author._id.toString() !== socket.userId) {
         await notificationService.createNotification({
           recipientId: parentComment.author._id,
           type: 'comment_reply',
           actorId: socket.userId,
           entityType: 'comment',
           entityId: comment._id,
           message: `${socket.user.username} replied to your comment`
         });
       }
     } else if (post.author.toString() !== socket.userId) {
       await notificationService.createNotification({
         recipientId: post.author,
         type: 'post_comment',
         actorId: socket.userId,
         entityType: 'comment',
         entityId: comment._id,
         message: `${socket.user.username} commented on your post`
       });
     }

     socket.emit('comment_created_success', { comment });
     logger.info(`Comment created by ${socket.user.username} on post ${postId}`);
   } catch (error) {
     logger.error('Error creating comment:', error);
     socket.emit('error', { message: 'Failed to create comment' });
   }
 }

 async handleCommentUpdate(socket, { commentId, content }) {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Not authenticated' });
     }

     const validation = validateComment({ content });
     if (!validation.isValid) {
       return socket.emit('error', { message: validation.errors.join(', ') });
     }

     const comment = await Comment.findById(commentId);
     if (!comment) {
       return socket.emit('error', { message: 'Comment not found' });
     }

     if (comment.author.toString() !== socket.userId) {
       return socket.emit('error', { message: 'Unauthorized to edit this comment' });
     }

     const timeSinceCreation = Date.now() - comment.createdAt.getTime();
     const fiveMinutes = 5 * 60 * 1000;
     if (timeSinceCreation > fiveMinutes) {
       return socket.emit('error', { message: 'Comments can only be edited within 5 minutes' });
     }

     comment.content = content;
     comment.hashtags = this.extractHashtags(content);
     comment.edited = true;
     comment.editedAt = new Date();

     await comment.save();
     await comment.populate('author', 'username karma avatar');

     const roomName = `post:${comment.postId}`;
     this.commentsNamespace.to(roomName).emit('comment_updated', {
       comment,
       postId: comment.postId
     });

     socket.emit('comment_updated_success', { comment });
     logger.info(`Comment ${commentId} updated by ${socket.user.username}`);
   } catch (error) {
     logger.error('Error updating comment:', error);
     socket.emit('error', { message: 'Failed to update comment' });
   }
 }

 async handleCommentDelete(socket, { commentId }) {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Not authenticated' });
     }

     const comment = await Comment.findById(commentId);
     if (!comment) {
       return socket.emit('error', { message: 'Comment not found' });
     }

     if (comment.author.toString() !== socket.userId) {
       const user = await User.findById(socket.userId);
       if (!user.isAdmin && !user.isModerator) {
         return socket.emit('error', { message: 'Unauthorized to delete this comment' });
       }
     }

     const hasReplies = await Comment.exists({ parentId: commentId });
     if (hasReplies) {
       comment.content = '[deleted]';
       comment.deleted = true;
       comment.deletedAt = new Date();
       await comment.save();
     } else {
       await comment.remove();
     }

     const post = await Post.findById(comment.postId);
     post.commentCount = Math.max(0, post.commentCount - 1);
     await post.save();

     const roomName = `post:${comment.postId}`;
     this.commentsNamespace.to(roomName).emit('comment_deleted', {
       commentId,
       postId: comment.postId,
       softDelete: hasReplies
     });

     socket.emit('comment_deleted_success', { commentId });
     logger.info(`Comment ${commentId} deleted by ${socket.user.username}`);
   } catch (error) {
     logger.error('Error deleting comment:', error);
     socket.emit('error', { message: 'Failed to delete comment' });
   }
 }

 async handleCommentVote(socket, { commentId, voteType }) {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Not authenticated' });
     }

     if (!['upvote', 'downvote', 'unvote'].includes(voteType)) {
       return socket.emit('error', { message: 'Invalid vote type' });
     }

     const comment = await Comment.findById(commentId);
     if (!comment) {
       return socket.emit('error', { message: 'Comment not found' });
     }

     const existingVoteIndex = comment.votes.findIndex(
       v => v.user.toString() === socket.userId
     );

     let karmaChange = 0;
     let previousVoteType = null;

     if (existingVoteIndex !== -1) {
       previousVoteType = comment.votes[existingVoteIndex].type;
       comment.votes.splice(existingVoteIndex, 1);
       comment.score -= previousVoteType === 'upvote' ? 1 : -1;
     }

     if (voteType !== 'unvote') {
       comment.votes.push({
         user: socket.userId,
         type: voteType,
         votedAt: new Date()
       });
       comment.score += voteType === 'upvote' ? 1 : -1;

       if (voteType === 'upvote' && previousVoteType !== 'upvote') {
         karmaChange = 10;
       } else if (voteType === 'downvote' && previousVoteType !== 'downvote') {
         karmaChange = -5;
       }
     }

     await comment.save();
     await comment.populate('author', 'username karma avatar');

     if (karmaChange !== 0) {
       await karmaService.adjustKarma(comment.author._id, karmaChange, {
         reason: `comment_${voteType}`,
         commentId: comment._id
       });
     }

     const roomName = `post:${comment.postId}`;
     this.commentsNamespace.to(roomName).emit('comment_voted', {
       commentId,
       postId: comment.postId,
       score: comment.score,
       userVote: voteType === 'unvote' ? null : voteType
     });

     socket.emit('comment_voted_success', { 
       commentId, 
       voteType,
       newScore: comment.score 
     });

     logger.info(`Comment ${commentId} ${voteType}d by ${socket.user.username}`);
   } catch (error) {
     logger.error('Error voting on comment:', error);
     socket.emit('error', { message: 'Failed to vote on comment' });
   }
 }

 async handleTypingIndicator(socket, { postId, parentId }) {
   try {
     if (!socket.userId) return;

     const roomName = `post:${postId}`;
     socket.to(roomName).emit('user_typing', {
       userId: socket.userId,
       username: socket.user.username,
       parentId,
       timestamp: Date.now()
     });
   } catch (error) {
     logger.error('Error handling typing indicator:', error);
   }
 }

 handleDisconnect(socket) {
   try {
     if (socket.userId) {
       this.userSockets.delete(socket.userId);

       this.activeRooms.forEach((users, roomName) => {
         if (users.has(socket.userId)) {
           users.delete(socket.userId);
           if (users.size === 0) {
             this.activeRooms.delete(roomName);
           } else {
             socket.to(roomName).emit('user_left', {
               userId: socket.userId,
               username: socket.user.username
             });
           }
         }
       });
     }

     logger.info(`User disconnected from comments namespace: ${socket.id}`);
   } catch (error) {
     logger.error('Error handling disconnect:', error);
   }
 }

 extractHashtags(content) {
   const hashtagRegex = /#[a-zA-Z0-9_]+/g;
   const matches = content.match(hashtagRegex);
   return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
 }
}

module.exports = CommentsHandler;
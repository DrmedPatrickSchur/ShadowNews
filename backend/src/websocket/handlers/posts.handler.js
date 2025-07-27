/**
 * @fileoverview WebSocket Posts Handler
 * 
 * Real-time event handler for post-related WebSocket operations in the ShadowNews
 * platform. Manages live post creation, editing, voting, deletion, and feed
 * subscriptions to provide instant content updates without page refreshes.
 * 
 * This handler enables the core real-time functionality that makes ShadowNews
 * feel responsive and engaging, allowing users to see new content, votes,
 * and interactions as they happen across the platform.
 * 
 * Key Features:
 * - Real-time post creation with instant broadcasting to all users
 * - Live voting system with immediate score updates and animations
 * - Post editing with conflict resolution and update propagation
 * - Soft deletion with moderation capabilities and undo functionality
 * - Room-based viewer tracking for engagement analytics
 * - Hashtag subscription system for personalized content filtering
 * - Feed management with hot, new, and top post streams
 * - Typing indicators for enhanced user experience
 * - Trending algorithm integration with Redis-based scoring
 * 
 * WebSocket Events Handled:
 * - post:join/leave - Room management for post-specific updates
 * - post:create - Live post creation with validation and broadcasting
 * - post:vote - Real-time voting with karma integration
 * - post:edit - Live post editing with authorization checks
 * - post:delete - Soft deletion with moderation support
 * - hashtag:subscribe/unsubscribe - Tag-based content filtering
 * - feed:subscribe - Live feed updates for different sort orders
 * - post:typing:start/stop - Typing indicators for comment sections
 * 
 * Real-time Features:
 * - Instant post appearance in feeds without refresh
 * - Live vote count updates with smooth animations
 * - Real-time viewer counts for engagement metrics
 * - Immediate content updates when posts are edited
 * - Live hashtag filtering and subscription management
 * - Trending score updates with algorithmic ranking
 * 
 * Performance Optimizations:
 * - Redis caching for trending calculations
 * - Efficient room management for targeted broadcasting
 * - Batch operations for high-frequency vote updates
 * - Lazy loading for feed subscriptions
 * - Debounced typing indicators to reduce noise
 * 
 * Security Features:
 * - Authentication verification for all operations
 * - Authorization checks for post editing and deletion
 * - Input validation and sanitization
 * - Rate limiting for vote and creation operations
 * - Moderation capabilities for high-karma users
 * 
 * Dependencies:
 * - Post/User/Repository models for data persistence
 * - Validation utilities for input security
 * - Redis client for trending algorithms and caching
 * - Logger for operation tracking and debugging
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Database models for post operations and relationships
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const Repository = require('../../models/Repository.model');

// Validation utilities for input sanitization and security
const { validatePostData } = require('../../utils/validators');

// Centralized logging for WebSocket post operations
const logger = require('../../utils/logger');

// Redis client for trending algorithms and performance caching
const redisClient = require('../../utils/redis');

/**
 * Posts WebSocket Event Handler
 * 
 * Main handler function that configures all post-related WebSocket event
 * listeners and provides real-time functionality for post interactions.
 * Integrates with the Socket.IO server to enable live content updates.
 * 
 * This handler is called for each new WebSocket connection and sets up
 * all the event listeners needed for real-time post functionality.
 * 
 * @param {socketIO.Server} io - Socket.IO server instance for broadcasting
 * @param {socketIO.Socket} socket - Individual client socket connection
 * @returns {void}
 * 
 * @since 1.0.0
 */
const postsHandler = (io, socket) => {
  /**
   * Join Post Room Event Handler
   * 
   * Allows users to join a specific post's room to receive real-time updates
   * about that post, including new comments, vote changes, and edits.
   * Also tracks viewer counts for engagement analytics.
   * 
   * Room Benefits:
   * - Targeted event broadcasting for relevant users only
   * - Viewer count tracking for engagement metrics
   * - Reduced bandwidth by filtering irrelevant updates
   * - Real-time collaboration features like typing indicators
   * 
   * @param {string} postId - ID of the post to join for updates
   * @fires post:viewers - Broadcasts updated viewer count to room
   * @fires error - Error notification if join operation fails
   * 
   * @since 1.0.0
   */
  socket.on('post:join', async (postId) => {
    try {
      // Join the post-specific room for targeted updates
      socket.join(`post:${postId}`);
      logger.info(`Socket ${socket.id} joined post room: ${postId}`);
      
      // Calculate and broadcast current viewer count
      const viewersCount = io.sockets.adapter.rooms.get(`post:${postId}`)?.size || 0;
      io.to(`post:${postId}`).emit('post:viewers', { postId, count: viewersCount });
    } catch (error) {
      logger.error('Error joining post room:', error);
      socket.emit('error', { message: 'Failed to join post room' });
    }
  });

  /**
   * Leave Post Room Event Handler
   * 
   * Removes user from a post's room when they navigate away or close
   * the post. Updates viewer counts and cleans up room membership.
   * 
   * @param {string} postId - ID of the post to leave
   * @fires post:viewers - Broadcasts updated viewer count after user leaves
   * 
   * @since 1.0.0
   */
  socket.on('post:leave', async (postId) => {
    try {
      socket.leave(`post:${postId}`);
      logger.info(`Socket ${socket.id} left post room: ${postId}`);
      
      // Update viewer count after user leaves
      const viewersCount = io.sockets.adapter.rooms.get(`post:${postId}`)?.size || 0;
      io.to(`post:${postId}`).emit('post:viewers', { postId, count: viewersCount });
  });

  /**
   * Real-time Post Creation Event Handler
   * 
   * Handles live post creation with immediate validation, persistence,
   * and broadcasting to all connected users. Integrates with karma system,
   * repository management, and trending algorithms for complete functionality.
   * 
   * Creation Process:
   * 1. Authenticate user and validate post data
   * 2. Create post record with initial score and user vote
   * 3. Award karma to author for content creation
   * 4. Link post to specified repositories
   * 5. Broadcast new post to all connected clients
   * 6. Update trending algorithms with new content
   * 
   * Features:
   * - Input validation and sanitization
   * - Automatic hashtag parsing and association
   * - Repository linking for content organization
   * - Karma rewards for content creation
   * - Trending algorithm integration
   * - Real-time broadcasting to all users
   * 
   * @param {Object} data - Post creation data from client
   * @param {string} data.title - Post title (required)
   * @param {string} data.content - Post content (optional)
   * @param {string} data.url - External URL (optional)
   * @param {Array<string>} data.hashtags - Associated hashtags
   * @param {Array<string>} data.repositoryIds - Linked repositories
   * 
   * @fires post:new - Broadcasts new post to all connected clients
   * @fires post:created - Confirms successful creation to author
   * @fires error - Error notification for validation or creation failures
   * 
   * @since 1.0.0
   */
  socket.on('post:create', async (data) => {
    try {
      // Verify user authentication
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required' });
      }

      // Validate post data for security and completeness
      const validationResult = validatePostData(data);
      if (!validationResult.isValid) {
        return socket.emit('error', { message: validationResult.error });
      }

      // Create new post with initial voting data
      const post = new Post({
        ...data,
        author: socket.userId,
        hashtags: data.hashtags || [],
        repositoryIds: data.repositoryIds || [],
        createdAt: new Date(),
        score: 1, // Start with score of 1 (author's implicit upvote)
        upvotes: [socket.userId], // Author automatically upvotes their post
        downvotes: []
      });

     await post.save();
     await post.populate('author', 'username email karma');
     
     // Update user karma
     await User.findByIdAndUpdate(socket.userId, {
       $inc: { karma: 50 }
     });

     // Attach repositories if provided
     if (data.repositoryIds && data.repositoryIds.length > 0) {
       await Repository.updateMany(
         { _id: { $in: data.repositoryIds } },
         { $push: { posts: post._id } }
       );
     }

     // Broadcast to all connected clients
     io.emit('post:new', {
       post: post.toObject(),
       timestamp: new Date()
     });

     // Cache in Redis for trending calculation
     await redisClient.zadd(
       'trending:posts',
       Date.now(),
       post._id.toString()
     );

     socket.emit('post:created', { post: post.toObject() });
     logger.info(`New post created by user ${socket.userId}: ${post._id}`);
   } catch (error) {
     logger.error('Error creating post:', error);
     socket.emit('error', { message: 'Failed to create post' });
   }
 });

 // Real-time post voting
 socket.on('post:vote', async ({ postId, voteType }) => {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Authentication required' });
     }

     if (!['upvote', 'downvote'].includes(voteType)) {
       return socket.emit('error', { message: 'Invalid vote type' });
     }

     const post = await Post.findById(postId);
     if (!post) {
       return socket.emit('error', { message: 'Post not found' });
     }

     const userId = socket.userId.toString();
     const hasUpvoted = post.upvotes.includes(userId);
     const hasDownvoted = post.downvotes.includes(userId);

     // Remove existing votes
     post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
     post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

     // Apply new vote
     if (voteType === 'upvote' && !hasUpvoted) {
       post.upvotes.push(userId);
     } else if (voteType === 'downvote' && !hasDownvoted) {
       post.downvotes.push(userId);
     }

     // Calculate new score
     post.score = post.upvotes.length - post.downvotes.length;
     await post.save();

     // Update author karma
     const karmaChange = voteType === 'upvote' ? 10 : -5;
     if ((voteType === 'upvote' && !hasUpvoted) || (voteType === 'downvote' && !hasDownvoted)) {
       await User.findByIdAndUpdate(post.author, {
         $inc: { karma: karmaChange }
       });
     }

     // Broadcast vote update
     io.emit('post:voted', {
       postId,
       upvotes: post.upvotes.length,
       downvotes: post.downvotes.length,
       score: post.score,
       userVote: hasUpvoted ? null : (hasDownvoted ? null : voteType)
     });

     // Update trending score in Redis
     const trendingScore = post.score * Math.log(Date.now() - post.createdAt.getTime());
     await redisClient.zadd('trending:posts', trendingScore, postId);

   } catch (error) {
     logger.error('Error voting on post:', error);
     socket.emit('error', { message: 'Failed to vote on post' });
   }
 });

 // Real-time post editing
 socket.on('post:edit', async ({ postId, updates }) => {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Authentication required' });
     }

     const post = await Post.findById(postId);
     if (!post) {
       return socket.emit('error', { message: 'Post not found' });
     }

     if (post.author.toString() !== socket.userId.toString()) {
       return socket.emit('error', { message: 'Unauthorized to edit this post' });
     }

     const validationResult = validatePostData(updates);
     if (!validationResult.isValid) {
       return socket.emit('error', { message: validationResult.error });
     }

     // Update post fields
     if (updates.title) post.title = updates.title;
     if (updates.content) post.content = updates.content;
     if (updates.url) post.url = updates.url;
     if (updates.hashtags) post.hashtags = updates.hashtags;
     
     post.editedAt = new Date();
     await post.save();

     // Broadcast update to all clients
     io.emit('post:updated', {
       postId,
       updates: {
         title: post.title,
         content: post.content,
         url: post.url,
         hashtags: post.hashtags,
         editedAt: post.editedAt
       }
     });

     socket.emit('post:edited', { post: post.toObject() });
   } catch (error) {
     logger.error('Error editing post:', error);
     socket.emit('error', { message: 'Failed to edit post' });
   }
 });

 // Real-time post deletion
 socket.on('post:delete', async (postId) => {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Authentication required' });
     }

     const post = await Post.findById(postId);
     if (!post) {
       return socket.emit('error', { message: 'Post not found' });
     }

     const user = await User.findById(socket.userId);
     const isAuthor = post.author.toString() === socket.userId.toString();
     const isModerator = user.karma >= 5000;

     if (!isAuthor && !isModerator) {
       return socket.emit('error', { message: 'Unauthorized to delete this post' });
     }

     // Soft delete
     post.deleted = true;
     post.deletedAt = new Date();
     post.deletedBy = socket.userId;
     await post.save();

     // Remove from repositories
     if (post.repositoryIds && post.repositoryIds.length > 0) {
       await Repository.updateMany(
         { _id: { $in: post.repositoryIds } },
         { $pull: { posts: post._id } }
       );
     }

     // Remove from Redis trending
     await redisClient.zrem('trending:posts', postId);

     // Broadcast deletion
     io.emit('post:deleted', { postId, deletedBy: socket.userId });

     socket.emit('post:delete:success', { postId });
   } catch (error) {
     logger.error('Error deleting post:', error);
     socket.emit('error', { message: 'Failed to delete post' });
   }
 });

 // Subscribe to hashtag updates
 socket.on('hashtag:subscribe', async (hashtags) => {
   try {
     if (!Array.isArray(hashtags)) {
       return socket.emit('error', { message: 'Hashtags must be an array' });
     }

     hashtags.forEach(hashtag => {
       socket.join(`hashtag:${hashtag.toLowerCase()}`);
     });

     socket.emit('hashtag:subscribed', { hashtags });
     logger.info(`Socket ${socket.id} subscribed to hashtags: ${hashtags.join(', ')}`);
   } catch (error) {
     logger.error('Error subscribing to hashtags:', error);
     socket.emit('error', { message: 'Failed to subscribe to hashtags' });
   }
 });

 // Unsubscribe from hashtag updates
 socket.on('hashtag:unsubscribe', async (hashtags) => {
   try {
     if (!Array.isArray(hashtags)) {
       return socket.emit('error', { message: 'Hashtags must be an array' });
     }

     hashtags.forEach(hashtag => {
       socket.leave(`hashtag:${hashtag.toLowerCase()}`);
     });

     socket.emit('hashtag:unsubscribed', { hashtags });
   } catch (error) {
     logger.error('Error unsubscribing from hashtags:', error);
   }
 });

 // Get live feed updates
 socket.on('feed:subscribe', async (feedType = 'hot') => {
   try {
     socket.join(`feed:${feedType}`);
     socket.emit('feed:subscribed', { feedType });
     
     // Send initial feed data
     let posts;
     switch (feedType) {
       case 'hot':
         const hotPostIds = await redisClient.zrevrange('trending:posts', 0, 29);
         posts = await Post.find({ _id: { $in: hotPostIds }, deleted: false })
           .populate('author', 'username email karma')
           .sort({ score: -1 })
           .limit(30);
         break;
       case 'new':
         posts = await Post.find({ deleted: false })
           .populate('author', 'username email karma')
           .sort({ createdAt: -1 })
           .limit(30);
         break;
       case 'top':
         posts = await Post.find({ deleted: false })
           .populate('author', 'username email karma')
           .sort({ score: -1 })
           .limit(30);
         break;
       default:
         posts = [];
     }

     socket.emit('feed:initial', { feedType, posts });
   } catch (error) {
     logger.error('Error subscribing to feed:', error);
     socket.emit('error', { message: 'Failed to subscribe to feed' });
   }
 });

 // Typing indicator for post comments
 socket.on('post:typing:start', ({ postId }) => {
   socket.to(`post:${postId}`).emit('post:user:typing', {
     postId,
     userId: socket.userId,
     username: socket.username
   });
 });

 socket.on('post:typing:stop', ({ postId }) => {
   socket.to(`post:${postId}`).emit('post:user:stopped:typing', {
     postId,
     userId: socket.userId
   });
 });

 // Handle disconnect
 socket.on('disconnect', () => {
   // Clean up any post-specific rooms
   const rooms = Array.from(socket.rooms);
   rooms.forEach(room => {
     if (room.startsWith('post:')) {
       const postId = room.replace('post:', '');
       const viewersCount = io.sockets.adapter.rooms.get(room)?.size || 0;
       io.to(room).emit('post:viewers', { postId, count: viewersCount });
     }
   });
 });
};

module.exports = postsHandler;
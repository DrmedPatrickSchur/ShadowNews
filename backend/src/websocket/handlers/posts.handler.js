const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const Repository = require('../../models/Repository.model');
const { validatePostData } = require('../../utils/validators');
const logger = require('../../utils/logger');
const redisClient = require('../../utils/redis');

const postsHandler = (io, socket) => {
 // Join post room for real-time updates
 socket.on('post:join', async (postId) => {
   try {
     socket.join(`post:${postId}`);
     logger.info(`Socket ${socket.id} joined post room: ${postId}`);
     
     // Send current viewers count
     const viewersCount = io.sockets.adapter.rooms.get(`post:${postId}`)?.size || 0;
     io.to(`post:${postId}`).emit('post:viewers', { postId, count: viewersCount });
   } catch (error) {
     logger.error('Error joining post room:', error);
     socket.emit('error', { message: 'Failed to join post room' });
   }
 });

 // Leave post room
 socket.on('post:leave', async (postId) => {
   try {
     socket.leave(`post:${postId}`);
     logger.info(`Socket ${socket.id} left post room: ${postId}`);
     
     // Update viewers count
     const viewersCount = io.sockets.adapter.rooms.get(`post:${postId}`)?.size || 0;
     io.to(`post:${postId}`).emit('post:viewers', { postId, count: viewersCount });
   } catch (error) {
     logger.error('Error leaving post room:', error);
   }
 });

 // Real-time post creation
 socket.on('post:create', async (data) => {
   try {
     if (!socket.userId) {
       return socket.emit('error', { message: 'Authentication required' });
     }

     const validationResult = validatePostData(data);
     if (!validationResult.isValid) {
       return socket.emit('error', { message: validationResult.error });
     }

     const post = new Post({
       ...data,
       author: socket.userId,
       hashtags: data.hashtags || [],
       repositoryIds: data.repositoryIds || [],
       createdAt: new Date(),
       score: 1,
       upvotes: [socket.userId],
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
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const Repository = require('../../models/Repository.model');
const aiService = require('../../services/ai.service');
const karmaService = require('../../services/karma.service');
const notificationService = require('../../services/notification.service');
const { validationResult } = require('express-validator');
const logger = require('../../utils/logger');

// Get all posts with pagination and filters
exports.getPosts = async (req, res) => {
 try {
   const { 
     page = 1, 
     limit = 30, 
     sort = 'hot', 
     hashtag, 
     repository,
     timeframe = '24h' 
   } = req.query;

   const skip = (page - 1) * limit;
   let query = {};
   let sortOption = {};

   // Filter by hashtag
   if (hashtag) {
     query.hashtags = hashtag;
   }

   // Filter by repository
   if (repository) {
     query.repositories = repository;
   }

   // Sort options
   switch (sort) {
     case 'new':
       sortOption = { createdAt: -1 };
       break;
     case 'top':
       const timeframeMap = {
         '1h': 1,
         '24h': 24,
         '1w': 168,
         '1m': 720,
         '1y': 8760
       };
       const hoursAgo = timeframeMap[timeframe] || 24;
       const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
       query.createdAt = { $gte: cutoffDate };
       sortOption = { score: -1 };
       break;
     case 'hot':
     default:
       sortOption = { hotScore: -1 };
       break;
   }

   const posts = await Post.find(query)
     .populate('author', 'username email karma')
     .populate('repositories', 'name emailCount')
     .sort(sortOption)
     .skip(skip)
     .limit(parseInt(limit))
     .lean();

   const total = await Post.countDocuments(query);

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
const Comment = require('../../models/Comment.model');
const Post = require('../../models/Post.model');
const User = require('../../models/User.model');
const karmaService = require('../../services/karma.service');
const notificationService = require('../../services/notification.service');
const aiService = require('../../services/ai.service');
const { validationResult } = require('express-validator');

const commentsController = {
 // Create a new comment
 async createComment(req, res) {
   try {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }

     const { postId, parentId, content, hashtags } = req.body;
     const userId = req.user.id;

     // Verify post exists
     const post = await Post.findById(postId);
     if (!post) {
       return res.status(404).json({ error: 'Post not found' });
     }

     // Verify parent comment exists if parentId provided
     if (parentId) {
       const parentComment = await Comment.findById(parentId);
       if (!parentComment) {
         return res.status(404).json({ error: 'Parent comment not found' });
       }
     }

     // Get AI-suggested hashtags if not provided
     let finalHashtags = hashtags;
     if (!hashtags || hashtags.length === 0) {
       finalHashtags = await aiService.suggestHashtags(content);
     }

     // Create comment
     const comment = new Comment({
       postId,
       parentId,
       userId,
       content,
       hashtags: finalHashtags,
       metadata: {
         userAgent: req.get('user-agent'),
         ipAddress: req.ip
       }
     });

     await comment.save();

     // Update post comment count
     await Post.findByIdAndUpdate(postId, {
       $inc: { commentCount: 1 },
       lastActivity: new Date()
     });

     // Award karma for commenting
     await karmaService.awardKarma(userId, 'comment_created', comment._id);

     // Send notification to post author
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

     // Send notification to parent comment author
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

     // Populate user data and return
     await comment.populate('userId', 'username avatar karma');
     
     res.status(201).json({
       success: true,
       comment
     });

   } catch (error) {
     console.error('Create comment error:', error);
     res.status(500).json({ error: 'Failed to create comment' });
   }
 },

 // Get comments for a post
 async getPostComments(req, res) {
   try {
     const { postId } = req.params;
     const { sort = 'best', limit = 50, offset = 0 } = req.query;

     // Build sort criteria
     let sortCriteria = {};
     switch (sort) {
       case 'new':
         sortCriteria = { createdAt: -1 };
         break;
       case 'old':
         sortCriteria = { createdAt: 1 };
         break;
       case 'top':
         sortCriteria = { score: -1 };
         break;
       case 'best':
       default:
         sortCriteria = { wilsonScore: -1 };
         break;
     }

     // Get root comments
     const comments = await Comment.find({
       postId,
       parentId: null,
       deleted: false
     })
       .sort(sortCriteria)
       .limit(parseInt(limit))
       .skip(parseInt(offset))
       .populate('userId', 'username avatar karma badges')
       .lean();

     // Get nested comments for each root comment
     const commentsWithReplies = await Promise.all(
       comments.map(async (comment) => {
         const replies = await getCommentReplies(comment._id, req.user?.id);
         return {
           ...comment,
           replies,
           userVote: req.user ? await getUserVote(comment._id, req.user.id) : null
         };
       })
     );

     res.json({
       success: true,
       comments: commentsWithReplies,
       hasMore: comments.length === parseInt(limit)
     });

   } catch (error) {
     console.error('Get comments error:', error);
     res.status(500).json({ error: 'Failed to fetch comments' });
   }
 },

 // Update a comment
 async updateComment(req, res) {
   try {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }

     const { commentId } = req.params;
     const { content } = req.body;
     const userId = req.user.id;

     const comment = await Comment.findById(commentId);
     if (!comment) {
       return res.status(404).json({ error: 'Comment not found' });
     }

     // Check ownership
     if (comment.userId.toString() !== userId) {
       return res.status(403).json({ error: 'Unauthorized to edit this comment' });
     }

     // Check if comment is too old to edit (5 minutes)
     const editWindow = 5 * 60 * 1000;
     if (Date.now() - comment.createdAt > editWindow && !req.user.isAdmin) {
       return res.status(403).json({ error: 'Edit window has expired' });
     }

     // Update comment
     comment.content = content;
     comment.edited = true;
     comment.editedAt = new Date();
     
     // Re-suggest hashtags
     comment.hashtags = await aiService.suggestHashtags(content);
     
     await comment.save();
     await comment.populate('userId', 'username avatar karma');

     res.json({
       success: true,
       comment
     });

   } catch (error) {
     console.error('Update comment error:', error);
     res.status(500).json({ error: 'Failed to update comment' });
   }
 },

 // Delete a comment
 async deleteComment(req, res) {
   try {
     const { commentId } = req.params;
     const userId = req.user.id;

     const comment = await Comment.findById(commentId);
     if (!comment) {
       return res.status(404).json({ error: 'Comment not found' });
     }

     // Check ownership or admin
     if (comment.userId.toString() !== userId && !req.user.isAdmin) {
       return res.status(403).json({ error: 'Unauthorized to delete this comment' });
     }

     // Soft delete to preserve thread structure
     comment.deleted = true;
     comment.deletedAt = new Date();
     comment.deletedBy = userId;
     comment.content = '[deleted]';
     comment.hashtags = [];
     
     await comment.save();

     // Update post comment count
     await Post.findByIdAndUpdate(comment.postId, {
       $inc: { commentCount: -1 }
     });

     // Remove karma
     await karmaService.removeKarma(comment.userId, 'comment_deleted', comment._id);

     res.json({
       success: true,
       message: 'Comment deleted successfully'
     });

   } catch (error) {
     console.error('Delete comment error:', error);
     res.status(500).json({ error: 'Failed to delete comment' });
   }
 },

 // Vote on a comment
 async voteComment(req, res) {
   try {
     const { commentId } = req.params;
     const { value } = req.body; // 1 for upvote, -1 for downvote, 0 to remove vote
     const userId = req.user.id;

     const comment = await Comment.findById(commentId);
     if (!comment) {
       return res.status(404).json({ error: 'Comment not found' });
     }

     // Check if user already voted
     const existingVoteIndex = comment.votes.findIndex(
       vote => vote.userId.toString() === userId
     );

     let karmaChange = 0;
     
     if (existingVoteIndex > -1) {
       // Update existing vote
       const oldValue = comment.votes[existingVoteIndex].value;
       
       if (value === 0) {
         // Remove vote
         comment.votes.splice(existingVoteIndex, 1);
         karmaChange = -oldValue;
       } else {
         // Change vote
         comment.votes[existingVoteIndex].value = value;
         karmaChange = value - oldValue;
       }
     } else if (value !== 0) {
       // Add new vote
       comment.votes.push({ userId, value });
       karmaChange = value;
     }

     // Update scores
     comment.score = comment.votes.reduce((sum, vote) => sum + vote.value, 0);
     comment.wilsonScore = calculateWilsonScore(comment.votes);
     
     await comment.save();

     // Update comment author's karma
     if (karmaChange !== 0) {
       const karmaType = karmaChange > 0 ? 'comment_upvoted' : 'comment_downvoted';
       await karmaService.awardKarma(comment.userId, karmaType, comment._id);
     }

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

 // Get a single comment
 async getComment(req, res) {
   try {
     const { commentId } = req.params;
     
     const comment = await Comment.findById(commentId)
       .populate('userId', 'username avatar karma badges')
       .populate('postId', 'title slug');

     if (!comment || comment.deleted) {
       return res.status(404).json({ error: 'Comment not found' });
     }

     // Get replies
     const replies = await getCommentReplies(comment._id, req.user?.id);
     
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

 // Get user's comments
 async getUserComments(req, res) {
   try {
     const { userId } = req.params;
     const { limit = 20, offset = 0 } = req.query;

     const comments = await Comment.find({
       userId,
       deleted: false
     })
       .sort({ createdAt: -1 })
       .limit(parseInt(limit))
       .skip(parseInt(offset))
       .populate('postId', 'title slug')
       .lean();

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

// Helper functions
async function getCommentReplies(parentId, userId) {
 const replies = await Comment.find({
   parentId,
   deleted: false
 })
   .sort({ wilsonScore: -1 })
   .populate('userId', 'username avatar karma badges')
   .lean();

 return Promise.all(
   replies.map(async (reply) => ({
     ...reply,
     replies: await getCommentReplies(reply._id, userId),
     userVote: userId ? await getUserVote(reply._id, userId) : null
   }))
 );
}

async function getUserVote(commentId, userId) {
 const comment = await Comment.findById(commentId, 'votes');
 const vote = comment.votes.find(v => v.userId.toString() === userId);
 return vote ? vote.value : 0;
}

function calculateWilsonScore(votes) {
 const upvotes = votes.filter(v => v.value > 0).length;
 const downvotes = votes.filter(v => v.value < 0).length;
 const total = upvotes + downvotes;
 
 if (total === 0) return 0;
 
 const z = 1.96; // 95% confidence
 const phat = upvotes / total;
 const score = (phat + z*z/(2*total) - z * Math.sqrt((phat*(1-phat)+z*z/(4*total))/total))/(1+z*z/total);
 
 return score;
}

module.exports = commentsController;
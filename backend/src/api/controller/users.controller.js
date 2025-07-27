/**
 * @fileoverview users.controller.js
 * 
 * Implementation file for users.controller.js
 * 
 * Key Features:
 * - Core functionality
 * - Error handling
 * - Performance optimization
 * 
 * Dependencies:
 *  * - No external dependencies
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */\n\nconst User = require('../../models/User.model');
const Repository = require('../../models/Repository.model');
const Post = require('../../models/Post.model');
const Comment = require('../../models/Comment.model');
const karmaService = require('../../services/karma.service');
const emailService = require('../../services/email.service');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/helpers');

const usersController = {
 // Get current user profile
 async getCurrentUser(req, res, next) {
   try {
     const user = await User.findById(req.user.id)
       .select('-password')
       .populate('repositories', 'name emailCount isPublic')
       .lean();

     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const karma = await karmaService.getUserKarma(user._id);
     
     res.json({
       status: 'success',
       data: {
         user: {
           ...user,
           karma
         }
       }
     });
   } catch (error) {
     logger.error('Error fetching current user:', error);
     next(error);
   }
 },

 // Get user by username
 async getUserByUsername(req, res, next) {
   try {
     const { username } = req.params;
     
     const user = await User.findOne({ username })
       .select('-password -email -emailPreferences')
       .populate({
         path: 'repositories',
         match: { isPublic: true },
         select: 'name description emailCount tags'
       })
       .lean();

     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const karma = await karmaService.getUserKarma(user._id);
     const stats = await getUserStats(user._id);

     res.json({
       status: 'success',
       data: {
         user: {
           ...user,
           karma,
           stats
         }
       }
     });
   } catch (error) {
     logger.error('Error fetching user by username:', error);
     next(error);
   }
 },

 // Update current user profile
 async updateProfile(req, res, next) {
   try {
     const { bio, website, location, interests, displayName } = req.body;
     
     const updatedUser = await User.findByIdAndUpdate(
       req.user.id,
       {
         $set: {
           bio,
           website,
           location,
           interests,
           displayName,
           updatedAt: Date.now()
         }
       },
       { new: true, runValidators: true }
     ).select('-password');

     if (!updatedUser) {
       return next(new AppError('User not found', 404));
     }

     res.json({
       status: 'success',
       data: { user: updatedUser }
     });
   } catch (error) {
     logger.error('Error updating user profile:', error);
     next(error);
   }
 },

 // Update email preferences
 async updateEmailPreferences(req, res, next) {
   try {
     const {
       digestFrequency,
       notifyOnComment,
       notifyOnUpvote,
       notifyOnNewFollower,
       notifyOnRepositoryInvite,
       marketingEmails
     } = req.body;

     const user = await User.findByIdAndUpdate(
       req.user.id,
       {
         $set: {
           'emailPreferences.digestFrequency': digestFrequency,
           'emailPreferences.notifyOnComment': notifyOnComment,
           'emailPreferences.notifyOnUpvote': notifyOnUpvote,
           'emailPreferences.notifyOnNewFollower': notifyOnNewFollower,
           'emailPreferences.notifyOnRepositoryInvite': notifyOnRepositoryInvite,
           'emailPreferences.marketingEmails': marketingEmails
         }
       },
       { new: true }
     ).select('emailPreferences');

     res.json({
       status: 'success',
       data: { emailPreferences: user.emailPreferences }
     });
   } catch (error) {
     logger.error('Error updating email preferences:', error);
     next(error);
   }
 },

 // Update privacy settings
 async updatePrivacySettings(req, res, next) {
   try {
     const {
       showEmail,
       showRepositories,
       allowAnonymousEmails,
       shareDataWithPartners
     } = req.body;

     const user = await User.findByIdAndUpdate(
       req.user.id,
       {
         $set: {
           'privacySettings.showEmail': showEmail,
           'privacySettings.showRepositories': showRepositories,
           'privacySettings.allowAnonymousEmails': allowAnonymousEmails,
           'privacySettings.shareDataWithPartners': shareDataWithPartners
         }
       },
       { new: true }
     ).select('privacySettings');

     res.json({
       status: 'success',
       data: { privacySettings: user.privacySettings }
     });
   } catch (error) {
     logger.error('Error updating privacy settings:', error);
     next(error);
   }
 },

 // Get user's posts
 async getUserPosts(req, res, next) {
   try {
     const { username } = req.params;
     const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

     const user = await User.findOne({ username });
     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const posts = await Post.find({ author: user._id, isDeleted: false })
       .populate('author', 'username displayName shadownewsEmail')
       .populate('repository', 'name')
       .sort(sort)
       .limit(limit * 1)
       .skip((page - 1) * limit)
       .lean();

     const total = await Post.countDocuments({ author: user._id, isDeleted: false });

     res.json({
       status: 'success',
       data: {
         posts,
         pagination: {
           page: parseInt(page),
           limit: parseInt(limit),
           total,
           pages: Math.ceil(total / limit)
         }
       }
     });
   } catch (error) {
     logger.error('Error fetching user posts:', error);
     next(error);
   }
 },

 // Get user's comments
 async getUserComments(req, res, next) {
   try {
     const { username } = req.params;
     const { page = 1, limit = 20 } = req.query;

     const user = await User.findOne({ username });
     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const comments = await Comment.find({ author: user._id, isDeleted: false })
       .populate('author', 'username displayName')
       .populate({
         path: 'post',
         select: 'title slug',
         populate: {
           path: 'author',
           select: 'username'
         }
       })
       .sort('-createdAt')
       .limit(limit * 1)
       .skip((page - 1) * limit)
       .lean();

     const total = await Comment.countDocuments({ author: user._id, isDeleted: false });

     res.json({
       status: 'success',
       data: {
         comments,
         pagination: {
           page: parseInt(page),
           limit: parseInt(limit),
           total,
           pages: Math.ceil(total / limit)
         }
       }
     });
   } catch (error) {
     logger.error('Error fetching user comments:', error);
     next(error);
   }
 },

 // Get user's repositories
 async getUserRepositories(req, res, next) {
   try {
     const { username } = req.params;
     const isOwnProfile = req.user && req.user.username === username;

     const user = await User.findOne({ username });
     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const query = { owner: user._id };
     if (!isOwnProfile) {
       query.isPublic = true;
     }

     const repositories = await Repository.find(query)
       .populate('owner', 'username displayName')
       .sort('-emailCount')
       .lean();

     res.json({
       status: 'success',
       data: { repositories }
     });
   } catch (error) {
     logger.error('Error fetching user repositories:', error);
     next(error);
   }
 },

 // Follow user
 async followUser(req, res, next) {
   try {
     const { username } = req.params;
     const currentUserId = req.user.id;

     const userToFollow = await User.findOne({ username });
     if (!userToFollow) {
       return next(new AppError('User not found', 404));
     }

     if (userToFollow._id.toString() === currentUserId) {
       return next(new AppError('You cannot follow yourself', 400));
     }

     await User.findByIdAndUpdate(currentUserId, {
       $addToSet: { following: userToFollow._id }
     });

     await User.findByIdAndUpdate(userToFollow._id, {
       $addToSet: { followers: currentUserId }
     });

     // Send notification if user has enabled it
     if (userToFollow.emailPreferences.notifyOnNewFollower) {
       await emailService.sendNewFollowerNotification(userToFollow, req.user);
     }

     res.json({
       status: 'success',
       message: 'User followed successfully'
     });
   } catch (error) {
     logger.error('Error following user:', error);
     next(error);
   }
 },

 // Unfollow user
 async unfollowUser(req, res, next) {
   try {
     const { username } = req.params;
     const currentUserId = req.user.id;

     const userToUnfollow = await User.findOne({ username });
     if (!userToUnfollow) {
       return next(new AppError('User not found', 404));
     }

     await User.findByIdAndUpdate(currentUserId, {
       $pull: { following: userToUnfollow._id }
     });

     await User.findByIdAndUpdate(userToUnfollow._id, {
       $pull: { followers: currentUserId }
     });

     res.json({
       status: 'success',
       message: 'User unfollowed successfully'
     });
   } catch (error) {
     logger.error('Error unfollowing user:', error);
     next(error);
   }
 },

 // Get user's followers
 async getUserFollowers(req, res, next) {
   try {
     const { username } = req.params;
     const { page = 1, limit = 50 } = req.query;

     const user = await User.findOne({ username })
       .populate({
         path: 'followers',
         select: 'username displayName bio shadownewsEmail',
         options: {
           limit: limit * 1,
           skip: (page - 1) * limit
         }
       });

     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const total = user.followers.length;

     res.json({
       status: 'success',
       data: {
         followers: user.followers,
         pagination: {
           page: parseInt(page),
           limit: parseInt(limit),
           total,
           pages: Math.ceil(total / limit)
         }
       }
     });
   } catch (error) {
     logger.error('Error fetching user followers:', error);
     next(error);
   }
 },

 // Get user's following
 async getUserFollowing(req, res, next) {
   try {
     const { username } = req.params;
     const { page = 1, limit = 50 } = req.query;

     const user = await User.findOne({ username })
       .populate({
         path: 'following',
         select: 'username displayName bio shadownewsEmail',
         options: {
           limit: limit * 1,
           skip: (page - 1) * limit
         }
       });

     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const total = user.following.length;

     res.json({
       status: 'success',
       data: {
         following: user.following,
         pagination: {
           page: parseInt(page),
           limit: parseInt(limit),
           total,
           pages: Math.ceil(total / limit)
         }
       }
     });
   } catch (error) {
     logger.error('Error fetching user following:', error);
     next(error);
   }
 },

 // Delete user account
 async deleteAccount(req, res, next) {
   try {
     const { password } = req.body;
     const userId = req.user.id;

     const user = await User.findById(userId).select('+password');
     if (!user) {
       return next(new AppError('User not found', 404));
     }

     const isPasswordValid = await user.comparePassword(password);
     if (!isPasswordValid) {
       return next(new AppError('Invalid password', 401));
     }

     // Anonymize user data instead of hard delete
     await User.findByIdAndUpdate(userId, {
       $set: {
         username: `deleted_user_${userId}`,
         email: `deleted_${userId}@shadownews.community`,
         displayName: 'Deleted User',
         bio: '',
         website: '',
         location: '',
         interests: [],
         isDeleted: true,
         deletedAt: Date.now()
       },
       $unset: {
         password: 1,
         following: 1,
         followers: 1
       }
     });

     // Anonymize posts and comments
     await Post.updateMany(
       { author: userId },
       { $set: { isAnonymized: true } }
     );

     await Comment.updateMany(
       { author: userId },
       { $set: { isAnonymized: true } }
     );

     res.json({
       status: 'success',
       message: 'Account deleted successfully'
     });
   } catch (error) {
     logger.error('Error deleting user account:', error);
     next(error);
   }
 },

 // Export user data (GDPR compliance)
 async exportUserData(req, res, next) {
   try {
     const userId = req.user.id;

     const userData = await User.findById(userId).select('-password').lean();
     const posts = await Post.find({ author: userId }).lean();
     const comments = await Comment.find({ author: userId }).lean();
     const repositories = await Repository.find({ owner: userId }).lean();

     const exportData = {
       user: userData,
       posts,
       comments,
       repositories,
       exportedAt: new Date()
     };

     res.json({
       status: 'success',
       data: exportData
     });
   } catch (error) {
     logger.error('Error exporting user data:', error);
     next(error);
   }
 }
};

// Helper function to get user statistics
async function getUserStats(userId) {
 const [postCount, commentCount, repositoryCount] = await Promise.all([
   Post.countDocuments({ author: userId, isDeleted: false }),
   Comment.countDocuments({ author: userId, isDeleted: false }),
   Repository.countDocuments({ owner: userId })
 ]);

 return {
   posts: postCount,
   comments: commentCount,
   repositories: repositoryCount
 };
}

module.exports = usersController;
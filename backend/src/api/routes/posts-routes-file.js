const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

// Get all posts with pagination and filters
router.get('/', postsController.getAllPosts);

// Get trending posts
router.get('/trending', postsController.getTrendingPosts);

// Get posts by hashtag
router.get('/hashtag/:hashtag', postsController.getPostsByHashtag);

// Get posts by repository
router.get('/repository/:repositoryId', postsController.getPostsByRepository);

// Get single post by ID
router.get('/:id', postsController.getPostById);

// Get post comments
router.get('/:id/comments', postsController.getPostComments);

// Create new post (requires authentication)
router.post('/', 
  authMiddleware.requireAuth,
  rateLimitMiddleware.postCreation,
  validationMiddleware.validatePost,
  postsController.createPost
);

// Create post via email token
router.post('/email', 
  authMiddleware.validateEmailToken,
  validationMiddleware.validateEmailPost,
  postsController.createPostFromEmail
);

// Update post (requires authentication and ownership)
router.put('/:id', 
  authMiddleware.requireAuth,
  authMiddleware.checkPostOwnership,
  validationMiddleware.validatePost,
  postsController.updatePost
);

// Delete post (requires authentication and ownership)
router.delete('/:id', 
  authMiddleware.requireAuth,
  authMiddleware.checkPostOwnership,
  postsController.deletePost
);

// Upvote post (requires authentication)
router.post('/:id/upvote', 
  authMiddleware.requireAuth,
  rateLimitMiddleware.voting,
  postsController.upvotePost
);

// Remove upvote (requires authentication)
router.delete('/:id/upvote', 
  authMiddleware.requireAuth,
  postsController.removeUpvote
);

// Add comment to post (requires authentication)
router.post('/:id/comments', 
  authMiddleware.requireAuth,
  rateLimitMiddleware.commenting,
  validationMiddleware.validateComment,
  postsController.addComment
);

// Attach repository to post (requires authentication)
router.post('/:id/repository', 
  authMiddleware.requireAuth,
  authMiddleware.checkPostOwnership,
  postsController.attachRepository
);

// Upload CSV to post (requires authentication)
router.post('/:id/csv', 
  authMiddleware.requireAuth,
  authMiddleware.checkPostOwnership,
  uploadMiddleware.single('csv'),
  validationMiddleware.validateCSV,
  postsController.uploadCSV
);

// Get post analytics (requires authentication and ownership)
router.get('/:id/analytics', 
  authMiddleware.requireAuth,
  authMiddleware.checkPostOwnership,
  postsController.getPostAnalytics
);

// Flag post for moderation (requires authentication)
router.post('/:id/flag', 
  authMiddleware.requireAuth,
  validationMiddleware.validateFlag,
  postsController.flagPost
);

// Get related posts
router.get('/:id/related', postsController.getRelatedPosts);

// Get posts by user
router.get('/user/:userId', postsController.getPostsByUser);

// Search posts
router.get('/search', validationMiddleware.validateSearch, postsController.searchPosts);

// Bulk operations (admin only)
router.post('/bulk/delete', 
  authMiddleware.requireAuth,
  authMiddleware.requireAdmin,
  postsController.bulkDelete
);

module.exports = router;
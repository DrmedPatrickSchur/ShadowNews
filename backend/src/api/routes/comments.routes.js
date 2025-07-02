const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');

// Get all comments for a post
router.get('/posts/:postId/comments', commentsController.getCommentsByPost);

// Get a single comment by ID
router.get('/:commentId', commentsController.getCommentById);

// Get nested replies for a comment
router.get('/:commentId/replies', commentsController.getCommentReplies);

// Create a new comment (requires authentication)
router.post(
 '/posts/:postId/comments',
 authMiddleware.authenticate,
 rateLimitMiddleware.commentCreation,
 validationMiddleware.validateComment,
 commentsController.createComment
);

// Reply to a comment (requires authentication)
router.post(
 '/:commentId/replies',
 authMiddleware.authenticate,
 rateLimitMiddleware.commentCreation,
 validationMiddleware.validateComment,
 commentsController.replyToComment
);

// Update a comment (requires authentication and ownership)
router.put(
 '/:commentId',
 authMiddleware.authenticate,
 authMiddleware.checkCommentOwnership,
 validationMiddleware.validateCommentUpdate,
 commentsController.updateComment
);

// Delete a comment (requires authentication and ownership)
router.delete(
 '/:commentId',
 authMiddleware.authenticate,
 authMiddleware.checkCommentOwnership,
 commentsController.deleteComment
);

// Upvote a comment (requires authentication)
router.post(
 '/:commentId/upvote',
 authMiddleware.authenticate,
 rateLimitMiddleware.voting,
 commentsController.upvoteComment
);

// Remove upvote from a comment (requires authentication)
router.delete(
 '/:commentId/upvote',
 authMiddleware.authenticate,
 commentsController.removeUpvote
);

// Flag a comment for moderation (requires authentication)
router.post(
 '/:commentId/flag',
 authMiddleware.authenticate,
 rateLimitMiddleware.flagging,
 validationMiddleware.validateFlag,
 commentsController.flagComment
);

// Get user's comment history
router.get(
 '/users/:userId/comments',
 commentsController.getUserComments
);

// Search comments
router.get(
 '/search',
 validationMiddleware.validateSearch,
 commentsController.searchComments
);

// Bulk operations for moderators
router.post(
 '/bulk/delete',
 authMiddleware.authenticate,
 authMiddleware.checkModeratorRole,
 validationMiddleware.validateBulkOperation,
 commentsController.bulkDeleteComments
);

// Get comment thread (all ancestors and descendants)
router.get(
 '/:commentId/thread',
 commentsController.getCommentThread
);

// Export comment data (for email digest)
router.get(
 '/export/:postId',
 authMiddleware.authenticate,
 commentsController.exportCommentsForDigest
);

module.exports = router;

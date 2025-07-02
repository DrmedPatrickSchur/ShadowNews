const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');
const repositoriesController = require('../controllers/repositories.controller');
const { body, param, query } = require('express-validator');

// Get all repositories
router.get('/', 
 query('page').optional().isInt({ min: 1 }),
 query('limit').optional().isInt({ min: 1, max: 100 }),
 query('sort').optional().isIn(['newest', 'oldest', 'popular', 'active']),
 query('topic').optional().isString(),
 validate,
 repositoriesController.getAllRepositories
);

// Get trending repositories
router.get('/trending',
 query('period').optional().isIn(['day', 'week', 'month']),
 validate,
 repositoriesController.getTrendingRepositories
);

// Get user's repositories
router.get('/my-repositories',
 authenticate,
 query('page').optional().isInt({ min: 1 }),
 query('limit').optional().isInt({ min: 1, max: 100 }),
 validate,
 repositoriesController.getUserRepositories
);

// Search repositories
router.get('/search',
 query('q').notEmpty().isString(),
 query('page').optional().isInt({ min: 1 }),
 query('limit').optional().isInt({ min: 1, max: 100 }),
 validate,
 repositoriesController.searchRepositories
);

// Get repository by ID
router.get('/:id',
 param('id').isMongoId(),
 validate,
 repositoriesController.getRepositoryById
);

// Get repository statistics
router.get('/:id/statistics',
 param('id').isMongoId(),
 validate,
 repositoriesController.getRepositoryStatistics
);

// Get repository emails
router.get('/:id/emails',
 authenticate,
 param('id').isMongoId(),
 query('page').optional().isInt({ min: 1 }),
 query('limit').optional().isInt({ min: 1, max: 100 }),
 query('verified').optional().isBoolean(),
 validate,
 repositoriesController.getRepositoryEmails
);

// Download repository as CSV
router.get('/:id/download',
 authenticate,
 param('id').isMongoId(),
 validate,
 repositoriesController.downloadRepositoryCSV
);

// Get repository subscribers
router.get('/:id/subscribers',
 authenticate,
 param('id').isMongoId(),
 query('page').optional().isInt({ min: 1 }),
 query('limit').optional().isInt({ min: 1, max: 100 }),
 validate,
 repositoriesController.getRepositorySubscribers
);

// Get repository activity feed
router.get('/:id/activity',
 param('id').isMongoId(),
 query('page').optional().isInt({ min: 1 }),
 query('limit').optional().isInt({ min: 1, max: 50 }),
 validate,
 repositoriesController.getRepositoryActivity
);

// Create new repository
router.post('/',
 authenticate,
 body('name').notEmpty().isString().isLength({ min: 3, max: 100 }),
 body('description').notEmpty().isString().isLength({ min: 10, max: 500 }),
 body('topic').notEmpty().isString(),
 body('hashtags').optional().isArray(),
 body('hashtags.*').optional().isString(),
 body('isPrivate').optional().isBoolean(),
 body('emailVerificationRequired').optional().isBoolean(),
 body('autoApprove').optional().isBoolean(),
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }),
 validate,
 repositoriesController.createRepository
);

// Update repository
router.put('/:id',
 authenticate,
 param('id').isMongoId(),
 body('name').optional().isString().isLength({ min: 3, max: 100 }),
 body('description').optional().isString().isLength({ min: 10, max: 500 }),
 body('hashtags').optional().isArray(),
 body('hashtags.*').optional().isString(),
 body('isPrivate').optional().isBoolean(),
 body('emailVerificationRequired').optional().isBoolean(),
 body('autoApprove').optional().isBoolean(),
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }),
 validate,
 repositoriesController.updateRepository
);

// Upload CSV to repository
router.post('/:id/upload-csv',
 authenticate,
 param('id').isMongoId(),
 upload.single('csv'),
 body('allowSnowball').optional().isBoolean(),
 body('verifyEmails').optional().isBoolean(),
 validate,
 repositoriesController.uploadCSV
);

// Add email to repository
router.post('/:id/emails',
 authenticate,
 param('id').isMongoId(),
 body('email').isEmail(),
 body('name').optional().isString(),
 body('tags').optional().isArray(),
 body('tags.*').optional().isString(),
 validate,
 repositoriesController.addEmail
);

// Bulk add emails
router.post('/:id/emails/bulk',
 authenticate,
 param('id').isMongoId(),
 body('emails').isArray().isLength({ min: 1, max: 1000 }),
 body('emails.*.email').isEmail(),
 body('emails.*.name').optional().isString(),
 body('emails.*.tags').optional().isArray(),
 body('allowSnowball').optional().isBoolean(),
 validate,
 repositoriesController.bulkAddEmails
);

// Subscribe to repository
router.post('/:id/subscribe',
 authenticate,
 param('id').isMongoId(),
 body('emailNotifications').optional().isBoolean(),
 body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly']),
 validate,
 repositoriesController.subscribeToRepository
);

// Unsubscribe from repository
router.delete('/:id/subscribe',
 authenticate,
 param('id').isMongoId(),
 validate,
 repositoriesController.unsubscribeFromRepository
);

// Merge repositories
router.post('/:id/merge',
 authenticate,
 param('id').isMongoId(),
 body('targetRepositoryId').isMongoId(),
 body('keepDuplicates').optional().isBoolean(),
 validate,
 repositoriesController.mergeRepositories
);

// Clone repository
router.post('/:id/clone',
 authenticate,
 param('id').isMongoId(),
 body('name').notEmpty().isString().isLength({ min: 3, max: 100 }),
 body('description').optional().isString(),
 validate,
 repositoriesController.cloneRepository
);

// Share repository
router.post('/:id/share',
 authenticate,
 param('id').isMongoId(),
 body('emails').optional().isArray(),
 body('emails.*').optional().isEmail(),
 body('message').optional().isString().isLength({ max: 500 }),
 body('allowEdit').optional().isBoolean(),
 validate,
 repositoriesController.shareRepository
);

// Toggle snowball effect
router.patch('/:id/snowball',
 authenticate,
 param('id').isMongoId(),
 body('enabled').isBoolean(),
 validate,
 repositoriesController.toggleSnowball
);

// Update repository settings
router.patch('/:id/settings',
 authenticate,
 param('id').isMongoId(),
 body('emailVerificationRequired').optional().isBoolean(),
 body('autoApprove').optional().isBoolean(),
 body('qualityThreshold').optional().isFloat({ min: 0, max: 1 }),
 body('digestEnabled').optional().isBoolean(),
 body('digestFrequency').optional().isIn(['daily', 'weekly', 'monthly']),
 validate,
 repositoriesController.updateSettings
);

// Remove email from repository
router.delete('/:id/emails/:emailId',
 authenticate,
 param('id').isMongoId(),
 param('emailId').isMongoId(),
 validate,
 repositoriesController.removeEmail
);

// Delete repository
router.delete('/:id',
 authenticate,
 param('id').isMongoId(),
 validate,
 repositoriesController.deleteRepository
);

// Get repository collaborators
router.get('/:id/collaborators',
 authenticate,
 param('id').isMongoId(),
 validate,
 repositoriesController.getCollaborators
);

// Add collaborator
router.post('/:id/collaborators',
 authenticate,
 param('id').isMongoId(),
 body('userId').isMongoId(),
 body('role').isIn(['viewer', 'contributor', 'admin']),
 validate,
 repositoriesController.addCollaborator
);

// Update collaborator role
router.patch('/:id/collaborators/:userId',
 authenticate,
 param('id').isMongoId(),
 param('userId').isMongoId(),
 body('role').isIn(['viewer', 'contributor', 'admin']),
 validate,
 repositoriesController.updateCollaboratorRole
);

// Remove collaborator
router.delete('/:id/collaborators/:userId',
 authenticate,
 param('id').isMongoId(),
 param('userId').isMongoId(),
 validate,
 repositoriesController.removeCollaborator
);

// Generate repository report
router.post('/:id/generate-report',
 authenticate,
 param('id').isMongoId(),
 body('startDate').optional().isISO8601(),
 body('endDate').optional().isISO8601(),
 body('includeEmails').optional().isBoolean(),
 body('includeActivity').optional().isBoolean(),
 body('format').optional().isIn(['pdf', 'csv', 'json']),
 validate,
 repositoriesController.generateReport
);

module.exports = router;
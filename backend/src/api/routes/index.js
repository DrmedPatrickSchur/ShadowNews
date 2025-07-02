const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { validateCSV, validateRepositoryId } = require('../middlewares/validation.middleware');
const { rateLimitCSV } = require('../middlewares/rateLimit.middleware');
const csvController = require('../controllers/csv.controller');

const upload = multer({
 storage: multer.memoryStorage(),
 limits: {
   fileSize: 10 * 1024 * 1024, // 10MB max
   files: 1
 },
 fileFilter: (req, file, cb) => {
   if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
     cb(null, true);
   } else {
     cb(new Error('Only CSV files are allowed'), false);
   }
 }
});

// Upload CSV to repository
router.post(
 '/upload/:repositoryId',
 authenticateUser,
 rateLimitCSV,
 validateRepositoryId,
 upload.single('csv'),
 validateCSV,
 csvController.uploadCSV
);

// Download repository as CSV
router.get(
 '/download/:repositoryId',
 authenticateUser,
 validateRepositoryId,
 csvController.downloadRepositoryCSV
);

// Preview CSV before upload
router.post(
 '/preview',
 authenticateUser,
 upload.single('csv'),
 csvController.previewCSV
);

// Process snowball CSV (emails from other repositories)
router.post(
 '/snowball/:repositoryId',
 authenticateUser,
 validateRepositoryId,
 upload.single('csv'),
 validateCSV,
 csvController.processSnowballCSV
);

// Get CSV processing history
router.get(
 '/history/:repositoryId',
 authenticateUser,
 validateRepositoryId,
 csvController.getCSVHistory
);

// Validate CSV structure
router.post(
 '/validate',
 authenticateUser,
 upload.single('csv'),
 csvController.validateCSVStructure
);

// Merge multiple CSVs
router.post(
 '/merge/:repositoryId',
 authenticateUser,
 validateRepositoryId,
 upload.array('csvFiles', 5),
 csvController.mergeCSVFiles
);

// Export filtered repository data as CSV
router.post(
 '/export/:repositoryId',
 authenticateUser,
 validateRepositoryId,
 csvController.exportFilteredCSV
);

// Get CSV upload statistics
router.get(
 '/stats/:repositoryId',
 authenticateUser,
 validateRepositoryId,
 csvController.getCSVStats
);

// Cancel ongoing CSV processing
router.delete(
 '/cancel/:jobId',
 authenticateUser,
 csvController.cancelCSVProcessing
);

module.exports = router;
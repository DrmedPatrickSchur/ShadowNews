const csvService = require('../../services/csv.service');
const repositoryService = require('../../services/repository.service');
const snowballService = require('../../services/snowball.service');
const { validationResult } = require('express-validator');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/helpers');

class CSVController {
 async uploadCSV(req, res, next) {
   try {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }

     if (!req.file) {
       throw new AppError('No CSV file uploaded', 400);
     }

     const { repositoryId } = req.body;
     const userId = req.user.id;

     // Validate repository ownership
     const repository = await repositoryService.getRepositoryById(repositoryId);
     if (!repository) {
       throw new AppError('Repository not found', 404);
     }

     if (repository.owner.toString() !== userId) {
       throw new AppError('Unauthorized to upload to this repository', 403);
     }

     // Parse CSV
     const parsedData = await csvService.parseCSV(req.file.buffer, {
       validateEmails: true,
       removeDuplicates: true,
       maxRows: 10000
     });

     // Process emails through snowball service
     const snowballResult = await snowballService.processEmailList({
       emails: parsedData.emails,
       repositoryId,
       userId,
       source: 'csv_upload',
       metadata: {
         filename: req.file.originalname,
         uploadDate: new Date(),
         totalRows: parsedData.totalRows,
         validEmails: parsedData.validEmails.length
       }
     });

     // Update repository with new emails
     const updatedRepository = await repositoryService.addEmailsToRepository(
       repositoryId,
       snowballResult.processedEmails,
       {
         source: 'csv_upload',
         uploadedBy: userId,
         snowballGeneration: 0
       }
     );

     logger.info(`CSV uploaded successfully`, {
       userId,
       repositoryId,
       filename: req.file.originalname,
       emailsAdded: snowballResult.addedCount
     });

     res.status(200).json({
       success: true,
       data: {
         filename: req.file.originalname,
         totalRows: parsedData.totalRows,
         validEmails: parsedData.validEmails.length,
         invalidEmails: parsedData.invalidEmails.length,
         duplicatesRemoved: parsedData.duplicatesRemoved,
         emailsAdded: snowballResult.addedCount,
         emailsSkipped: snowballResult.skippedCount,
         repository: {
           id: updatedRepository._id,
           name: updatedRepository.name,
           totalEmails: updatedRepository.emailCount
         }
       }
     });
   } catch (error) {
     logger.error('CSV upload error:', error);
     next(error);
   }
 }

 async downloadRepositoryCSV(req, res, next) {
   try {
     const { repositoryId } = req.params;
     const userId = req.user.id;

     // Get repository
     const repository = await repositoryService.getRepositoryById(repositoryId);
     if (!repository) {
       throw new AppError('Repository not found', 404);
     }

     // Check permissions
     const hasAccess = await repositoryService.checkUserAccess(repositoryId, userId);
     if (!hasAccess) {
       throw new AppError('Unauthorized to download this repository', 403);
     }

     // Generate CSV
     const csvData = await csvService.generateRepositoryCSV(repository, {
       includeMetadata: true,
       includeStats: true,
       format: req.query.format || 'standard'
     });

     // Set headers
     res.setHeader('Content-Type', 'text/csv');
     res.setHeader(
       'Content-Disposition',
       `attachment; filename="${repository.slug}-${Date.now()}.csv"`
     );

     logger.info('Repository CSV downloaded', {
       userId,
       repositoryId,
       emailCount: repository.emailCount
     });

     res.send(csvData);
   } catch (error) {
     logger.error('CSV download error:', error);
     next(error);
   }
 }

 async previewCSV(req, res, next) {
   try {
     if (!req.file) {
       throw new AppError('No CSV file provided', 400);
     }

     const preview = await csvService.previewCSV(req.file.buffer, {
       maxRows: 10,
       validateEmails: true
     });

     res.status(200).json({
       success: true,
       data: {
         filename: req.file.originalname,
         headers: preview.headers,
         sampleRows: preview.sampleRows,
         totalRows: preview.totalRows,
         validEmailsCount: preview.validEmailsCount,
         invalidEmailsCount: preview.invalidEmailsCount,
         estimatedUniqueEmails: preview.estimatedUniqueEmails
       }
     });
   } catch (error) {
     logger.error('CSV preview error:', error);
     next(error);
   }
 }

 async mergeCSVs(req, res, next) {
   try {
     const { sourceRepositoryIds, targetRepositoryId } = req.body;
     const userId = req.user.id;

     // Validate all repositories
     const validationResults = await Promise.all(
       [...sourceRepositoryIds, targetRepositoryId].map(async (repoId) => {
         const repo = await repositoryService.getRepositoryById(repoId);
         if (!repo || repo.owner.toString() !== userId) {
           return { valid: false, repoId };
         }
         return { valid: true, repo };
       })
     );

     const invalidRepo = validationResults.find(result => !result.valid);
     if (invalidRepo) {
       throw new AppError(`Invalid repository: ${invalidRepo.repoId}`, 403);
     }

     // Merge repositories
     const mergeResult = await csvService.mergeRepositories(
       sourceRepositoryIds,
       targetRepositoryId,
       {
         removeDuplicates: true,
         preserveMetadata: true,
         triggerSnowball: req.body.triggerSnowball || false
       }
     );

     res.status(200).json({
       success: true,
       data: {
         targetRepository: mergeResult.targetRepository,
         emailsMerged: mergeResult.emailsMerged,
         duplicatesRemoved: mergeResult.duplicatesRemoved,
         snowballTriggered: mergeResult.snowballTriggered
       }
     });
   } catch (error) {
     logger.error('CSV merge error:', error);
     next(error);
   }
 }

 async exportSnowballHistory(req, res, next) {
   try {
     const { repositoryId } = req.params;
     const userId = req.user.id;

     // Validate access
     const repository = await repositoryService.getRepositoryById(repositoryId);
     if (!repository || repository.owner.toString() !== userId) {
       throw new AppError('Unauthorized access', 403);
     }

     // Generate snowball history CSV
     const historyCSV = await csvService.generateSnowballHistoryCSV(
       repositoryId,
       {
         includeGenerations: true,
         includeTimestamps: true,
         includeSourceInfo: true
       }
     );

     res.setHeader('Content-Type', 'text/csv');
     res.setHeader(
       'Content-Disposition',
       `attachment; filename="${repository.slug}-snowball-history-${Date.now()}.csv"`
     );

     res.send(historyCSV);
   } catch (error) {
     logger.error('Snowball history export error:', error);
     next(error);
   }
 }

 async validateCSV(req, res, next) {
   try {
     if (!req.file) {
       throw new AppError('No CSV file provided', 400);
     }

     const validation = await csvService.validateCSV(req.file.buffer, {
       checkEmailFormat: true,
       checkDomainValidity: req.body.checkDomains || false,
       checkDisposableEmails: true,
       maxFileSize: 10 * 1024 * 1024 // 10MB
     });

     res.status(200).json({
       success: true,
       data: {
         isValid: validation.isValid,
         errors: validation.errors,
         warnings: validation.warnings,
         statistics: {
           totalRows: validation.stats.totalRows,
           validEmails: validation.stats.validEmails,
           invalidEmails: validation.stats.invalidEmails,
           disposableEmails: validation.stats.disposableEmails,
           duplicates: validation.stats.duplicates
         }
       }
     });
   } catch (error) {
     logger.error('CSV validation error:', error);
     next(error);
   }
 }

 async getCSVTemplates(req, res, next) {
   try {
     const templates = await csvService.getAvailableTemplates();

     res.status(200).json({
       success: true,
       data: {
         templates: templates.map(template => ({
           id: template.id,
           name: template.name,
           description: template.description,
           headers: template.headers,
           sampleData: template.sampleData,
           downloadUrl: `/api/csv/templates/${template.id}/download`
         }))
       }
     });
   } catch (error) {
     logger.error('Get templates error:', error);
     next(error);
   }
 }

 async downloadTemplate(req, res, next) {
   try {
     const { templateId } = req.params;
     
     const template = await csvService.getTemplateById(templateId);
     if (!template) {
       throw new AppError('Template not found', 404);
     }

     const csvContent = await csvService.generateTemplateCSV(template);

     res.setHeader('Content-Type', 'text/csv');
     res.setHeader(
       'Content-Disposition',
       `attachment; filename="${template.filename}"`
     );

     res.send(csvContent);
   } catch (error) {
     logger.error('Template download error:', error);
     next(error);
   }
 }

 async getUploadHistory(req, res, next) {
   try {
     const userId = req.user.id;
     const { page = 1, limit = 20, repositoryId } = req.query;

     const history = await csvService.getUserUploadHistory(userId, {
       page: parseInt(page),
       limit: parseInt(limit),
       repositoryId
     });

     res.status(200).json({
       success: true,
       data: history
     });
   } catch (error) {
     logger.error('Get upload history error:', error);
     next(error);
   }
 }

 async analyzeEmailQuality(req, res, next) {
   try {
     if (!req.file) {
       throw new AppError('No CSV file provided', 400);
     }

     const analysis = await csvService.analyzeEmailQuality(req.file.buffer, {
       checkEngagement: true,
       checkDomainReputation: true,
       predictSnowballPotential: true
     });

     res.status(200).json({
       success: true,
       data: {
         overallQualityScore: analysis.qualityScore,
         domainAnalysis: analysis.domainBreakdown,
         engagementPrediction: analysis.engagementPrediction,
         snowballPotential: analysis.snowballPotential,
         recommendations: analysis.recommendations
       }
     });
   } catch (error) {
     logger.error('Email quality analysis error:', error);
     next(error);
   }
 }
}

module.exports = new CSVController();
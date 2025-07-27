/**
 * @fileoverview CSV Controller for ShadowNews Platform
 * 
 * Comprehensive CSV file management system for email repository operations.
 * This controller handles bulk email imports, exports, validation, and analysis
 * for the ShadowNews email-first platform. It integrates with the snowball
 * distribution system and provides advanced CSV processing capabilities.
 * 
 * Key Features:
 * - Bulk CSV email upload with validation and deduplication
 * - Repository CSV export with customizable formats
 * - CSV file preview and validation before upload
 * - Repository merging with duplicate handling
 * - Snowball distribution history tracking
 * - Email quality analysis and domain reputation checking
 * - Template generation for consistent CSV formats
 * - Upload history tracking and analytics
 * - Advanced email validation (format, domain, disposable detection)
 * 
 * CSV Operations:
 * - Upload: Parse and validate CSV files for email imports
 * - Download: Export repository data in various CSV formats
 * - Preview: Show CSV contents before processing
 * - Merge: Combine multiple repositories with deduplication
 * - Validate: Check CSV format and email quality
 * - Analyze: Assess email quality and engagement potential
 * 
 * Security Features:
 * - Repository ownership validation for all operations
 * - File size limits and format validation
 * - Input sanitization and validation
 * - Access control for sensitive operations
 * - Audit logging for all CSV operations
 * 
 * Integration Points:
 * - csv.service: Core CSV processing and validation
 * - repository.service: Repository management and access control
 * - snowball.service: Email distribution and referral tracking
 * - File upload middleware for secure file handling
 * - Karma system integration for CSV upload rewards
 * 
 * Dependencies:
 * - csv.service: CSV parsing, validation, and generation
 * - repository.service: Repository operations and permissions
 * - snowball.service: Email distribution system integration
 * - express-validator: Input validation and sanitization
 * - logger: Application logging and monitoring
 * - helpers: Error handling utilities
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// Service layer dependencies for CSV operations
const csvService = require('../../services/csv.service');                 // CSV processing and validation
const repositoryService = require('../../services/repository.service');   // Repository management
const snowballService = require('../../services/snowball.service');       // Email distribution system

// Utility dependencies
const { validationResult } = require('express-validator');  // Input validation
const logger = require('../../utils/logger');               // Application logging
const { AppError } = require('../../utils/helpers');        // Error handling utilities

/**
 * CSV Controller Class
 * Handles all CSV-related operations for the ShadowNews platform
 * 
 * This class implements comprehensive CSV management including file uploads,
 * downloads, validation, and integration with the email repository system.
 */
class CSVController {

  /**
   * Upload CSV File
   * Processes CSV file uploads for bulk email imports to repositories
   * 
   * This endpoint handles the complete CSV upload workflow including file
   * validation, email parsing, deduplication, and integration with the
   * snowball distribution system for organic email growth.
   * 
   * @route POST /api/csv/upload
   * @access Private (requires authentication and repository ownership)
   * @param {Object} req.file - Uploaded CSV file from multer middleware
   * @param {Object} req.body - Upload configuration
   * @param {string} req.body.repositoryId - Target repository for email import
   * @returns {Object} Upload results with statistics and repository updates
   */
  async uploadCSV(req, res, next) {
    try {
      // Validate input data using express-validator rules
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Ensure CSV file was uploaded
      if (!req.file) {
        throw new AppError('No CSV file uploaded', 400);
      }

      const { repositoryId } = req.body;
      const userId = req.user.id;

      // Validate repository exists and user has ownership
      const repository = await repositoryService.getRepositoryById(repositoryId);
      if (!repository) {
        throw new AppError('Repository not found', 404);
      }

      // Verify user owns the repository (only owners can upload CSV files)
      if (repository.owner.toString() !== userId) {
        throw new AppError('Unauthorized to upload to this repository', 403);
      }

      // Parse CSV file with comprehensive validation and processing
      const parsedData = await csvService.parseCSV(req.file.buffer, {
        validateEmails: true,      // Validate email format and domains
        removeDuplicates: true,    // Remove duplicate emails within file
        maxRows: 10000            // Limit file size to prevent abuse
      });

      // Process emails through snowball distribution system
      // This enables organic growth through email referrals
      const snowballResult = await snowballService.processEmailList({
        emails: parsedData.emails,
        repositoryId,
        userId,
        source: 'csv_upload',      // Track source for analytics
        metadata: {
          filename: req.file.originalname,
          uploadDate: new Date(),
          totalRows: parsedData.totalRows,
          validEmails: parsedData.validEmails.length
        }
      });

      // Add processed emails to the target repository
      const updatedRepository = await repositoryService.addEmailsToRepository(
        repositoryId,
        snowballResult.processedEmails,
        {
          source: 'csv_upload',      // Source tracking for analytics
          uploadedBy: userId,        // User attribution
          snowballGeneration: 0      // Initial generation for snowball tracking
        }
      );

      // Log successful upload for monitoring and analytics
      logger.info(`CSV uploaded successfully`, {
        userId,
        repositoryId,
        filename: req.file.originalname,
        emailsAdded: snowballResult.addedCount
      });

      // Return comprehensive upload results
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

  /**
   * Download Repository CSV
   * Exports repository email data as a CSV file
   * 
   * This endpoint generates CSV exports of repository data with customizable
   * formats and metadata inclusion. Supports various export formats for
   * different use cases.
   * 
   * @route GET /api/repositories/:repositoryId/csv
   * @access Private (requires authentication and repository access)
   * @param {string} req.params.repositoryId - Repository to export
   * @param {string} req.query.format - Export format (standard, detailed, analytics)
   * @returns {File} CSV file download with repository data
   */
  async downloadRepositoryCSV(req, res, next) {
    try {
      const { repositoryId } = req.params;
      const userId = req.user.id;

      // Validate repository exists
      const repository = await repositoryService.getRepositoryById(repositoryId);
      if (!repository) {
        throw new AppError('Repository not found', 404);
      }

      // Check user has access to download this repository
      // Supports both ownership and collaboration permissions
      const hasAccess = await repositoryService.checkUserAccess(repositoryId, userId);
      if (!hasAccess) {
        throw new AppError('Unauthorized to download this repository', 403);
      }

      // Generate CSV data with requested format and metadata
      const csvData = await csvService.generateRepositoryCSV(repository, {
        includeMetadata: true,              // Include email metadata (source, dates)
        includeStats: true,                 // Include engagement statistics
        format: req.query.format || 'standard'  // Export format preference
      });

      // Set appropriate headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${repository.slug}-${Date.now()}.csv"`
      );

      // Log download for analytics and monitoring
      logger.info('Repository CSV downloaded', {
        userId,
        repositoryId,
        emailCount: repository.emailCount
      });

      // Send CSV file as response
      res.send(csvData);
    } catch (error) {
      logger.error('CSV download error:', error);
      next(error);
    }
  }

  /**
   * Preview CSV File
   * Shows a preview of CSV contents before full processing
   * 
   * This endpoint allows users to preview CSV files and validate their
   * format before committing to a full upload, preventing errors and
   * providing immediate feedback.
   * 
   * @route POST /api/csv/preview
   * @access Private (requires authentication)
   * @param {Object} req.file - CSV file to preview from multer middleware
   * @returns {Object} Preview data with sample rows and validation results
   */
  async previewCSV(req, res, next) {
    try {
      // Ensure CSV file was provided
      if (!req.file) {
        throw new AppError('No CSV file provided', 400);
      }

      // Generate preview with limited rows for performance
      const preview = await csvService.previewCSV(req.file.buffer, {
        maxRows: 10,           // Limit preview to first 10 rows
        validateEmails: true   // Validate email formats in preview
      });

      // Return preview data with statistics
      res.status(200).json({
        success: true,
        data: {
          filename: req.file.originalname,
          headers: preview.headers,                    // CSV column headers
          sampleRows: preview.sampleRows,              // Sample data rows
          totalRows: preview.totalRows,                // Total row count
          validEmailsCount: preview.validEmailsCount,  // Valid email count
          invalidEmailsCount: preview.invalidEmailsCount, // Invalid email count
          estimatedUniqueEmails: preview.estimatedUniqueEmails // Estimated unique emails
        }
      });
    } catch (error) {
      logger.error('CSV preview error:', error);
      next(error);
    }
  }

  /**
   * Merge CSV Repositories
   * Combines multiple repositories into a single target repository
   * 
   * This endpoint enables repository consolidation by merging email lists
   * from multiple source repositories into a target repository with
   * deduplication and metadata preservation.
   * 
   * @route POST /api/csv/merge
   * @access Private (requires authentication and ownership of all repositories)
   * @param {Object} req.body - Merge configuration
   * @param {string[]} req.body.sourceRepositoryIds - Source repositories to merge
   * @param {string} req.body.targetRepositoryId - Target repository for merge
   * @param {boolean} req.body.triggerSnowball - Whether to trigger snowball distribution
   * @returns {Object} Merge results with statistics and updated repository
   */
  async mergeCSVs(req, res, next) {
    try {
      const { sourceRepositoryIds, targetRepositoryId } = req.body;
      const userId = req.user.id;

      // Validate all repositories exist and user owns them
      const validationResults = await Promise.all(
        [...sourceRepositoryIds, targetRepositoryId].map(async (repoId) => {
          const repo = await repositoryService.getRepositoryById(repoId);
          // Check repository exists and user owns it
          if (!repo || repo.owner.toString() !== userId) {
            return { valid: false, repoId };
          }
          return { valid: true, repo };
        })
      );

      // Check for any invalid repositories
      const invalidRepo = validationResults.find(result => !result.valid);
      if (invalidRepo) {
        throw new AppError(`Invalid repository: ${invalidRepo.repoId}`, 403);
      }

      // Execute repository merge with comprehensive options
      const mergeResult = await csvService.mergeRepositories(
        sourceRepositoryIds,
        targetRepositoryId,
        {
          removeDuplicates: true,      // Remove duplicate emails across repositories
          preserveMetadata: true,      // Maintain email source metadata
          triggerSnowball: req.body.triggerSnowball || false  // Optional snowball trigger
        }
      );

      // Return merge results with statistics
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

  /**
   * Export Snowball History
   * Exports the snowball distribution history for a repository
   * 
   * This endpoint generates a CSV export of snowball distribution events,
   * showing how emails have grown organically through referrals and
   * providing analytics for growth tracking.
   * 
   * @route GET /api/repositories/:repositoryId/snowball-history
   * @access Private (requires authentication and repository ownership)
   * @param {string} req.params.repositoryId - Repository for history export
   * @returns {File} CSV file with snowball distribution history
   */
  async exportSnowballHistory(req, res, next) {
    try {
      const { repositoryId } = req.params;
      const userId = req.user.id;

      // Validate repository access and ownership
      const repository = await repositoryService.getRepositoryById(repositoryId);
      if (!repository || repository.owner.toString() !== userId) {
        throw new AppError('Unauthorized access', 403);
      }

      // Generate comprehensive snowball history CSV
      const historyCSV = await csvService.generateSnowballHistoryCSV(
        repositoryId,
        {
          includeGenerations: true,    // Include snowball generation levels
          includeTimestamps: true,     // Include timing information
          includeSourceInfo: true      // Include source email information
        }
      );

      // Set file download headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${repository.slug}-snowball-history-${Date.now()}.csv"`
      );

      // Send snowball history as CSV download
      res.send(historyCSV);
    } catch (error) {
      logger.error('Snowball history export error:', error);
      next(error);
    }
  }

  /**
   * Validate CSV File
   * Performs comprehensive validation of CSV file format and content
   * 
   * This endpoint provides detailed validation results for CSV files,
   * checking email formats, domain validity, and identifying potential
   * issues before processing.
   * 
   * @route POST /api/csv/validate
   * @access Private (requires authentication)
   * @param {Object} req.file - CSV file to validate from multer middleware
   * @param {Object} req.body - Validation options
   * @param {boolean} req.body.checkDomains - Whether to validate email domains
   * @returns {Object} Validation results with errors, warnings, and statistics
   */
  async validateCSV(req, res, next) {
    try {
      // Ensure CSV file was provided
      if (!req.file) {
        throw new AppError('No CSV file provided', 400);
      }

      // Perform comprehensive CSV validation
      const validation = await csvService.validateCSV(req.file.buffer, {
        checkEmailFormat: true,                    // Validate email format
        checkDomainValidity: req.body.checkDomains || false, // Optional domain checking
        checkDisposableEmails: true,               // Detect disposable email services
        maxFileSize: 10 * 1024 * 1024             // 10MB file size limit
      });

      // Return detailed validation results
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

  /**
   * Get CSV Templates
   * Returns available CSV templates for consistent formatting
   * 
   * This endpoint provides pre-defined CSV templates that users can
   * download and use as guides for proper CSV formatting and required
   * columns for successful imports.
   * 
   * @route GET /api/csv/templates
   * @access Private (requires authentication)
   * @returns {Object} Array of available CSV templates with metadata
   */
  async getCSVTemplates(req, res, next) {
    try {
      // Fetch all available CSV templates
      const templates = await csvService.getAvailableTemplates();

      // Return template information with download links
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

  /**
   * Download CSV Template
   * Downloads a specific CSV template file
   * 
   * This endpoint serves CSV template files that users can download
   * as starting points for their own CSV files, ensuring proper
   * formatting and required columns.
   * 
   * @route GET /api/csv/templates/:templateId/download
   * @access Private (requires authentication)
   * @param {string} req.params.templateId - ID of template to download
   * @returns {File} CSV template file download
   */
  async downloadTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      
      // Fetch specific template by ID
      const template = await csvService.getTemplateById(templateId);
      if (!template) {
        throw new AppError('Template not found', 404);
      }

      // Generate CSV content from template
      const csvContent = await csvService.generateTemplateCSV(template);

      // Set file download headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${template.filename}"`
      );

      // Send template as CSV download
      res.send(csvContent);
    } catch (error) {
      logger.error('Template download error:', error);
      next(error);
    }
  }

  /**
   * Get Upload History
   * Retrieves user's CSV upload history with pagination
   * 
   * This endpoint provides a paginated list of the user's CSV upload
   * history, including upload statistics, file names, and results for
   * tracking and auditing purposes.
   * 
   * @route GET /api/csv/history
   * @access Private (requires authentication)
   * @param {number} req.query.page - Page number for pagination
   * @param {number} req.query.limit - Number of results per page
   * @param {string} req.query.repositoryId - Optional repository filter
   * @returns {Object} Paginated upload history with statistics
   */
  async getUploadHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, repositoryId } = req.query;

      // Fetch user's upload history with pagination and filtering
      const history = await csvService.getUserUploadHistory(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        repositoryId  // Optional repository filter
      });

      // Return paginated upload history
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Get upload history error:', error);
      next(error);
    }
  }

  /**
   * Analyze Email Quality
   * Performs advanced analysis of email quality and engagement potential
   * 
   * This endpoint analyzes CSV files to assess email quality, domain
   * reputation, and potential for engagement and snowball distribution,
   * providing insights before upload.
   * 
   * @route POST /api/csv/analyze
   * @access Private (requires authentication)
   * @param {Object} req.file - CSV file to analyze from multer middleware
   * @returns {Object} Quality analysis with scores and recommendations
   */
  async analyzeEmailQuality(req, res, next) {
    try {
      // Ensure CSV file was provided
      if (!req.file) {
        throw new AppError('No CSV file provided', 400);
      }

      // Perform comprehensive email quality analysis
      const analysis = await csvService.analyzeEmailQuality(req.file.buffer, {
        checkEngagement: true,         // Predict engagement potential
        checkDomainReputation: true,   // Analyze domain reputation
        predictSnowballPotential: true // Predict snowball distribution potential
      });

      // Return detailed quality analysis results
      res.status(200).json({
        success: true,
        data: {
          overallQualityScore: analysis.qualityScore,       // Overall quality score (0-100)
          domainAnalysis: analysis.domainBreakdown,         // Domain-by-domain analysis
          engagementPrediction: analysis.engagementPrediction, // Predicted engagement rates
          snowballPotential: analysis.snowballPotential,   // Snowball distribution potential
          recommendations: analysis.recommendations         // Actionable recommendations
        }
      });
    } catch (error) {
      logger.error('Email quality analysis error:', error);
      next(error);
    }
  }
}

// Export singleton instance of CSV controller
module.exports = new CSVController();
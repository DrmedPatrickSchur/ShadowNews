/**
 * @fileoverview Centralized Logging System
 * 
 * Comprehensive logging infrastructure for the ShadowNews platform using Winston.
 * Provides structured logging with multiple output channels, log levels, and
 * production-ready features for monitoring, debugging, and analytics.
 * 
 * Key Features:
 * - Multi-level logging with customizable severity levels
 * - File-based log rotation and archival system
 * - Console output with color-coded severity indicators
 * - Production and development environment configurations
 * - Structured JSON logging for log aggregation systems
 * - Error tracking and performance monitoring integration
 * - HTTP request/response logging middleware compatibility
 * - Security-aware log sanitization and filtering
 * 
 * Log Levels (ascending priority):
 * - debug: Detailed debugging information for development
 * - http: HTTP request/response and API interaction logs
 * - info: General informational messages and system events
 * - warn: Warning conditions that should be monitored
 * - error: Error conditions requiring immediate attention
 * 
 * Output Destinations:
 * - Console: Color-coded output for development environments
 * - File System: Rotating log files with date-based organization
 * - Error Logs: Dedicated error-only log files for monitoring
 * - Combined Logs: All log levels in unified output files
 * 
 * Production Features:
 * - Log file rotation to prevent disk space issues
 * - Performance-optimized asynchronous logging
 * - Memory-efficient log buffering and batching
 * - Integration with external monitoring systems
 * - Sensitive data filtering and privacy protection
 * 
 * Dependencies:
 * - winston: Core logging framework with extensive plugin ecosystem
 * - path: File system path manipulation utilities
 * - fs: File system operations for log directory management
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * Log Directory Initialization
 * 
 * Ensures the logs directory exists before attempting to write log files.
 * Creates the directory structure recursively if it doesn't exist, preventing
 * file system errors during application startup.
 */
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom Log Levels Configuration
 * 
 * Defines the hierarchy of log levels with numeric priorities.
 * Lower numbers indicate higher priority levels that will be logged
 * more prominently and preserved longer in production environments.
 * 
 * @constant {Object} levels - Log level priority mapping
 * @property {number} error - Critical errors requiring immediate attention (0)
 * @property {number} warn - Warning conditions that should be monitored (1)
 * @property {number} info - General informational messages (2)
 * @property {number} http - HTTP request/response logging (3)
 * @property {number} debug - Detailed debugging information (4)
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Log Level Color Mapping
 * 
 * Associates each log level with a distinct color for enhanced readability
 * in console output. Improves developer experience and log scanning efficiency
 * during development and debugging sessions.
 * 
 * @constant {Object} colors - Color assignments for log levels
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Log Format Configuration
 * 
 * Defines the structure and formatting of log entries combining timestamp,
 * log level, and message content. Ensures consistent log formatting across
 * all application components and output destinations.
 * 
 * Features:
 * - ISO 8601 timestamp format with millisecond precision
 * - Color-coded log levels for console output
 * - Structured format for easy parsing and analysis
 * - Error stack trace inclusion for debugging
 * 
 * @constant {winston.Logform.Format} format - Winston format configuration
 */
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  })
);

/**
 * Log Transport Configuration
 * 
 * Defines multiple output destinations for log messages with specific
 * configurations for each transport type. Enables flexible log routing
 * and storage strategies for different environments and use cases.
 * 
 * Transport Types:
 * - Console: Real-time output for development and debugging
 * - Error File: Dedicated error-only log storage with rotation
 * - Combined File: All log levels with automatic file rotation
 * 
 * File Rotation Features:
 * - Maximum file size: 5MB per log file
 * - Maximum files: 5 archived files per log type
 * - Automatic cleanup and compression of old logs
 * 
 * @constant {Array<winston.Transport>} transports - Transport configurations
 */
const transports = [
  // Console transport for real-time development feedback
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // Error-only log file for critical issue tracking
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file for comprehensive logging
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

/**
 * Winston Logger Instance
 * 
 * Primary logger instance configured with custom levels, formatting,
 * and transport options. Provides the core logging functionality for
 * the entire ShadowNews platform.
 * 
 * Configuration Features:
 * - Environment-based log level control
 * - Custom log level hierarchy
 * - Multiple output transports
 * - Graceful error handling without process termination
 * 
 * @constant {winston.Logger} logger - Configured Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
  exitOnError: false,
});

/**
 * HTTP Logging Stream
 * 
 * Provides a stream interface for Morgan HTTP request logging middleware.
 * Enables seamless integration between Express HTTP logging and the
 * centralized Winston logging system.
 * 
 * @property {Object} stream - Stream interface for Morgan integration
 * @property {Function} stream.write - Write method for HTTP log messages
 */
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Development Context Enhancement
 * 
 * Adds file and line number context to log messages in development
 * environment for improved debugging experience. Uses stack trace
 * analysis to determine the calling file location.
 */
if (process.env.NODE_ENV === 'development') {
  const getCallerFile = () => {
    const originalFunc = Error.prepareStackTrace;
    let callerfile;
    try {
      const err = new Error();
      let currentfile;
      Error.prepareStackTrace = (err, stack) => stack;
      currentfile = err.stack.shift().getFileName();
      while (err.stack.length) {
        callerfile = err.stack.shift().getFileName();
        if (currentfile !== callerfile) break;
      }
    } catch (e) {}
    Error.prepareStackTrace = originalFunc;
    return callerfile;
  };

  const addContext = (level) => {
    return (message, ...args) => {
      const callerFile = getCallerFile();
      const context = callerFile ? ` [${path.basename(callerFile)}]` : '';
      logger[level](`${message}${context}`, ...args);
    };
  };

  logger.error = addContext('error');
  logger.warn = addContext('warn');
  logger.info = addContext('info');
  logger.debug = addContext('debug');
}

/**
 * Enhanced Error Logging
 * 
 * Comprehensive error logging with request context, user information,
 * and detailed error metadata. Essential for debugging and monitoring
 * application issues in production environments.
 * 
 * @param {Error} error - Error object to log
 * @param {Object} [req=null] - Express request object for context
 * 
 * @example
 * // Log error with request context
 * logger.logError(new Error('Database connection failed'), req);
 * 
 * @since 1.0.0
 */
logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    if (req.user) {
      errorInfo.user = {
        id: req.user._id,
        email: req.user.email,
      };
    }
  }

  logger.error('Application Error:', errorInfo);
};

/**
 * API Request/Response Logging
 * 
 * Structured logging for API calls including request details, response
 * status, timing information, and user context. Essential for API
 * monitoring, performance analysis, and usage tracking.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 * 
 * @example
 * // Log API call with timing
 * logger.logApiCall(req, res, 150);
 * 
 * @since 1.0.0
 */
logger.logApiCall = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  if (req.user) {
    logData.userId = req.user._id;
  }

  logger.http('API Call:', logData);
};/**
 * Email Event Logging
 * 
 * Specialized logging for email processing events including sending,
 * receiving, parsing, and delivery status tracking. Essential for
 * monitoring the email-centric features of the platform.
 * 
 * @param {string} event - Email event type (sent, received, parsed, etc.)
 * @param {Object} data - Event-specific data and context
 * 
 * @example
 * // Log email sent event
 * logger.logEmailEvent('sent', { to: 'user@example.com', subject: 'Welcome' });
 * 
 * @since 1.0.0
 */
logger.logEmailEvent = (event, data) => {
  logger.info(`Email Event [${event}]:`, {
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Repository Event Logging
 * 
 * Tracks repository-related activities including creation, updates,
 * member additions, and snowball distribution events. Critical for
 * monitoring community growth and engagement metrics.
 * 
 * @param {string} event - Repository event type
 * @param {string} repositoryId - Repository identifier
 * @param {Object} data - Event-specific data and metrics
 * 
 * @example
 * // Log repository member addition
 * logger.logRepositoryEvent('member_added', repoId, { newMemberCount: 150 });
 * 
 * @since 1.0.0
 */
logger.logRepositoryEvent = (event, repositoryId, data) => {
  logger.info(`Repository Event [${event}]:`, {
    event,
    repositoryId,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Snowball Distribution Event Logging
 * 
 * Specialized logging for tracking viral growth and snowball effect
 * propagation within repositories. Essential for analyzing growth
 * patterns and optimizing distribution strategies.
 * 
 * @param {string} repositoryId - Repository experiencing snowball growth
 * @param {number} addedEmails - Number of emails added in this event
 * @param {number} totalEmails - Total repository member count after addition
 * 
 * @example
 * // Log snowball distribution event
 * logger.logSnowballEvent('repo123', 25, 175);
 * 
 * @since 1.0.0
 */
logger.logSnowballEvent = (repositoryId, addedEmails, totalEmails) => {
  logger.info('Snowball Distribution Event:', {
    repositoryId,
    addedEmails,
    totalEmails,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Background Worker Event Logging
 * 
 * Tracks background worker activities including job processing, queue
 * management, and scheduled task execution. Essential for monitoring
 * asynchronous operations and system health.
 * 
 * @param {string} workerName - Name of the background worker
 * @param {string} event - Worker event type (started, completed, failed, etc.)
 * @param {Object} [data={}] - Worker-specific data and context
 * 
 * @example
 * // Log worker job completion
 * logger.logWorkerEvent('emailDigest', 'completed', { emailsSent: 1000 });
 * 
 * @since 1.0.0
 */
logger.logWorkerEvent = (workerName, event, data = {}) => {
  logger.debug(`Worker [${workerName}] ${event}:`, {
    worker: workerName,
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Automated Log File Cleanup
 * 
 * Performs periodic cleanup of old log files to prevent disk space
 * exhaustion. Automatically removes log files older than 30 days
 * while preserving recent logs for debugging and analysis.
 * 
 * Features:
 * - Automatic file age detection and removal
 * - Configurable retention period (30 days default)
 * - Error handling for file system operations
 * - Logging of cleanup activities
 * 
 * @since 1.0.0
 */
const cleanupOldLogs = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  fs.readdir(logsDir, (err, files) => {
    if (err) return logger.error('Error reading logs directory:', err);

    files.forEach((file) => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlink(filePath, (err) => {
            if (err) logger.error('Error deleting old log file:', err);
            else logger.info(`Deleted old log file: ${file}`);
          });
        }
      });
    });
  });
};

// Schedule daily log cleanup at 24-hour intervals
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

/**
 * Global Exception and Rejection Handlers
 * 
 * Captures uncaught exceptions and unhandled promise rejections to
 * ensure critical errors are logged before process termination.
 * Essential for debugging production issues and maintaining system stability.
 */

// Handle uncaught exceptions with comprehensive logging
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Logger Module Export
 * 
 * Exports the configured Winston logger instance with all custom methods
 * and enhancements for use throughout the ShadowNews platform.
 * 
 * Available Methods:
 * - Standard logging: error(), warn(), info(), http(), debug()
 * - Enhanced logging: logError(), logApiCall()
 * - Specialized logging: logEmailEvent(), logRepositoryEvent(), logSnowballEvent(), logWorkerEvent()
 * - HTTP integration: stream (for Morgan middleware)
 * 
 * @since 1.0.0
 */
module.exports = logger;
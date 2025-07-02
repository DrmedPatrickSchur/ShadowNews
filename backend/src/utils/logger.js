const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
 fs.mkdirSync(logsDir, { recursive: true });
}

// Define custom log levels
const levels = {
 error: 0,
 warn: 1,
 info: 2,
 http: 3,
 debug: 4,
};

// Define colors for each level
const colors = {
 error: 'red',
 warn: 'yellow',
 info: 'green',
 http: 'magenta',
 debug: 'white',
};

winston.addColors(colors);

// Define log format
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

// Define transports
const transports = [
 // Console transport
 new winston.transports.Console({
   format: winston.format.combine(
     winston.format.colorize(),
     winston.format.simple()
   ),
 }),
 
 // Error log file
 new winston.transports.File({
   filename: path.join(logsDir, 'error.log'),
   level: 'error',
   maxsize: 5242880, // 5MB
   maxFiles: 5,
 }),
 
 // Combined log file
 new winston.transports.File({
   filename: path.join(logsDir, 'combined.log'),
   maxsize: 5242880, // 5MB
   maxFiles: 5,
 }),
];

// Create logger instance
const logger = winston.createLogger({
 level: process.env.LOG_LEVEL || 'debug',
 levels,
 format,
 transports,
 exitOnError: false,
});

// Create stream for Morgan HTTP logging
logger.stream = {
 write: (message) => {
   logger.http(message.trim());
 },
};

// Add file/line number to logs in development
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

// Helper methods
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
};

logger.logEmailEvent = (event, data) => {
 logger.info(`Email Event [${event}]:`, {
   event,
   ...data,
   timestamp: new Date().toISOString(),
 });
};

logger.logRepositoryEvent = (event, repositoryId, data) => {
 logger.info(`Repository Event [${event}]:`, {
   event,
   repositoryId,
   ...data,
   timestamp: new Date().toISOString(),
 });
};

logger.logSnowballEvent = (repositoryId, addedEmails, totalEmails) => {
 logger.info('Snowball Distribution Event:', {
   repositoryId,
   addedEmails,
   totalEmails,
   timestamp: new Date().toISOString(),
 });
};

logger.logWorkerEvent = (workerName, event, data = {}) => {
 logger.debug(`Worker [${workerName}] ${event}:`, {
   worker: workerName,
   event,
   ...data,
   timestamp: new Date().toISOString(),
 });
};

// Cleanup old log files
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

// Run cleanup daily
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
 logger.error('Uncaught Exception:', error);
 process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
 logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = logger;
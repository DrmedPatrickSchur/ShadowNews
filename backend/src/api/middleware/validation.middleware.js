const Joi = require('joi');

const validate = (schema) => {
 return (req, res, next) => {
   const { error } = schema.validate(req.body, { abortEarly: false });
   
   if (error) {
     const errors = error.details.map(detail => ({
       field: detail.path.join('.'),
       message: detail.message
     }));
     
     return res.status(400).json({
       success: false,
       message: 'Validation failed',
       errors
     });
   }
   
   next();
 };
};

const validateQuery = (schema) => {
 return (req, res, next) => {
   const { error } = schema.validate(req.query, { abortEarly: false });
   
   if (error) {
     const errors = error.details.map(detail => ({
       field: detail.path.join('.'),
       message: detail.message
     }));
     
     return res.status(400).json({
       success: false,
       message: 'Query validation failed',
       errors
     });
   }
   
   next();
 };
};

const validateParams = (schema) => {
 return (req, res, next) => {
   const { error } = schema.validate(req.params, { abortEarly: false });
   
   if (error) {
     const errors = error.details.map(detail => ({
       field: detail.path.join('.'),
       message: detail.message
     }));
     
     return res.status(400).json({
       success: false,
       message: 'Parameter validation failed',
       errors
     });
   }
   
   next();
 };
};

const schemas = {
 // Auth schemas
 register: Joi.object({
   email: Joi.string().email().required(),
   username: Joi.string().alphanum().min(3).max(30).required(),
   password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
   interests: Joi.array().items(Joi.string()).max(10)
 }),
 
 login: Joi.object({
   email: Joi.string().email().required(),
   password: Joi.string().required()
 }),
 
 // Post schemas
 createPost: Joi.object({
   title: Joi.string().min(5).max(300).required(),
   url: Joi.string().uri().allow(''),
   text: Joi.string().max(5000).allow(''),
   hashtags: Joi.array().items(Joi.string().pattern(/^#\w+$/)).max(5),
   repositoryIds: Joi.array().items(Joi.string().hex().length(24)).max(3)
 }).or('url', 'text'),
 
 updatePost: Joi.object({
   title: Joi.string().min(5).max(300),
   text: Joi.string().max(5000),
   hashtags: Joi.array().items(Joi.string().pattern(/^#\w+$/)).max(5)
 }),
 
 // Comment schemas
 createComment: Joi.object({
   text: Joi.string().min(1).max(5000).required(),
   parentId: Joi.string().hex().length(24).allow(null)
 }),
 
 // Repository schemas
 createRepository: Joi.object({
   name: Joi.string().min(3).max(100).required(),
   description: Joi.string().max(500).required(),
   topic: Joi.string().min(2).max(50).required(),
   isPrivate: Joi.boolean().default(false),
   emailDomainWhitelist: Joi.array().items(Joi.string().domain()),
   emailDomainBlacklist: Joi.array().items(Joi.string().domain()),
   autoApprove: Joi.boolean().default(false),
   qualityThreshold: Joi.number().min(0).max(100).default(50)
 }),
 
 updateRepository: Joi.object({
   name: Joi.string().min(3).max(100),
   description: Joi.string().max(500),
   isPrivate: Joi.boolean(),
   emailDomainWhitelist: Joi.array().items(Joi.string().domain()),
   emailDomainBlacklist: Joi.array().items(Joi.string().domain()),
   autoApprove: Joi.boolean(),
   qualityThreshold: Joi.number().min(0).max(100)
 }),
 
 addEmails: Joi.object({
   emails: Joi.array().items(Joi.string().email()).min(1).max(1000).required(),
   tags: Joi.array().items(Joi.string()).max(10)
 }),
 
 // CSV schemas
 uploadCSV: Joi.object({
   repositoryId: Joi.string().hex().length(24).required(),
   columnMapping: Joi.object({
     email: Joi.string().required(),
     name: Joi.string(),
     tags: Joi.string()
   })
 }),
 
 // Email schemas
 sendDigest: Joi.object({
   repositoryId: Joi.string().hex().length(24).required(),
   subject: Joi.string().max(200),
   customMessage: Joi.string().max(1000)
 }),
 
 // Query schemas
 pagination: Joi.object({
   page: Joi.number().integer().min(1).default(1),
   limit: Joi.number().integer().min(1).max(100).default(20),
   sort: Joi.string().valid('hot', 'new', 'top', 'controversial').default('hot')
 }),
 
 search: Joi.object({
   q: Joi.string().min(1).max(200).required(),
   type: Joi.string().valid('posts', 'comments', 'users', 'repositories').default('posts'),
   page: Joi.number().integer().min(1).default(1),
   limit: Joi.number().integer().min(1).max(50).default(20)
 }),
 
 // Param schemas
 mongoId: Joi.object({
   id: Joi.string().hex().length(24).required()
 }),
 
 username: Joi.object({
   username: Joi.string().alphanum().min(3).max(30).required()
 })
};

const sanitizeHtml = (req, res, next) => {
 const sanitizeValue = (value) => {
   if (typeof value === 'string') {
     return value
       .replace(/[<>]/g, '')
       .trim();
   }
   if (Array.isArray(value)) {
     return value.map(sanitizeValue);
   }
   if (typeof value === 'object' && value !== null) {
     const sanitized = {};
     for (const key in value) {
       sanitized[key] = sanitizeValue(value[key]);
     }
     return sanitized;
   }
   return value;
 };
 
 if (req.body) {
   req.body = sanitizeValue(req.body);
 }
 
 next();
};

const validateFileUpload = (options = {}) => {
 const {
   maxSize = 10 * 1024 * 1024, // 10MB default
   allowedTypes = ['text/csv', 'application/vnd.ms-excel'],
   allowedExtensions = ['.csv', '.xls', '.xlsx']
 } = options;
 
 return (req, res, next) => {
   if (!req.file) {
     return res.status(400).json({
       success: false,
       message: 'No file uploaded'
     });
   }
   
   const fileExtension = req.file.originalname.substring(req.file.originalname.lastIndexOf('.')).toLowerCase();
   
   if (!allowedExtensions.includes(fileExtension)) {
     return res.status(400).json({
       success: false,
       message: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
     });
   }
   
   if (!allowedTypes.includes(req.file.mimetype)) {
     return res.status(400).json({
       success: false,
       message: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
     });
   }
   
   if (req.file.size > maxSize) {
     return res.status(400).json({
       success: false,
       message: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`
     });
   }
   
   next();
 };
};

module.exports = {
 validate,
 validateQuery,
 validateParams,
 schemas,
 sanitizeHtml,
 validateFileUpload
};
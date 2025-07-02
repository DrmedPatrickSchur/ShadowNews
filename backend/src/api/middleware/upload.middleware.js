const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('../../utils/errors');

// Configure storage
const storage = multer.diskStorage({
 destination: (req, file, cb) => {
   let uploadPath = 'uploads/';
   
   if (file.fieldname === 'csv') {
     uploadPath = 'uploads/csv/';
   } else if (file.fieldname === 'avatar') {
     uploadPath = 'uploads/avatars/';
   } else if (file.fieldname === 'attachment') {
     uploadPath = 'uploads/attachments/';
   }
   
   cb(null, uploadPath);
 },
 filename: (req, file, cb) => {
   const uniqueSuffix = crypto.randomBytes(16).toString('hex');
   const ext = path.extname(file.originalname);
   const name = path.basename(file.originalname, ext);
   const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 32);
   cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
 }
});

// File filter
const fileFilter = (req, file, cb) => {
 const allowedMimes = {
   csv: ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'],
   avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
   attachment: [
     'application/pdf',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'text/plain',
     'application/zip',
     'application/x-zip-compressed'
   ]
 };

 const fieldMimes = allowedMimes[file.fieldname] || [];
 
 if (fieldMimes.length === 0) {
   return cb(new AppError('Invalid field name', 400), false);
 }

 if (fieldMimes.includes(file.mimetype)) {
   cb(null, true);
 } else {
   cb(new AppError(`Invalid file type. Allowed types: ${fieldMimes.join(', ')}`, 400), false);
 }
};

// Size limits
const limits = {
 csv: 10 * 1024 * 1024, // 10MB
 avatar: 5 * 1024 * 1024, // 5MB
 attachment: 25 * 1024 * 1024, // 25MB
 default: 10 * 1024 * 1024 // 10MB
};

// Create multer upload instances
const createUploader = (fieldName, maxCount = 1) => {
 return multer({
   storage,
   fileFilter,
   limits: {
     fileSize: limits[fieldName] || limits.default
   }
 }).array(fieldName, maxCount);
};

// Upload middlewares
const uploadCSV = (req, res, next) => {
 const upload = createUploader('csv', 1);
 
 upload(req, res, (err) => {
   if (err instanceof multer.MulterError) {
     if (err.code === 'LIMIT_FILE_SIZE') {
       return next(new AppError('CSV file too large. Maximum size is 10MB', 400));
     }
     return next(new AppError(err.message, 400));
   } else if (err) {
     return next(err);
   }
   
   if (!req.files || req.files.length === 0) {
     return next(new AppError('Please upload a CSV file', 400));
   }
   
   next();
 });
};

const uploadAvatar = (req, res, next) => {
 const upload = createUploader('avatar', 1);
 
 upload(req, res, (err) => {
   if (err instanceof multer.MulterError) {
     if (err.code === 'LIMIT_FILE_SIZE') {
       return next(new AppError('Image too large. Maximum size is 5MB', 400));
     }
     return next(new AppError(err.message, 400));
   } else if (err) {
     return next(err);
   }
   
   next();
 });
};

const uploadAttachments = (req, res, next) => {
 const upload = createUploader('attachment', 5);
 
 upload(req, res, (err) => {
   if (err instanceof multer.MulterError) {
     if (err.code === 'LIMIT_FILE_SIZE') {
       return next(new AppError('Attachment too large. Maximum size is 25MB', 400));
     }
     if (err.code === 'LIMIT_FILE_COUNT') {
       return next(new AppError('Too many files. Maximum 5 attachments allowed', 400));
     }
     return next(new AppError(err.message, 400));
   } else if (err) {
     return next(err);
   }
   
   next();
 });
};

// Memory storage for small files
const memoryStorage = multer.memoryStorage();

const uploadToMemory = (fieldName, maxSize = 1024 * 1024) => {
 return multer({
   storage: memoryStorage,
   limits: {
     fileSize: maxSize
   },
   fileFilter
 }).single(fieldName);
};

// Cleanup middleware
const cleanupUploadedFiles = (req, res, next) => {
 const fs = require('fs').promises;
 
 const cleanup = async () => {
   if (req.files && Array.isArray(req.files)) {
     for (const file of req.files) {
       try {
         await fs.unlink(file.path);
       } catch (error) {
         console.error('Error deleting file:', error);
       }
     }
   } else if (req.file) {
     try {
       await fs.unlink(req.file.path);
     } catch (error) {
       console.error('Error deleting file:', error);
     }
   }
 };

 res.on('finish', cleanup);
 res.on('error', cleanup);
 
 next();
};

module.exports = {
 uploadCSV,
 uploadAvatar,
 uploadAttachments,
 uploadToMemory,
 cleanupUploadedFiles,
 storage,
 fileFilter,
 limits
};
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');

const routes = require('./api/routes');
const errorHandler = require('./api/middlewares/errorHandler.middleware');
const { logger } = require('./utils/logger');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
 contentSecurityPolicy: {
   directives: {
     defaultSrc: ["'self'"],
     styleSrc: ["'self'", "'unsafe-inline'"],
     scriptSrc: ["'self'"],
     imgSrc: ["'self'", 'data:', 'https:'],
     connectSrc: ["'self'"],
     fontSrc: ["'self'"],
     objectSrc: ["'none'"],
     mediaSrc: ["'self'"],
     frameSrc: ["'none'"],
   },
 },
 crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
 origin: function (origin, callback) {
   const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
   if (!origin || allowedOrigins.indexOf(origin) !== -1) {
     callback(null, true);
   } else {
     callback(new Error('Not allowed by CORS'));
   }
 },
 credentials: true,
 exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// File upload middleware
app.use(fileUpload({
 limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
 useTempFiles: true,
 tempFileDir: path.join(__dirname, '../temp'),
 abortOnLimit: true,
 responseOnLimit: 'File size limit exceeded',
 uploadTimeout: 60000,
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
 app.use(morgan('dev'));
} else {
 app.use(morgan('combined', {
   stream: { write: message => logger.info(message.trim()) }
 }));
}

// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 100, // limit each IP to 100 requests per windowMs
 message: 'Too many requests from this IP, please try again later.',
 standardHeaders: true,
 legacyHeaders: false,
});

const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 5, // limit each IP to 5 requests per windowMs
 message: 'Too many authentication attempts, please try again later.',
 skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Request timeout
app.use((req, res, next) => {
 res.setTimeout(30000, () => {
   res.status(408).json({ error: 'Request timeout' });
 });
 next();
});

// Health check endpoint
app.get('/health', (req, res) => {
 res.status(200).json({
   status: 'healthy',
   timestamp: new Date().toISOString(),
   uptime: process.uptime(),
   environment: process.env.NODE_ENV,
 });
});

// API routes
app.use('/api', routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
 app.use(express.static(path.join(__dirname, '../../frontend/build')));
 
 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
 });
}

// 404 handler
app.use((req, res, next) => {
 const error = new Error('Resource not found');
 error.statusCode = 404;
 next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const { promisify } = require('util');
const redis = require('../../utils/redis');

const protect = async (req, res, next) => {
 try {
   let token;

   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
     token = req.headers.authorization.split(' ')[1];
   } else if (req.cookies.jwt) {
     token = req.cookies.jwt;
   }

   if (!token) {
     return res.status(401).json({
       status: 'fail',
       message: 'You are not logged in. Please log in to get access.'
     });
   }

   const blacklisted = await redis.get(`blacklist_${token}`);
   if (blacklisted) {
     return res.status(401).json({
       status: 'fail',
       message: 'Token has been invalidated. Please log in again.'
     });
   }

   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

   const currentUser = await User.findById(decoded.id).select('+active');
   if (!currentUser) {
     return res.status(401).json({
       status: 'fail',
       message: 'The user belonging to this token does not exist.'
     });
   }

   if (currentUser.changedPasswordAfter(decoded.iat)) {
     return res.status(401).json({
       status: 'fail',
       message: 'User recently changed password. Please log in again.'
     });
   }

   if (!currentUser.active) {
     return res.status(401).json({
       status: 'fail',
       message: 'Your account has been deactivated. Please contact support.'
     });
   }

   req.user = currentUser;
   res.locals.user = currentUser;
   next();
 } catch (error) {
   if (error.name === 'JsonWebTokenError') {
     return res.status(401).json({
       status: 'fail',
       message: 'Invalid token. Please log in again.'
     });
   } else if (error.name === 'TokenExpiredError') {
     return res.status(401).json({
       status: 'fail',
       message: 'Your token has expired. Please log in again.'
     });
   }
   
   return res.status(500).json({
     status: 'error',
     message: 'Something went wrong during authentication'
   });
 }
};

const restrictTo = (...roles) => {
 return (req, res, next) => {
   if (!roles.includes(req.user.role)) {
     return res.status(403).json({
       status: 'fail',
       message: 'You do not have permission to perform this action'
     });
   }
   next();
 };
};

const checkKarmaLevel = (minKarma) => {
 return async (req, res, next) => {
   if (req.user.karma < minKarma) {
     return res.status(403).json({
       status: 'fail',
       message: `This action requires at least ${minKarma} karma points. You currently have ${req.user.karma} karma.`
     });
   }
   next();
 };
};

const checkEmailVerified = async (req, res, next) => {
 if (!req.user.emailVerified) {
   return res.status(403).json({
     status: 'fail',
     message: 'Please verify your email address to perform this action.'
   });
 }
 next();
};

const optionalAuth = async (req, res, next) => {
 try {
   let token;

   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
     token = req.headers.authorization.split(' ')[1];
   } else if (req.cookies.jwt) {
     token = req.cookies.jwt;
   }

   if (!token) {
     return next();
   }

   const blacklisted = await redis.get(`blacklist_${token}`);
   if (blacklisted) {
     return next();
   }

   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
   const currentUser = await User.findById(decoded.id).select('+active');

   if (currentUser && currentUser.active && !currentUser.changedPasswordAfter(decoded.iat)) {
     req.user = currentUser;
     res.locals.user = currentUser;
   }
 } catch (error) {
   // Continue without authentication
 }
 
 next();
};

const checkRepositoryAccess = async (req, res, next) => {
 try {
   const { repositoryId } = req.params;
   const userId = req.user._id;

   const hasAccess = await req.user.hasRepositoryAccess(repositoryId);
   
   if (!hasAccess) {
     return res.status(403).json({
       status: 'fail',
       message: 'You do not have access to this repository'
     });
   }

   next();
 } catch (error) {
   return res.status(500).json({
     status: 'error',
     message: 'Error checking repository access'
   });
 }
};

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const createAccountLimiter = rateLimit({
 store: new RedisStore({
   client: redis,
   prefix: 'create_account:'
 }),
 windowMs: 60 * 60 * 1000,
 max: 5,
 message: 'Too many accounts created from this IP, please try again after an hour',
 standardHeaders: true,
 legacyHeaders: false,
});

const emailPostLimiter = rateLimit({
 store: new RedisStore({
   client: redis,
   prefix: 'email_post:'
 }),
 windowMs: 60 * 60 * 1000,
 max: 20,
 message: 'Too many posts created via email, please try again after an hour',
 keyGenerator: (req) => req.user ? req.user._id.toString() : req.ip,
 standardHeaders: true,
 legacyHeaders: false,
});

module.exports = {
 protect,
 restrictTo,
 checkKarmaLevel,
 checkEmailVerified,
 optionalAuth,
 checkRepositoryAccess,
 createAccountLimiter,
 emailPostLimiter
};
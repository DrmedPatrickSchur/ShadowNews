const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
 messageId: {
   type: String,
   required: true,
   unique: true,
   index: true
 },
 from: {
   email: {
     type: String,
     required: true,
     lowercase: true,
     trim: true
   },
   name: {
     type: String,
     trim: true
   }
 },
 to: [{
   email: {
     type: String,
     lowercase: true,
     trim: true
   },
   name: {
     type: String,
     trim: true
   }
 }],
 cc: [{
   email: {
     type: String,
     lowercase: true,
     trim: true
   },
   name: {
     type: String,
     trim: true
   }
 }],
 subject: {
   type: String,
   required: true,
   trim: true
 },
 body: {
   text: {
     type: String,
     required: true
   },
   html: {
     type: String
   }
 },
 attachments: [{
   filename: {
     type: String,
     required: true
   },
   contentType: {
     type: String,
     required: true
   },
   size: {
     type: Number,
     required: true
   },
   url: {
     type: String
   },
   checksum: {
     type: String
   }
 }],
 repository: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Repository',
   index: true
 },
 post: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Post'
 },
 user: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User',
   index: true
 },
 hashtags: [{
   type: String,
   lowercase: true,
   trim: true
 }],
 status: {
   type: String,
   enum: ['pending', 'processed', 'posted', 'failed', 'spam'],
   default: 'pending',
   index: true
 },
 processedAt: {
   type: Date
 },
 snowballData: {
   originalRepository: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Repository'
   },
   addedEmails: [{
     email: {
       type: String,
       lowercase: true
     },
     addedAt: {
       type: Date,
       default: Date.now
     },
     verified: {
       type: Boolean,
       default: false
     }
   }],
   generation: {
     type: Number,
     default: 0
   },
   parentEmail: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Email'
   }
 },
 metadata: {
   spfPass: {
     type: Boolean
   },
   dkimPass: {
     type: Boolean
   },
   spamScore: {
     type: Number
   },
   headers: {
     type: Map,
     of: String
   },
   clientIp: {
     type: String
   },
   receivedAt: {
     type: Date,
     default: Date.now
   }
 },
 privacy: {
   isAnonymous: {
     type: Boolean,
     default: false
   },
   encryptedEmails: {
     type: Boolean,
     default: false
   },
   shareWithRepository: {
     type: Boolean,
     default: true
   }
 },
 engagement: {
   opens: {
     type: Number,
     default: 0
   },
   clicks: {
     type: Number,
     default: 0
   },
   forwards: {
     type: Number,
     default: 0
   },
   replies: {
     type: Number,
     default: 0
   },
   lastEngagement: {
     type: Date
   }
 },
 aiAnalysis: {
   suggestedHashtags: [{
     tag: String,
     confidence: Number
   }],
   sentiment: {
     type: String,
     enum: ['positive', 'negative', 'neutral']
   },
   category: {
     type: String
   },
   summary: {
     type: String
   },
   processedAt: {
     type: Date
   }
 },
 flags: {
   isDigest: {
     type: Boolean,
     default: false
   },
   isNewsletter: {
     type: Boolean,
     default: false
   },
   isAutoResponse: {
     type: Boolean,
     default: false
   },
   requiresModeration: {
     type: Boolean,
     default: false
   }
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Indexes
emailSchema.index({ createdAt: -1 });
emailSchema.index({ 'from.email': 1, createdAt: -1 });
emailSchema.index({ hashtags: 1 });
emailSchema.index({ 'snowballData.generation': 1 });
emailSchema.index({ 'metadata.spamScore': 1 });
emailSchema.index({ 'aiAnalysis.category': 1 });

// Virtual for email thread
emailSchema.virtual('thread', {
 ref: 'Email',
 localField: '_id',
 foreignField: 'metadata.headers.In-Reply-To'
});

// Methods
emailSchema.methods.markAsProcessed = function() {
 this.status = 'processed';
 this.processedAt = new Date();
 return this.save();
};

emailSchema.methods.markAsPosted = function(postId) {
 this.status = 'posted';
 this.post = postId;
 return this.save();
};

emailSchema.methods.addSnowballEmails = function(emails) {
 const newEmails = emails.map(email => ({
   email: email.toLowerCase(),
   addedAt: new Date(),
   verified: false
 }));
 
 this.snowballData.addedEmails.push(...newEmails);
 return this.save();
};

emailSchema.methods.incrementEngagement = function(type) {
 if (this.engagement[type] !== undefined) {
   this.engagement[type]++;
   this.engagement.lastEngagement = new Date();
   return this.save();
 }
};

// Statics
emailSchema.statics.findUnprocessed = function(limit = 10) {
 return this.find({ status: 'pending' })
   .sort({ createdAt: 1 })
   .limit(limit)
   .populate('user repository');
};

emailSchema.statics.findByRepository = function(repositoryId, options = {}) {
 const { page = 1, limit = 20, status } = options;
 const query = { repository: repositoryId };
 
 if (status) {
   query.status = status;
 }
 
 return this.find(query)
   .sort({ createdAt: -1 })
   .limit(limit * 1)
   .skip((page - 1) * limit)
   .populate('user post');
};

emailSchema.statics.getSnowballChain = function(emailId) {
 return this.find({
   $or: [
     { _id: emailId },
     { 'snowballData.parentEmail': emailId }
   ]
 }).sort({ 'snowballData.generation': 1 });
};

emailSchema.statics.getDigestCandidates = function(userId, since) {
 return this.find({
   user: userId,
   createdAt: { $gte: since },
   status: 'posted',
   'flags.isDigest': false
 })
 .populate('post repository')
 .sort({ 'engagement.opens': -1, createdAt: -1 });
};

// Middleware
emailSchema.pre('save', function(next) {
 // Extract hashtags from subject and body
 if (this.isModified('subject') || this.isModified('body.text')) {
   const text = `${this.subject} ${this.body.text}`;
   const hashtagRegex = /#[a-zA-Z0-9_]+/g;
   const hashtags = text.match(hashtagRegex) || [];
   this.hashtags = [...new Set(hashtags.map(tag => tag.slice(1).toLowerCase()))];
 }
 
 next();
});

emailSchema.pre('save', function(next) {
 // Auto-detect spam based on spam score
 if (this.metadata.spamScore && this.metadata.spamScore > 5) {
   this.status = 'spam';
   this.flags.requiresModeration = true;
 }
 
 next();
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
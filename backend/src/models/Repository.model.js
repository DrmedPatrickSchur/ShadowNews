const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
 name: {
   type: String,
   required: true,
   trim: true,
   minlength: 3,
   maxlength: 100,
   index: true
 },
 slug: {
   type: String,
   required: true,
   unique: true,
   lowercase: true,
   index: true
 },
 description: {
   type: String,
   required: true,
   maxlength: 500
 },
 owner: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User',
   required: true,
   index: true
 },
 hashtags: [{
   type: String,
   lowercase: true,
   trim: true
 }],
 emails: [{
   email: {
     type: String,
     required: true,
     lowercase: true,
     trim: true
   },
   name: {
     type: String,
     trim: true
   },
   addedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   addedAt: {
     type: Date,
     default: Date.now
   },
   source: {
     type: String,
     enum: ['manual', 'csv', 'snowball', 'api'],
     default: 'manual'
   },
   verified: {
     type: Boolean,
     default: false
   },
   optedOut: {
     type: Boolean,
     default: false
   },
   metadata: {
     company: String,
     title: String,
     tags: [String]
   }
 }],
 settings: {
   isPublic: {
     type: Boolean,
     default: true
   },
   allowSnowball: {
     type: Boolean,
     default: true
   },
   autoApprove: {
     type: Boolean,
     default: false
   },
   minKarmaToJoin: {
     type: Number,
     default: 0
   },
   digestFrequency: {
     type: String,
     enum: ['daily', 'weekly', 'biweekly', 'monthly', 'never'],
     default: 'weekly'
   },
   nextDigestDate: {
     type: Date
   },
   emailTemplate: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'EmailTemplate'
   }
 },
 collaborators: [{
   user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   role: {
     type: String,
     enum: ['admin', 'moderator', 'contributor'],
     default: 'contributor'
   },
   addedAt: {
     type: Date,
     default: Date.now
   }
 }],
 stats: {
   totalEmails: {
     type: Number,
     default: 0
   },
   verifiedEmails: {
     type: Number,
     default: 0
   },
   activeEmails: {
     type: Number,
     default: 0
   },
   snowballEmails: {
     type: Number,
     default: 0
   },
   lastSnowballAt: Date,
   digestsSent: {
     type: Number,
     default: 0
   },
   avgOpenRate: {
     type: Number,
     default: 0
   },
   avgClickRate: {
     type: Number,
     default: 0
   }
 },
 linkedRepositories: [{
   repository: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Repository'
   },
   sharedEmails: {
     type: Number,
     default: 0
   },
   linkType: {
     type: String,
     enum: ['partner', 'related', 'merged'],
     default: 'related'
   }
 }],
 csvImports: [{
   filename: String,
   importedAt: {
     type: Date,
     default: Date.now
   },
   importedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   emailsAdded: Number,
   status: {
     type: String,
     enum: ['pending', 'processing', 'completed', 'failed'],
     default: 'pending'
   }
 }],
 snowballHistory: [{
   triggeredBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   sourceEmail: String,
   emailsAdded: Number,
   timestamp: {
     type: Date,
     default: Date.now
   }
 }],
 qualityScore: {
   type: Number,
   default: 0,
   min: 0,
   max: 100
 },
 tags: [{
   type: String,
   lowercase: true,
   trim: true
 }],
 category: {
   type: String,
   enum: ['technology', 'business', 'science', 'health', 'finance', 'education', 'other'],
   default: 'other',
   index: true
 },
 isActive: {
   type: Boolean,
   default: true
 },
 isPremium: {
   type: Boolean,
   default: false
 },
 deletedAt: {
   type: Date,
   default: null
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Indexes
repositorySchema.index({ owner: 1, isActive: 1 });
repositorySchema.index({ hashtags: 1 });
repositorySchema.index({ 'emails.email': 1 });
repositorySchema.index({ category: 1, qualityScore: -1 });
repositorySchema.index({ createdAt: -1 });

// Virtual for email count
repositorySchema.virtual('emailCount').get(function() {
 return this.emails.filter(e => !e.optedOut).length;
});

// Pre-save middleware
repositorySchema.pre('save', async function(next) {
 if (this.isModified('name') && !this.slug) {
   this.slug = this.name
     .toLowerCase()
     .replace(/[^\w\s-]/g, '')
     .replace(/\s+/g, '-')
     .replace(/-+/g, '-')
     .trim();
   
   // Ensure unique slug
   const baseSlug = this.slug;
   let counter = 1;
   while (await mongoose.models.Repository.findOne({ slug: this.slug, _id: { $ne: this._id } })) {
     this.slug = `${baseSlug}-${counter}`;
     counter++;
   }
 }
 
 // Update stats
 if (this.isModified('emails')) {
   this.stats.totalEmails = this.emails.length;
   this.stats.verifiedEmails = this.emails.filter(e => e.verified).length;
   this.stats.activeEmails = this.emails.filter(e => !e.optedOut && e.verified).length;
   this.stats.snowballEmails = this.emails.filter(e => e.source === 'snowball').length;
 }
 
 next();
});

// Methods
repositorySchema.methods.addEmail = async function(emailData, userId) {
 const existingEmail = this.emails.find(e => e.email === emailData.email.toLowerCase());
 
 if (existingEmail) {
   if (existingEmail.optedOut) {
     throw new Error('This email has opted out of this repository');
   }
   return existingEmail;
 }
 
 this.emails.push({
   ...emailData,
   email: emailData.email.toLowerCase(),
   addedBy: userId,
   addedAt: new Date()
 });
 
 await this.save();
 return this.emails[this.emails.length - 1];
};

repositorySchema.methods.removeEmail = async function(email) {
 const emailIndex = this.emails.findIndex(e => e.email === email.toLowerCase());
 
 if (emailIndex === -1) {
   throw new Error('Email not found in repository');
 }
 
 this.emails[emailIndex].optedOut = true;
 await this.save();
};

repositorySchema.methods.canUserAccess = function(userId) {
 if (this.settings.isPublic) return true;
 if (this.owner.equals(userId)) return true;
 return this.collaborators.some(c => c.user.equals(userId));
};

repositorySchema.methods.canUserEdit = function(userId) {
 if (this.owner.equals(userId)) return true;
 const collaborator = this.collaborators.find(c => c.user.equals(userId));
 return collaborator && ['admin', 'moderator'].includes(collaborator.role);
};

repositorySchema.methods.calculateQualityScore = function() {
 let score = 0;
 
 // Factors for quality score
 if (this.stats.verifiedEmails > 100) score += 20;
 else if (this.stats.verifiedEmails > 50) score += 10;
 else if (this.stats.verifiedEmails > 10) score += 5;
 
 if (this.stats.avgOpenRate > 0.3) score += 20;
 else if (this.stats.avgOpenRate > 0.2) score += 10;
 else if (this.stats.avgOpenRate > 0.1) score += 5;
 
 if (this.stats.avgClickRate > 0.1) score += 20;
 else if (this.stats.avgClickRate > 0.05) score += 10;
 else if (this.stats.avgClickRate > 0.02) score += 5;
 
 if (this.description.length > 100) score += 10;
 if (this.hashtags.length >= 3) score += 10;
 if (this.collaborators.length > 0) score += 10;
 if (this.stats.snowballEmails > 50) score += 10;
 
 this.qualityScore = Math.min(score, 100);
 return this.qualityScore;
};

// Statics
repositorySchema.statics.findByHashtag = function(hashtag) {
 return this.find({ 
   hashtags: hashtag.toLowerCase(),
   isActive: true,
   deletedAt: null
 }).populate('owner', 'username karma');
};

repositorySchema.statics.findPublicRepositories = function(options = {}) {
 const { 
   limit = 20, 
   skip = 0, 
   category, 
   sortBy = 'qualityScore' 
 } = options;
 
 const query = {
   'settings.isPublic': true,
   isActive: true,
   deletedAt: null
 };
 
 if (category) query.category = category;
 
 return this.find(query)
   .sort({ [sortBy]: -1 })
   .limit(limit)
   .skip(skip)
   .populate('owner', 'username karma avatar');
};

repositorySchema.statics.searchRepositories = function(searchTerm, options = {}) {
 const { limit = 20, skip = 0 } = options;
 
 return this.find({
   $or: [
     { name: new RegExp(searchTerm, 'i') },
     { description: new RegExp(searchTerm, 'i') },
     { hashtags: new RegExp(searchTerm, 'i') },
     { tags: new RegExp(searchTerm, 'i') }
   ],
   isActive: true,
   deletedAt: null
 })
 .sort({ qualityScore: -1 })
 .limit(limit)
 .skip(skip)
 .populate('owner', 'username karma');
};

const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;
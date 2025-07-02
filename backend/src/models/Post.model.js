const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
 title: {
   type: String,
   required: true,
   trim: true,
   maxLength: 300
 },
 url: {
   type: String,
   trim: true,
   validate: {
     validator: function(v) {
       if (!v) return true;
       return /^https?:\/\/.+\..+/.test(v);
     },
     message: 'Invalid URL format'
   }
 },
 text: {
   type: String,
   maxLength: 10000
 },
 author: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User',
   required: true
 },
 email: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Email'
 },
 hashtags: [{
   type: String,
   lowercase: true,
   trim: true
 }],
 score: {
   type: Number,
   default: 0,
   index: true
 },
 upvotes: [{
   user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   timestamp: {
     type: Date,
     default: Date.now
   }
 }],
 downvotes: [{
   user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   timestamp: {
     type: Date,
     default: Date.now
   }
 }],
 commentCount: {
   type: Number,
   default: 0
 },
 repositories: [{
   repository: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Repository'
   },
   addedAt: {
     type: Date,
     default: Date.now
   }
 }],
 visibility: {
   type: String,
   enum: ['public', 'repository', 'private'],
   default: 'public'
 },
 status: {
   type: String,
   enum: ['active', 'deleted', 'flagged', 'hidden'],
   default: 'active'
 },
 flags: [{
   user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   reason: String,
   timestamp: {
     type: Date,
     default: Date.now
   }
 }],
 aiMetadata: {
   suggestedHashtags: [String],
   summary: String,
   sentiment: {
     type: Number,
     min: -1,
     max: 1
   },
   topicScores: {
     type: Map,
     of: Number
   }
 },
 metrics: {
   views: {
     type: Number,
     default: 0
   },
   shares: {
     type: Number,
     default: 0
   },
   emailReach: {
     type: Number,
     default: 0
   },
   clickRate: {
     type: Number,
     default: 0
   },
   engagementScore: {
     type: Number,
     default: 0
   }
 },
 ranking: {
   hot: {
     type: Number,
     default: 0,
     index: true
   },
   controversy: {
     type: Number,
     default: 0
   },
   quality: {
     type: Number,
     default: 0
   }
 },
 editHistory: [{
   timestamp: {
     type: Date,
     default: Date.now
   },
   changes: {
     title: String,
     text: String,
     url: String,
     hashtags: [String]
   },
   editor: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   }
 }],
 scheduledFor: Date,
 expiresAt: Date
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

PostSchema.virtual('voteCount').get(function() {
 return this.upvotes.length - this.downvotes.length;
});

PostSchema.virtual('isHot').get(function() {
 const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
 return this.ranking.hot > 100 && hoursSinceCreation < 24;
});

PostSchema.index({ createdAt: -1 });
PostSchema.index({ 'ranking.hot': -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ status: 1, visibility: 1 });
PostSchema.index({ '$**': 'text' });

PostSchema.pre('save', function(next) {
 if (this.isModified('upvotes') || this.isModified('downvotes')) {
   this.score = this.upvotes.length - this.downvotes.length;
 }
 
 if (this.isModified('upvotes') || this.isModified('downvotes') || this.isModified('commentCount')) {
   const order = Math.log10(Math.max(Math.abs(this.score), 1));
   const sign = this.score > 0 ? 1 : this.score < 0 ? -1 : 0;
   const seconds = (this.createdAt - new Date(2025, 0, 1)) / 1000;
   this.ranking.hot = sign * order + seconds / 45000;
 }
 
 next();
});

PostSchema.methods.calculateEngagement = function() {
 const totalInteractions = this.metrics.views + this.metrics.shares + this.commentCount + this.voteCount;
 this.metrics.engagementScore = totalInteractions > 0 
   ? (this.metrics.shares + this.commentCount + this.voteCount) / this.metrics.views 
   : 0;
 return this.metrics.engagementScore;
};

PostSchema.methods.addToRepository = async function(repositoryId) {
 if (!this.repositories.some(r => r.repository.equals(repositoryId))) {
   this.repositories.push({ repository: repositoryId });
   await this.save();
 }
};

PostSchema.methods.hasUserVoted = function(userId) {
 return {
   upvoted: this.upvotes.some(v => v.user.equals(userId)),
   downvoted: this.downvotes.some(v => v.user.equals(userId))
 };
};

PostSchema.statics.findTrending = function(timeframe = 24) {
 const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
 return this.find({
   status: 'active',
   visibility: 'public',
   createdAt: { $gte: since }
 })
 .sort({ 'ranking.hot': -1 })
 .limit(50);
};

PostSchema.statics.findByHashtags = function(hashtags, options = {}) {
 return this.find({
   status: 'active',
   hashtags: { $in: hashtags },
   ...options
 }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Post', PostSchema);
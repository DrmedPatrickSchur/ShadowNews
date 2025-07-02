const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
 author: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User',
   required: true
 },
 post: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Post',
   required: true
 },
 parent: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Comment',
   default: null
 },
 content: {
   type: String,
   required: true,
   trim: true,
   minlength: 1,
   maxlength: 10000
 },
 contentHtml: {
   type: String
 },
 mentions: [{
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User'
 }],
 hashtags: [{
   type: String,
   lowercase: true,
   trim: true
 }],
 upvoters: [{
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User'
 }],
 downvoters: [{
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User'
 }],
 score: {
   type: Number,
   default: 0,
   index: true
 },
 depth: {
   type: Number,
   default: 0
 },
 childrenCount: {
   type: Number,
   default: 0
 },
 isDeleted: {
   type: Boolean,
   default: false
 },
 deletedAt: {
   type: Date
 },
 deletedBy: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User'
 },
 editHistory: [{
   content: String,
   editedAt: {
     type: Date,
     default: Date.now
   },
   editedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   }
 }],
 flags: [{
   flaggedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   reason: {
     type: String,
     enum: ['spam', 'offensive', 'off-topic', 'misleading', 'other']
   },
   flaggedAt: {
     type: Date,
     default: Date.now
   }
 }],
 metadata: {
   userAgent: String,
   ipAddress: String,
   source: {
     type: String,
     enum: ['web', 'email', 'api', 'mobile'],
     default: 'web'
   }
 }
}, {
 timestamps: true,
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ score: -1, createdAt: -1 });
commentSchema.index({ hashtags: 1 });
commentSchema.index({ isDeleted: 1 });

// Virtual for vote count
commentSchema.virtual('voteCount').get(function() {
 return this.upvoters.length - this.downvoters.length;
});

// Virtual for children comments
commentSchema.virtual('children', {
 ref: 'Comment',
 localField: '_id',
 foreignField: 'parent'
});

// Pre-save middleware to calculate depth
commentSchema.pre('save', async function(next) {
 if (this.parent) {
   const parentComment = await this.constructor.findById(this.parent);
   if (parentComment) {
     this.depth = parentComment.depth + 1;
   }
 }
 next();
});

// Method to upvote
commentSchema.methods.upvote = async function(userId) {
 const userIdStr = userId.toString();
 
 // Remove from downvoters if exists
 this.downvoters = this.downvoters.filter(id => id.toString() !== userIdStr);
 
 // Add to upvoters if not already there
 if (!this.upvoters.some(id => id.toString() === userIdStr)) {
   this.upvoters.push(userId);
 }
 
 this.score = this.upvoters.length - this.downvoters.length;
 return this.save();
};

// Method to downvote
commentSchema.methods.downvote = async function(userId) {
 const userIdStr = userId.toString();
 
 // Remove from upvoters if exists
 this.upvoters = this.upvoters.filter(id => id.toString() !== userIdStr);
 
 // Add to downvoters if not already there
 if (!this.downvoters.some(id => id.toString() === userIdStr)) {
   this.downvoters.push(userId);
 }
 
 this.score = this.upvoters.length - this.downvoters.length;
 return this.save();
};

// Method to remove vote
commentSchema.methods.removeVote = async function(userId) {
 const userIdStr = userId.toString();
 
 this.upvoters = this.upvoters.filter(id => id.toString() !== userIdStr);
 this.downvoters = this.downvoters.filter(id => id.toString() !== userIdStr);
 
 this.score = this.upvoters.length - this.downvoters.length;
 return this.save();
};

// Method to soft delete
commentSchema.methods.softDelete = async function(userId) {
 this.isDeleted = true;
 this.deletedAt = new Date();
 this.deletedBy = userId;
 this.content = '[deleted]';
 this.contentHtml = '<p>[deleted]</p>';
 return this.save();
};

// Method to edit comment
commentSchema.methods.edit = async function(newContent, userId) {
 this.editHistory.push({
   content: this.content,
   editedBy: userId
 });
 this.content = newContent;
 return this.save();
};

// Method to flag comment
commentSchema.methods.flag = async function(userId, reason) {
 const existingFlag = this.flags.find(f => f.flaggedBy.toString() === userId.toString());
 if (!existingFlag) {
   this.flags.push({
     flaggedBy: userId,
     reason: reason
   });
   return this.save();
 }
 return this;
};

// Static method to get comment thread
commentSchema.statics.getThread = async function(commentId, userId = null) {
 const comment = await this.findById(commentId)
   .populate('author', 'username karma avatar')
   .populate('mentions', 'username');
   
 if (!comment) return null;
 
 const children = await this.find({ parent: commentId, isDeleted: false })
   .populate('author', 'username karma avatar')
   .populate('mentions', 'username')
   .sort({ score: -1, createdAt: -1 });
   
 return {
   ...comment.toObject(),
   children: children,
   hasVoted: userId ? {
     up: comment.upvoters.some(id => id.toString() === userId.toString()),
     down: comment.downvoters.some(id => id.toString() === userId.toString())
   } : null
 };
};

// Static method to update children count
commentSchema.statics.updateChildrenCount = async function(parentId) {
 if (!parentId) return;
 
 const count = await this.countDocuments({ parent: parentId, isDeleted: false });
 await this.findByIdAndUpdate(parentId, { childrenCount: count });
};

// Post-save middleware to update parent's children count
commentSchema.post('save', async function() {
 if (this.parent) {
   await this.constructor.updateChildrenCount(this.parent);
 }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
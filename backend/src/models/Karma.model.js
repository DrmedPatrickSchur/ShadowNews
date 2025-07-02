const mongoose = require('mongoose');

const karmaTransactionSchema = new mongoose.Schema({
 amount: {
   type: Number,
   required: true
 },
 type: {
   type: String,
   enum: ['post_upvote', 'post_downvote', 'comment_upvote', 'comment_downvote', 
          'post_created', 'comment_created', 'repository_created', 'csv_uploaded',
          'email_verified', 'curator_bonus', 'daily_login', 'milestone_bonus'],
   required: true
 },
 source: {
   type: String,
   enum: ['post', 'comment', 'repository', 'system', 'moderation'],
   required: true
 },
 relatedId: {
   type: mongoose.Schema.Types.ObjectId,
   refPath: 'relatedModel'
 },
 relatedModel: {
   type: String,
   enum: ['Post', 'Comment', 'Repository', 'User']
 },
 description: String,
 timestamp: {
   type: Date,
   default: Date.now
 }
});

const karmaMilestoneSchema = new mongoose.Schema({
 milestone: {
   type: Number,
   required: true
 },
 achievedAt: {
   type: Date,
   default: Date.now
 },
 rewards: {
   customEmailSignature: {
     type: Boolean,
     default: false
   },
   repositoryCreationRights: {
     type: Boolean,
     default: false
   },
   weightedVotingPower: {
     type: Number,
     default: 1
   },
   governanceParticipation: {
     type: Boolean,
     default: false
   }
 }
});

const karmaSchema = new mongoose.Schema({
 userId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User',
   required: true,
   unique: true
 },
 total: {
   type: Number,
   default: 0,
   index: true
 },
 breakdown: {
   posts: {
     type: Number,
     default: 0
   },
   comments: {
     type: Number,
     default: 0
   },
   repositories: {
     type: Number,
     default: 0
   },
   curation: {
     type: Number,
     default: 0
   },
   community: {
     type: Number,
     default: 0
   }
 },
 multipliers: {
   qualityContent: {
     type: Number,
     default: 1.0,
     min: 1.0,
     max: 2.0
   },
   consistency: {
     type: Number,
     default: 1.0,
     min: 1.0,
     max: 1.5
   },
   expertise: {
     type: Number,
     default: 1.0,
     min: 1.0,
     max: 2.0
   }
 },
 streaks: {
   dailyLogin: {
     current: {
       type: Number,
       default: 0
     },
     longest: {
       type: Number,
       default: 0
     },
     lastLogin: Date
   },
   weeklyContribution: {
     current: {
       type: Number,
       default: 0
     },
     longest: {
       type: Number,
       default: 0
     },
     lastContribution: Date
   }
 },
 achievements: [{
   type: {
     type: String,
     enum: ['first_post', 'first_comment', 'first_upvote', 'first_repository',
            'trending_post', 'helpful_curator', 'community_builder', 'thought_leader',
            'snowball_master', 'email_evangelist']
   },
   unlockedAt: {
     type: Date,
     default: Date.now
   },
   metadata: mongoose.Schema.Types.Mixed
 }],
 milestones: [karmaMilestoneSchema],
 transactions: [karmaTransactionSchema],
 monthlyStats: [{
   month: {
     type: Date,
     required: true
   },
   earned: {
     type: Number,
     default: 0
   },
   spent: {
     type: Number,
     default: 0
   },
   rank: Number
 }],
 settings: {
   publicDisplay: {
     type: Boolean,
     default: true
   },
   showBreakdown: {
     type: Boolean,
     default: true
   },
   emailNotifications: {
     milestones: {
       type: Boolean,
       default: true
     },
     weeklyReport: {
       type: Boolean,
       default: false
     }
   }
 },
 flags: {
   isCurator: {
     type: Boolean,
     default: false
   },
   isAmbassador: {
     type: Boolean,
     default: false
   },
   isModerator: {
     type: Boolean,
     default: false
   }
 }
}, {
 timestamps: true
});

karmaSchema.index({ userId: 1, 'transactions.timestamp': -1 });
karmaSchema.index({ total: -1 });
karmaSchema.index({ 'monthlyStats.month': -1 });

karmaSchema.statics.KARMA_VALUES = {
 POST_CREATED: 50,
 POST_UPVOTE_RECEIVED: 10,
 POST_DOWNVOTE_RECEIVED: -5,
 COMMENT_CREATED: 20,
 COMMENT_UPVOTE_RECEIVED: 5,
 COMMENT_DOWNVOTE_RECEIVED: -2,
 REPOSITORY_CREATED: 100,
 CSV_UPLOADED: 100,
 EMAIL_VERIFIED: 50,
 GIVE_UPVOTE: 1,
 CURATOR_BONUS: 25,
 DAILY_LOGIN: 5,
 WEEKLY_STREAK: 50,
 MILESTONE_100: 10,
 MILESTONE_500: 50,
 MILESTONE_1000: 100,
 MILESTONE_5000: 500
};

karmaSchema.statics.MILESTONES = {
 100: { customEmailSignature: true },
 500: { repositoryCreationRights: true },
 1000: { weightedVotingPower: 2 },
 2500: { weightedVotingPower: 3 },
 5000: { governanceParticipation: true, weightedVotingPower: 5 }
};

karmaSchema.methods.addTransaction = async function(type, amount, source, relatedId = null, relatedModel = null, description = null) {
 this.transactions.push({
   type,
   amount,
   source,
   relatedId,
   relatedModel,
   description
 });
 
 this.total += amount;
 
 switch(source) {
   case 'post':
     this.breakdown.posts += amount;
     break;
   case 'comment':
     this.breakdown.comments += amount;
     break;
   case 'repository':
     this.breakdown.repositories += amount;
     break;
   case 'moderation':
     this.breakdown.curation += amount;
     break;
   case 'system':
     this.breakdown.community += amount;
     break;
 }
 
 await this.checkMilestones();
 return this.save();
};

karmaSchema.methods.checkMilestones = async function() {
 const milestoneValues = Object.keys(this.constructor.MILESTONES).map(Number).sort((a, b) => a - b);
 
 for (const milestone of milestoneValues) {
   const existingMilestone = this.milestones.find(m => m.milestone === milestone);
   
   if (!existingMilestone && this.total >= milestone) {
     this.milestones.push({
       milestone,
       rewards: this.constructor.MILESTONES[milestone]
     });
     
     await this.addTransaction(
       'milestone_bonus',
       this.constructor.KARMA_VALUES[`MILESTONE_${milestone}`] || 0,
       'system',
       null,
       null,
       `Reached ${milestone} karma milestone`
     );
   }
 }
};

karmaSchema.methods.updateStreak = async function(type) {
 const now = new Date();
 const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 
 if (type === 'login') {
   const lastLogin = this.streaks.dailyLogin.lastLogin;
   const yesterday = new Date(today);
   yesterday.setDate(yesterday.getDate() - 1);
   
   if (!lastLogin || lastLogin < yesterday) {
     this.streaks.dailyLogin.current = 1;
   } else if (lastLogin >= yesterday && lastLogin < today) {
     this.streaks.dailyLogin.current += 1;
     if (this.streaks.dailyLogin.current > this.streaks.dailyLogin.longest) {
       this.streaks.dailyLogin.longest = this.streaks.dailyLogin.current;
     }
   }
   
   this.streaks.dailyLogin.lastLogin = now;
 }
 
 return this.save();
};

karmaSchema.methods.getVotingPower = function() {
 const milestone = this.milestones
   .filter(m => m.rewards.weightedVotingPower)
   .sort((a, b) => b.milestone - a.milestone)[0];
 
 return milestone ? milestone.rewards.weightedVotingPower : 1;
};

karmaSchema.methods.canCreateRepository = function() {
 return this.milestones.some(m => m.rewards.repositoryCreationRights);
};

karmaSchema.methods.getMonthlyRank = async function() {
 const now = new Date();
 const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 
 const rank = await this.constructor.countDocuments({
   'monthlyStats.month': startOfMonth,
   'monthlyStats.earned': { $gt: this.monthlyStats.find(s => s.month.getTime() === startOfMonth.getTime())?.earned || 0 }
 }) + 1;
 
 return rank;
};

const Karma = mongoose.model('Karma', karmaSchema);

module.exports = Karma;
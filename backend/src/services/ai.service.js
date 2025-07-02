const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');
const Repository = require('../models/Repository.model');
const Karma = require('../models/Karma.model');
const redis = require('../utils/redis');
const logger = require('../utils/logger');

class KarmaService {
 constructor() {
   this.KARMA_ACTIONS = {
     POST_CREATED: 50,
     POST_UPVOTED: 10,
     POST_DOWNVOTED: -2,
     COMMENT_CREATED: 20,
     COMMENT_UPVOTED: 5,
     COMMENT_DOWNVOTED: -1,
     REPOSITORY_CREATED: 100,
     CSV_UPLOADED: 100,
     EMAIL_VERIFIED: 30,
     CURATED_POST_UPVOTED: 25,
     SPAM_FLAGGED: -50,
     POST_REMOVED: -100,
     DAILY_LOGIN: 5,
     WEEKLY_STREAK: 50,
     FIRST_POST: 100,
     MILESTONE_100: 20,
     MILESTONE_500: 50,
     MILESTONE_1000: 100,
     MILESTONE_5000: 500
   };

   this.KARMA_MULTIPLIERS = {
     GOLDEN_CURATOR: 5,
     VERIFIED_EXPERT: 3,
     ACTIVE_CONTRIBUTOR: 2,
     NEW_USER: 1
   };

   this.KARMA_MILESTONES = [
     { threshold: 100, reward: 'custom_email_signature', name: 'Rising Star' },
     { threshold: 500, reward: 'repository_creation', name: 'Community Builder' },
     { threshold: 1000, reward: 'weighted_voting', name: 'Trusted Member' },
     { threshold: 5000, reward: 'platform_governance', name: 'Community Leader' },
     { threshold: 10000, reward: 'golden_curator', name: 'Golden Curator' }
   ];
 }

 async updateKarma(userId, action, metadata = {}) {
   try {
     const session = await Karma.startSession();
     session.startTransaction();

     const user = await User.findById(userId).session(session);
     if (!user) {
       throw new Error('User not found');
     }

     const basePoints = this.KARMA_ACTIONS[action] || 0;
     const multiplier = await this.getKarmaMultiplier(userId);
     const points = Math.round(basePoints * multiplier);

     const karmaEntry = new Karma({
       userId,
       action,
       points,
       metadata,
       multiplier
     });

     await karmaEntry.save({ session });

     const previousKarma = user.karma || 0;
     user.karma = (user.karma || 0) + points;
     user.karmaHistory = user.karmaHistory || [];
     user.karmaHistory.push({
       action,
       points,
       timestamp: new Date(),
       balance: user.karma
     });

     await user.save({ session });

     await this.checkMilestones(userId, previousKarma, user.karma, session);

     await this.updateKarmaCache(userId, user.karma);

     await session.commitTransaction();
     session.endSession();

     logger.info(`Karma updated for user ${userId}: ${action} (${points} points)`);

     return {
       success: true,
       previousKarma,
       newKarma: user.karma,
       pointsAwarded: points,
       action
     };
   } catch (error) {
     logger.error('Error updating karma:', error);
     throw error;
   }
 }

 async getKarmaMultiplier(userId) {
   try {
     const user = await User.findById(userId).select('role badges karmaMultiplier');
     
     if (user.badges && user.badges.includes('golden_curator')) {
       return this.KARMA_MULTIPLIERS.GOLDEN_CURATOR;
     }
     
     if (user.badges && user.badges.includes('verified_expert')) {
       return this.KARMA_MULTIPLIERS.VERIFIED_EXPERT;
     }
     
     if (user.karma > 500) {
       return this.KARMA_MULTIPLIERS.ACTIVE_CONTRIBUTOR;
     }
     
     return this.KARMA_MULTIPLIERS.NEW_USER;
   } catch (error) {
     logger.error('Error getting karma multiplier:', error);
     return this.KARMA_MULTIPLIERS.NEW_USER;
   }
 }

 async checkMilestones(userId, previousKarma, newKarma, session) {
   try {
     const user = await User.findById(userId).session(session);
     const achievedMilestones = user.achievedMilestones || [];

     for (const milestone of this.KARMA_MILESTONES) {
       if (previousKarma < milestone.threshold && newKarma >= milestone.threshold) {
         if (!achievedMilestones.find(m => m.threshold === milestone.threshold)) {
           achievedMilestones.push({
             ...milestone,
             achievedAt: new Date()
           });

           await this.grantMilestoneReward(userId, milestone, session);

           await this.updateKarma(userId, `MILESTONE_${milestone.threshold}`, {
             milestone: milestone.name
           });
         }
       }
     }

     user.achievedMilestones = achievedMilestones;
     await user.save({ session });
   } catch (error) {
     logger.error('Error checking milestones:', error);
   }
 }

 async grantMilestoneReward(userId, milestone, session) {
   try {
     const user = await User.findById(userId).session(session);

     switch (milestone.reward) {
       case 'custom_email_signature':
         user.features = user.features || {};
         user.features.customEmailSignature = true;
         break;

       case 'repository_creation':
         user.features = user.features || {};
         user.features.canCreateRepository = true;
         user.maxRepositories = 5;
         break;

       case 'weighted_voting':
         user.features = user.features || {};
         user.features.weightedVoting = true;
         user.voteWeight = 2;
         break;

       case 'platform_governance':
         user.features = user.features || {};
         user.features.platformGovernance = true;
         user.voteWeight = 5;
         break;

       case 'golden_curator':
         user.badges = user.badges || [];
         user.badges.push('golden_curator');
         user.voteWeight = 10;
         break;
     }

     await user.save({ session });
     logger.info(`Milestone reward granted to user ${userId}: ${milestone.reward}`);
   } catch (error) {
     logger.error('Error granting milestone reward:', error);
   }
 }

 async calculateUserKarmaBreakdown(userId) {
   try {
     const breakdown = await Karma.aggregate([
       { $match: { userId: userId } },
       {
         $group: {
           _id: '$action',
           count: { $sum: 1 },
           totalPoints: { $sum: '$points' }
         }
       },
       { $sort: { totalPoints: -1 } }
     ]);

     const user = await User.findById(userId).select('karma achievedMilestones');
     
     return {
       totalKarma: user.karma || 0,
       breakdown,
       achievedMilestones: user.achievedMilestones || [],
       nextMilestone: this.getNextMilestone(user.karma || 0)
     };
   } catch (error) {
     logger.error('Error calculating karma breakdown:', error);
     throw error;
   }
 }

 getNextMilestone(currentKarma) {
   for (const milestone of this.KARMA_MILESTONES) {
     if (currentKarma < milestone.threshold) {
       return {
         ...milestone,
         pointsNeeded: milestone.threshold - currentKarma,
         progress: (currentKarma / milestone.threshold) * 100
       };
     }
   }
   return null;
 }

 async getKarmaLeaderboard(timeframe = 'all', limit = 100) {
   try {
     const cacheKey = `karma:leaderboard:${timeframe}:${limit}`;
     const cached = await redis.get(cacheKey);
     
     if (cached) {
       return JSON.parse(cached);
     }

     let dateFilter = {};
     const now = new Date();

     switch (timeframe) {
       case 'daily':
         dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
         break;
       case 'weekly':
         dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
         break;
       case 'monthly':
         dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
         break;
     }

     const leaderboard = await Karma.aggregate([
       { $match: dateFilter },
       {
         $group: {
           _id: '$userId',
           karmaGained: { $sum: '$points' }
         }
       },
       { $sort: { karmaGained: -1 } },
       { $limit: limit },
       {
         $lookup: {
           from: 'users',
           localField: '_id',
           foreignField: '_id',
           as: 'user'
         }
       },
       { $unwind: '$user' },
       {
         $project: {
           userId: '$_id',
           username: '$user.username',
           avatar: '$user.avatar',
           totalKarma: '$user.karma',
           karmaGained: 1,
           badges: '$user.badges'
         }
       }
     ]);

     await redis.setex(cacheKey, 300, JSON.stringify(leaderboard));
     
     return leaderboard;
   } catch (error) {
     logger.error('Error getting karma leaderboard:', error);
     throw error;
   }
 }

 async updateKarmaCache(userId, karma) {
   try {
     await redis.setex(`user:karma:${userId}`, 3600, karma);
   } catch (error) {
     logger.error('Error updating karma cache:', error);
   }
 }

 async getKarmaHistory(userId, days = 30) {
   try {
     const startDate = new Date();
     startDate.setDate(startDate.getDate() - days);

     const history = await Karma.find({
       userId,
       createdAt: { $gte: startDate }
     })
       .sort({ createdAt: -1 })
       .limit(100);

     const dailyKarma = await Karma.aggregate([
       {
         $match: {
           userId,
           createdAt: { $gte: startDate }
         }
       },
       {
         $group: {
           _id: {
             $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
           },
           dailyPoints: { $sum: '$points' }
         }
       },
       { $sort: { _id: 1 } }
     ]);

     return {
       recentActivity: history,
       dailyProgress: dailyKarma
     };
   } catch (error) {
     logger.error('Error getting karma history:', error);
     throw error;
   }
 }

 async checkDailyLoginBonus(userId) {
   try {
     const today = new Date();
     today.setHours(0, 0, 0, 0);

     const existingBonus = await Karma.findOne({
       userId,
       action: 'DAILY_LOGIN',
       createdAt: { $gte: today }
     });

     if (!existingBonus) {
       await this.updateKarma(userId, 'DAILY_LOGIN', {
         date: today
       });
       
       await this.checkWeeklyStreak(userId);
       
       return { bonusAwarded: true };
     }

     return { bonusAwarded: false };
   } catch (error) {
     logger.error('Error checking daily login bonus:', error);
     throw error;
   }
 }

 async checkWeeklyStreak(userId) {
   try {
     const sevenDaysAgo = new Date();
     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
     sevenDaysAgo.setHours(0, 0, 0, 0);

     const loginDays = await Karma.aggregate([
       {
         $match: {
           userId,
           action: 'DAILY_LOGIN',
           createdAt: { $gte: sevenDaysAgo }
         }
       },
       {
         $group: {
           _id: {
             $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
           }
         }
       }
     ]);

     if (loginDays.length >= 7) {
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       const weekStart = new Date(today);
       weekStart.setDate(weekStart.getDate() - 7);

       const existingStreakBonus = await Karma.findOne({
         userId,
         action: 'WEEKLY_STREAK',
         createdAt: { $gte: weekStart }
       });

       if (!existingStreakBonus) {
         await this.updateKarma(userId, 'WEEKLY_STREAK', {
           streakDays: 7
         });
       }
     }
   } catch (error) {
     logger.error('Error checking weekly streak:', error);
   }
 }

 async recalculateUserKarma(userId) {
   try {
     const totalKarma = await Karma.aggregate([
       { $match: { userId } },
       {
         $group: {
           _id: null,
           total: { $sum: '$points' }
         }
       }
     ]);

     const newKarma = totalKarma[0]?.total || 0;

     await User.findByIdAndUpdate(userId, { karma: newKarma });
     await this.updateKarmaCache(userId, newKarma);

     logger.info(`Recalculated karma for user ${userId}: ${newKarma}`);
     
     return { success: true, karma: newKarma };
   } catch (error) {
     logger.error('Error recalculating user karma:', error);
     throw error;
   }
 }
}

module.exports = new KarmaService();
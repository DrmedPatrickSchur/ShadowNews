/**
 * @fileoverview karma.service.js
 * 
 * Implementation file for karma.service.js
 * 
 * Key Features:
 * - Core functionality
 * - Error handling
 * - Performance optimization
 * 
 * Dependencies:
 *  * - No external dependencies
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */\n\nconst User = require('../models/User.model');
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');
const Repository = require('../models/Repository.model');
const Karma = require('../models/Karma.model');
const redis = require('../utils/redis');
const logger = require('../utils/logger');

class KarmaService {
 constructor() {
   this.karmaRules = {
     POST_CREATED: 50,
     POST_UPVOTED: 10,
     POST_DOWNVOTED: -2,
     COMMENT_CREATED: 20,
     COMMENT_UPVOTED: 5,
     COMMENT_DOWNVOTED: -1,
     REPOSITORY_CREATED: 100,
     EMAIL_VERIFIED: 25,
     CSV_UPLOADED: 100,
     SNOWBALL_TRIGGER: 15,
     CURATOR_BONUS: 50,
     DAILY_LOGIN: 5,
     FIRST_POST: 100,
     MILESTONE_100: 50,
     MILESTONE_500: 100,
     MILESTONE_1000: 200,
     MILESTONE_5000: 500
   };

   this.milestones = [100, 500, 1000, 5000, 10000, 50000];
   this.cachePrefix = 'karma:';
   this.leaderboardKey = 'karma:leaderboard';
 }

 async updateKarma(userId, action, metadata = {}) {
   try {
     const points = this.karmaRules[action] || 0;
     if (points === 0) {
       logger.warn(`Unknown karma action: ${action}`);
       return null;
     }

     const user = await User.findById(userId);
     if (!user) {
       throw new Error('User not found');
     }

     const previousKarma = user.karma || 0;
     const newKarma = Math.max(0, previousKarma + points);

     const karmaTransaction = new Karma({
       userId,
       action,
       points,
       metadata,
       previousBalance: previousKarma,
       newBalance: newKarma
     });

     await karmaTransaction.save();

     user.karma = newKarma;
     await user.save();

     await this.updateCache(userId, newKarma);
     await this.updateLeaderboard(userId, newKarma);
     await this.checkMilestones(userId, previousKarma, newKarma);

     if (newKarma >= 1000 && previousKarma < 1000) {
       await this.grantCuratorPrivileges(userId);
     }

     return {
       userId,
       action,
       points,
       previousKarma,
       newKarma,
       timestamp: new Date()
     };
   } catch (error) {
     logger.error('Error updating karma:', error);
     throw error;
   }
 }

 async calculateVoteWeight(userId) {
   try {
     const karma = await this.getUserKarma(userId);
     
     if (karma >= 5000) return 5;
     if (karma >= 1000) return 3;
     if (karma >= 500) return 2;
     return 1;
   } catch (error) {
     logger.error('Error calculating vote weight:', error);
     return 1;
   }
 }

 async getUserKarma(userId) {
   try {
     const cacheKey = `${this.cachePrefix}${userId}`;
     const cachedKarma = await redis.get(cacheKey);
     
     if (cachedKarma !== null) {
       return parseInt(cachedKarma);
     }

     const user = await User.findById(userId).select('karma');
     const karma = user?.karma || 0;
     
     await redis.setex(cacheKey, 3600, karma);
     return karma;
   } catch (error) {
     logger.error('Error getting user karma:', error);
     return 0;
   }
 }

 async getKarmaHistory(userId, limit = 50, offset = 0) {
   try {
     const history = await Karma.find({ userId })
       .sort({ createdAt: -1 })
       .limit(limit)
       .skip(offset)
       .lean();

     return history;
   } catch (error) {
     logger.error('Error getting karma history:', error);
     throw error;
   }
 }

 async getKarmaBreakdown(userId) {
   try {
     const breakdown = await Karma.aggregate([
       { $match: { userId: userId.toString() } },
       {
         $group: {
           _id: '$action',
           count: { $sum: 1 },
           totalPoints: { $sum: '$points' }
         }
       },
       { $sort: { totalPoints: -1 } }
     ]);

     const total = await this.getUserKarma(userId);
     
     return {
       total,
       breakdown,
       lastUpdated: new Date()
     };
   } catch (error) {
     logger.error('Error getting karma breakdown:', error);
     throw error;
   }
 }

 async getLeaderboard(period = 'all', limit = 100) {
   try {
     let users;
     
     if (period === 'all') {
       users = await User.find({ karma: { $gt: 0 } })
         .sort({ karma: -1 })
         .limit(limit)
         .select('username karma avatar')
         .lean();
     } else {
       const dateRange = this.getDateRange(period);
       const topUsers = await Karma.aggregate([
         {
           $match: {
             createdAt: { $gte: dateRange.start, $lte: dateRange.end }
           }
         },
         {
           $group: {
             _id: '$userId',
             periodKarma: { $sum: '$points' }
           }
         },
         { $sort: { periodKarma: -1 } },
         { $limit: limit }
       ]);

       const userIds = topUsers.map(u => u._id);
       users = await User.find({ _id: { $in: userIds } })
         .select('username karma avatar')
         .lean();

       users = users.map(user => {
         const periodData = topUsers.find(u => u._id.toString() === user._id.toString());
         return { ...user, periodKarma: periodData.periodKarma };
       }).sort((a, b) => b.periodKarma - a.periodKarma);
     }

     return users.map((user, index) => ({
       rank: index + 1,
       ...user
     }));
   } catch (error) {
     logger.error('Error getting leaderboard:', error);
     throw error;
   }
 }

 async checkMilestones(userId, previousKarma, newKarma) {
   try {
     for (const milestone of this.milestones) {
       if (previousKarma < milestone && newKarma >= milestone) {
         await this.awardMilestone(userId, milestone);
       }
     }
   } catch (error) {
     logger.error('Error checking milestones:', error);
   }
 }

 async awardMilestone(userId, milestone) {
   try {
     const milestoneKey = `MILESTONE_${milestone}`;
     const bonusPoints = this.karmaRules[milestoneKey] || 0;
     
     if (bonusPoints > 0) {
       await this.updateKarma(userId, milestoneKey, { milestone });
     }

     await User.findByIdAndUpdate(userId, {
       $addToSet: { achievements: `karma_${milestone}` }
     });

     logger.info(`User ${userId} reached ${milestone} karma milestone`);
   } catch (error) {
     logger.error('Error awarding milestone:', error);
   }
 }

 async grantCuratorPrivileges(userId) {
   try {
     await User.findByIdAndUpdate(userId, {
       $set: { 
         isCurator: true,
         curatorSince: new Date()
       }
     });
     
     logger.info(`User ${userId} granted curator privileges`);
   } catch (error) {
     logger.error('Error granting curator privileges:', error);
   }
 }

 async recalculateUserKarma(userId) {
   try {
     const transactions = await Karma.find({ userId })
       .sort({ createdAt: 1 });

     let calculatedKarma = 0;
     for (const transaction of transactions) {
       calculatedKarma += transaction.points;
     }

     await User.findByIdAndUpdate(userId, { karma: calculatedKarma });
     await this.updateCache(userId, calculatedKarma);
     await this.updateLeaderboard(userId, calculatedKarma);

     return calculatedKarma;
   } catch (error) {
     logger.error('Error recalculating karma:', error);
     throw error;
   }
 }

 async updateCache(userId, karma) {
   try {
     const cacheKey = `${this.cachePrefix}${userId}`;
     await redis.setex(cacheKey, 3600, karma);
   } catch (error) {
     logger.error('Error updating karma cache:', error);
   }
 }

 async updateLeaderboard(userId, karma) {
   try {
     await redis.zadd(this.leaderboardKey, karma, userId);
   } catch (error) {
     logger.error('Error updating leaderboard:', error);
   }
 }

 getDateRange(period) {
   const end = new Date();
   const start = new Date();
   
   switch (period) {
     case 'day':
       start.setDate(start.getDate() - 1);
       break;
     case 'week':
       start.setDate(start.getDate() - 7);
       break;
     case 'month':
       start.setDate(start.getDate() - 30);
       break;
     case 'year':
       start.setFullYear(start.getFullYear() - 1);
       break;
     default:
       start.setFullYear(2000);
   }
   
   return { start, end };
 }

 async getDailyKarmaStats(userId, days = 30) {
   try {
     const startDate = new Date();
     startDate.setDate(startDate.getDate() - days);

     const stats = await Karma.aggregate([
       {
         $match: {
           userId: userId.toString(),
           createdAt: { $gte: startDate }
         }
       },
       {
         $group: {
           _id: {
             $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
           },
           dailyPoints: { $sum: '$points' },
           actions: { $sum: 1 }
         }
       },
       { $sort: { _id: 1 } }
     ]);

     return stats;
   } catch (error) {
     logger.error('Error getting daily karma stats:', error);
     throw error;
   }
 }

 async applyDecayIfInactive(userId) {
   try {
     const lastActivity = await Karma.findOne({ userId })
       .sort({ createdAt: -1 })
       .select('createdAt');

     if (!lastActivity) return;

     const daysSinceActivity = Math.floor(
       (Date.now() - lastActivity.createdAt) / (1000 * 60 * 60 * 24)
     );

     if (daysSinceActivity > 30) {
       const decayAmount = Math.min(50, daysSinceActivity - 30);
       await this.updateKarma(userId, 'INACTIVITY_DECAY', {
         daysInactive: daysSinceActivity,
         decay: -decayAmount
       });
     }
   } catch (error) {
     logger.error('Error applying karma decay:', error);
   }
 }
}

module.exports = new KarmaService();
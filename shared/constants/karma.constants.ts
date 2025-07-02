export const KARMA_ACTIONS = {
  // Post Actions
  CREATE_POST: 50,
  POST_UPVOTED: 10,
  POST_DOWNVOTED: -2,
  POST_FLAGGED: -50,
  POST_REMOVED: -100,
  POST_FEATURED: 100,
  
  // Comment Actions
  CREATE_COMMENT: 20,
  COMMENT_UPVOTED: 5,
  COMMENT_DOWNVOTED: -1,
  COMMENT_FLAGGED: -25,
  COMMENT_BEST_ANSWER: 50,
  
  // Repository Actions
  CREATE_REPOSITORY: 100,
  REPOSITORY_EMAIL_ADDED: 2,
  REPOSITORY_EMAIL_VERIFIED: 5,
  REPOSITORY_SHARED: 25,
  REPOSITORY_MERGED: 150,
  REPOSITORY_MILESTONE_100: 200,
  REPOSITORY_MILESTONE_500: 500,
  REPOSITORY_MILESTONE_1000: 1000,
  
  // Email Actions
  EMAIL_POST_CREATED: 60,
  EMAIL_INVITE_SENT: 10,
  EMAIL_INVITE_ACCEPTED: 30,
  EMAIL_BOUNCE: -5,
  EMAIL_UNSUBSCRIBE: -10,
  
  // CSV Actions
  CSV_UPLOADED: 75,
  CSV_EMAILS_IMPORTED: 1, // per email
  CSV_DOWNLOAD_BY_OTHER: 15,
  CSV_MALFORMED: -20,
  
  // Curation Actions
  CURATE_QUALITY_POST: 15,
  CURATE_REMOVE_SPAM: 20,
  CURATE_FALSE_FLAG: -30,
  GOLDEN_CURATOR_BONUS: 5, // multiplier
  
  // Snowball Actions
  SNOWBALL_INITIATED: 25,
  SNOWBALL_GROWTH_10X: 100,
  SNOWBALL_GROWTH_50X: 500,
  SNOWBALL_GROWTH_100X: 1000,
  
  // User Actions
  FIRST_LOGIN_WEEK: 50,
  DAILY_ACTIVE_BONUS: 5,
  WEEKLY_STREAK_BONUS: 25,
  MONTHLY_STREAK_BONUS: 100,
  REFERRAL_SIGNUP: 100,
  PROFILE_COMPLETED: 25,
  
  // AI Actions
  AI_SUGGESTION_ACCEPTED: 5,
  AI_HASHTAG_TRENDING: 20,
  AI_SUMMARY_HELPFUL: 10,
  
  // Penalty Actions
  SPAM_DETECTED: -100,
  MULTIPLE_ACCOUNTS: -500,
  VOTE_MANIPULATION: -250,
  HARASSMENT: -1000,
  BAN_PERMANENT: -10000,
} as const;

export const KARMA_MILESTONES = {
  NEWBIE: {
    threshold: 0,
    perks: ['Basic posting', 'Commenting', 'Upvoting'],
    emailSignature: false,
    customUsername: false,
    repositoryLimit: 0,
    votingPower: 1,
    badge: 'Newcomer',
    color: '#718096',
  },
  CONTRIBUTOR: {
    threshold: 100,
    perks: ['Custom email signature', 'Create 1 repository', 'Downvoting'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: 1,
    votingPower: 1,
    badge: 'Contributor',
    color: '#4299E1',
  },
  ACTIVE_MEMBER: {
    threshold: 500,
    perks: ['Create 3 repositories', 'Weighted votes (1.5x)', 'Priority support'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: 3,
    votingPower: 1.5,
    badge: 'Active Member',
    color: '#48BB78',
  },
  POWER_USER: {
    threshold: 1000,
    perks: ['Create 5 repositories', 'Weighted votes (2x)', 'Beta features'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: 5,
    votingPower: 2,
    badge: 'Power User',
    color: '#9F7AEA',
  },
  COMMUNITY_LEADER: {
    threshold: 2500,
    perks: ['Unlimited repositories', 'Weighted votes (3x)', 'Moderation tools'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: -1, // unlimited
    votingPower: 3,
    badge: 'Community Leader',
    color: '#ED8936',
  },
  PLATFORM_AMBASSADOR: {
    threshold: 5000,
    perks: ['Platform governance', 'Weighted votes (5x)', 'Direct feature requests'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: -1,
    votingPower: 5,
    badge: 'Ambassador',
    color: '#E53E3E',
  },
  LEGENDARY: {
    threshold: 10000,
    perks: ['Hall of fame', 'Weighted votes (10x)', 'Lifetime perks'],
    emailSignature: true,
    customUsername: true,
    repositoryLimit: -1,
    votingPower: 10,
    badge: 'Legend',
    color: '#D69E2E',
  },
} as const;

export const KARMA_DECAY = {
  INACTIVE_DAYS: 30,
  DAILY_DECAY_RATE: 0.001, // 0.1% per day after 30 days inactive
  MAX_DECAY_PERCENTAGE: 0.2, // Maximum 20% karma can decay
  PROTECTED_THRESHOLD: 1000, // Users above this karma don't decay
} as const;

export const KARMA_MULTIPLIERS = {
  TRENDING_POST: 2,
  VIRAL_POST: 5,
  QUALITY_SCORE_HIGH: 1.5,
  QUALITY_SCORE_LOW: 0.5,
  NEW_USER_BONUS: 1.2, // First 30 days
  WEEKEND_BONUS: 1.1,
  SPECIAL_EVENT: 2,
} as const;

export const KARMA_RATE_LIMITS = {
  MAX_DAILY_GAIN: 500,
  MAX_HOURLY_GAIN: 100,
  MAX_DAILY_LOSS: -200,
  VOTING_COOLDOWN_SECONDS: 1,
  POST_COOLDOWN_MINUTES: 5,
  COMMENT_COOLDOWN_MINUTES: 1,
} as const;

export const SPECIAL_ACHIEVEMENTS = {
  FIRST_POST: { karma: 100, badge: 'First Steps', icon: '🚀' },
  FIRST_REPOSITORY: { karma: 200, badge: 'Repository Creator', icon: '📁' },
  FIRST_SNOWBALL: { karma: 300, badge: 'Snowball Starter', icon: '❄️' },
  VIRAL_POST_1K: { karma: 500, badge: 'Viral Sensation', icon: '🔥' },
  HELPFUL_CURATOR: { karma: 250, badge: 'Quality Guardian', icon: '⭐' },
  EMAIL_MASTER: { karma: 400, badge: 'Email Wizard', icon: '📧' },
  COMMUNITY_BUILDER: { karma: 1000, badge: 'Community Pillar', icon: '🏛️' },
  YEAR_MEMBER: { karma: 500, badge: 'Veteran', icon: '🎖️' },
} as const;

export type KarmaAction = keyof typeof KARMA_ACTIONS;
export type KarmaMilestone = keyof typeof KARMA_MILESTONES;
export type KarmaMultiplier = keyof typeof KARMA_MULTIPLIERS;
export type SpecialAchievement = keyof typeof SPECIAL_ACHIEVEMENTS;

export interface KarmaTransaction {
  userId: string;
  action: KarmaAction;
  points: number;
  multiplier?: number;
  timestamp: Date;
  relatedId?: string;
  relatedType?: 'post' | 'comment' | 'repository' | 'email' | 'csv';
}

export interface UserKarmaStats {
  total: number;
  rank: number;
  milestone: KarmaMilestone;
  dailyGain: number;
  weeklyGain: number;
  monthlyGain: number;
  achievements: SpecialAchievement[];
  nextMilestone: {
    name: KarmaMilestone;
    pointsNeeded: number;
    perksUnlocked: string[];
  };
}

export const calculateKarmaChange = (
  action: KarmaAction,
  multipliers: Partial<Record<KarmaMultiplier, boolean>> = {}
): number => {
  let basePoints = KARMA_ACTIONS[action];
  let totalMultiplier = 1;

  Object.entries(multipliers).forEach(([key, active]) => {
    if (active && key in KARMA_MULTIPLIERS) {
      totalMultiplier *= KARMA_MULTIPLIERS[key as KarmaMultiplier];
    }
  });

  return Math.round(basePoints * totalMultiplier);
};

export const getCurrentMilestone = (karma: number): KarmaMilestone => {
  const milestones = Object.entries(KARMA_MILESTONES)
    .sort(([, a], [, b]) => b.threshold - a.threshold);
  
  for (const [name, data] of milestones) {
    if (karma >= data.threshold) {
      return name as KarmaMilestone;
    }
  }
  
  return 'NEWBIE';
};

export const getNextMilestone = (karma: number): { name: KarmaMilestone; pointsNeeded: number } | null => {
  const milestones = Object.entries(KARMA_MILESTONES)
    .sort(([, a], [, b]) => a.threshold - b.threshold);
  
  for (const [name, data] of milestones) {
    if (karma < data.threshold) {
      return {
        name: name as KarmaMilestone,
        pointsNeeded: data.threshold - karma,
      };
    }
  }
  
  return null;
};
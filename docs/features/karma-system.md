<!--
============================================================================
ShadowNews - Karma System and Gamification Documentation
============================================================================

Comprehensive documentation for ShadowNews' karma-based reputation system,
including gamification mechanics, progressive unlocks, and community incentives.

Purpose:
- Define karma calculation algorithms and point systems
- Document reputation mechanics and quality multipliers
- Establish progressive feature unlocks and permissions
- Provide community engagement incentive structures

Target Audience:
- Product managers designing engagement features
- Backend developers implementing karma algorithms
- Community managers understanding reputation systems
- Frontend developers building gamification interfaces

Coverage:
- Karma point calculation and quality multipliers
- Action-based point awards and daily limits
- Reputation tiers and progressive feature unlocks
- Anti-gaming measures and fraud prevention
- Community moderation and karma adjustments
- Analytics and reputation tracking systems

Gamification Features:
- Point-based reputation system with quality weighting
- Progressive feature unlocks based on karma thresholds
- Daily limits and anti-spam protections
- Community curator bonuses and special privileges
- Leaderboards and achievement systems
- Karma recovery and second-chance mechanisms

Technical Implementation:
- Real-time karma calculation and caching
- Transaction-based karma adjustments
- Anti-fraud detection and prevention
- Historical karma tracking and analytics
- Performance optimization for large-scale communities
- Integration with content moderation systems

Last Updated: 2025-07-27
Version: 1.0.0
============================================================================
-->

# Karma System Documentation

## Overview

The Shadownews Karma System is a comprehensive reputation and gamification framework that encourages quality contributions, rewards community engagement, and unlocks progressive features based on user participation.

## Karma Calculation Formula

```
Base Karma = (Post Upvotes × 10) + (Comment Upvotes × 5) + (Repository Subscribers × 20)
Quality Multiplier = (Upvote Ratio × Curator Bonus × Time Decay Factor)
Total Karma = Base Karma × Quality Multiplier
```

## Karma Actions & Points

### Content Creation
| Action | Karma Points | Daily Limit |
|--------|--------------|-------------|
| Create Post | +10 | 5 posts |
| Create Comment | +5 | 20 comments |
| Email Post (via unique email) | +15 | 3 posts |
| Upload CSV to Repository | +100 | 2 uploads |
| Create Repository | +50 | 1 repository |

### Engagement Actions
| Action | Karma Points | Daily Limit |
|--------|--------------|-------------|
| Receive Post Upvote | +10 | Unlimited |
| Receive Comment Upvote | +5 | Unlimited |
| Give Upvote | +1 | 100 upvotes |
| Repository Subscription | +20 | Unlimited |
| Snowball Email Added | +2 | Unlimited |

### Quality Bonuses
| Achievement | Karma Multiplier | Requirement |
|-------------|------------------|-------------|
| Hot Post | 2x | 50+ upvotes in 2 hours |
| Trending Post | 1.5x | Top 10 daily |
| Curator Pick | 3x | Selected by Golden Curator |
| High Quality | 1.2x | 90%+ upvote ratio |
| Expert Tag | 1.5x | Domain expertise verified |

### Penalties
| Action | Karma Points | Duration |
|--------|--------------|----------|
| Post Flagged as Spam | -50 | Permanent |
| Comment Removed | -20 | Permanent |
| Repository Violation | -100 | Permanent |
| Mass Downvoting | -5 per vote | 24 hour cooldown |

## Karma Milestones & Privileges

### Level 1: Newcomer (0-99 Karma)
- Create posts and comments
- Upvote content
- Join repositories
- 10 minute post cooldown

### Level 2: Contributor (100-499 Karma)
- Custom email signature
- Create 1 repository
- 5 minute post cooldown
- Access to formatting tools
- Vote weight: 1.1x

### Level 3: Active Member (500-999 Karma)
- Create up to 3 repositories
- No post cooldown
- Pin 1 comment per thread
- Early access to features
- Vote weight: 1.2x
- Custom profile badge

### Level 4: Power User (1,000-4,999 Karma)
- Create unlimited repositories
- Weighted voting power (1.5x)
- Moderate own repositories
- Access to analytics dashboard
- Priority email delivery
- Custom repository themes

### Level 5: Community Leader (5,000-9,999 Karma)
- Platform governance participation
- Create sticky posts
- Vote weight: 2x
- Verified badge
- Beta feature access
- Mentor new users program

### Level 6: Elder (10,000+ Karma)
- Shape platform policies
- Vote weight: 3x
- Create platform-wide announcements
- Access to admin tools
- Custom email domain
- Annual platform summit invitation

## Karma Decay Algorithm

```javascript
function calculateKarmaDecay(originalKarma, daysSinceEarned) {
  const DECAY_RATE = 0.02; // 2% daily after grace period
  const GRACE_PERIOD = 30; // No decay for 30 days
  const MIN_KARMA = originalKarma * 0.1; // Never decay below 10%
  
  if (daysSinceEarned <= GRACE_PERIOD) {
    return originalKarma;
  }
  
  const decayDays = daysSinceEarned - GRACE_PERIOD;
  const decayedKarma = originalKarma * Math.pow(1 - DECAY_RATE, decayDays);
  
  return Math.max(decayedKarma, MIN_KARMA);
}
```

## Special Karma Programs

### Curator Program
- **Golden Curator Badge**: Top 1% karma earners
- **Silver Curator Badge**: Top 5% karma earners
- **Bronze Curator Badge**: Top 10% karma earners

Curator Benefits:
- Increased vote weight (5x, 3x, 2x respectively)
- Curated content sections
- Monthly rewards pool share
- Platform feature requests priority

### Repository Growth Rewards
```
Tier 1: 100 verified emails = +500 karma
Tier 2: 500 verified emails = +2,000 karma
Tier 3: 1,000 verified emails = +5,000 karma
Tier 4: 5,000 verified emails = +15,000 karma
Tier 5: 10,000+ verified emails = +30,000 karma + "Repository Master" title
```

### Snowball Multiplier
For each generation of snowball distribution:
- 1st generation: 100% karma
- 2nd generation: 50% karma
- 3rd generation: 25% karma
- 4th+ generation: 10% karma

## API Endpoints

### Get User Karma
```
GET /api/users/:userId/karma
```

Response:
```json
{
  "totalKarma": 2847,
  "currentLevel": "Power User",
  "nextLevel": "Community Leader",
  "karmaToNextLevel": 2153,
  "breakdown": {
    "posts": 1200,
    "comments": 647,
    "repositories": 1000,
    "bonuses": 500,
    "penalties": -100
  },
  "recentActivity": [
    {
      "action": "post_upvote",
      "karma": 10,
      "timestamp": "2025-06-26T10:30:00Z"
    }
  ],
  "achievements": [
    "hot_post",
    "repository_creator",
    "quality_contributor"
  ]
}
```

### Get Karma Leaderboard
```
GET /api/karma/leaderboard
```

Query Parameters:
- `period`: daily | weekly | monthly | all-time
- `limit`: number (default: 100)
- `category`: overall | posts | comments | repositories

### Update Karma (Internal)
```
POST /api/karma/update
```

Request:
```json
{
  "userId": "user123",
  "action": "post_upvote",
  "targetId": "post456",
  "metadata": {
    "voterId": "user789",
    "voteWeight": 1.5
  }
}
```

## Database Schema

### Karma Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  totalKarma: Number,
  breakdown: {
    posts: Number,
    comments: Number,
    repositories: Number,
    bonuses: Number,
    penalties: Number
  },
  level: String,
  achievements: [String],
  history: [{
    action: String,
    karma: Number,
    targetId: ObjectId,
    timestamp: Date,
    metadata: Object
  }],
  milestones: [{
    level: String,
    achievedAt: Date,
    karmaAtMilestone: Number
  }],
  specialBadges: [String],
  lastCalculated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Implementation Examples

### Calculate Karma Service
```javascript
// backend/src/services/karma.service.js
class KarmaService {
  async calculateUserKarma(userId) {
    const user = await User.findById(userId);
    const posts = await Post.find({ author: userId });
    const comments = await Comment.find({ author: userId });
    const repositories = await Repository.find({ owner: userId });
    
    let baseKarma = 0;
    
    // Calculate post karma
    posts.forEach(post => {
      baseKarma += post.upvotes * 10;
      if (post.isHot) baseKarma *= 2;
      if (post.isTrending) baseKarma *= 1.5;
    });
    
    // Calculate comment karma
    comments.forEach(comment => {
      baseKarma += comment.upvotes * 5;
    });
    
    // Calculate repository karma
    repositories.forEach(repo => {
      baseKarma += repo.subscribers.length * 20;
      baseKarma += repo.emailCount * 2; // Snowball bonus
    });
    
    // Apply quality multiplier
    const upvoteRatio = this.calculateUpvoteRatio(userId);
    const qualityMultiplier = Math.max(0.5, Math.min(2, upvoteRatio));
    
    const totalKarma = Math.floor(baseKarma * qualityMultiplier);
    
    // Update karma record
    await Karma.findOneAndUpdate(
      { userId },
      {
        totalKarma,
        breakdown: {
          posts: postKarma,
          comments: commentKarma,
          repositories: repoKarma
        },
        level: this.getKarmaLevel(totalKarma),
        lastCalculated: new Date()
      },
      { upsert: true }
    );
    
    return totalKarma;
  }
  
  getKarmaLevel(karma) {
    if (karma >= 10000) return 'Elder';
    if (karma >= 5000) return 'Community Leader';
    if (karma >= 1000) return 'Power User';
    if (karma >= 500) return 'Active Member';
    if (karma >= 100) return 'Contributor';
    return 'Newcomer';
  }
}
```

### React Karma Display Component
```tsx
// frontend/src/components/user/KarmaBadge/KarmaBadge.tsx
const KarmaBadge: React.FC<{ userId: string }> = ({ userId }) => {
  const { karma, level, nextLevel, progress } = useKarma(userId);
  
  return (
    <div className="karma-badge">
      <div className="karma-total">{karma.toLocaleString()}</div>
      <div className="karma-level">{level}</div>
      <ProgressBar 
        value={progress} 
        max={100} 
        label={`${karma} / ${nextLevel.threshold}`}
      />
      <div className="karma-achievements">
        {karma.achievements.map(achievement => (
          <AchievementIcon key={achievement} type={achievement} />
        ))}
      </div>
    </div>
  );
};
```

## Karma Analytics

### Weekly Karma Report Email
```
Subject: Your Shadownews Karma Report 📊

This Week's Summary:
- Total Karma: 3,247 (+347 from last week)
- Current Level: Power User
- Global Rank: #142 (↑ 23 positions)

Top Contributing Actions:
1. Hot Post "AI in Healthcare": +200 karma
2. Repository Growth (AI Ethics): +150 karma
3. Quality Comments: +97 karma

You're 1,753 karma away from Community Leader!

Keep up the great contributions! 🚀
```

## Best Practices

1. **Encourage Quality Over Quantity**
   - Higher multipliers for quality content
   - Diminishing returns on mass posting
   - Curator rewards for identifying quality

2. **Prevent Gaming**
   - Daily limits on actions
   - Karma decay for inactive users
   - Penalty system for violations
   - Vote manipulation detection

3. **Transparent Progression**
   - Clear milestone requirements
   - Visual progress indicators
   - Regular karma reports
   - Achievement notifications

4. **Community-Driven Evolution**
   - Elders vote on karma changes
   - Seasonal adjustments based on data
   - Community proposals for new achievements
   - Regular karma economy reviews
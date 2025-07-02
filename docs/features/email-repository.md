# Email Repository System

## Overview

The Email Repository is Shadownews' core innovation - a topic-based email collection system that enables organic community growth through CSV-based "snowball" distribution. Each repository acts as a curated email list focused on specific topics, allowing verified members to contribute and expand the network.

## Architecture

### Data Model

```javascript
Repository {
  id: ObjectId,
  name: String,
  slug: String,
  description: String,
  topic: String,
  hashtags: [String],
  owner: ObjectId (User),
  moderators: [ObjectId],
  emails: [{
    email: String,
    verificationStatus: Enum['pending', 'verified', 'rejected'],
    addedBy: ObjectId (User),
    addedVia: Enum['manual', 'csv', 'snowball', 'api'],
    metadata: {
      name: String,
      organization: String,
      tags: [String]
    },
    stats: {
      opens: Number,
      clicks: Number,
      contributions: Number
    },
    addedAt: Date,
    verifiedAt: Date,
    lastActiveAt: Date
  }],
  settings: {
    autoApprove: Boolean,
    minKarmaToAdd: Number,
    maxEmailsPerUpload: Number,
    allowSnowball: Boolean,
    snowballThreshold: Number,
    digestFrequency: Enum['daily', 'weekly', 'monthly'],
    privacyLevel: Enum['public', 'members', 'private']
  },
  stats: {
    totalEmails: Number,
    verifiedEmails: Number,
    activeEmails: Number,
    growthRate: Number,
    engagementRate: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Email Processing Pipeline

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Email Input    │────▶│   Parser     │────▶│  Validator      │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Distribution   │◀────│  Repository  │◀────│  Verification   │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## API Endpoints

### Repository Management

#### Create Repository
```http
POST /api/repositories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "AI Healthcare Professionals",
  "description": "Connecting AI researchers and healthcare professionals",
  "topic": "AI Healthcare",
  "hashtags": ["#AIHealth", "#DigitalHealth", "#MedTech"],
  "settings": {
    "autoApprove": false,
    "minKarmaToAdd": 100,
    "maxEmailsPerUpload": 500,
    "allowSnowball": true,
    "snowballThreshold": 3,
    "digestFrequency": "weekly",
    "privacyLevel": "members"
  }
}
```

#### Get Repository
```http
GET /api/repositories/:id
Authorization: Bearer <token>

Response:
{
  "id": "507f1f77bcf86cd799439011",
  "name": "AI Healthcare Professionals",
  "owner": {
    "id": "507f1f77bcf86cd799439012",
    "username": "elena_ai",
    "karma": 2450
  },
  "stats": {
    "totalEmails": 1247,
    "verifiedEmails": 1180,
    "activeEmails": 892,
    "growthRate": 12.5,
    "engagementRate": 75.6
  }
}
```

#### Update Repository Settings
```http
PATCH /api/repositories/:id/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "autoApprove": true,
  "snowballThreshold": 5,
  "digestFrequency": "daily"
}
```

### Email Management

#### Add Emails Manually
```http
POST /api/repositories/:id/emails
Authorization: Bearer <token>
Content-Type: application/json

{
  "emails": [
    {
      "email": "researcher@hospital.org",
      "metadata": {
        "name": "Dr. Sarah Johnson",
        "organization": "City Hospital",
        "tags": ["researcher", "clinician"]
      }
    }
  ]
}
```

#### Upload CSV
```http
POST /api/repositories/:id/emails/csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: contacts.csv
```

CSV Format:
```csv
email,name,organization,tags
john.doe@company.com,John Doe,TechCorp,"developer,ai"
jane.smith@university.edu,Jane Smith,State University,"researcher,ml"
```

#### Verify Email
```http
POST /api/repositories/:id/emails/:emailId/verify
Authorization: Bearer <token>

{
  "verificationToken": "a1b2c3d4e5f6"
}
```

#### Remove Email
```http
DELETE /api/repositories/:id/emails/:emailId
Authorization: Bearer <token>
```

### Snowball Distribution

#### Enable Snowball for Post
```http
POST /api/posts/:postId/snowball
Authorization: Bearer <token>
Content-Type: application/json

{
  "repositoryId": "507f1f77bcf86cd799439011",
  "message": "Check out this interesting discussion on AI in healthcare"
}
```

#### Track Snowball Growth
```http
GET /api/repositories/:id/snowball/stats
Authorization: Bearer <token>

Response:
{
  "totalSnowballed": 347,
  "conversionRate": 23.5,
  "topContributors": [
    {
      "email": "influencer@health.org",
      "contributed": 45,
      "verified": 38
    }
  ],
  "growthTimeline": [
    {
      "date": "2025-06-20",
      "added": 23,
      "verified": 18
    }
  ]
}
```

## Email Verification Flow

### 1. Initial Upload
When emails are added via CSV or manual entry:

```javascript
// backend/src/services/email.service.js
async function processNewEmails(repositoryId, emails) {
  for (const email of emails) {
    // Check if email already exists
    const exists = await checkEmailExists(repositoryId, email.email);
    if (exists) continue;
    
    // Generate verification token
    const token = generateVerificationToken();
    
    // Add to repository with pending status
    await addEmailToRepository(repositoryId, {
      ...email,
      verificationStatus: 'pending',
      verificationToken: token
    });
    
    // Send verification email
    await sendVerificationEmail(email.email, token, repositoryId);
  }
}
```

### 2. Verification Email Template
```html
Subject: Verify your email for {{repositoryName}} on Shadownews

Hello{{#if name}} {{name}}{{/if}},

You've been invited to join the "{{repositoryName}}" email repository on Shadownews.

This repository connects professionals interested in {{topic}}.

To verify your email and control your preferences:
{{verificationLink}}

What this means:
- Receive curated digests about {{topic}}
- Connect with {{memberCount}} verified professionals
- Contribute to discussions via email

Privacy First:
- Unsubscribe anytime
- Your email is never shared without permission
- You control your notification preferences

Best regards,
The Shadownews Team
```

### 3. Verification Handler
```javascript
// backend/src/api/controllers/email.controller.js
async function verifyEmail(req, res) {
  const { token } = req.params;
  
  // Find email by token
  const email = await Email.findOne({ verificationToken: token });
  
  if (!email) {
    return res.status(404).json({ error: 'Invalid verification token' });
  }
  
  // Update verification status
  email.verificationStatus = 'verified';
  email.verifiedAt = new Date();
  email.verificationToken = null;
  await email.save();
  
  // Update repository stats
  await updateRepositoryStats(email.repositoryId);
  
  // Send welcome email
  await sendWelcomeEmail(email.email, email.repositoryId);
  
  res.redirect(`${FRONTEND_URL}/verified?repository=${email.repositoryId}`);
}
```

## Snowball Algorithm

### Core Logic
```javascript
// backend/src/services/snowball.service.js
class SnowballService {
  async processSnowball(postId, repositoryId, sharedBy) {
    const repository = await Repository.findById(repositoryId);
    const post = await Post.findById(postId);
    
    if (!repository.settings.allowSnowball) {
      throw new Error('Snowball distribution disabled for this repository');
    }
    
    // Get verified emails from repository
    const verifiedEmails = repository.emails.filter(
      e => e.verificationStatus === 'verified' && e.email !== sharedBy
    );
    
    // Apply engagement scoring
    const scoredEmails = await this.scoreEmails(verifiedEmails, post);
    
    // Select top candidates based on threshold
    const recipients = scoredEmails
      .filter(e => e.score >= repository.settings.snowballThreshold)
      .slice(0, MAX_SNOWBALL_RECIPIENTS);
    
    // Queue distribution
    for (const recipient of recipients) {
      await emailQueue.add('snowball-distribution', {
        email: recipient.email,
        postId,
        repositoryId,
        sharedBy,
        metadata: recipient.metadata
      });
    }
    
    // Track snowball event
    await this.trackSnowballEvent(postId, repositoryId, sharedBy, recipients.length);
  }
  
  async scoreEmails(emails, post) {
    return emails.map(email => {
      let score = 0;
      
      // Activity score
      if (email.stats.opens > 10) score += 1;
      if (email.stats.clicks > 5) score += 1;
      if (email.stats.contributions > 0) score += 2;
      
      // Recency score
      const daysSinceActive = daysBetween(email.lastActiveAt, new Date());
      if (daysSinceActive < 7) score += 2;
      else if (daysSinceActive < 30) score += 1;
      
      // Topic relevance score
      const topicMatch = this.calculateTopicMatch(email.metadata.tags, post.hashtags);
      score += topicMatch * 3;
      
      return { ...email, score };
    });
  }
}
```

### Snowball Email Template
```html
Subject: {{sharedByName}} shared: "{{postTitle}}"

{{sharedByName}} thought you'd find this interesting:

"{{postTitle}}"
{{postExcerpt}}

Join the discussion with {{responseCount}} others:
{{postLink}}

---
Why you received this:
You're part of the {{repositoryName}} network where {{sharedByName}} shared this post.

Your network is growing! This repository now connects {{memberCount}} professionals.

Manage preferences: {{preferencesLink}}
```

## Privacy & Compliance

### GDPR Compliance
```javascript
// backend/src/services/privacy.service.js
class PrivacyService {
  async exportUserData(userId) {
    const user = await User.findById(userId);
    const repositories = await Repository.find({
      'emails.email': user.email
    });
    
    return {
      profile: user.toJSON(),
      repositories: repositories.map(r => ({
        name: r.name,
        joinedAt: r.emails.find(e => e.email === user.email).addedAt,
        stats: r.emails.find(e => e.email === user.email).stats
      })),
      posts: await Post.find({ author: userId }),
      comments: await Comment.find({ author: userId })
    };
  }
  
  async deleteUserFromRepositories(userId) {
    const user = await User.findById(userId);
    
    await Repository.updateMany(
      { 'emails.email': user.email },
      { $pull: { emails: { email: user.email } } }
    );
  }
}
```

### Email Preferences
```javascript
// Database schema for preferences
UserPreferences {
  userId: ObjectId,
  email: String,
  repositories: [{
    repositoryId: ObjectId,
    digestEnabled: Boolean,
    snowballEnabled: Boolean,
    instantNotifications: Boolean,
    digestFrequency: String
  }],
  globalUnsubscribe: Boolean,
  unsubscribeToken: String
}
```

## Digest Generation

### Digest Worker
```javascript
// backend/src/workers/digest.worker.js
class DigestWorker {
  async generateDigest(repositoryId, frequency) {
    const repository = await Repository.findById(repositoryId)
      .populate('owner');
    
    // Get relevant posts
    const posts = await this.getDigestPosts(repositoryId, frequency);
    
    if (posts.length === 0) return;
    
    // Get active subscribers
    const subscribers = await this.getActiveSubscribers(repositoryId);
    
    // Generate personalized digests
    for (const subscriber of subscribers) {
      const personalizedContent = await this.personalizeContent(
        posts,
        subscriber,
        repository
      );
      
      await emailQueue.add('send-digest', {
        to: subscriber.email,
        subject: `${repository.name} ${frequency} Digest`,
        content: personalizedContent,
        repositoryId,
        subscriberId: subscriber.id
      });
    }
    
    // Update stats
    await this.updateDigestStats(repositoryId, subscribers.length);
  }
  
  async personalizeContent(posts, subscriber, repository) {
    // Sort posts by relevance to subscriber
    const scoredPosts = posts.map(post => ({
      ...post,
      relevanceScore: this.calculateRelevance(post, subscriber)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return {
      topPosts: scoredPosts.slice(0, 5),
      totalPosts: posts.length,
      subscriberName: subscriber.metadata.name,
      repositoryStats: repository.stats,
      trendingHashtags: this.extractTrendingHashtags(posts)
    };
  }
}
```

## Analytics & Monitoring

### Repository Analytics
```javascript
// backend/src/services/analytics.service.js
class RepositoryAnalytics {
  async getGrowthMetrics(repositoryId, timeframe = '30d') {
    const repository = await Repository.findById(repositoryId);
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(timeframe));
    
    const metrics = {
      emailGrowth: await this.calculateEmailGrowth(repository, startDate, endDate),
      engagementRate: await this.calculateEngagement(repository, startDate, endDate),
      snowballEffectiveness: await this.calculateSnowballROI(repository, startDate, endDate),
      topContributors: await this.getTopContributors(repository, startDate, endDate),
      churnRate: await this.calculateChurnRate(repository, startDate, endDate)
    };
    
    return metrics;
  }
  
  async calculateSnowballROI(repository, startDate, endDate) {
    const snowballEvents = await SnowballEvent.find({
      repositoryId: repository.id,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const totalShared = snowballEvents.reduce((sum, event) => sum + event.recipientCount, 0);
    const verified = snowballEvents.reduce((sum, event) => sum + event.verifiedCount, 0);
    
    return {
      totalShared,
      verified,
      conversionRate: (verified / totalShared) * 100,
      avgRecipientsPerShare: totalShared / snowballEvents.length
    };
  }
}
```

## Security Considerations

### Rate Limiting
```javascript
// backend/src/middlewares/rateLimit.middleware.js
const repositoryLimits = {
  createRepository: rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5,
    message: 'Too many repositories created. Please try again later.'
  }),
  
  uploadCSV: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many CSV uploads. Please try again later.'
  }),
  
  addEmails: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many emails added. Please try again later.'
  })
};
```

### Input Validation
```javascript
// backend/src/validators/repository.validator.js
const createRepositorySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  topic: Joi.string().min(3).max(50).required(),
  hashtags: Joi.array().items(
    Joi.string().regex(/^#\w+$/).max(20)
  ).max(10),
  settings: Joi.object({
    autoApprove: Joi.boolean(),
    minKarmaToAdd: Joi.number().min(0).max(10000),
    maxEmailsPerUpload: Joi.number().min(1).max(1000),
    allowSnowball: Joi.boolean(),
    snowballThreshold: Joi.number().min(1).max(10),
    digestFrequency: Joi.string().valid('daily', 'weekly', 'monthly'),
    privacyLevel: Joi.string().valid('public', 'members', 'private')
  })
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
  metadata: Joi.object({
    name: Joi.string().max(100),
    organization: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(20)).max(10)
  })
});
```

## Best Practices

### 1. Email Quality Control
- Implement domain verification to prevent spam
- Use double opt-in for all email additions
- Monitor bounce rates and automatically remove invalid emails
- Implement email warming for new repositories

### 2. Scalability
- Use Redis for caching repository stats
- Implement pagination for large email lists
- Use background workers for all email operations
- Consider sharding large repositories

### 3. User Experience
- Provide clear unsubscribe options in every email
- Show real-time growth visualizations
- Allow bulk operations with proper permissions
- Implement email preview before sending

### 4. Monitoring
- Track delivery rates per repository
- Monitor engagement metrics
- Alert on unusual activity patterns
- Regular cleanup of inactive emails

## Integration Examples

### Frontend Repository Component
```typescript
// frontend/src/components/repositories/RepositoryDashboard.tsx
const RepositoryDashboard: React.FC<{ repositoryId: string }> = ({ repositoryId }) => {
  const { repository, loading } = useRepository(repositoryId);
  const [showUploader, setShowUploader] = useState(false);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="repository-dashboard">
      <RepositoryHeader repository={repository} />
      
      <div className="stats-grid">
        <StatCard
          title="Total Emails"
          value={repository.stats.totalEmails}
          change={repository.stats.growthRate}
        />
        <StatCard
          title="Verified"
          value={repository.stats.verifiedEmails}
          percentage={(repository.stats.verifiedEmails / repository.stats.totalEmails) * 100}
        />
        <StatCard
          title="Engagement Rate"
          value={`${repository.stats.engagementRate}%`}
        />
      </div>
      
      <SnowballVisualizer repositoryId={repositoryId} />
      
      <div className="actions">
        <Button onClick={() => setShowUploader(true)}>
          Upload CSV
        </Button>
        <Button variant="secondary">
          Download Repository
        </Button>
      </div>
      
      {showUploader && (
        <CSVUploader
          repositoryId={repositoryId}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};
```

### Email Command Parser
```javascript
// backend/src/services/emailParser.service.js
class EmailCommandParser {
  parseCommand(email) {
    const subject = email.subject.toLowerCase();
    const body = email.text.toLowerCase();
    
    // Repository commands
    if (subject.includes('create repository')) {
      return {
        command: 'CREATE_REPOSITORY',
        params: this.parseRepositoryParams(body)
      };
    }
    
    if (subject.includes('add emails')) {
      return {
        command: 'ADD_EMAILS',
        params: {
          repositoryId: this.extractRepositoryId(body),
          emails: this.extractEmails(email.attachments)
        }
      };
    }
    
    if (subject.includes('stats')) {
      return {
        command: 'GET_STATS',
        params: {
          repositoryId: this.extractRepositoryId(body)
        }
      };
    }
    
    // Default to creating a post
    return {
      command: 'CREATE_POST',
      params: {
        title: email.subject,
        content: email.text,
        attachments: email.attachments
      }
    };
  }
}
```
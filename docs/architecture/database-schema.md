<!--
============================================================================
ShadowNews - Database Schema and Data Architecture Documentation
============================================================================

Comprehensive documentation of the ShadowNews MongoDB database schema,
including collection structures, relationships, and data modeling patterns.

Purpose:
- Define complete database schema with validation rules
- Document relationships between collections and data flow
- Provide indexing strategies for query optimization
- Establish data integrity and consistency patterns

Target Audience:
- Backend developers working with database models
- Database administrators managing MongoDB instances
- DevOps engineers handling database migrations
- Data analysts understanding the data structure

Coverage:
- Complete collection schemas with field specifications
- Mongoose model definitions and validation rules
- Database relationships and referential integrity
- Indexing strategies for performance optimization
- Data migration patterns and versioning
- Query optimization and aggregation pipelines

Technical Details:
- MongoDB document structure and validation
- Mongoose ODM integration and middleware
- Compound indexes for complex query patterns
- Data archival and cleanup strategies
- Performance monitoring and optimization
- Backup and recovery procedures

Last Updated: 2025-07-27
Version: 1.0.0
============================================================================
-->

# ShadowNews Database Schema

## Overview

MongoDB database with the following collections:
- users
- posts
- comments
- repositories
- emails
- karma_transactions
- email_digests
- csv_uploads
- notifications
- sessions

## Collections

### users

```javascript
{
  _id: ObjectId,
  username: {
    type: String,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 30,
    index: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    index: true
  },
  shadownewsEmail: {
    type: String,
    unique: true,
    required: true,
        // Format: username@artofdigitalshadow.org
  },
  password: {
    type: String,
    required: true,
    // Bcrypt hashed
  },
  profile: {
    displayName: String,
    bio: String,
    website: String,
    location: String,
    avatar: String,
    coverImage: String
  },
  karma: {
    total: {
      type: Number,
      default: 0,
      index: true
    },
    postKarma: {
      type: Number,
      default: 0
    },
    commentKarma: {
      type: Number,
      default: 0
    },
    curationKarma: {
      type: Number,
      default: 0
    }
  },
  badges: [{
    type: String,
    enum: ['early_adopter', 'curator', 'contributor', 'ambassador', 'moderator']
  }],
  preferences: {
    emailDigest: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'never'],
        default: 'daily'
      },
      topics: [String]
    },
    notifications: {
      comments: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      follows: {
        type: Boolean,
        default: true
      },
      repositoryUpdates: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showEmail: {
        type: Boolean,
        default: false
      },
      allowSnowball: {
        type: Boolean,
        default: true
      },
      publicProfile: {
        type: Boolean,
        default: true
      }
    }
  },
  following: [{
    type: ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: ObjectId,
    ref: 'User'
  }],
  repositories: [{
    type: ObjectId,
    ref: 'Repository'
  }],
  apiKeys: [{
    key: String,
    name: String,
    permissions: [String],
    lastUsed: Date,
    createdAt: Date
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### posts

```javascript
{
  _id: ObjectId,
  title: {
    type: String,
    required: true,
    maxLength: 300,
    index: 'text'
  },
  url: {
    type: String,
    sparse: true,
    index: true
  },
  text: {
    type: String,
    maxLength: 10000,
    index: 'text'
  },
  author: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['link', 'ask', 'show', 'job', 'poll'],
    default: 'link',
    index: true
  },
  hashtags: [{
    type: String,
    lowercase: true,
    index: true
  }],
  score: {
    type: Number,
    default: 1,
    index: true
  },
  upvotes: [{
    user: {
      type: ObjectId,
      ref: 'User'
    },
    weight: {
      type: Number,
      default: 1
    },
    timestamp: Date
  }],
  downvotes: [{
    user: {
      type: ObjectId,
      ref: 'User'
    },
    timestamp: Date
  }],
  commentCount: {
    type: Number,
    default: 0,
    index: true
  },
  repository: {
    type: ObjectId,
    ref: 'Repository',
    index: true
  },
  attachedRepositories: [{
    type: ObjectId,
    ref: 'Repository'
  }],
  metadata: {
    domain: String,
    readTime: Number,
    language: String,
    aiSummary: String,
    suggestedHashtags: [String]
  },
  visibility: {
    type: String,
    enum: ['public', 'repository', 'private'],
    default: 'public'
  },
  flags: [{
    user: {
      type: ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: Date
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    timestamp: Date,
    title: String,
    text: String,
    editor: {
      type: ObjectId,
      ref: 'User'
    }
  }],
  sourceEmail: {
    messageId: String,
    from: String,
    subject: String,
    receivedAt: Date
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    emailOpens: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  pinnedComment: {
    type: ObjectId,
    ref: 'Comment'
  },
  status: {
    type: String,
    enum: ['active', 'deleted', 'flagged', 'spam'],
    default: 'active',
    index: true
  },
  deletedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### comments

```javascript
{
  _id: ObjectId,
  text: {
    type: String,
    required: true,
    maxLength: 10000
  },
  author: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  post: {
    type: ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  parent: {
    type: ObjectId,
    ref: 'Comment',
    index: true
  },
  depth: {
    type: Number,
    default: 0,
    index: true
  },
  path: {
    type: String,
    index: true
    // Materialized path pattern: "parentId1.parentId2.parentId3"
  },
  score: {
    type: Number,
    default: 1,
    index: true
  },
  upvotes: [{
    user: {
      type: ObjectId,
      ref: 'User'
    },
    timestamp: Date
  }],
  downvotes: [{
    user: {
      type: ObjectId,
      ref: 'User'
    },
    timestamp: Date
  }],
  mentions: [{
    type: ObjectId,
    ref: 'User'
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    timestamp: Date,
    text: String
  }],
  sourceEmail: {
    messageId: String,
    inReplyTo: String,
    from: String
  },
  flags: [{
    user: {
      type: ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: Date
  }],
  status: {
    type: String,
    enum: ['active', 'deleted', 'flagged', 'spam'],
    default: 'active'
  },
  deletedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### repositories

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    maxLength: 100,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  description: {
    type: String,
    maxLength: 500
  },
  owner: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  moderators: [{
    type: ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: ['topic', 'organization', 'event', 'geographic'],
    default: 'topic'
  },
  topics: [{
    type: String,
    lowercase: true,
    index: true
  }],
  emails: [{
    email: {
      type: String,
      lowercase: true,
      required: true
    },
    name: String,
    addedBy: {
      type: ObjectId,
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
    unsubscribed: {
      type: Boolean,
      default: false
    },
    bounced: {
      type: Boolean,
      default: false
    },
    metadata: {
      organization: String,
      title: String,
      location: String,
      tags: [String]
    }
  }],
  emailCount: {
    type: Number,
    default: 0,
    index: true
  },
  verifiedEmailCount: {
    type: Number,
    default: 0
  },
  settings: {
    privacy: {
      type: String,
      enum: ['public', 'private', 'invite'],
      default: 'public'
    },
    autoApprove: {
      type: Boolean,
      default: false
    },
    requireVerification: {
      type: Boolean,
      default: true
    },
    allowSnowball: {
      type: Boolean,
      default: true
    },
    snowballSettings: {
      minKarma: {
        type: Number,
        default: 100
      },
      maxEmailsPerUpload: {
        type: Number,
        default: 100
      },
      requireModeration: {
        type: Boolean,
        default: true
      }
    },
    digestSettings: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      template: String
    }
  },
  stats: {
    totalPosts: {
      type: Number,
      default: 0
    },
    weeklyGrowth: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  csvUploads: [{
    type: ObjectId,
    ref: 'CSVUpload'
  }],
  connectedRepositories: [{
    repository: {
      type: ObjectId,
      ref: 'Repository'
    },
    sharedEmails: Number,
    connectionType: {
      type: String,
      enum: ['partner', 'related', 'merged']
    }
  }],
  tags: [String],
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'suspended'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### emails

```javascript
{
  _id: ObjectId,
  messageId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  from: {
    email: {
      type: String,
      required: true,
      index: true
    },
    name: String
  },
  to: [{
    email: String,
    name: String
  }],
  cc: [{
    email: String,
    name: String
  }],
  subject: {
    type: String,
    required: true
  },
  text: String,
  html: String,
  attachments: [{
    filename: String,
    contentType: String,
    size: Number,
    url: String
  }],
  headers: Object,
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: Date,
  type: {
    type: String,
    enum: ['post', 'comment', 'command', 'digest', 'notification'],
    index: true
  },
  relatedPost: {
    type: ObjectId,
    ref: 'Post'
  },
  relatedComment: {
    type: ObjectId,
    ref: 'Comment'
  },
  user: {
    type: ObjectId,
    ref: 'User',
    index: true
  },
  repository: {
    type: ObjectId,
    ref: 'Repository'
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed', 'bounced', 'spam'],
    default: 'pending',
    index: true
  },
  error: String,
  spamScore: Number,
  metrics: {
    opens: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    lastOpened: Date,
    lastClicked: Date
  },
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### karma_transactions

```javascript
{
  _id: ObjectId,
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: [
      'post_upvote',
      'post_downvote',
      'comment_upvote',
      'comment_downvote',
      'curation_bonus',
      'milestone_bonus',
      'penalty'
    ],
    required: true,
    index: true
  },
  source: {
    post: {
      type: ObjectId,
      ref: 'Post'
    },
    comment: {
      type: ObjectId,
      ref: 'Comment'
    },
    milestone: String
  },
  description: String,
  balance: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}
```

### email_digests

```javascript
{
  _id: ObjectId,
  user: {
    type: ObjectId,
    ref: 'User',
    index: true
  },
  repository: {
    type: ObjectId,
    ref: 'Repository',
    index: true
  },
  type: {
    type: String,
    enum: ['user', 'repository'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true
  },
  posts: [{
    post: {
      type: ObjectId,
      ref: 'Post'
    },
    score: Number,
    commentCount: Number
  }],
  emailsSent: [{
    email: String,
    sentAt: Date,
    opened: Boolean,
    clicked: Boolean
  }],
  stats: {
    totalRecipients: Number,
    delivered: Number,
    opened: Number,
    clicked: Number,
    unsubscribed: Number
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  sentAt: Date,
  status: {
    type: String,
    enum: ['scheduled', 'processing', 'sent', 'failed'],
    default: 'scheduled',
    index: true
  },
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### csv_uploads

```javascript
{
  _id: ObjectId,
  filename: {
    type: String,
    required: true
  },
  repository: {
    type: ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  uploadedBy: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileSize: Number,
  mimeType: String,
  url: String,
  totalRows: {
    type: Number,
    default: 0
  },
  processedRows: {
    type: Number,
    default: 0
  },
  validEmails: {
    type: Number,
    default: 0
  },
  invalidEmails: {
    type: Number,
    default: 0
  },
  duplicateEmails: {
    type: Number,
    default: 0
  },
  newEmails: {
    type: Number,
    default: 0
  },
  columns: [String],
  mapping: {
    email: String,
    name: String,
    organization: String,
    metadata: [String]
  },
  errors: [{
    row: Number,
    error: String,
    data: Object
  }],
  snowballStats: {
    enabled: Boolean,
    totalSnowballed: Number,
    repositories: [{
      repository: ObjectId,
      count: Number
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}
```

### notifications

```javascript
{
  _id: ObjectId,
  recipient: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'comment_reply',
      'post_upvote',
      'mention',
      'follow',
      'repository_invite',
      'milestone',
      'digest_ready'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    post: {
      type: ObjectId,
      ref: 'Post'
    },
    comment: {
      type: ObjectId,
      ref: 'Comment'
    },
    user: {
      type: ObjectId,
      ref: 'User'
    },
    repository: {
      type: ObjectId,
      ref: 'Repository'
    }
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  emailSent: {
    type: Boolean,
    default: false
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    index: true
  }
}
```

### sessions

```javascript
{
  _id: ObjectId,
  sessionId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userAgent: String,
  ip: String,
  deviceInfo: {
    type: String,
    browser: String,
    os: String,
    device: String
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## Indexes

### Compound Indexes

```javascript
// posts
db.posts.createIndex({ "author": 1, "createdAt": -1 })
db.posts.createIndex({ "hashtags": 1, "score": -1 })
db.posts.createIndex({ "repository": 1, "createdAt": -1 })
db.posts.createIndex({ "type": 1, "status": 1, "createdAt": -1 })

// comments
db.comments.createIndex({ "post": 1, "createdAt": 1 })
db.comments.createIndex({ "author": 1, "createdAt": -1 })
db.comments.createIndex({ "post": 1, "parent": 1 })
db.comments.createIndex({ "post": 1, "path": 1 })

// repositories
db.repositories.createIndex({ "topics": 1, "emailCount": -1 })
db.repositories.createIndex({ "owner": 1, "status": 1 })
db.repositories.createIndex({ "emails.email": 1 })

// emails
db.emails.createIndex({ "user": 1, "type": 1, "createdAt": -1 })
db.emails.createIndex({ "processed": 1, "createdAt": 1 })

// karma_transactions
db.karma_transactions.createIndex({ "user": 1, "createdAt": -1 })
db.karma_transactions.createIndex({ "user": 1, "type": 1 })

// notifications
db.notifications.createIndex({ "recipient": 1, "read": 1, "createdAt": -1 })
db.notifications.createIndex({ "recipient": 1, "type": 1 })

// sessions
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

### Text Indexes

```javascript
db.posts.createIndex({ "title": "text", "text": "text" })
db.users.createIndex({ "username": "text", "profile.displayName": "text" })
db.repositories.createIndex({ "name": "text", "description": "text" })
```

## Aggregation Pipelines

### Trending Posts Pipeline

```javascript
db.posts.aggregate([
  {
    $match: {
      status: "active",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  },
  {
    $addFields: {
      trendingScore: {
        $add: [
          "$score",
          { $multiply: ["$commentCount", 2] },
          { $multiply: ["$analytics.views", 0.1] }
        ]
      }
    }
  },
  {
    $sort: { trendingScore: -1 }
  },
  {
    $limit: 50
  },
  {
    $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "author"
    }
  },
  {
    $unwind: "$author"
  }
])
```

### Repository Growth Pipeline

```javascript
db.repositories.aggregate([
  {
    $match: { status: "active" }
  },
  {
    $unwind: "$emails"
  },
  {
    $match: {
      "emails.addedAt": { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: "$_id",
      weeklyGrowth: { $sum: 1 },
      sources: {
        $push: "$emails.source"
      }
    }
  },
  {
    $project: {
      weeklyGrowth: 1,
      snowballCount: {
        $size: {
          $filter: {
            input: "$sources",
            cond: { $eq: ["$$this", "snowball"] }
          }
        }
      }
    }
  }
])
```

### User Karma Leaderboard Pipeline

```javascript
db.users.aggregate([
  {
    $match: { "karma.total": { $gt: 0 } }
  },
  {
    $project: {
      username: 1,
      "profile.displayName": 1,
      "profile.avatar": 1,
      karma: 1,
      karmaPerDay: {
        $divide: [
          "$karma.total",
          { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24] }
        ]
      }
    }
  },
  {
    $sort: { "karma.total": -1 }
  },
  {
    $limit: 100
  }
])
```

## Migration Scripts

### Add Email Verification Fields

```javascript
db.users.updateMany(
  { emailVerified: { $exists: false } },
  {
    $set: {
      emailVerified: false,
      emailVerificationToken: null
    }
  }
)
```

### Update Repository Email Count

```javascript
db.repositories.aggregate([
  {
    $project: {
      emailCount: { $size: "$emails" },
      verifiedEmailCount: {
        $size: {
          $filter: {
            input: "$emails",
            cond: { $eq: ["$$this.verified", true] }
          }
        }
      }
    }
  },
  {
    $merge: {
      into: "repositories",
      on: "_id",
      whenMatched: "merge"
    }
  }
])
```

## Performance Considerations

1. **Sharding Strategy**
   - Shard key for posts: `{ author: 1, _id: 1 }`
   - Shard key for comments: `{ post: 1, _id: 1 }`
   - Shard key for users: `{ _id: "hashed" }`

2. **Collection Sizes**
   - Posts: ~10GB expected in year 1
   - Comments: ~15GB expected in year 1
   - Emails: ~50GB expected in year 1 (consider archiving)

3. **Read/Write Patterns**
   - Heavy read on posts/comments
   - Write burst during email digest sending
   - Consider read replicas for analytics

4. **TTL Indexes**
   - Sessions: 30 days
   - Notifications: 90 days
   - Email verification tokens: 24 hours

5. **Caching Strategy**
   - Cache hot posts for 5 minutes
   - Cache user profiles for 1 hour
   - Cache repository stats for 15 minutes
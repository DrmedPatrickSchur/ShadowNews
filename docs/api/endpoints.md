<!--
============================================================================
ShadowNews - Complete API Endpoints Documentation
============================================================================

Comprehensive reference for all ShadowNews RESTful API endpoints, including
request/response formats, authentication requirements, and integration examples.

Purpose:
- Complete API endpoint reference with detailed specifications
- Request/response schemas with validation rules
- Error handling patterns and HTTP status codes
- Rate limiting and pagination documentation
- Integration examples for common use cases

Target Audience:
- Frontend developers building client applications
- Backend developers maintaining API services
- Mobile developers implementing native apps
- Third-party integrators using the ShadowNews API
- QA engineers writing API tests

Coverage:
- Authentication and user management endpoints
- Posts and content management APIs
- Repository and email processing endpoints
- Real-time WebSocket event specifications
- Karma system and community features
- Administrative and moderation tools

Technical Details:
- RESTful design principles and conventions
- JSON request/response format specifications
- OAuth 2.0 and JWT authentication standards
- HTTP status code usage and error responses
- API versioning and backward compatibility

Last Updated: 2025-07-27
Version: 1.0.0
============================================================================
-->

# ShadowNews API Endpoints Documentation

## Base URL
```
Production: https://api.shadownews.community/v1
Development: http://localhost:3001/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "shadownewsEmail": "johndoe@shadownews.community",
      "karma": 0,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "shadownewsEmail": "johndoe@shadownews.community",
      "karma": 150
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout
Logout current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/refresh
Refresh authentication token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### POST /auth/verify-email
Verify email address.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## User Endpoints

### GET /users/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "user@example.com",
    "shadownewsEmail": "johndoe@shadownews.community",
    "bio": "Tech enthusiast and AI researcher",
    "karma": 1250,
    "badges": ["early_adopter", "golden_curator"],
    "joinedAt": "2024-01-15T10:30:00Z",
    "repositories": 3,
    "posts": 45,
    "comments": 123,
    "settings": {
      "emailDigest": "daily",
      "publicEmail": false,
      "theme": "dark"
    }
  }
}
```

### GET /users/:username
Get user profile by username.

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "johndoe",
    "bio": "Tech enthusiast and AI researcher",
    "karma": 1250,
    "badges": ["early_adopter", "golden_curator"],
    "joinedAt": "2024-01-15T10:30:00Z",
    "repositories": 3,
    "posts": 45
  }
}
```

### PUT /users/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "website": "https://johndoe.com",
  "location": "San Francisco, CA",
  "twitter": "@johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "bio": "Updated bio text",
    "website": "https://johndoe.com",
    "location": "San Francisco, CA",
    "twitter": "@johndoe"
  }
}
```

### PUT /users/settings
Update user settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emailDigest": "weekly",
  "publicEmail": true,
  "theme": "light",
  "notifications": {
    "comments": true,
    "mentions": true,
    "repositoryUpdates": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

### DELETE /users/account
Delete user account.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "CurrentPassword123!",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Posts Endpoints

### GET /posts
Get posts with pagination and filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 30)
- `sort` (options: hot, new, top, rising) (default: hot)
- `period` (for top: day, week, month, year, all) (default: day)
- `hashtag` (filter by hashtag)
- `repository` (filter by repository ID)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Building a Better Hacker News",
        "url": "https://example.com/article",
        "text": null,
        "author": {
          "id": "507f1f77bcf86cd799439011",
          "username": "johndoe"
        },
        "score": 142,
        "commentCount": 23,
        "hashtags": ["#webdev", "#startup"],
        "repository": {
          "id": "507f1f77bcf86cd799439013",
          "name": "Tech Startups",
          "emailCount": 1523
        },
        "createdAt": "2024-03-20T14:30:00Z",
        "userVote": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 2450,
      "pages": 82
    }
  }
}
```

### GET /posts/:id
Get single post with comments.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Building a Better Hacker News",
    "url": "https://example.com/article",
    "text": null,
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "karma": 1250
    },
    "score": 142,
    "commentCount": 23,
    "hashtags": ["#webdev", "#startup"],
    "repository": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Tech Startups",
      "emailCount": 1523
    },
    "aiSummary": "An article discussing improvements to news aggregation platforms...",
    "createdAt": "2024-03-20T14:30:00Z",
    "updatedAt": "2024-03-20T14:30:00Z",
    "userVote": 1,
    "comments": [
      {
        "id": "507f1f77bcf86cd799439014",
        "text": "Great insights on community building!",
        "author": {
          "id": "507f1f77bcf86cd799439015",
          "username": "alice",
          "karma": 890
        },
        "score": 15,
        "createdAt": "2024-03-20T15:00:00Z",
        "userVote": 0,
        "children": []
      }
    ]
  }
}
```

### POST /posts
Create a new post.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Building a Better Hacker News",
  "url": "https://example.com/article",
  "text": "Optional text for discussion posts",
  "hashtags": ["#webdev", "#startup"],
  "repositoryId": "507f1f77bcf86cd799439013"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Building a Better Hacker News",
    "url": "https://example.com/article",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe"
    },
    "score": 1,
    "hashtags": ["#webdev", "#startup"],
    "createdAt": "2024-03-20T14:30:00Z"
  }
}
```

### PUT /posts/:id
Update a post (within 5 minutes of creation).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated title",
  "text": "Updated text content",
  "hashtags": ["#webdev", "#startup", "#ai"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Updated title",
    "text": "Updated text content",
    "hashtags": ["#webdev", "#startup", "#ai"],
    "updatedAt": "2024-03-20T14:35:00Z"
  }
}
```

### DELETE /posts/:id
Delete a post (author or admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### POST /posts/:id/vote
Vote on a post.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "direction": 1
}
```
*Note: direction can be 1 (upvote), 0 (remove vote), or -1 (downvote)*

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 143,
    "userVote": 1
  }
}
```

---

## Comments Endpoints

### GET /posts/:postId/comments
Get comments for a post.

**Query Parameters:**
- `sort` (options: best, new, controversial) (default: best)
- `limit` (default: 200)

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "507f1f77bcf86cd799439014",
        "text": "Great insights on community building!",
        "author": {
          "id": "507f1f77bcf86cd799439015",
          "username": "alice",
          "karma": 890
        },
        "score": 15,
        "createdAt": "2024-03-20T15:00:00Z",
        "userVote": 0,
        "children": [
          {
            "id": "507f1f77bcf86cd799439016",
            "text": "I agree, especially the point about...",
            "author": {
              "id": "507f1f77bcf86cd799439017",
              "username": "bob",
              "karma": 456
            },
            "score": 8,
            "createdAt": "2024-03-20T15:30:00Z",
            "userVote": 1,
            "children": []
          }
        ]
      }
    ]
  }
}
```

### POST /comments
Create a new comment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "postId": "507f1f77bcf86cd799439012",
  "parentId": "507f1f77bcf86cd799439014",
  "text": "I agree with your point about community engagement..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439018",
    "text": "I agree with your point about community engagement...",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe"
    },
    "score": 1,
    "createdAt": "2024-03-20T16:00:00Z"
  }
}
```

### PUT /comments/:id
Edit a comment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Updated comment text with corrections..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439018",
    "text": "Updated comment text with corrections...",
    "updatedAt": "2024-03-20T16:05:00Z",
    "edited": true
  }
}
```

### DELETE /comments/:id
Delete a comment.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### POST /comments/:id/vote
Vote on a comment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "direction": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 16,
    "userVote": 1
  }
}
```

---

## Repository Endpoints

### GET /repositories
Get all repositories.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `sort` (options: popular, new, growing, active) (default: popular)
- `category` (filter by category)
- `search` (search by name or description)

**Response:**
```json
{
  "success": true,
  "data": {
    "repositories": [
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "AI Healthcare",
        "description": "Connecting healthcare professionals interested in AI",
        "category": "Healthcare",
        "emailCount": 2341,
        "memberCount": 187,
        "growthRate": 15.3,
        "owner": {
          "id": "507f1f77bcf86cd799439011",
          "username": "johndoe"
        },
        "hashtags": ["#ai", "#healthcare", "#medtech"],
        "privacy": "public",
        "createdAt": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

### GET /repositories/:id
Get single repository details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "AI Healthcare",
    "description": "Connecting healthcare professionals interested in AI",
    "category": "Healthcare",
    "emailCount": 2341,
    "verifiedEmailCount": 2102,
    "memberCount": 187,
    "activeMembers": 134,
    "growthRate": 15.3,
    "owner": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe"
    },
    "moderators": [
      {
        "id": "507f1f77bcf86cd799439019",
        "username": "alice"
      }
    ],
    "hashtags": ["#ai", "#healthcare", "#medtech"],
    "privacy": "public",
    "settings": {
      "autoApprove": false,
      "minKarmaToJoin": 50,
      "allowSnowball": true,
      "digestFrequency": "weekly"
    },
    "stats": {
      "postsThisWeek": 23,
      "topContributors": [
        {
          "id": "507f1f77bcf86cd799439011",
          "username": "johndoe",
          "contributions": 45
        }
      ],
      "growthHistory": [
        {
          "date": "2024-03-01",
          "emailCount": 1950,
          "memberCount": 145
        }
      ]
    },
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

### POST /repositories
Create a new repository.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Blockchain Developers",
  "description": "A community for blockchain developers and enthusiasts",
  "category": "Technology",
  "hashtags": ["#blockchain", "#web3", "#crypto"],
  "privacy": "public",
  "initialEmails": ["dev1@example.com", "dev2@example.com"],
  "settings": {
    "autoApprove": true,
    "minKarmaToJoin": 10,
    "allowSnowball": true,
    "digestFrequency": "daily"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Blockchain Developers",
    "description": "A community for blockchain developers and enthusiasts",
    "emailCount": 2,
    "memberCount": 1,
    "owner": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe"
    },
    "createdAt": "2024-03-20T17:00:00Z"
  }
}
```

### PUT /repositories/:id
Update repository settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "Updated description",
  "hashtags": ["#blockchain", "#web3", "#defi"],
  "settings": {
    "autoApprove": false,
    "minKarmaToJoin": 25,
    "digestFrequency": "weekly"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repository updated successfully"
}
```

### DELETE /repositories/:id
Delete a repository (owner only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Repository deleted successfully"
}
```

### POST /repositories/:id/join
Join a repository.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined repository"
}
```

### POST /repositories/:id/leave
Leave a repository.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Successfully left repository"
}
```

### GET /repositories/:id/members
Get repository members.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `role` (options: all, owner, moderator, member) (default: all)

**Response:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "role": "owner",
        "karma": 1250,
        "joinedAt": "2024-01-20T10:00:00Z",
        "contributions": 45
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 187,
      "pages": 4
    }
  }
}
```

### POST /repositories/:id/invite
Invite users to repository.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emails": ["newuser1@example.com", "newuser2@example.com"],
  "message": "Join our blockchain developer community!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invited": 2,
    "alreadyMembers": 0,
    "invalid": 0
  }
}
```

---

## Email Endpoints

### POST /email/post
Create a post via email.

**Headers:** `X-Email-Token: <email-specific-token>`

**Request Body:**
```json
{
  "from": "johndoe@shadownews.community",
  "subject": "Interesting article about AI ethics",
  "body": "Check out this fascinating piece on AI ethics: https://example.com/ai-ethics",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "507f1f77bcf86cd799439021",
    "message": "Post created successfully"
  }
}
```

### POST /email/comment
Reply to a post via email.

**Headers:** `X-Email-Token: <email-specific-token>`

**Request Body:**
```json
{
  "from": "johndoe@shadownews.community",
  "to": "post-507f1f77bcf86cd799439012@shadownews.community",
  "subject": "Re: Building a Better Hacker News",
  "body": "Great points! I especially liked the part about...",
  "inReplyTo": "<post-507f1f77bcf86cd799439012@shadownews.community>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commentId": "507f1f77bcf86cd799439022",
    "message": "Comment posted successfully"
  }
}
```

### GET /email/settings
Get email settings for user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "shadownewsEmail": "johndoe@shadownews.community",
    "digestFrequency": "daily",
    "digestTime": "09:00",
    "instantNotifications": {
      "replies": true,
      "mentions": true,
      "repositoryUpdates": false
    },
    "emailCommands": true
  }
}
```

### PUT /email/settings
Update email settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "digestFrequency": "weekly",
  "digestTime": "10:00",
  "instantNotifications": {
    "replies": false,
    "mentions": true,
    "repositoryUpdates": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email settings updated successfully"
}
```

### POST /email/digest/preview
Preview email digest.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Your Shadownews Daily Digest - 5 trending posts",
    "previewText": "Top stories from AI Healthcare, Blockchain, and more...",
    "htmlContent": "<html>...</html>",
    "posts": [
      {
        "title": "Breaking: New AI Model Achieves...",
        "score": 234,
        "commentCount": 45,
        "repository": "AI Research"
      }
    ]
  }
}
```

---

## CSV Endpoints

### POST /csv/upload
Upload CSV file with emails.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
FormData:
- file: emails.csv
- repositoryId: "507f1f77bcf86cd799439013"
- hasHeaders: true
- emailColumn: 0
- nameColumn: 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 250,
    "added": 223,
    "duplicates": 20,
    "invalid": 7,
    "emails": [
      {
        "email": "newuser@example.com",
        "name": "New User",
        "status": "added"
      }
    ]
  }
}
```

### GET /csv/download/:repositoryId
Download repository emails as CSV.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `format` (options: csv, xlsx) (default: csv)
- `includeStats` (default: false)

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="ai-healthcare-2024-03-20.csv"

email,name,joined_date,karma,posts_count
user1@example.com,"John Doe","2024-01-15",1250,45
user2@example.com,"Jane Smith","2024-02-01",890,23
```

### POST /csv/validate
Validate CSV file before upload.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
FormData:
- file: emails.csv
- hasHeaders: true
- emailColumn: 0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "totalRows": 250,
    "validEmails": 243,
    "invalidEmails": 7,
    "duplicates": 20,
    "issues": [
      {
        "row": 15,
        "email": "invalid-email",
        "issue": "Invalid email format"
      }
    ]
  }
}
```

---

## Search Endpoints

### GET /search
Search posts, comments, and repositories.

**Query Parameters:**
- `q` (search query) *required*
- `type` (options: all, posts, comments, repositories, users) (default: all)
- `sort` (options: relevance, date, score) (default: relevance)
- `dateRange` (options: day, week, month, year, all) (default: all)
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "post",
        "id": "507f1f77bcf86cd799439012",
        "title": "Building a Better Hacker News",
        "snippet": "...discussing improvements to news aggregation platforms...",
        "score": 142,
        "author": "johndoe",
        "createdAt": "2024-03-20T14:30:00Z"
      },
      {
        "type": "repository",
        "id": "507f1f77bcf86cd799439013",
        "name": "AI Healthcare",
        "snippet": "...healthcare professionals interested in AI...",
        "emailCount": 2341,
        "memberCount": 187
      }
    ],
    "facets": {
      "types": {
        "posts": 145,
        "comments": 89,
        "repositories": 12,
        "users": 5
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 251,
      "pages": 13
    }
  }
}
```

### GET /search/suggestions
Get search suggestions.

**Query Parameters:**
- `q` (partial search query) *required*

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "machine learning",
      "machine learning python",
      "machine learning healthcare",
      "machine vision"
    ]
  }
}
```

---

## Analytics Endpoints

### GET /analytics/user
Get user analytics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (options: week, month, year) (default: month)

**Response:**
```json
{
  "success": true,
  "data": {
    "karma": {
      "current": 1250,
      "change": 125,
      "percentChange": 11.1,
      "history": [
        {
          "date": "2024-03-01",
          "karma": 1125
        }
      ]
    },
    "posts": {
      "total": 45,
      "thisMonth": 5,
      "avgScore": 87.3,
      "topPost": {
        "id": "507f1f77bcf86cd799439012",
        "title": "Building a Better Hacker News",
        "score": 142
      }
    },
    "repositories": {
      "owned": 3,
      "member": 12,
      "totalEmails": 5234,
      "growthRate": 15.3
    },
    "engagement": {
      "postsViewed": 234,
      "votesGiven": 145,
      "commentsWritten": 67,
      "activeMinutes": 2340
    }
  }
}
```

### GET /analytics/repository/:id
Get repository analytics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (options: week, month, year) (default: month)

**Response:**
```json
{
  "success": true,
  "data": {
    "growth": {
      "emails": {
        "current": 2341,
        "added": 234,
        "removed": 12,
        "net": 222
      },
      "members": {
        "current": 187,
        "new": 23,
        "left": 2,
        "net": 21
      }
    },
    "engagement": {
      "postsCreated": 89,
      "avgPostScore": 67.4,
      "topContributors": [
        {
          "username": "johndoe",
          "posts": 12,
          "avgScore": 89.3
        }
      ]
    },
    "snowball": {
      "totalShares": 45,
      "avgMultiplier": 4.7,
      "topSources": [
        {
          "email": "influencer@example.com",
          "contributed": 123
        }
      ]
    },
    "digest": {
      "openRate": 45.6,
      "clickRate": 23.4,
      "unsubscribeRate": 1.2
    }
  }
}
```

### GET /analytics/platform
Get platform-wide analytics (admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 12453,
      "active": 3421,
      "new": 234
    },
    "posts": {
      "total": 45234,
      "today": 234,
      "trending": 15
    },
    "repositories": {
      "total": 567,
      "active": 423,
      "totalEmails": 1234567
    },
    "health": {
      "avgResponseTime": 45,
      "uptime": 99.98,
      "queueSize": 23
    }
  }
}
```

---

## AI Endpoints

### POST /ai/hashtags
Get AI-suggested hashtags for content.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Building a Better Hacker News",
  "content": "This article discusses improvements to news aggregation platforms...",
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hashtags": ["#webdev", "#startup", "#community", "#aggregation"],
    "confidence": 0.89
  }
}
```

### POST /ai/summary
Get AI-generated summary of content.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "url": "https://example.com/long-article",
  "maxLength": 280
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "The article explores innovative approaches to community-driven news aggregation, focusing on decentralized curation and the network effects of email-based distribution systems.",
    "keyPoints": [
      "Decentralized content curation",
      "Email-based distribution",
      "Network effects in communities"
    ]
  }
}
```

### POST /ai/classify
Classify content into repository categories.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New AI Model for Medical Diagnosis",
  "content": "Researchers have developed a new AI model...",
  "currentRepositories": ["507f1f77bcf86cd799439013"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestedRepositories": [
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "AI Healthcare",
        "confidence": 0.95
      },
      {
        "id": "507f1f77bcf86cd799439023",
        "name": "Machine Learning Research",
        "confidence": 0.78
      }
    ]
  }
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.shadownews.community', {
  auth: {
    token: 'Bearer <token>'
  }
});
```

### Events

#### Subscribe to post updates
```javascript
// Client -> Server
socket.emit('subscribe:post', { postId: '507f1f77bcf86cd799439012' });

// Server -> Client
socket.on('post:updated', (data) => {
  // data: { postId, score, commentCount }
});

socket.on('comment:added', (data) => {
  // data: { postId, comment }
});
```

#### Subscribe to repository updates
```javascript
// Client -> Server
socket.emit('subscribe:repository', { repositoryId: '507f1f77bcf86cd799439013' });

// Server -> Client
socket.on('repository:updated', (data) => {
  // data: { repositoryId, emailCount, memberCount }
});

socket.on('repository:newPost', (data) => {
  // data: { repositoryId, post }
});
```

#### Real-time notifications
```javascript
// Server -> Client
socket.on('notification', (data) => {
  // data: { type, title, message, link }
});
```

---

## Rate Limiting

| Endpoint Type | Authenticated | Unauthenticated |
|--------------|---------------|-----------------|
| GET requests | 1000/hour | 100/hour |
| POST requests | 200/hour | 20/hour |
| Email endpoints | 100/hour | N/A |
| CSV uploads | 10/hour | N/A |
| AI endpoints | 50/hour | N/A |

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1616544000
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error
- `EMAIL_VERIFICATION_REQUIRED` - Email not verified
- `INSUFFICIENT_KARMA` - Not enough karma for action

---

## API Versioning

The API uses URL versioning. Current version: `v1`

Deprecated endpoints will include:
```
X-API-Deprecation-Date: 2024-12-31
X-API-Deprecation-Info: https://docs.shadownews.community/api/deprecations
```

---

## CORS Policy

Allowed origins:
- `https://shadownews.community`
- `https://app.shadownews.community`
- `http://localhost:3000` (development)

Allowed methods: `GET, POST, PUT, DELETE, OPTIONS`

Allowed headers: `Content-Type, Authorization, X-Email-Token`
<!--
============================================================================
ShadowNews - WebSocket Real-Time API Documentation
============================================================================

Comprehensive documentation for ShadowNews real-time WebSocket API, covering
live updates, event handling, and real-time collaboration features.

Purpose:
- Define WebSocket connection protocols and authentication
- Document real-time event types and message formats
- Provide integration patterns for live updates
- Establish best practices for connection management

Target Audience:
- Frontend developers implementing real-time features
- Backend developers maintaining WebSocket services
- Mobile developers building live update functionality
- System architects designing real-time systems

Coverage:
- WebSocket connection establishment and authentication
- Real-time post updates and comment notifications
- Live repository monitoring and email processing events
- User presence and activity tracking
- System notifications and broadcast messages
- Error handling and reconnection strategies

Technical Features:
- Socket.io-based WebSocket implementation
- JWT-based authentication for secure connections
- Event-driven architecture with typed message formats
- Automatic reconnection and error recovery
- Room-based event broadcasting and user targeting
- Rate limiting and connection management

Last Updated: 2025-07-27
Version: 1.0.0
============================================================================
-->

# WebSocket API Documentation

## Overview

The Shadownews WebSocket API provides real-time updates for posts, comments, notifications, and repository changes. Connect to receive live updates without polling.

## Connection

### Endpoint
```
wss://api.artofdigitalshadow.org/shadownews/ws
```

### Authentication
```javascript
const socket = io('wss://api.artofdigitalshadow.org/shadownews', {
  auth: {
    token: 'Bearer YOUR_JWT_TOKEN'
  },
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

### Connection Events

#### connect
```javascript
socket.on('connect', () => {
  console.log('Connected with ID:', socket.id);
});
```

#### disconnect
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

#### error
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Channels

### Post Channel

#### Subscribe to all posts
```javascript
socket.emit('subscribe', {
  channel: 'posts:all'
});
```

#### Subscribe to specific hashtags
```javascript
socket.emit('subscribe', {
  channel: 'posts:hashtag',
  hashtags: ['#AI', '#MachineLearning']
});
```

#### Subscribe to repository posts
```javascript
socket.emit('subscribe', {
  channel: 'posts:repository',
  repositoryId: 'repo_123'
});
```

### Events

#### post:created
```javascript
socket.on('post:created', (data) => {
  // {
  //   id: 'post_123',
  //   title: 'New AI breakthrough',
  //   author: {
  //     id: 'user_456',
  //     username: 'elena_ai',
  //     karma: 1250
  //   },
  //   content: '...',
  //   hashtags: ['#AI', '#Research'],
  //   repository: 'repo_789',
  //   createdAt: '2025-01-20T10:30:00Z',
  //   votes: 1,
  //   commentCount: 0
  // }
});
```

#### post:updated
```javascript
socket.on('post:updated', (data) => {
  // {
  //   id: 'post_123',
  //   updates: {
  //     title: 'Updated title',
  //     content: 'Updated content',
  //     editedAt: '2025-01-20T10:35:00Z'
  //   }
  // }
});
```

#### post:deleted
```javascript
socket.on('post:deleted', (data) => {
  // {
  //   id: 'post_123',
  //   deletedAt: '2025-01-20T10:40:00Z'
  // }
});
```

#### post:voted
```javascript
socket.on('post:voted', (data) => {
  // {
  //   postId: 'post_123',
  //   votes: 42,
  //   userVote: 1, // 1 = upvote, -1 = downvote, 0 = no vote
  //   voters: {
  //     up: 45,
  //     down: 3
  //   }
  // }
});
```

### Comment Channel

#### Subscribe to post comments
```javascript
socket.emit('subscribe', {
  channel: 'comments:post',
  postId: 'post_123'
});
```

#### Subscribe to user's comments
```javascript
socket.emit('subscribe', {
  channel: 'comments:user',
  userId: 'user_456'
});
```

### Events

#### comment:created
```javascript
socket.on('comment:created', (data) => {
  // {
  //   id: 'comment_123',
  //   postId: 'post_456',
  //   parentId: 'comment_789', // null for top-level
  //   author: {
  //     id: 'user_123',
  //     username: 'marcus_startup',
  //     karma: 850
  //   },
  //   content: '...',
  //   createdAt: '2025-01-20T11:00:00Z',
  //   depth: 1,
  //   votes: 1
  // }
});
```

#### comment:updated
```javascript
socket.on('comment:updated', (data) => {
  // {
  //   id: 'comment_123',
  //   content: 'Updated comment content',
  //   editedAt: '2025-01-20T11:05:00Z'
  // }
});
```

#### comment:deleted
```javascript
socket.on('comment:deleted', (data) => {
  // {
  //   id: 'comment_123',
  //   postId: 'post_456',
  //   deletedAt: '2025-01-20T11:10:00Z'
  // }
});
```

### Repository Channel

#### Subscribe to repository updates
```javascript
socket.emit('subscribe', {
  channel: 'repository',
  repositoryId: 'repo_123'
});
```

#### Subscribe to user's repositories
```javascript
socket.emit('subscribe', {
  channel: 'repository:user',
  userId: 'user_456'
});
```

### Events

#### repository:emailAdded
```javascript
socket.on('repository:emailAdded', (data) => {
  // {
  //   repositoryId: 'repo_123',
  //   emails: [
  //     {
  //       email: 'newuser@example.com',
  //       source: 'snowball',
  //       addedBy: 'user_456',
  //       verified: true
  //     }
  //   ],
  //   totalEmails: 1247,
  //   growth: {
  //     daily: 23,
  //     weekly: 156,
  //     monthly: 623
  //   }
  // }
});
```

#### repository:csvUploaded
```javascript
socket.on('repository:csvUploaded', (data) => {
  // {
  //   repositoryId: 'repo_123',
  //   fileName: 'conference_attendees.csv',
  //   emailsAdded: 47,
  //   emailsSkipped: 3,
  //   uploadedBy: 'user_456',
  //   timestamp: '2025-01-20T12:00:00Z'
  // }
});
```

#### repository:snowballTriggered
```javascript
socket.on('repository:snowballTriggered', (data) => {
  // {
  //   repositoryId: 'repo_123',
  //   trigger: {
  //     type: 'share',
  //     sharedBy: 'user_789',
  //     recipientCount: 25
  //   },
  //   potentialReach: 1250,
  //   actualAdded: 0, // Updates as emails verify
  //   status: 'processing'
  // }
});
```

#### repository:statsUpdated
```javascript
socket.on('repository:statsUpdated', (data) => {
  // {
  //   repositoryId: 'repo_123',
  //   stats: {
  //     totalEmails: 2456,
  //     activeUsers: 367,
  //     engagementRate: 0.15,
  //     lastActivity: '2025-01-20T12:30:00Z',
  //     topContributors: [
  //       { userId: 'user_123', emails: 234 },
  //       { userId: 'user_456', emails: 189 }
  //     ]
  //   }
  // }
});
```

### Notification Channel

#### Subscribe to user notifications
```javascript
socket.emit('subscribe', {
  channel: 'notifications',
  userId: 'user_123' // Must be authenticated user
});
```

### Events

#### notification:new
```javascript
socket.on('notification:new', (data) => {
  // {
  //   id: 'notif_123',
  //   type: 'comment_reply',
  //   title: 'Elena replied to your comment',
  //   message: 'Great point about the transformer architecture...',
  //   link: '/posts/post_456#comment_789',
  //   read: false,
  //   createdAt: '2025-01-20T13:00:00Z',
  //   metadata: {
  //     postId: 'post_456',
  //     commentId: 'comment_789',
  //     authorId: 'user_234'
  //   }
  // }
});
```

#### notification:karma
```javascript
socket.on('notification:karma', (data) => {
  // {
  //   type: 'karma_milestone',
  //   milestone: 1000,
  //   reward: 'repository_creation',
  //   message: 'Congratulations! You can now create repositories',
  //   currentKarma: 1001,
  //   nextMilestone: 5000
  // }
});
```

### Email Activity Channel

#### Subscribe to email activity
```javascript
socket.emit('subscribe', {
  channel: 'email:activity',
  userId: 'user_123'
});
```

### Events

#### email:received
```javascript
socket.on('email:received', (data) => {
  // {
  //   id: 'email_123',
  //   from: 'user@example.com',
  //   subject: 'Re: AI Healthcare Summit',
  //   preview: 'Thanks for sharing this...',
  //   processedAs: 'comment',
  //   targetPost: 'post_456',
  //   status: 'published',
  //   timestamp: '2025-01-20T14:00:00Z'
  // }
});
```

#### email:digestSent
```javascript
socket.on('email:digestSent', (data) => {
  // {
  //   digestId: 'digest_123',
  //   recipientCount: 1247,
  //   topics: ['#AI', '#Healthcare'],
  //   postsIncluded: 5,
  //   nextDigest: '2025-01-27T09:00:00Z'
  // }
});
```

### Live Feed Channel

#### Subscribe to live feed
```javascript
socket.emit('subscribe', {
  channel: 'feed:live',
  filters: {
    hashtags: ['#AI', '#Startups'],
    minKarma: 100,
    repositories: ['repo_123', 'repo_456']
  }
});
```

### Events

#### feed:activity
```javascript
socket.on('feed:activity', (data) => {
  // {
  //   type: 'post_trending',
  //   post: {
  //     id: 'post_123',
  //     title: 'Breaking: New AI model released',
  //     velocity: 45, // upvotes per hour
  //     commentVelocity: 12 // comments per hour
  //   },
  //   timestamp: '2025-01-20T15:00:00Z'
  // }
});
```

## Emitting Events

### Create Post via WebSocket
```javascript
socket.emit('post:create', {
  title: 'Announcing our new AI tool',
  content: '...',
  hashtags: ['#AI', '#Tools'],
  repositoryId: 'repo_123'
}, (response) => {
  if (response.success) {
    console.log('Post created:', response.data.id);
  } else {
    console.error('Error:', response.error);
  }
});
```

### Quick Vote
```javascript
socket.emit('post:vote', {
  postId: 'post_123',
  vote: 1 // 1 or -1
}, (response) => {
  console.log('New vote count:', response.data.votes);
});
```

### Add Email to Repository
```javascript
socket.emit('repository:addEmail', {
  repositoryId: 'repo_123',
  emails: ['newuser@example.com'],
  source: 'manual'
}, (response) => {
  console.log('Emails added:', response.data.added);
});
```

## Rate Limiting

### Connection Limits
- Max connections per user: 5
- Max subscriptions per connection: 20
- Max events per minute: 100

### Event Limits
```javascript
socket.on('rate_limit', (data) => {
  // {
  //   limit: 100,
  //   remaining: 23,
  //   resetAt: '2025-01-20T16:00:00Z'
  // }
});
```

## Error Handling

### Error Events
```javascript
socket.on('subscription_error', (error) => {
  // {
  //   code: 'UNAUTHORIZED',
  //   message: 'Not authorized for this channel',
  //   channel: 'repository:private'
  // }
});

socket.on('validation_error', (error) => {
  // {
  //   code: 'INVALID_DATA',
  //   field: 'hashtags',
  //   message: 'Hashtags must start with #'
  // }
});
```

## Reconnection Strategy

```javascript
socket.io.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  
  // Re-subscribe to channels
  resubscribeToChannels();
});

socket.io.on('reconnect_attempt', (attemptNumber) => {
  console.log('Attempting reconnection #', attemptNumber);
});

socket.io.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});

socket.io.on('reconnect_failed', () => {
  console.error('Failed to reconnect');
  // Fallback to REST API polling
});
```

## Client Libraries

### JavaScript/TypeScript
```bash
npm install socket.io-client
```

### Python
```bash
pip install python-socketio
```

### Mobile (React Native)
```bash
npm install socket.io-client
```

## Testing

### Test Connection
```javascript
const testSocket = io('wss://api.artofdigitalshadow.org/shadownews/ws', {
  auth: { token: 'test_token' }
});

testSocket.on('connect', () => {
  testSocket.emit('ping', Date.now(), (response) => {
    console.log('Latency:', Date.now() - response, 'ms');
  });
});
```

### Debug Mode
```javascript
const socket = io('wss://api.artofdigitalshadow.org/shadownews/ws', {
  debug: true, // Enable debug logs
  auth: { token: 'Bearer YOUR_TOKEN' }
});

socket.on('debug', (log) => {
  console.log('[WS Debug]', log);
});
```

## Performance Considerations

### Message Compression
All messages over 1KB are automatically compressed using permessage-deflate.

### Binary Data
CSV data and large payloads are sent as binary frames:
```javascript
socket.on('repository:csvData', (buffer) => {
  const csvContent = buffer.toString('utf-8');
  // Process CSV
});
```

### Heartbeat
Client must respond to ping within 30 seconds:
```javascript
socket.on('ping', () => {
  socket.emit('pong');
});
```
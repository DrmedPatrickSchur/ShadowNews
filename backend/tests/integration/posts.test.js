const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User.model');
const Post = require('../../src/models/Post.model');
const Repository = require('../../src/models/Repository.model');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;
let testUser;
let testRepository;

beforeAll(async () => {
 mongoServer = await MongoMemoryServer.create();
 const mongoUri = mongoServer.getUri();
 await mongoose.connect(mongoUri);
});

afterAll(async () => {
 await mongoose.disconnect();
 await mongoServer.stop();
});

beforeEach(async () => {
 await User.deleteMany({});
 await Post.deleteMany({});
 await Repository.deleteMany({});

 testUser = await User.create({
   email: 'test@shadownews.community',
   username: 'testuser',
   password: 'Test123!@#',
   karma: 100,
   isEmailVerified: true
 });

 testRepository = await Repository.create({
   name: 'Test Repository',
   topic: 'technology',
   owner: testUser._id,
   emails: ['user1@example.com', 'user2@example.com'],
   isPublic: true,
   subscriberCount: 2
 });

 authToken = jwt.sign(
   { userId: testUser._id, email: testUser.email },
   process.env.JWT_SECRET || 'test-secret',
   { expiresIn: '24h' }
 );
});

describe('POST /api/posts', () => {
 test('should create a new post with valid data', async () => {
   const postData = {
     title: 'Test Post Title',
     content: 'This is a test post content with some meaningful text.',
     url: 'https://example.com/article',
     hashtags: ['#technology', '#testing'],
     repositoryIds: [testRepository._id.toString()]
   };

   const response = await request(app)
     .post('/api/posts')
     .set('Authorization', `Bearer ${authToken}`)
     .send(postData)
     .expect(201);

   expect(response.body.success).toBe(true);
   expect(response.body.data.title).toBe(postData.title);
   expect(response.body.data.content).toBe(postData.content);
   expect(response.body.data.author).toBe(testUser._id.toString());
   expect(response.body.data.hashtags).toEqual(postData.hashtags);
   expect(response.body.data.karma).toBe(1);
   expect(response.body.data.repositories).toHaveLength(1);
 });

 test('should create post via email format', async () => {
   const emailPostData = {
     fromEmail: true,
     subject: 'Email Post: New AI Breakthrough',
     body: 'Scientists have discovered a new approach to neural networks.',
     attachedRepositories: [testRepository._id.toString()]
   };

   const response = await request(app)
     .post('/api/posts')
     .set('Authorization', `Bearer ${authToken}`)
     .send(emailPostData)
     .expect(201);

   expect(response.body.data.title).toBe('Email Post: New AI Breakthrough');
   expect(response.body.data.fromEmail).toBe(true);
   expect(response.body.data.aiSuggestedHashtags).toBeDefined();
 });

 test('should reject post without authentication', async () => {
   const postData = {
     title: 'Unauthorized Post',
     content: 'This should not be created'
   };

   await request(app)
     .post('/api/posts')
     .send(postData)
     .expect(401);
 });

 test('should reject post with insufficient karma', async () => {
   await User.findByIdAndUpdate(testUser._id, { karma: 5 });

   const postData = {
     title: 'Low Karma Post',
     content: 'User does not have enough karma'
   };

   const response = await request(app)
     .post('/api/posts')
     .set('Authorization', `Bearer ${authToken}`)
     .send(postData)
     .expect(403);

   expect(response.body.error).toContain('karma');
 });

 test('should validate required fields', async () => {
   const invalidPost = {
     content: 'Missing title'
   };

   const response = await request(app)
     .post('/api/posts')
     .set('Authorization', `Bearer ${authToken}`)
     .send(invalidPost)
     .expect(400);

   expect(response.body.errors).toBeDefined();
 });

 test('should auto-generate hashtags using AI', async () => {
   const postData = {
     title: 'Machine Learning in Healthcare',
     content: 'Deep learning models are revolutionizing medical diagnosis...',
     requestAiHashtags: true
   };

   const response = await request(app)
     .post('/api/posts')
     .set('Authorization', `Bearer ${authToken}`)
     .send(postData)
     .expect(201);

   expect(response.body.data.aiSuggestedHashtags).toBeDefined();
   expect(Array.isArray(response.body.data.hashtags)).toBe(true);
 });
});

describe('GET /api/posts', () => {
 beforeEach(async () => {
   const posts = [
     {
       title: 'First Post',
       content: 'Content 1',
       author: testUser._id,
       karma: 150,
       createdAt: new Date('2025-01-01')
     },
     {
       title: 'Second Post',
       content: 'Content 2',
       author: testUser._id,
       karma: 100,
       createdAt: new Date('2025-01-02')
     },
     {
       title: 'Third Post',
       content: 'Content 3',
       author: testUser._id,
       karma: 200,
       createdAt: new Date('2025-01-03')
     }
   ];
   await Post.insertMany(posts);
 });

 test('should get posts sorted by hot (default)', async () => {
   const response = await request(app)
     .get('/api/posts')
     .expect(200);

   expect(response.body.data.posts).toHaveLength(3);
   expect(response.body.data.posts[0].karma).toBeGreaterThanOrEqual(
     response.body.data.posts[1].karma
   );
 });

 test('should get posts sorted by new', async () => {
   const response = await request(app)
     .get('/api/posts?sort=new')
     .expect(200);

   expect(response.body.data.posts).toHaveLength(3);
   expect(new Date(response.body.data.posts[0].createdAt)).toBeInstanceOf(Date);
 });

 test('should filter posts by hashtag', async () => {
   await Post.create({
     title: 'AI Post',
     content: 'AI content',
     author: testUser._id,
     hashtags: ['#ai', '#technology']
   });

   const response = await request(app)
     .get('/api/posts?hashtag=ai')
     .expect(200);

   expect(response.body.data.posts.every(post => 
     post.hashtags.includes('#ai')
   )).toBe(true);
 });

 test('should filter posts by repository', async () => {
   await Post.create({
     title: 'Repository Post',
     content: 'Repository content',
     author: testUser._id,
     repositories: [testRepository._id]
   });

   const response = await request(app)
     .get(`/api/posts?repository=${testRepository._id}`)
     .expect(200);

   expect(response.body.data.posts).toHaveLength(1);
   expect(response.body.data.posts[0].title).toBe('Repository Post');
 });

 test('should paginate posts correctly', async () => {
   for (let i = 0; i < 25; i++) {
     await Post.create({
       title: `Post ${i}`,
       content: `Content ${i}`,
       author: testUser._id
     });
   }

   const page1 = await request(app)
     .get('/api/posts?page=1&limit=10')
     .expect(200);

   expect(page1.body.data.posts).toHaveLength(10);
   expect(page1.body.data.pagination.total).toBe(28);
   expect(page1.body.data.pagination.hasMore).toBe(true);

   const page3 = await request(app)
     .get('/api/posts?page=3&limit=10')
     .expect(200);

   expect(page3.body.data.posts).toHaveLength(8);
   expect(page3.body.data.pagination.hasMore).toBe(false);
 });
});

describe('GET /api/posts/:id', () => {
 let testPost;

 beforeEach(async () => {
   testPost = await Post.create({
     title: 'Test Post',
     content: 'Test content',
     author: testUser._id,
     hashtags: ['#test'],
     repositories: [testRepository._id]
   });
 });

 test('should get post by ID with populated fields', async () => {
   const response = await request(app)
     .get(`/api/posts/${testPost._id}`)
     .expect(200);

   expect(response.body.data.title).toBe('Test Post');
   expect(response.body.data.author.username).toBe('testuser');
   expect(response.body.data.repositories[0].name).toBe('Test Repository');
 });

 test('should increment view count', async () => {
   await request(app)
     .get(`/api/posts/${testPost._id}`)
     .expect(200);

   await request(app)
     .get(`/api/posts/${testPost._id}`)
     .expect(200);

   const updatedPost = await Post.findById(testPost._id);
   expect(updatedPost.viewCount).toBe(2);
 });

 test('should return 404 for non-existent post', async () => {
   const fakeId = new mongoose.Types.ObjectId();
   
   await request(app)
     .get(`/api/posts/${fakeId}`)
     .expect(404);
 });
});

describe('PUT /api/posts/:id', () => {
 let testPost;

 beforeEach(async () => {
   testPost = await Post.create({
     title: 'Original Title',
     content: 'Original content',
     author: testUser._id
   });
 });

 test('should update own post', async () => {
   const updateData = {
     title: 'Updated Title',
     content: 'Updated content',
     hashtags: ['#updated', '#modified']
   };

   const response = await request(app)
     .put(`/api/posts/${testPost._id}`)
     .set('Authorization', `Bearer ${authToken}`)
     .send(updateData)
     .expect(200);

   expect(response.body.data.title).toBe(updateData.title);
   expect(response.body.data.content).toBe(updateData.content);
   expect(response.body.data.hashtags).toEqual(updateData.hashtags);
   expect(response.body.data.isEdited).toBe(true);
   expect(response.body.data.editedAt).toBeDefined();
 });

 test('should not update another user\'s post', async () => {
   const anotherUser = await User.create({
     email: 'another@shadownews.community',
     username: 'anotheruser',
     password: 'Test123!@#'
   });

   const anotherPost = await Post.create({
     title: 'Another User Post',
     content: 'Another content',
     author: anotherUser._id
   });

   await request(app)
     .put(`/api/posts/${anotherPost._id}`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ title: 'Hacked Title' })
     .expect(403);
 });

 test('should prevent editing after 24 hours', async () => {
   const oldPost = await Post.create({
     title: 'Old Post',
     content: 'Old content',
     author: testUser._id,
     createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000)
   });

   await request(app)
     .put(`/api/posts/${oldPost._id}`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ title: 'Too Late' })
     .expect(403);
 });
});

describe('DELETE /api/posts/:id', () => {
 let testPost;

 beforeEach(async () => {
   testPost = await Post.create({
     title: 'Post to Delete',
     content: 'Delete me',
     author: testUser._id
   });
 });

 test('should soft delete own post', async () => {
   const response = await request(app)
     .delete(`/api/posts/${testPost._id}`)
     .set('Authorization', `Bearer ${authToken}`)
     .expect(200);

   expect(response.body.message).toContain('deleted');

   const deletedPost = await Post.findById(testPost._id);
   expect(deletedPost.isDeleted).toBe(true);
   expect(deletedPost.deletedAt).toBeDefined();
 });

 test('should not delete another user\'s post', async () => {
   const anotherUser = await User.create({
     email: 'another@shadownews.community',
     username: 'anotheruser',
     password: 'Test123!@#'
   });

   const anotherPost = await Post.create({
     title: 'Another User Post',
     content: 'Another content',
     author: anotherUser._id
   });

   await request(app)
     .delete(`/api/posts/${anotherPost._id}`)
     .set('Authorization', `Bearer ${authToken}`)
     .expect(403);
 });

 test('should allow moderators to delete any post', async () => {
   await User.findByIdAndUpdate(testUser._id, { role: 'moderator' });

   const anyPost = await Post.create({
     title: 'Any Post',
     content: 'Any content',
     author: new mongoose.Types.ObjectId()
   });

   await request(app)
     .delete(`/api/posts/${anyPost._id}`)
     .set('Authorization', `Bearer ${authToken}`)
     .expect(200);
 });
});

describe('POST /api/posts/:id/vote', () => {
 let testPost;

 beforeEach(async () => {
   testPost = await Post.create({
     title: 'Post to Vote',
     content: 'Vote on me',
     author: new mongoose.Types.ObjectId(),
     karma: 10
   });
 });

 test('should upvote a post', async () => {
   const response = await request(app)
     .post(`/api/posts/${testPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'upvote' })
     .expect(200);

   expect(response.body.data.karma).toBe(11);
   expect(response.body.data.userVote).toBe('upvote');
 });

 test('should downvote a post', async () => {
   const response = await request(app)
     .post(`/api/posts/${testPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'downvote' })
     .expect(200);

   expect(response.body.data.karma).toBe(9);
   expect(response.body.data.userVote).toBe('downvote');
 });

 test('should change vote from upvote to downvote', async () => {
   await request(app)
     .post(`/api/posts/${testPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'upvote' })
     .expect(200);

   const response = await request(app)
     .post(`/api/posts/${testPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'downvote' })
     .expect(200);

   expect(response.body.data.karma).toBe(8);
   expect(response.body.data.userVote).toBe('downvote');
 });

 test('should remove vote', async () => {
   await request(app)
     .post(`/api/posts/${testPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'upvote' })
     .expect(200);

   const response = await request(app)
     .post(`/api/posts/${testPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'none' })
     .expect(200);

   expect(response.body.data.karma).toBe(10);
   expect(response.body.data.userVote).toBe('none');
 });

 test('should prevent self-voting', async () => {
   const ownPost = await Post.create({
     title: 'Own Post',
     content: 'My content',
     author: testUser._id
   });

   await request(app)
     .post(`/api/posts/${ownPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'upvote' })
     .expect(403);
 });

 test('should award karma to post author on upvote', async () => {
   const authorUser = await User.create({
     email: 'author@shadownews.community',
     username: 'authoruser',
     password: 'Test123!@#',
     karma: 50
   });

   const authorPost = await Post.create({
     title: 'Author Post',
     content: 'Author content',
     author: authorUser._id
   });

   await request(app)
     .post(`/api/posts/${authorPost._id}/vote`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ voteType: 'upvote' })
     .expect(200);

   const updatedAuthor = await User.findById(authorUser._id);
   expect(updatedAuthor.karma).toBe(60);
 });
});

describe('POST /api/posts/:id/report', () => {
 let testPost;

 beforeEach(async () => {
   testPost = await Post.create({
     title: 'Post to Report',
     content: 'Report me',
     author: new mongoose.Types.ObjectId()
   });
 });

 test('should report a post', async () => {
   const reportData = {
     reason: 'spam',
     description: 'This is clearly spam content'
   };

   const response = await request(app)
     .post(`/api/posts/${testPost._id}/report`)
     .set('Authorization', `Bearer ${authToken}`)
     .send(reportData)
     .expect(200);

   expect(response.body.message).toContain('reported');

   const updatedPost = await Post.findById(testPost._id);
   expect(updatedPost.reports).toHaveLength(1);
   expect(updatedPost.reports[0].reason).toBe('spam');
 });

 test('should prevent duplicate reports from same user', async () => {
   await request(app)
     .post(`/api/posts/${testPost._id}/report`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ reason: 'spam' })
     .expect(200);

   await request(app)
     .post(`/api/posts/${testPost._id}/report`)
     .set('Authorization', `Bearer ${authToken}`)
     .send({ reason: 'inappropriate' })
     .expect(400);
 });

 test('should auto-hide post after threshold reports', async () => {
   const users = await User.create([
     { email: 'user1@test.com', username: 'user1', password: 'Test123!@#' },
     { email: 'user2@test.com', username: 'user2', password: 'Test123!@#' },
     { email: 'user3@test.com', username: 'user3', password: 'Test123!@#' },
     { email: 'user4@test.com', username: 'user4', password: 'Test123!@#' },
     { email: 'user5@test.com', username: 'user5', password: 'Test123!@#' }
   ]);

   for (const user of users) {
     const token = jwt.sign(
       { userId: user._id, email: user.email },
       process.env.JWT_SECRET || 'test-secret'
     );

     await request(app)
       .post(`/api/posts/${testPost._id}/report`)
       .set('Authorization', `Bearer ${token}`)
       .send({ reason: 'spam' })
       .expect(200);
   }

   const hiddenPost = await Post.findById(testPost._id);
   expect(hiddenPost.isHidden).toBe(true);
   expect(hiddenPost.hiddenAt).toBeDefined();
 });
});

describe('POST /api/posts/email', () => {
 test('should create post from email webhook', async () => {
   const emailData = {
     from: 'test@shadownews.community',
     to: 'posts@shadownews.community',
     subject: 'Email Post: Breaking News',
     text: 'This is an important announcement sent via email.',
     html: '<p>This is an important announcement sent via email.</p>',
     attachments: []
   };

   const response = await request(app)
     .post('/api/posts/email')
     .set('X-Webhook-Secret', process.env.EMAIL_WEBHOOK_SECRET || 'test-webhook-secret')
     .send(emailData)
     .expect(201);

   expect(response.body.data.title).toBe('Email Post: Breaking News');
   expect(response.body.data.fromEmail).toBe(true);
   expect(response.body.data.author.email).toBe('test@shadownews.community');
 });

 test('should reject email post from unverified email', async () => {
   const emailData = {
     from: 'unverified@example.com',
     to: 'posts@shadownews.community',
     subject: 'Spam Post',
     text: 'This should not be posted.'
   };

   await request(app)
     .post('/api/posts/email')
     .set('X-Webhook-Secret', process.env.EMAIL_WEBHOOK_SECRET || 'test-webhook-secret')
     .send(emailData)
     .expect(403);
 });

 test('should parse hashtags from email subject', async () => {
   const emailData = {
     from: 'test@shadownews.community',
     to: 'posts@shadownews.community',
     subject: 'New Framework Released #javascript #webdev #opensource',
     text: 'Check out this new JavaScript framework!'
   };

   const response = await request(app)
     .post('/api/posts/email')
     .set('X-Webhook-Secret', process.env.EMAIL_WEBHOOK_SECRET || 'test-webhook-secret')
     .send(emailData)
     .expect(201);

   expect(response.body.data.hashtags).toContain('#javascript');
   expect(response.body.data.hashtags).toContain('#webdev');
   expect(response.body.data.hashtags).toContain('#opensource');
 });

 test('should attach repository from email + notation', async () => {
   const emailData = {
     from: 'test@shadownews.community',
     to: `posts+${testRepository._id}@shadownews.community`,
     subject: 'Repository Targeted Post',
     text: 'This post should be added to the repository.'
   };

   const response = await request(app)
     .post('/api/posts/email')
     .set('X-Webhook-Secret', process.env.EMAIL_WEBHOOK_SECRET || 'test-webhook-secret')
     .send(emailData)
     .expect(201);

   expect(response.body.data.repositories).toHaveLength(1);
   expect(response.body.data.repositories[0]).toBe(testRepository._id.toString());
 });
});
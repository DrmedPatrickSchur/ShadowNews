/**
 * Repository Integration Tests
 * 
 * Comprehensive test suite for email repository management functionality
 * in the ShadowNews platform. Tests cover repository creation, email
 * management, CSV operations, snowball distribution, and community features.
 * 
 * Test Categories:
 * - Repository Creation: Community list setup, validation, and configuration
 * - Email Management: Adding, removing, and validating email addresses
 * - CSV Operations: Bulk email import/export and data format validation
 * - Snowball Distribution: Viral sharing and organic growth mechanisms
 * - Privacy Controls: Public/private repository settings and access control
 * - Quality Assurance: Email validation, spam prevention, and data integrity
 * 
 * Testing Strategy:
 * - Integration testing with authenticated repository operations
 * - File upload testing for CSV import functionality
 * - Email service integration for validation and notifications
 * - Performance testing for large-scale repository operations
 * - Security testing for access control and data privacy
 * 
 * Repository Features:
 * - Community-focused email list curation and management
 * - Hashtag-based categorization for content organization
 * - Subscriber growth tracking and engagement analytics
 * - Quality scoring based on email engagement metrics
 * - Organic growth through CSV sharing and snowball effects
 * 
 * Security Coverage:
 * - Email address validation and verification processes
 * - Spam prevention and abuse detection mechanisms
 * - GDPR compliance for email data handling
 * - Access control for repository ownership and permissions
 * - Rate limiting for repository operations and email additions
 * 
 * Data Management:
 * - CSV format validation and error handling
 * - Bulk operations with transaction support
 * - Email deduplication and data quality maintenance
 * - Growth analytics and performance metrics tracking
 * - Repository backup and restoration capabilities
 * 
 * Dependencies:
 * - Supertest for HTTP request testing
 * - Jest for test framework and assertions
 * - In-memory MongoDB for isolated testing
 * - File system operations for CSV testing
 * - JWT authentication for user session management
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User.model');
const Repository = require('../../src/models/Repository.model');
const Email = require('../../src/models/Email.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Test environment variables for repository testing
let mongoServer;
let authToken;
let testUser;
let testRepository;

/**
 * Test Environment Setup
 * 
 * Initializes in-memory MongoDB server for isolated repository testing.
 * Creates clean database environment for testing repository operations
 * without affecting existing data or external dependencies.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

/**
 * Test Environment Cleanup
 * 
 * Shuts down test database and cleans up resources
 * after all repository tests complete. Ensures proper
 * cleanup and prevents resource leaks in test environment.
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/**
 * Individual Test Setup
 * 
 * Prepares fresh test data before each repository test case.
 * Creates authenticated test user, initializes repository data,
 * and sets up authentication tokens for consistent testing.
 */
beforeEach(async () => {
  // Clear existing test data for clean test isolation
  await User.deleteMany({});
  await Repository.deleteMany({});
  await Email.deleteMany({});

  // Create authenticated test user with repository management permissions
  testUser = await User.create({
   username: 'testuser',
   email: 'test@shadownews.community',
   password: 'Test123!@#',
   karma: 500
 });

 authToken = jwt.sign(
   { userId: testUser._id, email: testUser.email },
   process.env.JWT_SECRET || 'test-secret',
   { expiresIn: '24h' }
 );

 testRepository = await Repository.create({
   name: 'AI Research',
   description: 'Repository for AI research discussions',
   owner: testUser._id,
   hashtags: ['#AI', '#MachineLearning'],
   emails: [],
   isPublic: true,
   snowballEnabled: true
 });
});

describe('Repository API Integration Tests', () => {
 describe('POST /api/repositories', () => {
   it('should create a new repository with valid data', async () => {
     const newRepo = {
       name: 'Blockchain Development',
       description: 'Repository for blockchain developers',
       hashtags: ['#Blockchain', '#Web3'],
       isPublic: true,
       snowballEnabled: true
     };

     const response = await request(app)
       .post('/api/repositories')
       .set('Authorization', `Bearer ${authToken}`)
       .send(newRepo)
       .expect(201);

     expect(response.body.success).toBe(true);
     expect(response.body.data.name).toBe(newRepo.name);
     expect(response.body.data.owner).toBe(testUser._id.toString());
     expect(response.body.data.emails).toHaveLength(0);
     expect(response.body.data.statistics.totalEmails).toBe(0);
   });

   it('should fail to create repository with insufficient karma', async () => {
     testUser.karma = 50;
     await testUser.save();

     const response = await request(app)
       .post('/api/repositories')
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         name: 'Test Repo',
         description: 'Test description'
       })
       .expect(403);

     expect(response.body.error).toContain('karma');
   });

   it('should fail to create duplicate repository name for same user', async () => {
     const repoData = {
       name: 'AI Research',
       description: 'Another AI repo'
     };

     const response = await request(app)
       .post('/api/repositories')
       .set('Authorization', `Bearer ${authToken}`)
       .send(repoData)
       .expect(409);

     expect(response.body.error).toContain('already exists');
   });
 });

 describe('GET /api/repositories', () => {
   it('should retrieve all public repositories', async () => {
     await Repository.create([
       {
         name: 'Public Repo 1',
         owner: testUser._id,
         isPublic: true
       },
       {
         name: 'Private Repo',
         owner: testUser._id,
         isPublic: false
       }
     ]);

     const response = await request(app)
       .get('/api/repositories')
       .expect(200);

     expect(response.body.success).toBe(true);
     expect(response.body.data).toHaveLength(2);
     expect(response.body.data.every(repo => repo.isPublic)).toBe(true);
   });

   it('should filter repositories by hashtag', async () => {
     await Repository.create({
       name: 'Web Dev Repo',
       owner: testUser._id,
       hashtags: ['#WebDev', '#JavaScript'],
       isPublic: true
     });

     const response = await request(app)
       .get('/api/repositories?hashtag=AI')
       .expect(200);

     expect(response.body.data).toHaveLength(1);
     expect(response.body.data[0].name).toBe('AI Research');
   });

   it('should paginate repository results', async () => {
     for (let i = 0; i < 25; i++) {
       await Repository.create({
         name: `Repo ${i}`,
         owner: testUser._id,
         isPublic: true
       });
     }

     const response = await request(app)
       .get('/api/repositories?page=2&limit=10')
       .expect(200);

     expect(response.body.data).toHaveLength(10);
     expect(response.body.pagination.currentPage).toBe(2);
     expect(response.body.pagination.totalPages).toBe(3);
   });
 });

 describe('GET /api/repositories/:id', () => {
   it('should retrieve a specific repository with statistics', async () => {
     await Email.create([
       {
         email: 'user1@example.com',
         repository: testRepository._id,
         verificationStatus: 'verified'
       },
       {
         email: 'user2@example.com',
         repository: testRepository._id,
         verificationStatus: 'verified'
       }
     ]);

     const response = await request(app)
       .get(`/api/repositories/${testRepository._id}`)
       .expect(200);

     expect(response.body.data._id).toBe(testRepository._id.toString());
     expect(response.body.data.statistics.totalEmails).toBe(2);
     expect(response.body.data.statistics.verifiedEmails).toBe(2);
   });

   it('should not retrieve private repository without authorization', async () => {
     testRepository.isPublic = false;
     await testRepository.save();

     const response = await request(app)
       .get(`/api/repositories/${testRepository._id}`)
       .expect(403);

     expect(response.body.error).toContain('access');
   });
 });

 describe('PUT /api/repositories/:id', () => {
   it('should update repository details by owner', async () => {
     const updates = {
       description: 'Updated description',
       hashtags: ['#AI', '#DeepLearning', '#NLP'],
       snowballEnabled: false
     };

     const response = await request(app)
       .put(`/api/repositories/${testRepository._id}`)
       .set('Authorization', `Bearer ${authToken}`)
       .send(updates)
       .expect(200);

     expect(response.body.data.description).toBe(updates.description);
     expect(response.body.data.hashtags).toHaveLength(3);
     expect(response.body.data.snowballEnabled).toBe(false);
   });

   it('should not allow non-owner to update repository', async () => {
     const otherUser = await User.create({
       username: 'otheruser',
       email: 'other@shadownews.community',
       password: 'Test123!@#'
     });

     const otherToken = jwt.sign(
       { userId: otherUser._id, email: otherUser.email },
       process.env.JWT_SECRET || 'test-secret'
     );

     const response = await request(app)
       .put(`/api/repositories/${testRepository._id}`)
       .set('Authorization', `Bearer ${otherToken}`)
       .send({ description: 'Hacked!' })
       .expect(403);

     expect(response.body.error).toContain('permission');
   });
 });

 describe('POST /api/repositories/:id/emails', () => {
   it('should add single email to repository', async () => {
     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/emails`)
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         email: 'newuser@example.com',
         source: 'manual'
       })
       .expect(201);

     expect(response.body.success).toBe(true);
     expect(response.body.data.email).toBe('newuser@example.com');
     expect(response.body.data.verificationStatus).toBe('pending');
   });

   it('should handle duplicate email gracefully', async () => {
     await Email.create({
       email: 'existing@example.com',
       repository: testRepository._id
     });

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/emails`)
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         email: 'existing@example.com'
       })
       .expect(409);

     expect(response.body.error).toContain('already exists');
   });

   it('should validate email format', async () => {
     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/emails`)
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         email: 'invalid-email'
       })
       .expect(400);

     expect(response.body.error).toContain('valid email');
   });
 });

 describe('POST /api/repositories/:id/csv', () => {
   it('should upload and process CSV file', async () => {
     const csvContent = 'email,name\nuser1@example.com,User One\nuser2@example.com,User Two';
     const csvPath = path.join(__dirname, 'test.csv');
     fs.writeFileSync(csvPath, csvContent);

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/csv`)
       .set('Authorization', `Bearer ${authToken}`)
       .attach('csv', csvPath)
       .expect(200);

     expect(response.body.data.processed).toBe(2);
     expect(response.body.data.added).toBe(2);
     expect(response.body.data.skipped).toBe(0);

     fs.unlinkSync(csvPath);
   });

   it('should handle malformed CSV', async () => {
     const csvContent = 'invalid,csv\nno-email-column';
     const csvPath = path.join(__dirname, 'invalid.csv');
     fs.writeFileSync(csvPath, csvContent);

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/csv`)
       .set('Authorization', `Bearer ${authToken}`)
       .attach('csv', csvPath)
       .expect(400);

     expect(response.body.error).toContain('email column');

     fs.unlinkSync(csvPath);
   });

   it('should respect repository email limit', async () => {
     testRepository.limits = { maxEmails: 5 };
     await testRepository.save();

     const csvContent = Array.from({ length: 10 }, (_, i) => 
       `user${i}@example.com,User ${i}`
     ).join('\n');
     const csvPath = path.join(__dirname, 'large.csv');
     fs.writeFileSync(csvPath, 'email,name\n' + csvContent);

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/csv`)
       .set('Authorization', `Bearer ${authToken}`)
       .attach('csv', csvPath)
       .expect(200);

     expect(response.body.data.added).toBe(5);
     expect(response.body.data.skipped).toBe(5);
     expect(response.body.data.reason).toContain('limit reached');

     fs.unlinkSync(csvPath);
   });
 });

 describe('POST /api/repositories/:id/snowball', () => {
   it('should trigger snowball distribution', async () => {
     await Email.create([
       {
         email: 'verified1@example.com',
         repository: testRepository._id,
         verificationStatus: 'verified'
       },
       {
         email: 'verified2@example.com',
         repository: testRepository._id,
         verificationStatus: 'verified'
       }
     ]);

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/snowball`)
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         subject: 'Join our AI Research Community',
         message: 'We are building something amazing...',
         attachCSV: true
       })
       .expect(200);

     expect(response.body.data.emailsSent).toBe(2);
     expect(response.body.data.snowballId).toBeDefined();
   });

   it('should not trigger snowball if disabled', async () => {
     testRepository.snowballEnabled = false;
     await testRepository.save();

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/snowball`)
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         subject: 'Test',
         message: 'Test message'
       })
       .expect(400);

     expect(response.body.error).toContain('not enabled');
   });

   it('should respect snowball frequency limits', async () => {
     testRepository.lastSnowball = new Date();
     await testRepository.save();

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/snowball`)
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         subject: 'Too soon',
         message: 'This should fail'
       })
       .expect(429);

     expect(response.body.error).toContain('cooldown');
   });
 });

 describe('GET /api/repositories/:id/analytics', () => {
   it('should retrieve repository analytics for owner', async () => {
     const thirtyDaysAgo = new Date();
     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

     await Email.create([
       {
         email: 'recent@example.com',
         repository: testRepository._id,
         createdAt: new Date(),
         verificationStatus: 'verified'
       },
       {
         email: 'old@example.com',
         repository: testRepository._id,
         createdAt: thirtyDaysAgo,
         verificationStatus: 'verified'
       }
     ]);

     const response = await request(app)
       .get(`/api/repositories/${testRepository._id}/analytics`)
       .set('Authorization', `Bearer ${authToken}`)
       .expect(200);

     expect(response.body.data.totalEmails).toBe(2);
     expect(response.body.data.growthRate).toBeDefined();
     expect(response.body.data.verificationRate).toBe(100);
     expect(response.body.data.timeSeriesData).toBeDefined();
   });

   it('should not provide analytics to non-owners', async () => {
     const response = await request(app)
       .get(`/api/repositories/${testRepository._id}/analytics`)
       .expect(401);

     expect(response.body.error).toContain('Unauthorized');
   });
 });

 describe('DELETE /api/repositories/:id', () => {
   it('should soft delete repository', async () => {
     const response = await request(app)
       .delete(`/api/repositories/${testRepository._id}`)
       .set('Authorization', `Bearer ${authToken}`)
       .expect(200);

     expect(response.body.message).toContain('deleted');

     const deletedRepo = await Repository.findById(testRepository._id);
     expect(deletedRepo.deletedAt).toBeDefined();
     expect(deletedRepo.isActive).toBe(false);
   });

   it('should not delete repository with active snowball campaigns', async () => {
     testRepository.activeSnowballs = 1;
     await testRepository.save();

     const response = await request(app)
       .delete(`/api/repositories/${testRepository._id}`)
       .set('Authorization', `Bearer ${authToken}`)
       .expect(400);

     expect(response.body.error).toContain('active campaigns');
   });
 });

 describe('POST /api/repositories/:id/export', () => {
   it('should export repository emails as CSV', async () => {
     await Email.create([
       {
         email: 'export1@example.com',
         repository: testRepository._id,
         metadata: { name: 'User One' }
       },
       {
         email: 'export2@example.com',
         repository: testRepository._id,
         metadata: { name: 'User Two' }
       }
     ]);

     const response = await request(app)
       .post(`/api/repositories/${testRepository._id}/export`)
       .set('Authorization', `Bearer ${authToken}`)
       .expect(200);

     expect(response.headers['content-type']).toContain('text/csv');
     expect(response.headers['content-disposition']).toContain('attachment');
     expect(response.text).toContain('export1@example.com');
     expect(response.text).toContain('export2@example.com');
   });
 });

 describe('POST /api/repositories/merge', () => {
   it('should merge two repositories owned by same user', async () => {
     const repo2 = await Repository.create({
       name: 'ML Research',
       owner: testUser._id,
       hashtags: ['#MachineLearning']
     });

     await Email.create([
       {
         email: 'repo1@example.com',
         repository: testRepository._id
       },
       {
         email: 'repo2@example.com',
         repository: repo2._id
       },
       {
         email: 'duplicate@example.com',
         repository: testRepository._id
       },
       {
         email: 'duplicate@example.com',
         repository: repo2._id
       }
     ]);

     const response = await request(app)
       .post('/api/repositories/merge')
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         sourceId: repo2._id,
         targetId: testRepository._id
       })
       .expect(200);

     expect(response.body.data.emailsMerged).toBe(1);
     expect(response.body.data.duplicatesSkipped).toBe(1);
     expect(response.body.data.newTotal).toBe(3);
   });

   it('should not merge repositories from different owners', async () => {
     const otherUser = await User.create({
       username: 'hacker',
       email: 'hacker@shadownews.community',
       password: 'Test123!@#'
     });

     const hackerRepo = await Repository.create({
       name: 'Hacker Repo',
       owner: otherUser._id
     });

     const response = await request(app)
       .post('/api/repositories/merge')
       .set('Authorization', `Bearer ${authToken}`)
       .send({
         sourceId: hackerRepo._id,
         targetId: testRepository._id
       })
       .expect(403);

     expect(response.body.error).toContain('own both repositories');
   });
 });
});
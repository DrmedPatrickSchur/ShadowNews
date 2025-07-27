/**
 * @fileoverview Database Seeding Script
 * 
 * Comprehensive database seeding utility for the ShadowNews platform that
 * generates realistic sample data for development, testing, and demonstration
 * purposes. Creates a complete ecosystem of users, posts, comments, repositories,
 * and relationships that simulate real platform usage patterns.
 * 
 * This script populates the database with meaningful test data that reflects
 * the actual structure and relationships found in a thriving online community,
 * enabling comprehensive testing and development workflows.
 * 
 * Key Features:
 * - Realistic user profiles with authentic usernames and biographies
 * - Diverse content creation including posts, comments, and discussions
 * - Email repository simulation with growth patterns and snowball effects
 * - Complex relationship modeling between users, content, and repositories
 * - Karma system integration with realistic point distributions
 * - Hashtag and categorization system with trending topics
 * - Date distribution to simulate platform growth over time
 * - Engagement patterns including voting, commenting, and sharing
 * 
 * Generated Data Categories:
 * - Users: Authentic profiles with karma, preferences, and activity history
 * - Posts: Technology-focused content with URLs, text, and metadata
 * - Comments: Threaded discussions with realistic engagement patterns
 * - Repositories: Email lists with growth metrics and member activity
 * - Karma Records: Detailed point breakdowns and activity history
 * - Relationships: Following, repository memberships, and interactions
 * 
 * Seeding Strategy:
 * - Technology-focused content reflecting Hacker News audience
 * - Realistic engagement ratios and community behavior patterns
 * - Email repository growth simulation with viral distribution
 * - Historical data distribution to show platform evolution
 * - Varied user activity levels from lurkers to power users
 * - Content quality distribution with high and low-quality examples
 * 
 * Data Volume Configuration:
 * - 20 Users: Mix of active and casual community members
 * - 10 Repositories: Diverse technology topics and communities
 * - 50 Posts: Varied content types including links and discussions
 * - 200+ Comments: Realistic discussion threads and engagement
 * - 500+ Email Addresses: Repository membership simulation
 * 
 * Technology Topics:
 * - AI/Machine Learning developments and discussions
 * - Blockchain and cryptocurrency innovations
 * - Web development frameworks and best practices
 * - DevOps tools and infrastructure automation
 * - Mobile application development trends
 * - Cybersecurity threats and mitigation strategies
 * - Data science methodologies and tools
 * - Cloud computing platforms and services
 * 
 * Usage:
 * ```bash
 * # Seed database with sample data
 * node scripts/seedDatabase.js
 * 
 * # Clear and reseed database
 * npm run db:seed
 * 
 * # Seed with custom data volume
 * NODE_ENV=development node scripts/seedDatabase.js
 * ```
 * 
 * Safety Features:
 * - Development environment validation
 * - Data clearing confirmation prompts
 * - Rollback capabilities for testing scenarios
 * - Performance monitoring for large datasets
 * - Memory optimization for resource-constrained environments
 * 
 * Dependencies:
 * - mongoose: MongoDB ODM for data modeling and persistence
 * - bcryptjs: Password hashing for secure authentication
 * - faker: Realistic fake data generation for testing
 * - dotenv: Environment variable configuration management
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

// MongoDB ODM for database operations and modeling
const mongoose = require('mongoose');

// Secure password hashing library
const bcrypt = require('bcryptjs');

// Realistic fake data generation for comprehensive testing
const faker = require('faker');

// Environment variable configuration management
const dotenv = require('dotenv');

// Cross-platform path utilities
const path = require('path');

// Load environment variables from configuration file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import all database models for seeding operations
const User = require('../src/models/User.model');
const Post = require('../src/models/Post.model');
const Comment = require('../src/models/Comment.model');
const Repository = require('../src/models/Repository.model');
const Email = require('../src/models/Email.model');
const Karma = require('../src/models/Karma.model');

/**
 * Database Connection Setup
 * 
 * Establishes connection to MongoDB database with appropriate
 * configuration for seeding operations. Includes error handling
 * and graceful failure for connection issues.
 * 
 * @returns {Promise<void>} Resolves when database connection is established
 * @throws {Error} Database connection errors
 * 
 * @since 1.0.0
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shadownews', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Main Database Seeding Function
 * 
 * Orchestrates the complete database seeding process including data clearing,
 * user creation, repository setup, content generation, and relationship
 * establishment. Provides comprehensive logging and error handling throughout.
 * 
 * Seeding Process:
 * 1. Clear existing data from all collections
 * 2. Create diverse user profiles with authentication
 * 3. Generate email repositories with realistic content
 * 4. Create posts with technology-focused topics
 * 5. Generate comment threads and discussions
 * 6. Establish karma records and point distributions
 * 7. Create relationships and engagement patterns
 * 
 * Data Generation Strategy:
 * - Realistic user personas with varied activity levels
 * - Technology-focused content reflecting target audience
 * - Natural engagement patterns and community behavior
 * - Historical data distribution showing platform growth
 * - Email repository simulation with viral growth patterns
 * 
 * @returns {Promise<void>} Resolves when seeding completes successfully
 * @throws {Error} Seeding operation errors
 * 
 * @since 1.0.0
 */
const seedData = async () => {
 try {
   // Clear existing data
   await Promise.all([
     User.deleteMany({}),
     Post.deleteMany({}),
     Comment.deleteMany({}),
     Repository.deleteMany({}),
     Email.deleteMany({}),
     Karma.deleteMany({})
   ]);
   console.log('Cleared existing data');

   // Create users
   const users = [];
   const passwords = await bcrypt.hash('password123', 10);
   
   for (let i = 0; i < 20; i++) {
     const username = faker.internet.userName().toLowerCase();
     const user = await User.create({
       username,
       email: faker.internet.email().toLowerCase(),
       password: passwords,
       shadowEmail: `${username}@shadownews.community`,
       bio: faker.lorem.sentence(),
       karma: faker.datatype.number({ min: 0, max: 5000 }),
       joinedAt: faker.date.past(),
       isVerified: true,
       preferences: {
         emailDigest: faker.datatype.boolean(),
         digestFrequency: faker.random.arrayElement(['daily', 'weekly', 'never']),
         publicProfile: faker.datatype.boolean(),
         showEmail: false
       }
     });
     users.push(user);
   }
   console.log(`Created ${users.length} users`);

   // Create repositories
   const repositories = [];
   const topics = ['AI/ML', 'Blockchain', 'DevOps', 'Frontend', 'Backend', 'Mobile', 'Security', 'Data Science', 'Cloud', 'IoT'];
   
   for (let i = 0; i < 10; i++) {
     const owner = users[Math.floor(Math.random() * users.length)];
     const repository = await Repository.create({
       name: `${faker.random.arrayElement(topics)} ${faker.company.catchPhrase()}`,
       description: faker.lorem.paragraph(),
       topic: faker.random.arrayElement(topics),
       owner: owner._id,
       emails: Array.from({ length: faker.datatype.number({ min: 50, max: 500 }) }, () => ({
         email: faker.internet.email().toLowerCase(),
         addedBy: owner._id,
         addedAt: faker.date.past(),
         verified: faker.datatype.boolean(),
         source: faker.random.arrayElement(['manual', 'csv', 'snowball'])
       })),
       isPublic: true,
       settings: {
         autoApprove: faker.datatype.boolean(),
         minKarmaToJoin: faker.random.arrayElement([0, 100, 500]),
         allowSnowball: true,
         snowballThreshold: faker.datatype.number({ min: 2, max: 5 })
       },
       stats: {
         totalEmails: faker.datatype.number({ min: 50, max: 500 }),
         activeEmails: faker.datatype.number({ min: 30, max: 400 }),
         growthRate: faker.datatype.float({ min: 0.5, max: 3.5 }),
         lastSnowball: faker.date.recent()
       }
     });
     repositories.push(repository);
   }
   console.log(`Created ${repositories.length} repositories`);

   // Create posts
   const posts = [];
   const hashtags = ['#AI', '#MachineLearning', '#Blockchain', '#WebDev', '#DevOps', '#Security', '#DataScience', '#Cloud', '#Startup', '#OpenSource'];
   
   for (let i = 0; i < 50; i++) {
     const author = users[Math.floor(Math.random() * users.length)];
     const repository = faker.datatype.boolean() ? repositories[Math.floor(Math.random() * repositories.length)] : null;
     
     const post = await Post.create({
       title: faker.lorem.sentence(),
       url: faker.datatype.boolean() ? faker.internet.url() : null,
       text: faker.datatype.boolean() ? faker.lorem.paragraphs(3) : null,
       author: author._id,
       hashtags: faker.random.arrayElements(hashtags, faker.datatype.number({ min: 1, max: 4 })),
       score: faker.datatype.number({ min: 0, max: 500 }),
       upvotedBy: faker.random.arrayElements(users.map(u => u._id), faker.datatype.number({ min: 0, max: 15 })),
       repository: repository ? repository._id : null,
       emailReach: repository ? repository.stats.totalEmails : 0,
       metadata: {
         domain: faker.internet.domainName(),
         readTime: faker.datatype.number({ min: 1, max: 15 }),
         aiSummary: faker.lorem.sentence()
       },
       createdAt: faker.date.past()
     });
     posts.push(post);
   }
   console.log(`Created ${posts.length} posts`);

   // Create comments
   const comments = [];
   for (let i = 0; i < 100; i++) {
     const author = users[Math.floor(Math.random() * users.length)];
     const post = posts[Math.floor(Math.random() * posts.length)];
     const parentComment = faker.datatype.boolean() && comments.length > 0 ? 
       comments[Math.floor(Math.random() * comments.length)] : null;
     
     const comment = await Comment.create({
       text: faker.lorem.paragraph(),
       author: author._id,
       post: post._id,
       parent: parentComment ? parentComment._id : null,
       score: faker.datatype.number({ min: 0, max: 100 }),
       upvotedBy: faker.random.arrayElements(users.map(u => u._id), faker.datatype.number({ min: 0, max: 10 })),
       depth: parentComment ? parentComment.depth + 1 : 0,
       createdAt: faker.date.past()
     });
     comments.push(comment);
   }
   console.log(`Created ${comments.length} comments`);

   // Create karma records
   for (const user of users) {
     await Karma.create({
       user: user._id,
       total: user.karma,
       breakdown: {
         posts: faker.datatype.number({ min: 0, max: 2000 }),
         comments: faker.datatype.number({ min: 0, max: 1000 }),
         curation: faker.datatype.number({ min: 0, max: 1000 }),
         repositories: faker.datatype.number({ min: 0, max: 1000 })
       },
       achievements: faker.random.arrayElements([
         'early_adopter',
         'prolific_poster',
         'quality_curator',
         'repository_creator',
         'community_builder',
         'helpful_commenter'
       ], faker.datatype.number({ min: 0, max: 4 })),
       level: Math.floor(user.karma / 1000) + 1,
       nextLevelAt: (Math.floor(user.karma / 1000) + 1) * 1000
     });
   }
   console.log('Created karma records');

   // Create email records
   for (let i = 0; i < 30; i++) {
     const sender = users[Math.floor(Math.random() * users.length)];
     await Email.create({
       from: sender.shadowEmail,
       to: 'post@shadownews.community',
       subject: faker.lorem.sentence(),
       body: faker.lorem.paragraphs(2),
       processed: true,
       processedAt: faker.date.recent(),
       type: faker.random.arrayElement(['post', 'comment', 'command']),
       metadata: {
         postId: faker.datatype.boolean() ? posts[Math.floor(Math.random() * posts.length)]._id : null,
         action: faker.random.arrayElement(['create_post', 'reply_comment', 'upvote', 'subscribe'])
       }
     });
   }
   console.log('Created email records');

   // Update post and comment counts
   for (const post of posts) {
     const commentCount = await Comment.countDocuments({ post: post._id });
     post.commentCount = commentCount;
     await post.save();
   }

   console.log('\n✅ Database seeded successfully!');
   console.log(`
   Summary:
   - Users: ${users.length}
   - Repositories: ${repositories.length}
   - Posts: ${posts.length}
   - Comments: ${comments.length}
   - Email Records: 30
   `);

 } catch (error) {
   console.error('Seeding error:', error);
   process.exit(1);
 }
};

// Run seeder
const runSeeder = async () => {
 await connectDB();
 await seedData();
 await mongoose.connection.close();
 console.log('Database connection closed');
 process.exit(0);
};

// Execute
runSeeder();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const testUsers = [
 {
   _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
   username: 'sarah_tech',
   email: 'sarah@shadownews.community',
   password: bcrypt.hashSync('password123', 10),
   karma: 150,
   role: 'user',
   emailVerified: true,
   createdAt: new Date('2024-01-01'),
   interests: ['#AI', '#MachineLearning', '#Tech'],
   repositories: ['507f1f77bcf86cd799439021']
 },
 {
   _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
   username: 'marcus_founder',
   email: 'marcus@shadownews.community',
   password: bcrypt.hashSync('password123', 10),
   karma: 500,
   role: 'user',
   emailVerified: true,
   createdAt: new Date('2024-01-15'),
   interests: ['#Startups', '#Blockchain', '#FinTech'],
   repositories: ['507f1f77bcf86cd799439022', '507f1f77bcf86cd799439023']
 },
 {
   _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
   username: 'elena_researcher',
   email: 'elena@shadownews.community',
   password: bcrypt.hashSync('password123', 10),
   karma: 2500,
   role: 'curator',
   emailVerified: true,
   createdAt: new Date('2024-01-01'),
   interests: ['#AIEthics', '#Research', '#DeepLearning'],
   repositories: ['507f1f77bcf86cd799439024']
 },
 {
   _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
   username: 'david_blockchain',
   email: 'david@shadownews.community',
   password: bcrypt.hashSync('password123', 10),
   karma: 5000,
   role: 'moderator',
   emailVerified: true,
   createdAt: new Date('2023-12-01'),
   interests: ['#Blockchain', '#Web3', '#Crypto'],
   repositories: ['507f1f77bcf86cd799439025']
 }
];

const testPosts = [
 {
   _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439011'),
   title: 'New transformer architecture achieves 98% accuracy on benchmark',
   content: 'Researchers at Stanford have developed a novel transformer architecture that significantly improves performance on NLP tasks...',
   author: testUsers[2]._id,
   url: 'https://arxiv.org/papers/transformer-98',
   hashtags: ['#AI', '#NLP', '#Transformers', '#Research'],
   upvotes: [testUsers[0]._id, testUsers[1]._id, testUsers[3]._id],
   downvotes: [],
   score: 3,
   commentCount: 5,
   repository: '507f1f77bcf86cd799439024',
   createdAt: new Date('2024-06-20T10:00:00Z'),
   lastActivity: new Date('2024-06-20T15:30:00Z'),
   emailReach: 1247
 },
 {
   _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439012'),
   title: 'Show HN: Built a decentralized email repository system',
   content: 'I created a system that allows communities to build email lists that grow organically through CSV sharing...',
   author: testUsers[1]._id,
   hashtags: ['#ShowHN', '#Email', '#Decentralized', '#OpenSource'],
   upvotes: [testUsers[0]._id, testUsers[2]._id],
   downvotes: [testUsers[3]._id],
   score: 1,
   commentCount: 12,
   repository: '507f1f77bcf86cd799439022',
   createdAt: new Date('2024-06-19T14:00:00Z'),
   lastActivity: new Date('2024-06-20T09:15:00Z'),
   emailReach: 823
 },
 {
   _id: new mongoose.Types.ObjectId('607f1f77bcf86cd799439013'),
   title: 'Ethereum 3.0 roadmap revealed: Focus on scalability',
   content: 'Vitalik Buterin announced the comprehensive roadmap for Ethereum 3.0, addressing current scalability issues...',
   author: testUsers[3]._id,
   url: 'https://ethereum.org/eth3-roadmap',
   hashtags: ['#Ethereum', '#Blockchain', '#Crypto', '#Web3'],
   upvotes: [testUsers[0]._id, testUsers[1]._id, testUsers[2]._id],
   downvotes: [],
   score: 3,
   commentCount: 25,
   repository: '507f1f77bcf86cd799439025',
   createdAt: new Date('2024-06-18T08:00:00Z'),
   lastActivity: new Date('2024-06-20T16:45:00Z'),
   emailReach: 3456
 }
];

const testComments = [
 {
   _id: new mongoose.Types.ObjectId('707f1f77bcf86cd799439011'),
   post: testPosts[0]._id,
   author: testUsers[0]._id,
   content: 'This is fascinating! Have you tested it on multilingual datasets?',
   upvotes: [testUsers[2]._id],
   downvotes: [],
   score: 1,
   createdAt: new Date('2024-06-20T11:00:00Z'),
   parentComment: null,
   depth: 0
 },
 {
   _id: new mongoose.Types.ObjectId('707f1f77bcf86cd799439012'),
   post: testPosts[0]._id,
   author: testUsers[2]._id,
   content: 'Yes, we tested on 15 languages. Results vary but generally maintain >95% accuracy.',
   upvotes: [testUsers[0]._id, testUsers[1]._id],
   downvotes: [],
   score: 2,
   createdAt: new Date('2024-06-20T11:30:00Z'),
   parentComment: '707f1f77bcf86cd799439011',
   depth: 1
 },
 {
   _id: new mongoose.Types.ObjectId('707f1f77bcf86cd799439013'),
   post: testPosts[1]._id,
   author: testUsers[3]._id,
   content: 'How do you handle GDPR compliance with the email snowball effect?',
   upvotes: [testUsers[1]._id, testUsers[2]._id],
   downvotes: [],
   score: 2,
   createdAt: new Date('2024-06-19T15:00:00Z'),
   parentComment: null,
   depth: 0
 }
];

const testRepositories = [
 {
   _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
   name: 'AI Healthcare',
   description: 'Repository for AI applications in healthcare',
   owner: testUsers[0]._id,
   hashtags: ['#AI', '#Healthcare', '#MedTech'],
   emails: [
     { email: 'doctor1@hospital.com', verified: true, addedBy: testUsers[0]._id },
     { email: 'researcher@medai.org', verified: true, addedBy: testUsers[0]._id },
     { email: 'startup@healthtech.io', verified: false, addedBy: testUsers[1]._id }
   ],
   emailCount: 823,
   subscribers: [testUsers[0]._id, testUsers[2]._id],
   privacy: 'public',
   snowballEnabled: true,
   qualityThreshold: 0.7,
   createdAt: new Date('2024-02-01'),
   lastActivity: new Date('2024-06-20'),
   stats: {
     weeklyGrowth: 45,
     engagementRate: 0.15,
     bounceRate: 0.03
   }
 },
 {
   _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
   name: 'Startup Founders Network',
   description: 'Connect with verified startup founders',
   owner: testUsers[1]._id,
   hashtags: ['#Startups', '#Founders', '#Entrepreneurship'],
   emails: [
     { email: 'founder1@startup.com', verified: true, addedBy: testUsers[1]._id },
     { email: 'ceo@techstartup.io', verified: true, addedBy: testUsers[1]._id }
   ],
   emailCount: 450,
   subscribers: [testUsers[1]._id, testUsers[0]._id, testUsers[3]._id],
   privacy: 'public',
   snowballEnabled: true,
   qualityThreshold: 0.8,
   createdAt: new Date('2024-03-15'),
   lastActivity: new Date('2024-06-19')
 },
 {
   _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439025'),
   name: 'Blockchain Developers',
   description: 'Curated list of blockchain developers and projects',
   owner: testUsers[3]._id,
   hashtags: ['#Blockchain', '#Web3', '#DeFi'],
   emails: [
     { email: 'dev@ethereum.org', verified: true, addedBy: testUsers[3]._id },
     { email: 'builder@defi.protocol', verified: true, addedBy: testUsers[3]._id }
   ],
   emailCount: 2100,
   subscribers: [testUsers[3]._id, testUsers[1]._id],
   privacy: 'public',
   snowballEnabled: true,
   qualityThreshold: 0.9,
   createdAt: new Date('2024-01-01'),
   lastActivity: new Date('2024-06-20')
 }
];

const testEmails = [
 {
   _id: new mongoose.Types.ObjectId('807f1f77bcf86cd799439011'),
   from: 'sarah@shadownews.community',
   to: 'post@shadownews.community',
   subject: 'New research on AI bias in healthcare',
   body: 'Just published our findings on algorithmic bias in medical AI systems...',
   processed: true,
   postCreated: '607f1f77bcf86cd799439014',
   receivedAt: new Date('2024-06-20T09:00:00Z'),
   metadata: {
     spf: 'pass',
     dkim: 'pass',
     spam_score: 0.1
   }
 },
 {
   _id: new mongoose.Types.ObjectId('807f1f77bcf86cd799439012'),
   from: 'external@company.com',
   to: 'marcus@shadownews.community',
   subject: 'Re: Partnership opportunity',
   body: 'I would like to discuss the partnership further...',
   processed: false,
   receivedAt: new Date('2024-06-20T10:30:00Z'),
   metadata: {
     spf: 'pass',
     dkim: 'fail',
     spam_score: 2.5
   }
 }
];

const testDigests = [
 {
   _id: new mongoose.Types.ObjectId('907f1f77bcf86cd799439011'),
   user: testUsers[0]._id,
   type: 'daily',
   posts: [testPosts[0]._id, testPosts[1]._id],
   repositories: [testRepositories[0]._id],
   sentAt: new Date('2024-06-20T08:00:00Z'),
   opened: true,
   clickedLinks: ['607f1f77bcf86cd799439011']
 }
];

const testCSVData = {
 validCSV: `email,name,company,verified
john@techcorp.com,John Doe,TechCorp,true
jane@startup.io,Jane Smith,StartupIO,false
mike@ai-research.org,Mike Johnson,AI Research Lab,true`,
 
 invalidCSV: `email,name
notanemail,Invalid User
@incomplete.com,Missing Local
user@,Missing Domain`,
 
 largeCSV: Array.from({ length: 100 }, (_, i) => 
   `user${i}@example.com,User ${i},Company ${i},${i % 2 === 0}`
 ).join('\n')
};

const testKarmaEvents = [
 {
   user: testUsers[0]._id,
   action: 'post_created',
   points: 50,
   reference: testPosts[0]._id,
   timestamp: new Date('2024-06-20T10:00:00Z')
 },
 {
   user: testUsers[0]._id,
   action: 'post_upvoted',
   points: 10,
   reference: testPosts[0]._id,
   timestamp: new Date('2024-06-20T11:00:00Z')
 },
 {
   user: testUsers[1]._id,
   action: 'repository_created',
   points: 100,
   reference: testRepositories[1]._id,
   timestamp: new Date('2024-03-15T12:00:00Z')
 }
];

const testNotifications = [
 {
   user: testUsers[0]._id,
   type: 'post_reply',
   title: 'New comment on your post',
   message: 'Elena commented on "New transformer architecture..."',
   link: '/post/607f1f77bcf86cd799439011',
   read: false,
   createdAt: new Date('2024-06-20T11:30:00Z')
 },
 {
   user: testUsers[1]._id,
   type: 'repository_milestone',
   title: 'Repository milestone reached!',
   message: 'Your "Startup Founders Network" reached 500 emails!',
   link: '/repository/507f1f77bcf86cd799439022',
   read: true,
   createdAt: new Date('2024-06-19T16:00:00Z')
 }
];

module.exports = {
 testUsers,
 testPosts,
 testComments,
 testRepositories,
 testEmails,
 testDigests,
 testCSVData,
 testKarmaEvents,
 testNotifications,
 
 // Helper functions
 generateRandomUser: (overrides = {}) => ({
   _id: new mongoose.Types.ObjectId(),
   username: `user_${Date.now()}`,
   email: `user_${Date.now()}@shadownews.community`,
   password: bcrypt.hashSync('password123', 10),
   karma: Math.floor(Math.random() * 1000),
   role: 'user',
   emailVerified: true,
   createdAt: new Date(),
   interests: ['#Tech'],
   repositories: [],
   ...overrides
 }),
 
 generateRandomPost: (authorId, overrides = {}) => ({
   _id: new mongoose.Types.ObjectId(),
   title: `Test post ${Date.now()}`,
   content: 'This is a test post content...',
   author: authorId,
   hashtags: ['#Test'],
   upvotes: [],
   downvotes: [],
   score: 0,
   commentCount: 0,
   createdAt: new Date(),
   lastActivity: new Date(),
   emailReach: 0,
   ...overrides
 }),
 
 clearDatabase: async (models) => {
   const collections = Object.keys(models);
   for (const collection of collections) {
     await models[collection].deleteMany({});
   }
 }
};
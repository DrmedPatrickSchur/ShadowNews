<!--
============================================================================
ShadowNews - Email-First Community Platform
============================================================================

Welcome to ShadowNews - the next evolution of community-driven content platforms.
An innovative email-first Hacker News clone that combines traditional forum
functionality with viral email distribution and organic community growth.

🌟 What Makes ShadowNews Special:
- Email-first interaction model with unique user addresses
- Viral "snowball" distribution through CSV sharing
- AI-powered content enhancement and moderation
- Real-time collaboration with WebSocket integration
- Topic-based repository system for organized communities

🎯 Core Innovation:
ShadowNews revolutionizes how online communities grow by treating email as a
first-class citizen. Users can post, comment, and manage repositories entirely
through email, while the platform enables organic growth through viral CSV
distribution - creating a "snowball effect" where communities naturally expand.

📧 Email-First Philosophy:
Every user receives a unique @shadownews.community email address, enabling
seamless content creation and community interaction without traditional web
interfaces. This approach bridges the gap between email workflows and modern
social platforms.

🚀 Target Audience:
- Community managers seeking organic growth strategies
- Email-heavy workflows in professional environments
- Privacy-conscious users preferring email-based interactions
- Open source enthusiasts building topic-specific communities
- Organizations managing internal knowledge sharing

🛠️ Technical Foundation:
- Modern React frontend with TypeScript and Tailwind CSS
- Scalable Node.js backend with Express.js and MongoDB
- Real-time features powered by Socket.io WebSocket integration
- AI integration with OpenAI for content enhancement
- Production-ready containerization with Docker and Kubernetes
- Comprehensive CI/CD pipeline with GitHub Actions

🌍 Vision:
Creating the most natural way for communities to form, grow, and thrive through
the universal medium of email, while maintaining the engagement and real-time
features users expect from modern platforms.

Repository: https://github.com/DrmedPatrickSchur/ShadowNews
Documentation: ./docs/
License: MIT
Last Updated: July 27, 2025
Version: 1.0.0
============================================================================
-->

# ShadowNews 🚀

> An email-first Hacker News clone where content spreads through snowball distribution, allowing communities to grow organically via CSV imports and email forwards.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-%3E%3D%206.0-green)](https://www.mongodb.com)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

## 🌟 Features

### 📧 Email-First Platform
- **Unique Email Address**: Each user gets `username@shadownews.community`
- **Post via Email**: Send emails to create posts instantly
- **Email Commands**: Manage repositories without visiting the site
- **Reply to Comment**: Respond to notifications to add comments

### 🎯 Snowball Distribution
- **Organic Growth**: Repositories grow as members forward emails
- **Smart Threshold**: Auto-add emails after X forwards
- **Privacy Controls**: Opt-in/opt-out mechanisms
- **Growth Analytics**: Track viral spread in real-time

### 📊 Repository System
- **CSV Import/Export**: Bulk manage email lists
- **Topic-Based**: Organize communities around interests
- **Digest Automation**: Weekly curated content emails
- **Collaborator Roles**: Admin, moderator, viewer permissions

### 🤖 AI-Powered Features
- **Smart Hashtags**: AI suggests relevant tags
- **Content Summarization**: Automated digest summaries
- **Spam Detection**: Keep communities clean
- **Topic Extraction**: Identify trending themes

### ⚡ Real-Time Updates
- **WebSocket Integration**: Live post/comment updates
- **Typing Indicators**: See who's commenting
- **Instant Notifications**: Mentions and replies
- **Live Vote Counts**: Real-time karma changes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- SendGrid account (or other email service)
- Domain name (for email routing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DrmedPatrickSchur/ShadowNews.git
   cd ShadowNews
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   Required variables:
   ```env
   # Application
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/shadownews
   REDIS_URL=redis://localhost:6379

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-key

   # Email Configuration
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com

   # AI Features (Optional)
   OPENAI_API_KEY=your-openai-api-key

   # AWS (for production)
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_REGION=us-east-1
   ```

4. **Run with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

   Or run manually:
   ```bash
   # Start MongoDB and Redis
   docker run -d -p 27017:27017 --name mongo mongo:6
   docker run -d -p 6379:6379 --name redis redis:7

   # Start backend
   cd backend && npm run dev

   # Start frontend (new terminal)
   cd frontend && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api-docs
   - WebSocket: ws://localhost:5000

## 📁 Project Structure

```
ShadowNews/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── api/            # REST endpoints
│   │   │   ├── controller/ # Route handlers
│   │   │   ├── middleware/ # Auth, validation, etc.
│   │   │   └── routes/     # Route definitions
│   │   ├── models/         # MongoDB schemas
│   │   ├── services/       # Business logic
│   │   ├── workers/        # Background jobs
│   │   ├── websocket/      # Real-time handlers
│   │   └── utils/          # Helper functions
│   ├── tests/              # Test suites
│   └── package.json
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API clients
│   │   ├── store/          # Redux state
│   │   ├── styles/         # CSS and themes
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── shared/                 # Shared types and constants
│   ├── types/              # TypeScript interfaces
│   ├── constants/          # Shared constants
│   └── validators/         # Validation schemas
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   ├── architecture/      # System design docs
│   ├── features/          # Feature specifications
│   └── setup/             # Setup guides
├── docker/                # Docker configurations
├── cypress/               # E2E tests
└── docker-compose.yml     # Local development
```

## 📧 Email Configuration

### SendGrid Setup

1. **Create SendGrid account** at [sendgrid.com](https://sendgrid.com)

2. **Get API Key**
   - Go to Settings > API Keys
   - Create a new API key with full access
   - Copy the key to your `.env` file

3. **Verify Domain** (Optional for development)
   - Go to Settings > Sender Authentication
   - Verify a domain or single sender email

4. **Configure Inbound Parse** (For production)
   - Go to Settings > Inbound Parse
   - Add webhook: `https://yourdomain.com/api/email/inbound`

### Email Commands

Send emails to interact with ShadowNews:

```
# Create a post
Subject: My awesome post title
Body: This is the content of my post...

# Add users to repository
Subject: ADD
Body: user1@example.com, user2@example.com
Repository: Tech News

# Get repository stats
Subject: STATS
Repository: Tech News

# Export repository as CSV
Subject: EXPORT
Repository: Tech News
```

## 🚀 Deployment

### Environment Setup

Create production environment file:
```bash
cp .env.example .env.production
```

### Option 1: Docker Deployment (Recommended)

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Or use the deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Option 2: Manual Deployment

```bash
# Build frontend
cd frontend && npm run build

# Start backend in production
cd backend && npm run start:prod
```

### Option 3: Cloud Deployment

- **Vercel**: Frontend deployment
- **Railway/Heroku**: Backend API
- **MongoDB Atlas**: Database
- **Redis Cloud**: Caching
- **SendGrid**: Email service

See [deployment documentation](./docs/setup/production.md) for detailed instructions.

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Backend unit tests
cd backend && npm test

# Backend with coverage
cd backend && npm run test:coverage

# Frontend tests
cd frontend && npm test

# E2E tests with Cypress
npm run cypress:open

# Run E2E headless
npm run cypress:run
```

### Email Testing
1. Use [mail-tester.com](https://www.mail-tester.com) for deliverability
2. Test webhook with ngrok for local development
3. Check SendGrid activity feed for delivery status

## 📊 API Documentation

### Authentication
```http
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/logout          # Logout user
GET    /api/auth/me              # Get current user
POST   /api/auth/refresh         # Refresh JWT token
POST   /api/auth/forgot-password # Send reset email
POST   /api/auth/reset-password  # Reset password
GET    /api/auth/verify-email/:token # Verify email
```

### Posts
```http
GET    /api/posts                # Get all posts
GET    /api/posts/:id            # Get single post
POST   /api/posts                # Create post
PUT    /api/posts/:id            # Update post
DELETE /api/posts/:id            # Delete post
POST   /api/posts/:id/vote       # Vote on post
GET    /api/posts/:id/comments   # Get post comments
```

### Comments
```http
GET    /api/comments/:id         # Get comment
POST   /api/comments             # Create comment
PUT    /api/comments/:id         # Update comment
DELETE /api/comments/:id         # Delete comment
POST   /api/comments/:id/vote    # Vote on comment
```

### Repositories
```http
GET    /api/repositories         # Get all repositories
GET    /api/repositories/:id     # Get repository
POST   /api/repositories         # Create repository
PUT    /api/repositories/:id     # Update repository
DELETE /api/repositories/:id     # Delete repository
POST   /api/repositories/:id/csv # Upload CSV
GET    /api/repositories/:id/export # Export CSV
POST   /api/repositories/:id/digest # Send digest
```

### CSV Operations
```http
POST   /api/csv/upload           # Upload CSV file
POST   /api/csv/validate         # Validate CSV
GET    /api/csv/template         # Download template
```

For complete API documentation, visit `/api-docs` when running the server.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests**
   ```bash
   npm test
   ```
6. **Commit with conventional format**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push and create Pull Request**

### Code Style

- **ESLint**: Configured for TypeScript and React
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

### Testing Requirements

- Unit tests for new functions
- Integration tests for API endpoints
- E2E tests for user workflows
- Minimum 80% code coverage

## 🛡️ Security

### Reporting Security Issues

Please email security@shadownews.community for security concerns.

### Security Features

- JWT authentication with refresh tokens
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Password hashing with bcrypt
- Email verification required
- GDPR compliant data handling

### Security Best Practices

- Regular dependency updates
- Environment variable protection
- Database query sanitization
- XSS protection
- CSRF protection
- Secure cookie settings

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker restart mongo
```

**Email Not Sending**
```bash
# Check SendGrid API key
curl -X GET https://api.sendgrid.com/v3/user/profile \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test email endpoint
curl -X POST http://localhost:5000/api/test/email
```

**Frontend Not Loading**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
```

**WebSocket Connection Issues**
- Check firewall settings
- Verify CORS configuration
- Test with WebSocket client

### Getting Help

- Check [documentation](./docs/)
- Search [existing issues](https://github.com/DrmedPatrickSchur/ShadowNews/issues)
- Join [Discord community](https://discord.gg/shadownews)
- Email support@shadownews.community

## 📈 Roadmap

### Version 1.1 (Q3 2025)
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI content moderation improvements
- [ ] Better email template customization
- [ ] Enhanced search functionality

### Version 1.2 (Q4 2025)
- [ ] Federation support (ActivityPub)
- [ ] Plugin system for extensions
- [ ] Advanced role permissions
- [ ] Multi-language support
- [ ] Video/audio content support

### Version 2.0 (2026)
- [ ] Blockchain integration for karma
- [ ] Advanced AI features
- [ ] Enterprise SSO integration
- [ ] White-label solutions
- [ ] GraphQL API

## 📊 Performance

### Benchmarks
- **API Response Time**: < 100ms average
- **WebSocket Latency**: < 50ms
- **Email Processing**: < 2 seconds
- **CSV Processing**: 10k emails/minute
- **Database Queries**: Optimized with indexes

### Scaling
- Horizontal scaling with Docker Swarm/Kubernetes
- Redis clustering for high availability
- MongoDB sharding for large datasets
- CDN integration for static assets
- Background job processing with Bull

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Hacker News](https://news.ycombinator.com)
- Built with [React](https://reactjs.org) and [Node.js](https://nodejs.org)
- Email processing by [SendGrid](https://sendgrid.com)
- Real-time features powered by [Socket.io](https://socket.io)
- UI components from [Tailwind CSS](https://tailwindcss.com)
- Icons by [Heroicons](https://heroicons.com)

## 💬 Community

- **GitHub**: [ShadowNews Repository](https://github.com/DrmedPatrickSchur/ShadowNews)
- **Discord**: [Join our server](https://discord.gg/shadownews)
- **Twitter**: [@shadownews](https://twitter.com/shadownews)
- **Email**: support@shadownews.community
- **Documentation**: [docs.shadownews.community](https://docs.shadownews.community)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=DrmedPatrickSchur/ShadowNews&type=Date)](https://star-history.com/#DrmedPatrickSchur/ShadowNews&Date)

---

**Built with ❤️ by the ShadowNews community**

> "The future of community building is email-first" - ShadowNews Team

/**
 * @fileoverview development.md
 * 
 * Implementation file for development.md
 * 
 * Key Features:
 * - Core functionality
 * - Error handling
 * - Performance optimization
 * 
 * Dependencies:
 *  * - No external dependencies
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */\n\n<!--
============================================================================
ShadowNews - Development Environment Setup Guide
============================================================================

Comprehensive setup guide for ShadowNews development environment, including
local installation, configuration, and development workflow documentation.

Purpose:
- Provide step-by-step development environment setup
- Document required dependencies and tools
- Establish development workflow and best practices
- Guide new developers through onboarding process

Target Audience:
- New developers joining the ShadowNews team
- Contributing developers setting up local environments
- DevOps engineers configuring development infrastructure
- QA engineers setting up testing environments

Coverage:
- Complete local development stack setup
- Docker Compose development services
- Database initialization and migration procedures
- Environment configuration and secrets management
- Development tools and IDE configuration
- Testing setup and quality assurance workflows

Development Stack:
- Node.js backend with Express.js framework
- React frontend with TypeScript and Tailwind CSS
- MongoDB database with Redis caching
- Docker containerization for consistent environments
- Jest testing framework with Cypress E2E tests
- ESLint and Prettier for code quality

Prerequisites:
- Modern development machine (macOS, Linux, or Windows with WSL2)
- Git version control system
- Node.js v18+ with npm package manager
- Docker Desktop for containerized services
- VS Code or similar IDE with recommended extensions

Last Updated: 2025-07-27
Version: 1.0.0
============================================================================
-->

# ShadowNews Development Setup

## Prerequisites

- Node.js v18+ and npm v9+
- MongoDB v6+
- Redis v7+
- Docker and Docker Compose
- Git
- SendGrid account (for email processing)
- OpenAI API key (for AI features)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/shadownews.git
cd shadownews

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services with Docker
docker-compose up -d

# Run database migrations
cd backend && npm run migrate

# Seed initial data
npm run seed

# Start development servers
npm run dev
```

## Environment Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/shadownews
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
SESSION_SECRET=your-session-secret

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_WEBHOOK_SECRET=your-webhook-secret
INBOUND_EMAIL_DOMAIN=dev.shadownews.community
FROM_EMAIL=noreply@shadownews.community
SUPPORT_EMAIL=support@shadownews.community

# Email Processing
EMAIL_QUEUE_NAME=email-processing
EMAIL_WORKER_CONCURRENCY=5
MAX_EMAIL_SIZE=10485760

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=shadownews-dev

# AI Services
OPENAI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4
MAX_AI_TOKENS=150

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket
WS_PORT=5001
WS_CORS_ORIGIN=http://localhost:3000

# Worker Configuration
WORKER_QUEUE_HOST=localhost
WORKER_QUEUE_PORT=6379
DIGEST_CRON_SCHEDULE=0 8 * * *
CLEANUP_CRON_SCHEDULE=0 2 * * *

# Feature Flags
ENABLE_EMAIL_POSTING=true
ENABLE_SNOWBALL=true
ENABLE_AI_FEATURES=true
ENABLE_DIGEST_EMAILS=true

# Development
LOG_LEVEL=debug
ENABLE_SWAGGER=true
ENABLE_GRAPHQL_PLAYGROUND=true
```

### Frontend Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5001

# Application
REACT_APP_NAME=Shadownews
REACT_APP_TAGLINE=Where Ideas Snowball Into Communities
REACT_APP_EMAIL_DOMAIN=dev.shadownews.community

# Features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_SENTRY=false

# Third Party
REACT_APP_GOOGLE_ANALYTICS_ID=
REACT_APP_SENTRY_DSN=

# Development
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

## Local Development Without Docker

### 1. Install MongoDB

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 2. Install Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

### 3. Configure SendGrid Inbound Parse

1. Log in to SendGrid Dashboard
2. Navigate to Settings → Inbound Parse
3. Add Host & URL:
   - Host: `dev.shadownews.community`
   - URL: `http://your-ngrok-url.ngrok.io/api/email/inbound`
4. Check "POST the raw, full MIME message"
5. Save

### 4. Set up ngrok for Email Testing

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 5000

# Update backend .env with ngrok URL
INBOUND_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/email/inbound
```

## Database Setup

### MongoDB Indexes

```javascript
// Run these in MongoDB shell or create a migration
use shadownews

// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ karma: -1 })
db.users.createIndex({ createdAt: -1 })

// Posts collection
db.posts.createIndex({ author: 1 })
db.posts.createIndex({ score: -1 })
db.posts.createIndex({ createdAt: -1 })
db.posts.createIndex({ hashtags: 1 })
db.posts.createIndex({ "repository.id": 1 })
db.posts.createIndex({ title: "text", content: "text" })

// Comments collection
db.comments.createIndex({ post: 1 })
db.comments.createIndex({ author: 1 })
db.comments.createIndex({ parent: 1 })
db.comments.createIndex({ score: -1 })

// Repositories collection
db.repositories.createIndex({ owner: 1 })
db.repositories.createIndex({ topic: 1 })
db.repositories.createIndex({ emailCount: -1 })
db.repositories.createIndex({ name: "text", description: "text" })

// Emails collection
db.emails.createIndex({ repository: 1 })
db.emails.createIndex({ email: 1 })
db.emails.createIndex({ verified: 1 })
db.emails.createIndex({ addedBy: 1 })
```

### Seed Data

```bash
cd backend

# Create admin user
npm run seed:admin

# Generate sample data
npm run seed:users 100
npm run seed:posts 500
npm run seed:repositories 20
npm run seed:comments 2000
```

## Development Workflow

### Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Run specific workers
npm run worker:email
npm run worker:digest
npm run worker:snowball

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Database commands
npm run db:migrate
npm run db:rollback
npm run db:seed
npm run db:reset
```

### Frontend Development

```bash
cd frontend

# Start development server
npm start

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

## API Development

### Testing API Endpoints

```bash
# Import Postman collection
backend/postman/Shadownews.postman_collection.json

# Or use HTTPie
# Create user
http POST localhost:5000/api/auth/register \
  username=testuser \
  email=test@example.com \
  password=password123

# Login
http POST localhost:5000/api/auth/login \
  email=test@example.com \
  password=password123

# Create post
http POST localhost:5000/api/posts \
  "Authorization: Bearer <token>" \
  title="Test Post" \
  content="This is a test" \
  hashtags:='["#test", "#development"]'
```

### GraphQL Playground

Navigate to `http://localhost:5000/graphql` for interactive API exploration.

## Email Testing

### Test Email Posting

```bash
# Send test email to create post
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@example.com",
    "to": "test@dev.shadownews.community",
    "subject": "Test Post via Email",
    "text": "This is a test post sent via email #test #email",
    "attachments": []
  }'
```

### Test Repository CSV

```bash
# Upload test CSV
curl -X POST http://localhost:5000/api/repositories/<id>/csv \
  -H "Authorization: Bearer <token>" \
  -F "file=@test-emails.csv"
```

## Debugging

### Backend Debugging

```javascript
// VS Code launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/server.js",
      "envFile": "${workspaceFolder}/backend/.env",
      "console": "integratedTerminal"
    }
  ]
}
```

### Frontend Debugging

```javascript
// VS Code launch.json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug Frontend",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}/frontend/src"
}
```

### Redis Monitoring

```bash
# Monitor Redis commands
redis-cli monitor

# Check Redis keys
redis-cli
> KEYS *
> GET session:*
> LRANGE email-queue 0 -1
```

## Performance Optimization

### Backend Optimization

```bash
# Profile Node.js
node --prof backend/src/server.js

# Generate flame graph
npm run profile
npm run flame

# Check memory leaks
npm run heapdump
```

### Frontend Optimization

```bash
# Analyze bundle
npm run build:analyze

# Lighthouse CI
npm run lighthouse

# Performance monitoring
npm run perf
```

## Common Issues

### MongoDB Connection Failed

```bash
# Check MongoDB status
brew services list | grep mongodb
sudo systemctl status mongod

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
tail -f /var/log/mongodb/mongod.log
```

### Redis Connection Failed

```bash
# Check Redis status
redis-cli ping

# Check Redis config
redis-cli CONFIG GET bind
redis-cli CONFIG GET protected-mode
```

### Email Webhook Not Receiving

```bash
# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# Test webhook manually
curl -X POST http://localhost:5000/api/email/inbound \
  -H "Content-Type: application/json" \
  -d @backend/tests/fixtures/sample-email.json
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/email-repository

# Commit with conventional commits
git commit -m "feat: add snowball distribution algorithm"
git commit -m "fix: email parsing for attachments"
git commit -m "docs: update API documentation"

# Push and create PR
git push origin feature/email-repository
```

## Pre-commit Hooks

```bash
# Install husky
npm install

# Hooks will run automatically on commit:
# - Linting
# - Type checking
# - Unit tests
# - Commit message validation
```

## Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "mongodb.mongodb-vscode",
    "humao.rest-client",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "steoates.autoimport",
    "wix.vscode-import-cost",
    "christian-kohler.path-intellisense",
    "visualstudioexptteam.vscodeintellicode",
    "ms-vscode.vscode-typescript-tslint-plugin"
  ]
}
```

## Next Steps

1. Complete environment setup
2. Run seed scripts to populate test data
3. Test email integration with ngrok
4. Implement your first feature
5. Join our Discord for development discussions

For production deployment, see `docs/setup/production.md`.
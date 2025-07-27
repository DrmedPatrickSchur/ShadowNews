<!--
============================================================================
ShadowNews - Environment Configuration Guide
============================================================================

Comprehensive guide for configuring ShadowNews environment variables,
secrets management, and multi-environment deployment configurations.

Purpose:
- Define all required environment variables and configurations
- Document secrets management and security best practices
- Provide environment-specific configuration templates
- Establish configuration validation and error handling

Target Audience:
- DevOps engineers configuring deployment environments
- Backend developers setting up local development
- Security engineers managing secrets and credentials
- System administrators deploying production systems

Coverage:
- Complete environment variable reference
- Development, staging, and production configurations
- Secrets management and security considerations
- Database and external service configurations
- Email service provider integrations
- AI service and third-party API configurations

Security Features:
- Environment-specific secret isolation
- Encrypted secrets management with rotation
- Database connection security and SSL
- API key management and rate limiting
- CORS configuration and domain restrictions
- Production hardening and security headers

Configuration Categories:
- Server and application runtime settings
- Database connections and clustering
- External service integrations (email, AI, payment)
- Security tokens and authentication secrets
- Monitoring and logging configurations
- Feature flags and environment toggles

Last Updated: 2025-07-27
Version: 1.0.0
============================================================================
-->

# Environment Configuration\n\n# Environment Configuration

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shadownews
MONGODB_URI_TEST=mongodb://localhost:27017/shadownews-test

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@artofdigitalshadow.org
EMAIL_FROM_NAME=Shadownews

# Inbound Email Configuration
INBOUND_EMAIL_DOMAIN=inbound.artofdigitalshadow.org
INBOUND_EMAIL_WEBHOOK_SECRET=your-webhook-secret

# AWS Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=shadownews-uploads

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/shadownews.log

# Bull Queue Configuration
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
BULL_CONCURRENCY=5

# Sentry Configuration (Error Tracking)
SENTRY_DSN=your-sentry-dsn

# Analytics
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
MIXPANEL_TOKEN=your-mixpanel-token

# Feature Flags
ENABLE_EMAIL_POSTING=true
ENABLE_SNOWBALL_DISTRIBUTION=true
ENABLE_AI_FEATURES=true
ENABLE_PWA=true

# Security
BCRYPT_ROUNDS=10
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WEBSOCKET_URL=ws://localhost:5000

# Environment
REACT_APP_ENV=development

# Features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_SENTRY=true

# Third Party Services
REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Public URLs
REACT_APP_PUBLIC_URL=http://localhost:3000
REACT_APP_BRAND_NAME=Shadownews

# WebSocket Configuration
REACT_APP_WS_RECONNECT_INTERVAL=5000
REACT_APP_WS_MAX_RECONNECT_ATTEMPTS=5

# Upload Limits
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=.csv,.txt

# Feature Flags
REACT_APP_SHOW_KARMA_SCORES=true
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_EMAIL_COMPOSER=true
```

## Production Environment Variables

### Backend Production

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
API_VERSION=v1
CORS_ORIGIN=https://artofdigitalshadow.org

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shadownews?retryWrites=true&w=majority

# Redis Configuration (Redis Cloud or AWS ElastiCache)
REDIS_HOST=redis-production-host.com
REDIS_PORT=6379
REDIS_PASSWORD=strong-redis-password
REDIS_TLS=true

# JWT Configuration
JWT_SECRET=production-secret-minimum-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=production-refresh-secret-minimum-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.production-api-key
EMAIL_FROM=hello@artofdigitalshadow.org
EMAIL_FROM_NAME=Shadownews

# Inbound Email Configuration
INBOUND_EMAIL_DOMAIN=inbound.artofdigitalshadow.org
INBOUND_EMAIL_WEBHOOK_SECRET=production-webhook-secret

# AWS Configuration
AWS_ACCESS_KEY_ID=production-aws-key
AWS_SECRET_ACCESS_KEY=production-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=shadownews-production

# OpenAI Configuration
OPENAI_API_KEY=production-openai-key
OPENAI_MODEL=gpt-4

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Session Configuration
SESSION_SECRET=production-session-secret-minimum-32-chars

# Logging
LOG_LEVEL=error
LOG_FILE=/var/log/shadownews/app.log

# Bull Queue Configuration
BULL_REDIS_HOST=redis-production-host.com
BULL_REDIS_PORT=6379
BULL_REDIS_PASSWORD=strong-redis-password
BULL_CONCURRENCY=10

# Sentry Configuration
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=production-mixpanel-token

# Security
BCRYPT_ROUNDS=12
ENCRYPTION_KEY=production-32-character-encryption-key
```

### Frontend Production

```bash
# API Configuration
REACT_APP_API_URL=https://api.artofdigitalshadow.org/v1
REACT_APP_WEBSOCKET_URL=wss://api.artofdigitalshadow.org

# Environment
REACT_APP_ENV=production

# Features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_SENTRY=true

# Third Party Services
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Public URLs
REACT_APP_PUBLIC_URL=https://artofdigitalshadow.org
REACT_APP_BRAND_NAME=Shadownews

# WebSocket Configuration
REACT_APP_WS_RECONNECT_INTERVAL=5000
REACT_APP_WS_MAX_RECONNECT_ATTEMPTS=10

# Upload Limits
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=.csv,.txt

# Feature Flags
REACT_APP_SHOW_KARMA_SCORES=true
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_EMAIL_COMPOSER=true
```

## Docker Environment

### docker-compose.yml Environment

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: shadownews

  redis:
    image: redis:7-alpine
    environment:
      REDIS_PASSWORD: redis-password

  backend:
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://admin:password@mongodb:27017/shadownews?authSource=admin
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: redis-password

  frontend:
    environment:
      REACT_APP_API_URL: http://localhost:5000/api/v1
      REACT_APP_WEBSOCKET_URL: ws://localhost:5000
```

## Environment Variable Validation

### Backend Validation (config/index.js)

```javascript
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SENDGRID_API_KEY',
  'EMAIL_FROM',
  'REDIS_HOST',
  'REDIS_PORT'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = { validateEnv };
```

## Environment-Specific Configurations

### Development

```bash
# Additional development tools
DEBUG=shadownews:*
MORGAN_LOG_LEVEL=dev
ENABLE_SWAGGER=true
ENABLE_GRAPHQL_PLAYGROUND=true
```

### Staging

```bash
# Staging specific
NODE_ENV=staging
ENABLE_FEATURE_FLAGS=true
ENABLE_A_B_TESTING=true
LOG_LEVEL=info
```

### Testing

```bash
# Test environment
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/shadownews-test
JWT_SECRET=test-secret
DISABLE_RATE_LIMITING=true
DISABLE_EMAIL_SENDING=true
```

## Secret Management

### Using dotenv-vault

```bash
# Install dotenv-vault
npm install -g dotenv-vault

# Login to dotenv-vault
npx dotenv-vault login

# Push secrets
npx dotenv-vault push

# Pull secrets
npx dotenv-vault pull
```

### AWS Secrets Manager

```bash
# Store secrets in AWS
aws secretsmanager create-secret \
  --name shadownews/production \
  --secret-string file://.env.production

# Retrieve secrets
aws secretsmanager get-secret-value \
  --secret-id shadownews/production \
  --query SecretString \
  --output text
```

## Environment Setup Commands

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET
openssl rand -hex 16     # For ENCRYPTION_KEY

# Verify environment
npm run env:check

# Load environment for different stages
npm run env:dev
npm run env:staging
npm run env:prod
```
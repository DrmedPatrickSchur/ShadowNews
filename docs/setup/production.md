# Shadownews Production Deployment Guide

## Prerequisites

- Ubuntu 20.04+ or Amazon Linux 2
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- MongoDB 6.0+
- Redis 7.0+
- Nginx 1.21+
- SSL Certificate (Let's Encrypt)
- SendGrid/AWS SES Account
- OpenAI API Key
- Domain name configured

## Server Requirements

### Minimum Specifications
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Bandwidth**: 1TB/month
- **OS**: Ubuntu 20.04 LTS

### Recommended Specifications
- **CPU**: 8 vCPUs
- **RAM**: 16GB
- **Storage**: 500GB SSD
- **Bandwidth**: Unlimited
- **OS**: Ubuntu 22.04 LTS

## Environment Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
```

### 3. Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 5. Install MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 6. Install Redis
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 7. Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Application Deployment

### 1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/yourusername/shadownews.git
sudo chown -R $USER:$USER shadownews
cd shadownews
```

### 2. Environment Configuration

Create production environment files:

#### Backend (.env.production)
```bash
# Server Configuration
NODE_ENV=production
PORT=5000
API_URL=https://api.shadownews.com

# Database
MONGODB_URI=mongodb://localhost:27017/shadownews_prod
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-min-64-chars
JWT_EXPIRE=7d
SESSION_SECRET=your-super-secure-session-secret-min-64-chars

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@shadownews.com
EMAIL_DOMAIN=shadownews.com
INBOUND_EMAIL_WEBHOOK_URL=https://api.shadownews.com/api/email/inbound

# AWS Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=shadownews-uploads

# AI Configuration
OPENAI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4-turbo-preview

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://shadownews.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-new-relic-key

# Feature Flags
ENABLE_EMAIL_REPOSITORIES=true
ENABLE_SNOWBALL_DISTRIBUTION=true
ENABLE_AI_FEATURES=true
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://api.shadownews.com
REACT_APP_WS_URL=wss://api.shadownews.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=$npm_package_version
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_GA_TRACKING_ID=your-google-analytics-id
```

### 3. Build Applications

#### Backend Build
```bash
cd backend
npm ci --production
npm run build
```

#### Frontend Build
```bash
cd ../frontend
npm ci
npm run build
```

### 4. Database Setup
```bash
# Create database indexes
mongosh shadownews_prod < scripts/create-indexes.js

# Run migrations
cd backend
npm run migrate:prod
```

## Docker Deployment

### 1. Production Docker Compose
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: shadownews-backend
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    networks:
      - shadownews-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: shadownews-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - shadownews-network

  mongodb:
    image: mongo:6.0
    container_name: shadownews-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=your-secure-password
      - MONGO_INITDB_DATABASE=shadownews_prod
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - shadownews-network

  redis:
    image: redis:7-alpine
    container_name: shadownews-redis
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass your-redis-password
    volumes:
      - redis_data:/data
    networks:
      - shadownews-network

  nginx:
    image: nginx:alpine
    container_name: shadownews-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
      - frontend
    networks:
      - shadownews-network

  certbot:
    image: certbot/certbot
    container_name: shadownews-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    container_name: shadownews-worker
    restart: always
    env_file:
      - ./backend/.env.production
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./logs:/app/logs
    networks:
      - shadownews-network

volumes:
  mongodb_data:
  redis_data:

networks:
  shadownews-network:
    driver: bridge
```

### 2. Nginx Configuration
Create `nginx/nginx.prod.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    multi_accept on;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Upstream servers
    upstream backend {
        least_conn;
        server backend:5000 max_fails=3 fail_timeout=30s;
    }

    upstream frontend {
        server frontend:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name shadownews.com www.shadownews.com api.shadownews.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # Main application
    server {
        listen 443 ssl http2;
        server_name shadownews.com www.shadownews.com;

        ssl_certificate /etc/letsencrypt/live/shadownews.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/shadownews.com/privkey.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.shadownews.com wss://api.shadownews.com" always;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # API subdomain
    server {
        listen 443 ssl http2;
        server_name api.shadownews.com;

        ssl_certificate /etc/letsencrypt/live/api.shadownews.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.shadownews.com/privkey.pem;

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS headers
            add_header 'Access-Control-Allow-Origin' 'https://shadownews.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Email webhook endpoint
        location /api/email/inbound {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Increase timeouts for email processing
            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }
    }
}
```

### 3. Deploy Application
```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## SSL Certificate Setup

### 1. Initial Certificate Generation
```bash
# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Generate certificates
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d shadownews.com \
  -d www.shadownews.com \
  -d api.shadownews.com \
  --email admin@shadownews.com \
  --agree-tos \
  --no-eff-email

# Restart nginx
docker-compose -f docker-compose.prod.yml start nginx
```

### 2. Auto-renewal Setup
```bash
# Create renewal script
cat > /opt/shadownews/scripts/renew-certs.sh << 'EOF'
#!/bin/bash
cd /opt/shadownews
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
EOF

chmod +x /opt/shadownews/scripts/renew-certs.sh

# Add to crontab
echo "0 0 * * 0 /opt/shadownews/scripts/renew-certs.sh >> /var/log/cert-renewal.log 2>&1" | sudo crontab -
```

## Database Backup

### 1. Backup Script
Create `/opt/shadownews/scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/shadownews"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="shadownews-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# MongoDB backup
docker exec shadownews-mongodb mongodump \
  --username admin \
  --password your-secure-password \
  --authenticationDatabase admin \
  --db shadownews_prod \
  --archive=/tmp/mongodb_$TIMESTAMP.gz \
  --gzip

docker cp shadownews-mongodb:/tmp/mongodb_$TIMESTAMP.gz $BACKUP_DIR/

# Redis backup
docker exec shadownews-redis redis-cli \
  -a your-redis-password \
  --rdb /tmp/redis_$TIMESTAMP.rdb

docker cp shadownews-redis:/tmp/redis_$TIMESTAMP.rdb $BACKUP_DIR/

# Upload to S3
aws s3 cp $BACKUP_DIR/mongodb_$TIMESTAMP.gz s3://$S3_BUCKET/mongodb/
aws s3 cp $BACKUP_DIR/redis_$TIMESTAMP.rdb s3://$S3_BUCKET/redis/

# Clean up old local backups (keep 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete
```

### 2. Schedule Backups
```bash
# Daily backups at 3 AM
echo "0 3 * * * /opt/shadownews/scripts/backup.sh >> /var/log/backup.log 2>&1" | sudo crontab -
```

## Monitoring Setup

### 1. Install Monitoring Stack
Create `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - shadownews-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your-grafana-password
    networks:
      - shadownews-network

  node_exporter:
    image: prom/node-exporter:latest
    container_name: node_exporter
    restart: always
    ports:
      - "9100:9100"
    networks:
      - shadownews-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    restart: always
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - shadownews-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  shadownews-network:
    external: true
```

### 2. Prometheus Configuration
Create `monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['node_exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 3. Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'shadownews-backend',
    script: './backend/dist/server.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G'
  }, {
    name: 'shadownews-worker',
    script: './backend/dist/workers/index.js',
    instances: 2,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Security Hardening

### 1. Firewall Configuration
```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp  # Grafana (restrict to your IP)
sudo ufw allow 9090/tcp  # Prometheus (restrict to your IP)

# Enable firewall
sudo ufw enable
```

### 2. Fail2ban Setup
```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create jail configuration
sudo cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

# Restart fail2ban
sudo systemctl restart fail2ban
```

### 3. Security Audit
```bash
# Install security tools
sudo apt install -y lynis aide

# Run security audit
sudo lynis audit system

# Initialize AIDE
sudo aideinit
sudo cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Schedule daily AIDE checks
echo "0 5 * * * /usr/bin/aide --check | mail -s 'AIDE Report' admin@shadownews.com" | sudo crontab -
```

## Performance Optimization

### 1. MongoDB Optimization
```javascript
// Create indexes - save as scripts/create-indexes.js
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ karma: -1 });

db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ score: -1 });
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ hashtags: 1 });
db.posts.createIndex({ 
  title: "text", 
  content: "text" 
}, { 
  weights: { 
    title: 10, 
    content: 5 
  } 
});

db.comments.createIndex({ post: 1, createdAt: -1 });
db.comments.createIndex({ author: 1 });
db.comments.createIndex({ parent: 1 });

db.repositories.createIndex({ owner: 1 });
db.repositories.createIndex({ topic: 1 });
db.repositories.createIndex({ emailCount: -1 });
db.repositories.createIndex({ members: 1 });

db.emails.createIndex({ repository: 1 });
db.emails.createIndex({ email: 1 });
db.emails.createIndex({ verified: 1 });
```

### 2. Redis Configuration
Create `redis/redis.prod.conf`:

```conf
# Redis Production Configuration
bind 127.0.0.1
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Clients
maxclients 10000

# AOF
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
```

### 3. Node.js Optimization
```javascript
// Add to backend startup script
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  require('./server');
}
```

## Deployment Checklist

### Pre-deployment
- [ ] All environment variables configured
- [ ] SSL certificates obtained
- [ ] Database migrations completed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Security hardening completed
- [ ] Load testing performed

### Deployment Steps
1. [ ] Build Docker images
2. [ ] Run database migrations
3. [ ] Start services with Docker Compose
4. [ ] Verify all containers are healthy
5. [ ] Test critical user paths
6. [ ] Monitor logs for errors
7. [ ] Verify SSL certificates
8. [ ] Test email functionality
9. [ ] Verify WebSocket connections
10. [ ] Check monitoring dashboards

### Post-deployment
- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify backup jobs
- [ ] Review security alerts
- [ ] Monitor performance metrics
- [ ] Update status page

## Rollback Procedure

### Quick Rollback
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore previous version
git checkout previous-version-tag
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Restore database if needed
docker exec shadownews-mongodb mongorestore \
  --username admin \
  --password your-secure-password \
  --authenticationDatabase admin \
  --db shadownews_prod \
  --drop \
  --archive=/backups/mongodb_backup.gz \
  --gzip
```

## Maintenance Mode

### Enable Maintenance Mode
```bash
# Create maintenance page
cat > /opt/shadownews/maintenance.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance - Shadownews</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>We'll be right back!</h1>
        <p>Shadownews is currently undergoing scheduled maintenance.</p>
        <p>We expect to be back online shortly.</p>
    </div>
</body>
</html>
EOF

# Update nginx to serve maintenance page
# Add to nginx server block:
# location / {
#     return 503;
# }
# error_page 503 @maintenance;
# location @maintenance {
#     root /opt/shadownews;
#     rewrite ^.*$ /maintenance.html break;
# }
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Check container status
docker ps -a

# Inspect container
docker inspect shadownews-backend
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
docker exec -it shadownews-mongodb mongosh \
  --username admin \
  --password your-secure-password \
  --authenticationDatabase admin

# Check Redis connection
docker exec -it shadownews-redis redis-cli -a your-redis-password ping
```

#### 3. Email Processing Issues
```bash
# Check email worker logs
docker-compose -f docker-compose.prod.yml logs worker | grep email

# Test SendGrid connection
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@shadownews.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```

#### 4. Performance Issues
```bash
# Check resource usage
docker stats

# MongoDB slow queries
docker exec -it shadownews-mongodb mongosh \
  --username admin \
  --password your-secure-password \
  --authenticationDatabase admin \
  --eval "db.setProfilingLevel(1, { slowms: 100 })"

# Check PM2 status
pm2 status
pm2 monit
```

## Scaling Guidelines

### Horizontal Scaling
```yaml
# Update docker-compose.prod.yml for multiple backend instances
backend:
  # ... existing config ...
  deploy:
    replicas: 4
    restart_policy:
      condition: on-failure
      delay: 5s
      max_attempts: 3
```

### Database Scaling
```bash
# MongoDB Replica Set
docker exec -it shadownews-mongodb mongosh \
  --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongodb1:27017'}, {_id: 1, host: 'mongodb2:27017'}, {_id: 2, host: 'mongodb3:27017'}]})"
```

### CDN Setup
```nginx
# Add CDN headers in nginx
location ~* \.(jpg|jpeg|gif|png|css|js|ico|webp|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
}
```

## Contact & Support

- **System Admin**: admin@shadownews.com
- **Emergency Contact**: +1-XXX-XXX-XXXX
- **Status Page**: https://status.shadownews.com
- **Documentation**: https://docs.shadownews.com
- **Monitoring**: https://grafana.shadownews.com

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial production deployment |
| 1.1.0 | 2024-02-01 | Added email repository feature |
| 1.2.0 | 2024-03-01 | Implemented snowball distribution |
| 1.3.0 | 2024-04-01 | Added AI features |
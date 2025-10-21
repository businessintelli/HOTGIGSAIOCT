# Deployment Guide - HotGigs.ai Resume Import System

## Overview

This guide provides step-by-step instructions for deploying the HotGigs.ai resume import system to production environments.

**Target Environment:** Production  
**Last Updated:** October 20, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Background Workers](#background-workers)
7. [WebSocket Configuration](#websocket-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Hardening](#security-hardening)
10. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### Required Services

- **Compute:** AWS EC2, Google Cloud Compute, or similar
- **Database:** PostgreSQL 14+
- **Cache:** Redis 6+
- **Storage:** AWS S3 or compatible object storage
- **CDN:** CloudFlare or AWS CloudFront
- **Load Balancer:** AWS ALB or Nginx

### Required Tools

- Docker 20.10+
- Docker Compose 2.0+
- Git
- AWS CLI (if using AWS)
- kubectl (if using Kubernetes)

### Domain & SSL

- Domain name configured
- SSL certificate (Let's Encrypt or commercial)
- DNS records configured

---

## Infrastructure Setup

### Architecture Overview

```
                    ┌─────────────┐
                    │   CloudFlare│
                    │     CDN     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
    │  Frontend   │ │  Backend  │ │  WebSocket  │
    │   (React)   │ │ (FastAPI) │ │   Server    │
    └─────────────┘ └─────┬─────┘ └──────┬──────┘
                          │               │
                    ┌─────▼───────────────▼─────┐
                    │      PostgreSQL DB        │
                    └───────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │    Redis    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Celery    │
                    │   Workers   │
                    └─────────────┘
```

### AWS Infrastructure (Example)

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create subnets
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24  # Public
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24  # Private

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier hotgigs-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 100 \
  --vpc-security-group-ids sg-xxx

# Create ElastiCache Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id hotgigs-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --num-cache-nodes 1

# Create S3 bucket for resume storage
aws s3 mb s3://hotgigs-resumes
aws s3api put-bucket-versioning \
  --bucket hotgigs-resumes \
  --versioning-configuration Status=Enabled
```

---

## Backend Deployment

### 1. Prepare Environment

**Create `.env.production` file:**

```bash
# Application
APP_ENV=production
DEBUG=False
SECRET_KEY=<generate-strong-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://user:password@db-host:5432/hotgigs
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://redis-host:6379/0

# Celery
CELERY_BROKER_URL=redis://redis-host:6379/1
CELERY_RESULT_BACKEND=redis://redis-host:6379/2

# AWS S3
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=us-east-1
S3_BUCKET_NAME=hotgigs-resumes

# OpenAI
OPENAI_API_KEY=<your-openai-key>

# Google Drive
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=https://api.hotgigs.ai/api/google-drive/auth/callback

# CORS
CORS_ORIGINS=https://hotgigs.ai,https://www.hotgigs.ai

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=<your-sentry-dsn>
```

### 2. Build Docker Image

**Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**Build and push:**

```bash
# Build image
docker build -t hotgigs-api:latest -f backend/Dockerfile backend/

# Tag for registry
docker tag hotgigs-api:latest registry.example.com/hotgigs-api:latest

# Push to registry
docker push registry.example.com/hotgigs-api:latest
```

### 3. Deploy with Docker Compose

**docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  api:
    image: registry.example.com/hotgigs-api:latest
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 2G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: hotgigs
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
  
  redis:
    image: redis:6-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
  
  celery-worker:
    image: registry.example.com/hotgigs-api:latest
    command: celery -A src.celery_app worker --loglevel=info --concurrency=4
    env_file:
      - .env.production
    depends_on:
      - redis
      - db
    restart: unless-stopped
    deploy:
      replicas: 2
  
  celery-beat:
    image: registry.example.com/hotgigs-api:latest
    command: celery -A src.celery_app beat --loglevel=info
    env_file:
      - .env.production
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**Deploy:**

```bash
# Deploy stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=4
```

### 4. Run Database Migrations

```bash
# Connect to API container
docker exec -it <api-container-id> bash

# Run migrations
python run_candidate_db_migration.py

# Verify
psql $DATABASE_URL -c "SELECT * FROM candidate_database LIMIT 1;"
```

---

## Frontend Deployment

### 1. Build Production Bundle

**Update environment variables:**

```bash
# .env.production
REACT_APP_API_URL=https://api.hotgigs.ai
REACT_APP_WS_URL=wss://api.hotgigs.ai
REACT_APP_ENV=production
REACT_APP_SENTRY_DSN=<your-sentry-dsn>
```

**Build:**

```bash
cd hotgigs-frontend

# Install dependencies
npm ci

# Build production bundle
npm run build

# Output in build/ directory
```

### 2. Deploy to CDN

**Option A: AWS S3 + CloudFront**

```bash
# Upload to S3
aws s3 sync build/ s3://hotgigs-frontend/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

**Option B: Nginx**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name hotgigs.ai www.hotgigs.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name hotgigs.ai www.hotgigs.ai;

    ssl_certificate /etc/letsencrypt/live/hotgigs.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hotgigs.ai/privkey.pem;

    root /var/www/hotgigs-frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

---

## Database Setup

### 1. Initialize Database

```sql
-- Create database
CREATE DATABASE hotgigs;

-- Create user
CREATE USER hotgigs_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hotgigs TO hotgigs_user;

-- Connect to database
\c hotgigs

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
```

### 2. Run Migrations

```bash
# Run all migrations
python run_candidate_db_migration.py

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### 3. Create Indexes

```sql
-- Performance indexes
CREATE INDEX idx_candidate_email ON candidate_database(email);
CREATE INDEX idx_candidate_recruiter ON candidate_database(recruiter_id);
CREATE INDEX idx_candidate_source ON candidate_database(source);
CREATE INDEX idx_candidate_created ON candidate_database(created_at);

-- Full-text search indexes
CREATE INDEX idx_candidate_name_trgm ON candidate_database USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_candidate_title_trgm ON candidate_database USING gin(title gin_trgm_ops);

-- Matching indexes
CREATE INDEX idx_match_candidate ON candidate_job_matches(candidate_id);
CREATE INDEX idx_match_job ON candidate_job_matches(job_id);
CREATE INDEX idx_match_score ON candidate_job_matches(match_score);
```

### 4. Backup Configuration

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/hotgigs_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "hotgigs_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-db.sh" | crontab -
```

---

## Background Workers

### Celery Configuration

**celery_config.py:**

```python
from celery import Celery
from src.core.config import settings

celery_app = Celery(
    'hotgigs',
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)
```

### Monitoring Workers

```bash
# Check worker status
celery -A src.celery_app inspect active

# Monitor in real-time
celery -A src.celery_app events

# Flower (web-based monitoring)
celery -A src.celery_app flower --port=5555
```

---

## WebSocket Configuration

### Nginx WebSocket Proxy

```nginx
# WebSocket configuration
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream websocket {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location /ws/ {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
        
        # Buffer settings
        proxy_buffering off;
    }
}
```

---

## Monitoring & Logging

### Application Monitoring

**Sentry Integration:**

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment="production"
)
```

### Logging Configuration

**logging_config.py:**

```python
import logging.config

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
            'stream': 'ext://sys.stdout'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'json',
            'filename': '/var/log/hotgigs/app.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10
        }
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file']
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
```

### Metrics Collection

**Prometheus Integration:**

```python
from prometheus_client import Counter, Histogram, make_asgi_app

# Metrics
resume_uploads = Counter('resume_uploads_total', 'Total resume uploads')
processing_time = Histogram('resume_processing_seconds', 'Resume processing time')

# Add metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

---

## Security Hardening

### SSL/TLS Configuration

```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers off;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/resumes/upload")
@limiter.limit("10/minute")
async def upload_resume():
    pass
```

### Firewall Rules

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (from specific IP)
sudo ufw allow from 1.2.3.4 to any port 22

# Enable firewall
sudo ufw enable
```

---

## Post-Deployment Checklist

### Smoke Tests

- [ ] Homepage loads
- [ ] Login works
- [ ] Resume upload works
- [ ] API endpoints respond
- [ ] WebSocket connects
- [ ] Notifications appear
- [ ] Database queries work
- [ ] Background jobs process

### Performance Tests

- [ ] Page load time < 2s
- [ ] API response time < 200ms
- [ ] Resume processing < 30s
- [ ] WebSocket latency < 100ms

### Security Tests

- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Authentication required
- [ ] SQL injection prevented
- [ ] XSS prevented

### Monitoring

- [ ] Sentry receiving errors
- [ ] Logs being collected
- [ ] Metrics being recorded
- [ ] Alerts configured
- [ ] Backups running

---

## Rollback Procedure

### Quick Rollback

```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
docker pull registry.example.com/hotgigs-api:previous
docker-compose -f docker-compose.prod.yml up -d

# Rollback database migration
psql $DATABASE_URL < backups/pre_migration_backup.sql
```

### Database Rollback

```bash
# Restore from backup
gunzip -c /backups/postgresql/hotgigs_20251020.sql.gz | psql $DATABASE_URL
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor disk space
- Review performance metrics

**Weekly:**
- Review security logs
- Update dependencies
- Check backup integrity

**Monthly:**
- Security audit
- Performance optimization
- Capacity planning

---

**Deployment completed successfully! 🚀**

For issues or questions, contact the DevOps team.


# HotGigs.ai - Complete Deployment Guide

**Version:** 2.0  
**Last Updated:** October 23, 2025  
**Author:** Manus AI

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start with Docker](#quick-start-with-docker)
4. [Local Development Setup](#local-development-setup)
5. [AWS Deployment](#aws-deployment)
6. [Production Deployment Checklist](#production-deployment-checklist)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance and Monitoring](#maintenance-and-monitoring)

---

## Overview

HotGigs.ai is a comprehensive AI-powered recruitment platform that replicates Jobright.ai's functionality. This guide provides detailed instructions for deploying the application in various environments, from local development to production AWS infrastructure.

### Architecture Overview

The application consists of the following components:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React + Vite + TailwindCSS | User interface for candidates and companies |
| **Backend API** | FastAPI + Python | RESTful API and business logic |
| **Database** | PostgreSQL 15+ | Primary data storage |
| **Cache/Queue** | Redis | Caching and Celery message broker |
| **Task Queue** | Celery | Background job processing |
| **AI Engine** | OpenAI GPT-4 | Resume parsing and intelligent matching |
| **Vector DB** | pgvector | Semantic search and similarity matching |

### Deployment Options

We provide three deployment options to suit different needs:

1. **Docker Compose** (Recommended for quick start and development)
2. **Local Development** (For active development and debugging)
3. **AWS ECS/Fargate** (For production deployment)

---

## Prerequisites

### All Deployment Methods

- **Git** - Version control
- **OpenAI API Key** - Required for AI features (get one at [platform.openai.com](https://platform.openai.com))

### Docker Deployment

- **Docker** 20.10+ - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** 2.0+ - [Install Docker Compose](https://docs.docker.com/compose/install/)

### Local Development

- **Python** 3.8+ - [Download Python](https://www.python.org/downloads/)
- **Node.js** 16+ - [Download Node.js](https://nodejs.org/)
- **PostgreSQL** 15+ - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Redis** 7+ - [Download Redis](https://redis.io/download)

### AWS Deployment

- **AWS CLI** 2.0+ - [Install AWS CLI](https://aws.amazon.com/cli/)
- **AWS Account** with appropriate permissions
- **Domain Name** (optional but recommended)

---

## Quick Start with Docker

The fastest way to get HotGigs.ai running is using Docker Compose. This method requires minimal setup and works on Windows, macOS, and Linux.

### Step 1: Clone the Repository

```bash
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT
```

### Step 2: Run Quick Start Script

**For Linux/macOS:**

```bash
./scripts/quick-start-docker.sh
```

**For Windows:**

```powershell
docker-compose -f docker-compose.local.yml up -d
```

### Step 3: Access the Application

Once the containers are running, access the application at:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### Step 4: Create Test Account

Navigate to http://localhost:3000 and click "Sign Up" to create your first account.

### Docker Compose Commands

| Command | Description |
|---------|-------------|
| `docker-compose -f docker-compose.local.yml up -d` | Start all services in detached mode |
| `docker-compose -f docker-compose.local.yml logs -f` | View real-time logs |
| `docker-compose -f docker-compose.local.yml ps` | Check service status |
| `docker-compose -f docker-compose.local.yml stop` | Stop all services |
| `docker-compose -f docker-compose.local.yml restart` | Restart all services |
| `docker-compose -f docker-compose.local.yml down` | Stop and remove containers |
| `docker-compose -f docker-compose.local.yml down -v` | Stop, remove containers and volumes |

---

## Local Development Setup

For active development with hot-reload and debugging capabilities, follow these steps to set up the application locally.

### Automated Setup

**For Linux/macOS:**

```bash
./scripts/setup-local.sh
```

**For Windows:**

```batch
scripts\setup-local.bat
```

The setup script will:
- Check and install prerequisites
- Create Python virtual environment
- Install all dependencies
- Set up database and Redis
- Create configuration files
- Generate start scripts

### Manual Setup

If you prefer manual setup or the automated script fails, follow these detailed steps:

#### Backend Setup

```bash
# Navigate to backend directory
cd backend/hotgigs-api

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your configuration

# Create uploads directory
mkdir -p uploads

# Set up database
createdb hotgigs_db
python migrations/run_all_migrations.py

# Start backend server
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/hotgigs-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
echo "VITE_WS_URL=ws://localhost:8000/ws" >> .env

# Start development server
npm run dev
```

#### Celery Worker Setup

```bash
# In a new terminal, navigate to backend
cd backend/hotgigs-api

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start Celery worker
celery -A src.core.celery_app worker --loglevel=info --concurrency=4
```

### Starting the Application

After setup, use these commands to start the application:

**Option 1 - Start all services at once:**

```bash
./start-all.sh  # Linux/macOS
start-all.bat   # Windows
```

**Option 2 - Start services individually:**

```bash
# Terminal 1: Backend
./start-backend.sh  # or start-backend.bat

# Terminal 2: Frontend
./start-frontend.sh  # or start-frontend.bat

# Terminal 3: Celery Worker
./start-celery.sh  # or start-celery.bat
```

---

## AWS Deployment

For production deployment, we recommend using AWS ECS with Fargate for a fully managed, scalable infrastructure.

### Architecture

The AWS deployment uses the following services:

- **ECS Fargate** - Container orchestration
- **RDS PostgreSQL** - Managed database
- **ElastiCache Redis** - Managed cache/queue
- **Application Load Balancer** - Traffic distribution
- **EFS** - Shared file storage
- **CloudWatch** - Logging and monitoring
- **Secrets Manager** - Secure credential storage
- **ECR** - Container image registry

### Step 1: Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
```

### Step 2: Set Up Infrastructure

Use CloudFormation to create the complete infrastructure:

```bash
cd aws
./setup-infrastructure.sh
```

The script will prompt you for:
- Environment name (development/staging/production)
- Database password
- JWT secret key
- OpenAI API key

This process takes approximately 15-20 minutes and creates:
- VPC with public and private subnets
- Security groups
- RDS PostgreSQL database
- ElastiCache Redis cluster
- EFS file system
- Application Load Balancer
- ECS cluster
- IAM roles and policies
- CloudWatch log groups
- Secrets Manager secrets

### Step 3: Deploy Application

After infrastructure is ready, deploy the application:

```bash
export AWS_ACCOUNT_ID=your-account-id
./deploy-to-aws.sh
```

This script will:
1. Create ECR repositories
2. Build Docker images
3. Push images to ECR
4. Register ECS task definition
5. Update ECS service

### Step 4: Configure Domain (Optional)

To use a custom domain:

1. **Request SSL Certificate** in AWS Certificate Manager
2. **Add HTTPS listener** to Application Load Balancer
3. **Configure Route53** to point to ALB DNS name

```bash
# Get ALB DNS name
aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text
```

### AWS Cost Estimation

| Service | Configuration | Estimated Monthly Cost |
|---------|--------------|----------------------|
| ECS Fargate | 2 tasks (1 vCPU, 2GB RAM) | $30-40 |
| RDS PostgreSQL | db.t3.micro | $15-20 |
| ElastiCache Redis | cache.t3.micro | $12-15 |
| Application Load Balancer | Standard | $16-20 |
| EFS | 20GB storage | $6-8 |
| Data Transfer | 100GB/month | $9-12 |
| **Total** | | **$88-115/month** |

> **Note:** Costs may vary based on usage patterns and AWS region.

### Scaling Configuration

The ECS service can be configured for auto-scaling:

```bash
# Configure auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/hotgigs-cluster/hotgigs-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Add scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/hotgigs-cluster/hotgigs-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    "TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization}"
```

---

## Production Deployment Checklist

Before deploying to production, ensure you have completed the following:

### Security

- [ ] Change all default passwords and secret keys
- [ ] Use strong, randomly generated JWT secret key (min 32 characters)
- [ ] Store all secrets in AWS Secrets Manager or environment variables
- [ ] Enable HTTPS/SSL with valid certificate
- [ ] Configure CORS to allow only trusted domains
- [ ] Enable database encryption at rest
- [ ] Set up VPC with private subnets for database and Redis
- [ ] Configure security groups to allow minimum required access
- [ ] Enable CloudWatch logging for all services
- [ ] Set up AWS WAF for DDoS protection (optional)

### Database

- [ ] Enable automated backups (7-30 days retention)
- [ ] Configure Multi-AZ deployment for high availability
- [ ] Set up read replicas if needed
- [ ] Run all database migrations
- [ ] Create database indexes for performance
- [ ] Enable pgvector extension for semantic search

### Application

- [ ] Set appropriate environment variables
- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Test all API endpoints
- [ ] Verify file upload functionality
- [ ] Test resume parsing with OpenAI API
- [ ] Verify Celery workers are processing tasks
- [ ] Configure monitoring and alerting
- [ ] Set up error tracking (Sentry/CloudWatch)
- [ ] Test video profile recording and playback
- [ ] Verify WebSocket connections work

### Performance

- [ ] Enable Redis caching
- [ ] Configure CDN for static assets (CloudFront)
- [ ] Optimize database queries
- [ ] Set up connection pooling
- [ ] Configure auto-scaling policies
- [ ] Load test the application
- [ ] Optimize Docker images (multi-stage builds)

### Monitoring

- [ ] Set up CloudWatch dashboards
- [ ] Configure alarms for critical metrics
- [ ] Enable application performance monitoring
- [ ] Set up log aggregation
- [ ] Configure uptime monitoring
- [ ] Set up cost alerts

---

## Environment Variables

### Backend Environment Variables

Create a `.env` file in `backend/hotgigs-api/`:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Configuration
SECRET_KEY=your-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Google Drive API (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-drive/auth/callback

# File Upload Configuration
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=/app/uploads

# Email Configuration (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# Application Settings
PYTHONUNBUFFERED=1
PYTHONPATH=/app/src
```

### Frontend Environment Variables

Create a `.env` file in `frontend/hotgigs-frontend/`:

```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws

# Supabase Configuration (if using Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Troubleshooting

### Common Issues and Solutions

#### Docker Issues

**Problem:** Containers fail to start

```bash
# Check container logs
docker-compose -f docker-compose.local.yml logs backend

# Check container status
docker-compose -f docker-compose.local.yml ps

# Rebuild containers
docker-compose -f docker-compose.local.yml up -d --build
```

**Problem:** Port already in use

```bash
# Find process using port 8000
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Kill the process or change port in docker-compose.yml
```

#### Database Issues

**Problem:** Cannot connect to database

```bash
# Check PostgreSQL is running
sudo service postgresql status  # Linux
brew services list  # macOS

# Test connection
psql -h localhost -U hotgigs -d hotgigs_db

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

**Problem:** Migration fails

```bash
# Reset database (WARNING: This deletes all data)
dropdb hotgigs_db
createdb hotgigs_db
python migrations/run_all_migrations.py
```

#### API Issues

**Problem:** 500 Internal Server Error

```bash
# Check backend logs
docker-compose -f docker-compose.local.yml logs backend

# Or if running locally
tail -f backend/hotgigs-api/logs/app.log
```

**Problem:** CORS errors in browser

- Verify `CORS_ORIGINS` in backend `.env` includes your frontend URL
- Clear browser cache and cookies
- Check browser console for specific error messages

#### Celery Issues

**Problem:** Background tasks not processing

```bash
# Check Celery worker status
docker-compose -f docker-compose.local.yml logs celery-worker

# Check Redis connection
redis-cli ping

# Restart Celery worker
docker-compose -f docker-compose.local.yml restart celery-worker
```

---

## Maintenance and Monitoring

### Regular Maintenance Tasks

#### Daily

- Monitor application logs for errors
- Check system resource usage (CPU, memory, disk)
- Verify backup completion

#### Weekly

- Review CloudWatch metrics and alarms
- Check for security updates
- Analyze slow queries and optimize

#### Monthly

- Update dependencies (security patches)
- Review and optimize costs
- Test disaster recovery procedures
- Audit user accounts and permissions

### Monitoring Dashboards

Access monitoring dashboards at:

- **Application Metrics:** http://localhost:8000/admin/system-health
- **CloudWatch Dashboard:** AWS Console → CloudWatch → Dashboards
- **Database Performance:** AWS Console → RDS → Performance Insights

### Key Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| API Response Time | > 2 seconds | Investigate slow endpoints |
| Error Rate | > 1% | Check logs and fix issues |
| CPU Usage | > 80% | Scale up or optimize code |
| Memory Usage | > 85% | Investigate memory leaks |
| Database Connections | > 80% of max | Increase connection pool |
| Disk Usage | > 80% | Clean up or expand storage |
| Queue Length | > 1000 | Scale Celery workers |

### Backup and Recovery

#### Automated Backups

AWS RDS automatically backs up the database daily. Configure retention period:

```bash
aws rds modify-db-instance \
  --db-instance-identifier hotgigs-production \
  --backup-retention-period 30 \
  --apply-immediately
```

#### Manual Backup

```bash
# Backup database
pg_dump -h your-rds-endpoint -U hotgigs hotgigs_db > backup.sql

# Backup uploads directory
tar -czf uploads-backup.tar.gz backend/hotgigs-api/uploads/
```

#### Restore from Backup

```bash
# Restore database
psql -h your-rds-endpoint -U hotgigs hotgigs_db < backup.sql

# Restore uploads
tar -xzf uploads-backup.tar.gz -C backend/hotgigs-api/
```

---

## Support and Resources

### Documentation

- **API Documentation:** http://localhost:8000/docs
- **GitHub Repository:** https://github.com/businessintelli/HOTGIGSAIOCT
- **Architecture Guide:** `/docs/DATABASE_ARCHITECTURE.md`
- **User Guide:** `/docs/USER_GUIDE.md`

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/businessintelli/HOTGIGSAIOCT/issues)
2. Review application logs for error messages
3. Consult the API documentation at `/docs`
4. Contact the development team

### Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for guidelines.

---

## Appendix

### A. Useful Commands Reference

```bash
# Docker
docker-compose -f docker-compose.local.yml up -d
docker-compose -f docker-compose.local.yml logs -f
docker-compose -f docker-compose.local.yml down -v

# Database
psql -h localhost -U hotgigs -d hotgigs_db
pg_dump hotgigs_db > backup.sql
psql hotgigs_db < backup.sql

# Backend
source venv/bin/activate
uvicorn src.main:app --reload
celery -A src.core.celery_app worker --loglevel=info

# Frontend
npm run dev
npm run build
npm run preview

# AWS
aws ecs update-service --cluster hotgigs-cluster --service hotgigs-service --force-new-deployment
aws logs tail /ecs/hotgigs-backend --follow
aws rds describe-db-instances --db-instance-identifier hotgigs-production
```

### B. Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| Frontend | 3000 | HTTP |
| Backend API | 8000 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |
| WebSocket | 8000 | WS |

### C. File Structure

```
hotgigs/
├── frontend/hotgigs-frontend/     # React frontend
├── backend/hotgigs-api/           # FastAPI backend
├── aws/                           # AWS deployment files
├── scripts/                       # Setup and deployment scripts
├── docs/                          # Documentation
├── docker-compose.yml             # Docker Compose (Supabase)
├── docker-compose.local.yml       # Docker Compose (Local DB)
└── DEPLOYMENT_GUIDE_COMPLETE.md   # This file
```

---

**Last Updated:** October 23, 2025  
**Version:** 2.0  
**Maintained by:** Manus AI


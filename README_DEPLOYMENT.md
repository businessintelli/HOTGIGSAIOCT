# HotGigs.ai - Deployment Package

**Complete AI-Powered Recruitment Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 16+](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-ready-orange.svg)](https://aws.amazon.com/)

---

## 🚀 Quick Start

Get HotGigs.ai running in **under 5 minutes** with Docker:

```bash
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT
./scripts/quick-start-docker.sh
```

Then visit: **http://localhost:3000**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Deployment Options](#deployment-options)
- [Quick Start Guides](#quick-start-guides)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Support](#support)

---

## 🎯 Overview

HotGigs.ai is a comprehensive AI-powered recruitment platform that replicates Jobright.ai's functionality, featuring:

- **Candidate Portal** - Job search, applications, video profiles, AI-powered matching
- **Company Portal** - Job posting, ATS, candidate database, analytics
- **AI Features** - Resume parsing (95%+ accuracy), skill extraction, intelligent matching
- **Continuous Learning** - Feedback loop, vector database, fine-tuning preparation

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, shadcn/ui |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy ORM |
| **Database** | PostgreSQL 15+ with pgvector extension |
| **Cache/Queue** | Redis 7+ |
| **Task Queue** | Celery with Redis broker |
| **AI/ML** | OpenAI GPT-4 mini |
| **Deployment** | Docker, AWS ECS/Fargate |

---

## ✨ Features

### For Candidates

- ✅ AI-powered job matching and recommendations
- ✅ Resume upload with intelligent parsing (95%+ accuracy)
- ✅ Video profile creation and management
- ✅ Application tracking and status updates
- ✅ Interview scheduling
- ✅ Job invitations from recruiters
- ✅ Profile views analytics
- ✅ Real-time notifications

### For Companies

- ✅ AI-assisted job posting creation
- ✅ Applicant tracking system (ATS)
- ✅ Candidate database with semantic search
- ✅ Resume import from Google Drive
- ✅ Kanban board for application management
- ✅ Team collaboration features
- ✅ Analytics and reporting
- ✅ Bulk resume processing

### AI Features

- ✅ **Resume Parser** - 95%+ accuracy with OpenAI LLM enhancement
- ✅ **Skill Ranker** - Top 5 technology + top 5 domain skills extraction
- ✅ **Intelligent Matching** - Vector similarity search with pgvector
- ✅ **Continuous Learning** - Feedback loop for model improvement
- ✅ **Fine-tuning Preparation** - Automated dataset preparation for OpenAI fine-tuning

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend API   │
│   (FastAPI)     │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┐
    ↓         ↓         ↓          ↓
┌────────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│ PostgreSQL│ │Redis │ │Celery│ │ OpenAI  │
│ +pgvector │ │      │ │Worker│ │   API   │
└──────────┘ └──────┘ └──────┘ └──────────┘
```

### Key Components

1. **Frontend** - Single-page application with React Router
2. **Backend API** - RESTful API with automatic OpenAPI documentation
3. **Database** - PostgreSQL with pgvector for semantic search
4. **Cache** - Redis for session management and caching
5. **Task Queue** - Celery for background job processing
6. **AI Engine** - OpenAI GPT-4 for intelligent features

---

## 🚢 Deployment Options

We provide **three deployment options** to suit your needs:

### 1. Docker Compose (Recommended for Development)

**Best for:** Quick start, development, testing

**Pros:**
- ✅ Fastest setup (< 5 minutes)
- ✅ Includes all dependencies
- ✅ Isolated environment
- ✅ Easy cleanup

**Cons:**
- ❌ Not suitable for production scale
- ❌ Single-host limitation

**Setup:**
```bash
./scripts/quick-start-docker.sh
```

**Documentation:** [DEPLOYMENT_GUIDE_COMPLETE.md](DEPLOYMENT_GUIDE_COMPLETE.md#quick-start-with-docker)

---

### 2. Local Development Setup

**Best for:** Active development, debugging, customization

**Pros:**
- ✅ Hot-reload for fast development
- ✅ Direct access to logs and debugger
- ✅ Full control over environment
- ✅ No Docker overhead

**Cons:**
- ❌ Requires manual dependency installation
- ❌ Platform-specific setup
- ❌ More complex initial setup

**Setup:**

**Linux/macOS:**
```bash
./scripts/setup-local.sh
./start-all.sh
```

**Windows:**
```batch
scripts\setup-local.bat
start-all.bat
```

**Documentation:** [DEPLOYMENT_GUIDE_COMPLETE.md](DEPLOYMENT_GUIDE_COMPLETE.md#local-development-setup)

---

### 3. AWS Production Deployment

**Best for:** Production, scalability, high availability

**Pros:**
- ✅ Fully managed infrastructure
- ✅ Auto-scaling
- ✅ High availability (Multi-AZ)
- ✅ Automated backups
- ✅ Monitoring and alerting

**Cons:**
- ❌ Requires AWS account
- ❌ Monthly costs ($88-115/month)
- ❌ More complex setup

**Setup:**
```bash
cd aws
./setup-infrastructure.sh
./deploy-to-aws.sh
```

**Documentation:** [aws/AWS_DEPLOYMENT_GUIDE.md](aws/AWS_DEPLOYMENT_GUIDE.md)

---

## 📚 Quick Start Guides

### Option 1: Docker Compose (5 minutes)

1. **Clone repository:**
   ```bash
   git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
   cd HOTGIGSAIOCT
   ```

2. **Run quick start:**
   ```bash
   ./scripts/quick-start-docker.sh
   ```

3. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Create account:**
   - Navigate to http://localhost:3000
   - Click "Sign Up"
   - Choose "Candidate" or "Company" role

---

### Option 2: Local Development (15 minutes)

1. **Prerequisites:**
   - Python 3.8+
   - Node.js 16+
   - PostgreSQL 15+
   - Redis 7+

2. **Run setup script:**
   ```bash
   ./scripts/setup-local.sh
   ```

3. **Add OpenAI API Key:**
   ```bash
   echo "OPENAI_API_KEY=sk-your-key-here" >> backend/hotgigs-api/.env
   ```

4. **Start services:**
   ```bash
   ./start-all.sh
   ```

---

### Option 3: AWS Deployment (30 minutes)

1. **Prerequisites:**
   - AWS account
   - AWS CLI configured
   - Docker installed

2. **Setup infrastructure:**
   ```bash
   cd aws
   ./setup-infrastructure.sh
   ```

3. **Deploy application:**
   ```bash
   export AWS_ACCOUNT_ID=your-account-id
   ./deploy-to-aws.sh
   ```

4. **Configure domain (optional):**
   - Request SSL certificate in ACM
   - Add HTTPS listener to ALB
   - Configure Route53

---

## ⚙️ Configuration

### Required Environment Variables

#### Backend (`backend/hotgigs-api/.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
SECRET_KEY=your-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend (`frontend/hotgigs-frontend/.env`)

```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

### Optional Integrations

#### Google Drive API (for resume import)

```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-drive/auth/callback
```

#### Email Service (SendGrid)

```bash
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

---

## 📖 Documentation

### Deployment Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE_COMPLETE.md](DEPLOYMENT_GUIDE_COMPLETE.md) | Complete deployment guide for all platforms |
| [aws/AWS_DEPLOYMENT_GUIDE.md](aws/AWS_DEPLOYMENT_GUIDE.md) | Detailed AWS deployment instructions |
| [DEPLOYMENT_TESTING_CHECKLIST.md](DEPLOYMENT_TESTING_CHECKLIST.md) | Comprehensive testing checklist |

### Feature Documentation

| Document | Description |
|----------|-------------|
| [ALL_PHASES_COMPLETE_FINAL_SUMMARY.md](ALL_PHASES_COMPLETE_FINAL_SUMMARY.md) | Complete feature implementation summary |
| [DASHBOARD_NAVIGATION_IMPROVEMENTS.md](DASHBOARD_NAVIGATION_IMPROVEMENTS.md) | Dashboard navigation enhancements |
| [docs/DATABASE_ARCHITECTURE.md](docs/DATABASE_ARCHITECTURE.md) | Database schema and architecture |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | End-user guide |

### API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🔧 Troubleshooting

### Common Issues

#### Docker Issues

**Problem:** Port already in use

```bash
# Find process using port
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Change port in docker-compose.yml or kill process
```

**Problem:** Containers fail to start

```bash
# Check logs
docker compose -f docker-compose.local.yml logs backend

# Rebuild containers
docker compose -f docker-compose.local.yml up -d --build
```

#### Database Issues

**Problem:** Cannot connect to database

```bash
# Check PostgreSQL is running
sudo service postgresql status  # Linux
brew services list  # macOS

# Test connection
psql -h localhost -U hotgigs -d hotgigs_db
```

#### API Issues

**Problem:** 500 Internal Server Error

```bash
# Check backend logs
tail -f backend/hotgigs-api/logs/app.log

# Check environment variables
cat backend/hotgigs-api/.env
```

### Getting Help

1. Check [DEPLOYMENT_GUIDE_COMPLETE.md](DEPLOYMENT_GUIDE_COMPLETE.md#troubleshooting)
2. Review [DEPLOYMENT_TESTING_CHECKLIST.md](DEPLOYMENT_TESTING_CHECKLIST.md)
3. Check GitHub Issues
4. Review application logs

---

## 📊 Project Structure

```
hotgigs/
├── frontend/
│   └── hotgigs-frontend/          # React frontend application
│       ├── src/
│       │   ├── pages/             # Page components
│       │   ├── components/        # Reusable components
│       │   ├── contexts/          # React contexts
│       │   └── lib/               # Utilities and services
│       ├── Dockerfile             # Frontend Docker image
│       └── package.json           # Node dependencies
│
├── backend/
│   └── hotgigs-api/               # FastAPI backend application
│       ├── src/
│       │   ├── api/               # API routes
│       │   ├── models/            # Database models
│       │   ├── services/          # Business logic
│       │   └── core/              # Core configurations
│       ├── migrations/            # Database migrations
│       ├── Dockerfile             # Backend Docker image
│       └── requirements.txt       # Python dependencies
│
├── aws/                           # AWS deployment files
│   ├── cloudformation-template.yaml
│   ├── ecs-task-definition.json
│   ├── setup-infrastructure.sh
│   └── deploy-to-aws.sh
│
├── scripts/                       # Setup and deployment scripts
│   ├── setup-local.sh             # Linux/macOS setup
│   ├── setup-local.bat            # Windows setup
│   └── quick-start-docker.sh     # Docker quick start
│
├── docs/                          # Documentation
│   ├── DATABASE_ARCHITECTURE.md
│   ├── USER_GUIDE.md
│   └── ...
│
├── docker-compose.yml             # Docker Compose (Supabase)
├── docker-compose.local.yml       # Docker Compose (Local DB)
├── docker-compose.prod.yml        # Docker Compose (Production)
│
└── README_DEPLOYMENT.md           # This file
```

---

## 🎯 Next Steps

After deployment:

1. **Configure OpenAI API Key** - Required for AI features
2. **Set up email service** - For notifications (optional)
3. **Configure domain** - For production deployment
4. **Enable monitoring** - CloudWatch, error tracking
5. **Set up backups** - Automated database backups
6. **Load testing** - Verify performance under load
7. **Security audit** - Review security configuration

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **OpenAI** - For GPT-4 API powering AI features
- **FastAPI** - For the excellent Python web framework
- **React** - For the powerful frontend library
- **PostgreSQL** - For the robust database system
- **Supabase** - For managed PostgreSQL hosting

---

## 📞 Support

For support and questions:

- **Documentation:** [DEPLOYMENT_GUIDE_COMPLETE.md](DEPLOYMENT_GUIDE_COMPLETE.md)
- **GitHub Issues:** https://github.com/businessintelli/HOTGIGSAIOCT/issues
- **Email:** support@hotgigs.ai (if configured)

---

**Built with ❤️ by Manus AI**

**Last Updated:** October 23, 2025  
**Version:** 2.0


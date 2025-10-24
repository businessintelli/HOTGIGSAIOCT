# HotGigs.ai - Dependency Versions Manifest

**Application Version:** 2.0  
**Last Updated:** October 23, 2025  
**Purpose:** Complete list of all dependencies with exact versions

---

## 📦 System Requirements

### Operating Systems

| Platform | Minimum Version | Recommended Version | Tested Version |
|----------|----------------|---------------------|----------------|
| **Ubuntu** | 20.04 LTS | 22.04 LTS | 22.04 LTS |
| **Debian** | 11 (Bullseye) | 12 (Bookworm) | 11 |
| **CentOS** | 8 | 9 Stream | 8 |
| **macOS** | 11 (Big Sur) | 14 (Sonoma) | 13 (Ventura) |
| **Windows** | 10 Pro | 11 Pro | 11 Pro |

---

## 🐍 Python Backend Dependencies

### Core Runtime

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| **Python** | 3.11.0 | PSF | Runtime environment |
| **pip** | 23.3.1 | MIT | Package installer |

### Web Framework

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| fastapi | 0.104.1 | MIT | Web framework |
| uvicorn[standard] | 0.24.0 | BSD | ASGI server |
| starlette | 0.27.0 | BSD | ASGI framework |
| pydantic | 2.5.0 | MIT | Data validation |
| pydantic-settings | 2.1.0 | MIT | Settings management |

### Database

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| sqlalchemy | 2.0.23 | MIT | ORM |
| psycopg2-binary | 2.9.9 | LGPL | PostgreSQL driver |
| alembic | 1.12.1 | MIT | Database migrations |
| asyncpg | 0.29.0 | Apache 2.0 | Async PostgreSQL driver |

### Authentication & Security

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| python-jose[cryptography] | 3.3.0 | MIT | JWT handling |
| passlib[bcrypt] | 1.7.4 | BSD | Password hashing |
| bcrypt | 4.1.1 | Apache 2.0 | Password hashing |
| cryptography | 41.0.7 | Apache 2.0 | Cryptographic operations |

### File Processing

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| python-multipart | 0.0.6 | Apache 2.0 | File uploads |
| pypdf2 | 3.0.1 | BSD | PDF parsing |
| python-docx | 1.1.0 | MIT | Word document parsing |
| python-magic | 0.4.27 | MIT | File type detection |
| aiofiles | 23.2.1 | Apache 2.0 | Async file operations |

### Task Queue

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| celery | 5.3.4 | BSD | Task queue |
| redis | 5.0.1 | MIT | Redis client |
| kombu | 5.3.4 | BSD | Messaging library |

### AI & Machine Learning

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| openai | 1.3.5 | MIT | OpenAI API client |
| tiktoken | 0.5.1 | MIT | Token counting |
| numpy | 1.26.2 | BSD | Numerical computing |

### HTTP & API Clients

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| httpx | 0.25.2 | BSD | HTTP client |
| requests | 2.31.0 | Apache 2.0 | HTTP library |
| aiohttp | 3.9.1 | Apache 2.0 | Async HTTP client |

### Utilities

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| python-dotenv | 1.0.0 | BSD | Environment variables |
| email-validator | 2.1.0 | CC0 | Email validation |
| python-dateutil | 2.8.2 | Apache 2.0 | Date utilities |
| pytz | 2023.3 | MIT | Timezone handling |

### Development & Testing

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| pytest | 7.4.3 | MIT | Testing framework |
| pytest-asyncio | 0.21.1 | Apache 2.0 | Async testing |
| pytest-cov | 4.1.0 | MIT | Coverage reporting |
| black | 23.11.0 | MIT | Code formatting |
| flake8 | 6.1.0 | MIT | Linting |
| mypy | 1.7.1 | MIT | Type checking |

---

## 📦 Complete Backend requirements.txt

```txt
# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
starlette==0.27.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
asyncpg==0.29.0

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.1.1
cryptography==41.0.7

# File Processing
python-multipart==0.0.6
pypdf2==3.0.1
python-docx==1.1.0
python-magic==0.4.27
aiofiles==23.2.1

# Task Queue
celery==5.3.4
redis==5.0.1
kombu==5.3.4

# AI & Machine Learning
openai==1.3.5
tiktoken==0.5.1
numpy==1.26.2

# HTTP & API Clients
httpx==0.25.2
requests==2.31.0
aiohttp==3.9.1

# Utilities
python-dotenv==1.0.0
email-validator==2.1.0
python-dateutil==2.8.2
pytz==2023.3

# Development & Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
black==23.11.0
flake8==6.1.0
mypy==1.7.1
```

---

## 🟢 Node.js Frontend Dependencies

### Core Runtime

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| **Node.js** | 20.10.0 | MIT | Runtime environment |
| **npm** | 10.2.3 | Artistic-2.0 | Package manager |
| **pnpm** | 8.11.0 | MIT | Fast package manager |

### UI Framework

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| react | 18.2.0 | MIT | UI framework |
| react-dom | 18.2.0 | MIT | React DOM |
| react-router-dom | 6.20.0 | MIT | Routing |

### Build Tools

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| vite | 5.0.0 | MIT | Build tool |
| @vitejs/plugin-react | 4.2.0 | MIT | React plugin for Vite |
| esbuild | 0.19.8 | MIT | JavaScript bundler |

### Styling

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| tailwindcss | 3.3.5 | MIT | CSS framework |
| postcss | 8.4.32 | MIT | CSS processing |
| autoprefixer | 10.4.16 | MIT | CSS vendor prefixes |
| clsx | 2.0.0 | MIT | Class name utility |
| tailwind-merge | 2.1.0 | MIT | Tailwind class merging |

### Data Fetching

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| axios | 1.6.2 | MIT | HTTP client |
| @tanstack/react-query | 5.8.4 | MIT | Data fetching |

### UI Components

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| lucide-react | 0.294.0 | ISC | Icons |
| @radix-ui/react-dialog | 1.0.5 | MIT | Dialog component |
| @radix-ui/react-dropdown-menu | 2.0.6 | MIT | Dropdown menu |
| @radix-ui/react-select | 2.0.0 | MIT | Select component |
| @radix-ui/react-tabs | 1.0.4 | MIT | Tabs component |
| @radix-ui/react-toast | 1.1.5 | MIT | Toast notifications |

### Utilities

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| date-fns | 2.30.0 | MIT | Date utilities |
| react-hook-form | 7.48.2 | MIT | Form handling |
| zod | 3.22.4 | MIT | Schema validation |

### Development Tools

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| typescript | 5.3.2 | Apache 2.0 | Type system |
| @types/react | 18.2.43 | MIT | React types |
| @types/react-dom | 18.2.17 | MIT | React DOM types |
| eslint | 8.55.0 | MIT | Linting |
| prettier | 3.1.0 | MIT | Code formatting |

---

## 📦 Complete Frontend package.json

```json
{
  "name": "hotgigs-frontend",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.8.4",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.2",
    "tailwindcss": "^3.3.5",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 🐳 Docker Images

### Base Images

| Image | Version | Size | Purpose |
|-------|---------|------|---------|
| python:3.11-slim | 3.11 | ~150MB | Backend base |
| node:18-alpine | 18 | ~180MB | Frontend builder |
| nginx:alpine | latest | ~40MB | Frontend server |
| postgres:15-alpine | 15 | ~230MB | Database |
| redis:7-alpine | 7 | ~30MB | Cache/Queue |

---

## 🗄️ Database & Infrastructure

### PostgreSQL

| Component | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | 15.5 | Main database |
| **pgvector** | 0.5.1 | Vector similarity search |
| **pg_trgm** | 1.6 | Fuzzy text search |

### Redis

| Component | Version | Purpose |
|-----------|---------|---------|
| **Redis** | 7.2.3 | Cache and message broker |

### System Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| gcc | 11.4.0 | C compiler |
| postgresql-client | 15.5 | PostgreSQL client |
| poppler-utils | 22.02.0 | PDF utilities |
| libmagic1 | 5.41 | File type detection |
| libpq-dev | 15.5 | PostgreSQL development files |

---

## ☁️ AWS Services

### Compute

| Service | Configuration | Version/Type |
|---------|--------------|--------------|
| **ECS** | Fargate | Platform 1.4.0 |
| **Task CPU** | 1024 (1 vCPU) | - |
| **Task Memory** | 2048 MB | - |

### Database

| Service | Configuration | Version |
|---------|--------------|---------|
| **RDS PostgreSQL** | db.t3.micro | 15.5 |
| **Engine Mode** | Provisioned | - |
| **Multi-AZ** | Enabled | - |

### Cache

| Service | Configuration | Version |
|---------|--------------|---------|
| **ElastiCache Redis** | cache.t3.micro | 7.0 |
| **Node Type** | Single node | - |

### Storage

| Service | Configuration | Version |
|---------|--------------|---------|
| **EFS** | General Purpose | - |
| **Performance Mode** | General Purpose | - |

### Networking

| Service | Configuration | Version |
|---------|--------------|---------|
| **ALB** | Application Load Balancer | - |
| **VPC** | Custom VPC | - |

---

## 🔧 Development Tools

### Version Control

| Tool | Version | Purpose |
|------|---------|---------|
| git | 2.40.0+ | Version control |

### Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| make | 4.3+ | Build automation |
| docker | 24.0.0+ | Containerization |
| docker-compose | 2.20.0+ | Multi-container orchestration |

### AWS Tools

| Tool | Version | Purpose |
|------|---------|---------|
| aws-cli | 2.13.0+ | AWS management |
| ecs-cli | 1.21.0+ | ECS management (optional) |

---

## 📊 Version Compatibility Matrix

### Python Compatibility

| Python Version | FastAPI | SQLAlchemy | Pydantic | Status |
|----------------|---------|------------|----------|--------|
| 3.8 | ✅ | ✅ | ✅ | Minimum |
| 3.9 | ✅ | ✅ | ✅ | Supported |
| 3.10 | ✅ | ✅ | ✅ | Supported |
| 3.11 | ✅ | ✅ | ✅ | Recommended |
| 3.12 | ⚠️ | ⚠️ | ⚠️ | Not tested |

### Node.js Compatibility

| Node Version | React | Vite | Status |
|--------------|-------|------|--------|
| 14.x | ✅ | ❌ | Not supported |
| 16.x | ✅ | ✅ | Minimum |
| 18.x | ✅ | ✅ | Recommended |
| 20.x | ✅ | ✅ | Recommended |
| 21.x | ✅ | ✅ | Supported |

### Database Compatibility

| PostgreSQL Version | pgvector | Status |
|-------------------|----------|--------|
| 12.x | ✅ | Minimum |
| 13.x | ✅ | Supported |
| 14.x | ✅ | Supported |
| 15.x | ✅ | Recommended |
| 16.x | ✅ | Supported |

---

## 🔄 Update Policy

### Security Updates

- **Critical vulnerabilities:** Update immediately
- **High severity:** Update within 7 days
- **Medium severity:** Update within 30 days
- **Low severity:** Update in next release

### Version Updates

- **Major versions:** Review breaking changes, test thoroughly
- **Minor versions:** Update quarterly
- **Patch versions:** Update monthly

### Dependency Scanning

```bash
# Backend security check
pip install safety
safety check -r backend/hotgigs-api/requirements.txt

# Frontend security check
cd frontend/hotgigs-frontend
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 📝 Version Lock Files

### Backend

- **File:** `backend/hotgigs-api/requirements.txt`
- **Lock:** Versions are pinned with `==`
- **Update:** `pip install -r requirements.txt --upgrade`

### Frontend

- **File:** `frontend/hotgigs-frontend/package.json`
- **Lock:** `frontend/hotgigs-frontend/pnpm-lock.yaml`
- **Update:** `pnpm update`

---

## 🎯 Tested Configurations

### Development Environment

✅ **Ubuntu 22.04 + Python 3.11 + Node 20 + PostgreSQL 15 + Redis 7**
- Status: Fully tested
- Performance: Excellent
- Stability: Stable

✅ **macOS 13 + Python 3.11 + Node 20 + PostgreSQL 15 + Redis 7**
- Status: Fully tested
- Performance: Excellent
- Stability: Stable

✅ **Windows 11 + Python 3.11 + Node 20 + PostgreSQL 15 + Redis 7**
- Status: Tested
- Performance: Good
- Stability: Stable

### Production Environment

✅ **AWS ECS Fargate + RDS PostgreSQL 15 + ElastiCache Redis 7**
- Status: Production-ready
- Performance: Excellent
- Stability: High availability

✅ **Docker Compose + PostgreSQL 15 + Redis 7**
- Status: Production-ready (small scale)
- Performance: Good
- Stability: Stable

---

## 📞 Support

For version-related issues:

1. Check compatibility matrix above
2. Review `DEPLOYMENT_GUIDE_COMPLETE.md`
3. Visit https://github.com/businessintelli/HOTGIGSAIOCT/issues
4. Include version information in bug reports

---

**Manifest Version:** 1.0  
**Last Updated:** October 23, 2025  
**Maintained by:** Manus AI


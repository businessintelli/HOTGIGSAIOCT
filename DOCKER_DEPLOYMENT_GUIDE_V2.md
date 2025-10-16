# 🐳 HotGigs.ai Docker Deployment Guide V2.0

Complete guide for deploying HotGigs.ai using Docker and Docker Compose with **Supabase PostgreSQL** and **WebSocket support**.

---

## 🆕 What's New in V2.0

- ✅ **Supabase PostgreSQL** integration (cloud database)
- ✅ **WebSocket support** for real-time features
- ✅ **Updated dependencies** (Recharts, react-beautiful-dnd, websockets)
- ✅ **Nginx WebSocket proxy** configuration
- ✅ **Job-level analytics** dashboard
- ✅ **Enhanced Kanban workflow** with drag-and-drop
- ✅ **Bulk actions** and advanced filtering
- ✅ **Production-ready** configuration

---

## 📋 Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Required Accounts
- **Supabase Account**: For PostgreSQL database (already configured)
- **OpenAI API Key** (optional): For AI features

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone -b branch-1 https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```bash
# Supabase Configuration (Pre-configured)
DATABASE_URL=postgresql://postgres:h-6B2wH8PSi4Rtn@db.rhzetgynouwyegixzshj.supabase.co:5432/postgres
SUPABASE_URL=https://rhzetgynouwyegixzshj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoemV0Z3lub3V3eWVnaXh6c2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDU0MDEsImV4cCI6MjA3MTgyMTQwMX0.gOE1EgnQUeZfV2Shf2XWamdrUrSjIHoIaccqfFHhKf0

# JWT Configuration (CHANGE IN PRODUCTION!)
SECRET_KEY=your-super-secret-key-min-32-characters-long-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI API (Optional)
OPENAI_API_KEY=your-openai-api-key-here

# Frontend URLs
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

### 3. Build and Run

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

---

## 🏗️ Architecture

### Services

1. **Backend (FastAPI)**
   - Port: 8000
   - WebSocket support for real-time features
   - Connects to Supabase PostgreSQL
   - Health check enabled
   - Python 3.11

2. **Frontend (React + Vite + Nginx)**
   - Port: 3000 (mapped from 80)
   - Nginx web server
   - WebSocket proxy configured
   - API proxy configured
   - Production build

### Key Features

- **No local PostgreSQL**: Uses Supabase cloud database
- **WebSocket proxy**: Nginx handles WebSocket connections
- **API proxy**: Nginx proxies API requests to backend
- **Health checks**: Automatic service health monitoring
- **Restart policies**: Automatic restart on failure

---

## 🔧 Updated Files

### 1. docker-compose.yml
- Removed local PostgreSQL service
- Added Supabase connection string
- Added WebSocket URL configuration
- Updated environment variables

### 2. nginx.conf
- Added WebSocket proxy (`/ws`)
- Added API proxy (`/api`)
- Configured WebSocket upgrade headers
- Extended proxy timeout for WebSocket

### 3. Dockerfiles
- Frontend: Multi-stage build with Nginx
- Backend: Python 3.11 with health check

### 4. .dockerignore
- Optimized build context
- Excluded unnecessary files

---

## 📦 Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild and restart
docker-compose up -d --build

# Remove all containers
docker-compose down
```

### Maintenance

```bash
# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh

# View resource usage
docker stats

# Prune unused resources
docker system prune -a
```

---

## 🗄️ Database (Supabase)

### Connection Details

- **Host**: db.rhzetgynouwyegixzshj.supabase.co
- **Port**: 5432
- **Database**: postgres
- **User**: postgres
- **Connection String**: Already configured in `.env`

### Database Schema

The complete schema is in `/backend/hotgigs-api/database_schema.sql`

Key tables (25+ total):
- `users` - User accounts
- `companies` - Company profiles
- `jobs` - Job postings
- `applications` - Job applications
- `messages` - Real-time messaging
- `notifications` - User notifications
- `analytics_events` - Analytics tracking
- And many more...

### Running Migrations

```bash
# Access backend container
docker-compose exec backend bash

# Run migration script
python setup_supabase.py
```

---

## 🌐 WebSocket Configuration

### Backend WebSocket Endpoint

```python
# Endpoint: ws://localhost:8000/ws
# Supports:
# - Real-time notifications
# - Live application updates
# - Instant messaging
# - Collaborative features
```

### Frontend WebSocket Client

```javascript
// Auto-connects on mount
// Handles reconnection
// Event-based messaging
// See: /hotgigs-frontend/src/lib/websocketClient.js
```

### Nginx WebSocket Proxy

```nginx
location /ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400;
}
```

---

## 🚀 Production Deployment

### 1. Update Environment Variables

```env
# Generate secure secret key
SECRET_KEY=$(openssl rand -hex 32)

# Update CORS for your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Update frontend URLs
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
```

### 2. Set Up Reverse Proxy

Example Nginx configuration for production:

```nginx
# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API + WebSocket
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # API
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. SSL Certificates

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common causes:
# - Supabase connection failed (check network)
# - Missing environment variables
# - Port already in use
```

### Database Connection Error

```bash
# Test Supabase connection
docker-compose exec backend python -c "
from sqlalchemy import create_engine
import os
engine = create_engine(os.getenv('DATABASE_URL'))
conn = engine.connect()
print('Connection successful!')
conn.close()
"
```

### WebSocket Connection Failed

```bash
# Check nginx configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Test WebSocket (install wscat first: npm install -g wscat)
wscat -c ws://localhost:8000/ws
```

### Frontend Can't Connect to Backend

```bash
# Check CORS settings
docker-compose exec backend env | grep CORS

# Verify backend is accessible
curl http://localhost:8000/api/health
```

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/health

# Frontend health
curl http://localhost:3000

# Check all services
docker-compose ps
```

### Logs

```bash
# Real-time logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > logs.txt
```

### Metrics

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

---

## 🔄 Updates

### Update Application

```bash
# Pull latest code
git pull origin branch-1

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend python setup_supabase.py
```

---

## 📚 Additional Resources

### Documentation Files
- `SUPABASE_SETUP_GUIDE.md` - Database setup
- `BACKEND_INTEGRATION_COMPLETE.md` - API integration
- `KANBAN_WORKFLOW_IMPLEMENTATION.md` - Workflow features
- `ENTERPRISE_FEATURES_IMPLEMENTATION.md` - Advanced features
- `QUICK_START_GUIDE.md` - Development guide

### External Links
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Clone repository (branch-1)
- [ ] Create `.env` file
- [ ] Update SECRET_KEY
- [ ] Configure domain/DNS
- [ ] Obtain SSL certificates

### Deployment
- [ ] Build Docker images
- [ ] Start all services
- [ ] Verify health checks
- [ ] Test API endpoints
- [ ] Test WebSocket connection
- [ ] Test frontend access

### Post-Deployment
- [ ] Configure monitoring
- [ ] Set up log aggregation
- [ ] Document deployment
- [ ] Train team

---

## 🎉 Success!

Your HotGigs.ai platform is now deployed with:

✅ **Supabase PostgreSQL** - Cloud database  
✅ **WebSocket Support** - Real-time features  
✅ **Job Analytics** - 12+ visualizations  
✅ **Kanban Workflow** - Drag-and-drop  
✅ **Bulk Actions** - Multi-candidate operations  
✅ **Advanced Filtering** - Smart search  
✅ **Production Ready** - Secure and scalable  

**Access:** http://localhost:3000

---

**Last Updated:** October 16, 2025  
**Version:** 2.0.0  
**Status:** Production Ready ✅


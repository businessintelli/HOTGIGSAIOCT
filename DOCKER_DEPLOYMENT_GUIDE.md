# 🐳 HotGigs.ai Docker Deployment Guide

Complete guide for deploying HotGigs.ai using Docker and Docker Compose.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Deployment](#manual-deployment)
4. [Configuration](#configuration)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Prerequisites

### Required Software
- **Docker** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- **Git** (for cloning the repository)

### System Requirements
- **CPU:** 2+ cores recommended
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 10GB free space minimum
- **OS:** Linux, macOS, or Windows with WSL2

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Important:** Update these values in `.env`:
- `SECRET_KEY` - Generate a secure random string (min 32 characters)
- `POSTGRES_PASSWORD` - Set a strong database password
- `OPENAI_API_KEY` - Add your OpenAI API key for AI features

### 3. Deploy with One Command

```bash
./deploy.sh
```

That's it! The script will:
- Build all Docker images
- Start PostgreSQL database
- Initialize database schema
- Start backend API
- Start frontend application

### 4. Access Your Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## Manual Deployment

If you prefer manual control or the script doesn't work:

### Step 1: Build Images

```bash
docker-compose build
```

### Step 2: Start Database

```bash
docker-compose up -d postgres
```

### Step 3: Wait for Database

```bash
# Wait 10-15 seconds for PostgreSQL to be ready
sleep 10
```

### Step 4: Initialize Database

```bash
docker-compose run --rm backend python src/db/init_db.py
```

### Step 5: Start All Services

```bash
docker-compose up -d
```

### Step 6: Verify Deployment

```bash
docker-compose ps
```

All services should show "Up" status.

---

## Configuration

### Environment Variables

#### Database Configuration
```env
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://hotgigs_user:your_password@postgres:5432/hotgigs_db
```

#### Backend Configuration
```env
SECRET_KEY=your-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### AI Services
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### CORS Configuration
```env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Frontend Configuration
```env
VITE_API_URL=http://localhost:8000
```

### Generating a Secure SECRET_KEY

```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32
```

---

## Production Deployment

### 1. Update Environment Variables

For production, update `.env` with:

```env
# Use strong, unique passwords
POSTGRES_PASSWORD=<strong-random-password>
SECRET_KEY=<strong-random-secret-key>

# Update CORS origins to your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Update frontend API URL to your backend domain
VITE_API_URL=https://api.yourdomain.com
```

### 2. Use Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    restart: always
    volumes:
      - /var/lib/postgresql/data:/var/lib/postgresql/data

  backend:
    restart: always
    environment:
      - ENVIRONMENT=production
    volumes:
      - /var/log/hotgigs:/app/logs

  frontend:
    restart: always
```

Deploy with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Set Up Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

### 5. Set Up Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/hotgigs"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec -T postgres pg_dump -U hotgigs_user hotgigs_db > \
    "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" \
    ./backend/hotgigs-api/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Troubleshooting

### Services Won't Start

**Check logs:**
```bash
docker-compose logs -f
```

**Check specific service:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Database Connection Errors

**Verify database is running:**
```bash
docker-compose ps postgres
```

**Check database logs:**
```bash
docker-compose logs postgres
```

**Test database connection:**
```bash
docker-compose exec postgres psql -U hotgigs_user -d hotgigs_db
```

### Frontend Can't Connect to Backend

**Check CORS configuration** in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://frontend:80
```

**Verify backend is accessible:**
```bash
curl http://localhost:8000/api/health
```

### Port Already in Use

**Change ports in `docker-compose.yml`:**
```yaml
services:
  frontend:
    ports:
      - "3001:80"  # Changed from 3000 to 3001
  
  backend:
    ports:
      - "8001:8000"  # Changed from 8000 to 8001
```

### Out of Disk Space

**Clean up Docker:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove all unused data
docker system prune -a --volumes
```

---

## Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Scale Services

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3
```

### Database Management

**Backup database:**
```bash
docker-compose exec postgres pg_dump -U hotgigs_user hotgigs_db > backup.sql
```

**Restore database:**
```bash
docker-compose exec -T postgres psql -U hotgigs_user hotgigs_db < backup.sql
```

**Access database shell:**
```bash
docker-compose exec postgres psql -U hotgigs_user -d hotgigs_db
```

### Monitor Resources

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## Cloud Deployment Options

### AWS (Amazon Web Services)

**Option 1: ECS (Elastic Container Service)**
- Use AWS ECS with Fargate for serverless containers
- Set up RDS for PostgreSQL
- Use ALB for load balancing
- Estimated cost: $50-150/month

**Option 2: EC2**
- Launch EC2 instance (t3.medium or larger)
- Install Docker and Docker Compose
- Deploy using this guide
- Estimated cost: $30-100/month

### Google Cloud Platform

**Option 1: Cloud Run**
- Deploy containers to Cloud Run
- Use Cloud SQL for PostgreSQL
- Automatic scaling
- Estimated cost: $20-80/month

**Option 2: GCE (Compute Engine)**
- Similar to AWS EC2
- Install Docker and deploy
- Estimated cost: $25-90/month

### DigitalOcean

**Droplet Deployment:**
1. Create a Droplet (4GB RAM minimum)
2. Install Docker and Docker Compose
3. Clone repository and deploy
4. Set up managed PostgreSQL (optional)
5. Estimated cost: $24-48/month

### Azure

**Container Instances:**
- Deploy to Azure Container Instances
- Use Azure Database for PostgreSQL
- Estimated cost: $40-120/month

---

## Performance Optimization

### Enable Caching

Add Redis for caching:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Database Optimization

In `docker-compose.yml`:

```yaml
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Frontend Optimization

The Nginx configuration already includes:
- Gzip compression
- Static asset caching
- Security headers

---

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong passwords** - Generate random, long passwords
3. **Keep secrets secret** - Don't share SECRET_KEY or API keys
4. **Update regularly** - Keep Docker images and dependencies updated
5. **Use HTTPS in production** - Set up SSL certificates
6. **Limit database access** - Don't expose PostgreSQL port publicly
7. **Regular backups** - Automate database and file backups
8. **Monitor logs** - Check for suspicious activity

---

## Support

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Project Repository
- GitHub: https://github.com/businessintelli/HOTGIGSAIOCT
- Issues: https://github.com/businessintelli/HOTGIGSAIOCT/issues

---

## License

This deployment guide is part of the HotGigs.ai project.

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0  
**Deployment Type:** Docker Compose


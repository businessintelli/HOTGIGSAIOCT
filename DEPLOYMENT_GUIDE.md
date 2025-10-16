# HotGigs.ai Backend Deployment Guide

**Date:** October 16, 2025  
**Author:** Manus AI  
**Project:** HotGigs.ai - AI-Powered Recruitment Platform

---

## Table of Contents

1. [Docker Local Deployment](#docker-local-deployment)
2. [Render.com Production Deployment](#rendercom-production-deployment)
3. [Environment Variables](#environment-variables)
4. [Webhook Configuration](#webhook-configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Docker Local Deployment

### Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 1.29+)

### Step 1: Build and Run

```bash
cd /home/ubuntu/hotgigs/backend/hotgigs-api

# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 2: Verify Deployment

```bash
# Check if container is running
docker-compose ps

# Test the API
curl http://localhost:8000/

# Expected response:
# {"message":"Welcome to HotGigs.ai API","version":"1.0.0","status":"running"}
```

### Step 3: Access API Documentation

Open your browser and navigate to:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Docker Commands

```bash
# Stop the container
docker-compose down

# Restart the container
docker-compose restart

# View logs
docker-compose logs -f api

# Rebuild after code changes
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

---

## Render.com Production Deployment

### Prerequisites

- Render.com account (free tier available)
- GitHub repository with your code
- Environment variables ready

### Step 1: Connect GitHub Repository

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `hotgigs` repository
5. Select the `branch-1` branch

### Step 2: Configure Service

**Basic Settings:**
- Name: `hotgigs-api`
- Region: `Oregon (US West)` (or your preferred region)
- Branch: `branch-1`
- Root Directory: `backend/hotgigs-api`
- Environment: `Python 3`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

**Advanced Settings:**
- Plan: `Free` (or `Starter` for better performance)
- Auto-Deploy: `Yes`
- Health Check Path: `/`

### Step 3: Add Environment Variables

In the Render dashboard, add the following environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | Your Supabase connection string | From Supabase dashboard |
| `SUPABASE_URL` | Your Supabase project URL | From Supabase dashboard |
| `SUPABASE_KEY` | Your Supabase anon key | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | From Supabase dashboard |
| `RESEND_API_KEY` | `re_bxP3yrpH_Pt8Rf55viS8R2z7Wuuhs9VwG` | Your Resend API key |
| `RESEND_FROM_EMAIL` | `noreply@hotgigs.com` | Verified sender email |
| `SECRET_KEY` | Auto-generated | Click "Generate" |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiration |

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://hotgigs-api.onrender.com`

### Step 5: Verify Deployment

```bash
# Test the deployed API
curl https://hotgigs-api.onrender.com/

# Test email endpoint
curl -X POST https://hotgigs-api.onrender.com/api/emails/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "user_name": "Test User"
  }'
```

---

## Environment Variables

### Required Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration
RESEND_API_KEY=re_bxP3yrpH_Pt8Rf55viS8R2z7Wuuhs9VwG
RESEND_FROM_EMAIL=noreply@hotgigs.com

# Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Getting Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to Settings → Database
6. Copy the connection string → `DATABASE_URL`

---

## Webhook Configuration

### Step 1: Get Your Deployment URL

After deploying to Render.com, you'll get a URL like:
```
https://hotgigs-api.onrender.com
```

### Step 2: Configure Webhook in Resend

1. Go to https://resend.com/webhooks
2. Click "Add Webhook"
3. Enter webhook URL:
   ```
   https://hotgigs-api.onrender.com/api/webhooks/resend
   ```
4. Select events to receive:
   - ✅ email.sent
   - ✅ email.delivered
   - ✅ email.opened
   - ✅ email.clicked
   - ✅ email.bounced
   - ✅ email.complained
   - ✅ email.delivery_delayed

5. Click "Create Webhook"
6. Copy the webhook secret (you'll need this for signature verification)

### Step 3: Add Webhook Secret to Environment

In Render dashboard, add:
```
RESEND_WEBHOOK_SECRET=your-webhook-secret
```

### Step 4: Test Webhook

Send a test email and check the Render logs:

```bash
# In Render dashboard, go to Logs
# You should see webhook events being received
```

---

## Testing

### Test Email Sending

```bash
# Send welcome email
curl -X POST https://hotgigs-api.onrender.com/api/emails/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "user_name": "Test User"
  }'
```

### Test Webhook (Local)

```bash
cd /home/ubuntu/hotgigs/backend/hotgigs-api
python3 tests/test_webhook.py
```

### Test All Endpoints

Visit the Swagger UI:
```
https://hotgigs-api.onrender.com/docs
```

---

## Troubleshooting

### Issue: Build Fails on Render

**Solution:** Check the build logs in Render dashboard. Common issues:
- Missing dependencies in `requirements.txt`
- Python version mismatch
- Environment variables not set

### Issue: Application Crashes

**Solution:** Check the logs in Render dashboard:
```
Logs → View Logs
```

Common causes:
- Database connection failed (check `DATABASE_URL`)
- Missing environment variables
- Port binding issues (make sure using `$PORT`)

### Issue: Webhook Not Receiving Events

**Solution:**
1. Verify webhook URL is correct in Resend dashboard
2. Check Render logs for incoming requests
3. Verify webhook secret is configured
4. Test webhook endpoint manually:
   ```bash
   curl -X POST https://hotgigs-api.onrender.com/api/webhooks/resend \
     -H "Content-Type: application/json" \
     -d '{"type":"email.sent","data":{"email_id":"test"}}'
   ```

### Issue: Emails Not Sending

**Solution:**
1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for errors
3. Verify sender email is verified in Resend
4. Check API logs for error messages

### Issue: Database Connection Failed

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check if Supabase project is active
3. Verify network connectivity
4. Check Supabase logs

---

## Performance Optimization

### Render.com

**Free Tier Limitations:**
- Spins down after 15 minutes of inactivity
- 512 MB RAM
- Shared CPU

**Upgrade to Starter ($7/month) for:**
- Always-on service
- 512 MB RAM
- Dedicated CPU
- Faster response times

### Docker Local

**Optimize Docker Image:**
```dockerfile
# Use multi-stage build
FROM python:3.11-slim as builder
# ... build dependencies

FROM python:3.11-slim
# ... copy only necessary files
```

**Resource Limits:**
```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## Monitoring

### Render.com Built-in Monitoring

- View metrics in Render dashboard
- Set up alerts for downtime
- Monitor resource usage

### Custom Monitoring

Add health check endpoint:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
```

---

## Scaling

### Horizontal Scaling (Render)

1. Go to Settings → Scaling
2. Increase number of instances
3. Enable auto-scaling based on CPU/memory

### Database Scaling

1. Upgrade Supabase plan for more connections
2. Implement connection pooling
3. Add read replicas for read-heavy workloads

---

## Security Best Practices

1. **Environment Variables:** Never commit `.env` files to Git
2. **API Keys:** Rotate API keys regularly
3. **HTTPS:** Always use HTTPS in production (Render provides this automatically)
4. **Webhook Signatures:** Implement signature verification for webhooks
5. **Rate Limiting:** Add rate limiting to prevent abuse
6. **CORS:** Configure CORS properly for frontend access

---

## Next Steps

1. ✅ Deploy to Render.com
2. ✅ Configure webhook in Resend
3. ✅ Test all endpoints
4. ⬜ Set up monitoring and alerts
5. ⬜ Configure custom domain
6. ⬜ Set up CI/CD pipeline
7. ⬜ Implement database migrations
8. ⬜ Add comprehensive logging

---

**For Support:**
- Render.com: https://render.com/docs
- Resend: https://resend.com/docs
- FastAPI: https://fastapi.tiangolo.com

**Last Updated:** October 16, 2025  
**Version:** 1.0.0


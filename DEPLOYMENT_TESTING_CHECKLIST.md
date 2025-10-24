# Deployment Testing Checklist

This checklist ensures that all deployment configurations are properly tested before going to production.

## Pre-Deployment Validation

### Configuration Files

- [ ] `docker-compose.yml` - Supabase configuration
- [ ] `docker-compose.local.yml` - Local PostgreSQL configuration
- [ ] `docker-compose.prod.yml` - Production configuration
- [ ] `backend/hotgigs-api/Dockerfile` - Backend container image
- [ ] `hotgigs-frontend/Dockerfile` - Frontend container image
- [ ] `aws/cloudformation-template.yaml` - AWS infrastructure
- [ ] `aws/ecs-task-definition.json` - ECS task configuration

### Environment Variables

- [ ] Backend `.env` file has all required variables
- [ ] Frontend `.env` file has API URL configured
- [ ] OpenAI API key is set
- [ ] Database connection string is correct
- [ ] Redis URL is configured
- [ ] CORS origins include all necessary domains

### Scripts

- [ ] `scripts/setup-local.sh` is executable
- [ ] `scripts/setup-local.bat` exists for Windows
- [ ] `scripts/quick-start-docker.sh` is executable
- [ ] `aws/setup-infrastructure.sh` is executable
- [ ] `aws/deploy-to-aws.sh` is executable

---

## Docker Deployment Testing

### Local Docker Compose (with PostgreSQL)

```bash
# Test docker-compose.local.yml
cd /path/to/hotgigs

# Start services
docker compose -f docker-compose.local.yml up -d

# Check all services are running
docker compose -f docker-compose.local.yml ps

# Expected services:
# - hotgigs-postgres (healthy)
# - hotgigs-redis (healthy)
# - hotgigs-backend (healthy)
# - hotgigs-frontend (running)
# - hotgigs-celery-worker (running)
# - hotgigs-celery-beat (running)

# Check logs for errors
docker compose -f docker-compose.local.yml logs backend | grep -i error
docker compose -f docker-compose.local.yml logs frontend | grep -i error

# Test endpoints
curl http://localhost:8000/api/health
curl http://localhost:3000

# Cleanup
docker compose -f docker-compose.local.yml down -v
```

**Expected Results:**
- ✓ All containers start successfully
- ✓ Health checks pass
- ✓ Backend API responds at port 8000
- ✓ Frontend loads at port 3000
- ✓ Database migrations run automatically
- ✓ No error messages in logs

### Supabase Docker Compose

```bash
# Test docker-compose.yml (Supabase)
docker compose up -d

# Check services
docker compose ps

# Test connectivity
curl http://localhost:8000/docs
curl http://localhost:3000

# Cleanup
docker compose down
```

**Expected Results:**
- ✓ Backend connects to Supabase successfully
- ✓ API documentation accessible
- ✓ Frontend loads and can communicate with backend

---

## Local Development Testing

### Linux/macOS Setup

```bash
# Run setup script
./scripts/setup-local.sh

# Verify installations
python3 --version  # Should be 3.8+
node --version     # Should be 16+
psql --version     # Should be 15+
redis-server --version  # Should be 7+

# Check virtual environment created
ls backend/hotgigs-api/venv

# Check .env files created
cat backend/hotgigs-api/.env
cat frontend/hotgigs-frontend/.env

# Check start scripts created
ls -la start-*.sh

# Test starting services
./start-backend.sh &
sleep 5
curl http://localhost:8000/api/health

./start-frontend.sh &
sleep 10
curl http://localhost:3000

# Cleanup
pkill -f uvicorn
pkill -f vite
```

**Expected Results:**
- ✓ All prerequisites installed
- ✓ Virtual environment created
- ✓ Dependencies installed
- ✓ Configuration files created
- ✓ Database created and migrated
- ✓ Services start without errors
- ✓ API and frontend accessible

### Windows Setup

```batch
REM Run setup script
scripts\setup-local.bat

REM Verify installations
python --version
node --version
psql --version

REM Check files created
dir backend\hotgigs-api\.env
dir frontend\hotgigs-frontend\.env

REM Test starting services
start-backend.bat
start-frontend.bat

REM Test endpoints
curl http://localhost:8000/api/health
curl http://localhost:3000
```

**Expected Results:**
- ✓ Setup completes without errors
- ✓ All services start successfully
- ✓ Endpoints respond correctly

---

## AWS Deployment Testing

### Infrastructure Setup

```bash
cd aws

# Validate CloudFormation template
aws cloudformation validate-template \
  --template-body file://cloudformation-template.yaml

# Expected: No errors, returns template description

# Test infrastructure setup (DRY RUN)
# Review the script first
cat setup-infrastructure.sh

# Check AWS credentials
aws sts get-caller-identity

# Expected: Returns your AWS account information
```

**Expected Results:**
- ✓ CloudFormation template is valid
- ✓ AWS credentials configured
- ✓ Script has execute permissions

### ECS Task Definition

```bash
# Validate ECS task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --dry-run

# Expected: Validation passes (or shows what needs to be fixed)
```

**Expected Results:**
- ✓ Task definition is valid JSON
- ✓ All required fields present
- ✓ Resource limits are appropriate

### Deployment Script

```bash
# Review deployment script
cat deploy-to-aws.sh

# Check required environment variables
echo $AWS_ACCOUNT_ID
echo $AWS_REGION

# Test ECR login (without pushing)
aws ecr get-login-password --region us-east-1
```

**Expected Results:**
- ✓ Script logic is correct
- ✓ Environment variables set
- ✓ AWS CLI commands work

---

## Integration Testing

### Backend API Tests

```bash
cd backend/hotgigs-api

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run tests
pytest tests/ -v

# Test specific endpoints
pytest tests/test_auth.py -v
pytest tests/test_resume_parser.py -v
pytest tests/test_skill_ranker.py -v
```

**Expected Results:**
- ✓ All tests pass
- ✓ No critical warnings
- ✓ Code coverage > 80%

### Frontend Tests

```bash
cd frontend/hotgigs-frontend

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

**Expected Results:**
- ✓ All tests pass
- ✓ No linting errors
- ✓ Build completes successfully
- ✓ No TypeScript errors

### End-to-End Tests

```bash
# Start application
docker compose -f docker-compose.local.yml up -d

# Wait for services to be ready
sleep 30

# Test user registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"candidate"}'

# Test user login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test resume upload (with token from login)
# curl -X POST http://localhost:8000/api/resumes/upload \
#   -H "Authorization: Bearer $TOKEN" \
#   -F "file=@test-resume.pdf"

# Test job search
curl http://localhost:8000/api/jobs?limit=10

# Cleanup
docker compose -f docker-compose.local.yml down -v
```

**Expected Results:**
- ✓ User registration succeeds
- ✓ User login returns JWT token
- ✓ Protected endpoints require authentication
- ✓ Resume upload works
- ✓ Job search returns results

---

## Performance Testing

### Load Testing

```bash
# Install Apache Bench (if not installed)
sudo apt-get install apache2-utils  # Linux
brew install ab  # macOS

# Test API endpoint
ab -n 1000 -c 10 http://localhost:8000/api/health

# Test frontend
ab -n 1000 -c 10 http://localhost:3000/
```

**Expected Results:**
- ✓ API handles 100 requests/second
- ✓ Average response time < 100ms
- ✓ No failed requests
- ✓ Memory usage stable

### Database Performance

```bash
# Connect to database
psql $DATABASE_URL

# Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('hotgigs_db'));
```

**Expected Results:**
- ✓ No queries taking > 1 second
- ✓ Connection count < 80% of max
- ✓ Database size reasonable
- ✓ Indexes being used

---

## Security Testing

### Vulnerability Scanning

```bash
# Backend dependencies
cd backend/hotgigs-api
pip install safety
safety check

# Frontend dependencies
cd frontend/hotgigs-frontend
npm audit

# Fix vulnerabilities
npm audit fix
```

**Expected Results:**
- ✓ No critical vulnerabilities
- ✓ All dependencies up to date
- ✓ Security patches applied

### Environment Security

```bash
# Check for exposed secrets
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=venv
grep -r "password" .env

# Check file permissions
ls -la backend/hotgigs-api/.env
# Should be: -rw------- (600)

# Check CORS configuration
curl -H "Origin: http://malicious-site.com" \
  http://localhost:8000/api/health -v
# Should be blocked
```

**Expected Results:**
- ✓ No secrets in code
- ✓ .env files have restricted permissions
- ✓ CORS properly configured
- ✓ HTTPS enforced in production

---

## Monitoring Testing

### Health Checks

```bash
# Backend health check
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","database":"connected","redis":"connected"}

# Database status
curl http://localhost:8000/api/db-status

# Metrics endpoint
curl http://localhost:8000/api/metrics
```

**Expected Results:**
- ✓ Health check returns 200
- ✓ All services connected
- ✓ Metrics available

### Logging

```bash
# Check logs are being generated
docker compose -f docker-compose.local.yml logs backend | tail -20
docker compose -f docker-compose.local.yml logs celery-worker | tail -20

# Check log format
# Should include: timestamp, level, message, context
```

**Expected Results:**
- ✓ Logs are structured
- ✓ Log levels appropriate
- ✓ No sensitive data in logs
- ✓ Errors are logged with stack traces

---

## Documentation Testing

### README Files

- [ ] Root README.md is comprehensive
- [ ] Installation instructions are clear
- [ ] All links work
- [ ] Screenshots are up to date
- [ ] Prerequisites listed
- [ ] Troubleshooting section exists

### API Documentation

```bash
# Check Swagger UI
curl http://localhost:8000/docs

# Check ReDoc
curl http://localhost:8000/redoc

# Verify all endpoints documented
# Verify request/response examples
# Verify authentication requirements
```

**Expected Results:**
- ✓ API docs accessible
- ✓ All endpoints documented
- ✓ Examples provided
- ✓ Authentication explained

---

## Rollback Testing

### Docker Rollback

```bash
# Tag current version
docker tag hotgigs-backend:latest hotgigs-backend:v1.0.0

# Deploy new version
docker compose -f docker-compose.local.yml up -d --build

# If issues, rollback
docker tag hotgigs-backend:v1.0.0 hotgigs-backend:latest
docker compose -f docker-compose.local.yml up -d
```

**Expected Results:**
- ✓ Rollback completes in < 2 minutes
- ✓ No data loss
- ✓ Services restore to previous state

### AWS Rollback

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix hotgigs-app

# Rollback to previous version
aws ecs update-service \
  --cluster hotgigs-cluster \
  --service hotgigs-service \
  --task-definition hotgigs-app:PREVIOUS_REVISION
```

**Expected Results:**
- ✓ Previous version available
- ✓ Rollback successful
- ✓ Service healthy after rollback

---

## Final Checklist

Before production deployment:

### Code Quality
- [ ] All tests passing
- [ ] Code reviewed
- [ ] No TODO/FIXME in production code
- [ ] Linting passes
- [ ] Type checking passes

### Security
- [ ] Secrets in environment variables
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention

### Performance
- [ ] Load testing completed
- [ ] Database indexed
- [ ] Caching enabled
- [ ] CDN configured
- [ ] Images optimized
- [ ] Lazy loading implemented

### Monitoring
- [ ] CloudWatch alarms set
- [ ] Error tracking configured
- [ ] Uptime monitoring enabled
- [ ] Log aggregation working
- [ ] Metrics dashboard created

### Backup & Recovery
- [ ] Automated backups enabled
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO defined

### Documentation
- [ ] Deployment guide complete
- [ ] API documentation updated
- [ ] User guide available
- [ ] Troubleshooting guide created
- [ ] Runbook for on-call

---

## Testing Sign-Off

| Test Category | Status | Tested By | Date | Notes |
|---------------|--------|-----------|------|-------|
| Docker Deployment | ⬜ | | | |
| Local Development | ⬜ | | | |
| AWS Infrastructure | ⬜ | | | |
| Integration Tests | ⬜ | | | |
| Performance Tests | ⬜ | | | |
| Security Tests | ⬜ | | | |
| Monitoring | ⬜ | | | |
| Documentation | ⬜ | | | |

**Deployment Approved By:** _______________  
**Date:** _______________  
**Production Deployment Date:** _______________

---

**Last Updated:** October 23, 2025  
**Version:** 1.0  
**Maintained by:** Manus AI


# Pre-Installation Checklist - AWS Deployment

**HotGigs.ai Version:** 2.0  
**Last Updated:** October 23, 2025  
**Deployment Type:** AWS ECS/Fargate

---

## ✅ AWS Account Requirements

### Account Prerequisites

| Requirement | Status |
|-------------|--------|
| **AWS Account** | [ ] |
| **Root or IAM Admin Access** | [ ] |
| **Billing Enabled** | [ ] |
| **Credit Card on File** | [ ] |
| **Service Limits Verified** | [ ] |

### Estimated Monthly Cost

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| ECS Fargate | 2 tasks (1 vCPU, 2GB RAM) | $30-40 |
| RDS PostgreSQL | db.t3.micro, Multi-AZ | $15-20 |
| ElastiCache Redis | cache.t3.micro | $12-15 |
| Application Load Balancer | Standard | $16-20 |
| EFS | 20GB storage | $6-8 |
| Data Transfer | 100GB/month | $9-12 |
| CloudWatch Logs | 10GB/month | $5-7 |
| **Total Estimated** | | **$93-122/month** |

**Status:** [ ] Budget Approved

---

## 📋 Pre-Installation Checklist

### Step 1: Verify AWS Account

**Check Account Status:**
```bash
# Configure AWS CLI (if not already done)
aws configure

# Verify credentials
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/username"
# }
```

**Status:** [ ] AWS Account Verified [ ] Account ID Noted

---

### Step 2: Install Required Tools

#### AWS CLI

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **AWS CLI** | 2.0.0 | 2.13.0+ | [ ] |

**Installation Instructions:**

**Linux:**
```bash
# Download and install
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
# Expected: aws-cli/2.x.x
```

**macOS:**
```bash
# Using Homebrew
brew install awscli

# Or download installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify installation
aws --version
```

**Windows:**
```powershell
# Download MSI installer from:
# https://awscli.amazonaws.com/AWSCLIV2.msi

# Run installer

# Verify installation
aws --version
```

**Status:** [ ] AWS CLI Installed

#### Docker

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **Docker** | 20.10.0 | 24.0.0+ | [ ] |

**Installation:** See Docker installation in PRE_INSTALLATION_CHECKLIST_DOCKER.md

**Status:** [ ] Docker Installed

#### jq (JSON Processor)

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **jq** | 1.6 | 1.7+ | [ ] |

**Installation:**
```bash
# Linux
sudo apt-get install -y jq

# macOS
brew install jq

# Windows (using Chocolatey)
choco install jq

# Verify
jq --version
```

**Status:** [ ] jq Installed

---

### Step 3: Configure AWS Credentials

**Configure AWS CLI:**
```bash
aws configure

# Enter:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1 (or your preferred region)
# Default output format: json
```

**Verify Configuration:**
```bash
# Check credentials
aws sts get-caller-identity

# Check region
aws configure get region

# Test access
aws ec2 describe-regions --output table
```

**Status:** [ ] Credentials Configured [ ] Region Set [ ] Access Verified

---

### Step 4: Verify IAM Permissions

**Required IAM Permissions:**

The AWS user/role must have permissions for:

| Service | Permissions Required |
|---------|---------------------|
| **CloudFormation** | Full access (create, update, delete stacks) |
| **ECS** | Full access (clusters, services, tasks) |
| **ECR** | Full access (repositories, images) |
| **EC2** | VPC, Subnets, Security Groups, Internet Gateway |
| **RDS** | Create and manage DB instances |
| **ElastiCache** | Create and manage Redis clusters |
| **EFS** | Create and manage file systems |
| **ELB** | Create and manage load balancers |
| **IAM** | Create and manage roles and policies |
| **Secrets Manager** | Create and manage secrets |
| **CloudWatch** | Create log groups and metrics |
| **Route53** | Manage DNS records (optional) |
| **Certificate Manager** | Request and manage certificates (optional) |

**Test Permissions:**
```bash
# Test CloudFormation
aws cloudformation describe-stacks --region us-east-1

# Test ECS
aws ecs list-clusters --region us-east-1

# Test ECR
aws ecr describe-repositories --region us-east-1

# Test EC2
aws ec2 describe-vpcs --region us-east-1

# Test RDS
aws rds describe-db-instances --region us-east-1
```

**Status:** [ ] Permissions Verified

---

### Step 5: Check AWS Service Limits

**Verify Service Quotas:**
```bash
# Check VPC limit
aws service-quotas get-service-quota \
  --service-code vpc \
  --quota-code L-F678F1CE \
  --region us-east-1

# Check ECS task limit
aws service-quotas get-service-quota \
  --service-code ecs \
  --quota-code L-9C82F058 \
  --region us-east-1

# Check RDS instance limit
aws service-quotas get-service-quota \
  --service-code rds \
  --quota-code L-7B6409FD \
  --region us-east-1
```

**Minimum Required Limits:**
- VPCs: 1
- ECS Tasks: 10
- RDS Instances: 1
- ElastiCache Nodes: 1
- Load Balancers: 1
- EFS File Systems: 1

**Status:** [ ] Service Limits Verified

---

### Step 6: Prepare Required Information

#### Domain Name (Optional)

If you plan to use a custom domain:

- [ ] Domain name purchased
- [ ] Domain registrar access available
- [ ] DNS management access available

**Domain:** _______________________

#### SSL Certificate (Optional)

If using custom domain:

- [ ] Certificate will be requested via AWS Certificate Manager
- [ ] Domain validation method chosen (DNS or Email)

#### Secrets and Keys

**Required:**
- [ ] OpenAI API Key obtained
- [ ] Strong database password generated (min 8 chars)
- [ ] JWT secret key generated (min 32 chars)

**Optional:**
- [ ] Google OAuth credentials (for Google Drive integration)
- [ ] SendGrid API key (for email notifications)

**Generate Secure Keys:**
```bash
# Generate database password
openssl rand -base64 16

# Generate JWT secret key
openssl rand -hex 32

# Save these securely!
```

**Status:** [ ] All Secrets Prepared

---

### Step 7: Download HotGigs.ai

**Clone Repository:**
```bash
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT

# Verify AWS deployment files
ls -la aws/
# Expected files:
# - cloudformation-template.yaml
# - ecs-task-definition.json
# - setup-infrastructure.sh
# - deploy-to-aws.sh
# - AWS_DEPLOYMENT_GUIDE.md
```

**Status:** [ ] Repository Cloned [ ] AWS Files Verified

---

### Step 8: Validate CloudFormation Template

**Validate Template:**
```bash
cd aws

# Validate CloudFormation template
aws cloudformation validate-template \
  --template-body file://cloudformation-template.yaml \
  --region us-east-1

# Expected: No errors, returns template description
```

**Status:** [ ] Template Validated

---

### Step 9: Verify Docker Images Build

**Test Docker Builds:**
```bash
# Test backend build
cd ../backend/hotgigs-api
docker build -t hotgigs-backend-test .

# Test frontend build
cd ../../frontend/hotgigs-frontend
docker build -t hotgigs-frontend-test .

# Check images
docker images | grep hotgigs

# Clean up test images
docker rmi hotgigs-backend-test hotgigs-frontend-test
```

**Status:** [ ] Backend Build Successful [ ] Frontend Build Successful

---

### Step 10: Estimate Deployment Time

**Time Breakdown:**

| Phase | Duration | Description |
|-------|----------|-------------|
| **Infrastructure Setup** | 15-20 min | CloudFormation stack creation |
| **Docker Build** | 5-10 min | Building container images |
| **ECR Push** | 3-5 min | Pushing images to ECR |
| **ECS Deployment** | 5-10 min | Deploying tasks to ECS |
| **Health Checks** | 2-5 min | Waiting for services to be healthy |
| **Total** | **30-50 min** | Complete deployment |

**Status:** [ ] Time Allocation Confirmed

---

## 📦 AWS Resource Requirements

### Compute Resources

| Resource | Quantity | Configuration |
|----------|----------|---------------|
| **ECS Tasks** | 3 | Backend, Frontend, Celery Worker |
| **vCPU** | 1 per task | Total: 3 vCPU |
| **Memory** | 2GB per task | Total: 6GB |

### Networking Resources

| Resource | Quantity | Configuration |
|----------|----------|---------------|
| **VPC** | 1 | 10.0.0.0/16 |
| **Public Subnets** | 2 | Multi-AZ |
| **Private Subnets** | 2 | Multi-AZ |
| **Internet Gateway** | 1 | For public access |
| **NAT Gateways** | 0 | Using public subnets for ECS |
| **Security Groups** | 4 | ALB, ECS, RDS, Redis |

### Storage Resources

| Resource | Quantity | Configuration |
|----------|----------|---------------|
| **RDS Storage** | 20GB | gp3, expandable |
| **EFS Storage** | Dynamic | Pay per use |
| **ECR Repositories** | 2 | Backend, Frontend |

### Database Resources

| Resource | Quantity | Configuration |
|----------|----------|---------------|
| **RDS PostgreSQL** | 1 | db.t3.micro, Multi-AZ |
| **ElastiCache Redis** | 1 | cache.t3.micro |

---

## 🚨 Common Issues and Solutions

### Issue 1: AWS CLI Not Configured

**Symptom:**
```
Unable to locate credentials
```

**Solution:**
```bash
aws configure
# Enter your credentials
```

### Issue 2: Insufficient IAM Permissions

**Symptom:**
```
User is not authorized to perform: cloudformation:CreateStack
```

**Solution:**
- Contact AWS administrator
- Request required permissions
- Or use IAM user with AdministratorAccess policy

### Issue 3: Service Limit Exceeded

**Symptom:**
```
You have exceeded the maximum number of VPCs
```

**Solution:**
```bash
# Request limit increase
aws service-quotas request-service-quota-increase \
  --service-code vpc \
  --quota-code L-F678F1CE \
  --desired-value 10
```

### Issue 4: Region Not Supported

**Symptom:**
```
Service not available in region
```

**Solution:**
- Use supported region (us-east-1, us-west-2, eu-west-1, etc.)
- Update region in aws configure

### Issue 5: Docker Build Fails

**Symptom:**
```
Error building Docker image
```

**Solution:**
```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# Clean up Docker
docker system prune -a
```

---

## ✅ Final Checklist

Before proceeding with AWS deployment:

### Account & Access
- [ ] AWS account active and verified
- [ ] Billing enabled with valid payment method
- [ ] Budget approved ($100-150/month)
- [ ] AWS CLI installed and configured
- [ ] IAM permissions verified
- [ ] Service limits checked

### Tools & Software
- [ ] Docker installed and running
- [ ] jq installed
- [ ] Git installed
- [ ] Repository cloned

### Secrets & Configuration
- [ ] OpenAI API key obtained
- [ ] Database password generated
- [ ] JWT secret key generated
- [ ] Domain name ready (optional)
- [ ] SSL certificate plan (optional)

### Pre-Flight Checks
- [ ] CloudFormation template validated
- [ ] Docker images build successfully
- [ ] AWS deployment files verified
- [ ] Deployment time allocated (30-50 min)

**Status:** [ ] Ready to Deploy to AWS

---

## 📝 Deployment Commands

Once all checks pass, run:

```bash
cd aws

# Step 1: Setup infrastructure
./setup-infrastructure.sh

# Step 2: Deploy application
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
./deploy-to-aws.sh
```

**Estimated Deployment Time:** 30-50 minutes

---

## 📊 Post-Deployment Verification

After deployment completes:

```bash
# Get ALB DNS name
aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text

# Test backend API
curl http://<ALB-DNS>/api/health

# Test frontend
curl http://<ALB-DNS>/
```

---

## 📞 Support

If any checks fail:

1. Review the troubleshooting section above
2. Check `aws/AWS_DEPLOYMENT_GUIDE.md`
3. Visit https://github.com/businessintelli/HOTGIGSAIOCT/issues
4. Ensure all prerequisites are met before proceeding

---

**Checklist Version:** 1.0  
**Last Updated:** October 23, 2025  
**Maintained by:** Manus AI


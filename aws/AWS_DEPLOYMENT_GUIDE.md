# AWS Deployment Guide for HotGigs.ai

This guide provides detailed instructions for deploying HotGigs.ai on Amazon Web Services (AWS) using ECS Fargate, RDS, and other managed services.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Application Deployment](#application-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Cost Optimization](#cost-optimization)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### AWS Services Used

The deployment leverages the following AWS services:

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **ECS Fargate** | Container orchestration | 2 tasks (backend + frontend) |
| **RDS PostgreSQL** | Managed database | db.t3.micro, Multi-AZ |
| **ElastiCache Redis** | Caching and message broker | cache.t3.micro |
| **Application Load Balancer** | Traffic distribution | Internet-facing ALB |
| **EFS** | Shared file storage | General Purpose |
| **ECR** | Container registry | Private repositories |
| **Secrets Manager** | Secure credential storage | Encrypted secrets |
| **CloudWatch** | Logging and monitoring | Log groups and metrics |
| **VPC** | Network isolation | Public and private subnets |
| **Route53** | DNS management | Optional |
| **Certificate Manager** | SSL/TLS certificates | Optional |

### Network Architecture

```
Internet
    ↓
Application Load Balancer (Public Subnets)
    ↓
ECS Tasks (Private Subnets)
    ↓
RDS PostgreSQL (Private Subnets)
ElastiCache Redis (Private Subnets)
EFS (Private Subnets)
```

### High Availability

The infrastructure is designed for high availability:

- **Multi-AZ deployment** for RDS and ECS tasks
- **Auto-scaling** for ECS tasks based on CPU/memory
- **Health checks** for automatic task replacement
- **Automated backups** for RDS with point-in-time recovery

---

## Prerequisites

### Required Tools

1. **AWS CLI** version 2.0 or higher
   ```bash
   aws --version
   ```

2. **Docker** for building container images
   ```bash
   docker --version
   ```

3. **jq** for JSON processing (optional but recommended)
   ```bash
   jq --version
   ```

### AWS Account Requirements

- AWS account with administrator access or the following permissions:
  - ECS (Full access)
  - ECR (Full access)
  - RDS (Full access)
  - ElastiCache (Full access)
  - VPC (Full access)
  - IAM (Create roles and policies)
  - CloudFormation (Full access)
  - Secrets Manager (Full access)
  - CloudWatch (Full access)

### Required Information

Before starting, gather the following:

- **OpenAI API Key** - For AI features
- **Database Password** - Strong password (min 8 characters)
- **JWT Secret Key** - Random string (min 32 characters)
- **Domain Name** - Optional, for custom domain
- **AWS Region** - Default: us-east-1

---

## Infrastructure Setup

### Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity
```

### Step 2: Generate Secure Keys

```bash
# Generate JWT secret key (32+ characters)
openssl rand -hex 32

# Generate database password
openssl rand -base64 16
```

### Step 3: Run Infrastructure Setup Script

```bash
cd aws
chmod +x setup-infrastructure.sh
./setup-infrastructure.sh
```

The script will prompt you for:
- Environment name (production/staging/development)
- Database password
- JWT secret key
- OpenAI API key

**Expected Duration:** 15-20 minutes

### Step 4: Verify Infrastructure Creation

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].StackStatus'

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs'
```

### Manual Infrastructure Setup (Alternative)

If you prefer manual setup or the script fails:

```bash
# Create CloudFormation stack
aws cloudformation create-stack \
  --stack-name hotgigs-production \
  --template-body file://cloudformation-template.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=DatabasePassword,ParameterValue=YOUR_PASSWORD \
    ParameterKey=SecretKey,ParameterValue=YOUR_SECRET_KEY \
    ParameterKey=OpenAIApiKey,ParameterValue=YOUR_OPENAI_KEY \
  --capabilities CAPABILITY_IAM

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name hotgigs-production
```

---

## Application Deployment

### Step 1: Update ECS Task Definition

After infrastructure is created, update the ECS task definition with actual values:

```bash
# Get EFS ID from CloudFormation outputs
EFS_ID=$(aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`FileSystemId`].OutputValue' \
  --output text)

# Update task definition
sed -i "s/fs-XXXXXXXXX/$EFS_ID/g" ecs-task-definition.json
```

### Step 2: Build and Push Docker Images

```bash
# Set environment variables
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1

# Run deployment script
chmod +x deploy-to-aws.sh
./deploy-to-aws.sh
```

The script will:
1. Create ECR repositories
2. Login to ECR
3. Build backend Docker image
4. Build frontend Docker image
5. Tag images
6. Push images to ECR
7. Register ECS task definition
8. Update ECS service

### Step 3: Create ECS Service

If the service doesn't exist yet, create it:

```bash
# Get required values
CLUSTER_NAME=$(aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' \
  --output text)

BACKEND_TG=$(aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`BackendTargetGroupArn`].OutputValue' \
  --output text)

FRONTEND_TG=$(aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendTargetGroupArn`].OutputValue' \
  --output text)

# Get VPC and subnet information
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=tag:aws:cloudformation:stack-name,Values=hotgigs-production" \
  --query 'Vpcs[0].VpcId' \
  --output text)

SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*Private*" \
  --query 'Subnets[*].SubnetId' \
  --output text | tr '\t' ',')

SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*ECS*" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

# Create ECS service
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name hotgigs-service \
  --task-definition hotgigs-app \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUP],assignPublicIp=DISABLED}" \
  --load-balancers \
    "targetGroupArn=$BACKEND_TG,containerName=hotgigs-backend,containerPort=8000" \
    "targetGroupArn=$FRONTEND_TG,containerName=hotgigs-frontend,containerPort=80" \
  --health-check-grace-period-seconds 60
```

### Step 4: Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services hotgigs-service \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'

# Check task status
aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name hotgigs-service

# Get ALB DNS name
ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text)

echo "Application URL: http://$ALB_DNS"
```

---

## Post-Deployment Configuration

### Configure Custom Domain

#### Step 1: Request SSL Certificate

```bash
# Request certificate in ACM
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Get certificate ARN
CERT_ARN=$(aws acm list-certificates \
  --query 'CertificateSummaryList[?DomainName==`yourdomain.com`].CertificateArn' \
  --output text)
```

#### Step 2: Add HTTPS Listener to ALB

```bash
# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names hotgigs-production-ALB \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Get target group ARN
TG_ARN=$(aws cloudformation describe-stacks \
  --stack-name hotgigs-production \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendTargetGroupArn`].OutputValue' \
  --output text)

# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

#### Step 3: Configure Route53

```bash
# Create hosted zone (if not exists)
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)

# Get hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name yourdomain.com \
  --query 'HostedZones[0].Id' \
  --output text)

# Create A record pointing to ALB
cat > change-batch.json <<EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "yourdomain.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].CanonicalHostedZoneId' --output text)",
        "DNSName": "$ALB_DNS",
        "EvaluateTargetHealth": true
      }
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://change-batch.json
```

### Run Database Migrations

```bash
# Connect to ECS task
TASK_ARN=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name hotgigs-service \
  --query 'taskArns[0]' \
  --output text)

# Execute migration command
aws ecs execute-command \
  --cluster $CLUSTER_NAME \
  --task $TASK_ARN \
  --container hotgigs-backend \
  --interactive \
  --command "python migrations/run_all_migrations.py"
```

### Configure Auto-Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/hotgigs-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create CPU-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/hotgigs-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    "TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization}"

# Create memory-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/$CLUSTER_NAME/hotgigs-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name memory-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    "TargetValue=80.0,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageMemoryUtilization}"
```

---

## Monitoring and Maintenance

### CloudWatch Dashboards

Create a custom dashboard:

```bash
aws cloudwatch put-dashboard \
  --dashboard-name HotGigs-Production \
  --dashboard-body file://cloudwatch-dashboard.json
```

### Key Metrics to Monitor

- **ECS Service CPU Utilization** - Target: < 70%
- **ECS Service Memory Utilization** - Target: < 80%
- **ALB Target Response Time** - Target: < 2 seconds
- **ALB HTTP 5xx Errors** - Target: < 1%
- **RDS CPU Utilization** - Target: < 80%
- **RDS Database Connections** - Target: < 80% of max
- **ElastiCache CPU Utilization** - Target: < 75%
- **EFS Throughput** - Monitor for bottlenecks

### Set Up CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name hotgigs-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=ServiceName,Value=hotgigs-service Name=ClusterName,Value=$CLUSTER_NAME

# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name hotgigs-high-errors \
  --alarm-description "Alert when 5xx errors exceed 10" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### View Logs

```bash
# View backend logs
aws logs tail /ecs/hotgigs-production-backend --follow

# View frontend logs
aws logs tail /ecs/hotgigs-production-frontend --follow

# View Celery worker logs
aws logs tail /ecs/hotgigs-production-celery --follow

# Search logs for errors
aws logs filter-log-events \
  --log-group-name /ecs/hotgigs-production-backend \
  --filter-pattern "ERROR"
```

### Update Application

To deploy new version:

```bash
# Build and push new images
./deploy-to-aws.sh

# Force new deployment
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service hotgigs-service \
  --force-new-deployment
```

---

## Cost Optimization

### Right-Sizing Resources

Monitor resource utilization and adjust:

```bash
# Downgrade RDS instance if CPU < 30%
aws rds modify-db-instance \
  --db-instance-identifier hotgigs-production \
  --db-instance-class db.t3.small \
  --apply-immediately

# Adjust ECS task resources
# Edit ecs-task-definition.json and update:
# "cpu": "512",      # Reduce from 1024
# "memory": "1024"   # Reduce from 2048
```

### Use Spot Instances

For non-critical workloads:

```bash
# Update capacity provider strategy
aws ecs put-cluster-capacity-providers \
  --cluster $CLUSTER_NAME \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1 \
    capacityProvider=FARGATE_SPOT,weight=3
```

### Enable S3 for File Storage

Instead of EFS, use S3 for file uploads:

```bash
# Create S3 bucket
aws s3 mb s3://hotgigs-uploads-production

# Update backend environment variable
# UPLOAD_BACKEND=s3
# S3_BUCKET=hotgigs-uploads-production
```

### Cost Monitoring

Set up cost alerts:

```bash
# Create budget
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json
```

---

## Troubleshooting

### Tasks Failing to Start

```bash
# Check task stopped reason
aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks $(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name hotgigs-service --query 'taskArns[0]' --output text) \
  --query 'tasks[0].stoppedReason'

# Check CloudWatch logs
aws logs tail /ecs/hotgigs-production-backend --since 10m
```

### Database Connection Issues

```bash
# Check security group rules
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=*DB*" \
  --query 'SecurityGroups[0].IpPermissions'

# Test connection from ECS task
aws ecs execute-command \
  --cluster $CLUSTER_NAME \
  --task $TASK_ARN \
  --container hotgigs-backend \
  --interactive \
  --command "psql $DATABASE_URL"
```

### High Latency

```bash
# Check ALB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=app/hotgigs-production-ALB/... \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Check RDS performance insights
aws rds describe-db-instances \
  --db-instance-identifier hotgigs-production \
  --query 'DBInstances[0].PerformanceInsightsEnabled'
```

### Out of Memory Errors

```bash
# Increase task memory
# Edit ecs-task-definition.json
# "memory": "4096"  # Increase from 2048

# Register new task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Update service
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service hotgigs-service \
  --task-definition hotgigs-app
```

---

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [CloudFormation Template Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-reference.html)

---

**Last Updated:** October 23, 2025  
**Version:** 1.0  
**Maintained by:** Manus AI


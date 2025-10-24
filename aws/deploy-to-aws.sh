#!/bin/bash

# HotGigs.ai AWS Deployment Script
# This script deploys the application to AWS ECS using Fargate

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ECR_REPO_BACKEND="hotgigs-backend"
ECR_REPO_FRONTEND="hotgigs-frontend"
ECS_CLUSTER="hotgigs-cluster"
ECS_SERVICE="hotgigs-service"
TASK_FAMILY="hotgigs-app"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: AWS_ACCOUNT_ID environment variable is not set${NC}"
    exit 1
fi

echo -e "${GREEN}Starting HotGigs.ai AWS Deployment...${NC}"

# Step 1: Create ECR repositories if they don't exist
echo -e "${YELLOW}Step 1: Creating ECR repositories...${NC}"
aws ecr describe-repositories --repository-names $ECR_REPO_BACKEND --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_REPO_BACKEND --region $AWS_REGION

aws ecr describe-repositories --repository-names $ECR_REPO_FRONTEND --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_REPO_FRONTEND --region $AWS_REGION

# Step 2: Login to ECR
echo -e "${YELLOW}Step 2: Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 3: Build and push backend image
echo -e "${YELLOW}Step 3: Building and pushing backend image...${NC}"
cd ../backend/hotgigs-api
docker build -t $ECR_REPO_BACKEND:latest .
docker tag $ECR_REPO_BACKEND:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:latest

# Step 4: Build and push frontend image
echo -e "${YELLOW}Step 4: Building and pushing frontend image...${NC}"
cd ../../frontend/hotgigs-frontend
docker build -t $ECR_REPO_FRONTEND:latest .
docker tag $ECR_REPO_FRONTEND:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest

cd ../../aws

# Step 5: Update task definition with actual ECR URLs
echo -e "${YELLOW}Step 5: Updating task definition...${NC}"
sed -e "s|YOUR_ECR_REPO|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com|g" \
    -e "s|YOUR_ACCOUNT_ID|$AWS_ACCOUNT_ID|g" \
    -e "s|REGION|$AWS_REGION|g" \
    ecs-task-definition.json > ecs-task-definition-updated.json

# Step 6: Register task definition
echo -e "${YELLOW}Step 6: Registering task definition...${NC}"
aws ecs register-task-definition \
    --cli-input-json file://ecs-task-definition-updated.json \
    --region $AWS_REGION

# Step 7: Create or update ECS cluster
echo -e "${YELLOW}Step 7: Creating/updating ECS cluster...${NC}"
aws ecs describe-clusters --clusters $ECS_CLUSTER --region $AWS_REGION 2>/dev/null || \
    aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION

# Step 8: Update ECS service
echo -e "${YELLOW}Step 8: Updating ECS service...${NC}"
TASK_REVISION=$(aws ecs describe-task-definition --task-definition $TASK_FAMILY --region $AWS_REGION | jq -r '.taskDefinition.revision')

aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --task-definition $TASK_FAMILY:$TASK_REVISION \
    --force-new-deployment \
    --region $AWS_REGION 2>/dev/null || \
    echo -e "${YELLOW}Note: Service doesn't exist yet. Please create it manually via AWS Console or use create-service command${NC}"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your application is being deployed to AWS ECS${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create an Application Load Balancer (ALB) if not already created"
echo "2. Create an ECS service if not already created"
echo "3. Configure Route53 for your domain"
echo "4. Set up AWS Secrets Manager with required secrets"
echo "5. Configure RDS PostgreSQL database"
echo "6. Configure ElastiCache Redis cluster"
echo ""
echo -e "${GREEN}For detailed instructions, see: aws/AWS_DEPLOYMENT_GUIDE.md${NC}"


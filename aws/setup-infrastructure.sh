#!/bin/bash

# HotGigs.ai AWS Infrastructure Setup Script
# This script sets up the complete AWS infrastructure using CloudFormation

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="${STACK_NAME:-hotgigs-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"
TEMPLATE_FILE="cloudformation-template.yaml"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     HotGigs.ai AWS Infrastructure Setup Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. Installing...${NC}"
    sudo apt-get update && sudo apt-get install -y jq
fi

# Verify AWS credentials
echo -e "${YELLOW}Verifying AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials are not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account ID: $AWS_ACCOUNT_ID${NC}"

# Prompt for required parameters
echo ""
echo -e "${YELLOW}Please provide the following parameters:${NC}"
echo ""

read -p "Environment (development/staging/production) [production]: " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-production}

read -sp "Database Password (min 8 characters): " DB_PASSWORD
echo ""
if [ ${#DB_PASSWORD} -lt 8 ]; then
    echo -e "${RED}Error: Database password must be at least 8 characters${NC}"
    exit 1
fi

read -sp "JWT Secret Key (min 32 characters): " SECRET_KEY
echo ""
if [ ${#SECRET_KEY} -lt 32 ]; then
    echo -e "${RED}Error: Secret key must be at least 32 characters${NC}"
    exit 1
fi

read -sp "OpenAI API Key: " OPENAI_KEY
echo ""
if [ -z "$OPENAI_KEY" ]; then
    echo -e "${YELLOW}Warning: OpenAI API Key is empty. AI features will not work.${NC}"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# Validate CloudFormation template
echo ""
echo -e "${YELLOW}Validating CloudFormation template...${NC}"
if aws cloudformation validate-template --template-body file://$TEMPLATE_FILE --region $AWS_REGION &> /dev/null; then
    echo -e "${GREEN}✓ Template is valid${NC}"
else
    echo -e "${RED}Error: Template validation failed${NC}"
    exit 1
fi

# Create CloudFormation stack
echo ""
echo -e "${YELLOW}Creating CloudFormation stack: $STACK_NAME${NC}"
echo -e "${YELLOW}This will take approximately 15-20 minutes...${NC}"
echo ""

aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --parameters \
        ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        ParameterKey=DatabasePassword,ParameterValue=$DB_PASSWORD \
        ParameterKey=SecretKey,ParameterValue=$SECRET_KEY \
        ParameterKey=OpenAIApiKey,ParameterValue=$OPENAI_KEY \
    --capabilities CAPABILITY_IAM \
    --region $AWS_REGION \
    --tags Key=Project,Value=HotGigs Key=Environment,Value=$ENVIRONMENT

# Wait for stack creation
echo -e "${YELLOW}Waiting for stack creation to complete...${NC}"
aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --region $AWS_REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Stack created successfully!${NC}"
else
    echo -e "${RED}Error: Stack creation failed${NC}"
    echo "Check AWS Console for details"
    exit 1
fi

# Get stack outputs
echo ""
echo -e "${YELLOW}Retrieving stack outputs...${NC}"
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs' \
    --output json)

ALB_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="LoadBalancerURL") | .OutputValue')
DB_ENDPOINT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="DatabaseEndpoint") | .OutputValue')
REDIS_ENDPOINT=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="RedisEndpoint") | .OutputValue')
ECS_CLUSTER=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ECSClusterName") | .OutputValue')
EFS_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="FileSystemId") | .OutputValue')

# Display results
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Infrastructure Setup Complete!                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Stack Outputs:${NC}"
echo -e "  ${YELLOW}Load Balancer URL:${NC} http://$ALB_URL"
echo -e "  ${YELLOW}Database Endpoint:${NC} $DB_ENDPOINT"
echo -e "  ${YELLOW}Redis Endpoint:${NC} $REDIS_ENDPOINT"
echo -e "  ${YELLOW}ECS Cluster:${NC} $ECS_CLUSTER"
echo -e "  ${YELLOW}EFS File System:${NC} $EFS_ID"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update ecs-task-definition.json with EFS ID: $EFS_ID"
echo "2. Run deploy-to-aws.sh to deploy the application"
echo "3. Configure your domain DNS to point to: $ALB_URL"
echo "4. Set up SSL certificate using AWS Certificate Manager"
echo ""
echo -e "${GREEN}For detailed instructions, see: aws/AWS_DEPLOYMENT_GUIDE.md${NC}"

# Save outputs to file
cat > infrastructure-outputs.json <<EOF
{
  "stack_name": "$STACK_NAME",
  "region": "$AWS_REGION",
  "alb_url": "$ALB_URL",
  "database_endpoint": "$DB_ENDPOINT",
  "redis_endpoint": "$REDIS_ENDPOINT",
  "ecs_cluster": "$ECS_CLUSTER",
  "efs_id": "$EFS_ID",
  "account_id": "$AWS_ACCOUNT_ID"
}
EOF

echo ""
echo -e "${GREEN}✓ Infrastructure details saved to: infrastructure-outputs.json${NC}"


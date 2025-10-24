#!/bin/bash

# HotGigs.ai Quick Start with Docker
# This script provides the fastest way to get HotGigs.ai running

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        HotGigs.ai Quick Start with Docker              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Determine which compose file to use
echo -e "${YELLOW}Select deployment mode:${NC}"
echo "1) Local with PostgreSQL (recommended for development)"
echo "2) Supabase (uses existing Supabase instance)"
echo ""
read -p "Enter choice (1 or 2): " CHOICE

case $CHOICE in
    1)
        COMPOSE_FILE="docker-compose.local.yml"
        echo -e "${GREEN}Using local PostgreSQL database${NC}"
        ;;
    2)
        COMPOSE_FILE="docker-compose.yml"
        echo -e "${GREEN}Using Supabase${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}Creating .env file...${NC}"
    
    # Prompt for OpenAI API Key
    read -p "Enter your OpenAI API Key (or press Enter to skip): " OPENAI_KEY
    
    cat > .env <<EOF
# OpenAI API Key for AI features
OPENAI_API_KEY=${OPENAI_KEY}

# JWT Secret Key (auto-generated)
SECRET_KEY=$(openssl rand -hex 32)

# Google Drive API (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-drive/auth/callback

# Frontend API URL
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
EOF
    
    echo -e "${GREEN}✓ Created .env file${NC}"
    
    if [ -z "$OPENAI_KEY" ]; then
        echo -e "${YELLOW}⚠ Warning: OpenAI API Key not provided. AI features will not work.${NC}"
        echo -e "${YELLOW}  You can add it later to the .env file${NC}"
    fi
fi

# Pull latest images
echo ""
echo -e "${YELLOW}Pulling Docker images...${NC}"
docker-compose -f $COMPOSE_FILE pull 2>/dev/null || true

# Build images
echo ""
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f $COMPOSE_FILE build

# Start services
echo ""
echo -e "${YELLOW}Starting services...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo ""
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check if services are running
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Services are running${NC}"
else
    echo -e "${RED}Error: Some services failed to start${NC}"
    echo "Run 'docker-compose -f $COMPOSE_FILE logs' to see the error"
    exit 1
fi

# Display service URLs
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          HotGigs.ai is now running!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  Frontend:     ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend API:  ${GREEN}http://localhost:8000${NC}"
echo -e "  API Docs:     ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  Redoc:        ${GREEN}http://localhost:8000/redoc${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:    ${BLUE}docker-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  Stop:         ${BLUE}docker-compose -f $COMPOSE_FILE stop${NC}"
echo -e "  Restart:      ${BLUE}docker-compose -f $COMPOSE_FILE restart${NC}"
echo -e "  Remove:       ${BLUE}docker-compose -f $COMPOSE_FILE down${NC}"
echo -e "  Remove all:   ${BLUE}docker-compose -f $COMPOSE_FILE down -v${NC}"
echo ""
echo -e "${YELLOW}Default test credentials:${NC}"
echo -e "  Email:    ${GREEN}test@example.com${NC}"
echo -e "  Password: ${GREEN}password123${NC}"
echo ""
echo -e "${GREEN}Happy job hunting! 🚀${NC}"


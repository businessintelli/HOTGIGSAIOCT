#!/bin/bash

# HotGigs.ai - Pre-Installation Check Script (Docker)
# Version: 1.0
# Purpose: Verify system requirements before Docker deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}HotGigs.ai - Pre-Installation Check${NC}"
echo -e "${BLUE}Deployment Type: Docker${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}: $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

# Check 1: Operating System
echo "Checking Operating System..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_NAME=$(cat /etc/os-release | grep "^NAME=" | cut -d'"' -f2)
    OS_VERSION=$(cat /etc/os-release | grep "^VERSION_ID=" | cut -d'"' -f2)
    print_status 0 "Operating System: $OS_NAME $OS_VERSION"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_VERSION=$(sw_vers -productVersion)
    print_status 0 "Operating System: macOS $OS_VERSION"
else
    print_status 1 "Unsupported operating system: $OSTYPE"
fi
echo ""

# Check 2: CPU Cores
echo "Checking CPU..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    CPU_CORES=$(sysctl -n hw.ncpu)
else
    CPU_CORES=$(nproc)
fi

if [ "$CPU_CORES" -ge 2 ]; then
    print_status 0 "CPU Cores: $CPU_CORES (minimum: 2)"
else
    print_status 1 "CPU Cores: $CPU_CORES (minimum required: 2)"
fi
echo ""

# Check 3: RAM
echo "Checking RAM..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    RAM_GB=$(sysctl hw.memsize | awk '{print int($2/1024/1024/1024)}')
else
    RAM_GB=$(free -g | grep Mem | awk '{print $2}')
fi

if [ "$RAM_GB" -ge 4 ]; then
    print_status 0 "RAM: ${RAM_GB}GB (minimum: 4GB)"
else
    print_status 1 "RAM: ${RAM_GB}GB (minimum required: 4GB)"
fi
echo ""

# Check 4: Disk Space
echo "Checking Disk Space..."
DISK_AVAIL=$(df -BG / | tail -1 | awk '{print $4}' | sed 's/G//')

if [ "$DISK_AVAIL" -ge 10 ]; then
    print_status 0 "Disk Space: ${DISK_AVAIL}GB available (minimum: 10GB)"
else
    print_status 1 "Disk Space: ${DISK_AVAIL}GB available (minimum required: 10GB)"
fi
echo ""

# Check 5: Docker
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    print_status 0 "Docker installed: $DOCKER_VERSION"
    
    # Check if Docker daemon is running
    if docker ps &> /dev/null; then
        print_status 0 "Docker daemon is running"
    else
        print_status 1 "Docker daemon is not running"
    fi
else
    print_status 1 "Docker is not installed"
fi
echo ""

# Check 6: Docker Compose
echo "Checking Docker Compose..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    print_status 0 "Docker Compose installed: $COMPOSE_VERSION"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
    print_warning "Using legacy docker-compose. Consider upgrading to Docker Compose V2"
else
    print_status 1 "Docker Compose is not installed"
fi
echo ""

# Check 7: Network Connectivity
echo "Checking Network Connectivity..."
if ping -c 1 google.com &> /dev/null; then
    print_status 0 "Internet connection available"
else
    print_status 1 "No internet connection"
fi

if curl -s -I https://hub.docker.com &> /dev/null; then
    print_status 0 "Docker Hub accessible"
else
    print_warning "Cannot reach Docker Hub"
fi
echo ""

# Check 8: Required Ports
echo "Checking Required Ports..."
REQUIRED_PORTS=(3000 8000 5432 6379)
ALL_PORTS_FREE=true

for PORT in "${REQUIRED_PORTS[@]}"; do
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if lsof -Pi :$PORT -sTCP:LISTEN -t &> /dev/null; then
            print_warning "Port $PORT is already in use"
            ALL_PORTS_FREE=false
        else
            print_status 0 "Port $PORT is available"
        fi
    else
        if ss -tuln | grep -q ":$PORT "; then
            print_warning "Port $PORT is already in use"
            ALL_PORTS_FREE=false
        else
            print_status 0 "Port $PORT is available"
        fi
    fi
done
echo ""

# Check 9: Git
echo "Checking Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    print_status 0 "Git installed: $GIT_VERSION"
else
    print_warning "Git is not installed (optional for Docker deployment)"
fi
echo ""

# Check 10: OpenAI API Key
echo "Checking Environment Variables..."
if [ -f ".env" ]; then
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        print_status 0 "OpenAI API key found in .env"
    else
        print_warning "OpenAI API key not found in .env (required for AI features)"
    fi
else
    print_info "No .env file found (will be created during setup)"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pre-Installation Check Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo -e "${GREEN}You can proceed with Docker deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./scripts/quick-start-docker.sh"
    echo "  2. Wait for services to start (5-10 minutes)"
    echo "  3. Access at: http://localhost:3000"
    exit 0
else
    echo -e "${RED}✗ Some critical checks failed.${NC}"
    echo -e "${RED}Please fix the issues above before proceeding.${NC}"
    echo ""
    echo "Common solutions:"
    echo "  - Install Docker: https://docs.docker.com/get-docker/"
    echo "  - Free up disk space: docker system prune -a"
    echo "  - Stop services using required ports"
    exit 1
fi

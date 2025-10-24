#!/bin/bash

# HotGigs.ai Local Development Setup Script
# For Linux and macOS

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     HotGigs.ai Local Development Setup Script         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo -e "${GREEN}Detected OS: $MACHINE${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✓ Python $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 16 or higher"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | cut -d' ' -f3)
    echo -e "${GREEN}✓ PostgreSQL $PG_VERSION${NC}"
else
    echo -e "${YELLOW}! PostgreSQL is not installed${NC}"
    read -p "Would you like to install PostgreSQL? (y/n): " INSTALL_PG
    if [ "$INSTALL_PG" = "y" ]; then
        if [ "$MACHINE" = "Linux" ]; then
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        elif [ "$MACHINE" = "Mac" ]; then
            brew install postgresql
        fi
    else
        echo -e "${YELLOW}Skipping PostgreSQL installation. You'll need to install it manually.${NC}"
    fi
fi

# Check Redis
if command -v redis-server &> /dev/null; then
    REDIS_VERSION=$(redis-server --version | cut -d' ' -f3 | cut -d'=' -f2)
    echo -e "${GREEN}✓ Redis $REDIS_VERSION${NC}"
else
    echo -e "${YELLOW}! Redis is not installed${NC}"
    read -p "Would you like to install Redis? (y/n): " INSTALL_REDIS
    if [ "$INSTALL_REDIS" = "y" ]; then
        if [ "$MACHINE" = "Linux" ]; then
            sudo apt-get update
            sudo apt-get install -y redis-server
        elif [ "$MACHINE" = "Mac" ]; then
            brew install redis
        fi
    else
        echo -e "${YELLOW}Skipping Redis installation. You'll need to install it manually.${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}Setting up backend...${NC}"

# Create virtual environment
cd backend/hotgigs-api
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env <<EOF
# Database Configuration
DATABASE_URL=postgresql://hotgigs:hotgigs_password@localhost:5432/hotgigs_db

# JWT Configuration
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# OpenAI API Key (Add your key here)
OPENAI_API_KEY=

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# File Upload Configuration
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads

# Application Settings
PYTHONUNBUFFERED=1
PYTHONPATH=./src
EOF
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please add your OPENAI_API_KEY to backend/hotgigs-api/.env${NC}"
fi

# Create uploads directory
mkdir -p uploads

# Setup database
echo ""
echo -e "${YELLOW}Setting up database...${NC}"
read -p "Would you like to create the database now? (y/n): " CREATE_DB
if [ "$CREATE_DB" = "y" ]; then
    # Start PostgreSQL if not running
    if [ "$MACHINE" = "Linux" ]; then
        sudo service postgresql start
    elif [ "$MACHINE" = "Mac" ]; then
        brew services start postgresql
    fi
    
    # Create database and user
    sudo -u postgres psql -c "CREATE USER hotgigs WITH PASSWORD 'hotgigs_password';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE hotgigs_db OWNER hotgigs;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hotgigs_db TO hotgigs;" 2>/dev/null || true
    
    # Run migrations
    echo "Running database migrations..."
    python migrations/run_all_migrations.py
    
    echo -e "${GREEN}✓ Database setup complete${NC}"
fi

# Start Redis
echo ""
echo -e "${YELLOW}Starting Redis...${NC}"
if [ "$MACHINE" = "Linux" ]; then
    sudo service redis-server start
elif [ "$MACHINE" = "Mac" ]; then
    brew services start redis
fi

cd ../..

# Setup frontend
echo ""
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend/hotgigs-frontend

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env <<EOF
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
EOF
    echo -e "${GREEN}✓ Created frontend .env file${NC}"
fi

cd ../..

# Create start script
echo ""
echo -e "${YELLOW}Creating start scripts...${NC}"

cat > start-backend.sh <<'EOF'
#!/bin/bash
cd backend/hotgigs-api
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
EOF

cat > start-frontend.sh <<'EOF'
#!/bin/bash
cd frontend/hotgigs-frontend
npm run dev
EOF

cat > start-celery.sh <<'EOF'
#!/bin/bash
cd backend/hotgigs-api
source venv/bin/activate
celery -A src.core.celery_app worker --loglevel=info --concurrency=4
EOF

cat > start-all.sh <<'EOF'
#!/bin/bash

# Start all services in separate terminal windows/tabs
echo "Starting HotGigs.ai services..."

# Start backend
gnome-terminal --tab --title="Backend API" -- bash -c "./start-backend.sh; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && ./start-backend.sh"' 2>/dev/null || \
echo "Please run ./start-backend.sh in a separate terminal"

sleep 3

# Start frontend
gnome-terminal --tab --title="Frontend" -- bash -c "./start-frontend.sh; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && ./start-frontend.sh"' 2>/dev/null || \
echo "Please run ./start-frontend.sh in a separate terminal"

sleep 2

# Start Celery worker
gnome-terminal --tab --title="Celery Worker" -- bash -c "./start-celery.sh; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd \"'$(pwd)'\" && ./start-celery.sh"' 2>/dev/null || \
echo "Please run ./start-celery.sh in a separate terminal"

echo ""
echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
EOF

chmod +x start-backend.sh start-frontend.sh start-celery.sh start-all.sh

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Setup Complete!                               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo ""
echo -e "  ${BLUE}Option 1 - Start all services at once:${NC}"
echo -e "    ./start-all.sh"
echo ""
echo -e "  ${BLUE}Option 2 - Start services individually:${NC}"
echo -e "    Terminal 1: ./start-backend.sh"
echo -e "    Terminal 2: ./start-frontend.sh"
echo -e "    Terminal 3: ./start-celery.sh"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "  API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo -e "  • Add your OPENAI_API_KEY to backend/hotgigs-api/.env"
echo -e "  • Make sure PostgreSQL and Redis are running"
echo -e "  • Check README.md for more information"
echo ""


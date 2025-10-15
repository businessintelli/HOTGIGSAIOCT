#!/bin/bash

# HotGigs.ai Deployment Script
# This script deploys the complete HotGigs.ai platform using Docker Compose

set -e

echo "🚀 HotGigs.ai Deployment Script"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your configuration."
        echo ""
        echo "Important: Update the following in .env:"
        echo "  - SECRET_KEY (generate a secure random string)"
        echo "  - POSTGRES_PASSWORD (set a strong password)"
        echo "  - OPENAI_API_KEY (add your OpenAI API key for AI features)"
        echo ""
        read -p "Press Enter to continue after updating .env file..."
    else
        echo "❌ .env.example not found. Cannot create .env file."
        exit 1
    fi
fi

echo "📦 Building Docker images..."
docker-compose build

echo ""
echo "🗄️  Starting PostgreSQL database..."
docker-compose up -d postgres

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

echo ""
echo "🔧 Initializing database..."
docker-compose run --rm backend python src/db/init_db.py || echo "Database already initialized"

echo ""
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   View status: docker-compose ps"
echo ""
echo "🎉 HotGigs.ai is now running!"


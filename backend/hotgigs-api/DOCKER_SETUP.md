# Docker Setup Instructions

## Prerequisites

Install Docker and Docker Compose on your local machine:

### For Ubuntu/Debian:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### For macOS:
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Docker Compose is included with Docker Desktop
```

### For Windows:
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Docker Compose is included with Docker Desktop
```

## Quick Start

```bash
# Navigate to the backend directory
cd /path/to/hotgigs/backend/hotgigs-api

# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Accessing the API

Once the container is running, access the API at:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Useful Commands

```bash
# Rebuild after code changes
docker-compose up -d --build

# View container status
docker-compose ps

# Execute commands in the container
docker-compose exec api bash

# View logs
docker-compose logs -f api

# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes
docker-compose down -v
```

## Environment Variables

Make sure your `.env` file is properly configured before running Docker Compose.

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, edit `docker-compose.yml` and change:
```yaml
ports:
  - "8001:8000"  # Use port 8001 instead
```

### Permission Denied
If you get permission errors, add your user to the docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```


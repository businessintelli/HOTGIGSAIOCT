# Pre-Installation Checklist - Docker Deployment

**HotGigs.ai Version:** 2.0  
**Last Updated:** October 23, 2025  
**Deployment Type:** Docker Compose

---

## ✅ System Requirements

### Minimum Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4 cores |
| **RAM** | 4 GB | 8 GB |
| **Disk Space** | 10 GB | 20 GB |
| **Network** | Broadband | Broadband |

### Operating System Support

- ✅ **Linux** - Ubuntu 20.04+, Debian 11+, CentOS 8+, Fedora 35+
- ✅ **macOS** - macOS 11 (Big Sur) or later
- ✅ **Windows** - Windows 10 Pro/Enterprise (with WSL2) or Windows 11

---

## 📋 Pre-Installation Checklist

### Step 1: Verify Operating System

**Linux:**
```bash
# Check OS version
cat /etc/os-release

# Expected: Ubuntu 20.04+ or equivalent
```

**macOS:**
```bash
# Check macOS version
sw_vers

# Expected: ProductVersion 11.0 or higher
```

**Windows:**
```powershell
# Check Windows version
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# Expected: Windows 10 Pro/Enterprise or Windows 11
```

**Status:** [ ] Verified

---

### Step 2: Check Hardware Resources

**Check CPU:**
```bash
# Linux
nproc
# Expected: 2 or more

# macOS
sysctl -n hw.ncpu
# Expected: 2 or more

# Windows
wmic cpu get NumberOfCores
# Expected: 2 or more
```

**Check RAM:**
```bash
# Linux
free -h | grep Mem | awk '{print $2}'
# Expected: 4G or more

# macOS
sysctl hw.memsize | awk '{print $2/1024/1024/1024 " GB"}'
# Expected: 4 or more

# Windows
wmic ComputerSystem get TotalPhysicalMemory
# Expected: 4294967296 or more (4GB in bytes)
```

**Check Disk Space:**
```bash
# Linux/macOS
df -h /
# Expected: 10G or more available

# Windows
wmic logicaldisk get size,freespace,caption
# Expected: 10GB or more free
```

**Status:** [ ] CPU Verified [ ] RAM Verified [ ] Disk Verified

---

### Step 3: Install Docker

#### Required Versions

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **Docker** | 20.10.0 | 24.0.0+ | [ ] |
| **Docker Compose** | 2.0.0 | 2.20.0+ | [ ] |

#### Installation Instructions

**Linux (Ubuntu/Debian):**
```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add user to docker group (logout/login required)
sudo usermod -aG docker $USER
```

**macOS:**
```bash
# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Or install via Homebrew:
brew install --cask docker

# Start Docker Desktop application

# Verify installation
docker --version
docker compose version
```

**Windows:**
```powershell
# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Install WSL2 first (if not already installed):
wsl --install

# Install Docker Desktop and enable WSL2 backend

# Verify installation
docker --version
docker compose version
```

#### Verification Commands

```bash
# Check Docker version
docker --version
# Expected output: Docker version 20.10.0 or higher

# Check Docker Compose version
docker compose version
# Expected output: Docker Compose version v2.0.0 or higher

# Test Docker installation
docker run hello-world
# Expected: "Hello from Docker!" message

# Check Docker daemon is running
docker ps
# Expected: Empty list or running containers (no errors)
```

**Status:** [ ] Docker Installed [ ] Docker Compose Installed [ ] Docker Running

---

### Step 4: Verify Network Connectivity

**Check Internet Connection:**
```bash
# Test connectivity
ping -c 4 google.com

# Test Docker Hub access
curl -I https://hub.docker.com
# Expected: HTTP/2 200
```

**Check Required Ports Available:**
```bash
# Linux/macOS
lsof -i :3000 -i :8000 -i :5432 -i :6379

# Windows
netstat -ano | findstr ":3000 :8000 :5432 :6379"

# Expected: No output (ports are free)
```

**Required Ports:**
- **3000** - Frontend application
- **8000** - Backend API
- **5432** - PostgreSQL database
- **6379** - Redis cache

**Status:** [ ] Internet Connected [ ] Ports Available

---

### Step 5: Prepare API Keys

#### OpenAI API Key (Required)

**Obtain API Key:**
1. Visit https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Save securely (you won't see it again)

**Test API Key:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Expected: JSON response with model list
```

**Status:** [ ] API Key Obtained [ ] API Key Tested

#### Google Drive API (Optional)

Only required if you plan to use resume import from Google Drive.

**Obtain Credentials:**
1. Visit https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/api/google-drive/auth/callback`
6. Download credentials JSON

**Status:** [ ] Not Required [ ] Credentials Obtained

---

### Step 6: Download HotGigs.ai

**Clone Repository:**
```bash
# Using HTTPS
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT

# Or download ZIP
curl -L https://github.com/businessintelli/HOTGIGSAIOCT/archive/refs/heads/branch-1.zip -o hotgigs.zip
unzip hotgigs.zip
cd HOTGIGSAIOCT-branch-1
```

**Verify Download:**
```bash
# Check directory structure
ls -la

# Expected files:
# - docker-compose.yml
# - docker-compose.local.yml
# - scripts/
# - frontend/
# - backend/
# - README_DEPLOYMENT.md
```

**Status:** [ ] Repository Cloned [ ] Files Verified

---

### Step 7: Pre-Flight Checks

**Run Pre-Installation Script:**
```bash
# Make script executable
chmod +x scripts/pre-install-check.sh

# Run checks
./scripts/pre-install-check.sh

# Expected: All checks pass
```

**Manual Verification:**
```bash
# Check Docker daemon
docker info | grep "Server Version"

# Check available images
docker images

# Check available disk space for Docker
docker system df

# Check Docker Compose syntax
docker compose -f docker-compose.local.yml config > /dev/null
echo $?
# Expected: 0 (success)
```

**Status:** [ ] All Pre-Flight Checks Passed

---

## 📦 Dependency Versions

### Docker Images

| Component | Base Image | Version |
|-----------|-----------|---------|
| **Backend** | python:3.11-slim | 3.11 |
| **Frontend** | node:18-alpine | 18 |
| **Frontend (Nginx)** | nginx:alpine | latest |
| **PostgreSQL** | postgres:15-alpine | 15 |
| **Redis** | redis:7-alpine | 7 |

### Python Dependencies (Backend)

See `backend/hotgigs-api/requirements.txt` for complete list:

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.104.1 | Web framework |
| uvicorn | 0.24.0 | ASGI server |
| sqlalchemy | 2.0.23 | ORM |
| psycopg2-binary | 2.9.9 | PostgreSQL driver |
| pydantic | 2.5.0 | Data validation |
| python-jose | 3.3.0 | JWT handling |
| passlib | 1.7.4 | Password hashing |
| python-multipart | 0.0.6 | File uploads |
| celery | 5.3.4 | Task queue |
| redis | 5.0.1 | Redis client |
| openai | 1.3.5 | OpenAI API |
| pypdf2 | 3.0.1 | PDF parsing |
| python-docx | 1.1.0 | Word document parsing |

### Node.js Dependencies (Frontend)

See `frontend/hotgigs-frontend/package.json` for complete list:

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | React DOM |
| react-router-dom | 6.20.0 | Routing |
| vite | 5.0.0 | Build tool |
| tailwindcss | 3.3.5 | CSS framework |
| axios | 1.6.2 | HTTP client |
| @tanstack/react-query | 5.8.4 | Data fetching |
| lucide-react | 0.294.0 | Icons |

---

## 🚨 Common Issues and Solutions

### Issue 1: Docker Permission Denied

**Symptom:**
```
Got permission denied while trying to connect to the Docker daemon socket
```

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or:
newgrp docker

# Verify
docker ps
```

### Issue 2: Port Already in Use

**Symptom:**
```
Error: Bind for 0.0.0.0:8000 failed: port is already allocated
```

**Solution:**
```bash
# Find process using port
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Kill process or change port in docker-compose.yml
```

### Issue 3: Insufficient Disk Space

**Symptom:**
```
Error: no space left on device
```

**Solution:**
```bash
# Clean up Docker
docker system prune -a --volumes

# Check space
df -h
```

### Issue 4: WSL2 Not Installed (Windows)

**Symptom:**
```
Docker Desktop requires WSL2
```

**Solution:**
```powershell
# Install WSL2
wsl --install

# Set WSL2 as default
wsl --set-default-version 2

# Restart computer
```

---

## ✅ Final Checklist

Before proceeding with installation:

- [ ] Operating system meets minimum requirements
- [ ] Hardware resources (CPU, RAM, Disk) verified
- [ ] Docker 20.10+ installed and running
- [ ] Docker Compose 2.0+ installed
- [ ] Network connectivity verified
- [ ] Required ports (3000, 8000, 5432, 6379) available
- [ ] OpenAI API key obtained and tested
- [ ] Repository cloned successfully
- [ ] All pre-flight checks passed
- [ ] Reviewed troubleshooting section

**Status:** [ ] Ready to Install

---

## 📝 Installation Command

Once all checks pass, run:

```bash
./scripts/quick-start-docker.sh
```

**Estimated Installation Time:** 5-10 minutes

---

## 📞 Support

If any checks fail:

1. Review the troubleshooting section above
2. Check `DEPLOYMENT_GUIDE_COMPLETE.md`
3. Visit https://github.com/businessintelli/HOTGIGSAIOCT/issues
4. Ensure all prerequisites are met before proceeding

---

**Checklist Version:** 1.0  
**Last Updated:** October 23, 2025  
**Maintained by:** Manus AI


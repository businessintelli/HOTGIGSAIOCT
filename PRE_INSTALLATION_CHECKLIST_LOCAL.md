# Pre-Installation Checklist - Local Development

**HotGigs.ai Version:** 2.0  
**Last Updated:** October 23, 2025  
**Deployment Type:** Local Development

---

## ✅ System Requirements

### Minimum Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 cores | 8 cores |
| **RAM** | 8 GB | 16 GB |
| **Disk Space** | 20 GB | 50 GB |
| **Network** | Broadband | Broadband |

### Operating System Support

- ✅ **Linux** - Ubuntu 20.04+, Debian 11+, CentOS 8+, Fedora 35+
- ✅ **macOS** - macOS 11 (Big Sur) or later
- ✅ **Windows** - Windows 10 or Windows 11

---

## 📋 Pre-Installation Checklist

### Step 1: Verify Operating System

**Linux:**
```bash
cat /etc/os-release
# Expected: Ubuntu 20.04+ or equivalent
```

**macOS:**
```bash
sw_vers
# Expected: ProductVersion 11.0 or higher
```

**Windows:**
```powershell
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
# Expected: Windows 10 or Windows 11
```

**Status:** [ ] Verified

---

### Step 2: Install Python

#### Required Version

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **Python** | 3.8.0 | 3.11.0 | [ ] |
| **pip** | 21.0 | 23.0+ | [ ] |

#### Installation Instructions

**Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt-get update

# Install Python 3.11
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Verify installation
python3.11 --version
pip3 --version
```

**macOS:**
```bash
# Using Homebrew
brew install python@3.11

# Verify installation
python3.11 --version
pip3 --version
```

**Windows:**
```powershell
# Download Python 3.11 from:
# https://www.python.org/downloads/

# During installation:
# - Check "Add Python to PATH"
# - Check "Install pip"

# Verify installation
python --version
pip --version
```

#### Verification Commands

```bash
# Check Python version
python3 --version  # Linux/macOS
python --version   # Windows
# Expected: Python 3.8.0 or higher

# Check pip version
pip3 --version  # Linux/macOS
pip --version   # Windows
# Expected: pip 21.0 or higher

# Test Python installation
python3 -c "print('Python is working')"  # Linux/macOS
python -c "print('Python is working')"   # Windows
# Expected: "Python is working"
```

**Status:** [ ] Python Installed [ ] pip Installed [ ] Python Working

---

### Step 3: Install Node.js and npm

#### Required Version

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **Node.js** | 16.0.0 | 20.0.0+ | [ ] |
| **npm** | 8.0.0 | 10.0.0+ | [ ] |

#### Installation Instructions

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node@20

# Verify installation
node --version
npm --version
```

**Windows:**
```powershell
# Download Node.js from:
# https://nodejs.org/

# Install LTS version (20.x)

# Verify installation
node --version
npm --version
```

#### Verification Commands

```bash
# Check Node.js version
node --version
# Expected: v16.0.0 or higher

# Check npm version
npm --version
# Expected: 8.0.0 or higher

# Test Node.js installation
node -e "console.log('Node.js is working')"
# Expected: "Node.js is working"
```

**Status:** [ ] Node.js Installed [ ] npm Installed [ ] Node.js Working

---

### Step 4: Install PostgreSQL

#### Required Version

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **PostgreSQL** | 13.0 | 15.0+ | [ ] |

#### Installation Instructions

**Linux (Ubuntu/Debian):**
```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update and install
sudo apt-get update
sudo apt-get install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Verify installation
psql --version
```

**Windows:**
```powershell
# Download PostgreSQL from:
# https://www.postgresql.org/download/windows/

# Install PostgreSQL 15
# - Remember the password you set for postgres user
# - Default port: 5432

# Verify installation
psql --version
```

#### Verification Commands

```bash
# Check PostgreSQL version
psql --version
# Expected: psql (PostgreSQL) 13.0 or higher

# Test PostgreSQL connection
sudo -u postgres psql -c "SELECT version();"  # Linux
psql -U postgres -c "SELECT version();"        # macOS/Windows
# Expected: PostgreSQL version information

# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
# Windows: Check Services app
```

**Status:** [ ] PostgreSQL Installed [ ] PostgreSQL Running [ ] Connection Tested

---

### Step 5: Install Redis

#### Required Version

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **Redis** | 6.0.0 | 7.0.0+ | [ ] |

#### Installation Instructions

**Linux (Ubuntu/Debian):**
```bash
# Install Redis
sudo apt-get update
sudo apt-get install -y redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify installation
redis-server --version
```

**macOS:**
```bash
# Using Homebrew
brew install redis

# Start Redis
brew services start redis

# Verify installation
redis-server --version
```

**Windows:**
```powershell
# Download Redis from:
# https://github.com/microsoftarchive/redis/releases

# Or use Windows Subsystem for Linux (WSL)
wsl --install
# Then install Redis in WSL

# Verify installation
redis-server --version
```

#### Verification Commands

```bash
# Check Redis version
redis-server --version
# Expected: Redis server v=6.0.0 or higher

# Test Redis connection
redis-cli ping
# Expected: PONG

# Check Redis is running
sudo systemctl status redis  # Linux
brew services list | grep redis  # macOS
```

**Status:** [ ] Redis Installed [ ] Redis Running [ ] Connection Tested

---

### Step 6: Install Git

#### Required Version

| Software | Minimum Version | Recommended Version | Verified |
|----------|----------------|---------------------|----------|
| **Git** | 2.20.0 | 2.40.0+ | [ ] |

#### Installation Instructions

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y git

# Verify installation
git --version
```

**macOS:**
```bash
# Git comes with Xcode Command Line Tools
xcode-select --install

# Or using Homebrew
brew install git

# Verify installation
git --version
```

**Windows:**
```powershell
# Download Git from:
# https://git-scm.com/download/win

# Install with default settings

# Verify installation
git --version
```

#### Verification Commands

```bash
# Check Git version
git --version
# Expected: git version 2.20.0 or higher
```

**Status:** [ ] Git Installed

---

### Step 7: Verify Network and Ports

**Check Internet Connection:**
```bash
# Test connectivity
ping -c 4 google.com

# Test GitHub access
curl -I https://github.com
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
- **3000** - Frontend development server
- **8000** - Backend API server
- **5432** - PostgreSQL database
- **6379** - Redis server

**Status:** [ ] Internet Connected [ ] Ports Available

---

### Step 8: Prepare API Keys

#### OpenAI API Key (Required)

**Obtain API Key:**
1. Visit https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Save securely

**Test API Key:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Expected: JSON response with model list
```

**Status:** [ ] API Key Obtained [ ] API Key Tested

---

### Step 9: Download HotGigs.ai

**Clone Repository:**
```bash
# Using HTTPS
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT

# Verify download
ls -la
```

**Status:** [ ] Repository Cloned

---

### Step 10: Verify System Dependencies

**Linux Additional Dependencies:**
```bash
# Install build essentials
sudo apt-get install -y build-essential libpq-dev python3-dev

# Install poppler (for PDF processing)
sudo apt-get install -y poppler-utils

# Install libmagic (for file type detection)
sudo apt-get install -y libmagic1
```

**macOS Additional Dependencies:**
```bash
# Install build tools
xcode-select --install

# Install poppler
brew install poppler

# Install libmagic
brew install libmagic
```

**Windows Additional Dependencies:**
```powershell
# Install Microsoft C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Install poppler (for PDF processing)
# Download from: https://github.com/oschwartz10612/poppler-windows/releases
# Add to PATH
```

**Status:** [ ] Build Tools Installed [ ] Additional Dependencies Installed

---

## 📦 Dependency Versions

### Python Backend Dependencies

Complete list in `backend/hotgigs-api/requirements.txt`:

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.104.1 | Web framework |
| uvicorn[standard] | 0.24.0 | ASGI server |
| sqlalchemy | 2.0.23 | ORM |
| psycopg2-binary | 2.9.9 | PostgreSQL driver |
| pydantic | 2.5.0 | Data validation |
| pydantic-settings | 2.1.0 | Settings management |
| python-jose[cryptography] | 3.3.0 | JWT handling |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| python-multipart | 0.0.6 | File uploads |
| celery | 5.3.4 | Task queue |
| redis | 5.0.1 | Redis client |
| openai | 1.3.5 | OpenAI API client |
| pypdf2 | 3.0.1 | PDF parsing |
| python-docx | 1.1.0 | Word document parsing |
| python-magic | 0.4.27 | File type detection |
| aiofiles | 23.2.1 | Async file operations |
| httpx | 0.25.2 | HTTP client |

### Node.js Frontend Dependencies

Complete list in `frontend/hotgigs-frontend/package.json`:

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | React DOM |
| react-router-dom | ^6.20.0 | Routing |
| vite | ^5.0.0 | Build tool |
| tailwindcss | ^3.3.5 | CSS framework |
| postcss | ^8.4.32 | CSS processing |
| autoprefixer | ^10.4.16 | CSS vendor prefixes |
| axios | ^1.6.2 | HTTP client |
| @tanstack/react-query | ^5.8.4 | Data fetching |
| lucide-react | ^0.294.0 | Icons |
| clsx | ^2.0.0 | Class name utility |
| date-fns | ^2.30.0 | Date utilities |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| eslint | ^8.55.0 | JavaScript linting |
| prettier | ^3.1.0 | Code formatting |
| @types/react | ^18.2.43 | React TypeScript types |
| @types/react-dom | ^18.2.17 | React DOM types |

---

## 🚨 Common Issues and Solutions

### Issue 1: Python Version Conflict

**Symptom:**
```
python: command not found
```

**Solution:**
```bash
# Use python3 explicitly
python3 --version

# Or create alias
echo "alias python=python3" >> ~/.bashrc
source ~/.bashrc
```

### Issue 2: PostgreSQL Connection Failed

**Symptom:**
```
psql: error: connection to server failed
```

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS
```

### Issue 3: Redis Connection Refused

**Symptom:**
```
Error: Redis connection refused
```

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# Start Redis
sudo systemctl start redis-server  # Linux
brew services start redis  # macOS
```

### Issue 4: Port Already in Use

**Symptom:**
```
Error: Address already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### Issue 5: Permission Denied

**Symptom:**
```
Permission denied: '/usr/local/...'
```

**Solution:**
```bash
# Use virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Or use --user flag
pip install --user package_name
```

---

## ✅ Final Checklist

Before proceeding with installation:

- [ ] Python 3.8+ installed and working
- [ ] pip installed and working
- [ ] Node.js 16+ installed and working
- [ ] npm installed and working
- [ ] PostgreSQL 13+ installed and running
- [ ] Redis 6+ installed and running
- [ ] Git installed
- [ ] Build tools installed
- [ ] Network connectivity verified
- [ ] Required ports available
- [ ] OpenAI API key obtained and tested
- [ ] Repository cloned successfully
- [ ] System dependencies installed

**Status:** [ ] Ready to Install

---

## 📝 Installation Command

Once all checks pass, run:

**Linux/macOS:**
```bash
./scripts/setup-local.sh
```

**Windows:**
```batch
scripts\setup-local.bat
```

**Estimated Installation Time:** 15-20 minutes

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


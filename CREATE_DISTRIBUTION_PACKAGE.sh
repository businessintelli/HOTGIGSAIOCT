#!/bin/bash

# HotGigs.ai - Create Distribution Package
# This script creates a complete distribution package with all dependencies

set -e

echo "========================================="
echo "HotGigs.ai - Distribution Package Creator"
echo "========================================="
echo ""

# Package information
PACKAGE_NAME="hotgigs-ai-v2.0-complete"
PACKAGE_DIR="/tmp/${PACKAGE_NAME}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Creating distribution package: ${PACKAGE_NAME}"
echo "Timestamp: ${TIMESTAMP}"
echo ""

# Create package directory
mkdir -p "${PACKAGE_DIR}"

# Copy application files
echo "Copying application files..."
rsync -av --exclude='.git' \
          --exclude='node_modules' \
          --exclude='venv' \
          --exclude='__pycache__' \
          --exclude='*.pyc' \
          --exclude='.env' \
          --exclude='dist' \
          --exclude='build' \
          . "${PACKAGE_DIR}/"

# Create version manifest
echo "Creating version manifest..."
cat > "${PACKAGE_DIR}/VERSION_MANIFEST.txt" << 'VERSION_EOF'
HotGigs.ai - Complete Distribution Package
==========================================

Package Version: 2.0
Build Date: $(date)
Build ID: ${TIMESTAMP}

INCLUDED FILES:
--------------
✓ Source code (backend + frontend)
✓ Docker configurations (3 variants)
✓ AWS deployment scripts and templates
✓ Local development setup scripts
✓ Pre-installation checklists (3 types)
✓ Comprehensive documentation (100+ pages)
✓ Dependency version manifests
✓ Testing checklists

DEPLOYMENT OPTIONS:
------------------
1. Docker Compose - Quick start (5 minutes)
2. Local Development - Full development environment (15 minutes)
3. AWS Production - Enterprise deployment (30 minutes)

SYSTEM REQUIREMENTS:
-------------------
See PRE_INSTALLATION_CHECKLIST_*.md files for detailed requirements

QUICK START:
-----------
1. Extract this package
2. Read README_DEPLOYMENT.md
3. Choose deployment option
4. Run pre-installation check
5. Follow deployment guide

DOCUMENTATION:
-------------
- README_DEPLOYMENT.md - Main deployment guide
- DEPLOYMENT_GUIDE_COMPLETE.md - Comprehensive guide
- aws/AWS_DEPLOYMENT_GUIDE.md - AWS-specific guide
- DEPENDENCY_VERSIONS.md - All dependency versions
- PRE_INSTALLATION_CHECKLIST_*.md - Pre-installation checks

SUPPORT:
-------
GitHub: https://github.com/businessintelli/HOTGIGSAIOCT
Issues: https://github.com/businessintelli/HOTGIGSAIOCT/issues

VERSION_EOF

# Create README for package
cat > "${PACKAGE_DIR}/START_HERE.md" << 'START_EOF'
# 🚀 HotGigs.ai - Start Here

Welcome to HotGigs.ai v2.0 Complete Distribution Package!

## 📦 What's in This Package?

This package contains everything you need to deploy HotGigs.ai:

- ✅ Complete source code
- ✅ Docker deployment configurations
- ✅ AWS production deployment templates
- ✅ Local development setup scripts
- ✅ 100+ pages of documentation
- ✅ Pre-installation checklists
- ✅ Dependency version manifests

## 🎯 Quick Start (Choose One)

### Option 1: Docker (Fastest - 5 minutes)

```bash
# 1. Run pre-installation check
./scripts/pre-install-check-docker.sh

# 2. Start with Docker
./scripts/quick-start-docker.sh

# 3. Access application
open http://localhost:3000
```

### Option 2: Local Development (15 minutes)

```bash
# 1. Read checklist
cat PRE_INSTALLATION_CHECKLIST_LOCAL.md

# 2. Run setup
./scripts/setup-local.sh

# 3. Start services
./start-all.sh
```

### Option 3: AWS Production (30 minutes)

```bash
# 1. Read checklist
cat PRE_INSTALLATION_CHECKLIST_AWS.md

# 2. Setup infrastructure
cd aws && ./setup-infrastructure.sh

# 3. Deploy application
./deploy-to-aws.sh
```

## 📚 Documentation

Start with these files in order:

1. **START_HERE.md** (this file) - Quick overview
2. **README_DEPLOYMENT.md** - Main deployment guide
3. **PRE_INSTALLATION_CHECKLIST_*.md** - System requirements
4. **DEPLOYMENT_GUIDE_COMPLETE.md** - Detailed instructions
5. **DEPENDENCY_VERSIONS.md** - All version information

## ⚙️ System Requirements

### Docker Deployment
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM, 10GB disk

### Local Development
- Python 3.8+, Node.js 16+
- PostgreSQL 13+, Redis 6+
- 8GB RAM, 20GB disk

### AWS Deployment
- AWS account with billing enabled
- AWS CLI 2.0+
- $100-150/month budget

## 🔑 Required API Keys

- **OpenAI API Key** (required) - Get from https://platform.openai.com
- **AWS Credentials** (for AWS deployment)
- **Google OAuth** (optional - for Google Drive integration)

## 📞 Support

- **Documentation:** See README_DEPLOYMENT.md
- **GitHub:** https://github.com/businessintelli/HOTGIGSAIOCT
- **Issues:** https://github.com/businessintelli/HOTGIGSAIOCT/issues

## ✅ Next Steps

1. Choose your deployment option above
2. Read the corresponding pre-installation checklist
3. Run the pre-installation check script
4. Follow the deployment guide
5. Access your application!

---

**Package Version:** 2.0  
**Build Date:** $(date)  
**Maintained by:** Manus AI
START_EOF

# Create checksums
echo "Generating checksums..."
cd "${PACKAGE_DIR}"
find . -type f -exec md5sum {} \; > CHECKSUMS.md5 2>/dev/null || \
find . -type f -exec md5 {} \; > CHECKSUMS.md5

# Create package archive
echo ""
echo "Creating archive..."
cd /tmp
tar -czf "${PACKAGE_NAME}-${TIMESTAMP}.tar.gz" "${PACKAGE_NAME}"

# Create zip for Windows users
zip -r -q "${PACKAGE_NAME}-${TIMESTAMP}.zip" "${PACKAGE_NAME}"

# Calculate sizes
TAR_SIZE=$(du -h "${PACKAGE_NAME}-${TIMESTAMP}.tar.gz" | cut -f1)
ZIP_SIZE=$(du -h "${PACKAGE_NAME}-${TIMESTAMP}.zip" | cut -f1)

echo ""
echo "========================================="
echo "Distribution Package Created Successfully!"
echo "========================================="
echo ""
echo "Package Location:"
echo "  Directory: ${PACKAGE_DIR}"
echo "  Tar.gz: /tmp/${PACKAGE_NAME}-${TIMESTAMP}.tar.gz (${TAR_SIZE})"
echo "  Zip: /tmp/${PACKAGE_NAME}-${TIMESTAMP}.zip (${ZIP_SIZE})"
echo ""
echo "Package Contents:"
echo "  - Source code"
echo "  - Docker configurations"
echo "  - AWS deployment templates"
echo "  - Setup scripts"
echo "  - Documentation (100+ pages)"
echo "  - Pre-installation checklists"
echo "  - Dependency manifests"
echo ""
echo "To extract:"
echo "  tar -xzf ${PACKAGE_NAME}-${TIMESTAMP}.tar.gz"
echo "  or"
echo "  unzip ${PACKAGE_NAME}-${TIMESTAMP}.zip"
echo ""
echo "Then read: START_HERE.md"
echo "========================================="


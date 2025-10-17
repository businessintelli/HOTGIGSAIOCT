# HotGigs.ai - Docker Deployment Guide

**Date:** October 17, 2025  
**Status:** ✅ **Ready for Deployment**

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying HotGigs.ai using Docker and Docker Compose. This approach is ideal for self-hosting on a Virtual Private Server (VPS) or any machine with Docker installed.

---

## 📋 Prerequisites

Before you begin, ensure you have the following:

-   [ ] **A server or local machine** with Docker and Docker Compose installed.
-   [ ] **Git** installed on the server.
-   [ ] **A custom domain name** (optional but recommended).
-   [ ] **A reverse proxy** like Nginx (optional but recommended for SSL).
-   [ ] **Credentials** for Supabase (database) and Resend (email).

---

## 🚀 Deployment Steps

### Step 1: Clone the Repository

Connect to your server via SSH and clone the repository:

```bash
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT
git checkout branch-1
```

### Step 2: Configure Environment Variables

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Now, edit the `.env` file and fill in your actual values:

```bash
nano .env
```

**Important:**
-   Set a strong `POSTGRES_PASSWORD` and `SECRET_KEY`.
-   Fill in your `SUPABASE_URL`, `SUPABASE_KEY`, and `RESEND_API_KEY`.
-   Update `CORS_ORIGINS` to include your domain name (e.g., `https://hotgigs.ai`).
-   Set `VITE_API_URL` to your backend's public URL (e.g., `https://api.hotgigs.ai`).

### Step 3: Run the Deployment Script

I have created a deployment script that automates the entire process. Make it executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
1.  Check for Docker and Docker Compose.
2.  Pull the latest code from GitHub.
3.  Build the Docker images.
4.  Start all services (frontend, backend, database).
5.  Run database migrations.

### Step 4: Configure a Reverse Proxy (Recommended)

For a production deployment, you should use a reverse proxy like Nginx to:
-   Handle SSL/TLS certificates (for HTTPS).
-   Route traffic to the correct containers.
-   Improve performance and security.

**Example Nginx Configuration:**

Create a new Nginx configuration file (e.g., `/etc/nginx/sites-available/hotgigs.ai`):

```nginx
server {
    listen 80;
    server_name hotgigs.ai;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name hotgigs.ai;

    # SSL configuration
    ssl_certificate /path/to/your/fullchain.pem;
    ssl_certificate_key /path/to/your/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80; # Assumes frontend is on port 80
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000; # Assumes backend is on port 8000
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable the site and restart Nginx:**

```bash
ln -s /etc/nginx/sites-available/hotgigs.ai /etc/nginx/sites-enabled/
systemctl restart nginx
```

---

## ✅ Deployment Complete!

Your HotGigs.ai application is now running in Docker!

-   **Frontend:** `http://<your-server-ip>` or `https://hotgigs.ai`
-   **Backend API:** `http://<your-server-ip>:8000` or `https://api.hotgigs.ai`
-   **Admin Login:** `http://<your-server-ip>/admin/login` or `https://hotgigs.ai/admin/login`

### Useful Docker Commands

-   **View logs:** `docker-compose -f docker-compose.prod.yml logs -f`
-   **Stop services:** `docker-compose -f docker-compose.prod.yml down`
-   **Restart services:** `docker-compose -f docker-compose.prod.yml restart`
-   **View status:** `docker-compose -f docker-compose.prod.yml ps`

---

## 💡 Next Steps

1.  **Create an admin user:** The default `admin/admin123` credentials will work once the database is initialized. Change the password immediately!
2.  **Set up backups:** Regularly back up your PostgreSQL database volume.
3.  **Monitor your application:** Keep an eye on logs and server resources.

Congratulations on your self-hosted HotGigs.ai deployment!


# HotGigs.ai - Hybrid Deployment Guide (Vercel + Render)

**Date:** October 17, 2025  
**Status:** ✅ **Recommended Approach**

---

## 🎯 Overview

This guide provides step-by-step instructions for deploying HotGigs.ai using a hybrid approach:

-   **Frontend (React):** Deployed to **Vercel**
-   **Backend (FastAPI):** Deployed to **Render.com**

This is the **recommended deployment method** as it leverages the strengths of each platform, providing a high-performance, scalable, and cost-effective solution.

---

## 📋 Prerequisites

Before you begin, ensure you have the following:

-   [ ] **GitHub Repository:** Access to `businessintelli/HOTGIGSAIOCT`
-   [ ] **Vercel Account:** [Create a free account](https://vercel.com/signup)
-   [ ] **Render.com Account:** [Create a free account](https://render.com/register)
-   [ ] **Supabase Account:** [Create a free account](https://supabase.com/dashboard) (for database)
-   [ ] **Resend API Key:** `re_bxP3yrpH_Pt8Rf55viS8R2z7Wuuhs9VwG`
-   [ ] **Domain Name (Optional):** A custom domain name (e.g., `hotgigs.ai`)

---

## 🚀 Part 1: Deploying the Backend to Render.com

First, we will deploy the FastAPI backend to Render.com. This will give us a live API endpoint that the frontend can connect to.

### Step 1: Create a New Web Service on Render

1.  **Go to your Render Dashboard:** [dashboard.render.com](https://dashboard.render.com)
2.  Click **New +** and select **Web Service**.
3.  **Connect your GitHub account** and select the `businessintelli/HOTGIGSAIOCT` repository.

### Step 2: Configure the Web Service

Fill in the following details:

-   **Name:** `hotgigs-api` (or your preferred name)
-   **Region:** Choose a region close to you (e.g., Ohio, USA)
-   **Branch:** `branch-1`
-   **Root Directory:** `backend/hotgigs-api`
-   **Runtime:** `Python 3`
-   **Build Command:** `pip install -r requirements.txt`
-   **Start Command:** `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
-   **Instance Type:** `Free`

### Step 3: Add Environment Variables

This is the most critical step. Go to the **Environment** tab and add the following environment variables:

-   **`DATABASE_URL`**: Your Supabase database connection string (see Supabase docs)
-   **`SUPABASE_URL`**: Your Supabase project URL
-   **`SUPABASE_KEY`**: Your Supabase anon key
-   **`RESEND_API_KEY`**: `re_bxP3yrpH_Pt8Rf55viS8R2z7Wuuhs9VwG`
-   **`SENDER_EMAIL`**: `noreply@hotgigs.com`
-   **`SECRET_KEY`**: A long, random string for JWT (e.g., `openssl rand -hex 32`)
-   **`ALGORITHM`**: `HS256`
-   **`ACCESS_TOKEN_EXPIRE_MINUTES`**: `30`
-   **`CORS_ORIGINS`**: `http://localhost:3000,http://localhost:5173` (we will add the Vercel URL later)
-   **`DEBUG`**: `false`

### Step 4: Deploy

Click **Create Web Service**. Render will now build and deploy your backend. This may take a few minutes.

Once deployed, you will get a URL like `https://hotgigs-api.onrender.com`. **Copy this URL** - you will need it for the frontend deployment.

### Step 5: Run Database Migrations

1.  Go to your deployed service on Render.
2.  Click the **Shell** tab.
3.  Run the following command:
    ```bash
    python migrations/run_all_migrations.py
    ```

This will create all the necessary tables in your Supabase database.

---

## 🚀 Part 2: Deploying the Frontend to Vercel

Now that the backend is live, we can deploy the React frontend to Vercel.

### Step 1: Create a New Project on Vercel

1.  **Go to your Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
2.  Click **Add New...** and select **Project**.
3.  **Connect your GitHub account** and select the `businessintelli/HOTGIGSAIOCT` repository.

### Step 2: Configure the Project

Fill in the following details:

-   **Project Name:** `hotgigs-frontend` (or your preferred name)
-   **Framework Preset:** `Vite` (Vercel should detect this automatically)
-   **Root Directory:** `hotgigs-frontend`

### Step 3: Add Environment Variables

Expand the **Environment Variables** section and add the following:

-   **`VITE_API_URL`**: The URL of your deployed Render backend (e.g., `https://hotgigs-api.onrender.com`)

### Step 4: Deploy

Click **Deploy**. Vercel will now build and deploy your frontend. This is usually very fast (under a minute).

Once deployed, you will get a URL like `https://hotgigs-frontend.vercel.app`. This is your live application!

---

## 🚀 Part 3: Final Configuration

### Step 1: Update Backend CORS

1.  Go back to your Render.com dashboard and navigate to your `hotgigs-api` service.
2.  Go to the **Environment** tab.
3.  Update the `CORS_ORIGINS` environment variable to include your Vercel frontend URL:
    ```
    http://localhost:3000,http://localhost:5173,https://hotgigs-frontend.vercel.app
    ```
4.  Save the changes. Render will automatically restart your backend with the new settings.

### Step 2: Configure Custom Domain (Optional)

Both Vercel and Render make it easy to add a custom domain. Follow their documentation to point your domain (e.g., `hotgigs.ai`) to your deployed applications.

-   **Vercel:** Point your main domain (`hotgigs.ai`) to the frontend project.
-   **Render:** Point a subdomain (`api.hotgigs.ai`) to the backend project.

---

## ✅ Deployment Complete!

Congratulations! You have successfully deployed HotGigs.ai to production.

-   **Frontend:** `https://hotgigs-frontend.vercel.app`
-   **Backend:** `https://hotgigs-api.onrender.com`
-   **Admin Login:** `https://hotgigs-frontend.vercel.app/admin/login`

Your application is now live, scalable, and ready for users!


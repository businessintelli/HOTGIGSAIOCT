# HotGigs.ai Production Deployment Checklist

## 🚀 Deployment to Render.com - Step by Step Guide

This guide will walk you through deploying both the backend and frontend to production on Render.com.

---

## Prerequisites

Before starting, make sure you have:

- [ ] Render.com account (free tier is fine to start)
- [ ] GitHub repository access (https://github.com/businessintelli/HOTGIGSAIOCT)
- [ ] Supabase credentials
- [ ] Resend API key
- [ ] Domain name (optional, can use Render.com subdomain)

---

## Phase 1: Deploy Backend API

### Step 1: Create Web Service on Render.com

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** if you haven't connected GitHub
4. Select repository: **`businessintelli/HOTGIGSAIOCT`**
5. Click **"Connect"**

### Step 2: Configure Backend Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `hotgigs-api` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `branch-1`
- **Root Directory:** `backend/hotgigs-api`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Select **"Free"** (or paid plan if you prefer)

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add the following:

| Key | Value | Notes |
|-----|-------|-------|
| `SUPABASE_URL` | `https://wnvdxdgwcaebzwdgxvzb.supabase.co` | Your Supabase project URL |
| `SUPABASE_KEY` | `[YOUR_SUPABASE_KEY]` | From your Supabase dashboard |
| `RESEND_API_KEY` | `re_bxP3yrpH_Pt8Rf55viS8R2z7Wuuhs9VwG` | Your Resend API key |
| `RESEND_FROM_EMAIL` | `noreply@hotgigs.com` | Verified sender email |
| `SECRET_KEY` | `[GENERATE_NEW_SECRET]` | Generate a secure random string |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiration time |
| `ENVIRONMENT` | `production` | Environment name |
| `CORS_ORIGINS` | `https://hotgigs-frontend.onrender.com` | Update after frontend deployment |

**To generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://hotgigs-api.onrender.com` (or similar)
4. Test the API: Visit `https://hotgigs-api.onrender.com/docs`

---

## Phase 2: Deploy Frontend

### Step 1: Update Frontend Environment Variables

Before deploying the frontend, we need to update the `.env` file with the production backend URL.

**I'll do this for you - just provide your backend URL from Step 4 above.**

### Step 2: Build Frontend for Production

The frontend needs to be built with the production backend URL.

**Options:**

**Option A: Deploy to Render.com (Static Site)**

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Static Site"**
3. Select repository: **`businessintelli/HOTGIGSAIOCT`**
4. Configure:
   - **Name:** `hotgigs-frontend`
   - **Branch:** `branch-1`
   - **Root Directory:** `hotgigs-frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://hotgigs-api.onrender.com` (your backend URL)
6. Click **"Create Static Site"**

**Option B: Deploy to Vercel (Recommended for React)**

1. Go to https://vercel.com/new
2. Import `businessintelli/HOTGIGSAIOCT`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `hotgigs-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://hotgigs-api.onrender.com`
5. Click **"Deploy"**

**Option C: Deploy to Netlify**

1. Go to https://app.netlify.com/start
2. Connect to GitHub and select repository
3. Configure:
   - **Base directory:** `hotgigs-frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `hotgigs-frontend/dist`
4. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://hotgigs-api.onrender.com`
5. Click **"Deploy site"**

### Step 3: Update CORS Origins

After frontend is deployed:

1. Go back to Render.com backend service
2. Go to **"Environment"** tab
3. Update `CORS_ORIGINS` with your frontend URL:
   - Render: `https://hotgigs-frontend.onrender.com`
   - Vercel: `https://hotgigs.vercel.app`
   - Netlify: `https://hotgigs.netlify.app`
4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## Phase 3: Database Setup

### Step 1: Run Migrations

You need to run the database migrations to create all necessary tables.

**Option A: Run from Local Machine**

```bash
# 1. Clone repository
git clone https://github.com/businessintelli/HOTGIGSAIOCT.git
cd HOTGIGSAIOCT/backend/hotgigs-api

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variables
export SUPABASE_URL="https://wnvdxdgwcaebzwdgxvzb.supabase.co"
export SUPABASE_KEY="your_supabase_key"

# 4. Run migrations
python migrations/run_all_migrations.py
```

**Option B: Run from Render.com Shell**

1. Go to your backend service on Render.com
2. Click **"Shell"** tab
3. Run:
```bash
cd /opt/render/project/src
python migrations/run_all_migrations.py
```

### Step 2: Create Admin User

After migrations, create your first admin user:

```python
# Create a Python script or use Supabase SQL editor
INSERT INTO admin_users (username, email, password_hash, full_name, is_active, created_at)
VALUES (
    'admin',
    'admin@hotgigs.ai',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqCZqIhz.aGe', -- password: admin123
    'System Administrator',
    true,
    NOW()
);
```

**⚠️ IMPORTANT:** Change the password immediately after first login!

---

## Phase 4: Configure Resend Webhook

### Step 1: Set Up Webhook in Resend

1. Go to https://resend.com/webhooks
2. Click **"Add Webhook"**
3. Configure:
   - **Endpoint URL:** `https://hotgigs-api.onrender.com/api/webhooks/resend`
   - **Events:** Select all email events
   - **Status:** Active
4. Click **"Create Webhook"**
5. Copy the **Webhook Signing Secret**

### Step 2: Add Webhook Secret to Backend

1. Go to Render.com backend service
2. Go to **"Environment"** tab
3. Add new environment variable:
   - **Key:** `RESEND_WEBHOOK_SECRET`
   - **Value:** [paste signing secret from Resend]
4. Click **"Save Changes"**

---

## Phase 5: Domain Configuration (Optional)

### If you want to use your own domain (hotgigs.ai):

**Backend:**
1. In Render.com backend service, go to **"Settings"** → **"Custom Domain"**
2. Add: `api.hotgigs.ai`
3. Add the provided CNAME record to your DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: `hotgigs-api.onrender.com`

**Frontend (Vercel example):**
1. In Vercel project settings, go to **"Domains"**
2. Add: `hotgigs.ai` and `www.hotgigs.ai`
3. Add the provided DNS records to your domain

**Update Environment Variables:**
- Backend `CORS_ORIGINS`: `https://hotgigs.ai,https://www.hotgigs.ai`
- Frontend `VITE_API_URL`: `https://api.hotgigs.ai`

---

## Phase 6: Testing & Verification

### Backend Tests

- [ ] Visit `https://hotgigs-api.onrender.com/` - Should show welcome message
- [ ] Visit `https://hotgigs-api.onrender.com/docs` - Should show Swagger UI
- [ ] Test health endpoint: `https://hotgigs-api.onrender.com/health`

### Frontend Tests

- [ ] Visit homepage - Should load without errors
- [ ] Visit `/admin/login` - Should show admin login page
- [ ] Try logging in with admin credentials
- [ ] Check browser console - No CORS errors
- [ ] Test navigation between pages

### Email Tests

- [ ] Send test email via API
- [ ] Check Resend dashboard for delivery
- [ ] Verify webhook events are being received

### Admin Dashboard Tests

- [ ] Login to admin dashboard
- [ ] View email templates
- [ ] Check email logs
- [ ] Verify system health page
- [ ] Test configuration management

---

## Phase 7: Security Hardening

### Immediate Actions

- [ ] Change default admin password
- [ ] Rotate SECRET_KEY if using default
- [ ] Review and restrict CORS origins
- [ ] Enable HTTPS only (should be automatic on Render/Vercel)
- [ ] Set up monitoring and alerts

### Recommended

- [ ] Enable 2FA for admin accounts
- [ ] Set up rate limiting
- [ ] Configure backup strategy for database
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring

---

## Troubleshooting

### Backend won't start
- Check logs in Render.com dashboard
- Verify all environment variables are set
- Check Python version compatibility

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS_ORIGINS includes frontend URL
- Check browser console for errors

### Database connection fails
- Verify Supabase credentials
- Check if IP is whitelisted in Supabase
- Test connection from Render shell

### Emails not sending
- Verify Resend API key is correct
- Check sender email is verified in Resend
- Check email logs in admin dashboard

---

## Cost Estimate

### Free Tier (Getting Started)

- **Render.com Backend:** Free (750 hours/month)
- **Vercel Frontend:** Free (100GB bandwidth)
- **Supabase:** Free (500MB database, 2GB bandwidth)
- **Resend:** Free (3,000 emails/month)

**Total:** $0/month

### Production Tier (Recommended)

- **Render.com Backend:** $7/month (Starter plan)
- **Vercel Frontend:** $20/month (Pro plan)
- **Supabase:** $25/month (Pro plan)
- **Resend:** $20/month (50,000 emails)

**Total:** $72/month

---

## Support & Next Steps

### After Deployment

1. Monitor application performance
2. Set up analytics (Google Analytics, etc.)
3. Configure SEO settings
4. Set up automated backups
5. Plan for scaling

### Need Help?

- **Render.com Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs

---

## Deployment Status Checklist

Use this to track your deployment progress:

### Backend
- [ ] Backend service created on Render.com
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] API accessible at production URL
- [ ] Swagger UI working

### Frontend
- [ ] Frontend deployed (Render/Vercel/Netlify)
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Frontend accessible at production URL
- [ ] Can connect to backend API

### Database
- [ ] Migrations run successfully
- [ ] Admin user created
- [ ] Database tables created
- [ ] Can connect from backend

### Email
- [ ] Resend webhook configured
- [ ] Test email sent successfully
- [ ] Webhook events received

### Domain (Optional)
- [ ] Custom domain configured
- [ ] DNS records added
- [ ] SSL certificate active

### Testing
- [ ] All pages load correctly
- [ ] Admin login works
- [ ] Email sending works
- [ ] No console errors
- [ ] Mobile responsive

---

**Ready to deploy? Let's start with Phase 1: Backend Deployment!**

I'll guide you through each step. Just let me know when you're ready to begin!


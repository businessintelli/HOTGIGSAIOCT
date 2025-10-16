# Render.com Deployment - Step-by-Step Guide

**Date:** October 16, 2025  
**Project:** HotGigs.ai Backend API

---

## Step 1: Create New Web Service

1. Go to https://render.com/dashboard
2. Click the **"New +"** button (top right)
3. Select **"Web Service"** from the dropdown menu

---

## Step 2: Connect GitHub Repository

### If First Time Connecting GitHub:
1. Click **"Connect GitHub"**
2. Authorize Render to access your GitHub account
3. Select **"All repositories"** or **"Only select repositories"**
4. Choose `businessintelli/HOTGIGSAIOCT`

### If Already Connected:
1. You'll see a list of your repositories
2. Find and click on `businessintelli/HOTGIGSAIOCT`
3. Click **"Connect"**

---

## Step 3: Configure Build Settings

You'll see a form with several fields. Fill them in as follows:

### Basic Information

**Field: Name**
- Location: Top of the form
- Value: `hotgigs-api`
- Description: This will be your service name

**Field: Region**
- Location: Below Name
- Value: `Oregon (US West)` (or choose closest to your users)
- Options: Oregon, Ohio, Frankfurt, Singapore

**Field: Branch**
- Location: Below Region
- Value: `branch-1`
- Description: The Git branch to deploy from

**Field: Root Directory**
- Location: Below Branch
- Value: `backend/hotgigs-api`
- ⚠️ **IMPORTANT:** This tells Render where your backend code is located

### Build & Deploy Settings

**Field: Runtime**
- Location: Middle section
- Value: `Python 3`
- Options: Python 3, Node, Docker, etc.

**Field: Build Command** ⭐
- Location: Below Runtime
- **Enter exactly:** `pip install -r requirements.txt`
- Description: Command to install dependencies

**Field: Start Command** ⭐
- Location: Below Build Command
- **Enter exactly:** `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- Description: Command to start your application
- ⚠️ **Note:** `$PORT` is automatically provided by Render

### Advanced Settings (Optional)

**Field: Auto-Deploy**
- Location: Below Start Command
- Value: `Yes` (recommended)
- Description: Automatically deploy when you push to GitHub

**Field: Health Check Path**
- Location: Below Auto-Deploy
- Value: `/`
- Description: Render will ping this endpoint to check if your app is running

---

## Step 4: Select Plan

**Field: Instance Type**
- Location: Bottom section
- Options:
  - **Free** - $0/month (spins down after 15 min inactivity)
  - **Starter** - $7/month (always on, better performance)
  - **Standard** - $25/month (production ready)

**Recommendation:** Start with **Free** for testing, upgrade to **Starter** for production

---

## Step 5: Add Environment Variables

**BEFORE clicking "Create Web Service"**, scroll down to find:

### Environment Variables Section

Click **"Add Environment Variable"** and add each of these:

| Key | Value | How to Get It |
|-----|-------|---------------|
| `DATABASE_URL` | Your Supabase connection string | Supabase → Settings → Database → Connection String |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API → Project URL |
| `SUPABASE_KEY` | `eyJhbGc...` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase → Settings → API → service_role key |
| `RESEND_API_KEY` | `re_bxP3yrpH_Pt8Rf55viS8R2z7Wuuhs9VwG` | Already provided |
| `RESEND_FROM_EMAIL` | `noreply@hotgigs.com` | Already configured |
| `SECRET_KEY` | Click "Generate" button | Render will generate this |
| `ALGORITHM` | `HS256` | Type manually |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Type manually |

### How to Add Each Variable:

1. Click **"Add Environment Variable"**
2. In the **"Key"** field, enter the variable name (e.g., `DATABASE_URL`)
3. In the **"Value"** field, enter the value
4. Repeat for all variables

---

## Step 6: Create Web Service

1. Review all settings
2. Click the blue **"Create Web Service"** button at the bottom
3. Wait for deployment (5-10 minutes)

---

## Step 7: Monitor Deployment

You'll be taken to the service dashboard where you can see:

### Deployment Progress:
- **Building** - Installing dependencies
- **Deploying** - Starting your application
- **Live** - Your app is running! 🎉

### View Logs:
- Click **"Logs"** tab to see real-time deployment logs
- Look for: `INFO:     Uvicorn running on http://0.0.0.0:XXXXX`

### Get Your URL:
- Once deployed, you'll see your URL at the top
- Format: `https://hotgigs-api.onrender.com`
- Click to open and test

---

## Step 8: Test Your Deployment

### Test 1: Basic Health Check
```bash
curl https://hotgigs-api.onrender.com/
```

Expected response:
```json
{
  "message": "Welcome to HotGigs.ai API",
  "version": "1.0.0",
  "status": "running"
}
```

### Test 2: API Documentation
Open in browser:
```
https://hotgigs-api.onrender.com/docs
```

You should see the Swagger UI with all your endpoints.

### Test 3: Send Test Email
```bash
curl -X POST https://hotgigs-api.onrender.com/api/emails/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "user_name": "Test User"
  }'
```

---

## Step 9: Configure Webhook in Resend

Now that your API is deployed, configure the webhook:

1. Go to https://resend.com/webhooks
2. Click **"Add Webhook"**
3. **Endpoint URL:** `https://hotgigs-api.onrender.com/api/webhooks/resend`
4. **Events:** Select all:
   - ✅ email.sent
   - ✅ email.delivered
   - ✅ email.opened
   - ✅ email.clicked
   - ✅ email.bounced
   - ✅ email.complained
   - ✅ email.delivery_delayed
5. Click **"Create Webhook"**
6. Copy the **Webhook Secret** (you'll need this)

### Add Webhook Secret to Render:

1. Go back to Render dashboard
2. Click on your service (`hotgigs-api`)
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Key: `RESEND_WEBHOOK_SECRET`
6. Value: Paste the webhook secret from Resend
7. Click **"Save Changes"**
8. Your service will automatically redeploy

---

## Step 10: Verify Everything Works

### Check Webhook Events:
1. Send a test email from your API
2. Go to Resend → Webhooks
3. Click on your webhook
4. Check **"Recent Deliveries"** - you should see events

### Check Render Logs:
1. Go to Render dashboard
2. Click **"Logs"** tab
3. You should see webhook events being logged:
   ```
   INFO: Received Resend webhook event: email.sent
   INFO: Email sent - ID: xxx, To: xxx
   ```

---

## Troubleshooting

### Build Fails

**Error:** `Could not find requirements.txt`

**Solution:** Make sure **Root Directory** is set to `backend/hotgigs-api`

---

**Error:** `No module named 'src'`

**Solution:** Check that **Start Command** includes `src.main:app` (not just `main:app`)

---

### Application Crashes

**Check Logs:**
1. Go to **Logs** tab
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Database connection failed
   - Port binding issues

---

### Webhook Not Working

**Check:**
1. Webhook URL is correct in Resend
2. Service is running (not crashed)
3. Check Render logs for incoming webhook requests
4. Verify webhook secret is configured

---

## Summary of Commands

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**Root Directory:**
```
backend/hotgigs-api
```

---

## Visual Reference

Here's what each field looks like in the Render dashboard:

```
┌─────────────────────────────────────────────────────┐
│ Create a new Web Service                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Name: [hotgigs-api                            ]     │
│                                                      │
│ Region: [Oregon (US West)                ▼   ]     │
│                                                      │
│ Branch: [branch-1                        ▼   ]     │
│                                                      │
│ Root Directory: [backend/hotgigs-api          ]     │
│                                                      │
│ Runtime: [Python 3                       ▼   ]     │
│                                                      │
│ Build Command: [pip install -r requirements.txt]    │
│                                                      │
│ Start Command: [uvicorn src.main:app --host    ]    │
│                [0.0.0.0 --port $PORT           ]    │
│                                                      │
│ ☑ Auto-Deploy: Yes                                  │
│                                                      │
│ Health Check Path: [/                         ]     │
│                                                      │
│ ┌─ Environment Variables ─────────────────────┐    │
│ │ [+ Add Environment Variable]                 │    │
│ │                                               │    │
│ │ DATABASE_URL: [your-supabase-url]           │    │
│ │ SUPABASE_URL: [https://xxx.supabase.co]     │    │
│ │ ...                                          │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ Instance Type: ⚪ Free  ⚫ Starter  ⚪ Standard      │
│                                                      │
│          [Create Web Service]                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

**Need Help?**
- Render Docs: https://render.com/docs
- Support: https://render.com/support

**Last Updated:** October 16, 2025


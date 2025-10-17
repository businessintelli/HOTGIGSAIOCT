# HotGigs.ai Pre-Deployment Checklist

Before you start the deployment process, please make sure you have the following information and accounts ready. This will make the deployment process much smoother.

---

## 1. Accounts

- [ ] **Render.com Account:** You will need a Render.com account to deploy the backend and frontend. The free tier is sufficient to get started.
- [ ] **GitHub Account:** Your GitHub account must have access to the repository: `https://github.com/businessintelli/HOTGIGSAIOCT`.
- [ ] **Supabase Account:** You need a Supabase account for the database. Make sure you have your project URL and `anon` key.
- [ ] **Resend Account:** You need a Resend account for sending emails. Make sure you have your API key and a verified sender email.

---

## 2. Credentials & API Keys

Please have the following credentials ready to copy and paste into Render.com environment variables:

- [ ] **Supabase URL:** Your Supabase project URL (e.g., `https://wnvdxdgwcaebzwdgxvzb.supabase.co`).
- [ ] **Supabase Key:** Your Supabase `anon` public key.
- [ ] **Resend API Key:** Your Resend API key (e.g., `re_...`).
- [ ] **Resend From Email:** Your verified sender email address in Resend (e.g., `noreply@hotgigs.com`).
- [ ] **New `SECRET_KEY`:** Generate a new secure secret key for JWT signing. You can use the following command:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

---

## 3. Domain Name (Optional)

If you want to use a custom domain (e.g., `hotgigs.ai`), you will need:

- [ ] **Domain Registrar Access:** Access to your domain registrar's DNS settings (e.g., GoDaddy, Namecheap, Cloudflare) to add CNAME and A records.
- [ ] **Subdomain for API:** Decide on a subdomain for your API (e.g., `api.hotgigs.ai`).

---

## 4. Local Environment (Optional but Recommended)

For running migrations and testing locally, you will need:

- [ ] **Python 3.11+:** Make sure you have Python installed.
- [ ] **Node.js 22+:** Make sure you have Node.js and npm installed.
- [ ] **Git:** Make sure you have Git installed.

---

## 5. Review Deployment Guide

- [ ] **Read `PRODUCTION_DEPLOYMENT_CHECKLIST.md`:** Familiarize yourself with the deployment steps outlined in the main guide.

---

Once you have all of these items ready, you can proceed with the deployment. I'll be here to guide you through each step!


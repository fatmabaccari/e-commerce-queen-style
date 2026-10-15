# 🚂 Railway Deployment Guide - Queen Style

Complete step-by-step guide to deploy your Queen Style app on Railway using your Neon database.

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Code pushed to GitHub repository
- ✅ Neon database connection string
- ✅ Railway account (free)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure your code is on GitHub with these files:
- `Dockerfile` (backend)
- `frontend/Dockerfile` (frontend)
- `docker-compose.prod.external-db.yml` (reference)
- `package.json` files

### Step 2: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your repositories

### Step 3: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `queen-style` repository
4. Railway will detect your Docker setup

### Step 4: Configure Backend Service

Railway will create a service for your backend. Configure it:

#### 4.1: Environment Variables

Click on your service → **"Variables"** tab → Add:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-generated-jwt-secret-here
SESSION_SECRET=your-generated-session-secret-here
FRONTEND_URL=https://your-frontend-service.railway.app
```

**To generate secrets:**
```bash
# On your local machine
openssl rand -base64 32  # Use this for JWT_SECRET
openssl rand -base64 32  # Use this for SESSION_SECRET
```

#### 4.2: Service Settings

- **Root Directory**: Leave empty (or `/` if needed)
- **Dockerfile Path**: `Dockerfile` (or leave default)
- **Build Command**: Railway auto-detects
- **Start Command**: Railway auto-detects from Dockerfile

#### 4.3: Get Backend URL

1. Click **"Settings"** tab
2. Click **"Generate Domain"** (or use custom domain)
3. Copy the URL (e.g., `https://queen-style-backend.railway.app`)

### Step 5: Configure Frontend Service

#### 5.1: Add New Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** again (same repo)
3. Railway will create a new service

#### 5.2: Configure Frontend

1. Go to **"Settings"** tab
2. Set **"Root Directory"** to: `frontend`
3. Set **"Dockerfile Path"** to: `Dockerfile` (or `frontend/Dockerfile`)

#### 5.3: Environment Variables

Add to frontend service:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
```

**Important**: Use the backend URL you got in Step 4.3

#### 5.4: Get Frontend URL

1. Click **"Settings"** → **"Generate Domain"**
2. Copy the frontend URL

### Step 6: Update Backend FRONTEND_URL

Go back to backend service → **"Variables"**:
- Update `FRONTEND_URL` with your frontend URL from Step 5.4

### Step 7: Deploy!

Railway will automatically:
1. Build your Docker images
2. Deploy both services
3. Provide public URLs
4. Set up HTTPS automatically

### Step 8: Verify Deployment

1. Visit your frontend URL
2. Check backend health: `https://your-backend.railway.app/health`
3. Check logs in Railway dashboard

## 🔧 Alternative: Single Service Deployment

If you prefer a simpler setup, you can deploy backend and frontend together:

### Option: Use Nginx in Railway

1. Create one service
2. Use `docker-compose.prod.external-db.yml` as reference
3. Railway will handle the routing

**Note**: Railway's multi-service approach (separate backend/frontend) is recommended for better scaling.

## 📊 Monitoring

### View Logs

1. Click on any service
2. Go to **"Deployments"** tab
3. Click on latest deployment
4. View real-time logs

### Check Service Health

- Backend: Visit `https://your-backend.railway.app/health`
- Frontend: Visit `https://your-frontend.railway.app`

## 🔄 Updates

### Deploy Updates

1. Push changes to GitHub
2. Railway automatically detects and redeploys
3. Or manually trigger: Service → **"Deploy"** → **"Redeploy"**

### Environment Variable Changes

1. Update variables in Railway dashboard
2. Service will automatically restart with new values

## 💰 Free Tier Limits

Railway's free tier includes:
- **$5 credit per month** (usually enough for 2-3 small services)
- **500 hours of usage** (shared across services)
- **Automatic HTTPS**
- **Custom domains** (free)
- **Unlimited deployments**

**Cost Estimate:**
- Backend service: ~$2-3/month
- Frontend service: ~$2-3/month
- **Total: Usually within free $5 credit!**

## 🎯 Pro Tips

1. **Use Railway's built-in PostgreSQL** (optional): Railway offers managed PostgreSQL. You can migrate from Neon later if needed.

2. **Custom Domains**: Add your own domain in service settings → Custom Domain

3. **Environment Variables**: Use Railway's environment variable templates for team members

4. **Monitoring**: Railway provides basic metrics in the dashboard

5. **Backups**: Your Neon database handles backups. Railway services are stateless.

## 🆘 Troubleshooting

### Service Won't Start

1. Check logs in Railway dashboard
2. Verify environment variables are set
3. Ensure `DATABASE_URL` is correct
4. Check Dockerfile paths

### Database Connection Issues

1. Verify Neon connection string includes `?sslmode=require`
2. Check Neon dashboard for connection limits
3. Ensure Neon allows connections from anywhere (or whitelist Railway IPs)

### Frontend Can't Connect to Backend

1. Verify `NEXT_PUBLIC_API_URL` uses the correct backend URL
2. Check CORS settings in backend
3. Ensure both services are deployed and running

### Build Failures

1. Check build logs
2. Verify Dockerfile syntax
3. Ensure all dependencies are in package.json

## 📝 Summary

**What you get:**
- ✅ Free hosting (within $5/month credit)
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Simple deployment
- ✅ Uses your existing Neon database
- ✅ No server management needed

**Time to deploy:** ~15 minutes

**Cost:** $0 (within free tier limits)

---

**Ready to deploy?** Follow the steps above and your app will be live in minutes! 🚀


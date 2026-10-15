# 🆓 FreeHost.run Deployment Guide

Complete guide to deploy Queen Style on FreeHost.run (100% free Docker hosting).

## 🌟 Why FreeHost.run?

- ✅ **100% Free** - No credit card, no limits
- ✅ **Always-on** - No sleep, instant response
- ✅ **Global CDN** - Fast worldwide
- ✅ **Automatic HTTPS** - SSL included
- ✅ **Docker Support** - Native Docker deployment
- ✅ **Easy Setup** - Simple deployment process

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. Make sure your code is on GitHub
2. Ensure you have:
   - `Dockerfile` (backend)
   - `frontend/Dockerfile` (frontend)
   - Your Neon `DATABASE_URL`

### Step 2: Sign Up

1. Go to [freehost.run](https://www.freehost.run)
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with GitHub (recommended) or email
4. Verify your account

### Step 3: Create New Project

1. Click **"New Project"** or **"Create Container"**
2. Select **"Deploy from GitHub"** (if available)
3. Or choose **"Docker Image"** deployment

### Step 4: Configure Backend Service

#### Option A: GitHub Deployment

1. Connect your GitHub repository
2. Set build configuration:
   - **Dockerfile Path**: `Dockerfile`
   - **Build Context**: `.` (root)

#### Option B: Docker Image

1. Build locally or use CI/CD
2. Push to Docker Hub
3. Deploy from Docker Hub

### Step 5: Environment Variables

Add these environment variables in FreeHost.run dashboard:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-generated-jwt-secret
SESSION_SECRET=your-generated-session-secret
FRONTEND_URL=https://your-frontend.freehost.run
```

### Step 6: Configure Frontend Service

1. Create another service for frontend
2. Set Dockerfile path: `frontend/Dockerfile`
3. Add environment variables:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.freehost.run
```

### Step 7: Get Your URLs

FreeHost.run will provide:
- Backend URL: `https://your-backend.freehost.run`
- Frontend URL: `https://your-frontend.freehost.run`

### Step 8: Update Backend FRONTEND_URL

Go back to backend service and update:
```
FRONTEND_URL=https://your-frontend.freehost.run
```

### Step 9: Deploy!

Click **"Deploy"** or **"Start"** and wait for build to complete.

## 🔧 Configuration Tips

### Custom Domain (Optional)

1. Go to service settings
2. Add custom domain
3. Update DNS records as instructed
4. SSL will be automatically configured

### Resource Limits

FreeHost.run free tier typically includes:
- Sufficient resources for small-medium apps
- No strict time limits
- Always-on availability

## 📊 Monitoring

- View logs in dashboard
- Check service status
- Monitor resource usage

## 🔄 Updates

1. Push changes to GitHub
2. FreeHost.run auto-deploys (if connected)
3. Or manually trigger redeploy

## 🆘 Troubleshooting

### Build Failures

- Check Dockerfile syntax
- Verify all dependencies
- Review build logs

### Database Connection

- Verify Neon `DATABASE_URL` is correct
- Ensure Neon allows external connections
- Check SSL mode (`?sslmode=require`)

### Service Not Starting

- Check environment variables
- Review application logs
- Verify port configuration

## 💡 Pro Tips

1. **Use GitHub Integration**: Easier updates
2. **Monitor Logs**: Check regularly for issues
3. **Backup Config**: Save environment variables
4. **Test Locally**: Ensure Docker builds work first

## 📝 Summary

**FreeHost.run is perfect if:**
- ✅ You want 100% free hosting
- ✅ You need always-on service
- ✅ You want simple deployment
- ✅ You're using Docker

**Deployment Time:** ~10-15 minutes

**Cost:** $0 (completely free!)

---

**Ready to deploy?** Visit [freehost.run](https://www.freehost.run) and get started! 🚀


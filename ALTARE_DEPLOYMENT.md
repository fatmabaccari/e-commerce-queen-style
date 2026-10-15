# 🚀 Altare (Altr.cc) Deployment Guide

Complete guide to deploy Queen Style on Altare - free Docker hosting with 4GB RAM.

## 🌟 Why Altare?

- ✅ **100% Free** - No credit card required
- ✅ **4GB RAM** - Generous free tier
- ✅ **Always-on** - No sleep, instant response
- ✅ **Persistent Storage** - Data persists
- ✅ **Docker Support** - Native Docker deployment
- ✅ **No Cold Starts** - Always ready

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. Ensure code is on GitHub or Docker Hub
2. Have ready:
   - `Dockerfile` (backend)
   - `frontend/Dockerfile` (frontend)
   - Neon `DATABASE_URL`

### Step 2: Sign Up

1. Go to [altr.cc](https://www.altr.cc)
2. Click **"Sign Up"** or **"Get Started"**
3. Create account (GitHub or email)
4. Verify email if required

### Step 3: Create New App

1. Click **"New App"** or **"Create Application"**
2. Choose **"Docker"** deployment type
3. Select source:
   - **GitHub** (recommended)
   - **Docker Hub**
   - **Upload**

### Step 4: Configure Backend Service

#### GitHub Deployment:

1. Connect GitHub repository
2. Configure build:
   - **Dockerfile**: `Dockerfile`
   - **Context**: `.` (root directory)
   - **Branch**: `main` or `master`

#### Docker Hub:

1. Provide image name
2. Set pull credentials if private

### Step 5: Environment Variables

Add in Altare dashboard:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-generated-jwt-secret
SESSION_SECRET=your-generated-session-secret
FRONTEND_URL=https://your-frontend.altr.cc
```

### Step 6: Resource Configuration

Altare free tier includes:
- **4GB RAM** (usually sufficient)
- **Persistent storage**
- **CPU resources**

Configure as needed for your app.

### Step 7: Configure Frontend Service

1. Create separate app for frontend
2. Set Dockerfile: `frontend/Dockerfile`
3. Add environment:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.altr.cc
```

### Step 8: Get URLs

Altare provides:
- Backend: `https://your-backend.altr.cc`
- Frontend: `https://your-frontend.altr.cc`

### Step 9: Update Backend

Update backend `FRONTEND_URL` with frontend URL.

### Step 10: Deploy

Click **"Deploy"** or **"Start"** and monitor build.

## 🔧 Advanced Configuration

### Custom Domain

1. Go to app settings
2. Add custom domain
3. Configure DNS as instructed
4. SSL auto-configured

### Scaling

- Free tier: Single instance
- Upgrade available if needed

### Persistent Storage

- Configure volumes in app settings
- Data persists across deployments

## 📊 Monitoring

- **Logs**: Real-time log viewing
- **Metrics**: Resource usage monitoring
- **Status**: Service health checks

## 🔄 Updates

### Automatic (GitHub):

1. Push to connected branch
2. Altare auto-detects and deploys

### Manual:

1. Go to app dashboard
2. Click **"Redeploy"**
3. Or rebuild from source

## 🆘 Troubleshooting

### Build Issues

- Verify Dockerfile paths
- Check build context
- Review build logs

### Database Connection

- Confirm Neon URL format
- Verify SSL mode
- Check network access

### Resource Limits

- Monitor RAM usage
- Optimize if needed
- Consider upgrade if required

## 💡 Best Practices

1. **Use GitHub Integration**: Easier CI/CD
2. **Monitor Resources**: Stay within limits
3. **Optimize Images**: Smaller = faster
4. **Test Locally**: Ensure Docker works first

## 📝 Summary

**Altare is ideal if:**
- ✅ You need more RAM (4GB)
- ✅ You want persistent storage
- ✅ You need always-on service
- ✅ You prefer generous free tier

**Deployment Time:** ~10-15 minutes

**Cost:** $0 (completely free!)

**Resources:** 4GB RAM, persistent storage

---

**Get started:** Visit [altr.cc](https://www.altr.cc) and deploy! 🚀


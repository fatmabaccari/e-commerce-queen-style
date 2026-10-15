# 🆓 Free Hosting Options for Queen Style

This guide covers free hosting platforms that work with Docker and your Neon database.

## 🏆 Top Recommendations

### 🥇 Best Overall: Railway
**Best for:** Beginners, ease of use, reliability

### 🥈 Best Free: FreeHost.run or Altare
**Best for:** 100% free, always-on, no credit card

### 🥉 Best for Advanced: Fly.io
**Best for:** More control, global edge network

---

## 🏆 Option 1: Railway (Best for Beginners)

**Why Railway?**
- ✅ **Free $5 credit monthly** (enough for small apps)
- ✅ **Native Docker support**
- ✅ **Easy deployment** (connects to GitHub)
- ✅ **Automatic HTTPS**
- ✅ **Simple setup**

### Railway Deployment Steps

#### 1. Prepare Your Code

Make sure you have:
- `docker-compose.prod.external-db.yml` (for Neon)
- `.env` file with your Neon `DATABASE_URL`

#### 2. Sign Up & Deploy

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `queen-style` repository

#### 3. Configure Services

Railway will detect your Docker setup. You need to configure:

**Backend Service:**
- Environment variables:
  ```
  NODE_ENV=production
  PORT=3000
  DATABASE_URL=your-neon-connection-string
  JWT_SECRET=your-jwt-secret
  SESSION_SECRET=your-session-secret
  FRONTEND_URL=https://your-app.railway.app
  ```

**Frontend Service:**
- Environment variables:
  ```
  NODE_ENV=production
  NEXT_PUBLIC_API_URL=https://your-backend.railway.app
  ```

**Nginx Service:**
- Railway handles routing automatically, but you can deploy nginx separately if needed

#### 4. Alternative: Single Dockerfile Approach

Railway works best with individual services. You might want to:

**Option A: Deploy Backend + Frontend separately**
- Backend: Use `Dockerfile` in root
- Frontend: Use `frontend/Dockerfile`
- Railway handles routing

**Option B: Use Railway's native services**
- Deploy backend as Node.js service
- Deploy frontend as Node.js service
- Railway provides HTTPS automatically

### Railway Pricing
- **Free**: $5 credit/month (usually enough for 1-2 small apps)
- **Hobby**: $5/month for more resources

---

## 🥈 Alternative: Render

**Why Render?**
- ✅ **Free tier available**
- ✅ **Docker support**
- ✅ **Automatic HTTPS**
- ✅ **Good documentation**

### Render Deployment Steps

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Build Command**: `docker build -t queen-style .`
   - **Start Command**: Use docker-compose or individual services
   - **Environment Variables**: Add your Neon `DATABASE_URL` and secrets

### Render Free Tier Limits
- **Free tier**: 750 hours/month
- **Sleeps after 15 min inactivity** (wakes on request)
- **512MB RAM**

---

## 🥉 Alternative: Fly.io

**Why Fly.io?**
- ✅ **Generous free tier**
- ✅ **Excellent Docker support**
- ✅ **Global edge network**
- ✅ **No sleep** (stays awake)

### Fly.io Deployment Steps

1. Install Fly CLI:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. Sign up: `fly auth signup`

3. Create `fly.toml` (I'll create this for you)

4. Deploy:
   ```bash
   fly deploy
   ```

### Fly.io Free Tier
- **3 shared VMs**
- **3GB persistent storage**
- **160GB outbound data transfer**

---

## 🆕 Additional Free Options

### FreeHost.run
- ✅ **100% Free** Docker hosting
- ✅ **Global CDN** acceleration
- ✅ **Automatic HTTPS**
- ✅ **No credit card** required
- ✅ **Always-on** (no sleep)
- 🌐 [freehost.run](https://www.freehost.run/docker)

### Altare (Altr.cc)
- ✅ **100% Free** app hosting
- ✅ **4GB RAM** allocation
- ✅ **Persistent storage**
- ✅ **Always-on** (no cold starts)
- ✅ **Docker support**
- 🌐 [altr.cc](https://www.altr.cc/solutions/free-app-hosting)

## 🎯 Quick Comparison

| Platform | Free Tier | Docker | Ease | Sleep | Best For |
|----------|-----------|--------|------|-------|----------|
| **Railway** | $5/month credit | ✅ | ⭐⭐⭐⭐⭐ | ❌ No | Beginners |
| **Render** | 750 hrs/month | ✅ | ⭐⭐⭐⭐ | ⏰ 15min | Simple apps |
| **Fly.io** | 3 VMs | ✅ | ⭐⭐⭐ | ❌ No | Advanced |
| **FreeHost.run** | 100% Free | ✅ | ⭐⭐⭐⭐ | ❌ No | Budget users |
| **Altare** | 100% Free | ✅ | ⭐⭐⭐⭐ | ❌ No | Always-on apps |

---

## 🚀 Recommended Setup: Railway (Step-by-Step)

### Step 1: Prepare Repository

Make sure your code is on GitHub with:
- `docker-compose.prod.external-db.yml`
- `Dockerfile` (backend)
- `frontend/Dockerfile` (frontend)

### Step 2: Create Railway Project

1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository

### Step 3: Configure Backend Service

1. Railway will detect your Docker setup
2. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=your-neon-connection-string-here
   JWT_SECRET=generate-with-openssl-rand-base64-32
   SESSION_SECRET=generate-with-openssl-rand-base64-32
   FRONTEND_URL=https://your-frontend.railway.app
   ```

3. Railway will automatically:
   - Build your Docker image
   - Deploy the service
   - Provide a public URL

### Step 4: Configure Frontend Service

1. Add another service (or use Railway's multi-service setup)
2. Point to `frontend/Dockerfile`
3. Add environment variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

### Step 5: Custom Domain (Optional)

1. In Railway dashboard, go to your service
2. Click **"Settings"** → **"Generate Domain"**
3. Or add custom domain in **"Custom Domain"** section

---

## 📝 Important Notes

### For All Platforms:

1. **Neon Connection**: Make sure your Neon database allows connections from anywhere (or whitelist the hosting IPs)

2. **Environment Variables**: Never commit `.env` files. Use platform's environment variable settings.

3. **HTTPS**: All platforms provide automatic HTTPS - no SSL setup needed!

4. **Database**: Your Neon database works from anywhere, so no changes needed there.

### Railway-Specific:

- Railway provides a public URL automatically
- You can deploy multiple services (backend, frontend) separately
- Railway handles load balancing and scaling
- Free tier includes $5 credit monthly

### Render-Specific:

- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Good for development/testing, less ideal for production

### Fly.io-Specific:

- Services stay awake (no sleep)
- Better for production use
- More configuration needed
- Global edge network for fast response times

---

## 🎯 My Recommendations

### For Beginners: Railway
**Why:**
- ✅ Easiest setup
- ✅ $5/month free credit (usually enough)
- ✅ Automatic HTTPS
- ✅ Great documentation
- ✅ No sleep

**Get Started:** See `RAILWAY_DEPLOYMENT.md`

### For 100% Free: FreeHost.run or Altare
**Why:**
- ✅ Completely free (no credit card)
- ✅ Always-on (no sleep)
- ✅ Generous resources
- ✅ Easy deployment

**Get Started:** 
- FreeHost.run: See `FREEHOST_DEPLOYMENT.md`
- Altare: See `ALTARE_DEPLOYMENT.md`

### For Advanced Users: Fly.io
**Why:**
- ✅ More control
- ✅ Global edge network
- ✅ Generous free tier
- ✅ No sleep

**Get Started:** Use `fly.toml` configuration

## 🚀 Quick Start (Choose One)

### Option A: Railway (Recommended)
```bash
1. Sign up: railway.app
2. Connect GitHub repo
3. Add Neon DATABASE_URL
4. Deploy!
```
See: `RAILWAY_DEPLOYMENT.md`

### Option B: FreeHost.run (100% Free)
```bash
1. Sign up: freehost.run
2. Deploy Docker container
3. Add Neon DATABASE_URL
4. Done!
```
See: `FREEHOST_DEPLOYMENT.md`

### Option C: Altare (4GB RAM)
```bash
1. Sign up: altr.cc
2. Deploy from GitHub/Docker
3. Configure environment
4. Deploy!
```
See: `ALTARE_DEPLOYMENT.md`

---

## 🆘 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Fly.io Docs**: https://fly.io/docs

Want me to create a Railway-specific deployment guide or Fly.io configuration file?


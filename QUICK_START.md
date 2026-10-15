# 🚀 Quick Start - Deploy Queen Style to Production

This is a quick guide to get your Queen Style application live in minutes.

## Prerequisites

- A server with Docker installed (Ubuntu 20.04+ recommended)
- A domain name (optional, but recommended)

## Step 1: Prepare Your Server

```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step 2: Upload Your Code

```bash
# Option A: Clone from Git
git clone <your-repo-url> queen-style
cd queen-style

# Option B: Upload via SCP
# scp -r /local/path/to/queen-style user@server:/home/user/
```

## Step 3: Configure Environment

```bash
# Copy environment template
cp env.production.template .env

# Edit with your values
nano .env
```

**Choose your database option:**

### Option A: Use Neon (if you have existing data) - Recommended

```env
# Get this from your Neon dashboard
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require

JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=http://your-server-ip
NEXT_PUBLIC_API_URL=http://your-server-ip/api
```

### Option B: Create new local database

```env
POSTGRES_PASSWORD=your-strong-password
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=http://your-server-ip
NEXT_PUBLIC_API_URL=http://your-server-ip/api
```

## Step 4: Deploy

**If using Neon (Option A):**
```bash
docker-compose -f docker-compose.prod.external-db.yml up -d --build
```

**If using local database (Option B):**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

Or use the deploy script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Step 5: Verify

```bash
# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test in browser
# Visit: http://your-server-ip
```

## 🎉 Done!

Your application is now live! 

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip/api

## 🔒 Adding SSL (HTTPS) - Optional

If you have a domain name:

```bash
# 1. Point your domain DNS to server IP
# 2. Run SSL setup script
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh yourdomain.com your@email.com

# 3. Update nginx/conf.d/default.conf (uncomment HTTPS section)
# 4. Update .env with HTTPS URLs
# 5. Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 📚 More Information

See `DEPLOYMENT.md` for detailed documentation.

## 🆘 Troubleshooting

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Rebuild everything
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```


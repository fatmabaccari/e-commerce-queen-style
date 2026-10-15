# 🌐 Production Deployment - Queen Style

Complete guide to deploy your Queen Style e-commerce platform to production.

## 📦 What's Included

This production setup includes:

- ✅ **PostgreSQL Database** - Containerized database with persistent storage
- ✅ **Backend API** - Node.js/Express API with Prisma ORM
- ✅ **Frontend Dashboard** - Next.js admin dashboard
- ✅ **Nginx Reverse Proxy** - Handles routing, SSL, and static files
- ✅ **Health Checks** - Automatic service health monitoring
- ✅ **Auto-restart** - Services restart automatically on failure

## 🚀 Quick Deployment

### 1. On Your Server

```bash
# Clone or upload your code
cd /path/to/queen-style

# Create .env file
cp env.production.template .env
nano .env  # Edit with your values

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. Access Your Application

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip/api
- **Database**: Internal (port 5432)

## 📋 Files Created

### Production Docker Compose
- `docker-compose.prod.yml` - Production configuration with database and nginx

### Nginx Configuration
- `nginx/nginx.conf` - Main nginx configuration
- `nginx/conf.d/default.conf` - Server blocks for HTTP/HTTPS

### Environment Template
- `env.production.template` - Environment variables template

### Deployment Scripts
- `deploy.sh` - Interactive deployment script
- `scripts/setup-ssl.sh` - SSL certificate setup helper

### Documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `QUICK_START.md` - Quick start guide
- `README.PRODUCTION.md` - This file

## 🔧 Configuration

### Environment Variables

Key variables in `.env`:

```env
# Database
POSTGRES_USER=queenstyle
POSTGRES_PASSWORD=strong-password-here
POSTGRES_DB=queen_style

# Security
JWT_SECRET=generate-with-openssl-rand-base64-32
SESSION_SECRET=generate-with-openssl-rand-base64-32

# URLs
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### Ports

Default ports (can be changed in `.env`):
- **80** - HTTP (Nginx)
- **443** - HTTPS (Nginx)
- **5432** - PostgreSQL (internal only)

## 🔒 SSL/HTTPS Setup

### Option 1: Let's Encrypt (Free)

```bash
# Run SSL setup script
./scripts/setup-ssl.sh yourdomain.com your@email.com

# Update nginx config
nano nginx/conf.d/default.conf
# Uncomment HTTPS server block

# Update .env with HTTPS URLs
nano .env

# Restart
docker-compose -f docker-compose.prod.yml restart
```

### Option 2: Custom Certificates

1. Place certificates in `nginx/ssl/`:
   - `fullchain.pem`
   - `privkey.pem`

2. Update `nginx/conf.d/default.conf` with certificate paths

3. Restart nginx

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Check Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Health Checks

Services automatically check health:
- Backend: `http://localhost:3000/health`
- Frontend: `http://localhost:3001/`

## 💾 Backup & Restore

### Backup Database

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U queenstyle queen_style > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U queenstyle queen_style < backup_file.sql
```

## 🔄 Updates

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## 🛠️ Maintenance

### Restart Services

```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### Clean Everything (⚠️ Deletes Data)

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## 🌍 Cloud Provider Guides

### DigitalOcean

1. Create Droplet (Ubuntu 22.04, 2GB RAM minimum)
2. Follow QUICK_START.md
3. Configure firewall in DO dashboard
4. Point domain DNS to droplet IP

### AWS EC2

1. Launch EC2 instance (Ubuntu, t2.small minimum)
2. Configure security group (ports 22, 80, 443)
3. Allocate Elastic IP
4. Follow deployment steps

### Google Cloud

1. Create VM instance (Ubuntu, e2-small minimum)
2. Configure firewall rules
3. Reserve static IP
4. Deploy application

## 📞 Support

- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Review DEPLOYMENT.md for detailed troubleshooting
- Verify all environment variables are set correctly

---

**Ready to deploy?** Start with `QUICK_START.md`!


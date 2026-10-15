# 🚀 Queen Style - Production Deployment Guide

This guide will help you deploy your Queen Style e-commerce platform to production using Docker.

## 📋 Prerequisites

- **Server**: VPS or cloud instance (Ubuntu 20.04+ recommended)
- **Docker**: Docker Engine 20.10+
- **Docker Compose**: Version 2.0+
- **Domain Name**: (Optional but recommended)
- **SSH Access**: To your server
- **Database**: Choose one:
  - **Option A**: Use existing Neon/external database (recommended if you have data)
  - **Option B**: Create new local PostgreSQL container

## 🛠️ Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Your Repository

```bash
# Clone your repository
git clone <your-repo-url> queen-style
cd queen-style

# Or upload your files via SCP/SFTP
```

## ⚙️ Configuration

### 1. Create Environment File

```bash
# Copy the production example
cp env.production.template .env

# Edit with your values
nano .env
```

**Choose your database option:**

#### Option A: Use Neon (or external database) - Recommended if you have existing data

```env
# Use your Neon connection string
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require

# Security (generate strong secrets)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

#### Option B: Create new local PostgreSQL

```env
# Database (for local PostgreSQL)
POSTGRES_USER=queenstyle
POSTGRES_PASSWORD=your-strong-password-here
POSTGRES_DB=queen_style

# Security (generate strong secrets)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

> **Note**: See `DEPLOYMENT_NEON.md` for detailed Neon setup instructions.

### 2. Generate Strong Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate Session secret
openssl rand -base64 32
```

## 🚀 Deployment

### Option 1: Quick Start (HTTP only)

**Choose your database option:**

#### Using Neon/External Database (Recommended if you have existing data)

```bash
# Build and start all services (without local PostgreSQL)
docker-compose -f docker-compose.prod.external-db.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.external-db.yml logs -f

# Check status
docker-compose -f docker-compose.prod.external-db.yml ps
```

#### Using Local PostgreSQL (Creates new database)

```bash
# Build and start all services (with local PostgreSQL)
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

Your application will be available at:
- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip/api

> **Note**: If you're using Neon, make sure your `.env` has the correct `DATABASE_URL` from your Neon dashboard.

### Option 2: Production with SSL (HTTPS)

#### Step 1: Install Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Step 2: Configure Domain DNS

Point your domain to your server's IP address:
- A record: `@` → `your-server-ip`
- A record: `www` → `your-server-ip`

#### Step 3: Get SSL Certificate

```bash
# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to nginx/ssl directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem
```

#### Step 4: Update Nginx Configuration

Edit `nginx/conf.d/default.conf`:
1. Uncomment the HTTPS server block
2. Update `server_name` with your domain
3. Uncomment the HTTP to HTTPS redirect

#### Step 5: Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Check Service Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U queenstyle queen_style > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U queenstyle queen_style < backup_file.sql
```

## 🔒 Security Best Practices

1. **Change Default Passwords**: Update all default passwords in `.env`
2. **Use Strong Secrets**: Generate strong JWT and session secrets
3. **Enable Firewall**: 
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Keep Docker Updated**: Regularly update Docker and images
5. **Monitor Logs**: Regularly check logs for suspicious activity
6. **SSL/TLS**: Always use HTTPS in production
7. **Regular Backups**: Set up automated database backups

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if ports are in use
sudo netstat -tulpn | grep -E ':(80|443|3000|3001|5432)'

# Remove old containers
docker-compose -f docker-compose.prod.yml down
docker system prune -a
```

### Database Connection Issues

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull
```

### Frontend Can't Connect to Backend

1. Check `NEXT_PUBLIC_API_URL` in `.env`
2. Verify nginx configuration
3. Check backend health: `curl http://localhost:3000/health`

### SSL Certificate Renewal

```bash
# Renew certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Reload nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Out of Disk Space

```bash
# Clean Docker system
docker system prune -a --volumes

# Check disk usage
df -h
docker system df
```

## 📝 Useful Commands

```bash
# Access backend container
docker-compose -f docker-compose.prod.yml exec backend sh

# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U queenstyle queen_style

# Run Prisma migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

## 🌐 Cloud Provider Specific Guides

### DigitalOcean

1. Create a Droplet (Ubuntu 22.04)
2. Follow server setup steps above
3. Configure firewall in DigitalOcean dashboard
4. Point domain DNS to droplet IP

### AWS EC2

1. Launch EC2 instance (Ubuntu)
2. Configure security groups (ports 22, 80, 443)
3. Follow server setup steps
4. Use Elastic IP for static IP address

### Google Cloud Platform

1. Create VM instance
2. Configure firewall rules
3. Reserve static IP address
4. Follow deployment steps

## 📞 Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Review this documentation
- Check Docker and service health status

---

**Note**: Always test in a staging environment before deploying to production!


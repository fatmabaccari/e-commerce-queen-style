# 🚀 Deployment with Neon Database

This guide shows you how to deploy using your existing **Neon** database instead of creating a new PostgreSQL container.

## 📋 Overview

**Current Setup Options:**

1. **`docker-compose.prod.yml`** - Creates a new PostgreSQL container (local database)
2. **`docker-compose.prod.external-db.yml`** - Uses your existing Neon database (recommended if you already have data)

## ✅ Using Neon Database (Recommended if you have existing data)

### Step 1: Get Your Neon Connection String

1. Go to your [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Go to **Connection Details** or **Connection String**
4. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Step 2: Configure Environment

```bash
# Create .env file
cp env.production.template .env

# Edit .env file
nano .env
```

Add your Neon connection string:

```env
# Database - Use your Neon connection string
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require

# Security
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# URLs
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### Step 3: Deploy with External Database

```bash
# Deploy using the external database configuration
docker-compose -f docker-compose.prod.external-db.yml up -d --build
```

That's it! Your application will now use your existing Neon database.

## 🔄 Comparison

### With Local PostgreSQL (`docker-compose.prod.yml`)
- ✅ Creates a new database container
- ✅ Database runs on your server
- ✅ Full control over database
- ❌ Need to migrate existing data
- ❌ Database tied to your server

### With Neon (`docker-compose.prod.external-db.yml`)
- ✅ Uses your existing database
- ✅ No data migration needed
- ✅ Database managed by Neon (scalable, backups included)
- ✅ Can access database from anywhere
- ✅ Serverless, auto-scaling
- ❌ Requires internet connection

## 🔧 Important Notes

### SSL Connection

Neon requires SSL connections. Make sure your connection string includes:
```
?sslmode=require
```

Or use:
```
?sslmode=require&sslcert=/path/to/cert
```

### Network Access

Your Docker container needs internet access to connect to Neon. This is usually available by default, but if you're behind a firewall, ensure:
- Port 5432 (PostgreSQL) is allowed for outbound connections
- Or use Neon's connection pooling endpoint

### Connection Pooling (Optional)

Neon offers connection pooling. You can use:
- **Session mode**: `ep-xxxxx-pooler.region.aws.neon.tech`
- **Transaction mode**: `ep-xxxxx-pooler.region.aws.neon.tech`

Update your `DATABASE_URL` to use the pooler endpoint for better performance.

## 🚀 Quick Deploy with Neon

```bash
# 1. Set your Neon connection string in .env
echo "DATABASE_URL=your-neon-connection-string" >> .env

# 2. Add other required variables
nano .env

# 3. Deploy
docker-compose -f docker-compose.prod.external-db.yml up -d --build

# 4. Check logs
docker-compose -f docker-compose.prod.external-db.yml logs -f backend
```

## 🔍 Verify Connection

```bash
# Check backend logs for database connection
docker-compose -f docker-compose.prod.external-db.yml logs backend | grep -i "prisma\|database\|connected"

# Test health endpoint
curl http://localhost/health
```

## 📊 Monitoring

Since you're using Neon:
- Monitor database usage in Neon Dashboard
- Check connection limits
- Review query performance
- Set up alerts in Neon

## 🔄 Switching Between Configurations

### From Local DB to Neon

```bash
# Stop current setup
docker-compose -f docker-compose.prod.yml down

# Update .env with Neon DATABASE_URL
nano .env

# Start with Neon
docker-compose -f docker-compose.prod.external-db.yml up -d
```

### From Neon to Local DB

```bash
# Stop current setup
docker-compose -f docker-compose.prod.external-db.yml down

# Update .env with local DB credentials
nano .env

# Start with local DB
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Troubleshooting

### Connection Timeout

```bash
# Check if container can reach internet
docker-compose -f docker-compose.prod.external-db.yml exec backend ping -c 3 8.8.8.8

# Check DNS resolution
docker-compose -f docker-compose.prod.external-db.yml exec backend nslookup ep-xxxxx.region.aws.neon.tech
```

### SSL Errors

Make sure your connection string includes `?sslmode=require`:
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Connection Limits

Neon has connection limits based on your plan. If you hit limits:
- Use connection pooling (pooler endpoint)
- Reduce connection pool size in Prisma
- Upgrade your Neon plan

## 📝 Summary

**To use Neon:**
1. Copy your Neon connection string
2. Add it to `.env` as `DATABASE_URL`
3. Deploy with: `docker-compose -f docker-compose.prod.external-db.yml up -d --build`

**Your existing data in Neon will be used automatically!** 🎉


# Docker Setup Guide

This guide explains how to run the Queen Style application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- A PostgreSQL database (or connection string)

## Quick Start

### 1. Create Environment File

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-super-secret-session-key
FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
```

You can copy `.docker-compose.env.example` as a template.

### 2. Development Mode

To run in development mode with hot reload:

```bash
# Build and start containers
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

**Services:**
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

### 3. Production Mode

To run in production mode:

```bash
# Build and start containers
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Services:**
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

## Docker Commands

### Build Images

```bash
# Development
docker-compose -f docker-compose.dev.yml build

# Production
docker-compose build
```

### Start Services

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up
```

### Stop Services

```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Execute Commands in Containers

```bash
# Backend container
docker-compose exec backend sh

# Frontend container
docker-compose exec frontend sh

# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use, you can change them in `docker-compose.yml`:

```yaml
ports:
  - "3002:3000"  # Change host port to 3002
```

### Database Connection Issues

Make sure your `DATABASE_URL` is correct and the database is accessible from the Docker container.

### Frontend Can't Connect to Backend

Ensure `NEXT_PUBLIC_API_URL` is set correctly. In Docker, use:
- `http://backend:3000` (for internal Docker network)
- `http://localhost:3000` (for browser access)

### Rebuild After Code Changes

```bash
# Development (with volume mounts, changes are reflected automatically)
docker-compose -f docker-compose.dev.yml restart

# Production (requires rebuild)
docker-compose build && docker-compose up -d
```

## File Structure

```
.
├── Dockerfile              # Backend production image
├── Dockerfile.dev          # Backend development image
├── docker-compose.yml      # Production compose file
├── docker-compose.dev.yml  # Development compose file
├── frontend/
│   ├── Dockerfile          # Frontend production image
│   └── Dockerfile.dev      # Frontend development image
└── .env                    # Environment variables (create this)
```

## Notes

- The `uploads` directory is persisted as a volume for product images
- Database migrations run automatically on container start
- In development mode, code changes are reflected immediately due to volume mounts
- Health checks are configured for both services


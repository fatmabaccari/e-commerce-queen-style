# Use Node.js LTS version
FROM node:20-alpine

# Install wget for healthchecks and curl as alternative
RUN apk add --no-cache wget curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including Prisma CLI (needed for migrations)
RUN npm ci && npm cache clean --force

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Create uploads directory for product images
RUN mkdir -p uploads && chmod 755 uploads

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]


# Frontend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
# NEXT_PUBLIC_* variables need to be available at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Copy and make startup script executable
COPY start.sh ./
RUN chmod +x start.sh

# Build the Next.js application
# NEXT_PUBLIC_API_URL will be baked into the build at this step
RUN npm run build

# Expose port (Railway will set PORT dynamically, default to 3001)
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

# Start the application using the startup script
CMD ["./start.sh"]


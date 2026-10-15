#!/bin/bash

# SSL Certificate Setup Script for Queen Style
# This script helps set up SSL certificates using Let's Encrypt

set -e

echo "🔒 SSL Certificate Setup"
echo "======================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${RED}✗ Error: Domain name required!${NC}"
    echo "Usage: ./scripts/setup-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-admin@${DOMAIN}}

echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}⚠️  Certbot not found. Installing...${NC}"
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Create nginx directories if they don't exist
mkdir -p nginx/ssl
mkdir -p nginx/logs

# Stop nginx temporarily
echo "Stopping nginx..."
docker-compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true

# Get certificate
echo ""
echo "Requesting SSL certificate from Let's Encrypt..."
sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

# Copy certificates
echo ""
echo "Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem
sudo chown $USER:$USER nginx/ssl/*.pem

echo ""
echo -e "${GREEN}✓ SSL certificates installed!${NC}"
echo ""
echo "Next steps:"
echo "1. Update nginx/conf.d/default.conf:"
echo "   - Uncomment the HTTPS server block"
echo "   - Update server_name with: $DOMAIN www.$DOMAIN"
echo "   - Uncomment the HTTP to HTTPS redirect"
echo ""
echo "2. Update .env file:"
echo "   - Set FRONTEND_URL=https://$DOMAIN"
echo "   - Set NEXT_PUBLIC_API_URL=https://$DOMAIN/api"
echo ""
echo "3. Restart services:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""


#!/bin/bash

# Queen Style Production Deployment Script
# This script helps deploy your application to production

set -e

echo "🚀 Queen Style Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Creating .env from template..."
    if [ -f env.production.template ]; then
        cp env.production.template .env
        echo -e "${GREEN}✓ Created .env file${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env file with your actual values before continuing!${NC}"
        exit 1
    else
        echo -e "${RED}✗ Template file not found!${NC}"
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

# Function to check if services are running
check_services() {
    echo ""
    echo "Checking service status..."
    docker-compose -f docker-compose.prod.yml ps
}

# Function to view logs
view_logs() {
    echo ""
    echo "Viewing logs (Ctrl+C to exit)..."
    docker-compose -f docker-compose.prod.yml logs -f
}

# Main menu
echo "Select an option:"
echo "1) Deploy/Start services"
echo "2) Stop services"
echo "3) Restart services"
echo "4) View logs"
echo "5) Check status"
echo "6) Rebuild and deploy"
echo "7) Backup database"
echo "8) Exit"
echo ""
read -p "Enter option [1-8]: " option

case $option in
    1)
        echo ""
        echo "🚀 Starting services..."
        docker-compose -f docker-compose.prod.yml up -d --build
        echo ""
        echo -e "${GREEN}✓ Services started!${NC}"
        echo ""
        echo "Waiting for services to be healthy..."
        sleep 10
        check_services
        echo ""
        echo -e "${GREEN}✓ Deployment complete!${NC}"
        echo ""
        echo "Your application should be available at:"
        echo "  - Frontend: http://$(hostname -I | awk '{print $1}')"
        echo "  - Backend API: http://$(hostname -I | awk '{print $1}')/api"
        ;;
    2)
        echo ""
        echo "🛑 Stopping services..."
        docker-compose -f docker-compose.prod.yml down
        echo -e "${GREEN}✓ Services stopped!${NC}"
        ;;
    3)
        echo ""
        echo "🔄 Restarting services..."
        docker-compose -f docker-compose.prod.yml restart
        echo -e "${GREEN}✓ Services restarted!${NC}"
        check_services
        ;;
    4)
        view_logs
        ;;
    5)
        check_services
        ;;
    6)
        echo ""
        echo "🔨 Rebuilding and deploying..."
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d --build
        echo ""
        echo -e "${GREEN}✓ Rebuild complete!${NC}"
        check_services
        ;;
    7)
        echo ""
        echo "💾 Creating database backup..."
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U queenstyle queen_style > "$BACKUP_FILE"
        echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
        ;;
    8)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo -e "${RED}✗ Invalid option!${NC}"
        exit 1
        ;;
esac


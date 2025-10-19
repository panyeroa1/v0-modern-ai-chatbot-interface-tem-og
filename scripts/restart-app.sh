#!/bin/bash

# Eburon AI - Application Restart Script
# Supports multiple deployment methods: PM2, Docker, and Direct Next.js

set -e

echo "🔄 Eburon AI Application Restart Script"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Detect deployment method
detect_deployment_method() {
    if command -v pm2 &> /dev/null && pm2 list | grep -q "eburon-ai\|hyperfocus-app"; then
        echo "pm2"
    elif command -v docker &> /dev/null && docker ps | grep -q "hyperfocus-app\|eburon-ai"; then
        echo "docker"
    elif command -v docker-compose &> /dev/null && docker-compose ps | grep -q "app"; then
        echo "docker-compose"
    elif pgrep -f "next start\|next dev\|node.*server.js" &> /dev/null; then
        echo "nextjs"
    else
        echo "unknown"
    fi
}

# Restart using PM2
restart_pm2() {
    print_info "Detected PM2 deployment"
    
    # Try common app names
    if pm2 list | grep -q "eburon-ai"; then
        APP_NAME="eburon-ai"
    elif pm2 list | grep -q "hyperfocus-app"; then
        APP_NAME="hyperfocus-app"
    else
        print_error "No PM2 app found with expected names (eburon-ai, hyperfocus-app)"
        return 1
    fi
    
    print_info "Restarting PM2 app: $APP_NAME"
    pm2 restart "$APP_NAME"
    
    print_success "Application restarted successfully via PM2"
    print_info "View logs with: pm2 logs $APP_NAME"
}

# Restart using Docker
restart_docker() {
    print_info "Detected Docker deployment"
    
    # Find container name
    if docker ps | grep -q "hyperfocus-app"; then
        CONTAINER_NAME="hyperfocus-app"
    elif docker ps | grep -q "eburon-ai"; then
        CONTAINER_NAME="eburon-ai"
    else
        print_error "No Docker container found with expected names"
        return 1
    fi
    
    print_info "Restarting Docker container: $CONTAINER_NAME"
    docker restart "$CONTAINER_NAME"
    
    print_success "Application restarted successfully via Docker"
    print_info "View logs with: docker logs -f $CONTAINER_NAME"
}

# Restart using Docker Compose
restart_docker_compose() {
    print_info "Detected Docker Compose deployment"
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in current directory"
        return 1
    fi
    
    print_info "Restarting Docker Compose services"
    docker-compose restart app
    
    print_success "Application restarted successfully via Docker Compose"
    print_info "View logs with: docker-compose logs -f app"
}

# Restart Next.js directly
restart_nextjs() {
    print_info "Detected direct Next.js deployment"
    print_warning "Direct restart requires stopping and starting the process"
    
    # Find Next.js process
    PID=$(pgrep -f "next start\|node.*server.js" | head -n 1)
    
    if [ -z "$PID" ]; then
        print_error "No Next.js process found running"
        print_info "Start the application with: npm start or pnpm start"
        return 1
    fi
    
    print_info "Stopping Next.js process (PID: $PID)"
    kill "$PID"
    sleep 2
    
    print_info "Starting Next.js application"
    if [ -f "package-lock.json" ]; then
        npm start &
    elif [ -f "pnpm-lock.yaml" ]; then
        pnpm start &
    else
        npm start &
    fi
    
    print_success "Application restarted successfully"
    print_warning "Note: For production, consider using PM2 for process management"
}

# Main restart logic
main() {
    print_info "Detecting deployment method..."
    
    METHOD=$(detect_deployment_method)
    
    case $METHOD in
        pm2)
            restart_pm2
            ;;
        docker)
            restart_docker
            ;;
        docker-compose)
            restart_docker_compose
            ;;
        nextjs)
            restart_nextjs
            ;;
        unknown)
            print_error "Could not detect deployment method"
            print_info "Application might not be running or using an unsupported deployment method"
            echo ""
            print_info "Supported methods:"
            echo "  - PM2 (recommended for production)"
            echo "  - Docker"
            echo "  - Docker Compose"
            echo "  - Direct Next.js (development)"
            echo ""
            print_info "To start the application:"
            echo "  Development: npm run dev"
            echo "  Production: npm start"
            echo "  PM2: pm2 start ecosystem.config.js"
            echo "  Docker: docker-compose up -d"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Restart operation completed!"
}

# Run main function
main

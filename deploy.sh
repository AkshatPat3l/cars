#!/bin/bash
# ============================================
# CarCostCanada Deployment Script
# ============================================
# Usage:
#   ./deploy.sh              # Build and deploy to Cloudflare Pages
#   ./deploy.sh --docker     # Build Docker image only
#   ./deploy.sh --docker-run # Build and run Docker container locally
#   ./deploy.sh --help       # Show help

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚗 CarCostCanada Deployment"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
case "${1:-}" in
  --docker)
    echo -e "\n${YELLOW}Building Docker image...${NC}"
    docker build -t carcostcanada:latest -f apps/web/Dockerfile .
    echo -e "\n${GREEN}✓ Docker image built successfully${NC}"
    echo -e "\nTo run: docker run -p 8080:80 carcostcanada:latest"
    exit 0
    ;;
  --docker-run)
    echo -e "\n${YELLOW}Building and running Docker container...${NC}"
    docker build -t carcostcanada:latest -f apps/web/Dockerfile .
    docker run -d --name carcostcanada -p 8080:80 carcostcanada:latest
    echo -e "\n${GREEN}✓ Container running at http://localhost:8080${NC}"
    echo -e "\nTo stop: docker stop carcostcanada"
    echo -e "To view logs: docker logs -f carcostcanada"
    exit 0
    ;;
  --dev)
    echo -e "\n${YELLOW}Starting development with Docker Compose...${NC}"
    docker-compose up web-dev
    exit 0
    ;;
  --production)
    echo -e "\n${YELLOW}Building for production...${NC}"
    cd apps/web
    pnpm install
    pnpm build
    cd "$SCRIPT_DIR"
    echo -e "\n${GREEN}✓ Production build complete${NC}"
    echo -e "Output: apps/web/dist/"
    exit 0
    ;;
  --help|*)
    echo "CarCostCanada Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --docker        Build Docker image only"
    echo "  --docker-run    Build and run Docker container locally"
    echo "  --dev           Start development with Docker Compose"
    echo "  --production    Build for production only"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh --docker-run    # Quick local test"
    echo "  ./deploy.sh --docker        # Build for deployment"
    echo "  ./deploy.sh --production    # Build static files"
    exit 0
    ;;
esac

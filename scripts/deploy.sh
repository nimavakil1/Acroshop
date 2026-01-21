#!/bin/bash
# Acropaq Store - Deployment Script
# Usage: ./scripts/deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "  Acropaq Store Deployment"
echo "  Environment: $ENVIRONMENT"
echo "=========================================="

cd "$PROJECT_DIR"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running"
    exit 1
fi

# Function: Deploy development
deploy_dev() {
    echo ""
    echo "Starting development deployment..."

    # Stop existing containers
    docker-compose down --remove-orphans || true

    # Build and start
    docker-compose build --no-cache
    docker-compose up -d

    echo ""
    echo "Waiting for services to start..."
    sleep 10

    # Run database migrations
    echo "Running database migrations..."
    docker-compose exec -T backend npm run migrations || true

    # Seed the database (first time only)
    if [ ! -f ".seeded" ]; then
        echo "Seeding database..."
        docker-compose exec -T backend npm run seed || true
        touch .seeded
    fi

    echo ""
    echo "Development deployment complete!"
    echo ""
    echo "Services:"
    echo "  - Frontend:  http://localhost:8000"
    echo "  - Backend:   http://localhost:9000"
    echo "  - Admin:     http://localhost:9000/app"
    echo "  - Postgres:  localhost:5432"
    echo "  - Redis:     localhost:6379"
    echo ""
    echo "Commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop:      docker-compose down"
}

# Function: Deploy production
deploy_prod() {
    echo ""
    echo "Starting production deployment..."

    # Check for .env file
    if [ ! -f ".env" ]; then
        echo "Error: .env file not found"
        echo "Please create .env with production values"
        exit 1
    fi

    # Load environment variables
    export $(grep -v '^#' .env | xargs)

    # Check required variables
    required_vars="DOMAIN POSTGRES_PASSWORD JWT_SECRET COOKIE_SECRET STRIPE_API_KEY"
    for var in $required_vars; do
        if [ -z "${!var}" ]; then
            echo "Error: $var is not set in .env"
            exit 1
        fi
    done

    # Pull latest code (if git repo)
    if [ -d ".git" ]; then
        echo "Pulling latest code..."
        git pull origin main
    fi

    # Stop existing containers
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans || true

    # Build and start
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

    echo ""
    echo "Waiting for services to start..."
    sleep 20

    # Run database migrations
    echo "Running database migrations..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T backend npm run migrations || true

    # Health check
    echo "Running health checks..."

    if curl -s "http://localhost:9000/health" > /dev/null; then
        echo "  Backend: OK"
    else
        echo "  Backend: FAILED"
    fi

    if curl -s "http://localhost:8000" > /dev/null; then
        echo "  Frontend: OK"
    else
        echo "  Frontend: FAILED"
    fi

    echo ""
    echo "Production deployment complete!"
    echo ""
    echo "Services should be available at:"
    echo "  - Store:   https://$DOMAIN"
    echo "  - API:     https://api.$DOMAIN"
    echo "  - Admin:   https://api.$DOMAIN/app"
}

# Function: Show status
show_status() {
    echo ""
    echo "Container Status:"
    docker-compose ps
    echo ""
    echo "Recent Logs:"
    docker-compose logs --tail=20
}

# Main
case $ENVIRONMENT in
    dev|development)
        deploy_dev
        ;;
    prod|production)
        deploy_prod
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 [dev|prod|status]"
        exit 1
        ;;
esac

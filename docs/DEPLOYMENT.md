# Acropaq Store - Deployment Guide

This guide covers ongoing deployments after the initial server setup.

## Quick Deploy

```bash
# SSH to server
ssh ubuntu@your-server.com

# Navigate to project
cd ~/acropaq-store

# Pull latest code and deploy
git pull origin main
./scripts/deploy.sh prod
```

## Deployment Workflow

### 1. Local Development

```bash
# Start local development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 2. Push Changes

```bash
# Commit your changes
git add .
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

### 3. Deploy to Production

```bash
# SSH to server
ssh ubuntu@your-server.com

# Navigate to project
cd ~/acropaq-store

# Deploy
./scripts/deploy.sh prod
```

## Zero-Downtime Deployment

For zero-downtime deployments:

```bash
# Build new images without stopping
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Replace containers one at a time
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps frontend
```

## Database Migrations

Migrations run automatically during deployment, but can be run manually:

```bash
# Run migrations
docker compose exec backend npm run migrations

# Check migration status
docker compose exec backend npx medusa migrations run --dry-run
```

## Environment Updates

When adding new environment variables:

1. Add to `.env.example` (committed)
2. Add to production `.env` on server (not committed)
3. Rebuild and restart containers

```bash
# After updating .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Rollback

If something goes wrong:

```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit
git checkout <commit-hash>
./scripts/deploy.sh prod

# Or reset to previous state
git reset --hard HEAD~1
./scripts/deploy.sh prod
```

## Monitoring Deployment

```bash
# Check container status
docker compose ps

# Check health endpoints
curl http://localhost:9000/health  # Backend
curl http://localhost:8000         # Frontend

# View logs
docker compose logs -f --tail=100
```

## Common Issues

### Container won't start

```bash
# Check logs
docker compose logs <service-name>

# Common fixes:
# 1. Database not ready - wait and retry
# 2. Port conflict - check other services
# 3. Missing env vars - check .env file
```

### Build fails

```bash
# Clear Docker cache and rebuild
docker system prune -f
docker compose build --no-cache
```

### Database connection errors

```bash
# Check PostgreSQL
docker compose logs postgres

# Verify connection
docker compose exec backend node -e "
  const { Client } = require('pg');
  const c = new Client({connectionString: process.env.DATABASE_URL});
  c.connect().then(() => console.log('OK')).catch(console.error);
"
```

## Scheduled Deployments

For CI/CD, add to your GitHub Actions:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/acropaq-store
            git pull origin main
            ./scripts/deploy.sh prod
```

## Performance Tips

1. **Use Docker layer caching**: Don't change package.json unnecessarily
2. **Parallel builds**: Backend and frontend can build simultaneously
3. **Health checks**: Ensure health checks pass before routing traffic
4. **Resource limits**: Set memory limits in docker-compose.prod.yml if needed

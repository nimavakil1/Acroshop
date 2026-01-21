# Acropaq Store - Server Setup Guide

This guide covers the first-time setup of the Acropaq Store on a fresh Ubuntu server.

## Prerequisites

- Ubuntu 22.04 LTS or later
- At least 2GB RAM, 2 CPU cores
- Domain name pointing to your server (e.g., shop.acropaq.com, api.acropaq.com)
- SSH access to the server

## 1. Initial Server Setup

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker
```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group change to take effect
```

### Install Git
```bash
sudo apt install -y git
```

## 2. Clone the Repository

```bash
# Clone to home directory
cd ~
git clone https://github.com/YOUR_USERNAME/acropaq-store.git
cd acropaq-store
```

## 3. Create Data Directories

```bash
# Create persistent storage directories
sudo mkdir -p /data/acropaq/{postgres,redis,uploads,certbot/conf,certbot/www}
sudo chown -R $USER:$USER /data/acropaq
```

## 4. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your production values
nano .env
```

### Required Environment Variables

```bash
# Domain
DOMAIN=shop.acropaq.com

# Database (use strong passwords!)
POSTGRES_PASSWORD=your_secure_postgres_password

# Redis (optional password)
REDIS_PASSWORD=your_secure_redis_password

# Security secrets (generate random strings)
JWT_SECRET=$(openssl rand -hex 64)
COOKIE_SECRET=$(openssl rand -hex 64)

# Stripe
STRIPE_API_KEY=sk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_KEY=pk_live_your_publishable_key

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
```

## 5. Configure SSL Certificates

### Option A: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot

# Stop any running nginx
sudo systemctl stop nginx 2>/dev/null || true

# Get certificates
sudo certbot certonly --standalone \
  -d shop.acropaq.com \
  -d api.acropaq.com \
  --non-interactive \
  --agree-tos \
  --email your@email.com

# Copy certificates to project location
sudo cp -r /etc/letsencrypt /data/acropaq/certbot/conf/
sudo chown -R $USER:$USER /data/acropaq/certbot
```

### Option B: Use provided nginx config with Certbot container

The docker-compose.prod.yml includes a Certbot container that handles automatic renewal.

## 6. Update Nginx Configuration

Edit `nginx/nginx.conf` and update:
- `server_name` to your actual domains
- SSL certificate paths if different

## 7. Deploy

```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh prod
```

## 8. Initial Admin Setup

After deployment, access the Medusa admin:

1. Go to `https://api.shop.acropaq.com/app`
2. Create your admin account
3. Configure store settings (currency, regions, etc.)

## 9. Import Data

Run the data import scripts to migrate your Shopify data:

```bash
# SSH into the backend container
docker exec -it acropaq-backend sh

# Run import script
node /app/scripts/import-data.js
```

## 10. Set Up Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://api.shop.acropaq.com/hooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the signing secret to your `.env` as `STRIPE_WEBHOOK_SECRET`
5. Restart: `./scripts/deploy.sh prod`

## Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Monitoring

### View logs
```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
```

### Check container status
```bash
docker compose ps
```

### Check disk usage
```bash
df -h
du -sh /data/acropaq/*
```

## Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
docker compose logs postgres

# Connect to database directly
docker compose exec postgres psql -U medusa -d acropaq_store
```

### Backend not starting
```bash
# Check logs
docker compose logs backend

# Common issues:
# - Database not ready (wait and restart)
# - Missing environment variables
# - Port already in use
```

### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

## Backup

### Database backup
```bash
# Create backup
docker compose exec postgres pg_dump -U medusa acropaq_store > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup.sql | docker compose exec -T postgres psql -U medusa -d acropaq_store
```

### Full backup script
```bash
#!/bin/bash
BACKUP_DIR=/data/backups/acropaq
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database
docker compose exec -T postgres pg_dump -U medusa acropaq_store | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /data/acropaq/uploads

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete
```

## Next Steps

1. Configure your DNS to point to the server
2. Test the checkout flow with Stripe test mode first
3. Set up monitoring (e.g., UptimeRobot, Datadog)
4. Configure regular backups
5. Switch Stripe to live mode when ready

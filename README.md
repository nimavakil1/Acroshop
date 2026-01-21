# Acropaq Store

A self-hosted e-commerce platform for Acropaq, built with Medusa.js (backend) and Next.js (frontend).

## Features

- **B2B VAT Support**: EU VAT number validation via VIES with automatic reverse charge
- **Multi-currency**: EUR and GBP support
- **Multi-region**: Configured for BE, NL, DE, FR, PL, IT, CZ, UK, and EU OSS
- **Stripe Payments**: Card, Bancontact, iDEAL, and more
- **Docker-based**: Easy deployment with docker-compose

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   Medusa.js     │
│   Frontend      │     │   Backend       │
│   (Port 8000)   │     │   (Port 9000)   │
└─────────────────┘     └─────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐        ┌──────▼─────┐
              │ PostgreSQL│        │   Redis    │
              │  (5432)   │        │   (6379)   │
              └───────────┘        └────────────┘
```

## Quick Start (Development)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/acropaq-store.git
cd acropaq-store

# Start with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Access:
# - Frontend: http://localhost:8000
# - Backend:  http://localhost:9000
# - Admin:    http://localhost:9000/app
```

## Project Structure

```
acropaq-store/
├── backend/              # Medusa.js backend
│   ├── src/
│   │   ├── api/          # Custom API routes (VAT validation)
│   │   ├── services/     # Custom services
│   │   └── ...
│   ├── Dockerfile
│   └── medusa-config.js
├── frontend/             # Next.js storefront
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities (Medusa client)
│   └── Dockerfile
├── nginx/                # Nginx reverse proxy config
├── scripts/
│   ├── extraction/       # Shopify data extraction scripts
│   ├── deploy.sh         # Deployment script
│   └── import-data.js    # Data import script
├── extraction/           # Extracted Shopify data (gitignored)
├── docs/                 # Documentation
├── docker-compose.yml    # Development config
└── docker-compose.prod.yml # Production overrides
```

## Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `STRIPE_API_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_KEY` - Stripe publishable key

## Custom Features

### VAT Validation

The backend includes a custom VAT validation service that:
- Validates EU VAT numbers against VIES (EU tax service)
- Automatically applies reverse charge for valid B2B transactions
- Stores company information with orders

API endpoints:
- `POST /store/vat/validate` - Validate VAT number
- `POST /store/vat/reverse-charge` - Check reverse charge eligibility
- `POST /store/carts/:id/b2b-info` - Add B2B info to cart

### Frontend VAT Input

The checkout includes a VAT input component that:
- Validates in real-time as user types
- Shows company name from VIES
- Displays reverse charge status

## Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Set up .env with production values
cp .env.example .env
nano .env

# Deploy
./scripts/deploy.sh prod
```

See [docs/SERVER_SETUP.md](docs/SERVER_SETUP.md) for first-time server setup.
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for ongoing deployments.

## Data Migration

The `extraction/` directory contains data extracted from Shopify:
- Products (544) with images
- Collections (74)
- Customers (413)
- Orders (220)
- Theme files
- URL redirects (956)

Run the import script after deployment:
```bash
docker-compose exec backend node scripts/import-data.js
```

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally with `docker-compose up`
4. Submit a pull request

## License

Proprietary - Acropaq NV

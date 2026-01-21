# Acropaq Store - Environment Variables

Complete reference for all environment variables used in the project.

## Root Level (.env)

Used by docker-compose for production deployment.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DOMAIN` | Yes | Main domain for the store | `shop.acropaq.com` |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password | `secure_password_123` |
| `REDIS_PASSWORD` | No | Redis password (optional) | `redis_password_123` |
| `JWT_SECRET` | Yes | JWT signing secret (64+ chars) | `openssl rand -hex 64` |
| `COOKIE_SECRET` | Yes | Cookie signing secret (64+ chars) | `openssl rand -hex 64` |
| `STRIPE_API_KEY` | Yes | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_KEY` | Yes | Stripe publishable key | `pk_live_...` |
| `BREVO_API_KEY` | No | Brevo (Sendinblue) API key | `xkeysib-...` |

## Backend (backend/.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `COOKIE_SECRET` | Yes | - | Cookie signing secret |
| `ADMIN_CORS` | No | `http://localhost:7000,7001` | Allowed admin panel origins |
| `STORE_CORS` | No | `http://localhost:8000` | Allowed storefront origins |
| `AUTH_CORS` | No | Same as ADMIN_CORS | Allowed auth origins |
| `STRIPE_API_KEY` | No | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook secret |
| `BREVO_API_KEY` | No | - | Brevo API key |
| `EMAIL_FROM` | No | - | Sender email address |
| `EMAIL_FROM_NAME` | No | - | Sender name |
| `STORE_URL` | No | - | Public store URL |
| `BACKEND_URL` | No | - | Public backend URL |
| `STORE_COUNTRY` | No | `BE` | Store's country code |
| `OPEN_BROWSER` | No | `false` | Open browser on dev start |

### Database URL Format
```
postgres://user:password@host:port/database
```

Example:
```
postgres://medusa:mypassword@postgres:5432/acropaq_store
```

## Frontend (frontend/.env.local)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Yes | `http://localhost:9000` | Medusa backend URL |
| `NEXT_PUBLIC_STRIPE_KEY` | Yes | - | Stripe publishable key |
| `NEXT_PUBLIC_SITE_URL` | No | - | Public site URL |
| `NEXT_PUBLIC_STORE_NAME` | No | `Acropaq Shop` | Store name |
| `NEXT_PUBLIC_GA_ID` | No | - | Google Analytics ID |

## Environment-Specific Values

### Local Development

```bash
# Backend
DATABASE_URL=postgres://medusa:medusa@localhost:5432/acropaq_store
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret-dev-only
COOKIE_SECRET=supersecret-dev-only
STRIPE_API_KEY=sk_test_...

# Frontend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

### Production

```bash
# Backend
DATABASE_URL=postgres://medusa:${POSTGRES_PASSWORD}@postgres:5432/acropaq_store
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
JWT_SECRET=${JWT_SECRET}  # From root .env
COOKIE_SECRET=${COOKIE_SECRET}  # From root .env
ADMIN_CORS=https://admin.shop.acropaq.com
STORE_CORS=https://shop.acropaq.com
STRIPE_API_KEY=sk_live_...

# Frontend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.shop.acropaq.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
```

## Generating Secrets

```bash
# Generate JWT/Cookie secrets
openssl rand -hex 64

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use different secrets per environment** - Dev vs staging vs production
3. **Rotate secrets periodically** - Especially after team member changes
4. **Use strong passwords** - At least 32 characters for database passwords
5. **Stripe keys** - Use test keys (`sk_test_`, `pk_test_`) in development

## Stripe Webhook Configuration

In Stripe Dashboard:
1. Go to Developers > Webhooks
2. Add endpoint: `https://api.your-domain.com/hooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

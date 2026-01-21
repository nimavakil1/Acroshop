# Acropaq Store - Shopify App Replacements

This document tracks Shopify apps used on the original store and their replacements in the new Medusa-based platform.

## App Inventory

Review the apps installed on your Shopify store and document replacements below.

---

## Payment Processing

### Shopify Payments → Stripe

**Status:** ✅ Implemented

**Original:** Shopify Payments (built-in)

**Replacement:** Stripe via `medusa-payment-stripe` plugin

**Configuration:**
- Add Stripe API keys to `.env`
- Configure webhook endpoint
- Enable payment methods: Card, Bancontact, iDEAL, etc.

---

## Email / Marketing

### Shopify Email → Brevo (Sendinblue)

**Status:** 🔧 Needs Configuration

**Original:** Shopify Email or Klaviyo

**Replacement:** Brevo (Sendinblue)

**Setup:**
1. Create Brevo account
2. Add API key to `.env`
3. Create email templates in Brevo
4. Configure Medusa notification service

**Templates Needed:**
- Order confirmation
- Shipping notification
- Password reset
- Welcome email
- Abandoned cart (optional)

---

## Reviews

### [Review App Name] → [Replacement]

**Status:** ⏳ To Be Decided

**Options:**
1. **Judge.me API** - Can continue using if they have an API
2. **Custom solution** - Build review system in Medusa
3. **Yotpo** - Has Medusa integration

**Implementation Notes:**
- Export existing reviews from Shopify
- Create review model in Medusa
- Add review display components to frontend

---

## Shipping

### Shopify Shipping → Custom Implementation

**Status:** ✅ Implemented (Basic)

**Original:** Shopify Shipping / Third-party app

**Replacement:** `medusa-fulfillment-manual` + Custom rates

**Current Setup:**
- Manual fulfillment provider
- Fixed shipping rates per region
- Free shipping over €100

**Future Enhancements:**
- GLS API integration (credentials in Agent5)
- Real-time rate calculation
- Tracking number automation

---

## Inventory Management

### [Inventory App] → Odoo Integration

**Status:** 🔧 Needs Implementation

**Original:** Shopify inventory or third-party app

**Replacement:** Odoo integration (existing in Agent5)

**Integration Points:**
- Sync stock levels from Odoo
- Push orders to Odoo
- Product sync (optional)

**Existing Code:** See `/Users/nimavakil/Agent5/backend/` for Odoo integration

---

## SEO

### [SEO App] → Built-in Next.js SEO

**Status:** ✅ Implemented

**Original:** SEO Manager, Plug in SEO, etc.

**Replacement:** Next.js metadata API + structured data

**Features:**
- Meta titles/descriptions from product data
- Open Graph tags
- JSON-LD structured data
- Automatic sitemap generation
- URL redirects preserved (956 redirects)

---

## Currency / Multi-language

### Shopify Markets → Medusa Regions

**Status:** ✅ Implemented

**Original:** Shopify Markets / Langify / etc.

**Replacement:** Medusa regions with tax rates

**Configured Regions:**
- Belgium (21% VAT)
- Netherlands (21% VAT)
- Germany (19% VAT)
- France (20% VAT)
- Poland (23% VAT)
- Italy (22% VAT)
- Czech Republic (21% VAT)
- United Kingdom (20% VAT, GBP)
- EU OSS (21% VAT, other EU countries)

---

## VAT / Tax

### [VAT App] → Custom VIES Integration

**Status:** ✅ Implemented

**Original:** Shopify Tax / Exemptify / etc.

**Replacement:** Custom VAT validation service

**Features:**
- VIES API validation for EU VAT numbers
- Automatic reverse charge for valid B2B
- Real-time validation in checkout
- Company name lookup

**Files:**
- `backend/src/services/vat-validation.js`
- `backend/src/api/index.js` (VAT endpoints)
- `frontend/src/components/checkout/VatInput.tsx`

---

## Abandoned Cart

### [Cart Recovery App] → To Be Implemented

**Status:** ⏳ Future Enhancement

**Options:**
1. **Brevo automation** - Trigger email when cart abandoned
2. **Custom solution** - Track incomplete checkouts, send reminders

---

## Analytics

### Google Analytics → Next.js + GA4

**Status:** 🔧 Needs Configuration

**Setup:**
1. Add GA4 measurement ID to frontend `.env`
2. Install `@next/third-parties` or custom GA script
3. Configure e-commerce events

---

## Customer Support

### [Chat App] → [Replacement]

**Status:** ⏳ To Be Decided

**Options:**
1. **Intercom** - Full-featured
2. **Crisp** - Affordable
3. **Tawk.to** - Free
4. **Custom** - Build with existing Teams integration

---

## Loyalty / Rewards

### [Loyalty App] → To Be Decided

**Status:** ⏳ Future Enhancement

**Options:**
1. **Custom points system** in Medusa
2. **Third-party integration**

---

## Form Builder

### [Form App] → Next.js Forms

**Status:** ✅ Implemented

**Original:** Shopify Forms / JotForm / etc.

**Replacement:** React Hook Form + custom validation

**Forms Needed:**
- Contact form
- B2B inquiry form

---

## Backup & Security

### [Backup App] → Docker Volumes + Scripts

**Status:** ✅ Implemented

**Backup Strategy:**
- PostgreSQL: `pg_dump` to compressed files
- Uploads: `tar` to archive
- Automated via cron job

**See:** `docs/SERVER_SETUP.md` for backup script

---

## Summary

| Category | Shopify App | Replacement | Status |
|----------|-------------|-------------|--------|
| Payments | Shopify Payments | Stripe | ✅ |
| Email | Shopify Email | Brevo | 🔧 |
| Reviews | TBD | TBD | ⏳ |
| Shipping | Shopify Shipping | Manual + GLS | 🔧 |
| Inventory | TBD | Odoo | 🔧 |
| SEO | SEO app | Next.js | ✅ |
| VAT | Tax app | Custom VIES | ✅ |
| Analytics | GA | GA4 | 🔧 |
| Chat | TBD | TBD | ⏳ |

**Legend:**
- ✅ Implemented
- 🔧 Needs configuration
- ⏳ Future enhancement

---

## Notes

Add notes about specific apps from your Shopify store here as you review them:

```
[App Name]: [Notes about functionality and replacement plan]
```

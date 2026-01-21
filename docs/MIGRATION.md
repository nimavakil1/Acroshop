# Acropaq Store - Data Migration Guide

This guide covers the migration of data from Shopify to the new Medusa-based store.

## Overview

The migration process consists of:
1. **Extraction** - Pull all data from Shopify via API
2. **Transformation** - Convert Shopify data format to Medusa format
3. **Import** - Load data into Medusa
4. **Verification** - Validate imported data

## Extracted Data Summary

| Data Type | Count | Location |
|-----------|-------|----------|
| Products | 544 | `extraction/products/products.json` |
| Product Images | 1,743 | `extraction/products/images/` |
| Product Metafields | 496 | `extraction/products/product-metafields.json` |
| Custom Collections | 2 | `extraction/collections/custom-collections.json` |
| Smart Collections | 72 | `extraction/collections/smart-collections.json` |
| Pages | 3 | `extraction/content/pages.json` |
| Blogs | 1 | `extraction/content/blogs.json` |
| Navigation Menus | 7 | `extraction/content/menus.json` |
| Customers | 413 | `extraction/customers/customers.json` |
| Orders | 220 | `extraction/orders/orders.json` |
| URL Redirects | 956 | `extraction/config/redirects.json` |
| Theme Files | 353 | `extraction/theme/` |

## Migration Steps

### Step 1: Products

Products are the core of the store. The migration transforms:

**Shopify → Medusa Mapping:**

| Shopify Field | Medusa Field | Notes |
|---------------|--------------|-------|
| `id` | `metadata.shopify_id` | Stored for reference |
| `title` | `title` | Direct mapping |
| `handle` | `handle` | Direct mapping |
| `body_html` | `description` | HTML stripped |
| `vendor` | `metadata.vendor` | Stored in metadata |
| `product_type` | `metadata.product_type` | Stored in metadata |
| `tags` | `metadata.tags` | Stored in metadata |
| `status` | `status` | active→published, draft→draft |
| `options` | `options` | Array of option titles |
| `variants` | `variants` | See variant mapping below |
| `images` | `images` | URLs stored, need re-upload |

**Variant Mapping:**

| Shopify Field | Medusa Field |
|---------------|--------------|
| `sku` | `sku` |
| `barcode` | `barcode` |
| `price` | `prices[0].amount` (in cents) |
| `compare_at_price` | `metadata.compare_at_price` |
| `inventory_quantity` | `inventory_quantity` |
| `weight` | `weight` |
| `option1/2/3` | `options` |

**Run product import:**
```bash
docker exec -it acropaq-backend node scripts/import-data.js --products
```

### Step 2: Collections

Collections map to Medusa product categories/collections.

**Shopify → Medusa:**
- Custom collections → Medusa collections (manual product assignment)
- Smart collections → Can be recreated with Medusa filters or converted to manual

**Run collection import:**
```bash
docker exec -it acropaq-backend node scripts/import-data.js --collections
```

### Step 3: Images

Product images need to be uploaded to your storage solution:

1. **Local storage** (development): Images in `uploads/`
2. **S3/MinIO** (production): Configure S3 plugin

```bash
# Upload images from extraction directory
node scripts/upload-images.js
```

### Step 4: Customers

**GDPR Considerations:**
- Customer data contains personal information
- Consider notifying customers about platform migration
- Send password reset emails rather than migrating passwords

**Mapping:**

| Shopify Field | Medusa Field |
|---------------|--------------|
| `email` | `email` |
| `first_name` | `first_name` |
| `last_name` | `last_name` |
| `phone` | `phone` |
| `addresses` | `shipping_addresses` |
| `default_address` | `shipping_addresses[0]` (marked default) |

**Run customer import:**
```bash
docker exec -it acropaq-backend node scripts/import-data.js --customers
```

### Step 5: Orders (Historical)

Order history is imported for reference only. New orders will be processed through Medusa.

**Note:** Historical orders are stored in `extraction/orders/orders.json` for reference but may not need to be imported into Medusa.

### Step 6: Content Pages

Pages need manual recreation in your frontend:

1. Review pages in `extraction/content/pages.json`
2. Create corresponding Next.js pages in `frontend/src/app/`
3. Copy content (HTML may need adjustment)

Extracted pages:
- About Us
- Contact
- [Other pages from your store]

### Step 7: URL Redirects

Critical for SEO preservation:

```bash
# Generate redirect configurations
node scripts/setup-redirects.js
```

This creates:
- `nginx/redirects.conf` - Nginx rewrite rules
- `frontend/redirects.config.js` - Next.js redirects

## Verification Checklist

After migration, verify:

- [ ] All products visible in admin
- [ ] Product images displaying correctly
- [ ] Variants and pricing correct
- [ ] Collections contain correct products
- [ ] Customer accounts can log in (after password reset)
- [ ] URL redirects working (test old Shopify URLs)
- [ ] Search returning correct results
- [ ] Checkout flow complete

## Common Issues

### Images Not Loading
- Check image URLs in product data
- Verify images uploaded to storage
- Check CORS settings

### Missing Variants
- Verify variant data in extraction
- Check option value mapping

### Price Discrepancies
- Shopify uses decimal (10.99)
- Medusa uses cents (1099)
- Verify conversion in import script

### Customer Login Issues
- Passwords cannot be migrated (hashed)
- Use password reset flow
- Send welcome email with reset link

## Data Location Reference

```
extraction/
├── products/
│   ├── products.json           # All products with variants
│   ├── product-metafields.json # Metafields by product ID
│   └── images/                 # Downloaded product images
├── collections/
│   ├── custom-collections.json
│   ├── smart-collections.json
│   └── collection-products.json
├── content/
│   ├── pages.json
│   ├── blogs.json
│   ├── articles.json
│   └── menus.json
├── customers/
│   └── customers.json
├── orders/
│   └── orders.json
├── inventory/
│   └── inventory-levels.json
├── config/
│   ├── shop-info.json
│   ├── shipping-zones.json
│   ├── redirects.json
│   └── policies.json
└── theme/
    └── [complete theme files]
```

#!/usr/bin/env node
/**
 * Shopify Store Extraction - Remaining Items
 *
 * Continues extraction from where extract-all.js stopped
 */

const fs = require('fs');
const path = require('path');

// Load env from Agent5
const envContent = fs.readFileSync('/Users/nimavakil/Agent5/backend/.env', 'utf8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const {
  SHOP,
  shopifyGet,
  shopifyGetAll,
  saveJson,
} = require('./shopify-api');

const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

const EXTRACTION_DIR = path.join(__dirname, '../../extraction');

function log(message) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${message}`);
}

function logSection(title) {
  console.log('');
  console.log('='.repeat(60));
  console.log(title);
  console.log('='.repeat(60));
}

// ============================================================
// SHIPPING & LOCATIONS
// ============================================================

async function extractShipping() {
  logSection('EXTRACTING SHIPPING CONFIGURATION');

  log('Fetching shipping zones...');
  const zonesData = await shopifyGet('/shipping_zones.json');
  const shippingZones = zonesData.shipping_zones;
  log(`Found ${shippingZones.length} shipping zones`);

  log('Fetching locations...');
  const locationsData = await shopifyGet('/locations.json');
  const locations = locationsData.locations;
  log(`Found ${locations.length} locations`);

  // Get inventory levels - simplified approach using inventory items from products
  log('Fetching inventory levels...');
  const inventoryLevels = [];

  for (const location of locations) {
    log(`  Fetching inventory for location "${location.name}"...`);

    // Fetch inventory levels in batches using the Link header pagination
    let url = `/inventory_levels.json?location_ids=${location.id}&limit=250`;
    let pageCount = 0;

    while (url) {
      pageCount++;
      log(`    Page ${pageCount}...`);

      const fullUrl = url.startsWith('http')
        ? url
        : `https://${SHOP}/admin/api/2024-07${url}`;

      const response = await fetch(fullUrl, {
        headers: {
          'X-Shopify-Access-Token': ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        log(`    Warning: Could not fetch page ${pageCount}: ${response.status}`);
        break;
      }

      const data = await response.json();
      const levels = data.inventory_levels || [];
      inventoryLevels.push(...levels);

      // Check for next page via Link header
      const linkHeader = response.headers.get('Link');
      url = null;

      if (linkHeader && levels.length === 250) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (nextMatch) {
          url = nextMatch[1];
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }
  }

  log(`Found ${inventoryLevels.length} inventory level records`);

  saveJson(shippingZones, path.join(EXTRACTION_DIR, 'config/shipping-zones.json'));
  saveJson(locations, path.join(EXTRACTION_DIR, 'config/locations.json'));
  saveJson(inventoryLevels, path.join(EXTRACTION_DIR, 'inventory/inventory-levels.json'));

  return { shippingZones, locations, inventoryLevels };
}

// ============================================================
// PRICE RULES & DISCOUNTS
// ============================================================

async function extractPriceRules() {
  logSection('EXTRACTING PRICE RULES & DISCOUNTS');

  log('Fetching price rules...');
  const priceRules = await shopifyGetAll('/price_rules.json', 'price_rules', {
    onProgress: log,
  });
  log(`Found ${priceRules.length} price rules`);

  // Get discount codes for each price rule
  const discountCodes = {};
  for (const rule of priceRules) {
    try {
      const codes = await shopifyGetAll(
        `/price_rules/${rule.id}/discount_codes.json`,
        'discount_codes'
      );
      if (codes.length > 0) {
        discountCodes[rule.id] = codes;
      }
    } catch (err) {
      log(`  Warning: Could not fetch discount codes for rule ${rule.id}: ${err.message}`);
    }
  }

  saveJson(priceRules, path.join(EXTRACTION_DIR, 'config/price-rules.json'));
  saveJson(discountCodes, path.join(EXTRACTION_DIR, 'config/discount-codes.json'));

  return { priceRules, discountCodes };
}

// ============================================================
// REDIRECTS
// ============================================================

async function extractRedirects() {
  logSection('EXTRACTING REDIRECTS');

  log('Fetching URL redirects...');
  const redirects = await shopifyGetAll('/redirects.json', 'redirects', {
    onProgress: log,
  });
  log(`Found ${redirects.length} redirects`);

  saveJson(redirects, path.join(EXTRACTION_DIR, 'config/redirects.json'));

  return { redirects };
}

// ============================================================
// SHOP METAFIELDS
// ============================================================

async function extractShopMetafields() {
  logSection('EXTRACTING SHOP METAFIELDS');

  log('Fetching shop metafields...');
  const metafieldsData = await shopifyGet('/metafields.json');
  const metafields = metafieldsData.metafields;
  log(`Found ${metafields.length} shop metafields`);

  saveJson(metafields, path.join(EXTRACTION_DIR, 'config/shop-metafields.json'));

  return { metafields };
}

// ============================================================
// POLICIES
// ============================================================

async function extractPolicies() {
  logSection('EXTRACTING POLICIES');

  log('Fetching shop policies...');
  const policiesData = await shopifyGet('/policies.json');
  const policies = policiesData.policies;
  log(`Found ${policies.length} policies`);

  saveJson(policies, path.join(EXTRACTION_DIR, 'config/policies.json'));

  return { policies };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('');
  console.log('Continuing Shopify extraction...');
  console.log('');

  const summary = {};

  try {
    // Load existing summary if available
    const summaryPath = path.join(EXTRACTION_DIR, 'extraction-summary.json');
    let existingSummary = {};
    try {
      existingSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    } catch {}

    // Continue with remaining extractions
    const shipping = await extractShipping();
    summary.shippingZones = shipping.shippingZones.length;
    summary.locations = shipping.locations.length;
    summary.inventoryLevels = shipping.inventoryLevels.length;

    const priceRules = await extractPriceRules();
    summary.priceRules = priceRules.priceRules.length;

    const redirects = await extractRedirects();
    summary.redirects = redirects.redirects.length;

    const metafields = await extractShopMetafields();
    summary.shopMetafields = metafields.metafields.length;

    const policies = await extractPolicies();
    summary.policies = policies.policies.length;

    // Merge with existing summary
    const finalSummary = { ...existingSummary, ...summary, completedAt: new Date().toISOString() };
    saveJson(finalSummary, summaryPath);

    // Print summary
    logSection('REMAINING EXTRACTION COMPLETE');
    console.log('');
    console.log('Summary of remaining items:');
    console.log(`  Shipping Zones: ${summary.shippingZones}`);
    console.log(`  Locations: ${summary.locations}`);
    console.log(`  Inventory Levels: ${summary.inventoryLevels}`);
    console.log(`  Price Rules: ${summary.priceRules}`);
    console.log(`  Redirects: ${summary.redirects}`);
    console.log(`  Shop Metafields: ${summary.shopMetafields}`);
    console.log(`  Policies: ${summary.policies}`);
    console.log('');

  } catch (err) {
    console.error('');
    console.error('EXTRACTION FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
/**
 * Phase 0: Shopify API Access Test
 *
 * This script tests the Shopify Admin API credentials and verifies
 * which endpoints/scopes are accessible for the store migration.
 *
 * Run: node scripts/test-shopify-access.js
 */

const fs = require('fs');
const path = require('path');

// Read credentials from Agent5 .env file
function loadEnvFile(envPath) {
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  return env;
}

const AGENT5_ENV_PATH = '/Users/nimavakil/Agent5/backend/.env';

console.log('='.repeat(60));
console.log('SHOPIFY API ACCESS TEST - Phase 0');
console.log('='.repeat(60));
console.log('');

// Load credentials
let env;
try {
  env = loadEnvFile(AGENT5_ENV_PATH);
  console.log(`[OK] Loaded .env from ${AGENT5_ENV_PATH}`);
} catch (err) {
  console.error(`[FAIL] Could not read .env file: ${err.message}`);
  process.exit(1);
}

// Extract Shopify credentials
const SHOP = env.SHOP || env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = env.SHOPIFY_ADMIN_TOKEN || env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-07';

if (!SHOP) {
  console.error('[FAIL] No SHOP or SHOPIFY_STORE_DOMAIN found in .env');
  process.exit(1);
}

if (!ADMIN_TOKEN) {
  console.error('[FAIL] No SHOPIFY_ADMIN_TOKEN or SHOPIFY_ADMIN_ACCESS_TOKEN found in .env');
  process.exit(1);
}

console.log(`[OK] Shop domain: ${SHOP}`);
console.log(`[OK] Admin token found: ${ADMIN_TOKEN.substring(0, 10)}...`);
console.log(`[OK] API version: ${API_VERSION}`);
console.log('');

// Define all endpoints to test
const ENDPOINTS = [
  {
    name: 'Products',
    path: '/products.json?limit=1',
    required: true,
    scope: 'read_products',
  },
  {
    name: 'Custom Collections',
    path: '/custom_collections.json?limit=1',
    required: true,
    scope: 'read_products',
  },
  {
    name: 'Smart Collections',
    path: '/smart_collections.json?limit=1',
    required: true,
    scope: 'read_products',
  },
  {
    name: 'Pages',
    path: '/pages.json?limit=1',
    required: true,
    scope: 'read_content',
  },
  {
    name: 'Blogs',
    path: '/blogs.json?limit=1',
    required: false,
    scope: 'read_content',
  },
  {
    name: 'Themes',
    path: '/themes.json',
    required: true,
    scope: 'read_themes',
  },
  {
    name: 'Customers',
    path: '/customers.json?limit=1',
    required: true,
    scope: 'read_customers',
  },
  {
    name: 'Orders',
    path: '/orders.json?limit=1&status=any',
    required: true,
    scope: 'read_orders',
  },
  {
    name: 'Shipping Zones',
    path: '/shipping_zones.json',
    required: true,
    scope: 'read_shipping',
  },
  {
    name: 'Locations',
    path: '/locations.json',
    required: true,
    scope: 'read_inventory',
  },
  {
    name: 'Price Rules',
    path: '/price_rules.json?limit=1',
    required: false,
    scope: 'read_price_rules',
  },
  {
    name: 'Redirects',
    path: '/redirects.json?limit=1',
    required: true,
    scope: 'read_content',
  },
  {
    name: 'Metafields (Shop)',
    path: '/metafields.json?limit=1',
    required: false,
    scope: 'read_metafields',
  },
  {
    name: 'Inventory Levels',
    path: '/inventory_levels.json',
    required: true,
    scope: 'read_inventory',
    customTest: true,
    needsLocationId: true,
  },
  {
    name: 'Theme Assets',
    path: '/themes.json',  // We'll get theme ID first, then test assets
    required: true,
    scope: 'read_themes',
    customTest: true,
  },
];

async function testEndpoint(endpoint) {
  const url = `https://${SHOP}/admin/api/${API_VERSION}${endpoint.path}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const count = getDataCount(data);
      return {
        success: true,
        status: response.status,
        count,
        message: count !== null ? `Found ${count} item(s)` : 'OK',
      };
    } else {
      const text = await response.text();
      let errorDetail = '';
      try {
        const errorJson = JSON.parse(text);
        errorDetail = errorJson.errors || text;
      } catch {
        errorDetail = text;
      }
      return {
        success: false,
        status: response.status,
        message: `HTTP ${response.status}: ${errorDetail}`,
      };
    }
  } catch (err) {
    return {
      success: false,
      status: 0,
      message: `Network error: ${err.message}`,
    };
  }
}

function getDataCount(data) {
  // Try to extract count from common response structures
  const keys = Object.keys(data);
  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key].length;
    }
  }
  return null;
}

async function testInventoryLevels() {
  // First get a location ID
  const locationsUrl = `https://${SHOP}/admin/api/${API_VERSION}/locations.json`;

  try {
    const response = await fetch(locationsUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: 'Could not fetch locations',
      };
    }

    const data = await response.json();
    const location = data.locations?.[0];

    if (!location) {
      return {
        success: false,
        status: 200,
        message: 'No locations found',
      };
    }

    // Now test inventory levels with location_id
    const invUrl = `https://${SHOP}/admin/api/${API_VERSION}/inventory_levels.json?location_ids=${location.id}&limit=1`;
    const invResponse = await fetch(invUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (invResponse.ok) {
      const invData = await invResponse.json();
      return {
        success: true,
        status: 200,
        count: invData.inventory_levels?.length || 0,
        message: `Found ${invData.inventory_levels?.length || 0} inventory level(s) at "${location.name}"`,
      };
    } else {
      return {
        success: false,
        status: invResponse.status,
        message: `Could not access inventory levels: HTTP ${invResponse.status}`,
      };
    }
  } catch (err) {
    return {
      success: false,
      status: 0,
      message: `Network error: ${err.message}`,
    };
  }
}

async function testThemeAssets() {
  // First get themes to find the main theme ID
  const themesUrl = `https://${SHOP}/admin/api/${API_VERSION}/themes.json`;

  try {
    const response = await fetch(themesUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: 'Could not fetch themes',
      };
    }

    const data = await response.json();
    const mainTheme = data.themes?.find(t => t.role === 'main');

    if (!mainTheme) {
      return {
        success: false,
        status: 200,
        message: 'No main theme found',
      };
    }

    // Now test assets endpoint
    const assetsUrl = `https://${SHOP}/admin/api/${API_VERSION}/themes/${mainTheme.id}/assets.json`;
    const assetsResponse = await fetch(assetsUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (assetsResponse.ok) {
      const assetsData = await assetsResponse.json();
      return {
        success: true,
        status: 200,
        count: assetsData.assets?.length || 0,
        message: `Theme "${mainTheme.name}" has ${assetsData.assets?.length || 0} assets`,
      };
    } else {
      return {
        success: false,
        status: assetsResponse.status,
        message: `Could not access theme assets: HTTP ${assetsResponse.status}`,
      };
    }
  } catch (err) {
    return {
      success: false,
      status: 0,
      message: `Network error: ${err.message}`,
    };
  }
}

async function runTests() {
  console.log('Testing API Endpoints...');
  console.log('-'.repeat(60));

  const results = [];

  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`Testing ${endpoint.name.padEnd(20)}... `);

    let result;
    if (endpoint.name === 'Theme Assets') {
      result = await testThemeAssets();
    } else if (endpoint.name === 'Inventory Levels') {
      result = await testInventoryLevels();
    } else {
      result = await testEndpoint(endpoint);
    }

    result.endpoint = endpoint;
    results.push(result);

    if (result.success) {
      console.log(`[OK] ${result.message}`);
    } else {
      console.log(`[FAIL] ${result.message}`);
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const criticalFailed = failed.filter(r => r.endpoint.required);

  console.log(`Total endpoints tested: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('');
    console.log('FAILED ENDPOINTS:');
    failed.forEach(r => {
      const critical = r.endpoint.required ? ' [CRITICAL]' : ' [optional]';
      console.log(`  - ${r.endpoint.name}${critical}: ${r.endpoint.scope}`);
    });
  }

  if (criticalFailed.length > 0) {
    console.log('');
    console.log('='.repeat(60));
    console.log('ACTION REQUIRED');
    console.log('='.repeat(60));
    console.log('');
    console.log('The following CRITICAL scopes are missing from your Shopify app:');
    const missingScopes = [...new Set(criticalFailed.map(r => r.endpoint.scope))];
    missingScopes.forEach(scope => {
      console.log(`  - ${scope}`);
    });
    console.log('');
    console.log('To fix this:');
    console.log('1. Go to your Shopify Partner Dashboard');
    console.log('2. Select your app');
    console.log('3. Go to API access / Scopes');
    console.log('4. Add the missing scopes listed above');
    console.log('5. Reinstall the app on your store to apply new scopes');
    console.log('');
    console.log('STOPPING - Cannot proceed with extraction until API access is fixed.');
    process.exit(1);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('ALL CRITICAL ENDPOINTS ACCESSIBLE');
  console.log('='.repeat(60));
  console.log('');
  console.log('You can proceed with Phase 1: Data Extraction');
  console.log('');

  return results;
}

// Run tests
runTests().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

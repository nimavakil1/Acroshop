/**
 * Shopify API utilities with rate limiting and pagination
 */

const fs = require('fs');
const path = require('path');

// Load credentials from Agent5 .env
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
const env = loadEnvFile(AGENT5_ENV_PATH);

const SHOP = env.SHOP || env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = env.SHOPIFY_ADMIN_TOKEN || env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-07';

if (!SHOP || !ADMIN_TOKEN) {
  throw new Error('Missing Shopify credentials in .env');
}

// Rate limiting - Shopify allows 2 requests/second for REST API
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 550; // ms between requests (slightly over 0.5s to be safe)

async function rateLimitedFetch(url, options = {}) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();

  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': ADMIN_TOKEN,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  // Check for rate limit headers
  const callLimit = response.headers.get('X-Shopify-Shop-Api-Call-Limit');
  if (callLimit) {
    const [used, max] = callLimit.split('/').map(Number);
    if (used >= max - 2) {
      // Getting close to limit, slow down
      await sleep(1000);
    }
  }

  return response;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a single endpoint
 */
async function shopifyGet(path) {
  const url = `https://${SHOP}/admin/api/${API_VERSION}${path}`;

  const response = await rateLimitedFetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Fetch all pages of a paginated endpoint
 */
async function shopifyGetAll(basePath, dataKey, options = {}) {
  const allItems = [];
  let pageInfo = null;
  let pageCount = 0;
  const limit = options.limit || 250;

  // Extract base path without query params for page_info pagination
  const [basePathClean, queryString] = basePath.includes('?')
    ? basePath.split('?')
    : [basePath, ''];

  while (true) {
    pageCount++;
    let url;

    if (pageInfo) {
      // When using page_info, we can only use limit parameter, not other query params
      url = `https://${SHOP}/admin/api/${API_VERSION}${basePathClean}?limit=${limit}&page_info=${pageInfo}`;
    } else {
      const separator = basePath.includes('?') ? '&' : '?';
      url = `https://${SHOP}/admin/api/${API_VERSION}${basePath}${separator}limit=${limit}`;
    }

    if (options.onProgress) {
      options.onProgress(`  Fetching page ${pageCount}...`);
    }

    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Shopify API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const items = data[dataKey] || [];
    allItems.push(...items);

    // Check for next page via Link header
    const linkHeader = response.headers.get('Link');
    pageInfo = null;

    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]*page_info=([^>&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
      }
    }

    if (!pageInfo || items.length < limit) {
      break;
    }
  }

  return allItems;
}

/**
 * Download a file from URL
 */
async function downloadFile(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

/**
 * Save data to JSON file
 */
function saveJson(data, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * GraphQL query
 */
async function shopifyGraphQL(query, variables = {}) {
  const url = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;

  const response = await rateLimitedFetch(url, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify GraphQL error ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

module.exports = {
  SHOP,
  API_VERSION,
  shopifyGet,
  shopifyGetAll,
  shopifyGraphQL,
  downloadFile,
  saveJson,
  sleep,
};

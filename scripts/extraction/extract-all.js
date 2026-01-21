#!/usr/bin/env node
/**
 * Shopify Store Extraction - Main Script
 *
 * Extracts all data from acropaq-shop.myshopify.com
 *
 * Run: node scripts/extraction/extract-all.js
 */

const fs = require('fs');
const path = require('path');
const {
  SHOP,
  shopifyGet,
  shopifyGetAll,
  shopifyGraphQL,
  downloadFile,
  saveJson,
  sleep,
} = require('./shopify-api');

const EXTRACTION_DIR = path.join(__dirname, '../../extraction');

// Ensure extraction directory exists
fs.mkdirSync(EXTRACTION_DIR, { recursive: true });

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
// PRODUCTS
// ============================================================

async function extractProducts() {
  logSection('EXTRACTING PRODUCTS');

  log('Fetching all products...');
  const products = await shopifyGetAll('/products.json', 'products', {
    onProgress: log,
  });
  log(`Found ${products.length} products`);

  // Save products
  saveJson(products, path.join(EXTRACTION_DIR, 'products/products.json'));

  // Extract product metafields
  log('Fetching product metafields...');
  const productMetafields = {};

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (i % 10 === 0) {
      log(`  Processing product ${i + 1}/${products.length}...`);
    }

    try {
      const data = await shopifyGet(`/products/${product.id}/metafields.json`);
      if (data.metafields && data.metafields.length > 0) {
        productMetafields[product.id] = data.metafields;
      }
    } catch (err) {
      log(`  Warning: Could not fetch metafields for product ${product.id}: ${err.message}`);
    }
  }

  saveJson(productMetafields, path.join(EXTRACTION_DIR, 'products/product-metafields.json'));
  log(`Saved metafields for ${Object.keys(productMetafields).length} products`);

  // Download product images
  log('Downloading product images...');
  const imagesDir = path.join(EXTRACTION_DIR, 'products/images');
  fs.mkdirSync(imagesDir, { recursive: true });

  let imageCount = 0;
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        const ext = path.extname(new URL(image.src).pathname) || '.jpg';
        const filename = `${product.id}_${image.id}${ext}`;
        const destPath = path.join(imagesDir, filename);

        if (!fs.existsSync(destPath)) {
          try {
            await downloadFile(image.src, destPath);
            imageCount++;

            if (imageCount % 20 === 0) {
              log(`  Downloaded ${imageCount} images...`);
            }
          } catch (err) {
            log(`  Warning: Could not download image ${image.id}: ${err.message}`);
          }
        }
      }
    }
  }

  log(`Downloaded ${imageCount} product images`);

  return { products, productMetafields };
}

// ============================================================
// COLLECTIONS
// ============================================================

async function extractCollections() {
  logSection('EXTRACTING COLLECTIONS');

  // Custom collections
  log('Fetching custom collections...');
  const customCollections = await shopifyGetAll('/custom_collections.json', 'custom_collections', {
    onProgress: log,
  });
  log(`Found ${customCollections.length} custom collections`);

  // Smart collections
  log('Fetching smart collections...');
  const smartCollections = await shopifyGetAll('/smart_collections.json', 'smart_collections', {
    onProgress: log,
  });
  log(`Found ${smartCollections.length} smart collections`);

  // Get products in each custom collection (collects)
  log('Fetching collection products...');
  const collectionProducts = {};

  for (const collection of customCollections) {
    try {
      const collects = await shopifyGetAll(
        `/collects.json?collection_id=${collection.id}`,
        'collects'
      );
      collectionProducts[collection.id] = collects.map(c => c.product_id);
    } catch (err) {
      log(`  Warning: Could not fetch products for collection ${collection.id}: ${err.message}`);
    }
  }

  // Download collection images
  log('Downloading collection images...');
  const imagesDir = path.join(EXTRACTION_DIR, 'collections/images');
  fs.mkdirSync(imagesDir, { recursive: true });

  const allCollections = [...customCollections, ...smartCollections];
  for (const collection of allCollections) {
    if (collection.image && collection.image.src) {
      const ext = path.extname(new URL(collection.image.src).pathname) || '.jpg';
      const filename = `collection_${collection.id}${ext}`;
      const destPath = path.join(imagesDir, filename);

      if (!fs.existsSync(destPath)) {
        try {
          await downloadFile(collection.image.src, destPath);
        } catch (err) {
          log(`  Warning: Could not download collection image: ${err.message}`);
        }
      }
    }
  }

  saveJson(customCollections, path.join(EXTRACTION_DIR, 'collections/custom-collections.json'));
  saveJson(smartCollections, path.join(EXTRACTION_DIR, 'collections/smart-collections.json'));
  saveJson(collectionProducts, path.join(EXTRACTION_DIR, 'collections/collection-products.json'));

  return { customCollections, smartCollections, collectionProducts };
}

// ============================================================
// PAGES
// ============================================================

async function extractPages() {
  logSection('EXTRACTING PAGES');

  log('Fetching all pages...');
  const pages = await shopifyGetAll('/pages.json', 'pages', {
    onProgress: log,
  });
  log(`Found ${pages.length} pages`);

  saveJson(pages, path.join(EXTRACTION_DIR, 'content/pages.json'));

  return { pages };
}

// ============================================================
// BLOGS & ARTICLES
// ============================================================

async function extractBlogs() {
  logSection('EXTRACTING BLOGS & ARTICLES');

  log('Fetching blogs...');
  const blogs = await shopifyGetAll('/blogs.json', 'blogs', {
    onProgress: log,
  });
  log(`Found ${blogs.length} blogs`);

  // Get articles for each blog
  const allArticles = [];
  for (const blog of blogs) {
    log(`Fetching articles for blog "${blog.title}"...`);
    const articles = await shopifyGetAll(`/blogs/${blog.id}/articles.json`, 'articles', {
      onProgress: log,
    });
    articles.forEach(a => (a.blog_id = blog.id));
    allArticles.push(...articles);
    log(`  Found ${articles.length} articles`);
  }

  saveJson(blogs, path.join(EXTRACTION_DIR, 'content/blogs.json'));
  saveJson(allArticles, path.join(EXTRACTION_DIR, 'content/articles.json'));

  return { blogs, articles: allArticles };
}

// ============================================================
// NAVIGATION MENUS
// ============================================================

async function extractMenus() {
  logSection('EXTRACTING NAVIGATION MENUS');

  log('Fetching menus via GraphQL...');

  // Use GraphQL to get menus (not available in REST API)
  const query = `
    query {
      menus(first: 50) {
        edges {
          node {
            id
            handle
            title
            items {
              id
              title
              url
              type
              items {
                id
                title
                url
                type
                items {
                  id
                  title
                  url
                  type
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL(query);
    const menus = data.menus.edges.map(e => e.node);
    log(`Found ${menus.length} menus`);

    saveJson(menus, path.join(EXTRACTION_DIR, 'content/menus.json'));

    return { menus };
  } catch (err) {
    log(`Warning: Could not fetch menus: ${err.message}`);
    return { menus: [] };
  }
}

// ============================================================
// THEMES
// ============================================================

async function extractThemes() {
  logSection('EXTRACTING THEMES');

  log('Fetching themes...');
  const data = await shopifyGet('/themes.json');
  const themes = data.themes;
  log(`Found ${themes.length} themes`);

  // Find the main (published) theme
  const mainTheme = themes.find(t => t.role === 'main');

  if (!mainTheme) {
    log('Warning: No main theme found');
    return { themes, themeAssets: [] };
  }

  log(`Main theme: "${mainTheme.name}" (ID: ${mainTheme.id})`);

  // Get all assets for the main theme
  log('Fetching theme assets...');
  const assetsData = await shopifyGet(`/themes/${mainTheme.id}/assets.json`);
  const assets = assetsData.assets;
  log(`Found ${assets.length} assets in main theme`);

  // Download each asset
  log('Downloading theme files...');
  const themeDir = path.join(EXTRACTION_DIR, 'theme');
  fs.mkdirSync(themeDir, { recursive: true });

  const assetContents = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];

    if (i % 50 === 0) {
      log(`  Processing asset ${i + 1}/${assets.length}...`);
    }

    try {
      const assetData = await shopifyGet(
        `/themes/${mainTheme.id}/assets.json?asset[key]=${encodeURIComponent(asset.key)}`
      );

      const assetContent = assetData.asset;
      assetContents.push(assetContent);

      // Save asset to file
      const assetPath = path.join(themeDir, asset.key);
      fs.mkdirSync(path.dirname(assetPath), { recursive: true });

      if (assetContent.value) {
        // Text content
        fs.writeFileSync(assetPath, assetContent.value);
      } else if (assetContent.attachment) {
        // Binary content (base64)
        fs.writeFileSync(assetPath, Buffer.from(assetContent.attachment, 'base64'));
      }
    } catch (err) {
      log(`  Warning: Could not download asset ${asset.key}: ${err.message}`);
    }
  }

  saveJson(themes, path.join(EXTRACTION_DIR, 'theme/themes-metadata.json'));
  saveJson(assetContents, path.join(EXTRACTION_DIR, 'theme/assets-metadata.json'));

  log(`Downloaded ${assetContents.length} theme files`);

  return { themes, themeAssets: assetContents };
}

// ============================================================
// CUSTOMERS
// ============================================================

async function extractCustomers() {
  logSection('EXTRACTING CUSTOMERS');

  log('Fetching all customers...');
  const customers = await shopifyGetAll('/customers.json', 'customers', {
    onProgress: log,
  });
  log(`Found ${customers.length} customers`);

  saveJson(customers, path.join(EXTRACTION_DIR, 'customers/customers.json'));

  return { customers };
}

// ============================================================
// ORDERS
// ============================================================

async function extractOrders() {
  logSection('EXTRACTING ORDERS');

  log('Fetching all orders (all statuses)...');
  const orders = await shopifyGetAll('/orders.json?status=any', 'orders', {
    onProgress: log,
  });
  log(`Found ${orders.length} orders`);

  saveJson(orders, path.join(EXTRACTION_DIR, 'orders/orders.json'));

  return { orders };
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

  // Get inventory levels for each location
  log('Fetching inventory levels...');
  const inventoryLevels = [];

  for (const location of locations) {
    log(`  Fetching inventory for location "${location.name}"...`);
    const levels = await shopifyGetAll(
      `/inventory_levels.json?location_ids=${location.id}`,
      'inventory_levels'
    );
    inventoryLevels.push(...levels);
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
// SHOP INFO
// ============================================================

async function extractShopInfo() {
  logSection('EXTRACTING SHOP INFO');

  log('Fetching shop information...');
  const shopData = await shopifyGet('/shop.json');

  saveJson(shopData.shop, path.join(EXTRACTION_DIR, 'config/shop-info.json'));

  log(`Shop: ${shopData.shop.name}`);
  log(`Domain: ${shopData.shop.domain}`);
  log(`Currency: ${shopData.shop.currency}`);
  log(`Country: ${shopData.shop.country_name}`);

  return { shop: shopData.shop };
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
// MAIN EXTRACTION
// ============================================================

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        SHOPIFY STORE EXTRACTION - ACROPAQ SHOP             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Store: ${SHOP}`);
  console.log(`Output: ${EXTRACTION_DIR}`);
  console.log(`Started: ${new Date().toISOString()}`);

  const summary = {};

  try {
    // Shop info first
    const shopInfo = await extractShopInfo();
    summary.shop = shopInfo.shop.name;

    // Products
    const products = await extractProducts();
    summary.products = products.products.length;
    summary.productMetafields = Object.keys(products.productMetafields).length;

    // Collections
    const collections = await extractCollections();
    summary.customCollections = collections.customCollections.length;
    summary.smartCollections = collections.smartCollections.length;

    // Content
    const pages = await extractPages();
    summary.pages = pages.pages.length;

    const blogs = await extractBlogs();
    summary.blogs = blogs.blogs.length;
    summary.articles = blogs.articles.length;

    const menus = await extractMenus();
    summary.menus = menus.menus.length;

    // Themes
    const themes = await extractThemes();
    summary.themes = themes.themes.length;
    summary.themeAssets = themes.themeAssets.length;

    // Customers & Orders
    const customers = await extractCustomers();
    summary.customers = customers.customers.length;

    const orders = await extractOrders();
    summary.orders = orders.orders.length;

    // Configuration
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

    // Save summary
    summary.completedAt = new Date().toISOString();
    saveJson(summary, path.join(EXTRACTION_DIR, 'extraction-summary.json'));

    // Print summary
    logSection('EXTRACTION COMPLETE');
    console.log('');
    console.log('Summary:');
    console.log(`  Shop: ${summary.shop}`);
    console.log(`  Products: ${summary.products}`);
    console.log(`  Custom Collections: ${summary.customCollections}`);
    console.log(`  Smart Collections: ${summary.smartCollections}`);
    console.log(`  Pages: ${summary.pages}`);
    console.log(`  Blogs: ${summary.blogs}`);
    console.log(`  Articles: ${summary.articles}`);
    console.log(`  Menus: ${summary.menus}`);
    console.log(`  Themes: ${summary.themes}`);
    console.log(`  Theme Assets: ${summary.themeAssets}`);
    console.log(`  Customers: ${summary.customers}`);
    console.log(`  Orders: ${summary.orders}`);
    console.log(`  Shipping Zones: ${summary.shippingZones}`);
    console.log(`  Locations: ${summary.locations}`);
    console.log(`  Inventory Levels: ${summary.inventoryLevels}`);
    console.log(`  Price Rules: ${summary.priceRules}`);
    console.log(`  Redirects: ${summary.redirects}`);
    console.log(`  Shop Metafields: ${summary.shopMetafields}`);
    console.log(`  Policies: ${summary.policies}`);
    console.log('');
    console.log(`All data saved to: ${EXTRACTION_DIR}`);
    console.log('');

  } catch (err) {
    console.error('');
    console.error('EXTRACTION FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

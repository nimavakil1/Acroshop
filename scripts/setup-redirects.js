#!/usr/bin/env node
/**
 * Acropaq Store - URL Redirects Setup
 *
 * Converts Shopify redirects to nginx/Next.js rewrites for SEO preservation.
 *
 * Usage: node scripts/setup-redirects.js
 *
 * This script:
 * 1. Reads Shopify redirects from extraction data
 * 2. Generates nginx redirect rules
 * 3. Generates Next.js rewrites config
 * 4. Creates a redirects.conf file for nginx
 */

const fs = require("fs");
const path = require("path");

const EXTRACTION_DIR = path.join(__dirname, "../extraction");
const OUTPUT_DIR = path.join(__dirname, "../nginx");

function loadJson(filename) {
  const filepath = path.join(EXTRACTION_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

// Transform Shopify URL to new URL
function transformUrl(shopifyPath) {
  // Convert Shopify paths to new store paths
  // Examples:
  //   /collections/binding -> /collections/binding
  //   /products/product-name -> /products/product-name
  //   /pages/about-us -> /about

  let newPath = shopifyPath;

  // Handle common transformations
  if (newPath.startsWith("/pages/")) {
    // /pages/about-us -> /about-us
    newPath = newPath.replace("/pages/", "/");
  }

  // Remove .html extensions if any
  newPath = newPath.replace(/\.html$/, "");

  return newPath;
}

// Generate nginx redirect rules
function generateNginxRedirects(redirects) {
  let config = "# Acropaq Store - Shopify URL Redirects\n";
  config += "# Generated from Shopify redirect export\n";
  config += "# Include this file in your nginx server block:\n";
  config += "#   include /etc/nginx/redirects.conf;\n\n";

  for (const redirect of redirects) {
    const from = redirect.path;
    const to = redirect.target;

    // Skip if same URL
    if (from === to) continue;

    // Escape special regex characters
    const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Use 301 (permanent) redirect
    config += `rewrite ^${escapedFrom}$ ${to} permanent;\n`;
  }

  return config;
}

// Generate Next.js redirects config
function generateNextRedirects(redirects) {
  const nextRedirects = redirects
    .filter(r => r.path !== r.target)
    .map(redirect => ({
      source: redirect.path,
      destination: redirect.target,
      permanent: true,
    }));

  return `// Shopify URL Redirects for Next.js
// Add this to your next.config.js redirects() function

module.exports = {
  async redirects() {
    return ${JSON.stringify(nextRedirects, null, 2)};
  }
};
`;
}

// Generate product URL mapping
function generateProductMappings(products) {
  if (!products) return "";

  let mappings = "# Product URL Mappings (Shopify -> New)\n";
  mappings += "# These products had handle changes that need redirects\n\n";

  // Most products keep the same handle, but document them
  for (const product of products.slice(0, 20)) {
    mappings += `# ${product.handle} -> /products/${product.handle}\n`;
  }

  if (products.length > 20) {
    mappings += `# ... and ${products.length - 20} more products\n`;
  }

  return mappings;
}

// Main
async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║        ACROPAQ STORE - REDIRECTS SETUP                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");

  // Load redirects
  const redirects = loadJson("config/redirects.json");
  if (!redirects) {
    console.error("Error: No redirects found in extraction data");
    process.exit(1);
  }

  console.log(`Found ${redirects.length} Shopify redirects`);

  // Load products for URL mapping
  const products = loadJson("products/products.json");
  if (products) {
    console.log(`Found ${products.length} products`);
  }

  // Generate nginx redirects
  console.log("\nGenerating nginx redirects...");
  const nginxConfig = generateNginxRedirects(redirects);
  const nginxPath = path.join(OUTPUT_DIR, "redirects.conf");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(nginxPath, nginxConfig);
  console.log(`  Written to: ${nginxPath}`);

  // Generate Next.js redirects
  console.log("\nGenerating Next.js redirects...");
  const nextConfig = generateNextRedirects(redirects);
  const nextPath = path.join(__dirname, "../frontend/redirects.config.js");
  fs.writeFileSync(nextPath, nextConfig);
  console.log(`  Written to: ${nextPath}`);

  // Generate summary
  console.log("\n=== Redirect Summary ===\n");

  // Analyze redirect types
  const byType = {
    products: 0,
    collections: 0,
    pages: 0,
    other: 0,
  };

  for (const redirect of redirects) {
    if (redirect.path.includes("/products/")) byType.products++;
    else if (redirect.path.includes("/collections/")) byType.collections++;
    else if (redirect.path.includes("/pages/")) byType.pages++;
    else byType.other++;
  }

  console.log(`Product redirects:    ${byType.products}`);
  console.log(`Collection redirects: ${byType.collections}`);
  console.log(`Page redirects:       ${byType.pages}`);
  console.log(`Other redirects:      ${byType.other}`);

  console.log("\n=== Setup Instructions ===\n");
  console.log("For Nginx:");
  console.log("  1. Copy nginx/redirects.conf to your server");
  console.log("  2. Add to your nginx server block:");
  console.log("     include /etc/nginx/redirects.conf;");
  console.log("  3. Reload nginx: sudo nginx -s reload");
  console.log("");
  console.log("For Next.js (alternative):");
  console.log("  1. Open frontend/next.config.js");
  console.log("  2. Import redirects: require('./redirects.config.js')");
  console.log("  3. Add to async redirects() function");
  console.log("");
  console.log("Note: Using nginx redirects is more efficient for large redirect lists");
}

main().catch(error => {
  console.error("Setup failed:", error);
  process.exit(1);
});

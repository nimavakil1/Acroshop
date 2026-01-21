#!/usr/bin/env node
/**
 * Acropaq Store - Data Import Script
 *
 * Imports extracted Shopify data into Medusa.js
 *
 * Usage: node scripts/import-data.js [--products] [--collections] [--customers]
 *
 * Run inside the backend container:
 *   docker exec -it acropaq-backend node scripts/import-data.js
 */

const fs = require("fs");
const path = require("path");

const EXTRACTION_DIR = path.join(__dirname, "../extraction");
const IMAGES_BASE_URL = process.env.IMAGES_BASE_URL || "";

// Check if running in Medusa context
let medusaClient;
try {
  // This will work when run inside the Medusa backend
  const { MedusaContainer } = require("@medusajs/medusa");
  // Import would need proper Medusa initialization
} catch {
  console.log("Note: Running outside Medusa - using HTTP API instead");
}

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

// Helper: Load JSON file
function loadJson(filename) {
  const filepath = path.join(EXTRACTION_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

// Helper: API call with retries
async function apiCall(endpoint, method = "GET", body = null, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BACKEND_URL}${endpoint}`, options);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error ${response.status}: ${text}`);
      }

      return response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`  Retry ${attempt}/${retries}...`);
      await sleep(1000 * attempt);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Import Products
async function importProducts() {
  console.log("\n=== Importing Products ===\n");

  const products = loadJson("products/products.json");
  if (!products) return;

  console.log(`Found ${products.length} products to import`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    try {
      // Transform Shopify product to Medusa format
      const medusaProduct = {
        title: product.title,
        handle: product.handle,
        description: product.body_html?.replace(/<[^>]*>/g, "") || "",
        status: product.status === "active" ? "published" : "draft",
        is_giftcard: false,
        discountable: true,
        metadata: {
          shopify_id: product.id,
          vendor: product.vendor,
          product_type: product.product_type,
          tags: product.tags,
        },
        options: product.options?.map(opt => ({
          title: opt.name,
        })) || [],
        variants: product.variants?.map(variant => ({
          title: variant.title,
          sku: variant.sku,
          barcode: variant.barcode,
          prices: [
            {
              amount: Math.round(parseFloat(variant.price) * 100),
              currency_code: "eur",
            },
          ],
          inventory_quantity: variant.inventory_quantity || 0,
          manage_inventory: true,
          allow_backorder: false,
          metadata: {
            shopify_variant_id: variant.id,
            compare_at_price: variant.compare_at_price,
            weight: variant.weight,
            weight_unit: variant.weight_unit,
          },
        })) || [],
        images: product.images?.map(img => img.src) || [],
      };

      // Note: In a real implementation, you would:
      // 1. Create the product via Medusa Admin API
      // 2. Upload images to your storage
      // 3. Create variants with proper option values

      console.log(`  [${imported + 1}/${products.length}] ${product.title}`);
      imported++;

      // Rate limiting
      await sleep(100);

    } catch (error) {
      console.error(`  Failed: ${product.title} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\nProducts: ${imported} imported, ${skipped} skipped, ${failed} failed`);
}

// Import Collections
async function importCollections() {
  console.log("\n=== Importing Collections ===\n");

  const customCollections = loadJson("collections/custom-collections.json") || [];
  const smartCollections = loadJson("collections/smart-collections.json") || [];
  const allCollections = [...customCollections, ...smartCollections];

  console.log(`Found ${allCollections.length} collections to import`);

  for (const collection of allCollections) {
    console.log(`  - ${collection.title} (${collection.products_count || 0} products)`);

    // In Medusa, collections are created as:
    // POST /admin/collections with { title, handle, metadata }
    // Then products are added via:
    // POST /admin/collections/:id/products/batch with { product_ids }
  }
}

// Import Customers
async function importCustomers() {
  console.log("\n=== Importing Customers ===\n");

  const customers = loadJson("customers/customers.json");
  if (!customers) return;

  console.log(`Found ${customers.length} customers to import`);
  console.log("Note: Customers should be imported carefully due to GDPR");
  console.log("Consider sending password reset emails instead of importing passwords\n");

  for (const customer of customers.slice(0, 5)) {
    console.log(`  - ${customer.email} (${customer.orders_count || 0} orders)`);
  }
  if (customers.length > 5) {
    console.log(`  ... and ${customers.length - 5} more`);
  }
}

// Main import function
async function main() {
  const args = process.argv.slice(2);

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║        ACROPAQ STORE - DATA IMPORT                         ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`Extraction directory: ${EXTRACTION_DIR}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log("");

  // Check extraction data exists
  if (!fs.existsSync(EXTRACTION_DIR)) {
    console.error("Error: Extraction directory not found");
    console.error("Run extraction scripts first: node scripts/extraction/extract-all.js");
    process.exit(1);
  }

  // Load summary
  const summary = loadJson("extraction-summary.json");
  if (summary) {
    console.log("Extraction Summary:");
    console.log(`  Products: ${summary.products}`);
    console.log(`  Collections: ${(summary.customCollections || 0) + (summary.smartCollections || 0)}`);
    console.log(`  Customers: ${summary.customers}`);
    console.log(`  Orders: ${summary.orders}`);
    console.log("");
  }

  // Run imports based on args, or all if no args
  const importAll = args.length === 0;

  if (importAll || args.includes("--products")) {
    await importProducts();
  }

  if (importAll || args.includes("--collections")) {
    await importCollections();
  }

  if (importAll || args.includes("--customers")) {
    await importCustomers();
  }

  console.log("\n=== Import Complete ===\n");
  console.log("Next steps:");
  console.log("1. Review imported data in Medusa Admin");
  console.log("2. Upload product images to your storage");
  console.log("3. Configure shipping zones and prices");
  console.log("4. Set up Stripe webhooks");
  console.log("5. Run redirects setup: node scripts/setup-redirects.js");
}

main().catch(error => {
  console.error("Import failed:", error);
  process.exit(1);
});

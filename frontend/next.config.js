/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/acroshop" : "";

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    domains: [
      "localhost",
      "cdn.shopify.com", // For migrated Shopify images
      "acropaq-shop.myshopify.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY || "",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

// Data layer for Acropaq store
// This loads the extracted Shopify data

import collectionsData from '@/data/smart-collections.json';
import customCollectionsData from '@/data/custom-collections.json';
import productsData from '@/data/products.json';
import menusData from '@/data/menus.json';

export interface Collection {
  id: number;
  handle: string;
  title: string;
  body_html: string;
  image?: {
    src: string;
    alt: string | null;
    width: number;
    height: number;
  };
}

export interface ProductVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface Product {
  id: number;
  handle: string;
  title: string;
  body_html: string;
  vendor: string;
  tags: string;
  status: string;
  variants: ProductVariant[];
  images: ProductImage[];
  image: ProductImage | null;
}

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: string;
  items: MenuItem[];
}

export interface Menu {
  id: string;
  handle: string;
  title: string;
  items: MenuItem[];
}

// Get all collections
export function getCollections(): Collection[] {
  const smart = collectionsData as Collection[];
  const custom = customCollectionsData as Collection[];
  return [...smart, ...custom];
}

// Get collection by handle
export function getCollectionByHandle(handle: string): Collection | undefined {
  return getCollections().find(c => c.handle === handle);
}

// Get all products (published only)
export function getProducts(): Product[] {
  const products = productsData as Product[];
  return products.filter(p => p.status === 'active');
}

// Get products by tag
export function getProductsByTag(tag: string): Product[] {
  return getProducts().filter(p => p.tags.includes(tag));
}

// Get product by handle
export function getProductByHandle(handle: string): Product | undefined {
  return (productsData as Product[]).find(p => p.handle === handle);
}

// Get menu by handle
export function getMenuByHandle(handle: string): Menu | undefined {
  return (menusData as Menu[]).find(m => m.handle === handle);
}

// Get main menu
export function getMainMenu(): Menu | undefined {
  return getMenuByHandle('main-menu');
}

// Get collection image URL (local)
export function getCollectionImageUrl(collectionId: number): string {
  // Check for different extensions
  const extensions = ['png', 'jpg', 'jpeg'];
  for (const ext of extensions) {
    return `/images/collections/collection_${collectionId}.${ext}`;
  }
  return `/images/collections/collection_${collectionId}.png`;
}

// Get product image URL (local)
export function getProductImageUrl(productId: number, imageId: number): string {
  return `/images/products/${productId}_${imageId}.jpg`;
}

// Featured collections for homepage
export const featuredCollectionHandles = [
  'laminiergerate',
  'laminierfolien',
  'geldkassetten',
  'ringbuch',
  'kassenladen',
  'taschenrechner',
  'anspitzer',
  'kassenrollen',
  'aktenvernichter',
  'fotoalben',
  'schneidematten',
  'kabel-organisation',
];

// Get featured collections
export function getFeaturedCollections(): Collection[] {
  const collections = getCollections();
  return featuredCollectionHandles
    .map(handle => collections.find(c => c.handle === handle))
    .filter((c): c is Collection => c !== undefined);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  DEFAULT_CANTEEN_PRESET,
  OPEN_CANTEEN_PRESET,
  CANTEEN_PRESETS,
  getDeploymentCanteenConfig,
  resolveCanteenConfig,
} from '../config/canteenConfig.ts';
import { OPEN_CANTEEN_BRAND } from '../config/brandAssets.ts';
import { mockMenuAdapter } from './mockMenuAdapter.ts';
import { MockOrderAdapter } from './mockOrderAdapter.ts';
import { MockProfileAdapter } from './mockProfileAdapter.ts';
import {
  STORAGE_KEYS,
  getOperatorStorageKey,
  type StorageLike,
} from '../utils/storageKeys.ts';

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

// ============================================================================
// PERMANENT OPEN CANTEEN BRAND REGRESSION TEST SUITE
// ============================================================================

test('Brand Regression: 1. Default configuration resolves to Open Canteen', () => {
  assert.equal(DEFAULT_CANTEEN_PRESET.identity.id, 'open-canteen');
  assert.equal(DEFAULT_CANTEEN_PRESET.identity.displayName, 'Open Canteen');
  assert.equal(DEFAULT_CANTEEN_PRESET.pwa.appName, 'Open Canteen');
  assert.equal(DEFAULT_CANTEEN_PRESET.branding.primaryColor, '#166534');
});

test('Brand Regression: 2. No query parameter is required — getDeploymentCanteenConfig defaults to Open Canteen', () => {
  const resolved = getDeploymentCanteenConfig();
  assert.equal(resolved.identity.id, 'open-canteen');
  assert.equal(resolved.identity.displayName, 'Open Canteen');
  assert.equal(resolved.identity.logoUrl, '/assets/branding/open-canteen-logo.png');
});

test('Brand Regression: 3. Legacy Campora parameters cannot re-enable Campora branding (normalized)', () => {
  const camporaNormalized = CANTEEN_PRESETS['campora-cafe'];
  assert.ok(camporaNormalized, 'campora-cafe preset must be defined');
  assert.equal(camporaNormalized.identity.id, 'open-canteen');
  assert.equal(camporaNormalized.identity.displayName, 'Open Canteen');
  assert.equal(camporaNormalized.identity.logoUrl, '/assets/branding/open-canteen-logo.png');
});

test('Brand Regression: 4. Default Home header logo uses official Open Canteen full logo', () => {
  const fullLogo = OPEN_CANTEEN_BRAND.variants.fullLogo;
  assert.equal(fullLogo.path, '/assets/branding/open-canteen-logo.png');
  assert.equal(fullLogo.width, 1318);
  assert.equal(fullLogo.height, 301);
  assert.ok(fullLogo.alt.includes('Open Canteen'));
  assert.equal(DEFAULT_CANTEEN_PRESET.identity.logoUrl, fullLogo.path);
});

test('Brand Regression: 5. Profile About metadata defaults to Open Canteen narrative', () => {
  const config = DEFAULT_CANTEEN_PRESET;
  assert.equal(config.content.aboutTitle, 'About Open Canteen');
  assert.ok(config.content.aboutBody.includes('Open Canteen is a modern, modular, open-source'));
  assert.ok(config.content.footerCopyright.includes('Open Canteen'));
});

test('Brand Regression: 6. Browser title and PWA metadata reflect Open Canteen', () => {
  const config = DEFAULT_CANTEEN_PRESET;
  assert.equal(config.pwa.appName, 'Open Canteen');
  assert.equal(config.pwa.shortName, 'Open Canteen');
  assert.equal(config.pwa.themeColor, '#166534');
});

test('Brand Regression: 7. Favicon and standalone icon reference official Open Canteen assets', () => {
  const icon = OPEN_CANTEEN_BRAND.variants.standaloneIcon;
  assert.equal(icon.path, '/assets/branding/open-canteen-icon.png');
  assert.equal(icon.width, 775);
  assert.equal(icon.height, 775);
  assert.ok(icon.alt.includes('Open Canteen'));
});

test('Brand Regression: 8. Manifest icons match approved Open Canteen files on disk', () => {
  const root = process.cwd();
  const requiredFiles = [
    'public/pwa-192x192.png',
    'public/pwa-512x512.png',
    'public/pwa-maskable-512x512.png',
    'public/apple-touch-icon.png',
    'public/icon.svg',
    'public/assets/branding/open-canteen-logo.png',
    'public/assets/branding/open-canteen-icon.png',
    'public/assets/branding/open-canteen-app-icon.png',
  ];

  for (const relPath of requiredFiles) {
    const fullPath = path.join(root, relPath);
    assert.ok(fs.existsSync(fullPath), `Required asset missing on disk: ${relPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 0, `Asset file is empty: ${relPath}`);
  }
});

test('Brand Regression: 9. Default catalog resolution serves Open Canteen catalog', async () => {
  // When operatorId is omitted, it must return Open Canteen catalog
  const defaultCatalog = await mockMenuAdapter.getCatalog('');
  assert.equal(defaultCatalog.canteenId, 'open-canteen');
  assert.equal(defaultCatalog.canteenName, 'Open Canteen');
  assert.ok(defaultCatalog.items.length > 0);

  // Check that all items in Open Canteen catalog are valid Open Canteen items
  assert.ok(defaultCatalog.items.some((i) => i.id === 'oc-aloo-paratha'));
  assert.ok(defaultCatalog.items.some((i) => i.id === 'oc-filter-coffee'));
});

test('Brand Regression: 10. Default profile does not expose old Campora customer identity', async () => {
  const storage = new MemoryStorage();
  const profileAdapter = new MockProfileAdapter(storage);

  const defaultProfile = await profileAdapter.getProfile('open-canteen');
  assert.equal(defaultProfile.displayName, 'Guest User');
  assert.equal(defaultProfile.email, '');
  assert.equal(defaultProfile.savedAddresses.length, 0);
  assert.notEqual(defaultProfile.displayName, 'Pratik Anand');
  assert.notEqual(defaultProfile.email, 'pratikanandmaurya@flash.co');
});

test('Brand Regression: 11. Cart and orders remain strictly partitioned under operator namespace', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const initialOrders = await orderAdapter.getOrders('open-canteen');
  assert.equal(initialOrders.length, 0);

  const catalog = await mockMenuAdapter.getCatalog('open-canteen');
  const placed = await orderAdapter.placeOrder('open-canteen', {
    serviceMode: 'dinein',
    items: [{ item: catalog.items[0], quantity: 1 }],
    pricing: { subtotal: 55, taxes: 3, packagingCharge: 0, deliveryFee: 0, grandTotal: 58, totalItemCount: 1 },
    paymentMethod: 'UPI (Demo)',
    pickupOrDeliveryDetails: { tableNumber: 'T-1' },
  });

  assert.ok(placed.orderId);
  const updatedOrders = await orderAdapter.getOrders('open-canteen');
  assert.equal(updatedOrders.length, 1);
  assert.equal(updatedOrders[0].orderId, placed.orderId);

  // Check that storage key uses opencanteen:open-canteen:orders_v2
  const scopedKey = getOperatorStorageKey(STORAGE_KEYS.ORDERS, 'open-canteen');
  assert.equal(scopedKey, 'opencanteen:open-canteen:orders_v2');
  assert.ok(storage.getItem(scopedKey));
});

test('Brand Regression: 12. Index.html contains Open Canteen title, metadata, and preloads', () => {
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
  assert.ok(indexHtml.includes('<title>Open Canteen</title>'));
  assert.ok(indexHtml.includes('content="#166534"'));
  assert.ok(indexHtml.includes('content="Open Canteen"'));
  assert.ok(indexHtml.includes('/assets/branding/open-canteen-logo.png'));
  assert.ok(!indexHtml.includes('Campora Café'));
});

test('Brand Regression: 13. Brand palette constants strictly match approved emerald green and accent orange', () => {
  assert.equal(OPEN_CANTEEN_BRAND.colors.primaryGreenDark, '#166534');
  assert.equal(OPEN_CANTEEN_BRAND.colors.primaryGreen, '#1C6943');
  assert.equal(OPEN_CANTEEN_BRAND.colors.accentOrange, '#FB4816');
  assert.equal(OPEN_CANTEEN_BRAND.colors.neutralLight, '#FFFFFF');
  assert.equal(OPEN_CANTEEN_BRAND.colors.surfaceLight, '#F8F9FA');
});

test('Brand Regression: 14. Deep links and fallback configurations preserve Open Canteen brand identity', () => {
  // Overriding with custom operator resolves cleanly against OPEN_CANTEEN_PRESET baseline
  const custom = resolveCanteenConfig({
    identity: { id: 'campus-hub', displayName: 'Campus Hub' },
  });
  assert.equal(custom.identity.displayName, 'Campus Hub');
  assert.equal(custom.branding.primaryColor, '#166534');
  assert.equal(custom.location.displayLocation, 'Campus Hub Counter');
  assert.equal(DEFAULT_CANTEEN_PRESET.identity.displayName, 'Open Canteen');
});

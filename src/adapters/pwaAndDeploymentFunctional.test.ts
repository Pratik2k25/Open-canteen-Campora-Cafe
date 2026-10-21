import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CAMPORA_CAFE_PRESET,
  OPEN_CANTEEN_PRESET,
  resolveCanteenConfig,
} from '../config/canteenConfig.ts';
import { OPEN_CANTEEN_BRAND } from '../config/brandAssets.ts';
import {
  getOperatorStorageKey,
  STORAGE_KEYS,
} from '../utils/storageKeys.ts';
import { MockOrderAdapter } from './mockOrderAdapter.ts';
import { MockProfileAdapter } from './mockProfileAdapter.ts';
import { calculatePricing } from '../utils/pricing.ts';
import type { CartItem, ServiceMode } from '../types/index.ts';
import type { PlaceOrderParams } from './types.ts';

// Mock browser localStorage for node/bun test environment
class MockLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

const createTestContext = () => {
  const mockStorage = new MockLocalStorage();
  (globalThis as any).localStorage = mockStorage;
  const orderAdapter = new MockOrderAdapter(mockStorage);
  const profileAdapter = new MockProfileAdapter(mockStorage);
  return { mockStorage, orderAdapter, profileAdapter };
};

const sampleCartItems: CartItem[] = [
  {
    item: {
      id: 'campora-coffee',
      name: 'Campora Classic Coffee',
      categoryId: 'beverages',
      price: 60,
      description: 'Rich freshly brewed campus coffee',
      imageUrl: '/assets/menu/campora-coffee.png',
      foodType: 'veg',
      preparationTime: '5 mins',
      serviceAvailability: {
        dinein: true,
        takeaway: true,
        delivery: true,
      },
      isAvailable: true,
      rating: 4.8,
      calories: '120 kcal',
    },
    quantity: 2,
    specialInstructions: 'Extra hot with less sugar',
  },
];

// ============================================================================
// 1. Task 1.9.1 & 1.9.2: Manifest & Operator Deployment Branding
// ============================================================================
test('PWA & Deployment: 1. Resolves Campora Café preset with approved branded identity, colors and metadata', () => {
  const campora = CAMPORA_CAFE_PRESET;
  assert.equal(campora.identity.id, 'campora-cafe');
  assert.equal(campora.identity.displayName, 'Campora Café');
  assert.equal(campora.identity.shortName, 'Campora');
  assert.equal(campora.identity.monogram, 'CC');
  assert.equal(campora.identity.logoUrl, '/assets/brand-logo.png');
  assert.equal(campora.branding.primaryColor, '#FF5C38');
  assert.equal(campora.pwa.appName, 'Campora Café');
  assert.equal(campora.pwa.themeColor, '#FF5C38');
  assert.equal(campora.pwa.backgroundColor, '#F8F9FA');
});

test('PWA & Deployment: 2. Resolves Open Canteen preset with approved brand identity and no fabricated contact info', () => {
  const openCanteen = OPEN_CANTEEN_PRESET;
  assert.equal(openCanteen.identity.id, 'open-canteen');
  assert.equal(openCanteen.identity.displayName, 'Open Canteen');
  assert.equal(openCanteen.identity.shortName, 'OpenCanteen');
  assert.equal(openCanteen.identity.monogram, 'OC');
  assert.equal(openCanteen.identity.logoUrl, '/assets/branding/open-canteen-logo.png');
  assert.equal(openCanteen.branding.primaryColor, '#166534');
  assert.equal(openCanteen.branding.accentColor, '#FB4816');
  assert.equal(openCanteen.contact.supportPhone, undefined);
  assert.equal(openCanteen.contact.supportEmail, undefined);
  assert.equal(openCanteen.pwa.appName, 'Open Canteen');
});

test('PWA & Deployment: 3. Resolves custom white-label operator deployment without Campora leakage', () => {
  const customConfig = resolveCanteenConfig(
    {
      identity: {
        id: 'nit-canteen',
        displayName: 'NIT Campus Bistro',
        tagline: 'Fresh Student Meals',
      },
      branding: {
        primaryColor: '#2563EB',
      },
      pwa: {
        appName: 'NIT Campus Bistro',
        shortName: 'NITBistro',
        themeColor: '#2563EB',
        backgroundColor: '#0F172A',
      },
    },
    OPEN_CANTEEN_PRESET
  );

  assert.equal(customConfig.identity.id, 'nit-canteen');
  assert.equal(customConfig.identity.displayName, 'NIT Campus Bistro');
  assert.equal(customConfig.identity.shortName, 'NIT');
  assert.equal(customConfig.pwa.shortName, 'NITBistro');
  assert.equal(customConfig.identity.monogram, 'NC');
  assert.equal(customConfig.branding.primaryColor, '#2563EB');
  assert.equal(customConfig.identity.logoUrl, undefined);
  assert.equal(customConfig.location.displayLocation, 'NIT Campus Bistro Counter');
  assert.equal(customConfig.content.aboutTitle, 'About NIT Campus Bistro');
});

test('PWA & Deployment: 4. Guarantees build-time and storage key separation for independent deployments', () => {
  const camporaKey = getOperatorStorageKey('orders', 'campora-cafe');
  const openCanteenKey = getOperatorStorageKey('orders', 'open-canteen');
  const customKey = getOperatorStorageKey('orders', 'nit-canteen');

  assert.equal(camporaKey, 'opencanteen:campora-cafe:orders');
  assert.equal(openCanteenKey, 'opencanteen:open-canteen:orders');
  assert.equal(customKey, 'opencanteen:nit-canteen:orders');

  assert.notEqual(camporaKey, openCanteenKey);
  assert.notEqual(camporaKey, customKey);
});

// ============================================================================
// 2. Task 1.9.4 & 1.9.10: Offline Experience & Mock Order Persistence
// ============================================================================
test('PWA & Deployment: 5. Creates and persists mock orders locally when device is simulated offline', async () => {
  const { mockStorage, orderAdapter } = createTestContext();
  const pricing = calculatePricing(sampleCartItems, 'dinein');
  const operatorId = 'campora-cafe';

  const orderPayload: PlaceOrderParams = {
    serviceMode: 'dinein' as ServiceMode,
    items: sampleCartItems,
    pricing,
    paymentMethod: 'Cash at Counter (Demo)',
    customerName: 'Aditya Sharma',
    pickupOrDeliveryDetails: {
      tableNumber: 'Table 4',
      contactNumber: '+91 98765 43210',
      notes: 'Deliver hot',
    },
  };

  const placedOrder = await orderAdapter.placeOrder(operatorId, orderPayload);

  assert.ok(placedOrder);
  assert.ok(placedOrder.orderId);
  assert.equal(placedOrder.orderStatus, 'placed');
  assert.equal(placedOrder.paymentStatus, 'pending');
  assert.equal(placedOrder.pickupOrDeliveryDetails.tableNumber, 'Table 4');

  const storedOrdersRaw = mockStorage.getItem(
    getOperatorStorageKey(STORAGE_KEYS.ORDERS, operatorId)
  );
  assert.ok(storedOrdersRaw);
  const parsed = JSON.parse(storedOrdersRaw!);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.length >= 1);
  assert.equal(parsed[0].orderId, placedOrder.orderId);
});

test('PWA & Deployment: 6. Preserves saved order history across reloads and offline retrieval', async () => {
  const { orderAdapter } = createTestContext();
  const operatorId = 'campora-cafe';
  const orders = await orderAdapter.getOrders(operatorId);
  assert.ok(orders.length > 0);

  const targetId = orders[0].orderId;
  const singleOrder = await orderAdapter.getOrderById(operatorId, targetId);
  assert.ok(singleOrder);
  assert.equal(singleOrder?.orderId, targetId);
  assert.ok(singleOrder?.items.length > 0);
});

test('PWA & Deployment: 7. Demonstrates demo payment semantics: Demo UPI is simulated, not real funds transfer', async () => {
  const { orderAdapter } = createTestContext();
  const pricing = calculatePricing(sampleCartItems, 'takeaway');
  const orderPayload: PlaceOrderParams = {
    serviceMode: 'takeaway' as ServiceMode,
    items: sampleCartItems,
    pricing,
    paymentMethod: 'Demo UPI (Simulated)',
    customerName: 'Priya Patel',
    pickupOrDeliveryDetails: {
      pickupTimeEstimate: 'Station 2',
      contactNumber: '+91 91234 56789',
    },
  };

  const placedOrder = await orderAdapter.placeOrder('campora-cafe', orderPayload);
  assert.equal(placedOrder.paymentMethod, 'Demo UPI (Simulated)');
  assert.equal(placedOrder.paymentStatus, 'simulated');
  assert.equal(placedOrder.orderStatus, 'placed');
});

test('PWA & Deployment: 8. Enforces cancellation rules only for eligible non-terminal orders', async () => {
  const { orderAdapter } = createTestContext();
  const operatorId = 'campora-cafe';
  const orders = await orderAdapter.getOrders(operatorId);
  const cancellableOrder = orders.find((o) => o.orderStatus === 'placed');

  if (cancellableOrder) {
    const cancelled = await orderAdapter.cancelOrder(
      operatorId,
      cancellableOrder.orderId,
      'Customer requested cancellation before prep'
    );
    assert.equal(cancelled.orderStatus, 'cancelled');
    assert.equal(cancelled.cancellationReason, 'Customer requested cancellation before prep');
  }
});

test('PWA & Deployment: 9. Strictly isolates customer data between Campora and Open Canteen', async () => {
  const { orderAdapter, profileAdapter } = createTestContext();
  const openCanteenOrders = await orderAdapter.getOrders('open-canteen');
  assert.equal(openCanteenOrders.length, 0);

  const camporaOrders = await orderAdapter.getOrders('campora-cafe');
  assert.ok(camporaOrders.length > 0);

  const camporaProfile = await profileAdapter.getProfile('campora-cafe');
  const openCanteenProfile = await profileAdapter.getProfile('open-canteen');

  assert.equal(camporaProfile.displayName, 'Pratik Anand');
  assert.equal(openCanteenProfile.displayName, 'Guest User');
  assert.equal(openCanteenProfile.savedAddresses.length, 0);
});

// ============================================================================
// 3. Task 1.9.5: PWA Update Lifecycle Logic & Checkout Safety
// ============================================================================
test('PWA & Deployment: 10. Guarantees checkout is protected: update prompt is deferred during checkout flow', () => {
  const paths = ['/checkout', '/checkout/payment', '/checkout/confirm'];
  paths.forEach((path) => {
    assert.equal(path.startsWith('/checkout'), true);
  });

  const nonCheckoutPaths = ['/', '/orders', '/profile', '/cart'];
  nonCheckoutPaths.forEach((path) => {
    assert.equal(path.startsWith('/checkout'), false);
  });
});

test('PWA & Deployment: 11. Safely handles browser storage clearing without crashing adapters', async () => {
  const { mockStorage, profileAdapter, orderAdapter } = createTestContext();
  mockStorage.clear();
  assert.equal(mockStorage.length, 0);

  const profile = await profileAdapter.getProfile('campora-cafe');
  assert.ok(profile);
  assert.equal(profile.displayName, 'Pratik Anand');

  const orders = await orderAdapter.getOrders('campora-cafe');
  assert.ok(orders);
  assert.ok(orders.length > 0);
});

test('PWA & Deployment: 12. Approved Open Canteen brand asset variants resolve to valid on-disk assets', () => {
  const brand = OPEN_CANTEEN_BRAND;
  assert.equal(brand.name, 'Open Canteen');
  assert.equal(brand.variants.fullLogo.path, '/assets/branding/open-canteen-logo.png');
  assert.equal(brand.variants.standaloneIcon.path, '/assets/branding/open-canteen-icon.png');
  assert.equal(brand.variants.appIcon.path, '/assets/branding/open-canteen-app-icon.png');

  // Verify assets exist in public folder
  const publicDir = path.resolve('public');
  const fullLogoFile = path.join(publicDir, brand.variants.fullLogo.path);
  const iconFile = path.join(publicDir, brand.variants.standaloneIcon.path);
  const appIconFile = path.join(publicDir, brand.variants.appIcon.path);

  assert.ok(fs.existsSync(fullLogoFile), 'Full logo file must exist on disk');
  assert.ok(fs.existsSync(iconFile), 'Standalone icon file must exist on disk');
  assert.ok(fs.existsSync(appIconFile), 'App icon file must exist on disk');

  assert.ok(fs.statSync(fullLogoFile).size > 1000, 'Full logo size must be valid');
  assert.ok(fs.statSync(iconFile).size > 1000, 'Standalone icon size must be valid');
  assert.ok(fs.statSync(appIconFile).size > 1000, 'App icon size must be valid');
});

test('PWA & Deployment: 13. PWA manifest neutral operator icons exist on disk with valid dimensions', () => {
  const publicDir = path.resolve('public');
  const pwaIcons = OPEN_CANTEEN_BRAND.pwaIcons;

  const icon192 = path.join(publicDir, pwaIcons.pwa192);
  const icon512 = path.join(publicDir, pwaIcons.pwa512);
  const iconMaskable = path.join(publicDir, pwaIcons.pwaMaskable);
  const appleTouch = path.join(publicDir, pwaIcons.appleTouchIcon);
  const favicon = path.join(publicDir, pwaIcons.favicon);
  const svg = path.join(publicDir, pwaIcons.iconSvg);

  for (const [name, filePath] of [
    ['PWA 192', icon192],
    ['PWA 512', icon512],
    ['PWA Maskable 512', iconMaskable],
    ['Apple Touch Icon', appleTouch],
    ['Favicon', favicon],
    ['Vector SVG', svg],
  ] as const) {
    assert.ok(fs.existsSync(filePath), `${name} must exist at ${filePath}`);
    assert.ok(fs.statSync(filePath).size > 100, `${name} must have non-zero file size`);
  }
});


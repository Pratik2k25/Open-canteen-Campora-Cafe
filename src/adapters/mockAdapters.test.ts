import test from 'node:test';
import assert from 'node:assert/strict';
import { MockMenuAdapter } from './mockMenuAdapter.ts';
import { MockOrderAdapter } from './mockOrderAdapter.ts';
import { MockProfileAdapter } from './mockProfileAdapter.ts';
import {
  CAMPORA_CATALOG,
  OPEN_CANTEEN_CATALOG,
  CAMPORA_SEED_ORDERS,
  DEFAULT_MOCK_CUSTOMER_PROFILE,
} from '../data/mock/index.ts';
import { calculatePricing } from '../utils/pricing.ts';
import { isItemAvailableForService } from '../utils/serviceRules.ts';
import type { PlaceOrderParams } from './types.ts';
import type { CartItem } from '../types/index.ts';

// In-memory isolated storage harness for testing
function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

test('1 & 4 & 5. Campora catalog resolution, category relations, and asset path verification', async () => {
  const adapter = new MockMenuAdapter();
  const catalog = await adapter.getCatalog('campora-cafe');

  assert.equal(catalog.canteenId, 'campora-cafe');
  assert.equal(catalog.categories.length, 7);
  assert.equal(catalog.items.length, 10);

  // Check 10 specific product IDs
  const expectedIds = [
    'dark-chocolate-cake',
    'chicken-burger',
    'paneer-paratha',
    'masala-dosa',
    'jalebi',
    'idli-sambar',
    'campora-coffee',
    'masala-chai',
    'pepsi',
    'kulhad-chai',
  ];
  const actualIds = catalog.items.map((i) => i.id);
  assert.deepEqual(actualIds, expectedIds);

  // Verify category relations & asset paths
  const cake = catalog.items.find((i) => i.id === 'dark-chocolate-cake')!;
  assert.equal(cake.categoryId, 'sweets');
  assert.equal(cake.imageUrl, '/assets/menu/dark-chocolate-cake.png');
  assert.equal(cake.price, 90);
  assert.equal(cake.foodType, 'veg');

  const burger = catalog.items.find((i) => i.id === 'chicken-burger')!;
  assert.equal(burger.foodType, 'nonveg');
  assert.equal(burger.price, 79);
});

test('2. Open Canteen catalog resolution is clearly labeled demo and has valid items', async () => {
  const adapter = new MockMenuAdapter();
  const catalog = await adapter.getCatalog('open-canteen');

  assert.equal(catalog.canteenId, 'open-canteen');
  assert.equal(catalog.isDemoCatalog, true);
  assert.ok(catalog.items.length > 0);

  const categories = await adapter.getCategories('open-canteen');
  assert.ok(categories.length > 0);
  assert.equal(categories[0].id, 'all');
});

test('3. Unknown operator catalog isolation NEVER exposes Campora Cafe items', async () => {
  const adapter = new MockMenuAdapter();
  const unknownCatalog = await adapter.getCatalog('custom-operator-xyz');

  assert.equal(unknownCatalog.canteenId, 'custom-operator-xyz');
  assert.equal(unknownCatalog.items.length, 0); // Must be safe empty catalog
  assert.equal(unknownCatalog.isDemoCatalog, false);

  const items = await adapter.getMenuItems('custom-operator-xyz');
  assert.equal(items.length, 0);
});

test('6. Product search and category filter behavior', async () => {
  const adapter = new MockMenuAdapter();

  const chaiSearch = await adapter.searchMenuItems('campora-cafe', 'chai');
  assert.equal(chaiSearch.length, 2); // Masala Chai & Kulhad Chai

  const sweetsItems = await adapter.getMenuItems('campora-cafe', 'sweets');
  assert.equal(sweetsItems.length, 2); // Dark Chocolate Cake & Jalebi

  const cakeSearch = await adapter.searchMenuItems('campora-cafe', 'chocolate', 'sweets');
  assert.equal(cakeSearch.length, 1);
  assert.equal(cakeSearch[0].id, 'dark-chocolate-cake');
});

test('7 & 12. Campora fixture preservation: 12 orders preserved with exact properties', async () => {
  assert.equal(CAMPORA_SEED_ORDERS.length, 12);

  // Order #1: C1047
  assert.equal(CAMPORA_SEED_ORDERS[0].orderId, 'C1047');
  assert.equal(CAMPORA_SEED_ORDERS[0].orderStatus, 'preparing');
  assert.equal(CAMPORA_SEED_ORDERS[0].serviceMode, 'dinein');
  assert.equal(CAMPORA_SEED_ORDERS[0].grandTotal, 292);

  // Order #2: C1046
  assert.equal(CAMPORA_SEED_ORDERS[1].orderId, 'C1046');
  assert.equal(CAMPORA_SEED_ORDERS[1].orderStatus, 'delivered');
  assert.equal(CAMPORA_SEED_ORDERS[1].serviceMode, 'takeaway');
  assert.equal(CAMPORA_SEED_ORDERS[1].grandTotal, 154);

  // Order #9: C1039 (Cancelled)
  assert.equal(CAMPORA_SEED_ORDERS[8].orderId, 'C1039');
  assert.equal(CAMPORA_SEED_ORDERS[8].orderStatus, 'cancelled');

  // Order #12: C1036 (Cancelled)
  assert.equal(CAMPORA_SEED_ORDERS[11].orderId, 'C1036');
  assert.equal(CAMPORA_SEED_ORDERS[11].orderStatus, 'cancelled');
  assert.equal(CAMPORA_SEED_ORDERS[11].grandTotal, 100);
});

test('8 & 10. Order creation, pricing consistency, and duplicate prevention', async () => {
  const mockStorage = createMockStorage();
  const adapter = new MockOrderAdapter(mockStorage);
  const initialOrders = await adapter.getOrders('campora-cafe');
  assert.equal(initialOrders.length, 12);

  const cartItems: CartItem[] = [
    { item: CAMPORA_CATALOG.items[0], quantity: 2 }, // Dark Chocolate Cake (90 * 2 = 180)
  ];
  const pricing = calculatePricing(cartItems, 'dinein'); // 180 + 9 tax = 189

  const placeParams: PlaceOrderParams = {
    serviceMode: 'dinein',
    items: cartItems,
    pricing,
    paymentMethod: 'UPI',
    pickupOrDeliveryDetails: { tableNumber: 'Table T-09' },
  };

  const created = await adapter.placeOrder('campora-cafe', placeParams, {
    uid: 'test-user-1',
    displayName: 'Test User',
  });

  assert.ok(created.orderId.startsWith('C'));
  assert.equal(created.grandTotal, 189);
  assert.equal(created.orderStatus, 'preparing');
  assert.equal(created.userDisplayName, 'Test User');

  const afterOrders = await adapter.getOrders('campora-cafe');
  assert.equal(afterOrders.length, 13);
  assert.equal(afterOrders[0].orderId, created.orderId);
});

test('9 & 15. Order cancellation eligibility and failure handling', async () => {
  const mockStorage = createMockStorage();
  const adapter = new MockOrderAdapter(mockStorage);

  // C1047 is 'preparing' -> should be cancellable
  const orderC1047 = await adapter.getOrderById('campora-cafe', 'C1047');
  assert.ok(orderC1047);
  assert.equal(adapter.canCancelOrder(orderC1047), true);

  const cancelled = await adapter.cancelOrder('campora-cafe', 'C1047', 'Customer changed mind');
  assert.equal(cancelled.orderStatus, 'cancelled');
  assert.ok(cancelled.pickupOrDeliveryDetails.notes?.includes('Customer changed mind'));

  // C1046 is 'delivered' -> should NOT be cancellable
  const orderC1046 = await adapter.getOrderById('campora-cafe', 'C1046');
  assert.ok(orderC1046);
  assert.equal(adapter.canCancelOrder(orderC1046), false);

  await assert.rejects(
    async () => {
      await adapter.cancelOrder('campora-cafe', 'C1046');
    },
    { message: /cannot be cancelled in status 'delivered'/ }
  );

  // Non-existent order cancellation -> should throw
  await assert.rejects(
    async () => {
      await adapter.cancelOrder('campora-cafe', 'NON_EXISTENT');
    },
    { message: /not found/ }
  );
});

test('11. Order isolation across operators: unconfigured canteens have zero orders', async () => {
  const mockStorage = createMockStorage();
  const adapter = new MockOrderAdapter(mockStorage);
  const customOrders = await adapter.getOrders('fresh-operator-beta');
  assert.equal(customOrders.length, 0); // NEVER receives Campora Cafe orders
});

test('13 & 14. Customer profile retrieval, update, and address book operations', async () => {
  const mockStorage = createMockStorage();
  const adapter = new MockProfileAdapter(mockStorage);
  const profile = await adapter.getProfile('campora-cafe');

  assert.equal(profile.displayName, DEFAULT_MOCK_CUSTOMER_PROFILE.displayName);
  assert.equal(profile.savedAddresses.length, 2);

  // Update profile
  const updated = await adapter.updateProfile('campora-cafe', {
    displayName: 'Pratik Updated',
    phoneNumber: '+91 99999 88888',
  });
  assert.equal(updated.displayName, 'Pratik Updated');

  // Add saved address
  const withAddress = await adapter.addSavedAddress('campora-cafe', {
    userId: updated.uid,
    label: 'Campus Gate',
    buildingOrGate: 'North Campus Main Gate',
    roomOrLandmark: 'Security Desk',
    recipientPhone: '+91 99999 88888',
    isDefault: true,
  });
  assert.equal(withAddress.savedAddresses.length, 3);
  const newAddr = withAddress.savedAddresses.find((a) => a.label === 'Campus Gate')!;
  assert.equal(newAddr.isDefault, true);

  // Previous default address should now be isDefault: false
  const oldHostel = withAddress.savedAddresses.find((a) => a.id === 'addr-hostel-1')!;
  assert.equal(oldHostel.isDefault, false);

  // Delete address
  const afterDelete = await adapter.deleteSavedAddress('campora-cafe', newAddr.id);
  assert.equal(afterDelete.savedAddresses.length, 2);
});

test('16 & 17. Stale async response and runtime operator switching safety', async () => {
  const adapter = new MockMenuAdapter();

  // Simulate concurrent queries for different canteens
  const [camporaRes, openCanteenRes, customRes] = await Promise.all([
    adapter.getCatalog('campora-cafe'),
    adapter.getCatalog('open-canteen'),
    adapter.getCatalog('unseeded-canteen'),
  ]);

  assert.equal(camporaRes.canteenId, 'campora-cafe');
  assert.equal(camporaRes.items.length, 10);

  assert.equal(openCanteenRes.canteenId, 'open-canteen');
  assert.equal(openCanteenRes.isDemoCatalog, true);

  assert.equal(customRes.canteenId, 'unseeded-canteen');
  assert.equal(customRes.items.length, 0);
});

test('18. Fresh install vs page refresh persistence compatibility', async () => {
  const mockStorage = createMockStorage();
  const orderAdapter = new MockOrderAdapter(mockStorage);

  // Fresh install: seeds 12 orders
  const firstLoad = await orderAdapter.getOrders('campora-cafe');
  assert.equal(firstLoad.length, 12);

  // Add order
  await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'dinein',
    items: [{ item: CAMPORA_CATALOG.items[0], quantity: 1 }],
    pricing: calculatePricing([{ item: CAMPORA_CATALOG.items[0], quantity: 1 }], 'dinein'),
    paymentMethod: 'Cash',
    pickupOrDeliveryDetails: {},
  });

  // Page refresh simulation: re-instantiate adapter with same storage
  const refreshAdapter = new MockOrderAdapter(mockStorage);
  const refreshedOrders = await refreshAdapter.getOrders('campora-cafe');
  assert.equal(refreshedOrders.length, 13); // Does NOT re-seed over existing orders!
});

test('19. Existing cart, pricing, and service rules remain authoritative', () => {
  const cake = CAMPORA_CATALOG.items[0];
  const burger = CAMPORA_CATALOG.items[1];

  // Dine-in availability
  assert.equal(isItemAvailableForService(cake, 'dinein'), true);
  assert.equal(isItemAvailableForService(burger, 'takeaway'), true);

  // Pricing math: 90 + 79 = 169 subtotal, 5% tax = 8, packaging 15 for takeaway
  const cart: CartItem[] = [
    { item: cake, quantity: 1 },
    { item: burger, quantity: 1 },
  ];
  const takeawayPrice = calculatePricing(cart, 'takeaway');
  assert.equal(takeawayPrice.subtotal, 169);
  assert.equal(takeawayPrice.taxes, 8); // Math.round(169 * 0.05) = 8
  assert.equal(takeawayPrice.packagingCharge, 15);
  assert.equal(takeawayPrice.deliveryFee, 0);
  assert.equal(takeawayPrice.grandTotal, 169 + 8 + 15);
});

test('20. Customer profile & address isolation across Campora, Open Canteen, My Home, and Unknown operator', async () => {
  const mockStorage = createMockStorage();
  const profileAdapter = new MockProfileAdapter(mockStorage);

  // 1. Campora Café loads demonstration customer fixtures
  const camporaProfile = await profileAdapter.getProfile('campora-cafe');
  assert.equal(camporaProfile.displayName, 'Pratik Anand');
  assert.equal(camporaProfile.email, 'pratikanandmaurya@flash.co');
  assert.equal(camporaProfile.savedAddresses.length, 2);
  assert.equal(camporaProfile.savedAddresses[0].id, 'addr-hostel-1');

  // getProfileSync returns identical synchronous state
  const camporaSync = profileAdapter.getProfileSync('campora-cafe');
  assert.equal(camporaSync.displayName, 'Pratik Anand');

  // 2. Open Canteen must NOT inherit Campora's demo customer
  const openCanteenProfile = await profileAdapter.getProfile('open-canteen');
  assert.equal(openCanteenProfile.displayName, 'Guest User');
  assert.equal(openCanteenProfile.email, '');
  assert.equal(openCanteenProfile.savedAddresses.length, 0); // No Campora hostel addresses!

  // 3. My Home must NOT inherit Campora's demo customer
  const myHomeProfile = await profileAdapter.getProfile('my-home');
  assert.equal(myHomeProfile.displayName, 'Guest User');
  assert.equal(myHomeProfile.email, '');
  assert.equal(myHomeProfile.savedAddresses.length, 0);

  // 4. Unknown custom operator must NOT inherit Campora's demo customer
  const unknownProfile = await profileAdapter.getProfile('unknown-custom-canteen');
  assert.equal(unknownProfile.displayName, 'Guest User');
  assert.equal(unknownProfile.email, '');
  assert.equal(unknownProfile.savedAddresses.length, 0);

  // 5. Update Open Canteen customer profile & address book independently
  await profileAdapter.updateProfile('open-canteen', {
    displayName: 'Ananya Sharma',
    email: 'ananya@opencanteen.io',
  });
  await profileAdapter.addSavedAddress('open-canteen', {
    userId: 'guest-open-canteen',
    label: 'Department',
    buildingOrGate: 'Biotech Block 3',
    roomOrLandmark: 'Lab 101',
    recipientPhone: '+91 91234 56789',
    isDefault: true,
  });

  // Verify Open Canteen has updated data
  const updatedOpen = await profileAdapter.getProfile('open-canteen');
  assert.equal(updatedOpen.displayName, 'Ananya Sharma');
  assert.equal(updatedOpen.email, 'ananya@opencanteen.io');
  assert.equal(updatedOpen.savedAddresses.length, 1);
  assert.equal(updatedOpen.savedAddresses[0].label, 'Department');

  // Verify Campora Café remains completely untouched
  const reloadedCampora = await profileAdapter.getProfile('campora-cafe');
  assert.equal(reloadedCampora.displayName, 'Pratik Anand');
  assert.equal(reloadedCampora.email, 'pratikanandmaurya@flash.co');
  assert.equal(reloadedCampora.savedAddresses.length, 2);

  // Verify My Home and Unknown custom canteens remain clean
  const reloadedMyHome = await profileAdapter.getProfile('my-home');
  assert.equal(reloadedMyHome.displayName, 'Guest User');
  assert.equal(reloadedMyHome.savedAddresses.length, 0);

  const reloadedUnknown = await profileAdapter.getProfile('unknown-custom-canteen');
  assert.equal(reloadedUnknown.displayName, 'Guest User');
  assert.equal(reloadedUnknown.savedAddresses.length, 0);

  // 6. Resetting Open Canteen restores guest profile, NOT Campora's profile
  const resetOpen = await profileAdapter.resetProfile('open-canteen');
  assert.equal(resetOpen.displayName, 'Guest User');
  assert.equal(resetOpen.email, '');
  assert.equal(resetOpen.savedAddresses.length, 0);

  // 7. Resetting Campora restores Campora's demo customer
  const resetCampora = await profileAdapter.resetProfile('campora-cafe');
  assert.equal(resetCampora.displayName, 'Pratik Anand');
  assert.equal(resetCampora.savedAddresses.length, 2);
});

test('21. In-flight duplicate order placement rejection', async () => {
  const mockStorage = createMockStorage();
  const orderAdapter = new MockOrderAdapter(mockStorage);
  const cart: CartItem[] = [{ item: CAMPORA_CATALOG.items[0], quantity: 1 }];
  const pricing = calculatePricing(cart, 'dinein');

  // Manually engage inFlightPlacement to simulate simultaneous rapid clicks
  (orderAdapter as any).inFlightPlacement = true;

  await assert.rejects(
    async () => {
      await orderAdapter.placeOrder('campora-cafe', {
        serviceMode: 'dinein',
        items: cart,
        pricing,
        paymentMethod: 'UPI',
        pickupOrDeliveryDetails: {},
      });
    },
    { message: /already in progress/ }
  );

  (orderAdapter as any).inFlightPlacement = false;
});


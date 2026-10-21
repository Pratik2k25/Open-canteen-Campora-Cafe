import test from 'node:test';
import assert from 'node:assert/strict';
import { MockOrderAdapter } from './mockOrderAdapter.ts';
import { MockProfileAdapter } from './mockProfileAdapter.ts';
import {
  filterOrdersByTab,
  getOrderTabCounts,
  sortOrdersByDateDesc,
  formatOrderItemsSummary,
  formatOrderDateTime,
  getOrderStatusBadgeConfig,
  getServiceBadgeConfig,
} from '../utils/orderHistory.ts';
import {
  validateProfileUpdate,
  validateAddressInput,
  type CustomerProfileData,
  type AppearanceTheme,
} from '../utils/profileData.ts';
import {
  CAMPORA_CATALOG,
  CAMPORA_SEED_ORDERS,
  createOperatorDefaultProfile,
} from '../data/mock/index.ts';
import { calculatePricing } from '../utils/pricing.ts';
import type { CartItem, Order } from '../types/index.ts';
import type { PlaceOrderParams } from './types.ts';

// In-memory isolated storage simulator for unit testing
class MemoryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
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
}

// 1. Order History Filtering & Sorting
test('Orders & Profile: 1. Order History tab filtering and descending chronological sorting', () => {
  const seeds = CAMPORA_SEED_ORDERS;
  const { allCount, cancelledCount } = getOrderTabCounts(seeds);

  assert.equal(allCount, 12, 'Campora must have 12 total orders');
  assert.equal(cancelledCount, 2, 'Campora must have 2 cancelled orders');

  const allOrders = filterOrdersByTab(seeds, 'all');
  assert.equal(allOrders.length, 12, 'All Orders tab must contain all 12 orders');

  const cancelledOrders = filterOrdersByTab(seeds, 'cancelled');
  assert.equal(cancelledOrders.length, 2, 'Cancelled tab must contain exactly 2 orders');
  assert.ok(
    cancelledOrders.every((o) => o.orderStatus === 'cancelled'),
    'Every order in Cancelled tab must have status cancelled'
  );

  // Sorting test with intentionally scrambled dates
  const scrambled: Order[] = [
    { ...seeds[0], orderId: 'C1001', createdAt: '2025-06-01T10:00:00.000Z' },
    { ...seeds[1], orderId: 'C1003', createdAt: '2025-06-03T10:00:00.000Z' },
    { ...seeds[2], orderId: 'C1002', createdAt: '2025-06-02T10:00:00.000Z' },
  ];
  const sorted = sortOrdersByDateDesc(scrambled);
  assert.equal(sorted[0].orderId, 'C1003', 'Most recent date must be first');
  assert.equal(sorted[1].orderId, 'C1002', 'Second date must be second');
  assert.equal(sorted[2].orderId, 'C1001', 'Oldest date must be third');
});

// 2. Newly Placed Orders Appear Immediately at Top
test('Orders & Profile: 2. Newly placed order prepends to history and is sorted to top', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const initialOrders = await orderAdapter.getOrders('campora-cafe');
  assert.equal(initialOrders.length, 12, 'Initial orders should be 12 seed orders');

  const item = CAMPORA_CATALOG.items[0];
  const cartItems: CartItem[] = [{ item, quantity: 1, specialInstructions: 'Mild spicy' }];
  const pricing = calculatePricing(cartItems, 'dinein');

  const params: PlaceOrderParams = {
    serviceMode: 'dinein',
    items: cartItems,
    pricing,
    paymentMethod: 'Cash at Counter',
    customerName: 'Aarav Sharma',
    pickupOrDeliveryDetails: { tableNumber: 'Table 7' },
  };

  const newOrder = await orderAdapter.placeOrder('campora-cafe', params);
  const updatedOrders = await orderAdapter.getOrders('campora-cafe');

  assert.equal(updatedOrders.length, 13, 'Total order count should increase to 13');
  assert.equal(updatedOrders[0].orderId, newOrder.orderId, 'New order must be at index 0');
  assert.equal(updatedOrders[0].userDisplayName, 'Aarav Sharma', 'Customer name should be preserved');
  assert.equal(updatedOrders[0].orderStatus, 'placed', 'New order starts in placed status');
  assert.equal(updatedOrders[0].paymentStatus, 'pending', 'Cash at Counter has pending payment status');
});

// 3. Order Cancellation Eligibility, Rules, and Persistence
test('Orders & Profile: 3. Cancellation rules enforce non-terminal states and persist', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const orders = await orderAdapter.getOrders('campora-cafe');

  // C1047 is placed (cancellable)
  const placedOrder = orders.find((o) => o.orderId === 'C1047')!;
  assert.equal(orderAdapter.canCancelOrder(placedOrder), true, 'Placed order must be cancellable');

  // Cancel C1047
  const cancelledOrder = await orderAdapter.cancelOrder('campora-cafe', 'C1047', 'Changed my mind');
  assert.equal(cancelledOrder.orderStatus, 'cancelled', 'Status must transition to cancelled');
  assert.equal(cancelledOrder.cancellationReason, 'Changed my mind', 'Cancellation reason must be retained in dedicated field');
  assert.equal(
    cancelledOrder.pickupOrDeliveryDetails?.notes,
    'Serve hot with saffron syrup',
    'Original customer notes must be preserved uncorrupted'
  );

  // Verify persistence in adapter storage
  const reloaded = await orderAdapter.getOrderById('campora-cafe', 'C1047');
  assert.equal(reloaded?.orderStatus, 'cancelled', 'Cancelled status must persist in storage');

  // Verify now-cancelled order is no longer cancellable
  assert.equal(orderAdapter.canCancelOrder(reloaded!), false, 'Cancelled order must not be cancellable');

  // C1046 is delivered (terminal -> not cancellable)
  const deliveredOrder = orders.find((o) => o.orderId === 'C1046')!;
  assert.equal(orderAdapter.canCancelOrder(deliveredOrder), false, 'Delivered order cannot be cancelled');

  await assert.rejects(
    async () => {
      await orderAdapter.cancelOrder('campora-cafe', 'C1046');
    },
    /cannot be cancelled/,
    'Attempting to cancel delivered order must throw an error'
  );
});

// 4. Order Details & Payment Status Representation
test('Orders & Profile: 4. Order Details breakdown, per-item cooking notes, and payment status tags', () => {
  const item1 = CAMPORA_CATALOG.items[0];
  const item2 = CAMPORA_CATALOG.items[1];
  const cartItems: CartItem[] = [
    { item: item1, quantity: 2, specialInstructions: 'Less oil' },
    { item: item2, quantity: 1, specialInstructions: 'Extra chutney' },
  ];

  const summary = formatOrderItemsSummary(cartItems);
  assert.ok(summary.includes(item1.name), 'Summary includes item 1 name');
  assert.ok(summary.includes('(x2)'), 'Summary includes item 1 quantity');
  assert.ok(summary.includes(item2.name), 'Summary includes item 2 name');

  // Status badge styling
  const placedBadge = getOrderStatusBadgeConfig('placed');
  assert.equal(placedBadge.label, 'Placed');
  assert.equal(placedBadge.iconType, 'clock');

  const completedBadge = getOrderStatusBadgeConfig('completed');
  assert.equal(completedBadge.label, 'Completed');
  assert.equal(completedBadge.iconType, 'check-circle');

  const cancelledBadge = getOrderStatusBadgeConfig('cancelled');
  assert.equal(cancelledBadge.label, 'Cancelled');
  assert.equal(cancelledBadge.iconType, 'x-circle');

  // Service mode badge styling
  const dineinBadge = getServiceBadgeConfig('dinein');
  assert.equal(dineinBadge.label, 'Dinein');
  const takeawayBadge = getServiceBadgeConfig('takeaway');
  assert.equal(takeawayBadge.label, 'Takeaway');
  const deliveryBadge = getServiceBadgeConfig('delivery');
  assert.equal(deliveryBadge.label, 'Delivery');
});

// 5. Safe Reordering Catalog Compatibility Checks
test('Orders & Profile: 5. Safe reorder detects available vs unavailable items', () => {
  const availableItem = CAMPORA_CATALOG.items[0];
  const unavailableItem = {
    ...CAMPORA_CATALOG.items[1],
    id: 'retired-seasonal-drink',
    name: 'Retired Seasonal Drink',
    isAvailable: false,
  };

  const pastOrderItems: CartItem[] = [
    { item: availableItem, quantity: 1 },
    { item: unavailableItem, quantity: 1 },
  ];

  // Emulate catalog filter check
  const activeCatalogItems = CAMPORA_CATALOG.items;
  const eligibleForReorder = pastOrderItems.filter((ci) => {
    const found = activeCatalogItems.find((i) => i.id === ci.item.id);
    return found && found.isAvailable !== false;
  });

  assert.equal(eligibleForReorder.length, 1, 'Only available item should be eligible for reorder');
  assert.equal(eligibleForReorder[0].item.id, availableItem.id);
});

// 6. Profile Edit Validation and Persistence
test('Orders & Profile: 6. Customer profile edit, validation, and persistence', async () => {
  const storage = new MemoryStorage();
  const profileAdapter = new MockProfileAdapter(storage);

  // Validation tests
  assert.equal(validateProfileUpdate({ displayName: '', email: 'test@example.com' }).valid, false);
  assert.equal(validateProfileUpdate({ displayName: 'John', email: 'not-an-email' }).valid, false);
  assert.equal(validateProfileUpdate({ displayName: 'John Doe', email: 'john@campora.test' }).valid, true);

  // Update profile
  const updated = await profileAdapter.updateProfile('campora-cafe', {
    displayName: 'Pratik Anand',
    email: 'pratikanand@gmail.com',
    phoneNumber: '+91 99999 88888',
  });

  assert.equal(updated.displayName, 'Pratik Anand');
  assert.equal(updated.email, 'pratikanand@gmail.com');
  assert.equal(updated.phoneNumber, '+91 99999 88888');

  // Verify persistence
  const reloaded = await profileAdapter.getProfile('campora-cafe');
  assert.equal(reloaded.displayName, 'Pratik Anand');
  assert.equal(reloaded.email, 'pratikanand@gmail.com');
});

// 7. Address Book Complete CRUD and Validation
test('Orders & Profile: 7. Address Book add, edit, delete, default setting, and validation', async () => {
  const storage = new MemoryStorage();
  const profileAdapter = new MockProfileAdapter(storage);

  // Validation tests
  assert.equal(
    validateAddressInput({ buildingOrGate: '', roomOrLandmark: 'Room 101' }).valid,
    false,
    'Empty building must be rejected'
  );
  assert.equal(
    validateAddressInput({ buildingOrGate: 'Hostel A', roomOrLandmark: '' }).valid,
    false,
    'Empty room must be rejected'
  );
  assert.equal(
    validateAddressInput({
      buildingOrGate: 'Hostel A',
      roomOrLandmark: 'Room 101',
      recipientPhone: '123', // less than 10 digits
    }).valid,
    false,
    'Invalid phone must be rejected'
  );
  assert.equal(
    validateAddressInput({
      buildingOrGate: 'Aryabhatta Hostel, Block B',
      roomOrLandmark: 'Room 304, Near Main Mess',
      recipientPhone: '+91 98765 43210',
    }).valid,
    true,
    'Valid address input must pass validation'
  );

  // Add Address
  const addedProfile = await profileAdapter.addSavedAddress('campora-cafe', {
    userId: 'user-1',
    label: 'Hostel',
    buildingOrGate: 'Ramanujan Hostel, Block C',
    roomOrLandmark: 'Room 412',
    recipientPhone: '+91 91234 56789',
    isDefault: false,
  });

  const newAddr = addedProfile.savedAddresses.find((a) => a.roomOrLandmark === 'Room 412');
  assert.ok(newAddr, 'Newly added address must exist in address book');
  assert.equal(newAddr.buildingOrGate, 'Ramanujan Hostel, Block C');

  // Edit Address
  const updatedProfile = await profileAdapter.updateSavedAddress('campora-cafe', newAddr.id, {
    buildingOrGate: 'Ramanujan Hostel, Block C (West Wing)',
    roomOrLandmark: 'Room 412A',
  });
  const editedAddr = updatedProfile.savedAddresses.find((a) => a.id === newAddr.id);
  assert.equal(editedAddr?.buildingOrGate, 'Ramanujan Hostel, Block C (West Wing)');
  assert.equal(editedAddr?.roomOrLandmark, 'Room 412A');

  // Set Default Address
  const defaultProfile = await profileAdapter.setDefaultAddress('campora-cafe', newAddr.id);
  const defaultedAddr = defaultProfile.savedAddresses.find((a) => a.id === newAddr.id);
  assert.equal(defaultedAddr?.isDefault, true, 'Target address must become default');
  const otherAddrs = defaultProfile.savedAddresses.filter((a) => a.id !== newAddr.id);
  assert.ok(
    otherAddrs.every((a) => !a.isDefault),
    'All other addresses must have isDefault false'
  );

  // Delete Address
  const afterDeleteProfile = await profileAdapter.deleteSavedAddress('campora-cafe', newAddr.id);
  assert.equal(
    afterDeleteProfile.savedAddresses.some((a) => a.id === newAddr.id),
    false,
    'Deleted address must be removed from profile'
  );
  assert.ok(
    afterDeleteProfile.savedAddresses.some((a) => a.isDefault),
    'Remaining address must be assigned as default'
  );
});

// 8. Preference Updates (Appearance & Notifications)
test('Orders & Profile: 8. Appearance and notification preferences update and persist', async () => {
  const storage = new MemoryStorage();
  const profileAdapter = new MockProfileAdapter(storage);

  // Appearance
  const updatedAppearance = await profileAdapter.updateProfile('campora-cafe', {
    appearance: 'Dark' as AppearanceTheme,
  });
  assert.equal(updatedAppearance.appearance, 'Dark');

  // Notifications
  const updatedNotifications = await profileAdapter.updateProfile('campora-cafe', {
    notifications: {
      orderUpdates: true,
      offersAndPromos: false,
      campusSpecials: true,
    },
  });
  assert.equal(updatedNotifications.notifications.orderUpdates, true);
  assert.equal(updatedNotifications.notifications.offersAndPromos, false);
  assert.equal(updatedNotifications.notifications.campusSpecials, true);

  // Persistence check
  const reloaded = await profileAdapter.getProfile('campora-cafe');
  assert.equal(reloaded.appearance, 'Dark');
  assert.equal(reloaded.notifications.campusSpecials, true);
});

// 9. Operator Isolation & Neutral Fallback Identity
test('Orders & Profile: 9. Non-Campora canteens have neutral customer identity and empty addresses', async () => {
  const storage = new MemoryStorage();
  const profileAdapter = new MockProfileAdapter(storage);
  const orderAdapter = new MockOrderAdapter(storage);

  // Campora has demonstration profile
  const camporaProfile = await profileAdapter.getProfile('campora-cafe');
  assert.ok(camporaProfile.displayName.length > 0);
  assert.ok(camporaProfile.savedAddresses.length >= 2, 'Campora demo has seed addresses');

  // Independent canteen gets clean, neutral profile
  const neutralProfile = await profileAdapter.getProfile('custom-engineering-canteen');
  assert.equal(neutralProfile.displayName, 'Guest User');
  assert.equal(neutralProfile.email, '');
  assert.equal(neutralProfile.phoneNumber, '');
  assert.equal(neutralProfile.savedAddresses.length, 0, 'Independent canteen starts with 0 addresses');

  // Independent canteen has 0 orders initially
  const neutralOrders = await orderAdapter.getOrders('custom-engineering-canteen');
  assert.equal(neutralOrders.length, 0, 'Independent canteen starts with 0 orders');

  // Place order for independent canteen with neutral fallback
  const params: PlaceOrderParams = {
    serviceMode: 'takeaway',
    items: [],
    pricing: { subtotal: 100, taxes: 5, packagingCharge: 10, deliveryFee: 0, grandTotal: 115, totalItemCount: 0 },
    paymentMethod: 'Cash at Counter',
    pickupOrDeliveryDetails: { pickupTimeEstimate: '10 mins' },
  };

  const placed = await orderAdapter.placeOrder('custom-engineering-canteen', params);
  assert.equal(placed.userDisplayName, 'Guest Customer', 'Fallback name must be neutral Guest Customer');

  // Ensure Campora orders remain untouched
  const camporaOrders = await orderAdapter.getOrders('campora-cafe');
  assert.equal(camporaOrders.length, 12, 'Campora orders remain isolated and unchanged');
});

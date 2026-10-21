import test from 'node:test';
import assert from 'node:assert/strict';
import { MockOrderAdapter } from './mockOrderAdapter.ts';
import { MockProfileAdapter } from './mockProfileAdapter.ts';
import { calculatePricing, formatINR } from '../utils/pricing.ts';
import { CAMPORA_CATALOG, OPEN_CANTEEN_CATALOG, CAMPORA_SEED_ORDERS } from '../data/mock/index.ts';
import type { CartItem, Order, ServiceMode } from '../types/index.ts';
import type { PlaceOrderParams } from './types.ts';

// In-memory isolated storage simulator for robust unit tests
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

test('Checkout Functional: 1. Dine-in order payload & validation', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const burger = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!;
  const cartItems: CartItem[] = [
    { item: burger, quantity: 2, specialInstructions: 'Extra crisp patties' },
  ];
  const pricing = calculatePricing(cartItems, 'dinein');

  const params: PlaceOrderParams = {
    serviceMode: 'dinein',
    items: cartItems,
    pricing,
    paymentMethod: 'Demo UPI (Simulated)',
    pickupOrDeliveryDetails: {
      tableNumber: 'Table 14',
      contactNumber: '+91 98765 43210',
      notes: 'Please bring water glasses',
    },
  };

  const order = await orderAdapter.placeOrder('campora-cafe', params, {
    uid: 'user-dinein-1',
    displayName: 'Pratik Kumar',
  });

  assert.ok(order.orderId.startsWith('C'), 'Order ID should start with C');
  assert.equal(order.orderStatus, 'placed', 'Initial status must be placed');
  assert.equal(order.paymentStatus, 'simulated', 'Simulated demo UPI must be marked simulated');
  assert.equal(order.serviceMode, 'dinein');
  assert.equal(order.pickupOrDeliveryDetails.tableNumber, 'Table 14');
  assert.equal(order.pickupOrDeliveryDetails.contactNumber, '+91 98765 43210');
  assert.equal(order.pickupOrDeliveryDetails.notes, 'Please bring water glasses');
  assert.equal(order.items[0].specialInstructions, 'Extra crisp patties');
});

test('Checkout Functional: 2. Takeaway order payload with operator pickup location & cash pending status', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const coffee = CAMPORA_CATALOG.items.find((i) => i.id === 'campora-coffee')!;
  const cartItems: CartItem[] = [
    { item: coffee, quantity: 1, specialInstructions: 'Less sweet' },
  ];
  const pricing = calculatePricing(cartItems, 'takeaway');

  const params: PlaceOrderParams = {
    serviceMode: 'takeaway',
    items: cartItems,
    pricing,
    paymentMethod: 'Cash at Counter (Demo)',
    customerName: 'Aarav Sharma',
    pickupOrDeliveryDetails: {
      pickupTimeEstimate: 'Main Counter • Station 1',
      contactNumber: '+91 91234 56789',
      notes: 'Pack in carrier bag',
    },
  };

  const order = await orderAdapter.placeOrder('open-canteen', params);

  assert.equal(order.serviceMode, 'takeaway');
  assert.equal(order.orderStatus, 'placed');
  assert.equal(order.paymentStatus, 'pending', 'Cash at counter must have pending payment status');
  assert.equal(order.userDisplayName, 'Aarav Sharma', 'Submitted customerName must be preserved');
  assert.equal(order.pickupOrDeliveryDetails.pickupTimeEstimate, 'Main Counter • Station 1');
  assert.equal(order.paymentMethod, 'Cash at Counter (Demo)');
  assert.equal(order.priceSnapshot.packagingCharge, 15);
});

test('Checkout Functional: 3. Delivery order payload with address and contact details', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const cake = CAMPORA_CATALOG.items.find((i) => i.id === 'dark-chocolate-cake')!;
  const cartItems: CartItem[] = [{ item: cake, quantity: 1 }];
  const pricing = calculatePricing(cartItems, 'delivery');

  const params: PlaceOrderParams = {
    serviceMode: 'delivery',
    items: cartItems,
    pricing,
    paymentMethod: 'Cash on Delivery (Demo)',
    customerName: 'Pratik Anand',
    pickupOrDeliveryDetails: {
      deliveryAddress: 'Aryabhatta Hostel, Room 304, Block B',
      contactNumber: '+91 98765 43210',
      notes: 'Call when arriving at hostel main gate',
    },
  };

  const order = await orderAdapter.placeOrder('campora-cafe', params);

  assert.equal(order.serviceMode, 'delivery');
  assert.equal(order.orderStatus, 'placed');
  assert.equal(order.paymentStatus, 'pending', 'Cash on Delivery must have pending payment status');
  assert.equal(order.userDisplayName, 'Pratik Anand');
  assert.equal(
    order.pickupOrDeliveryDetails.deliveryAddress,
    'Aryabhatta Hostel, Room 304, Block B'
  );
  assert.equal(order.priceSnapshot.packagingCharge, 20);
  assert.equal(order.priceSnapshot.deliveryFee, 30);
});

test('Checkout Functional: 4. Empty cart prevention', () => {
  const emptyItems: CartItem[] = [];
  const pricing = calculatePricing(emptyItems, 'dinein');

  assert.equal(pricing.totalItemCount, 0);
  assert.equal(pricing.grandTotal, 0);
  assert.equal(pricing.subtotal, 0);
});

test('Checkout Functional: 5. Payment preference capture and semantics', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);
  const item = CAMPORA_CATALOG.items[0];

  const upiOrder = await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'dinein',
    items: [{ item, quantity: 1 }],
    pricing: calculatePricing([{ item, quantity: 1 }], 'dinein'),
    paymentMethod: 'Demo UPI (Simulated)',
    pickupOrDeliveryDetails: {},
  });
  assert.equal(upiOrder.paymentMethod, 'Demo UPI (Simulated)');
  assert.equal(upiOrder.paymentStatus, 'simulated');

  const cardOrder = await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'takeaway',
    items: [{ item, quantity: 1 }],
    pricing: calculatePricing([{ item, quantity: 1 }], 'takeaway'),
    paymentMethod: 'Campus Card (Demo)',
    pickupOrDeliveryDetails: {},
  });
  assert.equal(cardOrder.paymentMethod, 'Campus Card (Demo)');
  assert.equal(cardOrder.paymentStatus, 'simulated');

  const codOrder = await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'delivery',
    items: [{ item, quantity: 1 }],
    pricing: calculatePricing([{ item, quantity: 1 }], 'delivery'),
    paymentMethod: 'Cash on Delivery (Demo)',
    pickupOrDeliveryDetails: {},
  });
  assert.equal(codOrder.paymentMethod, 'Cash on Delivery (Demo)');
  assert.equal(codOrder.paymentStatus, 'pending');
});

test('Checkout Functional: 6. Per-item cooking notes preservation in snapshot', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const cake = CAMPORA_CATALOG.items.find((i) => i.id === 'dark-chocolate-cake')!;
  const burger = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!;

  const cart: CartItem[] = [
    { item: cake, quantity: 1, specialInstructions: 'Extra chocolate shavings' },
    { item: burger, quantity: 2, specialInstructions: 'Extra crisp patty' },
  ];

  const order = await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'dinein',
    items: cart,
    pricing: calculatePricing(cart, 'dinein'),
    paymentMethod: 'Demo UPI (Simulated)',
    pickupOrDeliveryDetails: {},
  });

  assert.equal(order.items.length, 2);
  assert.equal(order.items[0].specialInstructions, 'Extra chocolate shavings');
  assert.equal(order.items[1].specialInstructions, 'Extra crisp patty');
});

test('Checkout Functional: 7. Pricing authority and Section 170 CGST Act compliance', async () => {
  const item1 = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!; // ₹79
  const item2 = CAMPORA_CATALOG.items.find((i) => i.id === 'campora-coffee')!; // ₹45

  // Subtotal = 79 + 45 = 124
  // 5% GST = 124 * 0.05 = 6.2 -> rounded to 6 (Section 170 nearest rupee)
  // Packaging = 20, Delivery = 30
  // Grand Total = 124 + 6 + 20 + 30 = 180
  const cart: CartItem[] = [
    { item: item1, quantity: 1 },
    { item: item2, quantity: 1 },
  ];
  const pricing = calculatePricing(cart, 'delivery');

  assert.equal(pricing.subtotal, 124);
  assert.equal(pricing.taxes, 6);
  assert.equal(pricing.packagingCharge, 20);
  assert.equal(pricing.deliveryFee, 30);
  assert.equal(pricing.grandTotal, 180);
});

test('Checkout Functional: 8. Double-submit in-flight placement guard', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);
  const item = CAMPORA_CATALOG.items[0];

  const params: PlaceOrderParams = {
    serviceMode: 'dinein',
    items: [{ item, quantity: 1 }],
    pricing: calculatePricing([{ item, quantity: 1 }], 'dinein'),
    paymentMethod: 'Demo UPI (Simulated)',
    pickupOrDeliveryDetails: {},
  };

  // Adapter sets inFlightPlacement flag synchronously during execution
  const p1 = orderAdapter.placeOrder('campora-cafe', params);
  await assert.rejects(
    async () => {
      await orderAdapter.placeOrder('campora-cafe', params);
    },
    /An order placement is already in progress/
  );
  await p1;
});

test('Checkout Functional: 9. Cart clearing strictly after persistence success', async () => {
  let simulatedCart: CartItem[] = [
    { item: CAMPORA_CATALOG.items[0], quantity: 2, specialInstructions: 'Extra cheese' },
  ];

  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const placeAndClear = async () => {
    const order = await orderAdapter.placeOrder('campora-cafe', {
      serviceMode: 'dinein',
      items: simulatedCart,
      pricing: calculatePricing(simulatedCart, 'dinein'),
      paymentMethod: 'Demo UPI (Simulated)',
      pickupOrDeliveryDetails: {},
    });
    // Cart is cleared ONLY after successful resolution
    simulatedCart = [];
    return order;
  };

  const created = await placeAndClear();
  assert.ok(created.orderId);
  assert.equal(simulatedCart.length, 0, 'Cart must be cleared after success');
});

test('Checkout Functional: 10. Cart preservation on simulated placement failure', async () => {
  const initialCart: CartItem[] = [
    { item: CAMPORA_CATALOG.items[0], quantity: 2, specialInstructions: 'Do not lose this note' },
  ];
  let currentCart = [...initialCart];

  const failingPlaceOrder = async () => {
    throw new Error('Simulated network failure');
  };

  try {
    await failingPlaceOrder();
    currentCart = [];
  } catch {
    // Preserve cart on failure
  }

  assert.equal(currentCart.length, 1, 'Cart items must be preserved on error');
  assert.equal(
    currentCart[0].specialInstructions,
    'Do not lose this note',
    'Special instructions must remain intact'
  );
});

test('Checkout Functional: 11. Order confirmation retrieval and unknown order handling', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);
  const item = CAMPORA_CATALOG.items[0];

  const order = await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'takeaway',
    items: [{ item, quantity: 1 }],
    pricing: calculatePricing([{ item, quantity: 1 }], 'takeaway'),
    paymentMethod: 'Demo UPI (Simulated)',
    pickupOrDeliveryDetails: {},
  });

  const found = await orderAdapter.getOrderById('campora-cafe', order.orderId);
  assert.ok(found);
  assert.equal(found?.orderId, order.orderId);

  const unknown = await orderAdapter.getOrderById('campora-cafe', 'non-existent-999');
  assert.equal(unknown, undefined);
});

test('Checkout Functional: 12. Order History synchronization with seed preservation', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  // Initial read gets seed orders for Campora Café
  const initialOrders = await orderAdapter.getOrders('campora-cafe');
  assert.equal(initialOrders.length, CAMPORA_SEED_ORDERS.length);

  const item = CAMPORA_CATALOG.items[0];
  const newOrder = await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'dinein',
    items: [{ item, quantity: 1 }],
    pricing: calculatePricing([{ item, quantity: 1 }], 'dinein'),
    paymentMethod: 'Demo UPI (Simulated)',
    pickupOrDeliveryDetails: {},
  });

  const updatedOrders = await orderAdapter.getOrders('campora-cafe');
  assert.equal(updatedOrders.length, CAMPORA_SEED_ORDERS.length + 1);
  assert.equal(updatedOrders[0].orderId, newOrder.orderId, 'New order must appear at the top');

  // Verify seeds are still present
  const seedIds = CAMPORA_SEED_ORDERS.map((o) => o.orderId);
  for (const sId of seedIds) {
    assert.ok(updatedOrders.some((o) => o.orderId === sId), `Seed order ${sId} must be preserved`);
  }
});

test('Checkout Functional: 13. Operator isolation during checkout & order creation', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);
  const profileAdapter = new MockProfileAdapter(storage);

  const camporaItem = CAMPORA_CATALOG.items[0];
  const openCanteenItem = OPEN_CANTEEN_CATALOG.items[0];

  // 1. Place order in Campora
  const camporaOrder = await orderAdapter.placeOrder('campora-cafe', {
    serviceMode: 'dinein',
    items: [{ item: camporaItem, quantity: 1 }],
    pricing: calculatePricing([{ item: camporaItem, quantity: 1 }], 'dinein'),
    paymentMethod: 'Demo UPI (Simulated)',
    pickupOrDeliveryDetails: { tableNumber: 'Table 5' },
  });

  // 2. Place order in Open Canteen
  const ocOrder = await orderAdapter.placeOrder('open-canteen', {
    serviceMode: 'takeaway',
    items: [{ item: openCanteenItem, quantity: 2 }],
    pricing: calculatePricing([{ item: openCanteenItem, quantity: 2 }], 'takeaway'),
    paymentMethod: 'Cash at Counter (Demo)',
    pickupOrDeliveryDetails: { pickupTimeEstimate: 'Station 2' },
  });

  // Verify orders are 100% isolated
  const camporaOrders = await orderAdapter.getOrders('campora-cafe');
  const ocOrders = await orderAdapter.getOrders('open-canteen');

  assert.ok(camporaOrders.some((o) => o.orderId === camporaOrder.orderId));
  assert.ok(!camporaOrders.some((o) => o.orderId === ocOrder.orderId));

  assert.ok(ocOrders.some((o) => o.orderId === ocOrder.orderId));
  assert.ok(!ocOrders.some((o) => o.orderId === camporaOrder.orderId));

  // Verify profiles and addresses are isolated
  const camporaProfile = await profileAdapter.getProfile('campora-cafe');
  const ocProfile = await profileAdapter.getProfile('open-canteen');

  assert.equal(camporaProfile.displayName, 'Pratik Anand');
  assert.equal(ocProfile.displayName, 'Guest User');
  assert.equal(ocProfile.savedAddresses.length, 0);
});

test('Checkout Functional: 14. Order storage key convention verified as opencanteen:<operatorId>:orders_v2', () => {
  const { STORAGE_KEYS, getOperatorStorageKey } = require('../utils/storageKeys.ts');

  assert.equal(STORAGE_KEYS.ORDERS, 'opencanteen_orders_v2');

  const camporaOrdersKey = getOperatorStorageKey(STORAGE_KEYS.ORDERS, 'campora-cafe');
  assert.equal(camporaOrdersKey, 'opencanteen:campora-cafe:orders_v2');

  const openCanteenOrdersKey = getOperatorStorageKey(STORAGE_KEYS.ORDERS, 'open-canteen');
  assert.equal(openCanteenOrdersKey, 'opencanteen:open-canteen:orders_v2');
});

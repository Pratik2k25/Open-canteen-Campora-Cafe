import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePricing, formatINR } from '../utils/pricing.ts';
import {
  findIncompatibleCartItems,
  sanitizeCartForServiceMode,
  isItemAvailableForService,
} from '../utils/serviceRules.ts';
import { CAMPORA_CATALOG, OPEN_CANTEEN_CATALOG } from '../data/mock/index.ts';
import type { CartItem, MenuItem, ServiceMode } from '../types/index.ts';
import {
  STORAGE_KEYS,
  getOperatorStorageKey,
  storageValidators,
  safeGetStorage,
} from '../utils/storageKeys.ts';

// Helper to simulate CartContext items state updates
function addItemToCart(items: CartItem[], item: MenuItem): CartItem[] {
  const existingIndex = items.findIndex((ci) => ci.item.id === item.id);
  if (existingIndex > -1) {
    const copy = [...items];
    copy[existingIndex] = {
      ...copy[existingIndex],
      quantity: copy[existingIndex].quantity + 1,
    };
    return copy;
  }
  return [...items, { item, quantity: 1 }];
}

function updateCartQuantity(items: CartItem[], itemId: string, delta: number): CartItem[] {
  return items
    .map((ci) => {
      if (ci.item.id === itemId) {
        const nextQty = ci.quantity + delta;
        return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
      }
      return ci;
    })
    .filter(Boolean) as CartItem[];
}

function removeCartItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((ci) => ci.item.id !== itemId);
}

test('Cart Functional: 1. Item addition, quantity increment, and decrement boundaries', () => {
  const burger = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!;
  const coffee = CAMPORA_CATALOG.items.find((i) => i.id === 'campora-coffee')!;

  let cart: CartItem[] = [];

  // Add first item
  cart = addItemToCart(cart, burger);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].item.id, 'chicken-burger');
  assert.equal(cart[0].quantity, 1);

  // Add same item again (increments quantity)
  cart = addItemToCart(cart, burger);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);

  // Add distinct second item
  cart = addItemToCart(cart, coffee);
  assert.equal(cart.length, 2);
  assert.equal(cart[1].item.id, 'campora-coffee');
  assert.equal(cart[1].quantity, 1);

  // Increment coffee
  cart = updateCartQuantity(cart, 'campora-coffee', 1);
  assert.equal(cart.find((ci) => ci.item.id === 'campora-coffee')!.quantity, 2);

  // Decrement coffee back to 1
  cart = updateCartQuantity(cart, 'campora-coffee', -1);
  assert.equal(cart.find((ci) => ci.item.id === 'campora-coffee')!.quantity, 1);

  // Decrement coffee by -1 when at 1 (removes item from cart boundary)
  cart = updateCartQuantity(cart, 'campora-coffee', -1);
  assert.equal(cart.length, 1);
  assert.equal(cart.some((ci) => ci.item.id === 'campora-coffee'), false);
  assert.equal(cart[0].item.id, 'chicken-burger');
});

test('Cart Functional: 2. Specific item removal and full clear cart', () => {
  const burger = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!;
  const dosa = CAMPORA_CATALOG.items.find((i) => i.id === 'masala-dosa')!;
  const coffee = CAMPORA_CATALOG.items.find((i) => i.id === 'campora-coffee')!;

  let cart: CartItem[] = [
    { item: burger, quantity: 2 },
    { item: dosa, quantity: 1 },
    { item: coffee, quantity: 3 },
  ];

  // Remove single specific item
  cart = removeCartItem(cart, 'masala-dosa');
  assert.equal(cart.length, 2);
  assert.equal(cart.some((ci) => ci.item.id === 'masala-dosa'), false);
  assert.equal(cart[0].item.id, 'chicken-burger');
  assert.equal(cart[1].item.id, 'campora-coffee');

  // Clear entire cart
  cart = [];
  assert.equal(cart.length, 0);

  // Pricing on empty cart is zero
  const emptyPricing = calculatePricing(cart, 'dinein');
  assert.equal(emptyPricing.subtotal, 0);
  assert.equal(emptyPricing.taxes, 0);
  assert.equal(emptyPricing.packagingCharge, 0);
  assert.equal(emptyPricing.deliveryFee, 0);
  assert.equal(emptyPricing.grandTotal, 0);
  assert.equal(emptyPricing.totalItemCount, 0);
});

test('Cart Functional: 3. Pricing breakdown across Dine-in, Takeaway, and Delivery modes', () => {
  const burger = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!; // ₹79
  const coffee = CAMPORA_CATALOG.items.find((i) => i.id === 'campora-coffee')!; // ₹45

  const cart: CartItem[] = [
    { item: burger, quantity: 2 }, // 2 * 79 = 158
    { item: coffee, quantity: 1 }, // 1 * 45 = 45
  ];
  // Subtotal = 158 + 45 = 203
  // GST (5%) = Math.round(203 * 0.05) = 10

  // Mode A: Dine-in (Packaging = 0, Delivery = 0)
  const dineinPricing = calculatePricing(cart, 'dinein');
  assert.equal(dineinPricing.subtotal, 203);
  assert.equal(dineinPricing.packagingCharge, 0);
  assert.equal(dineinPricing.deliveryFee, 0);
  assert.equal(dineinPricing.taxes, 10);
  assert.equal(dineinPricing.grandTotal, 213); // 203 + 10 = 213
  assert.equal(dineinPricing.totalItemCount, 3);

  // Mode B: Takeaway (Packaging = 15, Delivery = 0)
  const takeawayPricing = calculatePricing(cart, 'takeaway');
  assert.equal(takeawayPricing.subtotal, 203);
  assert.equal(takeawayPricing.packagingCharge, 15);
  assert.equal(takeawayPricing.deliveryFee, 0);
  assert.equal(takeawayPricing.taxes, 10);
  assert.equal(takeawayPricing.grandTotal, 228); // 203 + 15 + 10 = 228
  assert.equal(takeawayPricing.totalItemCount, 3);

  // Mode C: Delivery (Packaging = 20, Delivery = 30)
  const deliveryPricing = calculatePricing(cart, 'delivery');
  assert.equal(deliveryPricing.subtotal, 203);
  assert.equal(deliveryPricing.packagingCharge, 20);
  assert.equal(deliveryPricing.deliveryFee, 30);
  assert.equal(deliveryPricing.taxes, 10);
  assert.equal(deliveryPricing.grandTotal, 263); // 203 + 20 + 30 + 10 = 263
  assert.equal(deliveryPricing.totalItemCount, 3);
});

test('Cart Functional: 4. Currency formatting and rounding stability', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(150), '₹150');
  assert.equal(formatINR(1250), '₹1,250');
  assert.equal(formatINR(100000), '₹1,00,000');

  // Verify no NaN or negative numbers even on boundary input
  const emptyPricing = calculatePricing([], 'delivery');
  assert.equal(Number.isNaN(emptyPricing.grandTotal), false);
  assert.equal(emptyPricing.grandTotal, 0);

  const zeroQtyCart: CartItem[] = [{ item: CAMPORA_CATALOG.items[0], quantity: 0 }];
  const zeroPricing = calculatePricing(zeroQtyCart, 'takeaway');
  assert.equal(zeroPricing.grandTotal, 0);
});

test('Cart Functional: 5. Service-mode compatibility detection and safe sanitization', () => {
  // Create a restricted mock item that is only available for dine-in
  const dineinOnlyItem: MenuItem = {
    ...CAMPORA_CATALOG.items[0],
    id: 'sizzler-special',
    name: 'Hot Sizzler Plate',
    serviceAvailability: {
      dinein: true,
      takeaway: false,
      delivery: false,
    },
  };

  const deliveryEligibleItem = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!; // ₹79

  const mixedCart: CartItem[] = [
    { item: dineinOnlyItem, quantity: 1 },
    { item: deliveryEligibleItem, quantity: 2 },
  ];

  // Dine-in mode: both are compatible
  const incompatibleForDinein = findIncompatibleCartItems(mixedCart, 'dinein');
  assert.equal(incompatibleForDinein.length, 0);

  // Delivery mode: sizzler is incompatible!
  const incompatibleForDelivery = findIncompatibleCartItems(mixedCart, 'delivery');
  assert.equal(incompatibleForDelivery.length, 1);
  assert.equal(incompatibleForDelivery[0].item.id, 'sizzler-special');

  // Sanitize cart for delivery: removes sizzler, keeps burger
  const sanitized = sanitizeCartForServiceMode(mixedCart, 'delivery');
  assert.equal(sanitized.length, 1);
  assert.equal(sanitized[0].item.id, 'chicken-burger');
  assert.equal(sanitized[0].quantity, 2);

  // New pricing after sanitization reflects only compatible items
  const postSwitchPricing = calculatePricing(sanitized, 'delivery');
  assert.equal(postSwitchPricing.subtotal, 158); // 2 * 79 = 158
  assert.equal(postSwitchPricing.packagingCharge, 20);
  assert.equal(postSwitchPricing.deliveryFee, 30);
  assert.equal(postSwitchPricing.taxes, 8); // Math.round(158 * 0.05) = 8
  assert.equal(postSwitchPricing.grandTotal, 216); // 158 + 20 + 30 + 8 = 216
});

test('Cart Functional: 6. Operator storage key isolation and persistence format', () => {
  const camporaKey = getOperatorStorageKey(STORAGE_KEYS.CART, 'campora-cafe');
  const openCanteenKey = getOperatorStorageKey(STORAGE_KEYS.CART, 'open-canteen');
  const customOperatorKey = getOperatorStorageKey(STORAGE_KEYS.CART, 'campus-dhaba');

  assert.equal(camporaKey, 'opencanteen:campora-cafe:cart');
  assert.equal(openCanteenKey, 'opencanteen:open-canteen:cart');
  assert.equal(customOperatorKey, 'opencanteen:campus-dhaba:cart');

  // Ensure operator keys never collide
  assert.notEqual(camporaKey, openCanteenKey);
  assert.notEqual(openCanteenKey, customOperatorKey);

  // Validate serialization roundtrip with CartItem structure
  const sampleCart: CartItem[] = [
    { item: CAMPORA_CATALOG.items[0], quantity: 2, specialInstructions: 'Extra crisp' },
  ];
  const serialized = JSON.stringify(sampleCart);
  assert.equal(storageValidators.cart(serialized), true);

  const parsed = JSON.parse(serialized) as CartItem[];
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].quantity, 2);
  assert.equal(parsed[0].specialInstructions, 'Extra crisp');
  assert.equal(parsed[0].item.id, CAMPORA_CATALOG.items[0].id);

  // Validate malformed data rejection
  assert.equal(storageValidators.cart('not-json'), false);
  assert.equal(storageValidators.cart('{"notAnArray": true}'), false);
});

test('Cart Functional: 7. Per-item cooking instructions association, quantity change preservation, and item lifecycle', () => {
  const burger = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!;
  const coffee = CAMPORA_CATALOG.items.find((i) => i.id === 'campora-coffee')!;

  let cart: CartItem[] = [
    { item: burger, quantity: 1, specialInstructions: 'Extra cheese, no pickles' },
    { item: coffee, quantity: 2, specialInstructions: 'Less sugar, oat milk' },
  ];

  // 1. Instructions are associated with the correct individual cart items
  assert.equal(cart.find((ci) => ci.item.id === 'chicken-burger')!.specialInstructions, 'Extra cheese, no pickles');
  assert.equal(cart.find((ci) => ci.item.id === 'campora-coffee')!.specialInstructions, 'Less sugar, oat milk');

  // 2. Quantity changes preserve the per-item instruction
  cart = updateCartQuantity(cart, 'chicken-burger', 1);
  const updatedBurger = cart.find((ci) => ci.item.id === 'chicken-burger')!;
  assert.equal(updatedBurger.quantity, 2);
  assert.equal(updatedBurger.specialInstructions, 'Extra cheese, no pickles');

  // 3. Removing an item removes its instruction without affecting unrelated items
  cart = removeCartItem(cart, 'chicken-burger');
  assert.equal(cart.length, 1);
  assert.equal(cart.some((ci) => ci.item.id === 'chicken-burger'), false);
  assert.equal(cart[0].item.id, 'campora-coffee');
  assert.equal(cart[0].specialInstructions, 'Less sugar, oat milk');

  // 4. Instructions serialize cleanly to JSON storage format for operator persistence
  const serialized = JSON.stringify(cart);
  const rehydrated = JSON.parse(serialized) as CartItem[];
  assert.equal(rehydrated[0].specialInstructions, 'Less sugar, oat milk');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { isItemAvailableForService, findIncompatibleCartItems, sanitizeCartForServiceMode, getServiceModeLabel } from './serviceRules.ts';
import type { CartItem, MenuItem } from '../types/index.ts';

const dineInOnlyItem: MenuItem = {
  id: 'dosa-spl',
  name: 'Special Crispy Dosa',
  description: 'Served hot only',
  price: 80,
  categoryId: 'all',
  imageUrl: '',
  foodType: 'veg',
  preparationTime: '12 mins',
  serviceAvailability: { dinein: true, takeaway: false, delivery: false },
  isAvailable: true,
};

const universalItem: MenuItem = {
  id: 'burger-1',
  name: 'Chicken Burger',
  description: 'Packable burger',
  price: 79,
  categoryId: 'all',
  imageUrl: '',
  foodType: 'nonveg',
  preparationTime: '12 mins',
  serviceAvailability: { dinein: true, takeaway: true, delivery: true },
  isAvailable: true,
};

test('isItemAvailableForService respects service availability flags', () => {
  assert.equal(isItemAvailableForService(dineInOnlyItem, 'dinein'), true);
  assert.equal(isItemAvailableForService(dineInOnlyItem, 'takeaway'), false);
  assert.equal(isItemAvailableForService(dineInOnlyItem, 'delivery'), false);
  assert.equal(isItemAvailableForService(universalItem, 'delivery'), true);
});

test('findIncompatibleCartItems detects items restricted under target mode', () => {
  const cart: CartItem[] = [
    { item: dineInOnlyItem, quantity: 1 },
    { item: universalItem, quantity: 2 },
  ];

  const incompatibleForDelivery = findIncompatibleCartItems(cart, 'delivery');
  assert.equal(incompatibleForDelivery.length, 1);
  assert.equal(incompatibleForDelivery[0].item.id, 'dosa-spl');

  const incompatibleForDinein = findIncompatibleCartItems(cart, 'dinein');
  assert.equal(incompatibleForDinein.length, 0);
});

test('sanitizeCartForServiceMode removes incompatible items safely', () => {
  const cart: CartItem[] = [
    { item: dineInOnlyItem, quantity: 1 },
    { item: universalItem, quantity: 2 },
  ];

  const sanitized = sanitizeCartForServiceMode(cart, 'takeaway');
  assert.equal(sanitized.length, 1);
  assert.equal(sanitized[0].item.id, 'burger-1');
});

test('getServiceModeLabel provides proper display names', () => {
  assert.equal(getServiceModeLabel('dinein'), 'Dine-in');
  assert.equal(getServiceModeLabel('takeaway'), 'Takeaway');
  assert.equal(getServiceModeLabel('delivery'), 'Delivery');
});

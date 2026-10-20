import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePricing, formatINR, GST_RATE, TAKEAWAY_PACKAGING_FEE, DELIVERY_PACKAGING_FEE, BASE_DELIVERY_FEE } from './pricing.ts';
import type { CartItem } from '../types/index.ts';

const mockItemVeg = {
  id: 'paratha-1',
  name: 'Paneer Paratha',
  description: 'Fresh paratha with butter',
  price: 60,
  categoryId: 'paratha',
  imageUrl: '',
  foodType: 'veg' as const,
  preparationTime: '10 mins',
  serviceAvailability: { dinein: true, takeaway: true, delivery: true },
  isAvailable: true,
};

const mockItemNonVeg = {
  id: 'burger-1',
  name: 'Chicken Burger',
  description: 'Crispy patty burger',
  price: 79,
  categoryId: 'all',
  imageUrl: '',
  foodType: 'nonveg' as const,
  preparationTime: '12 mins',
  serviceAvailability: { dinein: true, takeaway: true, delivery: true },
  isAvailable: true,
};

test('calculatePricing returns zero totals for empty cart', () => {
  const result = calculatePricing([], 'dinein');
  assert.equal(result.subtotal, 0);
  assert.equal(result.taxes, 0);
  assert.equal(result.packagingCharge, 0);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.grandTotal, 0);
  assert.equal(result.totalItemCount, 0);
});

test('calculatePricing correctly calculates Dine-in order without packaging or delivery fees', () => {
  const items: CartItem[] = [
    { item: mockItemVeg, quantity: 2 }, // 60 * 2 = 120
    { item: mockItemNonVeg, quantity: 1 }, // 79 * 1 = 79
  ]; // subtotal = 199

  const result = calculatePricing(items, 'dinein');
  assert.equal(result.subtotal, 199);
  assert.equal(result.totalItemCount, 3);
  assert.equal(result.taxes, Math.round(199 * GST_RATE)); // Math.round(9.95) = 10
  assert.equal(result.packagingCharge, 0);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.grandTotal, 199 + 10);
});

test('calculatePricing includes packaging fee for Takeaway mode', () => {
  const items: CartItem[] = [{ item: mockItemVeg, quantity: 1 }]; // subtotal = 60
  const result = calculatePricing(items, 'takeaway');
  assert.equal(result.packagingCharge, TAKEAWAY_PACKAGING_FEE);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.grandTotal, 60 + Math.round(60 * GST_RATE) + TAKEAWAY_PACKAGING_FEE);
});

test('calculatePricing includes packaging and delivery fees for Delivery mode', () => {
  const items: CartItem[] = [{ item: mockItemVeg, quantity: 1 }]; // subtotal = 60
  const result = calculatePricing(items, 'delivery');
  assert.equal(result.packagingCharge, DELIVERY_PACKAGING_FEE);
  assert.equal(result.deliveryFee, BASE_DELIVERY_FEE);
  assert.equal(result.grandTotal, 60 + Math.round(60 * GST_RATE) + DELIVERY_PACKAGING_FEE + BASE_DELIVERY_FEE);
});

test('formatINR formats currency strings correctly', () => {
  assert.equal(formatINR(90), '₹90');
  assert.equal(formatINR(1250), '₹1,250');
});

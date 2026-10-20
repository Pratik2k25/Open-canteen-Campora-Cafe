import type { CartItem, PriceBreakdown, ServiceMode } from '../types/index.ts';

export const GST_RATE = 0.05; // 5% GST for food and beverage
export const TAKEAWAY_PACKAGING_FEE = 15; // ₹15 packaging charge
export const DELIVERY_PACKAGING_FEE = 20; // ₹20 packaging charge
export const BASE_DELIVERY_FEE = 30; // ₹30 delivery fee

/**
 * Calculates authoritative price breakdown for given cart items and service mode.
 */
export function calculatePricing(items: CartItem[], serviceMode: ServiceMode): PriceBreakdown {
  const subtotal = items.reduce((sum, item) => sum + Math.max(0, item.item.price * item.quantity), 0);
  const totalItemCount = items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0);

  if (totalItemCount === 0 || subtotal === 0) {
    return {
      subtotal: 0,
      taxes: 0,
      packagingCharge: 0,
      deliveryFee: 0,
      grandTotal: 0,
      totalItemCount: 0,
    };
  }

  // Calculate 5% GST rounded to nearest Rupee
  const taxes = Math.round(subtotal * GST_RATE);

  // Service mode specific charges
  let packagingCharge = 0;
  let deliveryFee = 0;

  if (serviceMode === 'takeaway') {
    packagingCharge = TAKEAWAY_PACKAGING_FEE;
  } else if (serviceMode === 'delivery') {
    packagingCharge = DELIVERY_PACKAGING_FEE;
    deliveryFee = BASE_DELIVERY_FEE;
  }

  const grandTotal = subtotal + taxes + packagingCharge + deliveryFee;

  return {
    subtotal,
    taxes,
    packagingCharge,
    deliveryFee,
    grandTotal,
    totalItemCount,
  };
}

/**
 * Formats amount in Indian Rupee format (₹)
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

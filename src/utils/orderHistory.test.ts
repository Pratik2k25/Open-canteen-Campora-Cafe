import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterOrdersByTab,
  getOrderTabCounts,
  formatOrderTabLabel,
  getOrderStatusBadgeConfig,
  getServiceBadgeConfig,
  formatOrderItemsSummary,
} from './orderHistory.ts';
import type { Order } from '../types/index.ts';

const MOCK_ORDERS: Order[] = [
  {
    orderId: 'C1047',
    userId: 'u1',
    userDisplayName: 'Pratik',
    serviceMode: 'dinein',
    items: [],
    priceSnapshot: { subtotal: 292, taxes: 0, packagingCharge: 0, deliveryFee: 0, grandTotal: 292, totalItemCount: 2 },
    subtotal: 292,
    taxes: 0,
    applicableCharges: 0,
    grandTotal: 292,
    paymentStatus: 'completed',
    paymentMethod: 'UPI',
    orderStatus: 'preparing',
    pickupOrDeliveryDetails: {},
    createdAt: '2025-06-16T06:02:00.000Z',
    updatedAt: '2025-06-16T06:02:00.000Z',
    itemsSummary: 'Jalebi (x1), Rosogulla (x1)',
  },
  {
    orderId: 'C1039',
    userId: 'u1',
    userDisplayName: 'Pratik',
    serviceMode: 'takeaway',
    items: [],
    priceSnapshot: { subtotal: 120, taxes: 0, packagingCharge: 0, deliveryFee: 0, grandTotal: 120, totalItemCount: 1 },
    subtotal: 120,
    taxes: 0,
    applicableCharges: 0,
    grandTotal: 120,
    paymentStatus: 'completed',
    paymentMethod: 'UPI',
    orderStatus: 'cancelled',
    pickupOrDeliveryDetails: {},
    createdAt: '2025-06-08T06:02:00.000Z',
    updatedAt: '2025-06-08T06:02:00.000Z',
  },
];

describe('Order History Pure Logic', () => {
  it('computes All Orders and Cancelled counts accurately', () => {
    const counts = getOrderTabCounts(MOCK_ORDERS);
    assert.equal(counts.allCount, 2);
    assert.equal(counts.cancelledCount, 1);
  });

  it('formats tab labels with counts when orders exist and without counts when empty', () => {
    assert.equal(formatOrderTabLabel('all', 12, 2), 'All Orders (12)');
    assert.equal(formatOrderTabLabel('cancelled', 12, 2), 'Cancelled (2)');
    assert.equal(formatOrderTabLabel('all', 0, 0), 'All Orders');
    assert.equal(formatOrderTabLabel('cancelled', 0, 0), 'Cancelled');
  });

  it('filters orders by tab correctly', () => {
    assert.equal(filterOrdersByTab(MOCK_ORDERS, 'all').length, 2);
    const cancelledOnly = filterOrdersByTab(MOCK_ORDERS, 'cancelled');
    assert.equal(cancelledOnly.length, 1);
    assert.equal(cancelledOnly[0].orderId, 'C1039');
  });

  it('returns correct status badge configs for Preparing, Delivered, Completed, and Cancelled', () => {
    assert.equal(getOrderStatusBadgeConfig('preparing').label, 'Preparing');
    assert.equal(getOrderStatusBadgeConfig('preparing').iconType, 'clock');
    assert.equal(getOrderStatusBadgeConfig('delivered').label, 'Delivered');
    assert.equal(getOrderStatusBadgeConfig('completed').label, 'Completed');
    assert.equal(getOrderStatusBadgeConfig('cancelled').label, 'Cancelled');
  });

  it('returns correct service mode badge configs for Dinein, Takeaway, and Delivery', () => {
    assert.equal(getServiceBadgeConfig('dinein').label, 'Dinein');
    assert.equal(getServiceBadgeConfig('takeaway').label, 'Takeaway');
    assert.equal(getServiceBadgeConfig('delivery').label, 'Delivery');
  });

  it('formats order items summary using override or cart items', () => {
    assert.equal(formatOrderItemsSummary([], 'Jalebi (x1), Rosogulla (x1)'), 'Jalebi (x1), Rosogulla (x1)');
  });
});

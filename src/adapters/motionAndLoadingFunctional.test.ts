import test from 'node:test';
import assert from 'node:assert/strict';
import {
  beginVegModeTransition,
  commitCoveredVegModeState,
  beginRevealVegModeState,
  completeVegModeTransition,
  createInitialVegTransitionState,
  getVegTransitionVisualConfig,
} from '../utils/vegModeTransition.ts';
import {
  resolveFloatingCartComposition,
  getFlightTargetOffsetForItem,
  type VisualSlotCoordinate,
} from '../utils/floatingCartState.ts';
import {
  computeNavState,
  computeSpatialTransition,
  resolveProfileBackTarget,
} from '../utils/navigationState.ts';
import { CAMPORA_CATALOG, CAMPORA_SEED_ORDERS } from '../data/mock/index.ts';
import { MockOrderAdapter } from './mockOrderAdapter.ts';
import { MockProfileAdapter } from './mockProfileAdapter.ts';
import { calculatePricing } from '../utils/pricing.ts';
import { validateAddressInput, validateProfileUpdate } from '../utils/profileData.ts';
import type { CartItem, MenuItem } from '../types/index.ts';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}

// 1. VEG Transition State Machine Full Cycle
test('Motion & Loading: 1. VEG transition state machine progresses through cover, covered, reveal, and idle phases', () => {
  const initial = createInitialVegTransitionState(false);
  assert.equal(initial.phase, 'idle');
  assert.equal(initial.toggleVegOnly, false);
  assert.equal(initial.displayedVegOnly, false);
  assert.equal(initial.runId, 0);

  // Step 1: User toggles VEG Mode ON
  const covering = beginVegModeTransition(initial, true, false);
  assert.equal(covering.phase, 'covering');
  assert.equal(covering.toggleVegOnly, true);
  assert.equal(covering.displayedVegOnly, false, 'Menu items must not change yet while covering');
  assert.equal(covering.runId, 1);

  // Step 2: Overlay reaches fully covered point
  const covered = commitCoveredVegModeState(covering, covering.runId);
  assert.equal(covered.phase, 'covered');
  assert.equal(covered.displayedVegOnly, true, 'Menu items commit to VEG ON while covered');

  // Step 3: Overlay begins revealing
  const revealing = beginRevealVegModeState(covered, covered.runId);
  assert.equal(revealing.phase, 'revealing');

  // Step 4: Transition completes to idle
  const completed = completeVegModeTransition(revealing, revealing.runId);
  assert.equal(completed.phase, 'idle');
  assert.equal(completed.displayedVegOnly, true);
  assert.equal(completed.toggleVegOnly, true);
});

// 2. Rapid VEG Toggling State Consistency
test('Motion & Loading: 2. Rapid VEG toggling updates runId and prevents stale timer commits', () => {
  const initial = createInitialVegTransitionState(false);

  // User taps ON
  const run1 = beginVegModeTransition(initial, true, false);
  assert.equal(run1.runId, 1);

  // User immediately taps OFF before run 1 completes
  const run2 = beginVegModeTransition(run1, false, false);
  assert.equal(run2.runId, 2);
  assert.equal(run2.toggleVegOnly, false);

  // If a stale timer from run 1 fires, it must be ignored
  const staleCommit = commitCoveredVegModeState(run2, 1);
  assert.equal(staleCommit.displayedVegOnly, run2.displayedVegOnly, 'Stale runId must not commit displayed state');

  // Active run 2 commits cleanly
  const validCommit = commitCoveredVegModeState(run2, 2);
  assert.equal(validCommit.displayedVegOnly, false);
});

// 3. Reduced Motion Support for VEG Transition
test('Motion & Loading: 3. Reduced motion skips overlay animation and commits state immediately', () => {
  const initial = createInitialVegTransitionState(false);

  // User toggles with prefersReducedMotion = true
  const reducedMotionState = beginVegModeTransition(initial, true, true);
  assert.equal(reducedMotionState.phase, 'idle', 'Phase must remain idle to avoid rendering full-screen overlay');
  assert.equal(reducedMotionState.toggleVegOnly, true);
  assert.equal(reducedMotionState.displayedVegOnly, true, 'Dietary filter must update immediately');
});

// 4. Floating Cart Layer Composition and Flight Offsets
test('Motion & Loading: 4. Floating cart resolves layered compositions and beverage flight offsets', () => {
  const burger = CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')!;
  const cake = CAMPORA_CATALOG.items.find((i) => i.id === 'dark-chocolate-cake')!;
  const beverageItem: MenuItem = {
    ...cake,
    id: 'cold-coffee',
    name: 'Cold Coffee',
    categoryId: 'beverages',
    visualType: 'coffee-cup',
  };

  const foodOffset = getFlightTargetOffsetForItem('takeaway', burger);
  const bevOffset = getFlightTargetOffsetForItem('takeaway', beverageItem);

  assert.notEqual(foodOffset.offsetX, bevOffset.offsetX, 'Beverages must have distinct flight landing offsets');

  // Verify takeaway kraft bag composition with beverage alongside
  const cartItems: CartItem[] = [
    { item: burger, quantity: 1 },
    { item: beverageItem, quantity: 1 },
  ];
  const comp = resolveFloatingCartComposition('takeaway', cartItems, null);
  assert.equal(comp.state, 'filled');
  assert.equal(comp.mode, 'takeaway');
  assert.ok(comp.visibleFoodItems.length >= 1, 'Kraft bag contains solid food miniature');
  assert.ok(comp.visibleBeverageItems.length >= 1, 'Kraft bag places 3D beverage beside bag');
});

// 5. Spatial Page Transitions and Back Navigation Resolution
test('Motion & Loading: 5. Spatial transition computes forward/backward coordinates and back targets', () => {
  // Home -> Profile
  const forward = computeSpatialTransition('/', '/profile', true, false);
  assert.equal(forward.stage, 'to-profile');
  assert.equal(forward.mainTransform, 'translateX(-100%)');
  assert.equal(forward.profileTransform, 'translateX(0%)');

  // Reduced motion forward
  const forwardReduced = computeSpatialTransition('/', '/profile', true, true);
  assert.equal(forwardReduced.stage, 'idle');
  assert.equal(forwardReduced.transitionDurationMs, 0);

  // Profile back target resolves to prior route or falls back to Home
  assert.equal(resolveProfileBackTarget('/orders'), '/orders');
  assert.equal(resolveProfileBackTarget('/cart'), '/');
  assert.equal(resolveProfileBackTarget('/'), '/');
});

// 6. Navigation Bar Visibility and Tab Computation
test('Motion & Loading: 6. Bottom navigation bar visibility across customer routes', () => {
  // Home and Orders show bottom nav
  assert.equal(computeNavState('/').showBottomNav, true);
  assert.equal(computeNavState('/orders').showBottomNav, true);

  // Profile, Cart, Checkout, and Confirmation strictly hide bottom nav
  assert.equal(computeNavState('/profile').showBottomNav, false);
  assert.equal(computeNavState('/cart').showBottomNav, false);
  assert.equal(computeNavState('/checkout').showBottomNav, false);
  assert.equal(computeNavState('/order-confirmation/C1048').showBottomNav, false);
});

// 7. Operator Isolation During Async Operations
test('Motion & Loading: 7. Operator switching isolates profile data and order history without leakage', async () => {
  const storage = new MemoryStorage();
  const profileAdapter = new MockProfileAdapter(storage);
  const orderAdapter = new MockOrderAdapter(storage);

  // Campora profile
  const camporaProfile = await profileAdapter.getProfile('campora-cafe');
  assert.equal(camporaProfile.displayName, 'Pratik Anand');
  assert.ok(camporaProfile.savedAddresses.length >= 2);

  // Switch to independent custom canteen
  const customProfile = await profileAdapter.getProfile('custom-science-canteen');
  assert.equal(customProfile.displayName, 'Guest User');
  assert.equal(customProfile.savedAddresses.length, 0);

  // Orders isolation
  const camporaOrders = await orderAdapter.getOrders('campora-cafe');
  assert.equal(camporaOrders.length, 12);
  const customOrders = await orderAdapter.getOrders('custom-science-canteen');
  assert.equal(customOrders.length, 0);
});

// 8. Order Detail Data Integrity and Cancellation Metadata
test('Motion & Loading: 8. Order cancellation preserves customer notes and sets dedicated cancellationReason', async () => {
  const storage = new MemoryStorage();
  const orderAdapter = new MockOrderAdapter(storage);

  const initialOrders = await orderAdapter.getOrders('campora-cafe');
  const target = initialOrders.find((o) => o.orderId === 'C1047')!;
  const originalNotes = target.pickupOrDeliveryDetails.notes;

  const cancelled = await orderAdapter.cancelOrder('campora-cafe', 'C1047', 'Customer delayed');
  assert.equal(cancelled.orderStatus, 'cancelled');
  assert.equal(cancelled.cancellationReason, 'Customer delayed');
  assert.equal(
    cancelled.pickupOrDeliveryDetails.notes,
    originalNotes,
    'Original customer notes must not be modified or overwritten'
  );
});

// 9. Pricing and Service Rule Integrity
test('Motion & Loading: 9. Dynamic service pricing calculations maintain mathematical correctness', () => {
  const burger = CAMPORA_CATALOG.items[0];
  const items: CartItem[] = [{ item: burger, quantity: 2 }];

  // Dine-in: packaging = 0, delivery = 0
  const dinein = calculatePricing(items, 'dinein');
  assert.equal(dinein.packagingCharge, 0);
  assert.equal(dinein.deliveryFee, 0);
  assert.equal(dinein.grandTotal, dinein.subtotal + dinein.taxes);

  // Takeaway: packaging = 15, delivery = 0
  const takeaway = calculatePricing(items, 'takeaway');
  assert.equal(takeaway.packagingCharge, 15);
  assert.equal(takeaway.deliveryFee, 0);

  // Delivery: packaging = 20, delivery = 30
  const delivery = calculatePricing(items, 'delivery');
  assert.equal(delivery.packagingCharge, 20);
  assert.equal(delivery.deliveryFee, 30);
});

// 10. Profile and Address Input Validation Rules
test('Motion & Loading: 10. Form validation rejects invalid inputs and accepts complete data', () => {
  // Address validation
  assert.equal(validateAddressInput({ buildingOrGate: '', roomOrLandmark: 'Room 1' }).valid, false);
  assert.equal(validateAddressInput({ buildingOrGate: 'Block A', roomOrLandmark: '' }).valid, false);
  assert.equal(validateAddressInput({ buildingOrGate: 'Block A', roomOrLandmark: 'Room 1', recipientPhone: '123' }).valid, false);
  assert.equal(validateAddressInput({ buildingOrGate: 'Block A', roomOrLandmark: 'Room 1', recipientPhone: '+91 98765 43210' }).valid, true);

  // Profile validation
  assert.equal(validateProfileUpdate({ displayName: '', email: 'user@campora.test' }).valid, false);
  assert.equal(validateProfileUpdate({ displayName: 'John', email: 'invalid-email' }).valid, false);
  assert.equal(validateProfileUpdate({ displayName: 'John Doe', email: 'user@campora.test' }).valid, true);
});

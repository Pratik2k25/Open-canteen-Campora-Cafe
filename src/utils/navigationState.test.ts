import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeNavState,
  computeSpatialTransition,
  resolveProfileBackTarget,
  NAVIGATION_ASSETS,
} from './navigationState.ts';

test('computeNavState identifies home, order, and profile routes correctly', () => {
  const home = computeNavState('/');
  assert.equal(home.currentTab, 'home');
  assert.equal(home.isHomeActive, true);
  assert.equal(home.isOrderActive, false);
  assert.equal(home.sliderPosition, 0);
  assert.equal(home.showBottomNav, true);

  const orders = computeNavState('/orders');
  assert.equal(orders.currentTab, 'order');
  assert.equal(orders.isOrderActive, true);
  assert.equal(orders.isHomeActive, false);
  assert.equal(orders.sliderPosition, 1);
  assert.equal(orders.showBottomNav, true);

  const orderDetail = computeNavState('/orders/order-123');
  assert.equal(orderDetail.currentTab, 'order');
  assert.equal(orderDetail.sliderPosition, 1);

  const profile = computeNavState('/profile');
  assert.equal(profile.currentTab, 'profile');
  assert.equal(profile.isProfileActive, true);
  // BottomNav MUST be hidden on Profile
  assert.equal(profile.showBottomNav, false);

  const cart = computeNavState('/cart');
  assert.equal(cart.currentTab, 'other');
  assert.equal(cart.isCartActive, true);
  // BottomNav MUST be hidden on Cart (to allow Cart sticky checkout action bar)
  assert.equal(cart.showBottomNav, false);
});

test('computeSpatialTransition computes forward and backward slide coordinates', () => {
  // 1. Home -> Profile (Going to profile)
  const toProfileStart = computeSpatialTransition('/', '/profile', false);
  assert.equal(toProfileStart.stage, 'to-profile');
  assert.equal(toProfileStart.mainTransform, 'translateX(0%)');
  assert.equal(toProfileStart.profileTransform, 'translateX(100%)');

  const toProfileSliding = computeSpatialTransition('/', '/profile', true);
  assert.equal(toProfileSliding.mainTransform, 'translateX(-100%)');
  assert.equal(toProfileSliding.profileTransform, 'translateX(0%)');

  // 2. Profile -> Home (Returning from profile)
  const fromProfileStart = computeSpatialTransition('/profile', '/', false);
  assert.equal(fromProfileStart.stage, 'from-profile');
  assert.equal(fromProfileStart.mainTransform, 'translateX(-100%)');
  assert.equal(fromProfileStart.profileTransform, 'translateX(0%)');

  const fromProfileSliding = computeSpatialTransition('/profile', '/', true);
  assert.equal(fromProfileSliding.mainTransform, 'translateX(0%)');
  assert.equal(fromProfileSliding.profileTransform, 'translateX(100%)');

  // 3. Reduced motion
  const reduced = computeSpatialTransition('/', '/profile', false, true);
  assert.equal(reduced.transitionDurationMs, 0);
  assert.equal(reduced.mainTransform, 'translateX(-100%)');
  assert.equal(reduced.profileTransform, 'translateX(0%)');
});

test('resolveProfileBackTarget falls back to Home or remembers Orders', () => {
  assert.equal(resolveProfileBackTarget('/orders'), '/orders');
  assert.equal(resolveProfileBackTarget('/'), '/');
  assert.equal(resolveProfileBackTarget(null), '/');
});

test('NAVIGATION_ASSETS provides verified 3D asset paths', () => {
  assert.ok(NAVIGATION_ASSETS.homeActive3dWebp.includes('home-active-3d'));
  assert.ok(NAVIGATION_ASSETS.orderActive3dWebp.includes('order-active-3d'));
  assert.ok(NAVIGATION_ASSETS.profile3dWebp.includes('profile-3d'));
});

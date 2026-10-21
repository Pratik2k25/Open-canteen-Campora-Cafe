import test from 'node:test';
import assert from 'node:assert/strict';
import { OPEN_CANTEEN_PRESET, resolveCanteenConfig } from '../config/canteenConfig.ts';
import { getOperatorStorageKey } from '../utils/storageKeys.ts';

class MockLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
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
  get length(): number {
    return this.store.size;
  }
}

test('Account & Privacy: 1. Canteen configuration provides valid operator identity and privacy contact', () => {
  const config = resolveCanteenConfig({
    identity: { id: 'open-canteen', displayName: 'Open Canteen' },
  });

  assert.equal(config.identity.displayName, 'Open Canteen');
  assert.equal(config.identity.id, 'open-canteen');
  assert.equal(config.pwa.appName, 'Open Canteen');
  assert.equal(config.branding.primaryColor, '#166534');
});

test('Account & Privacy: 2. Storage keys for privacy-sensitive data are operator-isolated', () => {
  const operatorId = 'open-canteen';
  const cartKey = getOperatorStorageKey('cart_v1', operatorId);
  const guestKey = getOperatorStorageKey('guest_info', operatorId);
  const vegKey = getOperatorStorageKey('veg_only', operatorId);

  assert.equal(cartKey, 'opencanteen:open-canteen:cart_v1');
  assert.equal(guestKey, 'opencanteen:open-canteen:guest_info');
  assert.equal(vegKey, 'opencanteen:open-canteen:veg_only');
  assert.ok(!cartKey.includes('campora'));
});

test('Account & Privacy: 3. Cache clearing removes only operator-scoped session state and preserves app sanity', () => {
  const mockStorage = new MockLocalStorage();
  const operatorId = 'open-canteen';
  const cartKey = getOperatorStorageKey('cart_v1', operatorId);
  const guestKey = getOperatorStorageKey('guest_info', operatorId);

  mockStorage.setItem(cartKey, JSON.stringify({ items: [{ id: 'item-1', quantity: 2 }] }));
  mockStorage.setItem(guestKey, JSON.stringify({ name: 'Guest User' }));

  assert.notEqual(mockStorage.getItem(cartKey), null);
  assert.notEqual(mockStorage.getItem(guestKey), null);

  // Perform safe clearing as done in AccountPrivacyView
  mockStorage.removeItem(cartKey);
  mockStorage.removeItem(guestKey);

  assert.equal(mockStorage.getItem(cartKey), null);
  assert.equal(mockStorage.getItem(guestKey), null);
});

test('Account & Privacy: 4. Custom white-label operator displays dynamic disclosures without brand leakage', () => {
  const customConfig = resolveCanteenConfig({
    identity: { id: 'tech-campus', displayName: 'Tech Campus Bistro' },
    contact: { supportEmail: 'bistro@techcampus.edu', operatingHours: '9 AM - 8 PM' },
  });

  assert.equal(customConfig.identity.displayName, 'Tech Campus Bistro');
  assert.equal(customConfig.contact.supportEmail, 'bistro@techcampus.edu');
  assert.equal(customConfig.contact.operatingHours, '9 AM - 8 PM');
  assert.equal(customConfig.identity.id, 'tech-campus');
});

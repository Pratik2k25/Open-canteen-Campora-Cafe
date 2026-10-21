import test from 'node:test';
import assert from 'node:assert/strict';
import { runStorageMigration } from './storageMigration.ts';
import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  readGenericOrLegacy,
  readScopedOrLegacy,
  getOperatorStorageKey,
  storageValidators,
  type StorageLike,
} from './storageKeys.ts';
import {
  readCanonicalVegPreference,
  writeCanonicalVegPreference,
} from './vegModeTransition.ts';
import { getDeploymentCanteenConfig } from '../config/canteenConfig.ts';

function createMockStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

test('Storage Migration: Scenario 1 - Fresh installation with no keys', () => {
  const storage = createMockStorage();
  const result = runStorageMigration(storage);

  assert.equal(result.success, true);
  assert.equal(result.migratedKeys.length, 0);
  assert.equal(result.preservedKeys.length, 0);
  assert.equal(result.skippedKeys.length, 6);
  assert.equal(result.errors.length, 0);
});

test('Storage Migration: Scenario 2 - Legacy keys only (Full Migration)', () => {
  const mockCart = JSON.stringify([{ id: 'cart-1', name: 'Paneer Roll', price: 120, quantity: 2 }]);
  const mockOrders = JSON.stringify([{ id: 'ord-101', status: 'ready', total: 240 }]);
  const mockProfile = JSON.stringify({ displayName: 'Test Student', vegMode: true, appearance: 'Dark' });
  const mockUser = JSON.stringify({ uid: 'usr-1', displayName: 'Test User' });

  const storage = createMockStorage({
    [LEGACY_STORAGE_KEYS.CART]: mockCart,
    [LEGACY_STORAGE_KEYS.SERVICE_MODE]: 'takeaway',
    [LEGACY_STORAGE_KEYS.ORDERS]: mockOrders,
    [LEGACY_STORAGE_KEYS.PROFILE]: mockProfile,
    [LEGACY_STORAGE_KEYS.VEG_ONLY]: 'true',
    [LEGACY_STORAGE_KEYS.USER]: mockUser,
  });

  const result = runStorageMigration(storage);

  assert.equal(result.success, true);
  assert.equal(result.migratedKeys.length, 6);
  assert.equal(result.errors.length, 0);

  // Check canonical keys written correctly
  assert.equal(storage.getItem(STORAGE_KEYS.CART), mockCart);
  assert.equal(storage.getItem(STORAGE_KEYS.SERVICE_MODE), 'takeaway');
  assert.equal(storage.getItem(STORAGE_KEYS.ORDERS), mockOrders);
  assert.equal(storage.getItem(STORAGE_KEYS.PROFILE), mockProfile);
  assert.equal(storage.getItem(STORAGE_KEYS.VEG_ONLY), 'true');
  assert.equal(storage.getItem(STORAGE_KEYS.USER), mockUser);

  // Check legacy keys retained for rollback safety
  assert.equal(storage.getItem(LEGACY_STORAGE_KEYS.CART), mockCart);
  assert.equal(storage.getItem(LEGACY_STORAGE_KEYS.SERVICE_MODE), 'takeaway');
});

test('Storage Migration: Scenario 3 & 4 - Precedence of canonical keys over legacy keys', () => {
  const canonicalCart = JSON.stringify([{ id: 'cart-new', name: 'Veg Biryani', price: 150, quantity: 1 }]);
  const legacyCart = JSON.stringify([{ id: 'cart-old', name: 'Old Samosa', price: 30, quantity: 1 }]);

  const storage = createMockStorage({
    [STORAGE_KEYS.CART]: canonicalCart,
    [LEGACY_STORAGE_KEYS.CART]: legacyCart,
    [STORAGE_KEYS.SERVICE_MODE]: 'delivery',
    [LEGACY_STORAGE_KEYS.SERVICE_MODE]: 'dinein',
  });

  const result = runStorageMigration(storage);

  assert.equal(result.success, true);
  assert.ok(result.preservedKeys.includes(STORAGE_KEYS.CART));
  assert.ok(result.preservedKeys.includes(STORAGE_KEYS.SERVICE_MODE));
  assert.equal(result.migratedKeys.length, 0);

  // Canonical keys MUST NOT be overwritten by legacy keys
  assert.equal(storage.getItem(STORAGE_KEYS.CART), canonicalCart);
  assert.equal(storage.getItem(STORAGE_KEYS.SERVICE_MODE), 'delivery');
});

test('Storage Migration: Scenario 5 - Malformed legacy JSON is gracefully skipped without crashing', () => {
  const storage = createMockStorage({
    [LEGACY_STORAGE_KEYS.CART]: '[[MALFORMED_JSON_STRING{{{',
    [LEGACY_STORAGE_KEYS.SERVICE_MODE]: 'invalid_mode_not_allowed',
    [LEGACY_STORAGE_KEYS.VEG_ONLY]: 'maybe',
  });

  const result = runStorageMigration(storage);

  // Malformed keys skipped and reported in errors
  assert.equal(result.migratedKeys.length, 0);
  assert.equal(result.errors.length, 3);
  assert.equal(storage.getItem(STORAGE_KEYS.CART), null);
  assert.equal(storage.getItem(STORAGE_KEYS.SERVICE_MODE), null);
});

test('Storage Migration: Scenario 6 - Idempotence (multiple consecutive runs produce no change)', () => {
  const mockCart = JSON.stringify([{ id: 'cart-1', name: 'Coffee', price: 40, quantity: 1 }]);
  const storage = createMockStorage({
    [LEGACY_STORAGE_KEYS.CART]: mockCart,
    [LEGACY_STORAGE_KEYS.SERVICE_MODE]: 'dinein',
  });

  // Run 1: Migrates
  const res1 = runStorageMigration(storage);
  assert.equal(res1.migratedKeys.length, 2);

  // Run 2: Preserves already migrated canonical keys
  const res2 = runStorageMigration(storage);
  assert.equal(res2.migratedKeys.length, 0);
  assert.equal(res2.preservedKeys.length, 2);
  assert.equal(storage.getItem(STORAGE_KEYS.CART), mockCart);

  // Run 3: Still preserved
  const res3 = runStorageMigration(storage);
  assert.equal(res3.migratedKeys.length, 0);
  assert.equal(res3.preservedKeys.length, 2);
});

test('Storage Migration: Scenario 7 - Unavailable storage handled gracefully', () => {
  const result = runStorageMigration(null);
  assert.equal(result.success, true);
  assert.equal(result.migratedKeys.length, 0);
});

test('Storage Migration: Helper readGenericOrLegacy retrieves canonical or falls back to legacy', () => {
  const storage = createMockStorage({
    [LEGACY_STORAGE_KEYS.SERVICE_MODE]: 'takeaway',
  });

  // Read when only legacy exists
  const mode1 = readGenericOrLegacy(
    STORAGE_KEYS.SERVICE_MODE,
    LEGACY_STORAGE_KEYS.SERVICE_MODE,
    storageValidators.serviceMode,
    (v) => v,
    'dinein',
    storage
  );
  assert.equal(mode1, 'takeaway');

  // Read when canonical exists (precedence)
  storage.setItem(STORAGE_KEYS.SERVICE_MODE, 'delivery');
  const mode2 = readGenericOrLegacy(
    STORAGE_KEYS.SERVICE_MODE,
    LEGACY_STORAGE_KEYS.SERVICE_MODE,
    storageValidators.serviceMode,
    (v) => v,
    'dinein',
    storage
  );
  assert.equal(mode2, 'delivery');
});

test('Storage Migration: Section 3 Cross-canteen isolation - non-campora operator NEVER imports campora_* keys', () => {
  const camporaCart = JSON.stringify([{ id: 'jalebi', name: 'Jalebi', price: 40, quantity: 2 }]);
  const storage = createMockStorage({
    [LEGACY_STORAGE_KEYS.CART]: camporaCart,
    [LEGACY_STORAGE_KEYS.SERVICE_MODE]: 'takeaway',
    [STORAGE_KEYS.CART]: camporaCart,
  });

  // Attempt migration targeted at an unrelated operator ('open-canteen')
  const result = runStorageMigration(storage, 'open-canteen');

  // Must skip all keys and NOT migrate campora data into open-canteen
  assert.equal(result.success, true);
  assert.equal(result.migratedKeys.length, 0);

  // Read via readScopedOrLegacy for 'open-canteen':
  // Must return fallback (empty array), NEVER camporaCart!
  const openCanteenCart = readScopedOrLegacy<any[]>(
    STORAGE_KEYS.CART,
    LEGACY_STORAGE_KEYS.CART,
    storageValidators.cart,
    (val) => JSON.parse(val),
    [],
    'open-canteen',
    storage
  );
  assert.deepEqual(openCanteenCart, []);

  // Meanwhile, 'campora-cafe' STILL safely reads its legacy/migrated cart!
  const camporaCafeCart = readScopedOrLegacy<any[]>(
    STORAGE_KEYS.CART,
    LEGACY_STORAGE_KEYS.CART,
    storageValidators.cart,
    (val) => JSON.parse(val),
    [],
    'campora-cafe',
    storage
  );
  assert.deepEqual(camporaCafeCart, JSON.parse(camporaCart));
});

test('Storage Migration: Section 3 Operator key partitioning isolates multiple canteens independently', () => {
  const storage = createMockStorage();

  const camporaKey = getOperatorStorageKey(STORAGE_KEYS.CART, 'campora-cafe');
  const openCanteenKey = getOperatorStorageKey(STORAGE_KEYS.CART, 'open-canteen');

  assert.equal(camporaKey, 'opencanteen:campora-cafe:cart');
  assert.equal(openCanteenKey, 'opencanteen:open-canteen:cart');

  // Store distinct carts for each operator on the same browser origin
  storage.setItem(camporaKey, JSON.stringify([{ id: 'coffee', quantity: 1 }]));
  storage.setItem(openCanteenKey, JSON.stringify([{ id: 'salad', quantity: 3 }]));

  const cartCampora = readScopedOrLegacy<any[]>(
    STORAGE_KEYS.CART,
    LEGACY_STORAGE_KEYS.CART,
    storageValidators.cart,
    (val) => JSON.parse(val),
    [],
    'campora-cafe',
    storage
  );
  const cartOpenCanteen = readScopedOrLegacy<any[]>(
    STORAGE_KEYS.CART,
    LEGACY_STORAGE_KEYS.CART,
    storageValidators.cart,
    (val) => JSON.parse(val),
    [],
    'open-canteen',
    storage
  );

  assert.equal(cartCampora.length, 1);
  assert.equal(cartCampora[0].id, 'coffee');

  assert.equal(cartOpenCanteen.length, 1);
  assert.equal(cartOpenCanteen[0].id, 'salad');
});

test('Storage Migration: Section 3 Auth user state is partitioned by operator ID', () => {
  const storage = createMockStorage();

  const camporaUserKey = getOperatorStorageKey(STORAGE_KEYS.USER, 'campora-cafe');
  const openCanteenUserKey = getOperatorStorageKey(STORAGE_KEYS.USER, 'open-canteen');

  storage.setItem(camporaUserKey, JSON.stringify({ uid: 'campora-admin', displayName: 'Campora Chef' }));
  storage.setItem(openCanteenUserKey, JSON.stringify({ uid: 'oc-student', displayName: 'Open Canteen Student' }));

  const userCampora = readScopedOrLegacy<any>(
    STORAGE_KEYS.USER,
    LEGACY_STORAGE_KEYS.USER,
    storageValidators.user,
    (val) => JSON.parse(val),
    null,
    'campora-cafe',
    storage
  );

  const userOC = readScopedOrLegacy<any>(
    STORAGE_KEYS.USER,
    LEGACY_STORAGE_KEYS.USER,
    storageValidators.user,
    (val) => JSON.parse(val),
    null,
    'open-canteen',
    storage
  );

  assert.equal(userCampora.displayName, 'Campora Chef');
  assert.equal(userOC.displayName, 'Open Canteen Student');
});

test('Storage Migration: Section 3 VEG preference is strictly partitioned across operators', () => {
  const storage = createMockStorage();

  // Set VEG mode true for campora-cafe, false for open-canteen
  writeCanonicalVegPreference(true, storage, 'campora-cafe');
  writeCanonicalVegPreference(false, storage, 'open-canteen');

  const prefCampora = readCanonicalVegPreference(false, storage, 'campora-cafe');
  const prefOC = readCanonicalVegPreference(true, storage, 'open-canteen');

  assert.equal(prefCampora, true);
  assert.equal(prefOC, false);
});

test('Canteen Config: Checkpoint 1 Deployment configuration resolves cleanly', () => {
  const config = getDeploymentCanteenConfig();
  assert.ok(config.identity.id);
  assert.ok(config.identity.displayName);
  assert.ok(config.pwa.appName);
});

test('Storage Keys: Strict API contract and exact key formats for canonical operations', () => {
  // 1. Exact Campora Café keys verified
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, 'campora-cafe'), 'opencanteen:campora-cafe:cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.ORDERS, 'campora-cafe'), 'opencanteen:campora-cafe:orders_v2');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.PROFILE, 'campora-cafe'), 'opencanteen:campora-cafe:profile');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.VEG_ONLY, 'campora-cafe'), 'opencanteen:campora-cafe:veg_only');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.USER, 'campora-cafe'), 'opencanteen:campora-cafe:user');

  // 2. Open Canteen keys verified
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, 'open-canteen'), 'opencanteen:open-canteen:cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.ORDERS, 'open-canteen'), 'opencanteen:open-canteen:orders_v2');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.PROFILE, 'open-canteen'), 'opencanteen:open-canteen:profile');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.VEG_ONLY, 'open-canteen'), 'opencanteen:open-canteen:veg_only');

  // 3. Custom operator keys verified
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, 'custom-canteen'), 'opencanteen:custom-canteen:cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.ORDERS, 'custom-canteen'), 'opencanteen:custom-canteen:orders_v2');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.PROFILE, 'custom-canteen'), 'opencanteen:custom-canteen:profile');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.VEG_ONLY, 'custom-canteen'), 'opencanteen:custom-canteen:veg_only');

  // 4. Unusual and ambiguous operator IDs (case, whitespace, special chars)
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, 'CAMPORA-CAFE'), 'opencanteen:campora-cafe:cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, '  campora-cafe  '), 'opencanteen:campora-cafe:cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, 'Campus Dhaba #4!'), 'opencanteen:campus_dhaba__4_:cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, 'user.name@campus'), 'opencanteen:user_name_campus:cart');

  // 5. Missing or empty operatorId preserves base key without modification
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, undefined), 'opencanteen_cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, ''), 'opencanteen_cart');
  assert.equal(getOperatorStorageKey(STORAGE_KEYS.CART, '   '), 'opencanteen_cart');

  // 6. Strict contract: never guesses or auto-swaps reversed arguments
  // If first argument is 'campora-cafe' and second is 'cart', it treats 'campora-cafe' strictly as baseKey
  assert.equal(getOperatorStorageKey('campora-cafe', 'custom-op'), 'opencanteen:custom-op:campora-cafe');
});


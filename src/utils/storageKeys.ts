/**
 * OPEN CANTEEN — STORAGE KEYS & NAMESPACE DEFINITIONS
 * Stage 1 · Step 1.2 · Task 1.2.6
 *
 * Centralizes all local storage key namespaces, legacy fallbacks,
 * and data validators to prevent namespace collisions and data leakage.
 */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

/**
 * Standard Open Canteen Storage Namespaces
 */
export const STORAGE_KEYS = {
  CART: 'opencanteen_cart',
  SERVICE_MODE: 'opencanteen_service_mode',
  ORDERS: 'opencanteen_orders_v2',
  PROFILE: 'opencanteen_profile_v1',
  VEG_ONLY: 'opencanteen_veg_only',
  USER: 'opencanteen_user',
} as const;

/**
 * Legacy Campora Storage Namespaces (Preserved for backward-compatible migration)
 */
export const LEGACY_STORAGE_KEYS = {
  CART: 'campora_cart',
  SERVICE_MODE: 'campora_service_mode',
  ORDERS: 'campora_orders_v2',
  PROFILE: 'campora_mock_profile_v1',
  VEG_ONLY: 'campora_veg_only',
  USER: 'campora_user',
} as const;

/**
 * Custom Events for Preference and State Synchronization
 */
export const STORAGE_EVENTS = {
  VEG_PREFERENCE: 'opencanteen:veg-preference-change',
  LEGACY_VEG_PREFERENCE: 'campora-veg-preference-change',
} as const;

export function safeGetStorage(): StorageLike | null {
  try {
    const candidate =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : typeof globalThis !== 'undefined' && (globalThis as any).localStorage
        ? (globalThis as any).localStorage
        : null;

    if (candidate) {
      // Test read/write access (e.g. Safari private browsing or disabled storage)
      const testKey = '__oc_storage_test__';
      candidate.setItem(testKey, '1');
      if (typeof candidate.removeItem === 'function') {
        candidate.removeItem(testKey);
      }
      return candidate;
    }
  } catch {
    // Storage disabled, restricted, or unavailable
  }
  return null;
}

/**
 * Type-safe and structure validators for persisted payloads
 */
export const storageValidators = {
  cart: (raw: string | null): boolean => {
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  },

  serviceMode: (raw: string | null): boolean => {
    if (!raw) return false;
    return raw === 'dinein' || raw === 'takeaway' || raw === 'delivery';
  },

  orders: (raw: string | null): boolean => {
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  },

  profile: (raw: string | null): boolean => {
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    } catch {
      return false;
    }
  },

  vegOnly: (raw: string | null): boolean => {
    return raw === 'true' || raw === 'false';
  },

  user: (raw: string | null): boolean => {
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    } catch {
      return false;
    }
  },
};

/**
 * Resolves a scoped storage key partitioned by operator identity to guarantee
 * complete cross-canteen data isolation on shared browser origins.
 *
 * Pattern: `opencanteen:${operatorId}:${baseKey}`
 * Example: `opencanteen:campora-cafe:cart`, `opencanteen:open-canteen:cart`
 */
export function getOperatorStorageKey(baseKey: string, operatorId?: string): string {
  if (!operatorId || !operatorId.trim()) return baseKey;
  const sanitizedId = operatorId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
  if (!sanitizedId) return baseKey;

  let keySuffix = baseKey.startsWith('opencanteen_') ? baseKey.slice('opencanteen_'.length) : baseKey;
  if (keySuffix === 'profile_v1') {
    keySuffix = 'profile';
  }
  return `opencanteen:${sanitizedId}:${keySuffix}`;
}

/**
 * Reads a value from storage checking the canonical key first,
 * then falling back to the legacy key if valid.
 */
export function readGenericOrLegacy<T>(
  canonicalKey: string,
  legacyKey: string,
  validator: (raw: string | null) => boolean,
  deserializer: (raw: string) => T,
  fallback: T,
  storage: StorageLike | null = safeGetStorage()
): T {
  if (!storage) return fallback;

  try {
    // 1. Check canonical key first
    const primary = storage.getItem(canonicalKey);
    if (primary !== null && validator(primary)) {
      return deserializer(primary);
    }

    // 2. Check legacy key as fallback
    const legacy = storage.getItem(legacyKey);
    if (legacy !== null && validator(legacy)) {
      return deserializer(legacy);
    }
  } catch {
    // Fall back safely on error
  }

  return fallback;
}

/**
 * Reads a value with operator-level partitioning:
 * 1. Checks the operator-specific scoped key first (e.g. `opencanteen:open-canteen:cart`).
 * 2. If operatorId is 'campora-cafe' (or omitted): safely falls back to canonical unpartitioned key
 *    and legacy `campora_*` key for backward compatibility.
 * 3. If operatorId is NOT 'campora-cafe': NEVER imports legacy `campora_*` data to prevent
 *    cross-canteen data leakage into an unrelated operator.
 */
export function readScopedOrLegacy<T>(
  baseCanonicalKey: string,
  legacyKey: string,
  validator: (raw: string | null) => boolean,
  deserializer: (raw: string) => T,
  fallback: T,
  operatorId?: string,
  storage: StorageLike | null = safeGetStorage()
): T {
  if (!storage) return fallback;

  try {
    // 1. Check operator-partitioned key first
    if (operatorId) {
      const partitionedKey = getOperatorStorageKey(baseCanonicalKey, operatorId);
      const partitionedVal = storage.getItem(partitionedKey);
      if (partitionedVal !== null && validator(partitionedVal)) {
        return deserializer(partitionedVal);
      }
      // Backward-compatibility: if key ends with :profile, also check legacy :profile_v1 scoped key
      if (partitionedKey.endsWith(':profile')) {
        const legacyScopedVal = storage.getItem(`${partitionedKey}_v1`);
        if (legacyScopedVal !== null && validator(legacyScopedVal)) {
          return deserializer(legacyScopedVal);
        }
      }
    }

    // 2. Safe Fallbacks:
    // Only Campora Café (or unpartitioned default) is authorized to inherit legacy campora data
    const isCamporaCafe = !operatorId || operatorId === 'campora-cafe';

    if (isCamporaCafe) {
      const primary = storage.getItem(baseCanonicalKey);
      if (primary !== null && validator(primary)) {
        return deserializer(primary);
      }

      const legacy = storage.getItem(legacyKey);
      if (legacy !== null && validator(legacy)) {
        return deserializer(legacy);
      }
    }
  } catch {
    // Fall back safely on error
  }

  return fallback;
}

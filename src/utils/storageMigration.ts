/**
 * OPEN CANTEEN — LEGACY LOCAL STORAGE MIGRATION
 * Stage 1 · Step 1.2 · Task 1.2.6
 *
 * Migrates legacy `campora_*` storage keys to the generic `opencanteen_*` namespace.
 * Preserves recognized user state (cart, service mode, orders, profile, preferences, mock auth)
 * without data loss, overwriting valid existing data, or leaking data across canteens.
 */

import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  storageValidators,
  safeGetStorage,
  type StorageLike,
} from './storageKeys.ts';

export interface MigrationSummary {
  readonly success: boolean;
  readonly migratedKeys: readonly string[];
  readonly preservedKeys: readonly string[];
  readonly skippedKeys: readonly string[];
  readonly errors: readonly string[];
}

interface MigrationRule {
  readonly canonicalKey: string;
  readonly legacyKey: string;
  readonly validator: (raw: string | null) => boolean;
}

const MIGRATION_RULES: readonly MigrationRule[] = [
  {
    canonicalKey: STORAGE_KEYS.CART,
    legacyKey: LEGACY_STORAGE_KEYS.CART,
    validator: storageValidators.cart,
  },
  {
    canonicalKey: STORAGE_KEYS.SERVICE_MODE,
    legacyKey: LEGACY_STORAGE_KEYS.SERVICE_MODE,
    validator: storageValidators.serviceMode,
  },
  {
    canonicalKey: STORAGE_KEYS.ORDERS,
    legacyKey: LEGACY_STORAGE_KEYS.ORDERS,
    validator: storageValidators.orders,
  },
  {
    canonicalKey: STORAGE_KEYS.PROFILE,
    legacyKey: LEGACY_STORAGE_KEYS.PROFILE,
    validator: storageValidators.profile,
  },
  {
    canonicalKey: STORAGE_KEYS.VEG_ONLY,
    legacyKey: LEGACY_STORAGE_KEYS.VEG_ONLY,
    validator: storageValidators.vegOnly,
  },
  {
    canonicalKey: STORAGE_KEYS.USER,
    legacyKey: LEGACY_STORAGE_KEYS.USER,
    validator: storageValidators.user,
  },
];

/**
 * Executes storage migration idempotently with operator isolation.
 *
 * Rules:
 * 1. A valid new canonical key always takes precedence.
 * 2. Only migrates when canonical key is empty/invalid and legacy key contains valid data.
 * 3. NEVER imports legacy `campora_*` keys into an unrelated operator (only into 'campora-cafe').
 * 4. Never overwrites existing valid data.
 * 5. Verifies the write before marking complete.
 * 6. Preserves legacy keys for rollback compatibility.
 * 7. Never logs private customer information.
 */
export function runStorageMigration(
  storage: StorageLike | null = safeGetStorage(),
  targetOperatorId: string = 'campora-cafe'
): MigrationSummary {
  if (!storage) {
    return {
      success: true,
      migratedKeys: [],
      preservedKeys: [],
      skippedKeys: [],
      errors: ['Storage unavailable or disabled'],
    };
  }

  // Cross-Canteen Protection: Legacy campora_* keys must ONLY migrate into campora-cafe
  if (targetOperatorId !== 'campora-cafe') {
    return {
      success: true,
      migratedKeys: Object.freeze([]),
      preservedKeys: Object.freeze([]),
      skippedKeys: Object.freeze(MIGRATION_RULES.map((r) => r.canonicalKey)),
      errors: Object.freeze([]),
    };
  }

  const migratedKeys: string[] = [];
  const preservedKeys: string[] = [];
  const skippedKeys: string[] = [];
  const errors: string[] = [];

  for (const rule of MIGRATION_RULES) {
    try {
      const canonicalVal = storage.getItem(rule.canonicalKey);

      // Rule 1: Valid new-format value takes precedence
      if (canonicalVal !== null && rule.validator(canonicalVal)) {
        preservedKeys.push(rule.canonicalKey);
        continue;
      }

      // Check legacy value
      const legacyVal = storage.getItem(rule.legacyKey);
      if (legacyVal === null) {
        skippedKeys.push(rule.canonicalKey);
        continue;
      }

      // Rule 5: Validate before migration
      if (!rule.validator(legacyVal)) {
        errors.push(`Legacy key ${rule.legacyKey} failed validation, skipped`);
        skippedKeys.push(rule.canonicalKey);
        continue;
      }

      // Migrate
      storage.setItem(rule.canonicalKey, legacyVal);

      // Rule 13: Verify successful write
      const verifyWritten = storage.getItem(rule.canonicalKey);
      if (verifyWritten === legacyVal) {
        migratedKeys.push(rule.canonicalKey);
      } else {
        errors.push(`Write verification failed for ${rule.canonicalKey}`);
      }
    } catch (err) {
      errors.push(`Storage exception migrating ${rule.canonicalKey}: ${String(err)}`);
    }
  }

  return {
    success: errors.length === 0,
    migratedKeys: Object.freeze(migratedKeys),
    preservedKeys: Object.freeze(preservedKeys),
    skippedKeys: Object.freeze(skippedKeys),
    errors: Object.freeze(errors),
  };
}

import { getDeploymentCanteenConfig } from '../config/canteenConfig.ts';

// Deterministically execute once at module evaluation time in browser
if (typeof window !== 'undefined') {
  try {
    const activeOperatorId = getDeploymentCanteenConfig()?.identity?.id || 'campora-cafe';
    runStorageMigration(safeGetStorage(), activeOperatorId);
  } catch {
    // Fail silently in restricted environments
  }
}

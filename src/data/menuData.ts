import { CAMPORA_CATEGORIES, CAMPORA_MENU_ITEMS } from './mock/camporaCatalog.ts';

/**
 * Canonical re-exports for backward compatibility with existing tests and legacy consumers.
 * Defined from CAMPORA_CATALOG to guarantee single source of truth without data drift.
 */
export const CATEGORIES = CAMPORA_CATEGORIES;
export const MENU_ITEMS = CAMPORA_MENU_ITEMS;

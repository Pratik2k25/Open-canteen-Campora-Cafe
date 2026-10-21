import type { CanteenCatalog } from '../../types/index.ts';

/**
 * Creates an empty, isolated catalog for unconfigured or custom canteens.
 * Guarantees that another operator's live-looking inventory is NEVER silently exposed.
 */
export function createEmptyCatalog(canteenId: string, canteenName?: string): CanteenCatalog {
  return {
    canteenId,
    canteenName: canteenName || `Canteen ${canteenId}`,
    categories: [
      {
        id: 'all',
        name: 'All',
        iconName: 'utensils',
        displayOrder: 1,
        isActive: true,
        imageUrl: '/assets/categories/all.png',
      },
    ],
    items: [],
    updatedAt: new Date().toISOString(),
    isDemoCatalog: false,
  };
}

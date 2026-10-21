import type { IMenuAdapter } from './types.ts';
import type { CanteenCatalog, Category, MenuItem } from '../types/index.ts';
import {
  CAMPORA_CATALOG,
  OPEN_CANTEEN_CATALOG,
  createEmptyCatalog,
} from '../data/mock/index.ts';

/**
 * MockMenuAdapter implements IMenuAdapter using modular mock seed data.
 * Guarantees strict operator isolation: custom/unconfigured canteens NEVER
 * inherit Campora Cafe's live-looking items.
 */
export class MockMenuAdapter implements IMenuAdapter {
  private customCatalogs: Map<string, CanteenCatalog> = new Map();

  /**
   * Allows registering or overriding a catalog for testing or multi-tenant simulations.
   */
  public registerCatalog(catalog: CanteenCatalog): void {
    this.customCatalogs.set(catalog.canteenId, catalog);
  }

  public async getCatalog(operatorId: string): Promise<CanteenCatalog> {
    const id = operatorId || 'open-canteen';

    if (this.customCatalogs.has(id)) {
      return this.customCatalogs.get(id)!;
    }

    if (id === 'campora-cafe') {
      return CAMPORA_CATALOG;
    }

    if (id === 'open-canteen') {
      return OPEN_CANTEEN_CATALOG;
    }

    // Unconfigured operator gets an explicit, safe empty catalog
    return createEmptyCatalog(id);
  }

  public async getCategories(operatorId: string): Promise<Category[]> {
    const catalog = await this.getCatalog(operatorId);
    return catalog.categories;
  }

  public async getMenuItems(operatorId: string, categoryId?: string): Promise<MenuItem[]> {
    const catalog = await this.getCatalog(operatorId);
    if (!categoryId || categoryId === 'all') {
      return catalog.items;
    }
    return catalog.items.filter((item) => item.categoryId === categoryId);
  }

  public async getMenuItemById(operatorId: string, itemId: string): Promise<MenuItem | undefined> {
    const catalog = await this.getCatalog(operatorId);
    return catalog.items.find((item) => item.id === itemId);
  }

  public async searchMenuItems(
    operatorId: string,
    query: string,
    categoryId?: string
  ): Promise<MenuItem[]> {
    const catalog = await this.getCatalog(operatorId);
    const normalizedQuery = (query || '').trim().toLowerCase().replace(/\s+/g, ' ');

    return catalog.items.filter((item) => {
      const matchesCategory = !categoryId || categoryId === 'all' || item.categoryId === categoryId;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const nameMatch = (item.name || '').toLowerCase().includes(normalizedQuery);
      const descMatch = (item.description || '').toLowerCase().includes(normalizedQuery);
      return nameMatch || descMatch;
    });
  }
}

export const mockMenuAdapter = new MockMenuAdapter();

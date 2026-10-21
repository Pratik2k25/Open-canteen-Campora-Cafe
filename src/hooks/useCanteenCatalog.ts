import { useState, useEffect, useRef, useCallback } from 'react';
import type { CanteenCatalog, Category, MenuItem } from '../types/index.ts';
import { useCanteen } from '../context/CanteenContext.tsx';
import { mockMenuAdapter } from '../adapters/mockMenuAdapter.ts';
import {
  CAMPORA_CATALOG,
  OPEN_CANTEEN_CATALOG,
  createEmptyCatalog,
} from '../data/mock/index.ts';

export interface UseCanteenCatalogResult {
  catalog: CanteenCatalog;
  categories: Category[];
  items: MenuItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to retrieve the menu catalog for the currently active canteen.
 * Automatically synchronizes when canteen config switches at runtime.
 * Guarantees race-condition safety: stale responses from a previous operator
 * are safely discarded.
 */
export function useCanteenCatalog(): UseCanteenCatalogResult {
  const { config } = useCanteen();
  const operatorId = config?.identity?.id || 'open-canteen';

  // Seed initial state synchronously with the matching default or empty catalog
  // to prevent unnecessary layout shift on first mount and prevent cross-operator bleed.
  const [catalog, setCatalog] = useState<CanteenCatalog>(() => {
    if (operatorId === 'open-canteen') return OPEN_CANTEEN_CATALOG;
    if (operatorId === 'campora-cafe') return CAMPORA_CATALOG;
    return createEmptyCatalog(operatorId);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const activeOperatorRef = useRef(operatorId);
  activeOperatorRef.current = operatorId;

  const fetchCatalog = useCallback(async () => {
    const targetOperator = activeOperatorRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await mockMenuAdapter.getCatalog(targetOperator);
      // Guard: Discard result if operator changed during async call
      if (activeOperatorRef.current === targetOperator) {
        setCatalog(data);
      }
    } catch (err) {
      if (activeOperatorRef.current === targetOperator) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (activeOperatorRef.current === targetOperator) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [operatorId, fetchCatalog]);

  return {
    catalog,
    categories: catalog.categories,
    items: catalog.items,
    loading,
    error,
    refetch: fetchCatalog,
  };
}

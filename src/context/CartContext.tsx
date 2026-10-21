import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { CartItem, MenuItem, PriceBreakdown, ServiceMode } from '../types/index.ts';
import { calculatePricing } from '../utils/pricing.ts';
import { findIncompatibleCartItems, sanitizeCartForServiceMode } from '../utils/serviceRules.ts';
import {
  getFlightTargetOffsetForItem,
  resolveMenuItemCartVisual,
} from '../utils/floatingCartState.ts';
import { useCanteen } from './CanteenContext.tsx';
import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  storageValidators,
  readScopedOrLegacy,
  getOperatorStorageKey,
  safeGetStorage,
} from '../utils/storageKeys.ts';

export interface FlightPayload {
  id: string;
  menuItemId: string;
  imageUrl: string;
  is3DBeverage?: boolean;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface CartContextType {
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  items: CartItem[];
  pricing: PriceBreakdown;
  addItem: (item: MenuItem, sourceElement?: HTMLElement | null) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateSpecialInstructions: (itemId: string, instructions: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  // Service switching resolution
  incompatibleModal: {
    isOpen: boolean;
    targetMode: ServiceMode;
    incompatibleItems: CartItem[];
  } | null;
  closeIncompatibleModal: () => void;
  confirmIncompatibleSwitch: () => void;
  // Flight animation
  activeFlight: FlightPayload | null;
  clearActiveFlight: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let operatorId = 'campora-cafe';
  try {
    const { config } = useCanteen();
    if (config?.identity?.id) {
      operatorId = config.identity.id;
    }
  } catch {
    // Graceful fallback for test harnesses outside CanteenProvider
  }

  const activeOperatorRef = useRef(operatorId);

  const [serviceMode, setServiceModeState] = useState<ServiceMode>(() => {
    return readScopedOrLegacy<ServiceMode>(
      STORAGE_KEYS.SERVICE_MODE,
      LEGACY_STORAGE_KEYS.SERVICE_MODE,
      storageValidators.serviceMode,
      (val) => val as ServiceMode,
      'dinein',
      operatorId
    );
  });

  const [items, setItems] = useState<CartItem[]>(() => {
    return readScopedOrLegacy<CartItem[]>(
      STORAGE_KEYS.CART,
      LEGACY_STORAGE_KEYS.CART,
      storageValidators.cart,
      (val) => {
        try {
          return JSON.parse(val) as CartItem[];
        } catch {
          return [];
        }
      },
      [],
      operatorId
    );
  });

  const [activeFlight, setActiveFlight] = useState<FlightPayload | null>(null);

  const [incompatibleModal, setIncompatibleModal] = useState<{
    isOpen: boolean;
    targetMode: ServiceMode;
    incompatibleItems: CartItem[];
  } | null>(null);

  // Reload cart state cleanly when canteen operator changes at runtime
  useEffect(() => {
    const loadedItems = readScopedOrLegacy<CartItem[]>(
      STORAGE_KEYS.CART,
      LEGACY_STORAGE_KEYS.CART,
      storageValidators.cart,
      (val) => {
        try {
          return JSON.parse(val) as CartItem[];
        } catch {
          return [];
        }
      },
      [],
      operatorId
    );
    setItems(loadedItems);

    const loadedMode = readScopedOrLegacy<ServiceMode>(
      STORAGE_KEYS.SERVICE_MODE,
      LEGACY_STORAGE_KEYS.SERVICE_MODE,
      storageValidators.serviceMode,
      (val) => val as ServiceMode,
      'dinein',
      operatorId
    );
    setServiceModeState(loadedMode);
    setActiveFlight(null);
    activeOperatorRef.current = operatorId;
  }, [operatorId]);

  useEffect(() => {
    // Guard: Prevent previous operator's in-memory items from overwriting new operator's storage
    if (activeOperatorRef.current !== operatorId) return;
    const storage = safeGetStorage();
    if (storage) {
      const scopedKey = getOperatorStorageKey(STORAGE_KEYS.CART, operatorId);
      storage.setItem(scopedKey, JSON.stringify(items));
      if (operatorId === 'campora-cafe') {
        storage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
      }
    }
  }, [items, operatorId]);

  useEffect(() => {
    // Guard: Prevent previous operator's in-memory mode from overwriting new operator's storage
    if (activeOperatorRef.current !== operatorId) return;
    const storage = safeGetStorage();
    if (storage) {
      const scopedKey = getOperatorStorageKey(STORAGE_KEYS.SERVICE_MODE, operatorId);
      storage.setItem(scopedKey, serviceMode);
      if (operatorId === 'campora-cafe') {
        storage.setItem(STORAGE_KEYS.SERVICE_MODE, serviceMode);
      }
    }
  }, [serviceMode, operatorId]);

  const pricing = calculatePricing(items, serviceMode);

  const addItem = (item: MenuItem, sourceElement?: HTMLElement | null) => {
    // Trigger curved flight path animation targeting the specific food or beverage slot (skipped if reduced motion)
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (sourceElement && !prefersReducedMotion) {
      const rect = sourceElement.getBoundingClientRect();
      const cartTargetEl =
        document.getElementById('canteen-floating-cart-target') ||
        document.getElementById('campora-floating-cart-target');
      const { offsetX, offsetY } = getFlightTargetOffsetForItem(serviceMode, item);
      let targetX = window.innerWidth / 2 + 120 + offsetX;
      let targetY = window.innerHeight - 115 + offsetY;
      if (cartTargetEl) {
        const targetRect = cartTargetEl.getBoundingClientRect();
        targetX = targetRect.left + targetRect.width / 2 + offsetX;
        targetY = targetRect.top + targetRect.height / 2 + offsetY;
      }

      const cartVisual = resolveMenuItemCartVisual(item, 1);

      setActiveFlight({
        id: `${item.id}-${Date.now()}`,
        menuItemId: item.id,
        imageUrl: cartVisual.is3DBeverageAsset ? cartVisual.pngFallbackUrl : item.imageUrl,
        is3DBeverage: cartVisual.is3DBeverageAsset,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        targetX,
        targetY,
      });
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.item.id === item.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + 1,
        };
        return copy;
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setItems((prev) =>
      prev.map((ci) => {
        if (ci.item.id === itemId) {
          const trimmed = instructions.trim();
          return {
            ...ci,
            specialInstructions: trimmed.length > 0 ? instructions : undefined,
          };
        }
        return ci;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId: string): number => {
    const found = items.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const setServiceMode = (newMode: ServiceMode) => {
    if (newMode === serviceMode) return;
    const incompatible = findIncompatibleCartItems(items, newMode);
    if (incompatible.length > 0) {
      setIncompatibleModal({
        isOpen: true,
        targetMode: newMode,
        incompatibleItems: incompatible,
      });
    } else {
      setServiceModeState(newMode);
    }
  };

  const confirmIncompatibleSwitch = () => {
    if (!incompatibleModal) return;
    const { targetMode } = incompatibleModal;
    const sanitized = sanitizeCartForServiceMode(items, targetMode);
    setItems(sanitized);
    setServiceModeState(targetMode);
    setIncompatibleModal(null);
  };

  const closeIncompatibleModal = () => {
    setIncompatibleModal(null);
  };

  const clearActiveFlight = () => {
    setActiveFlight(null);
  };

  return (
    <CartContext.Provider
      value={{
        serviceMode,
        setServiceMode,
        items,
        pricing,
        addItem,
        updateQuantity,
        updateSpecialInstructions,
        removeItem,
        clearCart,
        getItemQuantity,
        incompatibleModal,
        closeIncompatibleModal,
        confirmIncompatibleSwitch,
        activeFlight,
        clearActiveFlight,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

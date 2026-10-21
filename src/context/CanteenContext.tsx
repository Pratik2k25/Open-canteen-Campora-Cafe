/**
 * OPEN CANTEEN — CANTEEN CONTEXT & PROVIDER
 * Stage 1 · Step 1.2 · Task 1.2.2
 *
 * Provides application-wide, reactive distribution of the active CanteenConfig.
 * Ensures strict cross-canteen data isolation, immutability, and deterministic defaults.
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { CanteenConfig, CanteenConfigInput } from '../types/index.ts';
import {
  DEFAULT_CANTEEN_PRESET,
  OPEN_CANTEEN_PRESET,
  CANTEEN_PRESETS,
  resolveCanteenConfig,
  getDeploymentCanteenConfig,
} from '../config/canteenConfig.ts';

// ============================================================================
// Context Contract
// ============================================================================

export interface CanteenContextValue {
  /** The active, fully normalized immutable Canteen configuration */
  readonly config: CanteenConfig;
  /**
   * Replaces the active configuration with a new operator configuration or preset.
   * Resolves against the clean OPEN_CANTEEN_PRESET baseline to prevent cross-canteen data leakage.
   * Returns true if replacement succeeded, false if validation failed.
   */
  readonly setCanteenConfig: (input: CanteenConfigInput | CanteenConfig) => boolean;
  /**
   * Resets the configuration back to the Provider's initial configured baseline.
   */
  readonly resetCanteenConfig: () => void;
}

export interface CanteenProviderProps {
  readonly children: React.ReactNode;
  /** Optional initial configuration or preset override (defaults to deployment configuration) */
  readonly initialConfig?: CanteenConfig | CanteenConfigInput;
}

const CanteenContext = createContext<CanteenContextValue | undefined>(undefined);

// ============================================================================
// Provider Implementation
// ============================================================================

export const CanteenProvider: React.FC<CanteenProviderProps> = ({
  children,
  initialConfig,
}) => {
  // Resolve initial configuration once deterministically
  const initialResolvedConfig = useMemo<CanteenConfig>(() => {
    if (!initialConfig) {
      if (typeof window !== 'undefined') {
        try {
          const params = new URLSearchParams(window.location.search);
          const canteenParam = params.get('canteen') || params.get('operator');
          if (canteenParam && CANTEEN_PRESETS[canteenParam]) {
            return CANTEEN_PRESETS[canteenParam];
          }
        } catch {
          // ignore URL parsing error
        }
      }
      return getDeploymentCanteenConfig();
    }
    // If it's already a complete normalized CanteenConfig preset
    if (
      'identity' in initialConfig &&
      'branding' in initialConfig &&
      'location' in initialConfig &&
      'contact' in initialConfig &&
      'content' in initialConfig &&
      'pwa' in initialConfig
    ) {
      return Object.freeze(initialConfig as CanteenConfig);
    }
    // Otherwise resolve operator input against generic Open Canteen baseline
    return resolveCanteenConfig(initialConfig as CanteenConfigInput, OPEN_CANTEEN_PRESET);
  }, [initialConfig]);

  const [config, setConfig] = useState<CanteenConfig>(initialResolvedConfig);

  /**
   * Replaces the active canteen configuration.
   * Uses OPEN_CANTEEN_PRESET as baseline to ensure strict cross-canteen data isolation
   * (e.g. switching to "My Home" will not retain Campora Café phone, email, logo, or pickup locations).
   */
  const setCanteenConfig = useCallback((input: CanteenConfigInput | CanteenConfig): boolean => {
    if (!input || typeof input !== 'object') {
      console.error('CanteenProvider.setCanteenConfig: input must be a valid configuration object');
      return false;
    }

    try {
      let resolved: CanteenConfig;
      if (
        'identity' in input &&
        'branding' in input &&
        'location' in input &&
        'contact' in input &&
        'content' in input &&
        'pwa' in input
      ) {
        // Full pre-normalized preset: validate required identifiers
        if (!input.identity?.id?.trim() || !input.identity?.displayName?.trim()) {
          throw new Error('identity.id and identity.displayName are required');
        }
        resolved = Object.freeze(input as CanteenConfig);
      } else {
        // Partial operator input: resolve against clean generic baseline
        resolved = resolveCanteenConfig(input as CanteenConfigInput, OPEN_CANTEEN_PRESET);
      }

      setConfig(resolved);
      return true;
    } catch (error) {
      console.error('CanteenProvider.setCanteenConfig: validation failed, active config preserved:', error);
      return false;
    }
  }, []);

  /**
   * Resets active configuration to the Provider's initial configuration.
   */
  const resetCanteenConfig = useCallback(() => {
    setConfig(initialResolvedConfig);
  }, [initialResolvedConfig]);

  const value = useMemo<CanteenContextValue>(
    () => ({
      config,
      setCanteenConfig,
      resetCanteenConfig,
    }),
    [config, setCanteenConfig, resetCanteenConfig]
  );

  // In development, expose helper on window for automated verification and debugging
  React.useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      (window as any).__OPEN_CANTEEN__ = {
        config,
        setCanteenConfig,
        resetCanteenConfig,
      };
    }
  }, [config, setCanteenConfig, resetCanteenConfig]);

  return <CanteenContext.Provider value={value}>{children}</CanteenContext.Provider>;
};

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Custom hook to access the active canteen configuration throughout the Customer PWA.
 * Throws a descriptive error if called outside CanteenProvider.
 */
export const useCanteen = (): CanteenContextValue => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};

import type { MenuItem, ServiceMode } from '../types/index.ts';
import type { FilterKey } from '../components/FilterChips.tsx';
import type { CustomerProfileData } from './profileData.ts';

export type VegTransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';

export type VegTransitionDirection = 'veg-on' | 'veg-off';

export interface VegTransitionOrigin {
  x: number;
  y: number;
}

export interface VegTransitionVisualConfig {
  direction: VegTransitionDirection;
  targetVegOnly: boolean;
  /** Accessible status heading (e.g., 'VEG MODE ON' / 'ALL ITEMS') */
  ariaHeading: string;
  /** Two-line badge label inside the central emblem circle */
  badgeLine1: string;
  badgeLine2: string;
  /** Supporting message displayed below the central emblem */
  subtitle: string;
  /** Secondary supporting caption */
  secondaryCaption: string;
  /** Brand wordmark at the bottom of the transition screen */
  brandFooter: string;
  /** Full-screen overlay background color */
  overlayBgHex: string;
  /** Outer, middle, and inner concentric ripple circle colors */
  outerRingHex: string;
  midRingHex: string;
  innerRingHex: string;
  /** Center circular emblem background color */
  badgeBgHex: string;
  /** Subtitle text color */
  subtitleColorHex: string;
  /** Brand footer text color */
  footerColorHex: string;
}

export const VEG_TRANSITION_TIMING = {
  /** Circular entry expansion duration (ms) */
  coverDurationMs: 250,
  /** Emblem & expanding concentric waves hold duration while menu updates behind overlay (ms) */
  holdDurationMs: 430,
  /** Smooth reveal of updated menu (ms) */
  revealDurationMs: 240,
  /** Complete transition duration (~920ms, within 700-1000ms target) */
  totalDurationMs: 920,
} as const;

export const VEG_TRANSITION_CONFIGS: Record<VegTransitionDirection, VegTransitionVisualConfig> = {
  'veg-on': {
    direction: 'veg-on',
    targetVegOnly: true,
    ariaHeading: 'VEG MODE ON',
    badgeLine1: 'VEG',
    badgeLine2: 'MODE',
    subtitle: 'Showing only vegetarian favourites',
    secondaryCaption: 'Only vegetarian favourites',
    brandFooter: 'CAMPORA CAFÉ',
    overlayBgHex: '#E9FAF4',
    outerRingHex: '#DBF5EB',
    midRingHex: '#CEEFE2',
    innerRingHex: '#C2EADB',
    badgeBgHex: '#087455',
    subtitleColorHex: '#1D5C43',
    footerColorHex: '#116A4B',
  },
  'veg-off': {
    direction: 'veg-off',
    targetVegOnly: false,
    ariaHeading: 'ALL ITEMS',
    badgeLine1: 'ALL',
    badgeLine2: 'FOOD',
    subtitle: 'Bringing back the complete menu',
    secondaryCaption: 'Explore the full menu',
    brandFooter: 'CAMPORA CAFÉ',
    overlayBgHex: '#FFF9F4',
    outerRingHex: '#FEF3E8',
    midRingHex: '#FEEFE1',
    innerRingHex: '#FDE6CE',
    badgeBgHex: '#B65D22',
    subtitleColorHex: '#6B3E1E',
    footerColorHex: '#8B4920',
  },
};

export function getVegTransitionVisualConfig(targetVegOnly: boolean): VegTransitionVisualConfig {
  return targetVegOnly ? VEG_TRANSITION_CONFIGS['veg-on'] : VEG_TRANSITION_CONFIGS['veg-off'];
}

export interface HomeMenuFilterCriteria {
  searchQuery: string;
  selectedCategory: string;
  isVegOnly: boolean;
  activeFilters: FilterKey[];
  serviceMode: ServiceMode;
}

/**
 * Pure, authoritative menu filtering function for the Home page.
 * - Uses `item.foodType === 'veg'` exclusively for vegetarian classification (never guesses from name/image).
 * - Preserves service-mode eligibility, category selection, search query, and filter chips.
 */
export function filterMenuItemsForHome(
  items: MenuItem[],
  criteria: HomeMenuFilterCriteria
): MenuItem[] {
  const { searchQuery, selectedCategory, isVegOnly, activeFilters, serviceMode } = criteria;
  const trimmedQuery = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    // 1. Authoritative availability & active service-mode eligibility
    if (!item.isAvailable) {
      return false;
    }
    if (item.serviceAvailability && item.serviceAvailability[serviceMode] === false) {
      return false;
    }

    // 2. Authoritative vegetarian classification
    if (isVegOnly && item.foodType !== 'veg') {
      return false;
    }

    // 3. Category filter
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }

    // 4. Search query filter
    if (trimmedQuery) {
      const matchesName = item.name.toLowerCase().includes(trimmedQuery);
      const matchesDesc = item.description.toLowerCase().includes(trimmedQuery);
      if (!matchesName && !matchesDesc) {
        return false;
      }
    }

    // 5. Filter chips
    if (activeFilters.includes('under200') && item.price >= 200) {
      return false;
    }

    return true;
  });
}

/**
 * Synchronizes the `'vegOnly'` filter chip key inside `activeFilters` with the canonical `isVegOnly` boolean
 * without disturbing any other active filter chips (`'under200'`, `'noPackaging'`, etc.).
 */
export function syncVegFilterChip(
  activeFilters: FilterKey[],
  isVegOnly: boolean
): FilterKey[] {
  if (isVegOnly) {
    return activeFilters.includes('vegOnly') ? activeFilters : [...activeFilters, 'vegOnly'];
  }
  return activeFilters.filter((key) => key !== 'vegOnly');
}

export const VEG_PREFERENCE_STORAGE_KEY = 'campora_veg_only';
export const MOCK_PROFILE_STORAGE_KEY = 'campora_mock_profile_v1';
export const VEG_PREFERENCE_EVENT_NAME = 'campora-veg-preference-change';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Reads the canonical VEG preference shared between Home and Profile.
 * Defaults to `defaultFallback` (`false` on Home initial load) when no explicit preference has been stored yet.
 */
export function readCanonicalVegPreference(
  defaultFallback = false,
  storage: StorageLike | null = getDefaultStorage()
): boolean {
  if (!storage) return defaultFallback;

  const rawVeg = storage.getItem(VEG_PREFERENCE_STORAGE_KEY);
  if (rawVeg === 'true') return true;
  if (rawVeg === 'false') return false;

  const rawProfile = storage.getItem(MOCK_PROFILE_STORAGE_KEY);
  if (rawProfile) {
    try {
      const parsed = JSON.parse(rawProfile) as Partial<CustomerProfileData>;
      if (typeof parsed.vegMode === 'boolean') {
        return parsed.vegMode;
      }
    } catch {
      // Ignore malformed JSON
    }
  }

  return defaultFallback;
}

/**
 * Writes the canonical VEG preference and synchronizes both `campora_veg_only`
 * and `campora_mock_profile_v1` so Home and Profile always reflect the exact same state.
 */
export function writeCanonicalVegPreference(
  nextVegOnly: boolean,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;

  storage.setItem(VEG_PREFERENCE_STORAGE_KEY, String(nextVegOnly));

  const rawProfile = storage.getItem(MOCK_PROFILE_STORAGE_KEY);
  if (rawProfile) {
    try {
      const parsed = JSON.parse(rawProfile) as CustomerProfileData;
      const updatedProfile: CustomerProfileData = {
        ...parsed,
        vegMode: nextVegOnly,
      };
      storage.setItem(MOCK_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch {
      // Ignore malformed profile JSON
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(
      new CustomEvent<{ vegOnly: boolean }>(VEG_PREFERENCE_EVENT_NAME, {
        detail: { vegOnly: nextVegOnly },
      })
    );
  }
}

export interface VegTransitionMachineState {
  /** Immediate switch & chip state reflected in the toggle control */
  toggleVegOnly: boolean;
  /** Committed menu filter state applied to the food grid (updated while covered) */
  displayedVegOnly: boolean;
  /** Current overlay animation phase */
  phase: VegTransitionPhase;
  /** Direction of the active transition ('veg-on' | 'veg-off') */
  direction: VegTransitionDirection;
  /** Monotonic run ID to invalidate stale timers during rapid toggling */
  runId: number;
}

export function createInitialVegTransitionState(
  initialVegOnly: boolean
): VegTransitionMachineState {
  return {
    toggleVegOnly: initialVegOnly,
    displayedVegOnly: initialVegOnly,
    phase: 'idle',
    direction: initialVegOnly ? 'veg-on' : 'veg-off',
    runId: 0,
  };
}

/**
 * Pure state-machine transition when the user toggles VEG Mode on Home.
 * Handles rapid toggling cleanly by incrementing `runId`, immediately updating `toggleVegOnly`,
 * and starting/restarting the `'covering'` phase toward `nextVegOnly` (or updating immediately if `prefersReducedMotion`).
 */
export function beginVegModeTransition(
  current: VegTransitionMachineState,
  nextVegOnly: boolean,
  prefersReducedMotion = false
): VegTransitionMachineState {
  const nextRunId = current.runId + 1;
  const direction: VegTransitionDirection = nextVegOnly ? 'veg-on' : 'veg-off';

  if (prefersReducedMotion) {
    return {
      toggleVegOnly: nextVegOnly,
      displayedVegOnly: nextVegOnly,
      phase: 'idle',
      direction,
      runId: nextRunId,
    };
  }

  return {
    toggleVegOnly: nextVegOnly,
    // Keep displayedVegOnly unchanged until the overlay reaches 'covered'
    // unless an earlier transition was already covered
    displayedVegOnly: current.phase === 'covered' ? nextVegOnly : current.displayedVegOnly,
    phase: 'covering',
    direction,
    runId: nextRunId,
  };
}

/**
 * Advances the transition machine to `'covered'` and commits `displayedVegOnly = toggleVegOnly`
 * only if `runId` matches the latest active transition.
 */
export function commitCoveredVegModeState(
  current: VegTransitionMachineState,
  runId: number
): VegTransitionMachineState {
  if (current.runId !== runId || current.phase === 'idle') {
    return current;
  }
  return {
    ...current,
    displayedVegOnly: current.toggleVegOnly,
    phase: 'covered',
  };
}

/**
 * Advances the transition machine from `'covered'` to `'revealing'`
 * only if `runId` matches the latest active transition.
 */
export function beginRevealVegModeState(
  current: VegTransitionMachineState,
  runId: number
): VegTransitionMachineState {
  if (current.runId !== runId || current.phase === 'idle') {
    return current;
  }
  return {
    ...current,
    displayedVegOnly: current.toggleVegOnly,
    phase: 'revealing',
  };
}

/**
 * Completes the transition and returns to `'idle'`
 * only if `runId` matches the latest active transition.
 */
export function completeVegModeTransition(
  current: VegTransitionMachineState,
  runId: number
): VegTransitionMachineState {
  if (current.runId !== runId) {
    return current;
  }
  return {
    ...current,
    displayedVegOnly: current.toggleVegOnly,
    phase: 'idle',
  };
}

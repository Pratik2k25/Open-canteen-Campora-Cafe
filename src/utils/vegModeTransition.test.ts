import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getVegTransitionVisualConfig,
  filterMenuItemsForHome,
  syncVegFilterChip,
  readCanonicalVegPreference,
  writeCanonicalVegPreference,
  createInitialVegTransitionState,
  beginVegModeTransition,
  commitCoveredVegModeState,
  beginRevealVegModeState,
  completeVegModeTransition,
  VEG_TRANSITION_TIMING,
  VEG_PREFERENCE_STORAGE_KEY,
  MOCK_PROFILE_STORAGE_KEY,
  type StorageLike,
} from './vegModeTransition.ts';
import { MENU_ITEMS } from '../data/menuData.ts';
import { INITIAL_MOCK_PROFILE_DATA } from './profileData.ts';
import { resolveFloatingCartComposition } from './floatingCartState.ts';
import type { MenuItem, CartItem } from '../types/index.ts';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

test('Visual config matches approved MP4 for both VEG ON and VEG OFF directions', () => {
  const onCfg = getVegTransitionVisualConfig(true);
  assert.equal(onCfg.direction, 'veg-on');
  assert.equal(onCfg.badgeLine1, 'VEG');
  assert.equal(onCfg.badgeLine2, 'MODE');
  assert.equal(onCfg.subtitle, 'Showing only vegetarian favourites');
  assert.equal(onCfg.brandFooter, 'OPEN CANTEEN');
  assert.equal(onCfg.overlayBgHex, '#E9FAF4');
  assert.equal(onCfg.badgeBgHex, '#087455');

  const offCfg = getVegTransitionVisualConfig(false);
  assert.equal(offCfg.direction, 'veg-off');
  assert.equal(offCfg.badgeLine1, 'ALL');
  assert.equal(offCfg.badgeLine2, 'FOOD');
  assert.equal(offCfg.subtitle, 'Bringing back the complete menu');
  assert.equal(offCfg.brandFooter, 'OPEN CANTEEN');
  assert.equal(offCfg.overlayBgHex, '#FFF9F4');
  assert.equal(offCfg.badgeBgHex, '#B65D22');

  assert.ok(
    VEG_TRANSITION_TIMING.totalDurationMs >= 700 &&
      VEG_TRANSITION_TIMING.totalDurationMs <= 1000
  );
});

test('Task 1.2.5: getVegTransitionVisualConfig parameterizes brandFooter dynamically', () => {
  // Default fallback (no brand passed)
  const defaultCfg = getVegTransitionVisualConfig(true);
  assert.equal(defaultCfg.brandFooter, 'OPEN CANTEEN');

  // Open Canteen
  const openCanteenCfg = getVegTransitionVisualConfig(true, 'Open Canteen');
  assert.equal(openCanteenCfg.brandFooter, 'OPEN CANTEEN');

  // My Home
  const myHomeCfg = getVegTransitionVisualConfig(false, 'My Home');
  assert.equal(myHomeCfg.brandFooter, 'MY HOME');

  // Accented names
  const accentedCfg = getVegTransitionVisualConfig(true, 'Café De L\'Étoile');
  assert.equal(accentedCfg.brandFooter, 'CAFÉ DE L\'ÉTOILE');

  // Whitespace trimming
  const trimmedCfg = getVegTransitionVisualConfig(false, '  Campus Bites  ');
  assert.equal(trimmedCfg.brandFooter, 'CAMPUS BITES');
});

test('Test A & B: filterMenuItemsForHome hides non-veg items when VEG ON and restores eligible non-veg items when VEG OFF', () => {
  const mixedItems = filterMenuItemsForHome(MENU_ITEMS, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.ok(mixedItems.some((i) => i.id === 'chicken-burger'));
  assert.ok(mixedItems.some((i) => i.id === 'dark-chocolate-cake'));

  const vegItems = filterMenuItemsForHome(MENU_ITEMS, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: true,
    activeFilters: ['vegOnly'],
    serviceMode: 'dinein',
  });
  assert.equal(
    vegItems.some((i) => i.foodType !== 'veg'),
    false,
    'No non-veg items should remain when isVegOnly is true'
  );
  assert.equal(vegItems.some((i) => i.id === 'chicken-burger'), false);
  assert.ok(vegItems.some((i) => i.id === 'paneer-paratha'));

  // Restoring VEG OFF brings back Chicken Burger
  const restoredItems = filterMenuItemsForHome(MENU_ITEMS, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(restoredItems.length, mixedItems.length);
  assert.ok(restoredItems.some((i) => i.id === 'chicken-burger'));
});

test('Test C, D, E: Preserves active service mode eligibility, category filter, search query, and filter chips across VEG toggles', () => {
  const restrictedNonVeg: MenuItem = {
    ...MENU_ITEMS.find((i) => i.id === 'chicken-burger')!,
    id: 'dinein-only-wings',
    name: 'Crispy Wings',
    categoryId: 'chinese',
    foodType: 'nonveg',
    serviceAvailability: { dinein: true, takeaway: false, delivery: false },
  };
  const vegChinese: MenuItem = {
    ...MENU_ITEMS.find((i) => i.id === 'paneer-paratha')!,
    id: 'veg-hakka-noodles',
    name: 'Veg Hakka Noodles',
    categoryId: 'chinese',
    foodType: 'veg',
    price: 120,
    serviceAvailability: { dinein: true, takeaway: true, delivery: true },
  };
  const customMenu = [...MENU_ITEMS, restrictedNonVeg, vegChinese];

  // Category = 'chinese' + VEG ON shows only Veg Hakka Noodles
  const chineseVeg = filterMenuItemsForHome(customMenu, {
    searchQuery: '',
    selectedCategory: 'chinese',
    isVegOnly: true,
    activeFilters: ['vegOnly'],
    serviceMode: 'dinein',
  });
  assert.equal(chineseVeg.length, 1);
  assert.equal(chineseVeg[0].id, 'veg-hakka-noodles');

  // Category = 'chinese' + VEG OFF in 'takeaway' mode does NOT restore dinein-only non-veg item
  const chineseTakeawayAll = filterMenuItemsForHome(customMenu, {
    searchQuery: '',
    selectedCategory: 'chinese',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'takeaway',
  });
  assert.equal(chineseTakeawayAll.length, 1);
  assert.equal(chineseTakeawayAll[0].id, 'veg-hakka-noodles');

  // Search query + filter chips preserved
  const chipsSyncedOn = syncVegFilterChip(['under200'], true);
  assert.deepEqual(chipsSyncedOn, ['under200', 'vegOnly']);
  const chipsSyncedOff = syncVegFilterChip(chipsSyncedOn, false);
  assert.deepEqual(chipsSyncedOff, ['under200']);
});

test('Test F: Existing non-vegetarian cart items remain intact when VEG Mode is enabled', () => {
  const burger = MENU_ITEMS.find((i) => i.id === 'chicken-burger')!;
  const cart: CartItem[] = [{ item: burger, quantity: 2 }];

  // Menu hides burger when VEG ON:
  const visibleMenu = filterMenuItemsForHome(MENU_ITEMS, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: true,
    activeFilters: ['vegOnly'],
    serviceMode: 'takeaway',
  });
  assert.equal(visibleMenu.some((i) => i.id === 'chicken-burger'), false);

  // Floating cart still contains the 2 Chicken Burgers unchanged:
  const comp = resolveFloatingCartComposition('takeaway', cart);
  assert.equal(comp.totalCartQuantity, 2);
  assert.equal(comp.visibleFoodItems.length, 1);
  assert.equal(comp.visibleFoodItems[0].menuItemId, 'chicken-burger');
});

test('Test G & I: State machine handles normal sequence, rapid toggling without stale overwrites, and reduced motion', () => {
  let state = createInitialVegTransitionState(false);
  assert.equal(state.phase, 'idle');
  assert.equal(state.toggleVegOnly, false);
  assert.equal(state.displayedVegOnly, false);

  // Step 1: Begin transition to VEG ON
  state = beginVegModeTransition(state, true, false);
  const firstRunId = state.runId;
  assert.equal(state.phase, 'covering');
  assert.equal(state.toggleVegOnly, true);
  assert.equal(state.displayedVegOnly, false, 'Grid filter waits until overlay covers screen');

  // Step 2: Rapidly toggle back to VEG OFF before first transition finishes!
  state = beginVegModeTransition(state, false, false);
  const secondRunId = state.runId;
  assert.notEqual(secondRunId, firstRunId);
  assert.equal(state.toggleVegOnly, false);
  assert.equal(state.direction, 'veg-off');

  // Stale timer from firstRunId must be ignored:
  const afterStaleCommit = commitCoveredVegModeState(state, firstRunId);
  assert.deepEqual(afterStaleCommit, state);

  // Active secondRunId progresses cleanly:
  state = commitCoveredVegModeState(state, secondRunId);
  assert.equal(state.phase, 'covered');
  assert.equal(state.displayedVegOnly, false);

  state = beginRevealVegModeState(state, secondRunId);
  assert.equal(state.phase, 'revealing');

  state = completeVegModeTransition(state, secondRunId);
  assert.equal(state.phase, 'idle');
  assert.equal(state.displayedVegOnly, false);

  // Reduced motion updates immediately without overlay phases:
  const reduced = beginVegModeTransition(state, true, true);
  assert.equal(reduced.phase, 'idle');
  assert.equal(reduced.toggleVegOnly, true);
  assert.equal(reduced.displayedVegOnly, true);
});

test('Test H: Canonical VEG preference synchronizes Home and Profile storage cleanly', () => {
  const storage = createMemoryStorage({
    [MOCK_PROFILE_STORAGE_KEY]: JSON.stringify(INITIAL_MOCK_PROFILE_DATA),
  });

  // Home enables VEG Mode -> both keys reflect true
  writeCanonicalVegPreference(true, storage);
  assert.equal(storage.getItem(VEG_PREFERENCE_STORAGE_KEY), 'true');
  assert.equal(readCanonicalVegPreference(false, storage), true);
  assert.equal(
    JSON.parse(storage.getItem(MOCK_PROFILE_STORAGE_KEY)!).vegMode,
    true
  );

  // Profile disables VEG Mode -> both keys reflect false
  writeCanonicalVegPreference(false, storage);
  assert.equal(storage.getItem(VEG_PREFERENCE_STORAGE_KEY), 'false');
  assert.equal(readCanonicalVegPreference(true, storage), false);
  assert.equal(
    JSON.parse(storage.getItem(MOCK_PROFILE_STORAGE_KEY)!).vegMode,
    false
  );
});

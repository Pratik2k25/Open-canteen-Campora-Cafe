import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMenuItemsForHome, syncVegFilterChip } from '../utils/vegModeTransition.ts';
import { CAMPORA_CATALOG, OPEN_CANTEEN_CATALOG, createEmptyCatalog } from '../data/mock/index.ts';
import { MockMenuAdapter } from './mockMenuAdapter.ts';
import type { CartItem, MenuItem, ServiceMode } from '../types/index.ts';
import { calculatePricing } from '../utils/pricing.ts';
import { isItemAvailableForService, sanitizeCartForServiceMode } from '../utils/serviceRules.ts';

test('Home Functional: 1. Case-insensitive and partial search matching', () => {
  const items = CAMPORA_CATALOG.items;

  // Case-insensitive
  const res1 = filterMenuItemsForHome(items, {
    searchQuery: 'cHiCkEn',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(res1.length, 1);
  assert.equal(res1[0].id, 'chicken-burger');

  // Leading and trailing whitespace
  const res2 = filterMenuItemsForHome(items, {
    searchQuery: '   paneer   ',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(res2.length, 1);
  assert.equal(res2[0].id, 'paneer-paratha');

  // Partial match
  const res3 = filterMenuItemsForHome(items, {
    searchQuery: 'dosa',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(res3.length, 1);
  assert.equal(res3[0].id, 'masala-dosa');

  // Multi-word search with excess inner spaces
  const res4 = filterMenuItemsForHome(items, {
    searchQuery: 'chicken    burger',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(res4.length, 1);
  assert.equal(res4[0].id, 'chicken-burger');

  // Description matching (Belgian chocolate)
  const res5 = filterMenuItemsForHome(items, {
    searchQuery: 'belgian',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(res5.length, 1);
  assert.equal(res5[0].id, 'dark-chocolate-cake');

  // Non-matching query returns zero items
  const res6 = filterMenuItemsForHome(items, {
    searchQuery: 'nonexistent-dish-xyz',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(res6.length, 0);
});

test('Home Functional: 2. Category selection and filtering behavior', () => {
  const items = CAMPORA_CATALOG.items;

  // 'all' category returns all available items
  const all = filterMenuItemsForHome(items, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(all.length, 10);

  // 'sweets' category returns Dark Chocolate Cake and Jalebi
  const sweets = filterMenuItemsForHome(items, {
    searchQuery: '',
    selectedCategory: 'sweets',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(sweets.length, 2);
  const sweetIds = sweets.map((s) => s.id).sort();
  assert.deepEqual(sweetIds, ['dark-chocolate-cake', 'jalebi']);

  // 'beverages' returns Coffee, Masala Chai, Pepsi, and Kulhad Chai
  const beverages = filterMenuItemsForHome(items, {
    searchQuery: '',
    selectedCategory: 'beverages',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(beverages.length, 4);
});

test('Home Functional: 3. Combined search, category, VEG mode, and filter chip composition', () => {
  const items = CAMPORA_CATALOG.items;

  // Category 'sweets' + search 'cake' -> Dark Chocolate Cake
  const match = filterMenuItemsForHome(items, {
    searchQuery: 'cake',
    selectedCategory: 'sweets',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(match.length, 1);
  assert.equal(match[0].id, 'dark-chocolate-cake');

  // Category 'sweets' + search 'burger' -> Empty (no sweets match burger)
  const mismatch = filterMenuItemsForHome(items, {
    searchQuery: 'burger',
    selectedCategory: 'sweets',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(mismatch.length, 0);

  // VEG ON hides Chicken Burger even when searching for 'burger'
  const vegBurger = filterMenuItemsForHome(items, {
    searchQuery: 'burger',
    selectedCategory: 'all',
    isVegOnly: true,
    activeFilters: ['vegOnly'],
    serviceMode: 'dinein',
  });
  assert.equal(vegBurger.length, 0);

  // Filter chip 'under200' keeps all items since Campora max price is ₹120
  const under200 = filterMenuItemsForHome(items, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: ['under200'],
    serviceMode: 'dinein',
  });
  assert.equal(under200.length, 10);
});

test('Home Functional: 4. Operator catalog isolation and empty state protection', async () => {
  const adapter = new MockMenuAdapter();

  // Campora Cafe: 10 items, 7 categories
  const camporaCatalog = await adapter.getCatalog('campora-cafe');
  assert.equal(camporaCatalog.items.length, 10);
  assert.equal(camporaCatalog.categories.length, 7);

  // Open Canteen: 7 items, 5 categories
  const openCanteenCatalog = await adapter.getCatalog('open-canteen');
  assert.equal(openCanteenCatalog.items.length, 7);
  assert.equal(openCanteenCatalog.categories.length, 5);

  // Unconfigured custom operator: 0 items, 1 standard 'All' category (clean empty catalog)
  const customCatalog = await adapter.getCatalog('custom-operator-delta');
  assert.equal(customCatalog.items.length, 0);
  assert.equal(customCatalog.categories.length, 1);
  assert.equal(customCatalog.categories[0].id, 'all');
  assert.equal(customCatalog.canteenId, 'custom-operator-delta');

  // Ensure custom operator items never inherit Campora's items
  const customFiltered = filterMenuItemsForHome(customCatalog.items, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: [],
    serviceMode: 'dinein',
  });
  assert.equal(customFiltered.length, 0);
});

test('Home Functional: 5. Cart operations and pricing consistency with Case 3 rules', () => {
  const cake = CAMPORA_CATALOG.items[0]; // ₹90
  const burger = CAMPORA_CATALOG.items[1]; // ₹79

  // Add 1 cake in dine-in
  let cart: CartItem[] = [{ item: cake, quantity: 1 }];
  let pricing = calculatePricing(cart, 'dinein');
  assert.equal(pricing.subtotal, 90);
  assert.equal(pricing.taxes, 5); // 5% of 90 = 4.5 -> 5
  assert.equal(pricing.packagingCharge, 0);
  assert.equal(pricing.deliveryFee, 0);
  assert.equal(pricing.grandTotal, 95);

  // Increment cake to 2 and add 1 burger
  cart = [
    { item: cake, quantity: 2 },
    { item: burger, quantity: 1 },
  ];
  pricing = calculatePricing(cart, 'takeaway');
  assert.equal(pricing.subtotal, 90 * 2 + 79); // 259
  assert.equal(pricing.taxes, Math.round(259 * 0.05)); // 13
  assert.equal(pricing.packagingCharge, 15); // Flat ₹15 for takeaway
  assert.equal(pricing.deliveryFee, 0);
  assert.equal(pricing.grandTotal, 259 + 13 + 15); // 287

  // Delivery mode adds delivery fee ₹30 + packaging ₹20
  pricing = calculatePricing(cart, 'delivery');
  assert.equal(pricing.packagingCharge, 20);
  assert.equal(pricing.deliveryFee, 30);
  assert.equal(pricing.grandTotal, 259 + 13 + 20 + 30); // 322
});

test('Home Functional: 6. Service-mode availability and cart sanitization rules', () => {
  const deliveryRestrictedItem: MenuItem = {
    ...CAMPORA_CATALOG.items[0],
    id: 'dinein-only-dessert',
    serviceAvailability: { dinein: true, takeaway: true, delivery: false },
  };

  assert.equal(isItemAvailableForService(deliveryRestrictedItem, 'dinein'), true);
  assert.equal(isItemAvailableForService(deliveryRestrictedItem, 'takeaway'), true);
  assert.equal(isItemAvailableForService(deliveryRestrictedItem, 'delivery'), false);

  const cart: CartItem[] = [
    { item: deliveryRestrictedItem, quantity: 1 },
    { item: CAMPORA_CATALOG.items[1], quantity: 2 },
  ];

  const sanitized = sanitizeCartForServiceMode(cart, 'delivery');
  assert.equal(sanitized.length, 1);
  assert.equal(sanitized[0].item.id, CAMPORA_CATALOG.items[1].id);
});

test('Home Functional: 7. Mock menu adapter live search method parity', async () => {
  const adapter = new MockMenuAdapter();

  const searchBiryani = await adapter.searchMenuItems('campora-cafe', 'paratha');
  assert.ok(searchBiryani.some((i) => i.id === 'paneer-paratha'));

  const searchWithCategory = await adapter.searchMenuItems('campora-cafe', 'paneer', 'paratha');
  assert.equal(searchWithCategory.length, 1);
  assert.equal(searchWithCategory[0].id, 'paneer-paratha');

  const searchMismatchCategory = await adapter.searchMenuItems('campora-cafe', 'paneer', 'sweets');
  assert.equal(searchMismatchCategory.length, 0);
});

test('Home Functional: 8. Campora catalog integrity regression (10 items, 7 categories)', () => {
  assert.equal(CAMPORA_CATALOG.canteenId, 'campora-cafe');
  assert.equal(CAMPORA_CATALOG.categories.length, 7);
  assert.equal(CAMPORA_CATALOG.items.length, 10);

  const expectedCategoryIds = ['all', 'sweets', 'paratha', 'north_indian', 'idli', 'chinese', 'beverages'];
  assert.deepEqual(CAMPORA_CATALOG.categories.map((c) => c.id), expectedCategoryIds);

  const expectedItemIds = [
    'dark-chocolate-cake',
    'chicken-burger',
    'paneer-paratha',
    'masala-dosa',
    'jalebi',
    'idli-sambar',
    'campora-coffee',
    'masala-chai',
    'pepsi',
    'kulhad-chai',
  ];
  assert.deepEqual(CAMPORA_CATALOG.items.map((i) => i.id), expectedItemIds);

  // Exact prices verification
  const expectedPrices = [90, 79, 60, 70, 50, 55, 45, 20, 40, 30];
  assert.deepEqual(CAMPORA_CATALOG.items.map((i) => i.price), expectedPrices);

  // Dietary classification verification
  assert.equal(CAMPORA_CATALOG.items.find((i) => i.id === 'chicken-burger')?.foodType, 'nonveg');
  const vegItems = CAMPORA_CATALOG.items.filter((i) => i.foodType === 'veg');
  assert.equal(vegItems.length, 9);
});

test('Home Functional: 9. Refined filter semantics (under200 & noPackaging service-mode awareness)', () => {
  const items = CAMPORA_CATALOG.items;

  // 1. under200 allows items <= 200
  const under200 = filterMenuItemsForHome(items, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: ['under200'],
    serviceMode: 'dinein',
  });
  assert.equal(under200.length, 10); // All 10 Campora items are <= 90

  // 2. noPackaging in dinein mode allows all items (packaging is 0)
  const dineinNoPkg = filterMenuItemsForHome(items, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: ['noPackaging'],
    serviceMode: 'dinein',
  });
  assert.equal(dineinNoPkg.length, 10);

  // 3. noPackaging in takeaway mode only allows factory-sealed or explicit zero items
  const takeawayNoPkg = filterMenuItemsForHome(items, {
    searchQuery: '',
    selectedCategory: 'all',
    isVegOnly: false,
    activeFilters: ['noPackaging'],
    serviceMode: 'takeaway',
  });
  // Only pepsi has visualType 'pepsi-bottle'; items with undefined packagingCharge are NOT treated as zero cost
  assert.equal(takeawayNoPkg.length, 1);
  assert.equal(takeawayNoPkg[0].id, 'pepsi');
});


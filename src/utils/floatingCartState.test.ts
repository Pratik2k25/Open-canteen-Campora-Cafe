import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveFloatingCartState,
  resolveFloatingCartComposition,
  extractCartFoodVisuals,
  resolveMenuItemVisualType,
  resolveMenuItemCartVisual,
  getFlightTargetOffsetForItem,
  getAllFloatingCartPreloadUrls,
} from './floatingCartState.ts';
import { MENU_ITEMS } from '../data/menuData.ts';
import type { CartItem, MenuItem } from '../types/index.ts';

const jalebi = MENU_ITEMS.find((m) => m.id === 'jalebi')!;
const paneerParatha = MENU_ITEMS.find((m) => m.id === 'paneer-paratha')!;
const masalaDosa = MENU_ITEMS.find((m) => m.id === 'masala-dosa')!;
const darkChocolateCake = MENU_ITEMS.find((m) => m.id === 'dark-chocolate-cake')!;
const idliSambar = MENU_ITEMS.find((m) => m.id === 'idli-sambar')!;
const chickenBurger = MENU_ITEMS.find((m) => m.id === 'chicken-burger')!;
const coffee = MENU_ITEMS.find((m) => m.id === 'campora-coffee')!;
const masalaChai = MENU_ITEMS.find((m) => m.id === 'masala-chai')!;
const pepsi = MENU_ITEMS.find((m) => m.id === 'pepsi')!;
const kulhadChai = MENU_ITEMS.find((m) => m.id === 'kulhad-chai')!;

test('resolveFloatingCartState maps quantity 0 to empty and >= 1 to filled', () => {
  assert.equal(resolveFloatingCartState(0), 'empty');
  assert.equal(resolveFloatingCartState(-1), 'empty');
  assert.equal(resolveFloatingCartState(1), 'filled');
  assert.equal(resolveFloatingCartState(6), 'filled');
});

test('Scenario A & B: Dinein with 3 and >3 distinct items caps visible miniatures at 3 and has single totalCartQuantity without +N overflow', () => {
  const threeItems: CartItem[] = [
    { item: jalebi, quantity: 3 },
    { item: paneerParatha, quantity: 2 },
    { item: masalaDosa, quantity: 1 },
  ];
  const comp3 = resolveFloatingCartComposition('dinein', threeItems);
  assert.equal(comp3.totalCartQuantity, 6);
  assert.equal(comp3.totalVisibleMiniatures, 3);
  assert.equal(comp3.visibleFoodItems.length, 3);
  assert.equal(comp3.visibleBeverageItems.length, 0);
  assert.equal('overflowDistinctCount' in comp3, false);

  const fiveItems: CartItem[] = [
    { item: jalebi, quantity: 1 },
    { item: paneerParatha, quantity: 1 },
    { item: masalaDosa, quantity: 1 },
    { item: darkChocolateCake, quantity: 1 },
    { item: idliSambar, quantity: 1 },
  ];
  const comp5 = resolveFloatingCartComposition('dinein', fiveItems);
  assert.equal(comp5.totalCartQuantity, 5);
  assert.equal(comp5.distinctProductCount, 5);
  assert.equal(comp5.totalVisibleMiniatures, 3);
  assert.equal(comp5.visibleFoodItems.length, 3);
  assert.equal('overflowDistinctCount' in comp5, false);
});

test('Test 1 & Test 2: Takeaway empty and food-only states use Phase 4.3 kraft bag without coffee cup, chai glass, or Pepsi bottle', () => {
  const emptyComp = resolveFloatingCartComposition('takeaway', []);
  assert.equal(emptyComp.state, 'empty');
  assert.equal(
    emptyComp.container.baseWebpSrc,
    '/assets/floating-cart/takeaway/takeaway-bag-closed.webp'
  );
  assert.equal(emptyComp.visibleBeverageItems.length, 0);
  assert.equal(emptyComp.totalCartQuantity, 0);

  const foodOnlyComp = resolveFloatingCartComposition('takeaway', [
    { item: paneerParatha, quantity: 1 },
  ]);
  assert.equal(foodOnlyComp.state, 'filled');
  assert.equal(
    foodOnlyComp.container.baseWebpSrc,
    '/assets/floating-cart/takeaway/takeaway-bag-open.webp'
  );
  assert.equal(
    foodOnlyComp.container.frontWallWebpSrc,
    '/assets/floating-cart/takeaway/takeaway-bag-front.webp'
  );
  assert.equal(foodOnlyComp.visibleFoodItems.length, 1);
  assert.equal(foodOnlyComp.visibleFoodItems[0].menuItemId, 'paneer-paratha');
  assert.equal(foodOnlyComp.visibleBeverageItems.length, 0);
});

test('Test 3, 4, 5: Explicit beverage mapping for Coffee Cup, Indian Desi Chai Glass, and Pepsi Bottle beside Takeaway bag', () => {
  assert.equal(resolveMenuItemVisualType(coffee), 'coffee-cup');
  assert.equal(resolveMenuItemVisualType(masalaChai), 'desi-chai-glass');
  assert.equal(resolveMenuItemVisualType(pepsi), 'pepsi-bottle');
  assert.equal(resolveMenuItemVisualType(kulhadChai), 'chai-kulhad');

  // Test 3: Burger + Coffee
  const compCoffee = resolveFloatingCartComposition('takeaway', [
    { item: chickenBurger, quantity: 1 },
    { item: coffee, quantity: 1 },
  ]);
  assert.equal(compCoffee.totalCartQuantity, 2);
  assert.equal(compCoffee.visibleFoodItems.length, 1);
  assert.equal(compCoffee.visibleFoodItems[0].menuItemId, 'chicken-burger');
  assert.equal(compCoffee.visibleBeverageItems.length, 1);
  assert.equal(
    compCoffee.visibleBeverageItems[0].imageUrl,
    '/assets/floating-cart/beverages/coffee-cup.webp'
  );
  assert.equal(compCoffee.visibleBeverageItems[0].is3DBeverageAsset, true);

  // Test 4: Jalebi + Masala Chai
  const compChai = resolveFloatingCartComposition('takeaway', [
    { item: jalebi, quantity: 1 },
    { item: masalaChai, quantity: 1 },
  ]);
  assert.equal(compChai.totalCartQuantity, 2);
  assert.equal(compChai.visibleFoodItems[0].menuItemId, 'jalebi');
  assert.equal(
    compChai.visibleBeverageItems[0].imageUrl,
    '/assets/floating-cart/beverages/desi-chai-glass.webp'
  );

  // Test 5: Paneer Paratha + Pepsi
  const compPepsi = resolveFloatingCartComposition('takeaway', [
    { item: paneerParatha, quantity: 1 },
    { item: pepsi, quantity: 1 },
  ]);
  assert.equal(compPepsi.totalCartQuantity, 2);
  assert.equal(compPepsi.visibleFoodItems[0].menuItemId, 'paneer-paratha');
  assert.equal(
    compPepsi.visibleBeverageItems[0].imageUrl,
    '/assets/floating-cart/beverages/pepsi-bottle.webp'
  );
});

test('Test 6: Delivery and Takeaway with >3 distinct products retain representative food + beverage up to 3 total miniatures with single totalCartQuantity', () => {
  const items: CartItem[] = [
    { item: jalebi, quantity: 1 },
    { item: paneerParatha, quantity: 2 },
    { item: masalaDosa, quantity: 1 },
    { item: darkChocolateCake, quantity: 1 },
    { item: pepsi, quantity: 2 },
  ];
  const comp = resolveFloatingCartComposition('delivery', items);
  assert.equal(comp.totalCartQuantity, 7);
  assert.equal(comp.distinctProductCount, 5);
  assert.equal(comp.totalVisibleMiniatures, 3);
  assert.equal(comp.visibleFoodItems.length, 2);
  assert.equal(comp.visibleBeverageItems.length, 1);
  assert.equal(comp.visibleBeverageItems[0].menuItemId, 'pepsi');
});

test('Test 7 & Beverage-only order: Pepsi-only order renders zero food and keeps Takeaway bag closed; removing Pepsi clears beverage layer', () => {
  const bevOnly = resolveFloatingCartComposition('takeaway', [
    { item: pepsi, quantity: 1 },
  ]);
  assert.equal(bevOnly.totalCartQuantity, 1);
  assert.equal(bevOnly.visibleFoodItems.length, 0);
  assert.equal(bevOnly.visibleBeverageItems.length, 1);
  assert.equal(bevOnly.visibleBeverageItems[0].menuItemId, 'pepsi');
  assert.equal(
    bevOnly.container.baseWebpSrc,
    '/assets/floating-cart/takeaway/takeaway-bag-closed.webp'
  );
  assert.equal(bevOnly.container.frontWallWebpSrc, undefined);

  // After removing Pepsi from a Paratha + Pepsi cart:
  const afterRemove = resolveFloatingCartComposition('takeaway', [
    { item: paneerParatha, quantity: 1 },
  ]);
  assert.equal(afterRemove.visibleBeverageItems.length, 0);
  assert.equal(afterRemove.visibleFoodItems.length, 1);
  assert.equal(afterRemove.totalCartQuantity, 1);
});

test('Test 9 & Synchronization: Food and beverages have distinct flight landing offsets and in-flight qty=1 items are held back until landing', () => {
  const foodOffset = getFlightTargetOffsetForItem('takeaway', jalebi);
  const bevOffset = getFlightTargetOffsetForItem('takeaway', pepsi);
  assert.ok(foodOffset.offsetX > 0, 'Food lands inside the right-shifted open bag mouth');
  assert.ok(bevOffset.offsetX < 0, 'Beverage lands beside the left side of the bag');

  const items: CartItem[] = [
    { item: jalebi, quantity: 1 },
    { item: pepsi, quantity: 1 },
  ];
  const duringPepsiFlight = extractCartFoodVisuals(items, 'pepsi');
  assert.equal(duringPepsiFlight.length, 1);
  assert.equal(duringPepsiFlight[0].menuItemId, 'jalebi');

  const afterPepsiLanding = extractCartFoodVisuals(items, null);
  assert.equal(afterPepsiLanding.length, 2);
});

test('Non-Pepsi beverage rule: Sprite/Coca-Cola/water with visualType other-beverage never displays Pepsi bottle and uses its own menu image', () => {
  const sprite: MenuItem = {
    ...pepsi,
    id: 'sprite-can',
    name: 'Sprite',
    imageUrl: '/assets/menu/sprite.png',
    visualType: 'other-beverage',
    cartAssetUrl: undefined,
  };
  const visual = resolveMenuItemCartVisual(sprite, 1);
  assert.equal(visual.isBeverage, true);
  assert.equal(visual.is3DBeverageAsset, false);
  assert.equal(visual.imageUrl, '/assets/menu/sprite.png');
});

test('getAllFloatingCartPreloadUrls returns all 11 Phase 4.3 container and 3D beverage URLs', () => {
  const urls = getAllFloatingCartPreloadUrls();
  assert.equal(urls.length, 11);
  assert.equal(new Set(urls).size, 11);
  assert.ok(urls.includes('/assets/floating-cart/takeaway/takeaway-bag-open.webp'));
  assert.ok(urls.includes('/assets/floating-cart/beverages/pepsi-bottle.webp'));
  assert.ok(urls.includes('/assets/floating-cart/beverages/desi-chai-glass.webp'));
  assert.ok(urls.includes('/assets/floating-cart/beverages/coffee-cup.webp'));
});

import type { ServiceMode, CartItem, MenuItem, FoodVisualType } from '../types/index.ts';

export type FloatingCartVisualState = 'empty' | 'filled';

export interface CartProductVisual {
  menuItemId: string;
  name: string;
  quantity: number;
  visualType: FoodVisualType;
  isBeverage: boolean;
  /** Primary image URL for rendering inside/beside the cart (3D beverage asset or dish miniature) */
  imageUrl: string;
  /** PNG fallback URL when imageUrl is a .webp 3D asset */
  pngFallbackUrl: string;
  /** True when using a dedicated transparent 3D beverage asset (rendered as an upright 3D object rather than a circular plate dish) */
  is3DBeverageAsset: boolean;
  animationAssetUrl?: string;
}

export interface VisualSlotCoordinate {
  /** Normalized horizontal center percentage (0 to 100) within the 88x88 container frame */
  leftPct: number;
  /** Normalized vertical center percentage (0 to 100) within the 88x88 container frame */
  topPct: number;
  /** Width/Height in pixels at 88px base vessel scale */
  sizePx: number;
  /** Slight rotation in degrees for natural plating/packing (0 for upright beverages) */
  rotateDeg: number;
  /** Z-index within its layer */
  zIndex: number;
}

export interface FloatingCartContainerLayers {
  mode: ServiceMode;
  state: FloatingCartVisualState;
  /** Base / empty container or open-back container WebP URL */
  baseWebpSrc: string;
  /** Base / empty container or open-back container PNG fallback URL */
  basePngSrc: string;
  /** Foreground occlusion wall WebP URL (for Takeaway bag front & Delivery box front wall) */
  frontWallWebpSrc?: string;
  /** Foreground occlusion wall PNG fallback URL */
  frontWallPngSrc?: string;
  /** Horizontal offset percentage applied to the container when a beverage stands beside it */
  containerOffsetXPct: number;
  /** Scale factor applied to the container when a beverage stands beside it */
  containerScale: number;
  alt: string;
  modeTitle: string;
  emptySubtitle: string;
  badgeColorHex: string;
  auraColorRgba: string;
}

export interface ResolvedFloatingCartComposition {
  mode: ServiceMode;
  state: FloatingCartVisualState;
  totalCartQuantity: number;
  distinctProductCount: number;
  /** Total visible distinct miniatures (food + beverages), strictly capped at <= 3 */
  totalVisibleMiniatures: number;
  /** Solid food miniatures rendered inside the container (plate / open bag / open meal box) */
  visibleFoodItems: Array<CartProductVisual & { slot: VisualSlotCoordinate }>;
  /** Beverage miniatures rendered upright beside/near the container */
  visibleBeverageItems: Array<CartProductVisual & { slot: VisualSlotCoordinate }>;
  container: FloatingCartContainerLayers;
}

/**
 * Approved 3D Beverage Asset Registry mapped by explicit FoodVisualType.
 * Never guesses visuals from loose substring matching; only uses explicit product visualType.
 * Note: 'pepsi-bottle' is strictly mapped ONLY to Pepsi products, never generic cold drinks.
 */
export const BEVERAGE_3D_ASSET_MAP: Partial<
  Record<FoodVisualType, { webp: string; png: string }>
> = {
  'coffee-cup': {
    webp: '/assets/floating-cart/beverages/coffee-cup.webp',
    png: '/assets/floating-cart/beverages/coffee-cup.png',
  },
  coffee: {
    webp: '/assets/floating-cart/beverages/coffee-cup.webp',
    png: '/assets/floating-cart/beverages/coffee-cup.png',
  },
  'desi-chai-glass': {
    webp: '/assets/floating-cart/beverages/desi-chai-glass.webp',
    png: '/assets/floating-cart/beverages/desi-chai-glass.png',
  },
  'chai-glass': {
    webp: '/assets/floating-cart/beverages/desi-chai-glass.webp',
    png: '/assets/floating-cart/beverages/desi-chai-glass.png',
  },
  'pepsi-bottle': {
    webp: '/assets/floating-cart/beverages/pepsi-bottle.webp',
    png: '/assets/floating-cart/beverages/pepsi-bottle.png',
  },
  'chai-kulhad': {
    webp: '/assets/floating-cart/beverages/kulhad-chai.webp',
    png: '/assets/floating-cart/beverages/kulhad-chai.png',
  },
  'cold-drink': {
    webp: '/assets/floating-cart/beverages/cold-drink-bottle.webp',
    png: '/assets/floating-cart/beverages/cold-drink-bottle.png',
  },
};

export function isBeverageVisualType(visualType: FoodVisualType): boolean {
  return (
    visualType === 'coffee-cup' ||
    visualType === 'desi-chai-glass' ||
    visualType === 'pepsi-bottle' ||
    visualType === 'chai-kulhad' ||
    visualType === 'other-beverage' ||
    visualType === 'coffee' ||
    visualType === 'chai-glass' ||
    visualType === 'cold-drink'
  );
}

/**
 * Data-driven visual category resolver.
 * Uses the explicit `item.visualType` field from the MenuItem contract.
 * Falls back to `'other-beverage'` if `categoryId === 'beverages'` without a specific `visualType`,
 * or `'food'` otherwise.
 */
export function resolveMenuItemVisualType(item: MenuItem): FoodVisualType {
  if (item.visualType) {
    return item.visualType;
  }
  if (item.categoryId === 'beverages') {
    return 'other-beverage';
  }
  return 'food';
}

/**
 * Resolves the cart miniature asset for any MenuItem.
 * - For beverages with an explicit `cartAssetUrl` or mapped 3D asset in `BEVERAGE_3D_ASSET_MAP`,
 *   returns the dedicated transparent 3D beverage asset (`is3DBeverageAsset: true`).
 * - When a beverage has no dedicated 3D asset (`visualType === 'other-beverage'` or `cartAssetUrl === ''`),
 *   falls back cleanly to the item's actual menu image (`item.imageUrl`) as a clipped thumbnail
 *   (`is3DBeverageAsset: false`), never substituting an unrelated coffee cup, chai glass, or Pepsi bottle.
 */
export function resolveMenuItemCartVisual(
  item: MenuItem,
  quantity: number
): CartProductVisual {
  const visualType = resolveMenuItemVisualType(item);
  const isBeverage = isBeverageVisualType(visualType);

  if (isBeverage) {
    const hasExplicitDisable = item.cartAssetUrl === '';
    const customCartAsset =
      !hasExplicitDisable && item.cartAssetUrl ? item.cartAssetUrl : undefined;
    const mappedAsset = !hasExplicitDisable ? BEVERAGE_3D_ASSET_MAP[visualType] : undefined;

    if (customCartAsset) {
      const pngFallback = customCartAsset.endsWith('.webp')
        ? customCartAsset.replace(/\.webp$/, '.png')
        : customCartAsset;
      return {
        menuItemId: item.id,
        name: item.name,
        quantity,
        visualType,
        isBeverage: true,
        imageUrl: customCartAsset,
        pngFallbackUrl: pngFallback,
        is3DBeverageAsset: true,
        animationAssetUrl: item.animationAssetUrl,
      };
    }

    if (mappedAsset) {
      return {
        menuItemId: item.id,
        name: item.name,
        quantity,
        visualType,
        isBeverage: true,
        imageUrl: mappedAsset.webp,
        pngFallbackUrl: mappedAsset.png,
        is3DBeverageAsset: true,
        animationAssetUrl: item.animationAssetUrl,
      };
    }

    // Fallback for unmapped / other-beverage (e.g., Coca-Cola, Sprite, water, generic cold drink):
    // use actual menu item imageUrl, never substituting Pepsi, Coffee, or Chai
    const fallbackImg = item.animationAssetUrl || item.imageUrl;
    return {
      menuItemId: item.id,
      name: item.name,
      quantity,
      visualType,
      isBeverage: true,
      imageUrl: fallbackImg,
      pngFallbackUrl: fallbackImg,
      is3DBeverageAsset: false,
      animationAssetUrl: item.animationAssetUrl,
    };
  }

  const foodImg = item.animationAssetUrl || item.imageUrl;
  return {
    menuItemId: item.id,
    name: item.name,
    quantity,
    visualType: 'food',
    isBeverage: false,
    imageUrl: foodImg,
    pngFallbackUrl: foodImg,
    is3DBeverageAsset: false,
    animationAssetUrl: item.animationAssetUrl,
  };
}

export const FLOATING_CART_CONTAINER_CONFIG: Record<
  ServiceMode,
  Record<FloatingCartVisualState, FloatingCartContainerLayers>
> = {
  dinein: {
    empty: {
      mode: 'dinein',
      state: 'empty',
      baseWebpSrc: '/assets/floating-cart/dinein-empty.webp',
      basePngSrc: '/assets/floating-cart/dinein-empty.png',
      containerOffsetXPct: 0,
      containerScale: 1,
      alt: 'Empty Dinein ceramic plate with dark-green rim',
      modeTitle: 'Dinein Plate',
      emptySubtitle: 'Your plate is empty — tap ADD on any dish to begin',
      badgeColorHex: '#0E6B39',
      auraColorRgba: 'rgba(210, 248, 225, 0.85)',
    },
    filled: {
      mode: 'dinein',
      state: 'filled',
      baseWebpSrc: '/assets/floating-cart/dinein-empty.webp',
      basePngSrc: '/assets/floating-cart/dinein-empty.png',
      containerOffsetXPct: 0,
      containerScale: 1,
      alt: 'Dinein ceramic plate with your selected order',
      modeTitle: 'Dinein Plate',
      emptySubtitle: 'Your plate is empty — tap ADD on any dish to begin',
      badgeColorHex: '#0E6B39',
      auraColorRgba: 'rgba(210, 248, 225, 0.92)',
    },
  },
  takeaway: {
    empty: {
      mode: 'takeaway',
      state: 'empty',
      // Beverage-free closed branded kraft bag alone
      baseWebpSrc: '/assets/floating-cart/takeaway/takeaway-bag-closed.webp',
      basePngSrc: '/assets/floating-cart/takeaway/takeaway-bag-closed.png',
      containerOffsetXPct: 0,
      containerScale: 1,
      alt: 'Empty closed Campora kraft takeaway bag',
      modeTitle: 'Takeaway Bag',
      emptySubtitle: 'Your takeaway bag is empty — tap ADD on any dish',
      badgeColorHex: '#9A4A12',
      auraColorRgba: 'rgba(249, 227, 206, 0.85)',
    },
    filled: {
      mode: 'takeaway',
      state: 'filled',
      // Phase 4.3 approved open kraft-paper bag (Layer 1 shadow + Layer 2 open back/interior) + Layer 4 front wall occlusion
      baseWebpSrc: '/assets/floating-cart/takeaway/takeaway-bag-open.webp',
      basePngSrc: '/assets/floating-cart/takeaway/takeaway-bag-open.png',
      frontWallWebpSrc: '/assets/floating-cart/takeaway/takeaway-bag-front.webp',
      frontWallPngSrc: '/assets/floating-cart/takeaway/takeaway-bag-front.png',
      containerOffsetXPct: 0,
      containerScale: 1,
      alt: 'Open Campora kraft takeaway bag with your selected order',
      modeTitle: 'Takeaway Bag',
      emptySubtitle: 'Your takeaway bag is empty — tap ADD on any dish',
      badgeColorHex: '#9A4A12',
      auraColorRgba: 'rgba(249, 227, 206, 0.92)',
    },
  },
  delivery: {
    empty: {
      mode: 'delivery',
      state: 'empty',
      baseWebpSrc: '/assets/floating-cart/delivery-empty.webp',
      basePngSrc: '/assets/floating-cart/delivery-empty.png',
      containerOffsetXPct: 0,
      containerScale: 1,
      alt: 'Empty closed Campora handled kraft delivery box',
      modeTitle: 'Delivery Box',
      emptySubtitle: 'Your delivery box is empty — tap ADD on any dish',
      badgeColorHex: '#0D528C',
      auraColorRgba: 'rgba(222, 240, 254, 0.85)',
    },
    filled: {
      mode: 'delivery',
      state: 'filled',
      baseWebpSrc: '/assets/floating-cart/delivery-open-back.webp',
      basePngSrc: '/assets/floating-cart/delivery-open-back.png',
      frontWallWebpSrc: '/assets/floating-cart/delivery-front-wall.webp',
      frontWallPngSrc: '/assets/floating-cart/delivery-front-wall.png',
      containerOffsetXPct: 0,
      containerScale: 1,
      alt: 'Open Campora handled kraft delivery box with your selected order',
      modeTitle: 'Delivery Box',
      emptySubtitle: 'Your delivery box is empty — tap ADD on any dish',
      badgeColorHex: '#0D528C',
      auraColorRgba: 'rgba(222, 240, 254, 0.92)',
    },
  },
};

/**
 * Mode-specific perspective coordinates for 1, 2, or 3 solid food items inside the container.
 * For Takeaway, coordinates follow the exact three-quarter diagonal opening of `takeaway-bag-open.webp`
 * (`topPct: 19%..25%`), so food sits inside the dark interior opening and is naturally occluded along its bottom edge
 * by `takeaway-bag-front.webp` (`Layer 4`), never covering the Campora Café logo.
 */
const MODE_FOOD_SLOTS: Record<ServiceMode, Record<1 | 2 | 3, VisualSlotCoordinate[]>> = {
  dinein: {
    1: [{ leftPct: 50, topPct: 47, sizePx: 38, rotateDeg: 0, zIndex: 20 }],
    2: [
      { leftPct: 38, topPct: 48, sizePx: 32, rotateDeg: -5, zIndex: 19 },
      { leftPct: 62, topPct: 46, sizePx: 32, rotateDeg: 5, zIndex: 20 },
    ],
    3: [
      { leftPct: 50, topPct: 40, sizePx: 28, rotateDeg: 0, zIndex: 18 },
      { leftPct: 36, topPct: 51, sizePx: 29, rotateDeg: -6, zIndex: 19 },
      { leftPct: 64, topPct: 50, sizePx: 29, rotateDeg: 6, zIndex: 20 },
    ],
  },
  takeaway: {
    1: [{ leftPct: 49, topPct: 22, sizePx: 35, rotateDeg: 4, zIndex: 20 }],
    2: [
      { leftPct: 36, topPct: 19, sizePx: 31, rotateDeg: -5, zIndex: 19 },
      { leftPct: 60, topPct: 24, sizePx: 31, rotateDeg: 6, zIndex: 20 },
    ],
    3: [
      { leftPct: 49, topPct: 16, sizePx: 28, rotateDeg: 0, zIndex: 18 },
      { leftPct: 33, topPct: 20, sizePx: 28, rotateDeg: -6, zIndex: 19 },
      { leftPct: 62, topPct: 25, sizePx: 28, rotateDeg: 6, zIndex: 20 },
    ],
  },
  delivery: {
    1: [{ leftPct: 48, topPct: 42, sizePx: 38, rotateDeg: -2, zIndex: 20 }],
    2: [
      { leftPct: 36, topPct: 41, sizePx: 33, rotateDeg: -6, zIndex: 19 },
      { leftPct: 60, topPct: 44, sizePx: 33, rotateDeg: 5, zIndex: 20 },
    ],
    3: [
      { leftPct: 49, topPct: 35, sizePx: 29, rotateDeg: 0, zIndex: 18 },
      { leftPct: 34, topPct: 43, sizePx: 30, rotateDeg: -6, zIndex: 19 },
      { leftPct: 62, topPct: 46, sizePx: 30, rotateDeg: 6, zIndex: 20 },
    ],
  },
};

/**
 * Upright beverage slot coordinates positioned beside/near the container:
 * - Takeaway: Standing beside the lower-left of the kraft paper bag (`leftPct: 21%, topPct: 62%`),
 *   upright on the same implied surface, never covering the Campora Café branding on the bag.
 * - Dinein: Standing upright near the upper-left rim of the ceramic plate (`leftPct: 22%, topPct: 36%`)
 * - Delivery: Standing upright beside the left wall of the handled meal box (`leftPct: 21%, topPct: 57%`)
 */
const MODE_BEVERAGE_SLOTS: Record<ServiceMode, Record<1 | 2 | 3, VisualSlotCoordinate[]>> = {
  takeaway: {
    1: [{ leftPct: 21, topPct: 62, sizePx: 46, rotateDeg: 0, zIndex: 35 }],
    2: [
      { leftPct: 16, topPct: 57, sizePx: 40, rotateDeg: 0, zIndex: 34 },
      { leftPct: 31, topPct: 65, sizePx: 40, rotateDeg: 0, zIndex: 35 },
    ],
    3: [
      { leftPct: 14, topPct: 53, sizePx: 36, rotateDeg: 0, zIndex: 33 },
      { leftPct: 25, topPct: 60, sizePx: 36, rotateDeg: 0, zIndex: 34 },
      { leftPct: 36, topPct: 66, sizePx: 36, rotateDeg: 0, zIndex: 35 },
    ],
  },
  dinein: {
    1: [{ leftPct: 22, topPct: 36, sizePx: 44, rotateDeg: 0, zIndex: 35 }],
    2: [
      { leftPct: 18, topPct: 34, sizePx: 38, rotateDeg: 0, zIndex: 34 },
      { leftPct: 32, topPct: 38, sizePx: 38, rotateDeg: 0, zIndex: 35 },
    ],
    3: [
      { leftPct: 17, topPct: 33, sizePx: 35, rotateDeg: 0, zIndex: 33 },
      { leftPct: 29, topPct: 37, sizePx: 35, rotateDeg: 0, zIndex: 34 },
      { leftPct: 41, topPct: 39, sizePx: 35, rotateDeg: 0, zIndex: 35 },
    ],
  },
  delivery: {
    1: [{ leftPct: 21, topPct: 57, sizePx: 46, rotateDeg: 0, zIndex: 35 }],
    2: [
      { leftPct: 16, topPct: 53, sizePx: 40, rotateDeg: 0, zIndex: 34 },
      { leftPct: 30, topPct: 60, sizePx: 40, rotateDeg: 0, zIndex: 35 },
    ],
    3: [
      { leftPct: 14, topPct: 50, sizePx: 36, rotateDeg: 0, zIndex: 33 },
      { leftPct: 25, topPct: 56, sizePx: 36, rotateDeg: 0, zIndex: 34 },
      { leftPct: 36, topPct: 62, sizePx: 36, rotateDeg: 0, zIndex: 35 },
    ],
  },
};

export function resolveFloatingCartState(totalCartQuantity: number): FloatingCartVisualState {
  return totalCartQuantity > 0 ? 'filled' : 'empty';
}

/**
 * Extracts CartProductVisual items from current cart lines, preserving insertion order.
 * Holds back an item with quantity === 1 while its first-add flight animation is in progress
 * so no duplicate visual appears before landing.
 */
export function extractCartFoodVisuals(
  cartItems: CartItem[],
  inFlightMenuItemId?: string | null
): CartProductVisual[] {
  const visuals: CartProductVisual[] = [];
  for (const ci of cartItems) {
    if (ci.quantity <= 0) continue;
    if (inFlightMenuItemId && ci.item.id === inFlightMenuItemId && ci.quantity === 1) {
      continue;
    }
    visuals.push(resolveMenuItemCartVisual(ci.item, ci.quantity));
  }
  return visuals;
}

/**
 * Deterministic 3-item selection across solid foods and beverages (Section 9):
 * - Maximum 3 visible distinct product miniatures in total (`food + beverages <= 3`).
 * - Preserves insertion order within food and beverage groups.
 * - When both food and beverages are in the cart and total distinct items > 3,
 *   retains up to 2 solid foods inside the container + 1 representative beverage beside the container
 *   so the customer sees both their food and their drink represented.
 */
export function selectRepresentativeVisuals(allVisuals: CartProductVisual[]): {
  selectedFoods: CartProductVisual[];
  selectedBeverages: CartProductVisual[];
} {
  const foods = allVisuals.filter((v) => !v.isBeverage);
  const beverages = allVisuals.filter((v) => v.isBeverage);

  if (allVisuals.length <= 3) {
    return {
      selectedFoods: foods,
      selectedBeverages: beverages,
    };
  }

  // More than 3 distinct items:
  if (foods.length > 0 && beverages.length > 0) {
    // Keep up to 2 foods inside the container and 1 beverage (or 1 food + 2 beverages if only 1 food exists)
    const foodCap = Math.min(2, foods.length);
    const bevCap = Math.min(3 - foodCap, beverages.length);
    return {
      selectedFoods: foods.slice(0, foodCap),
      selectedBeverages: beverages.slice(0, bevCap),
    };
  }

  return {
    selectedFoods: foods.slice(0, 3),
    selectedBeverages: beverages.slice(0, 3),
  };
}

export function getFoodSlotsForMode(
  mode: ServiceMode,
  visibleFoodCount: number,
  containerOffsetXPct = 0
): VisualSlotCoordinate[] {
  const safeMode: ServiceMode = MODE_FOOD_SLOTS[mode] ? mode : 'dinein';
  if (visibleFoodCount <= 0) return [];
  const clamped = Math.min(3, Math.max(1, visibleFoodCount)) as 1 | 2 | 3;
  return MODE_FOOD_SLOTS[safeMode][clamped].map((slot) => ({
    ...slot,
    leftPct: slot.leftPct + containerOffsetXPct,
  }));
}

export function getBeverageSlotsForMode(
  mode: ServiceMode,
  visibleBeverageCount: number
): VisualSlotCoordinate[] {
  const safeMode: ServiceMode = MODE_BEVERAGE_SLOTS[mode] ? mode : 'dinein';
  if (visibleBeverageCount <= 0) return [];
  const clamped = Math.min(3, Math.max(1, visibleBeverageCount)) as 1 | 2 | 3;
  return MODE_BEVERAGE_SLOTS[safeMode][clamped];
}

/**
 * Computes the flight landing target pixel offset relative to the center of `#campora-floating-cart-target`
 * so food items arc into the container interior while beverage items arc to the beverage position beside the container.
 */
export function getFlightTargetOffsetForItem(
  mode: ServiceMode,
  item: MenuItem
): { offsetX: number; offsetY: number } {
  const visualType = resolveMenuItemVisualType(item);
  const isBev = isBeverageVisualType(visualType);

  if (isBev) {
    switch (mode) {
      case 'takeaway':
        return { offsetX: -21, offsetY: 7 };
      case 'dinein':
        return { offsetX: -22, offsetY: -8 };
      case 'delivery':
        return { offsetX: -23, offsetY: 6 };
    }
  }

  switch (mode) {
    case 'takeaway':
      return { offsetX: 5, offsetY: -15 };
    case 'dinein':
      return { offsetX: 0, offsetY: -2 };
    case 'delivery':
      return { offsetX: 0, offsetY: -5 };
  }
}

export function resolveFloatingCartComposition(
  mode: ServiceMode,
  cartItems: CartItem[],
  inFlightMenuItemId?: string | null
): ResolvedFloatingCartComposition {
  const safeMode: ServiceMode = FLOATING_CART_CONTAINER_CONFIG[mode] ? mode : 'dinein';
  const totalCartQuantity = cartItems.reduce(
    (sum, ci) => sum + (ci.quantity > 0 ? ci.quantity : 0),
    0
  );
  const visualState = resolveFloatingCartState(totalCartQuantity);

  const allVisuals = extractCartFoodVisuals(cartItems, inFlightMenuItemId);
  const distinctProductCount = allVisuals.length;
  const { selectedFoods, selectedBeverages } = selectRepresentativeVisuals(allVisuals);

  // Check if there are any solid food items in the cart at all (even if in flight)
  const totalSolidFoodCount = cartItems.reduce((sum, ci) => {
    if (ci.quantity <= 0) return sum;
    return isBeverageVisualType(resolveMenuItemVisualType(ci.item)) ? sum : sum + ci.quantity;
  }, 0);

  // Resolve container layers:
  // If cart is filled ONLY with beverages (no solid food items), Takeaway bag and Delivery box remain closed
  // beside the beverage rather than gaping open empty!
  const baseTemplate = FLOATING_CART_CONTAINER_CONFIG[safeMode][visualState];
  const emptyTemplate = FLOATING_CART_CONTAINER_CONFIG[safeMode].empty;

  const useClosedContainerForBeverageOnly =
    visualState === 'filled' &&
    totalSolidFoodCount === 0 &&
    (safeMode === 'takeaway' || safeMode === 'delivery');

  const hasVisibleBeverage = selectedBeverages.length > 0;
  const containerOffsetXPct =
    hasVisibleBeverage && safeMode === 'takeaway'
      ? 13
      : hasVisibleBeverage && safeMode === 'delivery'
      ? 8
      : 0;
  const containerScale =
    hasVisibleBeverage && safeMode === 'takeaway'
      ? 0.91
      : hasVisibleBeverage && safeMode === 'delivery'
      ? 0.94
      : 1;

  const container: FloatingCartContainerLayers = {
    ...baseTemplate,
    baseWebpSrc: useClosedContainerForBeverageOnly
      ? emptyTemplate.baseWebpSrc
      : baseTemplate.baseWebpSrc,
    basePngSrc: useClosedContainerForBeverageOnly
      ? emptyTemplate.basePngSrc
      : baseTemplate.basePngSrc,
    frontWallWebpSrc: useClosedContainerForBeverageOnly
      ? undefined
      : baseTemplate.frontWallWebpSrc,
    frontWallPngSrc: useClosedContainerForBeverageOnly
      ? undefined
      : baseTemplate.frontWallPngSrc,
    containerOffsetXPct,
    containerScale,
  };

  const foodSlots = getFoodSlotsForMode(safeMode, selectedFoods.length, containerOffsetXPct);
  const beverageSlots = getBeverageSlotsForMode(safeMode, selectedBeverages.length);

  const visibleFoodItems = selectedFoods.map((v, idx) => ({
    ...v,
    slot: foodSlots[idx],
  }));

  const visibleBeverageItems = selectedBeverages.map((v, idx) => ({
    ...v,
    slot: beverageSlots[idx],
  }));

  return {
    mode: safeMode,
    state: visualState,
    totalCartQuantity,
    distinctProductCount,
    totalVisibleMiniatures: visibleFoodItems.length + visibleBeverageItems.length,
    visibleFoodItems,
    visibleBeverageItems,
    container,
  };
}

export function getFloatingCartAsset(
  mode: ServiceMode,
  totalCartQuantity: number
): FloatingCartContainerLayers {
  const safeMode: ServiceMode = FLOATING_CART_CONTAINER_CONFIG[mode] ? mode : 'dinein';
  const visualState = resolveFloatingCartState(totalCartQuantity);
  return FLOATING_CART_CONTAINER_CONFIG[safeMode][visualState];
}

export function getAllFloatingCartPreloadUrls(): string[] {
  return [
    '/assets/floating-cart/dinein-empty.webp',
    '/assets/floating-cart/takeaway/takeaway-bag-closed.webp',
    '/assets/floating-cart/takeaway/takeaway-bag-open.webp',
    '/assets/floating-cart/takeaway/takeaway-bag-front.webp',
    '/assets/floating-cart/delivery-empty.webp',
    '/assets/floating-cart/delivery-open-back.webp',
    '/assets/floating-cart/delivery-front-wall.webp',
    '/assets/floating-cart/beverages/coffee-cup.webp',
    '/assets/floating-cart/beverages/desi-chai-glass.webp',
    '/assets/floating-cart/beverages/pepsi-bottle.webp',
    '/assets/floating-cart/beverages/kulhad-chai.webp',
  ];
}

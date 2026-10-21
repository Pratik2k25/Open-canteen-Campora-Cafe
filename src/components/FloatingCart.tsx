import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart, type FlightPayload } from '../context/CartContext.tsx';
import { useAccessibleDialog } from '../utils/useAccessibleDialog.ts';
import {
  resolveFloatingCartComposition,
  getAllFloatingCartPreloadUrls,
  type ResolvedFloatingCartComposition,
  type FloatingCartContainerLayers,
  type CartProductVisual,
  type VisualSlotCoordinate,
} from '../utils/floatingCartState.ts';

/**
 * 1. CartContainerLayer — Renders the service-specific base container (empty plate, beverage-free kraft bag, or delivery box)
 */
export const CartContainerLayer: React.FC<{
  container: FloatingCartContainerLayers;
  sizePx: number;
}> = ({ container, sizePx }) => {
  return (
    <picture
      data-testid="floating-cart-container-base"
      style={{
        transform: `translateX(${container.containerOffsetXPct}%) scale(${container.containerScale})`,
      }}
      className="absolute inset-0 w-full h-full flex items-center justify-center z-10 transition-transform duration-200 ease-out"
    >
      <source srcSet={container.baseWebpSrc} type="image/webp" />
      <img
        src={container.basePngSrc}
        alt={container.alt}
        width={sizePx}
        height={sizePx}
        referrerPolicy="no-referrer"
        decoding="async"
        className="w-full h-full object-contain drop-shadow-[0_8px_14px_rgba(15,23,42,0.22)] transition-all duration-200"
      />
    </picture>
  );
};

/**
 * 2. DynamicFoodLayer — Renders up to 3 solid-food miniatures positioned inside the plate, open kraft bag, or open delivery box.
 * Never renders a duplicate +N counter.
 */
export const DynamicFoodLayer: React.FC<{
  mode: ResolvedFloatingCartComposition['mode'];
  visibleFoodItems: Array<CartProductVisual & { slot: VisualSlotCoordinate }>;
  scaleRatio: number;
}> = ({ mode, visibleFoodItems, scaleRatio }) => {
  if (visibleFoodItems.length === 0) return null;

  return (
    <div
      data-testid="floating-cart-dynamic-food-layer"
      className="absolute inset-0 w-full h-full z-20 pointer-events-none"
    >
      {visibleFoodItems.map((food) => {
        const itemDiameter = Math.round(food.slot.sizePx * scaleRatio);
        const isDinein = mode === 'dinein';

        return (
          <div
            key={food.menuItemId}
            data-testid={`cart-food-miniature-${food.menuItemId}`}
            data-food-name={food.name}
            data-visual-type={food.visualType}
            style={{
              left: `${food.slot.leftPct}%`,
              top: `${food.slot.topPct}%`,
              width: itemDiameter,
              height: isDinein ? Math.round(itemDiameter * 0.84) : itemDiameter,
              transform: `translate(-50%, -50%) rotate(${food.slot.rotateDeg}deg)`,
              zIndex: food.slot.zIndex,
            }}
            className="absolute rounded-full overflow-hidden shadow-[0_3px_6px_rgba(0,0,0,0.28)] ring-[1.5px] ring-white/95 bg-neutral-100 transition-all duration-200 ease-out"
          >
            <img
              src={food.imageUrl}
              alt={food.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              decoding="async"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.22)] pointer-events-none"
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * 3. ForegroundOcclusionLayer — Renders the front kraft bag wall or front cardboard delivery box wall in front of inserted solid food
 */
export const ForegroundOcclusionLayer: React.FC<{
  container: FloatingCartContainerLayers;
  sizePx: number;
}> = ({ container, sizePx }) => {
  if (
    container.state !== 'filled' ||
    !container.frontWallWebpSrc ||
    !container.frontWallPngSrc
  ) {
    return null;
  }

  return (
    <picture
      data-testid="floating-cart-front-wall"
      style={{
        transform: `translateX(${container.containerOffsetXPct}%) scale(${container.containerScale})`,
      }}
      className="absolute inset-0 w-full h-full flex items-center justify-center z-30 pointer-events-none transition-transform duration-200 ease-out"
    >
      <source srcSet={container.frontWallWebpSrc} type="image/webp" />
      <img
        src={container.frontWallPngSrc}
        alt=""
        aria-hidden="true"
        width={sizePx}
        height={sizePx}
        referrerPolicy="no-referrer"
        decoding="async"
        className="w-full h-full object-contain"
      />
    </picture>
  );
};

/**
 * 4. DynamicBeverageLayer — Renders upright 3D beverage miniatures (Coffee cup, Desi Chai glass, Kulhad Chai, Cold Drink bottle)
 * or fallback menu thumbnail beside the container when beverages are actually present in the cart.
 */
export const DynamicBeverageLayer: React.FC<{
  visibleBeverageItems: Array<CartProductVisual & { slot: VisualSlotCoordinate }>;
  scaleRatio: number;
}> = ({ visibleBeverageItems, scaleRatio }) => {
  if (visibleBeverageItems.length === 0) return null;

  return (
    <div
      data-testid="floating-cart-dynamic-beverage-layer"
      className="absolute inset-0 w-full h-full z-35 pointer-events-none"
    >
      {visibleBeverageItems.map((bev) => {
        const itemSize = Math.round(bev.slot.sizePx * scaleRatio);

        if (bev.is3DBeverageAsset) {
          return (
            <picture
              key={bev.menuItemId}
              data-testid={`cart-beverage-miniature-${bev.menuItemId}`}
              data-beverage-name={bev.name}
              data-visual-type={bev.visualType}
              style={{
                left: `${bev.slot.leftPct}%`,
                top: `${bev.slot.topPct}%`,
                width: itemSize,
                height: itemSize,
                transform: 'translate(-50%, -50%)',
                zIndex: bev.slot.zIndex,
              }}
              className="absolute flex items-center justify-center transition-all duration-200 ease-out"
            >
              <source srcSet={bev.imageUrl} type="image/webp" />
              <img
                src={bev.pngFallbackUrl}
                alt={bev.name}
                width={itemSize}
                height={itemSize}
                referrerPolicy="no-referrer"
                decoding="async"
                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(15,23,42,0.28)]"
              />
            </picture>
          );
        }

        // Fallback when a beverage has no dedicated 3D asset: render its actual menu image as an upright capsule thumbnail
        const thumbSize = Math.round(itemSize * 0.68);
        return (
          <div
            key={bev.menuItemId}
            data-testid={`cart-beverage-miniature-${bev.menuItemId}`}
            data-beverage-name={bev.name}
            data-visual-type={bev.visualType}
            style={{
              left: `${bev.slot.leftPct}%`,
              top: `${bev.slot.topPct}%`,
              width: thumbSize,
              height: thumbSize,
              transform: 'translate(-50%, -50%)',
              zIndex: bev.slot.zIndex,
            }}
            className="absolute rounded-full overflow-hidden shadow-[0_3px_6px_rgba(0,0,0,0.28)] ring-[1.5px] ring-white/95 bg-neutral-100 transition-all duration-200 ease-out"
          >
            <img
              src={bev.imageUrl}
              alt={bev.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              decoding="async"
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * 5. TotalQuantityBadge — The single visible numerical quantity indicator on the floating cart.
 */
export const TotalQuantityBadge: React.FC<{
  totalCartQuantity: number;
  badgeColorHex: string;
}> = ({ totalCartQuantity, badgeColorHex }) => {
  if (totalCartQuantity <= 0) return null;

  return (
    <span
      key={`badge-${totalCartQuantity}`}
      data-testid="floating-cart-badge"
      style={{ backgroundColor: badgeColorHex }}
      className="animate-badge-pop absolute top-1 right-1 z-40 min-w-[24px] h-[24px] px-1.5 rounded-full text-white text-[11.5px] font-extrabold flex items-center justify-center shadow-md ring-2 ring-white tabular-nums leading-none"
    >
      {totalCartQuantity}
    </span>
  );
};

/**
 * 6. FoodFlightAnimation — Renders the flying dish/beverage thumbnail arcing from FoodCard to its mode-specific landing slot
 */
export const FoodFlightAnimation: React.FC<{
  activeFlight: FlightPayload | null;
}> = ({ activeFlight }) => {
  if (!activeFlight) return null;

  return (
    <div
      key={activeFlight.id}
      data-testid="floating-cart-flight-item"
      data-is-beverage={activeFlight.is3DBeverage ? 'true' : 'false'}
      className="fixed z-50 pointer-events-none"
      style={{
        left: activeFlight.startX - 22,
        top: activeFlight.startY - 22,
        animation: 'camporaFlyToCart 480ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        ['--fly-x' as string]: `${activeFlight.targetX - activeFlight.startX}px`,
        ['--fly-y' as string]: `${activeFlight.targetY - activeFlight.startY}px`,
      }}
    >
      <img
        src={activeFlight.imageUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={
          activeFlight.is3DBeverage
            ? 'w-11 h-11 object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.32)]'
            : 'w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-lg'
        }
      />
    </div>
  );
};

/**
 * Complete Layered Container + Dynamic Food + Dynamic 3D Beverage Vessel
 */
export const DynamicFloatingCartVessel: React.FC<{
  composition: ResolvedFloatingCartComposition;
  sizePx?: number;
}> = ({ composition, sizePx = 88 }) => {
  const {
    mode,
    state,
    visibleFoodItems,
    visibleBeverageItems,
    totalVisibleMiniatures,
    container,
  } = composition;
  const scaleRatio = sizePx / 88;

  return (
    <div
      data-testid="floating-cart-vessel"
      data-service-mode={mode}
      data-vessel-state={state}
      data-visible-food-count={visibleFoodItems.length}
      data-visible-beverage-count={visibleBeverageItems.length}
      data-total-visible-miniatures={totalVisibleMiniatures}
      style={{ width: sizePx, height: sizePx }}
      className="relative flex items-center justify-center pointer-events-none select-none"
    >
      <CartContainerLayer container={container} sizePx={sizePx} />
      <DynamicFoodLayer
        mode={mode}
        visibleFoodItems={visibleFoodItems}
        scaleRatio={scaleRatio}
      />
      <ForegroundOcclusionLayer container={container} sizePx={sizePx} />
      <DynamicBeverageLayer
        visibleBeverageItems={visibleBeverageItems}
        scaleRatio={scaleRatio}
      />
    </div>
  );
};

export const FloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    pricing,
    serviceMode,
    activeFlight,
    clearActiveFlight,
    updateQuantity,
    clearCart,
  } = useCart();

  const [isReceivingPulse, setIsReceivingPulse] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [emptyHintToast, setEmptyHintToast] = useState<string | null>(null);
  const prevQtyRef = useRef<number>(pricing.totalItemCount);

  const composition = resolveFloatingCartComposition(
    serviceMode,
    items,
    activeFlight?.menuItemId ?? null
  );

  const settledComposition = resolveFloatingCartComposition(serviceMode, items, null);

  const { totalCartQuantity, container: activeContainer } = composition;
  const isFilled = composition.state === 'filled';

  // Preload container & 3D beverage assets once on mount
  useEffect(() => {
    const urls = getAllFloatingCartPreloadUrls();
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Clear active flight element after flight animation completes & trigger receive bounce on landing
  useEffect(() => {
    if (!activeFlight) return;
    const timer = setTimeout(() => {
      clearActiveFlight();
      setIsReceivingPulse(true);
    }, 480);
    return () => clearTimeout(timer);
  }, [activeFlight, clearActiveFlight]);

  // Trigger receive pulse if quantity increases without a flight animation (e.g., '+' button tap)
  useEffect(() => {
    if (totalCartQuantity > prevQtyRef.current && !activeFlight) {
      setIsReceivingPulse(true);
    }
    prevQtyRef.current = totalCartQuantity;
  }, [totalCartQuantity, activeFlight]);

  useEffect(() => {
    if (!isReceivingPulse) return;
    const t = setTimeout(() => setIsReceivingPulse(false), 420);
    return () => clearTimeout(t);
  }, [isReceivingPulse]);

  useEffect(() => {
    if (!emptyHintToast) return;
    const t = setTimeout(() => setEmptyHintToast(null), 2400);
    return () => clearTimeout(t);
  }, [emptyHintToast]);

  // Clean up any pending flight animation state when FloatingCart unmounts
  useEffect(() => {
    return () => {
      clearActiveFlight();
    };
  }, [clearActiveFlight]);

  // Accessible Dialog hook for drawer: Escape, focus trapping, and focus restoration
  const drawerDialogRef = useAccessibleDialog({
    isOpen: isDrawerOpen,
    onClose: () => setIsDrawerOpen(false),
  });

  const handleFloatingCartClick = () => {
    if (totalCartQuantity === 0) {
      setEmptyHintToast(activeContainer.emptySubtitle);
    } else {
      setIsDrawerOpen(true);
    }
  };

  const visibleSummaryNames = [
    ...settledComposition.visibleFoodItems.map((f) => f.name),
    ...settledComposition.visibleBeverageItems.map((b) => b.name),
  ].join(', ');

  return (
    <>
      <FoodFlightAnimation activeFlight={activeFlight} />

      {/* Subtle Empty-Cart Hint Toast when user taps an empty plate/bag/box */}
      {emptyHintToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[162px] left-0 right-0 z-40 px-4 pointer-events-none flex justify-center"
        >
          <div className="max-w-[360px] bg-[#191F2B]/95 text-white text-[12px] font-semibold px-3.5 py-2 rounded-full shadow-lg border border-white/10 backdrop-blur-xs">
            {emptyHintToast}
          </div>
        </div>
      )}

      {/* Floating Photorealistic Service Vessel anchored above BottomNavigation */}
      <div className="fixed bottom-[62px] left-0 right-0 z-30 pointer-events-none select-none">
        <div className="max-w-[430px] mx-auto w-full px-2.5 flex justify-end">
          <button
            id="canteen-floating-cart-target"
            type="button"
            onClick={handleFloatingCartClick}
            data-testid="floating-cart-button"
            data-service-mode={serviceMode}
            data-cart-state={composition.state}
            aria-label={
              isFilled
                ? `${activeContainer.modeTitle}: ${totalCartQuantity} ${
                    totalCartQuantity === 1 ? 'item' : 'items'
                  } (${visibleSummaryNames}), ₹${pricing.subtotal}. Tap to view cart`
                : `${activeContainer.modeTitle} is empty`
            }
            className={`pointer-events-auto relative group flex items-center justify-center w-[90px] h-[90px] bg-transparent transition-transform duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#136B3C] rounded-2xl ${
              isReceivingPulse ? 'animate-cart-receive' : ''
            }`}
          >
            <div className="transition-transform duration-200 ease-out group-hover:scale-[1.03]">
              <DynamicFloatingCartVessel composition={composition} sizePx={88} />
            </div>

            {/* Single Total Quantity Badge (never duplicated) */}
            <TotalQuantityBadge
              totalCartQuantity={totalCartQuantity}
              badgeColorHex={activeContainer.badgeColorHex}
            />
          </button>
        </div>
      </div>

      {/* Interactive Cart Quick-Sheet Drawer when filled Floating Cart is tapped */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            ref={drawerDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeContainer.modeTitle} summary`}
            className="w-full max-w-[430px] bg-white rounded-t-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-neutral-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />

            <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border border-neutral-100 shrink-0 overflow-hidden"
                  style={{ backgroundColor: activeContainer.auraColorRgba }}
                >
                  <DynamicFloatingCartVessel composition={settledComposition} sizePx={52} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-extrabold text-[#0F172A] tracking-tight">
                      {activeContainer.modeTitle}
                    </h2>
                    <span
                      style={{ backgroundColor: activeContainer.badgeColorHex }}
                      className="text-[10.5px] font-bold text-white px-2 py-0.5 rounded-full tabular-nums"
                    >
                      {totalCartQuantity} {totalCartQuantity === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <p className="text-[12px] text-neutral-500 font-medium capitalize">
                    Service Mode: {serviceMode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      setIsDrawerOpen(false);
                    }}
                    aria-label="Clear all items from cart"
                    className="p-2 rounded-full text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close cart drawer"
                  className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-3 overflow-y-auto space-y-3 flex-1">
              {items.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-700">{activeContainer.emptySubtitle}</p>
                </div>
              ) : (
                items.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-neutral-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-100"
                      />
                      <div className="min-w-0">
                        <h3 className="text-[13.5px] font-bold text-[#0F172A] truncate">
                          {item.name}
                        </h3>
                        <p className="text-[12px] font-semibold text-neutral-500 tabular-nums">
                          ₹{item.price} × {quantity} ={' '}
                          <span className="text-[#0F172A] font-extrabold">
                            ₹{item.price * quantity}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      style={{ backgroundColor: activeContainer.badgeColorHex }}
                      className="flex items-center text-white rounded-full px-2 py-1 gap-2 shrink-0 shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          updateQuantity(item.id, -1);
                          if (totalCartQuantity <= 1) {
                            setIsDrawerOpen(false);
                          }
                        }}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/15 active:scale-90 transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" strokeWidth={3} />
                      </button>
                      <span className="text-[12px] font-extrabold min-w-[14px] text-center tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/15 active:scale-90 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-5 pt-3 pb-5 bg-[#F8FAFC] border-t border-neutral-200/70 space-y-3">
                <div className="space-y-1 text-[12px]">
                  <div className="flex justify-between text-neutral-600">
                    <span>Item Subtotal</span>
                    <span className="font-semibold tabular-nums">₹{pricing.subtotal}</span>
                  </div>
                  {pricing.packagingCharge > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Packaging Charges</span>
                      <span className="font-semibold tabular-nums">₹{pricing.packagingCharge}</span>
                    </div>
                  )}
                  {pricing.deliveryFee > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Campus Delivery Fee</span>
                      <span className="font-semibold tabular-nums">₹{pricing.deliveryFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>GST (5%)</span>
                    <span className="font-semibold tabular-nums">₹{pricing.taxes}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-extrabold text-[#0F172A] pt-1.5 border-t border-neutral-200/80">
                    <span>Grand Total</span>
                    <span className="tabular-nums">₹{pricing.grandTotal}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/cart');
                  }}
                  style={{ backgroundColor: activeContainer.badgeColorHex }}
                  className="w-full py-3 px-4 rounded-2xl text-white font-extrabold text-[13px] flex items-center justify-between gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
                >
                  <span className="tabular-nums whitespace-nowrap">
                    {activeContainer.modeTitle} · ₹{pricing.grandTotal}
                  </span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>View Cart</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

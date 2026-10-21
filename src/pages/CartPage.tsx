import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  UtensilsCrossed,
  Receipt,
  ShieldCheck,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useCanteen } from '../context/CanteenContext.tsx';
import { formatINR } from '../utils/pricing.ts';
import { getServiceTheme } from '../utils/serviceTheme.ts';
import { getServiceModeLabel } from '../utils/serviceRules.ts';
import { ServiceIncompatibilityModal } from '../components/ServiceIncompatibilityModal.tsx';
import { useAccessibleDialog } from '../utils/useAccessibleDialog.ts';
import type { ServiceMode } from '../types/index.ts';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useCanteen();
  const {
    items,
    pricing,
    serviceMode,
    setServiceMode,
    updateQuantity,
    updateSpecialInstructions,
    removeItem,
    clearCart,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);

  const canteenName = config?.identity?.displayName || 'Open Canteen';
  const serviceTheme = getServiceTheme(serviceMode);
  const isCartEmpty = items.length === 0;

  const handleImageError = (itemId: string) => {
    setImgErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  // Accessible dialog hook for Clear Cart modal: Escape, focus trap, and focus restoration
  const clearDialogRef = useAccessibleDialog({
    isOpen: isClearModalOpen,
    onClose: () => setIsClearModalOpen(false),
  });

  // Accessible Escape key listener for cooking instructions note input
  React.useEffect(() => {
    if (!activeNoteItemId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveNoteItemId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNoteItemId]);

  const handleConfirmClear = () => {
    clearCart();
    setIsClearModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 pb-36 flex flex-col items-center select-none transition-colors duration-200">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8FAFC] flex flex-col relative shadow-sm">
        {/* ================================================================= */}
        {/* A. CART HEADER                                                    */}
        {/* ================================================================= */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Back to Menu"
              data-testid="cart-back-button"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 active:scale-95 text-neutral-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[16px] font-extrabold text-[#0F172A] leading-tight">
                  Cart
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-[#136B3C]" />
              </div>
              <p className="text-[11px] font-medium text-neutral-500 leading-none mt-0.5 truncate max-w-[210px]">
                {canteenName}
              </p>
            </div>
          </div>

          {!isCartEmpty && (
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              aria-label="Clear all items from cart"
              data-testid="clear-cart-button"
              className="text-[#E11D48] hover:bg-rose-50 active:scale-95 text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </header>

        {/* ================================================================= */}
        {/* EMPTY CART STATE                                                  */}
        {/* ================================================================= */}
        {isCartEmpty ? (
          <div
            data-testid="empty-cart-state"
            className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 shadow-inner">
                <ShoppingBag className="w-11 h-11 text-neutral-400 stroke-[1.6]" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#136B3C] text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight">
              Your cart is empty
            </h2>
            <p className="text-[13px] text-neutral-500 mt-1.5 max-w-[280px] leading-relaxed">
              Looks like you haven&apos;t added any items yet. Explore {canteenName}&apos;s fresh menu and pick your cravings!
            </p>

            <button
              type="button"
              onClick={() => navigate('/')}
              data-testid="browse-menu-btn"
              className="mt-6 px-6 py-3 bg-[#136B3C] hover:bg-[#0f5730] active:scale-95 text-white text-[13px] font-extrabold rounded-full shadow-[0_4px_14px_rgba(19,107,60,0.32)] transition flex items-center gap-2 cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Browse Menu</span>
            </button>
          </div>
        ) : (
          <main className="flex-1 flex flex-col gap-3.5 px-4 pt-3.5">
            {/* ============================================================= */}
            {/* B. SERVICE SELECTION (Compact 3-Way Selector)                 */}
            {/* ============================================================= */}
            <section
              aria-label="Service Mode Selection"
              className="bg-white p-1 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-1"
            >
              {(['dinein', 'takeaway', 'delivery'] as ServiceMode[]).map((mode) => {
                const isActive = serviceMode === mode;
                const label = getServiceModeLabel(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setServiceMode(mode)}
                    data-testid={`cart-service-tab-${mode}`}
                    aria-pressed={isActive}
                    className={`flex-1 py-2 px-2 rounded-xl text-[12px] font-extrabold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? mode === 'dinein'
                          ? 'bg-[#E9FBF1] text-[#0E6B39] border border-[#36B871]/40 shadow-xs'
                          : mode === 'takeaway'
                          ? 'bg-[#FEF3C7] text-[#9A4A12] border border-[#E29B61]/40 shadow-xs'
                          : 'bg-[#E0F2FE] text-[#0D528C] border border-[#5BA8E6]/40 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 border border-transparent'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? mode === 'dinein'
                            ? 'bg-[#0E6B39]'
                            : mode === 'takeaway'
                            ? 'bg-[#9A4A12]'
                            : 'bg-[#0D528C]'
                          : 'bg-neutral-300'
                      }`}
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </section>

            {/* ============================================================= */}
            {/* C. CART ITEMS LIST                                            */}
            {/* ============================================================= */}
            <section aria-label="Cart Items" className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[12.5px] font-extrabold text-[#0F172A] uppercase tracking-wide">
                  Order Items ({pricing.totalItemCount})
                </span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in cart
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map((cartItem) => {
                  const { item, quantity } = cartItem;
                  const hasImgError = imgErrors[item.id] || !item.imageUrl;
                  const lineTotal = item.price * quantity;
                  const isNoteOpen = activeNoteItemId === item.id;
                  const noteText = cartItem.specialInstructions || '';

                  return (
                    <article
                      key={item.id}
                      data-testid={`cart-item-${item.id}`}
                      className="bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-xs flex flex-col gap-2.5 transition hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        {/* Food Image Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100">
                          {!hasImgError && item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={() => handleImageError(item.id)}
                            />
                          ) : (
                            <div
                              role="img"
                              aria-label={`${item.name} placeholder`}
                              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200/70 text-neutral-400"
                            >
                              <UtensilsCrossed className="w-5 h-5 stroke-[1.8]" />
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-1.5">
                            {/* VEG / Non-VEG Marker */}
                            {(() => {
                              const isVeg = item.foodType === 'veg';
                              return (
                                <span
                                  aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                                  className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 mt-0.5 ${
                                    isVeg
                                      ? 'border-[#16A34A] text-[#16A34A]'
                                      : 'border-[#DC2626] text-[#DC2626]'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isVeg ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                                    }`}
                                  />
                                </span>
                              );
                            })()}

                            <h3 className="text-[13px] font-extrabold text-[#0F172A] leading-snug truncate">
                              {item.name}
                            </h3>
                          </div>

                          {/* Unit price & prep time */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] font-bold text-neutral-600 tabular-nums">
                              ₹{item.price}
                            </span>
                            {item.preparationTime && (
                              <div className="flex items-center gap-0.5 text-[10.5px] font-medium text-neutral-400">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{item.preparationTime}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Quantity Stepper & Line Total */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span
                            data-testid={`cart-item-linetotal-${item.id}`}
                            className="text-[13.5px] font-black text-[#0F172A] tabular-nums"
                          >
                            ₹{lineTotal}
                          </span>

                          <div
                            className={`flex items-center ${serviceTheme.addButtonBgClass} ${serviceTheme.addButtonTextClass} rounded-full px-1.5 py-0.5 gap-1 shadow-2xs`}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label={
                                quantity === 1
                                  ? `Remove ${item.name} from cart`
                                  : `Decrease quantity of ${item.name}`
                              }
                              data-testid={`cart-item-decrement-${item.id}`}
                              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition cursor-pointer"
                            >
                              {quantity === 1 ? (
                                <Trash2 className="w-3 h-3 text-rose-600" />
                              ) : (
                                <Minus className="w-3 h-3 stroke-[3]" />
                              )}
                            </button>

                            <span
                              data-testid={`cart-item-qty-${item.id}`}
                              className="text-[12px] font-black min-w-[14px] text-center tabular-nums"
                            >
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label={`Increase quantity of ${item.name}`}
                              data-testid={`cart-item-increment-${item.id}`}
                              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Item Actions Sub-row: Note Toggle & Delete */}
                      <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveNoteItemId((curr) =>
                              curr === item.id ? null : item.id
                            )
                          }
                          className="text-neutral-500 hover:text-neutral-800 transition flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3 text-neutral-400" />
                          <span>
                            {noteText ? 'Edit cooking note' : 'Add cooking note'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          data-testid={`cart-item-remove-${item.id}`}
                          className="text-neutral-400 hover:text-rose-600 transition flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Optional Cooking Note Input */}
                      {isNoteOpen && (
                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="e.g. Less spicy, no mayo, extra tissues..."
                            value={noteText}
                            onChange={(e) => updateSpecialInstructions(item.id, e.target.value)}
                            maxLength={100}
                            className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#136B3C] focus:bg-white transition"
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* ============================================================= */}
            {/* D. BILL DETAILS                                               */}
            {/* ============================================================= */}
            <section
              aria-label="Bill Details"
              data-testid="cart-bill-details"
              className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5"
            >
              <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                <Receipt className="w-4 h-4 text-neutral-600" />
                <h2 className="text-[13px] font-extrabold text-[#0F172A] uppercase tracking-wide">
                  Bill Details
                </h2>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center text-[12.5px] text-neutral-600">
                <span>Item Subtotal</span>
                <span
                  data-testid="bill-subtotal"
                  className="font-bold text-[#0F172A] tabular-nums"
                >
                  {formatINR(pricing.subtotal)}
                </span>
              </div>

              {/* Packaging Charges */}
              <div className="flex justify-between items-center text-[12.5px] text-neutral-600">
                <div className="flex items-center gap-1">
                  <span>
                    {serviceMode === 'dinein'
                      ? 'Dine-in Packaging'
                      : serviceMode === 'takeaway'
                      ? 'Takeaway Packaging'
                      : 'Delivery Packaging'}
                  </span>
                </div>
                {pricing.packagingCharge === 0 ? (
                  <span
                    data-testid="bill-packaging"
                    className="font-extrabold text-[#16A34A] text-xs bg-emerald-50 px-2 py-0.5 rounded-full"
                  >
                    FREE
                  </span>
                ) : (
                  <span
                    data-testid="bill-packaging"
                    className="font-bold text-[#0F172A] tabular-nums"
                  >
                    {formatINR(pricing.packagingCharge)}
                  </span>
                )}
              </div>

              {/* Delivery Fee (only when applicable) */}
              {serviceMode === 'delivery' && (
                <div className="flex justify-between items-center text-[12.5px] text-neutral-600">
                  <span>Campus Delivery Fee</span>
                  <span
                    data-testid="bill-delivery-fee"
                    className="font-bold text-[#0F172A] tabular-nums"
                  >
                    {formatINR(pricing.deliveryFee)}
                  </span>
                </div>
              )}

              {/* Taxes (5% GST) */}
              <div className="flex justify-between items-center text-[12.5px] text-neutral-600">
                <span>GST (5%)</span>
                <span
                  data-testid="bill-taxes"
                  className="font-bold text-[#0F172A] tabular-nums"
                >
                  {formatINR(pricing.taxes)}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-neutral-200/90 pt-2.5 mt-1 flex justify-between items-center">
                <div>
                  <span className="text-[14px] font-black text-[#0F172A]">
                    To Pay
                  </span>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Inclusive of all taxes & fees
                  </p>
                </div>
                <span
                  data-testid="bill-grand-total"
                  className="text-[17px] font-black text-[#0F172A] tabular-nums"
                >
                  {formatINR(pricing.grandTotal)}
                </span>
              </div>
            </section>

            {/* Hygiene & Cancellation Trust Note */}
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-3 flex items-center gap-2.5 text-[#166534]">
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#16A34A]" />
              <p className="text-[11.5px] font-medium leading-tight">
                Freshly prepared and safely packed. Real-time token slip issued after checkout.
              </p>
            </div>
          </main>
        )}

        {/* ================================================================= */}
        {/* E. STICKY BOTTOM CHECKOUT ACTION BAR                              */}
        {/* ================================================================= */}
        {!isCartEmpty && (
          <aside
            aria-label="Checkout Actions"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 pt-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          >
            <div className="w-full max-w-[430px] mx-auto flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Total Payable
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    data-testid="cart-footer-total"
                    className="text-[18px] font-black text-[#0F172A] tabular-nums leading-none"
                  >
                    {formatINR(pricing.grandTotal)}
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-500">
                    ({pricing.totalItemCount} {pricing.totalItemCount === 1 ? 'item' : 'items'})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                data-testid="proceed-to-checkout-btn"
                className="py-3 px-5 rounded-2xl bg-[#136B3C] hover:bg-[#0f5730] active:scale-[0.98] text-white font-extrabold text-[13.5px] shadow-[0_4px_14px_rgba(19,107,60,0.35)] transition flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </aside>
        )}

        {/* ================================================================= */}
        {/* CLEAR CART CONFIRMATION MODAL                                     */}
        {/* ================================================================= */}
        {isClearModalOpen && (
          <div
            ref={clearDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-cart-title"
            data-testid="clear-cart-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          >
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-neutral-100 flex flex-col gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>

              <div>
                <h3
                  id="clear-cart-title"
                  className="text-[16px] font-extrabold text-neutral-900 leading-tight"
                >
                  Clear your cart?
                </h3>
                <p className="text-[12.5px] text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to remove all {pricing.totalItemCount} {pricing.totalItemCount === 1 ? 'item' : 'items'} from your {canteenName} cart?
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(false)}
                  data-testid="cancel-clear-cart-btn"
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 active:scale-95 transition cursor-pointer"
                >
                  Keep Items
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  data-testid="confirm-clear-cart-btn"
                  className="flex-1 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#be123c] active:scale-95 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Change Incompatibility Modal */}
        <ServiceIncompatibilityModal />
      </div>
    </div>
  );
};

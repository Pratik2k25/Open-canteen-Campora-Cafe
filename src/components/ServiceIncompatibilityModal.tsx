import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { getServiceModeLabel } from '../utils/serviceRules.ts';
import { useAccessibleDialog } from '../utils/useAccessibleDialog.ts';
import type { CartItem } from '../types/index.ts';

const PREVIEW_INCOMPATIBLE_ITEMS: CartItem[] = [
  {
    item: {
      id: 'dark-chocolate-cake',
      name: 'Dark Chocolate Cake',
      description: 'Belgian chocolate cake',
      price: 90,
      categoryId: 'sweets',
      imageUrl: '/assets/menu/dark-chocolate-cake.png',
      foodType: 'veg',
      preparationTime: '15 mins',
      serviceAvailability: { dinein: true, takeaway: true, delivery: false },
      isAvailable: true,
    },
    quantity: 1,
  },
];

export const ServiceIncompatibilityModal: React.FC = () => {
  const { incompatibleModal, closeIncompatibleModal, confirmIncompatibleSwitch } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const isPreview =
    searchParams.get('incompatible') === '1' ||
    searchParams.get('incompatible') === 'true' ||
    searchParams.get('state') === 'incompatible';

  if (!incompatibleModal?.isOpen && !isPreview) return null;

  const targetMode = incompatibleModal?.targetMode ?? 'delivery';
  const targetLabel = getServiceModeLabel(targetMode);
  const displayItems = incompatibleModal?.incompatibleItems ?? PREVIEW_INCOMPATIBLE_ITEMS;

  const handleClose = React.useCallback(() => {
    if (isPreview) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('incompatible');
      nextParams.delete('state');
      setSearchParams(nextParams);
    }
    if (incompatibleModal?.isOpen) {
      closeIncompatibleModal();
    }
  }, [isPreview, searchParams, setSearchParams, incompatibleModal?.isOpen, closeIncompatibleModal]);

  // Accessible dialog hook for ServiceIncompatibilityModal: Escape, focus trap, and focus restoration
  const modalDialogRef = useAccessibleDialog({
    isOpen: Boolean(incompatibleModal?.isOpen || isPreview),
    onClose: handleClose,
  });

  const handleConfirm = () => {
    if (isPreview) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('incompatible');
      nextParams.delete('state');
      setSearchParams(nextParams);
    }
    if (incompatibleModal?.isOpen) {
      confirmIncompatibleSwitch();
    }
  };

  return (
    <div
      ref={modalDialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-change-title"
      data-testid="service-incompatibility-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-neutral-100 flex flex-col gap-4">
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="service-change-title"
              className="text-[15px] font-bold text-neutral-900 leading-tight"
            >
              Service Change Resolution
            </h3>
            <p className="text-[12px] text-neutral-500 mt-0.5">
              Switching to <span className="font-bold text-neutral-800">{targetLabel}</span>
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-[13px] text-neutral-600 leading-relaxed">
          Some items in your cart cannot be fulfilled under {targetLabel}:
        </p>

        {/* Incompatible items list */}
        <div className="bg-neutral-50 rounded-2xl p-2.5 max-h-40 overflow-y-auto divide-y divide-neutral-200/60">
          {displayItems.map((ci) => (
            <div key={ci.item.id} className="py-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800">{ci.item.name}</span>
              <span className="text-neutral-500 font-medium">Qty: {ci.quantity}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            data-testid="keep-current-service-btn"
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 active:scale-95 transition cursor-pointer"
          >
            Keep Current Service
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="remove-and-switch-btn"
            className="flex-1 py-2.5 rounded-xl bg-[#FF5C38] text-white font-bold text-xs hover:bg-[#ea4925] active:scale-95 transition shadow-xs cursor-pointer"
          >
            Remove & Switch
          </button>
        </div>
      </div>
    </div>
  );
};

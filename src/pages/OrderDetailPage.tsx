import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  RotateCcw,
  XCircle,
  Clock,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useCanteen } from '../context/CanteenContext.tsx';
import { mockMenuAdapter } from '../adapters/mockMenuAdapter.ts';
import { BottomNavigation } from '../components/BottomNavigation.tsx';
import { SkeletonShimmer } from '../components/skeleton/SkeletonShimmer.tsx';
import { useAccessibleDialog } from '../utils/useAccessibleDialog.ts';
import {
  getOrderStatusBadgeConfig,
  getServiceBadgeConfig,
  formatOrderDateTime,
} from '../utils/orderHistory.ts';

interface OrderDetailPageProps {
  hideBottomNav?: boolean;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ hideBottomNav = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, cancelOrder, loadingOrders } = useOrders();
  const { items: cartItems, addItem } = useCart();
  const { config } = useCanteen();
  const operatorId = config?.identity?.id || 'open-canteen';

  const order = id ? getOrderById(id) : undefined;

  // Modals & toast state
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Changed my mind');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Reorder prompt modal state
  const [reorderNotice, setReorderNotice] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Accessible dialog hooks: Escape, focus trap, and focus restoration
  const cancelDialogRef = useAccessibleDialog({
    isOpen: Boolean(showCancelModal && !cancelling),
    onClose: () => setShowCancelModal(false),
  });

  const reorderDialogRef = useAccessibleDialog({
    isOpen: Boolean(reorderNotice),
    onClose: () => setReorderNotice(null),
  });

  // Coherent loading state while async orders resolve from storage
  if (loadingOrders && !order) {
    return (
      <div
        data-testid="order-detail-loading"
        className="min-h-screen bg-[#F8F9FA] text-neutral-900 pb-28 flex flex-col items-center select-none"
      >
        <div className="w-full max-w-[430px] min-h-screen bg-[#F8F9FA] flex flex-col relative shadow-sm">
          {/* Header Skeleton */}
          <div className="px-4 py-3.5 bg-white border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-100 relative overflow-hidden">
                <SkeletonShimmer />
              </div>
              <div className="space-y-1.5">
                <div className="w-24 h-4 bg-neutral-200/80 rounded-md relative overflow-hidden">
                  <SkeletonShimmer />
                </div>
                <div className="w-32 h-3 bg-neutral-100 rounded-md relative overflow-hidden">
                  <SkeletonShimmer />
                </div>
              </div>
            </div>
            <div className="w-16 h-6 rounded-full bg-neutral-100 relative overflow-hidden">
              <SkeletonShimmer />
            </div>
          </div>

          <main className="p-4 flex flex-col gap-3.5">
            {/* Fulfillment Skeleton Card */}
            <div className="bg-white rounded-[18px] p-4 border border-neutral-100/90 space-y-3 relative overflow-hidden">
              <div className="w-28 h-4 bg-neutral-200/70 rounded-md relative overflow-hidden">
                <SkeletonShimmer />
              </div>
              <div className="w-full h-12 bg-neutral-100 rounded-xl relative overflow-hidden">
                <SkeletonShimmer />
              </div>
            </div>

            {/* Items Skeleton Card */}
            <div className="bg-white rounded-[18px] p-4 border border-neutral-100/90 space-y-3 relative overflow-hidden">
              <div className="w-32 h-4 bg-neutral-200/70 rounded-md relative overflow-hidden">
                <SkeletonShimmer />
              </div>
              <div className="space-y-2.5">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                    <div className="w-12 h-12 rounded-[10px] bg-neutral-100 relative overflow-hidden shrink-0">
                      <SkeletonShimmer />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="w-3/4 h-3.5 bg-neutral-200/80 rounded-md relative overflow-hidden">
                        <SkeletonShimmer />
                      </div>
                      <div className="w-1/3 h-3 bg-neutral-100 rounded-md relative overflow-hidden">
                        <SkeletonShimmer />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary Skeleton */}
            <div className="bg-white rounded-[18px] p-4 border border-neutral-100/90 space-y-2 relative overflow-hidden">
              <div className="w-24 h-4 bg-neutral-200/70 rounded-md relative overflow-hidden">
                <SkeletonShimmer />
              </div>
              <div className="w-full h-16 bg-neutral-50 rounded-xl relative overflow-hidden">
                <SkeletonShimmer />
              </div>
            </div>
          </main>
          {!hideBottomNav && <BottomNavigation />}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] text-neutral-900 pb-24 flex flex-col items-center">
        <div className="w-full max-w-[430px] min-h-screen bg-[#FCFCFC] flex flex-col">
          <div className="px-4 py-3.5 bg-white border-b border-neutral-100 flex items-center gap-3">
            <button
              onClick={() => navigate('/orders')}
              aria-label="Back to My Orders"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-800 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[16px] font-extrabold text-[#111827]">Order Details</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-[17px] font-extrabold text-[#111827]">Order Not Found</h2>
            <p className="text-[13px] text-[#64748B] mt-1">
              We couldn’t locate Order #{id} in this canteen's records.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 px-6 py-2.5 bg-[#08914D] text-white text-[13px] font-bold rounded-full shadow-xs cursor-pointer"
            >
              Back to My Orders
            </button>
          </div>
          {!hideBottomNav && <BottomNavigation />}
        </div>
      </div>
    );
  }

  const cleanOrderId = order.orderId.replace(/^#/, '');
  const statusConfig = getOrderStatusBadgeConfig(order.orderStatus);
  const serviceConfig = getServiceBadgeConfig(order.serviceMode);
  const { dateStr, timeStr } = formatOrderDateTime(order);
  const canCancel = ['placed', 'confirmed', 'preparing'].includes(order.orderStatus);
  const isTerminal = ['delivered', 'completed', 'cancelled'].includes(order.orderStatus);

  // Cancellation Execution
  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrder(order.orderId, cancelReason);
      setShowCancelModal(false);
      showToast(`Order #${cleanOrderId} has been cancelled`);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  // Safe Reorder with catalog availability and cart compatibility checks
  const handleReorderClick = async () => {
    try {
      const catalog = await mockMenuAdapter.getCatalog(operatorId);
      const allCatalogItems = catalog.items || [];

      // Check which items exist in active catalog and are available
      const availableItems = order.items.filter((ci) => {
        const found = allCatalogItems.find((item) => item.id === ci.item.id);
        return found && found.isAvailable !== false;
      });

      if (availableItems.length === 0) {
        setReorderNotice({
          isOpen: true,
          title: 'Items Unavailable',
          message:
            'None of the items from this past order are currently available in the active menu.',
          confirmLabel: 'Explore Menu',
          onConfirm: () => {
            setReorderNotice(null);
            navigate('/');
          },
        });
        return;
      }

      const executeReorder = () => {
        availableItems.forEach((ci) => {
          for (let i = 0; i < ci.quantity; i++) {
            addItem(ci.item);
          }
        });
        setReorderNotice(null);
        showToast(`Added ${availableItems.length} item(s) to your cart`);
        navigate('/cart');
      };

      if (availableItems.length < order.items.length) {
        setReorderNotice({
          isOpen: true,
          title: 'Partial Availability',
          message: `Some items from this past order are currently unavailable. Would you like to add the ${availableItems.length} available item(s) to your cart?`,
          confirmLabel: 'Add Available Items',
          onConfirm: executeReorder,
        });
        return;
      }

      if (cartItems.length > 0) {
        setReorderNotice({
          isOpen: true,
          title: 'Add to Existing Cart?',
          message: `Your cart already contains ${cartItems.length} item(s). Add these items to your existing cart?`,
          confirmLabel: 'Add to Cart',
          onConfirm: executeReorder,
        });
        return;
      }

      // If cart is empty and all items available, add directly
      executeReorder();
    } catch {
      showToast('Unable to check catalog availability');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 pb-28 flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8F9FA] flex flex-col relative shadow-sm">
        {/* Sticky Header */}
        <header className="px-4 py-3.5 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/orders')}
              aria-label="Back to My Orders"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 text-[#111827] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[16px] font-extrabold text-[#111827] leading-tight">
                Order #{cleanOrderId}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B] mt-0.5">
                <Calendar className="w-3 h-3 text-[#94A3B8]" />
                <span>{dateStr}</span>
                <span className="text-neutral-300">|</span>
                <span>{timeStr}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            style={{ backgroundColor: statusConfig.bgHex, color: statusConfig.textHex }}
            className="px-3 py-1 rounded-full text-[11.5px] font-bold flex items-center gap-1"
          >
            {statusConfig.iconType === 'clock' && <Clock className="w-3 h-3" strokeWidth={2.4} />}
            {statusConfig.iconType === 'check-circle' && (
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.4} />
            )}
            {statusConfig.iconType === 'x-circle' && (
              <XCircle className="w-3 h-3" strokeWidth={2.4} />
            )}
            <span>{statusConfig.label}</span>
          </span>
        </header>

        {/* Status Toast */}
        {statusToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#111827] text-white text-[12.5px] font-semibold px-4 py-2 rounded-full shadow-lg transition-all animate-fade-in flex items-center gap-2">
            <Info className="w-4 h-4 text-[#19B559]" />
            <span>{statusToast}</span>
          </div>
        )}

        <main className="p-4 flex flex-col gap-3.5">
          {/* 1. FULFILLMENT & SERVICE INFO CARD */}
          <section className="bg-white rounded-[18px] p-4 border border-neutral-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: serviceConfig.bgHex, color: serviceConfig.textHex }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"
                >
                  {serviceConfig.mode === 'dinein' && <UtensilsCrossed className="w-3 h-3" />}
                  {serviceConfig.mode === 'takeaway' && <ShoppingBag className="w-3 h-3" />}
                  {serviceConfig.mode === 'delivery' && <Bike className="w-3 h-3" />}
                  <span>{serviceConfig.label}</span>
                </span>
                <span className="text-[12.5px] font-semibold text-[#64748B]">Fulfillment</span>
              </div>
              <span className="text-[11.5px] font-medium text-[#94A3B8]">
                {order.serviceMode === 'dinein'
                  ? 'Counter / Table Service'
                  : order.serviceMode === 'takeaway'
                  ? 'Pickup Counter'
                  : 'Campus Hostel Delivery'}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-[12.5px]">
              {order.serviceMode === 'dinein' && (
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Table Number</span>
                  <span className="font-extrabold text-[#111827] bg-[#E5F9EE] text-[#0D8A47] px-2.5 py-0.5 rounded-md">
                    {order.pickupOrDeliveryDetails?.tableNumber
                      ? `Table #${order.pickupOrDeliveryDetails.tableNumber}`
                      : 'Assigned on arrival'}
                  </span>
                </div>
              )}

              {order.serviceMode === 'takeaway' && (
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Pickup Station</span>
                  <span className="font-bold text-[#111827]">
                    {order.pickupOrDeliveryDetails?.pickupTimeEstimate || 'Express Pickup Desk'}
                  </span>
                </div>
              )}

              {order.serviceMode === 'delivery' && (
                <>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[#64748B] shrink-0 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                      Address
                    </span>
                    <span className="font-bold text-[#111827] text-right">
                      {order.pickupOrDeliveryDetails?.deliveryAddress || 'Hostel Delivery Address'}
                    </span>
                  </div>
                  {order.pickupOrDeliveryDetails?.contactNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Phone</span>
                      <span className="font-semibold text-[#111827]">
                        {order.pickupOrDeliveryDetails.contactNumber}
                      </span>
                    </div>
                  )}
                </>
              )}

              {order.pickupOrDeliveryDetails?.notes &&
                !order.pickupOrDeliveryDetails.notes.startsWith('Cancelled:') && (
                <div className="mt-1 pt-2 border-t border-neutral-100 flex justify-between items-start gap-2">
                  <span className="text-[#64748B] shrink-0">Special Notes:</span>
                  <span className="font-medium text-[#475569] text-right italic">
                    "{order.pickupOrDeliveryDetails.notes}"
                  </span>
                </div>
              )}

              {order.orderStatus === 'cancelled' && (
                <div className="mt-1 pt-2 border-t border-rose-100 flex justify-between items-start gap-2 bg-rose-50/70 p-2.5 rounded-xl">
                  <span className="text-[#D92D20] font-bold shrink-0">Cancellation Reason:</span>
                  <span className="font-semibold text-[#991B1B] text-right">
                    {order.cancellationReason ||
                      (order.pickupOrDeliveryDetails?.notes?.includes('Cancelled:')
                        ? order.pickupOrDeliveryDetails.notes.split('Cancelled:')[1]?.trim()
                        : 'Cancelled by customer')}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 2. ORDERED ITEMS BREAKDOWN */}
          <section className="bg-white rounded-[18px] p-4 border border-neutral-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h2 className="text-[14px] font-extrabold text-[#111827] mb-3">
              Items Ordered ({order.items.reduce((sum, ci) => sum + ci.quantity, 0)})
            </h2>

            <div className="flex flex-col divide-y divide-neutral-100">
              {order.items.map((ci, idx) => (
                <div key={`${ci.item.id}-${idx}`} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={ci.item.imageUrl || order.thumbnailUrl || '/assets/orders/thumb-jalebi.png'}
                      alt={ci.item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-[10px] object-cover shrink-0 bg-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#111827] truncate">
                          {ci.item.name}
                        </span>
                        <span className="text-[13px] font-extrabold text-[#111827]">
                          ₹{ci.item.price * ci.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-0.5">
                        <span>
                          Qty: <strong className="text-[#111827]">{ci.quantity}</strong> × ₹
                          {ci.item.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Per-item Cooking Instructions */}
                  {ci.specialInstructions && ci.specialInstructions.trim() && (
                    <div className="mt-2 ml-15 bg-[#FFFBEB] text-[#92400E] text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#FDE68A] flex items-center gap-1.5">
                      <span className="font-bold">Chef Note:</span>
                      <span className="truncate">{ci.specialInstructions}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. PAYMENT STATUS REPRESENTATION */}
          <section className="bg-white rounded-[18px] p-4 border border-neutral-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h2 className="text-[14px] font-extrabold text-[#111827] mb-2.5">Payment Details</h2>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[12.5px] text-[#64748B]">Method</span>
              <span className="text-[12.5px] font-bold text-[#111827]">
                {order.paymentMethod || 'Demo Payment'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[12.5px] text-[#64748B]">Status</span>
              {order.paymentStatus === 'simulated' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  Simulated Demo
                </span>
              ) : order.paymentStatus === 'pending' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0E0] text-[#E06500] border border-[#FED7AA]">
                  Pending Collection
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5F9EE] text-[#0D8A47] border border-[#BBF7D0]">
                  Completed
                </span>
              )}
            </div>

            <div className="mt-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-neutral-200/70 text-[11px] text-[#64748B] flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#0369A1] shrink-0 mt-0.5" />
              <span>
                {order.paymentStatus === 'pending'
                  ? 'Payment will be collected at counter desk or upon campus delivery.'
                  : 'Demonstration session · No live banking rails or real funds were charged.'}
              </span>
            </div>
          </section>

          {/* 4. BILL SUMMARY BREAKDOWN */}
          <section className="bg-white rounded-[18px] p-4 border border-neutral-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h2 className="text-[14px] font-extrabold text-[#111827] mb-3">Bill Summary</h2>
            <div className="flex flex-col gap-2 text-[12.5px] text-[#475569]">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-[#111827]">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST</span>
                <span className="font-semibold text-[#111827]">₹{order.taxes}</span>
              </div>
              {order.applicableCharges > 0 && (
                <div className="flex justify-between">
                  <span>Service / Packaging Charges</span>
                  <span className="font-semibold text-[#111827]">₹{order.applicableCharges}</span>
                </div>
              )}
              <div className="border-t border-neutral-100 pt-2.5 mt-1 flex justify-between text-[14.5px] font-extrabold text-[#111827]">
                <span>Grand Total</span>
                <span>₹{order.grandTotal}</span>
              </div>
            </div>
          </section>

          {/* 5. ACTION BUTTONS */}
          <div className="flex flex-col gap-2.5 mt-1">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReorderClick}
                className="flex-1 bg-[#08914D] hover:bg-[#067A40] active:scale-[0.98] text-white font-bold text-[13.5px] py-3 rounded-full flex items-center justify-center gap-2 shadow-[0_3px_12px_rgba(8,145,77,0.22)] cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reorder Items</span>
              </button>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 bg-[#FEECEB] hover:bg-[#FDD8D6] active:scale-[0.98] text-[#D92D20] font-bold text-[13.5px] py-3 rounded-full flex items-center justify-center gap-2 border border-[#FCA5A5]/40 cursor-pointer transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>

            {isTerminal && (
              <p className="text-center text-[11.5px] text-[#94A3B8] font-medium">
                {order.orderStatus === 'cancelled'
                  ? 'This order was cancelled and cannot be modified.'
                  : 'This order is completed and archived.'}
              </p>
            )}
          </div>
        </main>

        {!hideBottomNav && <BottomNavigation />}

        {/* 6. CANCELLATION CONFIRMATION MODAL */}
        {showCancelModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            onClick={() => !cancelling && setShowCancelModal(false)}
          >
            <div
              ref={cancelDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-modal-title"
              className="bg-white rounded-[22px] p-5 w-full max-w-[360px] shadow-2xl flex flex-col gap-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-[#FEECEB] text-[#D92D20] flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 id="cancel-modal-title" className="text-[16px] font-extrabold text-[#111827]">
                  Cancel Order #{cleanOrderId}?
                </h3>
                <p className="text-[12.5px] text-[#64748B] mt-1">
                  Are you sure you want to cancel this order? This action cannot be reversed.
                </p>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#475569] mb-1.5">
                  Reason for cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-[12.5px] font-medium rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-[#08914D]"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Wrong fulfillment details">Wrong fulfillment details</option>
                  <option value="Taking longer than expected">Taking longer than expected</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-[#475569] text-[13px] font-bold hover:bg-neutral-200 cursor-pointer transition-colors"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 rounded-xl bg-[#D92D20] text-white text-[13px] font-bold hover:bg-[#B91C1C] cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. REORDER NOTICE / COMPATIBILITY MODAL */}
        {reorderNotice && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setReorderNotice(null)}
          >
            <div
              ref={reorderDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="reorder-modal-title"
              className="bg-white rounded-[22px] p-5 w-full max-w-[360px] shadow-2xl flex flex-col gap-3.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-[#E5F9EE] text-[#0D8A47] flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 id="reorder-modal-title" className="text-[16px] font-extrabold text-[#111827]">{reorderNotice.title}</h3>
                <p className="text-[12.5px] text-[#64748B] mt-1">{reorderNotice.message}</p>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setReorderNotice(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-[#475569] text-[13px] font-bold hover:bg-neutral-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={reorderNotice.onConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-[#08914D] text-white text-[13px] font-bold hover:bg-[#067A40] cursor-pointer shadow-xs transition-colors"
                >
                  {reorderNotice.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

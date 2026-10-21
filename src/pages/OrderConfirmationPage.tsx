import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Receipt,
  ShieldCheck,
  CreditCard,
  Building,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Home,
  AlertCircle,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext.tsx';
import { useCanteen } from '../context/CanteenContext.tsx';
import { formatINR } from '../utils/pricing.ts';
import { getServiceBadgeConfig, getOrderStatusBadgeConfig } from '../utils/orderHistory.ts';
import { getServiceModeLabel } from '../utils/serviceRules.ts';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { config } = useCanteen();
  const { getOrderById } = useOrders();

  const canteenName = config?.identity?.displayName || 'Campora Café';
  const displayLocation = config?.location?.displayLocation || 'Campus Cafeteria';

  const order = id ? getOrderById(id) : undefined;

  // Handle missing or invalid order
  if (!order) {
    return (
      <div
        data-testid="order-not-found"
        className="min-h-screen bg-[#F8FAFC] text-neutral-900 pb-28 flex flex-col items-center justify-center p-6 text-center select-none"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-[18px] font-extrabold text-[#0F172A]">
          Order Not Found
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1 max-w-[280px] leading-relaxed">
          We couldn&apos;t retrieve details for order #{id ? id.replace(/^#/, '') : 'unknown'}. It may have been placed in a different session or canteen.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50 transition cursor-pointer"
          >
            Go to My Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-[#136B3C] text-white text-xs font-bold rounded-xl hover:bg-[#0f5730] transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const cleanOrderId = order.orderId.replace(/^#/, '');
  const serviceBadge = getServiceBadgeConfig(order.serviceMode);
  const statusBadge = getOrderStatusBadgeConfig(order.orderStatus);

  return (
    <div
      data-testid="order-confirmation-page"
      className="min-h-screen bg-[#F8FAFC] text-neutral-900 pb-28 flex flex-col items-center select-none"
    >
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8FAFC] flex flex-col relative shadow-sm">
        {/* ================================================================= */}
        {/* A. SUCCESS CELEBRATION HEADER                                     */}
        {/* ================================================================= */}
        <section
          aria-label="Order Success Banner"
          className="bg-white border-b border-neutral-200/80 px-4 pt-8 pb-6 flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-12 w-48 h-48 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

          {/* Green Checkmark Circle */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-[#E9FBF1] text-[#136B3C] border-2 border-[#36B871]/40 flex items-center justify-center shadow-[0_4px_16px_rgba(19,107,60,0.18)]">
              <CheckCircle2 className="w-10 h-10 text-[#136B3C] stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F05360] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="text-[11px] font-black text-[#136B3C] uppercase tracking-wider bg-[#E9FBF1] px-2.5 py-0.5 rounded-full border border-[#36B871]/30">
            Order Confirmed (Demo)
          </span>

          <h1 className="text-[20px] font-black text-[#0F172A] tracking-tight mt-2">
            Order #{cleanOrderId}
          </h1>

          <p className="text-[12px] font-medium text-neutral-500 mt-0.5">
            Placed at {canteenName} • {order.displayTime || 'Just now'}
          </p>

          {/* Order Status Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span
              style={{ backgroundColor: statusBadge.bgHex, color: statusBadge.textHex }}
              className="text-[11.5px] font-extrabold px-3 py-1 rounded-full shadow-2xs capitalize"
            >
              Status: {order.orderStatus}
            </span>
            <span
              style={{ backgroundColor: serviceBadge.bgHex, color: serviceBadge.textHex }}
              className="text-[11.5px] font-extrabold px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5"
            >
              {order.serviceMode === 'dinein' ? (
                <UtensilsCrossed className="w-3 h-3" />
              ) : order.serviceMode === 'takeaway' ? (
                <ShoppingBag className="w-3 h-3" />
              ) : (
                <Truck className="w-3 h-3" />
              )}
              <span>{getServiceModeLabel(order.serviceMode)}</span>
            </span>
          </div>
        </section>

        {/* ================================================================= */}
        {/* MAIN RECEIPT BODY                                                 */}
        {/* ================================================================= */}
        <main className="flex-1 flex flex-col gap-3.5 px-4 pt-4">
          {/* Evaluation Notice */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900 text-[11.5px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Prototype Demonstration:</span> This order is a simulated mock record for Stage 1 evaluation. No live food preparation will occur.
            </div>
          </div>

          {/* B. SERVICE & FULFILLMENT DETAILS */}
          <section
            aria-label="Fulfillment Details"
            className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5"
          >
            <h2 className="text-[12.5px] font-extrabold text-[#0F172A] uppercase tracking-wide pb-1.5 border-b border-neutral-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-600" />
              <span>Fulfillment Information</span>
            </h2>

            <div className="space-y-2 text-[12.5px]">
              <div className="flex justify-between items-start">
                <span className="text-neutral-500 font-medium">Canteen:</span>
                <span className="font-bold text-[#0F172A] text-right">
                  {canteenName}
                </span>
              </div>

              {/* Customer Name */}
              <div className="flex justify-between items-start">
                <span className="text-neutral-500 font-medium">Customer:</span>
                <span className="font-bold text-[#0F172A] text-right">
                  {order.userDisplayName || 'Customer'}
                </span>
              </div>

              {/* Contact Phone */}
              {order.pickupOrDeliveryDetails?.contactNumber && (
                <div className="flex justify-between items-start">
                  <span className="text-neutral-500 font-medium">Contact Phone:</span>
                  <span className="font-bold text-[#0F172A] tabular-nums">
                    {order.pickupOrDeliveryDetails.contactNumber}
                  </span>
                </div>
              )}

              {/* Dine-in Specific Details */}
              {order.serviceMode === 'dinein' && (
                <div className="flex justify-between items-start">
                  <span className="text-neutral-500 font-medium">Table / Seating:</span>
                  <span className="font-bold text-[#0F172A]">
                    {order.pickupOrDeliveryDetails?.tableNumber || 'Token-only Seating'}
                  </span>
                </div>
              )}

              {/* Takeaway Specific Details */}
              {order.serviceMode === 'takeaway' && (
                <div className="flex justify-between items-start">
                  <span className="text-neutral-500 font-medium">Pickup Counter:</span>
                  <span className="font-bold text-[#0F172A] text-right max-w-[220px]">
                    {order.pickupOrDeliveryDetails?.pickupTimeEstimate || displayLocation}
                  </span>
                </div>
              )}

              {/* Delivery Specific Details */}
              {order.serviceMode === 'delivery' && (
                <div className="flex justify-between items-start">
                  <span className="text-neutral-500 font-medium">Delivery Address:</span>
                  <span className="font-bold text-[#0F172A] text-right max-w-[220px]">
                    {order.pickupOrDeliveryDetails?.deliveryAddress || displayLocation}
                  </span>
                </div>
              )}

              {/* Order Notes */}
              {order.pickupOrDeliveryDetails?.notes && (
                <div className="pt-1.5 border-t border-neutral-100 flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-neutral-500">Customer Note:</span>
                  <p className="text-[12px] italic text-neutral-700 bg-neutral-50 p-2 rounded-lg">
                    &ldquo;{order.pickupOrDeliveryDetails.notes}&rdquo;
                  </p>
                </div>
              )}

              {/* Payment Settlement Status */}
              <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[12px]">
                <span className="text-neutral-500 font-medium">Payment State:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#0F172A]">{order.paymentMethod}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      order.paymentStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : order.paymentStatus === 'simulated'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {order.paymentStatus === 'pending'
                      ? 'Payment Pending'
                      : order.paymentStatus === 'simulated'
                      ? 'Simulated (Demo)'
                      : 'Settled'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* C. ORDERED ITEMS RECEIPT */}
          <section
            aria-label="Ordered Items"
            className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
              <h2 className="text-[12.5px] font-extrabold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-neutral-600" />
                <span>Ordered Items</span>
              </h2>
              <span className="text-[11px] font-bold text-neutral-400">
                {order.items.length} {order.items.length === 1 ? 'line item' : 'line items'}
              </span>
            </div>

            <div className="divide-y divide-neutral-100">
              {order.items.map((ci) => {
                const { item, quantity, specialInstructions } = ci;
                const lineTotal = item.price * quantity;
                const isVeg = item.foodType === 'veg';

                return (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span
                          aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
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
                        <div>
                          <p className="text-[13px] font-extrabold text-[#0F172A]">
                            {item.name}
                          </p>
                          <p className="text-[11.5px] text-neutral-500">
                            ₹{item.price} × {quantity}
                          </p>
                        </div>
                      </div>

                      <span className="text-[13px] font-black text-[#0F172A] tabular-nums">
                        ₹{lineTotal}
                      </span>
                    </div>

                    {specialInstructions && (
                      <div className="mt-1.5 ml-5 bg-amber-50/70 border border-amber-200/60 rounded-lg px-2 py-0.5 text-[11px] text-amber-900 flex items-center gap-1">
                        <span className="font-bold text-amber-700">Kitchen note:</span>
                        <span className="italic truncate">&ldquo;{specialInstructions}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bill Summary */}
            <div className="pt-2.5 border-t border-neutral-100 space-y-1.5 text-[12px] text-neutral-600">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  {formatINR(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Packaging Fee</span>
                {order.priceSnapshot?.packagingCharge === 0 ? (
                  <span className="font-bold text-[#16A34A] text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    FREE
                  </span>
                ) : (
                  <span className="font-bold text-[#0F172A] tabular-nums">
                    {formatINR(order.priceSnapshot?.packagingCharge || 0)}
                  </span>
                )}
              </div>

              {order.serviceMode === 'delivery' && (
                <div className="flex justify-between items-center">
                  <span>Campus Delivery Fee</span>
                  <span className="font-bold text-[#0F172A] tabular-nums">
                    {formatINR(order.priceSnapshot?.deliveryFee || 0)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>GST (5%)</span>
                <span className="font-bold text-[#0F172A] tabular-nums">
                  {formatINR(order.taxes)}
                </span>
              </div>

              <div className="border-t border-dashed border-neutral-200 pt-2 mt-1 flex justify-between items-center">
                <div>
                  <span className="text-[13.5px] font-black text-[#0F172A]">
                    {order.paymentStatus === 'pending' ? 'Amount to Pay' : 'Order Total (Demo)'}
                  </span>
                  <p className="text-[10.5px] text-neutral-500">
                    {order.paymentMethod}
                    <span className="block text-[10px] text-neutral-400">
                      {order.paymentStatus === 'pending'
                        ? 'Payment Pending: Collect at counter / on delivery'
                        : 'Simulated Demo: No bank deduction occurred'}
                    </span>
                  </p>
                </div>
                <span className="text-[16.5px] font-black text-[#0F172A] tabular-nums">
                  {formatINR(order.grandTotal)}
                </span>
              </div>
            </div>
          </section>

          {/* D. ACTION BUTTONS */}
          <div className="pt-2 pb-6 space-y-2.5">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              data-testid="confirmation-view-orders-btn"
              className="w-full py-3.5 bg-[#136B3C] hover:bg-[#0f5730] active:scale-[0.98] text-white font-extrabold text-[13.5px] rounded-2xl shadow-[0_4px_14px_rgba(19,107,60,0.32)] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View in Order History</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              data-testid="confirmation-home-btn"
              className="w-full py-3 bg-white hover:bg-neutral-50 active:scale-[0.98] border border-neutral-200 text-neutral-800 font-extrabold text-[13px] rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-neutral-500" />
              <span>Back to Menu</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

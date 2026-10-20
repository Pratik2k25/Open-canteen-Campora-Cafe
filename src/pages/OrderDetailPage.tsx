import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, RotateCcw, XCircle } from 'lucide-react';
import { useOrders } from '../context/OrderContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { BottomNavigation } from '../components/BottomNavigation.tsx';
import {
  getOrderStatusBadgeConfig,
  getServiceBadgeConfig,
  formatOrderDateTime,
  formatOrderItemsSummary,
} from '../utils/orderHistory.ts';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, cancelOrder } = useOrders();
  const { addItem } = useCart();

  const order = id ? getOrderById(id) : undefined;

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
            <h2 className="text-[17px] font-extrabold text-[#111827]">Order Not Found</h2>
            <p className="text-[13px] text-[#64748B] mt-1">
              We couldn’t find Order #{id}.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 px-6 py-2.5 bg-[#08914D] text-white text-[13px] font-bold rounded-full cursor-pointer"
            >
              Back to My Orders
            </button>
          </div>
          <BottomNavigation />
        </div>
      </div>
    );
  }

  const statusConfig = getOrderStatusBadgeConfig(order.orderStatus);
  const serviceConfig = getServiceBadgeConfig(order.serviceMode);
  const { dateStr, timeStr } = formatOrderDateTime(order);
  const canCancel = ['placed', 'confirmed', 'preparing'].includes(order.orderStatus);

  const handleReorder = () => {
    order.items.forEach((ci) => {
      for (let i = 0; i < ci.quantity; i++) {
        addItem(ci.item);
      }
    });
    navigate('/');
  };

  const handleCancelOrder = async () => {
    await cancelOrder(order.orderId);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-neutral-900 pb-28 flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#FCFCFC] flex flex-col relative shadow-sm">
        {/* Top Bar */}
        <header className="px-4 py-3.5 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/orders')}
              aria-label="Back to My Orders"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 text-[#111827] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[16px] font-extrabold text-[#111827]">
                Order #{order.orderId.replace(/^#/, '')}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
                <Calendar className="w-3 h-3 text-[#94A3B8]" />
                <span>{dateStr}</span>
                <span>|</span>
                <span>{timeStr}</span>
              </div>
            </div>
          </div>

          <span
            style={{ backgroundColor: statusConfig.bgHex, color: statusConfig.textHex }}
            className="px-3 py-1 rounded-full text-[11.5px] font-bold"
          >
            {statusConfig.label}
          </span>
        </header>

        {/* Order Card Summary */}
        <main className="p-4 flex flex-col gap-3.5">
          <div className="bg-white rounded-[16px] p-4 border border-neutral-100 shadow-xs">
            <div className="flex items-center gap-3.5">
              <img
                src={order.thumbnailUrl || order.items[0]?.item.imageUrl || '/assets/orders/thumb-jalebi.png'}
                alt={`Order #${order.orderId}`}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-[14px] object-cover shrink-0 bg-neutral-100"
              />
              <div className="flex-1 min-w-0">
                <span
                  style={{ backgroundColor: serviceConfig.bgHex, color: serviceConfig.textHex }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block"
                >
                  {serviceConfig.label}
                </span>
                <p className="text-[13.5px] font-bold text-[#111827] mt-1.5">
                  {formatOrderItemsSummary(order.items, order.itemsSummary)}
                </p>
                <p className="text-[12px] text-[#64748B] mt-0.5">
                  Payment: {order.paymentMethod} ({order.paymentStatus})
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Bill Breakdown */}
          <div className="bg-white rounded-[16px] p-4 border border-neutral-100 shadow-xs">
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
              <div className="border-t border-neutral-100 pt-2.5 mt-1 flex justify-between text-[14px] font-extrabold text-[#111827]">
                <span>Grand Total</span>
                <span>₹{order.grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleReorder}
              className="flex-1 bg-[#08914D] hover:bg-[#067A40] text-white font-bold text-[13.5px] py-3 rounded-full flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reorder Items</span>
            </button>

            {canCancel && (
              <button
                onClick={handleCancelOrder}
                className="flex-1 bg-[#FEECEB] hover:bg-[#FDD8D6] text-[#D92D20] font-bold text-[13.5px] py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};

import React from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import type { Order } from '../types/index.ts';
import {
  getOrderStatusBadgeConfig,
  getServiceBadgeConfig,
  formatOrderItemsSummary,
  formatOrderDateTime,
} from '../utils/orderHistory.ts';

interface OrderCardProps {
  order: Order;
  onSelectOrder: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onSelectOrder }) => {
  const statusConfig = getOrderStatusBadgeConfig(order.orderStatus);
  const serviceConfig = getServiceBadgeConfig(order.serviceMode);
  const itemsText = formatOrderItemsSummary(order.items, order.itemsSummary);
  const { dateStr, timeStr } = formatOrderDateTime(order);
  const cleanOrderId = order.orderId.replace(/^#/, '');
  const thumbnailSrc =
    order.thumbnailUrl || order.items[0]?.item.imageUrl || '/assets/orders/thumb-jalebi.png';

  return (
    <article
      onClick={() => onSelectOrder(cleanOrderId)}
      role="button"
      tabIndex={0}
      aria-label={`Order #${cleanOrderId}, ${statusConfig.label}, Total ₹${order.grandTotal}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectOrder(cleanOrderId);
        }
      }}
      className="bg-white rounded-[15px] px-2.5 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-neutral-100/95 flex items-center gap-3 cursor-pointer hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] active:scale-[0.995] transition-all relative"
    >
      {/* Left Rounded Square Food Thumbnail */}
      <div className="w-[78px] h-[78px] rounded-[11px] overflow-hidden shrink-0 bg-neutral-100">
        <img
          src={thumbnailSrc}
          alt={`Order #${cleanOrderId} thumbnail`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Right Order Details Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between relative pr-5">
        {/* Top Row: Order Number + Status Pill */}
        <div className="flex items-center justify-between gap-2 -mr-5">
          <h3 className="text-[14px] font-extrabold text-[#111827] leading-tight tracking-tight">
            Order #{cleanOrderId}
          </h3>

          {/* Status Pill Badge */}
          <span
            style={{ backgroundColor: statusConfig.bgHex, color: statusConfig.textHex }}
            className="px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 text-[10.5px] font-bold shrink-0"
          >
            {statusConfig.iconType === 'clock' && (
              <Clock className="w-3 h-3 shrink-0" strokeWidth={2.4} />
            )}
            {statusConfig.iconType === 'check-circle' && (
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
                <circle cx="8" cy="8" r="7" fill={statusConfig.iconColorHex} />
                <path
                  d="M5 8.2L7 10.2L11.2 6"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {statusConfig.iconType === 'x-circle' && (
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
                <circle cx="8" cy="8" r="7" fill={statusConfig.iconColorHex} />
                <path
                  d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Date & Time Row */}
        <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#64748B] mt-0.5">
          <Calendar className="w-3 h-3 text-[#94A3B8] shrink-0" strokeWidth={2} />
          <span>{dateStr}</span>
          <span className="text-[#CBD5E1] px-0.5">|</span>
          <span>{timeStr}</span>
        </div>

        {/* Service Mode Pill Badge */}
        <div className="mt-0.5 flex items-center">
          <span
            style={{ backgroundColor: serviceConfig.bgHex, color: serviceConfig.textHex }}
            className="px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[10px] font-bold leading-none"
          >
            {serviceConfig.mode === 'dinein' && (
              <svg viewBox="0 0 18 16" className="w-3.5 h-3 shrink-0" fill="none">
                <path d="M5 1.5v2M4 2.5h2" stroke="#0D8A47" strokeWidth="1.2" strokeLinecap="round" />
                <path
                  d="M2.5 5.5v7M2.5 9h3v3.5"
                  stroke="#0D8A47"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 7.5h5M9 7.5v5"
                  stroke="#0D8A47"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M15.5 5.5v7M15.5 9h-3v3.5"
                  stroke="#0D8A47"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {serviceConfig.mode === 'takeaway' && (
              <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="none">
                <path
                  d="M5.5 5V4.2C5.5 2.98 6.48 2 7.7 2h.6c1.22 0 2.2.98 2.2 2.2V5"
                  stroke="#6E3911"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <rect
                  x="3"
                  y="4.8"
                  width="10"
                  height="9.2"
                  rx="1.8"
                  stroke="#6E3911"
                  strokeWidth="1.4"
                />
                <path
                  d="M6 8.2c.4.8 1.1 1.3 2 1.3s1.6-.5 2-1.3"
                  stroke="#6E3911"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {serviceConfig.mode === 'delivery' && (
              <svg viewBox="0 0 18 14" className="w-3.5 h-3 shrink-0" fill="none">
                <circle cx="4" cy="10.5" r="2" fill="#1E293B" />
                <circle cx="13.5" cy="10.5" r="2" fill="#1E293B" />
                <path
                  d="M3 9.5h6l2.5-4.5H9.5M11.5 5l2 4.5h1.5"
                  stroke="#DC2626"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="2" y="5.5" width="3.8" height="2.8" rx="0.8" fill="#DC2626" />
              </svg>
            )}
            <span>{serviceConfig.label}</span>
          </span>
        </div>

        {/* Ordered Items Summary */}
        <p className="text-[11px] font-medium text-[#64748B] truncate mt-0.5 leading-snug">
          {itemsText}
        </p>

        {/* Right Chevron Indicator */}
        <ChevronRight
          className="w-4 h-4 text-[#475569] absolute right-0 top-1/2 -translate-y-1/2"
          strokeWidth={2.2}
        />

        {/* Subtle Divider & Total Price */}
        <div className="border-t border-neutral-100 mt-1 pt-0.5 flex items-center justify-between">
          <div className="text-[12px] font-medium text-[#334155]">
            Total: <span className="font-extrabold text-[#111827]">₹{order.grandTotal}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

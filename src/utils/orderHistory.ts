import type { Order, OrderStatus, ServiceMode, CartItem } from '../types/index.ts';

export type OrderHistoryTab = 'all' | 'cancelled';

export interface StatusBadgeConfig {
  label: string;
  bgHex: string;
  textHex: string;
  iconColorHex: string;
  iconType: 'clock' | 'check-circle' | 'x-circle';
}

export interface ServiceBadgeConfig {
  label: string;
  bgHex: string;
  textHex: string;
  mode: ServiceMode;
}

/**
 * Sorts orders chronologically in descending order (newest orders first).
 */
export function sortOrdersByDateDesc(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }
    const numA = parseInt(a.orderId.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.orderId.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });
}

/**
 * Filters and sorts orders based on the selected Order History tab ('all' vs 'cancelled').
 */
export function filterOrdersByTab(orders: Order[], tab: OrderHistoryTab): Order[] {
  const sorted = sortOrdersByDateDesc(orders);
  if (tab === 'cancelled') {
    return sorted.filter((order) => order.orderStatus === 'cancelled');
  }
  return sorted;
}

/**
 * Computes tab counts for All Orders and Cancelled tabs.
 */
export function getOrderTabCounts(orders: Order[]): { allCount: number; cancelledCount: number } {
  const allCount = orders.length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'cancelled').length;
  return { allCount, cancelledCount };
}

/**
 * Formats the tab label matching the approved screenshots:
 * - IMAGE 1 (With Orders): "All Orders (12)" and "Cancelled (2)"
 * - IMAGE 2 (Empty Orders): "All Orders" and "Cancelled" (no parenthetical count when total orders is 0)
 */
export function formatOrderTabLabel(
  tab: OrderHistoryTab,
  allCount: number,
  cancelledCount: number
): string {
  const isEmpty = allCount === 0;
  if (tab === 'all') {
    return isEmpty ? 'All Orders' : `All Orders (${allCount})`;
  }
  return isEmpty ? 'Cancelled' : `Cancelled (${cancelledCount})`;
}

/**
 * Returns visual styling tokens for the Order Status pill on each Order Card.
 */
export function getOrderStatusBadgeConfig(status: OrderStatus): StatusBadgeConfig {
  switch (status) {
    case 'placed':
      return {
        label: 'Placed',
        bgHex: '#E0F2FE',
        textHex: '#0369A1',
        iconColorHex: '#0284C7',
        iconType: 'clock',
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        bgHex: '#E0F2FE',
        textHex: '#0369A1',
        iconColorHex: '#0284C7',
        iconType: 'clock',
      };
    case 'preparing':
      return {
        label: 'Preparing',
        bgHex: '#FFF0E0',
        textHex: '#E06500',
        iconColorHex: '#E06500',
        iconType: 'clock',
      };
    case 'ready':
      return {
        label: 'Ready',
        bgHex: '#FFF0E0',
        textHex: '#E06500',
        iconColorHex: '#E06500',
        iconType: 'clock',
      };
    case 'delivered':
      return {
        label: 'Delivered',
        bgHex: '#E6F3FF',
        textHex: '#026AA7',
        iconColorHex: '#0084FF',
        iconType: 'check-circle',
      };
    case 'completed':
      return {
        label: 'Completed',
        bgHex: '#E5F9EE',
        textHex: '#0D8A47',
        iconColorHex: '#109848',
        iconType: 'check-circle',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bgHex: '#FEECEB',
        textHex: '#D92D20',
        iconColorHex: '#D92D20',
        iconType: 'x-circle',
      };
  }
}

/**
 * Returns visual styling tokens for the Service Mode badge on each Order Card.
 */
export function getServiceBadgeConfig(serviceMode: ServiceMode): ServiceBadgeConfig {
  switch (serviceMode) {
    case 'dinein':
      return {
        label: 'Dinein',
        bgHex: '#E5F9EE',
        textHex: '#0D8A47',
        mode: 'dinein',
      };
    case 'takeaway':
      return {
        label: 'Takeaway',
        bgHex: '#FDF2E7',
        textHex: '#6E3911',
        mode: 'takeaway',
      };
    case 'delivery':
      return {
        label: 'Delivery',
        bgHex: '#E6F3FF',
        textHex: '#026AA7',
        mode: 'delivery',
      };
  }
}

/**
 * Formats the items list into a concise single-line summary like "Jalebi (x1), Rosogulla (x1)".
 */
export function formatOrderItemsSummary(items: CartItem[], overrideSummary?: string): string {
  if (overrideSummary && overrideSummary.trim().length > 0) {
    return overrideSummary;
  }
  if (!items || items.length === 0) {
    return 'No items';
  }
  return items.map((ci) => `${ci.item.name} (x${ci.quantity})`).join(', ');
}

/**
 * Formats an ISO timestamp into "DD MMM YYYY" and "hh:mm AM/PM" when displayDate/displayTime are not explicitly set.
 */
export function formatOrderDateTime(order: Pick<Order, 'createdAt' | 'displayDate' | 'displayTime'>): {
  dateStr: string;
  timeStr: string;
} {
  if (order.displayDate && order.displayTime) {
    return { dateStr: order.displayDate, timeStr: order.displayTime };
  }
  const d = new Date(order.createdAt);
  if (Number.isNaN(d.getTime())) {
    return { dateStr: '16 Jun 2025', timeStr: '11:32 AM' };
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hourStr = String(hours).padStart(2, '0');

  return {
    dateStr: `${day} ${month} ${year}`,
    timeStr: `${hourStr}:${minutes} ${ampm}`,
  };
}

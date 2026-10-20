import type { CartItem, MenuItem, ServiceMode } from '../types/index.ts';

/**
 * Checks if a specific menu item can be served under the requested service mode.
 */
export function isItemAvailableForService(item: MenuItem, serviceMode: ServiceMode): boolean {
  if (!item.isAvailable) return false;
  return Boolean(item.serviceAvailability[serviceMode]);
}

/**
 * Identifies items currently in the cart that cannot be ordered under a target service mode.
 * Used to avoid silent deletion and provide an explicit resolution prompt to the customer.
 */
export function findIncompatibleCartItems(items: CartItem[], targetMode: ServiceMode): CartItem[] {
  return items.filter(cartItem => !isItemAvailableForService(cartItem.item, targetMode));
}

/**
 * Filters out items incompatible with the target service mode once the customer explicitly confirms.
 */
export function sanitizeCartForServiceMode(items: CartItem[], targetMode: ServiceMode): CartItem[] {
  return items.filter(cartItem => isItemAvailableForService(cartItem.item, targetMode));
}

/**
 * Human-readable label for service mode
 */
export function getServiceModeLabel(mode: ServiceMode): string {
  switch (mode) {
    case 'dinein':
      return 'Dine-in';
    case 'takeaway':
      return 'Takeaway';
    case 'delivery':
      return 'Delivery';
    default:
      return mode;
  }
}

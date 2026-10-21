import type { IOrderAdapter, PlaceOrderParams } from './types.ts';
import type { Order } from '../types/index.ts';
import { CAMPORA_SEED_ORDERS } from '../data/mock/index.ts';
import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  storageValidators,
  readScopedOrLegacy,
  getOperatorStorageKey,
  safeGetStorage,
  type StorageLike,
} from '../utils/storageKeys.ts';

export class MockOrderAdapter implements IOrderAdapter {
  private inFlightPlacement = false;
  private customStorage: StorageLike | null = null;

  constructor(storage?: StorageLike | null) {
    if (storage) this.customStorage = storage;
  }

  private getStorage(): StorageLike | null {
    return this.customStorage || safeGetStorage();
  }

  private readStorageOrders(operatorId: string): Order[] {
    const id = operatorId || 'campora-cafe';
    const fallback = id === 'campora-cafe' ? CAMPORA_SEED_ORDERS : [];
    const storage = this.getStorage();

    return readScopedOrLegacy<Order[]>(
      STORAGE_KEYS.ORDERS,
      LEGACY_STORAGE_KEYS.ORDERS,
      storageValidators.orders,
      (val) => {
        try {
          return JSON.parse(val) as Order[];
        } catch {
          return fallback;
        }
      },
      fallback,
      id,
      storage
    );
  }

  private writeStorageOrders(operatorId: string, orders: Order[]): void {
    const id = operatorId || 'campora-cafe';
    const storage = this.getStorage();
    if (!storage) return;

    const scopedKey = getOperatorStorageKey(STORAGE_KEYS.ORDERS, id);
    storage.setItem(scopedKey, JSON.stringify(orders));

    if (id === 'campora-cafe') {
      storage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  public async getOrders(operatorId: string): Promise<Order[]> {
    return this.readStorageOrders(operatorId);
  }

  public async getOrderById(operatorId: string, orderId: string): Promise<Order | undefined> {
    const orders = await this.getOrders(operatorId);
    return orders.find((o) => o.orderId === orderId);
  }

  public canCancelOrder(order: Order): boolean {
    if (!order) return false;
    return (
      order.orderStatus === 'placed' ||
      order.orderStatus === 'confirmed' ||
      order.orderStatus === 'preparing'
    );
  }

  public async placeOrder(
    operatorId: string,
    params: PlaceOrderParams,
    user?: { uid: string; displayName: string }
  ): Promise<Order> {
    if (this.inFlightPlacement) {
      throw new Error('An order placement is already in progress.');
    }
    this.inFlightPlacement = true;

    try {
      const orders = await this.getOrders(operatorId);
      const now = new Date();

      // Generate next order ID (e.g. C1048 if top is C1047, or based on timestamp)
      const topNumMatch = orders[0]?.orderId?.match(/^C(\d+)$/);
      const nextNum = topNumMatch ? parseInt(topNumMatch[1], 10) + 1 : 1000 + orders.length + 1;
      const orderId = `C${nextNum}`;

      // Format date and time
      const displayDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const displayTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Derive thumbnail and items summary
      const firstItem = params.items[0]?.item;
      const thumbnailUrl = firstItem?.imageUrl || '/assets/orders/thumb-jalebi.png';
      const itemsSummary = params.items
        .map((ci) => `${ci.item?.name || 'Item'} (x${ci.quantity})`)
        .join(', ');

      const newOrder: Order = {
        orderId,
        userId: user?.uid || 'customer-demo-1',
        userDisplayName: user?.displayName || 'Pratik Kumar',
        serviceMode: params.serviceMode,
        items: params.items,
        priceSnapshot: params.pricing,
        subtotal: params.pricing.subtotal,
        taxes: params.pricing.taxes,
        applicableCharges: params.pricing.packagingCharge + params.pricing.deliveryFee,
        grandTotal: params.pricing.grandTotal,
        paymentStatus: 'completed',
        paymentMethod: params.paymentMethod || 'UPI',
        orderStatus: 'preparing',
        pickupOrDeliveryDetails: params.pickupOrDeliveryDetails || {},
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        displayDate,
        displayTime,
        thumbnailUrl,
        itemsSummary,
      };

      const updated = [newOrder, ...orders];
      this.writeStorageOrders(operatorId, updated);
      return newOrder;
    } finally {
      this.inFlightPlacement = false;
    }
  }

  public async cancelOrder(
    operatorId: string,
    orderId: string,
    reason?: string
  ): Promise<Order> {
    const orders = await this.getOrders(operatorId);
    const targetIndex = orders.findIndex((o) => o.orderId === orderId);

    if (targetIndex === -1) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const targetOrder = orders[targetIndex];
    if (!this.canCancelOrder(targetOrder)) {
      throw new Error(`Order ${orderId} cannot be cancelled in status '${targetOrder.orderStatus}'.`);
    }

    const updatedOrder: Order = {
      ...targetOrder,
      orderStatus: 'cancelled',
      updatedAt: new Date().toISOString(),
      pickupOrDeliveryDetails: {
        ...targetOrder.pickupOrDeliveryDetails,
        notes: reason ? `Cancelled: ${reason}` : targetOrder.pickupOrDeliveryDetails?.notes || 'Cancelled by customer',
      },
    };

    const updatedOrders = [...orders];
    updatedOrders[targetIndex] = updatedOrder;
    this.writeStorageOrders(operatorId, updatedOrders);
    return updatedOrder;
  }

  public async restoreSeedOrders(operatorId: string): Promise<Order[]> {
    const id = operatorId || 'campora-cafe';
    const seeds = id === 'campora-cafe' ? CAMPORA_SEED_ORDERS : [];
    this.writeStorageOrders(id, seeds);
    return seeds;
  }

  public async clearOrders(operatorId: string): Promise<void> {
    this.writeStorageOrders(operatorId, []);
  }
}

export const mockOrderAdapter = new MockOrderAdapter();

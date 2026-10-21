import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Order, ServiceMode, CartItem, PriceBreakdown } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';
import { useCanteen } from './CanteenContext.tsx';
import { CAMPORA_SEED_ORDERS } from '../data/mock/index.ts';
import { mockOrderAdapter } from '../adapters/mockOrderAdapter.ts';
import type { PlaceOrderParams } from '../adapters/types.ts';

// Backward-compatible re-export of SEED_ORDERS for tests and consumers
export const SEED_ORDERS: Order[] = CAMPORA_SEED_ORDERS;

export type { PlaceOrderParams };

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  loadingOrders: boolean;
  placeOrder: (params: PlaceOrderParams) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  clearOrdersState: () => void;
  restoreSeedOrdersState: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  let operatorId = 'campora-cafe';
  try {
    const { config } = useCanteen();
    if (config?.identity?.id) {
      operatorId = config.identity.id;
    }
  } catch {
    // Safe fallback when rendered in isolated test harness
  }

  const activeOperatorRef = useRef(operatorId);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders asynchronously from mockOrderAdapter on mount or operator switch
  useEffect(() => {
    let isCancelled = false;
    const targetOperator = operatorId;
    activeOperatorRef.current = targetOperator;

    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const loaded = await mockOrderAdapter.getOrders(targetOperator);
        // Guard: Discard if operator changed during async read
        if (!isCancelled && activeOperatorRef.current === targetOperator) {
          setOrders(loaded);
        }
      } catch (err) {
        console.warn('Failed to load orders from adapter:', err);
      } finally {
        if (!isCancelled && activeOperatorRef.current === targetOperator) {
          setLoadingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [operatorId]);

  const placeOrder = async (params: PlaceOrderParams): Promise<Order> => {
    const userPayload = user ? { uid: user.uid, displayName: user.displayName } : undefined;
    const createdOrder = await mockOrderAdapter.placeOrder(
      operatorId,
      params,
      userPayload
    );
    // Prepend locally to keep memory in immediate sync
    setOrders((prev) => [createdOrder, ...prev]);
    return createdOrder;
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    const cleanId = orderId.replace(/^#/, '');
    const cancelled = await mockOrderAdapter.cancelOrder(operatorId, cleanId, reason);
    setOrders((prev) =>
      prev.map((o) => (o.orderId === cleanId ? cancelled : o))
    );
  };

  const getOrderById = (orderId: string) => {
    const cleanId = orderId.replace(/^#/, '');
    return orders.find((o) => o.orderId === cleanId || o.orderId === orderId);
  };

  const clearOrdersState = () => {
    mockOrderAdapter.clearOrders(operatorId);
    setOrders([]);
  };

  const restoreSeedOrdersState = () => {
    mockOrderAdapter.restoreSeedOrders(operatorId).then((restored) => {
      setOrders(restored);
    });
  };

  const activeOrder =
    orders.find((o) => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.orderStatus)) ||
    null;

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        loadingOrders,
        placeOrder,
        cancelOrder,
        getOrderById,
        clearOrdersState,
        restoreSeedOrdersState,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};

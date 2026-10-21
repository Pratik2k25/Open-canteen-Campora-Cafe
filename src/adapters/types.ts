import type {
  CanteenCatalog,
  Category,
  MenuItem,
  Order,
  CartItem,
  PriceBreakdown,
  ServiceMode,
  CustomerProfileData,
  SavedAddress,
} from '../types/index.ts';

export interface PlaceOrderParams {
  serviceMode: ServiceMode;
  items: CartItem[];
  pricing: PriceBreakdown;
  paymentMethod: string;
  pickupOrDeliveryDetails: {
    tableNumber?: string;
    pickupTimeEstimate?: string;
    deliveryAddress?: string;
    contactNumber?: string;
    notes?: string;
  };
}

/**
 * Menu Data Access Adapter Contract.
 * Abstracts catalog retrieval from physical data source (Mock in Stage 1/2, Firestore in Stage 3).
 */
export interface IMenuAdapter {
  getCatalog(operatorId: string): Promise<CanteenCatalog>;
  getCategories(operatorId: string): Promise<Category[]>;
  getMenuItems(operatorId: string, categoryId?: string): Promise<MenuItem[]>;
  getMenuItemById(operatorId: string, itemId: string): Promise<MenuItem | undefined>;
  searchMenuItems(operatorId: string, query: string, categoryId?: string): Promise<MenuItem[]>;
}

/**
 * Order Data Access Adapter Contract.
 * Abstracts order lifecycle, persistence, and querying.
 */
export interface IOrderAdapter {
  getOrders(operatorId: string): Promise<Order[]>;
  getOrderById(operatorId: string, orderId: string): Promise<Order | undefined>;
  placeOrder(
    operatorId: string,
    params: PlaceOrderParams,
    user?: { uid: string; displayName: string }
  ): Promise<Order>;
  cancelOrder(operatorId: string, orderId: string, reason?: string): Promise<Order>;
  canCancelOrder(order: Order): boolean;
  restoreSeedOrders(operatorId: string): Promise<Order[]>;
  clearOrders(operatorId: string): Promise<void>;
}

/**
 * Customer Profile Data Access Adapter Contract.
 * Abstracts customer preferences, appearance, notifications, and address book.
 */
export interface IProfileAdapter {
  getProfileSync?(operatorId: string): CustomerProfileData;
  getProfile(operatorId: string): Promise<CustomerProfileData>;
  updateProfile(
    operatorId: string,
    updates: Partial<CustomerProfileData>
  ): Promise<CustomerProfileData>;
  addSavedAddress(
    operatorId: string,
    address: Omit<SavedAddress, 'id'>
  ): Promise<CustomerProfileData>;
  deleteSavedAddress(operatorId: string, addressId: string): Promise<CustomerProfileData>;
  setDefaultAddress(operatorId: string, addressId: string): Promise<CustomerProfileData>;
  resetProfile(operatorId: string): Promise<CustomerProfileData>;
}

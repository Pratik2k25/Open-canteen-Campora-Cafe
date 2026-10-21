export type ServiceMode = 'dinein' | 'takeaway' | 'delivery';

export type FoodType = 'veg' | 'nonveg';

export interface ServiceAvailability {
  dinein: boolean;
  takeaway: boolean;
  delivery: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl: string;
}

export type FoodVisualType =
  | 'food'
  | 'coffee-cup'
  | 'desi-chai-glass'
  | 'pepsi-bottle'
  | 'chai-kulhad'
  | 'other-beverage'
  | 'coffee'
  | 'chai-glass'
  | 'cold-drink';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  animationAssetUrl?: string;
  visualType?: FoodVisualType;
  cartAssetUrl?: string;
  foodType: FoodType;
  preparationTime: string;
  serviceAvailability: ServiceAvailability;
  isAvailable: boolean;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  rating?: number;
  calories?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface PriceBreakdown {
  subtotal: number;
  taxes: number;
  packagingCharge: number;
  deliveryFee: number;
  grandTotal: number;
  totalItemCount: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Order {
  orderId: string;
  userId: string;
  userDisplayName: string;
  serviceMode: ServiceMode;
  items: CartItem[];
  priceSnapshot: PriceBreakdown;
  subtotal: number;
  taxes: number;
  applicableCharges: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderStatus: OrderStatus;
  pickupOrDeliveryDetails: {
    tableNumber?: string;
    pickupTimeEstimate?: string;
    deliveryAddress?: string;
    contactNumber?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
  /** Formatted date string for display (e.g. '16 Jun 2025') */
  displayDate?: string;
  /** Formatted time string for display (e.g. '11:32 AM') */
  displayTime?: string;
  /** Explicit thumbnail override for order card */
  thumbnailUrl?: string;
  /** Formatted items summary override (e.g. 'Jalebi (x1), Rosogulla (x1)') */
  itemsSummary?: string;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: 'Hostel' | 'Department' | 'Campus Gate' | 'Other';
  buildingOrGate: string;
  roomOrLandmark: string;
  recipientPhone: string;
  isDefault: boolean;
}

export interface UserPreferences {
  vegOnly: boolean;
  preferredService: ServiceMode;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  createdAt: string;
  preferences: UserPreferences;
}

// Re-export Canteen Configuration types (Stage 1 · Step 1.2 · Task 1.2.1)
export type {
  CanteenConfig,
  CanteenConfigInput,
  CanteenIdentity,
  CanteenIdentityInput,
  CanteenBranding,
  CanteenBrandingInput,
  CanteenLocation,
  CanteenLocationInput,
  CanteenContact,
  CanteenContactInput,
  CanteenContent,
  CanteenContentInput,
  CanteenPWA,
  CanteenPWAInput,
} from '../config/canteenConfig.ts';

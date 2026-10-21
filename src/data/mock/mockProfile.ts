import type { CustomerProfileData, UserProfile } from '../../types/index.ts';
import { INITIAL_MOCK_PROFILE_DATA } from '../../utils/profileData.ts';

/**
 * Standard demonstration profile for Campora Café customer testing.
 * Defined from INITIAL_MOCK_PROFILE_DATA to guarantee single source of truth without data drift.
 */
export const DEFAULT_MOCK_CUSTOMER_PROFILE: CustomerProfileData = INITIAL_MOCK_PROFILE_DATA;

/**
 * Creates an empty, clean profile for independent operators (Open Canteen, My Home, custom).
 * Guarantees that non-Campora canteens NEVER inherit Campora's demo customer, email, or addresses.
 */
export function createOperatorDefaultProfile(operatorId: string): CustomerProfileData {
  return {
    uid: `guest-${operatorId}`,
    displayName: 'Guest User',
    email: '',
    phoneNumber: '',
    vegMode: false,
    appearance: 'Light',
    notifications: {
      orderUpdates: true,
      offersAndPromos: false,
      campusSpecials: false,
    },
    savedAddresses: [],
  };
}

/**
 * Standard demonstration user for mock auth sessions.
 */
export const DEFAULT_MOCK_AUTH_USER: UserProfile = {
  uid: 'customer-demo-1',
  displayName: 'Pratik Kumar',
  email: 'devlopwithpratik@gmail.com',
  phoneNumber: '+91 98765 43210',
  createdAt: '2025-06-01T00:00:00.000Z',
  preferences: {
    vegOnly: false,
    preferredService: 'dinein',
    notificationsEnabled: true,
  },
};

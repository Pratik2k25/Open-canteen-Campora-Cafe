import type { SavedAddress } from '../types/index.ts';

export type AppearanceTheme = 'Light' | 'Dark' | 'System';

export interface NotificationSettings {
  orderUpdates: boolean;
  offersAndPromos: boolean;
  campusSpecials: boolean;
}

export interface CustomerProfileData {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  vegMode: boolean;
  appearance: AppearanceTheme;
  notifications: NotificationSettings;
  savedAddresses: SavedAddress[];
}

/**
 * Replaceable data provider contract for future Firebase Auth + Firestore integration.
 * Keeping data separate from presentation as required by Phase 3 architecture.
 */
export interface ProfileDataProvider {
  getProfile: () => CustomerProfileData;
  updateProfileInfo: (
    current: CustomerProfileData,
    updates: { displayName: string; email: string; phoneNumber?: string }
  ) => CustomerProfileData;
  toggleVegMode: (current: CustomerProfileData) => CustomerProfileData;
  updateAppearance: (current: CustomerProfileData, theme: AppearanceTheme) => CustomerProfileData;
  updateNotifications: (
    current: CustomerProfileData,
    patch: Partial<NotificationSettings>
  ) => CustomerProfileData;
}

export const INITIAL_MOCK_PROFILE_DATA: CustomerProfileData = {
  uid: 'mock-customer-pratik-01',
  displayName: 'Pratik Anand',
  email: 'pratikanandmaurya@flash.co',
  phoneNumber: '+91 98765 43210',
  vegMode: true,
  appearance: 'Light',
  notifications: {
    orderUpdates: true,
    offersAndPromos: true,
    campusSpecials: false,
  },
  savedAddresses: [
    {
      id: 'addr-hostel-1',
      userId: 'mock-customer-pratik-01',
      label: 'Hostel',
      buildingOrGate: 'Block B, Aryabhatta Hostel',
      roomOrLandmark: 'Room 304, Near Main Mess',
      recipientPhone: '+91 98765 43210',
      isDefault: true,
    },
    {
      id: 'addr-dept-2',
      userId: 'mock-customer-pratik-01',
      label: 'Department',
      buildingOrGate: 'Computer Science Academic Block',
      roomOrLandmark: '2nd Floor Innovation Lab',
      recipientPhone: '+91 98765 43210',
      isDefault: false,
    },
  ],
};

export function getAvatarInitial(displayName: string): string {
  const trimmed = (displayName || '').trim();
  if (!trimmed) return 'P';
  return trimmed.charAt(0).toUpperCase();
}

export interface ProfileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateProfileUpdate(input: {
  displayName: string;
  email: string;
}): ProfileValidationResult {
  const name = input.displayName.trim();
  const email = input.email.trim();

  if (!name) {
    return { valid: false, error: 'Name cannot be empty.' };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

export function toggleVegModeState(profile: CustomerProfileData): CustomerProfileData {
  return {
    ...profile,
    vegMode: !profile.vegMode,
  };
}

export function updateAppearanceTheme(
  profile: CustomerProfileData,
  theme: AppearanceTheme
): CustomerProfileData {
  return {
    ...profile,
    appearance: theme,
  };
}

export const mockProfileDataProvider: ProfileDataProvider = {
  getProfile: () => ({
    ...INITIAL_MOCK_PROFILE_DATA,
    notifications: { ...INITIAL_MOCK_PROFILE_DATA.notifications },
    savedAddresses: INITIAL_MOCK_PROFILE_DATA.savedAddresses.map((a) => ({ ...a })),
  }),
  updateProfileInfo: (current, updates) => ({
    ...current,
    displayName: updates.displayName.trim(),
    email: updates.email.trim(),
    phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber.trim() : current.phoneNumber,
  }),
  toggleVegMode: (current) => toggleVegModeState(current),
  updateAppearance: (current, theme) => updateAppearanceTheme(current, theme),
  updateNotifications: (current, patch) => ({
    ...current,
    notifications: {
      ...current.notifications,
      ...patch,
    },
  }),
};

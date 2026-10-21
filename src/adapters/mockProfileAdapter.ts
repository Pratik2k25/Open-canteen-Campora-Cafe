import type { IProfileAdapter } from './types.ts';
import type { CustomerProfileData, SavedAddress } from '../types/index.ts';
import {
  DEFAULT_MOCK_CUSTOMER_PROFILE,
  createOperatorDefaultProfile,
} from '../data/mock/index.ts';
import {
  STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  storageValidators,
  readScopedOrLegacy,
  getOperatorStorageKey,
  safeGetStorage,
  type StorageLike,
} from '../utils/storageKeys.ts';

export class MockProfileAdapter implements IProfileAdapter {
  private customStorage: StorageLike | null = null;

  constructor(storage?: StorageLike | null) {
    if (storage) this.customStorage = storage;
  }

  private getStorage(): StorageLike | null {
    return this.customStorage || safeGetStorage();
  }

  private readStorageProfile(operatorId: string): CustomerProfileData {
    const id = operatorId || 'open-canteen';
    const storage = this.getStorage();
    const fallback =
      id === 'campora-cafe'
        ? DEFAULT_MOCK_CUSTOMER_PROFILE
        : createOperatorDefaultProfile(id);

    return readScopedOrLegacy<CustomerProfileData>(
      STORAGE_KEYS.PROFILE,
      LEGACY_STORAGE_KEYS.PROFILE,
      storageValidators.profile,
      (val) => {
        try {
          return JSON.parse(val) as CustomerProfileData;
        } catch {
          return fallback;
        }
      },
      fallback,
      id,
      storage
    );
  }

  private writeStorageProfile(operatorId: string, profile: CustomerProfileData): void {
    const id = operatorId || 'open-canteen';
    const storage = this.getStorage();
    if (!storage) return;

    const scopedKey = getOperatorStorageKey(STORAGE_KEYS.PROFILE, id);
    storage.setItem(scopedKey, JSON.stringify(profile));

    if (id === 'campora-cafe') {
      storage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }
  }

  public getProfileSync(operatorId: string): CustomerProfileData {
    return this.readStorageProfile(operatorId);
  }

  public async getProfile(operatorId: string): Promise<CustomerProfileData> {
    return this.readStorageProfile(operatorId);
  }

  public async updateProfile(
    operatorId: string,
    updates: Partial<CustomerProfileData>
  ): Promise<CustomerProfileData> {
    const current = await this.getProfile(operatorId);
    const updated: CustomerProfileData = {
      ...current,
      ...updates,
      notifications: {
        ...current.notifications,
        ...(updates.notifications || {}),
      },
    };
    this.writeStorageProfile(operatorId, updated);
    return updated;
  }

  public async addSavedAddress(
    operatorId: string,
    address: Omit<SavedAddress, 'id'>
  ): Promise<CustomerProfileData> {
    const current = await this.getProfile(operatorId);
    const newAddressId = `addr-${Date.now()}`;
    const newAddress: SavedAddress = {
      ...address,
      id: newAddressId,
    };

    let updatedAddresses = current.savedAddresses;
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses = [...updatedAddresses, newAddress];

    const updated: CustomerProfileData = {
      ...current,
      savedAddresses: updatedAddresses,
    };
    this.writeStorageProfile(operatorId, updated);
    return updated;
  }

  public async updateSavedAddress(
    operatorId: string,
    addressId: string,
    updates: Partial<Omit<SavedAddress, 'id'>>
  ): Promise<CustomerProfileData> {
    const current = await this.getProfile(operatorId);
    let updatedAddresses = current.savedAddresses.map((a) => {
      if (a.id === addressId) {
        return { ...a, ...updates };
      }
      return a;
    });

    if (updates.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
    }

    const updated: CustomerProfileData = {
      ...current,
      savedAddresses: updatedAddresses,
    };
    this.writeStorageProfile(operatorId, updated);
    return updated;
  }

  public async deleteSavedAddress(
    operatorId: string,
    addressId: string
  ): Promise<CustomerProfileData> {
    const current = await this.getProfile(operatorId);
    const filtered = current.savedAddresses.filter((a) => a.id !== addressId);

    // If deleted address was default and addresses remain, make first one default
    let normalized = filtered;
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      normalized = [{ ...filtered[0], isDefault: true }, ...filtered.slice(1)];
    }

    const updated: CustomerProfileData = {
      ...current,
      savedAddresses: normalized,
    };
    this.writeStorageProfile(operatorId, updated);
    return updated;
  }

  public async setDefaultAddress(
    operatorId: string,
    addressId: string
  ): Promise<CustomerProfileData> {
    const current = await this.getProfile(operatorId);
    const updatedAddresses = current.savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));

    const updated: CustomerProfileData = {
      ...current,
      savedAddresses: updatedAddresses,
    };
    this.writeStorageProfile(operatorId, updated);
    return updated;
  }

  public async resetProfile(operatorId: string): Promise<CustomerProfileData> {
    const id = operatorId || 'open-canteen';
    const defaultProfile =
      id === 'campora-cafe'
        ? DEFAULT_MOCK_CUSTOMER_PROFILE
        : createOperatorDefaultProfile(id);
    this.writeStorageProfile(id, defaultProfile);
    return defaultProfile;
  }
}

export const mockProfileAdapter = new MockProfileAdapter();

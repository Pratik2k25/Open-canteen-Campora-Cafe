import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, AlertCircle, ArrowLeft, Store, Info, FileText } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import type { SavedAddress } from '../types/index.ts';
import {
  getAvatarInitial,
  validateProfileUpdate,
  validateAddressInput,
  type CustomerProfileData,
  type AppearanceTheme,
} from '../utils/profileData.ts';
import {
  readCanonicalVegPreference,
  writeCanonicalVegPreference,
} from '../utils/vegModeTransition.ts';
import { mockProfileAdapter } from '../adapters/mockProfileAdapter.ts';
import { ProfilePageSkeleton } from '../components/skeleton/ProfilePageSkeleton.tsx';
import { usePageReadiness } from '../hooks/usePageReadiness.ts';
import { useAccessibleDialog } from '../utils/useAccessibleDialog.ts';
import { OpenCanteenBrandMark } from '../components/OpenCanteenBrandMark.tsx';
import { AccountPrivacyView } from '../components/AccountPrivacyView.tsx';

const isDialablePhone = (phone?: string): boolean => {
  if (!phone) return false;
  // Disallow mock vanity names (e.g., '+91 1800-CAMPORA') as dialable tel: links
  if (/[a-zA-Z]/.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7;
};

type ActiveSheet =
  | null
  | 'editProfile'
  | 'helpSupport'
  | 'notifications'
  | 'appearance'
  | 'addressBook'
  | 'accountPrivacy'
  | 'aboutCanteen'
  | 'aboutCampora'
  | 'logoutConfirm';

interface ProfilePageProps {
  onHeaderBack?: () => void;
  onHomeClick?: () => void;
  hideFloatingHomePill?: boolean;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onHeaderBack,
  onHomeClick,
  hideFloatingHomePill = false,
}) => {
  const { config } = useCanteen();
  const { logout } = useAuth();
  const operatorId = config.identity.id;
  const activeOperatorRef = useRef(operatorId);
  const navigate = useNavigate();
  const { isReady, showSkeleton } = usePageReadiness({ pageKey: 'profile' });

  const [profile, setProfile] = useState<CustomerProfileData>(() => {
    const loaded = mockProfileAdapter.getProfileSync(operatorId);
    const syncedVegMode = readCanonicalVegPreference(loaded.vegMode, undefined, operatorId);
    return {
      ...loaded,
      vegMode: syncedVegMode,
    };
  });

  const [searchParams] = useSearchParams();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(() => {
    const sheetParam = searchParams.get('sheet');
    if (
      sheetParam === 'addressBook' ||
      sheetParam === 'editProfile' ||
      sheetParam === 'helpSupport' ||
      sheetParam === 'notifications' ||
      sheetParam === 'appearance' ||
      sheetParam === 'accountPrivacy' ||
      sheetParam === 'aboutCanteen' ||
      sheetParam === 'aboutCampora'
    ) {
      return sheetParam as ActiveSheet;
    }
    return null;
  });
  const [editName, setEditName] = useState(profile.displayName);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phoneNumber);
  const [editError, setEditError] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Address Book CRUD state
  const [addressSubView, setAddressSubView] = useState<'list' | 'add' | 'edit'>('list');
  const [addrLabel, setAddrLabel] = useState<'Hostel' | 'Department' | 'Campus Gate' | 'Other'>('Hostel');
  const [addrBuilding, setAddrBuilding] = useState<string>('');
  const [addrRoom, setAddrRoom] = useState<string>('');
  const [addrPhone, setAddrPhone] = useState<string>('');
  const [addrIsDefault, setAddrIsDefault] = useState<boolean>(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [deleteConfirmAddrId, setDeleteConfirmAddrId] = useState<string | null>(null);

  const resetAddressForm = () => {
    setAddrLabel('Hostel');
    setAddrBuilding('');
    setAddrRoom('');
    setAddrPhone(profile.phoneNumber || '');
    setAddrIsDefault(profile.savedAddresses.length === 0);
    setAddrError(null);
    setEditingAddrId(null);
  };

  const handleOpenAddAddress = () => {
    resetAddressForm();
    setAddressSubView('add');
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setAddrLabel(addr.label);
    setAddrBuilding(addr.buildingOrGate);
    setAddrRoom(addr.roomOrLandmark);
    setAddrPhone(addr.recipientPhone || '');
    setAddrIsDefault(addr.isDefault);
    setAddrError(null);
    setEditingAddrId(addr.id);
    setAddressSubView('edit');
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAddressInput({
      buildingOrGate: addrBuilding,
      roomOrLandmark: addrRoom,
      recipientPhone: addrPhone,
    });
    if (!validation.valid) {
      setAddrError(validation.error || 'Please fill in all required fields.');
      return;
    }

    if (addressSubView === 'add') {
      const updated = await mockProfileAdapter.addSavedAddress(operatorId, {
        userId: profile.uid,
        label: addrLabel,
        buildingOrGate: addrBuilding.trim(),
        roomOrLandmark: addrRoom.trim(),
        recipientPhone: addrPhone.trim(),
        isDefault: addrIsDefault || profile.savedAddresses.length === 0,
      });
      if (activeOperatorRef.current === operatorId) {
        setProfile(updated);
        setAddressSubView('list');
        showToast('Address added to your address book');
      }
    } else if (addressSubView === 'edit' && editingAddrId) {
      const updated = await mockProfileAdapter.updateSavedAddress(operatorId, editingAddrId, {
        label: addrLabel,
        buildingOrGate: addrBuilding.trim(),
        roomOrLandmark: addrRoom.trim(),
        recipientPhone: addrPhone.trim(),
        isDefault: addrIsDefault,
      });
      if (activeOperatorRef.current === operatorId) {
        setProfile(updated);
        setAddressSubView('list');
        showToast('Address updated');
      }
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const updated = await mockProfileAdapter.deleteSavedAddress(operatorId, addressId);
    if (activeOperatorRef.current === operatorId) {
      setProfile(updated);
      setDeleteConfirmAddrId(null);
      showToast('Address removed');
    }
  };

  // Reload profile state cleanly from mockProfileAdapter when canteen operator changes at runtime
  useEffect(() => {
    let isCancelled = false;
    const targetOperator = operatorId;
    activeOperatorRef.current = targetOperator;

    // Synchronously set to new operator's sync profile immediately to prevent old data flashing
    const syncProfile = mockProfileAdapter.getProfileSync(targetOperator);
    setProfile({
      ...syncProfile,
      vegMode: readCanonicalVegPreference(syncProfile.vegMode, undefined, targetOperator),
    });
    // Safely dismiss open sheets and confirmation dialogs on operator switch
    setActiveSheet(null);
    setDeleteConfirmAddrId(null);
    setEditingAddrId(null);
    setAddressSubView('list');

    const loadProfile = async () => {
      const loaded = await mockProfileAdapter.getProfile(targetOperator);
      if (!isCancelled && activeOperatorRef.current === targetOperator) {
        const syncedVegMode = readCanonicalVegPreference(loaded.vegMode, undefined, targetOperator);
        setProfile({
          ...loaded,
          vegMode: syncedVegMode,
        });
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [operatorId]);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  // Accessible Dialog Hook for active bottom sheets & dialogs: Escape, focus trapping, focus restoration
  const sheetDialogRef = useAccessibleDialog({
    isOpen: Boolean(activeSheet),
    onClose: () => {
      if (deleteConfirmAddrId) {
        setDeleteConfirmAddrId(null);
      } else if (addressSubView !== 'list') {
        setAddressSubView('list');
      } else {
        setActiveSheet(null);
      }
    },
  });

  const handleToggleVegMode = async () => {
    const nextVegMode = !profile.vegMode;
    const updated = await mockProfileAdapter.updateProfile(operatorId, { vegMode: nextVegMode });
    if (activeOperatorRef.current === operatorId) {
      setProfile(updated);
      writeCanonicalVegPreference(updated.vegMode, undefined, operatorId);
    }
  };

  const openEditProfile = () => {
    setEditName(profile.displayName);
    setEditEmail(profile.email);
    setEditPhone(profile.phoneNumber);
    setEditError(null);
    setActiveSheet('editProfile');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfileUpdate({ displayName: editName, email: editEmail });
    if (!validation.valid) {
      setEditError(validation.error || 'Invalid input');
      return;
    }
    const updated = await mockProfileAdapter.updateProfile(operatorId, {
      displayName: editName.trim(),
      email: editEmail.trim(),
      phoneNumber: editPhone.trim(),
    });
    if (activeOperatorRef.current === operatorId) {
      setProfile(updated);
      setActiveSheet(null);
      showToast('Profile updated');
    }
  };

  const handleSelectAppearance = async (theme: AppearanceTheme) => {
    const updated = await mockProfileAdapter.updateProfile(operatorId, { appearance: theme });
    if (activeOperatorRef.current === operatorId) {
      setProfile(updated);
      setActiveSheet(null);
      showToast(`Appearance set to ${theme}`);
    }
  };

  const handleToggleNotificationKey = async (key: keyof CustomerProfileData['notifications']) => {
    const updated = await mockProfileAdapter.updateProfile(operatorId, {
      notifications: {
        ...profile.notifications,
        [key]: !profile.notifications[key],
      },
    });
    if (activeOperatorRef.current === operatorId) {
      setProfile(updated);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const updated = await mockProfileAdapter.setDefaultAddress(operatorId, addressId);
    if (activeOperatorRef.current === operatorId) {
      setProfile(updated);
      showToast('Default delivery address updated');
    }
  };

  const handleConfirmLogout = async () => {
    setActiveSheet(null);
    try {
      await logout();
    } catch {
      // Mock development session
    }
    showToast('Signed out of demo session');
    window.setTimeout(() => {
      navigate('/');
    }, 600);
  };

  const avatarInitial = getAvatarInitial(profile.displayName);

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-[#F5F8FB] text-[#111827] select-none flex flex-col items-center">
        <div className="w-full max-w-[430px] min-h-screen bg-[#F5F8FB] relative flex flex-col pb-24">
          <ProfilePageSkeleton onHeaderBack={onHeaderBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#111827] select-none flex flex-col items-center transition-opacity duration-200">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F5F8FB] relative flex flex-col pb-24">
        {/* 1. DEDICATED MINIMAL PROFILE HEADER */}
        <header className="px-4 pt-3.5 pb-2.5 flex items-center gap-3.5 bg-[#F5F8FB]">
          <button
            type="button"
            onClick={() => {
              if (onHeaderBack) {
                onHeaderBack();
              } else {
                navigate('/');
              }
            }}
            aria-label="Go back"
            className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-[#1E2432] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none">
              <path
                d="M19 12H5M11 6l-6 6 6 6"
                stroke="#1E2432"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-[19px] font-bold text-[#111827] tracking-tight leading-none">
            Profile
          </h1>
        </header>

        {/* MAIN PROFILE CONTENT */}
        <main className="flex-1 flex flex-col px-3.5">
          {/* 2. LAVENDER USER HERO CARD */}
          <section
            aria-label="Customer Profile Summary"
            className="mt-1 rounded-[20px] bg-[#EBE8FC] relative overflow-hidden px-3.5 py-3 min-h-[98px] flex items-center shadow-[0_2px_10px_rgba(124,58,237,0.04)]"
          >
            {/* Left Circular Initial Avatar with Warm Cream Gradient & Gold Border */}
            <div
              aria-hidden="true"
              className="w-[60px] h-[60px] rounded-full bg-gradient-to-b from-[#FBF7F0] to-[#F5E9D6] border-[1.8px] border-[#DFB676] shadow-[0_2px_8px_rgba(157,104,27,0.12)] flex items-center justify-center shrink-0 z-10"
            >
              <span className="text-[24px] font-extrabold text-[#9A6311] leading-none">
                {avatarInitial}
              </span>
            </div>

            {/* User Name, Email, and Edit Profile Pill */}
            <div className="ml-3 z-10 flex flex-col items-start min-w-0 pr-[86px]">
              <h2 className="text-[16px] font-extrabold text-[#111827] leading-tight tracking-tight whitespace-nowrap">
                {profile.displayName}
              </h2>
              <p className="text-[11px] font-normal text-[#4B5563] mt-0.5 whitespace-nowrap">
                {profile.email}
              </p>
              <button
                type="button"
                onClick={openEditProfile}
                className="mt-2 bg-[#D7D4F4] hover:bg-[#CBC6EE] active:scale-[0.98] text-[#111827] text-[11.5px] font-semibold pl-3.5 pr-2.5 py-[4.5px] rounded-full inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Edit profile</span>
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
                  <path
                    d="M6 3.5L10.5 8 6 12.5"
                    stroke="#111827"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Right-Side Approved Chef Hat, Noodle Bowl & Coffee Cup Illustration */}
            <img
              src="/assets/profile/hero-food-illustration.png"
              alt="Open Canteen noodles bowl, coffee cup, and chef hat artwork"
              referrerPolicy="no-referrer"
              width="144"
              height="98"
              className="absolute right-0 top-0 bottom-0 h-full w-[144px] object-cover object-right pointer-events-none select-none"
            />
          </section>

          {/* 3. TWO SIDE-BY-SIDE QUICK ACTION CARDS: Your Orders & Help & Support */}
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {/* Your Orders Card */}
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="bg-white rounded-[18px] px-2.5 py-2.5 flex items-center justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:bg-neutral-50/70 active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-[36px] h-[36px] rounded-full bg-[#FCEAEA] flex items-center justify-center shrink-0">
                  {/* Coral Red Order Receipt Icon */}
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none">
                    <path
                      d="M6 3.8A1.8 1.8 0 0 1 7.8 2h6.7L19 6.5v13.7a1.8 1.8 0 0 1-1.8 1.8H7.8A1.8 1.8 0 0 1 6 20.2V3.8Z"
                      stroke="#EF5350"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2v4.8h4.8"
                      stroke="#EF5350"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.2 11.2h5.6M9.2 14.5h5.6M9.2 17.8h3.4"
                      stroke="#EF5350"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#111827] leading-snug whitespace-nowrap">
                    Your Orders
                  </div>
                  <div className="text-[10.5px] font-normal text-[#64748B] mt-0.5 whitespace-nowrap">
                    View past orders
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-0.5" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Help & Support Card */}
            <button
              type="button"
              onClick={() => setActiveSheet('helpSupport')}
              className="bg-white rounded-[18px] px-2.5 py-2.5 flex items-center justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:bg-neutral-50/70 active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-[36px] h-[36px] rounded-full bg-[#FEF6E4] flex items-center justify-center shrink-0">
                  {/* Warm Amber Headset Icon */}
                  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none">
                    <path
                      d="M4.5 13.5V12a7.5 7.5 0 0 1 15 0v1.5"
                      stroke="#D98218"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                    <rect
                      x="3.5"
                      y="12.5"
                      width="3.5"
                      height="5.5"
                      rx="1.75"
                      stroke="#D98218"
                      strokeWidth="1.8"
                    />
                    <rect
                      x="17"
                      y="12.5"
                      width="3.5"
                      height="5.5"
                      rx="1.75"
                      stroke="#D98218"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M18.5 18v.5a2.5 2.5 0 0 1-2.5 2.5h-2.5"
                      stroke="#D98218"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="12.5" cy="21" r="1.2" fill="#D98218" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#111827] leading-snug whitespace-nowrap">
                    Help & Support
                  </div>
                  <div className="text-[10.5px] font-normal text-[#64748B] mt-0.5 whitespace-nowrap">
                    Get quick help
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-0.5" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 4. PREFERENCES SECTION CARD */}
          <section
            aria-label="Preferences"
            className="mt-2.5 bg-white rounded-[20px] pt-2.5 pb-0.5 px-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-center gap-2.5 pb-2">
              <span
                aria-hidden="true"
                className="w-[3.5px] h-[17px] rounded-full bg-[#F25560] shrink-0"
              />
              <h3 className="text-[15px] font-bold text-[#111827] tracking-tight">Preferences</h3>
            </div>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 1: Veg Mode */}
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#EBFAF0] flex items-center justify-center shrink-0">
                  {/* Green Leaf Icon */}
                  <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none">
                    <path
                      d="M19.5 4.5c-6.5 0-11.5 2.5-13.2 7.8-.8 2.4-.3 4.8.7 6.2 1.4 1 3.8 1.5 6.2.7 5.3-1.7 7.8-6.7 6.3-14.7Z"
                      stroke="#16A34A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5 18.5c2.5-2.8 5.8-5.5 9.8-7.5"
                      stroke="#16A34A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    Veg Mode
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Show only vegetarian items
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={profile.vegMode}
                aria-label="Veg Mode"
                onClick={handleToggleVegMode}
                className={`w-[48px] h-[27px] rounded-full p-[2.5px] transition-colors duration-200 flex items-center shrink-0 cursor-pointer ${
                  profile.vegMode ? 'bg-[#19B559] justify-end' : 'bg-[#CBD5E1] justify-start'
                }`}
              >
                <span className="w-[22px] h-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-transform" />
              </button>
            </div>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 2: Notifications */}
            <button
              type="button"
              onClick={() => setActiveSheet('notifications')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#FDF1ED] flex items-center justify-center shrink-0">
                  {/* Coral Bell Icon */}
                  <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none">
                    <path
                      d="M18 9.5a6 6 0 1 0-12 0c0 5.2-2.2 6.8-2.2 6.8h16.4S18 14.7 18 9.5Z"
                      stroke="#F05A4F"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.2 19.5a2 2 0 0 0 3.6 0"
                      stroke="#F05A4F"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    Notifications
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Order updates, offers & more
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B] shrink-0" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 3: Appearance */}
            <button
              type="button"
              onClick={() => setActiveSheet('appearance')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#FEF7E6] flex items-center justify-center shrink-0">
                  {/* Warm Sun Icon */}
                  <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none">
                    <circle cx="12" cy="12" r="4.2" stroke="#D98218" strokeWidth="1.8" />
                    <path
                      d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
                      stroke="#D98218"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    Appearance
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Choose your theme
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[12.5px] font-medium text-[#64748B]">
                  {profile.appearance}
                </span>
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B]" fill="none">
                  <path
                    d="M6 3.5L10.5 8 6 12.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </section>

          {/* 5. YOUR INFORMATION SECTION CARD */}
          <section
            aria-label="Your Information"
            className="mt-2.5 bg-white rounded-[20px] pt-2.5 pb-0.5 px-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-center gap-2.5 pb-2">
              <span
                aria-hidden="true"
                className="w-[3.5px] h-[17px] rounded-full bg-[#F25560] shrink-0"
              />
              <h3 className="text-[15px] font-bold text-[#111827] tracking-tight">
                Your Information
              </h3>
            </div>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 1: Address Book */}
            <button
              type="button"
              onClick={() => {
                setAddressSubView('list');
                setDeleteConfirmAddrId(null);
                setActiveSheet('addressBook');
              }}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#EBFAF0] flex items-center justify-center shrink-0">
                  {/* Green House Icon */}
                  <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none">
                    <path
                      d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z"
                      stroke="#16A34A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 20.5v-6h5v6"
                      stroke="#16A34A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    Address Book
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Manage your saved addresses
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B] shrink-0" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 2: Account Privacy */}
            <button
              type="button"
              onClick={() => setActiveSheet('accountPrivacy')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#FCEAEA] flex items-center justify-center shrink-0">
                  {/* Coral Shield Check Icon */}
                  <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none">
                    <path
                      d="M12 3.5 5 6.5v5.2c0 4.5 3 8.5 7 9.8 4-1.3 7-5.3 7-9.8V6.5l-7-3Z"
                      stroke="#EF4444"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9.2 12.2 2 2 3.8-3.8"
                      stroke="#EF4444"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    Account Privacy
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Manage your data and privacy
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B] shrink-0" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </section>

          {/* 6. MORE SECTION CARD */}
          <section
            aria-label="More"
            className="mt-2.5 bg-white rounded-[20px] pt-2.5 pb-0.5 px-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-center gap-2.5 pb-2">
              <span
                aria-hidden="true"
                className="w-[3.5px] h-[17px] rounded-full bg-[#F25560] shrink-0"
              />
              <h3 className="text-[15px] font-bold text-[#111827] tracking-tight">More</h3>
            </div>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 1: About Your Canteen */}
            <button
              type="button"
              onClick={() => navigate('/profile/about-canteen')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#EBF5FF] flex items-center justify-center shrink-0">
                  <Store className="w-[19px] h-[19px] text-[#0679FC]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    About Your Canteen
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Our story, location &amp; details
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B] shrink-0" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 2: About Open Canteen */}
            <button
              type="button"
              onClick={() => navigate('/profile/about-open-canteen')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#EBFAF0] flex items-center justify-center shrink-0">
                  <Info className="w-[19px] h-[19px] text-[#16A34A]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    About Open Canteen
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Open-source platform &amp; community
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B] shrink-0" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 3: Legal & Policies */}
            <button
              type="button"
              onClick={() => navigate('/profile/legal')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0">
                  <FileText className="w-[19px] h-[19px] text-[#9333EA]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    Legal &amp; Policies
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Privacy, terms &amp; service policies
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B] shrink-0" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="border-b border-[#F1F5F9] ml-[50px]" />

            {/* Row 2: Log out */}
            <button
              type="button"
              onClick={() => setActiveSheet('logoutConfirm')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#FCEAEA] flex items-center justify-center shrink-0">
                  {/* Coral Logout Door & Arrow Icon */}
                  <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none">
                    <path
                      d="M13.5 6.5V5.2A1.7 1.7 0 0 0 11.8 3.5H6.2A1.7 1.7 0 0 0 4.5 5.2v13.6a1.7 1.7 0 0 0 1.7 1.7h5.6a1.7 1.7 0 0 0 1.7-1.7v-1.3"
                      stroke="#EF4444"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 12h9.5m0 0-3-3m3 3-3 3"
                      stroke="#EF4444"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    Log out
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Sign out from your account
                  </div>
                </div>
              </div>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#64748B] shrink-0" fill="none">
                <path
                  d="M6 3.5L10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </section>
        </main>

        {/* 7. DEDICATED BOTTOM-LEFT CORAL FLOATING "<- Home" PILL BUTTON */}
        {!hideFloatingHomePill && (
          <div className="fixed bottom-2.5 left-0 right-0 z-30 pointer-events-none flex justify-center">
            <div className="w-full max-w-[430px] flex justify-start pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  if (onHomeClick) {
                    onHomeClick();
                  } else {
                    navigate('/');
                  }
                }}
                aria-label="Back to Home"
                className="h-[50px] bg-[#F05360] hover:bg-[#E14552] active:scale-[0.98] text-white rounded-l-none rounded-r-full pl-3.5 pr-5 flex items-center gap-2 shadow-[0_4px_14px_rgba(240,83,96,0.38)] transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none">
                  <path
                    d="M19 12H5M11 6l-6 6 6 6"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[14.5px] font-semibold tracking-tight leading-none">
                  Home
                </span>
              </button>
            </div>
          </div>
        )}

        {/* SUBTLE FEEDBACK TOAST */}
        {statusToast && (
          <div
            role="status"
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#1E2432] text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg"
          >
            {statusToast}
          </div>
        )}

        {/* INTERACTIVE BOTTOM SHEETS / MODALS FOR PROFILE CONTROLS */}
        {activeSheet && (
          <div
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => setActiveSheet(null)}
          >
            <div
              ref={sheetDialogRef}
              role="dialog"
              aria-modal="true"
              className={`w-full max-w-[430px] rounded-t-[24px] shadow-2xl relative transition-all ${
                activeSheet === 'accountPrivacy'
                  ? 'bg-[#070A0F] p-3.5 sm:p-4 max-h-[92vh] overflow-y-auto no-scrollbar border-t border-neutral-800'
                  : 'bg-white p-5'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`w-10 h-1.5 rounded-full mx-auto mb-3 ${
                  activeSheet === 'accountPrivacy' ? 'bg-neutral-700' : 'bg-neutral-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                aria-label="Close sheet"
                className={`absolute right-4 top-4 p-1.5 rounded-full transition-colors cursor-pointer z-20 ${
                  activeSheet === 'accountPrivacy'
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {activeSheet === 'editProfile' && (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
                  <h3 className="text-[16px] font-bold text-[#111827]">Edit Profile</h3>
                  <div>
                    <label
                      htmlFor="profile-name-input"
                      className="block text-[12px] font-semibold text-[#475569] mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="profile-name-input"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-[13.5px] text-[#111827] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-email-input"
                      className="block text-[12px] font-semibold text-[#475569] mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="profile-email-input"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-[13.5px] text-[#111827] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-phone-input"
                      className="block text-[12px] font-semibold text-[#475569] mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id="profile-phone-input"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-[13.5px] text-[#111827] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  {editError && (
                    <p className="text-[12px] font-medium text-[#EF4444]">{editError}</p>
                  )}
                  <div className="flex items-center gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-[#475569] text-[13px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#19B559] text-white text-[13px] font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {activeSheet === 'helpSupport' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[16px] font-bold text-[#111827]">Help & Support</h3>
                  <p className="text-[12.5px] text-[#64748B]">
                    Need assistance with an active order or canteen pickup?
                  </p>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 flex flex-col gap-2 text-[12.5px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Canteen Counter Desk</span>
                      {config.contact.supportPhone ? (
                        isDialablePhone(config.contact.supportPhone) ? (
                          <a
                            href={`tel:${config.contact.supportPhone.replace(/[^\d+]/g, '')}`}
                            className="font-bold text-[#111827] hover:underline"
                          >
                            {config.contact.supportPhone}
                          </a>
                        ) : (
                          <span className="font-bold text-[#111827]">
                            {config.contact.supportPhone}
                          </span>
                        )
                      ) : (
                        <span className="text-neutral-400 italic">Available at counter</span>
                      )}
                    </div>
                    {config.contact.supportEmail ? (
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Support Email</span>
                        <a
                          href={`mailto:${config.contact.supportEmail}`}
                          className="font-bold text-[#111827] hover:underline"
                        >
                          {config.contact.supportEmail}
                        </a>
                      </div>
                    ) : null}
                    {config.contact.operatingHours ? (
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Operating Hours</span>
                        <span className="font-medium text-[#111827]">{config.contact.operatingHours}</span>
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-full mt-1 py-2.5 rounded-xl bg-[#111827] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              {activeSheet === 'notifications' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[16px] font-bold text-[#111827]">Notifications</h3>
                  {(
                    [
                      ['orderUpdates', 'Order Status Updates', 'Live token & kitchen preparation alerts'],
                      ['offersAndPromos', 'Offers & Combos', 'Daily student meal deals and discounts'],
                      ['campusSpecials', 'Chef Specials', 'Seasonal items and weekend specials'],
                    ] as const
                  ).map(([key, label, desc]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-b-0"
                    >
                      <div>
                        <div className="text-[13px] font-bold text-[#111827]">{label}</div>
                        <div className="text-[11px] text-[#64748B]">{desc}</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={profile.notifications[key]}
                        aria-label={label}
                        onClick={() => handleToggleNotificationKey(key)}
                        className={`w-[44px] h-[25px] rounded-full p-[2px] flex items-center transition-colors cursor-pointer ${
                          profile.notifications[key]
                            ? 'bg-[#19B559] justify-end'
                            : 'bg-[#CBD5E1] justify-start'
                        }`}
                      >
                        <span className="w-[21px] h-[21px] rounded-full bg-white shadow-xs" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-full mt-1 py-2.5 rounded-xl bg-[#111827] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              {activeSheet === 'appearance' && (
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-[16px] font-bold text-[#111827]">Appearance</h3>
                  <p className="text-[12px] text-[#64748B] mb-1">
                    Choose your preferred display theme for {config.identity.displayName}
                  </p>
                  {(['Light', 'Dark', 'System'] as AppearanceTheme[]).map((themeOption) => (
                    <button
                      key={themeOption}
                      type="button"
                      onClick={() => handleSelectAppearance(themeOption)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between text-[13.5px] font-bold cursor-pointer ${
                        profile.appearance === themeOption
                          ? 'border-[#19B559] bg-[#EBFAF0]/60 text-[#0F6E38]'
                          : 'border-neutral-200 text-[#111827]'
                      }`}
                    >
                      <span>{themeOption}</span>
                      {profile.appearance === themeOption && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}

              {activeSheet === 'addressBook' && (
                <div className="flex flex-col gap-3">
                  {deleteConfirmAddrId ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-[14px]">
                        <AlertCircle className="w-5 h-5" />
                        <span>Delete Address?</span>
                      </div>
                      <p className="text-[12.5px] text-neutral-600">
                        Are you sure you want to remove this delivery address from your profile?
                      </p>
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAddrId(null)}
                          className="flex-1 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-[12.5px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(deleteConfirmAddrId)}
                          className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-[12.5px] font-bold cursor-pointer shadow-xs"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  ) : addressSubView === 'list' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[16px] font-bold text-[#111827]">
                            Saved Campus Addresses
                          </h3>
                          <p className="text-[11.5px] text-[#64748B]">
                            Manage delivery locations for campus orders
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenAddAddress}
                          className="bg-[#EBFAF0] hover:bg-[#D7F5E2] text-[#16A34A] text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New</span>
                        </button>
                      </div>

                      {profile.savedAddresses.length === 0 ? (
                        <div className="py-6 px-4 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                          <p className="text-[13px] font-bold text-[#111827]">
                            No saved addresses yet
                          </p>
                          <p className="text-[11.5px] text-[#64748B] mt-1 max-w-[240px] mx-auto">
                            Add your hostel room or department building to enable fast one-tap delivery.
                          </p>
                          <button
                            type="button"
                            onClick={handleOpenAddAddress}
                            className="mt-3.5 px-4 py-2 bg-[#19B559] text-white text-[12px] font-bold rounded-full shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Address</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
                          {profile.savedAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              className={`p-3 rounded-xl border transition-all ${
                                addr.isDefault
                                  ? 'border-[#19B559] bg-[#EBFAF0]/40 shadow-xs'
                                  : 'border-neutral-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                                    {addr.label}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10.5px] font-bold text-[#16A34A] bg-[#EBFAF0] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                      <Check className="w-3 h-3" />
                                      Default
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {!addr.isDefault && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetDefaultAddress(addr.id)}
                                      className="text-[11px] font-semibold text-[#16A34A] hover:underline cursor-pointer"
                                    >
                                      Set Default
                                    </button>
                                  )}
                                  <button
                                      type="button"
                                      onClick={() => handleOpenEditAddress(addr)}
                                      aria-label={`Edit ${addr.label} address`}
                                      className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmAddrId(addr.id)}
                                      aria-label={`Delete ${addr.label} address`}
                                      className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                              </div>

                              <div className="mt-2 text-[12.5px] font-bold text-[#111827]">
                                {addr.buildingOrGate}
                              </div>
                              <p className="text-[11.5px] text-[#64748B] mt-0.5">
                                {addr.roomOrLandmark}
                              </p>
                              {addr.recipientPhone && (
                                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                  Phone: {addr.recipientPhone}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setActiveSheet(null)}
                        className="w-full mt-1 py-2.5 rounded-xl bg-[#111827] text-white text-[13px] font-bold cursor-pointer"
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    /* ADD OR EDIT ADDRESS FORM */
                    <form onSubmit={handleSaveAddress} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAddressSubView('list')}
                          className="p-1 rounded-full text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-[16px] font-bold text-[#111827]">
                          {addressSubView === 'add' ? 'Add Campus Address' : 'Edit Address'}
                        </h3>
                      </div>

                      {/* Label Selector */}
                      <div>
                        <label className="block text-[11.5px] font-semibold text-[#475569] mb-1.5">
                          Address Type
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['Hostel', 'Department', 'Campus Gate', 'Other'] as const).map(
                            (lbl) => (
                              <button
                                key={lbl}
                                type="button"
                                onClick={() => setAddrLabel(lbl)}
                                className={`py-1.5 px-1 rounded-lg text-[11.5px] font-bold border transition-colors cursor-pointer text-center truncate ${
                                  addrLabel === lbl
                                    ? 'bg-[#19B559] text-white border-[#19B559]'
                                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                {lbl}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Building / Hostel */}
                      <div>
                        <label
                          htmlFor="addr-building-input"
                          className="block text-[11.5px] font-semibold text-[#475569] mb-1"
                        >
                          Hostel, Department, or Gate *
                        </label>
                        <input
                          id="addr-building-input"
                          type="text"
                          value={addrBuilding}
                          onChange={(e) => setAddrBuilding(e.target.value)}
                          placeholder="e.g. Aryabhatta Hostel, Block B"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-[13px] text-[#111827] focus:outline-none focus:border-[#19B559]"
                        />
                      </div>

                      {/* Room / Landmark */}
                      <div>
                        <label
                          htmlFor="addr-room-input"
                          className="block text-[11.5px] font-semibold text-[#475569] mb-1"
                        >
                          Room Number, Lab, or Landmark *
                        </label>
                        <input
                          id="addr-room-input"
                          type="text"
                          value={addrRoom}
                          onChange={(e) => setAddrRoom(e.target.value)}
                          placeholder="e.g. Room 304, Near Main Mess"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-[13px] text-[#111827] focus:outline-none focus:border-[#19B559]"
                        />
                      </div>

                      {/* Recipient Phone */}
                      <div>
                        <label
                          htmlFor="addr-phone-input"
                          className="block text-[11.5px] font-semibold text-[#475569] mb-1"
                        >
                          Recipient Contact Number (Optional)
                        </label>
                        <input
                          id="addr-phone-input"
                          type="tel"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-[13px] text-[#111827] focus:outline-none focus:border-[#19B559]"
                        />
                      </div>

                      {/* Default Address Checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer mt-0.5">
                        <input
                          type="checkbox"
                          checked={addrIsDefault}
                          onChange={(e) => setAddrIsDefault(e.target.checked)}
                          className="w-4 h-4 rounded text-[#19B559] focus:ring-[#19B559] border-neutral-300"
                        />
                        <span className="text-[12px] font-medium text-neutral-700">
                          Set as default delivery address
                        </span>
                      </label>

                      {addrError && (
                        <p className="text-[12px] font-medium text-[#EF4444]">{addrError}</p>
                      )}

                      <div className="flex items-center gap-2.5 mt-2">
                        <button
                          type="button"
                          onClick={() => setAddressSubView('list')}
                          className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-[#475569] text-[13px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl bg-[#19B559] text-white text-[13px] font-bold cursor-pointer shadow-xs"
                        >
                          {addressSubView === 'add' ? 'Save Address' : 'Update Address'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeSheet === 'accountPrivacy' && (
                <AccountPrivacyView
                  isSheet
                  onClose={() => setActiveSheet(null)}
                  onNavigateSheet={(sheet) => {
                    if (sheet === 'addressBook') {
                      setAddressSubView('list');
                      setDeleteConfirmAddrId(null);
                    }
                    setActiveSheet(sheet);
                  }}
                />
              )}

              {(activeSheet === 'aboutCanteen' || activeSheet === 'aboutCampora') && (
                <div className="flex flex-col gap-3">
                  {config.identity.id === 'open-canteen' && (
                    <div className="mb-0.5">
                      <OpenCanteenBrandMark variant="full" className="h-8 w-auto" />
                    </div>
                  )}
                  <h3 className="text-[16px] font-bold text-[#111827]">{config.content.aboutTitle}</h3>
                  <p className="text-[12.5px] text-[#64748B] leading-relaxed">
                    {config.content.aboutBody}
                  </p>
                  {config.identity.id !== 'open-canteen' && (
                    <div className="pt-2.5 mt-1 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Platform: Powered by Open Canteen</span>
                      <OpenCanteenBrandMark variant="icon" className="h-4 w-4" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-full mt-1 py-2.5 rounded-xl bg-[#111827] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}

              {activeSheet === 'logoutConfirm' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[16px] font-bold text-[#111827]">
                    Log out of {config.identity.displayName}?
                  </h3>
                  <p className="text-[12.5px] text-[#64748B]">
                    You can sign back in anytime to view your past orders and saved preferences.
                  </p>
                  <div className="flex items-center gap-2.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setActiveSheet(null)}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-[#475569] text-[13px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmLogout}
                      className="flex-1 py-2.5 rounded-xl bg-[#F05360] text-white text-[13px] font-bold cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

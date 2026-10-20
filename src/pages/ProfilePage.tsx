import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  mockProfileDataProvider,
  getAvatarInitial,
  validateProfileUpdate,
  type CustomerProfileData,
  type AppearanceTheme,
} from '../utils/profileData.ts';
import {
  readCanonicalVegPreference,
  writeCanonicalVegPreference,
} from '../utils/vegModeTransition.ts';

type ActiveSheet =
  | null
  | 'editProfile'
  | 'helpSupport'
  | 'notifications'
  | 'appearance'
  | 'addressBook'
  | 'accountPrivacy'
  | 'aboutCampora'
  | 'logoutConfirm';

const STORAGE_KEY = 'campora_mock_profile_v1';

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
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CustomerProfileData>(() => {
    let baseProfile = mockProfileDataProvider.getProfile();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        baseProfile = JSON.parse(saved);
      } catch {
        baseProfile = mockProfileDataProvider.getProfile();
      }
    }
    const syncedVegMode = readCanonicalVegPreference(baseProfile.vegMode);
    return {
      ...baseProfile,
      vegMode: syncedVegMode,
    };
  });

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [editName, setEditName] = useState(profile.displayName);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phoneNumber);
  const [editError, setEditError] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const persistProfile = (next: CustomerProfileData) => {
    setProfile(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const showToast = (msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const handleToggleVegMode = () => {
    const updated = mockProfileDataProvider.toggleVegMode(profile);
    persistProfile(updated);
    writeCanonicalVegPreference(updated.vegMode);
  };

  const openEditProfile = () => {
    setEditName(profile.displayName);
    setEditEmail(profile.email);
    setEditPhone(profile.phoneNumber);
    setEditError(null);
    setActiveSheet('editProfile');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfileUpdate({ displayName: editName, email: editEmail });
    if (!validation.valid) {
      setEditError(validation.error || 'Invalid input');
      return;
    }
    const updated = mockProfileDataProvider.updateProfileInfo(profile, {
      displayName: editName,
      email: editEmail,
      phoneNumber: editPhone,
    });
    persistProfile(updated);
    setActiveSheet(null);
    showToast('Profile updated');
  };

  const handleSelectAppearance = (theme: AppearanceTheme) => {
    const updated = mockProfileDataProvider.updateAppearance(profile, theme);
    persistProfile(updated);
    setActiveSheet(null);
    showToast(`Appearance set to ${theme}`);
  };

  const handleToggleNotificationKey = (key: keyof CustomerProfileData['notifications']) => {
    const updated = mockProfileDataProvider.updateNotifications(profile, {
      [key]: !profile.notifications[key],
    });
    persistProfile(updated);
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const updated: CustomerProfileData = {
      ...profile,
      savedAddresses: profile.savedAddresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    };
    persistProfile(updated);
    showToast('Default delivery address updated');
  };

  const handleConfirmLogout = () => {
    setActiveSheet(null);
    showToast('Signed out of demo session');
    window.setTimeout(() => {
      navigate('/');
    }, 600);
  };

  const avatarInitial = getAvatarInitial(profile.displayName);

  return (
    <div className="min-h-screen bg-[#F5F8FB] text-[#111827] select-none flex flex-col items-center">
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
              alt="Campora Café noodles bowl, coffee cup, and chef hat artwork"
              referrerPolicy="no-referrer"
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
              onClick={() => setActiveSheet('addressBook')}
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

            {/* Row 1: About Campora Café */}
            <button
              type="button"
              onClick={() => setActiveSheet('aboutCampora')}
              className="w-full py-2 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#EBF5FF] flex items-center justify-center shrink-0">
                  {/* Blue Info Circle Icon */}
                  <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none">
                    <circle cx="12" cy="12" r="8.2" stroke="#0679FC" strokeWidth="1.8" />
                    <path
                      d="M12 11.2v4.8"
                      stroke="#0679FC"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="8.2" r="1.1" fill="#0679FC" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    About Campora Café
                  </div>
                  <div className="text-[11.5px] font-normal text-[#64748B] mt-0.5">
                    Our story, values and more
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
          <div className="fixed bottom-4 left-0 right-0 z-30 pointer-events-none flex justify-center">
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
                className="bg-[#F05360] hover:bg-[#E14552] active:scale-[0.98] text-white rounded-l-none rounded-r-full pl-3.5 pr-5 py-2.5 flex items-center gap-2 shadow-[0_4px_14px_rgba(240,83,96,0.38)] transition-all cursor-pointer"
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
              role="dialog"
              aria-modal="true"
              className="w-full max-w-[430px] bg-white rounded-t-[24px] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4" />

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
                    Need assistance with an active canteen order or campus delivery?
                  </p>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 flex flex-col gap-2 text-[12.5px]">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Canteen Counter Desk</span>
                      <span className="font-bold text-[#111827]">+91 1800-CAMPORA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Support Email</span>
                      <span className="font-bold text-[#111827]">help@camporacafe.in</span>
                    </div>
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
                    Choose your preferred display theme for Campora Café
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
                  <h3 className="text-[16px] font-bold text-[#111827]">Saved Campus Addresses</h3>
                  {profile.savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        addr.isDefault
                          ? 'border-[#19B559] bg-[#EBFAF0]/40'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#111827]">
                          {addr.label} · {addr.buildingOrGate}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[11px] font-bold text-[#16A34A]">Default</span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#64748B] mt-0.5">{addr.roomOrLandmark}</p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-full mt-1 py-2.5 rounded-xl bg-[#111827] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}

              {activeSheet === 'accountPrivacy' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[16px] font-bold text-[#111827]">Account Privacy</h3>
                  <p className="text-[12.5px] text-[#64748B] leading-relaxed">
                    Your order history, saved hostel addresses, and dietary preferences are stored
                    solely for fulfilling your Campora Café orders on campus.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSheet(null)}
                    className="w-full mt-1 py-2.5 rounded-xl bg-[#111827] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              )}

              {activeSheet === 'aboutCampora' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[16px] font-bold text-[#111827]">About Campora Café</h3>
                  <p className="text-[12.5px] text-[#64748B] leading-relaxed">
                    Good Food • Great Moods. Campora Café brings fresh, hygienic, and fast
                    dine-in, takeaway, and hostel delivery meals crafted for campus life.
                  </p>
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
                  <h3 className="text-[16px] font-bold text-[#111827]">Log out of Campora Café?</h3>
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

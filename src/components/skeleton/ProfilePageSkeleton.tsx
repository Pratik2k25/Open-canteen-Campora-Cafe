import React from 'react';
import { SkeletonBlock } from './SkeletonBlock.tsx';
import { SkeletonCircle } from './SkeletonCircle.tsx';

interface ProfilePageSkeletonProps {
  className?: string;
  onHeaderBack?: () => void;
}

export const ProfilePageSkeleton: React.FC<ProfilePageSkeletonProps> = ({
  className = '',
  onHeaderBack,
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading your profile..."
      className={`w-full max-w-[430px] min-h-screen bg-[#F5F8FB] text-[#111827] select-none flex flex-col relative pb-24 ${className}`}
    >
      <span className="sr-only">Loading user profile and account details...</span>

      {/* 1. DEDICATED MINIMAL PROFILE HEADER SKELETON */}
      {/* Show ONLY Back-arrow and Profile title placeholder. NO Campora logo, location, or hamburger */}
      <header className="px-4 pt-3.5 pb-2.5 flex items-center gap-3.5 bg-[#F5F8FB]">
        <button
          type="button"
          onClick={onHeaderBack}
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
        <SkeletonBlock className="w-18 h-[20px] rounded-md" />
      </header>

      {/* MAIN PROFILE CONTENT SKELETON */}
      <main className="flex-1 flex flex-col px-3.5">
        {/* 2. LAVENDER USER HERO CARD SKELETON */}
        <section
          aria-label="Customer Profile Summary Loading"
          className="mt-1 rounded-[20px] bg-[#EBE8FC] relative overflow-hidden px-3.5 py-3 min-h-[98px] flex items-center shadow-[0_2px_10px_rgba(124,58,237,0.04)]"
        >
          {/* Left Circular Initial Avatar with Cream Gradient & Gold Border */}
          <div
            aria-hidden="true"
            className="w-[60px] h-[60px] rounded-full bg-gradient-to-b from-[#FBF7F0] to-[#F5E9D6] border-[1.8px] border-[#DFB676] shadow-[0_2px_8px_rgba(157,104,27,0.12)] flex items-center justify-center shrink-0 z-10"
          >
            <SkeletonCircle size={44} className="bg-[#DFB676]/30" tint="amber" />
          </div>

          {/* User Name, Email, and Edit Profile Pill */}
          <div className="ml-3 z-10 flex flex-col items-start min-w-0 pr-[86px] gap-1">
            <SkeletonBlock
              tint="lavender"
              className="w-28 h-[16px] rounded bg-[#7C3AED]/20"
            />
            <SkeletonBlock
              tint="lavender"
              className="w-36 h-[11px] rounded bg-[#7C3AED]/15 mt-0.5"
            />
            <SkeletonBlock
              tint="lavender"
              className="w-24 h-[22px] rounded-full bg-[#D7D4F4] mt-1.5"
            />
          </div>

          {/* Right-Side Food Artwork Silhouette Placeholder */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 bottom-0 h-full w-[140px] bg-gradient-to-l from-white/40 to-transparent rounded-l-2xl pointer-events-none"
          />
        </section>

        {/* 3. TWO SIDE-BY-SIDE QUICK ACTION CARDS: Your Orders & Help & Support */}
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {/* Your Orders Card Skeleton */}
          <div className="bg-white rounded-[18px] px-2.5 py-2.5 flex items-center justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2 min-w-0">
              <SkeletonCircle size={36} className="bg-[#FCEAEA]" />
              <div className="flex flex-col gap-1 min-w-0">
                <SkeletonBlock className="w-16 h-[12px] rounded" />
                <SkeletonBlock className="w-20 h-[10px] rounded" />
              </div>
            </div>
            <SkeletonBlock className="w-3 h-3 rounded ml-0.5 opacity-60" />
          </div>

          {/* Help & Support Card Skeleton */}
          <div className="bg-white rounded-[18px] px-2.5 py-2.5 flex items-center justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2 min-w-0">
              <SkeletonCircle size={36} className="bg-[#FEF6E4]" />
              <div className="flex flex-col gap-1 min-w-0">
                <SkeletonBlock className="w-18 h-[12px] rounded" />
                <SkeletonBlock className="w-16 h-[10px] rounded" />
              </div>
            </div>
            <SkeletonBlock className="w-3 h-3 rounded ml-0.5 opacity-60" />
          </div>
        </div>

        {/* 4. PREFERENCES SECTION SKELETON (3 rows) */}
        <section
          aria-label="Preferences Loading"
          className="mt-2.5 bg-white rounded-[20px] pt-2.5 pb-1 px-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
        >
          <div className="flex items-center gap-2.5 pb-2">
            <span
              aria-hidden="true"
              className="w-[3.5px] h-[17px] rounded-full bg-[#F25560] shrink-0"
            />
            <SkeletonBlock className="w-24 h-[15px] rounded" />
          </div>
          <div className="border-b border-[#F1F5F9] ml-[50px]" />

          {/* 3 Preference Rows */}
          {[1, 2, 3].map((r) => (
            <div key={r} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonCircle size={28} className="bg-neutral-100" />
                <SkeletonBlock className="w-24 h-[12px] rounded" />
              </div>
              <SkeletonBlock className="w-8 h-[18px] rounded-full" />
            </div>
          ))}
        </section>

        {/* 5. YOUR INFORMATION SECTION SKELETON (2 rows) */}
        <section
          aria-label="Your Information Loading"
          className="mt-2.5 bg-white rounded-[20px] pt-2.5 pb-1 px-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
        >
          <div className="flex items-center gap-2.5 pb-2">
            <span
              aria-hidden="true"
              className="w-[3.5px] h-[17px] rounded-full bg-[#F25560] shrink-0"
            />
            <SkeletonBlock className="w-28 h-[15px] rounded" />
          </div>
          <div className="border-b border-[#F1F5F9] ml-[50px]" />

          {[1, 2].map((r) => (
            <div key={r} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonCircle size={28} className="bg-neutral-100" />
                <SkeletonBlock className="w-24 h-[12px] rounded" />
              </div>
              <SkeletonBlock className="w-3.5 h-3.5 rounded opacity-60" />
            </div>
          ))}
        </section>

        {/* 6. MORE SECTION SKELETON (2 rows) */}
        <section
          aria-label="More Information Loading"
          className="mt-2.5 bg-white rounded-[20px] pt-2.5 pb-1 px-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
        >
          <div className="flex items-center gap-2.5 pb-2">
            <span
              aria-hidden="true"
              className="w-[3.5px] h-[17px] rounded-full bg-[#F25560] shrink-0"
            />
            <SkeletonBlock className="w-16 h-[15px] rounded" />
          </div>
          <div className="border-b border-[#F1F5F9] ml-[50px]" />

          {[1, 2].map((r) => (
            <div key={r} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonCircle size={28} className="bg-neutral-100" />
                <SkeletonBlock className="w-28 h-[12px] rounded" />
              </div>
              <SkeletonBlock className="w-3.5 h-3.5 rounded opacity-60" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

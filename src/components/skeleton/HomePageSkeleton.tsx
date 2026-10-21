import React from 'react';
import { SkeletonBlock } from './SkeletonBlock.tsx';
import { SkeletonCircle } from './SkeletonCircle.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useCanteen } from '../../context/CanteenContext.tsx';
import { getServiceTheme } from '../../utils/serviceTheme.ts';

interface HomePageSkeletonProps {
  className?: string;
}

export const HomePageSkeleton: React.FC<HomePageSkeletonProps> = ({ className = '' }) => {
  const { serviceMode } = useCart();
  const theme = getServiceTheme(serviceMode);
  const { config } = useCanteen();
  const displayName = config.identity.displayName || 'Canteen';

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={`Loading ${displayName} menu...`}
      className={`w-full max-w-[430px] min-h-screen bg-white flex flex-col relative select-none ${className}`}
    >
      <span className="sr-only">Loading {displayName} menu and services...</span>

      {/* 1. Header Skeleton matching Header.tsx height and layout */}
      <header className="w-full bg-[#F8F9FA] px-4 pt-3 pb-2 z-30">
        <div className="flex items-center justify-between">
          {/* Logo placeholder */}
          <div className="flex flex-col -mt-1">
            <SkeletonBlock className="w-[142px] h-[36px] rounded-lg" />
            <SkeletonBlock className="w-[84px] h-[10px] rounded mt-1 opacity-70" />
          </div>

          {/* Right Action Icons: Notification Bell & Hamburger Menu placeholders */}
          <div className="flex items-center gap-2.5">
            <SkeletonCircle size={40} className="bg-white border border-neutral-200/70" />
            <SkeletonCircle size={40} className="bg-white border border-neutral-200/70" />
          </div>
        </div>

        {/* Location Row Skeleton */}
        <div className="mt-2.5 flex items-center gap-2">
          <SkeletonCircle size={16} className="bg-[#136B3C]/30" />
          <SkeletonBlock className="w-[210px] h-[14px] rounded-md" />
          <SkeletonBlock className="w-[14px] h-[14px] rounded-md opacity-60" />
        </div>
      </header>

      {/* ZONE A — THEME-AWARE CONNECTED REGION */}
      <section
        aria-label="Service mode, categories and filters loading"
        className="w-full flex flex-col"
      >
        {/* 2. Connected Mountain-Shaped Service Mode Selector Skeleton */}
        {/* Preserves the exact 933x174 aspect ratio, organic mountain curve, and 3 tab segments */}
        <div className="bg-[#F8F9FA]">
          <div className="relative w-full aspect-[933/173] overflow-hidden">
            <svg
              viewBox="0 0 933 174"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              {/* Inactive Tabs */}
              {serviceMode !== 'delivery' && (
                <path
                  d="M 580 174 L 619 46 C 623 22, 638 10, 665 10 L 866 10 C 892 10, 904 22, 908 46 L 921 124 C 925 150, 929 164, 933 170 L 933 174 Z"
                  fill="#DEF0FE"
                  opacity="0.75"
                />
              )}
              {serviceMode !== 'takeaway' && (
                <path
                  d="M 290 174 L 326 46 C 330 22, 345 10, 372 10 L 574 10 C 600 10, 613 22, 617 46 L 635 134 C 641 158, 658 172, 684 174 Z"
                  fill="#FAF0E7"
                  opacity="0.75"
                />
              )}
              {serviceMode !== 'dinein' && (
                <path
                  d="M 0 174 L 0 169 C 18 163, 30 144, 31 116 L 32 46 C 32 22, 48 10, 74 10 L 280 10 C 306 10, 320 22, 324 46 L 344 134 C 350 158, 368 172, 396 174 Z"
                  fill="#D2F8E1"
                  opacity="0.75"
                />
              )}

              {/* Active Mountain Layer */}
              {serviceMode === 'dinein' && (
                <>
                  <path
                    d="M 0 174 L 0 169 C 18 163, 30 144, 31 116 L 32 46 C 32 22, 48 10, 74 10 L 280 10 C 306 10, 320 22, 324 46 L 344 134 C 350 158, 368 172, 396 174 Z"
                    fill="#D2F8E1"
                  />
                  <path
                    d="M 0 169 C 18 163, 30 144, 31 116 L 32 46 C 32 22, 48 10, 74 10 L 280 10 C 306 10, 320 22, 324 46 L 344 134 C 350 158, 368 172, 396 173 L 660 173"
                    fill="none"
                    stroke="#36B871"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </>
              )}
              {serviceMode === 'takeaway' && (
                <>
                  <path
                    d="M 262 174 C 288 172, 305 158, 311 134 L 326 46 C 330 22, 345 10, 372 10 L 574 10 C 600 10, 613 22, 617 46 L 635 134 C 641 158, 658 172, 684 174 Z"
                    fill="#FAF0E7"
                  />
                  <path
                    d="M 262 173 C 288 172, 305 158, 311 134 L 326 46 C 330 22, 345 10, 372 10 L 574 10 C 600 10, 613 22, 617 46 L 635 134 C 641 158, 658 172, 684 173"
                    fill="none"
                    stroke="#E29B61"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </>
              )}
              {serviceMode === 'delivery' && (
                <>
                  <path
                    d="M 552 174 C 578 172, 595 158, 601 134 L 619 46 C 623 22, 638 10, 665 10 L 866 10 C 892 10, 904 22, 908 46 L 921 124 C 925 150, 929 164, 933 170 L 933 174 Z"
                    fill="#DEF0FE"
                  />
                  <path
                    d="M 552 173 C 578 172, 595 158, 601 134 L 619 46 C 623 22, 638 10, 665 10 L 866 10 C 892 10, 904 22, 908 46 L 921 124 C 925 150, 929 164, 933 170"
                    fill="none"
                    stroke="#5BA8E6"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>

            {/* Subtle Illustration and Label Skeletons within Mountain coordinate positions */}
            <div className="relative z-10 w-full h-full flex items-center justify-between px-6 pb-2">
              <div className="flex flex-col items-center w-[30%] gap-1 mt-4">
                <SkeletonCircle size={38} className="bg-white/60" />
                <SkeletonBlock className="w-12 h-2.5 rounded bg-black/15" />
              </div>
              <div className="flex flex-col items-center w-[30%] gap-1 mt-4">
                <SkeletonCircle size={36} className="bg-white/60" />
                <SkeletonBlock className="w-14 h-2.5 rounded bg-black/15" />
              </div>
              <div className="flex flex-col items-center w-[30%] gap-1 mt-4">
                <SkeletonCircle size={36} className="bg-white/60" />
                <SkeletonBlock className="w-13 h-2.5 rounded bg-black/15" />
              </div>
            </div>
          </div>
        </div>

        {/* Connected Dynamic Service-Themed Surface */}
        <div className={`w-full -mt-[1px] ${theme.zoneABgClass}`}>
          {/* 3. Search Bar & VEG Toggle Row */}
          <div className="w-full px-[15px] pt-[6px] pb-[6px] flex items-center gap-[7px]">
            {/* Search Bar Skeleton */}
            <div className="flex-1 h-[41px] flex items-center bg-white rounded-[14px] px-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] gap-2.5">
              <SkeletonCircle size={18} className="bg-[#0E6E3B]/25" />
              <SkeletonBlock className="w-36 h-[14px] rounded-md bg-[#E9ECEF]" />
            </div>

            {/* VEG Toggle Card Skeleton */}
            <div className="shrink-0 w-[41px] h-[41px] flex flex-col items-center justify-center bg-white rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-1 gap-1">
              <SkeletonBlock className="w-5 h-[9px] rounded bg-neutral-300" />
              <SkeletonBlock className="w-[28px] h-[13px] rounded-full bg-neutral-200" />
            </div>
          </div>

          {/* 4. Category Carousel Skeleton */}
          <div className="w-full pt-1.5 pb-1">
            <div className="flex items-start justify-between gap-1.5 overflow-x-hidden px-3.5">
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="flex flex-col items-center shrink-0 min-w-[44px]">
                  <SkeletonCircle size={44} className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]" />
                  <SkeletonBlock className="w-8 h-[9px] rounded bg-black/10 mt-1" />
                  {idx === 0 ? (
                    <div className="w-11 h-[2.5px] bg-[#E52521]/60 rounded-full mt-1" />
                  ) : (
                    <div className="w-11 h-[2.5px] bg-transparent mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Filter Chips Skeleton */}
          <div className="w-full px-3.5 pt-1 pb-2.5">
            <div className="flex items-center justify-between gap-1 overflow-x-hidden py-0.5">
              <SkeletonBlock className="shrink-0 w-[64px] h-[26px] rounded-full bg-white shadow-xs" />
              <SkeletonBlock className="shrink-0 w-[78px] h-[26px] rounded-full bg-white shadow-xs" />
              <SkeletonBlock className="shrink-0 w-[116px] h-[26px] rounded-full bg-white shadow-xs" />
              <SkeletonBlock className="shrink-0 w-[68px] h-[26px] rounded-full bg-white shadow-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* ZONE B — WHITE PRODUCT GRID SKELETON */}
      <main className="bg-white px-3.5 pt-2.5 pb-24 flex-1">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div
              key={id}
              className="bg-white rounded-[16px] overflow-hidden border border-neutral-200/75 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex flex-col justify-between"
            >
              {/* Food Image Placeholder (exact 416:172 aspect ratio) */}
              <div className="relative w-full aspect-[416/172] bg-[#E9ECEF] overflow-hidden">
                <SkeletonBlock className="w-full h-full" />
              </div>

              {/* Card Details below image */}
              <div className="px-2.5 pt-1.5 pb-2 flex flex-col justify-between">
                {/* Title line */}
                <SkeletonBlock className="w-3/4 h-[13px] rounded-md" />

                {/* Bottom Row: Price + Prep time on left, ADD pill on right */}
                <div className="mt-2 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="w-9 h-[13px] rounded" />
                    <SkeletonBlock className="w-11 h-[10px] rounded" />
                  </div>
                  {/* Service themed ADD Pill placeholder */}
                  <SkeletonBlock
                    className={`w-11 h-[22px] rounded-full ${theme.addButtonBgClass} opacity-60`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

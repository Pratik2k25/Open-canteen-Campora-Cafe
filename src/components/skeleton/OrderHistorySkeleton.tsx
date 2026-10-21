import React from 'react';
import { SkeletonBlock } from './SkeletonBlock.tsx';
import { SkeletonCircle } from './SkeletonCircle.tsx';

interface OrderHistorySkeletonProps {
  className?: string;
}

export const OrderHistorySkeleton: React.FC<OrderHistorySkeletonProps> = ({
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading your order history..."
      className={`w-full max-w-[430px] min-h-screen bg-[#FCFCFC] flex flex-col relative select-none ${className}`}
    >
      <span className="sr-only">Loading your orders...</span>

      {/* 1. Header Skeleton matching OrdersPage header */}
      <header className="w-full bg-[#F8F9FA] px-4 pt-3 pb-2 z-30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col -mt-1">
            <SkeletonBlock className="w-[142px] h-[36px] rounded-lg" />
            <SkeletonBlock className="w-[84px] h-[10px] rounded mt-1 opacity-70" />
          </div>
          <div className="flex items-center gap-2.5">
            <SkeletonCircle size={40} className="bg-white border border-neutral-200/70" />
            <SkeletonCircle size={40} className="bg-white border border-neutral-200/70" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <SkeletonCircle size={16} className="bg-[#136B3C]/30" />
          <SkeletonBlock className="w-[210px] h-[14px] rounded-md" />
          <SkeletonBlock className="w-[14px] h-[14px] rounded-md opacity-60" />
        </div>
      </header>

      {/* 2. My Orders Mint Hero Banner Skeleton */}
      <section
        aria-label="My Orders Banner Loading"
        className="mx-3 mt-1 rounded-[16px] bg-[#E9FBF1] pl-3 pr-2 py-2 flex items-center justify-between min-h-[62px] h-[62px]"
      >
        <div className="flex items-center gap-2.5">
          <SkeletonBlock
            tint="mint"
            className="w-[40px] h-[42px] rounded-[10px] bg-white/70"
          />
          <div className="flex flex-col gap-1">
            <SkeletonBlock
              tint="mint"
              className="w-24 h-[16px] rounded bg-[#0B8A44]/20"
            />
            <SkeletonBlock
              tint="mint"
              className="w-36 h-[10px] rounded bg-[#0B8A44]/15"
            />
          </div>
        </div>

        <SkeletonBlock
          tint="mint"
          className="h-[52px] w-[50px] rounded-xl bg-white/60"
        />
      </section>

      {/* 3. Segmented Tabs Bar Skeleton: All Orders / Cancelled */}
      <div
        role="tablist"
        aria-label="Order Filter Tabs Loading"
        className="mx-3 mt-2.5 bg-white rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-neutral-100/90 grid grid-cols-2 relative"
      >
        {/* Left Tab: All Orders Active skeleton */}
        <div className="relative flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#E8FBF1]">
          <SkeletonCircle size={16} className="bg-[#0B8A44]/30" tint="mint" />
          <SkeletonBlock className="w-18 h-[13px] rounded bg-[#0B8A44]/25" tint="mint" />
          <span className="absolute -bottom-1 left-5 right-5 h-[2.5px] bg-[#0B8A44]/60 rounded-full" />
        </div>

        {/* Right Tab: Cancelled Inactive skeleton */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-full">
          <SkeletonCircle size={16} className="bg-neutral-300" />
          <SkeletonBlock className="w-16 h-[13px] rounded bg-neutral-200" />
        </div>
      </div>

      {/* 4. Order Cards Skeleton List */}
      <main className="flex-1 flex flex-col px-3 pt-2.5 pb-24 gap-2">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-[15px] px-2.5 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-neutral-100/95 flex items-center gap-3"
          >
            {/* Left Rounded Square Food Thumbnail */}
            <div className="w-[78px] h-[78px] rounded-[11px] overflow-hidden shrink-0 bg-neutral-100">
              <SkeletonBlock className="w-full h-full" />
            </div>

            {/* Right Order Details Column */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              {/* Top Row: Order Number + Status Pill */}
              <div className="flex items-center justify-between gap-2">
                <SkeletonBlock className="w-24 h-[14px] rounded" />
                <SkeletonBlock className="w-20 h-[19px] rounded-full" />
              </div>

              {/* Date & Time Row */}
              <div className="flex items-center gap-1.5 mt-1">
                <SkeletonCircle size={12} className="bg-neutral-300" />
                <SkeletonBlock className="w-28 h-[10px] rounded" />
              </div>

              {/* Service Mode Pill Badge */}
              <div className="mt-1 flex items-center">
                <SkeletonBlock className="w-16 h-[16px] rounded-full" />
              </div>

              {/* Bottom Row: Items Summary + Total Price */}
              <div className="mt-1 flex items-center justify-between">
                <SkeletonBlock className="w-36 h-[10px] rounded" />
                <SkeletonBlock className="w-12 h-[14px] rounded font-bold" />
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

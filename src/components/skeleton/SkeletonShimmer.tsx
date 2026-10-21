import React from 'react';

interface SkeletonShimmerProps {
  className?: string;
  tint?: 'neutral' | 'mint' | 'lavender' | 'amber';
}

export const SkeletonShimmer: React.FC<SkeletonShimmerProps> = ({
  className = '',
  tint = 'neutral',
}) => {
  const gradientClass =
    tint === 'mint'
      ? 'from-transparent via-[#E8FBF1]/80 to-transparent'
      : tint === 'lavender'
      ? 'from-transparent via-[#F2EEFD]/80 to-transparent'
      : tint === 'amber'
      ? 'from-transparent via-[#FFF7ED]/80 to-transparent'
      : 'from-transparent via-[#F7F8F9]/70 to-transparent';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 -translate-x-full bg-gradient-to-r ${gradientClass} animate-shimmer pointer-events-none ${className}`}
    />
  );
};

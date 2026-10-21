import React from 'react';
import { SkeletonShimmer } from './SkeletonShimmer.tsx';

interface SkeletonCircleProps {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
  shimmer?: boolean;
  tint?: 'neutral' | 'mint' | 'lavender' | 'amber';
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  className = '',
  size,
  style,
  shimmer = true,
  tint = 'neutral',
}) => {
  const dynamicStyle: React.CSSProperties = {
    ...style,
    ...(size ? { width: size, height: size } : {}),
  };

  return (
    <div
      aria-hidden="true"
      style={dynamicStyle}
      className={`relative overflow-hidden rounded-full bg-[#E9ECEF] shrink-0 select-none ${className}`}
    >
      {shimmer && <SkeletonShimmer tint={tint} />}
    </div>
  );
};

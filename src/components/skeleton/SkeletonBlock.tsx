import React from 'react';
import { SkeletonShimmer } from './SkeletonShimmer.tsx';

interface SkeletonBlockProps {
  className?: string;
  style?: React.CSSProperties;
  shimmer?: boolean;
  tint?: 'neutral' | 'mint' | 'lavender' | 'amber';
  children?: React.ReactNode;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = '',
  style,
  shimmer = true,
  tint = 'neutral',
  children,
}) => {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`relative overflow-hidden bg-[#E9ECEF] select-none ${className}`}
    >
      {shimmer && <SkeletonShimmer tint={tint} />}
      {children}
    </div>
  );
};

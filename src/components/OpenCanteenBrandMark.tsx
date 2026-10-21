import React from 'react';
import { OPEN_CANTEEN_BRAND } from '../config/brandAssets.ts';

export type BrandLogoVariant = 'full' | 'icon' | 'app-icon';

export interface OpenCanteenBrandMarkProps {
  /** Logo variant to display (default: 'full') */
  readonly variant?: BrandLogoVariant;
  /** Presentation theme: 'light' | 'dark' | 'contrast' */
  readonly theme?: 'light' | 'dark' | 'contrast';
  /** Optional custom CSS classes for the image */
  readonly className?: string;
  /** Optional container CSS classes */
  readonly containerClassName?: string;
  /** Optional alt text override */
  readonly alt?: string;
  /** Optional click handler */
  readonly onClick?: () => void;
}

/**
 * Open Canteen Approved Brand Mark Component
 * Renders the approved parent brand identity in full, standalone, or app-icon variants
 * with automatic contrast protection on dark backgrounds.
 */
export const OpenCanteenBrandMark: React.FC<OpenCanteenBrandMarkProps> = ({
  variant = 'full',
  theme = 'light',
  className = '',
  containerClassName = '',
  alt,
  onClick,
}) => {
  const asset =
    variant === 'icon'
      ? OPEN_CANTEEN_BRAND.variants.standaloneIcon
      : variant === 'app-icon'
        ? OPEN_CANTEEN_BRAND.variants.appIcon
        : OPEN_CANTEEN_BRAND.variants.fullLogo;

  const altText = alt ?? asset.alt;

  // On dark surfaces, full logo and standalone icon receive a clean, minimal
  // high-contrast backing so the deep emerald green and orange flames pop legibly.
  const isDark = theme === 'dark' || theme === 'contrast';
  const contrastContainerClass = isDark
    ? 'bg-white/95 backdrop-blur-xs rounded-xl px-2.5 py-1 shadow-xs inline-flex items-center'
    : 'inline-flex items-center';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`${contrastContainerClass} ${containerClassName}`}
    >
      <img
        src={asset.path}
        alt={altText}
        width={variant === 'full' ? 168 : 44}
        height={variant === 'full' ? 44 : 44}
        className={`object-contain select-none ${className}`}
        loading="eager"
      />
    </div>
  );
};

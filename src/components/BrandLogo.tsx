/**
 * OPEN CANTEEN — BRAND LOGO COMPONENT
 * Stage 1 · Step 1.2 · Task 1.2.3
 *
 * Accessible, configuration-driven brand logo with URL-scoped error handling
 * and a premium typographic monogram fallback for unbranded / custom canteens.
 */

import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import type { CanteenIdentity, CanteenBranding } from '../types/index.ts';

export interface BrandLogoProps {
  /** Optional identity override (defaults to active context identity) */
  readonly identity?: CanteenIdentity;
  /** Optional branding override (defaults to active context branding) */
  readonly branding?: CanteenBranding;
  /** Optional custom container CSS classes */
  readonly className?: string;
  /** Optional click handler (e.g. navigate to home) */
  readonly onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  identity: identityProp,
  branding: brandingProp,
  className = '',
  onClick,
}) => {
  const context = useCanteen();
  const identity = identityProp ?? context.config.identity;
  const branding = brandingProp ?? context.config.branding;

  // Track the specific failed URL to ensure changing logoUrl resets error state cleanly
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const hasImageError = Boolean(identity.logoUrl && failedUrl === identity.logoUrl);
  const shouldShowImage = Boolean(identity.logoUrl && !hasImageError);

  const altText = identity.tagline
    ? `${identity.displayName} - ${identity.tagline}`
    : identity.displayName;

  return (
    <div
      onClick={onClick}
      className={`flex items-center cursor-pointer select-none ${className}`}
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
      aria-label={altText}
    >
      {shouldShowImage ? (
        /* MODE A: Configured Brand Image Logo */
        <img
          src={identity.logoUrl}
          alt={altText}
          width="168"
          height="50"
          className="h-[50px] w-auto object-contain object-left -mt-1"
          onError={() => {
            if (identity.logoUrl) {
              setFailedUrl(identity.logoUrl);
            }
          }}
        />
      ) : (
        /* MODE B: Typographic Monogram Fallback */
        <div
          className="flex items-center gap-2.5 h-[50px] max-w-[210px]"
          role="img"
          aria-label={altText}
        >
          {/* Monogram Badge */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-black text-sm tracking-wider uppercase"
            style={{
              backgroundColor: branding.primaryColor || '#166534',
              color: branding.primaryTextColor || '#FFFFFF',
            }}
            aria-hidden="true"
          >
            {identity.monogram || 'OC'}
          </div>

          {/* Display Name and Optional Tagline */}
          <div className="flex flex-col min-w-0 justify-center">
            <span className="text-[16px] font-extrabold text-neutral-900 tracking-tight leading-none truncate">
              {identity.displayName}
            </span>
            {identity.tagline ? (
              <span className="text-[10px] font-semibold text-neutral-500 tracking-normal leading-tight mt-1 truncate">
                {identity.tagline}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

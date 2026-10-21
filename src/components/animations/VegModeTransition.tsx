import React from 'react';
import { useCanteen } from '../../context/CanteenContext.tsx';
import {
  getVegTransitionVisualConfig,
  VEG_TRANSITION_TIMING,
  type VegTransitionPhase,
  type VegTransitionOrigin,
  type VegTransitionVisualConfig,
} from '../../utils/vegModeTransition.ts';

/**
 * 1. ExpandingCircle — Renders the three translucent concentric wave circles expanding softly around the center emblem
 */
export const ExpandingCircle: React.FC<{
  config: VegTransitionVisualConfig;
  runId: number;
}> = ({ config, runId }) => {
  return (
    <div
      key={`ripples-${runId}`}
      data-testid="veg-transition-ripples"
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* Outer Concentric Wave Circle */}
      <div
        style={{ backgroundColor: config.outerRingHex }}
        className="animate-veg-ripple-outer absolute w-[386px] h-[386px] rounded-full"
      />
      {/* Middle Concentric Wave Circle */}
      <div
        style={{ backgroundColor: config.midRingHex }}
        className="animate-veg-ripple-mid absolute w-[264px] h-[264px] rounded-full"
      />
      {/* Inner Concentric Wave Circle */}
      <div
        style={{ backgroundColor: config.innerRingHex }}
        className="animate-veg-ripple-inner absolute w-[178px] h-[178px] rounded-full"
      />
    </div>
  );
};

/**
 * 2. VegetarianEmblem — Renders the double-ring circular badge with the Campora leaf/bean crest and stacked VEG MODE / ALL FOOD title
 */
export const VegetarianEmblem: React.FC<{
  config: VegTransitionVisualConfig;
  runId: number;
}> = ({ config, runId }) => {
  return (
    <div
      key={`emblem-${runId}`}
      data-testid="veg-transition-emblem"
      style={{ backgroundColor: config.badgeBgHex }}
      className="animate-veg-emblem relative w-[116px] h-[116px] rounded-full shadow-[0_8px_24px_rgba(8,116,85,0.16)] flex items-center justify-center select-none"
    >
      {/* Crisp White Inner Ring */}
      <div
        aria-hidden="true"
        className="absolute inset-[5px] rounded-full border-[2px] border-white/95 pointer-events-none"
      />

      {/* Emblem Content: Top Botanical Leaf/Bean Crest + Two-Line Stacked Label */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white text-center -mt-0.5">
        <svg
          viewBox="0 0 24 24"
          className="w-[15px] h-[15px] mb-1 text-white"
          fill="none"
          aria-hidden="true"
        >
          {/* Tilted botanical leaf / coffee-bean emblem matching reference video */}
          <path
            d="M17.2 5.2C13.1 4.4 8.2 6.8 6.4 10.9c-1.5 3.3-.6 6.8 2.1 7.9 2.7 1.1 6.3-.5 8.1-3.8 1.9-3.5 1.9-7.8.6-9.8Z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.6 17.6c1.9-3.9 5.1-7.4 9.1-10.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <span
          data-testid="veg-transition-badge-line1"
          className="text-[18.5px] font-extrabold tracking-[0.04em] leading-[1.06] uppercase"
        >
          {config.badgeLine1}
        </span>
        <span
          data-testid="veg-transition-badge-line2"
          className="text-[18.5px] font-extrabold tracking-[0.04em] leading-[1.06] uppercase"
        >
          {config.badgeLine2}
        </span>
      </div>
    </div>
  );
};

/**
 * 3. ModeMessage — Renders the supporting message below the emblem and the bottom CAMPORA CAFÉ wordmark
 */
export const ModeMessage: React.FC<{
  config: VegTransitionVisualConfig;
}> = ({ config }) => {
  return (
    <div className="relative z-10 mt-[26px] text-center px-6">
      <span className="sr-only">
        {config.ariaHeading} — {config.secondaryCaption}
      </span>
      <p
        data-testid="veg-transition-subtitle"
        style={{ color: config.subtitleColorHex }}
        className="text-[12.5px] font-medium tracking-[-0.01em] leading-snug"
      >
        {config.subtitle}
      </p>
    </div>
  );
};

export interface VegModeTransitionProps {
  phase: VegTransitionPhase;
  targetVegOnly: boolean;
  runId: number;
  origin?: VegTransitionOrigin | null;
  brandName?: string;
}

/**
 * 4. VegModeTransitionOverlay — Dedicated full-screen circular reveal overlay for VEG Mode ON / OFF transitions.
 * - Covers the entire screen including header, product grid, floating cart, and bottom navigation.
 * - Completely unmounts when `phase === 'idle'`.
 */
export const VegModeTransitionOverlay: React.FC<VegModeTransitionProps> = ({
  phase,
  targetVegOnly,
  runId,
  origin,
  brandName: propBrandName,
}) => {
  if (phase === 'idle') {
    return null;
  }

  // Dynamically resolve brand name from active CanteenConfig if not supplied via prop
  let resolvedBrand = propBrandName;
  try {
    const { config: canteenConfig } = useCanteen();
    if (!resolvedBrand && canteenConfig?.identity?.displayName) {
      resolvedBrand = canteenConfig.identity.displayName;
    }
  } catch {
    // Graceful fallback if rendered outside CanteenProvider (e.g. isolated test environments)
  }

  const config = getVegTransitionVisualConfig(targetVegOnly, resolvedBrand);
  const originX = origin ? `${Math.round(origin.x)}px` : 'calc(50% + 165px)';
  const originY = origin ? `${Math.round(origin.y)}px` : '232px';

  const isCovering = phase === 'covering';
  const isRevealing = phase === 'revealing';

  const clipPathStyle = `circle(150% at ${originX} ${originY})`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${config.ariaHeading}: ${config.subtitle}`}
      data-testid="veg-mode-transition-overlay"
      data-transition-phase={phase}
      data-transition-direction={config.direction}
      style={{
        backgroundColor: config.overlayBgHex,
        clipPath: clipPathStyle,
        animation: isCovering
          ? `camporaVegCircleReveal ${VEG_TRANSITION_TIMING.coverDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`
          : undefined,
        opacity: isRevealing ? 0 : 1,
        transition: isRevealing
          ? `opacity ${VEG_TRANSITION_TIMING.revealDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`
          : undefined,
        ['--veg-origin-x' as string]: originX,
        ['--veg-origin-y' as string]: originY,
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
    >
      {/* Center Composition Wrapper slightly above geometric midpoint to match reference video optical center */}
      <div className="relative flex flex-col items-center justify-center -translate-y-4">
        <div className="relative flex items-center justify-center w-[116px] h-[116px]">
          <ExpandingCircle config={config} runId={runId} />
          <VegetarianEmblem config={config} runId={runId} />
        </div>
        <ModeMessage config={config} />
      </div>

      {/* Bottom Brand Wordmark anchored near the bottom of the full-screen overlay */}
      <div
        data-testid="veg-transition-footer"
        style={{ color: config.footerColorHex }}
        className="absolute bottom-11 left-0 right-0 text-center text-[10.5px] font-extrabold tracking-[0.16em] uppercase pointer-events-none"
      >
        {config.brandFooter}
      </div>
    </div>
  );
};

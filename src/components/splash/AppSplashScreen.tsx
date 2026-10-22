/**
 * OPEN CANTEEN — APP SPLASH SCREEN
 *
 * Plays the approved Open Canteen animated logo video once per session as a
 * full-screen startup overlay, then fades cleanly into the actual application.
 *
 * Lifecycle:
 *   - Renders above the React app on first document load of the session.
 *   - Dismissed on: video ended | autoplay blocked | load error | watchdog | skip.
 *   - sessionStorage flag `oc_splash_seen` prevents replay on SPA navigation.
 *   - Respects `prefers-reduced-motion` — skips immediately when enabled.
 *   - Never blocks access to the application even if playback fails.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Public URL of the approved splash video — served from the same origin. */
const SPLASH_VIDEO_SRC = '/assets/animations/open-canteen-splash.mp4';

/**
 * Session-storage key.
 * sessionStorage clears on every new browser tab / PWA cold launch.
 * It survives in-session navigation (SPA route changes), preventing replay.
 */
const SESSION_KEY = 'oc_splash_seen';

/** Maximum time (ms) the splash may be visible before the watchdog dismisses it. */
const WATCHDOG_MS = 8000;

/** Duration (ms) of the CSS opacity fade-out transition before unmount. */
const FADE_OUT_MS = 220;

// ─── Hook: should we show the splash? ────────────────────────────────────────

/**
 * Returns true if the splash should play in this session.
 * The check is synchronous and performed once at render time.
 */
function useShouldShowSplash(): boolean {
  // Honour prefers-reduced-motion immediately — no video, no delay.
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
  }

  // sessionStorage check: if already seen in this session, skip.
  try {
    if (
      typeof window !== 'undefined' &&
      window.sessionStorage &&
      window.sessionStorage.getItem(SESSION_KEY) === '1'
    ) {
      return false;
    }
  } catch {
    // sessionStorage blocked (private mode restrictions etc.) — show splash anyway.
  }

  return true;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AppSplashScreenProps {
  /** Called when the splash has finished and should be unmounted by the parent. */
  onComplete: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const completedRef = useRef(false);

  /** Mark session as seen and trigger the fade-out → unmount sequence. */
  const dismiss = useCallback(() => {
    // Guard: dismiss only once, even if multiple events fire.
    if (completedRef.current) return;
    completedRef.current = true;

    // Persist the "seen" flag before unmounting.
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }

    // Clear watchdog.
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }

    // Pause and release the video element immediately to free memory.
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // Begin CSS fade.
    setFadingOut(true);

    // Unmount after fade completes.
    const fadeTimer = window.setTimeout(() => {
      onComplete();
    }, FADE_OUT_MS + 20); // small buffer beyond CSS transition

    return () => clearTimeout(fadeTimer);
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      dismiss();
      return;
    }

    // ── Watchdog: ensures splash never hangs indefinitely. ──────────────────
    watchdogRef.current = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.warn('[AppSplashScreen] Watchdog fired — forcing dismiss after', WATCHDOG_MS, 'ms');
      }
      dismiss();
    }, WATCHDOG_MS);

    // ── Video event handlers ─────────────────────────────────────────────────

    /** Natural completion — ideal path. */
    const handleEnded = () => dismiss();

    /**
     * Error loading or decoding the video.
     * Log in dev, proceed to app silently in production.
     */
    const handleError = () => {
      if (import.meta.env.DEV) {
        console.warn('[AppSplashScreen] Video load/decode error — falling back immediately.');
      }
      dismiss();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // ── Autoplay: attempt to play, handle browser rejection gracefully. ──────
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay blocked (common on desktop without interaction).
        // Dismiss immediately so the user reaches the app.
        if (import.meta.env.DEV) {
          console.warn('[AppSplashScreen] Autoplay rejected:', err.message);
        }
        dismiss();
      });
    }

    return () => {
      // Cleanup on unmount (e.g. React strict-mode double-invoke in dev).
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      if (watchdogRef.current !== null) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      video.pause();
    };
  }, [dismiss]);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-testid="app-splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Video uses a clean white/off-white background — match exactly.
        backgroundColor: '#FFFFFF',
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? `opacity ${FADE_OUT_MS}ms ease-out` : 'none',
        // Prevent touch/pointer interaction with the underlying app during splash.
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/*
        Video element
        - autoPlay / muted / playsInline: required for silent autoplay across all browsers & iOS.
        - preload="auto": start buffering immediately; video is local so no bandwidth concern.
        - object-fit: contain: preserves 9:16 ratio on any viewport without cropping.
      */}
      <video
        ref={videoRef}
        src={SPLASH_VIDEO_SRC}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={false}
        disablePictureInPicture
        aria-hidden="true"
        style={{
          display: 'block',
          // On phones: fill the screen height; on wider viewports: contained 9:16.
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          // No controls, no interaction artifacts.
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/*
        Accessible skip button — visible on keyboard focus, works on touch.
        Positioned at the bottom of the screen, outside the video area.
      */}
      <button
        type="button"
        aria-label="Skip intro animation"
        onClick={dismiss}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dismiss();
          }
        }}
        style={{
          position: 'absolute',
          bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
          right: '1.25rem',
          padding: '0.375rem 0.875rem',
          borderRadius: '999px',
          border: '1px solid rgba(0,0,0,0.12)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontSize: '12px',
          fontWeight: 600,
          color: '#374151',
          cursor: 'pointer',
          opacity: 0,
          // Reveal only on keyboard focus (accessibility), invisible otherwise.
        }}
        onFocus={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onBlur={(e) => {
          e.currentTarget.style.opacity = '0';
        }}
      >
        Skip
      </button>
    </div>
  );
};

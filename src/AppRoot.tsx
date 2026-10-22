/**
 * OPEN CANTEEN — APPLICATION ROOT WITH SPLASH
 *
 * Wraps the main <App> with the startup splash screen.
 * The splash is:
 *   - Evaluated synchronously at first render (session-storage check).
 *   - Mounted above the app with z-index 9999.
 *   - Unmounted cleanly after the video ends + fade transition completes.
 *   - Never shown again during the current browser session (SPA navigation).
 *
 * <App> stays mounted throughout — its contexts, router, and data layer
 * initialize in parallel while the video plays, so there is no blank gap
 * when the splash lifts.
 */

import React, { useState } from 'react';
import App from './App.tsx';
import { AppSplashScreen } from './components/splash/AppSplashScreen.tsx';

// Evaluate once, outside any component, so it never re-runs on re-renders.
function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false;

  // Skip for users who prefer reduced motion.
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  } catch {
    // matchMedia not supported — proceed.
  }

  // Skip if already seen in this browser session.
  try {
    if (window.sessionStorage.getItem('oc_splash_seen') === '1') return false;
  } catch {
    // sessionStorage blocked — show splash anyway.
  }

  return true;
}

const INITIAL_SHOW_SPLASH = shouldShowSplash();

export default function AppRoot(): React.ReactElement {
  // True while the splash overlay is mounted and visible.
  const [splashVisible, setSplashVisible] = useState<boolean>(INITIAL_SHOW_SPLASH);

  return (
    <>
      {/*
        The real application always mounts immediately.
        It initialises its router, contexts, and data hydration
        in the background while the splash plays.
      */}
      <App />

      {/*
        Splash overlay sits above the app.
        Unmounted after the video ends + fade-out completes.
      */}
      {splashVisible && (
        <AppSplashScreen onComplete={() => setSplashVisible(false)} />
      )}
    </>
  );
}

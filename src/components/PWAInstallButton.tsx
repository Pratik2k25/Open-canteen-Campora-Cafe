import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { useCanteen } from '../context/CanteenContext.tsx';

export const PWAInstallButton: React.FC = () => {
  const { config } = useCanteen();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const appTitle = config?.pwa?.appName || config?.identity?.displayName || 'Open Canteen';

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label={`Install ${appTitle} application`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#136B3C] text-white text-[11px] font-bold shadow-xs hover:bg-[#0e542e] active:scale-95 transition cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label={`Show iOS installation instructions for ${appTitle}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-neutral-300 text-neutral-700 text-[11px] font-semibold hover:bg-neutral-50 cursor-pointer"
        >
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
          >
            <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl text-center">
              <h3 id="ios-install-title" className="text-sm font-bold text-neutral-900">
                Install {appTitle}
              </h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                1. Tap the <strong className="text-neutral-800">Share</strong> icon in Safari.<br />
                2. Select <strong className="text-neutral-800">Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-neutral-100 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-200 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

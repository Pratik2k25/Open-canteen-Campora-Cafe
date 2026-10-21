import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export interface PwaUpdatePromptProps {
  /** Test override: force prompt to appear for functional verification */
  forceShowForTesting?: boolean;
  /** Test override: mock reload callback */
  onMockUpdate?: () => void;
  /** Test override: mock dismiss callback */
  onMockDismiss?: () => void;
}

export const PwaUpdatePrompt: React.FC<PwaUpdatePromptProps> = ({
  forceShowForTesting = false,
  onMockUpdate,
  onMockDismiss,
}) => {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // useRegisterSW hooks into vite-plugin-pwa runtime registration
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodically check for SW updates every 60 minutes
        setInterval(() => {
          r.update().catch((err) => console.warn('[PWA] Check update failed:', err));
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Registration error:', error);
    },
  });

  // Reset dismissal if a completely new update is signaled
  useEffect(() => {
    if (needRefresh) {
      setDismissed(false);
    }
  }, [needRefresh]);

  // Expose manual test trigger on window in dev
  useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      (window as any).__triggerPwaUpdatePrompt = () => {
        setNeedRefresh(true);
        setDismissed(false);
      };
    }
  }, [setNeedRefresh]);

  const isQuerySimulated = location.search.includes('pwa-update=true');
  const shouldShow = (needRefresh || forceShowForTesting || isQuerySimulated) && !dismissed;

  // Active checkout protection: do not interrupt user while entering details or submitting order
  const isCheckoutActive = location.pathname.startsWith('/checkout');

  if (!shouldShow || isCheckoutActive) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    if (onMockUpdate) {
      onMockUpdate();
      return;
    }
    try {
      await updateServiceWorker(true);
    } catch (err) {
      console.error('[PWA] Service worker update failed:', err);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onMockDismiss) {
      onMockDismiss();
    }
  };

  return (
    <aside
      role="region"
      aria-label="Application Update Notice"
      data-testid="pwa-update-prompt"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px] rounded-2xl bg-neutral-900/95 backdrop-blur-md text-white p-3.5 shadow-2xl border border-neutral-700/80 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FF5C38]/20 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5 border border-[#FF5C38]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-white tracking-tight leading-tight">
              New Version Available
            </h4>
            <p className="text-[11.5px] text-neutral-300 mt-0.5 leading-snug">
              Update now for the latest menu items, features, and performance improvements.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss update notification for now"
          className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white text-[12px] font-semibold hover:bg-neutral-800 transition cursor-pointer"
        >
          Later
        </button>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF5C38] hover:bg-[#e04826] active:scale-95 text-white text-[12px] font-bold shadow-md shadow-[#FF5C38]/25 transition cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'Updating...' : 'Update Now'}</span>
        </button>
      </div>
    </aside>
  );
};

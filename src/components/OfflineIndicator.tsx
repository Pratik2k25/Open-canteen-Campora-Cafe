import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export interface OfflineIndicatorProps {
  /** Optional test override to simulate offline state */
  forceOfflineForTesting?: boolean;
  /** Custom notification message (defaults to 'Offline Mode — Showing cached data') */
  message?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  forceOfflineForTesting = false,
  message = 'Offline Mode — Showing cached data',
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isQueryOffline = typeof window !== 'undefined' && window.location.search.includes('offline=true');
  const shouldShowOffline = !isOnline || forceOfflineForTesting || isQueryOffline;

  if (!shouldShowOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-indicator"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-neutral-900/95 backdrop-blur-md px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-lg border border-neutral-700/80 animate-in fade-in duration-200"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

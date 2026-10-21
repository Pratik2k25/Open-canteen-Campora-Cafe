import { useState, useEffect, useRef } from 'react';

export type PageKey = 'home' | 'orders' | 'profile';
export type PageReadiness = 'idle' | 'preparing' | 'ready' | 'error';

// In-memory cache of pages that have completed their initial cold preparation
const readyPagesCache = new Set<PageKey>();

export function isPageWarm(pageKey: PageKey): boolean {
  return readyPagesCache.has(pageKey);
}

export function markPageWarm(pageKey: PageKey): void {
  readyPagesCache.add(pageKey);
}

export function clearPageReadinessCache(): void {
  readyPagesCache.clear();
}

interface UsePageReadinessOptions {
  pageKey: PageKey;
  // External readiness condition (e.g. data loaded from Firestore or mock)
  isDataReady?: boolean;
  // Optional delay simulation when ?throttle=1 or ?slow=1 is in URL for testing
  simulateSlowMs?: number;
}

export interface UsePageReadinessResult {
  readiness: PageReadiness;
  isReady: boolean;
  showSkeleton: boolean;
  isWarm: boolean;
}

export function usePageReadiness({
  pageKey,
  isDataReady = true,
  simulateSlowMs,
}: UsePageReadinessOptions): UsePageReadinessResult {
  const isForcedCold =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).has('cold') ||
      new URLSearchParams(window.location.search).has('slow') ||
      new URLSearchParams(window.location.search).has('throttle'));

  const isInitiallyWarm = !isForcedCold && readyPagesCache.has(pageKey);

  // If already warm, immediately start as ready
  const [readiness, setReadiness] = useState<PageReadiness>(
    isInitiallyWarm ? 'ready' : 'preparing'
  );
  // Controls whether the skeleton should actually be painted
  const [showSkeleton, setShowSkeleton] = useState<boolean>(!isInitiallyWarm);

  const thresholdTimerRef = useRef<number | null>(null);
  const prepTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check URL parameters for explicit test simulation (?throttle=1, ?cold=1)
    let extraDelay = 0;
    let forceCold = false;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      forceCold = params.has('cold') || params.has('slow') || params.has('throttle');
      if (params.get('throttle') === '1' || params.get('slow') === '1') {
        extraDelay = simulateSlowMs || 1000;
      } else if (params.get('cold') === '1') {
        extraDelay = 600;
      }
    }

    if (forceCold) {
      readyPagesCache.delete(pageKey);
      setReadiness('preparing');
      setShowSkeleton(true);
    } else if (readyPagesCache.has(pageKey)) {
      setReadiness('ready');
      setShowSkeleton(false);
      return;
    } else {
      // Threshold timer: don't flash skeleton if ready in < 120ms
      const thresholdMs = 120;
      thresholdTimerRef.current = window.setTimeout(() => {
        if (!readyPagesCache.has(pageKey)) {
          setShowSkeleton(true);
        }
      }, thresholdMs);
    }

    // Prepare content (fonts, critical layout metrics, images)
    const prepDuration = extraDelay > 0 ? extraDelay : 180;
    prepTimerRef.current = window.setTimeout(() => {
      if (isDataReady) {
        readyPagesCache.add(pageKey);
        setReadiness('ready');
        setShowSkeleton(false);
      }
    }, prepDuration);

    return () => {
      if (thresholdTimerRef.current) clearTimeout(thresholdTimerRef.current);
      if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
    };
  }, [pageKey, isDataReady, simulateSlowMs]);

  return {
    readiness,
    isReady: readiness === 'ready',
    showSkeleton: showSkeleton && readiness !== 'ready',
    isWarm: isInitiallyWarm,
  };
}

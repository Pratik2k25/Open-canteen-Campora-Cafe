import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Header } from '../components/Header.tsx';
import { ServiceSelector } from '../components/ServiceSelector.tsx';
import { SearchBarAndVeg } from '../components/SearchBarAndVeg.tsx';
import { CategoryCarousel } from '../components/CategoryCarousel.tsx';
import { FilterChips, type FilterKey } from '../components/FilterChips.tsx';
import { FoodCard } from '../components/FoodCard.tsx';
import { FloatingCart } from '../components/FloatingCart.tsx';
import { BottomNavigation } from '../components/BottomNavigation.tsx';
import { ServiceIncompatibilityModal } from '../components/ServiceIncompatibilityModal.tsx';
import { OfflineIndicator } from '../components/OfflineIndicator.tsx';
import { VegModeTransitionOverlay } from '../components/animations/VegModeTransition.tsx';
import { MENU_ITEMS } from '../data/menuData.ts';
import { useCanteen } from '../context/CanteenContext.tsx';
import { useCanteenCatalog } from '../hooks/useCanteenCatalog.ts';
import { useCart } from '../context/CartContext.tsx';
import { getServiceTheme } from '../utils/serviceTheme.ts';
import { useAccessibleDialog } from '../utils/useAccessibleDialog.ts';
import {
  readCanonicalVegPreference,
  writeCanonicalVegPreference,
  filterMenuItemsForHome,
  syncVegFilterChip,
  createInitialVegTransitionState,
  beginVegModeTransition,
  commitCoveredVegModeState,
  beginRevealVegModeState,
  completeVegModeTransition,
  VEG_TRANSITION_TIMING,
  type VegTransitionOrigin,
} from '../utils/vegModeTransition.ts';
import { HomePageSkeleton } from '../components/skeleton/HomePageSkeleton.tsx';
import { usePageReadiness } from '../hooks/usePageReadiness.ts';
import type { MenuItem } from '../types/index.ts';

interface HomePageProps {
  hideBottomNav?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ hideBottomNav = false }) => {
  const { config } = useCanteen();
  const operatorId = config?.identity?.id || 'campora-cafe';
  const { isReady, showSkeleton } = usePageReadiness({ pageKey: 'home' });
  const { serviceMode } = useCart();
  const { items: catalogItems, categories: catalogCategories } = useCanteenCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [vegMachine, setVegMachine] = useState(() =>
    createInitialVegTransitionState(readCanonicalVegPreference(false, undefined, operatorId))
  );
  const [transitionOrigin, setTransitionOrigin] = useState<VegTransitionOrigin | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>(() =>
    syncVegFilterChip([], readCanonicalVegPreference(false, undefined, operatorId))
  );
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const prevOperatorRef = useRef(operatorId);
  const timersRef = useRef<number[]>([]);

  // Reset category, search, and dietary state cleanly when canteen operator changes at runtime
  useEffect(() => {
    if (prevOperatorRef.current !== operatorId) {
      setSelectedCategory('all');
      setSearchQuery('');
      setSelectedProduct(null);
      const operatorVeg = readCanonicalVegPreference(false, undefined, operatorId);
      setVegMachine(createInitialVegTransitionState(operatorVeg));
      setActiveFilters((prev) => syncVegFilterChip(prev.filter((f) => f !== 'vegOnly'), operatorVeg));
      prevOperatorRef.current = operatorId;
    }
  }, [operatorId]);

  const clearTransitionTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTransitionTimers();
    };
  }, [clearTransitionTimers]);

  // Schedule state-machine steps whenever a new transition run begins (keyed strictly by runId)
  useEffect(() => {
    if (vegMachine.runId === 0 || vegMachine.phase === 'idle') return;

    clearTransitionTimers();
    const activeRunId = vegMachine.runId;

    const coverTimer = window.setTimeout(() => {
      setVegMachine((prev) => commitCoveredVegModeState(prev, activeRunId));
    }, VEG_TRANSITION_TIMING.coverDurationMs);

    const revealTimer = window.setTimeout(() => {
      setVegMachine((prev) => beginRevealVegModeState(prev, activeRunId));
    }, VEG_TRANSITION_TIMING.coverDurationMs + VEG_TRANSITION_TIMING.holdDurationMs);

    const completeTimer = window.setTimeout(() => {
      setVegMachine((prev) => completeVegModeTransition(prev, activeRunId));
    }, VEG_TRANSITION_TIMING.totalDurationMs);

    timersRef.current = [coverTimer, revealTimer, completeTimer];

    return () => {
      clearTransitionTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vegMachine.runId, clearTransitionTimers]);

  const theme = getServiceTheme(serviceMode);

  const triggerVegPreferenceChange = useCallback(
    (nextVegOnly: boolean, origin?: VegTransitionOrigin) => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (origin) {
        setTransitionOrigin(origin);
      } else if (typeof document !== 'undefined') {
        const toggleEl = document.querySelector('[data-testid="veg-toggle-btn"]');
        if (toggleEl) {
          const rect = toggleEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setTransitionOrigin({
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            });
          }
        }
      }

      writeCanonicalVegPreference(nextVegOnly, undefined, operatorId);
      setActiveFilters((prev) => syncVegFilterChip(prev, nextVegOnly));
      setVegMachine((prev) => beginVegModeTransition(prev, nextVegOnly, prefersReducedMotion));
    },
    [operatorId]
  );

  const handleToggleVeg = useCallback(
    (origin?: VegTransitionOrigin) => {
      triggerVegPreferenceChange(!vegMachine.toggleVegOnly, origin);
    },
    [vegMachine.toggleVegOnly, triggerVegPreferenceChange]
  );

  // Accessible dialog hook for product quick modal: Escape, focus trap, and focus restoration
  const productDialogRef = useAccessibleDialog({
    isOpen: Boolean(selectedProduct),
    onClose: () => setSelectedProduct(null),
  });

  // Toggle filter chip
  const handleToggleFilter = (key: FilterKey) => {
    if (key === 'vegOnly') {
      handleToggleVeg();
      return;
    }

    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Filter items using `displayedVegOnly` so the menu grid updates behind the full-screen circular transition
  const activeItems = catalogItems || [];
  const filteredItems = useMemo(() => {
    return filterMenuItemsForHome(activeItems, {
      searchQuery,
      selectedCategory,
      isVegOnly: vegMachine.displayedVegOnly,
      activeFilters,
      serviceMode,
    });
  }, [activeItems, searchQuery, selectedCategory, vegMachine.displayedVegOnly, activeFilters, serviceMode]);

  const isTransitionActive = vegMachine.phase !== 'idle';

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-neutral-900 pb-28 flex flex-col items-center">
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-sm">
          <HomePageSkeleton />
          {!hideBottomNav && <BottomNavigation />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-neutral-900 pb-28 flex flex-col items-center transition-opacity duration-200">
      {/* Mobile Wrapper enforcing Android mobile proportion */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-sm">
        {/* Offline indicator */}
        <OfflineIndicator />

        {/* 1. Branded Header */}
        <Header />

        {/* ZONE A — DYNAMIC SERVICE-THEMED BACKGROUND */}
        {/* Starts at the organic service-selector section and continues through Search+VEG, Categories, and Filter Chips */}
        <section
          aria-label="Service mode, search, categories, and filters"
          data-zone="zone-a-service-themed"
          data-service-mode={serviceMode}
          className="w-full flex flex-col"
        >
          {/* 2. Organic Mountain-Shaped Service Mode Selector: Dinein, Takeaway, Delivery */}
          <div className="bg-[#F8F9FA]">
            <ServiceSelector />
          </div>

          {/* Connected Dynamic Service-Themed Surface (Search, Category Carousel, Filter Chips) */}
          <div
            className={`w-full -mt-[1px] transition-colors duration-200 ${theme.zoneABgClass}`}
          >
            {/* 3. Search Bar & VEG Toggle Switch */}
            <SearchBarAndVeg
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isVegOnly={vegMachine.toggleVegOnly}
              onToggleVeg={handleToggleVeg}
            />

            {/* 4. Food Category Carousel */}
            <CategoryCarousel
              categories={catalogCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* 5. Filter Chips */}
            <FilterChips
              activeFilters={activeFilters}
              onToggleFilter={handleToggleFilter}
            />
          </div>
        </section>

        {/* ZONE B — WHITE PRODUCT-GRID BACKGROUND */}
        <main
          data-zone="zone-b-product-grid"
          data-veg-mode={vegMachine.displayedVegOnly ? 'veg-only' : 'all-items'}
          className={`bg-white px-3.5 pt-2.5 pb-24 flex-1 ${
            isTransitionActive ? 'pointer-events-none' : ''
          }`}
        >
          {activeItems.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-[#EBE8FC] flex items-center justify-center text-[#7C3AED] mb-3.5 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7">
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h4 className="text-[16px] font-bold text-neutral-800">Menu coming soon</h4>
              <p className="text-[12.5px] text-neutral-500 mt-1.5 max-w-[260px] leading-relaxed">
                {config.identity.displayName} is currently updating its menu catalog. Please check back shortly!
              </p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3" data-testid="home-product-grid">
              {filteredItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onCardClick={() => setSelectedProduct(item)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="text-[14px] font-bold text-neutral-800">No dishes found</h4>
              <p className="text-[12px] text-neutral-500 mt-1 max-w-[200px]">
                Try adjusting your search or clearing active filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  if (vegMachine.toggleVegOnly) {
                    triggerVegPreferenceChange(false);
                  }
                  setActiveFilters([]);
                }}
                className="mt-3 text-[12px] font-bold text-[#136B3C] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>

        {/* Floating Animated Cart */}
        <FloatingCart />

        {/* Custom Approved Bottom Navigation */}
        {!hideBottomNav && <BottomNavigation />}

        {/* Dedicated Phase 5 Full-Screen VEG Mode Circular Reveal Overlay */}
        <VegModeTransitionOverlay
          phase={vegMachine.phase}
          targetVegOnly={vegMachine.toggleVegOnly}
          runId={vegMachine.runId}
          origin={transitionOrigin}
        />

        {/* Service Incompatibility Resolution Modal */}
        <ServiceIncompatibilityModal />

        {/* Minimal Product Quick Modal (if card clicked) */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              ref={productDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Close product details"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 id="product-modal-title" className="text-lg font-bold text-neutral-900">{selectedProduct.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
                <span className="text-lg font-black text-neutral-900">
                  ₹{selectedProduct.price}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-xs font-semibold text-neutral-500">
                  Prep time: {selectedProduct.preparationTime}
                </span>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-[#136B3C] text-white text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

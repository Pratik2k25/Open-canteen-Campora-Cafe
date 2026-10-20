import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation.tsx';
import { ProfilePage } from '../pages/ProfilePage.tsx';
import {
  computeNavState,
  resolveProfileBackTarget,
} from '../utils/navigationState.ts';

interface CustomerNavigationShellProps {
  children?: React.ReactNode;
}

export const CustomerNavigationShell: React.FC<CustomerNavigationShellProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();

  const currentPath = location.pathname;
  const isProfile = currentPath === '/profile';

  const [lastNonProfilePath, setLastNonProfilePath] = useState<string>(() => {
    return isProfile ? '/' : currentPath;
  });

  // Track non-profile paths and retain the main surface outlet during transitions
  const [cachedMainOutlet, setCachedMainOutlet] = useState<React.ReactNode>(outlet);

  useEffect(() => {
    if (!isProfile) {
      setLastNonProfilePath(currentPath);
      if (outlet) {
        setCachedMainOutlet(outlet);
      }
    }
  }, [currentPath, isProfile, outlet]);

  const prevPathRef = useRef<string>(currentPath);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [slidingActive, setSlidingActive] = useState<boolean>(false);
  const [transitionType, setTransitionType] = useState<'to-profile' | 'from-profile' | null>(null);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle spatial route transitions
  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = currentPath;

    if (prev === currentPath) return;

    const goingToProfile = prev !== '/profile' && currentPath === '/profile';
    const returningFromProfile = prev === '/profile' && currentPath !== '/profile';

    if (prefersReducedMotion) {
      setTransitioning(false);
      setSlidingActive(false);
      setTransitionType(null);
      return;
    }

    if (goingToProfile) {
      setTransitionType('to-profile');
      setTransitioning(true);
      setSlidingActive(false);

      // Trigger transition next frame so initial translate (100% / 0%) is painted
      const rAf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlidingActive(true);
        });
      });

      const timer = window.setTimeout(() => {
        setTransitioning(false);
        setSlidingActive(false);
        setTransitionType(null);
      }, 420);

      return () => {
        cancelAnimationFrame(rAf);
        clearTimeout(timer);
      };
    } else if (returningFromProfile) {
      setTransitionType('from-profile');
      setTransitioning(true);
      setSlidingActive(false);

      const rAf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlidingActive(true);
        });
      });

      const timer = window.setTimeout(() => {
        setTransitioning(false);
        setSlidingActive(false);
        setTransitionType(null);
      }, 420);

      return () => {
        cancelAnimationFrame(rAf);
        clearTimeout(timer);
      };
    } else {
      // Transition between Home and Orders - no full page slide
      setTransitioning(false);
      setSlidingActive(false);
      setTransitionType(null);
    }
  }, [currentPath, prefersReducedMotion]);

  // Transform coordinates calculation
  let mainTransform = 'translateX(0%)';
  let profileTransform = 'translateX(100%)';

  if (transitionType === 'to-profile') {
    mainTransform = slidingActive ? 'translateX(-100%)' : 'translateX(0%)';
    profileTransform = slidingActive ? 'translateX(0%)' : 'translateX(100%)';
  } else if (transitionType === 'from-profile') {
    mainTransform = slidingActive ? 'translateX(0%)' : 'translateX(-100%)';
    profileTransform = slidingActive ? 'translateX(100%)' : 'translateX(0%)';
  } else {
    // Idle state
    mainTransform = isProfile ? 'translateX(-100%)' : 'translateX(0%)';
    profileTransform = isProfile ? 'translateX(0%)' : 'translateX(100%)';
  }

  const transitionStyle =
    transitioning && !prefersReducedMotion
      ? 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';

  const shouldRenderProfile = isProfile || transitioning;
  const shouldRenderMain = !isProfile || transitioning;

  const { showBottomNav } = computeNavState(currentPath);

  const handleProfileBack = () => {
    const target = resolveProfileBackTarget(lastNonProfilePath);
    navigate(target);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F9FA]">
      {/* MAIN SURFACE (Home, Orders, and Other Screens + Persistent BottomNav) */}
      <div
        id="campora-main-surface"
        aria-hidden={isProfile && !transitioning}
        className={`fixed inset-0 w-full h-full z-10 overflow-hidden ${
          isProfile && !transitioning ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        style={{
          transform: mainTransform,
          transition: transitionStyle,
          willChange: transitioning ? 'transform' : 'auto',
        }}
      >
        {/* Scrollable Main Content Container */}
        <div className="w-full h-full overflow-y-auto no-scrollbar">
          {shouldRenderMain && (isProfile ? cachedMainOutlet : outlet)}
        </div>

        {/* Persistent BottomNavigation anchored to Main Surface viewport */}
        {showBottomNav && (
          <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
            <BottomNavigation />
          </div>
        )}
      </div>

      {/* PROFILE SURFACE (Full page + Viewport-anchored coral Home pill) */}
      {shouldRenderProfile && (
        <div
          id="campora-profile-surface"
          aria-hidden={!isProfile && !transitioning}
          className={`fixed inset-0 w-full h-full z-50 overflow-hidden bg-[#F5F8FB] ${
            !isProfile && !transitioning ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          style={{
            transform: profileTransform,
            transition: transitionStyle,
            willChange: transitioning ? 'transform' : 'auto',
          }}
        >
          {/* Scrollable Profile Content */}
          <div className="w-full h-full overflow-y-auto no-scrollbar">
            <ProfilePage
              onHeaderBack={handleProfileBack}
              onHomeClick={() => navigate('/')}
              hideFloatingHomePill={true}
            />
          </div>

          {/* Approved Left-Edge Attached Floating Coral Home Pill */}
          {/* Anchored to Profile Viewport Shell (Option 2: moves together during page transitions) */}
          <div className="absolute bottom-4 left-0 right-0 z-30 pointer-events-none flex justify-center">
            <div className="w-full max-w-[430px] flex justify-start pointer-events-auto">
              <button
                type="button"
                onClick={() => navigate('/')}
                aria-label="Back to Home"
                className="bg-[#F05360] hover:bg-[#E14552] active:scale-[0.98] text-white rounded-l-none rounded-r-full pl-3.5 pr-5 py-2.5 flex items-center gap-2 shadow-[0_4px_14px_rgba(240,83,96,0.38)] transition-all cursor-pointer focus:outline-none"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none">
                  <path
                    d="M19 12H5M11 6l-6 6 6 6"
                    stroke="#FFFFFF"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[14.5px] font-semibold tracking-tight leading-none">
                  Home
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { computeNavState, NAVIGATION_ASSETS } from '../utils/navigationState.ts';

interface BottomNavigationProps {
  onNavigate?: (path: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isHomeActive, isOrderActive, isProfileActive, showBottomNav, sliderPosition } =
    computeNavState(location.pathname);

  // If strictly on profile, BottomNav is hidden
  if (!showBottomNav && isProfileActive) {
    return null;
  }

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      style={{ bottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))' }}
      className="fixed left-0 right-0 z-40 select-none pointer-events-none"
    >
      <div className="flex items-center justify-between max-w-[430px] mx-auto w-full pointer-events-auto pl-3 pr-0 gap-2.5">
        {/* GROUP A: Joined Home + Order White Container with Sliding Charcoal Indicator */}
        <div className="relative flex-1 h-[50px] bg-white rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.08)] border border-neutral-100 p-1 flex items-center justify-between overflow-hidden">
          {/* Shared Sliding Dark Charcoal Indicator */}
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#1D2532] shadow-xs pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: sliderPosition === 1 ? 'translateX(100%)' : 'translateX(0%)',
            }}
            aria-hidden="true"
          />

          {/* Home Button */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            aria-current={isHomeActive ? 'page' : undefined}
            className="relative z-10 flex-1 h-full flex items-center justify-center gap-2 px-4 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none"
          >
            {/* Icon slot: Glossy 3D Coral House when active, Outline SVG when inactive */}
            <div className="w-[20px] h-[20px] shrink-0 relative flex items-center justify-center">
              <picture>
                <source srcSet={NAVIGATION_ASSETS.homeActive3dWebp} type="image/webp" />
                <img
                  src={NAVIGATION_ASSETS.homeActive3dPng}
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 w-full h-full object-contain drop-shadow-xs transition-all duration-200 ${
                    isHomeActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                  }`}
                  referrerPolicy="no-referrer"
                />
              </picture>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#191F2B"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 ${
                  isHomeActive ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                }`}
              >
                <path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
            </div>
            <span
              className={`text-[13.5px] font-semibold tracking-tight transition-colors duration-200 ${
                isHomeActive ? 'text-white' : 'text-[#191F2B]'
              }`}
            >
              Home
            </span>
          </button>

          {/* Order Button */}
          <button
            type="button"
            onClick={() => handleNav('/orders')}
            aria-current={isOrderActive ? 'page' : undefined}
            className="relative z-10 flex-1 h-full flex items-center justify-center gap-2 px-4 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none"
          >
            {/* Icon slot: Glossy 3D Amber Bag when active, Outline SVG when inactive */}
            <div className="w-[20px] h-[20px] shrink-0 relative flex items-center justify-center">
              <picture>
                <source srcSet={NAVIGATION_ASSETS.orderActive3dWebp} type="image/webp" />
                <img
                  src={NAVIGATION_ASSETS.orderActive3dPng}
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 w-full h-full object-contain drop-shadow-xs transition-all duration-200 ${
                    isOrderActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                  }`}
                  referrerPolicy="no-referrer"
                />
              </picture>
              <svg
                viewBox="0 0 24 24"
                className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 ${
                  isOrderActive ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                }`}
                fill="none"
              >
                <path
                  d="M8.5 7V5.8C8.5 3.98 9.98 2.5 11.8 2.5h.4c1.82 0 3.3 1.48 3.3 3.3V7"
                  stroke="#191F2B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <rect
                  x="4.5"
                  y="6.8"
                  width="15"
                  height="14.2"
                  rx="3"
                  stroke="#191F2B"
                  strokeWidth="1.8"
                />
                <path
                  d="M9.2 12.2c.6 1.3 1.6 2 2.8 2s2.2-.7 2.8-2"
                  stroke="#191F2B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              className={`text-[13.5px] font-semibold tracking-tight transition-colors duration-200 ${
                isOrderActive ? 'text-white' : 'text-[#191F2B]'
              }`}
            >
              Order
            </span>
          </button>
        </div>

        {/* GROUP B: Separate White Profile Pill extending to right edge */}
        <button
          type="button"
          onClick={() => handleNav('/profile')}
          aria-label="Profile"
          className="h-[50px] bg-white rounded-l-full rounded-r-none shadow-[0_4px_18px_rgba(0,0,0,0.08)] border border-r-0 border-neutral-100 pl-4 pr-5 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:bg-neutral-50 active:scale-[0.98] focus:outline-none"
        >
          <picture>
            <source srcSet={NAVIGATION_ASSETS.profile3dWebp} type="image/webp" />
            <img
              src={NAVIGATION_ASSETS.profile3dPng}
              alt=""
              aria-hidden="true"
              className="w-[20px] h-[20px] object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
          </picture>
          <span className="text-[13.5px] font-semibold text-[#7C22E8] tracking-tight">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomeActive = location.pathname === '/';
  const isOrderActive = location.pathname.startsWith('/order');
  const isProfileActive = location.pathname.startsWith('/profile');

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-2.5 left-0 right-0 z-40 select-none pointer-events-none"
    >
      <div className="flex items-center justify-between max-w-[430px] mx-auto w-full pointer-events-auto pl-3 pr-0 gap-2.5">
        {/* Left White Pill Container: Unified size across Home, Order, and Profile pages */}
        <div className="flex-1 bg-white rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.08)] border border-neutral-100 p-1 flex items-center justify-between">
          {/* Home Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-full transition-all duration-200 cursor-pointer ${
              isHomeActive
                ? 'bg-[#1D2532] text-[#F16B4E] shadow-xs'
                : 'text-[#191F2B] hover:bg-neutral-50'
            }`}
          >
            {isHomeActive ? (
              <svg
                viewBox="0 0 24 24"
                fill="#F16B4E"
                stroke="#F16B4E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px] shrink-0"
              >
                <path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" fill="#1D2532" stroke="#1D2532" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#191F2B"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px] shrink-0"
              >
                <path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
            )}
            <span
              className={`text-[13.5px] font-semibold ${
                isHomeActive ? 'text-[#F16B4E]' : 'text-[#191F2B]'
              }`}
            >
              Home
            </span>
          </button>

          {/* Order Button */}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-full transition-all duration-200 cursor-pointer ${
              isOrderActive
                ? 'bg-[#1D2532] text-[#F16B4E] shadow-xs'
                : 'text-[#191F2B] hover:bg-neutral-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none">
              <path
                d="M8.5 7V5.8C8.5 3.98 9.98 2.5 11.8 2.5h.4c1.82 0 3.3 1.48 3.3 3.3V7"
                stroke={isOrderActive ? '#F16B4E' : '#191F2B'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <rect
                x="4.5"
                y="6.8"
                width="15"
                height="14.2"
                rx="3"
                fill={isOrderActive ? '#F16B4E' : '#191F2B'}
                stroke={isOrderActive ? '#F16B4E' : '#191F2B'}
                strokeWidth="1.8"
              />
              <path
                d="M9.2 12.2c.6 1.3 1.6 2 2.8 2s2.2-.7 2.8-2"
                stroke={isOrderActive ? '#1D2532' : '#FFFFFF'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span
              className={`text-[13.5px] font-semibold ${
                isOrderActive ? 'text-[#F16B4E]' : 'text-[#191F2B]'
              }`}
            >
              Order
            </span>
          </button>
        </div>

        {/* Right Separate Pill Container: Profile Button */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className={`bg-white rounded-l-full rounded-r-none shadow-[0_4px_18px_rgba(0,0,0,0.08)] border border-r-0 border-neutral-100 pl-4 pr-5 py-3 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            isProfileActive ? 'ring-2 ring-purple-600/30' : 'hover:bg-neutral-50'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="#7C22E8">
            <circle cx="12" cy="7.5" r="4.2" />
            <path d="M4.5 20.2c0-3.6 3.36-6.2 7.5-6.2s7.5 2.6 7.5 6.2c0 .7-.55 1.3-1.25 1.3H5.75c-.7 0-1.25-.6-1.25-1.3z" />
          </svg>
          <span className="text-[13.5px] font-semibold text-[#7C22E8]">Profile</span>
        </button>
      </div>
    </nav>
  );
};

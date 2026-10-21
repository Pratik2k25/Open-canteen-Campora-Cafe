/**
 * OPEN CANTEEN — HEADER COMPONENT
 * Stage 1 · Step 1.2 · Task 1.2.3
 *
 * Parameterized with useCanteen() for dynamic canteen branding, brand logo with
 * typographic monogram fallback, and dynamic pickup locations with cross-canteen isolation.
 */

import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCanteen } from '../context/CanteenContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

interface HeaderProps {
  onOpenLocationModal?: () => void;
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLocationModal, onOpenMenu }) => {
  const navigate = useNavigate();
  const { config } = useCanteen();

  // Dynamic locations from configuration
  const locations =
    config.location.pickupLocations.length > 0
      ? config.location.pickupLocations
      : [config.location.displayLocation];

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Close location picker if active canteen identity changes
  useEffect(() => {
    setShowLocationPicker(false);
  }, [config.identity.id]);

  // Derive effective location: preserve user selection if valid for active canteen,
  // otherwise fallback immediately to the active canteen's primary location.
  const effectiveLocation =
    selectedLocation && locations.includes(selectedLocation)
      ? selectedLocation
      : locations[0] || config.location.displayLocation;

  return (
    <header className="w-full bg-[#F8F9FA] px-4 pt-3 pb-2 z-30 select-none">
      {/* Top Brand & Actions Bar */}
      <div className="flex items-center justify-between">
        {/* Dynamic Brand Logo & Monogram Fallback */}
        <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo />
        </div>

        {/* Right Action Icons: Notification Bell & Menu */}
        <div className="flex items-center gap-2.5">
          {/* Notification Button */}
          <button
            aria-label="Notifications"
            onClick={() => navigate('/orders')}
            className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-200/60 active:scale-95 transition text-neutral-800"
          >
            <Bell className="w-5 h-5 text-neutral-800" strokeWidth={2.2} />
            {/* Red Notification Dot */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-[#F8F9FA]" />
          </button>

          {/* Hamburger Menu Circle Button */}
          <button
            aria-label="App Menu"
            onClick={() => {
              if (onOpenMenu) onOpenMenu();
              else navigate('/profile');
            }}
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200/70 flex flex-col items-center justify-center gap-[4px] hover:bg-neutral-50 active:scale-95 transition"
          >
            <span className="w-4 h-[2px] bg-neutral-800 rounded-full" />
            <span className="w-4 h-[2px] bg-neutral-800 rounded-full" />
            <span className="w-4 h-[2px] bg-neutral-800 rounded-full" />
          </button>
        </div>
      </div>

      {/* Location Bar with Pin & Dropdown */}
      <div className="mt-2.5 flex items-center">
        <button
          onClick={() => {
            if (onOpenLocationModal) onOpenLocationModal();
            else setShowLocationPicker(!showLocationPicker);
          }}
          className="group inline-flex items-center gap-1.5 text-left active:opacity-80 transition max-w-full"
        >
          {/* Green Map Pin */}
          <div className="text-[#136B3C] shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Location String */}
          <span className="text-[13px] font-bold text-neutral-800 truncate max-w-[280px]">
            {effectiveLocation}
          </span>

          {/* Down Chevron */}
          <ChevronDown className="w-4 h-4 text-neutral-700 shrink-0 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Inline Location Picker Dropdown Modal */}
      {showLocationPicker && (
        <div className="relative mt-2 p-2 bg-white rounded-xl shadow-lg border border-neutral-200 z-50">
          <p className="text-xs font-semibold text-neutral-500 px-2 py-1 uppercase tracking-wider">
            Select Canteen Location
          </p>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setSelectedLocation(loc);
                setShowLocationPicker(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition ${
                effectiveLocation === loc
                  ? 'bg-emerald-50 text-[#136B3C] font-bold'
                  : 'hover:bg-neutral-50 text-neutral-800'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

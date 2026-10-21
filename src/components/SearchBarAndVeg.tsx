import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarAndVegProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isVegOnly: boolean;
  onToggleVeg: (origin?: { x: number; y: number }) => void;
}

export const SearchBarAndVeg: React.FC<SearchBarAndVegProps> = ({
  searchQuery,
  onSearchChange,
  isVegOnly,
  onToggleVeg,
}) => {
  const handleVegButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      onToggleVeg({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      onToggleVeg();
    }
  };

  return (
    <div className="w-full px-[15px] pt-[6px] pb-[6px] flex items-center gap-[7px] select-none">
      {/* Search Bar */}
      <div className="flex-1 h-[41px] relative flex items-center bg-white rounded-[14px] px-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-within:ring-1 focus-within:ring-[#136B3C]/30 transition">
        {/* Left Green Search Icon */}
        <Search className="w-[18px] h-[18px] text-[#0E6E3B] shrink-0" strokeWidth={2.5} />

        {/* Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onSearchChange('');
          }}
          placeholder="Search for 'Biryani'"
          className="w-full mx-2.5 text-[14px] font-medium text-neutral-800 placeholder:text-[#788492] bg-transparent outline-hidden"
        />

        {/* Right Action: Clear search icon when query is present, else standard green search icon */}
        {searchQuery ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
            className="text-neutral-400 hover:text-neutral-700 transition shrink-0 cursor-pointer p-0.5"
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor">
              <path d="M18 6 6 18M6 6l12 12" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            aria-label="Search"
            className="text-[#0E6E3B] hover:opacity-80 transition shrink-0 cursor-pointer"
          >
            <Search className="w-[18px] h-[18px] text-[#0E6E3B]" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* VEG Toggle Card */}
      <button
        type="button"
        data-testid="veg-toggle-btn"
        onClick={handleVegButtonClick}
        aria-pressed={isVegOnly}
        aria-label="Toggle Veg Only"
        className={`shrink-0 w-[41px] h-[41px] flex flex-col items-center justify-center bg-white rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-95 transition cursor-pointer ${
          isVegOnly ? 'ring-1.5 ring-[#0E6E3B]' : ''
        }`}
      >
        <span
          className={`text-[9.5px] font-extrabold tracking-wide leading-none mb-[3px] transition-colors ${
            isVegOnly ? 'text-[#0E6E3B]' : 'text-[#111827]'
          }`}
        >
          VEG
        </span>
        {/* Switch Pill: Gray with left thumb when OFF, Green with right thumb & checkmark when ON */}
        <div
          data-testid="veg-toggle-track"
          className={`w-[29px] h-[14px] rounded-full p-[1.5px] transition-colors duration-200 flex items-center ${
            isVegOnly ? 'bg-[#0E6E3B] justify-end' : 'bg-[#CBD5E1] justify-start'
          }`}
        >
          <div className="w-[11px] h-[11px] rounded-full bg-white shadow-2xs flex items-center justify-center transition-transform duration-200">
            {isVegOnly && (
              <svg viewBox="0 0 16 16" fill="none" className="w-[8px] h-[8px] text-[#0E6E3B]">
                <path
                  d="M13.25 4.75L6.2 11.8L2.75 8.35"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

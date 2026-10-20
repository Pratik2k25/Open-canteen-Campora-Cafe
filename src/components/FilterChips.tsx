import React from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { getServiceTheme } from '../utils/serviceTheme.ts';

export type FilterKey = 'all' | 'under200' | 'noPackaging' | 'vegOnly';

interface FilterChipsProps {
  activeFilters: FilterKey[];
  onToggleFilter: (key: FilterKey) => void;
  onOpenFilterDialog?: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilters,
  onToggleFilter,
  onOpenFilterDialog,
}) => {
  const { serviceMode } = useCart();
  const theme = getServiceTheme(serviceMode);

  return (
    <div className="w-full px-3.5 pt-1 pb-2.5 select-none">
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
        {/* 1. Main Filters Button with Sliders Icon & Chevron */}
        <button
          onClick={onOpenFilterDialog}
          className="shrink-0 flex items-center gap-1 px-2 py-1.5 bg-white border border-white/90 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[10.5px] font-bold text-[#0F172A] hover:bg-neutral-50 active:scale-95 transition cursor-pointer"
        >
          <SlidersHorizontal className="w-3 h-3 text-[#0F172A]" strokeWidth={2.4} />
          <span>Filters</span>
          <ChevronDown className="w-3 h-3 text-[#0F172A]" strokeWidth={2.4} />
        </button>

        {/* 2. Under ₹200 Chip */}
        <button
          onClick={() => onToggleFilter('under200')}
          className={`shrink-0 px-2 py-1.5 rounded-full border text-[10.5px] font-bold transition active:scale-95 cursor-pointer ${
            activeFilters.includes('under200')
              ? `${theme.activeChipClass} shadow-[0_1px_2px_rgba(0,0,0,0.06)]`
              : 'bg-white border-white/90 text-[#0F172A] hover:bg-neutral-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
          }`}
        >
          Under ₹200
        </button>

        {/* 3. No packaging charge Chip */}
        <button
          onClick={() => onToggleFilter('noPackaging')}
          className={`shrink-0 px-2 py-1.5 rounded-full border text-[10.5px] font-bold transition active:scale-95 cursor-pointer ${
            activeFilters.includes('noPackaging')
              ? `${theme.activeChipClass} shadow-[0_1px_2px_rgba(0,0,0,0.06)]`
              : 'bg-white border-white/90 text-[#0F172A] hover:bg-neutral-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
          }`}
        >
          No packaging charge
        </button>

        {/* 4. Veg Only Chip */}
        <button
          onClick={() => onToggleFilter('vegOnly')}
          className={`shrink-0 px-2 py-1.5 rounded-full border text-[10.5px] font-bold transition active:scale-95 cursor-pointer ${
            activeFilters.includes('vegOnly')
              ? `${theme.activeChipClass} shadow-[0_1px_2px_rgba(0,0,0,0.06)]`
              : 'bg-white border-white/90 text-[#0F172A] hover:bg-neutral-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
          }`}
        >
          Veg Only
        </button>
      </div>
    </div>
  );
};

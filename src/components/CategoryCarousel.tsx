import React from 'react';
import { CATEGORIES } from '../data/menuData.ts';

interface CategoryCarouselProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full pt-1.5 pb-1 select-none">
      <div className="flex items-start justify-between gap-1.5 overflow-x-auto px-3.5 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center shrink-0 group focus:outline-hidden cursor-pointer min-w-[44px]"
            >
              {/* Circular Avatar / Food Image inside Zone A themed surface */}
              <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-center transition-transform duration-150 group-hover:scale-103">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs font-bold text-neutral-500">
                    {cat.name.slice(0, 2)}
                  </span>
                )}
              </div>

              {/* Category Name Label */}
              <span
                className={`text-[10.5px] mt-1 whitespace-nowrap tracking-tight leading-tight ${
                  isSelected ? 'font-bold text-[#0F172A]' : 'font-semibold text-[#1E293B]'
                }`}
              >
                {cat.name}
              </span>

              {/* Active Indicator Underline (Red/Orange Bar under selected category) */}
              {isSelected ? (
                <div className="w-11 h-[2.5px] bg-[#E52521] rounded-full mt-1" />
              ) : (
                <div className="w-11 h-[2.5px] bg-transparent mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

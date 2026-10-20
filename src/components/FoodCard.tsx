import React, { useRef } from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import type { MenuItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { getServiceTheme } from '../utils/serviceTheme.ts';

interface FoodCardProps {
  item: MenuItem;
  onCardClick?: () => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onCardClick }) => {
  const { serviceMode, getItemQuantity, addItem, updateQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = getServiceTheme(serviceMode);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item, cardRef.current);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, -1);
  };

  return (
    <div
      ref={cardRef}
      onClick={onCardClick}
      className="bg-white rounded-[16px] overflow-hidden border border-neutral-200/75 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow duration-200 cursor-pointer select-none group"
    >
      {/* Food Image Container (exact 416:172 aspect ratio from approved screenshot) */}
      <div className="relative w-full aspect-[416/172] bg-neutral-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      {/* Card Details below image */}
      <div className="px-2.5 pt-1.5 pb-2 relative flex flex-col justify-between">
        {/* Item Title */}
        <h3 className="text-[12px] font-bold text-[#0F172A] tracking-tight leading-snug whitespace-nowrap">
          {item.name}
        </h3>

        {/* Bottom Row: Price + Preparation Time on left, Service-Themed ADD Pill on right */}
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-extrabold text-[#0F172A] tracking-tight leading-none tabular-nums">
              ₹{item.price}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-medium text-[#64748B] leading-none whitespace-nowrap">
              <Clock className="w-2.5 h-2.5 text-[#64748B]" strokeWidth={2.2} />
              <span>{item.preparationTime}</span>
            </div>
          </div>

          {/* Case 3 Dynamic Service-Dependent ADD Pill / Quantity Controls */}
          {quantity === 0 ? (
            <button
              onClick={handleAddClick}
              aria-label={`Add ${item.name}`}
              data-service-mode={serviceMode}
              className={`shrink-0 ${theme.addButtonBgClass} ${theme.addButtonTextClass} font-extrabold text-[11px] px-3 py-1 rounded-full active:scale-95 transition-colors duration-200 cursor-pointer`}
            >
              ADD
            </button>
          ) : (
            <div
              data-service-mode={serviceMode}
              className={`shrink-0 flex items-center ${theme.addButtonBgClass} ${theme.addButtonTextClass} rounded-full px-1.5 py-0.5 gap-1 transition-colors duration-200`}
            >
              <button
                onClick={handleDecrement}
                aria-label={`Decrease quantity of ${item.name}`}
                className={`w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition ${theme.addButtonTextClass}`}
              >
                <Minus className="w-2.5 h-2.5" strokeWidth={3} />
              </button>
              <span className="text-[11px] font-black min-w-[12px] text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                aria-label={`Increase quantity of ${item.name}`}
                className={`w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition ${theme.addButtonTextClass}`}
              >
                <Plus className="w-2.5 h-2.5" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

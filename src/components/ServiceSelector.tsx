import React from 'react';
import { useCart } from '../context/CartContext.tsx';

export const ServiceSelector: React.FC = () => {
  const { serviceMode, setServiceMode } = useCart();

  return (
    <div className="relative w-full aspect-[933/173] select-none overflow-hidden">
      {/* Connected Mountain-Tab SVG Composition + Exact Illustration Coordinates */}
      <svg
        viewBox="0 0 933 174"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        {/* Base Layer: Inactive tabs rendered first so the active tab overlaps cleanly */}
        {serviceMode !== 'delivery' && (
          <path
            d="M 580 174 L 619 46 C 623 22, 638 10, 665 10 L 866 10 C 892 10, 904 22, 908 46 L 921 124 C 925 150, 929 164, 933 170 L 933 174 Z"
            fill="#DEF0FE"
          />
        )}

        {serviceMode !== 'takeaway' && (
          <path
            d="M 290 174 L 326 46 C 330 22, 345 10, 372 10 L 574 10 C 600 10, 613 22, 617 46 L 635 134 C 641 158, 658 172, 684 174 Z"
            fill="#FAF0E7"
          />
        )}

        {serviceMode !== 'dinein' && (
          <path
            d="M 0 174 L 0 169 C 18 163, 30 144, 31 116 L 32 46 C 32 22, 48 10, 74 10 L 280 10 C 306 10, 320 22, 324 46 L 344 134 C 350 158, 368 172, 396 174 Z"
            fill="#D2F8E1"
          />
        )}

        {/* Active Layer: Drawn on top with its connected bottom and top-contour stroke */}
        {serviceMode === 'dinein' && (
          <>
            <path
              d="M 0 174 L 0 169 C 18 163, 30 144, 31 116 L 32 46 C 32 22, 48 10, 74 10 L 280 10 C 306 10, 320 22, 324 46 L 344 134 C 350 158, 368 172, 396 174 Z"
              fill="#D2F8E1"
            />
            <path
              d="M 0 169 C 18 163, 30 144, 31 116 L 32 46 C 32 22, 48 10, 74 10 L 280 10 C 306 10, 320 22, 324 46 L 344 134 C 350 158, 368 172, 396 173 L 660 173"
              fill="none"
              stroke="#36B871"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </>
        )}

        {serviceMode === 'takeaway' && (
          <>
            <path
              d="M 262 174 C 288 172, 305 158, 311 134 L 326 46 C 330 22, 345 10, 372 10 L 574 10 C 600 10, 613 22, 617 46 L 635 134 C 641 158, 658 172, 684 174 Z"
              fill="#FAF0E7"
            />
            <path
              d="M 262 173 C 288 172, 305 158, 311 134 L 326 46 C 330 22, 345 10, 372 10 L 574 10 C 600 10, 613 22, 617 46 L 635 134 C 641 158, 658 172, 684 173"
              fill="none"
              stroke="#E29B61"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </>
        )}

        {serviceMode === 'delivery' && (
          <>
            <path
              d="M 552 174 C 578 172, 595 158, 601 134 L 619 46 C 623 22, 638 10, 665 10 L 866 10 C 892 10, 904 22, 908 46 L 921 124 C 925 150, 929 164, 933 170 L 933 174 Z"
              fill="#DEF0FE"
            />
            <path
              d="M 552 173 C 578 172, 595 158, 601 134 L 619 46 C 623 22, 638 10, 665 10 L 866 10 C 892 10, 904 22, 908 46 L 921 124 C 925 150, 929 164, 933 170"
              fill="none"
              stroke="#5BA8E6"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Exact Reference Illustrations positioned in 933x174 coordinate space */}
        <image
          href="/assets/services/dinein-icon.png"
          x="95"
          y="11"
          width="165"
          height="109"
          preserveAspectRatio="xMidYMid meet"
        />
        <image
          href="/assets/services/takeaway-icon.png"
          x="405"
          y="20"
          width="135"
          height="100"
          preserveAspectRatio="xMidYMid meet"
        />
        <image
          href="/assets/services/delivery-icon.png"
          x="695"
          y="16"
          width="135"
          height="104"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>

      {/* Interactive Segment Buttons & Centered Labels */}
      <div className="relative z-10 w-full h-full">
        {/* 1. Dinein Segment (center_x = 19.0% in reference) */}
        <button
          type="button"
          data-testid="service-tab-dinein"
          onClick={() => setServiceMode('dinein')}
          aria-pressed={serviceMode === 'dinein'}
          className="absolute top-0 bottom-0 left-[2.5%] w-[33%] flex flex-col items-center justify-end pb-[6px] cursor-pointer focus:outline-hidden"
        >
          <span className="text-[13px] font-bold text-[#0F172A] tracking-tight leading-none">
            Dinein
          </span>
        </button>

        {/* 2. Takeaway Segment (center_x = 50.5% in reference) */}
        <button
          type="button"
          data-testid="service-tab-takeaway"
          onClick={() => setServiceMode('takeaway')}
          aria-pressed={serviceMode === 'takeaway'}
          className="absolute top-0 bottom-0 left-[35.5%] w-[30%] flex flex-col items-center justify-end pb-[6px] cursor-pointer focus:outline-hidden"
        >
          <span className="text-[13px] font-bold text-[#0F172A] tracking-tight leading-none">
            Takeaway
          </span>
        </button>

        {/* 3. Delivery Segment (center_x = 81.7% in reference) */}
        <button
          type="button"
          data-testid="service-tab-delivery"
          onClick={() => setServiceMode('delivery')}
          aria-pressed={serviceMode === 'delivery'}
          className="absolute top-0 bottom-0 left-[65.5%] w-[32%] flex flex-col items-center justify-end pb-[6px] cursor-pointer focus:outline-hidden"
        >
          <span className="text-[13px] font-bold text-[#0F172A] tracking-tight leading-none">
            Delivery
          </span>
        </button>
      </div>
    </div>
  );
};

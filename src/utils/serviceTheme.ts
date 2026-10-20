import type { ServiceMode } from '../types/index.ts';

export interface ServiceThemeTokens {
  mode: ServiceMode;
  label: string;
  /** Zone A dynamic background hex (ServiceSelector active tab + Search + Categories + Filters) */
  zoneABgHex: string;
  /** Tailwind background class for Zone A */
  zoneABgClass: string;
  /** Active tab contour border stroke hex */
  tabStrokeHex: string;
  /** FoodCard ADD button & quantity stepper pill background classes */
  addButtonBgClass: string;
  /** FoodCard ADD button & quantity stepper text/icon color class */
  addButtonTextClass: string;
  /** Active filter chip classes inside Zone A */
  activeChipClass: string;
}

export const SERVICE_THEMES: Record<ServiceMode, ServiceThemeTokens> = {
  dinein: {
    mode: 'dinein',
    label: 'Dinein',
    zoneABgHex: '#D2F8E1',
    zoneABgClass: 'bg-[#D2F8E1]',
    tabStrokeHex: '#36B871',
    addButtonBgClass: 'bg-[#D2F8E1] hover:bg-[#bfeFD3]',
    addButtonTextClass: 'text-[#0E6B39]',
    activeChipClass: 'bg-[#0E6B39] border-[#0E6B39] text-white',
  },
  takeaway: {
    mode: 'takeaway',
    label: 'Takeaway',
    zoneABgHex: '#FAF0E7',
    zoneABgClass: 'bg-[#FAF0E7]',
    tabStrokeHex: '#E29B61',
    addButtonBgClass: 'bg-[#F9E3CE] hover:bg-[#f3d5b8]',
    addButtonTextClass: 'text-[#9A4A12]',
    activeChipClass: 'bg-[#9A4A12] border-[#9A4A12] text-white',
  },
  delivery: {
    mode: 'delivery',
    label: 'Delivery',
    zoneABgHex: '#DEF0FE',
    zoneABgClass: 'bg-[#DEF0FE]',
    tabStrokeHex: '#5BA8E6',
    addButtonBgClass: 'bg-[#DEF0FE] hover:bg-[#c8e4fd]',
    addButtonTextClass: 'text-[#0D528C]',
    activeChipClass: 'bg-[#0D528C] border-[#0D528C] text-white',
  },
};

export function getServiceTheme(mode: ServiceMode): ServiceThemeTokens {
  return SERVICE_THEMES[mode] ?? SERVICE_THEMES.dinein;
}

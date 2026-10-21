/**
 * OPEN CANTEEN — APPROVED BRAND ASSETS & LOGO SYSTEM
 *
 * Centralized single source of truth for the approved three-variant Open Canteen
 * parent brand identity.
 *
 * Variants:
 * 1. Full Logo: Symbol + "Open Canteen" wordmark (for web header, desktop navigation, footer, landing, About dialog).
 * 2. Standalone Icon: Symbol without wordmark (compact navigation, favicon, avatar, small brand elements).
 * 3. App Icon: Dedicated icon for PWA installation, home-screen icons, Apple touch icon, app shortcuts.
 *
 * NOTE: Individual canteen operators (e.g. Campora Café) configure their own tenant branding
 * via `canteenConfig.ts`. This module defines the core Open Canteen platform assets.
 */

export interface BrandAssetVariant {
  readonly path: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly description: string;
}

export const OPEN_CANTEEN_BRAND = Object.freeze({
  name: 'Open Canteen',
  tagline: 'Modern Digital Canteen Experience',
  colors: Object.freeze({
    /** Approved primary brand emerald forest green */
    primaryGreen: '#1C6943',
    /** Approved deep forest green for text and high-contrast surfaces */
    primaryGreenDark: '#166534',
    /** Approved vibrant warm steam flame orange */
    accentOrange: '#FB4816',
    /** Neutral light background */
    neutralLight: '#FFFFFF',
    /** Clean surface off-white */
    surfaceLight: '#F8F9FA',
  }),
  variants: Object.freeze({
    /**
     * FULL LOGO: Symbol + "Open Canteen" wordmark.
     * Usage: Main Open Canteen website header, desktop navigation, project landing page, footer, About info.
     */
    fullLogo: Object.freeze({
      path: '/assets/branding/open-canteen-logo.png',
      alt: 'Open Canteen',
      width: 1318,
      height: 301,
      description: 'Official Open Canteen logo with symbol and wordmark on transparent background.',
    } satisfies BrandAssetVariant),

    /**
     * STANDALONE ICON: Logo symbol without wordmark.
     * Usage: Compact navigation, favicon, brand avatar, small project identity elements, loading indicators.
     */
    standaloneIcon: Object.freeze({
      path: '/assets/branding/open-canteen-icon.png',
      alt: 'Open Canteen Icon',
      width: 775,
      height: 775,
      description: 'Official Open Canteen brand symbol (circular bowl with rising steam flames).',
    } satisfies BrandAssetVariant),

    /**
     * APP ICON: Dedicated icon for PWA / mobile installation.
     * Usage: PWA manifest icons, home-screen installation, Apple touch icon, app shortcuts.
     */
    appIcon: Object.freeze({
      path: '/assets/branding/open-canteen-app-icon.png',
      alt: 'Open Canteen App Icon',
      width: 512,
      height: 512,
      description: 'Dedicated PWA/mobile app tile with subtle elevation and rounded squircle.',
    } satisfies BrandAssetVariant),
  }),
  pwaIcons: Object.freeze({
    pwa192: '/icons/neutral/pwa-192x192.png',
    pwa512: '/icons/neutral/pwa-512x512.png',
    pwaMaskable: '/icons/neutral/pwa-maskable-512x512.png',
    appleTouchIcon: '/icons/neutral/apple-touch-icon.png',
    favicon: '/icons/neutral/favicon.ico',
    iconSvg: '/icons/neutral/icon.svg',
  }),
});

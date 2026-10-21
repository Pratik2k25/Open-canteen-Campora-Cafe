/**
 * OPEN CANTEEN — CANTEEN METADATA SYNCHRONIZATION
 * Stage 1 · Step 1.2 · Task 1.2.7
 *
 * Synchronizes browser-facing document title, meta descriptions, theme color,
 * and PWA tags reactively with the active CanteenConfig.
 */

import React, { useEffect } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';

export const CanteenMetadataSync: React.FC = () => {
  const { config } = useCanteen();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Document Title
    const appName = config.pwa?.appName || config.identity.displayName || 'Open Canteen';
    document.title = appName;

    // 2. Meta Description
    const description = config.pwa?.description || config.identity.description;
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', description);
      }
    }

    // 3. Open Graph Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', appName);
    }

    // 4. Apple Mobile Web App Title
    const shortName = config.pwa?.shortName || config.identity.shortName || appName;
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitle) {
      appleTitle.setAttribute('content', shortName);
    }

    // 5. Theme Color
    const themeColor = config.pwa?.themeColor || config.branding.primaryColor;
    if (themeColor) {
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.setAttribute('name', 'theme-color');
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute('content', themeColor);
    }

    // 6. Favicon Link
    const iconUrl = config.identity.logoUrl || '/icon.svg';
    const iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (iconLink) {
      iconLink.setAttribute('href', iconUrl);
    }
  }, [config]);

  return null;
};

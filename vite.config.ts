import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const appName =
    process.env.VITE_CANTEEN_APP_NAME?.trim() || 'Open Canteen';
  const shortName =
    process.env.VITE_CANTEEN_SHORT_NAME?.trim() || 'Open Canteen';
  const description =
    process.env.VITE_CANTEEN_DESCRIPTION?.trim() ||
    'Modern digital canteen ordering and dining experience for campus and institutional dining.';
  const themeColor =
    process.env.VITE_CANTEEN_THEME_COLOR?.trim() || '#166534';
  const backgroundColor =
    process.env.VITE_CANTEEN_BG_COLOR?.trim() || '#F8F9FA';

  // Open Canteen official icon paths
  const icon192 =
    process.env.VITE_CANTEEN_ICON_192?.trim() || '/pwa-192x192.png';
  const icon512 =
    process.env.VITE_CANTEEN_ICON_512?.trim() || '/pwa-512x512.png';
  const iconMaskable =
    process.env.VITE_CANTEEN_ICON_MASKABLE?.trim() || '/pwa-maskable-512x512.png';
  const iconSvg =
    process.env.VITE_CANTEEN_ICON_SVG?.trim() || '/icon.svg';
  const appleTouchIcon =
    process.env.VITE_CANTEEN_APPLE_ICON?.trim() || '/apple-touch-icon.png';

  const htmlBrandingPlugin: Plugin = {
    name: 'html-canteen-branding',
    transformIndexHtml(html) {
      return html
        .replace(/<title>(.*?)<\/title>/, `<title>${appName}</title>`)
        .replace(/content="Campora Café"/g, `content="${appName}"`)
        .replace(/content="Campora"/g, `content="${shortName}"`)
        .replace(/(<meta name="description" content=")(.*?)("\s*\/?>)/, `$1${description}$3`)
        .replace(/(<meta property="og:description" content=")(.*?)("\s*\/?>)/, `$1${description}$3`)
        .replace(/(<meta name="theme-color" content=")(.*?)("\s*\/?>)/, `$1${themeColor}$3`)
        .replace(/(<link rel="icon" type="image\/svg\+xml" href=")(.*?)("\s*\/?>)/, `$1${iconSvg}$3`)
        .replace(/(<link rel="apple-touch-icon" href=")(.*?)("\s*\/?>)/, `$1${appleTouchIcon}$3`);
    },
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      htmlBrandingPlugin,
      VitePWA({
        registerType: 'prompt', // Controlled PWA update: user chooses when to reload to avoid interrupting checkout
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'assets/branding/open-canteen-logo.png',
          'assets/branding/open-canteen-icon.png',
          'assets/branding/open-canteen-app-icon.png',
          'assets/animations/open-canteen-splash.mp4',
          'icons/neutral/favicon.ico',
          'icons/neutral/apple-touch-icon.png',
          'icons/neutral/icon.svg',
          'icons/neutral/pwa-192x192.png',
          'icons/neutral/pwa-512x512.png',
          'icons/neutral/pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: appName,
          short_name: shortName,
          description,
          theme_color: themeColor,
          background_color: backgroundColor,
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: icon192,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: icon512,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: iconMaskable,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // mp4 added for the Open Canteen startup splash animation offline support.
          globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,woff,woff2,mp4}'],
          globIgnores: ['**/assets/aistudio/**', '**/*-source.png', '**/icons/campora/**', '**/assets/brand-logo.png'],
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              return 'vendor-libs';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

# Open Canteen — Stage 1, Step 1.1: Codebase Architecture Report (D1)
**Project**: Open Canteen (Transitioning from Campora Café)  
**Document**: Technical Architecture Baseline & Repository Audit  
**Status**: Completed  
**Date**: October 2026  

---

## 1. Executive Summary

This audit establishes the technical baseline of the existing Campora Café codebase as we begin transforming it into **Open Canteen**—a modular, configurable, white-label open-source canteen ordering Progressive Web Application (PWA).

**Key Finding**: The existing codebase is not a prototype or simple demo. It is a highly polished, high-performance React 19 + TypeScript + Vite 8 PWA with locked custom UI geometry, rich physics-based animations (flight to cart, circular VEG mode ripple, spatial horizontal page slide), photorealistic 3D navigation, and a complete skeleton loading architecture.

Our mission in Stage 1 is **preservation and white-label modularization**:
- Preserve every approved UI layout, animation curve, and interaction.
- Extract all hardcoded Campora Café brand dependencies into a centralized, configurable schema (`CanteenConfig`).
- Structure mock and runtime data flow so any campus, college, hospital, or corporate canteen can adopt Open Canteen effortlessly.

---

## 2. Technology Stack & Dependencies

| Layer | Technology | Version | Purpose & Architecture Role |
| :--- | :--- | :--- | :--- |
| **Runtime Engine** | Bun / Node.js | Bun 1.3.8 / Node 22+ | Fast package management, script execution, and bundling |
| **Frontend Framework** | React | 19.3.1 | Core UI rendering with React 19 concurrent features |
| **Language** | TypeScript | 7.0.2 | End-to-end type safety, strict interface contracts |
| **Bundler & Dev Server** | Vite | 8.3.4 | Ultra-fast HMR (<100ms) and optimized production builds |
| **Routing** | React Router DOM | 7.18.4 | Declarative client-side routing with `CustomerNavigationShell` |
| **Styling** | Tailwind CSS | 4.3.3 | CSS-first configuration via `@tailwindcss/vite` |
| **Iconography** | Lucide React | 0.546.0 | Clean outline iconography for inactive navigation & actions |
| **Motion & Animation** | Motion (Framer Motion) | 12.43.0 | Coordinate spatial transitions and physics-based interactions |
| **PWA & Offline** | Vite Plugin PWA | 2.0.0 | Workbox precaching (110 entries), service worker registration |
| **Backend SDK** | Firebase | 13.0.0 | Optional real-time Firestore synchronization & Auth infrastructure |
| **AI Integration** | Google GenAI SDK | 2.30.0 | Smart menu queries and assistant capabilities |

---

## 3. Repository Structure Map

```text
f:/Open-canteen-Campora-Cafe/
├── .env.example                     # Environment template (Firebase, Gemini API)
├── firebase-applet-config.json      # Client-safe Firebase web configuration
├── firestore.rules                  # Security rules for orders and customer profiles
├── index.html                       # Application shell with font & 3D icon preloads
├── package.json                     # Project manifest and scripts
├── tsconfig.json                    # Strict TypeScript compilation rules
├── vite.config.ts                   # Vite 8 config with Tailwind v4 & PWA plugins
│
├── public/                          # Static public assets
│   ├── assets/
│   │   ├── brand-logo.png           # Hardcoded Campora Café logo (to be abstracted)
│   │   ├── categories/              # Category thumbnail icons (All, Sweets, etc.)
│   │   ├── floating-cart/           # Layered plate, kraft bag, delivery box assets
│   │   │   └── beverages/           # 3D beverage miniatures (Chai, Coffee, Pepsi)
│   │   ├── menu/                    # High-resolution food catalog imagery
│   │   ├── navigation/              # 3D glossy navigation icons (Home, Order, Profile)
│   │   ├── orders/                  # Order status thumbnails & banner illustrations
│   │   ├── profile/                 # Profile identity illustrations
│   │   └── services/                # Mountain service icons (Dinein, Takeaway, Delivery)
│   ├── icon.svg                     # PWA vector icon
│   └── manifest.webmanifest         # PWA installation manifest
│
├── src/
│   ├── App.tsx                      # Root router configuration and shell wrapping
│   ├── main.tsx                     # Application bootstrapper
│   ├── index.css                    # Design tokens, Tailwind imports, custom keyframes
│   ├── components/
│   │   ├── animations/              # VegModeTransition and specialized animators
│   │   ├── skeleton/                # Phase 6.2 Shimmer & Page Skeletons
│   │   │   ├── SkeletonBlock.tsx    # Primitive rectangular placeholder
│   │   │   ├── SkeletonCircle.tsx   # Primitive circular placeholder
│   │   │   ├── SkeletonShimmer.tsx  # Smooth animated gradient overlay
│   │   │   ├── HomePageSkeleton.tsx # Pixel-matched Home Case 3 skeleton
│   │   │   ├── OrderHistorySkeleton.tsx # Banner & card matched Orders skeleton
│   │   │   └── ProfilePageSkeleton.tsx  # Minimal header & lavender card skeleton
│   │   ├── BottomNavigation.tsx     # Group A (Home/Order pill) + Group B (Profile)
│   │   ├── CustomerNavigationShell.tsx # Spatial route controller & fixed pills
│   │   ├── FloatingCart.tsx         # Physics-based floating dynamic cart
│   │   ├── FoodCard.tsx             # 2-column food card with stable aspect ratio
│   │   ├── Header.tsx               # Top branding, location selector, menu trigger
│   │   ├── ServiceSelector.tsx      # Mountain-shaped connected service tabs
│   │   ├── SearchBarAndVeg.tsx      # Dual search input and synchronized VEG toggle
│   │   ├── CategoryCarousel.tsx     # Horizontal category selector with active line
│   │   ├── FilterChips.tsx          # Pill filter chips (Under ₹200, Veg Only, etc.)
│   │   ├── OrderCard.tsx            # Order summary item with status badges
│   │   └── ServiceIncompatibilityModal.tsx # Safe service switching dialog
│   │
│   ├── context/
│   │   ├── AuthContext.tsx          # Authentication state (Firebase / Mock guest)
│   │   ├── CartContext.tsx          # Cart items, pricing, service mode, flight state
│   │   └── OrderContext.tsx         # Active & historical orders, Firestore listener
│   │
│   ├── data/
│   │   └── menuData.ts              # Canonical catalog of categories and dishes
│   │
│   ├── hooks/
│   │   └── usePageReadiness.ts      # Readiness-aware loading hook with warm cache
│   │
│   ├── pages/
│   │   ├── HomePage.tsx             # Case 3 approved flagship screen
│   │   ├── OrdersPage.tsx           # Order history & empty orders state
│   │   ├── OrderDetailPage.tsx      # Token slip & preparation tracking
│   │   ├── ProfilePage.tsx          # Customer profile, preferences & quick sheets
│   │   └── PlaceholderPage.tsx      # Safe fallback for secondary routes
│   │
│   ├── types/
│   │   └── index.ts                 # Central domain definitions (Menu, Order, Cart)
│   │
│   └── utils/
│       ├── floatingCartState.ts     # Physics layers, slots & beverage positioning
│       ├── navigationState.ts       # Route active state & spatial transform math
│       ├── orderHistory.ts          # Order status formatting & badge configuration
│       ├── pricing.ts               # Subtotal, tax, packaging, delivery math
│       ├── profileData.ts           # Mock profile provider & validation
│       ├── serviceRules.ts          # Service mode compatibility & filtering
│       ├── serviceTheme.ts          # Case 3 dynamic color tokens per service mode
│       └── vegModeTransition.ts     # Circular reveal animation coordinate math
```

---

## 4. State Management & Data Flow Architecture

The application adopts a **UI-first, decoupled architecture**:
1. **Cart Context (`CartContext.tsx`)**:
   - Manages selected `serviceMode` (`'dinein' | 'takeaway' | 'delivery'`).
   - Computes dynamic pricing via pure utility (`pricing.ts`).
   - Triggers flight animation payload (`activeFlight`) for adding items.
   - Persists state in `localStorage` under `campora_cart` and `campora_service_mode`.
2. **Order Context (`OrderContext.tsx`)**:
   - Holds active and historical orders.
   - Pre-seeded with 12 realistic orders covering multiple statuses (Preparing, Delivered, Completed, Cancelled).
   - Real-time Firestore sync activates automatically when a non-guest Firebase user is detected, falling back gracefully to local storage.
3. **Canonical VEG Preference Synchronization**:
   - Maintained in `vegModeTransition.ts`.
   - Synchronizes across Home page toggle, Home filter chips, and Profile preferences via custom event dispatch (`campora-veg-preference-change`).
4. **Spatial Navigation Shell (`CustomerNavigationShell.tsx`)**:
   - Renders `#campora-main-surface` (Home, Orders) and `#campora-profile-surface` (Profile).
   - Coordinates horizontal sliding: Home exits left (`-100%`), Profile enters from right (`0%`), and vice-versa on return.
   - Profile Floating Coral Home Pill is anchored to the Profile shell (Option 2), ensuring it travels *together* with Profile during navigation.

---

## 5. Build, Lint & Performance Assessment

- **Production Build**: Verified with `bun run build`. Vite transforms 1,725 modules and outputs production bundles in **under 2.0 seconds**.
- **Bundle Breakdown**:
  - CSS: `61.28 kB` (gzipped: `11.23 kB`)
  - JS: `989.58 kB` (gzipped: `288.25 kB`) — includes Firebase SDK, Motion, and React.
- **PWA Precache**: Automatically precaches 110 assets (~9.9 MB total media assets) for instant offline loading.
- **TypeScript Compliance**: Strict type-checking with zero unresolved compile errors.

---

## 6. Recommendations for Step 1.2 Onward

1. **Retain UI Engine**: Keep React 19 + Vite 8 + Tailwind CSS 4. The current architecture delivers exceptional mobile Android performance and silky 60fps animations.
2. **Abstract Canteen Identity**: Create a clean `src/config/canteenConfig.ts` contract in Step 1.2 to inject name, logo, contact, and colors.
3. **Migrate Storage Keys**: Move from `campora_*` keys to generic `opencanteen_*` keys with backward-compatibility fallbacks.
4. **Decouple Media**: Ensure 3D cart containers and beverage models can render dynamically without hardcoded brand names.

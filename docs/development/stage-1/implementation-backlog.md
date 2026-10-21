# Open Canteen — Stage 1, Step 1.1: Implementation Backlog (D5)
**Project**: Open Canteen (Transitioning from Campora Café)  
**Document**: Stage 1 Prioritized Implementation Backlog & Approval Gate  
**Status**: Ready for Approval  
**Date**: October 2026  

---

## 1. Open Canteen Master Roadmap

The approved Open Canteen product development roadmap is:
- **Stage 1**: Customer PWA using mock data.
- **Stage 2**: Admin Panel UI using mock data.
- **Stage 3**: Backend, Firebase, media integration and live connectivity.
- **Stage 4**: Public Food Library and Smart Catalog Sync.

```
Stage 1: Core Customer PWA & White-Label Foundation
├── Step 1.1: Codebase Audit [COMPLETED]
├── Step 1.2: Centralized Canteen Branding [COMPLETED]
├── Step 1.3: TypeScript Domain Models & Mock Data Adapters [COMPLETED]
├── Step 1.4: Home Page Functional Completion [COMPLETED]
├── Step 1.5: Floating Cart & Cart Page [NEXT MILESTONE]
├── Step 1.6: Checkout & Mock Order Placement
├── Step 1.7: Orders, Profile & Remaining Customer Pages
├── Step 1.8: Animations, Transitions & Loading
└── Step 1.9: PWA Finalization & Quality Assurance
```

---

## 2. Step 1.2 Implementation Status (COMPLETED — WITH DOCUMENTED ICON LIMITATION)

### Status Summary
- **Step 1.2 Status**: **COMPLETE** (Signed off October 2026)
- **Branding Architecture**: Fully parameterized via `CanteenConfig` and `CanteenProvider`.
- **Cross-Canteen Storage Isolation**: Hardened with operator-scoped keys (`opencanteen:${operatorId}:${key}`) and in-flight overwrite protection guards across Auth, Cart, Orders, Profile, and VEG preference.
- **Legacy Migration**: Strictly scoped to `campora-cafe`.
- **Known Limitation (Documented as PARTIAL)**: Custom PWA icons (`public/pwa-192x192.png`, `public/pwa-512x512.png`) remain Campora-branded. Build-time manifest and runtime meta tags are dynamic, but custom icon generation requires operator asset replacement until automated multi-tenant asset pipeline is introduced.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.2.1** | Define `CanteenConfig` TypeScript interface, presets, and deployment resolver. | `src/config/canteenConfig.ts`, `src/types/index.ts` | **Complete** | Full schema, `CAMPORA_CAFE_PRESET`, `OPEN_CANTEEN_PRESET`, `resolveCanteenConfig`, `getDeploymentCanteenConfig`. |
| **1.2.2** | Create React `CanteenProvider` and `useCanteen()` hook. | `src/context/CanteenContext.tsx`, `src/App.tsx` | **Complete** | Context provider with deployment config initialization, `setCanteenConfig`, `resetCanteenConfig`. |
| **1.2.3** | Parameterize Header and Navigation branding. | `src/components/Header.tsx`, `src/components/BrandLogo.tsx` | **Complete** | Mode A (raster logo with error fallback) and Mode B (monogram badge); dynamic locations and canteen title. |
| **1.2.4** | Parameterize Profile Page and contact sheets. | `src/pages/ProfilePage.tsx` | **Complete** | Dynamic About, Help & Support, Privacy sheets; alphanumeric mock phones (`+91 1800-CAMPORA`) safely rendered as non-dialable text. |
| **1.2.5** | Parameterize VEG Mode transition footer and preferences. | `src/utils/vegModeTransition.ts`, `src/components/animations/VegModeTransition.tsx` | **Complete** | Uppercase brand footer overlay; operator-scoped VEG preference storage with fallback. |
| **1.2.6** | Multi-canteen storage isolation and legacy migration engine. | `src/utils/storageKeys.ts`, `src/utils/storageMigration.ts`, `CartContext.tsx`, `OrderContext.tsx`, `AuthContext.tsx`, `ProfilePage.tsx` | **Complete** | Prefix `opencanteen:${operatorId}:${key}`; in-flight overwrite guards prevent cross-canteen data bleed during runtime switching. Legacy migration strictly restricted to `campora-cafe`. |
| **1.2.7** | Dynamic PWA metadata and document title synchronization. | `index.html`, `src/components/CanteenMetadataSync.tsx`, `vite.config.ts` | **Complete (Manifest/Meta: Complete; Icon Generation: Partial)** | Dynamic document title and theme color sync; build-time manifest injection. Custom icons require operator asset replacement. |

---

## 3. Step 1.3 Implementation Status (COMPLETED)

### Status Summary
- **Step 1.3 Status**: **COMPLETE** (October 2026)
- **Domain Modeling**: Formalized `CanteenCatalog` and reconciled customer identity/preferences contracts.
- **Modular Mock Data**: Extracted `CAMPORA_CATALOG` (10 items, 7 categories), `OPEN_CANTEEN_CATALOG` (demo campus menu), `createEmptyCatalog` (safe fallback for unconfigured canteens), 12 verified `CAMPORA_SEED_ORDERS`, and customer profiles (`DEFAULT_MOCK_CUSTOMER_PROFILE` and `createOperatorDefaultProfile`).
- **Adapter Architecture**: Implemented `IMenuAdapter`, `IOrderAdapter`, `IProfileAdapter` with `MockMenuAdapter`, `MockOrderAdapter`, `MockProfileAdapter` preserving operator isolation and pricing/service invariants.
- **Profile Adapter & UI Integration**: `ProfilePage.tsx` directly integrates with `mockProfileAdapter` for all profile updates and address management. Zero direct `localStorage` access remains in Profile UI.
- **Customer Isolation**: Non-Campora operators (`open-canteen`, `my-home`, unknown custom canteens) receive clean guest profiles with empty address books and never inherit Campora's demo customer or hostel addresses.
- **Validation**: 69 unit tests passing across 10 test suites (0 failures). TypeScript typechecks (`tsc --noEmit`) and production builds succeed with 0 errors.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.3.1** | Canonical domain models & harmonization | `src/types/index.ts`, `src/utils/profileData.ts` | **Complete** | Added `CanteenCatalog`. Reconciled auth user vs profile models with zero runtime breakage. |
| **1.3.2** | Multi-canteen mock seeds & modular data | `src/data/mock/*` | **Complete** | Modularized Campora (10 items), Open Canteen demo, safe empty catalog, 12 seed orders, and profile fixtures. |
| **1.3.3** | Adapter interfaces & mock implementations | `src/adapters/*` | **Complete** | `IMenuAdapter`, `IOrderAdapter`, `IProfileAdapter` implemented with operator-scoped persistence. |
| **1.3.4** | Context & consumer integration | `src/context/OrderContext.tsx`, `src/pages/HomePage.tsx`, `src/pages/ProfilePage.tsx`, `src/hooks/useCanteenCatalog.ts` | **Complete** | Asynchronous data loading with race condition guards. 100% UI and animation preservation. |
| **1.3.5** | Automated testing & verification | `src/adapters/mockAdapters.test.ts`, `package.json` | **Complete** | 14 adapter tests covering 22 scenarios. All 69 project unit tests pass cleanly. |

---

## 4. Step 1.4 Implementation Status (COMPLETED)

### Status Summary
- **Step 1.4 Status**: **COMPLETE** (October 2026)
- **Search & Sanitization**: Case-insensitive, whitespace-trimmed, partial item name & description matching, inline clear button (`✕`), and `Escape` key dismiss.
- **Category & Filter Chips**: Dynamically binds active categories, active pill highlighting, horizontal carousel scroll. Filter chips (`under200`, `noPackaging`, `vegOnly`) compose cleanly with service-mode packaging rules without fabricating fictitious ranking data.
- **FoodCard & Cart Integration**: ADD pill and `[-]` `[+]` quantity controls bound to `CartContext`. Operator-neutral SVG placeholder fallback prevents cross-canteen food misrepresentation on broken/missing images.
- **Operator Catalog Isolation**: Unconfigured operators render clean "Menu coming soon" empty state and never inherit Campora menu items. Runtime operator switching resets category, search, and selected product states cleanly.
- **Geometry & Alignment Harmonization**: Primary joined Home/Order bottom navigation pill, standalone Profile pill, and Profile page floating "← Home" return pill harmonized to uniform 50 px height and 10 px bottom baseline.
- **Validation**: 78 unit tests passing across 11 test suites (0 failures). TypeScript typechecks (`tsc --noEmit`) clean (0 errors), production build succeeds with 110 precached PWA entries.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.4.1** | Search bar functionality & clearing | `src/components/SearchBarAndVeg.tsx`, `src/utils/vegModeTransition.ts`, `src/adapters/mockMenuAdapter.ts` | **Complete** | Case-insensitive partial matching, multi-space collapse, inline `✕` clear, `Escape` key handler. |
| **1.4.2** | Categories & filter chips composition | `src/components/CategoryCarousel.tsx`, `src/components/FilterChips.tsx`, `src/utils/vegModeTransition.ts` | **Complete** | Dynamic category pills; service-mode aware `noPackaging` fee check; `under200` price check. |
| **1.4.3** | Food cards & cart synchronization | `src/components/FoodCard.tsx`, `src/context/CartContext.tsx` | **Complete** | Direct `CartContext` ADD and quantity counters; operator-neutral SVG utensil fallback; dynamic service mode theme colors. |
| **1.4.4** | Loading, empty states & operator independence | `src/pages/HomePage.tsx`, `src/hooks/useCanteenCatalog.ts` | **Complete** | Branded "Menu coming soon" and "No dishes found"; synchronous operator-aware initial state in `useCanteenCatalog`. |
| **1.4.5** | Automated testing, QA & height alignment | `src/adapters/homePageFunctional.test.ts`, `src/components/BottomNavigation.tsx`, `src/components/CustomerNavigationShell.tsx`, `src/pages/ProfilePage.tsx` | **Complete** | 9 functional test scenarios; Option A 50px navigation height harmonization; mobile browser verified. |

---

## 5. Subsequent Stage 1 Backlog Sequence

### Step 1.5 — Floating Cart & Cart Page (`/cart`) [NEXT MILESTONE]
- Dedicated full-page cart experience at `/cart` matching approved design.
- Synchronize floating cart drawer on Home with the full `/cart` page.
- Bill breakdown (subtotal, taxes, packaging, delivery fee) with real-time recalculation.
- Clear Cart confirmation and item note instructions.

### Step 1.6 — Checkout & Mock Order Placement (`/checkout`, `/order-confirmation/:id`)
- Service-mode dependent delivery details (Table Number for Dine-in; Counter Pickup estimate for Takeaway; Campus/Hostel Address picker for Delivery).
- Mock payment method selection (UPI, Cash on Counter, Card).
- Place order execution through `mockOrderAdapter` with concurrency guards.
- Order confirmation slip with live token number and preparation progress tracker.

### Step 1.7 — Orders, Profile & Remaining Customer Pages
- Dedicated `/orders` page with tabs (All Orders, Preparing, Completed, Cancelled).
- Order details modal, repeat order action, and cancellation flow per adapter rules.
- Profile page address book management (add new campus hostel/gate address).
- Customer support sheet with operating hours and counter dialer links.

### Step 1.8 — Animations, Transitions & Loading
- High-fidelity micro-interactions and transitions across all customer routes.
- Full-screen VEG mode transition animation with sound/haptics toggle support.
- Floating cart item fly-in and beverage 3D bottle animations.
- Page readiness skeletons for Home, Cart, Orders, and Profile.

### Step 1.9 — PWA Finalization & Quality Assurance
- Service worker precaching and offline fallback screen.
- Web app manifest verification for installability.
- Multi-viewport responsive audit (360px to 430px mobile viewports).
- End-to-end regression test suite covering full customer journey.

---

## 6. Step 1.1 Completion Checklist & Sign-Off

- [x] **Project Structure & Dependencies Documented**: React 19, TypeScript 7, Vite 8, Tailwind v4, PWA precaching mapped in [D1](file:///f:/Open-canteen-Campora-Cafe/docs/development/stage-1/step-1.1-codebase-audit.md).
- [x] **Customer Screens & Routes Inventoried**: 4 verified production screens, 9 clean placeholder routes mapped in [D2](file:///f:/Open-canteen-Campora-Cafe/docs/development/stage-1/feature-verification.md).
- [x] **Feature Verification Matrix Completed**: Home Case 3, 3D cart, VEG reveal, premium navigation, and skeleton system verified with screenshots.
- [x] **Branding Dependencies Identified**: All 19 hardcoded strings, assets, and storage keys cataloged in [D3](file:///f:/Open-canteen-Campora-Cafe/docs/development/stage-1/branding-inventory.md).
- [x] **Data Flow & Mock Sources Mapped**: Storage keys, context states, and catalog arrays mapped for Step 1.3 migration.
- [x] **Approved UI & Motion Preserved**: Layout geometries, aspect ratios, and animation curves confirmed 100% intact.
- [x] **Technical Risks Evaluated**: Mitigations for PWA manifests, code splitting, and storage keys detailed in [D4](file:///f:/Open-canteen-Campora-Cafe/docs/development/stage-1/risk-register.md).
- [x] **No Code/Architecture Rebuilding Conducted**: Pure audit, verification, and structured planning only.
- [x] **Stage 1.2 Backlog Ready for Approval**: 7 atomic tasks scheduled with acceptance criteria.

---

### Exit Gate
With all 5 deliverables completed and stored in [`docs/development/stage-1/`](file:///f:/Open-canteen-Campora-Cafe/docs/development/stage-1/), **Step 1.1 is complete**.

Ready to begin **Stage 1, Step 1.2: Centralized Canteen Branding Architecture & Rebranding** upon user confirmation.

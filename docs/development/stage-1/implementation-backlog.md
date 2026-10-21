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
├── Step 1.5: Floating Cart & Cart Page [COMPLETED]
├── Step 1.6: Checkout & Mock Order Placement [COMPLETED]
├── Step 1.7: Orders, Profile & Remaining Customer Pages [COMPLETED]
├── Step 1.8: Animations, Transitions & Loading [NEXT MILESTONE]
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

## 5. Step 1.5 Implementation Status (COMPLETED)

### Status Summary
- **Step 1.5 Status**: **COMPLETE** (October 2026)
- **Full Cart Page (`/cart`)**: Built mobile-first `CartPage.tsx` adhering to Campora Café design language. Includes Back to Home, active canteen branding, compact 3-way service selector, veg/non-veg markers, unit prices, quantity controls, line totals, and per-item cooking instructions.
- **Per-Item Cooking Instructions**: Integrated directly into `CartContext.items` (`specialInstructions`) with `updateSpecialInstructions()`. Persists across quantity adjustments, Home ↔ Cart navigation, browser refreshes, and operator boundaries.
- **Bill Calculation & Service Charges**: Fully unified with `calculatePricing()`. Accurately computes Dine-in packaging (FREE / ₹0), Takeaway packaging (₹15), Delivery packaging (₹20), Delivery fee (₹30), 5% GST, and grand total. Empty carts compute ₹0 with no NaN or negative numbers.
- **Floating Cart & Cart Page Synchronization**: Home page 3D floating vessel and `/cart` share identical `CartContext` state, quantity steppers, item additions/removals, and persisted storage namespace. The quick-sheet drawer navigates to `/cart` via "View Cart".
- **Empty Cart & Clear Cart Flow**: Explicit user confirmation modal before clearing all cart items ("Clear your cart?"). Empty cart presents a clean, friendly illustration with a direct "Browse Menu" return to `/`.
- **Service-Mode Incompatibility & Sanitization**: Compact service-mode switcher on `/cart` detects incompatible items and triggers `ServiceIncompatibilityModal` to prevent accidental loss of unfulfillable items. Tested both "Keep Current Service" and "Remove & Switch" workflows.
- **Operator Isolation & Storage Persistence**: Strictly namespaces cart storage under `opencanteen:<operatorId>:cart`. Campora Café, Open Canteen demo, and custom canteens maintain completely partitioned carts across reloads and route navigations.
- **Automated Testing & QA**: 85 unit tests passing across 12 test suites (0 failures). TypeScript checks (`tsc --noEmit`) and production builds succeed with 0 errors. Real browser mobile verification passed at 360px, 390px, and 430px viewports with screenshot evidence captured.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.5.1** | Full Cart Page component architecture | `src/pages/CartPage.tsx`, `src/App.tsx`, `src/utils/navigationState.ts` | **Complete** | Mobile-first Cart Page with Back button, canteen title, items list, bill card, and sticky checkout bar. Hides BottomNav on `/cart`. |
| **1.5.2** | Authoritative pricing & service charges | `src/utils/pricing.ts`, `src/pages/CartPage.tsx` | **Complete** | Real-time calculation of Dine-in, Takeaway, and Delivery fees with 5% GST and ₹0 empty state. Safe TypeScript typing without unsafe `any`. |
| **1.5.3** | Floating Cart synchronization | `src/components/FloatingCart.tsx`, `src/context/CartContext.tsx` | **Complete** | Floating 3D cart vessel and `/cart` fully synchronized. Drawer updated to navigate to `/cart` with "View Cart". |
| **1.5.4** | Empty Cart & Clear Cart confirmation | `src/pages/CartPage.tsx` | **Complete** | Confirmation dialog with Cancel and Clear actions; charming empty state with "Browse Menu" button navigating to `/`. |
| **1.5.5** | Operator isolation & automated testing | `src/adapters/cartFunctional.test.ts`, `src/utils/navigationState.test.ts` | **Complete** | 6 functional test scenarios covering addition, removal, pricing, packaging fees, sanitization, and storage key partitioning (`opencanteen:<operatorId>:cart`). |

---

## 6. Step 1.6 Implementation Status (COMPLETED)

### Status Summary
- **Step 1.6 Status**: **COMPLETE** (October 2026)
- **Checkout Page (`/checkout`)**: Mobile-first Checkout Page matching Campora Café design language. Includes order summary, service-mode fulfillment card (Dine-in Table #, Takeaway pickup desk, Delivery saved campus addresses), customer identity prefill, notes, mock payment selection, and sticky Place Order bar.
- **Service Mode Fulfillment**:
  - **Dine-in**: Table Number selection (1–40) with manual entry option.
  - **Takeaway**: Pickup time estimate options ('10-15 mins', '20-25 mins', 'ASAP') and counter instructions.
  - **Delivery**: Campus Hostel address picker with active default address and 'Add New Address' drawer.
- **Customer Identity & Per-Item Cooking Notes**: Captures customer name (with operator-neutral fallbacks for guest users) and per-item cooking instructions (`specialInstructions`) intact into order history.
- **Demo Payment State Accuracy**: Aligned with Stage 1 non-transactional mock semantics. Cash at Counter and Cash on Delivery persist as `'pending'` payment status; Demo UPI and Demo Card persist as `'simulated'`. Real refunds are explicitly prevented.
- **Order Placement & Concurrency**: Atomic placement through `mockOrderAdapter.placeOrder` with in-flight duplicate placement guards. New orders receive initial status `'placed'`.
- **Cart Cleanup & Preservation**: Cart is cleared upon successful order placement; preserved completely on simulated placement failure.
- **Order Confirmation Page (`/order-confirmation/:id`)**: Displays live token number, order ID, estimated preparation/delivery time, fulfillment badge, ordered items breakdown, and direct navigation links to Order Details and Home.
- **Automated Testing & QA**: 99 unit tests passing (13 test suites). Production build succeeds with 0 errors. Real browser mobile verification passed at 360px, 390px, and 430px.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.6.1** | Checkout Page architecture & fulfillment details | `src/pages/CheckoutPage.tsx`, `src/App.tsx` | **Complete** | Table number selection, pickup desk estimate, delivery hostel address picker. |
| **1.6.2** | Demo payment method selection & payment state rules | `src/pages/CheckoutPage.tsx`, `src/types/index.ts`, `src/adapters/mockOrderAdapter.ts` | **Complete** | Accurate demo semantics: `pending` for cash, `simulated` for UPI/Card. |
| **1.6.3** | Order placement & concurrency protection | `src/adapters/mockOrderAdapter.ts`, `src/context/OrderContext.tsx` | **Complete** | Initial status `'placed'`; in-flight concurrency lock prevents duplicate orders. |
| **1.6.4** | Order Confirmation Page & token slip | `src/pages/OrderConfirmationPage.tsx`, `src/App.tsx` | **Complete** | Token badge, live status tracker, preparation time, navigation to details. |
| **1.6.5** | Automated testing & QA | `src/adapters/checkoutFunctional.test.ts` | **Complete** | 9 unit tests covering all 3 service modes, cash vs demo payment states, cart clearing, and operator isolation. |

---

## 7. Step 1.7 Implementation Status (COMPLETED)

### Status Summary
- **Step 1.7 Status**: **COMPLETE** (October 2026)
- **Order History Page (`/orders`)**: Dual tabs: "All Orders" and "Cancelled", with live badge counters. Orders sorted chronologically in descending order (`sortOrdersByDateDesc`). Newly placed orders immediately prepend to top.
- **Order Details Page (`/orders/:id`)**: Comprehensive breakdown with back navigation to Orders, fulfillment details, item breakdown with per-item cooking notes (`specialInstructions`), item quantities, pricing card, and payment method representation.
- **Cancellation Data Integrity**:
  - Only cancellable orders (`placed`, `preparing`) allow cancellation.
  - Confirmation modal required before executing cancellation.
  - Dedicated `cancellationReason?: string` field on `Order` prevents corruption or overwriting of existing customer fulfillment notes.
  - Payment status remains unchanged (no fake refunds).
  - Cancelled orders appear in Cancelled tab; counter updates dynamically.
  - Persists across page refresh and operator switching.
- **Safe Reorder**:
  - Cross-references past items against active catalog pricing (`ci.item.price`).
  - Detects unavailable items and alerts customer if items are retired or unavailable.
  - Prompts customer before clearing or merging non-empty carts.
- **Profile Page & Address Book Management (`/profile`)**:
  - Full CRUD lifecycle for saved addresses: Add, Edit, Delete (with confirmation), and Set Default.
  - Strict field validation (`validateAddressInput`) ensuring valid building, room/landmark, and 10+ digit recipient phone.
  - Operator-isolated profiles: non-Campora canteens receive clean guest profiles with empty address books.
  - Safe logout: clears operator-scoped auth profile without wiping unrelated cart, orders, or VEG preferences.
  - Preserved approved lavender visual palette and coral Home return pill.
- **Automated Testing & QA**: 108 unit tests passing across 14 test suites (0 failures). TypeScript typecheck (`tsc --noEmit`) clean, Vite production build clean.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.7.1** | Order History list & tab counters | `src/pages/OrdersPage.tsx`, `src/utils/orderHistory.ts` | **Complete** | All Orders vs Cancelled tabs with live badge counters; descending date sorting. |
| **1.7.2** | Order Details page & fulfillment breakdown | `src/pages/OrderDetailPage.tsx`, `src/App.tsx` | **Complete** | Fulfillment card, per-item cooking notes, pricing breakdown, dedicated cancellation reason display. |
| **1.7.3** | Cancellation data integrity & dedicated field | `src/adapters/mockOrderAdapter.ts`, `src/types/index.ts`, `src/pages/OrderDetailPage.tsx` | **Complete** | Dedicated `cancellationReason` on `Order`; preserves customer notes intact; enforces non-terminal states. |
| **1.7.4** | Safe Reorder workflow | `src/pages/OrderDetailPage.tsx` | **Complete** | Validates against current catalog pricing and availability; protects non-empty carts. |
| **1.7.5** | Customer Profile & Address Book lifecycle | `src/pages/ProfilePage.tsx`, `src/adapters/mockProfileAdapter.ts`, `src/context/AuthContext.tsx` | **Complete** | Address Add/Edit/Delete/Default CRUD, validation, operator isolation, safe logout. |
| **1.7.6** | Automated testing & regression suite | `src/adapters/ordersAndProfileFunctional.test.ts` | **Complete** | 9 unit test scenarios covering tabs, descending sorting, cancellation integrity, address CRUD, and operator isolation. |

---

## 8. Step 1.8 Implementation Status (COMPLETED)

### Status Summary
- **Step 1.8 Status**: **COMPLETE** (October 2026)
- **Strict Storage-Key Architecture & Cancellation Hardening**:
  - Restored strict `getOperatorStorageKey(baseKey: string, operatorId?: string): string` API contract without argument guessing or auto-detection.
  - Audited all call sites in repository to ensure `baseKey` is strictly passed first and `operatorId` second.
  - Added comprehensive regression tests in `src/utils/storageMigration.test.ts` verifying exact canonical key generation for `campora-cafe`, `open-canteen`, `custom-canteen`, uppercase, whitespace, and special characters (`Campus Dhaba #4!`).
  - Dedicated `cancellationReason` fully isolated in `MockOrderAdapter.cancelOrder` without polluting customer notes or per-item cooking notes.
  - Backward compatibility in `OrderDetailPage` preserves legacy notes parsing while filtering cancellation strings out of customer cooking notes.
- **History-Aware Route Scroll Restoration**:
  - `CustomerNavigationShell` implements history-aware scroll restoration via `useNavigationType()`.
  - On `POP` (browser Back/Forward or back navigation), exact previous scroll offset is restored without jarring resets to the top.
  - On `PUSH` (forward navigation to a new route), scroll position cleanly initializes at `top: 0`.
- **Comprehensive Modal & Bottom Sheet Accessibility**:
  - Built centralized `useAccessibleDialog` hook implementing full WCAG modal ergonomics.
  - Automatic focus entry into dialog on mount.
  - Strict keyboard focus trap (`Tab` and `Shift+Tab` cycle only among visible interactive elements).
  - Clean `Escape` key dismissal.
  - Focus restoration returning focus directly to triggering button upon dismissal.
  - Applied across Floating Cart quick-sheet drawer, Cart clear modal, Service Incompatibility modal, Product details modal, Order cancellation dialog, Reorder dialog, and Profile bottom sheets.
- **VEG Radial Reveal & State Machine**:
  - Mint radial reveal transitions smoothly through cover, covered, reveal, and idle phases.
  - Rapid toggling updates `runId` and cancels stale timer commits, preventing stuck overlays and unmounted state updates.
  - Reduced-motion mode (`prefers-reduced-motion: reduce`) skips full-screen canvas/overlay expansion and applies dietary filter immediately.
- **Skeletons & Async Hydration**:
  - `OrderDetailPage` renders accessible `order-detail-loading` skeleton while orders hydrate, completely avoiding premature "Order Not Found" flashes.
  - `OrderConfirmationPage` renders accessible `order-confirmation-loading` skeleton during hydration and only renders not-found after orders resolve.
  - `CheckoutPage` confirm button is disabled during empty or hydrating cart state, preventing premature order submissions.
  - `ProfilePage` hydrates synchronously on operator switch, avoiding flashes of previous operator profiles, and auto-dismisses open modal sheets.
- **Reduced-Motion Accessibility**:
  - CSS tokens in `src/index.css` enforce reduced motion for `.animate-fade-in`, `[data-testid="floating-cart-flight-item"]`, and `[data-testid="veg-mode-transition-overlay"]`.
  - Flight animation in `CartContext` checks `prefers-reduced-motion` and skips spatial flight when enabled.
- **Automated Testing & QA**:
  - 119 unit tests passing across 15 test suites (0 failures).
  - TypeScript check (`tsc --noEmit`) clean, Vite production build clean.
  - Real browser verification confirmed on mobile viewports (`360x780`, `390x844`, `430x932`) and desktop (`1200x800`) covering Home, Cart, Checkout, Confirmation, Orders list, Order Details, Cancel modal, Profile, Address Book, scroll restoration, and keyboard `Escape`/`Tab` focus management.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.8.1** | Animation architecture audit & inventory | Multiple components, `src/index.css` | **Complete** | Audited all motion sites, identified missing CSS keyframes, documented reduced motion. |
| **1.8.2** | Route transition quality & history scroll restoration | `src/components/CustomerNavigationShell.tsx` | **Complete** | History-aware scroll restoration via `useNavigationType()`; zero layout thrashing or duplicate nav bars. |
| **1.8.3** | Food-to-cart flight & floating cart cleanup | `src/context/CartContext.tsx`, `src/components/FloatingCart.tsx` | **Complete** | Unmount cleanup, operator switch flight reset, reduced-motion bypass. |
| **1.8.4** | VEG radial reveal & rapid toggle protection | `src/utils/vegModeTransition.ts`, `src/index.css` | **Complete** | State machine protects against stale timers; reduced-motion skips overlay. |
| **1.8.5** | Skeletons, loading & empty states | `src/pages/OrderDetailPage.tsx`, `src/pages/OrderConfirmationPage.tsx`, `src/pages/CheckoutPage.tsx`, `src/pages/ProfilePage.tsx` | **Complete** | Loading skeletons during order hydration; no premature not-found flashes; disabled checkout while resolving. |
| **1.8.6** | Reduced-motion accessibility | `src/index.css`, `src/context/CartContext.tsx`, `src/utils/vegModeTransition.ts` | **Complete** | Global and component-level reduced-motion rules for flight, overlays, and transitions. |
| **1.8.7** | Mobile performance & layout stability | `src/index.css`, `src/components/CustomerNavigationShell.tsx` | **Complete** | Selective GPU acceleration with transform/opacity, zero forced layout thrashing. |
| **1.8.8** | Modal & bottom sheet accessibility controller | `src/utils/useAccessibleDialog.ts`, multiple modals | **Complete** | Centralized focus trap, focus restoration, accessible ARIA roles, and Escape listener across all dialogs. |
| **1.8.9** | Strict storage key contract & regression tests | `src/utils/storageKeys.ts`, `src/utils/storageMigration.test.ts` | **Complete** | Strict `(baseKey, operatorId)` signature, operator ID sanitization, normal/unusual/ambiguous test coverage. |
| **1.8.10** | Automated testing & regression suite | `src/adapters/motionAndLoadingFunctional.test.ts` | **Complete** | 10 comprehensive unit tests covering VEG state machine, rapid toggle, reduced motion, flight offsets, spatial coords, and cancellation. |

---

## 9. Step 1.9 Implementation Status (COMPLETED)

### Status Summary
- **Step 1.9 Status**: **COMPLETE** (October 2026)
- **Primary Objective**: Finalized Open Canteen Stage 1 as a reliable, installable, responsive, offline-resilient, independent Customer Food Ordering PWA.
- **PWA Configuration Audit (Task 1.9.1)**: Validated `vite.config.ts`, `index.html`, manifest metadata (`name`, `short_name`, `description`, `start_url: '/'`, `scope: '/'`, `display: 'standalone'`), theme colors, and icons across Chromium, Safari, and Desktop environments.
- **Independent Canteen Branding (Task 1.9.2)**: Build-time manifest and runtime meta tags dynamically resolve active deployment branding. Generated dual asset packages: approved Campora Café assets (`/icons/campora/` and root `/pwa-*.png`) and neutral Open Canteen assets (`/icons/neutral/`) to guarantee non-Campora deployments never display Campora-specific assets.
- **Service Worker & Bounded Caching (Task 1.9.3)**: Workbox precaches critical application-shell assets (HTML, split JS bundles, CSS, 3D vessels, menu photos, UI icons). Precache is bounded at ~9.8 MB (127 entries), strictly excluding ~50 MB raw designer videos in `assets/aistudio/**`. Runtime caching applies `StaleWhileRevalidate` and `CacheFirst` strategies to Google Fonts. Private customer data and credentials are never placed in public caches.
- **Offline Experience & Transparent Demo Boundaries (Task 1.9.4)**: Full client-side navigation (Home, Menu, Cart, Orders, Order Details, Profile, Address Book) functions offline. Accessible `OfflineIndicator` status pill (`role="status"`, `aria-live="polite"`) alerts users. Transparent disclaimers clarify that mock orders save locally to `localStorage` without communicating with a physical kitchen until Stage 3 backend synchronization is implemented.
- **Controlled PWA Update Lifecycle (Task 1.9.5)**: Switched from automatic reload to controlled `registerType: 'prompt'`. Implemented `PwaUpdatePrompt` with accessible "Update Now" and "Later" actions. Crucially, the prompt is suppressed during active Checkout to avoid interrupting order submission or wiping form notes.
- **PWA Installation Readiness (Task 1.9.6)**: Verified Chromium `beforeinstallprompt` flow and iOS Safari "Add to Home Screen" instructions in `PWAInstallButton.tsx`. Documented strict production HTTPS requirements and localhost development exception.
- **Responsive & Safe-Area Ergonomics (Task 1.9.7)**: Audited layouts at 360px (compact Android), 390px (standard iPhone), 430px (large mobile), and desktop responsive shells. Fixed safe-area bottom insets (`env(safe-area-inset-bottom)`) on sticky checkout action bars, cart summary bars, and bottom navigation.
- **Accessibility Quality Gate (Task 1.9.8)**: Semantic headings (`h1`–`h3`), touch targets >= 44x44px, accessible button labels, dialog focus trapping via `useAccessibleDialog`, `Escape` key dismissal, focus restoration, screen reader announcements on offline/update events, and `prefers-reduced-motion` compliance.
- **Performance & Code Splitting (Task 1.9.9)**: Code-split production chunks (`vendor-react`, `vendor-libs`, `index-*.js`). Main application bundle dropped from 1,096 kB to **272 kB**, accelerating initial parsing and main-thread responsiveness.
- **Security & Data Integrity (Task 1.9.10)**: Confirmed zero production secrets in code or `.env`. Verified demo payment labels ("Demo UPI (Simulated)", "Cash at Counter (Demo)", "Cash on Delivery (Demo)"). Customer notes are rendered strictly as text without HTML injection risks. Browser storage clearing is handled gracefully.
- **Customer Journey Regression (Task 1.9.11)**: Executed browser tests for Journey A (Dine-in), Journey B (Takeaway), Journey C (Delivery), Journey D (Profile & Address Book), Journey E (Operator Isolation), Journey F (Offline & Update), and Journey G (Failure cases).
- **Automated Regression Suite (Task 1.9.12)**: Expanded unit test suite to **130 passing unit tests across 16 files** (0 failures). Added `pwaAndDeploymentFunctional.test.ts` covering manifest resolution, branding presets, offline persistence, update lifecycle, and storage partitioning.
- **Deployment Documentation (Task 1.9.13)**: Authored comprehensive self-hosted guide in `docs/deployment/self-hosted-guide.md` covering prerequisites, local dev, production build, HTTPS, Nginx/Caddy/Vercel SPA rewrites, icon preparation, environment variables, offline limits, and future Stage 2/3 boundaries.

### Completed Tasks Breakdown

| Task ID | Task Description | Target Files | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1.9.1** | PWA configuration & manifest audit | `vite.config.ts`, `index.html`, `dist/manifest.webmanifest` | **Complete** | Standalone mode, start_url '/', valid icons, dynamic theme colors. |
| **1.9.2** | Independent canteen branding & neutral icons | `scripts/generate-all-icons.mjs`, `public/icons/**`, `vite.config.ts` | **Complete** | Neutral Open Canteen icons generated; build-time manifest and HTML branding dynamically adapt to operator ID. |
| **1.9.3** | Workbox precaching & bounded caching policies | `vite.config.ts`, `dist/sw.js` | **Complete** | Bounded precache ~9.8 MB (127 entries); excludes raw aistudio video; Google fonts cached. |
| **1.9.4** | Offline experience & transparent demonstration bounds | `src/components/OfflineIndicator.tsx`, `src/pages/CheckoutPage.tsx` | **Complete** | Accessible role="status" and aria-live="polite"; offline orders persist locally with clear demo disclaimer. |
| **1.9.5** | Controlled PWA update lifecycle | `src/components/PwaUpdatePrompt.tsx`, `vite.config.ts`, `src/components/CustomerNavigationShell.tsx` | **Complete** | Controlled prompt with Update/Later; checkout suppression; skipWaiting activation. |
| **1.9.6** | PWA install verification & iOS instructions | `src/components/PWAInstallButton.tsx`, `src/hooks/usePWAInstall.ts` | **Complete** | Dynamic canteen app name in install dialog; accessible modal ARIA roles. |
| **1.9.7** | Responsive viewports & safe-area insets | `src/components/BottomNavigation.tsx`, `src/pages/CheckoutPage.tsx`, `src/pages/CartPage.tsx`, `src/components/CustomerNavigationShell.tsx` | **Complete** | Safe-area padding `max(0.75rem, env(safe-area-inset-bottom))` on all sticky bars; verified at 360px, 390px, 430px. |
| **1.9.8** | Accessibility audit & WCAG compliance | Multiple components | **Complete** | Focus trapping, focus restoration, ARIA status announcements, contrast, reduced motion. |
| **1.9.9** | Bundle performance & code splitting | `vite.config.ts` | **Complete** | Vendor chunking; main JS bundle reduced from 1.09 MB to 272 KB. |
| **1.9.10** | Security boundaries & data integrity | `src/adapters/mockOrderAdapter.ts`, `src/pages/CheckoutPage.tsx` | **Complete** | Zero secrets, strict operator storage isolation, HTML sanitization, demo payment semantics. |
| **1.9.11** | Customer journey regression | Live browser execution | **Complete** | Verified Journeys A through G with browser recordings and screenshot evidence. |
| **1.9.12** | Automated regression test suite | `src/adapters/pwaAndDeploymentFunctional.test.ts` | **Complete** | 130 passing unit tests across 16 files (11 new Step 1.9 functional tests). |
| **1.9.13** | Self-hosted deployment documentation | `docs/deployment/self-hosted-guide.md` | **Complete** | Full operator documentation for self-hosting, HTTPS, SPA rewrites, icons, and offline boundaries. |

---

## 10. Stage 1 Final Acceptance Gate

- [x] **Core Customer Journeys Complete**: Dine-in, Takeaway, and Delivery ordering workflows fully functional with mock persistence.
- [x] **PWA Installability & Service Worker**: Production build outputs valid manifest, controlled update service worker, and bounded precache.
- [x] **Visual Design Locked & Preserved**: Approved Campora Café headers, 3D vessels, 50px BottomNav geometry, VEG radial transitions, and brand palettes preserved 100%.
- [x] **Independent Canteen White-Labeling**: Configurable without source code modifications; neutral fallbacks prevent cross-canteen asset leakage.
- [x] **Offline Resilience & Demo Bounds**: Full offline navigation and local order storage with transparent demonstration disclaimers.
- [x] **Accessibility & Safe-Area Ergonomics**: WCAG 2.2 AA compliant modal dialogs, keyboard traps, screen reader live regions, and iOS safe areas.
- [x] **Production Bundle & Code Quality**: 130 passing unit tests across 16 files, clean `tsc --noEmit`, clean Vite production build.
- [x] **Deployment Documentation**: Complete operator guide authored in `docs/deployment/self-hosted-guide.md`.

---

### Milestone Sign-Off Recommendation
**STAGE 1 · STEP 1.9 — READY FOR OWNER REVIEW**  
*Pending owner visual approval on newly added Checkout, Confirmation, Order Details, and Address Book screens.*


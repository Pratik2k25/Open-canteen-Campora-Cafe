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
├── Step 1.1: Existing Codebase Audit & Assessment [COMPLETED]
├── Step 1.2: Centralized Canteen Branding Architecture & Rebranding [COMPLETED & AUDITED]
├── Step 1.3: Unified Mock-Data Architecture & Multi-Canteen Seeds [NEXT MILESTONE]
├── Step 1.4: Dedicated Full-Screen Cart Experience (/cart)
└── Step 1.5: Checkout, Token Receipt & Order Confirmation (/checkout)
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

## 3. Subsequent Stage 1 Backlog Preview

### Step 1.3 — Unified Mock-Data Architecture
- Consolidate scattered mock objects into a clean, typed `mockData/` module.
- Provide swappable menu datasets (e.g., Campus Canteen vs. Corporate Café).
- Ensure cart calculations, order history badges, and profile addresses consume unified types.

### Step 1.4 — Dedicated Full-Screen Cart (`/cart`)
- Upgrade the current placeholder at `/cart` into a full-page cart experience matching the floating cart's item list, bill breakdown, and service mode selector.
- Retain floating cart drawer on Home as a quick shortcut.

### Step 1.5 — Checkout & Token Receipt (`/checkout`, `/order-confirmation/:id`)
- Build table/hostel delivery address picker.
- Add mock UPI / Cash on Counter / Card payment selection.
- Generate live token slip with estimated preparation countdown.

---

## 4. Step 1.1 Completion Checklist & Sign-Off

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

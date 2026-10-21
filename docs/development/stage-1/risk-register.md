# Open Canteen — Stage 1, Step 1.1: Technical Risk Register (D4)
**Project**: Open Canteen (Transitioning from Campora Café)  
**Document**: Technical Risk Analysis, Quality Report & Mitigations  
**Status**: Completed  
**Date**: October 2026  

---

## 1. Overview & Risk Methodology

This risk register identifies architectural, security, accessibility, and visual regression risks uncovered during the codebase audit, with assigned mitigation strategies to ensure the modularization of Campora Café into Open Canteen proceeds safely.

---

## 2. Technical Risk Matrix

| Risk ID | Category | Severity | Description | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TR-01** | **UI Regression** | **High** | Accidental alteration of approved Home Case 3 geometry or service selector during white-labeling. | Degrades user trust and breaks locked design system. | Strict preservation rules in Step 1.2: do not touch layout DOM or SVG paths; inject only config strings and theme classes. |
| **TR-02** | **State Fragmentation** | **Medium** | Mock data scattered across `menuData.ts`, `OrderContext.tsx`, and `profileData.ts`. | Discrepancies in item pricing, images, or order history across screens. | Unify mock data into typed factories in Step 1.3 driven by `CanteenConfig`. |
| **TR-03** | **Storage Collision** | **Low** | Legacy `campora_*` keys in local storage conflicting during upgrade. | Users losing existing active cart or saved orders after rebranding. | Implement two-way fallback reader: read new `opencanteen_*` key first, fall back to `campora_*` if absent, then migrate. |
| **TR-04** | **PWA Manifest Hardcoding** | **Medium** | Static PWA manifest currently baked with "Campora Café" name and icons in `vite.config.ts`. | Installed PWA displays original canteen name even after white-label reconfiguration. | Parameterize Vite PWA plugin or generate dynamic `manifest.webmanifest` from config during build/runtime in Step 1.2. |
| **TR-05** | **Client Security** | **Low** | Placeholder API keys in `.env.example` and `firebase-applet-config.json`. | Risk of accidental production credential leakage if developers commit secrets. | Reaffirm security baseline: no client-side secret keys. Keep mock data isolated; live Firestore calls are authenticated by security rules. |
| **TR-06** | **Performance & Large Chunks** | **Low** | Vite build outputs single JavaScript chunk (`~989 kB`) containing Firebase and Motion. | Slower initial script evaluation on low-end Android mobile devices over 3G/4G networks. | Introduce route-based dynamic `import()` code splitting in Stage 2 for secondary routes (`/orders`, `/profile`, `/cart`). |
| **TR-07** | **Browser History Consistency** | **Low** | Spatial page transition between Home and Profile relies on URL path matching (`/profile`). | Rapid tapping or double-back navigation could briefly trigger mismatched slide coordinates. | Debounce transition state machine in `CustomerNavigationShell.tsx` and maintain `lastNonProfilePath` stack. |
| **TR-08** | **Layout Shift on Slow Assets** | **Mitigated** | Images and headings without intrinsic aspect ratio causing layout shifts during cold loads. | Visual instability before images finish decoding. | **Already Fixed in Step 1.1**: added explicit `aspect-[416/172]`, `aspect-[933/173]`, intrinsic `width`/`height` tags, and preloads for navigation 3D icons. |

---

## 3. Accessibility & Mobile Device Assessment

- **Mobile Viewport Target**: 390 × 844 px (Android Mobile Baseline).
  - Also verified at 360 × 800, 375 × 812, 412 × 915, and 430 × 932 px.
  - Zero unwanted horizontal scrollbars; content wraps cleanly within `max-w-[430px]` Android container.
- **Accessible ARIA Roles**:
  - Skeletons use `role="status"` and `aria-busy="true"` with screen-reader text (`sr-only`).
  - Navigation tabs expose `aria-current="page"` and descriptive labels.
  - Interactive buttons have minimum 44 × 44 px touch target areas or adequate padding.
- **Reduced Motion (`prefers-reduced-motion`)**:
  - Verified across `src/index.css` and animation controllers.
  - When active, shimmer animations, flying cart bounces, and circular ripples are cleanly disabled without breaking layout or functional state.
